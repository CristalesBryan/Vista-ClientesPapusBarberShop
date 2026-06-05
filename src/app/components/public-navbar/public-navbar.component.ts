import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

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

  links = [
    { path: '/', fragment: 'servicios', label: 'Servicios' },
    { path: '/', fragment: 'galeria', label: 'Galería' },
    { path: '/acerca-de-nosotros', label: 'Nosotros' },
    { path: '/', fragment: 'contacto', label: 'Contacto' }
  ];

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

  toggleMobile(): void {
    this.mobileOpen = !this.mobileOpen;
    document.body.style.overflow = this.mobileOpen ? 'hidden' : '';
  }

  closeMobile(): void {
    this.mobileOpen = false;
    document.body.style.overflow = '';
  }
}
