/* Serial Exit service worker — intentionally minimal and safe.
 *
 *  - Hashed, immutable assets (/_next/static, fonts, images, icons): cache-first.
 *  - Page navigations: network-first; if offline, serve the last good copy of "/".
 *  - Everything else (notably /api/*, cross-origin): never touched.
 *
 * Bump CACHE_VERSION to evict old caches. Served with `Cache-Control: no-cache`
 * (see firebase.json / next.config.ts) so updates roll out on the next visit.
 */
const CACHE_VERSION = "se-v4";
const STATIC = `${CACHE_VERSION}-static`;
const PAGES = `${CACHE_VERSION}-pages`;
const STATIC_RE = /^\/(_next\/static|fonts|images|icons)\//;

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok && url.pathname === "/") {
            const copy = res.clone();
            caches.open(PAGES).then((c) => c.put("/", copy));
          }
          return res;
        })
        .catch(() => caches.match("/").then((r) => r || Response.error()))
    );
    return;
  }

  if (STATIC_RE.test(url.pathname)) {
    event.respondWith(
      caches.open(STATIC).then((cache) =>
        cache.match(request).then(
          (hit) =>
            hit ||
            fetch(request).then((res) => {
              if (res.ok) cache.put(request, res.clone());
              return res;
            })
        )
      )
    );
  }
});
