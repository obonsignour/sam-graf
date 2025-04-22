import type Ogma from "@linkurious/ogma"
import type { ForceLayoutOptions, ForceLinkOptions, HierarchicalLayoutOptions, LocateOptions } from "@linkurious/ogma"
//import { startNodesStore, endNodesStore } from '$lib/generalStore'
import { logger } from '$lib/logger' // Import the logger

// Architecture layer and role definitions
export const architecturalLayers = ['INTERFACE', 'BUSINESS', 'DATA', 'UTILITY', 'INFRASTRUCTURE']
export const architecturalLayerOrder = {
  'INTERFACE': 0,     // Top
  'BUSINESS': 1,      // Middle
  'DATA': 2,          // Bottom
  'UTILITY': 3,       // Right side
  'INFRASTRUCTURE': 4 // Bottom right
}

// Role categories mapping
export const roleCategoriesMap = {
  'DATA': ['Entity', 'Repository', 'ValueObject', 'Enum'],
  'BUSINESS': ['Service', 'DomainService', 'Calculator', 'Validator', 'Factory'],
  'INTERFACE': ['Controller', 'View', 'Formatter', 'InputValidator'],
  'INFRASTRUCTURE': ['Configuration', 'Security', 'Logger', 'Integration'],
  'UTILITY': ['Helper/Util', 'Mapper', 'Builder']
}

// Function to get the layer for a role
export const getLayerForRole = (role: string): string => {
  // Check if role is null or undefined
  if (!role) return 'Unknown'
  
  // Handle partial matches for roles (in case of formatting differences)
  for (const [layer, roles] of Object.entries(roleCategoriesMap)) {
    // Exact match
    if (roles.includes(role)) {
      return layer
    }
    
    // Partial match
    for (const layerRole of roles) {
      if (role.includes(layerRole) || layerRole.includes(role)) {
        return layer
      }
    }
  }
  
  // Check if the role matches a layer name
  if (architecturalLayers.includes(role)) {
    return role
  }
  
  return 'Unknown'
}

/*let currentStartNodes = [];
let currentEndNodes = [];

startNodesStore.subscribe(value => {
    currentStartNodes = value;

});

endNodesStore.subscribe(value => {
    currentEndNodes = value;
});

console.log('Layout applied with start and end nodes:', currentStartNodes, currentEndNodes)
*/

export const defaultLocateOptions: LocateOptions = {
  duration: 300,
  easing: 'quadraticIn',
  maxNodeSizeOnScreen: 100,
  padding: 1
}

export const defaultForceOptions: ForceLayoutOptions = {
  locate: true,
  charge: 3
}

export const defaultForceLinkOptions: ForceLinkOptions = {
  locate: true
}

export const defaultHierarchicalOptions: HierarchicalLayoutOptions = {
  locate: true
}

// New layout types for architectural layouts
export const LayoutType = {
  Force: 'force',
  ForceLink: 'forceLink',
  Hierarchical: 'hierarchical',
  Sami: 'sami',
  SamiNoR: 'samiNoR',
  ArchitecturalLayer: 'architecturalLayer',
  ArchitecturalRole: 'architecturalRole'
} as const
type ValLayoutType = (typeof LayoutType)[keyof typeof LayoutType]

// Options for architectural layouts
export interface ArchitecturalLayoutOptions {
  duration?: number;
  locate?: boolean;
}

export const defaultArchitecturalOptions: ArchitecturalLayoutOptions = {
  duration: 800,
  locate: true
}

// Layout function for architectural layers - COMPLETELY REWRITTEN
const applyArchitecturalLayerLayout = (ogma: Ogma, options: ArchitecturalLayoutOptions = {}): Promise<unknown> => {
  logger.info("Applying architectural layer layout");
  
  return new Promise((resolve, reject) => {
    try {
      // Get all virtual nodes (groups)
      const groupNodes = ogma.getNodes().filter(node => node.isVirtual());
      
      logger.info(`Found ${groupNodes.size} group nodes for layer layout`);
      
      // Custom positioning for each layer
      const positions: {[key: string]: {x: number, y: number}} = {};
      const centerX = 0;
      let yOffset = -500;  // Start from top
      const ySpacing = 300;  // Vertical space between layers
      const xOffset = 600;   // For UTILITY and INFRASTRUCTURE
      
      // Position main vertical flow: INTERFACE -> BUSINESS -> DATA
      architecturalLayers.slice(0, 3).forEach((layer, index) => {
        positions[layer] = {
          x: centerX,
          y: yOffset + (index * ySpacing)
        };
      });
      
      // Position UTILITY and INFRASTRUCTURE to the right side
      positions['UTILITY'] = {
        x: xOffset,
        y: yOffset + ySpacing // At the same level as BUSINESS
      };
      
      positions['INFRASTRUCTURE'] = {
        x: xOffset,
        y: yOffset + (2 * ySpacing) // At the same level as DATA
      };
      
      // Set positions for each group
      let nodesPositioned = 0;
      groupNodes.forEach(node => {
        const groupId = node.getData('groupId');
        logger.info(`Node ${node.getId()} has groupId ${groupId}`);
        
        // If the group ID matches a layer name
        if (positions[groupId]) {
          const pos = positions[groupId];
          node.setAttributes({ x: pos.x, y: pos.y });
          nodesPositioned++;
        }
      });
      
      logger.info(`Positioned ${nodesPositioned} nodes`);
      
      // Simply locate the graph to show all nodes
      if (options.locate !== false) {
        ogma.view.locateGraph(defaultLocateOptions).then(() => {
          resolve({ type: 'layout', name: 'architecturalLayer' });
        });
      } else {
        resolve({ type: 'layout', name: 'architecturalLayer' });
      }
    } catch (error) {
      logger.error('Error applying architectural layer layout:', error);
      reject(error);
    }
  });
};

