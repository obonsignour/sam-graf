import type { RawGraph } from '@linkurious/ogma'
import type { PageServerLoad } from './$types'
import { env } from '$env/dynamic/private'

export const load = (async ({ params, url }) => {
  const { appName, levelNumber } = params

  if (appName === "undefined" || levelNumber === "undefined") {
    return { status: 404 }
  }
  const res = await fetch(`http://${env.SAM_GRAF_SERVER}/Applications/${appName}/Levels/${levelNumber}`)
  const graph: RawGraph = await res.json()
  return { graph }
}) satisfies PageServerLoad