import type { ApiPromise } from '@polkadot/api'
import type {
  MachineConfig,
  AnyEventObject,
  InternalMachineOptions,
  EventObject,
  ResolveTypegenMeta,
  BaseActionObject,
  ServiceMap,
  TypegenConstraint,
  TypegenDisabled,
  StateMachine,
  State,
} from 'xstate'

import { assign } from 'xstate'
import { mergeDeepRight } from 'ramda'

//
// Types
//

export interface WebsocketConnectionContext {
  endpoint: string
  connection?: ApiPromise
  error?: string
}

export type WebsocketConnectionMachine = StateMachine<WebsocketConnectionContext, any, AnyEventObject>

export type WebsocketConnectionState = State<WebsocketConnectionContext, AnyEventObject, any, {
  value: any
  context: WebsocketConnectionContext
},
  TypegenDisabled
>

export interface WebsocketConnectionMachineServiceMap extends ServiceMap {
  connect: {
    data: (context: WebsocketConnectionContext) => Promise<unknown>
  }
  disconnect: {
    data: (context: WebsocketConnectionContext) => Promise<unknown>
  }
  check_connection: {
    data: (context: WebsocketConnectionContext) => Promise<unknown>
  }
}

export type WebsocketConnectionMachineInternalMachineOptions<
  TEvent extends EventObject = AnyEventObject,
  TTypesMeta extends TypegenConstraint = TypegenDisabled
> = InternalMachineOptions<
  WebsocketConnectionContext,
  TEvent,
  ResolveTypegenMeta<
    TTypesMeta,
    TEvent,
    BaseActionObject,
    WebsocketConnectionMachineServiceMap
  >
>

export type WebsocketConnectionMachineOptionsOverrides =
  Partial<WebsocketConnectionMachineInternalMachineOptions> &
    Pick<WebsocketConnectionMachineInternalMachineOptions, 'services'>

//
// State Machine Factory Functions.
//

export function createWebsocketConnectionMachineConfig(ctx: WebsocketConnectionContext): MachineConfig<WebsocketConnectionContext, any, AnyEventObject> {
  return {
    id: 'websocketConnectionMachine',
    context: ctx,
    initial: 'disconnected',
    predictableActionArguments: true,
    states: {
      disconnected: {
        on: {
          CONNECT: {
            target: 'connecting',
          },
        },
      }, // END: disconnected

      connecting: {
        invoke: {
          id: 'connecting',
          src: 'connect',
        },
        on: {
          CONNECTED: {
            target: 'connected',
            actions: [
              'setConnection',
            ]
          },
          CONNECT_TIMEOUT: {
            target: 'disconnected',
            actions: [
              'setError',
            ],
          },
        },
      }, // END: connecting

      connected: {
        on: {
          DISCONNECT: {
            target: 'disconnecting',
          },
          RECONNECTING: {
            target: 'reconnecting',
          },
          RECONNECT: {
            target: 'connecting',
            actions: [
              'setEndpoint',
            ]
          },
        }
      }, // END: connected

      disconnecting: {
        invoke: {
          id: 'disconnecting',
          src: 'disconnect',
        },
        on: {
          DISCONNECTED: {
            target: 'disconnected',
          },
        }
      }, // END: disconnecting.

      reconnecting: {
        invoke: {
          id: 'check_connection',
          src: 'check_connection',
        },
        on: {
          CONNECTED: {
            target: 'connected',
          },
          DISCONNECT: {
            target: 'disconnecting',
          },
          CONNECT_FAILED: {
            target: 'disconnected',
            actions: [
              'setError',
            ],
          },
        },
      }, // END: reconnecting
    },
  }
}

export function createWebsocketConnectionMachineOptions(overrides: WebsocketConnectionMachineOptionsOverrides) {
  return mergeDeepRight(
    {
      // Actions
      actions: {
        setConnection: assign({
          endpoint: (_, evt) => evt.data.endpoint,
          connection: (_, evt) => evt.data.connection,
          error: (_) => undefined,
        }),
        setEndpoint: assign({
          endpoint: (ctx, evt) => evt.data.endpoint || ctx.endpoint,
        }),
        setError: assign({
          error: (_, evt) => `${evt.data.error}`,
        }),
      },
    } as Partial<WebsocketConnectionMachineInternalMachineOptions>,
    overrides
  ) as WebsocketConnectionMachineInternalMachineOptions
}
