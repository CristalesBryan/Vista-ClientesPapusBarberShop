/**
 * Script para sincronizar automáticamente cuando cambian archivos en el Frontend
 * Ejecutar con: npm run sync:watch
 * 
 * Requiere: npm install chokidar --save-dev
 */

const fs = require('fs');
const path = require('path');

// Intentar usar chokidar si está disponible
let chokidar;
try {
  chokidar = require('chokidar');
} catch (e) {
  console.error('❌ chokidar no está instalado.');
  console.log('📦 Instalando chokidar...');
  console.log('   Ejecuta: npm install chokidar --save-dev');
  process.exit(1);
}

const FRONTEND_PATH = path.join(__dirname, '..', 'Frontend', 'src', 'app');
const VISTA_PATH = path.join(__dirname, 'src', 'app');

// Patrones de archivos a observar
const WATCH_PATTERNS = [
  'pages/citas/**/*',
  'pages/compra-aqui/**/*',
  'pages/acerca-de-nosotros/**/*',
  'pages/academia/**/*',
  'services/cita.service.ts',
  'services/producto.service.ts',
  'services/barbero.service.ts',
  'services/tipo-corte.service.ts',
  'services/auth.service.ts',
  'models/cita.model.ts',
  'models/producto.model.ts',
  'models/barbero.model.ts',
  'models/tipo-corte-api.model.ts',
  'interceptors/auth.interceptor.ts',
  'guards/auth.guard.ts'
];

function getDestPath(frontendFilePath) {
  const relativePath = path.relative(FRONTEND_PATH, frontendFilePath);
  return path.join(VISTA_PATH, relativePath);
}

function copyFile(src, dest) {
  try {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    const fileName = path.basename(src);
    console.log(`✅ Sincronizado: ${fileName}`);
    return true;
  } catch (error) {
    console.error(`❌ Error copiando ${src}:`, error.message);
    return false;
  }
}

function syncFile(filePath) {
  const destPath = getDestPath(filePath);
  
  // Solo sincronizar si el archivo existe en el Frontend
  if (fs.existsSync(filePath)) {
    copyFile(filePath, destPath);
  }
}

console.log('👀 Observando cambios en el Frontend...\n');
console.log('📁 Directorio observado:', FRONTEND_PATH);
console.log('📁 Directorio destino:', VISTA_PATH);
console.log('\n⏳ Esperando cambios...\n');

// Crear watchers para cada patrón
WATCH_PATTERNS.forEach(pattern => {
  const watchPath = path.join(FRONTEND_PATH, pattern);
  
  chokidar.watch(watchPath, {
    ignored: /(^|[\/\\])\../, // ignorar archivos ocultos
    persistent: true,
    ignoreInitial: false
  })
  .on('add', (filePath) => {
    console.log(`📄 Archivo agregado: ${path.relative(FRONTEND_PATH, filePath)}`);
    syncFile(filePath);
  })
  .on('change', (filePath) => {
    console.log(`🔄 Archivo modificado: ${path.relative(FRONTEND_PATH, filePath)}`);
    syncFile(filePath);
  })
  .on('unlink', (filePath) => {
    const destPath = getDestPath(filePath);
    if (fs.existsSync(destPath)) {
      try {
        fs.unlinkSync(destPath);
        console.log(`🗑️  Archivo eliminado: ${path.relative(FRONTEND_PATH, filePath)}`);
      } catch (error) {
        console.error(`❌ Error eliminando ${destPath}:`, error.message);
      }
    }
  })
  .on('error', (error) => {
    console.error('❌ Error del watcher:', error);
  });
});

console.log('✅ Watchers configurados. Presiona Ctrl+C para detener.\n');

