import { writable, type Writable } from 'svelte/store'

export const appName: Writable<string> = writable("undefined")
export const pageTitle: Writable<string> = writable("Page Title")
export const relationType: Writable<string> = writable("undefined")
export const activeThreads: Writable<number[]> = writable([])
export const nbActiveThreads: Writable<number> = writable(0)
