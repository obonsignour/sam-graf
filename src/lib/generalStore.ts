import { writable, type Writable } from 'svelte/store'

export const appName: Writable<string> = writable("undefined")
