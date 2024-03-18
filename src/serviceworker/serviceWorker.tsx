/// <reference lib="WebWorker"/>

export type { };
declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = "v2"

async function clearOldCache() {
    const storedCacheNames = await self.caches.keys()
    for (const storedCacheName of storedCacheNames) {
        if (storedCacheName !== CACHE_NAME) {
            await self.caches.delete(storedCacheName)
        }
    }
}

async function retrieveResponse(request: Request): Promise<Response> {
    const cachedResponse = await self.caches.match(request, { cacheName: CACHE_NAME })
    if (cachedResponse !== undefined) {
        return cachedResponse
    }
    try {
        const response = await fetch(request)
        if (!(response.status >= 500 && response.status <= 599)) {
            const cache = await self.caches.open(CACHE_NAME)
            await cache.put(request, response.clone())
        }
        return response
    } catch (e) {
        return new Response("Network error", {
            status: 408,
            headers: { "Content-Type": "text/plain" },
        });
    }
}



self.addEventListener("install", (event: ExtendableEvent)=>{
    event.waitUntil(clearOldCache())
})

self.addEventListener("fetch", (event: FetchEvent) => {
    event.respondWith(retrieveResponse(event.request))
})



