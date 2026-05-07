<template>
  <div class="graph-shell">
    <div ref="containerEl" class="graph-canvas" />
    <div class="graph-overlay">
      <button
        type="button"
        :class="['path-toggle', { active: pathModeActive }]"
        :aria-pressed="pathModeActive"
        @click="togglePathMode"
      >
        {{ t('graph.path.toggle') }}
      </button>
      <span v-if="showNoPath" class="path-status">
        {{ t('graph.path.noPathFound') }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ForceGraph from 'force-graph'
import { DEFAULT_TYPE_COLOR, TYPE_COLORS } from '../utils/types.js'

const props = defineProps({
  data:         { type: Object, default: () => ({ nodes: [], links: [] }) },
  selectedSlug: { type: String, default: null },
  // Task 3: add filterQuery prop here and use it in nodeCanvasObject
  // filterQuery: { type: String, default: '' },
})
const emit = defineEmits(['select'])
const { t } = useI18n()

const containerEl = ref(null)
const pathModeActive = ref(false)
const pathStart = ref(null)
const pathEnd = ref(null)
const pathNodeSlugs = ref(new Set())
const pathLinkKeys = ref(new Set())
const noPathFound = ref(false)
const showNoPath = computed(() => pathModeActive.value && noPathFound.value)
const PATH_HIGHLIGHT_COLOR = TYPE_COLORS.process_stage
let fg = null

function nodeColor(node) {
  return TYPE_COLORS[node.type] || DEFAULT_TYPE_COLOR
}

function endpointSlug(endpoint) {
  if (typeof endpoint === 'string') return endpoint
  return endpoint?.slug || null
}

function linkEndpointSlugs(link) {
  return [endpointSlug(link.source), endpointSlug(link.target)]
}

function pathLinkKey(sourceSlug, targetSlug) {
  return [sourceSlug, targetSlug].sort().join('::')
}

function isPathResolved() {
  return pathModeActive.value && pathNodeSlugs.value.size > 0
}

function isPathLink(link) {
  const [sourceSlug, targetSlug] = linkEndpointSlugs(link)
  if (!sourceSlug || !targetSlug) return false
  return pathLinkKeys.value.has(pathLinkKey(sourceSlug, targetSlug))
}

function graphLinkColor(link) {
  if (!isPathResolved()) return '#334455'
  return isPathLink(link) ? PATH_HIGHLIGHT_COLOR : 'rgba(51, 68, 85, 0.25)'
}

function graphLinkWidth(link) {
  if (!isPathResolved()) return 1
  return isPathLink(link) ? 3 : 0.75
}

function refreshGraph() {
  if (!fg) return
  const currentZoom = fg.zoom()
  if (currentZoom != null) fg.zoom(currentZoom)
  fg.resumeAnimation?.()
}

function clearPathResult() {
  pathNodeSlugs.value = new Set()
  pathLinkKeys.value = new Set()
  noPathFound.value = false
}

function resetPathState() {
  pathStart.value = null
  pathEnd.value = null
  clearPathResult()
}

function togglePathMode() {
  pathModeActive.value = !pathModeActive.value
  if (!pathModeActive.value) resetPathState()
  refreshGraph()
}

function buildAdjacency() {
  const adjacency = new Map()

  for (const node of props.data.nodes) {
    adjacency.set(node.slug, new Set())
  }

  for (const link of props.data.links) {
    const [sourceSlug, targetSlug] = linkEndpointSlugs(link)
    if (!sourceSlug || !targetSlug) continue
    if (!adjacency.has(sourceSlug)) adjacency.set(sourceSlug, new Set())
    if (!adjacency.has(targetSlug)) adjacency.set(targetSlug, new Set())
    adjacency.get(sourceSlug).add(targetSlug)
    adjacency.get(targetSlug).add(sourceSlug)
  }

  return adjacency
}

function findShortestPath(startSlug, endSlug) {
  if (startSlug === endSlug) return [startSlug]

  const adjacency = buildAdjacency()
  const queue = [startSlug]
  const visited = new Set([startSlug])
  const previous = new Map()

  for (let index = 0; index < queue.length; index += 1) {
    const currentSlug = queue[index]

    for (const nextSlug of adjacency.get(currentSlug) || []) {
      if (visited.has(nextSlug)) continue

      visited.add(nextSlug)
      previous.set(nextSlug, currentSlug)

      if (nextSlug === endSlug) {
        const path = [endSlug]
        let cursor = endSlug

        while (previous.has(cursor)) {
          cursor = previous.get(cursor)
          path.push(cursor)
        }

        return path.reverse()
      }

      queue.push(nextSlug)
    }
  }

  return null
}

function applyShortestPath(startSlug, endSlug) {
  const path = findShortestPath(startSlug, endSlug)

  if (!path) {
    clearPathResult()
    noPathFound.value = true
    return
  }

  pathNodeSlugs.value = new Set(path)
  pathLinkKeys.value = new Set(
    path.slice(1).map((slug, index) => pathLinkKey(path[index], slug))
  )
  noPathFound.value = false
}

function selectPathNode(slug) {
  if (!pathStart.value || pathEnd.value) {
    pathStart.value = slug
    pathEnd.value = null
    clearPathResult()
    refreshGraph()
    return
  }

  pathEnd.value = slug
  applyShortestPath(pathStart.value, pathEnd.value)
  refreshGraph()
}

function handleNodeClick(node) {
  if (!pathModeActive.value) {
    emit('select', node.slug)
    return
  }

  selectPathNode(node.slug)
}

onMounted(() => {
  fg = ForceGraph()(containerEl.value)
    .graphData(props.data)
    .nodeId('slug')
    .nodeLabel('title')
    .linkColor(graphLinkColor)
    .linkWidth(graphLinkWidth)
    .linkDirectionalArrowLength(3)
    .linkDirectionalArrowRelPos(1)
    .linkLabel('label')
    .backgroundColor('#1a1a2e')
    .onNodeClick(handleNodeClick)
    .nodeCanvasObject((node, ctx, globalScale) => {
      const pathResolved = isPathResolved()
      const isPathNode = pathNodeSlugs.value.has(node.slug)
      const isPendingPathStart =
        pathModeActive.value && !pathEnd.value && pathStart.value === node.slug
      const isPathHighlighted = isPathNode || isPendingPathStart
      const isSelected = !pathModeActive.value && node.slug === props.selectedSlug
      // Task 3: compute match opacity here using filterQuery
      // const isMatch = !filterQuery ||
      //   node.title.toLowerCase().includes(filterQuery.toLowerCase())
      // ctx.globalAlpha = isMatch ? 1 : 0.15

      const color = nodeColor(node)
      const r = isSelected ? 7 : 4

      ctx.save()
      ctx.globalAlpha = pathResolved && !isPathNode ? 0.2 : 1

      ctx.beginPath()
      ctx.arc(node.x, node.y, r, 0, 2 * Math.PI)
      ctx.fillStyle = color
      ctx.fill()

      if (isSelected || isPathHighlighted) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, r + 1.75, 0, 2 * Math.PI)
        ctx.strokeStyle = isPathHighlighted ? PATH_HIGHLIGHT_COLOR : '#ffffff'
        ctx.lineWidth = isPathHighlighted ? 1.25 : 1.5
        ctx.stroke()
      }

      if (globalScale >= 1.2) {
        const fontSize = Math.min(12 / globalScale, 3)
        ctx.font = `${fontSize}px Sans-Serif`
        ctx.fillStyle = 'rgba(220,220,220,0.85)'
        ctx.textAlign = 'center'
        ctx.fillText(node.title, node.x, node.y + r + fontSize + 1)
      }

      // Task 3: reset ctx.globalAlpha = 1 after drawing each node
      ctx.restore()
    })
    .nodeCanvasObjectMode(() => 'replace')

  const { width, height } = containerEl.value.getBoundingClientRect()
  if (width && height) fg.width(width).height(height)

  const ro = new ResizeObserver(([e]) => {
    fg?.width(e.contentRect.width).height(e.contentRect.height)
  })
  ro.observe(containerEl.value)
  onUnmounted(() => ro.disconnect())
})

onUnmounted(() => {
  fg?.pauseAnimation()
  fg = null
})

watch(() => props.data, d => {
  resetPathState()
  fg?.graphData(d)
  refreshGraph()
})

watch(() => props.selectedSlug, slug => {
  refreshGraph()
  if (!slug || !fg) return
  const node = fg.graphData().nodes.find(n => n.slug === slug)
  if (node?.x != null) fg.centerAt(node.x, node.y, 400)
})
</script>
