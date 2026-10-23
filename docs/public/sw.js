// Unregister any stale Service Workers from previous projects (e.g. Payer) on this port
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration.unregister().then(() => {
      return self.clients.matchAll()
    }).then((clients) => {
      for (const client of clients) {
        client.navigate(client.url)
      }
    })
  )
})
