import type { PageLoad } from './$types'
export const load: PageLoad = async ({ fetch, params }) => {
  const res = await fetch(`http://localhost:5000/TI_ZONE/Level5s`)
  // const res = await fetch(`/api/posts/${params.slug}`)
  const item = await res.json()
  console.log(item)
  return { item }
}