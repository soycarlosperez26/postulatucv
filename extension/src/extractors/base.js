/**
 * Espacio común de los extractores. Se inyecta con scripting.executeScript
 * cuando el usuario da clic, nunca de forma permanente.
 */
globalThis.__postula = globalThis.__postula || { adaptadores: {} };

/** Texto legible: sin etiquetas, sin espacios repetidos, sin líneas vacías. */
__postula.limpiar = function (texto) {
  return String(texto || "")
    .replace(/\u00a0/g, " ")
    .split("\n")
    .map((linea) => linea.replace(/[ \t]+/g, " ").trim())
    .filter((linea, i, arr) => linea.length > 0 || (i > 0 && arr[i - 1].length > 0))
    .join("\n")
    .trim();
};

__postula.visible = function (el) {
  if (!el || !el.getBoundingClientRect) return false;
  const estilo = getComputedStyle(el);
  if (estilo.display === "none" || estilo.visibility === "hidden") return false;
  const caja = el.getBoundingClientRect();
  return caja.width > 0 && caja.height > 0;
};

/**
 * Recorta el texto en el primer marcador de ruido.
 *
 * Descartar el contenedor completo cuando aparece "Ofertas similares" no
 * sirve: en Computrabajo ese texto está en un enlace de navegación oculto
 * DENTRO del contenedor correcto, así que la exclusión tiraba la
 * descripción buena. Cortar conserva el cuerpo y elimina la cola.
 */
__postula.recortar = function (texto, marcadores) {
  let corte = texto.length;
  for (const marcador of marcadores || []) {
    const encontrado = texto.search(new RegExp(marcador, "i"));
    if (encontrado > 0 && encontrado < corte) corte = encontrado;
  }
  return texto.slice(0, corte).trim();
};

/**
 * Busca el nodo de texto que coincide con una etiqueta y sube por el DOM
 * hasta un contenedor con cuerpo suficiente.
 *
 * Anclarse en el texto y no en clases CSS es deliberado: las clases de
 * estos portales son utilitarias (div.mb40.pb40.bb1) y cambian con
 * cualquier retoque de diseño; los rótulos en español duran mucho más.
 */
__postula.contenedorPorRotulo = function (rotulos, opciones) {
  const { minimo = 250, ruido = [] } = opciones || {};
  const patron = new RegExp(rotulos.join("|"), "i");

  const anclas = [];
  for (const el of document.querySelectorAll("h1,h2,h3,h4,strong,b,p,span,div")) {
    if (el.children.length === 0 && patron.test(el.textContent || "")) anclas.push(el);
  }

  for (const ancla of anclas) {
    let nodo = ancla;
    for (let i = 0; i < 6 && nodo; i++) {
      nodo = nodo.parentElement;
      if (!nodo || !__postula.visible(nodo)) continue;
      if (__postula.densidadEnlaces(nodo) > __postula.MAX_DENSIDAD_ENLACES) continue;

      const texto = __postula.recortar(__postula.limpiar(nodo.innerText), ruido);
      if (texto.length >= minimo) return texto;
    }
  }
  return null;
};

/** Última red: el bloque visible con más texto propio, sin cascarón. */
__postula.bloqueMasDenso = function (ruido) {
  let mejor = null;
  let mejorLargo = 0;

  for (const el of document.querySelectorAll("article, section, div")) {
    if (el.closest("nav, footer, header, aside")) continue;
    if (!__postula.visible(el)) continue;

    // Descartar contenedores que solo envuelven a otros más pequeños.
    if (el.querySelectorAll("article, section, div").length > 25) continue;
    if (__postula.densidadEnlaces(el) > __postula.MAX_DENSIDAD_ENLACES) continue;

    const texto = __postula.recortar(__postula.limpiar(el.innerText), ruido || []);
    if (texto.length < 300) continue;

    if (texto.length > mejorLargo) {
      mejorLargo = texto.length;
      mejor = texto;
    }
  }
  return mejor;
};

/**
 * Proporción del texto que son enlaces.
 *
 * Es lo que distingue una descripción de una granja de enlaces SEO: en
 * elempleo los bloques de "Trabajo en Amagá / Trabajo en Andes…" del pie
 * miden 6.000 caracteres con 63% de enlaces, mientras que una oferta real
 * es prosa. Sin este filtro el heurístico elegía el pie de página.
 */
__postula.densidadEnlaces = function (el) {
  const total = (el.innerText || "").length || 1;
  let enlaces = 0;
  for (const a of el.querySelectorAll("a")) enlaces += (a.innerText || "").length;
  return enlaces / total;
};

// Va en el espacio de nombres y no en un `const` de nivel superior: la
// ventana reinyecta estos archivos cada vez que se abre, y un `const`
// repetido lanzaría "Identifier has already been declared" al segundo uso.
__postula.MAX_DENSIDAD_ENLACES = 0.35;

/** Textos que los portales usan cuando la empresa es anónima. */
__postula.EMPRESA_ANONIMA =
  /^(importante empresa|empresa (importante|confidencial|del sector)|confidencial|buscar empresas|empresa reconocida)/i;

__postula.empresaValida = function (texto) {
  const limpio = __postula.limpiar(texto);
  if (!limpio || limpio.length < 2 || limpio.length > 90) return "";
  if (__postula.EMPRESA_ANONIMA.test(limpio)) return "";
  return limpio;
};
