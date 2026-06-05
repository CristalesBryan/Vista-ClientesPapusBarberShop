import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  QueryList,
  ViewChildren
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TipoCorteService } from '../../services/tipo-corte.service';
import { BarberoService } from '../../services/barbero.service';
import { TipoCorteAPI } from '../../models/tipo-corte-api.model';
import { Barbero } from '../../models/barbero.model';
import { GsapAnimationService } from '../../services/gsap-animation.service';

interface AccessCard {
  title: string;
  description: string;
  icon: string;
  route?: string;
  url?: string;
  external?: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('landingRoot') landingRoot?: ElementRef<HTMLElement>;
  @ViewChild('heroSection') heroSection?: ElementRef<HTMLElement>;
  @ViewChild('heroTitle') heroTitle?: ElementRef<HTMLElement>;
  @ViewChild('heroBg') heroBg?: ElementRef<HTMLElement>;
  @ViewChild('loadOverlay') loadOverlay?: ElementRef<HTMLElement>;
  @ViewChild('heroLogo') heroLogo?: ElementRef<HTMLImageElement>;
  @ViewChild('heroLine') heroLine?: ElementRef<HTMLElement>;
  @ViewChild('heroSubtitle') heroSubtitle?: ElementRef<HTMLElement>;
  @ViewChild('heroCtas') heroCtas?: ElementRef<HTMLElement>;
  @ViewChild('scrollHint') scrollHint?: ElementRef<HTMLElement>;
  @ViewChild('ctaPrimary') ctaPrimary?: ElementRef<HTMLAnchorElement>;
  @ViewChild('ctaSecondary') ctaSecondary?: ElementRef<HTMLAnchorElement>;
  @ViewChild('reservasBtn') reservasBtn?: ElementRef<HTMLButtonElement>;
  @ViewChildren('accessCard') accessCardsRef?: QueryList<ElementRef<HTMLAnchorElement>>;

  servicios: TipoCorteAPI[] = [];
  barberos: Barbero[] = [];
  cargandoServicios = true;
  cargandoBarberos = true;
  previewNombre = '';
  previewCorreo = '';

  accessCards: AccessCard[] = [
    {
      title: 'Citas',
      description: 'Agenda tu cita con nuestros barberos',
      icon: 'fas fa-calendar-check',
      route: '/citas'
    },
    {
      title: 'Compra Aquí',
      description: 'Explora nuestro catálogo de productos',
      icon: 'fas fa-shopping-bag',
      route: '/compra-aqui'
    },
    {
      title: 'Acerca de Nosotros',
      description: 'Conoce nuestra historia y valores',
      icon: 'fas fa-info-circle',
      route: '/acerca-de-nosotros'
    },
    {
      title: 'Academia',
      description: 'Aprende el arte de la barbería con nosotros',
      icon: 'fas fa-graduation-cap',
      route: '/academia'
    },
    {
      title: 'Facebook',
      description: 'Síguenos en Facebook',
      icon: 'fab fa-facebook',
      url: 'https://www.facebook.com/share/1XmXmG651q/?mibextid=wwXIfr',
      external: true
    },
    {
      title: 'TikTok',
      description: 'Síguenos en TikTok',
      icon: 'fab fa-tiktok',
      url: 'https://www.tiktok.com/@papusbarbershopgt?is_from_webapp=1&sender_device=pc',
      external: true
    }
  ];

  private ctx?: ReturnType<GsapAnimationService['context']>;
  private cleanups: (() => void)[] = [];

  constructor(
    private tipoCorteService: TipoCorteService,
    private barberoService: BarberoService,
    private gsapService: GsapAnimationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.tipoCorteService.obtenerTodosActivos().subscribe({
      next: data => {
        this.servicios = data.filter(s => s.activo);
        this.cargandoServicios = false;
      },
      error: () => {
        this.cargandoServicios = false;
      }
    });

    this.barberoService.getAll().subscribe({
      next: data => {
        this.barberos = data;
        this.cargandoBarberos = false;
        setTimeout(() => this.setupCounters(), 100);
      },
      error: () => {
        this.cargandoBarberos = false;
      }
    });
  }

  ngAfterViewInit(): void {
    const root = this.landingRoot?.nativeElement;
    if (!root) return;

    this.gsapService.pageLoadSequence(
      {
        overlay: this.loadOverlay?.nativeElement,
        logo: this.heroLogo?.nativeElement,
        line: this.heroLine?.nativeElement,
        title: this.heroTitle?.nativeElement,
        subtitle: this.heroSubtitle?.nativeElement,
        ctas: this.heroCtas?.nativeElement,
        scrollHint: this.scrollHint?.nativeElement
      },
      titleEl => this.gsapService.animateHeroTitle(titleEl)
    );

    this.ctx = this.gsapService.context(root, () => {
      const bg = this.heroBg?.nativeElement;
      const hero = this.heroSection?.nativeElement;
      if (bg && hero) {
        this.gsapService.parallaxHero(bg, hero);
      }

      this.gsapService.revealStagger(root, '.reveal-access-card', 0.1);
      this.gsapService.scrollReveal(root, '.reveal-section');
      this.gsapService.scrollReveal(root, '.reveal-catalog-card');
      this.gsapService.scrollReveal(root, '.reveal-barber');
      this.gsapService.scrollReveal(root, '.reservas-panel');
    });

    const primary = this.ctaPrimary?.nativeElement;
    const secondary = this.ctaSecondary?.nativeElement;
    const resBtn = this.reservasBtn?.nativeElement;
    if (primary) this.cleanups.push(this.gsapService.magneticButton(primary));
    if (secondary) this.cleanups.push(this.gsapService.magneticButton(secondary));
    if (resBtn) this.cleanups.push(this.gsapService.magneticButton(resBtn));

    setTimeout(() => this.setupAccessCardHovers(), 0);
  }

  ngOnDestroy(): void {
    this.gsapService.revert(this.ctx);
    this.cleanups.forEach(fn => fn());
  }

  trackAccessCard(_: number, card: AccessCard): string {
    return card.title;
  }

  getInitials(nombre: string): string {
    return nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  irACitas(): void {
    this.router.navigate(['/citas'], {
      state: { nombre: this.previewNombre, correo: this.previewCorreo }
    });
  }

  private setupAccessCardHovers(): void {
    const cards = this.accessCardsRef?.map(c => c.nativeElement) ?? [];
    cards.forEach(card => {
      this.cleanups.push(this.gsapService.accessCardHover(card));
    });
  }

  private setupCounters(): void {
    const root = this.landingRoot?.nativeElement;
    if (root) {
      this.gsapService.animateCounters(root, '.papus-stat-number');
    }
  }
}
