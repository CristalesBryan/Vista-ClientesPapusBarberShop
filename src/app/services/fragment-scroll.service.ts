import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GsapAnimationService } from './gsap-animation.service';

@Injectable({ providedIn: 'root' })
export class FragmentScrollService {
  private readonly navOffset = 72;

  constructor(
    private router: Router,
    private gsap: GsapAnimationService
  ) {}

  goToFragment(path: string, fragment: string): void {
    if (this.isCurrentPath(path)) {
      this.scrollToId(fragment);
      return;
    }

    this.router.navigate([path], { fragment }).then(() => {
      this.waitAndScroll(fragment);
    });
  }

  scrollToId(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      this.gsap.smoothScrollTo(el, this.navOffset);
    }
  }

  private isCurrentPath(path: string): boolean {
    const current = this.router.url.split('?')[0].split('#')[0];
    return current === path || (path === '/' && current === '');
  }

  private waitAndScroll(id: string, attempts = 15): void {
    const el = document.getElementById(id);
    if (el) {
      requestAnimationFrame(() => this.gsap.smoothScrollTo(el, this.navOffset));
      return;
    }
    if (attempts > 0) {
      setTimeout(() => this.waitAndScroll(id, attempts - 1), 120);
    }
  }
}
