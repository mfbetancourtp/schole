<template>
  <AppBaseList title="Catálogo de Servicios" subtitle="Explora todos los servicios de bienestar disponibles para ti">
    <template #content>
      <AppLoading v-if="loading" />

      <div v-else class="service-catalog">
        <!-- Search -->
        <div class="service-catalog__search">
          <AppInput v-model="searchQuery" placeholder="Buscar servicios..." />
        </div>

        <!-- Empty state -->
        <AppEmptyResponse v-if="filtered.length === 0" title="No se encontraron servicios" subtitle="Intente con otro término de búsqueda" :show-image="false" />

        <!-- Grid -->
        <div v-else class="service-catalog__grid">
          <ServiceCard v-for="service in filtered" :key="service.id" :service="service" @request="openRequestModal" />
        </div>
      </div>

      <!-- Modal solicitar cita -->
      <AppModal v-model="showModal">
        <ServiceRequestModal v-if="selectedService && showModal" :service="selectedService" @cancel="showModal = false" @submit="handleSubmit" />
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useMeta } from 'vue-meta';
import { useHeaderStore } from '../../../stores/header.store';

// Shared
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppInput from '../../../shared/components/Forms/AppInput.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';

// Module
import ServiceCard from '../components/ServiceCard.vue';
import ServiceRequestModal from '../components/ServiceRequestModal.vue';

// Service & types
import { serviceCatalogService } from '../services/serviceCatalog.service';
import type { WellnessService, ServiceRequestForm } from '../dtos/serviceCatalog.dto';

export default defineComponent({
  name: 'ServiceCatalog',
  components: {
    AppBaseList,
    AppLoading,
    AppInput,
    AppEmptyResponse,
    AppModal,
    ServiceCard,
    ServiceRequestModal,
  },
  setup() {
    useMeta({ title: 'Catálogo de Servicios' });

    const loading = ref(true);
    const services = ref<WellnessService[]>([]);
    const searchQuery = ref('');
    const showModal = ref(false);
    const selectedService = ref<WellnessService | null>(null);

    const filtered = computed(() => {
      const q = searchQuery.value.toLowerCase().trim();
      if (!q) return services.value;
      return services.value.filter((s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
    });

    const openRequestModal = (service: WellnessService) => {
      selectedService.value = service;
      showModal.value = true;
    };

    const handleSubmit = (_form: ServiceRequestForm) => {
      showModal.value = false;
      selectedService.value = null;
    };

    const loadData = async () => {
      loading.value = true;
      try {
        services.value = await serviceCatalogService.getServices();
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Bienestar Institucional', url: '' };
      headerStorage.moduleItem = { name: 'Catálogo de Servicios', url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
      loadData();
    });

    return {
      loading,
      searchQuery,
      filtered,
      showModal,
      selectedService,
      openRequestModal,
      handleSubmit,
    };
  },
});
</script>

<style scoped>
.service-catalog {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 8px 0;
}

.service-catalog__search {
  max-width: 360px;
}

.service-catalog__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

@media (max-width: 1024px) {
  .service-catalog__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .service-catalog__grid {
    grid-template-columns: 1fr;
  }
}
</style>
