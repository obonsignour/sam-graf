import type { RawGraph } from '@linkurious/ogma'
import type { PageServerLoad, Actions } from './$types'
import { env } from '$env/dynamic/private'
import { error } from '@sveltejs/kit'

export const load = (async ({ params, url }) => {
	const { appName, transactionId } = params
	const { searchParams } = url

	console.log('Loading transaction:', appName, transactionId, searchParams.get('algo'))
	if (!appName) {
		error(404, `Application ${appName} doesn\'t exist`)
	}
	const URL = `http://${env.SAM_GRAF_SERVER}/Applications/${appName}/Transactions/${transactionId}`
	const res = await fetch(URL)
	if (res.status !== 200) {
		console.error('Failed to load graph:', res.status)
		error(res.status, `Failed to load graph: ${res.status}`)
	}
	const graph: RawGraph<any, any> = await res.json()

	return { rawGraph: graph, id: transactionId }
}) satisfies PageServerLoad


export const actions = {
	default: async () => {

	}
} satisfies Actions