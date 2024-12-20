import type Ogma from "@linkurious/ogma"
import type { ForceLayoutOptions, ForceLinkOptions, HierarchicalLayoutOptions, LocateOptions } from "@linkurious/ogma"
//import { startNodesStore, endNodesStore } from '$lib/generalStore'

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


export const LayoutType = {
  Force: 'force',
  ForceLink: 'forceLink',
  Hierarchical: 'hierarchical',
  Sami: 'sami',
  SamiNoR: 'samiNoR'
} as const
type ValLayoutType = (typeof LayoutType)[keyof typeof LayoutType]


export const applyLayout = (
  ogma: Ogma,
  layout: ValLayoutType,
  options: (ForceLayoutOptions | ForceLinkOptions | HierarchicalLayoutOptions | { entryNodes: [], exitNodes: [] }) = {}
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
      ogma.view.locateGraph(defaultLocateOptions)
    })
    .catch(err => {
      console.error(`Error applying layout: ${err}`)
    })
}


const samiLayoutNoR = (entryNodes: string[], exitNodes: string[], ogma: Ogma): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    try {
      // Retrieve all visible nodes and edges
      const visibleNodes = ogma.getNodes("visible").map(node => ({ 
        id: String(node.getId()),
        radius: node.getAttribute('radius')
       }));
      const visibleEdges = ogma.getEdges("visible").map(edge => ({
        id: String(edge.getId()),
        source: String(edge.getSource().getId()),
        target: String(edge.getTarget().getId())
      }));

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
          y: pos[1] * -500,
          radius: 3
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

const samiLayout = (entryNodes, exitNodes, ogma) => {
  return new Promise((resolve, reject) => {
    try {
      // Retrieve all visible nodes and edges
      const visibleNodes = ogma.getNodes("visible").map(node => ({ 
        id: String(node.getId()),
        radius: node.getAttribute('radius')
       }));
      const visibleEdges = ogma.getEdges("visible").map(edge => ({
        id: String(edge.getId()),
        source: String(edge.getSource().getId()),
        target: String(edge.getTarget().getId())
      }));

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

      console.log("Max node size:", maxNodeSize);

      // To avoid node overlap
      const spacing = maxNodeSize * 30;
      console.log("spacing:", spacing);


      // Compute positions using custom layout and Apply positions to nodes in the graph
      const positions = customLayoutDirected(G, entryNodes, exitNodes);
      Object.keys(positions).forEach(nodeId => {
        const pos = positions[nodeId];
        ogma.getNode(nodeId).setAttributes({
          x: pos[0] * -(500 + spacing),
          y: pos[1] * -(500 + spacing)
        });
      });

      // Center the view on the graph
      ogma.view.locateGraph().then(() => {
        console.log('Graph displayed with Sami Layout positions.');
        resolve({ type: 'layout', name: 'sami' });
      });
    } catch (error) {
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
  const levels = {} // This will store the levels of nodes
  let level = 0
  let queue = [...entryNodes]

  const nodes = getNodes(G)

  // Identify disconnected nodes
  const disconnectedNodes = nodes.filter((nodeId: string) => {
    const hasNoPredecessors = predecessors(G, nodeId).length === 0
    const hasNoSuccessors = successors(G, nodeId).length === 0
    return hasNoPredecessors && hasNoSuccessors
  })

  // Determine whether to use successors or predecessors based on entryNodes[0]
  const useSuccessors = successors(G, entryNodes[0]).length > 0

  // BFS to assign levels from entry nodes
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
  }

  let maxLevel = Math.max(...Object.values(levels)) // Get the max level from assigned nodes
  console.log('maxLevel', maxLevel)

  // Assign levels to unreachable nodes (from disconnected components)
  //let nextAvailableLevel = finalLevel + 1; 
  let nextAvailableLevel = maxLevel + 1 
  console.log('nextAvailableLevel', nextAvailableLevel)

  // Assigning exit nodes to the O level just to mark them as visited => for unreachable nodes 
  for (const exitNode of exitNodes) {
    levels[exitNode] = 0
  }
  // Same for disconnected node, which will be placed later on
  for (const disconnectedNode of disconnectedNodes) {
    levels[disconnectedNode] = 0
  }

  const visited = new Set(Object.keys(levels)) // Track nodes already visited

  // Iterate over all nodes in the graph to handle unreachable (disconnected) nodes
  for (const node of G.nodes) {
    if (!visited.has(node.id)) {  // If the node is not visited, it's unreachable
      console.log(node.id)
      // Assign this unreachable node to the next available level
      levels[node.id] = nextAvailableLevel
      visited.add(node.id)  // Mark it as visited
      console.log(`Assigned level ${nextAvailableLevel} to unreachable node ${node.id}`)

      nextAvailableLevel += 1  // For potential future unreachable nodes
    }
  }

  // Assigning exit nodes to a last distinct level
  maxLevel = Math.max(...Object.values(levels)) // Get the max level from assigned nodes
  console.log('maxLevel', maxLevel)
  const finalLevel = maxLevel + 1
  for (const exitNode of exitNodes) {
    levels[exitNode] = finalLevel
  }

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
  const maxLevel = Math.max(...Object.values(levels))

  for (let level = 1;level <= maxLevel;level++) {
    const nodesInLevel = Object.keys(levels).filter(node => levels[node] === level)

    if (nodesInLevel.length === 0) continue

    // Compute barycenter for each node in the current level based on connections to previous levels
    const barycenter = {}
    for (const node of nodesInLevel) {
      //const prevLevelNodes = predecessors(G, node).filter(n => levels[n] < level);
      //const prevLevelNodes = successors(G, node).filter(n => levels[n] < level);

      const prevLevelNodes = getEdges(G)
        .filter((edge: [string, string]) => edge[0] === node || edge[1] === node) // Find edges connected to the node
        .map((edge: [string, string]) => {
          // Extract the connected nodes
          return edge[0] === node ? edge[1] : edge[0]
        })
        .filter((connectedNode: string) => levels[connectedNode] < level)



      if (prevLevelNodes.length > 0) {
        const avgX = prevLevelNodes.reduce((sum, p) => sum + pos[p][0], 0) / prevLevelNodes.length
        barycenter[node] = avgX
      } else {
        barycenter[node] = 0 // Default if no neighbors
      }
    }

    // Sort nodes in the current level based on their barycenter
    const sortedNodes = nodesInLevel.sort((a, b) => (barycenter[a] || 0) - (barycenter[b] || 0))

    // Dynamically space out nodes in the current level based on the number of nodes
    const numNodes = nodesInLevel.length
    const xPositions = Array.from({ length: numNodes }, (_, i) => (i + 1) * maxWidth / (numNodes + 1))

    // Assign positions to nodes, ensuring no overlap horizontally
    sortedNodes.forEach((node, idx) => {
      pos[node] = [xPositions[idx], pos[node][1]]
    })
  }

  return pos
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
  const overlappingEdges = {}
  const edges = G.edges  // Assume edges are given as objects with `id`, `source`, and `target`

  // Helper function to get sorted edge key for edge identification
  const getEdgeKey = (edge) => [edge.source, edge.target].sort().join('-')

  // Check for overlapping edges
  for (let i = 0;i < edges.length;i++) {
    const edge1 = edges[i]
    const u1 = edge1.source
    const v1 = edge1.target
    const p1 = pos[u1]
    const q1 = pos[v1]

    for (let j = i + 1;j < edges.length;j++) {
      const edge2 = edges[j]
      const u2 = edge2.source
      const v2 = edge2.target
      const p2 = pos[u2]
      const q2 = pos[v2]

      const o1 = orientation(p1, q1, p2)
      const o2 = orientation(p1, q1, q2)
      const o3 = orientation(p2, q2, p1)
      const o4 = orientation(p2, q2, q1)

      // Check if they are collinear
      if (o1 === 0 && o2 === 0) {
        // Check how many unique points are shared
        const sharedPoints = new Set()
        if (onSegment(p1, p2, q1)) sharedPoints.add(JSON.stringify(p2))
        if (onSegment(p1, q2, q1)) sharedPoints.add(JSON.stringify(q2))
        if (onSegment(p2, p1, q2)) sharedPoints.add(JSON.stringify(p1))
        if (onSegment(p2, q1, q2)) sharedPoints.add(JSON.stringify(q1))

        // If at least two unique points are shared, they overlap
        if (sharedPoints.size >= 2) {
          const edge1Key = getEdgeKey(edge1)
          const edge2Key = getEdgeKey(edge2)

          // Skip reverse-direction duplicate
          if (edge1Key !== edge2Key) {
            if (!overlappingEdges[edge1.id]) overlappingEdges[edge1.id] = { overlaps: [] }
            if (!overlappingEdges[edge2.id]) overlappingEdges[edge2.id] = { overlaps: [] }

            overlappingEdges[edge1.id].overlaps.push(edge2.id)
            overlappingEdges[edge2.id].overlaps.push(edge1.id)
          }
        }
      }
    }
  }

  return overlappingEdges
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

  for (let i = 0;i < numLevels;i++) {
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

  // Show orientations
  /*console.log(`Checking intersection between edge (${p1}, ${q1}) and edge (${p2}, ${q2})`);
  console.log(`Orientation of points (${p1}, ${q1}, ${p2}): ${o1}`);
  console.log(`Orientation of points (${p1}, ${q1}, ${q2}): ${o2}`);
  console.log(`Orientation of points (${p2}, ${q2}, ${p1}): ${o3}`);
  console.log(`Orientation of points (${p2}, ${q2}, ${q1}): ${o4}`);*/

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
  let crossings = 0
  //const edges = G.edges();
  //const edges = G.getEdges();
  const edges = getEdges(G)

  // Check for intersections between all pairs of edges
  for (let i = 0;i < edges.length;i++) {
    const [u1, v1] = edges[i]
    const p1 = pos[u1]
    const q1 = pos[v1]

    for (let j = i + 1;j < edges.length;j++) {
      const [u2, v2] = edges[j]
      const p2 = pos[u2]
      const q2 = pos[v2]

      // Check if the edges intersect
      if (doIntersect(p1, q1, p2, q2)) {
        // Ensure the intersection is not at the endpoints
        if (!areEndpoints(p1, q1, p2, q2)) {
          //console.log(`Edges ${u1}-${v1} and ${u2}-${v2} intersect!`);
          crossings += 1
        } else {
          //console.log(`Edges ${u1}-${v1} and ${u2}-${v2} intersect at endpoints, not counted.`);
        }
      } else {
        //console.log(`Edges ${u1}-${v1} and ${u2}-${v2} do NOT intersect.`);
      }
    }
  }

  return crossings
}

// Choose the best direction (upwards or downwards) for node movement to minimize edge crossings.
function chooseBestShiftDirection(G, pos: Positions, nodeToMove, shiftAmount) {
  const currentPos = pos[nodeToMove]

  // Test moving the node upwards
  pos[nodeToMove] = [currentPos[0], currentPos[1] + shiftAmount]
  const crossingsUp = countEdgeCrossings(G, pos)

  // Test moving the node downwards
  pos[nodeToMove] = [currentPos[0], currentPos[1] - shiftAmount]
  const crossingsDown = countEdgeCrossings(G, pos)

  // Restore original position
  pos[nodeToMove] = currentPos

  // Return the direction that minimizes crossings
  return crossingsUp < crossingsDown ? currentPos[1] + shiftAmount : currentPos[1] - shiftAmount
}

// Resolve visually overlapping edges by selectively shifting nodes.
function resolveOverlappingEdges0(G, pos: Positions, levels) {
  // Height between levels
  const levelHeights = calculateLevelHeights(levels)

  while (true) {
    // Find overlapping edges using the provided function
    const overlappingEdges = findVisuallyOverlappingEdges(G, pos)

    // Break if no overlapping edges are found
    if (Object.keys(overlappingEdges).length === 0) {
      console.log("No overlapping edges detected.")
      break
    }

    console.log("\nDetected overlapping edges:", overlappingEdges)


    // Collect all involved nodes and determine which to move
    const involvedNodes = new Set()
    const edgesArray = []
    for (const edgeId in overlappingEdges) {
      //console.log('Type of edgeId:', typeof edgeId);
      // Cast edgeId to a number to match the type of the edge id in G.edges
      //const numericEdgeId = Number(edgeId);
      //console.log('Numeric edgeId:', numericEdgeId, 'Type:', typeof numericEdgeId);

      // Find the edge object in the graph `G` using the numeric edgeId
      //const edge = G.edges.find(e => e.id === numericEdgeId);
      const edge = G.edges.find(e => e.id === edgeId)
      console.log("\nedge:", edge)

      // Add source and target nodes of the edge to involvedNodes
      involvedNodes.add(edge.source)
      involvedNodes.add(edge.target)

      // Add the edge to edgesArray in the desired format
      edgesArray.push({ source: edge.source, target: edge.target })
    }
    //console.log("\nedgesArray:", edgesArray)
    //console.log("\involvedNodes:", involvedNodes)

    // Determine the node with the highest degree
    const degreeCount = getEdgeDegreeCount(G, edgesArray)
    console.log("\nDegree Count:", degreeCount)

    const nodeToMove = [...involvedNodes].reduce((a, b) =>
      (degreeCount[a] || 0) > (degreeCount[b] || 0) ? a : b
    )

    if (!nodeToMove) {
      console.log("No node to move found.")
      break
    }

    // Move the selected node
    const currentY = pos[nodeToMove][1]
    console.log(`\nMoving node '${nodeToMove}' from position ${pos[nodeToMove]}`)

    // Determine the appropriate shift amount
    const level = levels[nodeToMove]
    const shiftAmount = (level < levelHeights.length - 1)
      ? (levelHeights[level + 1] - levelHeights[level]) / 2
      : 0.1

    // Choose the best direction (up or down) to minimize edge crossings
    const newY = chooseBestShiftDirection(G, pos, nodeToMove, shiftAmount)
    pos[nodeToMove] = [pos[nodeToMove][0], newY]
    console.log(`Moved '${nodeToMove}' to new position ${pos[nodeToMove]}`)
  }

  return pos
}


// Resolve visually overlapping edges by selectively shifting nodes.
function resolveOverlappingEdges(G, pos, levels) {
  // Height between levels
  const levelHeights = calculateLevelHeights(levels);

  const movedNodes = new Set(); // Track nodes that have been moved

  while (true) {
    // Find overlapping edges using the provided function
    const overlappingEdges = findVisuallyOverlappingEdges(G, pos);

    // Break if no overlapping edges are found
    if (Object.keys(overlappingEdges).length === 0) {
      console.log("No overlapping edges detected.");
      break;
    }

    console.log("\nDetected overlapping edges:", overlappingEdges);

    // Collect all involved nodes and determine which to move
    const involvedNodes = new Set();
    const edgesArray = [];

    for (const edgeId in overlappingEdges) {
      const edge = G.edges.find(e => e.id === edgeId);
      console.log("\nedge:", edge);

      // Add source and target nodes of the edge to involvedNodes
      involvedNodes.add(edge.source);
      involvedNodes.add(edge.target);

      // Add the edge to edgesArray in the desired format
      edgesArray.push({ source: edge.source, target: edge.target });
    }

    // Exclude nodes that have already been moved
    const availableNodes = [...involvedNodes].filter(node => !movedNodes.has(node));

    if (availableNodes.length === 0) {
      console.log("All involved nodes have been moved. Breaking loop.");
      break;
    }

    // Determine the node with the highest degree among available nodes
    const degreeCount = getEdgeDegreeCount(G, edgesArray);
    console.log("\nDegree Count:", degreeCount);

    const nodeToMove = availableNodes.reduce((a, b) => 
        (degreeCount[a] || 0) > (degreeCount[b] || 0) ? a : b
    );

    if (!nodeToMove) {
      console.log("No node to move found.");
      break;
    }

    // Move the selected node
    const currentY = pos[nodeToMove][1];
    console.log(`\nMoving node '${nodeToMove}' from position ${pos[nodeToMove]}`);

    // Determine the appropriate shift amount
    const level = levels[nodeToMove];
    const shiftAmount = (level < levelHeights.length - 1) 
        ? (levelHeights[level + 1] - levelHeights[level]) / 2 
        : 0.1;

    // Choose the best direction (up or down) to minimize edge crossings
    const newY = chooseBestShiftDirection(G, pos, nodeToMove, shiftAmount);
    pos[nodeToMove] = [pos[nodeToMove][0], newY];
    console.log(`Moved '${nodeToMove}' to new position ${pos[nodeToMove]}`);

    // Add the node to the movedNodes set
    movedNodes.add(nodeToMove);
  }

  return pos;
}


function placeDisconnectedNodes(G: any, positions: Positions): Positions {
  const nodes = getNodes(G)

  // Identify disconnected nodes
  const disconnectedNodes = nodes.filter((nodeId: string) => {
    const hasNoPredecessors = predecessors(G, nodeId).length === 0
    const hasNoSuccessors = successors(G, nodeId).length === 0
    return hasNoPredecessors && hasNoSuccessors
  })

  console.log('Disconnected nodes:', disconnectedNodes)
  
  // Calculate the number of rows and columns for the grid layout
  const numNodes = disconnectedNodes.length
  const columns = Math.ceil(Math.sqrt(numNodes))  // Number of columns based on the square root
  const rows = Math.ceil(numNodes / columns)       // Number of rows needed to fit all nodes

  // Define the starting position and spacing for the grid layout
  const offsetX = 0  // Starting X position
  let offsetY = 1    // Starting Y position
  const horizontalSpacing = 0.1 // Horizontal space between nodes
  const verticalSpacing = 0.1   // Vertical space between nodes

  disconnectedNodes.forEach((nodeId, index) => {
    // Calculate the column and row based on the node index
    const row = Math.floor(index / columns)      // Row is based on the node index
    const col = index % columns                 // Column is the remainder of the division

    // Calculate the X and Y positions for the node in the grid
    const x = offsetX + col * horizontalSpacing
    const y = offsetY + row * verticalSpacing

    // Assign the calculated position to the node
    positions[nodeId] = [x, y]
    console.log(`Placing node ${nodeId} at position: [${x}, ${y}]`)
  })

  return positions
}

// Custom layout function for directed graphs.
function customLayoutDirected(G, entryNodes: string[], exitNodes: string[], maxWidth = 1): Positions {
  /**
   * @param {Object} G - The graph
   * @param {Array} entryNodes - The nodes to position at the top
   * @param {Array} exitNodes - The nodes to position at the bottom
   * @param {number} maxWidth - The maximum width for positioning exit nodes
   *
   * @returns {Object} - The updated positions of the nodes
   */

  let pos: Positions = {}
  const levels = assignLevels(G, entryNodes, exitNodes)
  console.log(levels)

  console.log("G:", G)
  console.log("entryNodes:", entryNodes)
  console.log("exitNodes", exitNodes)

  // Create a dictionary to group nodes by their levels
  const levelDict = {}
  for (const node in levels) {
    const lvl = levels[node]
    if (!levelDict[lvl]) levelDict[lvl] = []
    levelDict[lvl].push(node)
  }

  // Print the levels
  console.log("Node Levels:")
  Object.keys(levelDict).sort((a, b) => a - b).forEach(lvl => {
    console.log(`Level ${lvl}: ${levelDict[lvl]}`)
  })

  // Position the entry nodes at the top (y=1)
  entryNodes.forEach(node => {
    pos[node] = [0.5, 1] // Centered at the top
  })

  // Position the exit nodes at the bottom (y=0)
  const exitStep = maxWidth / (exitNodes.length + 1)
  exitNodes.forEach((node, i) => {
    pos[node] = [exitStep * (i + 1), 0] // Distributed at the bottom
  })

  // Position the intermediate nodes
  const middleNodes = G.nodes.filter(node =>
    !entryNodes.includes(node.id) && !exitNodes.includes(node.id)
  ).map(node => node.id) // Get just the IDs

  middleNodes.forEach(node => {
    const level = levels[node]
    const yPos = 0.9 - (level / (Math.max(...Object.values(levels)) + 1)) // Position based on level
    pos[node] = [0, yPos] // Initialize at x=0, x positions will be adjusted later
  })

  // Apply the Barycenter Heuristic to avoid overlaps and reduce edges crossing
  pos = barycenterHeuristic(G, levels, pos, maxWidth)

  const overlappingEdges = findVisuallyOverlappingEdges(G, pos)
  // Print overlapping edges
  console.log("Visually overlapping edges:")
  Object.entries(overlappingEdges).forEach(([edge, overlaps]) => {
    console.log(`Edge ${edge} overlaps with: ${overlaps}`)
  })

  // Resolve overlapping edges
  pos = resolveOverlappingEdges(G, pos, levels)

  pos = placeDisconnectedNodes(G, pos)

  return pos
}
