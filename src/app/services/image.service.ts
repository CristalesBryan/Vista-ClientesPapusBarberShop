import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  // Ruta base del Frontend para las imágenes
  private frontendBaseUrl = environment.frontendAssetsUrl;

  /**
   * Obtiene la URL de una imagen, primero intentando desde assets locales, luego desde el Frontend
   * @param imagePath Ruta relativa de la imagen (ej: 'encabezado.png', 'Productos/cerabarba.jpg')
   * @returns URL completa de la imagen
   */
  getImageUrl(imagePath: string, useCache: boolean = true): string {
    // Si la ruta ya es absoluta o completa, retornarla tal cual
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Usar timestamp fijo para evitar ExpressionChangedAfterItHasBeenCheckedError
    // Solo agregar timestamp si no se usa cache (para forzar recarga)
    const timestamp = useCache ? '' : `?t=${new Date().getTime()}`;
    
    // PRIMERO: Intentar desde assets locales (Vista Para Clientes)
    // Normalizar la ruta para que siempre empiece con /assets/images
    let cleanPath = imagePath;
    
    // Decodificar si el nombre del archivo está codificado en URL (ej: %C3%B1a -> ñ)
    // Esto puede pasar si el nombre se guardó incorrectamente codificado en localStorage
    try {
      if (cleanPath.includes('%')) {
        // Decodificar solo la parte del nombre del archivo, no toda la ruta
        const parts = cleanPath.split('/');
        const fileName = parts[parts.length - 1];
        if (fileName.includes('%')) {
          const decodedFileName = decodeURIComponent(fileName);
          parts[parts.length - 1] = decodedFileName;
          cleanPath = parts.join('/');
        }
      }
    } catch (e) {
      // Si falla la decodificación, usar el path original
      console.warn('[ImageService] No se pudo decodificar el nombre del archivo:', imagePath);
    }
    
    // Si ya empieza con /assets/images, usar directamente
    if (cleanPath.startsWith('/assets/images/')) {
      const url = timestamp ? `${cleanPath}${timestamp}` : cleanPath;
      return url;
    }
    
    // Si empieza con /assets pero no con /assets/images, ajustar
    if (cleanPath.startsWith('/assets/')) {
      cleanPath = cleanPath.replace('/assets/', '/assets/images/');
    } else {
      // Si no empieza con /, agregarlo
      if (!cleanPath.startsWith('/')) {
        cleanPath = `/${cleanPath}`;
      }
      // Agregar /assets/images al inicio si no está
      if (!cleanPath.startsWith('/assets/images')) {
        cleanPath = `/assets/images${cleanPath}`;
      }
    }
    
    const urlLocal = timestamp ? `${cleanPath}${timestamp}` : cleanPath;
    // Retornar URL local (Angular servirá desde assets automáticamente)
    // Si la imagen no existe localmente, el navegador mostrará error y onImageError intentará desde el Frontend
    return urlLocal;
  }

  /**
   * Obtiene la URL de una imagen de producto
   * @param productName Nombre del producto
   * @param extension Extensión del archivo (por defecto 'jpg')
   * @returns URL completa de la imagen del producto
   */
  getProductImageUrl(productName: string, extension: string = 'jpg'): string {
    const nombre = productName.toLowerCase();
    const nombreSinEspacios = nombre.replace(/\s+/g, '');
    return this.getImageUrl(`Productos/${nombreSinEspacios}.${extension}`);
  }

  /**
   * Obtiene la URL de una imagen de producto con diferentes variaciones
   * @param productName Nombre del producto
   * @param variations Array de variaciones del nombre a intentar
   * @returns URL de la primera variación
   */
  getProductImageUrlWithVariations(productName: string, variations: string[] = []): string {
    if (variations.length > 0) {
      return this.getImageUrl(`Productos/${variations[0]}.jpg`);
    }
    return this.getProductImageUrl(productName);
  }

  /**
   * Handles image loading errors by attempting different filename variations and extensions.
   * @param event The error event from the <img> element.
   * @param originalFileName The original file name or product name to derive variations.
   * @param category The category of the image (e.g., 'Productos', 'Barberos').
   * @param attemptsMap A map to keep track of attempts for a specific image.
   * @param id A unique identifier for the image (e.g., product ID) to track attempts.
   */
  onImageError(event: Event, originalFileName: string, category: string, attemptsMap: Map<any, number>, id: any): void {
    const img = event.target as HTMLImageElement;
    if (!img) return;

    let attempt = attemptsMap.get(id) || 0;
    attemptsMap.set(id, attempt + 1);

    const name = originalFileName.toLowerCase();
    const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

    // Generate different variations of the name
    // Eliminar palabras comunes como "para", "el", "la", "de", "del"
    const palabrasExcluidas = ['para', 'el', 'la', 'de', 'del', 'los', 'las'];
    const words = name.split(' ').filter(p => p.length > 0 && !palabrasExcluidas.includes(p));
    const camelCaseSinExcluidas = words.length > 0
      ? words[0] + words.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('')
      : name.replace(/\s*(para|el|la|de|del|los|las)\s*/g, '');

    const allWords = name.split(' ').filter(p => p.length > 0);
    const camelCaseCompleto = allWords.length > 0
      ? allWords[0] + allWords.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('')
      : name;

    const variations = [
      camelCaseSinExcluidas,                    // PRIORIDAD 1: "perfumeCabello" (sin "Para el")
      name.replace(/\s*(para|el|la|de|del|los|las)\s*/g, '').replace(/\s+/g, ''), // PRIORIDAD 2: "perfumecabello"
      words[0] || (allWords.length > 0 ? allWords[0] : name.split(' ')[0]), // PRIORIDAD 3: "perfume" (solo primera palabra relevante)
      // Variaciones con todas las palabras (menor prioridad)
      camelCaseCompleto,                         // "perfumeParaElCabello" (con todas las palabras)
      name.replace(/\s+/g, ''),                 // "perfumeparaelcabello"
      name.replace(/[^a-z0-9]/g, ''),           // "perfumeparaelcabello" (sin caracteres especiales)
      name.replace(/\s+/g, '_'),                 // "perfume_para_el_cabello"
      name.replace(/\s+/g, '-'),                 // "perfume-para-el-cabello"
      // Variaciones con primera letra mayúscula
      camelCaseSinExcluidas.length > 0 ? camelCaseSinExcluidas.charAt(0).toUpperCase() + camelCaseSinExcluidas.slice(1) : '', // "PerfumeCabello"
      words.length > 0 ? words[0].charAt(0).toUpperCase() + words[0].slice(1) : '', // "Perfume"
      // Variación con todas las palabras en mayúscula inicial (menor prioridad)
      allWords.length > 0 ? allWords.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('') : '', // "PerfumeParaElCabello"
      allWords.length > 0 ? allWords.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') : '', // "Perfume Para El Cabello"
    ].filter(v => v.length > 0); // Eliminar variaciones vacías
    
    // Eliminar duplicados
    const variationsUnicas = [...new Set(variations)];

    // Estrategia mejorada: Intentar solo las variaciones más probables primero
    // Priorizar las primeras 2 variaciones (sin palabras excluidas) con las extensiones más comunes
    const extensionesComunes = ['.jpg', '.jpeg', '.png']; // Extensiones más comunes primero
    const extensionesRestantes = extensions.filter(ext => !extensionesComunes.includes(ext));
    
    // Calcular total de variaciones
    const totalVariaciones = variationsUnicas.length * extensions.length;
    
    // Intentar solo las 2 primeras variaciones (las más probables) con extensiones comunes localmente
    const maxIntentosLocales = Math.min(2 * extensionesComunes.length, totalVariaciones); // Solo 2 variaciones x 3 extensiones = 6 intentos locales
    const totalIntentos = maxIntentosLocales + (variationsUnicas.length * extensions.length); // Local (6) + Frontend (todas)

    if (attempt < totalIntentos) {
      let variationIndex, extensionIndex, newPath;
      
      if (attempt < maxIntentosLocales) {
        // Primero intentar localmente con las variaciones más probables y extensiones comunes
        if (attempt < variationsUnicas.length * extensionesComunes.length) {
          // Usar solo las primeras variaciones con extensiones comunes
          variationIndex = Math.floor(attempt / extensionesComunes.length);
          extensionIndex = attempt % extensionesComunes.length;
          const extension = extensionesComunes[extensionIndex];
          newPath = `${category}/${variationsUnicas[variationIndex]}${extension}`;
        } else {
          // Si ya intentamos las comunes, usar extensiones restantes
          const attemptRestantes = attempt - (variationsUnicas.length * extensionesComunes.length);
          variationIndex = Math.floor(attemptRestantes / extensionesRestantes.length);
          extensionIndex = attemptRestantes % extensionesRestantes.length;
          newPath = `${category}/${variationsUnicas[variationIndex]}${extensionesRestantes[extensionIndex]}`;
        }
        const urlLocal = `/assets/images/${newPath}`;
        // Solo loggear en modo desarrollo o si es el primer intento
        if (attempt === 0) {
          console.log(`[ImageService] Intentando cargar imagen local: ${newPath}`);
        }
        img.src = urlLocal;
      } else {
        // Después de intentos locales, intentar desde Frontend con todas las variaciones
        const frontendAttempt = attempt - maxIntentosLocales;
        variationIndex = Math.floor(frontendAttempt / extensions.length);
        extensionIndex = frontendAttempt % extensions.length;
        newPath = `${category}/${variationsUnicas[variationIndex]}${extensions[extensionIndex]}`;
        const timestamp = new Date().getTime();
        const rutaRelativa = `/${newPath}`;
        const urlFrontend = `${this.frontendBaseUrl}${rutaRelativa}?t=${timestamp}`;
        // Solo loggear los primeros intentos desde Frontend
        if (frontendAttempt < 3) {
          console.log(`[ImageService] Intentando desde Frontend: ${newPath}`);
        }
        img.src = urlFrontend;
      }
    } else {
      // Después de todos los intentos, mostrar placeholder
      img.onerror = null; // Prevent infinite loop
      img.style.display = 'none';
      if (img.parentElement) {
        img.parentElement.innerHTML = `<div class="${category.toLowerCase()}-imagen-placeholder"><i class="fas fa-image fa-3x"></i><p>Sin imagen</p></div>`;
      }
      // Solo loggear una vez cuando se agotan todos los intentos
      console.log(`[ImageService] No se pudo cargar imagen para "${originalFileName}" después de ${totalIntentos} intentos`);
    }
  }
}

