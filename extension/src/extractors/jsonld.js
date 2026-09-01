/**
 * Metadatos desde schema.org JobPosting.
 *
 * Donde existe es la fuente más confiable para título, empresa y ciudad,
 * y no requiere mantenimiento.
 *
 * OJO: la descripción NO se toma de aquí. Comprobado en elempleo, el
 * campo `description` del JSON-LD trae solo el primer párrafo — 762
 * caracteres frente a 5.526 visibles en la página, sin las secciones de
 * salario ni de requisitos. Usarla dejaría el score ATS corto de
 * palabras clave de forma sistemática.
 */
__postula.desdeJsonLd = function () {
  const bloques = document.querySelectorAll('script[type="application/ld+json"]');

  for (const bloque of bloques) {
    let datos;
    try {
      datos = JSON.parse(bloque.textContent);
    } catch {
      continue;
    }

    const candidatos = Array.isArray(datos)
      ? datos
      : datos["@graph"]
        ? datos["@graph"]
        : [datos];

    for (const item of candidatos) {
      if (!item || item["@type"] !== "JobPosting") continue;

      const empresa =
        (item.hiringOrganization && item.hiringOrganization.name) || "";
      const lugar = item.jobLocation && item.jobLocation.address;

      return {
        title: String(item.title || "").trim(),
        company: String(empresa).trim(),
        location: lugar ? String(lugar.addressLocality || "").trim() : "",
        // Solo para avisar si el DOM devuelve algo mucho más corto.
        descripcionLd: item.description
          ? __postula.limpiar(String(item.description).replace(/<[^>]+>/g, "\n"))
          : "",
      };
    }
  }
  return null;
};
