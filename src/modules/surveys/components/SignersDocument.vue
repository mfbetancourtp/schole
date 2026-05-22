<template>
  <form @submit.prevent="save">
     <AppFormModal :title="title" @closed="emit('close')">
      <template #content>
        <AppLoading v-if="loading"></AppLoading>

        <template v-else>
          <AppFormField :label="'Nombre (use una sola palabra)'" :form-control="v$.form.code">
            <input id="code" type="text" class="form-control" v-model="v$.form.code.$model" />
          </AppFormField>

          <AppFormField :label="'classroom.activitiesTeacher.form.description'" :form-control="v$.form.description">
            <AppVoiceInput v-model="v$.form.description.$model"
                 id="description" textareaClass="form-control"  />
          </AppFormField>

          <div class="form-row">
            <AppFormField :form-control="v$.form.signerTypeId" :label="'Quien firma?'">
              <AppAutocomplete v-model="v$.form.signerTypeId.$model" :options="signerTypes" :label="'label'"></AppAutocomplete>
            </AppFormField>

            <AppFormField :form-control="v$.form.relationshipId" v-if="showRelationship" :label="'academicAdministration.parents.form.relationship'">
              <AppAutocomplete v-model="v$.form.relationshipId.$model" :options="relationShips"></AppAutocomplete>
            </AppFormField>

            <div v-if="showCheckIsInstitutional" class="col-6 d-flex align-items-end">
              <AppFormField class="form-check form-switch mb-0" :form-control="v$.form.isInstitutional" :label="'Es institucional?'">
                <input type="checkbox" class="form-check-input" v-model="v$.form.isInstitutional.$model" />
              </AppFormField>
            </div>
          </div>

          <AppFormField :form-control="v$.form.additionalFields" :label="'Campos adicionales'">
            <AppAutocomplete v-model="v$.form.additionalFields.$model" :options="fields" :multiple="true" :label="'label'" :reduce="(field) => field.name"></AppAutocomplete>
          </AppFormField>

          <AppFormField v-if="isInstitutional" :form-control="v$.form.jsonData" :label="'Llena el formulario'">
            <div class="ms-2" v-for="(data, index) in jsonData" :key="index">
              <label class="form-label">{{ data.label }}*</label>
              <input
                type="text"
                class="form-control"
                v-model="data.value"
                pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
              />
            </div>
          </AppFormField>
        </template>
      </template>

      <template #actions>
        <AppButton> Guardar </AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, Ref, ref, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { GetRelatedDataDocumentsSignersService } from '../services/getRelatedDataDocumentsSigners.service';
import { SaveSignersDocumentService } from '../services/saveSignersDocument.service';
import { required, requiredIf } from '../../../shared/plugins/vuelidate.plugin';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const getRelatedDataDocumentsSignersService = new GetRelatedDataDocumentsSignersService();
const saveSignersDocumentService = new SaveSignersDocumentService();

//TODO: Validar si esta correcta la comparación por id
const signerTypeParent = 3;

export default defineComponent({
  name: 'SignersDocument',
  components: {
    AppButton,
    AppLoading,
    AppFormField,
    AppFormModal,
    AppAutocomplete,
    AppVoiceInput,
  },
  props: ['document'],
  emits: ['close'],

  setup(props, { emit }) {
    const title = 'Firmantes';
    const loading = ref(true);

    const showCheckIsInstitutional = ref(false);
    const showRelationship = ref(false);
    const isInstitutional = ref(false);
    const relationShips = ref([]);
    const signerTypes = ref([]);
    const fields = ref([]);

    const jsonData: Ref<any[]> = ref([]);

    const form: any = reactive({
      documentId: props.document.id,
      code: null,
      description: '',
      signerTypeId: null,
      isInstitutional: false,
      relationshipId: null,
      additionalFields: [],
      jsonData: {},
    });

    const v$ = useVuelidate(
      {
        form: {
          documentId: { required },
          code: { required },
          description: {},
          signerTypeId: { required },
          isInstitutional: {},
          relationshipId: {
            requiredIf: requiredIf(() => form.signerTypeId === signerTypeParent),
          },
          additionalFields: { required },
          jsonData: { requiredIf: requiredIf(() => form.isInstitutional) },
        },
      },
      { form }
    );

    onMounted(async () => {
      const response = await getRelatedDataDocumentsSignersService.run();

      signerTypes.value = response.signerTypes;
      relationShips.value = response.relationShips;
      fields.value = response.fields;

      fields.value.forEach((field: any) => {
        if (field.required) {
          form.additionalFields.push(field.name);
        }
      });

      loading.value = false;
    });

    watch(
      () => form.additionalFields,
      (value) => {
        if (value) {
          jsonData.value = [];

          // fields.value.forEach((field: any) => {
          //   if (field.required && !form.additionalFields.includes(field.name)) {
          //     form.additionalFields.push(field.name);
          //   }
          // });

          form.additionalFields.forEach((field: any) => {
            fields.value.forEach((fiel: any) => {
              if (field == fiel.name) {
                jsonData.value.push({
                  key: field,
                  label: fiel.label,
                  value: '',
                });
              }
            });
          });

          isInstitutional.value = form.isInstitutional && form.additionalFields.length;
        } else {
          isInstitutional.value = false;
        }
      }
    );

    watch(
      () => form.isInstitutional,
      (value) => {
        isInstitutional.value = value;
      }
    );

    watch(
      () => form.signerTypeId,
      (value) => {
        try {
          let checkIsInstitutional = false;

          showRelationship.value = parseInt(value) === signerTypeParent;

          signerTypes.value.forEach((relation: any) => {
            if (parseInt(value) == relation.id && relation.label == 'Otros') {
              checkIsInstitutional = true;
            }
          });

          showCheckIsInstitutional.value = checkIsInstitutional;
        } catch (e) {
          showRelationship.value = false;
          showCheckIsInstitutional.value = false;
        }
      }
    );

    const loadJsonDataForm = () => {
      let data: any = {};
      let emptyValue = false;

      jsonData.value.forEach((jData: any) => {
        if (jData.value && !emptyValue) {
          data[jData.key] = jData.value;
        } else {
          emptyValue = true;
        }
      });

      form.jsonData = emptyValue ? null : data;
    };

    const save = async () => {
      if (isInstitutional.value) {
        await loadJsonDataForm();
      }

      const isValid = await v$.value.$validate();

      if (!isValid) return;

      try {
        await saveSignersDocumentService.run({
          ...form,
          additionalFields: form.additionalFields.join(','),
        });
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      title,
      v$,
      loading,
      signerTypes,
      relationShips,
      fields,
      isInstitutional,
      showRelationship,
      showCheckIsInstitutional,
      save,
      emit,

      jsonData,
    };
  },
});
</script>

<style scoped></style>
