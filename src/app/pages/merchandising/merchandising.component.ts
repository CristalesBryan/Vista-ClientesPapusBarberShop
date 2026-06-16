import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GsapAnimationService } from '../../services/gsap-animation.service';
import { MerchandisingService } from '../../services/merchandising.service';
import {
  EL10_LOGO_ALT,
  EL10_LOGO_SRC
} from '../../shared/constants/papus-brand';
import { ProductoMerch, CATEGORIAS_MERCH } from '../../models/merchandising.model';
import { PapusCarritoComponent, CarritoItem } from '../../components/papus-carrito/papus-carrito.component';
import { Producto } from '../../models/producto.model';
import {
  MERCH_CARRITO_KEY,
  MerchCarritoStored,
  storedToCarritoItem,
  carritoItemToStored,
  loadMerchCarrito,
  saveMerchCarrito
} from '../../utils/merch-carrito.util';

@Component({
  selector: 'app-merchandising',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PapusCarritoComponent],
  templateUrl: './merchandising.component.html',
  styleUrls: ['./merchandising.component.css']
})
export class MerchandisingComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('pageRoot') pageRoot?: ElementRef<HTMLElement>;

  private gsapCtx?: ReturnType<GsapAnimationService['context']>;

  readonly el10LogoSrc = EL10_LOGO_SRC;
  readonly el10LogoAlt = EL10_LOGO_ALT;

  productos: ProductoMerch[] = [];
  productosFiltrados: ProductoMerch[] = [];
  cargando = true;

  categoriaSeleccionada = '';
  precioMin: number | null = null;
  precioMax: number | null = null;

  readonly categorias = ['', ...CATEGORIAS_MERCH];

  carrito: CarritoItem[] = [];
  mostrarCarrito = false;

  readonly resolverImagen = (producto: Producto): string => this.getImagenCarrito(producto);

  constructor(
    private merchandisingService: MerchandisingService,
    private cdr: ChangeDetectorRef,
    private gsapService: GsapAnimationService
  ) {}

  ngOnInit(): void {
    this.cargarCarrito();
    this.cargarProductos();

    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('click', this.onDocumentClick);
  }

  ngAfterViewInit(): void {
    const root = this.pageRoot?.nativeElement;
    if (!root) return;
    this.gsapCtx = this.gsapService.context(root, () => {
      this.gsapService.scrollReveal(root, '.reveal-section');
    });
    setTimeout(() => this.tryAnimateProducts());
  }

  ngOnDestroy(): void {
    this.gsapService.revert(this.gsapCtx);
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('click', this.onDocumentClick);
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.mostrarCarrito) {
      this.cerrarCarrito();
    }
  };

  private onDocumentClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;
    if (this.mostrarCarrito && !target.closest('.papus-cart-root')) {
      this.cerrarCarrito();
    }
  };

  cargarProductos(): void {
    this.cargando = true;
    this.merchandisingService.getProductos().subscribe({
      next: (data) => {
        this.productos = data.filter(p => p.activo);
        this.aplicarFiltros();
        this.cargando = false;
        this.cdr.detectChanges();
        setTimeout(() => this.tryAnimateProducts());
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    this.productosFiltrados = this.productos.filter(p => {
      const precio = this.getPrecioDisplay(p);
      if (this.categoriaSeleccionada && p.categoria !== this.categoriaSeleccionada) {
        return false;
      }
      if (this.precioMin != null && precio < this.precioMin) {
        return false;
      }
      if (this.precioMax != null && precio > this.precioMax) {
        return false;
      }
      return true;
    });
    setTimeout(() => this.tryAnimateProducts());
  }

  limpiarFiltros(): void {
    this.categoriaSeleccionada = '';
    this.precioMin = null;
    this.precioMax = null;
    this.aplicarFiltros();
  }

  getPrecioDisplay(producto: ProductoMerch): number {
    if (producto.precioMin != null) return producto.precioMin;
    return producto.precioBase;
  }

  getPrecioLabel(producto: ProductoMerch): string {
    const min = producto.precioMin ?? producto.precioBase;
    const max = producto.precioMax ?? producto.precioBase;
    if (min !== max) {
      return `Q${min.toFixed(2)} – Q${max.toFixed(2)}`;
    }
    return `Q${min.toFixed(2)}`;
  }

  getImagenPrincipal(producto: ProductoMerch): string {
    const sorted = [...(producto.imagenes ?? [])].sort((a, b) => a.orden - b.orden);
    if (sorted.length > 0 && sorted[0].url) {
      return sorted[0].url;
    }
    return this.placeholderImagen();
  }

  private getImagenCarrito(producto: Producto): string {
    if (producto.imagenUrl) {
      return producto.imagenUrl;
    }
    return this.placeholderImagen();
  }

  private placeholderImagen(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFhMWExYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TaW4gaW1hZ2VuPC90ZXh0Pjwvc3ZnPg==';
  }

  onImageError(event: Event, _producto?: Producto): void {
    const img = event.target as HTMLImageElement;
    if (!img) return;
    img.onerror = null;
    img.src = this.placeholderImagen();
  }

  private tryAnimateProducts(): void {
    const root = this.pageRoot?.nativeElement;
    if (!root || this.cargando || !this.productosFiltrados.length) return;

    if (this.gsapCtx) {
      this.gsapCtx.add(() => {
        this.gsapService.revealStagger(root, '.reveal-merch-card', 0.08);
      });
    } else {
      this.gsapService.revealStagger(root, '.reveal-merch-card', 0.08);
    }
  }

  // Carrito
  private cargarCarrito(): void {
    const stored = loadMerchCarrito();
    this.carrito = stored.map(storedToCarritoItem);
  }

  private persistirCarrito(): void {
    const stored: MerchCarritoStored[] = this.carrito
      .filter(i => i.tipo === 'merch')
      .map(carritoItemToStored);
    saveMerchCarrito(stored);
  }

  onEliminarCarrito(key: number | string): void {
    if (typeof key === 'string') {
      this.carrito = this.carrito.filter(i => i.lineKey !== key);
    } else {
      this.carrito = this.carrito.filter(i => i.producto.id !== key);
    }
    this.persistirCarrito();
  }

  onCantidadCarritoChange(event: { productoId?: number; lineKey?: string; cantidad: number }): void {
    const item = event.lineKey
      ? this.carrito.find(i => i.lineKey === event.lineKey)
      : this.carrito.find(i => i.producto.id === event.productoId);

    if (!item) return;

    if (event.cantidad <= 0) {
      this.onEliminarCarrito(event.lineKey ?? event.productoId!);
      return;
    }

    if (event.cantidad <= item.producto.stock) {
      item.cantidad = event.cantidad;
      this.persistirCarrito();
    }
  }

  getTotalCarrito(): number {
    return this.carrito.reduce((total, item) => {
      const precio = item.precioUnitario ?? item.producto.precioVenta;
      return total + precio * item.cantidad;
    }, 0);
  }

  getCantidadTotalItems(): number {
    return this.carrito.reduce((total, item) => total + item.cantidad, 0);
  }

  toggleCarrito(): void {
    this.mostrarCarrito = !this.mostrarCarrito;
  }

  cerrarCarrito(): void {
    this.mostrarCarrito = false;
  }

  vaciarCarrito(): void {
    if (confirm('¿Desea vaciar el carrito de merchandising?')) {
      this.carrito = [];
      localStorage.removeItem(MERCH_CARRITO_KEY);
      this.cerrarCarrito();
    }
  }

  scrollAProductos(): void {
    this.cerrarCarrito();
    const grid = this.pageRoot?.nativeElement.querySelector('.merch-grid');
    grid?.scrollIntoView({
      behavior: this.gsapService.prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start'
    });
  }

  finalizarCompra(): void {
    if (this.carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    const whatsappNumber = '50247979922';
    let mensaje = 'Quisiera pedir estos artículos de merchandising:\n\n';

    this.carrito.forEach((item, index) => {
      const precio = item.precioUnitario ?? item.producto.precioVenta;
      mensaje += `${index + 1}. ${item.producto.nombre}\n`;
      if (item.talla) mensaje += `   Talla: ${item.talla}\n`;
      if (item.personalizacionNombre) mensaje += `   Nombre: ${item.personalizacionNombre}\n`;
      if (item.personalizacionNumero) mensaje += `   Número: ${item.personalizacionNumero}\n`;
      mensaje += `   Cantidad: ${item.cantidad}\n`;
      mensaje += `   Precio unitario: Q${precio.toFixed(2)}\n`;
      mensaje += `   Subtotal: Q${(precio * item.cantidad).toFixed(2)}\n\n`;
    });

    mensaje += `━━━━━━━━━━━━━━━━━━━━\n`;
    mensaje += `TOTAL: Q${this.getTotalCarrito().toFixed(2)}\n`;
    mensaje += `━━━━━━━━━━━━━━━━━━━━`;

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensaje)}`, '_blank');
  }
}
