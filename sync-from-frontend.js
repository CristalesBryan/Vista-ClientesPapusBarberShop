/**
 * Script para sincronizar componentes, servicios y modelos desde el Frontend
 * Ejecutar con: node sync-from-frontend.js
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_PATH = path.join(__dirname, '..', 'Frontend', 'src', 'app');
const VISTA_PATH = path.join(__dirname, 'src', 'app');

// Archivos y carpetas a sincronizar
const SYNC_ITEMS = [
  // Componentes de páginas
  {
    from: 'pages/citas',
    to: 'pages/citas',
    description: 'Componente de Citas'
  },
  {
    from: 'pages/compra-aqui',
    to: 'pages/compra-aqui',
    description: 'Componente de Compra Aquí'
  },
  {
    from: 'pages/acerca-de-nosotros',
    to: 'pages/acerca-de-nosotros',
    description: 'Componente de Acerca de Nosotros'
  },
  {
    from: 'pages/academia',
    to: 'pages/academia',
    description: 'Componente de Academia'
  },
  // Servicios
  {
    from: 'services/cita.service.ts',
    to: 'services/cita.service.ts',
    description: 'Servicio de Citas'
  },
  {
    from: 'services/producto.service.ts',
    to: 'services/producto.service.ts',
    description: 'Servicio de Productos'
  },
  {
    from: 'services/barbero.service.ts',
    to: 'services/barbero.service.ts',
    description: 'Servicio de Barberos'
  },
  {
    from: 'services/tipo-corte.service.ts',
    to: 'services/tipo-corte.service.ts',
    description: 'Servicio de Tipos de Corte'
  },
  {
    from: 'services/auth.service.ts',
    to: 'services/auth.service.ts',
    description: 'Servicio de Autenticación'
  },
  // Modelos
  {
    from: 'models/cita.model.ts',
    to: 'models/cita.model.ts',
    description: 'Modelo de Cita'
  },
  {
    from: 'models/producto.model.ts',
    to: 'models/producto.model.ts',
    description: 'Modelo de Producto'
  },
  {
    from: 'models/barbero.model.ts',
    to: 'models/barbero.model.ts',
    description: 'Modelo de Barbero'
  },
  {
    from: 'models/tipo-corte-api.model.ts',
    to: 'models/tipo-corte-api.model.ts',
    description: 'Modelo de Tipo de Corte API'
  },
  // Interceptors y Guards
  {
    from: 'interceptors/auth.interceptor.ts',
    to: 'interceptors/auth.interceptor.ts',
    description: 'Interceptor de Autenticación'
  },
  {
    from: 'guards/auth.guard.ts',
    to: 'guards/auth.guard.ts',
    description: 'Guard de Autenticación'
  }
];

function copyFile(src, dest) {
  try {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    return true;
  } catch (error) {
    console.error(`Error copiando ${src}:`, error.message);
    return false;
  }
}

function copyDirectory(src, dest) {
  try {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const files = fs.readdirSync(src);
    files.forEach(file => {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      
      const stat = fs.statSync(srcPath);
      if (stat.isDirectory()) {
        copyDirectory(srcPath, destPath);
      } else {
        copyFile(srcPath, destPath);
      }
    });
    return true;
  } catch (error) {
    console.error(`Error copiando directorio ${src}:`, error.message);
    return false;
  }
}

function syncItem(item) {
  const fromPath = path.join(FRONTEND_PATH, item.from);
  const toPath = path.join(VISTA_PATH, item.to);

  if (!fs.existsSync(fromPath)) {
    console.warn(`⚠️  No existe: ${fromPath}`);
    return false;
  }

  const stat = fs.statSync(fromPath);
  if (stat.isDirectory()) {
    return copyDirectory(fromPath, toPath);
  } else {
    return copyFile(fromPath, toPath);
  }
}

function main() {
  console.log('🔄 Sincronizando archivos desde Frontend...\n');

  let successCount = 0;
  let failCount = 0;

  SYNC_ITEMS.forEach(item => {
    console.log(`📦 ${item.description}...`);
    if (syncItem(item)) {
      console.log(`   ✅ Sincronizado correctamente\n`);
      successCount++;
    } else {
      console.log(`   ❌ Error al sincronizar\n`);
      failCount++;
    }
  });

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Sincronizados: ${successCount}`);
  console.log(`❌ Errores: ${failCount}`);
  console.log('='.repeat(50));
}

main();

