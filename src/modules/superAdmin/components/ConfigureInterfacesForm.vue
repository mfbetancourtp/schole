<template>
  <AppBaseList :title="title" :routes="routes">
    <template v-slot:actions v-if="createNewInterfaz || !!data.value">
      <AppButtonBack
        :to="{ name: 'superAdmin.configureInterfaces' }"
      ></AppButtonBack>
      <AppButton style="color: white;" @click="saveMain">Guardar</AppButton>
    </template>

    <template v-slot:content>
      <div v-if="!createNewInterfaz" class="ManageInferfacesForm__interfaces" >
        <AppCard>
          <template #body>
            <form @submit.prevent="createOrUpdateInterfaz">
              <div class="Interfaces__form">
                <AppFormField :label="'Modulos'">
                  <v-select
                    v-model="v$.form.moduleId.$model"
                    :options="modules"
                    :reduce = "(module) => module.id"
                    label="name"
                    input-id="module"
                  ></v-select>
                </AppFormField>
                <AppFormField
                  :form-control="v$.form.title"
                  :label="'Título'"
                >
                  <input
                    id="title"
                    type="text"
                    class="form-control"
                    v-model="v$.form.title.$model"
                  />
                </AppFormField>

                <AppFormField
                  :form-control="v$.form.urlImageBase"
                  :label="'Imagen'"
                >
                  <!-- <input
                    type="file"
                    class="form-control"
                    ref="fileInput"
                    @change="previewImage"
                  /> -->
                  <AppUploadImage 
                    v-model="v$.form.urlImageBase.$model"
                    input-id="thumbnail"
                    type="file"
                    @imageURL="previewImage"
                  ></AppUploadImage>
                </AppFormField>
              </div>
              <div class="Interfaces__form">
                <AppFormField
                  :form-control="v$.form.description"
                  :label="'Descripción'"
                >

                  <AppVoiceInput  id="description"
                    class="form-control"
                    v-model="v$.form.description.$model" textareaClass="form-control"  />
                </AppFormField>
                <AppFormField
                  :form-control="v$.form.numberLabels"
                  :label="'Numero de etiquetas'"
                >
                  <input
                    id="numberLabels"
                    type="text"
                    class="form-control"
                    v-model="v$.form.numberLabels.$model"
                  />
                </AppFormField>
              </div>

              <div v-if="!data.value" class="Interfaces__actions">
                <AppButtonBack
                  :to="{ name: 'superAdmin.configureInterfaces' }"
                  variant="ghost"
                  label="core.cancel"
                >
                </AppButtonBack>
                <AppButton> Continuar </AppButton>
              </div>
            </form>
          </template>
        </AppCard>
      </div>
      <template v-if="!!data.value">
        <AppLoading v-if="loading"></AppLoading>
        <div v-else class="ManagerInterfaces__translations" >
          <div class="Translations__image">
            <img class="Image" v-if="preview" :src="preview" />
          </div>
          <hr />

          <div class="Translations__content">
            <div class="Content__list">
              <div class="List__filter">
                <AppFormField :label="'Idioma'">
                  <v-select 
                    v-model="languagesId"
                    :clearable="false"
                    :options="languages"
                    :reduce="(language)=> language.id"
                    label="name"
                  ></v-select>
                </AppFormField>

              </div>
              <AppLoading v-if="loading"></AppLoading>
              <AppCard v-else style="width: 100%">
                <template #body>
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Codigo</th>
                        <th>Traduccion</th>
                        <th>Opc</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="!valueTranslations">
                        <td colspan="3">
                          <AppEmptyResponse></AppEmptyResponse>
                        </td>
                      </tr>
                      <tr
                        v-else
                        v-for="item in translations.value"
                        :key="item.id"
                      >
                        <td>
                          {{ item.key }}
                        </td>
                        <td>
                          {{ item.value }}
                        </td>
                        <td>
                          <AppButtonGroup size="sm">
                            <AppButtonEdit
                              @click="openTranslationForm(item)"
                            ></AppButtonEdit>

                            <AppButtonDelete
                              @click="confirmDelete(item)"
                            ></AppButtonDelete>
                          </AppButtonGroup>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </template>
              </AppCard>
            </div>
            <AppLoading v-if="loading"></AppLoading>
            <div v-else class="Content__form">
              <form @submit.prevent="saveTranslation">
                <AppCard style="width: 100%">
                  <template #body>
                    <span class="Form__title">{{titleForm.value}}</span>
                    <div class="Form__items">
                      <AppFormField
                        :form-control="formTranslations$.form.key"
                        :label="'Codigo'"
                      >
                        <input
                          id="Codigo"
                          type="text"
                          class="form-control"
                          v-model="formTranslations$.form.key.$model"
                        />
                        <span v-if="!validateForm" class="Message__error">Error, registro ya existente</span>
                      </AppFormField>

                      <AppFormField
                        :form-control="formTranslations$.form.value"
                        :label="'Traduccion'"
                      >
                        <input
                          id="Traduccion"
                          type="text"
                          class="form-control"
                          v-model="formTranslations$.form.value.$model"
                        />
                      </AppFormField>

                      <AppButton 
                        :disabled="!submitButtonEnabled"
                        label="Guardar"
                        >
                      </AppButton>
                    </div>
                  </template>
                </AppCard>
              </form>
            </div>
          </div>
        </div>
      </template>
      <AppModal v-model="showModalDelete" @close="showModalDelete = false">
        <AppConfirmDeleteModal
          v-if="showModalDelete"
          entity="Formulario personalizado"
          @confirmDelete="deleteTranslation"
        >
        </AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, Ref, ref, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { useRoute, useRouter } from 'vue-router';
