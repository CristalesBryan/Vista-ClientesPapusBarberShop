# Solución de Errores

## Error: "Cannot GET /"

Este error generalmente indica un problema de compilación. Sigue estos pasos:

### Paso 1: Detener el servidor
Presiona `Ctrl+C` en la terminal donde está corriendo `ng serve`

### Paso 2: Limpiar y reinstalar
```bash
# Eliminar node_modules y package-lock.json
rm -rf node_modules package-lock.json

# O en Windows PowerShell:
Remove-Item -Recurse -Force node_modules, package-lock.json

# Reinstalar dependencias
npm install
```

### Paso 3: Verificar errores de compilación
```bash
ng build
```

Si hay errores, corrígelos antes de continuar.

### Paso 4: Reiniciar el servidor
```bash
ng serve
```

## Si el problema persiste

1. **Verifica la consola del navegador** (F12) para ver errores específicos
2. **Verifica la terminal** donde corre `ng serve` para ver errores de compilación
3. **Asegúrate de que el puerto no esté en uso** - usa otro puerto si es necesario

## Verificar que todo esté correcto

Asegúrate de que:
- ✅ `src/app/pages/home/home.component.ts` existe
- ✅ `src/app/app.routes.ts` tiene la ruta para home
- ✅ `src/app/app.config.ts` tiene `provideRouter(routes)`
- ✅ `src/main.ts` está correctamente configurado

