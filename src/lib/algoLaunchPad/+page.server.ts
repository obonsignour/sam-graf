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
    // const selectedItems = JSON.parse(data.get('selectedItems') as string)

    // console.log(`Selected items for ${appName}/${dataGraphName}:`, selectedItems)

    // // Forward the data to the external server
    // const dataToSend = {
    //   relationTypesSelected: selectedItems,
    // }

    // const URL = `http://${env.SAM_GRAF_SERVER}/Applications/${appName}/Graphs/${graphType}/${graphId}/Algos/${algo}`

    // const response = await fetch(`http://${env.SAM_GRAF_SERVER}/Applications/${appName}/DataGraphs/${dataGraphName}/LinkTypes/Selected`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(dataToSend),
    // })

    // if (!response.ok) {
    //   console.error('Failed to submit selections')
    //   return json({ success: false, error: 'Failed to submit selections' })
    // }

    return json({ success: true })
  },
} satisfies Actions