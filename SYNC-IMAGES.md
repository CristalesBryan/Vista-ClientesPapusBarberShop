# Sincronización Automática de Imágenes

Este proyecto incluye scripts para sincronizar automáticamente las imágenes del Frontend a Vista Para Clientes.

## Scripts Disponibles

### 1. Sincronización Manual
```bash
npm run sync:images
```
Sincroniza todas las imágenes del Frontend a Vista Para Clientes una vez.

### 2. Sincronización Automática (Watch Mode)
```bash
npm run sync:images:watch
```
Monitorea cambios en el Frontend y sincroniza automáticamente cuando se agregan o modifican imágenes.

### 3. Desarrollo con Sincronización
```bash
npm run dev
```
Sincroniza código e imágenes antes de iniciar el servidor de desarrollo.

## Cómo Funciona

1. **Sincronización de Productos**: Copia todas las imágenes de `Frontend/src/assets/images/Productos/` a `Vista Para Clientes/src/assets/images/Productos/`

2. **Sincronización de Imágenes Generales**: Copia todas las imágenes generales (png, jpg, jpeg, gif, webp, svg) del Frontend a Vista Para Clientes

3. **Detección de Cambios**: El modo watch detecta cuando se agregan, modifican o eliminan archivos en el Frontend y los sincroniza automáticamente

## Carga Automática de Imágenes

El sistema está configurado para:

1. **Intentar localmente primero**: Busca la imagen en `Vista Para Clientes/src/assets/images/`
2. **Fallback al Frontend**: Si no encuentra localmente, intenta cargar desde `http://localhost:4200/assets/images/`
3. **Múltiples variaciones**: Prueba diferentes formatos de nombre (camelCase, sin espacios, etc.) y extensiones (.jpg, .jpeg, .png, etc.)

## Notas

- Las imágenes se sincronizan automáticamente cuando usas `sync:images:watch`
- Si agregas una nueva imagen en el Frontend, se copiará automáticamente a Vista Para Clientes
- El sistema intenta cargar desde el Frontend si la imagen no existe localmente
- Para mejor rendimiento, ejecuta `sync:images:watch` en una terminal separada mientras desarrollas

