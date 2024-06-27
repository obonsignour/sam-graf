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
    return new Response("at least one parameter missing when calling the algo", { status: 404 })
  }
  const URL = `http://${env.SAM_GRAF_SERVER}/Algos/${algo}/Compute`

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
    return new Response(responseText, { status: response.status })
  }

  return new Response(responseText, { status: response.status })
}

