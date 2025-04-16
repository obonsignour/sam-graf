import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Flask server URL
const FLASK_API_URL = 'http://127.0.0.1:5500';

export const GET: RequestHandler = async ({ params, url }) => {
    const id = params.id;
    const app = url.searchParams.get('app') || 'ecommerce115';
    
    console.log(`[SvelteKit API] Fetching source code for id=${id}, app=${app}`);
    
    try {
        // Build the URL to the Flask server
        const apiUrl = `${FLASK_API_URL}/API/source-code/${app}/${id}`;
        console.log(`[SvelteKit API] Forwarding request to Flask API: ${apiUrl}`);
        
        // Make the request to the Flask server
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            console.error(`[SvelteKit API] Flask API error: ${response.status} ${response.statusText}`);
            return json({
                success: false,
                error: `Flask API error: ${response.status} ${response.statusText}`
            }, { status: response.status });
        }
        
        // Get the response data from Flask
        const data = await response.json();
        console.log(`[SvelteKit API] Received response from Flask API:`, data);
        
        // Return the data to the client
        return json(data);
    } catch (error) {
        console.error(`[SvelteKit API] Exception when proxying to Flask API:`, error);
        return json({
            success: false,
            error: `Error connecting to Flask API: ${error instanceof Error ? error.message : String(error)}`
        }, { status: 500 });
    }
};