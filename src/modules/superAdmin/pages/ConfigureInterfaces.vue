<template>
  <AppLoading v-if="loading"></AppLoading>
  <AppBaseList v-else :title="title" :routes="routes">
    <template v-slot:actions>
      <AppButton
      style="color: white;"
        :to="{ name: 'superAdmin.configureInterfacesCreate' }"
        label="core.new"
      >
        {{ t('core.new') }}
      </AppButton>
    </template>

    <template v-slot:content>
      <div class="d-flex justify-content-start">
        <div class="mb-3 tw-w-full md:tw-w-72">
          <label for="moduleId">Modulos</label>

          <v-select
            input-id="moduleId"
            v-model="moduleId"
            :options="modules"
            :reduce = "(module) => module.id"
            label="name"
            :clearable="false"
          ></v-select>
        </div>
      </div>
      <AppLoading v-if="loadingInterfaces"></AppLoading>

      <div v-else class="items">
        <AppCard
          v-for="data in interfaces.value"
          :key="data.title"
          :image="data.urlImageBase"
          class= "Item__card"
        >
          <template v-slot:body>
            <h1 class="h5 lead tw-line-clamp-2">{{ data.title }}</h1>
          </template>

          <template v-slot:footer>
            <div class="d-flex flex-row justify-content-between flex-1 p-1">
              <div class="d-flex flex-column">
                <span
                  class="d-flex justify-content-between pb-1"
                  v-for="language in data.translations"
                  :key="language"
                >
                  {{ language.languageName }}
                  <AppBadge
                    :variant="'primary'"
                    :label="language.number"
                  ></AppBadge>
                </span>
              </div>
              <div class="d-flex justify-content-end align-items-end">
                <AppButtonEdit
                  :to="{
                    name: 'superAdmin.configureInterfacesEdit',
                    params: { interfaceId: data.id },
                  }"
                ></AppButtonEdit>
                <AppButtonDelete @click="confirmDelete(data)"></AppButtonDelete>
              </div>
            </div>
          </template>
        </AppCard>
      </div>

      <AppEmptyResponse 
        :show-image="true"
        v-if="!interfaces.value[0]"
      ></AppEmptyResponse>
      <AppModal v-model="showModalDelete" @close="showModalDelete = false">
        <AppConfirmDeleteModal
          v-if="showModalDelete"
          entity="Formulario personalizado"
          @confirmDelete="deleteInterface"
        >
        </AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';

import { InterfacesDto } from '../dtos/configureInterface.dto';

import { GetAllInterfacesByModuleIdService } from '../services/getAllInterfacesByModuleId.services';
import {GetListModulesService} from '../services/getListModules.service'
import {DeleteInterfacesByIdService} from '../services/deleteInterfacesByIdService'

const getListModulesService = new GetListModulesService();
const getAllInterfacesByModuleIdService = new GetAllInterfacesByModuleIdService();
const deleteInterfacesByIdService = new DeleteInterfacesByIdService();
export default defineComponent({
  name: 'ConfigureInterfaces',
  components: {
    AppConfirmDeleteModal,
    AppCheckPermission,
    AppEmptyResponse,
    AppButtonDelete,
    AppButtonEdit,
    AppBaseList,
    AppLoading,
    AppButton,
    AppBadge,
    AppModal,
    AppCard,
  },
  setup() {
    const title = 'Administrar Interfaces';
    const routes = [
      {
        name: title,
      },
    ];
    useMeta({
      title,
    });
    const { t } = useI18n();
    const loading = ref(true);
    const interfaces : { value: any[] } = reactive({
      value: [],
    });
    const moduleId = ref()
    const modules = ref();
    const loadingInterfaces = ref(false)
    onMounted(async () => {
      try{
        await getModules();
      } catch (e) {}
      loading.value = false;
    });

    watch(moduleId, async () => {
      await getInterfaces();
    });

    const getModules = async () => {
      let dataModules = await getListModulesService.run();
      modules.value = dataModules.data;
      if(modules.value.length){
        moduleId.value = modules.value[0].id;
      }
    }

    const getInterfaces = async () => {
      loadingInterfaces.value = true;
      interfaces.value = await getAllInterfacesByModuleIdService.run(moduleId.value);
      loadingInterfaces.value = false;
    };
    const showModalDelete = ref(false);
    const currentInterface: { value: any | null } = reactive({
      value: null,
    });

    const confirmDelete = async (form: any) => {
      currentInterface.value = form;
      showModalDelete.value = true;
    };

    const deleteInterface = async () => {
      try {
        await deleteInterfacesByIdService.run(currentInterface.value?.id);
        showModalDelete.value = false;
        await getInterfaces();
      } catch (e) {}

    };

    return {
      title,
      routes,
      t,
      modules,
      loading,
      moduleId,
      interfaces,
      showModalDelete,
      loadingInterfaces,

      getModules,
      confirmDelete,
      deleteInterface,
    };
  },
});
</script>

<style scoped>
.items {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 14rem), 1fr));
}

</style>