// Simple browser fingerprint generator
// Combines multiple browser attributes into a hash
export function getFingerprint() {
  if (typeof window === "undefined") return "server";

  const stored = localStorage.getItem("uw_fingerprint");
  if (stored) return stored;

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || "",
    navigator.platform || "",
  ];

  // Simple hash function
  let hash = 0;
  const str = components.join("|");
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }

  const fingerprint = "uw_" + Math.abs(hash).toString(36);
  localStorage.setItem("uw_fingerprint", fingerprint);
  return fingerprint;
}
