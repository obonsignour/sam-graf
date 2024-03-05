import type { RawGraph } from '@linkurious/ogma'
import type { PageServerLoad } from './$types'

import { env } from '$env/dynamic/private'

export const load = (async ({ params }) => {
  return {}
}) satisfies PageServerLoad 