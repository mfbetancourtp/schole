<template>
  <BaseLayoutDevelopmentMaps :title="profileCode !== 'student' ? 'Mis Grupos' : undefined">
    <template #actions>
      <template v-if="!loading && employeeId">
        <AppFormField label="Reportes">
          <div class="reports-container">
            <AppButton
              icon="file-alt"
              v-tooltip="'Reporte 1'"
              :to="{
                name: 'public.generateGeneralReportByCollaborator',
                params: { employeeId },
              }"
            />

            <AppButton
              icon="file-alt"
              v-tooltip="'Reporte 2'"
              :to="{
                name: 'public.generateDetailedReportByCollaborator',
                params: { employeeId },
              }"
            />

            <AppButton
              v-if="profileCode !== 'student'"
              icon="file-alt"
              v-tooltip="'Reporte 3'"
              :to="{
                name: 'public.generateReportConsolidated',
                params: { employeeId },
              }"
            />
          </div>
        </AppFormField>
      </template>
    </template>

    <template #content>
      <AppLoading v-if="loading" />

      <template v-else>
        <template v-if="profileCode !== 'student'">
          <section class="filters">
            <AppFilter v-model="organizationalUnitId" filter-name="developmentMapsAdmin.organizationalUnitId">
              <AppFormField label="Area">
                <AppAutocomplete v-model="organizationalUnitId" :options="organizationalUnits" />
              </AppFormField>
            </AppFilter>

            <AppFilter v-model="organizationalJobId" filter-name="developmentMapsAdmin.organizationalJobId">
              <AppFormField label="Puesto">
                <AppAutocomplete v-model="organizationalJobId" :options="organizationalJobs" />
              </AppFormField>
            </AppFilter>
          </section>

          <template v-if="organizationalUnitId">
            <div class="table-container">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Dkx</th>
                    <th>Puesto</th>
                    <th class="text-center">Ver mapa</th>
                  </tr>
                </thead>

                <tbody>
                  <template v-if="loadingData">
                    <tr>
                      <td colspan="4"><AppLoading /></td>
                    </tr>
                  </template>

                  <template v-else>
                    <tr v-for="(item, index) in employees" :key="index">
                      <td>{{ item.employee }}</td>
                      <td>{{ item.userToken }}</td>
                      <td>{{ item.organizationalJobName }}</td>
                      <td class="text-center" style="cursor: pointer">
                        <AppIcon @click="currentEmployee = item" icon="search" />
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </template>
        </template>
      </template>

      <div class="development-map-container" v-if="currentEmployee">
        <DevelopmentMapList :employeeId="currentEmployee.id" :organizationalJobId="currentEmployee.organizationalJobId" />
      </div>
    </template>
  </BaseLayoutDevelopmentMaps>

  <div class="development-map-container-print" v-if="currentEmployee">
    <DevelopmentMapList :employeeId="currentEmployee.id" :organizationalJobId="currentEmployee.organizationalJobId" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import AppIcon from '../../../../shared/components/AppIcon.vue';
import AppFilter from '../../../../shared/components/AppFilter.vue';
import AppLoading from '../../../../shared/components/AppLoading.vue';
import AppButton from '../../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../../shared/components/Forms/AppAutocomplete.vue';
import BaseLayoutDevelopmentMaps from '../../components/BaseLayoutDevelopmentMaps.vue';
import DevelopmentMapList from '../../components/organizational/developmentMapList.vue';

import { RolesService } from '../../../../shared/services/roles.service';
import { GetDevelopmentMapRelatedDataService } from '../../services/organizational/getDevelopmentMapRelatedData.service';
import { GetEmployeeWithOrgaJobsCurrentUserService } from '../../services/organizational/getEmployeeWithOrgaJobsCurrentUser.service';

const getEmployeeWithOrgaJobsCurrentUserService = new GetEmployeeWithOrgaJobsCurrentUserService();
const getDevelopmentMapRelatedDataService = new GetDevelopmentMapRelatedDataService();
const rolesService = new RolesService();

