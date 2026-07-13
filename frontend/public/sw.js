// VCI Service Worker v2.0 — Fast Loading + Offline Support
const CACHE_NAME = "vci-v2";
const STATIC_CACHE = "vci-static-v2";
const API_CACHE = "vci-api-v2";

// Files to cache immediately on install
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
];

// ── Install: cache core files ─────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  self.skipWaiting(); // Activate immediately, don't wait
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(PRECACHE_URLS).catch(() => {})
    )
  );
});

// ── Activate: delete old caches ───────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(), // Take control immediately
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== API_CACHE)
            .map((k) => caches.delete(k))
        )
      ),
    ])
  );
});

// ── Fetch: smart caching strategy ────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and chrome-extension
  if (request.method !== "GET") return;
  if (url.protocol === "chrome-extension:") return;

  // API calls — Network first, no cache (always fresh)
  if (
    url.hostname.includes("render.com") ||
    url.hostname.includes("supabase.co") ||
    url.hostname.includes("razorpay.com") ||
    url.hostname.includes("groq.com") ||
    url.hostname.includes("anthropic.com") ||
    url.pathname.startsWith("/api/")
  ) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ error: "Offline" }), {
          headers: { "Content-Type": "application/json" },
        })
      )
    );
    return;
  }

  // Static assets (JS, CSS, fonts, icons) — Cache first, then network
  if (
    url.hostname === self.location.hostname &&
    (url.pathname.includes("/assets/") ||
      url.pathname.endsWith(".js") ||
      url.pathname.endsWith(".css") ||
      url.pathname.endsWith(".woff2") ||
      url.pathname.endsWith(".png") ||
      url.pathname.endsWith(".jpg") ||
      url.pathname.endsWith(".ico"))
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(STATIC_CACHE).then((c) => c.put(request, clone));
            }
            return response;
          })
      )
    );
    return;
  }

  // HTML pages — Network first, fallback to cache (ensures fresh app)
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((c) => c.put(request, clone));
          return response;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Everything else — Network first
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// ── Message: force update ─────────────────────────────────────────────────────
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data === "CLEAR_CACHE") {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
  }
});
