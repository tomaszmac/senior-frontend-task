<!--
  Task 1 — Refactoring:
    • fmtTime() is duplicated here, in ChunkPanel.vue, and in SourcesView.vue.
      Extract to src/utils/format.js and import it.
-->
<template>
  <div class="chunk-panel">
    <div class="panel-header">
      <div class="panel-title">
        <span class="type-badge type-procedure">{{ t('partPanel.sourcePart') }}</span>
        <h2>{{ part.title }}</h2>
        <p class="summary">
          {{ part.source_name }}{{ t('common.separator') }}{{
            t('common.partWithIndex', { index: part.part_index })
          }}{{ timeRange }}{{ langSuffix }}
        </p>
      </div>
      <button class="close-btn" :title="t('actions.close')" :aria-label="t('actions.close')" @click="emit('close')">
        &#x2715;
      </button>
    </div>
    <div class="panel-body">
      <div class="markdown-content" v-html="parsedBody"/>
    </div>
  </div>
</template>

// Task 1: extract to src/utils/format.js (also in ChunkPanel.vue and SourcesView.vue)
<script setup>
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { marked } from 'marked';
  import { fmtTime } from '../utils/format.js';

  const { part } = defineProps({
    part: { type: Object, required: true },
  });
  const emit = defineEmits(['close']);
  const { t } = useI18n();

  const timeRange = computed(() => {
    const s = fmtTime(part.start_seconds);
    const e = fmtTime(part.end_seconds);
    return s ? `${t('common.separator')}${s} – ${e}` : '';
  });
  const langSuffix = computed(() => part.language ? `${t('common.separator')}${part.language}` : '');
  const parsedBody = computed(() => marked.parse(part.body_markdown || ''));
</script>
