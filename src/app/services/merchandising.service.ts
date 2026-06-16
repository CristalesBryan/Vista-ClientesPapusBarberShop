import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductoMerch, VentaMerchCreate } from '../models/merchandising.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MerchandisingService {
  private readonly API_URL = `${environment.apiUrl}/merchandising`;

  constructor(private http: HttpClient) {}

  getProductos(): Observable<ProductoMerch[]> {
    return this.http.get<ProductoMerch[]>(`${this.API_URL}/productos`);
  }

  getProducto(id: number): Observable<ProductoMerch> {
    return this.http.get<ProductoMerch>(`${this.API_URL}/productos/${id}`);
  }

  registrarVenta(venta: VentaMerchCreate): Observable<unknown> {
    return this.http.post(`${environment.apiUrl}/ventas-merch`, venta);
  }
}
