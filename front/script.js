// Elements
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const photo = document.getElementById('photo');
const photo_btn = document.getElementById('photo-btn');
const camera_btn = document.getElementById('camera-btn');
const identify_btn = document.getElementById('identify-btn');
const filePickerBtn = document.getElementById('file-picker-btn');
const fileInput = document.getElementById('uploadInput');
const fileStatus = document.getElementById('file-status');
const clearImageBtn = document.getElementById('clear-image');

// Modal helpers (accessibility: focus trap, ESC, backdrop)
let previouslyFocused;
function getFocusable(container) {
  return container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
}
function openModal(modal) {
  previouslyFocused = document.activeElement;
  modal.hidden = false;
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  const dialog = modal.querySelector('.modal-dialog');
  const focusables = getFocusable(dialog);
  const toFocus = dialog.querySelector('.modal-close') || focusables[0];
  if (toFocus) toFocus.focus();
  // Trap focus
  modal.addEventListener('keydown', trapKey);
}
function closeModal(modal) {
  // play closing animation if available
  try {
    modal.classList.add('is-closing');
    modal.classList.remove('is-open');
    const onEnd = () => {
      modal.hidden = true;
      modal.classList.remove('is-closing');
      document.body.style.overflow = '';
      modal.removeEventListener('keydown', trapKey);
      if (modal && modal.id === 'camera-modal') {
        try { (video.srcObject?.getTracks() || []).forEach(t => t.stop()); } catch (e) {}
        document.body.classList.remove('camera-active');
      }
      if (previouslyFocused && previouslyFocused.focus) {
        previouslyFocused.focus();
      }
    };
    modal.querySelector('.modal-content')?.addEventListener('animationend', onEnd, { once: true });
    setTimeout(onEnd, 320);
  } catch (e) {
    modal.hidden = true;
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    modal.removeEventListener('keydown', trapKey);
    if (modal && modal.id === 'camera-modal') {
      try { (video.srcObject?.getTracks() || []).forEach(t => t.stop()); } catch (e) {}
      document.body.classList.remove('camera-active');
    }
    if (previouslyFocused && previouslyFocused.focus) {
      previouslyFocused.focus();
    }
  }
}
function trapKey(e) {
  if (e.key === 'Escape') {
    const modal = e.currentTarget;
    // Bloquer la fermeture de la modale de consentement tant que non accepté
    try {
      const consent = localStorage.getItem('storageConsent');
      if (modal.id === 'storage-modal' && consent !== 'true') {
        e.preventDefault();
        return;
      }
    } catch (_) {}
    closeModal(modal);
    return;
  }
  if (e.key !== 'Tab') return;
  const dialog = e.currentTarget.querySelector('.modal-dialog');
  const focusables = Array.from(getFocusable(dialog));
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

// Camera controls
let cameraFacing = 'environment';
const cameraControls = document.getElementById('camera-controls');
const cameraSwitch = document.getElementById('camera-switch');
const cameraRetake = document.getElementById('camera-retake');
const cameraAccept = document.getElementById('camera-accept');

async function startStream(facing = cameraFacing) {
  try {
    // stop any previous tracks
    try { (video.srcObject?.getTracks() || []).forEach(t => t.stop()); } catch (e) {}
    const constraints = { video: { facingMode: { ideal: facing } } };
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (e) {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
    }
    video.srcObject = stream;
    video.style.display = 'block';
    canvas.style.display = 'none';
  } catch (e) {
    console.error(e);
    showToast("Accès à la caméra refusé ou indisponible.");
  }
}

function openCamera() {
  const camModal = document.getElementById('camera-modal');
  openModal(camModal);
  document.body.classList.add('camera-active');
  if (cameraControls) cameraControls.classList.remove('captured');
  startStream('environment');
}

function takePhoto() {
  // capture frame into canvas, keep stream for retake/accept
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  video.style.display = 'none';
  canvas.style.display = 'block';
  if (cameraControls) cameraControls.classList.add('captured');
}

if (cameraRetake) {
  cameraRetake.addEventListener('click', () => {
    canvas.style.display = 'none';
    video.style.display = 'block';
    if (cameraControls) cameraControls.classList.remove('captured');
  });
}
  if (cameraAccept) {
    cameraAccept.addEventListener('click', () => {
      const dataUrl = canvas.toDataURL('image/png');
      photo.src = dataUrl;
      photo.style.display = 'block';
      setImageReady(true);
      // stop camera and close modal
      try { (video.srcObject?.getTracks() || []).forEach(t => t.stop()); } catch (e) {}
      document.body.classList.remove('camera-active');
      const camModal = document.getElementById('camera-modal');
      closeModal(camModal);
      showToast('Photo ajoutée.');
      const clearBtn = document.getElementById('clear-image');
      if (clearBtn) clearBtn.hidden = false;
    });
  }
if (cameraSwitch) {
  cameraSwitch.addEventListener('click', async () => {
    cameraFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    await startStream(cameraFacing);
  });
}

fileInput.addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      const preview = document.getElementById('photo');
      preview.src = e.target.result;
      preview.style.display = 'block';
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');
      // Draw resized to canvas for consistent prediction baseline
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      setImageReady(true);
      const clearBtn = document.getElementById('clear-image');
      if (clearBtn) clearBtn.hidden = false;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
  if (fileStatus) fileStatus.textContent = file.name || 'Fichier sélectionné';
});

