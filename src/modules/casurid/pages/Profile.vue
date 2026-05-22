<template>
  <AppLoading v-if="loading"></AppLoading>
  <institutionsForm v-else :title="title" :from-profile="true" :data="data.value"></institutionsForm>
</template>

<script lang="ts">
import {defineComponent, onMounted, reactive, ref} from 'vue';

import InstitutionsForm from '../components/institutionsForm.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';

import {GetProfileService} from '../services/getProfile.service';
// import {GetInstitutionByIdService} from '../services/getInstitutionById.service';
import {InstitutionsService} from '../../../shared/services/institutions.service';

// const getInstitutionByIdService = new GetInstitutionByIdService();
const institutionsService = new InstitutionsService();
const getProfileService = new GetProfileService();

export default defineComponent({
  name: 'Profile',
  components: {AppLoading, InstitutionsForm},
  setup() {
    const title = 'Mi Perfil';
    const loading = ref(true);
    const data = reactive({
      value: null,
    });

    onMounted(async () => {
      const institution = institutionsService.getSelectedInstitution();

      if (institution) {
        // data.value = await getInstitutionByIdService.run(institution.id.toString());
        data.value = await getProfileService.run();
        loading.value = false;
      }
    });

    return {
      title,
      loading,
      data,
    };
  },
});
</script>

<style scoped>

</style>