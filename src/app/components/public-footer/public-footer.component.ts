import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GsapAnimationService } from '../../services/gsap-animation.service';
import { FragmentScrollService } from '../../services/fragment-scroll.service';

interface FooterQuickLink {
  label: string;
  route?: string;
  url?: string;
  external?: boolean;
}

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './public-footer.component.html',
  styleUrls: ['./public-footer.component.css']
})
export class PublicFooterComponent implements AfterViewInit, OnDestroy {
  @ViewChild('footerRoot') footerRoot?: ElementRef<HTMLElement>;

  year = new Date().getFullYear();

  quickLinks: FooterQuickLink[] = [
    { label: 'Citas', route: '/citas' },
    { label: 'Compra Aquí', route: '/compra-aqui' },
    { label: 'Acerca de Nosotros', route: '/acerca-de-nosotros' },
    { label: 'Academia', route: '/academia' },
    {
      label: 'Facebook',
      url: 'https://www.facebook.com/share/1XmXmG651q/?mibextid=wwXIfr',
      external: true
    },
    {
      label: 'TikTok',
      url: 'https://www.tiktok.com/@papusbarbershopgt',
      external: true
    }
  ];

  private ctx?: ReturnType<GsapAnimationService['context']>;

  constructor(
    private gsap: GsapAnimationService,
    private fragmentScroll: FragmentScrollService
  ) {}

  ngAfterViewInit(): void {
    const footer = this.footerRoot?.nativeElement;
    if (!footer) {
      return;
    }
    this.ctx = this.gsap.context(footer, () => {
      this.gsap.revealFooter(footer);
    });
  }

  ngOnDestroy(): void {
    this.gsap.revert(this.ctx);
  }

  verEnMapa(event: Event): void {
    event.preventDefault();
    this.fragmentScroll.goToFragment('/', 'ubicacion');
  }
}
