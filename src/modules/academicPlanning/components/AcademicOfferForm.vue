<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :form-control="v$.form.journeyId" label="core.generalTerms.academic.journey.singular">
          <v-select
            input-id="journeyId"
            v-bind:class="{ disabled: disabledSelect }"
            v-model="v$.form.journeyId.$model"
            :reduce="(journey: any) => journey.id"
            :options="journeys"
            label="name"
            @update:modelValue="handleJourneysChange(v$.form.journeyId.$model)"
          ></v-select>
        </AppFormField>

        <AppFormField :form-control="v$.form.levelId" label="core.generalTerms.academic.level.singular">
          <v-select
            input-id="levelId"
            v-bind:class="{ disabled: disabledSelect }"
            @option:selected="loadDegrees()"
            :reduce="(level:any) => level.id"
            v-model="v$.form.levelId.$model"
            :options="levels"
            label="name"
          ></v-select>
        </AppFormField>

        <AppFormField :form-control="v$.form.degreeId" label="core.generalTerms.academic.degree.singular">
          <v-select input-id="degreeId" v-model="v$.form.degreeId.$model" :reduce="(degree: any) => degree.id" :options="degrees.value" label="name"></v-select>
        </AppFormField>
        <AppFormField :form-control="v$.form.groupsId" label="core.generalTerms.academic.group.plural">
          <v-select input-id="group-id" v-model="v$.form.groupsId.$model" :reduce="(group: any) => group.id" :options="groups" label="name" multiple></v-select>
        </AppFormField>
        <AppFormField :form-control="v$.form.quota" label="Cupo">
          <input class="form-control" type="number" id="quota" v-model="v$.form.quota.$model" />
        </AppFormField>
        <AppFormField :form-control="v$.form.playTimeIds" label="core.generalTerms.academic.playTimes.plural">
          <v-select input-id="playTime-ids" v-model="v$.form.playTimeIds.$model" :reduce="(playTime: any) => playTime.id" :options="playTimes" label="name" multiple></v-select>
        </AppFormField>
      </template>

      <template v-slot:actions>
        <AppButton>Guardar</AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import { DegreeDto } from '../../../shared/dto/degree.dto';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import { AcademicPeriodGroupsRelatedDataFormDto } from '../dtos/academicPeriodGroupsRelatedDataForm.dto';

import { CreateOrUpdateAcademicPeriodGroupsService } from '../services/createOrUpdateAcademicPeriodGroups.service';
import { GetAcademicPeriodGroupsRelatedDataFormService } from '../services/getAcademicPeriodGroupsRelatedDataForm.service';

const createOrUpdateAcademicPeriodGroupsService = new CreateOrUpdateAcademicPeriodGroupsService();
const getAcademicPeriodGroupsRelatedDataFormService = new GetAcademicPeriodGroupsRelatedDataFormService();

export default defineComponent({
  name: 'AcademicOfferForm.',
  components: { AppFormModal, AppButton, AppFormField },

  emits: ['close'],
  props: ['relatedDataForm', 'academicPeriod', 'academicPeriodGroupId'],

  setup(props, { emit }) {
    const { t } = useI18n();
    let title = 'core.new core.menu.academicOffer';
    const relatedDataForms: {
      value: AcademicPeriodGroupsRelatedDataFormDto | any;
    } = reactive({
      value: null,
    });

    const disabledSelect = !!props.academicPeriod?.journeyId;
    const journeys = ref([]);
    const levels = ref([]);
    const groups = ref([]);
    const playTimes = ref([]);

    const form = reactive({
      levelId: props.academicPeriod?.levelId,
      degreeId: props.academicPeriod?.degreeId,
      groupsId: props.academicPeriod?.groupsId,
      playTimeIds: props.academicPeriod?.playTimeIds,
      journeyId: props.academicPeriod?.journeyId,
      academicPeriodId: props.academicPeriodGroupId,
      quota: props.academicPeriod?.quota,
    });
    const v$ = useVuelidate(
      {
        form: {
          levelId: { required },
          degreeId: { required },
          groupsId: { required },
          playTimeIds: { required },
          journeyId: { required },
          quota: { required },
          academicPeriodId: {},
        },
      },
      { form }
    );

    const degrees: { value: DegreeDto[] } = reactive({
      value: [],
    });

    onMounted(async () => {
      try {
        loadDegrees();
        await getRelatedDataForm();
      } catch (e) {
        console.log(e);
      }
    });

    const handleJourneysChange = async (item: number) => {
      const params = { journeyId: item };
      relatedDataForms.value = await getAcademicPeriodGroupsRelatedDataFormService.run(params);
      playTimes.value = relatedDataForms.value.playTimes;
    };

    const getRelatedDataForm = async () => {
      relatedDataForms.value = await getAcademicPeriodGroupsRelatedDataFormService.run();
      journeys.value = relatedDataForms.value.journeys;
      levels.value = relatedDataForms.value.levels;
      groups.value = relatedDataForms.value.groups;
      //  console.log("journeys", journeys);
      console.log('journeys', relatedDataForms.value);
    };

    const save = async () => {
      const formIsValid = await v$.value.$validate();

      if (!formIsValid) return;

      try {
        await createOrUpdateAcademicPeriodGroupsService.run(form);
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    const loadDegrees = () => {
      if (form.levelId) {
        let degreesAux: any[] = props.relatedDataForm.degrees;

        degrees.value = [];
        form.degreeId = '';

        degreesAux.forEach((degree: DegreeDto) => {
          if (form.levelId == degree.levelId) {
            degrees.value.push(degree);
          }
        });
      } else {
        degrees.value = props.relatedDataForm.degrees;
      }
    };

    return {
      t,
      title,
      save,
      v$,

      disabledSelect,
      journeys,
      degrees,
      groups,
      playTimes,
      levels,

      loadDegrees,
      handleJourneysChange,
    };
  },
});
</script>

<style scoped>
.disabled {
  pointer-events: none;
  color: #bfcbd9;
  cursor: not-allowed;
  background-image: none;
  background-color: #eef1f6;
  border-color: #d1dbe5;
}
</style>
