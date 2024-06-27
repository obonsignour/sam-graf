import { env } from '$env/dynamic/private'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params }) => {
  const { taskId } = params
  console.log('On server - Polling the server for taskId:', taskId)
  const response = await fetch(`http://${env.SAM_GRAF_SERVER}/Algos/Tasks/${taskId}`)
  const responseText = await response.text()
  return new Response(responseText, { status: response.status })
}