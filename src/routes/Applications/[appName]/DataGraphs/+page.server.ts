import type { PageServerLoad } from './$types'
import { env } from '$env/dynamic/private'
import type { GraphListRow } from '$lib/customTypes'
import { error } from '@sveltejs/kit'

export const load = (async ({ params }) => {
  const { appName } = params
  const res = await fetch(`http://${env.SAM_GRAF_SERVER}/Applications/${appName}/DataGraphs`)
  if (!res.ok) {
    error(res.status, `Failed to load datagraphs: ${res.status}`)
  }
  const datagraphs: GraphListRow[] = await res.json()
  if (!datagraphs) {
    error(404, `Failed to load datagraphs: ${res.status}`)
  }
  return { datagraphs: datagraphs }
}) satisfies PageServerLoad