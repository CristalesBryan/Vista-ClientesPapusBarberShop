import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GsapAnimationService } from '../../services/gsap-animation.service';

@Component({
  selector: 'app-academia',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './academia.component.html',
  styleUrls: ['./academia.component.css']
})
export class AcademiaComponent implements AfterViewInit, OnDestroy {
  @ViewChild('pageRoot') pageRoot?: ElementRef<HTMLElement>;
  private gsapCtx?: ReturnType<GsapAnimationService['context']>;

  whatsappNumber = '50247979922';
  whatsappMessage = '¡Hola! Me interesa recibir información sobre la Academia Papus BarberShop cuando abran inscripciones.';

  constructor(private gsapService: GsapAnimationService) {}

  get whatsappUrl(): string {
    return `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(this.whatsappMessage)}`;
  }

  ngAfterViewInit(): void {
    const root = this.pageRoot?.nativeElement;
    if (!root) return;
    this.gsapCtx = this.gsapService.context(root, () => {
      this.gsapService.scrollReveal(root, '.reveal-section');
    });
  }

  ngOnDestroy(): void {
    this.gsapService.revert(this.gsapCtx);
  }
}