if (filePickerBtn) {
  filePickerBtn.addEventListener('click', () => fileInput.click());
}
if (clearImageBtn) {
  clearImageBtn.addEventListener('click', () => {
    try { fileInput.value = ''; } catch (e) {}
    if (fileStatus) fileStatus.textContent = 'Aucune image sélectionnée';
    if (photo) { photo.src = ''; photo.style.display = 'none'; }
    if (canvas) { canvas.width = 0; canvas.height = 0; }
    updateScanButtonState();
    showToast('Image supprimée.');
    clearImageBtn.hidden = true;
  });
}

async function identifyTrack() {
  try {
    if (!canvas.width || !canvas.height) {
      showToast("Veuillez d’abord importer ou prendre une photo.");
      return;
    }
    // Loading state
    const btnRef = identify_btn || document.querySelector("button[onclick*='identifyTrack']");
    const prevText = btnRef ? btnRef.textContent : null;
    if (btnRef) {
      btnRef.textContent = 'Chargement…';
      btnRef.disabled = true;
      btnRef.classList.add('is-loading');
    }
    console.time('total');
    console.time('prep');
    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = 256;
    resizedCanvas.height = 256;
    const resizedCtx = resizedCanvas.getContext('2d');
    resizedCtx.drawImage(canvas, 0, 0, 256, 256);
    const imageData = resizedCtx.getImageData(0, 0, 256, 256).data;
    const reshaped = [];
    for (let y = 0; y < 256; y++) {
      const row = [];
      for (let x = 0; x < 256; x++) {
        const i = (y * 256 + x) * 4;
        row.push([imageData[i], imageData[i + 1], imageData[i + 2]]); // R, G, B
      }
      reshaped.push(row);
    }
    console.timeEnd('prep');

    // Fast geolocation with timeout to avoid blocking too long
    console.time('geolocate');
    const loc = await fetchLocationFast(600);
    console.timeEnd('geolocate');

    const payload = {
      image: reshaped,
      path: `track_${Date.now()}_${Math.floor(Math.random() * 10000)}.png`,
      loc,
      date: new Date().toISOString()
    };


    console.time('predict');
    const response = await fetch("http://localhost:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    // response received

   
    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error:", errorText);
      showToast('Erreur serveur (' + response.status + ').');
      return;
    }

    if (contentType && contentType.includes("application/json")) {
      const result = await response.json();
      console.log("API response:", result);

      // Small "match"-style animation before showing modal
      await showMatchAnimation(result);

      // Fill species modal
      fillSpeciesModal(result);
      openModal(document.getElementById('species-modal'));
    } else {
      const text = await response.text();
      console.warn("Unexpected response format:", text);
      showToast('Réponse du serveur inattendue.');
    }
    console.timeEnd('predict');

  } catch (err) {
    console.error("API error:", err);
    showToast("Impossible de joindre le serveur, vérifiez que l’API est démarrée.");
  } finally {
    const btnRef = identify_btn || document.querySelector("button[onclick*='identifyTrack']");
    if (btnRef) {
      btnRef.textContent = "Identifier l'empreinte";
      btnRef.classList.remove('is-loading');
      // Re-apply disabled state based on readiness
      updateScanButtonState();
    }
    console.timeEnd('total');
  }
}

