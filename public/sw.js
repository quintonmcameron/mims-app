/* Minimal service worker — enables Chrome/Edge "Install app" for MIMS. */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  /* Network-first: always load fresh app shell from your domain. */
});