// Layout function for architectural roles - COMPLETELY REWRITTEN
const applyArchitecturalRoleLayout = (ogma: Ogma, options: ArchitecturalLayoutOptions = {}): Promise<unknown> => {
  logger.info("Applying architectural role layout");
  
  return new Promise((resolve, reject) => {
    try {
      // Get all virtual nodes (groups)
      const groupNodes = ogma.getNodes().filter(node => node.isVirtual());
      
      logger.info(`Found ${groupNodes.size} group nodes for role layout`);
      
      // Create a map of positions for each role based on its layer
      const positions: {[key: string]: {x: number, y: number}} = {};
      const layerY: {[key: string]: number} = {};
      
      // Calculate Y position for each layer
      let yOffset = -500;  // Start from top
      const ySpacing = 300;
      
      // Set y positions for main vertical flow layers
      architecturalLayers.slice(0, 3).forEach((layer, index) => {
        layerY[layer] = yOffset + (index * ySpacing);
      });
      
      // Set y positions for side layers
      layerY['UTILITY'] = yOffset + ySpacing;  // Same level as BUSINESS
      layerY['INFRASTRUCTURE'] = yOffset + (2 * ySpacing);  // Same level as DATA
      layerY['Unknown'] = yOffset + (3 * ySpacing);  // Below everything else
      
      // Group roles by layer for proper distribution
      const rolesByLayer: {[key: string]: string[]} = {};
      
      groupNodes.forEach(node => {
        const role = node.getData('groupId');
        if (!role) return;
        
        const layer = getLayerForRole(role);
        if (!rolesByLayer[layer]) {
          rolesByLayer[layer] = [];
        }
        if (!rolesByLayer[layer].includes(role)) {
          rolesByLayer[layer].push(role);
        }
      });
      
      // Calculate positions for each role within its layer
      Object.entries(rolesByLayer).forEach(([layer, roles]) => {
        const y = layerY[layer] || layerY['Unknown'];
        const count = roles.length;
        
        // Base position and spacing
        let xBase = 0;
        let xSpacing = 300;
        
        // Adjust position for side layers
        if (layer === 'UTILITY' || layer === 'INFRASTRUCTURE' || layer === 'Unknown') {
          xBase = 600;  // Side position
        }
        
        // Distribute roles horizontally
        if (count > 1) {
          const layerWidth = (count - 1) * xSpacing;
          const startX = xBase - (layerWidth / 2);
          
          roles.forEach((role, index) => {
            positions[role] = {
              x: startX + (index * xSpacing),
              y: y
            };
          });
        } else if (count === 1) {
          positions[roles[0]] = {
            x: xBase,
            y: y
          };
        }
      });
      
      // Set positions for each group
      let nodesPositioned = 0;
      groupNodes.forEach(node => {
        const role = node.getData('groupId');
        
        if (positions[role]) {
          const pos = positions[role];
          node.setAttributes({ x: pos.x, y: pos.y });
          nodesPositioned++;
          logger.info(`Positioned node ${node.getId()} with role ${role} at [${pos.x}, ${pos.y}]`);
        } else {
          logger.warn(`No position found for role: ${role}`);
        }
      });
      
      logger.info(`Positioned ${nodesPositioned} nodes`);
      
      // Simply locate the graph to show all nodes
      if (options.locate !== false) {
        ogma.view.locateGraph(defaultLocateOptions).then(() => {
          resolve({ type: 'layout', name: 'architecturalRole' });
        });
      } else {
        resolve({ type: 'layout', name: 'architecturalRole' });
      }
    } catch (error) {
      logger.error('Error applying architectural role layout:', error);
      reject(error);
    }
  });
};

// Modified applyLayout function to better handle architectural layouts
export const applyLayout = (
  ogma: Ogma,
  layout: ValLayoutType,
  options: (ForceLayoutOptions | ForceLinkOptions | HierarchicalLayoutOptions | { entryNodes: [], exitNodes: [] } | ArchitecturalLayoutOptions) = {}
) => {
  const layouts = [
    {
      type: LayoutType.Force,
      layoutFunction: (options: ForceLayoutOptions): Promise<unknown> => ogma.layouts.force(options ? options : defaultForceOptions) as Promise<unknown>,
    },
    {
      type: LayoutType.ForceLink,
      layoutFunction: (options: ForceLinkOptions): Promise<unknown> => ogma.layouts.forceLink(options ? options : defaultForceLinkOptions),
    },
    {
      type: LayoutType.Hierarchical,
      layoutFunction: (options: HierarchicalLayoutOptions): Promise<unknown> => ogma.layouts.hierarchical(options ? options : defaultHierarchicalOptions),
    },
    {
      type: LayoutType.Sami,
      layoutFunction: (options: { entryNodes: [], exitNodes: [] }): Promise<unknown> => samiLayout(options.entryNodes, options.exitNodes, ogma)
    },
    {
      type: LayoutType.SamiNoR,
      layoutFunction: (options: { entryNodes: [], exitNodes: [] }): Promise<unknown> => samiLayoutNoR(options.entryNodes, options.exitNodes, ogma)
    },
    {
      type: LayoutType.ArchitecturalLayer,
      layoutFunction: (options: ArchitecturalLayoutOptions): Promise<unknown> => applyArchitecturalLayerLayout(ogma, options)
    },
    {
      type: LayoutType.ArchitecturalRole,
      layoutFunction: (options: ArchitecturalLayoutOptions): Promise<unknown> => applyArchitecturalRoleLayout(ogma, options)
    }
  ]

  const layoutObj = layouts.find((l) => l.type === layout)

  if (!layoutObj || !layoutObj.layoutFunction) {
    console.log(`Layout type '${layout}' not found.`)
    return Promise.reject(new Error(`Layout type '${layout}' not found.`))
  }
  else {
    console.log(`Layout type '${layout}' FOUND.`)
  }

  return layoutObj.layoutFunction(options as any) // Type-casting options properly
    .then(() => {
      // For architectural layouts, we skip the additional locateGraph to prevent
      // any interference with the layout that was just applied
      if (layout !== LayoutType.ArchitecturalLayer && layout !== LayoutType.ArchitecturalRole) {
        return ogma.view.locateGraph(defaultLocateOptions);
      }
    })
    .catch(err => {
      console.error(`Error applying layout: ${err}`);
      return Promise.reject(err);
    });
}


