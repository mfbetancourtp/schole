<template>
  <AppBaseList
      :title="title"
      :routes="routes"
  >
    <template v-slot:content>
      <div class="mt-4">
        <AppDatatable :name="name" :service="getShoppingService" :params="params">
          <template v-slot:filters>
            <AppFilter v-model="levelId" :filter-name="`${name}.levelId`">
              <label for="levelId">Nivel</label>
              <v-select
                  inputId="levelId"
                  v-model="levelId"
                  :options="levels.value"
                  label="name"
                  :reduce="(level) => level.id"
                  multiple
              ></v-select>
            </AppFilter>

            <AppFilter v-model="degreeId" :filter-name="`${name}.degreeId`">
              <label for="degreeId">Grado</label>
              <v-select
                  inputId="degreeId"
                  v-model="degreeId"
                  :options="degrees.value"
                  label="name"
                  :reduce="(degree) => degree.id"
                  multiple
              ></v-select>
            </AppFilter>

            <AppFilter v-model="subjectId" :filter-name="`${name}.subjectId`">
              <label for="subjectId">Asignatura</label>
              <v-select
                  inputId="subjectId"
                  v-model="subjectId"
                  :options="subjects.value"
                  label="name"
                  :reduce="(subject) => subject.id"
                  multiple
              ></v-select>
            </AppFilter>
          </template>

          <AppDatatableColumn label="Plan" field="productName" :sortable="true" v-slot="{ row }">
            {{ row.productName }}
          </AppDatatableColumn>

          <AppDatatableColumn label="Nivel" field="levelName" :sortable="true" v-slot="{ row }">
            {{ row.levelName }}
          </AppDatatableColumn>

          <AppDatatableColumn label="Grado" field="DegreeName" :sortable="true" v-slot="{ row }">
            {{ row.DegreeName }}
          </AppDatatableColumn>

          <AppDatatableColumn label="Asignatura" field="subjectName" :sortable="true" v-slot="{ row }">
            {{ row.subjectName }}
          </AppDatatableColumn>

          <AppDatatableColumn label="Cantidad" v-slot="{ row }">
            <div class="d-flex justify-content-center">
              <button class="btn btn-link btn-sm" @click="showUsedLicenses(row.id)"
                      v-tooltip="'Ver licencias usadas'">
                {{ row.quantityUsed }} / {{ row.quantityPurchased }}
              </button>
            </div>
          </AppDatatableColumn>

          <AppDatatableColumn label="Vigencia" field="validUntil" :sortable="true" v-slot="{ row }">
            {{ row.validUntil }}
          </AppDatatableColumn>

          <AppDatatableColumn v-slot="{ row }">
            <AppButton
                variant="primary"
                outlined
                icon="users"
                v-tooltip="'Usuarios autorizados'"
                @click="showAuthorizedUsersModal(row)"></AppButton>
          </AppDatatableColumn>
        </AppDatatable>

        <AppModal v-model="showUsedLicensesModal" @close="showUsedLicensesModal = false">
          <UsedLicenses v-if="showUsedLicensesModal" :product-id="productId"></UsedLicenses>
        </AppModal>

        <AppModal v-model="authorizedUsersModal" @close="authorizedUsersModal = false">
          <AuthorizedUsers v-if="authorizedUsersModal"
                           :white-list-emails="currentShop.value.whiteListEmails"
                           :shop-id="currentShop.value.id"
                           @finish="hideAuthorizedUsersModal"></AuthorizedUsers>
        </AppModal>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import {computed, defineComponent, onMounted, reactive, ref} from 'vue';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppPagination from '../../../shared/components/AppPagination.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import UsedLicenses from '../components/usedLicenses.vue';
import AuthorizedUsers from '../components/authorizedUsers.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import {BreadCrumbsType} from '../../../shared/types/breadCrumbs.type';
import {GetFiltersShoppingService} from '../services/getFiltersShopping.service';
import {GetShoppingService} from '../services/getShopping.service';
import {LevelDto} from '../dtos/level.dto';
import {DegreeDto} from '../dtos/degree.dto';
import {SubjectDto} from '../dtos/subject.dto';
import {ShoppingDto} from '../dtos/shopping.dto';
import {UpdateDatatableService} from '../../../shared/services/updateDatatable.service';

const getFiltersShoppingService = new GetFiltersShoppingService();
const updateDatatableService = new UpdateDatatableService();

export default defineComponent({
  name: 'Shopping',
  components: {
    AppButton,
    AppDatatableColumn,
    AppFilter,
    AppIcon,
    AuthorizedUsers,
    UsedLicenses,
    AppFormModal,
    AppModal,
    AppDatatable,
    AppPagination,
    AppBaseList,
  },
  setup() {
    const name = 'shopping';
    const title = 'Mis Compras';
    const routes: BreadCrumbsType[] = [
      {
        name: 'Inicio',
        url: '/',
      },
      {
        name: 'Mis compras',
      },
    ];

    const levels: { value: LevelDto[] } = reactive({
      value: [],
    });

    const degrees: { value: DegreeDto[] } = reactive({
      value: [],
    });

    const subjects: { value: SubjectDto[] } = reactive({
      value: [],
    });

    const shopping: { value: ShoppingDto[] } = reactive({
      value: [],
    });

    const levelId = ref(null);
    const degreeId = ref(null);
    const subjectId = ref(null);

    onMounted(async () => {
      const filters = await getFiltersShoppingService.run();

      levels.value = filters.levels;
      degrees.value = filters.degrees;
      subjects.value = filters.subjects;
    });

    const showUsedLicensesModal = ref(false);
    const productId = ref(0);

    const authorizedUsersModal = ref(false);
    const currentShop = reactive({
      value: {},
    });

    const showAuthorizedUsersModal = (shop: ShoppingDto) => {
      currentShop.value = shop;
      authorizedUsersModal.value = true;
    };

    const hideAuthorizedUsersModal = () => {
      updateDatatableService.run();
      authorizedUsersModal.value = false;
    };

    const showUsedLicenses = async (proId: number) => {
      productId.value = proId;
      showUsedLicensesModal.value = true;
    };

    const params = computed(() => {
      return {
        subjectId: subjectId.value,
        degreeId: degreeId.value,
        levelId: levelId.value,
      };
    });

    const getShoppingService = new GetShoppingService();

    return {
      name,
      title,
      routes,
      levels,
      degrees,
      subjects,
      levelId,
      degreeId,
      subjectId,
      shopping,
      getShoppingService,
      showUsedLicensesModal,
      productId,
      params,
      authorizedUsersModal,
      currentShop,
      showUsedLicenses,
      showAuthorizedUsersModal,
      hideAuthorizedUsersModal,
    };
  },
});
</script>

<style scoped>

</style>