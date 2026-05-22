<template>
  <div class="scheme-manager bg-light p-4 rounded-3 mt-4 border shadow-inner">
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
      <div>
        <h5 class="mb-0 fw-bold text-primary">Esquemas Operacionales</h5>
        <p class="text-muted small mb-0">Sincronizados automáticamente con los Tipos de Programas Académicos.</p>
      </div>
      <div class="d-flex gap-2 align-items-center">
        <AppButton icon="times" outlined variant="secondary" class="btn-close-panel" @click="$emit('close')"></AppButton>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div v-else-if="schemes.length === 0" class="text-center py-5 bg-white rounded-3 border">
      <AppGetIcon name="sitemap" classIcon="size-icon-large text-muted mb-3" />
      <p class="text-muted">No hay esquemas operativos disponibles.</p>
    </div>

    <div v-else class="row g-3">
      <div v-for="scheme in schemes" :key="scheme.id" class="col-md-6 col-lg-4 col-xl-3">
        <OperationalSchemeCard :scheme="scheme" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppGetIcon from '../../../shared/components/AppGetIcon.vue';
import OperationalSchemeCard from './OperationalSchemeCard.vue';
import { CurriculumDesignService } from '../services/CurriculumDesignService';
import { OperationalSchemeDto } from '../dtos/OperationalSchemeDto';

defineEmits<{
  (e: 'close'): void;
}>();

const service = new CurriculumDesignService();
const schemes = ref<OperationalSchemeDto[]>([]);
const loading = ref(false);

const loadSchemes = async () => {
  loading.value = true;
  // Obtenemos los tipos de programas y los mapeamos a esquemas operacionales 1:1
  const response = await service.getProgramTypes({});
  const programTypes = response.data;

  schemes.value = programTypes.map((pt: any) => ({
    id: pt.id,
    name: pt.name,
    code: pt.code,
    description: pt.specification,
    status: pt.status || (pt.isCurricular ? 'active' : 'draft'),
    createdAt: new Date().toISOString(),
    programTypeId: pt.id,
  }));
  loading.value = false;
};

onMounted(loadSchemes);
// Cuando se actualizan los programas, recargar para mantener sincronización
document.addEventListener('updateDatatable', loadSchemes);
</script>

<style scoped>
.scheme-manager {
  animation: slideIn 0.4s ease-out;
  border-left: 5px solid #1e3a8a !important;
}

.btn-close-panel {
  border-radius: 10px !important;
  width: 40px !important;
  height: 40px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 !important;
  transition: all 0.2s ease !important;
}

.btn-close-panel:hover {
  background-color: #f0f0f0 !important;
  color: #1e3a8a !important;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.shadow-inner {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}

.size-icon-large {
  font-size: 3rem;
  opacity: 0.3;
}
</style>