const samiLayoutNoR = (entryNodes: string[], exitNodes: string[], ogma: Ogma): Promise<unknown> => {
  console.time('samiLayoutNoR');
  console.log('Starting samiLayoutNoR with entry nodes:', entryNodes, 'and exit nodes:', exitNodes);
  
  return new Promise((resolve, reject) => {
    try {
      // Retrieve all visible nodes and edges
      console.log('Retrieving visible nodes and edges...');
      const visibleNodes = ogma.getNodes("visible").map(node => ({ 
        id: String(node.getId()),
        radius: node.getAttribute('radius')
       }));
      const visibleEdges = ogma.getEdges("visible").map(edge => ({
        id: String(edge.getId()),
        source: String(edge.getSource().getId()),
        target: String(edge.getTarget().getId())
      }));

      console.log(`Graph has ${visibleNodes.length} nodes and ${visibleEdges.length} edges`);

      const G = {
        nodes: visibleNodes,
        edges: visibleEdges
      }

      // Determine whether it is a Transaction or Datagraph based on entryNodes[0]
      console.log('Determining graph type...');
      const isTransaction = successors(G, entryNodes[0]).length === 0;
      console.log('Graph is a', isTransaction ? 'Transaction' : 'DataGraph');

      // Compute positions using custom layout
      console.log('Computing node positions with customLayoutDirected...');
      console.time('customLayoutDirected');
      const positions = customLayoutDirected(G, entryNodes, exitNodes);
      console.timeEnd('customLayoutDirected');
      console.log('Position computation complete.');
      
      // Apply positions to nodes in the graph
      console.log('Applying positions to nodes...');
      Object.keys(positions).forEach(nodeId => {
        const pos = positions[nodeId];
        const x = pos[0] * -500;
        const y = pos[1] * -500;
      
        // Keep your original logic for y-coordinate flipping
        ogma.getNode(nodeId).setAttributes({
          x: x,
          y: isTransaction ? -y : y,
          radius: 3
        });
      });
      console.log('Position application complete.');

      // Center the view on the graph
      console.log('Centering view...');
      ogma.view.locateGraph().then(() => {
        console.log('Graph displayed with Sami Layout positions.');
        console.timeEnd('samiLayoutNoR');
        resolve({ type: 'layout', name: 'sami' });
      });
    } catch (error) {
      console.error('Error in samiLayoutNoR:', error);
      reject(error);
    }
  });
}

const samiLayout = (entryNodes, exitNodes, ogma) => {
  console.time('samiLayout');
  console.log('Starting samiLayout with entry nodes:', entryNodes, 'and exit nodes:', exitNodes);
  
  return new Promise((resolve, reject) => {
    try {
      // Retrieve all visible nodes and edges
      console.log('Retrieving visible nodes and edges...');
      const visibleNodes = ogma.getNodes("visible").map(node => ({ 
        id: String(node.getId()),
        radius: node.getAttribute('radius')
       }));
      const visibleEdges = ogma.getEdges("visible").map(edge => ({
        id: String(edge.getId()),
        source: String(edge.getSource().getId()),
        target: String(edge.getTarget().getId())
      }));

      console.log(`Graph has ${visibleNodes.length} nodes and ${visibleEdges.length} edges`);

      const G = {
        nodes: visibleNodes,
        edges: visibleEdges
      };

      // Determine the biggest node size
      let maxNodeSize = 0;
      visibleNodes.forEach(node => {
        const size = node.radius;
        if (size > maxNodeSize) {
          maxNodeSize = size;
        }
      });

      // Determine whether it is a Transaction or Datagraph based on entryNodes[0]
      console.log('Determining graph type...');
      const isTransaction = successors(G, entryNodes[0]).length === 0;
      console.log('Graph is a', isTransaction ? 'Transaction' : 'DataGraph');

      // To avoid node overlap
      const spacing = maxNodeSize * 30;
      console.log("spacing:", spacing);
      console.log("Max node size:", maxNodeSize);

      // Compute positions using custom layout
      console.log('Computing node positions with customLayoutDirected...');
      console.time('customLayoutDirected');
      const positions = customLayoutDirected(G, entryNodes, exitNodes);
      console.timeEnd('customLayoutDirected');
      console.log('Position computation complete.');

      // Apply positions to nodes in the graph
      console.log('Applying positions to nodes...');
      Object.keys(positions).forEach(nodeId => {
        const pos = positions[nodeId];
        const x = pos[0] * -(500 + spacing);
        const y = pos[1] * -(500 + spacing);
      
        // Keep your original logic for y-coordinate flipping
        ogma.getNode(nodeId).setAttributes({
          x: x,
          y: isTransaction ? -y : y
        });
      });
      console.log('Position application complete.');

      // Center the view on the graph
      console.log('Centering view...');
      ogma.view.locateGraph().then(() => {
        console.log('Graph displayed with Sami Layout positions.');
        console.timeEnd('samiLayout');
        resolve({ type: 'layout', name: 'sami' });
      });
    } catch (error) {
      console.error('Error in samiLayout:', error);
      reject(error);
    }
  });
};


