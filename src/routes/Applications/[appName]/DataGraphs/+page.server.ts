import type { PageServerLoad } from './$types'
import { env } from '$env/dynamic/private'
import type { selectElement } from '$lib/selector.svelte'

export const load = (async ({ params }) => {
  const { appName } = params
  const res = await fetch(`http://${env.SAM_GRAF_SERVER}/Applications/${appName}/DataGraphs`)
  if (!res.ok) {
    return { status: res.status }
  }
  const datagraphs: [{ id: string, name: string }] = await res.json()
  if (!datagraphs) {
    return { status: 404 }
  }
  return { datagraphs: datagraphs }
}) satisfies PageServerLoad