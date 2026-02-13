# Sincronización con Frontend

Este proyecto puede sincronizarse automáticamente con el Frontend para mantener los componentes actualizados.

## Opciones de Sincronización

### Opción 1: Sincronización Manual

Ejecuta el script cuando quieras actualizar los componentes:

```bash
npm run sync
```

Esto copiará todos los componentes, servicios y modelos desde el Frontend.

### Opción 2: Sincronización Automática (Watch Mode)

Para sincronizar automáticamente cuando cambien archivos en el Frontend:

1. **Instalar chokidar** (solo la primera vez):
```bash
npm install chokidar --save-dev
```

2. **Iniciar el modo watch**:
```bash
npm run sync:watch
```

Esto observará los cambios en el Frontend y los sincronizará automáticamente.

### Opción 3: Desarrollo con Sincronización

Para sincronizar y luego iniciar el servidor:

```bash
npm run dev
```

## Archivos Sincronizados

Los siguientes archivos se sincronizan desde el Frontend:

### Componentes
- `pages/citas/` - Componente de Citas
- `pages/compra-aqui/` - Componente de Compra Aquí
- `pages/acerca-de-nosotros/` - Componente de Acerca de Nosotros
- `pages/academia/` - Componente de Academia

### Servicios
- `services/cita.service.ts`
- `services/producto.service.ts`
- `services/barbero.service.ts`
- `services/tipo-corte.service.ts`
- `services/auth.service.ts`

### Modelos
- `models/cita.model.ts`
- `models/producto.model.ts`
- `models/barbero.model.ts`
- `models/tipo-corte-api.model.ts`

### Interceptors y Guards
- `interceptors/auth.interceptor.ts`
- `guards/auth.guard.ts`

## Notas Importantes

⚠️ **Advertencia**: La sincronización sobrescribirá los archivos en este proyecto. Si haces cambios personalizados en este proyecto, se perderán al sincronizar.

💡 **Recomendación**: Si necesitas hacer cambios personalizados, hazlos en el Frontend y luego sincroniza, o modifica el script de sincronización para excluir archivos específicos.

## Imágenes

Las imágenes se comparten automáticamente a través de la configuración en `angular.json`. No necesitan sincronización manual.