const samiLayout0 = (entryNodes: string[], exitNodes: string[], ogma: Ogma): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    try {
      // Retrieve all visible nodes and edges
      const visibleNodes = ogma.getNodes("visible").map(node => ({ id: String(node.getId()) }))
      const visibleEdges = ogma.getEdges("visible").map(edge => ({
        id: String(edge.getId()),
        source: String(edge.getSource().getId()),
        target: String(edge.getTarget().getId())
      }))

      const G = {
        nodes: visibleNodes,
        edges: visibleEdges
      }

      // Compute positions using custom layout and Apply positions to nodes in the graph
      const positions = customLayoutDirected(G, entryNodes, exitNodes)
      Object.keys(positions).forEach(nodeId => {
        const pos = positions[nodeId]
        ogma.getNode(nodeId).setAttributes({
          x: pos[0] * -500,
          y: pos[1] * -500
        })
      })

      // Center the view on the graph
      ogma.view.locateGraph().then(() => {
        console.log('Graph displayed with Sami Layout positions.')
        resolve({ type: 'layout', name: 'sami' })
      })
    } catch (error) {
      reject(error)
    }
  })
}

// Define methods to access graph data using G as a parameter
const getNodes = (G: any) => {
  return G.nodes.map((node: any) => node.id)
}

const getEdges = (G: any) => {
  return G.edges.map((edge: any) => [edge.source, edge.target])
}

const successors = (G: any, nodeId: string) => {
  return getEdges(G).filter((edge: [string, string]) => edge[0] === nodeId).map((edge: [string, string]) => edge[1])
}

const predecessors = (G: any, nodeId: string) => {
  return getEdges(G).filter((edge: [string, string]) => edge[1] === nodeId).map((edge: [string, string]) => edge[0])
}

// The assignLevels function
function assignLevels0(G, entryNodes, exitNodes) {
  const levels = {}
  let level = 0
  let queue = [...entryNodes]

  // BFS to assign levels
  while (queue.length > 0) {
    const nextQueue = []
    for (const node of queue) {
      if (!(node in levels)) {
        levels[node] = level

        for (const successor of successors(G, node)) {
          //for (const successor of predecessors(G, node)) {
          if (!(successor in levels) && !exitNodes.includes(successor)) {
            nextQueue.push(successor)
          }
        }
      }
    }
    queue = nextQueue
    level += 1
  }

  // Assign exit nodes to a distinct final level
  const finalLevel = Math.max(...Object.values(levels)) + 1
  for (const exitNode of exitNodes) {
    levels[exitNode] = finalLevel
  }

  return levels
}

// The assignLevels function for DG and Transaction, taking care of unreachable nodes
function assignLevels(G, entryNodes, exitNodes) {
  console.log('Starting assignLevels...');
  console.time('assignLevels');
  
  const levels = {} // This will store the levels of nodes
  let level = 0
  let queue = [...entryNodes]

  const nodes = getNodes(G)
  console.log(`Total nodes: ${nodes.length}, Entry nodes: ${entryNodes.length}, Exit nodes: ${exitNodes.length}`);

  // Identify disconnected nodes
  console.log('Identifying disconnected nodes...');
  const disconnectedNodes = nodes.filter((nodeId: string) => {
    const hasNoPredecessors = predecessors(G, nodeId).length === 0
    const hasNoSuccessors = successors(G, nodeId).length === 0
    return hasNoPredecessors && hasNoSuccessors
  })
  console.log(`Found ${disconnectedNodes.length} disconnected nodes`);

  // Determine whether to use successors or predecessors based on entryNodes[0]
  const useSuccessors = successors(G, entryNodes[0]).length > 0
  console.log(`Using ${useSuccessors ? 'successors' : 'predecessors'} for traversal`);

  // BFS to assign levels from entry nodes
  console.log('Performing BFS to assign levels...');
  while (queue.length > 0) {
    const nextQueue = []
    for (const node of queue) {
      if (!(node in levels)) {
        levels[node] = level // Assign current level to the node

        // Choose successor or predecessor based on `useSuccessors`
        let connectedNodes = useSuccessors
          ? successors(G, node)       // Use successors if available
          : predecessors(G, node)    // Otherwise, use predecessors

        // Traverse the connected nodes
        for (const connectedNode of connectedNodes) {
          if (!(connectedNode in levels) && !exitNodes.includes(connectedNode)) {
            nextQueue.push(connectedNode)
          }
        }
      }
    }
    queue = nextQueue
    level += 1
    
    // Debug log to track BFS progress
    if (nextQueue.length > 0) {
      console.log(`BFS Level ${level-1} complete, next queue size: ${nextQueue.length}`);
    }
  }

  let maxLevel = Math.max(...Object.values(levels), 0) // Get the max level from assigned nodes, default to 0 if empty
  console.log('maxLevel', maxLevel);

  // Assign levels to unreachable nodes (from disconnected components)
  let nextAvailableLevel = maxLevel + 1;
  console.log('nextAvailableLevel', nextAvailableLevel);

  // Assigning exit nodes to the 0 level just to mark them as visited => for unreachable nodes 
  for (const exitNode of exitNodes) {
    levels[exitNode] = 0
  }
  // Same for disconnected node, which will be placed later on
  for (const disconnectedNode of disconnectedNodes) {
    levels[disconnectedNode] = 0
  }

  const visited = new Set(Object.keys(levels)) // Track nodes already visited
  console.log(`Nodes with assigned levels: ${visited.size}`);

  // Iterate over all nodes in the graph to handle unreachable (disconnected) nodes
  console.log('Assigning levels to unreachable nodes...');
  for (const node of G.nodes) {
    if (!visited.has(node.id)) {  // If the node is not visited, it's unreachable
      console.log(`Found unreachable node: ${node.id}`);
      // Assign this unreachable node to the next available level
      levels[node.id] = nextAvailableLevel
      visited.add(node.id)  // Mark it as visited
      console.log(`Assigned level ${nextAvailableLevel} to unreachable node ${node.id}`);

      nextAvailableLevel += 1  // For potential future unreachable nodes
    }
  }

  // Assigning exit nodes to a last distinct level
  maxLevel = Math.max(...Object.values(levels), 0) // Get the max level from assigned nodes
  console.log('Updated maxLevel', maxLevel);
  const finalLevel = maxLevel + 1
  for (const exitNode of exitNodes) {
    levels[exitNode] = finalLevel
  }
  console.log(`Assigned exit nodes to level ${finalLevel}`);

  // Log level distribution
  const levelCounts = {};
  Object.values(levels).forEach(lvl => {
    levelCounts[lvl] = (levelCounts[lvl] || 0) + 1;
  });
  console.log('Level distribution:', levelCounts);
  
  console.timeEnd('assignLevels');
  return levels
}

