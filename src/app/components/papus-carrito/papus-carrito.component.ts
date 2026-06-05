import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { GsapAnimationService } from '../../services/gsap-animation.service';
import { Producto } from '../../models/producto.model';

export interface CarritoItem {
  producto: Producto;
  cantidad: number;
}

@Component({
  selector: 'app-papus-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './papus-carrito.component.html',
  styleUrls: ['./papus-carrito.component.css']
})
export class PapusCarritoComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() items: CarritoItem[] = [];
  @Input() visible = false;
  @Input() cantidadTotal = 0;
  @Input() total = 0;
  @Input() imagenResolver!: (producto: Producto) => string;

  @Output() toggleCarrito = new EventEmitter<void>();
  @Output() cerrarCarrito = new EventEmitter<void>();
  @Output() vaciarCarrito = new EventEmitter<void>();
  @Output() finalizarCompra = new EventEmitter<void>();
  @Output() eliminarItem = new EventEmitter<number>();
  @Output() cantidadChange = new EventEmitter<{ productoId: number; cantidad: number }>();
  @Output() imageError = new EventEmitter<{ event: Event; producto: Producto }>();
  @Output() verProductos = new EventEmitter<void>();

  @ViewChild('cartPanel') cartPanel?: ElementRef<HTMLElement>;
  @ViewChild('checkoutBtn') checkoutBtn?: ElementRef<HTMLButtonElement>;

  displayedTotal = 0;
  private gsapCtx?: gsap.Context;
  private animatedItemIds = new Set<number>();
  private prevQuantities = new Map<number, number>();
  private shimmerTween?: gsap.core.Tween;
  private shimmerBound = false;

  constructor(
    private gsapService: GsapAnimationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    const panel = this.cartPanel?.nativeElement;
    if (!panel) return;

    this.gsapCtx = this.gsapService.context(panel, () => {});

    this.displayedTotal = this.total;
    setTimeout(() => this.setupCheckoutShimmerOnce(), 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['total'] && !changes['total'].firstChange) {
      this.animateTotalCounter();
    } else if (changes['total']?.firstChange) {
      this.displayedTotal = this.total;
    }

    if (changes['items']) {
      this.handleItemsChange();
      if (this.items.length === 0) {
        this.shimmerBound = false;
      } else {
        setTimeout(() => this.setupCheckoutShimmerOnce(), 0);
      }
    }

    if (changes['visible']?.currentValue === true) {
      setTimeout(() => this.animatePanelOpen(), 0);
    }
  }

  ngOnDestroy(): void {
    this.shimmerTween?.kill();
    this.gsapService.revert(this.gsapCtx);
  }

  trackByProductoId(_index: number, item: CarritoItem): number {
    return item.producto.id;
  }

  onToggle(event: Event): void {
    event.stopPropagation();
    this.toggleCarrito.emit();
  }

  onVaciar(event: Event): void {
    event.stopPropagation();
    this.vaciarCarrito.emit();
  }

  onFinalizar(event: Event): void {
    event.stopPropagation();
    this.finalizarCompra.emit();
  }

  onCantidadMinus(item: CarritoItem, event: Event): void {
    event.stopPropagation();
    this.cantidadChange.emit({
      productoId: item.producto.id,
      cantidad: item.cantidad - 1
    });
  }

  onCantidadPlus(item: CarritoItem, event: Event): void {
    event.stopPropagation();
    this.cantidadChange.emit({
      productoId: item.producto.id,
      cantidad: item.cantidad + 1
    });
  }

  onEliminar(productoId: number, event: Event): void {
    event.stopPropagation();
    const el = (event.currentTarget as HTMLElement).closest('[data-cart-item]') as HTMLElement | null;

    if (el && !this.gsapService.prefersReducedMotion) {
      gsap.to(el, {
        x: 48,
        opacity: 0,
        duration: 0.22,
        ease: 'power2.in',
        onComplete: () => {
          this.animatedItemIds.delete(productoId);
          this.prevQuantities.delete(productoId);
          this.eliminarItem.emit(productoId);
        }
      });
    } else {
      this.animatedItemIds.delete(productoId);
      this.prevQuantities.delete(productoId);
      this.eliminarItem.emit(productoId);
    }
  }

  onVerProductos(): void {
    this.verProductos.emit();
  }

  onImageError(event: Event, producto: Producto): void {
    this.imageError.emit({ event, producto });
  }

  getSubtotal(item: CarritoItem): number {
    return item.producto.precioVenta * item.cantidad;
  }

  private handleItemsChange(): void {
    const currentIds = new Set(this.items.map(i => i.producto.id));

    this.items.forEach(item => {
      const prevQty = this.prevQuantities.get(item.producto.id);
      if (prevQty !== undefined && prevQty !== item.cantidad) {
        setTimeout(() => this.bounceQuantity(item.producto.id), 0);
      }
      this.prevQuantities.set(item.producto.id, item.cantidad);
    });

    for (const id of this.animatedItemIds) {
      if (!currentIds.has(id)) {
        this.animatedItemIds.delete(id);
      }
    }

    setTimeout(() => this.animateNewItems(), 0);
  }

  private animateNewItems(): void {
    if (this.gsapService.prefersReducedMotion) return;
    const root = this.cartPanel?.nativeElement;
    if (!root) return;

    this.items.forEach(item => {
      if (this.animatedItemIds.has(item.producto.id)) return;
      const el = root.querySelector(`[data-cart-item="${item.producto.id}"]`);
      if (!el) return;

      gsap.from(el, {
        y: -18,
        opacity: 0,
        duration: 0.35,
        ease: 'power2.out'
      });
      this.animatedItemIds.add(item.producto.id);
    });
  }

  private bounceQuantity(productoId: number): void {
    if (this.gsapService.prefersReducedMotion) return;
    const root = this.cartPanel?.nativeElement;
    const el = root?.querySelector(`[data-cart-qty="${productoId}"]`);
    if (!el) return;

    gsap.fromTo(
      el,
      { scale: 1.35 },
      { scale: 1, duration: 0.35, ease: 'back.out(2.2)' }
    );
  }

  private animateTotalCounter(): void {
    if (this.gsapService.prefersReducedMotion) {
      this.displayedTotal = this.total;
      return;
    }

    const obj = { val: this.displayedTotal };
    gsap.to(obj, {
      val: this.total,
      duration: 0.55,
      ease: 'power2.out',
      onUpdate: () => {
        this.displayedTotal = obj.val;
        this.cdr.detectChanges();
      }
    });
  }

  private animatePanelOpen(): void {
    if (this.gsapService.prefersReducedMotion) return;
    const panel = this.cartPanel?.nativeElement;
    if (!panel) return;

    gsap.fromTo(
      panel,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' }
    );
  }

  private setupCheckoutShimmerOnce(): void {
    if (this.shimmerBound) return;
    const btn = this.checkoutBtn?.nativeElement;
    if (!btn || this.gsapService.prefersReducedMotion) return;
    this.shimmerBound = true;

    const onEnter = () => {
      gsap.to(btn, {
        scale: 1.01,
        boxShadow: '0 0 28px rgba(201, 168, 76, 0.45)',
        duration: 0.25,
        ease: 'power2.out'
      });

      let shimmer = btn.querySelector('.papus-cart-shimmer') as HTMLElement | null;
      if (!shimmer) {
        shimmer = document.createElement('span');
        shimmer.className = 'papus-cart-shimmer';
        shimmer.setAttribute('aria-hidden', 'true');
        btn.appendChild(shimmer);
      }

      this.shimmerTween?.kill();
      gsap.set(shimmer, { x: '-110%' });
      this.shimmerTween = gsap.to(shimmer, {
        x: '220%',
        duration: 0.65,
        ease: 'power2.inOut'
      });
    };

    const onLeave = () => {
      gsap.to(btn, {
        scale: 1,
        boxShadow: '0 0 0 rgba(201, 168, 76, 0)',
        duration: 0.25,
        ease: 'power2.out'
      });
    };

    btn.addEventListener('mouseenter', onEnter);
    btn.addEventListener('mouseleave', onLeave);
    btn.addEventListener('focus', onEnter);
    btn.addEventListener('blur', onLeave);
  }
}
