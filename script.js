/**
 * İleri Seviye Apple-Esintili Kişisel Portfolyo — Vanilla JavaScript
 */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const supportsHover = window.matchMedia('(hover: hover)').matches;
  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // Statik file:// açılışında veya desteklenmeyen ortamlarda sessizce devam et.
    });
  }

  /* ==========================================================================
     1. DARK / LIGHT MODE YÖNETİMİ (localStorage + Sistem Tercihi)
     ========================================================================== */
  const htmlEl = document.documentElement;
  const themeToggleBtn = document.getElementById('theme-toggle');
  const THEME_KEY = 'portfolio_pro_theme';

  const getInitialTheme = () => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {
      // Depolama erişimi kapalıysa varsayılan tercihe geç
    }
    return 'dark';
  };

  const applyTheme = (theme) => {
    htmlEl.setAttribute('data-theme', theme);
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Aydınlık temaya geç' : 'Karanlık temaya geç'
      );
    }
  };

  const toggleTheme = () => {
    const next = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (e) {}
    showToast(next === 'dark' ? 'Karanlık tema etkinleştirildi' : 'Aydınlık tema etkinleştirildi');
  };

  applyTheme(getInitialTheme());
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  /* ==========================================================================
     2. BİLDİRİM (TOAST) YARDIMCISI
     ========================================================================== */
  const toastEl = document.getElementById('toast');
  let toastTimer = null;

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('is-shown');
    }, 2600);
  }

  /* ==========================================================================
     3. MOBİL MENÜ & KAYAN NAVBAR KAPSÜLÜ (SLIDING PILL GLIDER)
     ========================================================================== */
  const hamburgerBtn = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const navGlider = document.getElementById('nav-glider');

  const moveGliderTo = (linkEl) => {
    if (!navGlider || !linkEl || window.innerWidth < 980) return;
    const parentRect = linkEl.closest('.nav-pill-wrapper').getBoundingClientRect();
    const linkRect = linkEl.getBoundingClientRect();
    const offsetLeft = linkRect.left - parentRect.left;

    navGlider.style.width = `${linkRect.width}px`;
    navGlider.style.transform = `translateX(${offsetLeft}px)`;
  };

  const closeMobileMenu = () => {
    if (!hamburgerBtn || !navMenu) return;
    hamburgerBtn.classList.remove('is-active');
    navMenu.classList.remove('is-open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
  };

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');
      hamburgerBtn.classList.toggle('is-active', isOpen);
      hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
    });
  }

  document.addEventListener('click', (e) => {
    if (
      navMenu &&
      navMenu.classList.contains('is-open') &&
      !navMenu.contains(e.target) &&
      hamburgerBtn &&
      !hamburgerBtn.contains(e.target)
    ) {
      closeMobileMenu();
    }
  });

  window.addEventListener('resize', () => {
    const activeLink = document.querySelector('.nav-link.active');
    if (activeLink) moveGliderTo(activeLink);
  });

  /* ==========================================================================
     4. SMOOTH SCROLLING (YUMUŞAK KAYDIRMA)
     ========================================================================== */
  const scrollToTarget = (selector) => {
    const target = document.querySelector(selector);
    if (!target) return;
    closeMobileMenu();
    target.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start'
    });
    if (history.pushState) {
      history.pushState(null, '', selector);
    }
  };

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();
      scrollToTarget(href);
    });
  });

  /* ==========================================================================
     5. INTERSECTION OBSERVER (GÖRÜNÜM ANİMASYONLARI & AKTİF BÖLÜM TAKİBİ)
     ========================================================================== */
  const heroItems = document.querySelectorAll('.reveal-hero');
  const revealItems = document.querySelectorAll('.reveal');

  if (prefersReducedMotion) {
    heroItems.forEach((el) => el.classList.add('is-visible'));
    revealItems.forEach((el) => el.classList.add('is-visible'));
  } else {
    heroItems.forEach((el, idx) => {
      setTimeout(() => el.classList.add('is-visible'), 85 * idx);
    });

    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );

      revealItems.forEach((el) => revealObserver.observe(el));
    } else {
      revealItems.forEach((el) => el.classList.add('is-visible'));
    }
  }

  // Aktif Bölüm Takibi (ScrollSpy)
  const sections = document.querySelectorAll('main section[id]');

  const updateActiveSection = (id) => {
    navLinks.forEach((link) => {
      const isMatch = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('active', isMatch);
      if (isMatch) {
        link.setAttribute('aria-current', 'page');
        moveGliderTo(link);
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  if ('IntersectionObserver' in window && sections.length > 0) {
    const spyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            updateActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
    );

    sections.forEach((sec) => spyObserver.observe(sec));
  }

  // İlk yüklemede Glider konumunu ayarla
  setTimeout(() => {
    const initialActive = document.querySelector('.nav-link.active');
    if (initialActive) moveGliderTo(initialActive);
  }, 100);

  /* ==========================================================================
     6. ÜST İLERLEME ÇUBUĞU & EN ÜSTE DÖN BUTONU
     ========================================================================== */
  const progressBar = document.getElementById('scroll-progress');
  const backToTopBtn = document.getElementById('back-to-top');

  const onScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar && docHeight > 0) {
      const pct = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      progressBar.style.width = `${pct}%`;
    }

    if (backToTopBtn) {
      backToTopBtn.classList.toggle('is-visible', scrollTop > 480);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  }

  /* ========================================================================== 
     7. SPRING MOTION: SPOTLIGHT, 3D TILT VE MANYETİK BUTONLAR
     ========================================================================== */
  const motionCards = [];
  const motionButtons = [];
  let motionFrame = 0;

  const requestMotionFrame = () => {
    if (!motionFrame) motionFrame = requestAnimationFrame(runMotionFrame);
  };

  const runMotionFrame = () => {
    motionFrame = 0;
    let hasMotion = false;

    motionCards.forEach(({ element, state, isTilt }) => {
      state.x += (state.targetX - state.x) * 0.14;
      state.y += (state.targetY - state.y) * 0.14;
      state.rx += (state.targetRx - state.rx) * 0.12;
      state.ry += (state.targetRy - state.ry) * 0.12;
      state.angle += (state.targetAngle - state.angle) * 0.1;

      element.style.setProperty('--mouse-x', `${state.x}px`);
      element.style.setProperty('--mouse-y', `${state.y}px`);
      element.style.setProperty('--prism-angle', `${state.angle}deg`);
      element.style.setProperty('--prism-opacity', state.active ? '1' : '0');
      if (isTilt) {
        const lift = state.active ? -4 : 0;
        element.style.transform = `perspective(900px) rotateX(${state.rx}deg) rotateY(${state.ry}deg) translateY(${lift}px)`;
      }

      hasMotion ||= Math.abs(state.targetX - state.x) > 0.05 || Math.abs(state.targetRx - state.rx) > 0.05 || state.active;
    });

    motionButtons.forEach(({ element, state }) => {
      state.x += (state.targetX - state.x) * 0.18;
      state.y += (state.targetY - state.y) * 0.18;
      element.style.transform = `translate(${state.x}px, ${state.y}px)`;
      hasMotion ||= Math.abs(state.targetX - state.x) > 0.05 || Math.abs(state.targetY - state.y) > 0.05;
    });

    if (hasMotion) requestMotionFrame();
  };

  if (!prefersReducedMotion && supportsHover) {
    document.querySelectorAll('.spotlight-card').forEach((card) => {
      const state = { x: 0, y: 0, targetX: 0, targetY: 0, rx: 0, ry: 0, targetRx: 0, targetRy: 0, angle: 0, targetAngle: 0, active: false };
      const isTilt = card.classList.contains('tilt-card');
      motionCards.push({ element: card, state, isTilt });

      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const normalizedX = (event.clientX - rect.left) / rect.width - 0.5;
        const normalizedY = (event.clientY - rect.top) / rect.height - 0.5;
        state.targetX = event.clientX - rect.left;
        state.targetY = event.clientY - rect.top;
        state.targetRx = -normalizedY * 5;
        state.targetRy = normalizedX * 5;
        state.targetAngle = (normalizedX + 0.5) * 360;
        state.active = true;
        card.classList.add('is-hovered');
        requestMotionFrame();
      });

      card.addEventListener('pointerleave', () => {
        state.targetX = rectCenter(card).x;
        state.targetY = 0;
        state.targetRx = 0;
        state.targetRy = 0;
        state.active = false;
        card.classList.remove('is-hovered');
        requestMotionFrame();
      });
    });

    document.querySelectorAll('.magnetic').forEach((button) => {
      const state = { x: 0, y: 0, targetX: 0, targetY: 0 };
      motionButtons.push({ element: button, state });
      button.addEventListener('pointermove', (event) => {
        const rect = button.getBoundingClientRect();
        state.targetX = (event.clientX - (rect.left + rect.width / 2)) * 0.18;
        state.targetY = (event.clientY - (rect.top + rect.height / 2)) * 0.18;
        requestMotionFrame();
      });
      button.addEventListener('pointerleave', () => {
        state.targetX = 0;
        state.targetY = 0;
        requestMotionFrame();
      });
    });
  }

  function rectCenter(element) {
    const rect = element.getBoundingClientRect();
    return { x: rect.width / 2, y: rect.height / 2 };
  }

  /* ========================================================================== 
     8. CANVAS PARÇACIKLARI VE İMLEÇ DALGASI
     ========================================================================== */
  const particleCanvas = document.getElementById('particle-canvas');
  const particleContext = particleCanvas ? particleCanvas.getContext('2d') : null;
  const pointer = { x: 0.5, y: 0.35, active: false };
  const ripples = [];
  let particles = [];
  let canvasWidth = 0;
  let canvasHeight = 0;
  let canvasDpr = 1;

  const resizeParticleCanvas = () => {
    if (!particleCanvas || !particleContext) return;
    const rect = particleCanvas.getBoundingClientRect();
    canvasDpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvasWidth = rect.width;
    canvasHeight = rect.height;
    particleCanvas.width = Math.floor(canvasWidth * canvasDpr);
    particleCanvas.height = Math.floor(canvasHeight * canvasDpr);
    particleContext.setTransform(canvasDpr, 0, 0, canvasDpr, 0, 0);
    const count = Math.min(110, Math.max(30, Math.floor((canvasWidth * canvasHeight) / 11000)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      vx: (Math.random() - 0.5) * 0.16,
      vy: (Math.random() - 0.5) * 0.16,
      size: Math.random() * 1.5 + 0.5
    }));
  };

  const drawParticles = (time = 0) => {
    if (!particleContext || !canvasWidth) return;
    particleContext.clearRect(0, 0, canvasWidth, canvasHeight);
    const pointerX = pointer.x * canvasWidth;
    const pointerY = pointer.y * canvasHeight;
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#2997ff';

    particles.forEach((particle) => {
      if (!prefersReducedMotion) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        const dx = pointerX - particle.x;
        const dy = pointerY - particle.y;
        const distance = Math.max(80, Math.hypot(dx, dy));
        particle.x += (dx / distance) * 0.045;
        particle.y += (dy / distance) * 0.045;
        if (particle.x < -20) particle.x = canvasWidth + 20;
        if (particle.x > canvasWidth + 20) particle.x = -20;
        if (particle.y < -20) particle.y = canvasHeight + 20;
        if (particle.y > canvasHeight + 20) particle.y = -20;
      }

      particleContext.beginPath();
      particleContext.fillStyle = accent;
      particleContext.globalAlpha = 0.32;
      particleContext.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      particleContext.fill();
    });

    particleContext.lineWidth = 0.6;
    for (let index = 0; index < particles.length; index += 1) {
      for (let next = index + 1; next < particles.length; next += 1) {
        const first = particles[index];
        const second = particles[next];
        const distance = Math.hypot(first.x - second.x, first.y - second.y);
        if (distance < 125) {
          particleContext.globalAlpha = (1 - distance / 125) * 0.16;
          particleContext.strokeStyle = accent;
          particleContext.beginPath();
          particleContext.moveTo(first.x, first.y);
          particleContext.lineTo(second.x, second.y);
          particleContext.stroke();
        }
      }
    }

    ripples.forEach((ripple) => {
      ripple.radius += 2.6;
      ripple.alpha -= 0.018;
      particleContext.globalAlpha = Math.max(0, ripple.alpha);
      particleContext.strokeStyle = accent;
      particleContext.beginPath();
      particleContext.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
      particleContext.stroke();
    });
    for (let index = ripples.length - 1; index >= 0; index -= 1) {
      if (ripples[index].alpha <= 0) ripples.splice(index, 1);
    }
    particleContext.globalAlpha = 1;
    if (!prefersReducedMotion) requestAnimationFrame(drawParticles);
  };

  if (particleCanvas && particleContext) {
    resizeParticleCanvas();
    window.addEventListener('resize', resizeParticleCanvas, { passive: true });
    window.addEventListener('pointermove', (event) => {
      pointer.x = event.clientX / window.innerWidth;
      pointer.y = event.clientY / window.innerHeight;
      pointer.active = true;
    }, { passive: true });
    window.addEventListener('click', (event) => {
      if (!prefersReducedMotion) {
        ripples.push({ x: event.clientX, y: event.clientY, radius: 8, alpha: 0.7 });
      }
    });
    drawParticles();
  }

  /* ========================================================================== 
     9. HERO VİTRİNİ: İNTERAKTİF ÇALIŞMA YAKLAŞIMLARI
     ========================================================================== */
  const projectFilters = document.querySelectorAll('.project-filter');
  const projectCards = document.querySelectorAll('.project-card');
  projectFilters.forEach((filter) => {
    filter.addEventListener('click', () => {
      const selectedCategory = filter.getAttribute('data-project-filter');
      projectFilters.forEach((item) => item.classList.toggle('is-active', item === filter));
      projectCards.forEach((card) => {
        const categories = card.getAttribute('data-project-category') || '';
        const visible = selectedCategory === 'all' || categories.split(' ').includes(selectedCategory);
        card.classList.toggle('is-hidden', !visible);
      });
    });
  });

  const showcaseStage = document.querySelector('.portrait-stage');
  const showcaseTitle = showcaseStage ? showcaseStage.querySelector('.stage-title') : null;
  const showcaseCaption = showcaseStage ? showcaseStage.querySelector('.stage-caption') : null;
  const showcaseData = {
    architecture: { title: 'Clean Architecture', caption: 'Sınırları belirgin, sürdürülebilir ve test edilebilir sistemler.' },
    minimal: { title: 'Minimal UI', caption: 'Gereksiz olanı eleyerek odağı insana ve göreve geri veriyorum.' },
    performance: { title: 'Performance', caption: 'Hızlı algılanan, hızlı çalışan ve kaynaklarını akıllıca kullanan deneyimler.' }
  };

  document.querySelectorAll('.showcase-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const key = tab.getAttribute('data-showcase');
      const data = showcaseData[key];
      if (!data || !showcaseStage) return;
      showcaseStage.dataset.showcase = key;
      if (showcaseTitle) showcaseTitle.textContent = data.title;
      if (showcaseCaption) showcaseCaption.textContent = data.caption;
      document.querySelectorAll('.showcase-tab').forEach((item) => {
        const active = item === tab;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', String(active));
      });
    });
  });

  const watchDigital = document.getElementById('watch-digital');
  const watchHour = document.getElementById('watch-hour');
  const watchMinute = document.getElementById('watch-minute');
  const watchSecond = document.getElementById('watch-second');
  const watchPhoto = document.querySelector('.watch-photo');

  if (watchPhoto) {
    watchPhoto.addEventListener('load', () => {
      watchPhoto.closest('.watch-face')?.classList.add('has-photo');
    });
  }

  const updateWatch = () => {
    const now = new Date();
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    if (watchDigital) {
      watchDigital.textContent = now.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
    if (watchHour) watchHour.style.transform = `rotate(${hours * 30 + minutes * 0.5}deg)`;
    if (watchMinute) watchMinute.style.transform = `rotate(${minutes * 6 + seconds * 0.1}deg)`;
    if (watchSecond) watchSecond.style.transform = `rotate(${seconds * 6}deg)`;
  };

  updateWatch();
  window.setInterval(updateWatch, 1000);

  /* ==========================================================================
    8. TEK TIKLA E-POSTA KOPYALAMA & PAYLAŞIM
     ========================================================================== */
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const copyEmailText = document.getElementById('copy-email-text');

  const copyEmailToClipboard = () => {
    const email = copyEmailBtn ? copyEmailBtn.getAttribute('data-email') : '[E-posta Adresin]';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(() => {
        showToast(`Kopyalandı: ${email}`);
        if (copyEmailText) {
          const original = copyEmailText.textContent;
          copyEmailText.textContent = 'Panoya Kopyalandı ✓';
          setTimeout(() => {
            copyEmailText.textContent = original;
          }, 2200);
        }
      }).catch(() => {
        showToast(`E-posta: ${email}`);
      });
    } else {
      showToast(`E-posta: ${email}`);
    }
  };

  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', copyEmailToClipboard);
  }

  const sharePortfolio = async () => {
    const shareData = {
      title: document.title,
      text: 'İnteraktif kişisel portfolyoyu keşfet.',
      url: window.location.href.split('#')[0]
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showToast('Portfolyo paylaşım menüsü açıldı');
      } catch (error) {
        if (error.name !== 'AbortError') showToast('Paylaşım başlatılamadı');
      }
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(shareData.url);
        showToast('Portfolyo bağlantısı kopyalandı');
      } catch (error) {
        showToast(shareData.url);
      }
    } else {
      showToast(shareData.url);
    }
  };

  /* ==========================================================================
     9. KOMUT PALETİ (⌘K / Ctrl+K HIZLI ERİŞİM PENCERESİ)
     ========================================================================== */
  const cmdTrigger = document.getElementById('cmd-trigger');
  const cmdBackdrop = document.getElementById('cmd-backdrop');
  const cmdClose = document.getElementById('cmd-close');
  const cmdInput = document.getElementById('cmd-input');
  const cmdItems = document.querySelectorAll('.cmd-item');
  const insightBackdrop = document.getElementById('insight-backdrop');
  const insightClose = document.getElementById('insight-close');
  const insightLabel = document.getElementById('insight-label');
  const insightTitle = document.getElementById('insight-title');
  const insightCopy = document.getElementById('insight-copy');
  const insightPrimary = document.getElementById('insight-primary');
  const insightSecondary = document.getElementById('insight-secondary');
  let lastInsightFocus = null;

  const insightContent = {
    assistant: {
      label: 'AI ASSISTANT / LOCAL DEMO',
      title: 'Beni yapay zekaya sor',
      copy: 'Bu portfolyo; erişilebilir, performans odaklı ve estetik dijital deneyimler üretmeye odaklanan bir geliştirici profili sunuyor. Gerçek bir yapay zeka yanıtı için bu arayüzü kendi API katmanına bağlayabilirsin.',
      primary: 'Özgeçmiş özetini gör'
    },
    resume: {
      label: 'QUICK RESUME / 60 SEC',
      title: 'Hızlı özgeçmiş özeti',
      copy: 'Odak alanları: semantik HTML, modern CSS, JavaScript, UI/UX ve sürdürülebilir web mimarileri. Çalışma yaklaşımı: meraklı, detay odaklı, analitik ve sürekli öğrenmeye açık.',
      primary: 'AI asistanı aç'
    }
  };

  let insightMode = 'assistant';
  const openInsight = (mode = 'assistant') => {
    if (!insightBackdrop) return;
    lastInsightFocus = document.activeElement;
    insightMode = mode;
    const content = insightContent[mode] || insightContent.assistant;
    if (insightLabel) insightLabel.textContent = content.label;
    if (insightTitle) insightTitle.textContent = content.title;
    if (insightCopy) insightCopy.textContent = content.copy;
    if (insightPrimary) insightPrimary.textContent = content.primary;
    insightBackdrop.classList.add('is-open');
    insightBackdrop.setAttribute('aria-hidden', 'false');
    setTimeout(() => insightPrimary?.focus(), 50);
  };

  const closeInsight = () => {
    if (!insightBackdrop) return;
    insightBackdrop.classList.remove('is-open');
    insightBackdrop.setAttribute('aria-hidden', 'true');
    if (lastInsightFocus && typeof lastInsightFocus.focus === 'function') lastInsightFocus.focus();
  };

  if (insightClose) insightClose.addEventListener('click', closeInsight);
  if (insightSecondary) insightSecondary.addEventListener('click', closeInsight);
  if (insightBackdrop) {
    insightBackdrop.addEventListener('click', (event) => {
      if (event.target === insightBackdrop) closeInsight();
    });
  }
  if (insightPrimary) {
    insightPrimary.addEventListener('click', () => {
      openInsight(insightMode === 'assistant' ? 'resume' : 'assistant');
    });
  }

  const openCommandPalette = () => {
    if (!cmdBackdrop) return;
    cmdBackdrop.classList.add('is-open');
    cmdBackdrop.setAttribute('aria-hidden', 'false');
    if (cmdInput) {
      cmdInput.value = '';
      filterCmdItems('');
      setTimeout(() => cmdInput.focus(), 50);
    }
  };

  const closeCommandPalette = () => {
    if (!cmdBackdrop) return;
    cmdBackdrop.classList.remove('is-open');
    cmdBackdrop.setAttribute('aria-hidden', 'true');
  };

  const filterCmdItems = (query) => {
    const normalized = query.trim().toLowerCase();
    cmdItems.forEach((btn) => {
      const text = btn.textContent.toLowerCase();
      const li = btn.parentElement;
      if (li) {
        li.style.display = text.includes(normalized) ? '' : 'none';
      }
    });
  };

  if (cmdTrigger) cmdTrigger.addEventListener('click', openCommandPalette);
  if (cmdClose) cmdClose.addEventListener('click', closeCommandPalette);

  if (cmdBackdrop) {
    cmdBackdrop.addEventListener('click', (e) => {
      if (e.target === cmdBackdrop) closeCommandPalette();
    });
  }

  if (cmdInput) {
    cmdInput.addEventListener('input', (e) => filterCmdItems(e.target.value));
  }

  cmdItems.forEach((item) => {
    item.addEventListener('click', () => {
      const action = item.getAttribute('data-action');
      const target = item.getAttribute('data-target');
      closeCommandPalette();

      if (action === 'scroll' && target) {
        scrollToTarget(target);
      } else if (action === 'theme') {
        toggleTheme();
      } else if (action === 'copy-email') {
        copyEmailToClipboard();
      } else if (action === 'resume' || action === 'assistant') {
        openInsight(action);
      } else if (action === 'share') {
        sharePortfolio();
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (cmdBackdrop && cmdBackdrop.classList.contains('is-open')) {
        closeCommandPalette();
      } else {
        openCommandPalette();
      }
    } else if (e.key === 'Escape') {
      if (cmdBackdrop && cmdBackdrop.classList.contains('is-open')) {
        closeCommandPalette();
      }
      if (insightBackdrop && insightBackdrop.classList.contains('is-open')) {
        closeInsight();
      }
      if (navMenu && navMenu.classList.contains('is-open')) {
        closeMobileMenu();
      }
    }
  });
});