// Geolocation with quick timeout and reverse geocoding
async function fetchLocationFast(timeoutMs = 600) {
  try {
    const pos = await new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, maximumAge: 300000, timeout: timeoutMs })
    );
    const { latitude: lat, longitude: lon } = pos.coords;
    // Reverse geocode with its own timeout using AbortController
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, { signal: controller.signal, headers: { 'Accept': 'application/json' } });
    clearTimeout(t);
    const geoData = await geoRes.json().catch(() => ({}));
    return geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.display_name || "Unknown";
  } catch (e) {
    console.warn('Geolocation slow/unavailable, using Unknown');
    return 'Unknown';
  }
}

// Scan button availability visuals without breaking legacy onclick
function updateScanButtonState() {
  const scanBtn = document.querySelector("button[onclick*='identifyTrack']");
  if (!scanBtn) return;
  const ready = !!(canvas && canvas.width && canvas.height);
  // lock down activation when not ready
  scanBtn.disabled = !ready;
  scanBtn.setAttribute('aria-disabled', ready ? 'false' : 'true');
  scanBtn.classList.toggle('is-disabled', !ready);
}
function setImageReady(ready) {
  if (ready) {
    updateScanButtonState();
  }
}

// Species modal filling
function fillSpeciesModal(data) {
  const title = document.getElementById('species-title-over');
  const sci = document.getElementById('species-sci');
  const desc = document.getElementById('species-modal-desc');
  const family = document.getElementById('species-family');
  const size = document.getElementById('species-size');
  const region = document.getElementById('species-region');
  const housing = document.getElementById('species-housing');
  const funfact = document.getElementById('species-funfact');
  const img = document.getElementById('species-image');

  title.textContent = data.species || 'Espèce inconnue';
  sci.textContent = data.name ? `(${data.name})` : '';
  desc.textContent = data.description || '';
  family.textContent = data.family || '';
  size.textContent = data.size || '';
  region.textContent = data.region || '';
  housing.textContent = data.housing || '';
  funfact.textContent = data.funfact ? `Le saviez-vous ? ${data.funfact}` : '';

  let picture = data.picture || '';
  // Robust fallback for common typos
  if (picture.endsWith('.jog')) picture = picture.replace('.jog', '.jpg');
  if (picture === 'chein.jpg') picture = 'chien.jpg';
  img.src = `assets/animals/${picture}`;
  img.alt = data.species || 'Animal identifié';
  img.onerror = () => { img.src = 'assets/logo.png'; };
}

// Wire events
camera_btn.addEventListener('click', openCamera);
photo_btn.addEventListener('click', takePhoto);
if (identify_btn) identify_btn.addEventListener('click', identifyTrack);

