/**
 * Service worker: guarda el token y habla con la API de Postula.
 *
 * El token nunca sale de aquí hacia la página del portal; la ventana solo
 * manda los campos ya revisados por el usuario.
 */

const MIN_DESCRIPCION = 200;

async function leerCredenciales() {
  const { token, origin } = await chrome.storage.local.get(["token", "origin"]);
  return { token, origin };
}

async function guardarOferta(payload) {
  const { token, origin } = await leerCredenciales();

  if (!token || !origin) {
    return {
      ok: false,
      error: "Conecta la extensión desde tu panel de Postula.",
      necesitaConectar: true,
    };
  }

  if (!payload.description || payload.description.length < MIN_DESCRIPCION) {
    return {
      ok: false,
      error: "La descripción es demasiado corta. Complétala antes de guardar.",
    };
  }

  let respuesta;
  try {
    respuesta = await fetch(`${origin}/api/extension/offers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: false, error: "No pudimos conectar con Postula. ¿Tienes internet?" };
  }

  let cuerpo = {};
  try {
    cuerpo = await respuesta.json();
  } catch {
    /* respuesta sin cuerpo */
  }

  if (respuesta.status === 401) {
    // El token se revocó o caducó: se borra para no reintentarlo en vano.
    await chrome.storage.local.remove(["token", "origin"]);
    return {
      ok: false,
      error: "Tu conexión con Postula caducó. Vuelve a conectar la extensión.",
      necesitaConectar: true,
    };
  }

  if (!respuesta.ok) {
    return { ok: false, error: cuerpo.error || "No se pudo guardar la oferta." };
  }

  return {
    ok: true,
    duplicada: Boolean(cuerpo.duplicated),
    url: `${origin}${cuerpo.path}`,
  };
}

chrome.runtime.onMessage.addListener((mensaje, remitente, responder) => {
  if (mensaje?.type === "guardar") {
    guardarOferta(mensaje.payload).then(responder);
    return true; // respuesta asíncrona
  }

  if (mensaje?.type === "estado") {
    leerCredenciales().then(({ token, origin }) =>
      responder({ conectada: Boolean(token && origin), origin: origin || null })
    );
    return true;
  }

  if (mensaje?.type === "oferta-detectada" && remitente.tab?.id) {
    chrome.action.setBadgeText({ tabId: remitente.tab.id, text: "•" });
    chrome.action.setBadgeBackgroundColor({ tabId: remitente.tab.id, color: "#DE8B2E" });
  }

  return false;
});
