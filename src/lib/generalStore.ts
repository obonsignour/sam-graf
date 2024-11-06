import { writable, type Writable } from 'svelte/store'
import type { Thread } from './customTypes'

export const appName: Writable<string> = writable("undefined")
export const pageTitle: Writable<string> = writable("Page Title")
export const relationType: Writable<string> = writable("undefined")
export const activeThreads: Writable<Thread[]> = writable([])
export const nbActiveThreads: Writable<number> = writable(0)

//export const startNodesStore: Writable<string[]> = writable([]);
//export const endNodesStore: Writable<string[]> = writable([]);