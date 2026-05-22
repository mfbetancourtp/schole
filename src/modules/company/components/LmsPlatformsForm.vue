<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppLoading v-if="loading"></AppLoading>

        <template v-else>
          <div class="form-row">
            <AppFormField :form-control="v$.form.lmsInstitutionPlatformData.lmsPlatformId" label="Plataforma">
              <AppAutocomplete v-model="v$.form.lmsInstitutionPlatformData.lmsPlatformId.$model" :options="lmsInstitutionPlatforms" :input-id="'lmsPlatformId'" :clearable="false"></AppAutocomplete>
            </AppFormField>

            <AppFormField :form-control="v$.form.lmsInstitutionPlatformData.name" label="Nombre">
              <input id="name" type="text" class="form-control" v-model="v$.form.lmsInstitutionPlatformData.name.$model" />
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
                  <input type="text" class="form-control" v-model="parameter.value" />
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

const createOrUpdateLmsInstitutionPlatformsService = new CreateOrUpdateLmsInstitutionPlatformsService();
const getLmsInstPlatfRelatedDataService = new GetLmsInstPlatfRelatedDataService();

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

    const loading = ref(true);

    const form = reactive({
      lmsInstitutionPlatformData: {
        lmsPlatformId: data?.lmsPlatformId ?? null,
        name: data?.name ?? null,
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
          },
          lmsInstitutionPlatformParametersData: { required },
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        lmsInstitutionPlatforms.value = await getLmsInstPlatfRelatedDataService.run();

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

    watch(
      () => form.lmsInstitutionPlatformData.lmsPlatformId,
      async () => {
        await preloadLmsInstPlatformPara();
      }
    );

    const preloadLmsInstPlatformPara = () => {
      if (form.lmsInstitutionPlatformData.lmsPlatformId) {
        const lmsPlatformId = form.lmsInstitutionPlatformData.lmsPlatformId;

        lmsInstitutionPlatforms.value.forEach((lmsInstitutionPlatform) => {
          if (lmsPlatformId == lmsInstitutionPlatform.id) {
            lmsInstPlatformPara.value = [];

            lmsInstitutionPlatform.lmsPlatformParametersAvailables.forEach((parametersAvailables: any) => {
              lmsInstPlatformPara.value.push({
                id: null,
                lmsParameterId: parametersAvailables.lmsParameterId,
                name: parametersAvailables.lmsParameter.name,
                value: null,
              });
            });
          }
        });
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
        await createOrUpdateLmsInstitutionPlatformsService.run(form, data?.id);

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

      lmsInstitutionPlatforms,
      lmsInstPlatformPara,
    };
  },
});
</script>

<style scoped></style>
