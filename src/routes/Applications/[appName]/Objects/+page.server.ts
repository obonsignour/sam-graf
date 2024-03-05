import type { RawGraph } from '@linkurious/ogma'
import type { PageServerLoad } from './$types'
import { env } from '$env/dynamic/private'

export const load = (async ({ params }) => {
  const { appName } = params
  const res = await fetch(`http://${env.SAM_GRAF_SERVER}/Applications/${appName}/Objects`)
  const graph: RawGraph = await res.json()

  return { graph }
}) satisfies PageServerLoad