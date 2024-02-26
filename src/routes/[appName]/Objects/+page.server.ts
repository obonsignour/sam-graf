import type { RawGraph } from '@linkurious/ogma'
import type { PageServerLoad } from './$types'

export const load = (async ({ params }) => {
  const { appName } = params
  const res = await fetch(`http://localhost:5000/${appName}/Objects`)
  const graph: RawGraph = await res.json()

  return { graph }
}) satisfies PageServerLoad