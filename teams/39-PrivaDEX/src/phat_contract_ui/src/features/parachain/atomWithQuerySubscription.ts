import type { ApiPromise } from '@polkadot/api'
import type { UnsubscribePromise } from '@polkadot/api/types'
import type { Getter } from 'jotai'
import { atomWithObservable } from 'jotai/utils'
import { Subject } from 'rxjs'

import { apiPromiseAtom } from './atoms'

type TCreateWatcher<T> = (get: Getter, api: ApiPromise, subject: Subject<T>) => UnsubscribePromise | undefined

export function atomWithQuerySubscription<TData>(createWatcher: TCreateWatcher<TData>, initialValue?: TData) {
  let unscribe: Function | null = null

  const options: { initialValue?: TData } = {}
  if (initialValue !== undefined) {
    options.initialValue = initialValue
  }

  return atomWithObservable<TData>(
    (get) => {
      const api = get(apiPromiseAtom)
      const subject = new Subject<TData>()
      if (unscribe) {
        unscribe()
      }
      const thenable = createWatcher(get, api, subject)
      if (thenable) {
        thenable.then((unsub) => (
          unscribe = unsub
        ))
      }
      return subject
    },
    options
  )
}