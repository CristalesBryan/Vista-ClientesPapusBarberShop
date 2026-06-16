import { CarritoItem } from '../components/papus-carrito/papus-carrito.component';

export const MERCH_CARRITO_KEY = 'papusMerchCarrito';

export interface MerchCarritoStored {
  lineKey: string;
  productoId: number;
  varianteId?: number;
  nombre: string;
  talla: string;
  cantidad: number;
  precioUnitario: number;
  personalizacionNombre?: string;
  personalizacionNumero?: string;
  imagenUrl?: string;
  stockMax: number;
}

export function buildLineKey(
  productoId: number,
  varianteId?: number,
  persNombre?: string,
  persNumero?: string
): string {
  return `${productoId}-${varianteId ?? 'base'}-${persNombre ?? ''}-${persNumero ?? ''}`;
}

export function loadMerchCarrito(): MerchCarritoStored[] {
  try {
    const raw = localStorage.getItem(MERCH_CARRITO_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveMerchCarrito(items: MerchCarritoStored[]): void {
  localStorage.setItem(MERCH_CARRITO_KEY, JSON.stringify(items));
}

export function storedToCarritoItem(stored: MerchCarritoStored): CarritoItem {
  return {
    producto: {
      id: stored.productoId,
      nombre: stored.nombre,
      stock: stored.stockMax,
      precioCosto: 0,
      precioVenta: stored.precioUnitario,
      comision: 0,
      imagenUrl: stored.imagenUrl
    },
    cantidad: stored.cantidad,
    tipo: 'merch',
    lineKey: stored.lineKey,
    varianteId: stored.varianteId,
    talla: stored.talla,
    precioUnitario: stored.precioUnitario,
    personalizacionNombre: stored.personalizacionNombre,
    personalizacionNumero: stored.personalizacionNumero
  };
}

export function carritoItemToStored(item: CarritoItem): MerchCarritoStored {
  return {
    lineKey: item.lineKey!,
    productoId: item.producto.id,
    varianteId: item.varianteId,
    nombre: item.producto.nombre,
    talla: item.talla ?? 'UNICA',
    cantidad: item.cantidad,
    precioUnitario: item.precioUnitario ?? item.producto.precioVenta,
    personalizacionNombre: item.personalizacionNombre,
    personalizacionNumero: item.personalizacionNumero,
    imagenUrl: item.producto.imagenUrl,
    stockMax: item.producto.stock
  };
}
