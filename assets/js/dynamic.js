/**
 * MM Profile Interio - Dynamic Content Loader (v3)
 * - Applies theme class to <html> instantly from localStorage cache
 * - Then verifies/updates from Firebase (so ALL visitors see the same theme)
 * - Loads products and works from localStorage
 */
(function () {
  'use strict';

  /* ============================================================
     INSTANT THEME — apply from localStorage cache before paint
     ============================================================ */
  var cachedTheme = localStorage.getItem('mm_active_theme') || 'default';
  if (cachedTheme && cachedTheme !== 'default') {
    document.documentElement.classList.add('theme-' + cachedTheme);
  }

  /* ============================================================
     EVERYTHING ELSE after DOM is ready
     ============================================================ */
  document.addEventListener('DOMContentLoaded', function () {

    /* ---- Init Firebase, then sync theme ---- */
    var mmdb = window.MMDB;
    var initPromise = mmdb ? mmdb.init() : Promise.resolve(false);

    initPromise.then(function () {
      /* Get the real active theme from Firebase (or localStorage fallback) */
      return mmdb ? mmdb.get('active_theme', 'mm_active_theme') : Promise.resolve(cachedTheme);
    }).then(function (liveTheme) {
      liveTheme = liveTheme || 'default';

      /* If Firebase returned a DIFFERENT theme than what we applied, update */
      if (liveTheme !== cachedTheme) {
        var htmlEl = document.documentElement;
        Array.prototype.slice.call(htmlEl.classList)
          .filter(function (c) { return c.indexOf('theme-') === 0; })
          .forEach(function (c) { htmlEl.classList.remove(c); });

        if (liveTheme !== 'default') {
          htmlEl.classList.add('theme-' + liveTheme);
        }
        cachedTheme = liveTheme;
      }

      applyBannerAndParticles(liveTheme);
    }).catch(function () {
      applyBannerAndParticles(cachedTheme);
    });

    /* ---- Load dynamic content ---- */
    loadCustomProducts();
    loadWorks();
    initBannerClose();
  });

  /* ============================================================
     BANNER + PARTICLES
     ============================================================ */
  function applyBannerAndParticles(theme) {
    if (!theme || theme === 'default') return;

    var bannerMessages = {
      ramadan:      '🌙 Ramadan Mubarak — Wishing you blessings and peace',
      eid:          '🌙 Eid Mubarak — May Allah bless you and your family',
      'eid-fitr':   '🌙 Eid-ul-Fitr Mubarak — Joy, peace & prosperity to all',
      diwali:       '🪔 Happy Diwali — May light and prosperity fill your home',
      holi:         '🎨 Happy Holi — Wishing you a joyful celebration',
      christmas:    '🎄 Merry Christmas — Warmth, love & happiness to you',
      newyear:      '🎆 Happy New Year — May this year bring great success',
      independence: '🇮🇳 Happy Independence Day — Jai Hind!',
    };

    var themeDecos = {
      ramadan:      ['🌙', '⭐'],
      'eid-fitr':   ['🌙', '⭐'],
      eid:          ['🌙', '⭐'],
      diwali:       ['🪔', '🪔'],
      holi:         ['🎨', '🌈'],
      christmas:    ['🎄', '⛄'],
      newyear:      ['🎆', '🎇'],
      independence: ['🇮🇳', '🌟'],
    };

    /* Get banner message — Firebase first, localStorage fallback */
    var mmdb = window.MMDB;
    var getMsg = mmdb
      ? mmdb.get('banner_msg/' + theme, 'mm_banner_msg_' + theme)
      : Promise.resolve(localStorage.getItem('mm_banner_msg_' + theme));

    getMsg.then(function (customMsg) {
      var msg    = customMsg || bannerMessages[theme] || '✨ Season\'s Greetings from MM Profile Interio';
      var decos  = themeDecos[theme] || ['✨', '✨'];
      var banner = document.getElementById('festive-banner');

      if (banner) {
        var textEl = banner.querySelector('.fb-text');
        var decoL  = banner.querySelector('.fb-deco-l');
        var decoR  = banner.querySelector('.fb-deco-r');
        if (textEl) textEl.textContent = msg;
        if (decoL)  decoL.textContent  = decos[0];
        if (decoR)  decoR.textContent  = decos[1];
        banner.classList.add('active');
        document.documentElement.classList.add('has-banner');
      }

      /* Particles — subtle, professional count */
      addParticles(theme);
    });
  }

  /* ============================================================
     PARTICLES — reduced, subtle
     ============================================================ */
  function addParticles(theme) {
    var container = document.getElementById('theme-particles');
    if (!container) return;

    /* Professional: max 12 particles per theme, small sizes */
    var configs = {
      ramadan:      [['🌙', 3], ['⭐', 5], ['✨', 4]],
      'eid-fitr':   [['🌙', 2], ['⭐', 6], ['✨', 4]],
      eid:          [['🌙', 2], ['⭐', 5], ['✨', 5]],
      diwali:       [['🪔', 5], ['✨', 5], ['💫', 2]],
      holi:         [['🔴', 2], ['🟡', 2], ['🟢', 2], ['🔵', 2], ['🟣', 2], ['🎨', 2]],
      christmas:    [['❄️', 6], ['⛄', 2], ['🎄', 2], ['⭐', 2]],
      newyear:      [['🎆', 3], ['✨', 5], ['⭐', 4]],
      independence: [['🇮🇳', 3], ['⭐', 5], ['✨', 4]],
    };

    var anims = {
      ramadan: 'tpFloat', 'eid-fitr': 'tpFloat', eid: 'tpFloat',
      diwali: 'tpTwinkle', holi: 'tpFloat',
      christmas: 'tpFall', newyear: 'tpTwinkle', independence: 'tpFloat',
    };

    var pairs = configs[theme];
    if (!pairs) return;
    var anim  = anims[theme] || 'tpFloat';

    injectKeyframes();

    pairs.forEach(function (pair) {
      var emoji = pair[0];
      var count = pair[1];
      for (var i = 0; i < count; i++) {
        var el = document.createElement('div');
        el.className = 'tp';
        var size  = (0.8 + Math.random() * 0.9).toFixed(2);
        var dur   = (8  + Math.random() * 10).toFixed(1);
        var delay = (Math.random() * 6).toFixed(1);
        var left  = Math.floor(Math.random() * 95);
        var top   = Math.floor(Math.random() * 90);
        var op    = (0.3 + Math.random() * 0.4).toFixed(2);
        el.textContent = emoji;
        el.style.cssText =
          'left:' + left + '%;top:' + top + '%;' +
          'font-size:' + size + 'rem;' +
          'animation:' + anim + ' ' + dur + 's ' + delay + 's ease-in-out infinite;' +
          'opacity:' + op + ';';
        container.appendChild(el);
      }
    });
  }

  var _kfInjected = false;
  function injectKeyframes() {
    if (_kfInjected) return;
    _kfInjected = true;
    var s = document.createElement('style');
    s.textContent = [
      '@keyframes tpFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-18px) scale(1.04)}}',
      '@keyframes tpTwinkle{0%,100%{opacity:0.15;transform:scale(0.85)}50%{opacity:1;transform:scale(1.15)}}',
      '@keyframes tpFall{0%{transform:translateY(-40px) rotate(0deg);opacity:0.8}100%{transform:translateY(105vh) rotate(540deg);opacity:0}}',
    ].join('');
    document.head.appendChild(s);
  }

  /* ============================================================
     BANNER CLOSE
     ============================================================ */
  function initBannerClose() {
    var btn = document.getElementById('fb-close-btn');
    if (btn) {
      btn.addEventListener('click', function () {
        var banner = document.getElementById('festive-banner');
        if (banner) banner.classList.remove('active');
        document.documentElement.classList.remove('has-banner');
      });
    }
  }

  /* ============================================================
     CUSTOM PRODUCTS
     ============================================================ */
  function loadCustomProducts() {
    var grid = document.getElementById('products-grid');
    if (!grid) return;
    var products = JSON.parse(localStorage.getItem('mm_products_custom') || '[]');
    products.forEach(function (p) {
      var card = document.createElement('div');
      card.className = 'product-card reveal';
      card.id = 'product-custom-' + p.id;
      card.innerHTML =
        '<div class="product-card-img-wrap">' +
          '<img src="' + (p.image || 'assets/images/logo.png') + '" alt="' + esc(p.name) + '" class="product-card-img" />' +
          '<div class="product-card-overlay"></div>' +
          (p.badge ? '<div class="product-card-badge">' + esc(p.badge) + '</div>' : '') +
        '</div>' +
        '<div class="product-card-body">' +
          '<div class="product-card-title">' + esc(p.name) + '</div>' +
          '<p class="product-card-desc">' + esc(p.description) + '</p>' +
          '<a href="#contact" class="product-card-link">Enquire Now <i class="fa-solid fa-arrow-right"></i></a>' +
        '</div>';
      grid.appendChild(card);
    });
  }

  /* ============================================================
     OUR WORKS
     ============================================================ */
  function loadWorks() {
    var grid    = document.getElementById('works-grid');
    var emptyEl = document.getElementById('works-empty');
    if (!grid) return;
    var works = JSON.parse(localStorage.getItem('mm_works') || '[]');
    if (!works.length) { if (emptyEl) emptyEl.style.display = 'flex'; return; }
    if (emptyEl) emptyEl.style.display = 'none';

    works.forEach(function (w) {
      var card = document.createElement('div');
      card.className = 'work-card reveal';
      card.innerHTML =
        '<div class="work-card-img-wrap">' +
          '<img src="' + (w.image || 'assets/images/logo.png') + '" alt="' + esc(w.title) + '" class="work-card-img" loading="lazy" />' +
          '<div class="work-card-overlay"><div class="work-card-zoom"><i class="fa-solid fa-expand"></i></div></div>' +
        '</div>' +
        '<div class="work-card-body">' +
          '<div class="work-card-title">' + esc(w.title) + '</div>' +
          (w.client ? '<div class="work-card-client"><i class="fa-solid fa-building"></i> ' + esc(w.client) + '</div>' : '') +
          (w.description ? '<p class="work-card-desc">' + esc(w.description) + '</p>' : '') +
        '</div>';

      card.querySelector('.work-card-img-wrap').addEventListener('click', function () {
        openLightbox(w.image || 'assets/images/logo.png', w.title);
      });
      grid.appendChild(card);
    });
  }

  /* ============================================================
     LIGHTBOX
     ============================================================ */
  function openLightbox(src, title) {
    var lb = document.getElementById('site-lightbox');
    if (!lb) {
      lb = document.createElement('div');
      lb.id = 'site-lightbox';
      lb.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:9998;display:flex;align-items:center;justify-content:center;';
      lb.innerHTML =
        '<div style="position:relative;max-width:90vw;max-height:90vh;text-align:center;">' +
          '<img id="lb-img" style="max-width:100%;max-height:80vh;border-radius:12px;box-shadow:0 0 60px rgba(0,0,0,0.8);" />' +
          '<div id="lb-title" style="color:#fff;font-size:0.9rem;margin-top:12px;opacity:0.7;"></div>' +
          '<button onclick="document.getElementById(\'site-lightbox\').style.display=\'none\'" style="position:absolute;top:-16px;right:-16px;background:rgba(255,255,255,0.1);border:none;color:#fff;border-radius:50%;width:36px;height:36px;font-size:1rem;cursor:pointer;">✕</button>' +
        '</div>';
      lb.addEventListener('click', function (e) { if (e.target === lb) lb.style.display = 'none'; });
      document.body.appendChild(lb);
    }
    lb.querySelector('#lb-img').src = src;
    lb.querySelector('#lb-title').textContent = title;
    lb.style.display = 'flex';
  }

  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

})();
