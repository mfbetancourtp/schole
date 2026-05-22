<template>
  <AppBaseList title="Configuración de Servicios">
    <template #actions>
      <AppButton style="color: white" @click="openCreate">
        <AppIcon icon="plus" class="me-1" />
        Crear Nuevo Servicio
      </AppButton>
    </template>

    <template #content>
      <div class="page-header">
        <h2 class="page-header__title">Configuración de Servicios de Bienestar</h2>
        <p class="page-header__subtitle">Administra los servicios disponibles para los estudiantes</p>
      </div>

      <!-- Search -->
      <div class="toolbar">
        <div class="toolbar__search">
          <AppIcon icon="search" class="toolbar__search-icon" />
          <input type="text" class="toolbar__search-input" placeholder="Buscar servicio para editar..." v-model="searchQuery" />
        </div>
      </div>

      <!-- Loading -->
      <AppLoading v-if="loading" />

      <template v-else>
        <!-- Empty -->
        <AppEmptyResponse v-if="!filteredServices.length" />

        <!-- Cards grid -->
        <div v-else class="services-grid">
          <ServiceConfigCard v-for="service in filteredServices" :key="service.id" :service="service" @edit="openEdit" @delete="openDelete" @toggle="onToggle" />
        </div>
      </template>
    </template>
  </AppBaseList>

  <!-- Create / Edit modal -->
  <ServiceFormModal v-model="showFormModal" :service="selectedService" @saved="onSaved" />

  <!-- Delete confirm -->
  <AppModal v-model="showDeleteModal">
    <AppConfirmDeleteModal entity="este servicio" @confirmDelete="onConfirmDelete" />
  </AppModal>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useMeta } from 'vue-meta';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import ServiceConfigCard from '../components/ServiceConfigCard.vue';
import ServiceFormModal from '../components/ServiceFormModal.vue';
import { useHeaderStore } from '../../../stores/header.store';
import { serviceConfigService } from '../services/serviceConfig.service';
import { ServiceConfig, ServiceConfigForm } from '../dtos/serviceConfig.dto';

useMeta({ title: 'Configuración de Servicios' });

const headerStore = useHeaderStore();
const loading = ref(false);
const services = ref<ServiceConfig[]>([]);
const searchQuery = ref('');

const showFormModal = ref(false);
const showDeleteModal = ref(false);
const selectedService = ref<ServiceConfig | null>(null);

const filteredServices = computed(() => {
  if (!searchQuery.value) return services.value;
  const q = searchQuery.value.toLowerCase();
  return services.value.filter((s) => s.name.toLowerCase().includes(q));
});

async function loadServices() {
  loading.value = true;
  services.value = await serviceConfigService.getServices();
  loading.value = false;
}

function openCreate() {
  selectedService.value = null;
  showFormModal.value = true;
}

function openEdit(service: ServiceConfig) {
  selectedService.value = service;
  showFormModal.value = true;
}

function openDelete(service: ServiceConfig) {
  selectedService.value = service;
  showDeleteModal.value = true;
}

async function onToggle(service: ServiceConfig) {
  await serviceConfigService.toggleStatus(service.id);
  await loadServices();
}

async function onSaved(form: ServiceConfigForm) {
  if (selectedService.value) {
    await serviceConfigService.update(selectedService.value.id, form);
  } else {
    await serviceConfigService.create(form);
  }
  await loadServices();
}

async function onConfirmDelete() {
  if (!selectedService.value) return;
  await serviceConfigService.delete(selectedService.value.id);
  showDeleteModal.value = false;
  await loadServices();
}

onMounted(async () => {
  headerStore.module = { name: 'Bienestar Institucional', url: '' };
  headerStore.moduleItem = { name: 'Configuración de Servicios', url: '' };
  await loadServices();
});
</script>

<style scoped>
.page-header {
  margin-bottom: 1.25rem;
}

.page-header__title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #212b36;
  margin-bottom: 0.2rem;
}

.page-header__subtitle {
  font-size: 0.88rem;
  color: #637381;
  margin: 0;
}

/* Toolbar */
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1.5rem;
}

.toolbar__search {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 320px;
  background: #fff;
  border: 1px solid #e5e8eb;
  border-radius: 8px;
  padding: 0 12px;
  height: 38px;
}

.toolbar__search-icon {
  color: #9ca3af;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.toolbar__search-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.875rem;
  color: #212b36;
  width: 100%;
}

.toolbar__search-input::placeholder {
  color: #9ca3af;
}

/* Services grid */
.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 1024px) {
  .services-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .services-grid {
    grid-template-columns: 1fr;
  }
}
</style>
