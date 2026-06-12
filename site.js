/* ============================================================
   Empire RP — shared site behavior
   Loaded on every page. Each feature is guarded so it only runs
   when its markup exists. Page-specific scripts stay inline.
   ============================================================ */
(function () {
  'use strict';
  var SERVER_CODE = 'zjva9ey';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Smooth fade between pages ---- */
  document.addEventListener('click', function (e) {
    if (reduceMotion || e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || a.target === '_blank' || a.hasAttribute('download')) return;
    if (/^(#|mailto:|tel:|fivem:|javascript:)/i.test(href)) return;
    var url;
    try { url = new URL(href, location.href); } catch (_) { return; }
    if (url.origin !== location.origin) return;                 // external link
    if (url.pathname === location.pathname) return;             // same page / anchor
    e.preventDefault();
    document.body.classList.add('is-leaving');
    setTimeout(function () { location.href = url.href; }, 250);
  });
  // Clear the leaving state when returning via back/forward cache
  window.addEventListener('pageshow', function () { document.body.classList.remove('is-leaving'); });

  /* ---- Nav background on scroll ---- */
  var nav = document.getElementById('mainNav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  /* ---- Mobile menu ---- */
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () { mobileMenu.classList.toggle('open'); });
    mobileMenu.addEventListener('click', function (e) {
      if (e.target.closest('a')) mobileMenu.classList.remove('open');
    });
  }

  /* ---- Scroll reveal (staggered) ---- */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('visible'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
          var idx = siblings.indexOf(entry.target);
          setTimeout(function () { entry.target.classList.add('visible'); }, Math.min(idx * 80, 400));
          io.unobserve(entry.target);
        });
      }, { threshold: 0.1 });
      reveals.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---- Floating hero particles ---- */
  var particles = document.getElementById('particles');
  if (particles && !reduceMotion) {
    for (var i = 0; i < 28; i++) {
      var p = document.createElement('div');
      p.className = 'particle';
      var size = (i % 5) + 1;                 // deterministic-ish, varied sizes
      var left = (i * 37 % 100);
      var bottom = (i * 13 % 30);
      var dur = 12 + (i * 7 % 16);
      var del = (i * 11 % 12);
      p.style.cssText =
        'width:' + size + 'px;height:' + size + 'px;left:' + left + '%;bottom:' + bottom + '%;' +
        '--dur:' + dur + 's;--del:' + del + 's;';
      particles.appendChild(p);
    }
  }

  /* ---- Live player count (Cfx.re) ---- */
  var badge = document.getElementById('liveBadgeText');
  var ctaPill = document.getElementById('ctaStatus');
  var ctaText = document.getElementById('ctaStatusText');
  if (badge || ctaPill) {
    var API = 'https://frontend.cfx-services.net/api/servers/single/' + SERVER_CODE;
    var refresh = function () {
      fetch(API, { headers: { Accept: 'application/json' }, cache: 'no-store' })
        .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
        .then(function (json) {
          var d = (json && json.Data) || {};
          var players = Number(d.clients) || 0;
          var max = Number(d.sv_maxclients || d.svMaxclients) || 0;
          if (badge) badge.innerHTML = '<strong>' + players + '</strong> / ' + max + ' players online';
          if (ctaPill) ctaPill.classList.remove('offline');
          if (ctaText) ctaText.innerHTML = max
            ? '<b>' + players + '</b> players in the city right now'
            : 'Server online';
        })
        .catch(function () {
          if (badge) badge.textContent = 'Empire Roleplay is Live';
          if (ctaPill) ctaPill.classList.add('offline');
          if (ctaText) ctaText.textContent = 'Live count unavailable, hit Play Now to connect';
        });
    };
    refresh();
    setInterval(refresh, 60000);
  }
})();
