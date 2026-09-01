import pdfParse from "pdf-parse";

/**
 * Extrae el texto plano de un PDF. Solo se usa en server actions /
 * route handlers (server-side), nunca en el cliente.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const result = await pdfParse(buffer);
  const text = result.text.trim();
  if (!text) {
    throw new Error(
      "No se pudo extraer texto del PDF. ¿Es un PDF escaneado (imagen)?"
    );
  }
  return text;
}
