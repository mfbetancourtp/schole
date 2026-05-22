<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title" @closed="emit('close')">
      <template v-slot:content>
        <AppLoading v-if="loading"></AppLoading>

        <template v-else>
          <div>
            <AppFormField :form-control="v$.form.lmsInstitutionPlatformData.typeLmsPlatformId" label="Tipo de Plataforma">
              <AppAutocomplete
                v-model="v$.form.lmsInstitutionPlatformData.typeLmsPlatformId.$model"
                :options="typeLmsInstitutionPlatforms"
                :input-id="'lmsPlatformId'"
                :clearable="false"
              ></AppAutocomplete>
            </AppFormField>
          </div>
          <div class="form-row">
            <AppFormField
              :form-control="v$.form.lmsInstitutionPlatformData.lmsPlatformId"
              label="LMS a utilizar
"
            >
              <AppAutocomplete v-model="v$.form.lmsInstitutionPlatformData.lmsPlatformId.$model" :options="lmsInstitutionPlatforms" :input-id="'lmsPlatformId'" :clearable="false"></AppAutocomplete>
            </AppFormField>

            <AppFormField :form-control="v$.form.lmsInstitutionPlatformData.name" label="Nombre">
              <input
                id="name"
                type="text"
                class="form-control"
                v-model="v$.form.lmsInstitutionPlatformData.name.$model"
                pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
              />
            </AppFormField>
          </div>

          <AppFormField :form-control="v$.form.lmsInstitutionPlatformData.lmsUrlApiRest" label="URL api">
            <input id="name" type="text" class="form-control" v-model="v$.form.lmsInstitutionPlatformData.lmsUrlApiRest.$model" />
          </AppFormField>

          <hr class="mb-2" />

          <AppFormField :form-control="v$.form.lmsInstitutionPlatformParametersData">
            <h5 class="m-0">Parámetros</h5>
          </AppFormField>

          <table class="table">
            <thead>
              <tr>
                <th class="col-4">Campo</th>
                <th>Valor</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(parameter, index) in lmsInstPlatformPara" :key="index">
                <td>{{ parameter.name }}</td>
                <td>
                  <input
                    type="text"
                    class="form-control"
                    v-model="parameter.value"
                    pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                    title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </template>
      </template>

      <template v-slot:actions>
        <AppButton label="core.save"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, onMounted, reactive, Ref, ref, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { GetLmsInstPlatfRelatedDataService } from '../services/getLmsInstPlatfRelatedData.service';
import { CreateOrUpdateLmsInstitutionPlatformsService } from '../services/createOrUpdateLmsInstitutionPlatforms.service';
import { GetTypeLmsInstitutionPlatformsService } from '../services/getTypeLmsInstitutionPlatforms.service';

const createOrUpdateLmsInstitutionPlatformsService = new CreateOrUpdateLmsInstitutionPlatformsService();
const getLmsInstPlatfRelatedDataService = new GetLmsInstPlatfRelatedDataService();
const getTypeLmsInstitutionPlatformsService = new GetTypeLmsInstitutionPlatformsService();

