const fs = require('fs');
const path = require('path');

const frontendImagesPath = path.join(__dirname, '../Frontend/src/assets/images');
const vistaImagesPath = path.join(__dirname, 'src/assets/images');

console.log('👀 Monitoreando cambios en imágenes del Frontend...\n');
console.log('Presiona Ctrl+C para detener\n');

// Función para copiar archivos
function copyFile(src, dest) {
  try {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    return true;
  } catch (error) {
    console.error(`Error al copiar ${src}:`, error.message);
    return false;
  }
}

// Función para sincronizar un archivo
function syncFile(filePath) {
  const relativePath = path.relative(frontendImagesPath, filePath);
  const destPath = path.join(vistaImagesPath, relativePath);
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
    
    if (imageExtensions.includes(ext)) {
      copyFile(filePath, destPath);
      console.log(`✅ Sincronizado: ${relativePath}`);
    }
  }
}

// Función para sincronizar un directorio
function syncDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      syncDirectory(filePath);
    } else {
      syncFile(filePath);
    }
  });
}

// Sincronización inicial
console.log('🔄 Sincronización inicial...\n');
syncDirectory(frontendImagesPath);
console.log('\n✨ Sincronización inicial completada!\n');

// Monitorear cambios
if (fs.existsSync(frontendImagesPath)) {
  fs.watch(frontendImagesPath, { recursive: true }, (eventType, filename) => {
    if (filename) {
      const filePath = path.join(frontendImagesPath, filename);
      
      // Esperar un poco para que el archivo esté completamente escrito
      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          if (stats.isFile()) {
            syncFile(filePath);
          } else if (stats.isDirectory()) {
            syncDirectory(filePath);
          }
        }
      }, 100);
    }
  });
  
  console.log('✅ Monitoreo activo. Esperando cambios...\n');
} else {
  console.error('❌ No se encontró la carpeta de imágenes del Frontend');
  process.exit(1);
}

