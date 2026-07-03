/**
 * MM Profile Interio - Admin Panel Logic
 */
(function () {
  'use strict';

  /* ===================== DEFAULTS ===================== */
  const DEFAULT_ADMIN = { id: 1, username: 'admin', email: 'admin@mmprofileinterio.com', password: 'admin123', isAdmin: true, createdAt: '2024-01-01' };
  const DEFAULT_PRODUCTS = [
    { id: 'p1', name: 'Aluminium Profile', description: 'High-strength extruded aluminium profiles in multiple finishes.', badge: 'Best Seller', image: 'assets/images/aluminium_profile.png', type: 'default' },
    { id: 'p2', name: 'Sliding Door', description: 'Sleek aluminium sliding doors with precision-engineered tracks.', badge: 'Premium', image: 'assets/images/sliding_door.png', type: 'default' },
    { id: 'p3', name: 'Decorative Glass', description: 'Beautifully crafted decorative glass panels with artistic patterns.', badge: 'Trending', image: 'assets/images/decorative_glass.png', type: 'default' },
    { id: 'p4', name: 'Toughened Glass', description: 'Safety-certified toughened glass, 4–5x stronger than regular glass.', badge: 'Safety Grade', image: 'assets/images/toughened_glass.png', type: 'default' },
    { id: 'p5', name: 'Aluminium Bar', description: 'Precision-cut aluminium bars with excellent corrosion resistance.', badge: 'Industrial', image: 'assets/images/aluminium_bar.png', type: 'default' },
    { id: 'p6', name: 'LED Mirror', description: 'Premium LED backlit mirrors with elegant aluminium frames.', badge: 'Luxury', image: 'assets/images/led_mirror.png', type: 'default' },
  ];
  const THEMES = [
    { id: 'ramadan',      name: 'Ramadan',        emoji: '🌙', date: 'Mar – Apr', colors: ['#3b0764','#5b21b6','#fbbf24'] },
    { id: 'eid-fitr',     name: 'Eid-ul-Fitr',    emoji: '🌙', date: 'Apr (after Ramadan)', colors: ['#164e63','#0e7490','#fde68a'] },
    { id: 'eid',          name: 'Eid-ul-Adha',    emoji: '🐑', date: 'Jun – Jul', colors: ['#022c22','#065f46','#f59e0b'] },
    { id: 'independence', name: 'Independence Day',emoji: '🇮🇳', date: '15 Aug',   colors: ['#ea580c','#ffffff','#138808'] },
    { id: 'diwali',       name: 'Diwali',          emoji: '🪔', date: 'Oct – Nov', colors: ['#78350f','#b45309','#fde68a'] },
    { id: 'christmas',    name: 'Christmas',        emoji: '🎄', date: '25 Dec',   colors: ['#7f1d1d','#991b1b','#bbf7d0'] },
    { id: 'newyear',      name: 'New Year',         emoji: '🎆', date: '1 Jan',    colors: ['#1e3a8a','#1d4ed8','#ffd700'] },
    { id: 'holi',         name: 'Holi',             emoji: '🎨', date: 'Mar',      colors: ['#4c1d95','#7c3aed','#f472b6'] },
  ];

  /* ===================== STATE ===================== */
  let currentUser = null;
  let confirmCallback = null;

  /* ===================== STORAGE HELPERS ===================== */
  function getUsers() {
    const users = JSON.parse(localStorage.getItem('mm_users') || '[]');
    if (!users.find(u => u.username === 'admin')) users.unshift(DEFAULT_ADMIN);
    return users;
  }
  function saveUsers(users) { localStorage.setItem('mm_users', JSON.stringify(users)); }

  function getCustomProducts() { return JSON.parse(localStorage.getItem('mm_products_custom') || '[]'); }
  function saveCustomProducts(p) { localStorage.setItem('mm_products_custom', JSON.stringify(p)); }

  function getWorks() { return JSON.parse(localStorage.getItem('mm_works') || '[]'); }
  function saveWorks(w) { localStorage.setItem('mm_works', JSON.stringify(w)); }

  function getActiveTheme() { return localStorage.getItem('mm_active_theme') || 'default'; }
  function setActiveTheme(t) {
    localStorage.setItem('mm_active_theme', t);
    // Sync to Firebase so all visitors see the same theme
    if (window.MMDB && window.MMDB.isReady()) {
      window.MMDB.set('active_theme', t, 'mm_active_theme');
    }
  }

  function getBannerMsg(theme) { return localStorage.getItem('mm_banner_msg_' + theme) || ''; }
  function setBannerMsg(theme, msg) {
    localStorage.setItem('mm_banner_msg_' + theme, msg);
    // Sync banner message to Firebase
    if (window.MMDB && window.MMDB.isReady()) {
      window.MMDB.set('banner_msg/' + theme, msg, 'mm_banner_msg_' + theme);
    }
  }

  /* ===================== SESSION ===================== */
  function checkSession() {
    const session = JSON.parse(sessionStorage.getItem('mm_admin_session') || 'null');
    if (!session) { showLogin(); return false; }
    const users = getUsers();
    const user = users.find(u => u.username === session.username);
    if (!user || !user.isAdmin) { showLogin(); return false; }
    currentUser = user;
    hideLogin();
    updateSidebarUser();
    return true;
  }

  function showLogin() { document.getElementById('admin-login').style.display = 'flex'; }
  function hideLogin() { document.getElementById('admin-login').style.display = 'none'; }

  function updateSidebarUser() {
    if (!currentUser) return;
    const nameEl = document.getElementById('sidebar-user-name');
    const roleEl = document.getElementById('sidebar-user-role');
    const avatarEl = document.getElementById('sidebar-user-avatar');
    if (nameEl) nameEl.textContent = currentUser.username;
    if (roleEl) roleEl.textContent = currentUser.isAdmin ? 'Administrator' : 'User';
    if (avatarEl) avatarEl.textContent = currentUser.username.charAt(0).toUpperCase();
  }

  /* ===================== LOGIN ===================== */
  function initLogin() {
    const form = document.getElementById('login-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value;
      const errEl = document.getElementById('login-error');

      const users = getUsers();
      const user = users.find(u =>
        (u.username === username || u.email === username) && u.password === password
      );

      if (!user) {
        errEl.textContent = 'Invalid username or password.';
        errEl.classList.add('show');
        return;
      }
      if (!user.isAdmin) {
        errEl.textContent = 'You do not have admin access.';
        errEl.classList.add('show');
        return;
      }

      errEl.classList.remove('show');
      currentUser = user;
      sessionStorage.setItem('mm_admin_session', JSON.stringify({ username: user.username }));
      hideLogin();
      updateSidebarUser();
      showPanel('dashboard');
      toast('Welcome back, ' + user.username + '!', 'success');
    });
  }

  /* ===================== PANEL NAVIGATION ===================== */
  function showPanel(id) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const panel = document.getElementById('panel-' + id);
    const navItem = document.querySelector('[data-panel="' + id + '"]');
    if (panel) { panel.classList.add('active'); }
    if (navItem) { navItem.classList.add('active'); }

    const titles = {
      dashboard: 'Dashboard',
      themes: 'Festive Themes',
      products: 'Products Manager',
      works: 'Our Works',
      users: 'User Management',
    };
    const titleEl = document.getElementById('topbar-title');
    if (titleEl) titleEl.textContent = titles[id] || 'Admin Panel';

    // Re-render panel content
    if (id === 'dashboard') renderDashboard();
    if (id === 'themes') renderThemes();
    if (id === 'products') renderProducts();
    if (id === 'works') renderWorks();
    if (id === 'users') renderUsers();

    // Close mobile sidebar
    document.getElementById('admin-sidebar').classList.remove('open');
  }

  /* ===================== DASHBOARD ===================== */
  function renderDashboard() {
    const cp = getCustomProducts();
    const works = getWorks();
    const users = getUsers();
    const theme = getActiveTheme();

    document.getElementById('stat-products').textContent = DEFAULT_PRODUCTS.length + cp.length;
    document.getElementById('stat-works').textContent = works.length;
    document.getElementById('stat-users').textContent = users.length;
    document.getElementById('stat-theme').textContent = theme === 'default' ? 'Default' : THEMES.find(t => t.id === theme)?.name || theme;
  }

  /* ===================== THEMES PANEL ===================== */
  function renderThemes() {
    const grid = document.getElementById('themes-grid');
    if (!grid) return;
    const activeTheme = getActiveTheme();
    grid.innerHTML = '';

    // Default card
    const defCard = makeThemeCard({
      id: 'default', name: 'Default (MM Green)', emoji: '🌿', date: 'Year-round',
      colors: ['#1a5227','#2d7a3a','#b8f55a']
    }, activeTheme);
    grid.appendChild(defCard);

    THEMES.forEach(function (t) {
      grid.appendChild(makeThemeCard(t, activeTheme));
    });
  }

  function makeThemeCard(t, activeTheme) {
    const isActive = t.id === activeTheme;
    const card = document.createElement('div');
    card.className = 'theme-card' + (isActive ? ' active-theme' : '');
    card.innerHTML = `
      <div class="theme-preview" style="background:linear-gradient(135deg,${t.colors.join(',')});">
        <span style="position:relative;z-index:1;font-size:2rem;">${t.emoji}</span>
      </div>
      <div class="theme-card-body">
        <div class="theme-name">${t.name}</div>
        <div class="theme-date"><i class="fa-solid fa-calendar" style="font-size:0.65rem;margin-right:4px;"></i>${t.date}</div>
        <div class="theme-status ${isActive ? 'on' : 'off'}">
          <i class="fa-solid fa-circle" style="font-size:0.45rem;"></i>
          ${isActive ? 'Active' : 'Inactive'}
        </div>
        <div class="theme-actions">
          ${isActive
            ? `<button class="btn btn-sm btn-ghost" onclick="AdminPanel.deactivateTheme()"><i class="fa-solid fa-xmark"></i> Deactivate</button>`
            : `<button class="btn btn-sm btn-green" onclick="AdminPanel.activateTheme('${t.id}')"><i class="fa-solid fa-check"></i> Activate</button>`
          }
          ${t.id !== 'default' ? `<button class="btn btn-sm btn-ghost" onclick="AdminPanel.editBanner('${t.id}','${escHtml(t.name)}')"><i class="fa-solid fa-pen"></i></button>` : ''}
        </div>
      </div>`;
    return card;
  }

  window.AdminPanel = {
    activateTheme: function (id) {
      setActiveTheme(id);
      // Remove any existing theme class
      const htmlEl = document.documentElement;
      [...htmlEl.classList].filter(c => c.startsWith('theme-')).forEach(c => htmlEl.classList.remove(c));
      htmlEl.classList.add('theme-' + id);
      renderThemes();
      toast('Theme activated! The website now shows the ' + (THEMES.find(t=>t.id===id)||{name:id}).name + ' theme.', 'success');
    },
    deactivateTheme: function () {
      setActiveTheme('default');
      const htmlEl = document.documentElement;
      [...htmlEl.classList].filter(c => c.startsWith('theme-')).forEach(c => htmlEl.classList.remove(c));
      renderThemes();
      toast('Theme reset to default (MM Green).', 'info');
    },
    editBanner: function (id, name) {
      const currentMsg = getBannerMsg(id);
      document.getElementById('banner-theme-id').value = id;
      document.getElementById('banner-theme-name').textContent = name;
      document.getElementById('banner-msg').value = currentMsg;
      openModal('modal-banner');
    },

    /* PRODUCTS */
    deleteProduct: function (id) {
      showConfirm('Delete Product?', 'This product will be removed from the website.', function () {
        const products = getCustomProducts().filter(p => p.id !== id);
        saveCustomProducts(products);
        renderProducts();
        toast('Product deleted.', 'info');
      });
    },

    /* WORKS */
    deleteWork: function (id) {
      showConfirm('Delete Work?', 'This work entry will be permanently removed.', function () {
        const works = getWorks().filter(w => w.id !== id);
        saveWorks(works);
        renderWorks();
        toast('Work deleted.', 'info');
      });
    },

    /* USERS */
    deleteUser: function (id) {
      if (id === 1) { toast('Cannot delete the default admin.', 'error'); return; }
      if (currentUser && currentUser.id === id) { toast('Cannot delete yourself.', 'error'); return; }
      showConfirm('Delete User?', 'This user account will be permanently removed.', function () {
        const users = getUsers().filter(u => u.id !== id);
        saveUsers(users);
        renderUsers();
        toast('User deleted.', 'info');
      });
    },
    toggleAdmin: function (id) {
      if (id === 1) { toast('Cannot modify default admin permissions.', 'error'); return; }
      const users = getUsers();
      const user = users.find(u => u.id === id);
      if (!user) return;
      user.isAdmin = !user.isAdmin;
      saveUsers(users);
      renderUsers();
      toast(`Admin permission ${user.isAdmin ? 'granted' : 'revoked'} for ${user.username}.`, 'success');
    },
  };

  /* ===================== PRODUCTS PANEL ===================== */
  function renderProducts() {
    const tbody = document.getElementById('products-tbody');
    if (!tbody) return;
    const allProducts = [...DEFAULT_PRODUCTS, ...getCustomProducts()];
    tbody.innerHTML = '';

    if (allProducts.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--a-text3);padding:32px;">No products yet.</td></tr>';
      return;
    }

    allProducts.forEach(function (p) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><img src="${p.image}" alt="${escHtml(p.name)}" class="td-img" onerror="this.src='assets/images/logo.png'" /></td>
        <td>
          <div class="td-name">${escHtml(p.name)}</div>
          <div class="td-type">${p.type === 'default' ? '🔒 Default' : '✏️ Custom'}</div>
        </td>
        <td style="max-width:200px;color:var(--a-text3);font-size:0.8rem;">${escHtml(p.description.substring(0, 70))}...</td>
        <td>${p.badge ? `<span class="td-badge">${escHtml(p.badge)}</span>` : '<span style="color:var(--a-text3);">—</span>'}</td>
        <td class="td-actions">
          ${p.type !== 'default' ? `<button class="btn btn-sm btn-red" onclick="AdminPanel.deleteProduct('${p.id}')"><i class="fa-solid fa-trash"></i></button>` : '<span style="font-size:0.75rem;color:var(--a-text3);">Default</span>'}
        </td>`;
      tbody.appendChild(tr);
    });
  }

  /* ===================== WORKS PANEL ===================== */
  function renderWorks() {
    const grid = document.getElementById('works-admin-grid');
    const empty = document.getElementById('works-admin-empty');
    if (!grid) return;
    const works = getWorks();
    grid.innerHTML = '';

    if (works.length === 0) {
      if (empty) empty.style.display = 'flex';
      return;
    }
    if (empty) empty.style.display = 'none';

    works.forEach(function (w) {
      const card = document.createElement('div');
      card.className = 'work-admin-card';
      card.innerHTML = `
        <div class="work-admin-img-wrap">
          <img src="${w.image}" alt="${escHtml(w.title)}" class="work-admin-img" onerror="this.src='assets/images/logo.png'" />
        </div>
        <div class="work-admin-body">
          <div class="work-admin-title">${escHtml(w.title)}</div>
          <div class="work-admin-client">${w.client ? escHtml(w.client) : ''}</div>
          <button class="btn btn-sm btn-red work-admin-del" onclick="AdminPanel.deleteWork('${w.id}')">
            <i class="fa-solid fa-trash"></i> Remove
          </button>
        </div>`;
      grid.appendChild(card);
    });
  }

  /* ===================== USERS PANEL ===================== */
  function renderUsers() {
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;
    const users = getUsers();
    tbody.innerHTML = '';

    users.forEach(function (u) {
      const tr = document.createElement('tr');
      const initials = u.username.charAt(0).toUpperCase();
      const isDefault = u.id === 1;
      tr.innerHTML = `
        <td>
          <div style="display:flex;align-items:center;gap:10px;">
            <div class="user-avatar-sm">${initials}</div>
            <div>
              <div style="font-weight:600;font-size:0.875rem;">${escHtml(u.username)}</div>
              <div style="font-size:0.72rem;color:var(--a-text3);">${escHtml(u.email || '')}</div>
            </div>
          </div>
        </td>
        <td><span class="role-badge ${u.isAdmin ? 'admin' : 'user'}">${u.isAdmin ? '👑 Admin' : '👤 User'}</span></td>
        <td style="font-size:0.8rem;color:var(--a-text3);">${u.createdAt || '—'}</td>
        <td class="td-actions">
          ${!isDefault ? `
            <button class="btn btn-sm btn-ghost" onclick="AdminPanel.toggleAdmin(${u.id})" title="${u.isAdmin ? 'Revoke Admin' : 'Grant Admin'}">
              <i class="fa-solid fa-${u.isAdmin ? 'shield-xmark' : 'shield-check'}"></i>
            </button>
            <button class="btn btn-sm btn-red" onclick="AdminPanel.deleteUser(${u.id})">
              <i class="fa-solid fa-trash"></i>
            </button>` : '<span style="font-size:0.72rem;color:var(--a-text3);">Protected</span>'}
        </td>`;
      tbody.appendChild(tr);
    });

    document.getElementById('stat-users-count').textContent = users.length;
  }

  /* ===================== MODALS ===================== */
  function openModal(id) {
    document.getElementById(id).classList.add('open');
  }
  function closeModal(id) {
    document.getElementById(id).classList.remove('open');
    // Reset form inside
    const form = document.querySelector('#' + id + ' form');
    if (form) {
      form.reset();
      const previews = form.querySelectorAll('.img-preview');
      previews.forEach(p => p.classList.remove('show'));
    }
  }

  window.openModal = openModal;
  window.closeModal = closeModal;

  /* Modal close on overlay click */
  document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        overlay.classList.remove('open');
      }
    });
  });

  /* ===================== FORMS ===================== */
  function initForms() {
    // Banner form
    const bannerForm = document.getElementById('form-banner');
    if (bannerForm) {
      bannerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const themeId = document.getElementById('banner-theme-id').value;
        const msg = document.getElementById('banner-msg').value.trim();
        setBannerMsg(themeId, msg);
        closeModal('modal-banner');
        toast('Banner message saved!', 'success');
      });
    }

    // Add Product form
    const productForm = document.getElementById('form-product');
    if (productForm) {
      productForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('p-name').value.trim();
        const desc = document.getElementById('p-desc').value.trim();
        const badge = document.getElementById('p-badge').value.trim();
        const imgData = document.getElementById('p-img-data').value;

        if (!name || !desc) { toast('Name and description are required.', 'error'); return; }

        const products = getCustomProducts();
        products.push({
          id: 'cp_' + Date.now(),
          name, description: desc, badge,
          image: imgData || 'assets/images/logo.png',
          type: 'custom',
        });
        saveCustomProducts(products);
        closeModal('modal-product');
        renderProducts();
        toast('Product added successfully!', 'success');
      });
    }

    // Add Work form
    const workForm = document.getElementById('form-work');
    if (workForm) {
      workForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const title = document.getElementById('w-title').value.trim();
        const client = document.getElementById('w-client').value.trim();
        const desc = document.getElementById('w-desc').value.trim();
        const imgData = document.getElementById('w-img-data').value;

        if (!title) { toast('Title is required.', 'error'); return; }
        if (!imgData) { toast('Please upload a project image.', 'error'); return; }

        const works = getWorks();
        works.push({ id: 'w_' + Date.now(), title, client, description: desc, image: imgData });
        saveWorks(works);
        closeModal('modal-work');
        renderWorks();
        toast('Work added successfully!', 'success');
      });
    }

    // Add User form
    const userForm = document.getElementById('form-user');
    if (userForm) {
      userForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const username = document.getElementById('u-username').value.trim();
        const email = document.getElementById('u-email').value.trim();
        const password = document.getElementById('u-password').value;
        const isAdmin = document.getElementById('u-admin').checked;

        if (!username || !password) { toast('Username and password are required.', 'error'); return; }

        const users = getUsers();
        if (users.find(u => u.username === username)) {
          toast('Username already exists.', 'error'); return;
        }

        users.push({
          id: Date.now(), username, email, password, isAdmin,
          createdAt: new Date().toISOString().split('T')[0]
        });
        saveUsers(users);
        closeModal('modal-user');
        renderUsers();
        toast('User created successfully!', 'success');
      });
    }
  }

  /* ===================== IMAGE UPLOAD HANDLER ===================== */
  function initImageUploads() {
    document.querySelectorAll('.img-upload-area').forEach(function (area) {
      const input = area.querySelector('input[type="file"]');
      const preview = area.closest('.f-group').querySelector('.img-preview') ||
                      area.parentElement.querySelector('.img-preview');
      const hiddenInput = area.closest('form').querySelector('[data-img-target]');

      if (!input) return;

      input.addEventListener('change', function () {
        const file = input.files[0];
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) {
          toast('Image too large. Max 3MB.', 'error'); return;
        }
        const reader = new FileReader();
        reader.onload = function (ev) {
          if (preview) { preview.src = ev.target.result; preview.classList.add('show'); }
          if (hiddenInput) { hiddenInput.value = ev.target.result; }
        };
        reader.readAsDataURL(file);
      });

      // Drag-drop
      area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('dragover'); });
      area.addEventListener('dragleave', () => area.classList.remove('dragover'));
      area.addEventListener('drop', function (e) {
        e.preventDefault();
        area.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
          input.files = e.dataTransfer.files;
          input.dispatchEvent(new Event('change'));
        }
      });
    });
  }

  /* ===================== CONFIRM DIALOG ===================== */
  function showConfirm(title, msg, cb) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-msg').textContent = msg;
    confirmCallback = cb;
    document.getElementById('confirm-dialog').classList.add('open');
  }

  /* ===================== TOAST ===================== */
  function toast(message, type) {
    type = type || 'info';
    const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.innerHTML = `<i class="fa-solid ${icons[type]} toast-icon"></i><span class="toast-msg">${escHtml(message)}</span>`;
    container.appendChild(el);
    setTimeout(() => { el.classList.add('toast-fade'); setTimeout(() => el.remove(), 300); }, 3200);
  }

  function escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ===================== SIDEBAR TOGGLE ===================== */
  function initSidebar() {
    const toggle = document.getElementById('mob-sidebar-toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        document.getElementById('admin-sidebar').classList.toggle('open');
      });
    }
  }

  /* ===================== LOGOUT ===================== */
  function logout() {
    sessionStorage.removeItem('mm_admin_session');
    currentUser = null;
    showLogin();
    toast('Logged out successfully.', 'info');
  }
  window.adminLogout = logout;

  /* ===================== INIT ===================== */
  document.addEventListener('DOMContentLoaded', function () {
    // Init Firebase bridge first
    if (window.MMDB) {
      window.MMDB.init().then(function (connected) {
        if (connected) console.info('Admin: Firebase connected — changes sync to all visitors.');
      });
    }

    checkSession();
    initLogin();
    initForms();
    initImageUploads();
    initSidebar();

    // Nav items
    document.querySelectorAll('.nav-item[data-panel]').forEach(function (item) {
      item.addEventListener('click', function () {
        showPanel(this.dataset.panel);
      });
    });

    // Confirm dialog buttons
    const confirmOk = document.getElementById('confirm-ok');
    const confirmCancel = document.getElementById('confirm-cancel');
    if (confirmOk) confirmOk.addEventListener('click', function () {
      document.getElementById('confirm-dialog').classList.remove('open');
      if (confirmCallback) { confirmCallback(); confirmCallback = null; }
    });
    if (confirmCancel) confirmCancel.addEventListener('click', function () {
      document.getElementById('confirm-dialog').classList.remove('open');
      confirmCallback = null;
    });

    // Default panel
    showPanel('dashboard');
  });

})();
