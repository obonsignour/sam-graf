import { json } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { env } from '$env/dynamic/private'

export const load = (async () => {
  return {}
}) satisfies PageServerLoad

export const actions = {
  compute: async ({ request, params }) => {
    const { appName, dataGraphName } = params
    const data = await request.formData()

    console.log('Data:', data, appName, dataGraphName)
    return json({ success: true })
  },
} satisfies Actions