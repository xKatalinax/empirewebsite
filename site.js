/* ============================================================
   Empire RP — Shared Site Behavior (Redesign)
   ============================================================ */
(function () {
  'use strict';
  var SERVER_CODE = 'zjva9ey';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Page transitions ---- */
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
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname) return;
    e.preventDefault();
    document.body.classList.add('is-leaving');
    setTimeout(function () { location.href = url.href; }, 240);
  });
  window.addEventListener('pageshow', function () { document.body.classList.remove('is-leaving'); });

  /* ---- Nav scroll state ---- */
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

  /* ---- Scroll reveal ---- */
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
          setTimeout(function () { entry.target.classList.add('visible'); }, Math.min(idx * 70, 350));
          io.unobserve(entry.target);
        });
      }, { threshold: 0.08 });
      reveals.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---- Live player count ---- */
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
            : 'Server is live';
        })
        .catch(function () {
          if (badge) badge.textContent = 'Empire Roleplay — Live';
          if (ctaPill) ctaPill.classList.add('offline');
          if (ctaText) ctaText.textContent = 'Live count unavailable — hit Play Now to connect';
        });
    };
    refresh();
    setInterval(refresh, 60000);
  }

  /* ---- Counter animations ---- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && !reduceMotion) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        var start = 0;
        var duration = 1600;
        var startTime = null;
        function step(timestamp) {
          if (!startTime) startTime = timestamp;
          var progress = Math.min((timestamp - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        countObserver.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { countObserver.observe(el); });
  }
})();
