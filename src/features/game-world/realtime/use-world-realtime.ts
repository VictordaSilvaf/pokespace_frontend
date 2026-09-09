import { useEffect, useRef, useState } from 'react'

import {
  connectWorldSocket,
  type BattleStatePayload,
  type WorldEntitySnapshot,
  type WorldSnapshot,
  type WorldSocketClient,
} from './world-socket'

export type UseWorldRealtimeOptions = {
  characterId: string | null
  mapId?: string
  enabled?: boolean
}

export function useWorldRealtime({
  characterId,
  mapId = 'laboratory',
  enabled = true,
}: UseWorldRealtimeOptions) {
  const clientRef = useRef<WorldSocketClient | null>(null)
  const [connected, setConnected] = useState(false)
  const [snapshot, setSnapshot] = useState<WorldSnapshot | null>(null)
  const [entities, setEntities] = useState<Map<string, WorldEntitySnapshot>>(
    () => new Map(),
  )
  const [battle, setBattle] = useState<BattleStatePayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const sequenceRef = useRef(0)
  const moveInFlightRef = useRef(false)

  useEffect(() => {
    if (!enabled || !characterId) {
      return
    }

    const client = connectWorldSocket({
      onConnect: () => {
        setConnected(true)
        setError(null)
        client.enter(characterId, mapId)
      },
      onDisconnect: () => setConnected(false),
      onSnapshot: (snap) => {
        setSnapshot(snap)
        const next = new Map<string, WorldEntitySnapshot>()
        for (const e of snap.entities ?? []) next.set(e.id, e)
        setEntities(next)
      },
      onEntitySpawned: (entity) => {
        setEntities((prev) => {
          const next = new Map(prev)
          next.set(entity.id, entity)
          return next
        })
      },
      onEntityMoved: (payload) => {
        setEntities((prev) => {
          const next = new Map(prev)
          const existing = next.get(payload.entityId)
          next.set(payload.entityId, {
            id: payload.entityId,
            position: payload.position,
            direction: payload.direction,
            type: existing?.type,
            visual: existing?.visual,
          })
          return next
        })
      },
      onEntityDespawned: ({ entityId }) => {
        setEntities((prev) => {
          const next = new Map(prev)
          next.delete(entityId)
          return next
        })
      },
      onBattleEncounter: (payload) => {
        setBattle({ type: 'battle.encounter', encounter: payload })
      },
      onBattleStarted: (payload) => {
        setBattle(payload)
      },
      onBattleUpdated: (payload) => {
        setBattle(payload)
        if (payload.battle?.status && payload.battle.status !== 'active') {
          // keep last result briefly; caller can clear
        }
      },
      onError: (payload) => {
        setError(`${payload.code}: ${payload.message}`)
      },
    })

    if (!client) {
      setError('No session — world socket offline')
      return
    }

    clientRef.current = client
    return () => {
      client.leave()
      client.disconnect()
      clientRef.current = null
      setConnected(false)
    }
  }, [characterId, mapId, enabled])

  async function move(direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') {
    const client = clientRef.current
    if (!client || moveInFlightRef.current) return null
    moveInFlightRef.current = true
    sequenceRef.current += 1
    try {
      const ack = await client.move(direction, sequenceRef.current)
      const result = ack as {
        accepted?: boolean
        position?: { x: number; y: number; z: number }
        direction?: string
        entityId?: string
      } | null
      if (result?.accepted && result.position && result.entityId) {
        setEntities((prev) => {
          const next = new Map(prev)
          const existing = next.get(result.entityId!)
          next.set(result.entityId!, {
            id: result.entityId!,
            position: result.position!,
            direction: result.direction,
            type: existing?.type,
            visual: existing?.visual,
          })
          return next
        })
      }
      return result
    } finally {
      moveInFlightRef.current = false
    }
  }

  async function battleAction(input: {
    action: 'move' | 'capture' | 'flee'
    moveId?: string
    ballBonus?: number
  }) {
    const client = clientRef.current
    const battleId = battle?.battle?.id
    if (!client || !characterId || !battleId) return null
    return client.battleAction({
      battleId,
      characterId,
      ...input,
    })
  }

  function clearBattle() {
    setBattle(null)
  }

  return {
    connected,
    snapshot,
    entities,
    battle,
    error,
    move,
    battleAction,
    clearBattle,
    selfEntityId: snapshot?.selfEntityId ?? null,
  }
}
