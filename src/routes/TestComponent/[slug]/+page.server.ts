import type { RawGraph } from '@linkurious/ogma'
import type { PageServerLoad } from './$types'

export const load = (async () => {
  const res = await fetch(`http://localhost:5000/TI_ZONE/Level5s`)
  const graph: RawGraph = await res.json()

  return { graph }
}) satisfies PageServerLoad