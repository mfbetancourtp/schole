<template>
  <AppLoading v-if="loading"></AppLoading>
  <SalesForm v-else :title="title" :routes="routes" :data="data.value"></SalesForm>
</template>

<script lang="ts">
import {defineComponent, onMounted, reactive, ref} from 'vue';
import SalesForm from '../components/SalesForm.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import {GetSaleByIdService} from '../services/getSaleById.service';
import {useRoute} from 'vue-router';

const getSaleByIdService = new GetSaleByIdService();

export default defineComponent({
  name: 'SalesEdit',
  components: {AppLoading, SalesForm},
  setup() {
    const title = 'Editar venta';
    const routes = [
      {
        name: 'Ventas',
        url: {
          name: 'casurid.salesList',
        },
      },
      {
        name: title,
      },
    ];
    const loading = ref(true);
    const route = useRoute();
    const data: { value: any | null } = reactive({
      value: null,
    });

    onMounted(async () => {
      data.value = await getSaleByIdService.run(parseInt(route.params.saleId.toString()));
      loading.value = false;
    });

    return {
      title,
      routes,
      loading,
      data,
    };
  },
});
</script>

<style scoped>

</style>