// The assignLevels function for DG and Transaction, NOT taking care of unreachable nodes
function assignLevels2(G, entryNodes, exitNodes) {
  const levels = {}
  let level = 0
  let queue = [...entryNodes]

  // Determine whether to use successors or predecessors based on entryNodes[0]
  const useSuccessors = successors(G, entryNodes[0]).length > 0

  // BFS to assign levels
  while (queue.length > 0) {
    const nextQueue = []
    for (const node of queue) {
      if (!(node in levels)) {
        levels[node] = level

        // Choose successor or predecessor based on `useSuccessors`
        let connectedNodes = useSuccessors
          ? successors(G, node)       // Use successors if available
          : predecessors(G, node)    // Otherwise, use predecessors

        // Traverse the connected nodes
        for (const connectedNode of connectedNodes) {
          if (!(connectedNode in levels) && !exitNodes.includes(connectedNode)) {
            nextQueue.push(connectedNode)
          }
        }
      }
    }
    queue = nextQueue
    level += 1
  }

  // Assign exit nodes to a distinct final level
  const finalLevel = Math.max(...Object.values(levels)) + 1
  for (const exitNode of exitNodes) {
    levels[exitNode] = finalLevel
  }

  return levels
}

// Function to calculate the barycenter heuristic
function barycenterHeuristic(G, levels, pos, maxWidth = 1) {
  console.log('Starting barycenterHeuristic...');
  console.time('barycenterHeuristic');
  
  const maxLevel = Math.max(...Object.values(levels));
  console.log(`Maximum level: ${maxLevel}`);

  for (let level = 1; level <= maxLevel; level++) {
    const nodesInLevel = Object.keys(levels).filter(node => levels[node] === level);
    console.log(`Level ${level}: ${nodesInLevel.length} nodes`);

    if (nodesInLevel.length === 0) continue;

    // Compute barycenter for each node in the current level based on connections to previous levels
    const barycenter = {}
    for (const node of nodesInLevel) {
      const prevLevelNodes = getEdges(G)
        .filter((edge: [string, string]) => edge[0] === node || edge[1] === node) // Find edges connected to the node
        .map((edge: [string, string]) => {
          // Extract the connected nodes
          return edge[0] === node ? edge[1] : edge[0]
        })
        .filter((connectedNode: string) => levels[connectedNode] < level);

      if (prevLevelNodes.length > 0) {
        const avgX = prevLevelNodes.reduce((sum, p) => sum + pos[p][0], 0) / prevLevelNodes.length
        barycenter[node] = avgX
      } else {
        barycenter[node] = 0 // Default if no neighbors
      }
    }

    // Sort nodes in the current level based on their barycenter
    const sortedNodes = nodesInLevel.sort((a, b) => (barycenter[a] || 0) - (barycenter[b] || 0));

    // Dynamically space out nodes in the current level based on the number of nodes
    const numNodes = nodesInLevel.length;
    const xPositions = Array.from({ length: numNodes }, (_, i) => (i + 1) * maxWidth / (numNodes + 1));

    // Assign positions to nodes, ensuring no overlap horizontally
    sortedNodes.forEach((node, idx) => {
      pos[node] = [xPositions[idx], pos[node][1]];
    });
  }
  
  console.timeEnd('barycenterHeuristic');
  return pos;
}

// Function to determine the orientation of three points
function orientation(p, q, r) {
  const val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1])
  if (val === 0) return 0 // collinear
  return (val > 0) ? 1 : 2 // clock or counterclockwise
}

// Function to check if point q lies on line segment pr
function onSegment(p, q, r) {
  return (q[0] <= Math.max(p[0], r[0]) && q[0] >= Math.min(p[0], r[0]) &&
    q[1] <= Math.max(p[1], r[1]) && q[1] >= Math.min(p[1], r[1]))
}

