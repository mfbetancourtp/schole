<template>
  <div class="container-fluid mt-4">
    <AppBreadCrumbs :routes="routes.value"></AppBreadCrumbs>
    <div v-if="loading">
      <AppLoading></AppLoading>
    </div>
    <div v-else-if="product.value" class="row gy-4">
      <div class="col-12 col-sm-12 col-md-6">
        <h1 class="h5">Detalle</h1>

        <div  >
          <img :src="product.value.thumbnail" :alt="product.value.title">
          <div class="card-body d-flex flex-column gap-2">
            <div class="d-flex flex-column">
              <h1 class="h5 lead">{{ product.value.title }}</h1>
              <p>{{ product.value.description }}</p>

              <span>{{ product.value.subjectName }} - {{ product.value.DegreeName }}</span>
              <div class="d-flex justify-content-between">
              <span>
                Duración: <AppBadge :variant="secondary" :label="`${product.value.validityPeriod} meses`"></AppBadge>
              </span>
                <span class="h4">
                {{ n(product.value.defaultUnitValue, 'currency') }}
              </span>
              </div>
            </div>

            <div class="d-flex justify-content-end">
              <AddToCart class="tw-w-full md:tw-w-1/4" :product="product.value"></AddToCart>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-sm-12 col-md-6">
        <h1 class="h5">Contenidos</h1>

        <div class="d-flex flex-column gap-2">
          <div class="card bg-secondary bg-opacity-25" v-for="content in contents.value" :key="content.id">
            <div class="card-body">
              <h2 class="h6">{{ content.title }}</h2>
              <p>{{ content.description }}</p>
              <a v-if="content.index" :href="content.index" class="btn btn-primary fa-pull-right text-white"
                 target="_blank">
                Ver indice
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, onMounted, reactive, ref} from 'vue';
import {useRoute} from 'vue-router';
import {useI18n} from 'vue-i18n';
import {useMeta} from 'vue-meta';

import AddToCart from '../components/addToCart.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppBreadCrumbs from '../../../shared/components/AppBreadCrumbs.vue';
import {BreadCrumbsType} from '../../../shared/types/breadCrumbs.type';
import {GetProductCatalogueBySlugService} from '../services/getProductCatalogueBySlug.service';


const getProductCatalogueBySlugService = new GetProductCatalogueBySlugService();

export default defineComponent({
  name: 'ProductDetail',
  components: {AppBreadCrumbs, AppLoading, AppIcon, AddToCart, AppBadge},
  setup() {
    const slug = ref('');
    const loading = ref(true);
    const product: { value: any } = reactive({
      value: {},
    });
    const contents = reactive({
      value: {},
    });
    const route = useRoute();
    const {n} = useI18n();

    const routes: { value: BreadCrumbsType[] } = reactive({
      value: [
        {
          name: 'Volver al listado',
          url: '/',
        },
      ],
    });

    const computedMeta = computed(() => ({
      title: product.value.title ?? '',
    }));

    useMeta(computedMeta);

    onMounted(async () => {
      slug.value = route.params.slug.toString();

      try {
        const response = await getProductCatalogueBySlugService.run(slug.value);

        product.value = response.product;
        contents.value = response.contents;

        routes.value.push({
          name: product.value.title,
        });

      } catch (e) {
      }

      loading.value = false;
    });

    return {
      slug,
      loading,
      product,
      contents,
      routes,
      n,
    };
  },
});
</script>

<style scoped>
.card img {
  max-height: 400px;
  object-fit: contain;
}

.blue {
  color: #00b0da;
}
</style>