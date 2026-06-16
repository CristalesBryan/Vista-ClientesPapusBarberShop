import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FragmentScrollService } from '../../services/fragment-scroll.service';
import {
  EL10_LOGO_ALT,
  EL10_LOGO_SRC,
  EL10_MERCH_ROUTE,
  EL10_TOOLTIP,
  PAPUS_LOGO_ALT,
  PAPUS_LOGO_SRC
} from '../../shared/constants/papus-brand';

interface NavLink {
  path: string;
  label: string;
  fragment?: string;
}

@Component({
  selector: 'app-public-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './public-navbar.component.html',
  styleUrls: ['./public-navbar.component.css']
})
export class PublicNavbarComponent implements OnInit, OnDestroy {
  scrolled = false;
  mobileOpen = false;

  readonly logoSrc = PAPUS_LOGO_SRC;
  readonly logoAlt = PAPUS_LOGO_ALT;
  readonly el10LogoSrc = EL10_LOGO_SRC;
  readonly el10LogoAlt = EL10_LOGO_ALT;
  readonly el10MerchRoute = EL10_MERCH_ROUTE;
  readonly el10Tooltip = EL10_TOOLTIP;

  links: NavLink[] = [
    { path: '/', fragment: 'servicios', label: 'Servicios' },
    { path: '/', fragment: 'galeria', label: 'Galería' },
    { path: '/acerca-de-nosotros', label: 'Nosotros' },
    { path: '/', fragment: 'ubicacion', label: 'Contacto' }
  ];

  constructor(private fragmentScroll: FragmentScrollService) {}

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 48;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMobile();
  }

  ngOnInit(): void {
    this.onScroll();
  }

  ngOnDestroy(): void {}

  onFragmentNav(event: Event, link: NavLink): void {
    if (!link.fragment) {
      return;
    }
    event.preventDefault();
    this.closeMobile();
    this.fragmentScroll.goToFragment(link.path, link.fragment);
  }

  toggleMobile(): void {
    this.mobileOpen = !this.mobileOpen;
    document.body.style.overflow = this.mobileOpen ? 'hidden' : '';
  }

  closeMobile(): void {
    this.mobileOpen = false;
    document.body.style.overflow = '';
  }
}
