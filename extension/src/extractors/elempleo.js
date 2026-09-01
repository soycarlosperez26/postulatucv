/**
 * elempleo.
 *
 * Sí publica JobPosting en JSON-LD, del que salen título, empresa y
 * ciudad. La descripción se lee del DOM porque la del JSON-LD viene
 * truncada al primer párrafo (comprobado: 762 caracteres contra 5.526).
 */
__postula.adaptadores["www.elempleo.com"] = function () {
  const RUIDO = [
    "Ofertas similares",
    "Empleos relacionados",
    "Cargos relacionados",
    "B[uú]squedas r[aá]pidas",
    "Crear alerta",
  ];
  const meta = __postula.desdeJsonLd() || {};

  const h1 = document.querySelector("h1");
  const title = meta.title || (h1 ? __postula.limpiar(h1.textContent) : "");

  const description =
    __postula.contenedorPorRotulo(
      ["Descripci[oó]n del cargo", "Descripci[oó]n general", "Descripci[oó]n de la oferta"],
      { minimo: 300, ruido: RUIDO }
    ) || __postula.bloqueMasDenso(RUIDO);

  return {
    title,
    company: __postula.empresaValida(meta.company || ""),
    description,
    location: meta.location || "",
  };
};
