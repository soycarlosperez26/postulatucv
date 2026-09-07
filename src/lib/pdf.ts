import { extractText } from "unpdf";

/**
 * Extrae el texto plano de un PDF usando unpdf (wrapper moderno de pdf.js).
 * 
 * Reemplaza pdf-parse porque unpdf:
 * - Usa una versión más reciente y tolerante de pdf.js
 * - Maneja mejor PDFs con XRef corrupto (ReportLab, etc.)
 * - Soporta caracteres especiales/acentuados sin fallar
 * - Está optimizado para Node.js/serverless
 * - Es activamente mantenido (2026)
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    // unpdf maneja automáticamente:
    // - Tablas XRef corruptas o no estándar
    // - Caracteres especiales/acentuados en metadatos
    // - Encoding no estándar (ReportLab, etc.)
    // - PDFs de Word, Google Docs, Canva, etc.
    
    // mergePages: true une todo el texto en un solo string
    const { text } = await extractText(buffer, { mergePages: true });
    
    const trimmedText = text.trim();
    if (!trimmedText) {
      throw new Error(
        "No se pudo extraer texto del PDF. ¿Es un PDF escaneado (imagen)?"
      );
    }
    
    console.log("[extractTextFromPdf] Successfully extracted text", {
      textLength: trimmedText.length,
      textPreview: trimmedText.slice(0, 100).replace(/\n/g, " "),
    });
    
    return trimmedText;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    
    console.error("[extractTextFromPdf] Extraction failed", {
      error: errorMessage,
      errorType: err instanceof Error ? err.constructor.name : typeof err,
    });
    
    // Errores de estructura PDF corrupta
    if (
      errorMessage.includes("Invalid PDF") ||
      errorMessage.includes("Invalid number") ||
      errorMessage.includes("bad XRef") ||
      errorMessage.includes("XRef entry") ||
      errorMessage.includes("charCode") ||
      errorMessage.includes("corrupted")
    ) {
      throw new Error(
        "El PDF tiene una estructura interna corrupta. Intenta:\n" +
        "1. Volver a guardar/exportar el PDF desde tu editor\n" +
        "2. Usar 'Imprimir como PDF' para crear una copia limpia\n" +
        "3. Convertirlo usando una herramienta online (ej. ilovepdf.com)"
      );
    }
    
    // PDFs protegidos con contraseña
    if (errorMessage.includes("password") || errorMessage.includes("encrypted")) {
      throw new Error(
        "El PDF está protegido con contraseña. Por favor sube un PDF sin protección."
      );
    }
    
    // Error genérico
    throw new Error(
      err instanceof Error
        ? err.message
        : "No se pudo leer el PDF. Verifica que el archivo no esté dañado."
    );
  }
}