export default defineComponent({
  name: 'developmentMapsAdmin',

  components: {
    BaseLayoutDevelopmentMaps,
    DevelopmentMapList,
    AppAutocomplete,
    AppFormField,
    AppLoading,
    AppButton,
    AppFilter,
    AppIcon,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    useMeta({ title: t('Estructura organizacional') });

    const selectedRole = rolesService.getSelectedRole();
    const profileCode = selectedRole ? selectedRole.profile.code : null;

    const organizationalUnitId: Ref<number | null> = ref(route.query.organizationalUnitId ? Number(route.query.organizationalUnitId) : null);
    const organizationalJobId: Ref<number | null> = ref(route.query.organizationalJobId ? Number(route.query.organizationalJobId) : null);
    const employeeId: Ref<number | null> = ref(route.query.employeeId ? Number(route.query.employeeId) : null);

    const organizationalUnits: Ref<any[]> = ref([]);
    const organizationalJobs: Ref<any[]> = ref([]);
    const currentEmployee: Ref<any> = ref(null);
    const employees: Ref<any[]> = ref([]);

    const loadingData = ref(true);
    const loading = ref(true);

    onMounted(async () => {
      try {
        if (employeeId.value === null) {
          const response = await getEmployeeWithOrgaJobsCurrentUserService.run();
          employeeId.value = response.employee?.id ?? null;

          if (profileCode === 'student' && employeeId.value && response.organizationalJobs.length) {
            currentEmployee.value = {
              id: employeeId.value,
              organizationalJobId: response.organizationalJobs[0].id,
            };

            loading.value = false;
            return;
          }
        } else {
          const response = await getEmployeeWithOrgaJobsCurrentUserService.run();

          if (profileCode === 'student' && employeeId.value && response.organizationalJobs.length) {
            currentEmployee.value = {
              id: employeeId.value,
              organizationalJobId: response.organizationalJobs[0].id,
            };

            loading.value = false;
            return;
          }
        }

        if (organizationalUnitId.value === null) {
          const localfilters: any = JSON.parse(localStorage.getItem('filters') ?? '{}');

          if (localfilters && !!localfilters['developmentMapsAdmin.organizationalUnitId']) {
            organizationalUnitId.value = Number(localfilters['developmentMapsAdmin.organizationalUnitId']);
          }
        }

        await getRelatedData();
      } catch (error) {
        console.log('this error onmounted', error);
        loading.value = false;
      }

      setTimeout(() => (loading.value = false), 500);
    });

    watch(organizationalUnitId, async () => {
      organizationalJobId.value = null;

      await getRelatedData();
    });
    watch(organizationalJobId, async () => {
      await getRelatedData();
    });

    const getRelatedData = async () => {
      loadingData.value = true;

      try {
        const params = {
          employeeId: employeeId.value,
          organizationalJobId: organizationalJobId.value,
          organizationalUnitId: organizationalUnitId.value,
        };

        const response = await getDevelopmentMapRelatedDataService.run(params);

        organizationalUnits.value = response.organizationalUnits;
        organizationalJobs.value = response.organizationalJobs;
        employees.value = response.employees;

        currentEmployee.value = null;
      } catch (err) {
        console.log('this error getRelatedData', err);
        loadingData.value = false;
      }

      loadingData.value = false;
    };

    const generateMap = (data: any) => {
      employeeId.value = data.id;
      organizationalJobId.value = data.organizationalJobId;
    };

    return {
      loadingData,
      profileCode,
      loading,

      organizationalUnitId,
      organizationalUnits,
      organizationalJobId,
      organizationalJobs,
      currentEmployee,
      employeeId,
      employees,

      generateMap,
    };
  },
});
</script>
<style scoped>
.development-map-container-print {
  display: none;
}

.reports-container {
  display: flex;
  gap: 0.5rem;
}

.filters {
  display: flex;
  gap: 0.5rem;
}
.filters > :deep(div) {
  flex: initial;
  margin: 0 !important;
  width: 100%;
}

.table-container {
  height: 40vh;
  overflow: auto;
}
.table-container .custom-table {
  background-color: #f7f7f7;
  border-collapse: collapse;
  width: 100%;
}
.table-container .custom-table th,
.table-container .custom-table td {
  padding: 10px;
  word-wrap: break-word;
}
.table-container .custom-table tr {
  border-bottom: 1px solid#ddd;
}
.table-container .custom-table td:nth-child(2) {
  max-width: 13rem;
}

.development-map-container {
  border: 2px solid var(--color-primary);
  padding: 1rem;
  margin-top: 1rem;
}

@media print {
  .development-map-container-print {
    display: block;
  }
}
</style>
