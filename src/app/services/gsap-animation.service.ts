import { Injectable, NgZone } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Injectable({ providedIn: 'root' })
export class GsapAnimationService {
  private reducedMotion = false;

  constructor(private ngZone: NgZone) {
    if (typeof window !== 'undefined') {
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }

  get prefersReducedMotion(): boolean {
    return this.reducedMotion;
  }

  context(scope: Element | string, fn: () => void): gsap.Context {
    return gsap.context(fn, scope);
  }

  revert(ctx?: gsap.Context): void {
    ctx?.revert();
  }

  splitTextChars(element: HTMLElement): HTMLElement[] {
    const text = element.textContent?.trim() ?? '';
    element.textContent = '';
    element.setAttribute('aria-label', text);
    const chars: HTMLElement[] = [];
    for (const char of text) {
      const span = document.createElement('span');
      span.className = 'char';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = char === ' ' ? '\u00A0' : char;
      element.appendChild(span);
      chars.push(span);
    }
    return chars;
  }

  animateHeroTitle(element: HTMLElement, onComplete?: () => void): void {
    if (this.reducedMotion) {
      element.style.opacity = '1';
      onComplete?.();
      return;
    }
    const chars = this.splitTextChars(element);
    gsap.from(chars, {
      autoAlpha: 0,
      y: 40,
      rotateX: -90,
      stagger: 0.03,
      duration: 0.8,
      ease: 'power4.out',
      onComplete
    });
  }

  scrollReveal(
    scope: Element,
    selector: string,
    vars: gsap.TweenVars = {}
  ): void {
    if (this.reducedMotion) return;
    const targets = scope.querySelectorAll<HTMLElement>(selector);
    if (!targets.length) return;

    targets.forEach(target => {
      gsap.from(target, {
        autoAlpha: 0,
        y: 48,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: target,
          start: 'top 88%',
          once: true
        },
        ...vars
      });
    });
  }

