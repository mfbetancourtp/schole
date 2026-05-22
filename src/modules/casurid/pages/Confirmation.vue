<template>
  <div class="h-100 d-flex flex-column align-items-center justify-content-center">
    <AppLoading></AppLoading>
    <span class="mt-1 lead">Realizando la confirmación del usuario</span>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted} from 'vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import {useRoute, useRouter} from 'vue-router';
import {ConfirmRegistrationService} from '../services/confirmRegistration.service';

const confirmRegistrationService = new ConfirmRegistrationService();

export default defineComponent({
  name: 'Confirmation',
  components: {AppLoading},
  setup() {
    const route = useRoute();
    const router = useRouter();
    const token = route.query.token as string;

    onMounted(async () => {
      try {
        await confirmRegistrationService.run(token);
      } catch (e) {
      }

      await router.push('/');
    });
  },
});
</script>

<style scoped>

</style>