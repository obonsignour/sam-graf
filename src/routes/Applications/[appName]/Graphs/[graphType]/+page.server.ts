import { env } from '$env/dynamic/private'
import type { PageServerLoad } from './$types'

// return the list of graphs of a certain type for the given application
export const load = (async ({ params }) => {
  const { appName, graphType } = params
  const res = await fetch(`http://${env.SAM_GRAF_SERVER}/Applications/${appName}/Graphs/${graphType}`)
  if (!res.ok) {
    return { status: res.status }
  }
  const graphs: [{ id: string, name: string }] = await res.json()
  if (!graphs) {
    return { status: 404 }
  }
  return { datagraphs: graphs }
}) satisfies PageServerLoad