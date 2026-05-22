<template>
  <AppLoading v-if="loading"></AppLoading>

  <form v-else @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField>
          <label for="mainMenu">Menu Padre</label>
          <v-select
              v-model="v$.form.itemParentId.$model"
              :options="itemsParents"
              :reduce = "(itemsParent) => itemsParent.id"
              label="name"
              input-id="mainMenu"
          ></v-select>
        </AppFormField>
        <div class="d-flex flex-row gap-2 w-100">
            <AppFormField>
                <label for="module">Modulo</label>
                <v-select
                    v-model="v$.form.moduleId.$model"
                    :options="modules"
                    :reduce = "(module) => module.id"
                    label="name"
                    input-id="module"
                ></v-select>
            </AppFormField>

             <AppFormField :form-control="v$.form.code">
                <label for="">Codigo</label>
                <input v-model="v$.form.code.$model" type="text" class="form-control">
            </AppFormField>              
        </div>
        <AppFormField :formControl="v$.form.name">
            <label for="">Nombre</label>
            <input v-model="v$.form.name.$model" type="text" class="form-control">
        </AppFormField>  

        <AppFormField :formControl="v$.form.route">
            <label for="">Ruta</label>
            <input v-model="v$.form.route.$model" type="text" class="form-control">
        </AppFormField>        

        <div class="d-flex flex-row gap-2 w-100">
            <AppFormField :formControl="v$.form.icon"> 
                <label for="">Icon-code</label>
                <input v-model="v$.form.icon.$model" type="text" class="form-control">
            </AppFormField>  

            <AppFormField :formControl="v$.form.order">
                <label for="">Order</label>
                <input v-model="v$.form.order.$model" type="text" class="form-control">
            </AppFormField>           
        </div>
        <div class="d-flex flex-row gap-2 w-100">
            <AppFormField :form-control="v$.form.isActive">
              <div class="form-check form-switch pt-1">  
                  <input 
                      class="form-check-input" 
                      type="checkbox" 
                      id="useCompetencies"
                      v-model="v$.form.showMenu.$model"
                      @change="isActive.value = !isActive.value"
                  >
                  <label class="form-check-label" for="isEconomicManager">
                      Es menu?
                  </label>
              </div>
            </AppFormField>

            <AppFormField :form-control="v$.form.isReport">
              <div class="form-check form-switch pt-1">  
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  id="useCompetencies"
                  v-model="v$.form.isReport.$model"
                  @change="isReport.value = !isReport.value"
                >
                <label class="form-check-label" for="isEconomicManager">
                    Es reporte?
                </label>
              </div>      
            </AppFormField>  
        </div>
      </template>

      <template v-slot:actions>
        <AppButton
          :label="'core.save'"
        ></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, reactive, ref } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useVuelidate } from '@vuelidate/core';
import { debounce } from 'ts-debounce';
import { useI18n } from 'vue-i18n';


import AppLoading from "../../../shared/components/AppLoading.vue";
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import {TableRecordDto} from '../dtos/modules.dto';

import {GetItemsParentsService} from '../services/getItemsParents.service'
import {GetListModulesService} from '../services/getListModules.service'
import {CreateOrUpdateItemsRecordsService} from '../services/createOrUpdateItemsRecords.service'

const getItemsParentsService = new GetItemsParentsService();
const getListModulesService = new GetListModulesService();
const createOrUpdateItemsRecordsService = new CreateOrUpdateItemsRecordsService();

export default defineComponent({
  name: 'FormTableRecords',
  components: { AppFormModal, AppFormField, AppButton, AppLoading, AppAutocomplete },

  props: {
    TableRecord : {
      type : Object as PropType<TableRecordDto | null>,
      default: null,
    }
  },
  emits: ['close'],

  setup(props, {emit}) {
    const { t } = useI18n();
    const tableRecords = props.TableRecord;
    console.log(tableRecords)
    const title = tableRecords ? 'Editar item' : 'Crear item';

    const loading = ref(true);
    const isActive: { value: boolean } = reactive({
      value: false,
    });    
    const form = reactive({
      itemParentId : tableRecords?.itemParentId ?? null,
      moduleId : tableRecords?.moduleId ?? null,
      code : tableRecords?.code ?? '',
      route : tableRecords?.route ?? '',
      name : tableRecords?.name ?? null,
      isReport : !!tableRecords?.isReport ?? null, 
      showMenu : !!tableRecords?.showMenu ?? null,
      order : tableRecords?.order ?? null,
      icon : tableRecords?.icon ?? '',
    });
    const v$ = useVuelidate({
      form: {
        itemParentId : {},
        moduleId : {required},
        code : {required},
        name : {required},
        route : {},
        isReport: {required},
        showMenu: {required},
        order : {required},
        icon : {required},
      },
    }, {form});

    const itemsParents = ref();
    const modules = ref();
    onMounted(async () => {
      let dataItemsParent = await getItemsParentsService.run();
      let dataModules = await getListModulesService.run();
      itemsParents.value = dataItemsParent;
      modules.value = dataModules.data;
      loading.value = false;
    });

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;
      console.log('click')
      try {
        const dataSend = {
          itemParentId: form.itemParentId,
          moduleId: form.moduleId,
          code : form.code,
          route : form.route,
          isReport : form.isReport ? 1 : 0,
          showMenu : form.showMenu ? 1 : 0,
          order : form.order,
          icon : form.icon,
          name : form.name,
        }

        await createOrUpdateItemsRecordsService.run(dataSend, tableRecords?.id);
        emit('close');
      } catch (e) {}
    };

    return {
      loading,
      title,
      save,
      v$,
      t,

      isActive,
      modules,
      itemsParents,

      //searchItemParentForSelect,
    };
  },
});
</script>

<style scoped>
</style>