<template>
  <AppBaseList :title="t('Configuración de Cronograma')">
    <template #actions>
      <AppButton :label="t('Nueva Plantilla')" variant="primary" icon="plus" style="color: white" @click="openCreateDrawer" />
    </template>

    <template #content>
      <AppLoading v-if="loading" />

      <div v-else class="schedule-config">
        <!-- Header -->
        <div class="schedule-config__welcome">
          <h2 class="schedule-config__title">
            {{ t('Configuración de Cronograma') }}
          </h2>
          <p class="schedule-config__subtitle">
            {{ t('Defina las plantillas de hitos para cada modalidad de grado') }}
          </p>
        </div>

        <!-- Info alert -->
        <div class="schedule-config__alert">
          <AppIcon icon="info-circle" class="schedule-config__alert-icon" />
          <div class="schedule-config__alert-content">
            <h4 class="schedule-config__alert-title">
              {{ t('Cronograma automático') }}
            </h4>
            <ul class="schedule-config__alert-list">
              <li>
                {{ t('Al aprobar una postulación se genera automáticamente el cronograma del estudiante') }}
              </li>
              <li>
                {{ t('Los hitos definidos aquí se asignarán como fechas límite basadas en la fecha de aprobación') }}
              </li>
              <li>
                {{ t('Cada modalidad tiene su propia plantilla de hitos independiente') }}
              </li>
              <li>
                {{ t('Los cambios en la plantilla solo afectan a las nuevas postulaciones aprobadas') }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Template cards -->
        <div class="schedule-config__cards">
          <ModalityTemplateCard v-for="tmpl in templates" :key="tmpl.id" :template="tmpl" @configure="openConfigDrawer" @delete="confirmDelete" />
        </div>
      </div>

      <!-- Configure / Create template drawer -->
      <AppDrawer :isVisible="drawerVisible" @update:isVisible="drawerVisible = $event" size="lg">
        <template #head>
          <AppDrawerHeader v-if="isCreating" variant="create" :title="t('Crear Nueva Plantilla')" :subtitle="t('Define una nueva opción de grado con sus características')" />
          <AppDrawerHeader v-else variant="edit" :title="t('Configurar Plantilla')" />
        </template>
        <template #body>
          <AppLoading v-if="drawerLoading" />
          <CreateTemplateDrawer v-else-if="isCreating" ref="createDrawerRef" />
          <MilestoneConfigDrawer v-else-if="templateDetail" ref="milestoneDrawerRef" :detail="templateDetail" />
        </template>
        <template #footer>
          <div class="drawer-footer">
            <AppButton :label="isCreating ? t('Crear Plantilla') : t('Guardar Plantilla')" variant="primary" @click="isCreating ? handleCreateTemplate() : handleSaveTemplate()" />
          </div>
        </template>
      </AppDrawer>

      <!-- Confirm delete modal -->
      <AppModal v-model="deleteModalOpen">
        <AppConfirmDeleteModal v-if="deleteModalOpen" :entity="templateToDelete?.name ?? ''" @confirmDelete="handleDeleteTemplate" />
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useHeaderStore } from '../../../stores/header.store';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppDrawerHeader from '../../../shared/components/AppDrawerHeader.vue';

import ModalityTemplateCard from '../components/ModalityTemplateCard.vue';
import MilestoneConfigDrawer from '../components/MilestoneConfigDrawer.vue';
import CreateTemplateDrawer from '../components/CreateTemplateDrawer.vue';

import { GetScheduleSettingsService } from '../services/getScheduleSettings.service';
import { GetScheduleSettingsMilestonesService } from '../services/getScheduleSettingsMilestones.service';
import { CreateScheduleSettingsService } from '../services/createScheduleSettings.service';
import { DeleteScheduleSettingsService } from '../services/deleteScheduleSettings.service';
import { CreateScheduleSettingsMilestoneService } from '../services/createScheduleSettingsMilestone.service';
import { UpdateScheduleSettingsMilestoneService } from '../services/updateScheduleSettingsMilestone.service';
import { DeleteScheduleSettingsMilestoneService } from '../services/deleteScheduleSettingsMilestone.service';
import { UpdateScheduleSettingsService } from '../services/updateScheduleSettings.service';

import type { ScheduleSettingDto } from '../dtos/scheduleConfig.dto';

