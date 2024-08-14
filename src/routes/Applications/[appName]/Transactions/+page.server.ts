import type { PageServerLoad } from './$types'
import { env } from '$env/dynamic/private'
import type { GraphListRow } from '$lib/customTypes'
import { error } from '@sveltejs/kit'

export const load = (async ({ params }) => {
  const { appName } = params
  const res = await fetch(`http://${env.SAM_GRAF_SERVER}/Applications/${appName}/Transactions`)
  if (!res.ok) {
    error(res.status, `Failed to load transactions: ${res.status}`)
  }
  const transactions: GraphListRow[] = await res.json()
  if (!transactions) {
    error(404, `Failed to load transactions: ${res.status}`)
  }
  console.log("Returning: ", transactions.length, ' transactions')
  return { transactions: transactions }
}) satisfies PageServerLoad