// Modal close interactions (overlay and X button)
['species-modal'].forEach(id => {
  const modal = document.getElementById(id);
  if (!modal) return;
  // prevent clicks inside dialog from bubbling to overlay handler,
  // but keep the close button functional
  const dlg = modal.querySelector('.modal-dialog');
  if (dlg) dlg.addEventListener('click', (e) => {
    if (e.target.closest('.modal-close')) { closeModal(modal); e.stopPropagation(); return; }
    e.stopPropagation();
  });
  modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop') || e.target.classList.contains('modal-close')) {
      closeModal(modal);
    }
  });
});
// Spécifique modale de consentement: ne pas fermer si non accepté
(() => {
  const modal = document.getElementById('storage-modal');
  if (!modal) return;
  const dlg = modal.querySelector('.modal-dialog');
  if (dlg) dlg.addEventListener('click', (e) => {
    if (e.target.closest('.modal-close')) {
      let consent = null;
      try { consent = localStorage.getItem('storageConsent'); } catch (_) {}
      if (consent === 'true') {
        closeModal(modal);
        e.stopPropagation();
      } else {
        e.preventDefault();
        showToast('Veuillez cocher puis accepter pour continuer.');
      }
      return;
    }
    e.stopPropagation();
  });
  modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop') || e.target.classList.contains('modal-close')) {
      let consent = null;
      try { consent = localStorage.getItem('storageConsent'); } catch (_) {}
      if (consent === 'true') {
        closeModal(modal);
      } else {
        e.preventDefault();
        showToast('Veuillez cocher puis accepter pour continuer.');
      }
    }
  });
})();
// camera modal close on overlay/X
(() => {
  const modal = document.getElementById('camera-modal');
  if (!modal) return;
  const dlg = modal.querySelector('.modal-dialog');
  if (dlg) dlg.addEventListener('click', (e) => {
    if (e.target.closest('.modal-close')) { closeModal(modal); e.stopPropagation(); return; }
    e.stopPropagation();
  });
  modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop') || e.target.classList.contains('modal-close')) {
      closeModal(modal);
    }
  });
})();

// Storage consent modal
const storageModal = document.getElementById('storage-modal');
const storageAccept = document.getElementById('storage-accept');
const openStorageInfo = document.getElementById('open-storage-info');

if (storageAccept) {
  const checkbox = document.getElementById('storage-checkbox');
  function syncAccept() {
    storageAccept.disabled = !(checkbox && checkbox.checked);
  }
  if (checkbox) checkbox.addEventListener('change', syncAccept);
  syncAccept();
  storageAccept.addEventListener('click', () => {
    try { localStorage.setItem('storageConsent', 'true'); } catch (e) {}
    closeModal(storageModal);
  });
}
if (openStorageInfo) {
  openStorageInfo.addEventListener('click', () => openModal(storageModal));
}

