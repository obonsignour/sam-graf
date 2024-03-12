import type { PageServerLoad } from './$types'
import { env } from '$env/dynamic/private'
import type { selectElement } from '$lib/selector.svelte'

export const load = (async () => {

  const res = await fetch(`http://${env.SAM_GRAF_SERVER}/Applications`)
  const results: [{ appName: string }] = await res.json()
  if (!results) {
    return { status: 404 }
  }

  // if (results.length === 0) {
  //   return { status: 404 }
  // }
  const apps: selectElement[] = results.map((app) => { const element: selectElement = { value: app.appName, label: app.appName }; return element })
  return { apps: apps }
}) satisfies PageServerLoad 