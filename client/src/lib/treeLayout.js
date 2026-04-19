/**
 * Reingold-Tilford tree layout algorithm.
 * Positions tree nodes in a visually balanced way.
 *
 * Input:  tree root in shape { id, value, left, right }
 * Output: Map<id, { x, y }> — positions for each node
 */

const SIBLING_SEP = 1
const SUBTREE_SEP = 2
const LEVEL_SEP = 1

function assignPreliminary(node, depth, nextPosAtDepth) {
  if (!node) return null

  const wrapped = {
    id: node.id,
    value: node.value,
    depth,
    left: assignPreliminary(node.left, depth + 1, nextPosAtDepth),
    right: assignPreliminary(node.right, depth + 1, nextPosAtDepth),
    x: 0,
    mod: 0,
  }

  if (!wrapped.left && !wrapped.right) {
    // Leaf node
    if (!nextPosAtDepth[depth]) nextPosAtDepth[depth] = 0
    wrapped.x = nextPosAtDepth[depth]
    nextPosAtDepth[depth] += SIBLING_SEP
  } else if (wrapped.left && !wrapped.right) {
    wrapped.x = wrapped.left.x
  } else if (!wrapped.left && wrapped.right) {
    wrapped.x = wrapped.right.x
  } else {
    // Both children exist — center above them
    wrapped.x = (wrapped.left.x + wrapped.right.x) / 2
  }

  return wrapped
}

function fixOverlaps(node) {
  if (!node) return

  const levelBounds = {}

  function collectBounds(n) {
    if (!n) return
    if (!levelBounds[n.depth]) {
      levelBounds[n.depth] = { min: n.x, max: n.x }
    } else {
      levelBounds[n.depth].min = Math.min(levelBounds[n.depth].min, n.x)
      levelBounds[n.depth].max = Math.max(levelBounds[n.depth].max, n.x)
    }
    collectBounds(n.left)
    collectBounds(n.right)
  }

  collectBounds(node)
}

/**
 * Simple recursive layout that centers parents over children
 * and pushes subtrees apart to avoid overlaps.
 */
function layoutTree(root) {
  if (!root) return new Map()

  // Pass 1: assign initial x positions bottom-up
  const positions = new Map()

  function getContour(node, side, depth, contour) {
    if (!node) return
    if (contour[depth] === undefined) {
      contour[depth] = node.x
    } else {
      contour[depth] = side === 'left'
        ? Math.min(contour[depth], node.x)
        : Math.max(contour[depth], node.x)
    }
    getContour(node.left, side, depth + 1, contour)
    getContour(node.right, side, depth + 1, contour)
  }

  function layout(node, depth) {
    if (!node) return null

    const result = {
      id: node.id,
      value: node.value,
      depth,
      left: layout(node.left, depth + 1),
      right: layout(node.right, depth + 1),
      x: 0,
    }

    if (!result.left && !result.right) {
      result.x = 0
    } else if (result.left && !result.right) {
      result.x = result.left.x
    } else if (!result.left && result.right) {
      result.x = result.right.x
    } else {
      // Get right contour of left subtree and left contour of right subtree
      const leftContour = {}
      const rightContour = {}
      getContour(result.left, 'right', depth + 1, leftContour)
      getContour(result.right, 'left', depth + 1, rightContour)

      // Find the minimum shift needed
      let shift = 0
      const minDepth = Math.min(
        ...Object.keys(leftContour).map(Number),
        ...Object.keys(rightContour).map(Number)
      )
      const maxDepth = Math.max(
        ...Object.keys(leftContour).map(Number),
        ...Object.keys(rightContour).map(Number)
      )

      for (let d = minDepth; d <= maxDepth; d++) {
        if (leftContour[d] !== undefined && rightContour[d] !== undefined) {
          const gap = rightContour[d] - leftContour[d]
          shift = Math.max(shift, SUBTREE_SEP - gap)
        }
      }

      // Shift right subtree
      function shiftTree(n, dx) {
        if (!n) return
        n.x += dx
        shiftTree(n.left, dx)
        shiftTree(n.right, dx)
      }

      if (shift > 0) {
        shiftTree(result.right, shift)
      }

      result.x = (result.left.x + result.right.x) / 2
    }

    return result
  }

  const laid = layout(root, 0)

  // Normalize: shift so minimum x is 0
  let minX = Infinity
  function findMin(n) {
    if (!n) return
    minX = Math.min(minX, n.x)
    findMin(n.left)
    findMin(n.right)
  }
  findMin(laid)

  function collect(n) {
    if (!n) return
    positions.set(n.id, { x: n.x - minX, y: n.depth * LEVEL_SEP })
    collect(n.left)
    collect(n.right)
  }
  collect(laid)

  return positions
}

/**
 * Compute tree layout positions.
 *
 * @param {Object|null} root - Tree root { id, value, left, right } (recursive)
 * @param {number} nodeW - Node width in pixels (for spacing)
 * @param {number} nodeH - Node height in pixels (for spacing)
 * @param {number} hGap - Horizontal gap between nodes
 * @param {number} vGap - Vertical gap between levels
 * @returns {Map<number, {x: number, y: number}>} Pixel positions keyed by node id
 */
export default function computeTreeLayout(root, nodeW = 56, nodeH = 56, hGap = 24, vGap = 64) {
  const unitPositions = layoutTree(root)
  const pixelPositions = new Map()

  for (const [id, pos] of unitPositions) {
    pixelPositions.set(id, {
      x: pos.x * (nodeW + hGap),
      y: pos.y * (nodeH + vGap),
    })
  }

  return pixelPositions
}