function findVisuallyOverlappingEdges(G, pos) {
  console.log('Looking for visually overlapping edges...');
  console.time('findOverlappingEdges');
  
  const overlappingEdges = {}
  const edges = G.edges;  // Assume edges are given as objects with `id`, `source`, and `target`
  console.log(`Checking ${edges.length} edges for overlaps`);

  // Helper function to get sorted edge key for edge identification
  const getEdgeKey = (edge) => [edge.source, edge.target].sort().join('-');

  // Check for overlapping edges
  // This is O(n²) and could be a bottleneck
  let edgePairsChecked = 0;
  let overlapsFound = 0;
  
  for (let i = 0; i < edges.length; i++) {
    const edge1 = edges[i];
    const u1 = edge1.source;
    const v1 = edge1.target;
    const p1 = pos[u1];
    const q1 = pos[v1];
    
    if (!p1 || !q1) {
      console.log(`Warning: Missing position for nodes of edge ${edge1.id} (${u1} -> ${v1})`);
      continue;
    }

    for (let j = i + 1; j < edges.length; j++) {
      edgePairsChecked++;
      
      // Log progress every 10000 checks
      if (edgePairsChecked % 10000 === 0) {
        console.log(`Checked ${edgePairsChecked} edge pairs so far, found ${overlapsFound} overlaps`);
      }
      
      const edge2 = edges[j];
      const u2 = edge2.source;
      const v2 = edge2.target;
      const p2 = pos[u2];
      const q2 = pos[v2];
      
      if (!p2 || !q2) {
        console.log(`Warning: Missing position for nodes of edge ${edge2.id} (${u2} -> ${v2})`);
        continue;
      }

      const o1 = orientation(p1, q1, p2);
      const o2 = orientation(p1, q1, q2);
      const o3 = orientation(p2, q2, p1);
      const o4 = orientation(p2, q2, q1);

      // Check if they are collinear
      if (o1 === 0 && o2 === 0) {
        // Check how many unique points are shared
        const sharedPoints = new Set();
        if (onSegment(p1, p2, q1)) sharedPoints.add(JSON.stringify(p2));
        if (onSegment(p1, q2, q1)) sharedPoints.add(JSON.stringify(q2));
        if (onSegment(p2, p1, q2)) sharedPoints.add(JSON.stringify(p1));
        if (onSegment(p2, q1, q2)) sharedPoints.add(JSON.stringify(q1));

        // If at least two unique points are shared, they overlap
        if (sharedPoints.size >= 2) {
          overlapsFound++;
          const edge1Key = getEdgeKey(edge1);
          const edge2Key = getEdgeKey(edge2);

          // Skip reverse-direction duplicate
          if (edge1Key !== edge2Key) {
            if (!overlappingEdges[edge1.id]) overlappingEdges[edge1.id] = { overlaps: [] };
            if (!overlappingEdges[edge2.id]) overlappingEdges[edge2.id] = { overlaps: [] };

            overlappingEdges[edge1.id].overlaps.push(edge2.id);
            overlappingEdges[edge2.id].overlaps.push(edge1.id);
          }
        }
      }
    }
  }
  
  console.log(`Finished checking ${edgePairsChecked} edge pairs, found ${overlapsFound} overlaps`);
  console.log(`Found ${Object.keys(overlappingEdges).length} overlapping edges`);
  console.timeEnd('findOverlappingEdges');
  return overlappingEdges;
}

// Function to get the degree count of each node in the subgraph for the given edges
function getEdgeDegreeCount(G, edges) {
  const degreeCount = {}

  for (const edge of edges) {
    degreeCount[edge.source] = (degreeCount[edge.source] || 0) + 1
    degreeCount[edge.target] = (degreeCount[edge.target] || 0) + 1
  }

  return degreeCount
}

// Function to calculate vertical positions for each level
function calculateLevelHeights(levels, maxHeight = 1.0) {
  const numLevels = Math.max(...Object.values(levels)) + 1
  const levelHeights = []

  for (let i = 0; i < numLevels; i++) {
    levelHeights.push(maxHeight * (i / numLevels))
  }

  return levelHeights
}

// Function to check if two segments intersect
function doIntersect(p1, q1, p2, q2) {
  const o1 = orientation(p1, q1, p2)
  const o2 = orientation(p1, q1, q2)
  const o3 = orientation(p2, q2, p1)
  const o4 = orientation(p2, q2, q1)

  // General case
  if (o1 !== o2 && o3 !== o4) return true

  // Special cases (excluding endpoints)
  // Check collinear points
  if (o1 === 0 && onSegment(p1, p2, q1) && !areEndpoints(p1, q1, p2, q2)) return true
  if (o2 === 0 && onSegment(p1, q2, q1) && !areEndpoints(p1, q1, p2, q2)) return true
  if (o3 === 0 && onSegment(p2, p1, q2) && !areEndpoints(p2, q2, p1, q1)) return true
  if (o4 === 0 && onSegment(p2, q1, q2) && !areEndpoints(p2, q2, p1, q1)) return true

  return false // Doesn't fall in any of the above cases
}

// Helper function to check if two segments share endpoints
function areEndpoints(p1, q1, p2, q2) {
  return (JSON.stringify(p1) === JSON.stringify(p2) ||
    JSON.stringify(q1) === JSON.stringify(p2) ||
    JSON.stringify(p1) === JSON.stringify(q2) ||
    JSON.stringify(q1) === JSON.stringify(q2))
}

type Positions = { [key: string]: [number, number] }

