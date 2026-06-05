import { Component } from '@angular/core';
import { ReactWrapperComponent } from '../../react-wrapper/react-wrapper.component';
import { MapComponent, type PapusMapProps } from './map.component';
import {
  PAPUS_ADDRESS_SHORT,
  PAPUS_MAP_CENTER,
  PAPUS_MAP_ZOOM
} from '../../constants/papus-location';

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
    center: PAPUS_MAP_CENTER,
    zoom: PAPUS_MAP_ZOOM,
    businessName: 'Papus BarberShop',
    address: PAPUS_ADDRESS_SHORT
  };
}
