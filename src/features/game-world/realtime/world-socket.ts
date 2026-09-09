import { io, type Socket } from 'socket.io-client'

import { loadSession } from '#/lib/auth/storage'

export type WorldDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

export type WorldPosition = { x: number; y: number; z: number }

export type WorldEntitySnapshot = {
  id: string
  type?: string
  position: WorldPosition
  direction?: WorldDirection | string
  visual?: { dexId?: number; assetKey?: string; path?: string }
}

export type WorldSnapshot = {
  map: { id: string; name?: string }
  instance: { id: string }
  selfEntityId: string
  entities: WorldEntitySnapshot[]
}

export type BattleEncounterPayload = {
  type?: string
  dexId?: number
  level?: number
  zoneId?: string
  position?: WorldPosition
}

export type BattleStatePayload = {
  type?: string
  battle?: {
    id: string
    status: string
    player?: { name?: string; hp?: number; maxHp?: number; dexId?: number }
    wild?: { name?: string; hp?: number; maxHp?: number; dexId?: number }
    playerMoves?: Array<{ id: string; name: string; missileAssetKey?: string }>
    wildMoves?: Array<{ id: string; name: string; missileAssetKey?: string }>
    lastAction?: {
      kind: string
      moveId?: string
      damage?: number
      appliedEffect?: string | null
    }
  }
  encounter?: BattleEncounterPayload
  effects?: Array<string | null | undefined>
  missiles?: string[]
}

export type WorldSocketHandlers = {
  onSnapshot?: (snapshot: WorldSnapshot) => void
  onEntitySpawned?: (entity: WorldEntitySnapshot) => void
  onEntityMoved?: (payload: {
    entityId: string
    position: WorldPosition
    direction?: string
    sequence?: number
  }) => void
  onEntityDespawned?: (payload: { entityId: string }) => void
  onBattleEncounter?: (payload: BattleEncounterPayload) => void
  onBattleStarted?: (payload: BattleStatePayload) => void
  onBattleUpdated?: (payload: BattleStatePayload) => void
  onError?: (payload: { code: string; message: string }) => void
  onConnect?: () => void
  onDisconnect?: () => void
}

function resolveWorldWsUrl(): string {
  const explicit = (import.meta as { env?: Record<string, string> }).env
    ?.VITE_WS_URL
  if (explicit) return explicit.replace(/\/$/, '')
  const api = (import.meta as { env?: Record<string, string> }).env?.VITE_API_URL
  if (api) {
    try {
      const u = new URL(api)
      return `${u.protocol}//${u.host}`
    } catch {
      // fall through
    }
  }
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:3000`
  }
  return 'http://localhost:3000'
}

export type WorldSocketClient = {
  socket: Socket
  enter: (characterId: string, mapId?: string) => void
  move: (direction: WorldDirection, sequence: number) => Promise<unknown>
  battleAction: (input: {
    battleId: string
    characterId: string
    action: 'move' | 'capture' | 'flee'
    moveId?: string
    ballBonus?: number
  }) => Promise<unknown>
  leave: () => void
  disconnect: () => void
}

/**
 * Connect to Nest Socket.IO `/world` namespace.
 * Requires a stored auth session with accessToken.
 */
export function connectWorldSocket(
  handlers: WorldSocketHandlers = {},
): WorldSocketClient | null {
  const session = loadSession()
  if (!session?.accessToken) {
    return null
  }

  const url = resolveWorldWsUrl()
  const socket = io(`${url}/world`, {
    auth: { token: session.accessToken },
    transports: ['websocket', 'polling'],
    autoConnect: true,
  })

  socket.on('connect', () => handlers.onConnect?.())
  socket.on('disconnect', () => handlers.onDisconnect?.())
  socket.on('WORLD_SNAPSHOT', (payload: WorldSnapshot) =>
    handlers.onSnapshot?.(payload),
  )
  socket.on('ENTITY_SPAWNED', (payload: WorldEntitySnapshot) =>
    handlers.onEntitySpawned?.(payload),
  )
  socket.on('ENTITY_MOVED', (payload) => handlers.onEntityMoved?.(payload))
  socket.on('ENTITY_DESPAWNED', (payload) =>
    handlers.onEntityDespawned?.(payload),
  )
  socket.on('WORLD_ERROR', (payload: { code: string; message: string }) =>
    handlers.onError?.(payload),
  )
  socket.on('battle.encounter', (payload: BattleEncounterPayload) =>
    handlers.onBattleEncounter?.(payload),
  )
  socket.on('battle.started', (payload: BattleStatePayload) =>
    handlers.onBattleStarted?.(payload),
  )
  socket.on('battle.updated', (payload: BattleStatePayload) =>
    handlers.onBattleUpdated?.(payload),
  )
  socket.on('battle.error', (payload: { code?: string; message?: string }) =>
    handlers.onError?.({
      code: payload.code ?? 'BATTLE_ERROR',
      message: payload.message ?? 'battle error',
    }),
  )

  return {
    socket,
    enter(characterId, mapId = 'laboratory') {
      socket.emit('WORLD_ENTER', { characterId, mapId })
    },
    move(direction, sequence) {
      return new Promise((resolve) => {
        socket.emit('MOVE', { direction, sequence }, (ack: unknown) => {
          resolve(ack)
        })
      })
    },
    battleAction(input) {
      return new Promise((resolve) => {
        socket.emit('BATTLE_ACTION', input, (ack: unknown) => {
          resolve(ack)
        })
      })
    },
    leave() {
      socket.emit('WORLD_LEAVE')
    },
    disconnect() {
      socket.disconnect()
    },
  }
}
