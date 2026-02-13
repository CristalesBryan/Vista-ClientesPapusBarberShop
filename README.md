# Vista Para Clientes - Papus Barbershop

Proyecto Angular para la vista pública de clientes de Papus Barbershop.

## Características

- **Página de Bienvenida**: Página principal sin login con acceso a todas las vistas
- **Citas**: Gestión y agendamiento de citas
- **Compra Aquí**: Catálogo de productos con carrito de compras
- **Acerca de Nosotros**: Información de la barbería
- **Academia**: Página en construcción

## Configuración de Imágenes

Las imágenes se cargan desde el proyecto Frontend. Para que funcionen correctamente:

### Opción 1: Compartir assets (Recomendado)

El `angular.json` ya está configurado para copiar los assets del Frontend durante el build. Asegúrate de que la ruta relativa sea correcta:

```json
{
  "glob": "**/*",
  "input": "../Frontend/src/assets",
  "output": "/assets"
}
```

### Opción 2: Servir desde el mismo servidor

Si ambos proyectos están en el mismo servidor, las imágenes se cargarán desde `/assets/images` que es compartido.

### Opción 3: Configurar proxy (Desarrollo)

Puedes agregar una configuración de proxy en `proxy.conf.js` para redirigir las peticiones de imágenes al Frontend.

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Ejecutar en desarrollo:
```bash
ng serve
```

3. El proyecto estará disponible en `http://localhost:4200`

## Rutas

- `/` - Página de bienvenida (Home)
- `/citas` - Gestión de citas
- `/compra-aqui` - Catálogo de productos
- `/acerca-de-nosotros` - Información de la barbería
- `/academia` - Academia (en construcción)

## Backend

El proyecto está configurado para conectarse al backend en `http://localhost:8080`. Asegúrate de que el backend esté ejecutándose.

## Notas

- Las rutas son públicas (sin autenticación requerida)
- Las imágenes se cargan desde `/assets/images` (compartido con Frontend)
- El proyecto usa el mismo backend que el Frontend principal

## Sincronización con Frontend

Este proyecto puede sincronizarse automáticamente con el Frontend. Ver [SYNC.md](./SYNC.md) para más detalles.

**Sincronización rápida:**
```bash
npm run sync        # Sincronización manual
npm run sync:watch  # Sincronización automática (requiere chokidar)
npm run dev         # Sincronizar y luego iniciar servidor
```

