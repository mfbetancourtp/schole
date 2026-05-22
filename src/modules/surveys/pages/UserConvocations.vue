<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppBaseList v-else :title="title.value" isCard>
    <template v-if="backURL" #actions>
      <div>
        <AppIcon icon="copy" @click="copyToClipboard()" class="me-2 cursor" />
        <span>{{ url }}</span>
      </div>

      <AppButtonBack :to="{ name: backURL }"></AppButtonBack>
    </template>

    <template v-slot:content>
      <AppEmptyResponse
        v-if="!UserBelongsInstitution()"
        :title="'El usuario no pertenece a esta institución'"
        :subtitle="'Cierre sesión y vuelva a intentarlo'"
        :show-image="true"
        :size="'md'"
      ></AppEmptyResponse>

      <div v-else>
        <div class="row">
          <AppFilter filter-name="userConvocations.academicPeriodId" @isNotInitialized="notFilterAcademicPeriodId" @update:model-value="updateAcademicPeriodId" v-model="currentAcademicPeriodId.value">
            <label for="academicPeriodId">
              {{ t('core.generalTerms.academic.academicPeriod.singular') }}
            </label>

            <AppAutocomplete v-if="currentAcademicPeriodId.value" v-model="currentAcademicPeriodId.value" :inputId="'academicPeriodId'" :options="academicPeriods" class="bg-white"></AppAutocomplete>
          </AppFilter>
        </div>

        <AppLoading v-if="loadingConvocations"></AppLoading>

        <AppEmptyResponse v-if="!loadingConvocations && !convocations.length" :show-image="true"></AppEmptyResponse>

        <div v-else class="items">
          <AppCard v-for="convocation in convocations" :key="convocation.id" :image="convocation.thumbnail" class="card-hover">
            <template #body>
              <h1 class="h5 lead tw-line-clamp-2">{{ convocation.title }}</h1>
              <p class="tw-line-clamp-3">{{ convocation.levelName }}</p>
              <p class="tw-line-clamp-3">
                Fecha de cierre:
                {{ dayjs(convocation.endDate).locale('es').format('D MMMM YYYY') }}
              </p>
            </template>

            <template #footer>
              <div class="d-flex justify-content-end">
                <AppButton
                  :label="'Inscribirme'"
                  :to="{
                    name: 'surveys.convocationInscripcion',
                    params: { convocationId: convocation.id },
                  }"
                ></AppButton>
              </div>
            </template>
          </AppCard>
        </div>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, Ref, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import dayjs from 'dayjs';
// import es from "dayjs/locale/es";
import localeData from 'dayjs/plugin/localeData';

import AppIcon from '../../../shared/components/AppIcon.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { ConvocationDto } from '../dtos/convocation.dto';
import { AcademicPeriodDto } from '../../../shared/dto/academicPeriod.dto';

import { ToastService } from '../../../shared/services/toast.service';
import { GetConvocationsActivesService } from '../services/getConvocationsActives.service';
import { GetInstitutionByIdService } from '../../casurid/services/getInstitutionById.service';
import { AcademicPeriodsForConvocationsService } from '../services/academicPeriodsForConvocations.service';
import { useHeaderStore } from '../../../stores/header.store';

dayjs.locale('es');
dayjs.extend(localeData);

const academicPeriodsForConvocationsService = new AcademicPeriodsForConvocationsService();
const getConvocationsActivesService = new GetConvocationsActivesService();
const getInstitutionByIdService = new GetInstitutionByIdService();
const toastService = new ToastService();

