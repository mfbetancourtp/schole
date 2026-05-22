<template>
  <AppLoading v-if="loading" />

  <div v-else-if="convocation">
    <AppBaseList :title="title" :routes="routes" :subtitle="subtitle" :use-banner="true" :url-banner="urlBanner">
      <template #actions>
        <AppButtonBack :to="{ name: 'surveys.userConvocations', params: { institutionId } }" />
      </template>

      <template #content>
        <AppCard>
          <template #body>
            <!-- Header -->
            <section class="ci__header">
              <div class="ci__headerIcon">
                <AppIcon icon="user-plus" />
              </div>
              <div>
                <h2 class="ci__title">Inscripción al proceso</h2>
                <p class="ci__subtitle">
                  Completa los datos para registrarte en
                  <strong>{{ convocation.title }}</strong>
                </p>
              </div>
            </section>

            <div class="ci__alert" role="alert">
              <AppIcon icon="exclamation-triangle" class="ci__alertIcon" />
              <span>Ingrese los datos del estudiante para crear la cuenta en la convocatoria.</span>
            </div>

            <form @submit.prevent="save" class="ci__form">
              <!-- Personal data (only for unregistered users) -->
              <template v-if="!user">
                <div class="ci__section">
                  <h3 class="ci__sectionTitle">
                    <span class="ci__sectionTitleIcon"><AppIcon icon="user-circle" /></span>
                    Datos personales
                  </h3>

                  <div class="ci__grid">
                    <AppFormField :form-control="v$.form.identification" label="Identificación del estudiante *">
                      <input type="text" class="form-control" v-model="v$.form.identification.$model" pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$" title="Ingresa un valor válido" />
                      <div class="form-text text-muted ci__fieldHint">
                        <AppIcon icon="exclamation-circle" />
                        <span>La identificación se usará como usuario y contraseña.</span>
                      </div>
                    </AppFormField>

                    <AppFormField :form-control="v$.form.email" label="Correo electrónico">
                      <input type="email" class="form-control" v-model="v$.form.email.$model" />
                    </AppFormField>
                  </div>

                  <div class="ci__grid">
                    <AppFormField :form-control="v$.form.firstName" label="Primer nombre *">
                      <input type="text" class="form-control" v-model="v$.form.firstName.$model" pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$" />
                    </AppFormField>

                    <AppFormField :form-control="v$.form.secondName" label="Segundo nombre">
                      <input type="text" class="form-control" v-model="v$.form.secondName.$model" pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$" />
                    </AppFormField>
                  </div>

                  <div class="ci__grid">
                    <AppFormField :form-control="v$.form.firstLastname" label="Primer apellido *">
                      <input type="text" class="form-control" v-model="v$.form.firstLastname.$model" pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$" />
                    </AppFormField>

                    <AppFormField :form-control="v$.form.secondLastname" label="Segundo apellido">
                      <input type="text" class="form-control" v-model="v$.form.secondLastname.$model" pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$" />
                    </AppFormField>
                  </div>
                </div>
              </template>
              <!-- Academic info -->
              <div class="ci__section">
                <h3 class="ci__sectionTitle">
                  <span class="ci__sectionTitleIcon"><AppIcon icon="graduation-cap" /></span>
                  Información académica
                </h3>

                <div class="ci__grid">
                  <AppFormField :form-control="v$.form.offeringId" label="Oferta académica *">
                    <AppAutocomplete v-model="form.offeringId" :options="offerings" label="programName" :reduce="(o: any) => o.id" :clearable="false" placeholder="Selecciona una oferta" />
                  </AppFormField>

                  <!-- <AppFormField :form-control="v$.form.curriculumPeriodId" label="Período curricular *">
                    <AppAutocomplete
                      v-model="form.curriculumPeriodId"
                      :options="curriculumPeriods"
                      label="name"
                      :reduce="(o: any) => o.id"
                      :clearable="false"
                      :placeholder="form.offeringId ? 'Selecciona un período' : 'Selecciona primero una oferta'"
                    />
                  </AppFormField> -->
                </div>
              </div>
              <div class="ci__actions">
                <AppButton type="submit">
                  <AppIcon icon="check-circle" class="me-2" />
                  {{ user ? 'Actualizar información' : 'Inscribirse' }}
                </AppButton>
              </div>
            </form>
          </template>
        </AppCard>
      </template>
    </AppBaseList>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject, onMounted, reactive, Ref, ref, watch } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import localeData from 'dayjs/plugin/localeData';
