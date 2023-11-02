import { useState } from 'react'
import { useMount } from './useMount'

/**
 * Global store that can be used in any component, parent or child and only re-renders itself when updated.
 */
export const useStore = <T>(store: Store<T>, rerenderOnEffect: boolean = true): [T, (newState: T) => void] => {
    const [state, setState] = useState(store.get())

    useMount(() => {
        if (!rerenderOnEffect) return
        const unsubscribe = store.subscribe((newState) => setState(newState))
        return unsubscribe
    })

    return [state, (newState: T) => store.set(newState)]
}

/**
 * Method to create a store. Once created, use the `useStore` hook to access it.
 */
export const createStore = <T>(defaultState: T, options?: { localStorageKey?: string }): Store<T> => {
    const subscribers: Array<StoreSubscriberCallback<T>> = []
    let state = defaultState
    return {
        get: () => {
            if (options?.localStorageKey) {
                const localStorageValue = localStorage.getItem(options.localStorageKey)
                if (localStorageValue) state = JSON.parse(localStorageValue)
            }
            return state
        },
        set: (newState: T) => {
            if (options?.localStorageKey)
                localStorage.setItem(options.localStorageKey, JSON.stringify(newState))

            state = newState
            subscribers.forEach(subscriber => subscriber(newState))
        },
        subscribe: (callback: StoreSubscriberCallback<T>) => {
            subscribers.push(callback)
            return () => subscribers.splice(subscribers.indexOf(callback), 1)
        }
    }
}

type Store<T> = {
    get: () => T,
    set: (value: T) => void,
    subscribe: (callback: StoreSubscriberCallback<T>) => StoreUnsubscriber,
}

type StoreSubscriberCallback<T> = (state: T) => void

type StoreUnsubscriber = () => void