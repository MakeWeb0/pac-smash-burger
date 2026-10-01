/* =========================================================
   PAC-SMASH BURGER — interacción y animaciones (GSAP)
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fineHover = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- SVG: logo y fantasmas ----------
     Se generan inline (no con <use>) para que CSS y GSAP lleguen a cada trazo. */
  const burgerIcon = (c, tx, ty) => `
    <g stroke="${c}" transform="translate(${tx} ${ty})">
      <path pathLength="1" d="M-14 -2Q-14 -14 0 -14Q14 -14 14 -2Z"/>
      <circle cx="-5" cy="-7" r="1.5" fill="${c}" stroke="none"/>
      <circle cx="5" cy="-7" r="1.5" fill="${c}" stroke="none"/>
      <path pathLength="1" d="M-15 1H15V5H9V9A1.5 1.5 0 0 1 6 9V5H-4V8A1.5 1.5 0 0 1-7 8V5H-15Z"/>
      <path pathLength="1" d="M-14 11H14Q14 16 9 16H-9Q-14 16-14 11Z"/>
    </g>`;

  const logoSVG = () => `
    <svg class="logo-svg" viewBox="0 0 120 120" aria-hidden="true">
      <circle class="lg-ring" pathLength="1" cx="60" cy="60" r="53" fill="none" stroke="#ff5a2e" stroke-width="4"/>
      <g fill="none" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round">
        <path class="lg-pac" pathLength="1" d="M38 40L52 31A17 17 0 1 0 52 49Z" stroke="#ffe02e"/>
        ${burgerIcon('#ff4fc1', 82, 40)}${burgerIcon('#22e6ff', 38, 80)}${burgerIcon('#5dff4a', 82, 80)}
      </g>
    </svg>`;

  const ghostSVG = (c) => `
    <svg class="ghost-svg" viewBox="0 0 28 30" style="color:${c}" aria-hidden="true">
      <path class="g-body" fill="${c}" d="M2 14C2 6.8 7.4 1.5 14 1.5S26 6.8 26 14V28.5L21.6 25L17.8 28.5L14 25L10.2 28.5L6.4 25L2 28.5Z"/>
      <g class="g-eye">
        <ellipse cx="9.5" cy="13" rx="3.3" ry="4" fill="#fff"/>
        <ellipse cx="18.5" cy="13" rx="3.3" ry="4" fill="#fff"/>
        <circle class="g-pupil" cx="9.5" cy="13.6" r="1.9" fill="#1d2bd8"/>
        <circle class="g-pupil" cx="18.5" cy="13.6" r="1.9" fill="#1d2bd8"/>
      </g>
      <g class="g-scared">
        <circle cx="10" cy="12" r="1.6" fill="#ffd6a8"/>
        <circle cx="18" cy="12" r="1.6" fill="#ffd6a8"/>
        <path d="M5.5 20l2.1-2 2.1 2 2.1-2 2.1 2 2.1-2 2.1 2 2.1-2 2.1 2" stroke="#ffd6a8" stroke-width="1.3" fill="none"/>
      </g>
    </svg>`;

  $$('[data-logo]').forEach(el => (el.innerHTML = logoSVG()));
  $$('[data-ghost]').forEach(el => (el.innerHTML = ghostSVG(el.dataset.ghost)));
  $$('[data-bicon]').forEach(el => {
    const c = el.dataset.bicon;
    el.innerHTML = `<svg class="bicon-svg" viewBox="-17 -16 34 34" style="color:${c}" fill="none" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${burgerIcon(c, 0, 0)}</svg>`;
  });
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Abierto / cerrado (hora de Madrid) ---------- */
  (function openNow() {
    const el = $('#openNow');
    if (!el) return;
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    const get = t => parts.find(p => p.type === t)?.value;
    const day = get('weekday');
    const mins = (+get('hour') % 24) * 60 + +get('minute');
    const late = ['Thu', 'Fri', 'Sat', 'Sun'].includes(day);
    const slots = [[720, 960], [1170, late ? 1410 : 1380]];
    const fmt = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    const cur = slots.find(([a, b]) => mins >= a && mins < b);
    if (cur) {
      el.textContent = `Abierto ahora · cierra a las ${fmt(cur[1])}`;
      el.style.setProperty('--state', 'var(--green)');
    } else {
      const next = slots.find(([a]) => mins < a);
      el.textContent = next ? `Cerrado ahora · abre a las ${fmt(next[0])}` : 'Cerrado ahora · mañana desde las 12:00';
      el.style.setProperty('--state', 'var(--red)');
    }
  })();

  /* Sin GSAP la web se ve igual, solo que quieta */
  if (!window.gsap) { $('.preloader')?.remove(); return; }

  gsap.registerPlugin(ScrollTrigger);
  const hasSplit = !!window.SplitText;
  if (hasSplit) gsap.registerPlugin(SplitText);

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollToTarget = (t) => {
    if (lenis) lenis.scrollTo(t, { duration: 1.4 });
    else if (t === 0) window.scrollTo({ top: 0, behavior: 'smooth' });
    else t.scrollIntoView({ behavior: 'smooth' });
  };

  /* ---------- Marcador (1UP) ---------- */
  const scoreEl = $('#score');
  let scrollScore = 0, bonusScore = 0;
  const renderScore = () => { if (scoreEl) scoreEl.textContent = String(scrollScore + bonusScore).padStart(6, '0'); };
  const addPoints = (p) => {
    bonusScore += p;
    renderScore();
    if (scoreEl) gsap.fromTo(scoreEl, { color: '#ffe02e', scale: 1.25 }, { color: '#f6f3ea', scale: 1, duration: .5, ease: 'power2.out' });
  };

  /* ---------- HUD (navbar) ---------- */
  const hud = $('#hud');
  let hudHidden = false;
  let menuOpen = false, menuBusy = false;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate(self) {
      const y = self.scroll();
      hud.classList.toggle('is-solid', y > 30);
      scrollScore = Math.round(self.progress * 4990) * 10;
      renderScore();
      if (menuOpen) return;
      const hide = self.direction === 1 && y > innerHeight * 0.8;
      if (hide !== hudHidden) {
        hudHidden = hide;
        gsap.to(hud, { yPercent: hide ? -115 : 0, duration: .45, ease: 'power3.out' });
      }
    }
  });

  /* ---------- Menú hamburguesa ---------- */
  const menu = $('#menu'), burger = $('#burger');
  const menuBg = $('.menu-bg'), menuPac = $('.menu-pac');
  const [b1, b2, b3] = ['.b1', '.b2', '.b3'].map(s => $(s));
  gsap.set(b1, { y: -7 }); gsap.set(b3, { y: 7 });

  const menuMazePaths = $$('.menu-maze path');
  menuMazePaths.forEach(p => p.setAttribute('pathLength', '1'));

  function setBurger(open) {
    gsap.to(b1, { y: open ? 0 : -7, rotation: open ? 45 : 0, duration: .5, ease: 'back.out(2)' });
    gsap.to(b3, { y: open ? 0 : 7, rotation: open ? -45 : 0, width: 22, duration: .5, ease: 'back.out(2)', clearProps: open ? '' : 'width' });
    gsap.to(b2, { scaleX: open ? 0 : 1, autoAlpha: open ? 0 : 1, duration: .25 });
    gsap.to([b1, b2, b3], { backgroundColor: open ? '#120f02' : '#f6f3ea', duration: .3 });
    gsap.to(burger, { backgroundColor: open ? '#ffe02e' : 'rgba(6,6,12,.5)', borderColor: open ? '#ffe02e' : 'rgba(255,255,255,.2)', rotation: open ? 180 : 0, duration: .6, ease: 'power3.inOut' });
  }

  function openMenu() {
    if (menuBusy || menuOpen) return;
    menuOpen = menuBusy = true;
    lenis?.stop();
    document.body.classList.add('menu-open');
    gsap.to(hud, { yPercent: 0, duration: .3 }); hudHidden = false;
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Cerrar menú');
    setBurger(true);

    const W = innerWidth, H = innerHeight;
    const S = Math.max(H * 1.7, 600);
    const st = { p: 0 };
    gsap.set(menu, { visibility: 'visible' });
    gsap.set(menuPac, { width: S, height: S, xPercent: 0, yPercent: -50, x: -S, visibility: reduce ? 'hidden' : 'visible' });
    gsap.set('.menu-inner > *, .ml-text, .ml-num', { clearProps: 'all' });

    const tl = gsap.timeline({ onComplete: () => { menuBusy = false; $('.menu-link')?.focus({ preventScroll: true }); } });
    tl.to(st, {
      p: 1, duration: reduce ? .01 : 1.05, ease: 'power2.inOut',
      onUpdate() {
        const edge = -S / 2 + st.p * (W + S);
        menuBg.style.clipPath = `inset(0 ${Math.max(0, W - edge)}px 0 0)`;
        gsap.set(menuPac, { x: edge - S / 2 });
      }
    })
      .set(menuPac, { visibility: 'hidden' })
      .fromTo(menuMazePaths, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', stagger: .1 }, '-=.55')
      .fromTo('.menu-kicker', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: .4 }, '<')
      .fromTo('.ml-text', { yPercent: 115, rotation: 3 }, { yPercent: 0, rotation: 0, duration: .9, ease: 'expo.out', stagger: .08 }, '<')
      .fromTo('.ml-num, .ml-track', { autoAlpha: 0, x: -20 }, { autoAlpha: 1, x: 0, duration: .5, stagger: .06 }, '<+.15')
      .fromTo('.menu-info > *', { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: .6, ease: 'power3.out', stagger: .07 }, '<');
  }

  function closeMenu(after) {
    if (!menuOpen || menuBusy) { if (after && !menuOpen) after(); return; }
    menuBusy = true;
    setBurger(false);
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menú');
    gsap.timeline({
      onComplete() {
        gsap.set(menu, { visibility: 'hidden' });
        menuBg.style.clipPath = 'inset(0 100% 0 0)';
        menu.classList.remove('is-open');
        menu.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('menu-open');
        menuOpen = menuBusy = false;
        lenis?.start();
        if (after) after(); else burger.focus({ preventScroll: true });
      }
    })
      .to('.menu-inner > *', { autoAlpha: 0, y: -24, duration: .3, stagger: .04, ease: 'power2.in' })
      .to(menuMazePaths, { autoAlpha: 0, duration: .25 }, '<')
      .fromTo(menuBg, { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 100% 0%)', duration: .6, ease: 'power3.inOut' }, '-=.1')
      .set(menuMazePaths, { autoAlpha: 1 });
  }

  burger.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));
  addEventListener('keydown', e => { if (e.key === 'Escape' && menuOpen) closeMenu(); });

  // Hover de los enlaces: Pac-Man se come los puntos hasta el texto
  $$('.menu-link').forEach(link => {
    const pac = $('.ml-pac', link), dots = $$('.ml-track i', link), text = $('.ml-text', link);
    let tl;
    link.addEventListener('mouseenter', () => {
      tl?.kill();
      tl = gsap.timeline()
        .set(pac, { autoAlpha: 1, x: 0 })
        .to(pac, { x: 112, duration: .55, ease: 'none' })
        .to(dots, { scale: 0, duration: .05, stagger: .09 }, .05);
      gsap.to(text, { x: 10, duration: .5, ease: 'power3.out' });
    });
    link.addEventListener('mouseleave', () => {
      tl?.kill();
      gsap.to(pac, { autoAlpha: 0, duration: .2 });
      gsap.to(dots, { scale: 1, duration: .3, stagger: .03, ease: 'back.out(3)' });
      gsap.to(text, { x: 0, duration: .5, ease: 'power3.out' });
    });
  });

  // Anclas internas (cierran el menú antes de desplazarse)
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      const target = id === '#top' ? 0 : (id.length > 1 ? $(id) : null);
      if (target === null) return;
      e.preventDefault();
      if (menuOpen) closeMenu(() => scrollToTarget(target));
      else scrollToTarget(target);
    });
  });

  /* ---------- Fantasmas: ojos que siguen al ratón ---------- */
  if (fineHover) {
    let mx = 0, my = 0, raf = 0;
    const look = () => {
      raf = 0;
      $$('.ghost-svg').forEach(svg => {
        const r = svg.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight || r.width === 0) return;
        const a = Math.atan2(my - (r.top + r.height * .45), mx - (r.left + r.width / 2));
        const dx = Math.cos(a) * 1.4, dy = Math.sin(a) * 1.6;
        svg.querySelectorAll('.g-pupil').forEach(p => p.setAttribute('transform', `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`));
      });
    };
    addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; if (!raf) raf = requestAnimationFrame(look); }, { passive: true });
  }

  /* ---------- Fantasmas: flotan y se pueden "comer" ---------- */
  let ghostValue = 200;
  $$('.float-ghost').forEach((g, i) => {
    if (!reduce) {
      gsap.to(g, { y: gsap.utils.random(-22, -10), x: gsap.utils.random(-10, 10), rotation: gsap.utils.random(-8, 8), duration: gsap.utils.random(1.6, 2.6), ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * .2 });
    }
  });
  $$('[data-eat]').forEach(g => {
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', 'Comerse al fantasma');
    g.tabIndex = 0;
    const eat = () => {
      if (g.dataset.eaten) return;
      g.dataset.eaten = '1';
      g.classList.add('ghost-scared');
      const r = g.getBoundingClientRect();
      const pts = document.createElement('span');
      pts.className = 'pts-pop pixel';
      pts.textContent = ghostValue;
      pts.style.left = `${r.left + r.width / 2}px`;
      pts.style.top = `${r.top}px`;
      document.body.appendChild(pts);
      gsap.fromTo(pts, { y: 0, autoAlpha: 1 }, { y: -50, autoAlpha: 0, duration: 1.1, ease: 'power2.out', onComplete: () => pts.remove() });
      addPoints(ghostValue);
      ghostValue = ghostValue >= 1600 ? 200 : ghostValue * 2;
      const svg = g.querySelector('svg');
      gsap.timeline()
        .to(svg, { scale: 1.2, duration: .15, transformOrigin: '50% 50%' })
        .to(svg, { scale: 0, rotation: 200, duration: .35, ease: 'back.in(2)' })
        .add(() => g.classList.remove('ghost-scared'), '+=1.8')
        .to(svg, { scale: 1, rotation: 0, duration: .6, ease: 'elastic.out(1, .5)' })
        .add(() => delete g.dataset.eaten);
    };
    g.addEventListener('click', eat);
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); eat(); } });
  });

  /* ---------- Preloader + entrada del hero ---------- */
  const pre = $('.preloader');
  if (pre && !location.hash) { history.scrollRestoration = 'manual'; window.scrollTo(0, 0); }
  const heroIntroTargets = ['.hero-kicker', '.hero-lead', '.hero-ctas > *', '.hero-meta li'];
  gsap.set(heroIntroTargets, { autoAlpha: 0, y: 30 });
  gsap.set('.ht-word', { yPercent: 115 });
  gsap.set('.ht-script', { clipPath: 'inset(-30% 100% -30% -10%)' });
  gsap.set('.cabinet', { autoAlpha: 0, y: 110, rotationX: 28, transformPerspective: 1000, transformOrigin: '50% 100%' });
  gsap.set('.float-ghost svg', { scale: 0 });
  gsap.set(hud, { yPercent: -120 });
  gsap.set('.brand .logo-svg [pathLength]', { strokeDasharray: 1, strokeDashoffset: 1 });

  function heroIntro() {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.to(hud, { yPercent: 0, duration: 1 })
      .to('.brand .logo-svg [pathLength]', { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', stagger: .04 }, '<')
      .to('.ht-word', { yPercent: 0, duration: 1.2, stagger: .09, clearProps: 'transform' }, '<.1')
      .to('.ht-script', { clipPath: 'inset(-30% -10% -30% -10%)', duration: 1.1, ease: 'power2.inOut' }, '-=.8')
      .to(heroIntroTargets, { autoAlpha: 1, y: 0, duration: 1, stagger: .08 }, '-=.9')
      .to('.cabinet', { autoAlpha: 1, y: 0, rotationX: 0, duration: 1.4 }, '<-.4')
      .to('.float-ghost svg', { scale: 1, duration: .8, ease: 'back.out(2.4)', stagger: .12 }, '-=.9')
      .add(() => $('.ht-script')?.classList.add('flicker'));
  }

  if (pre) {
    const dotsWrap = $('.pre-dots'), prePac = $('.pre-pac'), countEl = $('#preCount');
    for (let i = 0; i < 12; i++) {
      const d = document.createElement('i');
      if (i === 11) d.className = 'big';
      dotsWrap.appendChild(d);
    }
    const preDots = $$('i', dotsWrap);
    const prog = { v: 0 };
    lenis?.stop();
    gsap.timeline({ delay: .2 })
      .to(prog, {
        v: 100, duration: reduce ? .2 : 1.7, ease: 'power1.inOut',
        onUpdate() {
          const w = dotsWrap.offsetWidth;
          const x = (prog.v / 100) * (w - 10);
          prePac.style.transform = `translateX(${x}px)`;
          countEl.textContent = String(Math.round(prog.v)).padStart(2, '0');
          preDots.forEach(d => { if (d.offsetLeft + d.offsetWidth / 2 < x + 30) d.style.visibility = 'hidden'; });
        }
      })
      .to('.pre-ready', { autoAlpha: 1, duration: .01 })
      .to('.pre-ready', { autoAlpha: 0, duration: .01, repeat: 3, yoyo: true, repeatDelay: .12 })
      .to(pre, { clipPath: 'circle(0% at 50% 50%)', duration: .9, ease: 'power3.inOut' }, '+=.15')
      .add(() => { pre.remove(); lenis?.start(); ScrollTrigger.refresh(); }, '-=.1')
      .add(heroIntro, '-=.55');
  } else {
    heroIntro();
  }

  // El hero se aleja un poco al salir
  if (!reduce) {
    gsap.to('.hero-copy', { yPercent: -12, autoAlpha: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-cab', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ---------- Marquesinas infinitas (reseñas) ---------- */
  function marquee(track, { dir = -1, duration = 30 } = {}) {
    if (!track) return null;
    [...track.children].forEach(ch => { const c = ch.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c); });
    const tw = gsap.fromTo(track, { xPercent: dir < 0 ? 0 : -50 }, { xPercent: dir < 0 ? -50 : 0, duration, ease: 'none', repeat: -1 });
    return tw;
  }
  const rvTweens = $$('.rv-row').map(row => {
    const tw = marquee($('.rv-track', row), { dir: +row.dataset.dir, duration: 60 });
    row.addEventListener('mouseenter', () => { row.dataset.hover = '1'; gsap.to(tw, { timeScale: 0, duration: .6 }); });
    row.addEventListener('mouseleave', () => { delete row.dataset.hover; gsap.to(tw, { timeScale: 1, duration: .6 }); });
    return { tw, row };
  });
  if (reduce) { rvTweens.forEach(r => r.tw.pause()); }
  else {
    // La velocidad del scroll acelera las reseñas
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate(self) {
        const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 600, 4);
        rvTweens.forEach(({ tw, row }) => {
          if (row.dataset.hover) return;
          gsap.to(tw, { timeScale: boost, duration: .2, overwrite: true, onComplete: () => gsap.to(tw, { timeScale: 1, duration: 1.2 }) });
        });
      }
    });
  }

  /* ---------- Titulares: líneas que suben ---------- */
  $$('.split').forEach(el => {
    if (reduce) return;
    if (hasSplit) {
      SplitText.create(el, {
        type: 'lines,words', mask: 'lines', linesClass: 'line', autoSplit: true,
        onSplit: self => gsap.from(self.words, { yPercent: 110, rotation: 2, duration: 1.1, ease: 'expo.out', stagger: .04, scrollTrigger: { trigger: el, start: 'top 86%', once: true } })
      });
    } else {
      gsap.from(el, { y: 40, autoAlpha: 0, duration: 1, scrollTrigger: { trigger: el, start: 'top 86%', once: true } });
    }
  });

  $$('.level').forEach(el => {
    gsap.from(el, { autoAlpha: 0, x: -24, duration: .7, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });

  if (!reduce) {
    gsap.set('.reveal-up', { autoAlpha: 0, y: 40 });
    ScrollTrigger.batch('.reveal-up', {
      start: 'top 90%', once: true,
      onEnter: els => gsap.to(els, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .08 })
    });
  }

  /* ---------- Sobre nosotros: collage ---------- */
  if (!reduce) {
    gsap.from('.ph', {
      clipPath: 'inset(100% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut', stagger: .14,
      scrollTrigger: { trigger: '.about-collage', start: 'top 80%', once: true }
    });
    $$('.ph img').forEach((img, i) => {
      gsap.fromTo(img, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    $$('.perk-ghost svg').forEach(svg => {
      gsap.to(svg, { y: -4, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: Math.random() });
    });
  }

  /* ---------- Contadores ---------- */
  $$('.count').forEach(el => {
    const to = parseFloat(el.dataset.to), dec = +(el.dataset.dec || 0);
    const o = { v: 0 };
    const fmt = v => dec ? v.toFixed(dec).replace('.', ',') : Math.round(v).toLocaleString('es-ES');
    if (reduce) { el.textContent = fmt(to); return; }
    gsap.to(o, { v: to, duration: 2, ease: 'power3.out', onUpdate: () => (el.textContent = fmt(o.v)), scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });

  /* ---------- Carta: la pizarra se enciende y los platos entran ---------- */
  if (!reduce) {
    const board = $('.board');
    const tl = gsap.timeline({ scrollTrigger: { trigger: board, start: 'top 78%', once: true } });
    tl.fromTo('.board-main', { autoAlpha: 0, y: 70, scale: .97 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1.1, ease: 'expo.out' })
      .fromTo('.board-side', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .8, ease: 'power3.out', stagger: .1 }, '<.15')
      .fromTo('.bh-logo', { autoAlpha: 0 }, { autoAlpha: 1, duration: .05, repeat: 5, yoyo: true, repeatDelay: .06 }, '-=.6')
      .set('.bh-logo', { autoAlpha: 1 })
      .fromTo('.bh-line', { scaleX: 0, transformOrigin: 'right center' }, { scaleX: 1, duration: .8, ease: 'power3.inOut' }, '<')
      .fromTo('.bh-burgers span', { autoAlpha: 0, y: -16 }, { autoAlpha: 1, y: 0, duration: .5, ease: 'back.out(3)', stagger: .07 }, '<.2')
      .fromTo('.board-tag', { autoAlpha: 0, scale: .6 }, { autoAlpha: 1, scale: 1, duration: .5, ease: 'back.out(2.5)' }, '<');

    gsap.set('.dish, .starters li, .board-pill, .board-title, .board-note, .board-ig', { autoAlpha: 0, y: 24 });
    ScrollTrigger.batch('.dish, .starters li, .board-pill, .board-title, .board-note, .board-ig', {
      start: 'top 92%', once: true,
      onEnter: els => gsap.to(els, { autoAlpha: 1, y: 0, duration: .7, ease: 'power3.out', stagger: .07 })
    });
  }

  const preview = $('.preview');
  if (preview && fineHover) {
    const pImg = $('img', preview);
    const W = 270, H = 338;
    const xTo = gsap.quickTo(preview, 'x', { duration: .55, ease: 'power3' });
    const yTo = gsap.quickTo(preview, 'y', { duration: .55, ease: 'power3' });
    const rTo = gsap.quickTo(preview, 'rotation', { duration: .8, ease: 'power3' });
    let lastX = 0, active = false;
    gsap.set(preview, { scale: .6, xPercent: 0, yPercent: 0 });
    addEventListener('mousemove', e => {
      if (!active) { lastX = e.clientX; return; }
      const left = e.clientX + W + 40 > innerWidth ? e.clientX - W - 30 : e.clientX + 30;
      xTo(left);
      yTo(clamp(e.clientY - H / 2, 12, innerHeight - H - 12));
      rTo(clamp((e.clientX - lastX) * .8, -12, 12));
      lastX = e.clientX;
    }, { passive: true });
    $$('[data-img]').forEach(row => {
      row.addEventListener('mouseenter', e => {
        active = true;
        if (pImg.getAttribute('src') !== row.dataset.img) pImg.src = row.dataset.img;
        preview.style.setProperty('--pc', getComputedStyle(row).getPropertyValue('--c'));
        const left = e.clientX + W + 40 > innerWidth ? e.clientX - W - 30 : e.clientX + 30;
        if (!gsap.getProperty(preview, 'opacity')) { gsap.set(preview, { x: left, y: clamp(e.clientY - H / 2, 12, innerHeight - H - 12) }); }
        gsap.to(preview, { autoAlpha: 1, scale: 1, duration: .45, ease: 'back.out(1.7)', overwrite: 'auto' });
        gsap.fromTo(pImg, { scale: 1.25 }, { scale: 1, duration: .8, ease: 'power3.out' });
      });
      row.addEventListener('mouseleave', () => {
        active = false;
        gsap.to(preview, { autoAlpha: 0, scale: .6, rotation: 0, duration: .3, ease: 'power2.in', overwrite: 'auto' });
      });
    });
  }

  /* ---------- Carrusel 3D ---------- */
  (function ring3d() {
    const stage = $('#ringStage'), ring = $('#ring');
    if (!stage || !ring) return;
    const cards = $$('.ring-card', ring);
    const n = cards.length, step = 360 / n;
    const nameEl = $('#ringName'), idxEl = $('#ringIndex');
    let radius = 0, rot = 0, target = 0, tilt = 10, dragging = false, hover = false, pausedUntil = 0, current = -1;

    cards.forEach(c => c.style.setProperty('--cc', c.dataset.color));

    function layout() {
      const cw = cards[0].offsetWidth;
      radius = Math.round((cw / 2) / Math.tan(Math.PI / n) * 1.22);
      cards.forEach((c, i) => (c.style.transform = `rotateY(${i * step}deg) translateZ(${radius}px)`));
    }
    layout();
    addEventListener('resize', layout);

    function setCaption(i) {
      if (i === current) return;
      current = i;
      const c = cards[i];
      idxEl.textContent = `${String(i + 1).padStart(2, '0')}/${String(n).padStart(2, '0')}`;
      gsap.timeline()
        .to(nameEl, { yPercent: -60, autoAlpha: 0, duration: .15, ease: 'power2.in' })
        .add(() => { nameEl.textContent = c.dataset.name; nameEl.style.color = c.dataset.color; })
        .fromTo(nameEl, { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: .35, ease: 'back.out(2)' });
    }

    function render() {
      rot += (target - rot) * 0.08;
      ring.style.transform = `translateZ(${-radius}px) rotateX(${tilt}deg) rotateY(${rot}deg)`;
      let best = 0, bestA = 999;
      cards.forEach((c, i) => {
        let a = ((i * step + rot) % 360 + 540) % 360 - 180; // -180..180, 0 = de frente
        const abs = Math.abs(a);
        if (abs < bestA) { bestA = abs; best = i; }
        c.style.filter = `brightness(${(1 - abs / 180 * .75).toFixed(3)}) saturate(${(1 - abs / 180 * .5).toFixed(3)})`;
        c.style.zIndex = String(360 - Math.round(abs));
      });
      setCaption(best);
    }

    gsap.ticker.add((t, dt) => {
      if (!dragging && !hover && !reduce && performance.now() > pausedUntil) target -= 0.012 * dt;
      render();
    });

    const snapTo = (dir) => {
      pausedUntil = performance.now() + 4000;
      target = (Math.round(target / step) + dir) * step;
    };
    $('#ringPrev')?.addEventListener('click', () => snapTo(1));
    $('#ringNext')?.addEventListener('click', () => snapTo(-1));

    let sx = 0, st = 0, lastX = 0, lastT = 0, vel = 0;
    stage.addEventListener('pointerdown', e => {
      dragging = true; stage.classList.add('dragging');
      sx = lastX = e.clientX; st = target; lastT = performance.now(); vel = 0;
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener('pointermove', e => {
      if (!dragging) return;
      const now = performance.now();
      vel = (e.clientX - lastX) / Math.max(1, now - lastT);
      lastX = e.clientX; lastT = now;
      target = st + (e.clientX - sx) * 0.3;
    });
    const end = () => {
      if (!dragging) return;
      dragging = false; stage.classList.remove('dragging');
      target += vel * 160;
      target = Math.round(target / step) * step;
      pausedUntil = performance.now() + 2500;
    };
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);
    stage.addEventListener('mouseenter', () => (hover = true));
    stage.addEventListener('mouseleave', () => (hover = false));

    // Inclinación ligada al scroll y entrada en escena
    const tiltObj = { v: 16 };
    gsap.to(tiltObj, { v: -6, ease: 'none', onUpdate: () => (tilt = tiltObj.v), scrollTrigger: { trigger: stage, start: 'top bottom', end: 'bottom top', scrub: true } });
    if (!reduce) {
      gsap.from(stage, { scale: .6, autoAlpha: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: stage, start: 'top 80%', once: true }, onStart: () => { target -= 180; } });
      gsap.fromTo('.ring-ui > *', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .8, stagger: .1, ease: 'back.out(2)', scrollTrigger: { trigger: '.ring-ui', start: 'top 95%', once: true } });
    }
  })();

  /* ---------- Cómo trabajamos: laberinto con Pac-Man ---------- */
  (function mazeRun() {
    const maze = $('#maze');
    if (!maze) return;
    const svg = $('.maze-svg', maze), wall = $('.maze-wall', maze), floor = $('.maze-floor', maze);
    const dotsG = $('.maze-dots', maze), pac = $('.maze-pac', maze), steps = $$('.step', maze);
    const NS = 'http://www.w3.org/2000/svg';
    let segs = [], total = 0, dots = [], stepAt = [], lastL = -1;

    function pointAt(l) {
      for (const s of segs) {
        if (l <= s.end) {
          const t = s.len ? (l - s.start) / s.len : 0;
          return { x: s.x1 + (s.x2 - s.x1) * t, y: s.y1 + (s.y2 - s.y1) * t, dx: Math.sign(s.x2 - s.x1), dy: Math.sign(s.y2 - s.y1) };
        }
      }
      const s = segs[segs.length - 1];
      return { x: s.x2, y: s.y2, dx: Math.sign(s.x2 - s.x1), dy: Math.sign(s.y2 - s.y1) };
    }

    function build() {
      const W = maze.clientWidth, H = maze.clientHeight;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const mobile = matchMedia('(max-width: 760px)').matches;
      const cx = W / 2;
      const ys = steps.map(s => s.offsetTop + s.offsetHeight / 2);
      const laneX = i => mobile ? 26 : cx + (i % 2 === 0 ? -34 : 34);
      const pts = [[laneX(0), 0]];
      ys.forEach((y, i) => {
        pts.push([laneX(i), y]);
        if (i < ys.length - 1) {
          const mid = (y + ys[i + 1]) / 2;
          pts.push([laneX(i), mid]);
          if (laneX(i) !== laneX(i + 1)) pts.push([laneX(i + 1), mid]);
        }
      });
      pts.push([laneX(ys.length - 1), H]);

      // Segmentos y longitudes del recorrido
      segs = []; total = 0; stepAt = [];
      for (let i = 1; i < pts.length; i++) {
        const [x1, y1] = pts[i - 1], [x2, y2] = pts[i];
        const len = Math.hypot(x2 - x1, y2 - y1);
        if (!len) continue;
        segs.push({ x1, y1, x2, y2, len, start: total, end: total + len });
        total += len;
        const si = ys.indexOf(y2);
        if (si > -1 && x2 === laneX(si) && stepAt[si] === undefined) stepAt[si] = total;
      }

      // Pasillo + ramales hasta cada tarjeta
      let d = 'M' + pts.map(p => p.join(' ')).join(' L');
      steps.forEach((s, i) => {
        const edge = mobile ? s.offsetLeft : (i % 2 === 0 ? s.offsetLeft + s.offsetWidth : s.offsetLeft);
        d += ` M${laneX(i)} ${ys[i]} H${edge}`;
      });
      wall.setAttribute('d', d);
      floor.setAttribute('d', d);

      // Puntos y píldoras de poder
      dotsG.innerHTML = '';
      dots = [];
      const gap = 26;
      const pellets = stepAt.map(v => v);
      for (let l = 20; l < total - 10; l += gap) {
        if (pellets.some(p => Math.abs(p - l) < gap * .6)) continue;
        const p = pointAt(l);
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); c.setAttribute('r', 3);
        dotsG.appendChild(c);
        dots.push({ el: c, l });
      }
      pellets.forEach(l => {
        const p = pointAt(l);
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); c.setAttribute('r', 8);
        c.setAttribute('class', 'pellet');
        dotsG.appendChild(c);
        dots.push({ el: c, l, pellet: true });
      });
      lastL = -1;
      place(currentP * total);
    }

    let currentP = 0;
    function place(l) {
      const p = pointAt(l);
      const rot = p.dy > 0 ? 90 : p.dy < 0 ? -90 : 0;
      gsap.set(pac, { x: p.x, y: p.y, rotation: p.dx < 0 ? 0 : rot, scaleX: p.dx < 0 ? -1 : 1 });
      if (l === lastL) return;
      lastL = l;
      dots.forEach(d => (d.el.style.visibility = d.l <= l + 6 ? 'hidden' : 'visible'));
      steps.forEach((s, i) => {
        const on = l >= (stepAt[i] ?? Infinity) - 8;
        if (on && !s.classList.contains('is-on')) {
          s.classList.add('is-on');
          addPoints(50);
          if (!reduce) gsap.fromTo(s, { scale: 1 }, { scale: 1.03, duration: .18, yoyo: true, repeat: 1, ease: 'power2.out' });
        } else if (!on) s.classList.remove('is-on');
      });
    }

    build();
    ScrollTrigger.addEventListener('refresh', build);

    ScrollTrigger.create({
      trigger: maze, start: 'top 60%', end: 'bottom 60%', scrub: .6,
      onUpdate(self) { currentP = self.progress; place(self.progress * total); }
    });

    if (!reduce) {
      steps.forEach((s, i) => {
        const mobile = matchMedia('(max-width: 760px)').matches;
        gsap.fromTo(s, { autoAlpha: 0, x: mobile ? 40 : (i % 2 === 0 ? -60 : 60) }, { autoAlpha: 1, x: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: s, start: 'top 85%', once: true } });
      });
    }
  })();

  /* ---------- CTA redes: CONTINUE? ---------- */
  (function continueBlock() {
    const box = $('#continue');
    if (!box) return;
    const cd = $('#countdown');
    let n = 9, timer = null;
    const tick = () => {
      n = n <= 0 ? 9 : n - 1;
      cd.textContent = n;
      gsap.fromTo(cd, { scale: 1.8, color: '#ffe02e' }, { scale: 1, color: '#ff3f4f', duration: .5, ease: 'power3.out' });
    };
    ScrollTrigger.create({
      trigger: box, start: 'top 85%', end: 'bottom top',
      onToggle: self => { clearInterval(timer); if (self.isActive && !reduce) timer = setInterval(tick, 1000); }
    });

    if (!reduce) {
      const tl = gsap.timeline({ scrollTrigger: { trigger: box, start: 'top 78%', once: true } });
      tl.fromTo(box, { y: 80, scale: .95, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 1.1, ease: 'expo.out' })
        .fromTo('.continue-kicker', { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, duration: .6 }, '-=.6')
        .fromTo('.continue-copy > p:not(.continue-kicker)', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .6 }, '-=.3')
        .fromTo('.continue-ctas > *', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .6, stagger: .1, ease: 'back.out(2)' }, '-=.3')
        .fromTo('.insta-grid img', { scale: .4, autoAlpha: 0, rotation: () => gsap.utils.random(-20, 20) }, { scale: 1, autoAlpha: 1, rotation: 0, duration: .9, ease: 'back.out(1.6)', stagger: .1 }, '-=1')
        .fromTo('.insta-badge', { xPercent: -50, yPercent: -50, scale: 0, rotation: -40 }, { xPercent: -50, yPercent: -50, scale: 1, rotation: -6, duration: .8, ease: 'elastic.out(1, .5)' }, '-=.3');

      if (fineHover) {
        const grid = $('.insta-grid');
        const rx = gsap.quickTo(grid, 'rotationX', { duration: .6, ease: 'power3' });
        const ry = gsap.quickTo(grid, 'rotationY', { duration: .6, ease: 'power3' });
        gsap.set(grid, { transformPerspective: 900 });
        box.addEventListener('mousemove', e => {
          const r = box.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - .5) * 16);
          rx(-((e.clientY - r.top) / r.height - .5) * 12);
        });
        box.addEventListener('mouseleave', () => { rx(0); ry(0); });
      }
    }
  })();

  /* ---------- Reseñas ---------- */
  if (!reduce) {
    gsap.to('.sb-fill', { width: '96%', duration: 1.8, ease: 'power3.out', scrollTrigger: { trigger: '.score-board', start: 'top 80%', once: true } });
    gsap.from('.score-board', { autoAlpha: 0, y: 60, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.score-board', start: 'top 85%', once: true } });
    const lt = gsap.timeline({ scrollTrigger: { trigger: '.leader', start: 'top 82%', once: true } });
    $$('.leader li').forEach((li, i) => {
      lt.from(li, { autoAlpha: 0, x: -30, duration: .5, ease: 'power3.out' }, i * .14)
        .from($('.ld-quote', li), { clipPath: 'inset(0 100% 0 0)', duration: .8, ease: 'steps(24)' }, i * .14 + .15)
        .from($('.ld-stars', li), { autoAlpha: 0, scale: 1.6, duration: .4, ease: 'back.out(3)' }, i * .14 + .5);
    });
    gsap.from('.rv-row', { autoAlpha: 0, x: i => (i ? -120 : 120), duration: 1.2, ease: 'expo.out', stagger: .15, scrollTrigger: { trigger: '.rv-rows', start: 'top 90%', once: true } });
  } else {
    gsap.set('.sb-fill', { width: '96%' });
  }

  /* ---------- Visítanos ---------- */
  if (!reduce) {
    gsap.from('.visit-info, .visit-map', { autoAlpha: 0, y: 60, duration: 1.1, ease: 'expo.out', stagger: .15, scrollTrigger: { trigger: '.visit-grid', start: 'top 85%', once: true } });
    gsap.from('.vi-row, .visit-ctas', { autoAlpha: 0, x: -20, duration: .6, stagger: .08, scrollTrigger: { trigger: '.visit-info', start: 'top 80%', once: true } });
  }

  /* ---------- Vídeo ---------- */
  const vid = $('.hero-video');
  if (vid) {
    if (reduce) vid.pause();
    else vid.play?.().catch(() => {});
    // Fuera de pantalla, el vídeo se pausa para no gastar batería
    ScrollTrigger.create({ trigger: '.hero', start: 'top bottom', end: 'bottom top', onToggle: s => { if (reduce) return; s.isActive ? vid.play?.().catch(() => {}) : vid.pause(); } });
  }

  addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
