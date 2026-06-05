import { Component } from '@angular/core';
import { ReactWrapperComponent } from '../../react-wrapper/react-wrapper.component';
import { MapComponent, type PapusMapProps } from './map.component';

/** Wrapper Angular del mapa React (Papus BarberShop). */
@Component({
  selector: 'app-map-wrapper',
  standalone: true,
  imports: [ReactWrapperComponent],
  template: `
    <app-react-wrapper
      [component]="mapComponent"
      [props]="mapProps">
    </app-react-wrapper>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 400px;
      }
    `
  ]
})
export class MapWrapperComponent {
  readonly mapComponent = MapComponent;

  readonly mapProps: PapusMapProps = {
    center: [-90.6412, 14.7089],
    zoom: 16,
    businessName: 'Papus BarberShop',
    address: 'Lote 30 Mz. F, Col. Villa Verde'
  };
}
