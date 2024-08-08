import type { RawGraph } from '@linkurious/ogma'
import type { PageServerLoad, Actions } from './$types'
import { env } from '$env/dynamic/private'

export const load = (async ({ params, request, url }) => {
	const { appName, transactionId } = params
	const { searchParams } = url

	console.log('Loading transaction:', appName, transactionId, searchParams.get('algo'))
	if (!appName) {
		return { status: 404 }
	}
	const URL = `http://${env.SAM_GRAF_SERVER}/Applications/${appName}/Transactions/${transactionId}`
	const res = await fetch(URL)
	if (res.status !== 200) {
		console.error('Failed to load graph:', res.status)
		return { status: res.status }
	}
	const graph: RawGraph = await res.json()

	return { rawGraph: graph, id: transactionId }
}) satisfies PageServerLoad


export const actions = {
	default: async () => {

	}
} satisfies Actions