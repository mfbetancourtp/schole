<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppLoading v-if="loading"></AppLoading>

        <template v-else>
          <template v-if="!course.sameMunicipality">
            <p>¿Como planeas llegar a {{ course.meetingMunicipalityName }}?</p>

            <div class="form-row">
              <AppFormField :form-control="v$.form.transportType" label="Medio de trasporte">
                <AppAutocomplete v-model="v$.form.transportType.$model" :options="transportTypes" label="label"></AppAutocomplete>
              </AppFormField>

              <AppFormField :form-control="v$.form.departureValue" label="Valor ida">
                <input class="form-control" type="number" v-model="v$.form.departureValue.$model" />
              </AppFormField>
            </div>

            <div class="form-row">
              <AppFormField :form-control="v$.form.returnValue" label="Valor regreso">
                <input class="form-control" type="number" v-model="v$.form.returnValue.$model" />
              </AppFormField>

              <AppFormField :form-control="v$.form.hotelUnitValue" label="Valor hospedaje diario">
                <input class="form-control" type="number" id="religion" v-model="v$.form.hotelUnitValue.$model" />
              </AppFormField>

              <div class="col-3">
                <div class="d-flex justify-content-end">
                  <span>Subtotal</span>
                </div>

                <div class="d-flex justify-content-end align-items-end">
                  <h5 class="m-0">
                    {{ n(getTotal(v$.form.departureValue.$model, v$.form.returnValue.$model, v$.form.hotelUnitValue.$model), 'currency') }}
                  </h5>
                </div>
              </div>
            </div>

            <div class="form-row">
              <AppFormField :form-control="v$.form.employeeContribution" label="Aporte con recursos propios">
                <input class="form-control" type="number" v-model="v$.form.employeeContribution.$model" />
              </AppFormField>

              <AppFormField :form-control="v$.form.companyContribution" label="Aporte empresa">
                <input disabled class="form-control" type="number" v-model="v$.form.companyContribution.$model" />
              </AppFormField>
            </div>

            <hr />
          </template>

          <template v-if="!course.courseInscriptionId">
            <p class="mb-0">Este proceso es irreversible. ¿Confirmas que deseas inscribirte al curso?</p>
          </template>
        </template>
      </template>

      <template v-slot:actions>
        <AppButton :label="!course.courseInscriptionId ? 'Inscribirse' : 'core.save'"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, onMounted, PropType, reactive, Ref, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { CourseDto } from '../dtos/courseSchedule.dto';

import { GetTravelExpensesParamService } from '../services/getTravelExpensesParam.service';
import { PostCourseInscFromArrayService } from '../services/postCourseInscFromArray.service';
import { GetTravelExpensesInformationService } from '../services/getTravelExpensesInformation.service';
import { PostTravelExpensesCourseInscriptionService } from '../services/postTravelExpensesCourseInscription.service';

const postTravelExpensesCourseInscriptionService = new PostTravelExpensesCourseInscriptionService();
const getTravelExpensesInformationService = new GetTravelExpensesInformationService();
const postCourseInscFromArrayService = new PostCourseInscFromArrayService();
const getTravelExpensesParamService = new GetTravelExpensesParamService();

export default defineComponent({
  name: 'CourseScheduleEmployeForm',
  components: {
    AppAutocomplete,
    AppFormModal,
    AppFormField,
    AppLoading,
    AppButton,
  },

  props: {
    course: {
      type: Object as PropType<CourseDto>,
      required: true,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const { t, n } = useI18n();
    const title = 'Inscripción al curso';

    const transportTypes: Ref<any[]> = ref([]);

    const loading = ref(true);

    const form = reactive({
      isApproved: 0,
      transportType: null,
      departureValue: 0,
      returnValue: 0,
      hotelUnitValue: 0,
      employeeContribution: 0,
      companyContribution: 0,
    });
    const v$ = useVuelidate(
      {
        form: {
          isApproved: {},
          transportType: { required },
          departureValue: { required },
          returnValue: { required },
          hotelUnitValue: { required },
          employeeContribution: { required },
          companyContribution: { required },
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        const data = await getTravelExpensesInformationService.run(props.course.id);

        transportTypes.value = data.transportType;

        transportTypes.value.forEach((transportType) => (transportType.id = transportType.label));

        if (props.course.travelExpenseId) {
          const travelExpense = await getTravelExpensesParamService.run(props.course.travelExpenseId);

          form.isApproved = 0; //no me retorna este campo el endpoint
          form.companyContribution = travelExpense.companyContribution;

          form.transportType = travelExpense.transportType;
          form.departureValue = travelExpense.departureValue;
          form.returnValue = travelExpense.departureValue;
          form.hotelUnitValue = travelExpense.hotelUnitValue;
          form.employeeContribution = travelExpense.employeeContribution;
        }
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const getTotal = (departureValue: number, returnValue: number, hotelUnitValue: number) => {
      let total = 0;

      if (departureValue) total += departureValue;
      if (hotelUnitValue) total += hotelUnitValue;
      if (returnValue) total += returnValue;

      return total;
    };

    const save = async () => {
      if (!props.course.sameMunicipality) {
        const formIsValid = await v$.value.$validate();
        if (!formIsValid) return;
      }

      try {
        if (!props.course.courseInscriptionId && props.course.sameMunicipality) {
          const userLS: any = JSON.parse(localStorage.getItem('user') ?? '{}');
          const userId = userLS.id;

          const dataSend = {
            courseId: props.course.id,
            courseInscriptions: [{ userId: userId, employeeId: null }],
          };

          await postCourseInscFromArrayService.run(dataSend);
        }

        if ((!props.course.courseInscriptionId && !props.course.sameMunicipality) || props.course.travelExpenseId) {
          const userLS: any = JSON.parse(localStorage.getItem('user') ?? '{}');
          const originMunicipalityId = userLS.people.homeMunicipalityId;

          const dataSend = {
            id: props.course.travelExpenseId,
            courseInscriptionId: props.course.courseInscriptionId,
            departureDate: props.course.startDate,
            originMunicipalityId: originMunicipalityId,
            destinationMunicipalityId: props.course.meetingMunicipalityId,
            returnDate: props.course.endDate,

            isApproved: form.isApproved,
            companyContribution: form.companyContribution,
            departureValue: form.departureValue,
            returnValue: form.returnValue,
            transportType: form.transportType,
            hotelUnitValue: form.hotelUnitValue,
            employeeContribution: form.employeeContribution,
          };

          await postTravelExpensesCourseInscriptionService.run(props.course.id, dataSend);
        }

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
      t,
      n,

      transportTypes,

      getTotal,
    };
  },
});
</script>

<style scoped></style>
