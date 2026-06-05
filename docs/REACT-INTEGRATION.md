# Integración React en Angular (Vista-Clientes)

Angular sigue siendo la base del sitio público. React se usa solo para componentes puntuales (mapas, widgets, etc.) montados mediante un wrapper reutilizable.

## Dependencias

```bash
npm install react react-dom maplibre-gl
npm install --save-dev @types/react @types/react-dom
```

## Configuración TypeScript

En `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react",
    "allowSyntheticDefaultImports": true
  }
}
```

En `tsconfig.app.json`, incluir archivos `.tsx`:

```json
"include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.d.ts"]
```

## Wrapper genérico

`src/app/shared/react-wrapper/react-wrapper.component.ts`

- Recibe `component` (función React) y `props` vía `@Input()`
- Monta con `createRoot()` en `ngAfterViewInit`
- Re-renderiza en `ngOnChanges` cuando cambian props
- Desmonta en `ngOnDestroy`
- Ejecuta React **fuera de Zone.js** (`runOutsideAngular`) para evitar ciclos de detección innecesarios

### Uso en cualquier componente Angular standalone

```typescript
import { ReactWrapperComponent } from '../../shared/react-wrapper/react-wrapper.component';
import { MapComponent } from '../../shared/components/map/map.component';

@Component({
  imports: [ReactWrapperComponent],
  template: `
    <app-react-wrapper
      [component]="MapComponent"
      [props]="{ center: [-90.64, 14.65], zoom: 15 }">
    </app-react-wrapper>
  `
})
export class MiPaginaComponent {
  MapComponent = MapComponent;
}
```

## Agregar un nuevo componente React

1. Crear `src/app/shared/components/mi-widget/mi-widget.component.tsx`
2. Exportar una función React con props tipadas (`export interface MiWidgetProps { ... }`)
3. (Opcional) Crear `mi-widget-wrapper.component.ts` que encapsule props fijas del negocio
4. Importar el wrapper o `ReactWrapperComponent` en la página Angular
5. Si el componente usa CSS de librerías externas, añadir el CSS en `angular.json` → `styles`

### Ejemplo mínimo

```tsx
// mi-widget.component.tsx
import React from 'react';

export interface MiWidgetProps {
  titulo: string;
}

export function MiWidget({ titulo }: MiWidgetProps) {
  return <div className="mi-widget">{titulo}</div>;
}
```

## Mapa (MapLibre / estilo mapcn)

`src/app/shared/components/map/map.component.tsx` usa **MapLibre GL** con el basemap oscuro CARTO (`dark-matter`), el mismo que recomienda [mapcn](https://mapcn.dev).

> **Nota:** El paquete `@mapcn/map` vía shadcn requiere Tailwind + shadcn/ui. Este proyecto usa MapLibre directamente en React para evitar esa dependencia, manteniendo el mismo estilo y controles de navegación.

Uso simplificado en plantillas:

```html
<app-map-wrapper></app-map-wrapper>
```

## Producción (Railway)

- Los `.tsx` se compilan con el build estándar: `npm run build`
- No se requiere servidor Node separado para React
- `maplibre-gl.css` está registrado en `angular.json`

## Estructura de archivos

```
src/app/shared/
├── react-wrapper/
│   └── react-wrapper.component.ts
└── components/
    └── map/
        ├── map.component.tsx      ← React
        └── map-wrapper.component.ts ← Angular
```

## Buenas prácticas

- Mantener componentes React pequeños y con props explícitas
- Preferir wrappers Angular (`*-wrapper.component.ts`) para props de dominio fijas
- Estilos globales de librerías (MapLibre, etc.) en `src/styles/`, no en componentes Angular
- Si un widget React necesita comunicarse con Angular, pasar callbacks en `props` o usar un servicio Angular inyectado en el wrapper y pasado como prop
