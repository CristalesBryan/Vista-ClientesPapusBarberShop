const fs = require('fs');
const path = require('path');

const frontendImagesPath = path.join(__dirname, '../Frontend/src/assets/images');
const vistaImagesPath = path.join(__dirname, 'src/assets/images');

console.log('🔄 Sincronizando imágenes del Frontend a Vista Para Clientes...\n');

// Función para copiar archivos recursivamente
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Sincronizar carpeta de Productos
const frontendProductosPath = path.join(frontendImagesPath, 'Productos');
const vistaProductosPath = path.join(vistaImagesPath, 'Productos');

if (fs.existsSync(frontendProductosPath)) {
  console.log('📦 Sincronizando imágenes de productos...');
  if (!fs.existsSync(vistaProductosPath)) {
    fs.mkdirSync(vistaProductosPath, { recursive: true });
  }
  
  const productos = fs.readdirSync(frontendProductosPath);
  let copied = 0;
  let updated = 0;
  
  productos.forEach(file => {
    const srcFile = path.join(frontendProductosPath, file);
    const destFile = path.join(vistaProductosPath, file);
    
    if (fs.statSync(srcFile).isFile()) {
      const srcStats = fs.statSync(srcFile);
      let shouldCopy = false;
      
      if (!fs.existsSync(destFile)) {
        shouldCopy = true;
        copied++;
      } else {
        const destStats = fs.statSync(destFile);
        if (srcStats.mtime > destStats.mtime) {
          shouldCopy = true;
          updated++;
        }
      }
      
      if (shouldCopy) {
        fs.copyFileSync(srcFile, destFile);
        console.log(`  ✓ ${file} ${!fs.existsSync(destFile) ? '(nuevo)' : '(actualizado)'}`);
      }
    }
  });
  
  console.log(`\n✅ Productos: ${copied} nuevos, ${updated} actualizados\n`);
} else {
  console.log('⚠️  No se encontró la carpeta de productos en el Frontend\n');
}

// Sincronizar imágenes generales
console.log('🖼️  Sincronizando imágenes generales...');
const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];

if (fs.existsSync(frontendImagesPath)) {
  const files = fs.readdirSync(frontendImagesPath);
  let copied = 0;
  let updated = 0;
  
  files.forEach(file => {
    const filePath = path.join(frontendImagesPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isFile()) {
      const ext = path.extname(file).toLowerCase();
      if (imageExtensions.includes(ext)) {
        const destFile = path.join(vistaImagesPath, file);
        let shouldCopy = false;
        
        if (!fs.existsSync(destFile)) {
          shouldCopy = true;
          copied++;
        } else {
          const destStats = fs.statSync(destFile);
          if (stats.mtime > destStats.mtime) {
            shouldCopy = true;
            updated++;
          }
        }
        
        if (shouldCopy) {
          fs.copyFileSync(filePath, destFile);
          console.log(`  ✓ ${file} ${!fs.existsSync(destFile) ? '(nuevo)' : '(actualizado)'}`);
        }
      }
    }
  });
  
  console.log(`\n✅ Imágenes generales: ${copied} nuevos, ${updated} actualizados\n`);
}

console.log('✨ Sincronización completada!\n');

