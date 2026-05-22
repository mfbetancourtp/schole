<template>
  <AppBaseList :title="title">
    <!-- Acciones (slot) -->
    <template #actions>
      <AppCheckPermission permission="surveys.customForms.create">
        <AppButton style="color: white" :to="{ name: 'surveys.customFormsCreate' }" label="core.new">
          {{ t('core.new') }}
        </AppButton>
      </AppCheckPermission>
    </template>

    <!-- Contenido (slot) -->
    <template #content>
      <AppLoading v-if="loading" />

      <template v-else>
        <!-- Grid de tarjetas -->
        <div class="grid-cards">
          <AppCard v-for="form in forms" :key="form.id" :image="form.urlImgHeader">
            <template #title>
              <div>{{ form.title ?? '' }}</div>
            </template>

            <template #body>
              <p class="tw-line-clamp-3">{{ form.description ?? '' }}</p>
            </template>

            <template #footer>
              <div class="d-flex justify-content-between">
                <div></div>
                <div class="d-flex gap-2">
                  <AppCheckPermission permission="surveys.customForms.edit">
                    <AppButtonEdit
                      :to="{
                        name: 'surveys.customFormsEdit',
                        params: { formId: form.id },
                      }"
                    />
                  </AppCheckPermission>

                  <AppCheckPermission permission="surveys.customForms.delete">
                    <AppButtonDelete @click="confirmDelete(form)" />
                  </AppCheckPermission>
                </div>
              </div>
            </template>
          </AppCard>
        </div>

        <!-- Estado vacío -->
        <div v-if="!forms.length">
          <div class="card-body">
            <AppEmptyResponse :show-image="true" />
          </div>
        </div>

        <!-- Modal de confirmación (montaje estable) -->
        <AppModal v-if="showModalDelete" v-model="showModalDelete" @close="showModalDelete = false">
          <AppConfirmDeleteModal entity="Formulario personalizado" @confirmDelete="deleteCustomForm" />
        </AppModal>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';

import { CustomFormDto } from '../dtos/customForm.dto';
import { GetAllCustomFormService } from '../services/getAllCustomForm.service';
import { DeleteCustomFormService } from '../services/deleteCustomForm.service';

import { useHeaderStore } from '../../../stores/header.store';

const getAllCustomFormService = new GetAllCustomFormService();
const deleteCustomFormService = new DeleteCustomFormService();

export default defineComponent({
  name: 'CustomForms',
  components: {
    AppEmptyResponse,
    AppButton,
    AppCheckPermission,
    AppModal,
    AppConfirmDeleteModal,
    AppButtonDelete,
    AppButtonEdit,
    AppCard,
    AppLoading,
    AppBaseList,
  },
  setup() {
    const title = 'Formularios personalizados';
    useMeta({ title });

    const { t } = useI18n();

    const loading = ref(true);
    const forms = ref<CustomFormDto[]>([]);
    const showModalDelete = ref(false);
    const currentForm = ref<CustomFormDto | null>(null);

    const getData = async () => {
      forms.value = await getAllCustomFormService.run();
    };

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Admisión y Registro', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      await getData();
      loading.value = false;
    });

    const confirmDelete = (form: CustomFormDto) => {
      currentForm.value = form;
      showModalDelete.value = true;
    };

    const deleteCustomForm = async () => {
      if (!currentForm.value) return;
      try {
        await deleteCustomFormService.run(currentForm.value.id);
        showModalDelete.value = false;
        await getData();
      } catch (e) {
        // Mantener el modal abierto si falla, y loguear
        console.error('deleteCustomForm error', e);
      }
    };

    return {
      // i18n
      t,
      // UI
      title,
      loading,
      forms,
      showModalDelete,
      // actions
      confirmDelete,
      deleteCustomForm,
    };
  },
});
</script>

<style scoped>
.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
  padding: 10px;
}
</style>
