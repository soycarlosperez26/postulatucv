/**
 * Computrabajo.
 *
 * No publica JobPosting en JSON-LD: todo sale del DOM.
 *
 * Dos trampas comprobadas en una oferta real:
 *  - El <main> incluye "Ofertas similares" con ocho vacantes ajenas. El
 *    contenedor correcto de la descripción TAMBIÉN contiene ese texto en
 *    un enlace oculto, así que hay que recortar, no descartar.
 *  - Un selector suelto sobre /empresas/ captura el enlace global
 *    "Buscar empresas" del menú. La empresa está en el párrafo que sigue
 *    al h1, antes del guion que separa la ciudad.
 */
__postula.adaptadores["co.computrabajo.com"] = function () {
  const RUIDO = [
    "Ofertas similares",
    "Empleos relacionados",
    "Crear alerta",
    "Av[ií]same con",
    "Denunciar empleo",
  ];

  const h1 = document.querySelector("h1");
  const title = h1 ? __postula.limpiar(h1.textContent) : "";

  let company = "";
  if (h1) {
    const linea = __postula
      .limpiar(h1.parentElement ? h1.parentElement.innerText : "")
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l && l !== title);

    // "Empresa - Ciudad, Depto": la empresa es lo anterior al primer guion.
    if (linea) company = __postula.empresaValida(linea.split(" - ")[0]);
  }

  const description = __postula.contenedorPorRotulo(
    ["Descripci[oó]n de la oferta", "Requerimientos"],
    { minimo: 200, ruido: RUIDO }
  );

  return { title, company, description, location: "" };
};
