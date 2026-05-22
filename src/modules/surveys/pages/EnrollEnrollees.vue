<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppBaseList v-else :title="title" :subtitle="subtitle" :routes="routes">
    <template #actions>
      <AppButtonBack :to="{ name: 'surveys.adminConvocationSummaryInscritos' }"></AppButtonBack>
      <AppButton :disabled="!groupId || noQuota" label="Iniciar proceso" @click="enroll()" class="text-white"></AppButton>
    </template>

    <template #content>
      <template v-if="currentCourse">
        <div class="d-flex justify-content-between align-items-center bg-white ps-2 pe-2 pt-3 pb-3 rounded">
          <div>
            <span v-if="noQuota">Se ha superado el límite de cupos disponibles.</span>
          </div>

          <h5 class="mb-0">
            Cupos disponibles:
            <span class="h5 fw-normal">{{ quota != null ? quota : 'Sin asignar' }}</span>
          </h5>
        </div>
      </template>

      <section class="mt-2 row gap-3">
        <div class="col pe-1">
          <AppFormField label="Seleccione el grado a filtrar" class="w-50">
            <AppAutocomplete :disabled="loadingEnroll" v-model="degreeId" :options="degrees" class="bg-white"></AppAutocomplete>
          </AppFormField>

          <table class="table bg-white">
            <thead>
              <tr>
                <th>Identificación</th>
                <th>Nombre aspirante</th>
                <th class="col-2 text-center">Pasos</th>
                <th class="col-1 text-center">Sel</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="!convocationsEnrolls.length">
                <td colspan="4">
                  <AppEmptyResponse :subtitle="false" :title="'Sin estudiantes'"></AppEmptyResponse>
                </td>
              </tr>

              <tr v-else v-for="(item, index) in convocationsEnrolls" :key="index">
                <td>{{ item.identification ?? '---' }}</td>
                <td>{{ item.nameEnrol ?? '---' }}</td>
                <td class="text-center">
                  {{ `${item.numberEnrolStepsApproved}/${item.numberEnrolSteps}` }}
                </td>
                <td class="text-center">
                  <input class="form-check-input" type="checkbox" v-model="item.select" :disabled="loadingEnroll" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="col ps-1">
          <AppFormField label="Seleccione el grupo a matricular" class="w-75">
            <AppAutocomplete :disabled="loadingGroups || loadingEnroll" v-model="groupId" :options="groups" :clearable="false" class="bg-white"></AppAutocomplete>
          </AppFormField>

          <table class="table bg-white">
            <thead>
              <tr>
                <th>Identificación</th>
                <th>Nombre aspirante</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="!students.length">
                <td colspan="2">
                  <AppEmptyResponse :subtitle="false" :title="'Sin estudiantes'"></AppEmptyResponse>
                </td>
              </tr>

              <tr v-else v-for="(item, index) in students" :key="index">
                <td>{{ item.people.identification ?? '---' }}</td>
                <td>
                  {{ item.people.names ?? '' }}
                  {{ item.people.lastnames ?? '' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, Ref, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { GetDegreesByConvocationIdService } from '../services/getDegreesByConvocationId.service';
import { MatriculateFromConvocationService } from '../services/matriculateFromConvocation.service';
import { GetStudentsAcademicPeriodGroupIdService } from '../services/getStudentsAcademicPeriodGroupId.service';
import { GetAcademicPeriodGroupsService } from '../../academicPlanning/services/getAcademicPeriodGroups.service';
import { GetConvocationSummaryRegisteredByIdService } from '../services/getConvocationSummaryRegisteredById.service';
import { GetGroupsByConvocationIdAndDegreeIdService } from '../services/getGroupsByConvocationIdAndDegreeId.service';
import { GetConvocationsEnrollsByConvocationIdAndDegreeIdService } from '../services/getConvocationsEnrollsByConvocationIdAndDegreeId.service';
import { useHeaderStore } from '../../../stores/header.store';

const matriculateFromConvocationService = new MatriculateFromConvocationService();
const getConvocationsEnrollsByConvocationIdAndDegreeIdService = new GetConvocationsEnrollsByConvocationIdAndDegreeIdService();
const getGroupsByConvocationIdAndDegreeIdService = new GetGroupsByConvocationIdAndDegreeIdService();
const getStudentsAcademicPeriodGroupIdService = new GetStudentsAcademicPeriodGroupIdService();
const getSummaryRegisteredService = new GetConvocationSummaryRegisteredByIdService();
const getDegreesByConvocationIdService = new GetDegreesByConvocationIdService();
const getAcademicPeriodGroupsService = new GetAcademicPeriodGroupsService();

export default defineComponent({
  name: 'EnrollEnrollees',
  components: {
    AppEmptyResponse,
    AppAutocomplete,
    AppButtonBack,
    AppFormField,
    AppBaseList,
    AppLoading,
    AppButton,
  },
  setup() {
    const route = useRoute();
    const title = 'Asignación de grupos a preinscritos';
    const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Admisión y Registro', url: '' };
        headerStorage.moduleItem = { name: 'Configuración y procesos de admisión', url: '' };
        headerStorage.moduleSubItem = { name: title, url: '' };
        

    useMeta({ title: title });
    const routes: any = [{ name: title }];

    const convocationsEnrolls: Ref<any[]> = ref([]);
    const quota: Ref<number | null> = ref(null);
    const currentCourse: Ref<any> = ref(null);
    const subtitle: Ref<string> = ref('');
    const students: Ref<any[]> = ref([]);
    const degrees: Ref<any[]> = ref([]);
    const courses: Ref<any[]> = ref([]);
    const groups: Ref<any[]> = ref([]);

    const convocationId = parseInt(route.params.convocationId.toString(), 10);

    const academicPeriodId = ref();
    const degreeId = ref();
    const groupId = ref();

    const loadingEnroll = ref(false);
    const loadingGroups = ref(false);
    const loading = ref(true);

    const noQuota = computed(() => {
      let noQuota = false;
      let counter = 0;

      convocationsEnrolls.value;
      for (let i = 0; i < convocationsEnrolls.value.length; i++) {
        if (convocationsEnrolls.value[i].select) counter++;
      }

      if (quota.value != null) {
        noQuota = quota.value < counter ? true : false;
      }

      return noQuota;
    });

    onMounted(async () => {
      degrees.value = await getDegreesByConvocationIdService.run(convocationId);

      await loadRoutes();

      const academicPeriodGroups: any[] = await getAcademicPeriodGroupsService.run(academicPeriodId.value);
      for (let i = 0; i < academicPeriodGroups.length; i++) {
        courses.value.push(...academicPeriodGroups[i].courses);
      }

      loading.value = false;
    });

    watch(degreeId, async () => {
      await getConvocationsEnrolls();
      await getGroups();
    });
    watch(groupId, async () => {
      if (groupId.value != null) {
        await getStudents();

        if (courses.value.filter((item: any) => item.id == groupId.value).length) {
          currentCourse.value = courses.value.filter((item: any) => item.id == groupId.value)[0];
          if (currentCourse.value.quota != null) {
            quota.value = currentCourse.value.quota - students.value.length;
          }
        }
      } else {
        currentCourse.value = null;
      }
    });

    const getConvocationsEnrolls = async () => {
      convocationsEnrolls.value = await getConvocationsEnrollsByConvocationIdAndDegreeIdService.run(convocationId, degreeId.value);

      convocationsEnrolls.value.forEach((item) => {
        item.select = false;
      });
    };

    const getStudents = async () => {
      students.value = await getStudentsAcademicPeriodGroupIdService.run(groupId.value);
    };

    const getGroups = async () => {
      loadingGroups.value = true;

      groups.value = [];
      students.value = [];
      groupId.value = null;

      groups.value = await getGroupsByConvocationIdAndDegreeIdService.run(convocationId, degreeId.value);

      groups.value.forEach((group: any) => {
        group['name'] = `${group.GroupName}`;
      });

      loadingGroups.value = false;
    };

    const enroll = async () => {
      loadingEnroll.value = true;

      const dataSent: {
        convocationEnrolId: number;
        academicPeriodGroupId: number;
      }[] = [];

      convocationsEnrolls.value.forEach((item) => {
        if (item.select) {
          dataSent.push({
            convocationEnrolId: item.convocationEnrolId,
            academicPeriodGroupId: groupId.value,
          });
        }
      });

      let counter = 0;

      while (counter < dataSent.length) {
        await matriculateFromConvocationService.run(dataSent[counter]);
        await getStudents();
        await getConvocationsEnrolls();

        if (courses.value.filter((item: any) => item.id == groupId.value).length) {
          currentCourse.value = courses.value.filter((item: any) => item.id == groupId.value)[0];
          if (currentCourse.value.quota != null) {
            quota.value = currentCourse.value.quota - students.value.length;
          }
        }

        counter += 1;
      }

      loadingEnroll.value = false;
    };

    const loadRoutes = async () => {
      const convocationwithEnrols = await getSummaryRegisteredService.run(convocationId);

      subtitle.value = convocationwithEnrols.title;
      academicPeriodId.value = convocationwithEnrols.academicPeriodId;

      routes.unshift(
        {
          name: `Procesos de matriculación`,
          url: { name: 'surveys.convocationsList' },
        },
        {
          name: `Resumen inscritos "${convocationwithEnrols.title}"`,
          url: {
            name: 'surveys.previewInscritos',
            params: { convocationId: convocationId },
          },
        },
        {
          name: `Resumen detallado de inscritos`,
          url: {
            name: 'surveys.adminConvocationSummaryInscritos',
            params: { convocationId: convocationId },
          },
        }
      );
    };

    return {
      subtitle,
      loading,
      routes,
      title,

      convocationsEnrolls,
      currentCourse,
      loadingEnroll,
      loadingGroups,
      students,
      degreeId,
      degrees,
      groupId,
      groups,
      quota,

      noQuota,

      enroll,
    };
  },
});
</script>

<style scoped></style>
