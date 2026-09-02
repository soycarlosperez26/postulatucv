/**
 * Sanitiza un nombre de archivo para que sea URL-safe y compatible con Supabase Storage.
 *
 * - Normaliza caracteres Unicode (elimina acentos)
 * - Reemplaza espacios y caracteres no permitidos con guiones
 * - Colapsa guiones repetidos
 * - Preserva la extensión del archivo
 *
 * @param filename - El nombre original del archivo
 * @returns El nombre sanitizado, URL-safe
 *
 * @example
 * sanitizeFilename("Gustavo Pérez Cassiani.pdf") // => "Gustavo-Perez-Cassiani.pdf"
 * sanitizeFilename("CV final (2024).pdf")        // => "CV-final-2024.pdf"
 * sanitizeFilename("my   file.pdf")              // => "my-file.pdf"
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== "string") {
    return "file.pdf";
  }

  // Separar nombre y extensión
  const lastDotIndex = filename.lastIndexOf(".");
  let name = filename;
  let extension = ".pdf";

  if (lastDotIndex !== -1) {
    name = filename.slice(0, lastDotIndex);
    extension = filename.slice(lastDotIndex);
  }

  // Normalizar Unicode: NFD separa caracteres base de diacríticos
  // Luego elimina los diacríticos (código Unicode 0300-036F)
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Reemplazar todo lo que no sea alfanumérico, punto, guión bajo o guión con un guión
  const cleaned = normalized.replace(/[^a-zA-Z0-9._-]/g, "-");

  // Colapsar guiones múltiples en uno solo
  const collapsed = cleaned.replace(/-+/g, "-");

  // Eliminar guiones al inicio y final
  const trimmed = collapsed.replace(/^-+|-+$/g, "");

  // Si quedó vacío, usar fallback
  const finalName = trimmed || "cv";

  // Asegurar que la extensión sea .pdf (en minúsculas)
  const finalExtension = extension.toLowerCase() === ".pdf" ? ".pdf" : ".pdf";

  return `${finalName}${finalExtension}`;
}

/**
 * Tamaño máximo permitido para un archivo CV: 10 MB
 */
export const MAX_CV_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Valida que un archivo sea un PDF válido con tamaño permitido.
 *
 * @param file - El archivo a validar
 * @returns Un objeto con `valid` y opcionalmente `error`
 */
export function validateCvFile(file: File): { valid: boolean; error?: string } {
  if (!(file instanceof File) || file.size === 0) {
    return { valid: false, error: "Selecciona un archivo PDF." };
  }

  if (file.type !== "application/pdf") {
    return { valid: false, error: "Por ahora solo se aceptan archivos PDF." };
  }

  if (file.size > MAX_CV_SIZE_BYTES) {
    const maxSizeMB = Math.floor(MAX_CV_SIZE_BYTES / (1024 * 1024));
    return {
      valid: false,
      error: `El archivo es muy grande. El tamaño máximo es ${maxSizeMB} MB.`,
    };
  }

  return { valid: true };
}
