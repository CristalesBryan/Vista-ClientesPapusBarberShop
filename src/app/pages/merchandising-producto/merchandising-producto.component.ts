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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { gsap } from 'gsap';
import { GsapAnimationService } from '../../services/gsap-animation.service';
import { MerchandisingService } from '../../services/merchandising.service';
import { ImagenMerch, ProductoMerch, VarianteMerch } from '../../models/merchandising.model';
import { PapusCarritoComponent, CarritoItem } from '../../components/papus-carrito/papus-carrito.component';
import { Producto } from '../../models/producto.model';
import {
  MERCH_CARRITO_KEY,
  MerchCarritoStored,
  buildLineKey,
  storedToCarritoItem,
  carritoItemToStored,
  loadMerchCarrito,
  saveMerchCarrito
} from '../../utils/merch-carrito.util';

@Component({
  selector: 'app-merchandising-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PapusCarritoComponent],
  templateUrl: './merchandising-producto.component.html',
  styleUrls: ['./merchandising-producto.component.css']
})
export class MerchandisingProductoComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('pageRoot') pageRoot?: ElementRef<HTMLElement>;
  @ViewChild('mainImage') mainImage?: ElementRef<HTMLImageElement>;

  private gsapCtx?: ReturnType<GsapAnimationService['context']>;

  producto: ProductoMerch | null = null;
  cargando = true;
  error = false;

  imagenes: ImagenMerch[] = [];
  imagenActivaIndex = 0;

  varianteSeleccionada: VarianteMerch | null = null;
  cantidad = 1;
  personalizacionNombre = '';
  personalizacionNumero = '';
  descripcionAbierta = false;

  carrito: CarritoItem[] = [];
  mostrarCarrito = false;

  readonly resolverImagen = (producto: Producto): string =>
    producto.imagenUrl ?? this.placeholderImagen();

  constructor(
    private route: ActivatedRoute,
    private merchandisingService: MerchandisingService,
    private cdr: ChangeDetectorRef,
    private gsapService: GsapAnimationService
  ) {}

  ngOnInit(): void {
    this.cargarCarrito();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = true;
      this.cargando = false;
      return;
    }
    this.cargarProducto(id);

    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('click', this.onDocumentClick);
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

  cargarProducto(id: number): void {
    this.cargando = true;
    this.merchandisingService.getProducto(id).subscribe({
      next: (data) => {
        this.producto = data;
        this.imagenes = [...(data.imagenes ?? [])].sort((a, b) => a.orden - b.orden);
        this.imagenActivaIndex = 0;
        this.seleccionarVariantePorDefecto();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = true;
        this.cargando = false;
      }
    });
  }

  private seleccionarVariantePorDefecto(): void {
    if (!this.producto?.variantes?.length) {
      this.varianteSeleccionada = null;
      return;
    }
    const conStock = this.producto.variantes.find(v => v.stock > 0);
    this.varianteSeleccionada = conStock ?? this.producto.variantes[0];
  }

  seleccionarVariante(variante: VarianteMerch): void {
    if (variante.stock <= 0) return;
    this.varianteSeleccionada = variante;
    this.cantidad = 1;
  }

  seleccionarImagen(index: number): void {
    if (index === this.imagenActivaIndex) return;
    this.imagenActivaIndex = index;

    const imgEl = this.mainImage?.nativeElement;
    if (!imgEl || this.gsapService.prefersReducedMotion) return;

    gsap.fromTo(
      imgEl,
      { opacity: 0 },
      { opacity: 1, duration: 0.35, ease: 'power2.out' }
    );
  }

  get imagenActiva(): string {
    if (this.imagenes.length > 0) {
      return this.imagenes[this.imagenActivaIndex]?.url ?? this.placeholderImagen();
    }
    return this.placeholderImagen();
  }

  get precioActual(): number {
    if (this.varianteSeleccionada?.precio != null) {
      return this.varianteSeleccionada.precio;
    }
    return this.producto?.precioBase ?? 0;
  }

  get stockActual(): number {
    if (this.varianteSeleccionada) {
      return this.varianteSeleccionada.stock;
    }
    return this.producto?.stockTotal ?? 0;
  }

  get hayStock(): boolean {
    return this.stockActual > 0;
  }

  get requiereVariante(): boolean {
    return (this.producto?.variantes?.length ?? 0) > 0;
  }

  get puedeAgregar(): boolean {
    if (!this.producto || !this.hayStock) return false;
    if (this.requiereVariante && !this.varianteSeleccionada) return false;
    if (this.producto.permitePersonalizacion) {
      if (!this.personalizacionNombre.trim() || !this.personalizacionNumero.trim()) {
        return false;
      }
    }
    return true;
  }

  cambiarCantidad(delta: number): void {
    const nueva = this.cantidad + delta;
    if (nueva >= 1 && nueva <= this.stockActual) {
      this.cantidad = nueva;
    }
  }

  agregarAlCarrito(): void {
    if (!this.producto || !this.puedeAgregar) return;

    const lineKey = buildLineKey(
      this.producto.id,
      this.varianteSeleccionada?.id,
      this.personalizacionNombre.trim() || undefined,
      this.personalizacionNumero.trim() || undefined
    );

    const stored = loadMerchCarrito();
    const existente = stored.find(s => s.lineKey === lineKey);

    if (existente) {
      const nuevaCantidad = existente.cantidad + this.cantidad;
      if (nuevaCantidad > this.stockActual) {
        alert(`Stock máximo disponible: ${this.stockActual}`);
        return;
      }
      existente.cantidad = nuevaCantidad;
    } else {
      const nuevo: MerchCarritoStored = {
        lineKey,
        productoId: this.producto.id,
        varianteId: this.varianteSeleccionada?.id,
        nombre: this.producto.nombre,
        talla: this.varianteSeleccionada?.talla ?? 'UNICA',
        cantidad: this.cantidad,
        precioUnitario: this.precioActual,
        personalizacionNombre: this.personalizacionNombre.trim() || undefined,
        personalizacionNumero: this.personalizacionNumero.trim() || undefined,
        imagenUrl: this.imagenes[0]?.url,
        stockMax: this.stockActual
      };
      stored.push(nuevo);
    }

    saveMerchCarrito(stored);
    this.carrito = stored.map(storedToCarritoItem);
    this.mostrarCarrito = true;
    this.cantidad = 1;
  }

  toggleDescripcion(): void {
    this.descripcionAbierta = !this.descripcionAbierta;
  }

  placeholderImagen(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFhMWExYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TaW4gaW1hZ2VuPC90ZXh0Pjwvc3ZnPg==';
  }

  onImageError(event: Event, _producto?: Producto): void {
    const img = event.target as HTMLImageElement;
    if (!img) return;
    img.onerror = null;
    img.src = this.placeholderImagen();
  }

  // Carrito
  private cargarCarrito(): void {
    this.carrito = loadMerchCarrito().map(storedToCarritoItem);
  }

  private persistirCarrito(): void {
    const stored = this.carrito.filter(i => i.tipo === 'merch').map(carritoItemToStored);
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
