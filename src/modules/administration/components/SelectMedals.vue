<template>
  <form @submit.prevent="saveMedals">
    <AppFormModal :title="title">
      <template #content>
        <div class="items">
          <template v-for="(medal, index) in medals" :key="index">
            <div class="text-center">
              <img
                :src="medal.urlImage"
                :alt="'Medalla de ' + medal.name"
                style="height: 5rem; width: 5rem; margin: 0 auto"
              />

              <span> {{ medal.name }} </span>

              <div class="d-flex justify-content-center">
                <div class="form-check form-switch">
                  <input
                    v-model="checkedMedals"
                    class="form-check-input"
                    :value="medal.id"
                    :id="`${medal.id}`"
                    type="checkbox"
                    role="switch"
                  />
                </div>
              </div>
            </div>
          </template>
        </div>
      </template>

      <template #actions>
        <AppButton label="core.save" @click="saveMedals()"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';

import { MedalDto } from '../dtos/qualifyActivity.dto';
import { StudentDto } from '../dtos/qualifyActivity.dto';

import { PostActivitiesQualifyService } from '../services/postActivitiesQualify.service';

const postActivitiesQualifyService = new PostActivitiesQualifyService();

export default defineComponent({
  name: 'SelectMedals',
  components: { AppFormModal, AppButton },

  props: {
    activityId: {
      type: Number,
      required: true,
    },
    periodId: {
      type: Number,
      required: true,
    },
    medals: {
      type: Array as PropType<MedalDto[]>,
      required: true,
    },
    students: {
      type: Array as PropType<StudentDto[]>,
      required: true,
    },
    student: {
      type: Object as PropType<StudentDto>,
      required: true,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const { t } = useI18n();
    const title = `Agregar Medallas a ${props.student.name}`;

    const checkedMedals: Ref<any[]> = ref(props.student.medalsIds);

    const saveMedals = async () => {
      props.students.forEach((student) => {
        if (student.userId == props.student.userId) {
          student.medalsIds = checkedMedals.value;
        }
      });

      let dataSend = {
        activityId: props.activityId,
        periodId: props.periodId,
        students: props.students,
      };

      try {
        await postActivitiesQualifyService.run(dataSend);
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      title,
      t,

      checkedMedals,

      saveMedals,
    };
  },
});
</script>

<style scoped>
.items {
  display: grid;
  gap: 0.7rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 10rem), 1fr));
}
</style>
