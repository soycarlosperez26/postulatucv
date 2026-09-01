/**
 * Ventana de la extensión.
 *
 * Inyecta los extractores en la pestaña activa solo ahora, cuando el
 * usuario dio clic (permiso activeTab), muestra lo que encontró y guarda
 * lo que el usuario confirme. Nunca guarda sin que él lo vea.
 */

const MIN_DESCRIPCION = 200;

const ARCHIVOS_EXTRACTORES = [
  "src/extractors/base.js",
  "src/extractors/jsonld.js",
  "src/extractors/computrabajo.js",
  "src/extractors/elempleo.js",
  "src/extractors/generico.js",
];

const $ = (id) => document.getElementById(id);

function mostrar(seccion) {
  for (const id of ["cargando", "sin-conectar", "formulario", "listo"]) {
    $(id).classList.toggle("oculto", id !== seccion);
  }
}

function enviar(mensaje) {
  return new Promise((resolve) => chrome.runtime.sendMessage(mensaje, resolve));
}

async function pestanaActiva() {
  const [pestana] = await chrome.tabs.query({ active: true, currentWindow: true });
  return pestana;
}

async function extraer(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ARCHIVOS_EXTRACTORES,
  });

  const [resultado] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => globalThis.__postula.extraer(),
  });

  return resultado?.result ?? null;
}

function pintarContador() {
  const largo = $("description").value.trim().length;
  $("contador").textContent = `(${largo.toLocaleString("es-CO")} caracteres)`;
  $("aviso-descripcion").classList.toggle("oculto", largo >= MIN_DESCRIPCION);
}

async function iniciar() {
  const estado = await enviar({ type: "estado" });

  if (!estado?.conectada) {
    mostrar("sin-conectar");
    $("estado").textContent = "Sin conectar";
    return;
  }

  $("estado").textContent = "Conectada";

  const pestana = await pestanaActiva();
  if (!pestana?.id || !/^https?:/.test(pestana.url || "")) {
    mostrar("formulario");
    $("aviso-descripcion").classList.remove("oculto");
    return;
  }

  let datos = null;
  try {
    datos = await extraer(pestana.id);
  } catch {
    // Páginas donde Chrome no deja inyectar: se llena a mano.
  }

  $("title").value = datos?.title || "";
  $("company").value = datos?.company || "";
  $("description").value = datos?.description || "";
  $("formulario").dataset.sourceUrl = datos?.sourceUrl || pestana.url || "";

  $("aviso-empresa").classList.toggle("oculto", Boolean(datos?.company));
  pintarContador();
  mostrar("formulario");
}

$("description").addEventListener("input", pintarContador);

$("abrir-panel").addEventListener("click", async () => {
  const { origin } = await chrome.storage.local.get("origin");
  chrome.tabs.create({ url: `${origin || "https://www.postulatucv.online"}/dashboard/extension` });
});

$("guardar-token").addEventListener("click", async () => {
  const token = $("token-manual").value.trim();
  if (!token.startsWith("pst_")) {
    $("token-manual").value = "";
    $("token-manual").placeholder = "El token empieza por pst_";
    return;
  }
  // Sin un origen conocido se asume producción; conectarse desde el panel
  // lo registra correctamente y es el camino recomendado.
  await chrome.storage.local.set({ token, origin: "https://www.postulatucv.online" });
  iniciar();
});

$("formulario").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  $("error").classList.add("oculto");

  const payload = {
    title: $("title").value.trim(),
    company: $("company").value.trim(),
    description: $("description").value.trim(),
    sourceUrl: $("formulario").dataset.sourceUrl || "",
  };

  if (payload.description.length < MIN_DESCRIPCION) {
    pintarContador();
    return;
  }

  $("guardar").disabled = true;
  $("guardar").textContent = "Guardando…";

  const resultado = await enviar({ type: "guardar", payload });

  $("guardar").disabled = false;
  $("guardar").textContent = "Guardar en Postula";

  if (!resultado?.ok) {
    if (resultado?.necesitaConectar) {
      mostrar("sin-conectar");
      $("estado").textContent = "Sin conectar";
      return;
    }
    $("error").textContent = resultado?.error || "No se pudo guardar.";
    $("error").classList.remove("oculto");
    return;
  }

  $("mensaje-exito").textContent = resultado.duplicada
    ? "Esta oferta ya estaba guardada."
    : "¡Listo! La oferta quedó en tu cuenta.";
  $("ver-oferta").href = resultado.url;
  mostrar("listo");
});

iniciar();
