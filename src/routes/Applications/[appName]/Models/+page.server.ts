import type { PageServerLoad } from './$types'
import { env } from '$env/dynamic/private'

export const load = (async ({ params }) => {
  const { appName } = params
  const res = await fetch(`http://${env.SAM_GRAF_SERVER}/Applications/${appName}/Models`)
  if (!res.ok) {
    return { status: res.status }
  }
  const modelgraphs: [{ modelName: string, linkTypes: string[] }] = await res.json()
  if (!modelgraphs) {
    return { status: 404 }
  }
  return { modelgraphs: modelgraphs }
}) satisfies PageServerLoad