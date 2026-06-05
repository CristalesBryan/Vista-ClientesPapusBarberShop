import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { PublicNavbarComponent } from './components/public-navbar/public-navbar.component';
import { PublicFooterComponent } from './components/public-footer/public-footer.component';
import { GsapAnimationService } from './services/gsap-animation.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, PublicNavbarComponent, PublicFooterComponent],
  template: `
    <div class="papus-public-app">
      <app-public-navbar></app-public-navbar>
      <main #routeHost class="route-enter">
        <router-outlet (activate)="onRouteActivate()" />
      </main>
      <app-public-footer></app-public-footer>
    </div>
  `,
  styles: [`
    .papus-public-app {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--ink-deep);
    }

    main {
      flex: 1;
      padding-top: var(--public-nav-height, 72px);
    }
  `]
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('routeHost') routeHost?: ElementRef<HTMLElement>;
  private navSub?: Subscription;

  constructor(
    private router: Router,
    private gsap: GsapAnimationService
  ) {}

  ngOnInit(): void {
    document.body.classList.add('papus-public');
    this.gsap.initSmoothScroll();
    this.navSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e) => {
        const nav = e as NavigationEnd;
        const hasFragment = nav.urlAfterRedirects.includes('#');
        if (!hasFragment) {
          window.scrollTo({ top: 0, behavior: this.gsap.prefersReducedMotion ? 'auto' : 'smooth' });
        }
        const host = this.routeHost?.nativeElement;
        if (host) {
          this.gsap.pageTransition(host, 'in');
        }
      });
  }

  ngAfterViewInit(): void {
    const host = this.routeHost?.nativeElement;
    if (host) {
      this.gsap.pageTransition(host, 'in');
    }
  }

  ngOnDestroy(): void {
    document.body.classList.remove('papus-public');
    this.navSub?.unsubscribe();
    this.gsap.killAllScrollTriggers();
  }

  onRouteActivate(): void {
    const host = this.routeHost?.nativeElement;
    if (host) {
      this.gsap.pageTransition(host, 'in');
    }
  }
}
