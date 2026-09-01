/**
 * Corre en /dashboard/extension de Postula.
 *
 * Recoge el token que la página publica con window.postMessage. Así la
 * web no necesita conocer el id de la extensión, que en modo desarrollador
 * cambia en cada instalación.
 *
 * Guarda también el origen desde el que se conectó, para que la extensión
 * sepa a qué servidor mandar las ofertas sin URLs incrustadas.
 */
window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  const data = event.data;
  if (!data || data.source !== "postula-web" || data.type !== "token-nuevo") return;
  if (typeof data.token !== "string" || !data.token.startsWith("pst_")) return;

  chrome.storage.local.set(
    { token: data.token, origin: window.location.origin },
    () => {
      window.postMessage(
        { source: "postula-extension", type: "token-guardado" },
        window.location.origin
      );
    }
  );
});
