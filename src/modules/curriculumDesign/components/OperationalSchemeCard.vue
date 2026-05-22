<template>
  <div class="card scheme-card border-0 shadow-sm h-100">
    <div class="card-body d-flex flex-column p-3">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <span :class="['status-badge', scheme.status.toLowerCase()]">
          {{ statusMap[scheme.status] || scheme.status }}
        </span>
      </div>
      <div class="mb-1">
        <div v-if="scheme.code" class="text-primary fw-bold" style="font-size: 0.75rem">
          {{ scheme.code }}
        </div>
        <h6 class="card-title fw-bold text-dark mb-0 line-clamp-1">
          {{ scheme.name }}
        </h6>
      </div>
      <p class="text-muted small mb-2">{{ scheme.description }}</p>

      <!-- Tags section -->
      <div v-if="scheme.tags && scheme.tags.length > 0" class="d-flex flex-wrap gap-1 mb-3">
        <span v-for="tag in scheme.tags" :key="tag" class="badge rounded-pill bg-light text-dark border small fw-normal">
          {{ tag }}
        </span>
      </div>

      <div class="d-flex justify-content-between align-items-center mt-auto pt-2 border-top">
        <span class="date-tag text-muted small">{{ new Date(scheme.createdAt).toLocaleDateString() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { OperationalSchemeDto } from '../dtos/OperationalSchemeDto';

defineProps<{
  scheme: OperationalSchemeDto;
}>();

const statusMap: Record<string, string> = {
  active: 'Activo',
  draft: 'Borrador',
  archived: 'Archivado',
};
</script>

<style scoped>
.scheme-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  background: white;
  border: 1px solid #f0f0f0 !important;
}

.scheme-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08) !important;
  border-color: #1e3a8a !important;
}

.status-badge {
  padding: 2px 10px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
}

.active {
  background-color: #dcfce7;
  color: #166534;
}
.draft {
  background-color: #fef9c3;
  color: #854d0e;
}
.archived {
  background-color: #f1f5f9;
  color: #475569;
}

.version-tag {
  background: #f0f4ff;
  color: #1e3a8a;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}
</style>
