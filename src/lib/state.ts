import { writable } from 'svelte/store'

export const count = writable(1)

export function increment() {
  count.update(v => (v = v + 1))
}