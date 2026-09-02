/**
 * Google Analytics 4 — eventos de seguimiento.
 * Solo se activa si NEXT_PUBLIC_GA_MEASUREMENT_ID está configurado.
 */

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", eventName, params);
}

export function trackCtaClick(location: "hero" | "pricing" | "final") {
  trackEvent("cta_click", { location });
}

export function trackSignUp(method: "google" | "email") {
  trackEvent("sign_up", { method });
}

export function trackLogin() {
  trackEvent("login");
}

export function trackCvUploaded(fileType: string) {
  trackEvent("cv_uploaded", { file_type: fileType });
}

export function trackOfferAnalyzed(
  offerIndex: number,
  score: number,
  creditsLeft: number
) {
  trackEvent("offer_analyzed", {
    offer_index: offerIndex,
    score,
    credits_left: creditsLeft,
  });
}

export function trackCvAdaptedDownloaded() {
  trackEvent("cv_adapted_downloaded");
}

export function trackBeginCheckout(
  pack: "credits_5" | "credits_15" | "credits_50",
  value: number
) {
  trackEvent("begin_checkout", {
    pack,
    value,
    currency: "COP",
  });
}

export function trackPurchase(creditsAdded: number, value: number) {
  trackEvent("purchase", {
    credits_added: creditsAdded,
    value,
    currency: "COP",
  });
}
