import type { PageServerLoad } from './$types'
import { env } from '$env/dynamic/private'

export const load = (async ({ params }) => {
    const { appName } = params
    const res = await fetch(`http://${env.SAM_GRAF_SERVER}/Applications/${appName}/Concepts`)
    if (!res.ok) {
        return { status: res.status }
    }
    const concepts: { name: string, count: number }[] = await res.json()
    if (!concepts) {
        return { status: 404 }
    }
    return { appName: appName, concepts: concepts }
}) satisfies PageServerLoad