// Function to count edge crossings in the graph based on geometric intersection
function countEdgeCrossings(G, pos: Positions) {
  console.time('countEdgeCrossings');
  let crossings = 0;
  const edges = getEdges(G);
  
  // Add a progress counter
  let checkedPairs = 0;
  const totalPairs = (edges.length * (edges.length - 1)) / 2;
  const logInterval = Math.max(1, Math.floor(totalPairs / 10)); // Log 10 times

  // Check for intersections between all pairs of edges
  for (let i = 0; i < edges.length; i++) {
    const [u1, v1] = edges[i];
    const p1 = pos[u1];
    const q1 = pos[v1];
    
    if (!p1 || !q1) continue;

    for (let j = i + 1; j < edges.length; j++) {
      checkedPairs++;
      
      // Log progress at intervals
      if (checkedPairs % logInterval === 0) {
        console.log(`Checking edge crossings: ${Math.floor((checkedPairs / totalPairs) * 100)}% complete`);
      }
      
      const [u2, v2] = edges[j];
      const p2 = pos[u2];
      const q2 = pos[v2];
      
      if (!p2 || !q2) continue;

      // Check if the edges intersect
      if (doIntersect(p1, q1, p2, q2)) {
        // Ensure the intersection is not at the endpoints
        if (!areEndpoints(p1, q1, p2, q2)) {
          crossings += 1;
        }
      }
    }
  }

  console.log(`Found ${crossings} edge crossings after checking ${checkedPairs} pairs`);
  console.timeEnd('countEdgeCrossings');
  return crossings;
}

// Choose the best direction (upwards or downwards) for node movement to minimize edge crossings.
function chooseBestShiftDirection(G, pos: Positions, nodeToMove, shiftAmount) {
  console.log(`Determining best shift direction for node ${nodeToMove}...`);
  const currentPos = pos[nodeToMove];
  
  // Test moving the node upwards
  console.log(`Testing upward movement...`);
  pos[nodeToMove] = [currentPos[0], currentPos[1] + shiftAmount];
  const crossingsUp = countEdgeCrossings(G, pos);

  // Test moving the node downwards
  console.log(`Testing downward movement...`);
  pos[nodeToMove] = [currentPos[0], currentPos[1] - shiftAmount];
  const crossingsDown = countEdgeCrossings(G, pos);

  // Restore original position
  pos[nodeToMove] = currentPos;
  
  console.log(`Crossings with upward movement: ${crossingsUp}, with downward movement: ${crossingsDown}`);
  
  // Return the direction that minimizes crossings
  return crossingsUp < crossingsDown ? currentPos[1] + shiftAmount : currentPos[1] - shiftAmount;
}

// Resolve visually overlapping edges by selectively shifting nodes.
function resolveOverlappingEdges(G, pos, levels) {
  console.log('Starting to resolve overlapping edges...');
  console.time('resolveOverlappingEdges');
  
  // Height between levels
  const levelHeights = calculateLevelHeights(levels);
  const movedNodes = new Set(); // Track nodes that have been moved
  
  // Add iteration counter to help identify potential infinite loops
  let iteration = 0;
  
  // Track the total number of overlaps to detect progress
  let previousOverlapCount = Infinity;
  let staleIterations = 0;

  while (true) {
    iteration++;
    console.log(`\n=== Iteration ${iteration} ===`);
    
    // Find overlapping edges using the provided function
    const overlappingEdges = findVisuallyOverlappingEdges(G, pos);
    const currentOverlapCount = Object.keys(overlappingEdges).length;
    
    // Break if no overlapping edges are found
    if (currentOverlapCount === 0) {
      console.log("No overlapping edges detected. Layout optimization complete.");
      break;
    }
    
    console.log(`Detected ${currentOverlapCount} overlapping edges`);
    
    // Check for lack of progress
    if (currentOverlapCount >= previousOverlapCount) {
      staleIterations++;
      console.log(`Warning: No improvement for ${staleIterations} iterations`);
      
      // If we've made no progress for several iterations, we might be in a cycle
      if (staleIterations >= 5) {
        console.log("No significant progress after multiple iterations. This may indicate a layout challenge.");
        // Don't break - continue trying
      }
    } else {
      staleIterations = 0;
      console.log(`Progress made: reduced overlaps from ${previousOverlapCount} to ${currentOverlapCount}`);
    }
    
    previousOverlapCount = currentOverlapCount;

    // Collect all involved nodes and determine which to move
    const involvedNodes = new Set();
    const edgesArray = [];

    for (const edgeId in overlappingEdges) {
      const edge = G.edges.find(e => e.id === edgeId);
      if (!edge) {
        console.log(`Warning: Edge ${edgeId} not found in graph`);
        continue;
      }

      // Add source and target nodes of the edge to involvedNodes
      involvedNodes.add(edge.source);
      involvedNodes.add(edge.target);

      // Add the edge to edgesArray in the desired format
      edgesArray.push({ source: edge.source, target: edge.target });
    }

    console.log(`Found ${involvedNodes.size} involved nodes`);

    // Exclude nodes that have already been moved in this iteration
    const availableNodes = [...involvedNodes].filter(node => !movedNodes.has(node));
    console.log(`${availableNodes.length} nodes available for movement`);

    if (availableNodes.length === 0) {
      console.log("All involved nodes have been moved. Breaking loop.");
      break;
    }

    // Determine the node with the highest degree among available nodes
    const degreeCount = getEdgeDegreeCount(G, edgesArray);
    console.log(`Degree counts for involved nodes:`, degreeCount);

    const nodeToMove = availableNodes.reduce((a, b) => 
        (degreeCount[a] || 0) > (degreeCount[b] || 0) ? a : b
    );

    if (!nodeToMove) {
      console.log("No node to move found. This shouldn't happen.");
      break;
    }

    // Move the selected node
    const currentY = pos[nodeToMove][1];
    console.log(`Moving node '${nodeToMove}' from position ${pos[nodeToMove]}`);

    // Determine the appropriate shift amount
    const level = levels[nodeToMove];
    const shiftAmount = (level < levelHeights.length - 1) 
        ? (levelHeights[level + 1] - levelHeights[level]) / 2 
        : 0.1;
    console.log(`Shift amount: ${shiftAmount}`);

    // Choose the best direction (up or down) to minimize edge crossings
    const newY = chooseBestShiftDirection(G, pos, nodeToMove, shiftAmount);
    pos[nodeToMove] = [pos[nodeToMove][0], newY];
    console.log(`Moved '${nodeToMove}' to new position ${pos[nodeToMove]}`);

    // Add the node to the movedNodes set
    movedNodes.add(nodeToMove);
    console.log(`Total nodes moved so far: ${movedNodes.size}`);
  }

  console.timeEnd('resolveOverlappingEdges');
  return pos;
}