import es from 'dayjs/locale/es';
import dayjs from 'dayjs';

import AuthenticatedUserStore from '../../../shared/stores/authenticatedUser.store';

import AppIcon from '../../../shared/components/AppIcon.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import type { ConvocationInscripcionDto } from '../dtos/convocationInscripcion.dto';
import type { CurriculumOfferingDto, CurriculumPeriodDto } from '../dtos/curriculumOffering.dto';

import { LoginService } from '../../auth/services/login.service';
import { GetConvocationByIdService } from '../services/getConvocationById.service';
import { CreateConvocationsEnrollsService } from '../services/createConvocationsEnrolls.service';
import { InscripcionConvocationUnregisteredUserService } from '../services/inscripcionConvocationUnregisteredUser.service';

import { GetCurriculumPeriodsByOfferingService } from '../services/getCurriculumPeriodsByOffering.service';
import { useHeaderStore } from '../../../stores/header.store';
import { GetCurriculumOfferingsPublicService } from '../services/getCurriculumOfferings.servicePublic';
import { InstitutionsService } from '../../../shared/services/institutions.service';

const inscripcionConvocationUnregisteredUserService = new InscripcionConvocationUnregisteredUserService();
const createConvocationsEnrollsService = new CreateConvocationsEnrollsService();
const getConvocationByIdService = new GetConvocationByIdService();
const getCurriculumOfferingsPublicService = new GetCurriculumOfferingsPublicService();
const getCurriculumPeriodsByOfferingService = new GetCurriculumPeriodsByOfferingService();
const loginService = new LoginService();
const institutionsService = new InstitutionsService();

dayjs.extend(localeData);
dayjs.locale(es);