export default defineComponent({
  name: 'ScheduleConfig',
  components: {
    AppBaseList,
    AppLoading,
    AppDrawer,
    AppButton,
    AppIcon,
    AppModal,
    AppConfirmDeleteModal,
    AppDrawerHeader,
    ModalityTemplateCard,
    MilestoneConfigDrawer,
    CreateTemplateDrawer,
  },
  setup() {
    const { t } = useI18n();
    useMeta({ title: 'Configuración de Cronograma' });

    const loading = ref(true);
    const templates = ref<ScheduleSettingDto[]>([]);

    const drawerVisible = ref(false);
    const drawerLoading = ref(false);
    const isCreating = ref(false);
    const templateDetail = ref<ScheduleSettingDto | null>(null);
    const milestoneDrawerRef = ref<InstanceType<typeof MilestoneConfigDrawer> | null>(null);
    const createDrawerRef = ref<InstanceType<typeof CreateTemplateDrawer> | null>(null);
    const templateToDelete = ref<ScheduleSettingDto | null>(null);
    const deleteModalOpen = ref(false);

    const loadData = async () => {
      loading.value = true;
      try {
        const result = await new GetScheduleSettingsService().run({
          page: 1,
          perPage: 50,
        });
        templates.value = result.data;
      } finally {
        loading.value = false;
      }
    };

    const openConfigDrawer = async (template: ScheduleSettingDto) => {
      isCreating.value = false;
      drawerVisible.value = true;
      drawerLoading.value = true;
      try {
        const milestones = await new GetScheduleSettingsMilestonesService().run({
          scheduleSettingsId: template.id,
          noPag: 'true',
        });
        templateDetail.value = { ...template, milestones };
      } finally {
        drawerLoading.value = false;
      }
    };

    const openCreateDrawer = () => {
      isCreating.value = true;
      templateDetail.value = null;
      drawerVisible.value = true;
      createDrawerRef.value?.reset?.();
    };

    const handleSaveTemplate = async () => {
      if (!templateDetail.value) return;
      drawerLoading.value = true;
      try {
        const { template, milestones, deletedIds } = milestoneDrawerRef.value?.getAll?.() ?? {
          template: null,
          milestones: [],
          deletedIds: [],
        };

        if (template) {
          await new UpdateScheduleSettingsService().run(template, templateDetail.value.id);
        }

        for (const id of deletedIds) {
          await new DeleteScheduleSettingsMilestoneService().run(id);
        }

        for (const m of milestones) {
          if (m.id > 0) {
            await new UpdateScheduleSettingsMilestoneService().run(
              {
                name: m.name,
                description: m.description,
                approvalDeadline: m.approvalDeadline,
              },
              m.id
            );
          } else {
            await new CreateScheduleSettingsMilestoneService().run({
              scheduleSettingsId: templateDetail.value!.id,
              name: m.name,
              description: m.description,
              approvalDeadline: m.approvalDeadline,
            });
          }
        }

        drawerVisible.value = false;
        templateDetail.value = null;
        await loadData();
      } finally {
        drawerLoading.value = false;
      }
    };

    const handleCreateTemplate = async () => {
      const formData = createDrawerRef.value?.getFormData?.();
      if (!formData?.name) return;

      drawerLoading.value = true;
      try {
        const response = await new CreateScheduleSettingsService().run({
          name: formData.name,
          description: formData.description,
          icon: formData.icon || 'graduation-cap',
          color: formData.color || '#1b55e2',
        });
        const createdId: number = response?.data?.id ?? response?.id;

        for (const m of formData.milestones) {
          if (m.name) {
            await new CreateScheduleSettingsMilestoneService().run({
              scheduleSettingsId: createdId,
              name: m.name,
              description: m.description,
              approvalDeadline: m.approvalDeadline,
            });
          }
        }

        drawerVisible.value = false;
        await loadData();
      } finally {
        drawerLoading.value = false;
      }
    };

    const confirmDelete = (template: ScheduleSettingDto) => {
      templateToDelete.value = template;
      deleteModalOpen.value = true;
    };

    const handleDeleteTemplate = async () => {
      if (!templateToDelete.value) return;
      await new DeleteScheduleSettingsService().run(templateToDelete.value.id);
      deleteModalOpen.value = false;
      templateToDelete.value = null;
      await loadData();
    };

    onMounted(() => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Grados y títulos', url: '' };
      headerStorage.moduleItem = {
        name: 'Configuración de Cronograma',
        url: '',
      };
      headerStorage.moduleSubItem = { name: '', url: '' };
      loadData();
    });

    return {
      t,
      loading,
      templates,
      drawerVisible,
      drawerLoading,
      isCreating,
      templateDetail,
      milestoneDrawerRef,
      createDrawerRef,
      templateToDelete,
      openConfigDrawer,
      openCreateDrawer,
      handleSaveTemplate,
      handleCreateTemplate,
      confirmDelete,
      handleDeleteTemplate,
      deleteModalOpen,
    };
  },
});
</script>

<style scoped>
.schedule-config {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 8px 0;
}

.schedule-config__welcome {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.schedule-config__title {
  font-size: 24px;
  font-weight: 700;
  color: #212b36;
  margin: 0;
}

.schedule-config__subtitle {
  font-size: 14px;
  color: #637381;
  margin: 0;
}

.schedule-config__alert {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 20px;
  border-radius: 12px;
  background: #f4f6f8;
  border-left: 4px solid var(--color-primary);
}

.schedule-config__alert-icon {
  color: var(--color-primary);
  font-size: 16px;
  margin-top: 2px;
  flex-shrink: 0;
}

.schedule-config__alert-content {
  min-width: 0;
}

.schedule-config__alert-title {
  font-size: 14px;
  font-weight: 700;
  color: #212b36;
  margin: 0 0 6px 0;
}

.schedule-config__alert-list {
  margin: 0;
  padding: 0 0 0 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.schedule-config__alert-list li {
  font-size: 13px;
  color: #637381;
  line-height: 1.5;
}

.schedule-config__cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  column-gap: 24px;
  row-gap: 24px;
}

@media (max-width: 768px) {
  .schedule-config__cards {
    grid-template-columns: 1fr;
  }
}

.drawer-footer {
  width: 100%;
}
</style>
