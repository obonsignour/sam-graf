import type { PageServerLoad } from './$types'
import { env } from '$env/dynamic/private'
import type { GraphsRow } from '$lib/customTypes'

export const load = (async ({ params }) => {
  const { appName } = params
  const res = await fetch(`http://${env.SAM_GRAF_SERVER}/Applications/${appName}/Transactions`)
  if (!res.ok) {
    return { status: res.status }
  }
  const transactions: GraphsRow[] = await res.json()
  if (!transactions) {
    return { status: 404 }
  }
  return { transactions: transactions }
}) satisfies PageServerLoad