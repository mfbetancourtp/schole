<template>
  <AppBaseList :title="title">
    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>
      <template v v-else>
        <AppLoading v-if="loadingOffense"></AppLoading>

        <section v-else>
          <!-- <div :class="{ 'grid-cards': offenseTemplates.value.length }"> -->
          <div class="grid-cards">
            <AppEmptyResponse
              v-if="!offenseTemplates.value.length"
            ></AppEmptyResponse>
            <AppCheckPermission
              permission="disciplinaryControl.offenseTemplates.create"
            >
              <AppButtonNewContainer
                @click="openOffenseTemplateModal()"
              ></AppButtonNewContainer>
            </AppCheckPermission>
            <AppCard
              v-for="(offenseTemplate, index) in offenseTemplates.value"
              :key="index"
            >
              <template #title>
                <div>
                  <h5 class="card-title m-0">
                    {{
                      offenseTemplate.code ??
                      t(
                        'disciplinaryControl.offenseTemplates.notunassignedCode'
                      )
                    }}
                  </h5>

                  <AppGetIcon
                    v-if="!offenseTemplate.isPositive"
                    class="m-1 text-danger"
                    name="frown"
                  ></AppGetIcon>
                  <AppGetIcon
                    v-else
                    class="m-1 text-success"
                    name="smile"
                  ></AppGetIcon>
                </div>
              </template>
              <template #body>
                <span>{{ offenseTemplate.name }}</span>
              </template>
              <template #footer>
                <div class="tw-flex tw-justify-end">
                  <AppButtonGroup size="sm">
                    <AppCheckPermission
                      permission="disciplinaryControl.offenseTemplates.edit"
                    >
                      <AppButtonEdit
                        @click="openOffenseTemplateModal(offenseTemplate)"
                      ></AppButtonEdit>
                    </AppCheckPermission>

                    <AppCheckPermission
                      permission="disciplinaryControl.offenseTemplates.delete"
                    >
                      <AppButtonDelete
                        @click="openConfirmDelete(offenseTemplate)"
                      ></AppButtonDelete>
                    </AppCheckPermission>
                  </AppButtonGroup>
                </div>
              </template>
            </AppCard>
          </div>

          <!-- </div> -->
        </section>

        <AppModal v-model="offenseTemplateModal">
          <OffenseTemplatesForm
            v-if="offenseTemplateModal"
            :data="offenseTemplate.value"
            @close="closeOffenseTemplateModal"
          ></OffenseTemplatesForm>
        </AppModal>

        <AppModal v-model="modalDelete">
          <AppConfirmDeleteModal
            v-if="modalDelete"
            entity="disciplinaryControl.offenseTemplates.singular"
            @confirmDelete="confirmDelete"
          ></AppConfirmDeleteModal>
        </AppModal>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { defineComponent, onMounted, reactive, ref } from 'vue';

import AppIcon from '../../../shared/components/AppIcon.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppGetIcon from '../../../shared/components/AppGetIcon.vue';

import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppCardTitle from '../../../shared/components/Card/AppCardTitle.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppButtonNewContainer from '../../../shared/components/Buttons/AppButtonContainerNew.vue';

import OffenseTemplatesForm from '../components/OffenseTemplatesForm.vue';

import { OffenseTemplateDto } from '../dtos/offenseTemplate';

import { GetOffenseTemplatesService } from '../services/getOffenseTemplates.service';
import { DeleteOffenseTemplatesService } from '../services/deleteOffenseTemplates.service';
import { useHeaderStore } from '../../../stores/header.store';

const deleteOffenseTemplatesService = new DeleteOffenseTemplatesService();
const getOffenseTemplatesService = new GetOffenseTemplatesService();

export default defineComponent({
  name: 'OffenseTemplates',
  components: {
    AppButtonNewContainer,
    AppConfirmDeleteModal,
    OffenseTemplatesForm,
    AppCheckPermission,
    AppEmptyResponse,
    AppButtonDelete,
    AppButtonGroup,
    AppButtonEdit,
    AppBaseList,
    AppLoading,
    AppModal,
    AppCard,
    AppGetIcon,
  },

  setup() {
    const { t } = useI18n();
    const title = t('Observación');
    useMeta({ title: title });
    const routes = [{ name: title }];

    const offenseTemplateModal = ref(false);
    const loadingOffense = ref(false);
    const modalDelete = ref(false);
    const loading = ref(true);

    const offenseTemplates: { value: OffenseTemplateDto[] } = reactive({
      value: [],
    });
    const offenseTemplate: { value: OffenseTemplateDto | null } = reactive({
      value: null,
    });

    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Control disciplinario', url: '' };
        headerStorage.moduleItem = { name: title, url: '' };
        headerStorage.moduleSubItem = { name: '', url: '' };

        await getOffenceTemplates();
      } catch (e) {
        console.log('error', e);
      }

      loading.value = false;
    });

    const getOffenceTemplates = async () => {
      loadingOffense.value = true;
      offenseTemplates.value = await getOffenseTemplatesService.run();
      loadingOffense.value = false;
    };

    const openOffenseTemplateModal = (
      data: OffenseTemplateDto | null = null
    ) => {
      offenseTemplate.value = data;
      offenseTemplateModal.value = true;
    };
    const closeOffenseTemplateModal = async () => {
      offenseTemplateModal.value = false;
      await getOffenceTemplates();
    };

    const openConfirmDelete = async (data: OffenseTemplateDto) => {
      modalDelete.value = true;
      offenseTemplate.value = data;
    };
    const confirmDelete = async () => {
      let id = offenseTemplate?.value?.id ?? 0;
      await deleteOffenseTemplatesService.run(id);

      modalDelete.value = false;
      await getOffenceTemplates();
    };

    return {
      routes,
      title,
      t,

      offenseTemplateModal,
      offenseTemplates,
      offenseTemplate,
      loadingOffense,
      modalDelete,
      loading,

      closeOffenseTemplateModal,
      openOffenseTemplateModal,
      openConfirmDelete,
      confirmDelete,
    };
  },
});
</script>

<style scoped>
.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 15rem), 1fr));
}
</style>
