// Krishmal Dinidu — "Engineer the Future"
// GSAP, ScrollTrigger, Lenis and EmailJS are loaded as globals before this file.
(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    const hasGsap = !!(gsap && ScrollTrigger);

    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
    const pad = (n, len = 2) => String(n).padStart(len, '0');

    if (hasGsap) gsap.registerPlugin(ScrollTrigger);

    /* =====================================================
       Smooth scroll
       ===================================================== */
    let lenis = null;
    if (hasGsap && window.Lenis && !reduceMotion) {
        lenis = new window.Lenis({ lerp: 0.1 });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(t => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
    }

    function scrollToY(y) {
        if (lenis) lenis.scrollTo(y, { duration: 1.4 });
        else window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
    }

    $$('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const target = document.querySelector(a.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            scrollToY(target.getBoundingClientRect().top + window.scrollY);
        });
    });

    /* =====================================================
       Hero — halftone dot text that reacts to the pointer
       ===================================================== */
    const dotCanvas = $('#dot-text');
    const dotCtx = dotCanvas.getContext('2d');
    let dots = [];
    let dotsReady = false;
    let dotsAssembled = false;
    const pointer = { x: -9999, y: -9999 };

    function buildDots() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = dotCanvas.clientWidth;
        const h = dotCanvas.clientHeight;
        if (!w || !h) return;
        dotCanvas.width = w * dpr;
        dotCanvas.height = h * dpr;
        dotCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const lines = w < 640 ? ['ENGINEER', 'THE FUTURE'] : ['ENGINEER THE FUTURE'];
        const off = document.createElement('canvas');
        off.width = w;
        off.height = h;
        const o = off.getContext('2d');
        const family = '"Plus Jakarta Sans", sans-serif';

        // Fit the longest line to the width, then clamp by height
        o.font = `800 100px ${family}`;
        const widest = Math.max(...lines.map(l => o.measureText(l).width));
        let size = Math.min((w * 0.98 / widest) * 100, (h / lines.length) * 0.9);
        o.font = `800 ${size}px ${family}`;
        o.textAlign = 'center';
        o.textBaseline = 'middle';
        o.fillStyle = '#fff';
        const lineH = size * 1.02;
        lines.forEach((l, i) => o.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * lineH));

        const gap = Math.max(4, Math.round(size / 18));
        const data = o.getImageData(0, 0, w, h).data;
        const prev = dots;
        dots = [];
        for (let y = gap / 2; y < h; y += gap) {
            for (let x = gap / 2; x < w; x += gap) {
                if (data[(Math.floor(y) * w + Math.floor(x)) * 4 + 3] > 140) {
                    const start = dotsAssembled || reduceMotion
                        ? { x, y }
                        : { x: x + (Math.random() - 0.5) * w * 0.6, y: y + (Math.random() - 0.5) * h * 3 };
                    dots.push({ ox: x, oy: y, x: start.x, y: start.y, vx: 0, vy: 0 });
                }
            }
        }
        dots.r = gap * 0.34;
        dots.h = h;
        dotsReady = true;
        root.classList.add('has-dots');
        if (!prev.length && reduceMotion) drawDots();
    }

    function stepDots() {
        const R = 75;
        const active = dotsAssembled;
        for (const d of dots) {
            if (active) {
                const dx = d.x - pointer.x;
                const dy = d.y - pointer.y;
                const dist2 = dx * dx + dy * dy;
                if (dist2 < R * R) {
                    const dist = Math.sqrt(dist2) || 1;
                    const force = (1 - dist / R) * 4;
                    d.vx += (dx / dist) * force;
                    d.vy += (dy / dist) * force;
                }
            }
            const k = active ? 0.07 : 0.035;
            d.vx += (d.ox - d.x) * k;
            d.vy += (d.oy - d.y) * k;
            d.vx *= 0.8;
            d.vy *= 0.8;
            d.x += d.vx;
            d.y += d.vy;
        }
    }

    function drawDots() {
        const w = dotCanvas.clientWidth;
        const h = dotCanvas.clientHeight;
        dotCtx.clearRect(0, 0, w, h);
        const grad = dotCtx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#fafafa');
        grad.addColorStop(1, '#6b6b73');
        dotCtx.fillStyle = grad;
        dotCtx.beginPath();
        const r = dots.r;
        for (const d of dots) {
            dotCtx.moveTo(d.x + r, d.y);
            dotCtx.arc(d.x, d.y, r, 0, Math.PI * 2);
        }
        dotCtx.fill();

        // Red highlight near the pointer
        if (dotsAssembled && pointer.x > -999) {
            const g = dotCtx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 140);
            g.addColorStop(0, 'rgba(239,43,59,0.9)');
            g.addColorStop(1, 'rgba(239,43,59,0)');
            dotCtx.globalCompositeOperation = 'source-atop';
            dotCtx.fillStyle = g;
            dotCtx.fillRect(0, 0, w, h);
            dotCtx.globalCompositeOperation = 'source-over';
        }
    }

    const dotWrap = $('.dot-wrap');
    dotWrap.addEventListener('pointermove', e => {
        const r = dotCanvas.getBoundingClientRect();
        pointer.x = e.clientX - r.left;
        pointer.y = e.clientY - r.top;
    });
    dotWrap.addEventListener('pointerleave', () => { pointer.x = pointer.y = -9999; });

    /* =====================================================
       Hero — dotted globe with a red rim
       ===================================================== */
    const globe = $('#globe');
    const gctx = globe.getContext('2d');
    let globePts = [];
    let gW = 0;
    let gH = 0;
    let rotY = 0;
    let tiltTarget = 0;
    let tilt = 0;

    // Small value-noise so the dots form continent-like patches
    function hash(x, y, z) {
        let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 1274126177);
        h = Math.imul(h ^ (h >>> 13), 1274126177);
        return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
    }
    function noise3(x, y, z) {
        const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
        const xf = x - xi, yf = y - yi, zf = z - zi;
        const s = t => t * t * (3 - 2 * t);
        const u = s(xf), v = s(yf), w = s(zf);
        const lerp = (a, b, t) => a + (b - a) * t;
        const c = (dx, dy, dz) => hash(xi + dx, yi + dy, zi + dz);
        return lerp(
            lerp(lerp(c(0, 0, 0), c(1, 0, 0), u), lerp(c(0, 1, 0), c(1, 1, 0), u), v),
            lerp(lerp(c(0, 0, 1), c(1, 0, 1), u), lerp(c(0, 1, 1), c(1, 1, 1), u), v),
            w);
    }
    function fbm(x, y, z) {
        return noise3(x, y, z) * 0.6 + noise3(x * 2.1, y * 2.1, z * 2.1) * 0.3 + noise3(x * 4.3, y * 4.3, z * 4.3) * 0.1;
    }

    function buildGlobe() {
        const small = window.innerWidth < 700;
        const N = small ? 12000 : 26000;
        const golden = Math.PI * (3 - Math.sqrt(5));
        const cands = [];
        for (let i = 0; i < N; i++) {
            const y = 1 - (i / (N - 1)) * 2;
            const r = Math.sqrt(1 - y * y);
            const t = golden * i;
            const p = [Math.cos(t) * r, y, Math.sin(t) * r];
            cands.push({ p, n: fbm(p[0] * 1.7 + 11, p[1] * 1.7 + 3, p[2] * 1.7 + 7) });
        }
        const sorted = cands.map(c => c.n).sort((a, b) => a - b);
        const threshold = sorted[Math.floor(sorted.length * 0.5)];
        globePts = cands.filter(c => c.n > threshold).map(c => c.p);
    }

    function sizeGlobe() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        gW = globe.clientWidth;
        gH = globe.clientHeight;
        globe.width = gW * dpr;
        globe.height = gH * dpr;
        gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawGlobe() {
        const R = Math.min(gW * 0.46, 640, gH * 0.75);
        const cx = gW / 2;
        const cy = gH + R * 0.42;
        gctx.clearRect(0, 0, gW, gH);

        // Atmosphere glow
        const atm = gctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.3);
        atm.addColorStop(0, 'rgba(239,43,59,0)');
        atm.addColorStop(0.12, 'rgba(239,43,59,0.35)');
        atm.addColorStop(0.45, 'rgba(239,43,59,0.08)');
        atm.addColorStop(1, 'rgba(239,43,59,0)');
        gctx.fillStyle = atm;
        gctx.fillRect(0, 0, gW, gH);

        // Planet body
        const body = gctx.createRadialGradient(cx, cy - R * 0.6, R * 0.1, cx, cy, R);
        body.addColorStop(0, '#120405');
        body.addColorStop(1, '#000');
        gctx.fillStyle = body;
        gctx.beginPath();
        gctx.arc(cx, cy, R, 0, Math.PI * 2);
        gctx.fill();

        // Dots, bucketed by depth so each bucket is one fill
        const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
        const tx = 0.42 + tilt;
        const cosX = Math.cos(tx), sinX = Math.sin(tx);
        const buckets = [[], [], [], []];
        for (const [x, y, z] of globePts) {
            const x1 = x * cosY + z * sinY;
            const z1 = -x * sinY + z * cosY;
            const y2 = y * cosX - z1 * sinX;
            const z2 = y * sinX + z1 * cosX;
            if (z2 <= 0.02) continue;
            const sy = cy - y2 * R;
            if (sy > gH + 4) continue;
            buckets[Math.min(3, Math.floor(z2 * 4))].push(cx + x1 * R, sy);
        }
        const dotR = Math.max(1, R / 380);
        buckets.forEach((b, i) => {
            gctx.fillStyle = `rgba(228,228,231,${0.18 + i * 0.2})`;
            gctx.beginPath();
            const r = dotR * (0.7 + i * 0.25);
            for (let j = 0; j < b.length; j += 2) {
                gctx.moveTo(b[j] + r, b[j + 1]);
                gctx.arc(b[j], b[j + 1], r, 0, Math.PI * 2);
            }
            gctx.fill();
        });

        // Glowing rim
        gctx.save();
        gctx.shadowColor = 'rgba(239,43,59,0.9)';
        gctx.shadowBlur = 30;
        gctx.strokeStyle = 'rgba(239,43,59,0.85)';
        gctx.lineWidth = 1.5;
        gctx.beginPath();
        gctx.arc(cx, cy, R, Math.PI * 1.05, Math.PI * 1.95);
        gctx.stroke();
        gctx.restore();
    }

    $('.hero').addEventListener('pointermove', e => {
        tiltTarget = ((e.clientY / window.innerHeight) - 0.5) * 0.12;
    });

    /* =====================================================
       Hero render loop (paused when off-screen)
       ===================================================== */
    let heroVisible = true;
    new IntersectionObserver(([en]) => { heroVisible = en.isIntersecting; }).observe($('.hero'));

    function heroFrame() {
        requestAnimationFrame(heroFrame);
        if (!heroVisible) return;
        if (!reduceMotion) rotY += 0.0016;
        tilt += (tiltTarget - tilt) * 0.05;
        drawGlobe();
        if (dotsReady) {
            if (!reduceMotion) stepDots();
            drawDots();
        }
    }

    buildGlobe();
    sizeGlobe();
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { sizeGlobe(); buildDots(); }, 150);
    });

    const fontReady = document.fonts ? document.fonts.load('800 100px "Plus Jakarta Sans"') : Promise.resolve();
    fontReady.catch(() => { }).then(() => {
        buildDots();
        heroFrame();
    });

    /* =====================================================
       Loader + intro
       ===================================================== */
    const loader = $('#loader');

    function intro() {
        dotsAssembled = true;
        if (!hasGsap) return;
        gsap.timeline({ defaults: { ease: 'expo.out' } })
            .from('.wordmark', { y: 30, opacity: 0, duration: 1.4 })
            .from('.hero-sub', { y: 16, opacity: 0, duration: 1 }, 0.4)
            .from('.globe', { opacity: 0, y: 80, duration: 2 }, 0)
            .from('#topbar', { opacity: 0, duration: 1 }, 0.3)
            .from('#dock', { y: 100, opacity: 0, duration: 1.2 }, 0.5)
            .from('.hud', { opacity: 0, scale: 0.8, duration: 1 }, 0.7);
    }

    if (!hasGsap) {
        loader.remove();
        intro();
    } else {
        loader.style.animation = 'none';
        document.body.classList.add('is-loading');
        lenis?.stop();
        const arc = $('#loader-arc');
        const pctEl = $('#loader-pct');
        const CIRC = 326.7;
        const p = { v: 0 };
        gsap.timeline({
            onComplete: () => {
                loader.remove();
                document.body.classList.remove('is-loading');
                lenis?.start();
                ScrollTrigger.refresh();
            },
        })
            .to(p, {
                v: 100,
                duration: reduceMotion ? 0.2 : 1.4,
                ease: 'power2.inOut',
                onUpdate: () => {
                    arc.style.strokeDashoffset = CIRC * (1 - p.v / 100);
                    pctEl.textContent = `${pad(Math.round(p.v), 3)}%`;
                },
            })
            .to('.loader-ring, .loader-pct', { scale: 0.85, opacity: 0, duration: 0.45, ease: 'power2.in' }, '+=0.1')
            .to(loader, { opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.1')
            .add(intro, '-=0.6');
    }

    /* =====================================================
       HUD progress dial
       ===================================================== */
    const hudArc = $('#hud-arc');
    const hudNeedle = $('#hud-needle');
    const hudPct = $('#hud-pct');
    const HUD_CIRC = 238.8;

    function setHud(progress) {
        hudArc.style.strokeDashoffset = HUD_CIRC * (1 - progress);
        hudNeedle.style.transform = `rotate(${progress * 360}deg)`;
        hudPct.innerHTML = `${pad(Math.round(progress * 100), 3)}<small>%</small>`;
    }

    /* =====================================================
       Scroll-driven behaviour
       ===================================================== */
    if (hasGsap) {
        ScrollTrigger.create({
            start: 0,
            end: 'max',
            onUpdate: self => setHud(self.progress),
        });

        // Top bar hides on the way down
        const topbar = $('#topbar');
        ScrollTrigger.create({
            start: 0,
            end: 'max',
            onUpdate: self => topbar.classList.toggle('is-hidden', self.direction === 1 && self.scroll() > 200),
        });

        // Dock active state
        const dockMap = { home: 'home', about: 'about', capabilities: 'capabilities', technology: 'capabilities', projects: 'projects', writing: 'projects', journey: 'about', contact: 'contact' };
        $$('main > section[id]').forEach(sec => {
            ScrollTrigger.create({
                trigger: sec,
                start: 'top 55%',
                end: 'bottom 55%',
                onToggle: self => {
                    if (!self.isActive) return;
                    const key = dockMap[sec.id];
                    $$('.dock a').forEach(a => a.classList.toggle('active', a.hash === `#${key}`));
                },
            });
        });

        // Generic reveals
        ScrollTrigger.batch('.reveal', {
            start: 'top 88%',
            once: true,
            onEnter: batch => gsap.from(batch, { y: 40, opacity: 0, duration: 1.1, stagger: 0.08, ease: 'expo.out' }),
        });

        // Counters
        $$('[data-count]').forEach(el => {
            const end = Number(el.dataset.count);
            const obj = { v: Number(el.dataset.from || 0) };
            el.textContent = obj.v;
            gsap.to(obj, {
                v: end,
                duration: 1.8,
                ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 90%', once: true },
                onUpdate: () => { el.textContent = Math.round(obj.v); },
            });
        });

        // Parallax on the giant footer word
        gsap.from('.giant', {
            yPercent: 30,
            ease: 'none',
            scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'bottom bottom', scrub: true },
        });

        const mm = gsap.matchMedia();

        // Capabilities: pinned, one line at a time
        mm.add('(min-width: 768px)', () => {
            const items = $$('#caps-list li');
            const list = $('#caps-list');
            const desc = $('#caps-desc');
            const idxEl = $('#caps-idx');
            $('#caps-total').textContent = pad(items.length);
            let current = -1;

            function setCap(i) {
                if (i === current) return;
                current = i;
                items.forEach((li, j) => {
                    li.classList.toggle('active', j === i);
                    li.classList.toggle('past', j < i);
                });
                const step = items[0].offsetHeight;
                gsap.to(list, { y: -Math.max(0, i - 1) * step, duration: 0.8, ease: 'expo.out' });
                idxEl.textContent = pad(i + 1);
                gsap.to(desc, {
                    opacity: 0, y: 8, duration: 0.2, onComplete: () => {
                        desc.textContent = items[i].dataset.desc;
                        gsap.to(desc, { opacity: 1, y: 0, duration: 0.4 });
                    },
                });
            }
            setCap(0);

            ScrollTrigger.create({
                trigger: '#caps-pin',
                start: 'top top',
                end: () => `+=${window.innerHeight * (items.length - 1) * 0.6}`,
                pin: true,
                onUpdate: self => setCap(Math.min(items.length - 1, Math.floor(self.progress * items.length))),
            });

            return () => { gsap.set(list, { y: 0 }); items.forEach(li => li.classList.remove('past')); };
        });

        // Projects: pinned showcase on large screens
        mm.add('(min-width: 1024px) and (min-height: 640px)', () => {
            const section = $('.projects');
            const projs = $$('.proj');
            const dotsWrap = $('#proj-dots');
            section.classList.add('showcase');
            dotsWrap.innerHTML = projs.map((_, i) => `<button type="button" aria-label="Project ${i + 1}"></button>`).join('');
            const dotBtns = $$('button', dotsWrap);
            let current = -1;

            function setProj(i) {
                if (i === current) return;
                current = i;
                projs.forEach((p, j) => p.classList.toggle('active', j === i));
                dotBtns.forEach((b, j) => b.classList.toggle('on', j === i));
            }
            setProj(0);

            const st = ScrollTrigger.create({
                trigger: '#proj-pin',
                start: 'top top',
                end: () => `+=${window.innerHeight * (projs.length - 1) * 0.7}`,
                pin: true,
                onUpdate: self => setProj(Math.min(projs.length - 1, Math.floor(self.progress * projs.length))),
            });

            dotBtns.forEach((b, i) => b.addEventListener('click', () => {
                scrollToY(st.start + (st.end - st.start) * ((i + 0.5) / projs.length));
            }));

            return () => {
                section.classList.remove('showcase');
                projs.forEach(p => p.classList.add('active'));
            };
        });
    } else {
        $$('.proj').forEach(p => p.classList.add('active'));
    }

    // Desktop / mobile preview toggle
    $$('.view-toggle button').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.view-toggle button').forEach(b => b.classList.toggle('on', b === btn));
            $('.projects').classList.toggle('view-mobile', btn.dataset.view === 'mobile');
        });
    });

    /* =====================================================
       Technology tabs
       ===================================================== */
    const tabs = $$('.tabs [role="tab"]');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.setAttribute('aria-selected', String(t === tab)));
            $$('.tech-grid').forEach(p => p.classList.toggle('active', p.dataset.panel === tab.dataset.tab));
            const panel = $(`.tech-grid[data-panel="${tab.dataset.tab}"]`);
            if (hasGsap && !reduceMotion) {
                gsap.from(panel.children, { y: 20, opacity: 0, duration: 0.6, stagger: 0.04, ease: 'expo.out' });
            }
        });
    });

    /* =====================================================
       Writing — 3D carousel
       ===================================================== */
    const track = $('.carousel-track');
    const cards = $$('.c-card', track);
    const countEl = $('#c-count');
    let cIndex = 0;

    function layoutCarousel() {
        const n = cards.length;
        const narrow = window.innerWidth < 700;
        cards.forEach((card, i) => {
            let off = i - cIndex;
            if (off > n / 2) off -= n;
            if (off < -n / 2) off += n;
            const abs = Math.abs(off);
            const x = off * (narrow ? 70 : 62);
            card.style.transform = `translateX(${x}%) translateZ(${-abs * 160}px) rotateY(${-off * 26}deg)`;
            card.style.opacity = abs > 1.5 ? 0 : 1 - abs * 0.35;
            card.style.filter = abs ? 'brightness(0.55)' : 'none';
            card.style.zIndex = String(10 - abs);
            card.style.pointerEvents = abs > 1.5 ? 'none' : 'auto';
            card.classList.toggle('is-center', off === 0);
            card.tabIndex = off === 0 ? 0 : -1;
        });
        countEl.textContent = `${pad(cIndex + 1)} / ${pad(cards.length)}`;
    }

    function go(delta) {
        cIndex = (cIndex + delta + cards.length) % cards.length;
        layoutCarousel();
    }

    $('#c-prev').addEventListener('click', () => go(-1));
    $('#c-next').addEventListener('click', () => go(1));
    $('#carousel').addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') go(-1);
        if (e.key === 'ArrowRight') go(1);
    });

    // Side cards bring themselves to the centre instead of opening
    cards.forEach((card, i) => {
        card.addEventListener('click', e => {
            if (dragMoved) { e.preventDefault(); return; }
            if (i !== cIndex) {
                e.preventDefault();
                cIndex = i;
                layoutCarousel();
            }
        });
    });

    // Drag / swipe
    let dragX = null;
    let dragMoved = false;
    track.addEventListener('pointerdown', e => {
        dragX = e.clientX;
        dragMoved = false;
    });
    window.addEventListener('pointermove', e => {
        if (dragX === null) return;
        if (Math.abs(e.clientX - dragX) > 8) {
            dragMoved = true;
            track.classList.add('dragging');
        }
    });
    window.addEventListener('pointerup', e => {
        if (dragX === null) return;
        const dx = e.clientX - dragX;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        dragX = null;
        track.classList.remove('dragging');
        setTimeout(() => { dragMoved = false; }, 0);
    });

    layoutCarousel();
    window.addEventListener('resize', layoutCarousel);

    /* =====================================================
       Contact — copy, toast, EmailJS form
       ===================================================== */
    $('#year').textContent = new Date().getFullYear();

    const toast = $('#toast');
    let toastTimer;
    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
    }

    $('#copy-email').addEventListener('click', async e => {
        try {
            await navigator.clipboard.writeText(e.currentTarget.dataset.email);
            showToast('Email copied');
        } catch (err) {
            showToast('Copy failed — select it manually');
        }
    });

    const form = $('#contact-form');
    const submitBtn = $('#submitBtn');
    const result = $('#form-result');
    if (window.emailjs) window.emailjs.init('zL7dP-8yzWJMUEDQ-');

    function setResult(msg, type) {
        result.textContent = msg;
        result.className = 'result mono' + (type ? ' ' + type : '');
    }

    $$('input, textarea', form).forEach(f => f.addEventListener('input', () => f.classList.remove('invalid')));

    form.addEventListener('submit', e => {
        e.preventDefault();
        const bad = $$('[required]', form).filter(f => !f.checkValidity());
        bad.forEach(f => f.classList.add('invalid'));
        if (bad.length) {
            setResult('Please fill in every field with a valid email.', 'err');
            bad[0].focus();
            return;
        }
        if (!window.emailjs) {
            setResult('Mail service unavailable — email me directly.', 'err');
            return;
        }

        $('#hidden_timestamp').value = new Date().toLocaleString();
        $('#hidden_id').value = 'BT24-' + Math.random().toString(36).substring(2, 9).toUpperCase();

        const label = $('span', submitBtn);
        submitBtn.disabled = true;
        label.textContent = 'Sending…';
        setResult('');

        window.emailjs.sendForm('service_pvsqtdk', 'template_1fjcepl', form)
            .then(() => {
                setResult("Message sent — I'll get back to you soon.", 'ok');
                form.reset();
            }, err => {
                console.error('EmailJS error:', err);
                setResult('Something went wrong. Try again or email me directly.', 'err');
            })
            .finally(() => {
                submitBtn.disabled = false;
                label.textContent = 'Send message';
            });
    });
})();
