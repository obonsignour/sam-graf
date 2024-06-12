import type { RawGraph } from '@linkurious/ogma'
import type { PageServerLoad } from './$types'
import { env } from '$env/dynamic/private'
import type { selectElement } from '$lib/selector.svelte'

export const load = (async ({ params }) => {
  const { appName, dataGraphName } = params
  if (!appName) {
    return { status: 404 }
  }
  const res = await fetch(`http://${env.SAM_GRAF_SERVER}/Applications/${appName}/DataGraphs/${dataGraphName}`)
  const graph: RawGraph = await res.json()

  const res2 = await fetch(`http://${env.SAM_GRAF_SERVER}/Applications/${appName}/DataGraphs/${dataGraphName}/LinkTypes`)
  const results: [{ relationType: string }] = await res2.json()
  
  const relationsTypes: selectElement[] = results.map((linkType) => { const element: selectElement = { value: linkType.relationType, label: linkType.relationType }; return element })
  //return { relationsTypes: relationsTypes }

  return { graph: graph, name: dataGraphName, relationsTypes: relationsTypes }
}) satisfies PageServerLoad