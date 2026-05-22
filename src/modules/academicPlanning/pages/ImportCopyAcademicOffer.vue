<template>
  <AppBaseList :title="title" isCard>
    <template #actions>
      <AppButtonBack :to="{
        name: 'academicPlanning.menuImportAcademicPeriod',
        params: { academicPeriodId: academicPeriodId },
      }"></AppButtonBack>
    </template>

    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <section class="d-flex justify-content-end">
          <div class="d-flex align-items-end gap-2">
            <div>
              <label>Seleccione el ciclo académico origen</label>

              <AppAutocomplete v-model="academicPeriodIdOrigin" :options="academicPeriods.value" class="bg-white">
              </AppAutocomplete>
            </div>

            <AppButton :disabled="!academicPeriodIdOrigin" @click="openModalWarning()" variant="primary" label="Cargar">
            </AppButton>
          </div>
        </section>

        <AppLoading v-if="loadingData"></AppLoading>

        <section v-else>
          <AppEmptyResponse v-if="!dataTable.length" :show-image="true"></AppEmptyResponse>

          <div v-else class="mt-3">
            <section>
              <p>Los cursos no serán creados en "{{ academicPeriodName }}" hasta dar clic en Guardar.</p>

              <TableCopyAcademicOffer :data="dataTable"></TableCopyAcademicOffer>

              <div class="d-flex justify-content-end">
                <AppButton @click="saveCourses()" variant="primary" label="core.save"></AppButton>
              </div>
            </section>

            <section v-if="dataErrors.value.length">
              <hr />

              <p>Errores</p>

              <table class="table">
                <thead>
                  <tr>
                    <th>
                      {{ t('core.generalTerms.academic.journey.singular') }}
                    </th>
                    <th>{{ t('core.generalTerms.academic.degree.singular') }}</th>
                    <th>{{ t('core.generalTerms.academic.group.singular') }}</th>
                    <th>Observación</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="(dat, index) in dataErrors.value" :key="index">
                    <td>{{ dat.journeyName }}</td>
                    <td>{{ dat.degreeName }}</td>
                    <td>{{ dat.groupName }}</td>
                    <td>{{ dat.observation }}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>
        </section>

        <AppModal v-model="modalWarning">
          <ModalDataChangeWarning v-if="modalWarning" @close="closeModalWarning"></ModalDataChangeWarning>
        </AppModal>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useRoute } from 'vue-router';
import { defineComponent, onMounted, reactive, Ref, ref } from 'vue';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import ModalDataChangeWarning from '../components/ModalDataChangeWarning.vue';
import TableCopyAcademicOffer from '../components/TableCopyAcademicOffer.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { CopyAcademicOfferDto } from '../dtos/copyAcademicOffer.dto';
import { AcademicPeriodDto } from '../../../shared/dto/academicPeriod.dto';

import { GetCoursesService } from '../services/getCourses.service';
import { CopyCoursesToAcademicPeriodService } from '../services/copyCoursesToAcademicPeriod.service';
import { GetAcademicPeriodsWithPeriodsService } from '../services/getAcademicPeriodsWithPeriods.service';
import { GetDataRelatedCopyAcademicOfferService } from '../services/getDataRelatedCopyAcademicOffer.service';
import { useHeaderStore } from '../../../stores/header.store';

const getDataRelatedCopyAcademicOfferService = new GetDataRelatedCopyAcademicOfferService();
const getAcademicPeriodsWithPeriodsService = new GetAcademicPeriodsWithPeriodsService();
const copyCoursesToAcademicPeriodService = new CopyCoursesToAcademicPeriodService();
const getCoursesService = new GetCoursesService();

export default defineComponent({
  name: 'ImportCopyAcademicOffer',
  components: {
    TableCopyAcademicOffer,

    ModalDataChangeWarning,
    AppEmptyResponse,
    AppAutocomplete,
    AppButtonBack,
    AppBaseList,
    AppLoading,
    AppButton,
    AppModal,
  },

  setup() {
    const { t } = useI18n();
    const title = 'Importar datos desde otro ciclo académico';
    const routes: any[] = [{ name: title }];
    useMeta({ title: 'Copiar oferta académica' });

    const academicPeriodIdOrigin = ref();
    const academicPeriodName = ref();
    const modalWarning = ref(false);
    const academicPeriodId = ref();
    const loadingData = ref(false);
    const loading = ref(true);
    const route = useRoute();

    const dataTable: Ref<CopyAcademicOfferDto[]> = ref([]);

    const academicPeriods: { value: AcademicPeriodDto[] } = reactive({
      value: [],
    });
    const dataErrors: { value: any[] } = reactive({
      value: [],
    });

    onMounted(async () => {
      try {
        academicPeriodId.value = parseInt(route.params.academicPeriodId.toString(), 10);

        let res: any = await getDataRelatedCopyAcademicOfferService.run();
        academicPeriods.value = res.academicPeriods;
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Planeación académica', url: '' };
        headerStorage.moduleItem = { name: 'Año Académico', url: '' };
        headerStorage.moduleSubItem = { name: title, url: '' };

        await loadRoutes();
      } catch (e) {
        console.log('error', e);
      }

      loading.value = false;
    });

    const openModalWarning = () => {
      if (dataTable.value.length) {
        modalWarning.value = true;
      } else {
        closeModalWarning();
      }
    };
    const closeModalWarning = async () => {
      modalWarning.value = false;
      loadingData.value = true;

      try {
        dataTable.value = await getCoursesService.run(academicPeriodIdOrigin.value);
        dataErrors.value = [];
      } catch (e) {
        console.log('error', e);
      }

      loadingData.value = false;
    };

    const saveCourses = async () => {
      try {
        let courseGroups: any[] = [];

        dataTable.value.forEach((dat: CopyAcademicOfferDto) => {
          courseGroups.push({
            degreeId: dat.degreeId,
            journeyId: dat.journeyId,
            groupId: dat.groupId,
            directorPeopleId: dat.directorPeopleId,
            quota: dat.quota,
            degreeName: dat.degreeName,
            groupName: dat.groupName,
            journeyName: dat.journeyName,
          });
        });

        const dataSend = {
          academicPeriodId: academicPeriodId.value,
          courseGroups: courseGroups,
        };

        let res: any = await copyCoursesToAcademicPeriodService.run(dataSend);
        dataErrors.value = res.data?.errors;
      } catch (e) {
        console.log('error', e);
      }
    };

    const loadRoutes = async () => {
      try {
        const academicPeriodsWithPeriods: any = await getAcademicPeriodsWithPeriodsService.run();
        let nameRoute: string = '';

        academicPeriodsWithPeriods.academicPeriods.forEach((academicPeriod: AcademicPeriodDto) => {
          if (academicPeriodId.value == academicPeriod.id) {
            (academicPeriodName.value = academicPeriod.name), (nameRoute = `Importar información a "${academicPeriod.name}"`);
          }
        });

        routes.unshift(
          {
            name: `Ciclos académicos`,
            url: { name: 'academicPlanning.academicPeriods' },
          },
          {
            name: nameRoute,
            url: {
              name: 'academicPlanning.menuImportAcademicPeriod',
              params: { academicPeriodId: academicPeriodId.value },
            },
          }
        );
      } catch (e) {
        console.log('error', e);
      }
    };

    return {
      loading,
      routes,
      title,
      t,

      academicPeriodIdOrigin,
      academicPeriodName,
      academicPeriodId,
      academicPeriods,
      modalWarning,
      dataErrors,
      loadingData,
      dataTable,

      closeModalWarning,
      openModalWarning,
      saveCourses,
    };
  },
});
</script>

<style scoped></style>