export default defineComponent({
  name: 'LmsPlatformsForm',
  components: {
    AppAutocomplete,
    AppFormField,
    AppFormModal,
    AppLoading,
    AppButton,
  },

  props: {
    data: {
      type: Object,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const data = props.data ?? null;
    const title = data?.id ? 'Editar plataforma LMS' : 'Nueva plataforma LMS';

    const lmsInstitutionPlatforms: Ref<any[]> = ref([]);
    const lmsInstPlatformPara: Ref<any[]> = ref([]);
    const typeLmsInstitutionPlatforms: Ref<any[]> = ref([]);

    const loading = ref(true);

    const form = reactive({
      lmsInstitutionPlatformData: {
        lmsPlatformId: data?.lmsPlatformId ?? null,
        name: data?.name ?? null,
        typeLmsPlatformId: data?.typeLmsPlatformId ?? null,
        lmsUrlApiRest: data?.lmsUrlApiRest ?? null,
      },
      lmsInstitutionPlatformParametersData: [] as any,
    });
    const v$ = useVuelidate(
      {
        form: {
          lmsInstitutionPlatformData: {
            lmsPlatformId: { required },
            name: { required },
            lmsUrlApiRest: { required },
            typeLmsPlatformId: {},
          },
          lmsInstitutionPlatformParametersData: { required },
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        typeLmsInstitutionPlatforms.value = await getTypeLmsInstitutionPlatformsService.run();

        await watchTypeLmsPlatformId();
        await watchTypeParameters();

        if (!data?.id && lmsInstitutionPlatforms.value.length) {
          form.lmsInstitutionPlatformData.lmsPlatformId = lmsInstitutionPlatforms.value[0].id;
        }

        if (data?.id) {
          await preloadLmsInstPlatformPara();

          lmsInstPlatformPara.value.forEach((item: any) => {
            data.lmsInstitutionPlatformParameters.forEach((item2: any) => {
              if (item.lmsParameterId == item2.lmsParameterId) {
                item.id = item2.id;
                item.lmsInstitutionPlatformId = item2.lmsInstitutionPlatformId;
                item.value = item2.value;
              }
            });
          });
         
        }
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const watchTypeLmsPlatformId = async () => {
      if (form.lmsInstitutionPlatformData.typeLmsPlatformId) {
        try {
          const result = await getLmsInstPlatfRelatedDataService.run({
            typeLmsPlatformId: form.lmsInstitutionPlatformData.typeLmsPlatformId,
          });
          lmsInstitutionPlatforms.value = result;
        } catch (error) {
          console.error('Error al obtener las plataformas:', error);
        }
      }
    };
    const watchTypeParameters = async () => {
      await preloadLmsInstPlatformPara();
    };

    watch(
      () => form.lmsInstitutionPlatformData.typeLmsPlatformId,
      async (newValue, oldValue) => {
        if (newValue !== oldValue) {
          await watchTypeLmsPlatformId();
        }
      }
    );
    watch(
      () => form.lmsInstitutionPlatformData.typeLmsPlatformId,
      async (newValue, oldValue) => {
        if (newValue) {
          try {
            const result = await getLmsInstPlatfRelatedDataService.run({
              typeLmsPlatformId: newValue,
            });
            lmsInstitutionPlatforms.value = result;
          } catch (error) {
            console.error('Error al obtener las plataformas:', error);
          }
        }
      }
    );

    watch(
      () => form.lmsInstitutionPlatformData.lmsPlatformId,
      async () => {
        await preloadLmsInstPlatformPara();
      }
    );

    const preloadLmsInstPlatformPara = () => {
      if (form.lmsInstitutionPlatformData.lmsPlatformId) {
        const lmsPlatformId = form.lmsInstitutionPlatformData.lmsPlatformId;

        const selectedPlatform = lmsInstitutionPlatforms.value.find((platform) => platform.id === lmsPlatformId);

        if (selectedPlatform) {
          lmsInstPlatformPara.value = selectedPlatform.lmsPlatformParametersAvailables.map((parameter) => {
            const existingParameter = lmsInstPlatformPara.value.find((p) => p.lmsParameterId === parameter.lmsParameterId);

            if (existingParameter) {
              return {
                ...existingParameter,
                name: parameter.lmsParameter.name,
              };
            }

            return {
              id: null,
              lmsParameterId: parameter.lmsParameterId,
              name: parameter.lmsParameter.name,
              value: null,
            };
          });
        }
      }
    };

    const loadLmsInstPlatformPara = () => {
      let emptyField = false;

      lmsInstPlatformPara.value.forEach((item) => {
        if (!item.value && !emptyField) emptyField = true;
      });

      if (!emptyField) {
        lmsInstPlatformPara.value.forEach((item) => {
          if (item.lmsInstitutionPlatformId) {
            form.lmsInstitutionPlatformParametersData.push({
              id: item.id,
              lmsInstitutionPlatformId: item.lmsInstitutionPlatformId,
              lmsParameterId: item.lmsParameterId,
              value: item.value,
            });
          } else {
            form.lmsInstitutionPlatformParametersData.push({
              id: item.id,
              lmsInstitutionPlatformId: item.lmsInstitutionPlatformId,
              lmsParameterId: item.lmsParameterId,
              value: item.value,
            });
          }
        });
      }
    };

    const save = async () => {
      await loadLmsInstPlatformPara();

      const isValid = await v$.value.$validate();
      if (!isValid) return;

      try {
        const datasend = {
          lmsInstitutionPlatformData: {
            lmsPlatformId: form.lmsInstitutionPlatformData.lmsPlatformId,
            name: form.lmsInstitutionPlatformData.name,
            lmsUrlApiRest: form.lmsInstitutionPlatformData.lmsUrlApiRest,
          },
          lmsInstitutionPlatformParametersData: form.lmsInstitutionPlatformParametersData,
        };
        await createOrUpdateLmsInstitutionPlatformsService.run(datasend, data?.id);

        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      loading,
      title,
      save,
      v$,
      emit,

      lmsInstitutionPlatforms,
      lmsInstPlatformPara,
      typeLmsInstitutionPlatforms,
    };
  },
});
</script>

<style scoped></style>
