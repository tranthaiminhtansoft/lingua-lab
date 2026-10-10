(() => {
  const installMenu = () => {
    const header = document.querySelector('body > header');
    const main = document.querySelector('body > main');
    const documentationNav = header?.querySelector('nav[aria-label="Documentation"]');
    if (!header || !main || !documentationNav || document.getElementById('docs-page-menu')) return;

    const menu = document.createElement('aside');
    menu.className = 'docs-page-menu';
    menu.id = 'docs-page-menu';
    menu.setAttribute('aria-label', 'Page menu');
    menu.innerHTML = `
      <button class="docs-menu-toggle" type="button" aria-expanded="false" aria-controls="docs-menu-panel" aria-label="Open contents menu">
        <span class="docs-menu-arrow" aria-hidden="true">‹</span>
        <span class="docs-sr-only">Open contents menu</span>
      </button>
      <div class="docs-menu-panel" id="docs-menu-panel">
        <h2>Documentation</h2>
        <div class="docs-navigation"></div>
      </div>`;

    const panel = menu.querySelector('.docs-menu-panel');
    const docsNavigation = menu.querySelector('.docs-navigation');
    docsNavigation.append(documentationNav);
    documentationNav.className = 'docs-links';

    const childPages = {
      'reference.html': [
        { label: 'Application topology', href: 'topology.html' },
        { label: 'CI/CD', href: 'delivery.html' },
      ],
      'procedures.html': [
        { label: 'Pre-release', href: 'pre-release.html' },
        { label: 'Release', href: 'release.html' },
        { label: 'Post-release', href: 'post-release.html' },
        { label: 'Rollback and recovery', href: 'rollback.html' },
      ],
    };
    const currentPath = window.location.pathname;
    documentationNav.querySelectorAll('a[href]').forEach((parentLink) => {
      const children = childPages[new URL(parentLink.href).pathname.split('/').pop()];
      if (!children) return;

      const subpages = document.createElement('div');
      subpages.className = 'docs-subpages';
      subpages.setAttribute('role', 'group');
      subpages.setAttribute('aria-label', `${parentLink.textContent.trim()} pages`);
      children.forEach(({ label, href }) => {
        const link = document.createElement('a');
        link.href = href;
        link.textContent = label;
        if (new URL(link.href).pathname === currentPath) link.setAttribute('aria-current', 'page');
        subpages.append(link);
      });
      parentLink.after(subpages);
    });

    const headings = [...main.querySelectorAll('h2')];
    const pageSections = headings.length ? headings : [...main.querySelectorAll(':scope > ol > li')];
    if (pageSections.length) {
      const onThisPage = document.createElement('div');
      onThisPage.className = 'docs-on-this-page';
      onThisPage.innerHTML = '<h2>On this page</h2><nav aria-label="On this page"></nav>';
      const localNav = onThisPage.querySelector('nav');
      pageSections.forEach((section, index) => {
        if (!section.id) {
          const slug = section.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
          section.id = `docs-${slug.slice(0, 48)}-${index + 1}`;
        }
        const link = document.createElement('a');
        link.href = `#${section.id}`;
        link.dataset.sectionLink = section.id;
        const heading = section.matches('h2') ? section : section.querySelector('h2, h3');
        const label = heading?.textContent.trim() ?? section.textContent.trim().split(/[.!?](?:\s|$)/, 1)[0];
        link.textContent = label.length > 56 ? `${label.slice(0, 53).trimEnd()}…` : label;
        localNav.append(link);
      });
      panel.append(onThisPage);
    }

    const layout = document.createElement('div');
    layout.className = 'docs-layout';
    main.before(layout);
    layout.append(menu, main);

    const toggle = menu.querySelector('.docs-menu-toggle');
    const arrow = menu.querySelector('.docs-menu-arrow');
    const toggleLabel = toggle.querySelector('.docs-sr-only');
    const mobileMenu = window.matchMedia('(max-width: 760px)');
    const setMenuOpen = (open) => {
      menu.classList.toggle('is-open', open);
      menu.classList.toggle('is-collapsed', !open && !mobileMenu.matches);
      layout.classList.toggle('docs-layout-menu-collapsed', !open && !mobileMenu.matches);
      toggle.setAttribute('aria-expanded', String(open));
      const actionLabel = mobileMenu.matches
        ? (open ? 'Close contents menu' : 'Open contents menu')
        : (open ? 'Collapse documentation menu' : 'Expand documentation menu');
      toggleLabel.textContent = actionLabel;
      toggle.setAttribute('aria-label', toggleLabel.textContent);
      arrow.textContent = mobileMenu.matches ? (open ? '›' : '‹') : (open ? '‹' : '›');
      panel.inert = !open;
    };
    toggle.addEventListener('click', () => setMenuOpen(!menu.classList.contains('is-open')));
    mobileMenu.addEventListener('change', () => setMenuOpen(!mobileMenu.matches));
    setMenuOpen(!mobileMenu.matches);

    const localLinks = [...menu.querySelectorAll('[data-section-link]')];
    const sections = localLinks.map((link) => document.getElementById(link.dataset.sectionLink)).filter(Boolean);
    let pendingUpdate = 0;
    const updateActiveLink = () => {
      pendingUpdate = 0;
      const current = sections.filter((section) => section.getBoundingClientRect().top <= 160).at(-1) ?? sections[0];
      if (!current) return;
      localLinks.forEach((link) => {
        if (link.dataset.sectionLink === current.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    };
    const scheduleUpdate = () => {
      if (!pendingUpdate) pendingUpdate = requestAnimationFrame(updateActiveLink);
    };
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    localLinks.forEach((link) => link.addEventListener('click', () => setMenuOpen(false)));
    updateActiveLink();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installMenu, { once: true });
  else installMenu();
})();
