<template>
  <AppButton variant="secondary" label="core.saveAndExit" @click="saveAndExit()"></AppButton>
</template>

<script lang="ts">
import { useRouter } from 'vue-router';
import { defineComponent, PropType } from 'vue';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import type { RouteLocationRaw } from 'vue-router';

import { SendNotificationOfficialService } from '../services/sendNotificationOfficial.service';

const sendNotificationOfficialService = new SendNotificationOfficialService();

export default defineComponent({
  name: 'SaveAndExitStep',
  components: { AppButton },

  props: {
    routeBack: {
      type: [String, Object] as PropType<string | RouteLocationRaw>,
      default: 'surveys.userConvocations.registration',
    },
    convocationEnrolId: {
      type: String,
      required: true,
    },
    convocationStepId: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const router = useRouter();

    const saveAndExit = async () => {
      const params = {
        convocationEnrolId: props.convocationEnrolId,
        convocationStepId: props.convocationStepId,
      };

      await sendNotificationOfficialService.run(params);

      if (typeof props.routeBack === 'string') {
        await router.push({ name: props.routeBack });
        return;
      }

      await router.push(props.routeBack);
    };

    return { saveAndExit };
  },
});
</script>
