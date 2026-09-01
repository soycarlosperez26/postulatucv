/**
 * Cualquier otro portal.
 *
 * Combina lo que haya: metadatos del JSON-LD si existe, título del h1 o
 * del <title>, y descripción por rótulo con el bloque más denso como red.
 * Falla de forma visible —campos vacíos que el usuario ve en la ventana—
 * en vez de guardar basura.
 */
__postula.generico = function () {
  const meta = __postula.desdeJsonLd() || {};

  const h1 = document.querySelector("h1");
  let title = meta.title || (h1 ? __postula.limpiar(h1.textContent) : "");
  if (!title) {
    title = __postula.limpiar(document.title).split(/\s[|\-–]\s/)[0] || "";
  }

  const RUIDO = [
    "Ofertas similares",
    "Empleos relacionados",
    "Cargos relacionados",
    "Vacantes similares",
    "B[uú]squedas r[aá]pidas",
    "Crear alerta",
    "Av[ií]same con",
  ];

  const description =
    __postula.contenedorPorRotulo(
      [
        "Descripci[oó]n del cargo",
        "Descripci[oó]n de la oferta",
        "Descripci[oó]n",
        "Requisitos",
        "Funciones",
        "Responsabilidades",
        "Job description",
        "About the role",
      ],
      { minimo: 300, ruido: RUIDO }
    ) || __postula.bloqueMasDenso(RUIDO);

  return {
    title,
    company: __postula.empresaValida(meta.company || ""),
    description,
    location: meta.location || "",
  };
};

/**
 * Punto de entrada. La ventana lo llama tras inyectar los extractores.
 */
__postula.extraer = function () {
  const host = location.hostname;
  const adaptador = __postula.adaptadores[host];

  let datos;
  try {
    datos = adaptador ? adaptador() : __postula.generico();
  } catch (err) {
    datos = { title: "", company: "", description: null, error: String(err) };
  }

  // Si el adaptador dedicado no sacó descripción, se intenta el genérico
  // antes de rendirse: un portal rediseñado no debe dejar al usuario sin nada.
  if (adaptador && (!datos.description || datos.description.length < 200)) {
    try {
      const respaldo = __postula.generico();
      if (respaldo.description && respaldo.description.length > (datos.description || "").length) {
        datos.description = respaldo.description;
        datos.company = datos.company || respaldo.company;
        datos.title = datos.title || respaldo.title;
      }
    } catch {
      /* se queda con lo que tenía */
    }
  }

  return {
    title: datos.title || "",
    company: datos.company || "",
    description: datos.description || "",
    location: datos.location || "",
    sourceUrl: location.href.split("#")[0],
    portalConocido: Boolean(adaptador),
  };
};
