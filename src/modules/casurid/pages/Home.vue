<template>
  <div class="container-fluid mt-4">
    <div class="row">
      <div class="col-12 col-md-8 col-lg-6 offset-md-2 offset-lg-3">
        <div class="input-group mb-3">
          <span class="input-group-text" id="basic-addon1">
            <AppIcon icon="search"></AppIcon>
          </span>
          <input
            type="text"
            placeholder="Buscar un contenido..."
            class="form-control"
            v-model="searchValue"
            pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
            title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
          />
          <button class="input-group-text btn btn-primary d-flex text-white" id="basic-addon2" @click="showFilters = !showFilters">
            <AppIcon icon="filter" class="me-2"></AppIcon>
            <span class="d-none d-md-block"> Búsqueda Avanzada </span>
          </button>
        </div>
      </div>

      <Transition name="slide-fade">
        <div v-show="showFilters">
          <AppLoading v-if="loadingFilters"></AppLoading>
          <CatalogFilters v-else :levels="levels" :areas="areas" @changeFilters="changeFilters"></CatalogFilters>
        </div>
      </Transition>

      <div class="col-12 mt-4">
        <div class="row g-3">
          <AppLoading v-if="loadingProducts"></AppLoading>
          <template v-else>
            <div class="col-12 col-md-4 col-lg-3" v-for="product in productsCatalogue" :key="product.id">
              <div class="card product-catalogue card-hover">
                <div class="container-img d-flex">
                  <img class="card-img-top img-product" :src="product.thumbnail" :alt="product.title" />
                </div>
                <div class="card-body d-flex flex-column gap-2">
                  <div class="d-flex flex-column">
                    <h1 class="h5 lead">{{ product.title }}</h1>
                    <span>{{ product.subjectName }}</span>
                    <span>{{ product.DegreeName }}</span>
                    <span>Duración:<AppBadge :variant="secondary" :label="`${product.validityPeriod} meses`"></AppBadge></span>
                  </div>

                  <div class="row g-2 align-items-center">
                    <div class="col-12 col-md-6 col-lg-4">
                      <AddToCart :product="product"></AddToCart>
                    </div>

                    <div class="col-12 col-md-6 col-lg-8">
                      <div class="d-grid d-md-flex justify-content-md-end align-items-md-center">
                        <router-link :to="`/detail/${product.slug}`" class="btn btn-primary text-white btn-detail"> Ver detalle </router-link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppIcon from '@/shared/components/AppIcon.vue';
import { CatalogueRelatedDataService } from '../services/catalogueRelatedData.service';
import AppBadge from '../../../shared/components/AppBadge.vue';
import { LevelDto } from '../dtos/level.dto';
import { AreaDto } from '../dtos/area.dto';
import { SearchProductsCatalogueService } from '../services/searchProductsCatalogue.service';
import { ProductCatalogueDto } from '../dtos/productCatalogue.dto';
import CatalogFilters from '../components/CatalogFilters.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import { debounce } from 'ts-debounce';
import AddToCart from '../components/addToCart.vue';
import { FiltersType } from '../types/filters.type';

const catalogueRelatedDataService = new CatalogueRelatedDataService();
const searchProductsCatalogueService = new SearchProductsCatalogueService();

interface IHome extends FiltersType {
  showFilters: Boolean;
  levels: LevelDto[];
  areas: AreaDto[];
  loadingFilters: boolean;
  productsCatalogue: ProductCatalogueDto[];
  searchValue: string;
  loadingProducts: boolean;
  page: number;
  perPage: number;
}

export default defineComponent({
  name: 'HomePage',
  components: {
    AddToCart,
    CatalogFilters,
    AppIcon,
    AppLoading,
    AppBadge,
  },
  data(): IHome {
    return {
      showFilters: false,
      levels: [],
      areas: [],
      loadingFilters: true,
      loadingProducts: true,
      productsCatalogue: [],
      currentLevels: [],
      currentDegrees: [],
      currentAreas: [],
      currentSubjects: [],
      searchValue: '',
      page: 1,
      perPage: 50,
    };
  },
  watch: {
    searchValue() {
      this.searchProducts();
    },
  },
  async mounted() {
    this.loadingFilters = true;
    this.searchValue = this.$route.query.search?.toString() ?? '';

    const relatedData = await catalogueRelatedDataService.run();

    this.levels = relatedData.levels;

    this.areas = relatedData.areas;

    // @ts-ignore
    this.searchProducts = debounce(this.searchProducts, 600);

    this.loadingFilters = false;
  },
  methods: {
    changeFilters(filters: FiltersType) {
      this.currentLevels = filters.currentLevels;
      this.currentDegrees = filters.currentDegrees;
      this.currentAreas = filters.currentAreas;
      this.currentSubjects = filters.currentSubjects;

      this.searchProducts();
    },
    async searchProducts() {
      this.loadingProducts = true;

      if (this.searchValue && this.searchValue != '') {
        await this.$router.push({
          query: {
            ...this.$route.query,
            search: this.searchValue,
          },
        });
      } else {
        const query = this.$route.query;
        delete query.search;

        await this.$router.push({
          query,
        });
      }

      const response = await searchProductsCatalogueService.run({
        page: this.page,
        perPage: this.perPage,
        levelsIds: this.currentLevels,
        degreesIds: this.currentDegrees,
        areasIds: this.currentAreas,
        subjectsIds: this.currentSubjects,
        search: this.searchValue,
      });

      this.productsCatalogue = response.data;

      this.loadingProducts = false;
    },
  },
});
</script>

<style scoped>
/*
  Enter and leave animations can use different
  durations and timing functions.
*/
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translate(-20px);
  opacity: 0;
}

.input-group {
  height: 48px;
}

.container-img {
  height: 250px;
}

.img-product {
  max-height: 250px;
  object-fit: contain;
}

.product-catalogue {
  min-height: 460px;
}

.btn-detail {
  height: 40px;
}
</style>
