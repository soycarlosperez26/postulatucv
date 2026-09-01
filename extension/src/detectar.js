/**
 * Marca el ícono cuando estamos en una oferta de un portal conocido.
 *
 * Es lo único que corre siempre; la extracción se inyecta solo cuando el
 * usuario da clic. Los portales cargan contenido por JavaScript, así que
 * se espera al título con un observador y un tiempo límite.
 */
function hayOferta() {
  const h1 = document.querySelector("h1");
  return Boolean(h1 && h1.textContent.trim().length > 3);
}

function avisar() {
  chrome.runtime.sendMessage({ type: "oferta-detectada" }).catch(() => {});
}

if (hayOferta()) {
  avisar();
} else {
  const observador = new MutationObserver(() => {
    if (hayOferta()) {
      observador.disconnect();
      avisar();
    }
  });
  observador.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => observador.disconnect(), 8000);
}