function placeDisconnectedNodes(G: any, positions: Positions): Positions {
  console.log('Placing disconnected nodes...');
  const nodes = getNodes(G);

  // Identify disconnected nodes
  const disconnectedNodes = nodes.filter((nodeId: string) => {
    const hasNoPredecessors = predecessors(G, nodeId).length === 0;
    const hasNoSuccessors = successors(G, nodeId).length === 0;
    return hasNoPredecessors && hasNoSuccessors;
  });

  console.log(`Found ${disconnectedNodes.length} disconnected nodes`);
  
  if (disconnectedNodes.length === 0) {
    return positions;
  }
  
  // Calculate the number of rows and columns for the grid layout
  const numNodes = disconnectedNodes.length;
  const columns = Math.ceil(Math.sqrt(numNodes));  // Number of columns based on the square root
  const rows = Math.ceil(numNodes / columns);       // Number of rows needed to fit all nodes

  console.log(`Placing disconnected nodes in a ${columns}x${rows} grid`);

  // Define the starting position and spacing for the grid layout
  const offsetX = 0;  // Starting X position
  let offsetY = 1;    // Starting Y position
  const horizontalSpacing = 0.1; // Horizontal space between nodes
  const verticalSpacing = 0.1;   // Vertical space between nodes

  disconnectedNodes.forEach((nodeId, index) => {
    // Calculate the column and row based on the node index
    const row = Math.floor(index / columns);      // Row is based on the node index
    const col = index % columns;                 // Column is the remainder of the division

    // Calculate the X and Y positions for the node in the grid
    const x = offsetX + col * horizontalSpacing;
    const y = offsetY + row * verticalSpacing;

    // Assign the calculated position to the node
    positions[nodeId] = [x, y];
    console.log(`Placed disconnected node ${nodeId} at position: [${x}, ${y}]`);
  });

  return positions;
}

// Custom layout function for directed graphs.
function customLayoutDirected(G, entryNodes: string[], exitNodes: string[], maxWidth = 1): Positions {
  console.log('Starting customLayoutDirected...');
  console.time('customLayoutDirected');
  
  /**
   * @param {Object} G - The graph
   * @param {Array} entryNodes - The nodes to position at the top
   * @param {Array} exitNodes - The nodes to position at the bottom
   * @param {number} maxWidth - The maximum width for positioning exit nodes
   *
   * @returns {Object} - The updated positions of the nodes
   */

  let pos: Positions = {};
  
  console.log('Assigning levels to nodes...');
  const levels = assignLevels(G, entryNodes, exitNodes);
  console.log(`Levels assigned to ${Object.keys(levels).length} nodes`);

  // Create a dictionary to group nodes by their levels
  const levelDict = {};
  for (const node in levels) {
    const lvl = levels[node];
    if (!levelDict[lvl]) levelDict[lvl] = [];
    levelDict[lvl].push(node);
  }

  // Print the levels
  console.log("Node Levels (count per level):");
  Object.keys(levelDict).sort((a, b) => Number(a) - Number(b)).forEach(lvl => {
    console.log(`Level ${lvl}: ${levelDict[lvl].length} nodes`);
  });

  // Position the entry nodes at the top (y=1)
  console.log('Positioning entry nodes...');
  entryNodes.forEach(node => {
    pos[node] = [0.5, 1]; // Centered at the top
  });

  // Position the exit nodes at the bottom (y=0)
  console.log('Positioning exit nodes...');
  const exitStep = maxWidth / (exitNodes.length + 1);
  exitNodes.forEach((node, i) => {
    pos[node] = [exitStep * (i + 1), 0]; // Distributed at the bottom
  });

  // Position the intermediate nodes
  console.log('Positioning intermediate nodes...');
  const middleNodes = G.nodes
    .filter(node => !entryNodes.includes(node.id) && !exitNodes.includes(node.id))
    .map(node => node.id); // Get just the IDs
  
  console.log(`Found ${middleNodes.length} intermediate nodes`);

  middleNodes.forEach(node => {
    const level = levels[node];
    const yPos = 0.9 - (level / (Math.max(...Object.values(levels)) + 1)); // Position based on level
    pos[node] = [0, yPos]; // Initialize at x=0, x positions will be adjusted later
  });

  // Apply the Barycenter Heuristic to avoid overlaps and reduce edges crossing
  console.log('Applying barycenter heuristic...');
  pos = barycenterHeuristic(G, levels, pos, maxWidth);

  // Resolve overlapping edges
  console.log('Resolving overlapping edges...');
  pos = resolveOverlappingEdges(G, pos, levels);

  // Place disconnected nodes
  console.log('Placing disconnected nodes...');
  pos = placeDisconnectedNodes(G, pos);

  console.log('Layout calculation complete');
  console.timeEnd('customLayoutDirected');
  return pos;
}