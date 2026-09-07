import pdfParse from "pdf-parse";

/**
 * Extrae el texto plano de un PDF. Solo se usa en server actions /
 * route handlers (server-side), nunca en el cliente.
 * 
 * Maneja robusto PDFs con problemas comunes:
 * - Tablas XRef corruptas o no estándar
 * - Caracteres especiales/acentuados en metadatos
 * - Encoding no estándar (ReportLab, etc.)
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    // Primera estrategia: usar pdf-parse con configuración estándar
    const result = await pdfParse(buffer);
    
    const text = result.text.trim();
    if (!text) {
      throw new Error(
        "No se pudo extraer texto del PDF. ¿Es un PDF escaneado (imagen)?"
      );
    }
    return text;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    
    // Errores de estructura PDF corrupta (XRef, encoding, etc.)
    if (
      errorMessage.includes("Invalid number") ||
      errorMessage.includes("bad XRef") ||
      errorMessage.includes("XRef entry") ||
      errorMessage.includes("charCode")
    ) {
      // Segunda estrategia: intentar con una versión más antigua de pdf.js
      // que es más tolerante con PDFs no estándares
      try {
        const result = await pdfParse(buffer, {
          version: "v1.10.88", // Versión más antigua y tolerante
        });
        
        const text = result.text.trim();
        if (!text) {
          throw new Error(
            "No se pudo extraer texto del PDF. ¿Es un PDF escaneado (imagen)?"
          );
        }
        
        console.log("[extractTextFromPdf] Recovered using fallback pdf.js version", {
          originalError: errorMessage,
          textLength: text.length,
        });
        
        return text;
      } catch (fallbackErr) {
        // Si el fallback también falla, dar un mensaje claro al usuario
        console.error("[extractTextFromPdf] Both strategies failed", {
          originalError: errorMessage,
          fallbackError: fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr),
        });
        
        throw new Error(
          "El PDF tiene una estructura interna corrupta. Intenta:\n" +
          "1. Volver a guardar/exportar el PDF desde tu editor\n" +
          "2. Usar 'Imprimir como PDF' para crear una copia limpia\n" +
          "3. Convertirlo usando una herramienta online (ej. ilovepdf.com)"
        );
      }
    }
    
    // PDFs protegidos con contraseña
    if (errorMessage.includes("password") || errorMessage.includes("encrypted")) {
      throw new Error(
        "El PDF está protegido con contraseña. Por favor sube un PDF sin protección."
      );
    }
    
    // Error genérico: re-lanzar con contexto
    console.error("[extractTextFromPdf] Unexpected error", {
      error: errorMessage,
      errorType: err instanceof Error ? err.constructor.name : typeof err,
    });
    
    throw new Error(
      err instanceof Error
        ? err.message
        : "No se pudo leer el PDF. Verifica que el archivo no esté dañado."
    );
  }
}
