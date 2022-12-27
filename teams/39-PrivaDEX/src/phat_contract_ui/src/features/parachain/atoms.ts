import type { Event as PolkadotEvent, EventRecord } from '@polkadot/types/interfaces/system'
import type { WebsocketConnectionMachine, WebsocketConnectionContext } from './websocketConnectionMachine'

import { useEffect, useState } from 'react'
import { createMachine } from 'xstate'
import { atom, useAtom } from 'jotai'
import { atomWithMachine } from 'jotai/xstate'
import { atomWithReset } from 'jotai/utils'
import * as R from 'ramda'

import createLogger from '@/functions/createLogger'
import { endpointAtom } from '@/atoms/endpointsAtom'

import { createWebsocketConnectionMachineConfig, createWebsocketConnectionMachineOptions } from './websocketConnectionMachine'
import create from './create'

const debug = createLogger('parachain', 'debug')

export const websocketConnectionMachineAtom = atomWithMachine<WebsocketConnectionMachine>((get) => {
  const endpoint = get(endpointAtom)
  const ctx: WebsocketConnectionContext = {
    endpoint: endpoint,
  }
  debug(`network endpoint: ${endpoint}`)
  return createMachine(
    createWebsocketConnectionMachineConfig(ctx),
    createWebsocketConnectionMachineOptions({
      // Services
      services: {
        connect: (ctx, evt) => async (send) => {
          try {
            if (ctx.connection) {
              await ctx.connection.disconnect()
              // Because we will send RECONNECTING on disconnected, so we need wait 500ms ensure the event
              // populate sequence correctly.
              await new Promise(resolve => setTimeout(resolve, 500))
            }

            const seed = setTimeout(() => {
              send({ type: 'CONNECT_TIMEOUT', data: { error: new Error('Connect timeout.') } })
            }, 5 * 1000)

            const [ws, api] = await create(ctx.endpoint)
            debug('connected')

            ws.on('error', (err) => {
              // @TODO
              debug('setStatus -> error')
            })

            api.on('connected', async () => {
              await api.isReady
              debug('setStatus -> connected')
              send({
                type: 'CONNECTED',
                data: {
                  endpoint: ctx.endpoint,
                  connection: api,
                }
              })
            })
    
            api.on('disconnected', (evt) => {
              debug('setStatus -> disconnected', ctx, evt)
              send({ type: 'RECONNECTING' })
            })

            await api.isReady

            clearTimeout(seed)

            send({
              type: 'CONNECTED',
              data: {
                endpoint: ctx.endpoint,
                connection: api,
              }
            })
          } catch (err) {
            console.log('wtf', err)
          }
        },

        disconnect: (ctx) => async (send) => {
          await ctx.connection?.disconnect()
          send({ type: 'DISCONNECTED', data: { endpoint: ctx.endpoint } })
        },

        check_connection: (ctx) => (send) => {
          const start = +new Date()
          const seed = setInterval(() => {
            const now = +new Date()
            const timeout = 30 * 1000
            if ((now - start) > timeout) {
              send({ type: 'CONNECT_FAILED', data: { error: new Error('network offline.') } })
            }
          }, 500)
          return () => clearInterval(seed)
        }
      }
    })
  )
}, {
  devTools: process.env.NODE_ENV === 'development',
})

export const apiPromiseAtom = atom(async (get) => {
  while (true) {
    const machine = get(websocketConnectionMachineAtom)
    if (machine.value === 'connected') {
      return machine.context.connection!
    }
    await new Promise(resolve => setTimeout(resolve, 500))
  }
})

export const isDevChainAtom = atom(async (get) => {
  const api = get(apiPromiseAtom)
  const type = await api.rpc.system.chainType()
  return type.isDevelopment || type.isLocal
})

export const useAutoConnect = () => {
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])
  // NOTE: We can't use `useSetAtom` here. If we don't access the machine instance,
  // the connection will not be established.
  const [machine, send] = useAtom(websocketConnectionMachineAtom)
  useEffect(() => {
    if (isMounted) {
      send({ type: 'CONNECT' })
    }
  }, [isMounted, send])
}

export const eventsAtom = atomWithReset<PolkadotEvent[]>([])

export const dispatchEventAtom = atom(null, (get, set, events: EventRecord[]) => {
  const prev = get(eventsAtom)
  set(eventsAtom, [ ...R.reverse(events.map(i => i.event)), ...prev ])
})