export default defineComponent({
  name: 'ConvocationInscripcion',
  components: {
    AppButton,
    AppButtonBack,
    AppFormField,
    AppAutocomplete,
    AppBaseList,
    AppLoading,
    AppCard,
    AppIcon,
  },

  setup() {
    useMeta({ title: 'Inscripción a proceso de matriculación' });
    const router = useRouter();
    const route = useRoute();
    const { t } = useI18n();

    const store = inject('store', AuthenticatedUserStore.state);
    const user = computed(() => store.user);

    const routes: any = [{ name: '' }];
    const urlBanner = ref('');
    const subtitle = ref();
    const title = ref();

    const convocation: Ref<ConvocationInscripcionDto | null> = ref(null);
    const institutionId: Ref<number> = ref(0);
    const convocationId: Ref<number> = ref(0);
    const offerings: Ref<CurriculumOfferingDto[]> = ref([]);
    const curriculumPeriods: Ref<CurriculumPeriodDto[]> = ref([]);

    const loading = ref(true);

    const form = reactive({
      offeringId: null as number | null,
      // curriculumPeriodId: null as number | null,
      identification: user.value?.people.identification ?? null,
      email: user.value?.people.email ?? null,
      firstName: user.value?.people.names ?? null,
      secondName: null,
      firstLastname: user.value?.people.lastnames ?? null,
      secondLastname: null,
    });

    const v$ = useVuelidate(
      {
        form: {
          offeringId: { required },
          // curriculumPeriodId: { },
          identification: user.value ? {} : { required },
          email: {},
          firstName: user.value ? {} : { required },
          secondName: {},
          firstLastname: user.value ? {} : { required },
          secondLastname: {},
        },
      },
      { form }
    );

    const loadPeriods = async (offering: CurriculumOfferingDto) => {
      curriculumPeriods.value = [];
      // form.curriculumPeriodId = null;
      if (!offering.programCurriculumId || !offering.programId || !offering.campusId) return;
      try {
        curriculumPeriods.value = await getCurriculumPeriodsByOfferingService.run({
          academicPeriodId: offering.academicPeriodId,
          programId: offering.programId,
          campusId: offering.campusId,
          institutionId: institutionId.value,
        });
      } catch (err) {
        console.error('[ConvocationInscripcion] loadPeriods', err);
      }
    };

    watch(
      () => form.offeringId,
      (newId) => {
        const offering = offerings.value.find((o) => o.id === newId);
        if (offering) loadPeriods(offering);
        else {
          curriculumPeriods.value = [];
          // form.curriculumPeriodId = null;
        }
      }
    );

    onMounted(async () => {
      try {
        convocationId.value = parseInt(route.params.convocationId.toString(), 10);
        institutionId.value = parseInt(route.params.institutionId.toString(), 10);

        if (institutionId.value) {
          const institution = institutionsService.getInstitutions().find((inst) => inst.id === institutionId.value);
          if (institution) institutionsService.setSelectedInstitutions(institution);
          else localStorage.setItem('institutionId', institutionId.value.toString());
        }

        convocation.value = await getConvocationByIdService.run(convocationId.value);
        urlBanner.value = convocation.value.urlBanner ?? convocation.value.thumbnail;

        const params = {
          academicPeriodId: convocation.value.academicPeriodId,
          institutionId: institutionId.value,
        };
        const response: any = await getCurriculumOfferingsPublicService.run(params);
        offerings.value = response.data;
        console.log('holas', response);

        await loadRoutes();
      } catch (e) {
        console.error('[ConvocationInscripcion]', e);
      }
      loading.value = false;
    });

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      let convocationEnrolId: any;

      try {
        if (user.value) {
          const registrationData = await createConvocationsEnrollsService.run({
            convocationId: convocationId.value,
            offeringId: form.offeringId,
            // curriculumPeriodId: form.curriculumPeriodId,
          });
          convocationEnrolId = registrationData.data.convocationEnrolId;
        } else {
          const dataSend = {
            convocationId: convocationId.value,
            offeringId: form.offeringId,
            // curriculumPeriodId: form.curriculumPeriodId,
            user: {
              userToken: form.identification,
              password: form.identification,
              passwordConfirmation: form.identification,
            },
            people: {
              identification: form.identification,
              email: form.email,
              firstName: form.firstName,
              secondName: form.secondName,
              firstLastname: form.firstLastname,
              secondLastname: form.secondLastname,
            },
          };

          const registrationData = await inscripcionConvocationUnregisteredUserService.run(institutionId.value, dataSend);
          convocationEnrolId = registrationData.data.data.convocationEnrolId;

          if (form.identification) {
            await loginService.run({
              username: form.identification,
              password: form.identification,
            });
          }
        }

        await router.push({
          name: 'surveys.userConvocations.registrationModern',
          params: {
            institutionId: institutionId.value,
            convocationId: convocationId.value,
            convocationEnrollId: convocationEnrolId,
          },
        });
      } catch (e) {
        console.error('[ConvocationInscripcion] save', e);
      }
    };

    const loadRoutes = async () => {
      subtitle.value = `Fecha de Cierre: ${dayjs(convocation.value?.endDate).locale('es').format('D MMMM YYYY')}`;
      title.value = `Proceso de matriculación "${convocation.value?.title}"`;
      routes[0].name = title.value;
      routes.unshift({
        name: 'Procesos de matriculación',
        url: { name: 'surveys.userConvocations' },
      });

      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Procesos de Matriculación', url: '' };
      headerStorage.moduleItem = { name: title.value, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
    };

    return {
      urlBanner,
      subtitle,
      loading,
      routes,
      title,
      v$,
      t,
      institutionId,
      convocation,
      user,
      offerings,
      curriculumPeriods,
      form,
      save,
    };
  },
});
</script>

<style scoped>
/* ── Header ───────────────────────────────────────────────────────────────── */
.ci__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.ci__headerIcon {
  width: 3rem;
  height: 3rem;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 1.25rem;
}

.ci__title {
  margin: 0 0 0.2rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.ci__subtitle {
  margin: 0;
  font-size: 0.9rem;
  color: #64748b;
}

/* ── Alert ────────────────────────────────────────────────────────────────── */
.ci__alert {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 0.875rem 1rem;
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #92400e;
  margin-bottom: 1.5rem;
}

.ci__alertIcon {
  flex-shrink: 0;
  margin-top: 1px;
}

/* ── Form ─────────────────────────────────────────────────────────────────── */
.ci__form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ── Section ──────────────────────────────────────────────────────────────── */
.ci__section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  background: #fff;
}

.ci__sectionTitle {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.ci__sectionTitleIcon {
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.875rem;
  flex-shrink: 0;
}

/* ── Grid ─────────────────────────────────────────────────────────────────── */
.ci__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* ── Field hint ───────────────────────────────────────────────────────────── */
.ci__fieldHint {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.25rem;
}

/* ── Actions ──────────────────────────────────────────────────────────────── */
.ci__actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 0.5rem;
}

@media (max-width: 640px) {
  .ci__grid {
    grid-template-columns: 1fr;
  }
}
</style>
