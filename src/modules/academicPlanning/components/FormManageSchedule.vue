<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <div class="form-row">
          <AppFormField :form-control="v$.form.dayWeek" label="Día de la semana">
            <AppAutocomplete :options="weekDays" :input-id="'dayWeek'" v-model="v$.form.dayWeek.$model" label="label"></AppAutocomplete>
          </AppFormField>

          <AppFormField :form-control="v$.form.startTime" label="Desde">
            <input v-model="v$.form.startTime.$model" id="startTime" class="form-control" type="time" />
          </AppFormField>

          <AppFormField :form-control="v$.form.endTime" label="Hasta">
            <input v-model="v$.form.endTime.$model" id="endTime" class="form-control" type="time" />
          </AppFormField>
        </div>

        <AppFormField :form-control="v$.form.courseId" label="core.generalTerms.academic.subject.singular">
          <AppAutocomplete :options="courses" :input-id="'courseId'" v-model="v$.form.courseId.$model"></AppAutocomplete>
        </AppFormField>

        <div v-if="crossScheduling" class="d-flex align-items-center gap-1">
          <AppIcon icon="info-circle" class="text-muted" />
          <span class="text-muted">Hay un posible cruce de horario</span>
        </div>
      </template>

      <template v-slot:actions>
        <AppButton v-if="currentSchedule?.id" @click="deleteSchedule(currentSchedule?.id)" label="core.delete" nativeType="button" outlined></AppButton>

        <AppButton label="core.save"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, PropType, reactive, ref,Ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { useRoute } from 'vue-router';

import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { ScheduleDto, CourseDto, WeekDayDto } from '../dtos/schedule.dto';

import { CreateOrUpdateScheduleService } from '../services/createOrUpdateSchedule.service';
import { GetUserToEditByIdService } from '../../access/services/getUserToEditById.service';
import dayjs from 'dayjs';
import { Console } from 'console';

const createOrUpdateScheduleService = new CreateOrUpdateScheduleService();
const getUserToEditByIdService = new GetUserToEditByIdService();

export default defineComponent({
  name: 'FormManageSchedule',
  components: {
    AppFormModal,
    AppButton,
    AppFormField,
    AppAutocomplete,
    AppIcon,
  },

  props: {
    courses: {
      type: Array as PropType<CourseDto[]>,
      default() {
        return [];
      },
    },
    weekDays: {
      type: Array as PropType<WeekDayDto[]>,
      default() {
        return [];
      },
    },
    schedule: {
      type: Array as PropType<any[]>,
      default() {
        return [];
      },
    },
    currentSchedule: {
      type: Object as PropType<ScheduleDto | null>,
      default: null,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const currentSchedule: any = props.currentSchedule ?? null;
    const title = props.currentSchedule?.id ? 'Editar Horario' : 'Nuevo Horario';

    const crossScheduling = ref(false);
    const service: Ref<any[]> = ref([]);
    const route = useRoute();
    const userId = ref();

    const form = reactive({
      dayWeek: currentSchedule?.dayWeek ?? 0,
      startTime: currentSchedule?.startTime ?? null,
      endTime: currentSchedule?.endTime ?? null,
      courseId: currentSchedule?.courseId ?? null,
      
    });
    const v$ = useVuelidate(
      {
        form: {
          dayWeek: { required },
          startTime: { required },
          endTime: { required },
          courseId: { required },
        },
      },
      { form }
    );

    const scheduleCrossover = async (form: any) => {
      crossScheduling.value = false;
      const schedule = currentSchedule?.id ? props.schedule.filter((item: any) => item.id != currentSchedule.id) : props.schedule;

      schedule.forEach((schedule: any) => {
    if (!crossScheduling.value) {
        if (schedule.extendedProps.schedule.dayWeek == form.dayWeek && schedule.extendedProps.schedule.dayWeek) {
            // Añadir ":00" si los segundos no están presentes en startTime y endTime
            const scheduleStartTime = schedule.extendedProps.schedule.startTime.split(':').length === 2 
                ? schedule.extendedProps.schedule.startTime + ":00" 
                : schedule.extendedProps.schedule.startTime;
            const scheduleEndTime = schedule.extendedProps.schedule.endTime.split(':').length === 2
                ? schedule.extendedProps.schedule.endTime + ":00" 
                : schedule.extendedProps.schedule.endTime;
            const formStartTime = form.startTime.split(':').length === 2 
                ? form.startTime + ":00" 
                : form.startTime;
            const formEndTime = form.endTime.split(':').length === 2 
                ? form.endTime + ":00" 
                : form.endTime;

            // Crear los objetos dayjs asegurando que el formato sea HH:mm:ss
            const scheduleStart = dayjs('1970-01-01 ' + scheduleStartTime, 'YYYY-MM-DD HH:mm:ss');
            const scheduleEnd = dayjs('1970-01-01 ' + scheduleEndTime, 'YYYY-MM-DD HH:mm:ss');
            const formStart = dayjs('1970-01-01 ' + formStartTime, 'YYYY-MM-DD HH:mm:ss');
            const formEnd = dayjs('1970-01-01 ' + formEndTime, 'YYYY-MM-DD HH:mm:ss');

            // Formatear las horas para que incluyan los segundos
            const formattedScheduleStart = scheduleStart.format('HH:mm:ss');
            const formattedScheduleEnd = scheduleEnd.format('HH:mm:ss');
            const formattedFormStart = formStart.format('HH:mm:ss');
            const formattedFormEnd = formEnd.format('HH:mm:ss');

            // Realizar las comparaciones utilizando los objetos dayjs originales
            if (formStart.isAfter(formattedScheduleStart) && formStart.isBefore(formattedScheduleEnd)) {
                crossScheduling.value = true;
            }
            if (formEnd.isAfter(formattedFormStart) && formEnd.isBefore(formattedFormEnd)) {
                crossScheduling.value = true;
            }
        }
    }
});
return crossScheduling.value;
    };

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;
      if (await scheduleCrossover(form)) return;

      try {
        userId.value = parseInt(route.params.userId.toString());
        const userData = await getUserToEditByIdService.run(parseInt(userId.value));
        service.value = [userData]
       
        
        
        const params = {
          dayWeek: form.dayWeek,
          startTime: form.startTime,
          endTime: form.endTime,
          courseId: form.courseId,
          teacherPeopleId: service.value[0].people.id,
          academicPeriodGroupId : Number(route.params.academicPeriodGroupId) ,
          change: 1,
        };


        await createOrUpdateScheduleService.run(params, currentSchedule?.id);
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    const deleteSchedule = (id: any) => {
      emit('close', id);
    };

    return {
      crossScheduling,
      deleteSchedule,
      title,
      save,
      v$,
    };
  },
});
</script>

<style scoped></style>
