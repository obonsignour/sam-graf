import type { PageServerLoad } from './$types'
import { env } from '$env/dynamic/private'

export const load = (async ({ params }) => {
  const { appName } = params
  const res = await fetch(`http://${env.SAM_GRAF_SERVER}/Applications/${appName}/Transactions`)
  if (!res.ok) {
    return { status: res.status }
  }
  const transactions: [{ id: string, name: string }] = await res.json()
  if (!transactions) {
    return { status: 404 }
  }
  return { transactions: transactions }
}) satisfies PageServerLoad