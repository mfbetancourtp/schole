<template>
  <div class="req-doc-card">
    <div class="req-doc-card__icon-col">
      <div class="req-doc-card__icon-wrap">
        <AppIcon icon="file-alt" class="req-doc-card__icon" />
      </div>
    </div>

    <div class="req-doc-card__body">
      <div class="req-doc-card__header">
        <span class="req-doc-card__name">{{ document.name }}</span>
        <span class="req-doc-card__code">{{ document.code }}</span>
      </div>
      <p v-if="document.description" class="req-doc-card__desc">
        {{ document.description }}
      </p>
    </div>

    <div class="req-doc-card__actions">
      <AppButtonEdit @click="$emit('edit', document)" />
      <AppButtonDelete @click="$emit('delete', document)" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import type { ApplicationDocumentRequiredItem } from '../dtos/requestConfiguration.dto';

export default defineComponent({
  name: 'RequiredDocumentCard',
  components: { AppIcon, AppButtonEdit, AppButtonDelete },
  props: {
    document: {
      type: Object as PropType<ApplicationDocumentRequiredItem>,
      required: true,
    },
  },
  emits: ['edit', 'delete'],
});
</script>

<style scoped>
.req-doc-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 20px;
  transition: box-shadow 0.15s;
}

.req-doc-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.req-doc-card__icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #ebf5ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.req-doc-card__icon {
  color: #2563eb;
  font-size: 16px;
}

.req-doc-card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.req-doc-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.req-doc-card__name {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #212b36;
}

.req-doc-card__code {
  font-family: 'Roboto', monospace;
  font-size: 12px;
  font-weight: 500;
  color: #637381;
  background: #f4f6f8;
  border-radius: 6px;
  padding: 2px 8px;
}

.req-doc-card__desc {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #637381;
  margin: 0;
  line-height: 1.5;
}

.req-doc-card__actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  align-items: center;
}
</style>
