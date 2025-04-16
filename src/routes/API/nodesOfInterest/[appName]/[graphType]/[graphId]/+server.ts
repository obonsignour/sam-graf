// src/routes/api/nodesOfInterest/[appName]/[graphType]/[graphId]/+server.ts
import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export async function GET({ params }) {
  const { appName, graphType, graphId } = params;
  
  try {
    // Add 's' to graphType if not already present
    const graphTypeEndpoint = graphType.endsWith('s') ? graphType : graphType + 's';
    
    const url = `http://${env.SAM_GRAF_SERVER}/Applications/${appName}/${graphTypeEndpoint}/${graphId}/NodesOfInterest`;
    console.log('Server fetching from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw error(response.status, `API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return json(data);
  } catch (e) {
    console.error('Error fetching nodes of interest:', e);
    throw error(500, 'Failed to fetch nodes of interest');
  }
}