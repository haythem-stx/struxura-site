// ============================================
// STRUXURA — SCRIPT PARTAGÉ (toutes pages, FR et EN)
// Menu mobile, header sticky, animations, consentement cookies,
// formulaire HubSpot, filtre modules (si présent sur la page).
// ============================================

document.addEventListener("DOMContentLoaded", () => {

  // --- 1. MENU MOBILE ---
  const menuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  // --- 2. HEADER STICKY ---
  const header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    });
  }

  // --- 3. ANIMATIONS AU SCROLL ---
  const uxObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('ux-active');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -50px 0px', threshold: 0.05 });

  document.querySelectorAll('section > h2, .card, .metier-col, .domaine-block, .module-card, .narrative-section, .foundation-block').forEach(el => {
    el.classList.add('ux-reveal');
    uxObserver.observe(el);
  });

  // --- 4. CONSENTEMENT COOKIES (Google Consent Mode V2) ---
  const banner = document.getElementById('cookieBanner');
  const acceptBtn = document.getElementById('cookieAccept');
  const declineBtn = document.getElementById('cookieDecline');
  const CONSENT_KEY = 'struxura_consent';

  function loadGA() {
    if (window.gaLoaded) return;
    window.gaLoaded = true;
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-HT8CXK6VGF';
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'G-HT8CXK6VGF');
  }

  // Pixel de suivi HubSpot (visiteurs anonymes, hors soumission de formulaire).
  // Même règle de consentement que Google Analytics : chargé uniquement après accord.
  function loadHS() {
    if (window.hsLoaded) return;
    window.hsLoaded = true;
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.id = 'hs-script-loader';
    script.async = true;
    script.defer = true;
    script.src = '//js.hs-scripts.com/147416473.js';
    document.body.appendChild(script);
  }

  // Consent Mode V2 : refus par défaut tant que l'utilisateur n'a pas choisi
  window.dataLayer = window.dataLayer || [];
  function gtagDefault() { dataLayer.push(arguments); }
  gtagDefault('consent', 'default', {
    'analytics_storage': 'denied',
    'ad_storage': 'denied'
  });

  const storedConsent = localStorage.getItem(CONSENT_KEY);
  if (storedConsent === 'accepted') {
    loadGA();
    loadHS();
    if (window.gtag) window.gtag('consent', 'update', { 'analytics_storage': 'granted' });
  } else if (!storedConsent && banner) {
    banner.classList.add('visible');
  }

  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem(CONSENT_KEY, 'accepted');
      loadGA();
      loadHS();
      if (window.gtag) window.gtag('consent', 'update', { 'analytics_storage': 'granted' });
      if (banner) banner.classList.remove('visible');
    });
  }
  if (declineBtn) {
    declineBtn.addEventListener('click', () => {
      localStorage.setItem(CONSENT_KEY, 'declined');
      if (banner) banner.classList.remove('visible');
    });
  }

  // --- 6. FILTRE DU CATALOGUE DE MODULES (si présent sur la page) ---
  const filterBtns = document.querySelectorAll('.filter-btn');
  const moduleCards = document.querySelectorAll('.module-card');
  if (filterBtns.length && moduleCards.length) {
    function applyModuleFilter(filterValue) {
      filterBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filterValue) btn.classList.add('active');
      });
      moduleCards.forEach(card => {
        card.style.display = (filterValue === 'all' || card.dataset.category === filterValue) ? 'flex' : 'none';
      });
    }
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => applyModuleFilter(btn.dataset.filter));
    });

    // Pré-filtre depuis l'URL, ex: modules.html?domaine=domaine-1
    const params = new URLSearchParams(window.location.search);
    const initialFilter = params.get('domaine');
    if (initialFilter) applyModuleFilter(initialFilter);
  }

  // --- 7. NOTE DE CONTEXTE MODULE SUR LA PAGE DE RÉSERVATION (depuis ?module=STX-XX) ---
  const moduleParam = new URLSearchParams(window.location.search).get('module');
  const moduleNoteEl = document.getElementById('moduleContextNote');
  if (moduleParam && moduleNoteEl) {
    const isEN = document.documentElement.lang === 'en';
    moduleNoteEl.textContent = isEN
      ? `You're arriving from module ${moduleParam}. Mention it at the start of the call.`
      : `Vous arrivez depuis le module ${moduleParam}. Mentionnez-le en démarrage de l'échange.`;
    moduleNoteEl.style.display = 'block';
  }

});

// --- 8. MESURE DES ACTIONS CLÉS (Google Analytics 4) ---
// Les événements ne partent que si le visiteur a accepté les cookies (gtag chargé).
(function () {
  function track(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }

  function pageName() {
    var p = location.pathname.replace(/^\/+/, '').replace(/\.html$/, '');
    return p === '' || p === 'index' ? 'accueil' : p;
  }

  function zoneOf(el) {
    if (el.closest('header, nav')) return 'menu';
    if (el.closest('footer')) return 'pied_de_page';
    var s = el.closest('section');
    if (s && s.id) return s.id;
    var h = s && s.querySelector('h1, h2');
    return h ? h.textContent.trim().slice(0, 40) : 'contenu';
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (a) {
      // Le bouton de langue (EN/FR) pointe vers diagnostic.html sur la page diagnostic : on l'ignore
      if (a.classList.contains('lang-switch')) return;
      var href = a.getAttribute('href') || '';
      // 1. Clic vers la page de réservation du diagnostic
      if (/(^|\/)diagnostic\.html/.test(href)) {
        var mod = (href.match(/[?&]module=([^&#]+)/) || [])[1];
        track('clic_diagnostic', {
          page_origine: pageName(),
          emplacement: zoneOf(a),
          texte_bouton: a.textContent.trim().slice(0, 60),
          module: mod ? decodeURIComponent(mod) : '(aucun)'
        });
        return;
      }
      // 2. Passage vers haythemsalhi.com
      if (/haythemsalhi\.com/.test(href)) {
        track('clic_haythemsalhi', { page_origine: pageName(), emplacement: zoneOf(a) });
        return;
      }
    }
    // 3. Filtre du catalogue de modules
    var f = e.target.closest ? e.target.closest('.filter-btn') : null;
    if (f) track('filtre_module', { domaine: f.dataset.filter || '(inconnu)' });
  });

  // 4. Rendez-vous confirmé dans le calendrier HubSpot (page diagnostic)
  var booked = false;
  window.addEventListener('message', function (e) {
    if (booked || !e.data || !e.data.meetingBookSucceeded) return;
    try { if (!/hubspot\.com$/.test(new URL(e.origin).hostname)) return; } catch (err) { return; }
    booked = true;
    var mod = new URLSearchParams(location.search).get('module');
    track('generate_lead', { formulaire: 'rdv_diagnostic', module: mod || '(aucun)' });
  });
})();
