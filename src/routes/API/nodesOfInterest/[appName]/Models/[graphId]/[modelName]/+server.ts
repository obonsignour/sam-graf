// src/routes/API/nodesOfInterest/[appName]/Models/[graphId]/[modelName]/+server.ts
import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export async function GET({ params }) {
  const { appName, graphId, modelName } = params;
  
  try {
    const url = `http://${env.SAM_GRAF_SERVER}/Applications/${appName}/Models/${graphId}/${modelName}/NodesOfInterest`;
    console.log('Server fetching model nodes of interest from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw error(response.status, `API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return json(data);
  } catch (e) {
    console.error('Error fetching model nodes of interest:', e);
    throw error(500, 'Failed to fetch model nodes of interest');
  }
}