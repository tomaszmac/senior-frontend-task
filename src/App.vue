<template>
  <div class="app">
    <header class="app-header">
      <h1>{{ t('app.title') }}</h1>
      <nav class="tabs">
        <button :class="['tab', { active: tab === 'graph' }]" @click="tab = 'graph'">
          {{ t('app.tabs.graph') }}
        </button>
        <button :class="['tab', { active: tab === 'sources' }]" @click="tab = 'sources'">
          {{ t('app.tabs.sources') }}
        </button>
      </nav>
      <span v-if="tab === 'graph'" class="status">
        {{ graphStatus }}
      </span>
      <div v-if="tab === 'graph'" class="header-search">
        <div class="search-field">
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            role="searchbox"
            class="search-input"
            :aria-label="t('app.search.placeholder')"
            :placeholder="t('app.search.placeholder')"
          >
          <button
            v-if="hasActiveSearch"
            type="button"
            class="search-clear"
            :title="t('app.search.clear')"
            :aria-label="t('app.search.clear')"
            @click="clearSearch"
          >
            &times;
          </button>
        </div>
        <span v-if="hasActiveSearch" class="search-count">
          {{ searchMatchCountLabel }}
        </span>
      </div>
      <div class="language-switch" :aria-label="t('app.language.label')">
        <button
          v-for="lang in availableLocales"
          :key="lang"
          :class="['language-option', { active: locale === lang }]"
          :aria-pressed="locale === lang"
          :title="languageTitle(lang)"
          @click="setLocale(lang)"
        >
          {{ lang.toUpperCase() }}
        </button>
      </div>

    </header>

    <div v-if="tab === 'graph'" class="app-body">
      <div class="graph-pane">
        <Graph
          :data="graphData"
          :filter-query="searchQuery"
          :selected-slug="selectedSlug"
          @select="onSelect"
        />
      </div>
      <div :class="['detail-pane', { open: !!selectedSlug }]">
        <div v-if="chunkLoading" class="panel-loading">{{ t('app.loading') }}</div>
        <ChunkPanel
          v-else-if="chunk"
          :chunk="chunk"
          @navigate="selectedSlug = $event"
          @close="selectedSlug = null"
        />
        <div v-else class="empty-state">{{ t('app.empty') }}</div>
      </div>
    </div>

    <SourcesView v-if="tab === 'sources'"/>
  </div>
</template>

<script setup>
  import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { graphData, getChunk } from './data/mock.js';
  import Graph from './components/Graph.vue';
  import ChunkPanel from './components/ChunkPanel.vue';
  import SourcesView from './components/SourcesView.vue';
  import { pluralMessage } from './utils/i18n.js';

  const tab = ref('graph');
  const selectedSlug = ref(null);
  const chunk = ref(null);
  const chunkLoading = ref(false);
  const searchQuery = ref('');
  const searchInputRef = ref(null);
  const availableLocales = ['en', 'pl'];
  const { t, locale } = useI18n();

  const graphStatus = computed(() => {
    const chunks = pluralMessage(t, locale.value, 'app.status.chunks', graphData.nodes.length);
    const links = pluralMessage(t, locale.value, 'app.status.links', graphData.links.length);
    return `${chunks}${t('common.separator')}${links}`;
  });

  const normalizedSearchQuery = computed(() => searchQuery.value.trim().toLowerCase());
  const hasActiveSearch = computed(() => normalizedSearchQuery.value.length > 0);
  const graphSearchMatches = computed(() => {
    if (!hasActiveSearch.value) return [];

    return graphData.nodes.filter(node =>
      node.title.toLowerCase().includes(normalizedSearchQuery.value)
    );
  });
  const searchMatchCountLabel = computed(() =>
    pluralMessage(t, locale.value, 'app.search.matches', graphSearchMatches.value.length)
  );

  function setLocale(lang) {
    locale.value = lang;
  }

  function languageTitle(lang) {
    return t(lang === 'en' ? 'app.language.switchToEnglish' : 'app.language.switchToPolish');
  }

  function onSelect(slug) {
    selectedSlug.value = selectedSlug.value === slug ? null : slug;
  }

  function clearSearch() {
    searchQuery.value = '';
    searchInputRef.value?.focus();
  }

  function isEditableTarget(target) {
    return target instanceof HTMLElement && (
      target.isContentEditable ||
      ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
    );
  }

  function handleGlobalKeydown(event) {
    if (tab.value !== 'graph') return;

    if (event.key === '/' && !isEditableTarget(event.target)) {
      event.preventDefault();
      searchInputRef.value?.focus();
      return;
    }

    if (event.key === 'Escape' && searchQuery.value) {
      searchQuery.value = '';
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleGlobalKeydown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleGlobalKeydown);
  });

  watch(selectedSlug, async (slug, _previousSlug, onCleanup) => {
    let stale = false;
    onCleanup(() => {
      stale = true;
    });

    if (!slug) {
      chunk.value = null;
      chunkLoading.value = false;
      return;
    }

    chunkLoading.value = true;
    await new Promise(r => setTimeout(r, 80));
    if (stale) return;

    chunk.value = getChunk(slug);
    chunkLoading.value = false;
  });
</script>