  animateCounters(
    scope: Element,
    selector = '[data-count]'
  ): void {
    const els = scope.querySelectorAll<HTMLElement>(selector);
    els.forEach(el => {
      const end = parseFloat(el.dataset['count'] ?? '0');
      const obj = { val: 0 };
      if (this.reducedMotion) {
        el.textContent = this.formatCount(end, el);
        return;
      }
      gsap.to(obj, {
        val: end,
        duration: 1.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          once: true
        },
        onUpdate: () => {
          el.textContent = this.formatCount(obj.val, el);
        }
      });
    });
  }

  private formatCount(value: number, el: HTMLElement): string {
    const prefix = el.dataset['prefix'] ?? '';
    const suffix = el.dataset['suffix'] ?? '';
    const decimals = parseInt(el.dataset['decimals'] ?? '0', 10);
    const formatted = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
    return `${prefix}${formatted}${suffix}`;
  }

  cardHoverGSAP(cards: HTMLElement[]): () => void {
    if (this.reducedMotion) return () => {};
    const cleanups: (() => void)[] = [];
    cards.forEach(card => {
      const enter = () => {
        gsap.to(card, {
          y: -8,
          boxShadow: '0 16px 40px rgba(201, 168, 76, 0.2)',
          borderColor: 'rgba(201, 168, 76, 0.6)',
          duration: 0.4,
          ease: 'power2.out'
        });
      };
      const leave = () => {
        gsap.to(card, {
          y: 0,
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          borderColor: 'rgba(201, 168, 76, 0.25)',
          duration: 0.4,
          ease: 'power2.out'
        });
      };
      card.addEventListener('mouseenter', enter);
      card.addEventListener('mouseleave', leave);
      cleanups.push(() => {
        card.removeEventListener('mouseenter', enter);
        card.removeEventListener('mouseleave', leave);
      });
    });
    return () => cleanups.forEach(fn => fn());
  }

  magneticButton(btn: HTMLElement): () => void {
    if (this.reducedMotion) return () => {};
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' });
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' });
    const move = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      xTo((e.clientX - cx) * 0.25);
      yTo((e.clientY - cy) * 0.25);
    };
    const reset = () => {
      xTo(0);
      yTo(0);
    };
    btn.addEventListener('mousemove', move);
    btn.addEventListener('mouseleave', reset);
    return () => {
      btn.removeEventListener('mousemove', move);
      btn.removeEventListener('mouseleave', reset);
    };
  }

  pageTransition(element: HTMLElement, direction: 'in' | 'out'): gsap.core.Tween {
    if (this.reducedMotion) {
      gsap.set(element, { autoAlpha: direction === 'in' ? 1 : 0 });
      return gsap.to(element, { duration: 0 });
    }
    if (direction === 'in') {
      return gsap.fromTo(
        element,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power3.out' }
      );
    }
    return gsap.to(element, {
      autoAlpha: 0,
      y: -16,
      duration: 0.35,
      ease: 'power2.in'
    });
  }

  modalEnter(modal: HTMLElement): gsap.core.Tween {
    if (this.reducedMotion) {
      gsap.set(modal, { autoAlpha: 1, scale: 1 });
      return gsap.to(modal, { duration: 0 });
    }
    return gsap.fromTo(
      modal,
      { autoAlpha: 0, scale: 0.92 },
      { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'power3.out' }
    );
  }

  parallaxHero(bg: HTMLElement, trigger?: HTMLElement | null): ScrollTrigger[] {
    if (this.reducedMotion) return [];
    const hero = trigger ?? bg.parentElement;
    if (!hero) return [];

    const yTween = gsap.to(bg, {
      yPercent: -20,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    const scaleTween = gsap.fromTo(
      bg,
      { scale: 1.1 },
      {
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      }
    );

    return [yTween.scrollTrigger!, scaleTween.scrollTrigger!].filter(Boolean);
  }

  /** Secuencia de carga: overlay → logo → logo secundario → línea → título → subtítulo → CTAs */
  pageLoadSequence(elements: {
    overlay?: HTMLElement | null;
    logo?: HTMLElement | null;
    secondaryLogo?: HTMLElement | null;
    logoDivider?: HTMLElement | null;
    line?: HTMLElement | null;
    title?: HTMLElement | null;
    subtitle?: HTMLElement | null;
    ctas?: HTMLElement | null;
    scrollHint?: HTMLElement | null;
  }, onTitleReady?: (titleEl: HTMLElement) => void): void {
    const { overlay, logo, secondaryLogo, logoDivider, line, title, subtitle, ctas, scrollHint } = elements;

    if (this.reducedMotion) {
      [overlay, logo, secondaryLogo, logoDivider, line, title, subtitle, ctas, scrollHint].forEach(el => {
        if (el) gsap.set(el, { autoAlpha: 1, clearProps: 'transform' });
      });
      if (title) onTitleReady?.(title);
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (overlay) {
      tl.to(overlay, { autoAlpha: 0, duration: 0.7, pointerEvents: 'none' });
    }

    if (logo) {
      tl.from(logo, { autoAlpha: 0, scale: 0.85, duration: 0.6 }, overlay ? '-=0.2' : 0);
    }

    if (secondaryLogo) {
      tl.from(
        secondaryLogo,
        { autoAlpha: 0, x: 28, duration: 0.55 },
        logo ? '-=0.4' : '+=0.2'
      );
    }

    if (logoDivider && secondaryLogo) {
      tl.from(logoDivider, { autoAlpha: 0, scale: 0.4, duration: 0.4 }, '<');
    } else if (logoDivider) {
      tl.from(logoDivider, { autoAlpha: 0, duration: 0.35 }, logo ? '-=0.15' : 0);
    }

    if (line) {
      tl.fromTo(line, { width: 0 }, { width: 60, duration: 0.5 }, '-=0.15');
    }

    if (title) {
      tl.add(() => onTitleReady?.(title), '-=0.1');
    }

    if (subtitle) {
      tl.from(subtitle, { autoAlpha: 0, y: 16, duration: 0.55 }, '+=0.35');
    }

    if (ctas) {
      tl.from(ctas, { autoAlpha: 0, y: 24, duration: 0.6 }, '-=0.2');
    }

    if (scrollHint) {
      tl.from(scrollHint, { autoAlpha: 0, y: 10, duration: 0.45 }, '-=0.1');
      const chevron = scrollHint.querySelector('.scroll-chevron');
      if (chevron) {
        gsap.to(chevron, {
          y: 8,
          repeat: -1,
          yoyo: true,
          duration: 1.2,
          ease: 'sine.inOut'
        });
      }
    }
  }

  revealStagger(
    scope: Element,
    selector: string,
    stagger = 0.1
  ): void {
    const targets = gsap.utils.toArray<HTMLElement>(scope.querySelectorAll(selector));
    if (!targets.length) return;

    if (this.reducedMotion) {
      gsap.set(targets, { autoAlpha: 1, y: 0, clearProps: 'transform' });
      return;
    }

    targets.forEach(target => {
      gsap.killTweensOf(target);
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === target) st.kill();
      });
    });

    const tween = gsap.from(targets, {
      autoAlpha: 0,
      y: 40,
      duration: 0.75,
      stagger,
      ease: 'power3.out',
      immediateRender: false,
      scrollTrigger: {
        trigger: targets[0],
        start: 'top 95%',
        once: true,
        invalidateOnRefresh: true
      }
    });

    ScrollTrigger.refresh();

    const alreadyVisible = targets[0].getBoundingClientRect().top < window.innerHeight * 0.95;
    if (alreadyVisible) {
      tween.progress(1);
    }
  }

  accessCardHover(card: HTMLElement): () => void {
    if (this.reducedMotion) return () => {};
    const enter = () => {
      gsap.to(card, {
        scale: 1.02,
        backgroundColor: '#1A1400',
        borderColor: 'rgba(201, 168, 76, 0.55)',
        duration: 0.35,
        ease: 'power2.out'
      });
    };
    const leave = () => {
      gsap.to(card, {
        scale: 1,
        backgroundColor: '#111111',
        borderColor: 'rgba(42, 34, 0, 1)',
        duration: 0.35,
        ease: 'power2.out'
      });
    };
    card.addEventListener('mouseenter', enter);
    card.addEventListener('mouseleave', leave);
    return () => {
      card.removeEventListener('mouseenter', enter);
      card.removeEventListener('mouseleave', leave);
    };
  }

  initSmoothScroll(): void {
    if (this.reducedMotion || typeof document === 'undefined') return;
    document.documentElement.style.scrollBehavior = 'smooth';
  }

  killAllScrollTriggers(): void {
    ScrollTrigger.getAll().forEach(st => st.kill());
  }

  smoothScrollTo(element: HTMLElement, offset = 72): void {
    const target = element.getBoundingClientRect().top + window.scrollY - offset;

    if (this.reducedMotion) {
      window.scrollTo(0, Math.max(0, target));
      return;
    }

    const scrollObj = { y: window.scrollY };
    gsap.to(scrollObj, {
      y: Math.max(0, target),
      duration: 1,
      ease: 'power2.inOut',
      onUpdate: () => window.scrollTo(0, scrollObj.y)
    });
  }

  /** Footer: columnas con fade + slide up al entrar en viewport. */
  revealFooter(footer: HTMLElement): void {
    if (this.reducedMotion) return;

    const cols = footer.querySelectorAll('.footer-col');
    const bottom = footer.querySelector('.footer-bottom');

    if (cols.length) {
      gsap.from(cols, {
        autoAlpha: 0,
        y: 48,
        duration: 0.85,
        stagger: 0.16,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: footer,
          start: 'top 88%',
          once: true
        }
      });
    }

    if (bottom) {
      gsap.from(bottom, {
        autoAlpha: 0,
        y: 24,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: bottom,
          start: 'top 95%',
          once: true
        }
      });
    }
  }

  /** Sección ubicación: cabecera fade+up, info desde izquierda, mapa desde derecha, stagger en items. */
  revealUbicacionSection(section: HTMLElement): void {
    if (this.reducedMotion) return;

    const head = section.querySelector('.ubicacion-head');
    const infoCol = section.querySelector('.ubicacion-info-col');
    const mapCol = section.querySelector('.ubicacion-map-col');
    const infoItems = section.querySelectorAll('.ubicacion-info-item');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 82%',
        once: true
      }
    });

    if (head) {
      tl.from(head, { autoAlpha: 0, y: 48, duration: 0.85, ease: 'power3.out' });
    }
    if (infoCol) {
      tl.from(infoCol, { autoAlpha: 0, x: -72, duration: 0.9, ease: 'power3.out' }, '-=0.45');
    }
    if (infoItems.length) {
      tl.from(infoItems, {
        autoAlpha: 0,
        x: -32,
        duration: 0.65,
        stagger: 0.14,
        ease: 'power3.out'
      }, '-=0.55');
    }
    if (mapCol) {
      tl.from(mapCol, { autoAlpha: 0, x: 72, duration: 0.95, ease: 'power3.out' }, '-=0.75');
    }
  }
}
