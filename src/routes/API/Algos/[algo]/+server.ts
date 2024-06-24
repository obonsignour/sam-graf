import { env } from '$env/dynamic/private'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'


export const POST: RequestHandler = async ({ params, request }) => {
  const { algo } = params
  const body = await request.json()

  const appName = body.appName
  const graphType = body.graphType
  const graphId = body.graphId
  const linkTypes = body.linkTypes

  if (!appName || !graphType || !graphId || !linkTypes) {
    return { status: 404, body: "at least one parameter missing when calling the algo" }
  }


  const URL = `http://${env.SAM_GRAF_SERVER}/Algos/${algo}/Compute`
  // //`http://${env.SAM_GRAF_SERVER}/Applications/${appName}/Transactions/${transactionName}/LinkTypes/Selected`
  const response = await fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const responseText = await response.text()
  console.log('responseText:', responseText, " response.status:", response.status)
  if (!response.ok) {
    console.error('Failed to submit selections', response.status, response.statusText, responseText)
    return json({ success: false, error: responseText })
  }

  return json({ success: true })
}

