<!--
  Task 1 — Refactoring:
    • fmtTime() is duplicated here, in SourcesView.vue, and in PartPanel.vue.
      Extract to src/utils/format.js and import it.
    • TYPE_LABELS below duplicates the same five keys as TYPE_COLORS in Graph.vue.
      Unify into src/utils/types.js.
-->
<template>
  <div class="chunk-panel">
    <div class="panel-header">
      <div class="panel-title">
        <span :class="`type-badge type-${chunk.type}`">{{ typeLabel }}</span>
        <h2>{{ chunk.title }}</h2>
        <p v-if="chunk.summary" class="summary">{{ chunk.summary }}</p>
      </div>
      <button class="close-btn" :title="t('actions.close')" :aria-label="t('actions.close')" @click="emit('close')">
        &#x2715;
      </button>
    </div>

    <div class="panel-body">
      <div v-if="chunk.body_markdown" class="markdown-content" v-html="parsedBody"/>

      <section v-if="outLinks.length || inLinks.length" class="panel-section">
        <h3>{{ t('chunkPanel.relatedChunks') }}</h3>
        <div v-if="outLinks.length" class="link-group">
          <h4>{{ t('chunkPanel.linksTo') }}</h4>
          <ul class="link-list">
            <li v-for="l in outLinks" :key="l.slug">
              <button class="link-btn" @click="emit('navigate', l.slug)">{{ l.title }}</button>
              <span v-if="l.label" class="link-label">{{ l.label }}</span>
            </li>
          </ul>
        </div>
        <div v-if="inLinks.length" class="link-group">
          <h4>{{ t('chunkPanel.referencedBy') }}</h4>
          <ul class="link-list">
            <li v-for="l in inLinks" :key="l.slug">
              <button class="link-btn" @click="emit('navigate', l.slug)">{{ l.title }}</button>
              <span v-if="l.label" class="link-label">{{ l.label }}</span>
            </li>
          </ul>
        </div>
      </section>

      <section v-if="chunk.sources.length" class="panel-section">
        <h3>{{ t('chunkPanel.sources') }}</h3>
        <ul class="source-list">
          <li v-for="(s, i) in chunk.sources" :key="i" class="source-item">
            <span class="source-name">{{ s.source_name }}</span>
            <span class="source-meta">
              {{ t('common.partWithIndex', { index: s.part_index }) }}{{ timeRange(s.start_seconds, s.end_seconds) }}
            </span>
            <p v-if="s.note" class="source-note">{{ s.note }}</p>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { marked } from 'marked';
  import { fmtTime } from '../utils/format.js';
  import { TYPE_LABELS } from '../utils/types.js';

  function timeRange(start, end) {
    const s = fmtTime(start);
    const e = fmtTime(end);
    return s ? `${t('common.separator')}${s} – ${e}` : '';
  }

  const { chunk } = defineProps({
    chunk: { type: Object, required: true },
  });
  const emit = defineEmits(['navigate', 'close']);
  const { t } = useI18n();

  const typeLabel = computed(() => {
    const key = TYPE_LABELS[chunk.type];
    return key ? t(key) : chunk.type;
  });
  const outLinks = computed(() => chunk.links.filter(l => l.direction === 'out'));
  const inLinks = computed(() => chunk.links.filter(l => l.direction === 'in'));
  const parsedBody = computed(() => marked.parse(chunk.body_markdown || ''));
</script>
