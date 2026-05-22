<template>
  <AppLoading v-if="loading"></AppLoading>
  <ConfigureInterfacesForm v-else :title="title" :routes="routes" :data="data" :translations="translation"></ConfigureInterfacesForm>
</template>

<script lang="ts">
import {defineComponent, onMounted, reactive, Ref, ref} from 'vue';
import ConfigureInterfacesForm from '../components/ConfigureInterfacesForm.vue';
import {useRoute} from 'vue-router';
import AppLoading from '../../../shared/components/AppLoading.vue';

//import { InterfacesDto } from '../dtos/configureInterface.dto';

import {GetAllInterfacesByParamsService} from '../services/getAllInterfacesByParams.service';
import {GetAllTranslationsByParamsService} from '../services/getAllTranslationsByParams.service'

const getAllInterfacesByParamsService = new GetAllInterfacesByParamsService();
const getAllTranslationsByParamsService = new GetAllTranslationsByParamsService();
export default defineComponent({
  name: 'ConfigureInterfacesFormEdit',
  components: {AppLoading, ConfigureInterfacesForm},
  setup() {
    const title = 'Editar interfaz';
    const routes = [
      {
        name: 'Administrar interfaces',
        url: {
          name: 'superAdmin.configureInterfaces',
        },
      },
      {
        name: title,
      },
    ];
    const loading = ref(true);
    const data = ref();
    const route = useRoute();
    const translation = ref();

    onMounted(async () => {
      try{
        await getInterfaces();
        await getTranslations();
      } catch (e) {}
      loading.value = false;
    });

    const getInterfaces = async () => {
      let interfaceId = parseInt(route.params.interfaceId.toString());
      let dataResponse = await getAllInterfacesByParamsService.run(interfaceId);
      data.value = dataResponse[0];
    }
    const getTranslations = async () => {
      let interfaceId = parseInt(route.params.interfaceId.toString());
      translation.value = await getAllTranslationsByParamsService.run(interfaceId);
      console.log('traducciones: ',translation.value)
    }
    return {
      translation,
      loading,
      routes,
      title,
      data,
    };
  },
});
</script>

<style scoped>

</style>