// Init app (robust to scripts loaded after DOMContentLoaded)
function initApp() {
  let consent = null;
  try { consent = localStorage.getItem('storageConsent'); } catch (e) {}
  if (consent !== 'true') {
    openModal(storageModal);
  }
  updateScanButtonState();
  setupRouting();
  const initial = location.hash.replace('#','') || 'accueil';
  navigate(initial);
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Background parallax (motion-safe)
(function setupParallax(){
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let ticking = false;
  function onScroll(){
    if (media.matches) return; // reduced motion: no parallax
    if (!ticking) {
      window.requestAnimationFrame(() => {
        // Parallax très léger et sécurisé (évite l'apparition de blanc)
        const vw = window.innerWidth || 0;
        const factor = 0.05; // bien plus doux que 0.15
        const maxShift = 60; // limite la translation max en px
        let shift = window.scrollY * factor;
        if (vw < 768) shift = 0; // pas de parallax sur petit écran
        if (shift > maxShift) shift = maxShift;
        if (shift < 0) shift = 0;
        document.body.style.setProperty('--bg-shift', shift + 'px');
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// Toast helper
const toastEl = document.getElementById('toast');
let toastTimer = null;
function showToast(message, timeout = 4000) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.hidden = true;
  }, timeout);
}
// Match animation helper
async function showMatchAnimation(data) {
  try {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const overlay = document.getElementById('match-overlay');
    const img = document.getElementById('match-image');
    const text = document.getElementById('match-text');
    if (!overlay || !img || !text) return;
    // prepare content
    let picture = data.picture || '';
    if (picture.endsWith('.jog')) picture = picture.replace('.jog', '.jpg');
    if (picture === 'chein.jpg') picture = 'chien.jpg';
    img.src = `assets/animals/${picture}`;
    img.alt = data.species || 'Animal identifié';
    text.textContent = data.species ? `C'est un ${data.species} !` : 'Espèce identifiée !';
    overlay.hidden = false;
    // wait a short duration then hide
    await new Promise(res => setTimeout(res, media.matches ? 300 : 900));
    overlay.hidden = true;
  } catch (_) {}
}
// Storage reset consent
const storageResetBtn = document.getElementById('storage-reset');
if (storageResetBtn) {
  storageResetBtn.addEventListener('click', () => {
    try { localStorage.removeItem('storageConsent'); } catch (e) {}
    const checkbox = document.getElementById('storage-checkbox');
    if (checkbox) checkbox.checked = false;
    const accept = document.getElementById('storage-accept');
    if (accept) accept.disabled = true;
    showToast('Consentement réinitialisé.');
  });
}

// Navbar routing (Accueil / Espèces)
function setupRouting() {
  const linkHome = document.getElementById('nav-home');
  const linkSpecies = document.getElementById('nav-species');
  const navToggle = document.getElementById('nav-toggle');
  const navbarEl = document.querySelector('.navbar');
  if (linkHome) linkHome.addEventListener('click', (e) => { e.preventDefault(); navigate('accueil'); });
  if (linkSpecies) linkSpecies.addEventListener('click', (e) => { e.preventDefault(); navigate('especes'); });
  window.addEventListener('hashchange', () => {
    const route = location.hash.replace('#','') || 'accueil';
    navigate(route);
  });
  if (navToggle && navbarEl) {
    const navList = document.getElementById('nav-list');
    function updateNavOffset() {
      if (!document.body.classList.contains('nav-open') || !navList) return;
      const rect = navList.getBoundingClientRect();
      const offset = Math.max(72, Math.ceil(rect.height + 24));
      document.body.style.setProperty('--nav-offset', offset + 'px');
    }
    let navEscHandler = null;
    let navTrapHandler = null;
    let prevFocus = null;
    function trapNavFocus(e) {
      if (e.key !== 'Tab') return;
      const focusables = navList ? Array.from(navList.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])')) : [];
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    function openBurger() {
      if (navbarEl.classList.contains('open')) return;
      prevFocus = document.activeElement;
      navbarEl.classList.add('open');
      document.body.classList.add('nav-open');
      navToggle.setAttribute('aria-expanded', 'true');
      if (navList) navList.setAttribute('aria-hidden', 'false');
      requestAnimationFrame(() => {
        updateNavOffset();
        const first = navList && navList.querySelector('a, button');
        if (first && first.focus) first.focus();
      });
      navEscHandler = (e) => { if (e.key === 'Escape') closeBurger(); };
      document.addEventListener('keydown', navEscHandler);
      navTrapHandler = trapNavFocus;
      if (navList) navList.addEventListener('keydown', navTrapHandler);
      positionNavIndicator();
    }
    function closeBurger() {
      if (!navbarEl.classList.contains('open')) return;
      navbarEl.classList.remove('open');
      document.body.classList.remove('nav-open');
      try { document.body.style.removeProperty('--nav-offset'); } catch (_) {}
      navToggle.setAttribute('aria-expanded', 'false');
      if (navList) navList.setAttribute('aria-hidden', 'true');
      if (navEscHandler) document.removeEventListener('keydown', navEscHandler);
      if (navTrapHandler && navList) navList.removeEventListener('keydown', navTrapHandler);
      navEscHandler = null; navTrapHandler = null;
      if (prevFocus && prevFocus.focus) prevFocus.focus();
    }
    navToggle.addEventListener('click', () => {
      if (navbarEl.classList.contains('open')) closeBurger(); else openBurger();
    });
    window.addEventListener('resize', () => {
      if (document.body.classList.contains('nav-open')) requestAnimationFrame(updateNavOffset);
    });
    document.querySelectorAll('.nav-list a, .nav-list button.linklike').forEach(el => {
      el.addEventListener('click', () => { if (navbarEl.classList.contains('open')) closeBurger(); });
    });
  }
}

function navigate(route) {
  const home = document.getElementById('home-section');
  const species = document.getElementById('species-section');
  const linkHome = document.getElementById('nav-home');
  const linkSpecies = document.getElementById('nav-species');
  if (route === 'especes') {
    if (home) home.hidden = true;
    if (species) species.hidden = false;
    if (linkHome) linkHome.removeAttribute('aria-current');
    if (linkSpecies) linkSpecies.setAttribute('aria-current', 'page');
    if (location.hash !== '#especes') location.hash = '#especes';
    ensureSpeciesLoaded();
  } else {
    if (species) species.hidden = true;
    if (home) home.hidden = false;
    if (linkSpecies) linkSpecies.removeAttribute('aria-current');
    if (linkHome) linkHome.setAttribute('aria-current', 'page');
    if (location.hash !== '#accueil') location.hash = '#accueil';
  }
  requestAnimationFrame(positionNavIndicator);
}

let speciesDataCache = null;
async function ensureSpeciesLoaded() {
  if (speciesDataCache) return renderSpecies(speciesDataCache);
  try {
    const res = await fetch('assets/species.json', { headers: { 'Accept': 'application/json' } });
    const data = await res.json();
    speciesDataCache = Array.isArray(data) ? data : [];
    renderSpecies(speciesDataCache);
  } catch (e) {
    console.error('Failed to load species list', e);
    showToast('Impossible de charger la liste des espèces.');
  }
}

// Nav indicator animation
function positionNavIndicator() {
  const list = document.querySelector('.nav-list');
  const active = document.querySelector('.nav-list a[aria-current="page"]');
  const indicator = document.querySelector('.nav-list .nav-indicator');
  if (!list || !active || !indicator) return;
  const lb = list.getBoundingClientRect();
  const ab = active.getBoundingClientRect();
  indicator.style.position = 'absolute';
  const offsetPx = (ab.left - lb.left) + list.scrollLeft;
  const leftPct = (offsetPx / lb.width) * 100;
  const widthPct = (ab.width / lb.width) * 100;
  indicator.style.left = leftPct + '%';
  indicator.style.width = widthPct + '%';
  indicator.style.height = '2.25em';
  indicator.style.top = '50%';
  indicator.style.transform = 'translateY(-50%)';
}
window.addEventListener('resize', positionNavIndicator);
// Update indicator position when nav is scrolled horizontally
const navListEl = document.querySelector('.nav-list');
if (navListEl) navListEl.addEventListener('scroll', positionNavIndicator, { passive: true });

function renderSpecies(data) {
  const grid = document.getElementById('species-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const frag = document.createDocumentFragment();
  data.forEach(item => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'species-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('aria-label', `${item.species} (${item.name || ''})`);
    const img = document.createElement('img');
    img.src = `assets/animals/${item.picture}`;
    img.loading = 'lazy';
    img.alt = item.species || 'Espèce';
    const title = document.createElement('div');
    title.className = 'species-card-title';
    title.innerHTML = `<strong>${item.species || ''}</strong><span>${item.name || ''}</span>`;
    card.appendChild(img);
    card.appendChild(title);
    card.addEventListener('click', () => { fillSpeciesModal(item); openModal(document.getElementById('species-modal')); });
    frag.appendChild(card);
  });
  grid.appendChild(frag);
  const search = document.getElementById('species-search');
  if (search && !search.dataset.bound) {
    search.dataset.bound = '1';
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      const filtered = speciesDataCache.filter(s =>
        (s.species || '').toLowerCase().includes(q) || (s.name || '').toLowerCase().includes(q)
      );
      renderSpecies(filtered);
    });
  }
}

// Lazy-load species images (already set by setting attribute)
