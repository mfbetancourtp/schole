<template>
  <AppFormModal :title="title" @closed="emit('close')">
    <template #content>
      <AppLoading v-if="loading"></AppLoading>

      <template v-else>
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Grado</th>
                <th>Cupo</th>
                <th>Inscritos</th>
                <th>Matriculados</th>
                <th>Descripción</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(item, index) in enrollmentInfo" :key="index">
                <td class="align-middle">{{ item.degree }}</td>
                <td class="align-middle align-self-end text-center">
                  {{ item.quotaConvocation }}
                </td>
                <td class="align-middle align-self-end text-center">
                  {{ item.countInscriptionsConvocationForDegree }}
                </td>
                <td class="align-middle align-self-end text-center">
                  {{ item.countMatriculatesConvocationForDegree }}
                </td>
                <template v-if="'existStepsDegreeConvocation' in item && !item.existStepsDegreeConvocation">
                  <td>asegúrate de que haya al menos un paso que requiera aprobación.</td>
                </template>

                <template v-else-if="'stateStudentsMatriculateConvocation' in item && typeof item.stateStudentsMatriculateConvocation === 'string'">
                  <td>{{ item.stateStudentsMatriculateConvocation }}</td>
                </template>
                <template v-else-if="'stateStudentsMatriculateConvocation' in item && Array.isArray(item.stateStudentsMatriculateConvocation)">
                  <td>
                    <template v-for="(item2, index2) in item.stateStudentsMatriculateConvocation" :key="index2">
                      <p class="mb-0">
                        {{ item2.convocationEnrolName }}:
                        <template v-if="item2.convocationEnrolMatriculateId === null && !item2.matriculateByConvocation">
                          <span class="badge rounded-pill text-bg-dark bg-dark"> Pre-matriculado</span>
                        </template>

                        <template v-else-if="item2.convocationEnrolMatriculateId === null && item2.stateMatriculateConvocation === null">
                          <span class="badge rounded-pill text-bg-danger bg-danger"> No Matriculado</span>
                        </template>

                        <template v-else-if="typeof item2.convocationEnrolMatriculateId == 'number' && item2.stateMatriculateConvocation === true">
                          <span
                            class="badge rounded-pill"
                            :style="{
                              backgroundColor: '#00b0da',
                              color: '#fff',
                            }"
                          >
                            Matriculado</span
                          >
                        </template>

                        <template v-else-if="item2.convocationEnrolMatriculateId === null && !item2.stateMatriculateConvocation">
                          <span class="badge rounded-pill text-bg-dark bg-dark"> Pre-matriculado</span>
                        </template>
                      </p>

                      <hr v-if="index2 < item.stateStudentsMatriculateConvocation.length - 1" class="mt-1 mb-1" style="color: #999" />
                    </template>
                  </td>
                </template>

                <template v-else>
                  <td>---</td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { PropType, defineComponent, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';

export default defineComponent({
  name: 'ACSIEnrollStudentsModal',

  components: { AppFormModal, AppLoading },

  props: {
    enrollmentInformation: {
      type: Array as PropType<any[]>,
      required: true,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const { t } = useI18n();
    const title = 'Información detallada de la matrícula de estudiantes';
    const enrollmentInfo = props.enrollmentInformation ?? [];

    const loading = ref(true);

    onMounted(async () => {
      try {
        console.log('enrollmentInfo', enrollmentInfo);
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    return {
      loading,
      title,
      emit,
      t,

      enrollmentInfo,
    };
  },
});
</script>

<style scoped>
.table-container {
  max-height: 23rem;
  overflow-y: scroll;
}
</style>
