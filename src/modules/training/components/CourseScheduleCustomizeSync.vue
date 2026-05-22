<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <div class="form-row">
          <AppFormField :form-control="v$.form.forceCreationCourse" :label="'Forzar la creación del curso'" class="form-check form-switch">
            <input v-model="v$.form.forceCreationCourse.$model" id="forceCreationCourse" class="form-check-input" type="checkbox" />
          </AppFormField>

          <AppFormField :form-control="v$.form.forceCreationUsers" :label="'Forzar la creación de los usuarios'" class="form-check form-switch">
            <input v-model="v$.form.forceCreationUsers.$model" id="forceCreationUsers" class="form-check-input" type="checkbox" />
          </AppFormField>
        </div>
      </template>

      <template v-slot:actions>
        <AppButton label="core.save"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

import { IGetCourseSynchronizationService } from '../services/getCourseSynchronization.service';

import { GetCourseSynchronizationService } from '../services/getCourseSynchronization.service';

const getCourseSynchronizationService = new GetCourseSynchronizationService();

export default defineComponent({
  name: 'CourseScheduleCustomizeSync',
  components: {
    AppFormModal,
    AppFormField,
    AppButton,
  },

  props: {
    courseId: {
      type: Number,
      required: true,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const title = 'Personalizar sincronización';

    const form = reactive({
      forceCreationUsers: false,
      forceCreationCourse: false,
    });
    const v$ = useVuelidate(
      {
        form: {
          forceCreationUsers: {},
          forceCreationCourse: {},
        },
      },
      { form }
    );

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        const dataSend: IGetCourseSynchronizationService = {
          forceCreationCourse: form.forceCreationCourse ? 1 : 0,
          forceCreationUsers: form.forceCreationUsers ? 1 : 0,
        };

        const response = await getCourseSynchronizationService.run(props.courseId, dataSend);

        emit('close', response.data);
      } catch (e) {
        console.log(e);
      }
    };

    return {
      title,
      save,
      v$,
    };
  },
});
</script>

<style scoped></style>
