import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { createElement, type ComponentType } from 'react';
import { createRoot, type Root } from 'react-dom/client';

/**
 * Monta cualquier componente React dentro de Angular.
 * Ejemplo: <app-react-wrapper [component]="MiComponente" [props]="{ foo: 'bar' }" />
 */
@Component({
  selector: 'app-react-wrapper',
  standalone: true,
  template: '<div #reactHost class="react-wrapper-host"></div>',
  styles: [
    `
      :host {
        display: block;
      }
      .react-wrapper-host {
        width: 100%;
        height: 100%;
      }
    `
  ]
})
export class ReactWrapperComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('reactHost', { static: true }) reactHost!: ElementRef<HTMLDivElement>;

  /** Componente React (función o clase). */
  @Input({ required: true }) component!: ComponentType<object>;

  /** Props que se pasan al componente React. */
  @Input() props: object = {};

  private root: Root | null = null;
  private viewReady = false;

  constructor(private readonly ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.renderReact();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.viewReady) {
      return;
    }
    if (changes['component'] || changes['props']) {
      this.renderReact();
    }
  }

  ngOnDestroy(): void {
    this.unmountReact();
  }

  private renderReact(): void {
    if (!this.component || !this.reactHost?.nativeElement) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      if (!this.root) {
        this.root = createRoot(this.reactHost.nativeElement);
      }
      this.root.render(createElement(this.component, this.props));
    });
  }

  private unmountReact(): void {
    if (!this.root) {
      return;
    }
    this.ngZone.runOutsideAngular(() => {
      this.root?.unmount();
      this.root = null;
    });
  }
}
