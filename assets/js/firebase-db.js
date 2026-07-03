/**
 * MM Profile Interio — Firebase Database Bridge
 * Syncs theme/banner to Firebase so ALL website visitors see the same look.
 * Falls back to localStorage automatically when Firebase is not configured.
 */
(function () {
  'use strict';

  var _db    = null;
  var _ready = false;

  window.MMDB = {

    /** Initialise Firebase connection. Call once on page load. Returns Promise<bool>. */
    init: function () {
      var cfg = window.MM_FIREBASE;
      if (!cfg || !cfg.enabled || !cfg.config || !cfg.config.apiKey ||
          cfg.config.apiKey === 'YOUR_API_KEY') {
        // Not configured — silently use localStorage
        return Promise.resolve(false);
      }
      try {
        if (typeof firebase === 'undefined') {
          console.warn('MM Profile: Firebase SDK not loaded.');
          return Promise.resolve(false);
        }
        if (!firebase.apps.length) firebase.initializeApp(cfg.config);
        _db    = firebase.database();
        _ready = true;
        console.info('MM Profile: Firebase connected ✔');
        return Promise.resolve(true);
      } catch (e) {
        console.warn('MM Profile: Firebase init failed —', e.message);
        return Promise.resolve(false);
      }
    },

    isReady: function () { return _ready; },

    /**
     * Read a value.
     * @param {string} fbKey   — Firebase path (e.g. 'active_theme')
     * @param {string} lsKey   — localStorage key  (e.g. 'mm_active_theme')
     */
    get: function (fbKey, lsKey) {
      // No Firebase → return localStorage value
      if (!_ready) {
        var cached = localStorage.getItem(lsKey);
        return Promise.resolve(cached !== null ? JSON.parse(cached) : null);
      }
      return _db.ref('mmprofile/' + fbKey).once('value').then(function (snap) {
        var val = snap.val();
        if (val !== null && val !== undefined) {
          // Cache locally for next page load (instant theme apply)
          localStorage.setItem(lsKey, JSON.stringify(val));
          return val;
        }
        // Firebase has nothing → try localStorage cache
        var fallback = localStorage.getItem(lsKey);
        return fallback !== null ? JSON.parse(fallback) : null;
      }).catch(function () {
        var fallback = localStorage.getItem(lsKey);
        return fallback !== null ? JSON.parse(fallback) : null;
      });
    },

    /**
     * Write a value to Firebase + localStorage.
     * @param {string} fbKey   — Firebase path
     * @param {*}      value   — value to store
     * @param {string} lsKey   — localStorage key
     */
    set: function (fbKey, value, lsKey) {
      // Always write localStorage (instant + offline support)
      localStorage.setItem(lsKey, typeof value === 'string' ? value : JSON.stringify(value));
      if (!_ready) return Promise.resolve();
      return _db.ref('mmprofile/' + fbKey).set(value).catch(function (e) {
        console.warn('MMDB.set failed:', e.message);
      });
    },

    /**
     * Remove a value from Firebase + localStorage.
     */
    remove: function (fbKey, lsKey) {
      localStorage.removeItem(lsKey);
      if (!_ready) return Promise.resolve();
      return _db.ref('mmprofile/' + fbKey).remove().catch(function () {});
    }
  };
})();
