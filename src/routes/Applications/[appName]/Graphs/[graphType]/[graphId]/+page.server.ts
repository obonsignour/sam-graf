import type { RawGraph } from '@linkurious/ogma'
import type { PageServerLoad, Actions } from './$types'
import { env } from '$env/dynamic/private'
import { redirect } from '@sveltejs/kit'


export const load = (async ({ params, request, url }) => {
  const { appName, graphType, graphId } = params
  // const body = await request.formData()

  const { searchParams } = url

  console.log('Loading graph:', appName, graphType, graphId, searchParams.get('algo'))
  if (!appName) {
    return { status: 404 }
  }
  const URL = `http://${env.SAM_GRAF_SERVER}/Applications/${appName}/Graphs/${graphType}/${graphId}`
  const res = await fetch(URL)
  if (res.status !== 200) {
    console.error('Failed to load graph:', res.status)
    return { status: res.status }
  }
  const graph: RawGraph = await res.json()

  return { graph: graph, name: graphId }
}) satisfies PageServerLoad

// export const actions = {
//   compute: async ({ request, params, url }) => {
//     const { appName, graphType, graphId } = params
//     const data = await request.formData()
//     const { searchParams } = url

//     console.log('SelectedTypes:', data.get('selectedTypes'), appName, graphId, searchParams)
//     const algo = 'leiden'
//     const URL = `http://${env.SAM_GRAF_SERVER}/Applications/${appName}/Graphs/${graphType}/${graphId}/Algos/${algo}`

//     const response = await fetch(URL, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(data.get('selectedTypes')),
//     })

//     if (!response.ok) {
//       console.error('Failed to submit selections')
//       return ({ success: false, error: 'Failed to submit selections' })
//     }

//     return ({ location: "/", success: true })
//   },
// } satisfies Actions;

export const actions = {
  default: async () => {

  }
} satisfies Actions