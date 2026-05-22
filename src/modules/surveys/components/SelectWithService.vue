<template>
  <div v-if="loading"></div>

  <AppFormField v-else :form-control="v$.form.question" :label="label">
    <AppAutocomplete :disabled="blockQuestion || approvedStep" v-model="v$.form.question.$model" :options="options" :reduce="(d: any) => d"></AppAutocomplete>
  </AppFormField>
</template>

<script lang="ts">
import { useRoute } from 'vue-router';
import { defineComponent, onMounted, reactive, Ref, ref, watch } from 'vue';

import { useVuelidate } from '@vuelidate/core';

import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { GetGendersService } from '../services/getGenders.service';
import { GetRelationshipsService } from '../services/getRelationships.service';
import { GetConvocationsGroupsService } from '../services/getConvocationsGroups.service';
import { GetConvocationsDegreesService } from '../services/getConvocationsDegrees.service';
import { GetIdentificationTypesService } from '../services/getIdentificationTypes.service';

const getConvocationsDegreesService = new GetConvocationsDegreesService();
const getIdentificationTypesService = new GetIdentificationTypesService();
const getConvocationsGroupsService = new GetConvocationsGroupsService();
const getRelationshipsService = new GetRelationshipsService();
const getGendersService = new GetGendersService();

export default defineComponent({
  name: 'SelectWithService',
  components: { AppFormField, AppAutocomplete },

  emits: ['selectedOption'],
  props: {
    label: {
      type: String,
      required: true,
    },
    blockQuestion: {
      type: Boolean,
      default: false,
    },
    fieldKey: {
      type: String,
      required: true,
    },
    serviceKey: {
      type: String,
      required: true,
    },
    answer: {
      type: Number,
      required: false,
    },
    isRequired: {
      type: Object,
      default: () => {},
    },
    approvedStep: {
      type: Boolean,
      default: false,
    },
  },

  setup(props, { emit }) {
    const serviceKey = props.serviceKey ?? null;

    const options: Ref<any[]> = ref([]);
    const convocationEnrolId = ref();
    const convocationId = ref();
    const loading = ref(true);
    const route = useRoute();

    const form: any = reactive({
      question: {},
    });
    const v$: any = useVuelidate(
      {
        form: {
          question: props.isRequired,
        },
      },
      { form }
    );

    onMounted(async () => {
      loading.value = true;

      try {
        if (route.params.convocationEnrollId) {
          convocationEnrolId.value = parseInt(route.params.convocationEnrollId.toString(), 10);
          convocationId.value = parseInt(route.params.convocationId.toString(), 10);
        } else if (route.query.convocationEnrollId && route.query.convocationId) {
          convocationEnrolId.value = parseInt(route.query.convocationEnrollId.toString(), 10);
          convocationId.value = parseInt(route.query.convocationId.toString(), 10);
        }

        if (serviceKey == 'genero') {
          await getGenders();
        } else if (serviceKey == 'parentesco') {
          await getRelationships();
        } else if (serviceKey == 'curso_grupos_convocatoria') {
          await getConvocationsGroups();
        } else if (serviceKey == 'tipo_identificacion') {
          await getIdentificationTypes();
        } else if (serviceKey == 'grados_convocatoria') {
          await getConvocationsDegrees();
        }

        if (props.answer) {
          options.value.forEach((option: any) => {
            if (option.id == props.answer || option.name == props.answer) {
              form.question = option;
            }
          });
        }
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const getRelationships = async () => {
      options.value = await getRelationshipsService.run();
    };
    const getGenders = async () => {
      options.value = await getGendersService.run();
    };
    const getIdentificationTypes = async () => {
      options.value = await getIdentificationTypesService.run();
    };
    const getConvocationsDegrees = async () => {
      options.value = await getConvocationsDegreesService.run(convocationId.value);
    };
    const getConvocationsGroups = async () => {
      options.value = await getConvocationsGroupsService.run(convocationId.value, convocationEnrolId.value);

      options.value.forEach((group: any) => {
        group['name'] = group.GroupName + ' - ' + group.degreeName;
      });
    };

    watch(
      () => form.question,
      async (value) => {
        let selectedOption: any = {
          key: props.fieldKey,
          value: value ?? null,
        };

        emit('selectedOption', selectedOption);
      }
    );

    return {
      loading,
      v$,

      options,
    };
  },
});
</script>

<style scoped></style>