import { useMeta } from 'vue-meta';

import {defaultImage,required,} from '../../../shared/plugins/vuelidate.plugin';

import AppIcon from '../../../shared/components/AppIcon.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppUploadImage from '../../../shared/components/Forms/AppUploadImage.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import {InterfacesDto} from'../dtos/configureInterface.dto'
import {TranslationsDto} from'../dtos/configureInterface.dto'
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import {GetListModulesService} from '../services/getListModules.service'
import { GetAllTranslationsByParamsService } from '../services/getAllTranslationsByParams.service';
import {GetAllLanguagesService} from '../services/getAllLanguages.service'
import {CreateOrUpdateTranslationsService} from '../services/createOrUpdateTranslations.service'
import {DeleteTranslationsByIdService} from '../services/deleteTranslationsByIdService'
import {CreateOrUpdateInterfacesService} from '../services/createOrUpdateInterfaces.service'
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const getAllTranslationsByParamsService = new GetAllTranslationsByParamsService();
const getListModulesService = new GetListModulesService();
const getAllLanguagesService = new GetAllLanguagesService();
const createOrUpdateTranslationsService = new CreateOrUpdateTranslationsService();
const deleteTranslationsByIdService = new DeleteTranslationsByIdService();
const createOrUpdateInterfacesService = new CreateOrUpdateInterfacesService();
const updateDatatableService = new UpdateDatatableService();

