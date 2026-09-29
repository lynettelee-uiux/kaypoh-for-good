/* Hash router. Each route renders into a fresh container so event listeners never pile up. */
(function (K) {
  'use strict';
  const P = K.P, O = K.O;
  const routes = [
    [/^\/$/, P.landing],
    [/^\/onboard$/, P.onboard],
    [/^\/discover$/, P.discover],
    [/^\/event\/([\w-]+)$/, P.event],
    [/^\/register\/([\w-]+)$/, P.register],
    [/^\/ticket\/([\w-]+)$/, P.ticket],
    [/^\/saved$/, P.saved],
    [/^\/passport$/, P.passport],
    [/^\/me$/, P.me],
    [/^\/organisers$/, O.contact],
    [/^\/org(\/.*)?$/, O.contact], // old organiser links from the prototype
  ];

  const app = document.getElementById('app');
  const tabbar = document.getElementById('tabbar');
  let cleanup = null, lastPath = null;

  K.render = () => {
    const path = (location.hash.replace(/^#/, '') || '/').split('?')[0];
    if (cleanup) { try { cleanup(); } catch (e) { /* ignore */ } cleanup = null; }
    document.getElementById('sheet-root').innerHTML = '';

    let match = null, view = P.landing;
    for (const [re, fn] of routes) { match = path.match(re); if (match) { view = fn; break; } }
    const root = document.createElement('div');
    app.replaceChildren(root);
    const opts = view(root, match ? match.slice(1) : []) || {};

    document.title = opts.title || 'Kaypoh for Good';
    renderSiteNav(path, opts);
    document.getElementById('sitefoot').hidden = !!opts.bare;
    document.body.classList.toggle('is-bare', !!opts.bare);
    tabbar.hidden = !opts.nav;
    document.body.classList.toggle('has-tabbar', !!opts.nav);
    document.body.classList.toggle('has-actionbar', !!opts.bar);
    K.qsa('a', tabbar).forEach((a) => a.classList.toggle('on', a.dataset.tab === opts.nav));
    cleanup = opts.cleanup || null;

    if (path !== lastPath) { window.scrollTo(0, 0); lastPath = path; K.trackPage(path); }
  };

  // Desktop header: the four main sections, the visitor's XP, and a link for organisers.
  const sitenav = document.getElementById('sitenav');
  function renderSiteNav(path, opts) {
    sitenav.hidden = !!opts.bare;
    if (opts.bare) return;
    const link = (href, label, on) => `<a href="${href}" class="${on ? 'on' : ''}">${label}</a>`;
    const st = K.store.stats();
    const nav = opts.nav || '';
    const isOrg = opts.area === 'org';
    sitenav.innerHTML = `<div class="inner">
      <a class="brand" href="#/">${K.eyes()}kaypoh for good</a>
      <nav aria-label="Main">${link('#/discover', "What's on", nav === 'discover') + link('#/saved', 'Saved', nav === 'saved') +
        link('#/passport', 'Passport', nav === 'passport') + link('#/me', 'Me', nav === 'me')}</nav>
      <div class="right">
        <a class="xp-chip" href="#/passport" title="Your kaypoh level">Lv ${st.level.n} · <b>${st.xp} XP</b></a>
        <a class="btn btn-sm ${isOrg ? 'btn-lime' : 'btn-ink'}" href="#/organisers">List your event</a>
      </div>
    </div>`;
  }

  K.store.init();
  K.initAnalytics();
  K.hydrateIcons(tabbar);
  document.querySelectorAll('[data-eyes]').forEach((el) => { el.outerHTML = K.eyes(); });
  window.addEventListener('hashchange', () => { K._navCount++; K.render(); });
  K._navCount = 1;
  K.render();
})(window.KFG);
