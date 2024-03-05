import type { LayoutServerLoad } from './$types'
import { env } from '$env/dynamic/private'

export const load = (async () => {

  const res = await fetch(`http://${env.SAM_GRAF_SERVER}/Applications`)
  const apps: [{ appName: string }] = await res.json()

  return { apps: apps }
}) satisfies LayoutServerLoad