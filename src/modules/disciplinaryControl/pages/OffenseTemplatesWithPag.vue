<template>
  <AppBaseList v-if="loading" :title="title" isCard>
    <template #content>
      <AppLoading v-if="loading" />
    </template>
  </AppBaseList>

  <AppBaseList v-else :title="title" isCard>
    <template #actions>
      <AppButton style="color: white" :label="'core.newFemale'" @click="openOffenseTemplateModal()" />
    </template>

    <template #content>
      <AppDatatable name="offenseTemplatesWithPag" :service="service" :params="params">
        <template #filters>
          <AppFilter v-model="levelOffenseId" filter-name="offenseTemplatesWithPag.levelOffenseId">
            <AppFormField label="Nivel de Falta" capitalize>
              <AppAutocomplete v-model="levelOffenseId" :options="levelOffenses" input-id="levelOffenseId" />
            </AppFormField>
          </AppFilter>
        </template>

        <AppDatatableColumn v-slot="{ row }" label="Código" field="name">
          {{ row.ot.code }}
        </AppDatatableColumn>

        <AppDatatableColumn v-slot="{ row }" label="Nivel de Falta" field="levelOffense.name" :width="300">
          {{ row.levelOffenseName }}
        </AppDatatableColumn>

        <AppDatatableColumn v-slot="{ row }" label="Nombre" field="name">
          {{ row.ot.name }}
        </AppDatatableColumn>

        <AppDatatableColumn v-slot="{ row }" label="Naturaleza de la observación" field="observationNature" :position="'centered'">
          <div class="text-center d-flex align-items-center justify-content-center">
            <AppGetIcon v-if="!row.ot.isPositive" class="m-1 text-danger" name="frown"></AppGetIcon>
            <AppGetIcon v-else class="m-1 text-success" name="smile"></AppGetIcon>
          </div>
        </AppDatatableColumn>

        <AppDatatableColumn v-slot="{ row }" label="core.actions">
          <AppButtonGroup>
            <AppCheckPermission permission="disciplinaryControl.offenseTemplates.edit">
              <AppButtonEdit @click="openOffenseTemplateModal(row)"></AppButtonEdit>
            </AppCheckPermission>

            <AppCheckPermission permission="disciplinaryControl.offenseTemplates.delete">
              <AppButtonDelete @click="openConfirmDelete(row.ot)"></AppButtonDelete>
            </AppCheckPermission>
          </AppButtonGroup>
        </AppDatatableColumn>
      </AppDatatable>
    </template>
  </AppBaseList>

  <AppModal v-model="offenseTemplateModal">
    <OffenseTemplatesForm v-if="offenseTemplateModal" :data="offenseTemplate.value" @close="closeOffenseTemplateModal"></OffenseTemplatesForm>
  </AppModal>

  <AppModal v-model="modalDelete">
    <AppConfirmDeleteModal v-if="modalDelete" entity="disciplinaryControl.offenseTemplates.singular" @confirmDelete="confirmDelete"></AppConfirmDeleteModal>
  </AppModal>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, Ref, ref } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import { useHeaderStore } from '../../../stores/header.store';

import AppFilter from '../../../shared/components/AppFilter.vue';
import AppGetIcon from '../../../shared/components/AppGetIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import OffenseTemplatesForm from '../components/OffenseTemplatesForm.vue';

import { GetLevelOffensesService } from '../services/getLevelOffenses.service';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { DeleteOffenseTemplatesService } from '../services/deleteOffenseTemplates.service';
import { GetOffenseTemplatesWithPaginationService } from '../services/getOffenseTemplatesWithPagination.service';

const getOffenseTemplatesWithPaginationService = new GetOffenseTemplatesWithPaginationService();
const deleteOffenseTemplatesService = new DeleteOffenseTemplatesService();
const getLevelOffensesService = new GetLevelOffensesService();
const updateDatatableService = new UpdateDatatableService();

export default defineComponent({
  name: 'OffenseTemplatesWithPagPage',

  components: {
    AppConfirmDeleteModal,
    AppDatatableColumn,
    AppAutocomplete,
    AppButtonDelete,
    AppButtonGroup,
    AppButtonEdit,
    AppFormField,
    AppDatatable,
    AppBaseList,
    AppLoading,
    AppGetIcon,
    AppFilter,
    AppButton,
    AppModal,

    OffenseTemplatesForm,
  },

  setup() {
    const { t } = useI18n();
    const title = 'Plantillas de Faltas';

    useMeta({ title: t(title) });
    const headerStorage = useHeaderStore();
    headerStorage.module = { name: 'Control Disciplinario', url: '' };
    headerStorage.moduleItem = { name: title, url: '' };
    headerStorage.moduleSubItem = { name: '', url: '' };

    const service = getOffenseTemplatesWithPaginationService;

    const levelOffenseId: Ref<number | null> = ref(null);
    const levelOffenses: Ref<any[]> = ref([]);

    const offenseTemplate: { value: any | null } = reactive({
      value: null,
    });

    const loading = ref(true);
    const modalDelete = ref(false);
    const offenseTemplateModal = ref(false);

    const params = computed(() => ({
      levelOffenseId: levelOffenseId.value,
    }));

    onMounted(async () => {
      const data = await getLevelOffensesService.run();
      levelOffenses.value = data;

      const localfilters: any = JSON.parse(localStorage.getItem('filters') ?? '{}');

      if (localfilters && !!localfilters['offenseTemplatesWithPag.levelOffenseId']) {
        levelOffenseId.value = localfilters['offenseTemplatesWithPag.levelOffenseId'] as number;
      }

      setTimeout(() => (loading.value = false), 500);
    });

    const openOffenseTemplateModal = (data: any | null = null) => {
      if (data) {
        offenseTemplate.value = {
          ...data.ot,
          ...data,
        };
      } else {
        offenseTemplate.value = null;
      }

      offenseTemplateModal.value = true;
    };
    const closeOffenseTemplateModal = async () => {
      offenseTemplateModal.value = false;
      updateDatatableService.run();
    };

    const openConfirmDelete = async (data: any) => {
      modalDelete.value = true;
      offenseTemplate.value = {
        ...data.ot,
        ...data,
      };
    };
    const confirmDelete = async () => {
      let id = offenseTemplate?.value?.id ?? 0;
      await deleteOffenseTemplatesService.run(id);

      modalDelete.value = false;
      updateDatatableService.run();
    };

    return {
      title,

      loading,
      modalDelete,
      offenseTemplateModal,

      service,
      params,

      levelOffenseId,
      levelOffenses,
      offenseTemplate,

      closeOffenseTemplateModal,
      openOffenseTemplateModal,
      openConfirmDelete,
      confirmDelete,
    };
  },
});
</script>