export default defineComponent({
  name: 'ConfigureInterfacesForm',
  components: {
    AppConfirmDeleteModal,
    AppDatatableColumn,
    AppEmptyResponse,
    AppButtonDelete,
    AppUploadImage,
    AppButtonGroup,
    AppButtonBack,
    AppButtonEdit,
    AppFormField,
    AppDatatable,
    AppBaseList,
    AppLoading,
    AppButton,
    AppModal,
    AppIcon,
    AppCard,
    AppVoiceInput
  },

  props: ['title', 'routes', 'data', 'translations'],

  setup(props) {
    useMeta({ title: props.title });
    const router = useRouter();
    const route = useRoute();
    const data: { value: InterfacesDto } = reactive({
      value: props.data as InterfacesDto,
    });
    
    const currentThumbnail = data.value?.urlImageBase;
    const createNewInterfaz = ref(false);
    const submitButtonEnabled = ref(false);
    const modules = ref();
    const languages = ref();
    const languagesId = ref();
    const translationsEdit = ref(false);
    const translationId = ref();
    const validateForm = ref(true)
    const translations: { value: any } = reactive({
      value: props.translations as TranslationsDto,
    });
    const titleForm : { value: any } = reactive({
      value : 'Crear traduccion'
    });
    const loading = ref(true);
    const loadingTranslations = ref(false);
    const currentTranslation: { value: any } = reactive({
      value: null,
    });
    const valueTranslations = computed(() => {
      if (translations.value === undefined) {
        return false;
      }
      if (translations.value.length > 0) {
        return true;
      }
    });
    const formTranslations = reactive({
      key: null || '',
      value: null || '',
    });
    const formTranslations$ = useVuelidate(
      {
        form: {
          key: {},
          value: {},
        },
      },
      { form: formTranslations }
    );
    const form = reactive({
      moduleId : data.value?.moduleId,
      title: data.value?.title,
      description: data.value?.description,
      numberLabels: data.value?.numberLabels,
      urlImageBase: null,
    });

    const v$ = useVuelidate({
      form: {
        moduleId : {required},
        title: { required },
        description: { required },
        numberLabels: { required },
        urlImageBase: {},
      },
    }, { form });

    const createOrUpdateInterfaz = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return false;
      
      try {
        const formNew = {...form};
        const response = await createOrUpdateInterfacesService.run(formNew, data.value?.id)
        if (!data.value?.id) {
          await router.push({
            name: 'superAdmin.configureInterfacesEdit',
            params: { interfaceId: response.data.interfacesId },
          });
        }
      } catch (e) {}
      createNewInterfaz.value = true;
    };
    const preview = ref<string | null>(null);;

    watch(formTranslations, (newValue) => {
      submitButtonEnabled.value = newValue.key !== '';
    });

    const openTranslationForm = (translation: any) => {
      translationsEdit.value = true
      currentTranslation.value = translation;
      translationId.value = currentTranslation.value?.id
      formTranslations.key =  currentTranslation.value.key;
      formTranslations.value =  currentTranslation.value.value;
      titleForm.value = 'Editar traduccion';
    };

    const saveTranslation = async () => {
      let interfaceId = parseInt(route.params.interfaceId.toString());
      loading.value = true;
      const isValid = await formTranslations$.value.$validate();
      if(!isValid) return false;
      try {
        const dataSend = {
          interfaceId: interfaceId,
          key : formTranslations.key,
          value: formTranslations.value,
          languageId : languagesId.value,
        }
        await createOrUpdateTranslationsService.run(dataSend, translationId?.value);
        formTranslations.key = '';
        formTranslations.value = '';
        validateForm.value = true;
      } catch (e){
        console.log(e);
        validateForm.value = false;
      }
      loading.value = false;
      updateDatatableService.run();
    };
    onMounted( async () => {
      loading.value = false;
      await getModules();
      await getLanguages();
      await getTranslationsByLenguaje();
      if(data.value?.urlImageBase){
        preview.value = data.value?.urlImageBase;
      }
      loading.value = false;
    });
    const previewImage = (imageURL: string | null = null) => {
      try{
        preview.value = imageURL;
      }catch(e) {}
    };
    const getModules = async () => {
      let dataModules = await getListModulesService.run();
      modules.value = dataModules.data;
    }
    watch(languagesId, async () => {
      await getTranslationsByLenguaje();
    });
    watch(loading, async ()=>{
      await getTranslationsByLenguaje(); 
    })
    const getLanguages = async () => {
      let dataLanguages = await getAllLanguagesService.run();
      languages.value = dataLanguages;
      if(languages.value.length){
        languagesId.value = languages.value[0].id
      }
    }
    const getTranslationsByLenguaje = async () => {
      loadingTranslations.value = true;
      let interfaceId = parseInt(route.params.interfaceId.toString());
      translations.value = await getAllTranslationsByParamsService.run(interfaceId, languagesId.value);
      loadingTranslations.value = false;
    }
    const showModalDelete = ref(false);
    const currentDataDelete: { value: any | null } = reactive({
      value: null,
    });

    const confirmDelete = async (item: any) => {
      currentDataDelete.value = item;
      showModalDelete.value = true;
    };
    const deleteTranslation = async () => {
      loading.value = true;
      try {
        await deleteTranslationsByIdService.run(currentDataDelete.value.id)
        showModalDelete.value = false;
        loading.value = false;
      } catch (e) {}
    };
    const saveMain = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return false;
        await createOrUpdateInterfaz();
        await router.push({
          name: 'superAdmin.configureInterfaces',
        });
    };

    return {
      v$,
      data,
      preview,
      translations,
      formTranslations$,

      submitButtonEnabled,
      loadingTranslations,
      createNewInterfaz,
      valueTranslations,
      showModalDelete,
      validateForm,
      languagesId,
      languages,
      titleForm,
      loading,
      modules,
      

      createOrUpdateInterfaz,
      openTranslationForm,
      deleteTranslation,
      currentThumbnail,
      saveTranslation,
      confirmDelete,
      previewImage,
      saveMain,
    };
  },
});
</script>

<style scoped>
.ManageInferfacesForm__interfaces {
  padding: var(--padding-3);
}
.Interfaces__form {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}
.Interfaces__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--gap-1);
}
.ManagerInterfaces__translations {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: var(--gap-3);
  width: 100%;
}
.Translations__image {
  display: flex;
  width: 40%;
}
.Image {
  object-fit: cover;
  border-radius: var(--border-radius-2);
}
.Translations__content {
  display: flex;
  flex-direction: column;
  gap: var(--gap-2);
  align-items: flex-start;
  width: 60%;
}
.Content__list {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.List__filter {
  width: 100%;
}
.List__filter > div {
  flex-direction: row !important;
  gap: var(--gap-3);
}
.Content__form {
  width: 100%;
}
.Form__items {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--gap-1);
  padding: var(--padding-1);
}
.Message__error{
  color: var(--color-danger);
  font-size: 0.8rem;
}
.Form__title{
  font-size: var(--font-size-2);
  font-weight: var(--font-weight-bold);
  padding: var(--padding-1);

}
</style>