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
    [/^\/org$/, O.home],
    [/^\/org\/new$/, O.form],
    [/^\/org\/edit\/([\w-]+)$/, O.form],
    [/^\/org\/event\/([\w-]+)$/, O.manage],
    [/^\/org\/scan\/([\w-]+)$/, O.scan],
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

    if (path !== lastPath) { window.scrollTo(0, 0); lastPath = path; }
  };

  // Desktop header. Participant pages link to the four main sections; organiser pages get their own links.
  const sitenav = document.getElementById('sitenav');
  function renderSiteNav(path, opts) {
    sitenav.hidden = !!opts.bare;
    if (opts.bare) return;
    const isOrg = path.startsWith('/org');
    const link = (href, label, on) => `<a href="${href}" class="${on ? 'on' : ''}">${label}</a>`;
    let links, right;
    if (isOrg) {
      const org = K.store.currentOrg();
      links = org ? link('#/org', 'Dashboard', path === '/org') + link('#/org/new', 'Post an event', path === '/org/new') : '';
      right = `${org ? `<span class="nav-org"><span class="avatar">${K.esc(K.initials(org.name))}</span>${K.esc(org.name)}</span><button class="textlink small" data-switch-org>Switch group</button>` : ''}
        <a class="btn btn-sm" href="#/">Back to events</a>`;
    } else {
      const st = K.store.stats();
      const nav = opts.nav || '';
      links = link('#/discover', "What's on", nav === 'discover') + link('#/saved', 'Saved', nav === 'saved') +
        link('#/passport', 'Passport', nav === 'passport') + link('#/me', 'Me', nav === 'me');
      right = `<a class="xp-chip" href="#/passport" title="Your kaypoh level">Lv ${st.level.n} · <b>${st.xp} XP</b></a>
        <a class="btn btn-sm btn-ink" href="#/org">For organisers</a>`;
    }
    sitenav.innerHTML = `<div class="inner">
      <a class="brand" href="${isOrg ? '#/org' : '#/'}">${K.eyes()}kaypoh for good${isOrg ? '<span class="tag outline" style="margin-left:4px">Organisers</span>' : ''}</a>
      <nav aria-label="Main">${links}</nav>
      <div class="right">${right}</div>
    </div>`;
    const sw = sitenav.querySelector('[data-switch-org]');
    if (sw) sw.addEventListener('click', () => { K.store.signOutOrg(); K.go('#/org'); K.render(); });
  }

  K.store.init();
  K.hydrateIcons(tabbar);
  document.querySelectorAll('[data-eyes]').forEach((el) => { el.outerHTML = K.eyes(); });
  window.addEventListener('hashchange', () => { K._navCount++; K.render(); });
  K._navCount = 1;
  K.render();
})(window.KFG);
