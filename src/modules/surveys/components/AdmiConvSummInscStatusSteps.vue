<template>
  <AppFormModal :title="title">
    <template #content>
      <AppLoading v-if="loading"></AppLoading>

      <div v-else class="row">
        <div class="col border h5 text-center m-0">
          Estado de los pasos
        </div>

        <div v-for="step, index in enrol.statusSteps" :key="index">
          <div class="row border border-top-0">  
            <div class="col" style="background-color: #eee;">
              Paso {{ index + 1 }}: {{ step.convocationStepName }}
            </div>

            <div class="col-1 d-flex align-items-center justify-content-center">
              <AppIcon
                v-if="step.status == 'approved'"
                style="font-size: 1.2rem;"
                v-tooltip="'Aprobado'"
                class="text-success"
                icon="check-circle"
              ></AppIcon>

              <AppIcon
                v-else-if="step.status == 'reproved'"
                style="font-size: 1.2rem;"
                v-tooltip="'Rechazado'"
                class="text-danger"
                icon="times-circle"
              ></AppIcon>

              <AppIcon
              v-else-if="step.status == 'pending'"
                v-tooltip="'Pendiente'"
                style="font-size: 1.2rem;"
                icon="minus-circle"
              ></AppIcon>
            </div>
          </div>
        </div>
      </div>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, ref, Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from "../../../shared/components/AppLoading.vue";
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';

import { ConvocationStepDto } from '../dtos/convocationStep.dto';
import { convocationEnrolDto, StatusStepDto } from "../dtos/convocationEnrol.dto";

export default defineComponent({
  name: 'AdmiConvSummInscStatusSteps',
  components: { AppFormModal, AppIcon, AppLoading },

  props: {
    enrol: {
      type: Object as PropType<convocationEnrolDto>,
      required: true,
    },
    steps: {
      type: Array as PropType<ConvocationStepDto[]>,
      required: true,
    },
  },

  setup(props) {
    const { t } = useI18n();
    const title = `Aspirante: "${props.enrol.nameEnrol}"`;
    const stepTypes: any = { 1: 'Formulario', 2: 'Cobro', 3: 'Documento', 4: 'Adjunto' };

    // const enrol: Ref<convocationEnrolDto> = ref(props.enrol);

    const loading = ref(true);

    onMounted(async () => {
      try {
        props.enrol.statusSteps.forEach((statusStep: StatusStepDto) => {
          props.steps.forEach(step => {
            if (statusStep.convocationStepId == step.id) {
              statusStep.convocationStepName = stepTypes[step.convocationStepTypeId];
              statusStep.convocationStepName += ` - ${step.title}`;
            }
          });
        });
      } catch (e) {console.log(e)}

      loading.value = false;
    });

    return {
      loading,
      title,
      t,
    };
  },
});
</script>

<style scoped>

</style>