export default defineComponent({
  name: 'UserConvocations',
  components: {
    AppEmptyResponse,
    AppAutocomplete,
    AppButtonBack,
    AppBaseList,
    AppLoading,
    AppButton,
    AppFilter,
    AppCard,
    AppIcon,
  },

  setup() {
    const { t } = useI18n();
    useMeta({ title: 'procesos de matriculación' });
    const routes: any = [{ name: 'procesos de matriculación' }];

    const academicPeriods: Ref<AcademicPeriodDto[]> = ref([]);
    const activeAcademicPeriods: Ref<any> = ref([]);

    const convocations: Ref<ConvocationDto[]> = ref([]);
    const loadingConvocations = ref(false);
    const institutionId = ref();
    const loading = ref(true);
    const route = useRoute();
    const backURL = ref();
    const url = ref();

    const currentAcademicPeriodId: { value: any } = reactive({
      value: null,
    });
    const title: { value: any } = reactive({
      value: null,
    });

    onMounted(async () => {
      try {
        institutionId.value = parseInt(route.params.institutionId.toString(), 10);

        if (route.query.backURL) {
          backURL.value = route.query.backURL;
          url.value = `${location.href.split('?')[0]}`;
        }

        academicPeriods.value = await academicPeriodsForConvocationsService.run(institutionId.value);
        activeAcademicPeriods.value = academicPeriods.value.filter((period: any) => period.active === 1);

        let response = await getInstitutionByIdService.run(institutionId.value);

        academicPeriods.value.forEach((academicPeriod) => (academicPeriod.id = `${academicPeriod.id}`));

        title.value = `Procesos de matriculación  ${response.institution.name}`;
        routes[0].name = title.value;

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Admisión y Registro', url: '' };
        headerStorage.moduleItem = {
          name: 'Configuración y procesos de admisión',
          url: '',
        };
        headerStorage.moduleSubItem = { name: title.value, url: '' };
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    watch(currentAcademicPeriodId, async () => {
      await getConvocations();
    });

    const UserBelongsInstitution = () => {
      if (localStorage.getItem('user')) {
        const userLS = JSON.parse(localStorage.getItem('user') ?? '');
        const institutionIdUserLS = userLS.people.institutionId;

        if (institutionIdUserLS !== institutionId.value) return false;
      }

      return true;
    };

    const getConvocations = async () => {
      loadingConvocations.value = true;

      try {
        let params = {
          academicPeriodId: currentAcademicPeriodId.value,
          institutionId: institutionId.value,
        };

        convocations.value = await getConvocationsActivesService.run(params);
      } catch (e) {
        console.log(e);
      }

      loadingConvocations.value = false;
    };

    const notFilterAcademicPeriodId = async () => {
      if (academicPeriods.value.length) {
        currentAcademicPeriodId.value = academicPeriods.value[0].id;
        await getConvocations();
      }
    };
    const updateAcademicPeriodId = async (value: number) => {
      currentAcademicPeriodId.value = value;
      await getConvocations();
    };

    const copyToClipboard = () => {
      let auxInput = document.createElement('input');

      auxInput.setAttribute('value', url.value);
      document.body.appendChild(auxInput);
      auxInput.select();

      if (!navigator.clipboard) {
        document.execCommand('copy');
        document.body.removeChild(auxInput);
      } else {
        navigator.clipboard
          .writeText(url.value)
          .then(() => console.log('copiado'))
          .catch(() => console.log('no se copio'));
      }

      toastService.show('Copiado al portapapeles');
      setTimeout(() => toastService.hide(), 1000);
    };

    return {
      routes,
      title,
      t,

      currentAcademicPeriodId,
      loadingConvocations,
      academicPeriods: activeAcademicPeriods,
      convocations,
      backURL,
      loading,
      url,

      notFilterAcademicPeriodId,
      updateAcademicPeriodId,
      UserBelongsInstitution,
      getConvocations,
      copyToClipboard,

      dayjs,
    };
  },
});
</script>

<style scoped>
.items {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
}

.cursor {
  cursor: pointer;
}
.content-scroll {
  max-height: calc(100vh - 280px); /* ajusta si quieres más/menos espacio */
  overflow-y: auto;
  padding-right: 8px; /* para que no se corte la scrollbar */
}
</style>
