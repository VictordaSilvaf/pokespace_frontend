import handler, { createServerEntry } from '@tanstack/react-start/server-entry'

import { paraglideMiddleware } from '#/paraglide/server.js'

export default createServerEntry({
  fetch(request) {
    // Keep the original request: this app does not use URL locale prefixes.
    // The middleware still scopes getLocale() via AsyncLocalStorage (cookie).
    return paraglideMiddleware(request, () => handler.fetch(request))
  },
})
