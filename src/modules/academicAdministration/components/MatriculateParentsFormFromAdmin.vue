<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppBaseList v-else :title="title" :routes="routes">
    <template #actions>
      <AppButtonBack :to="'#'" @click="toEnrollment()"></AppButtonBack>
      <AppButton style="color: white" v-if="validateUser" @click="save">Guardar</AppButton>
    </template>

    <template #content>
      <AppCard v-if="!validateUser">
        <template #body>
          <form @submit.prevent="validateIdentification">
            <h5 class="h6 mb-4">Ingrese el número de identificación del Acudiente</h5>

            <AppFormField :form-control="formIdentification$.form.identification">
              <label for="identification">Identificación</label>
              <input
                id="identification"
                type="text"
                class="form-control"
                v-model="formIdentification$.form.identification.$model"
                pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
              />
            </AppFormField>

            <div class="d-flex justify-content-center">
              <AppButton> Continuar </AppButton>
            </div>
          </form>
        </template>
      </AppCard>

      <form @submit.prevent="save" v-else>
        <div class="d-flex align-items-center justify-content-end">
          <div class="w-25">
            <AppFormField :form-control="v$.form.relationshipId">
              <label>{{ t('academicAdministration.parents.form.relationship') }}</label>
              <v-select v-model="v$.form.relationshipId.$model" :reduce="(relationship: any) => relationship.id" :options="relationships" class="bg-white" label="name"></v-select>
            </AppFormField>
          </div>

          <div class="ms-3">
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" id="isEconomicManager" v-model="isEconomicManager.value" />
              <label class="form-check-label" for="isEconomicManager">
                {{ t('academicAdministration.parents.form.isEconomicManager') }}
              </label>
            </div>
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" id="isEmergencyContact" v-model="isEmergencyContact.value" />
              <label class="form-check-label" for="isEmergencyContact">
                {{ t('academicAdministration.parents.form.isEmergencyContact') }}
              </label>
            </div>
            <template v-if="isMomOrDad()">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="isACollaborator" v-model="isACollaborator.value" />

                <label class="form-check-label" for="isACollaborator">
                  {{ t('academicAdministration.parents.form.isACollaborator') }}
                </label>
              </div>
            </template>
          </div>
        </div>

        <div class="row mt-1">
          <div class="col bg-white p-4 shadow-sm">
            <section>
              <h4 class="text-capitalize">
                {{ t('academicAdministration.matriculates.form.sectionOne') }}
              </h4>

              <div class="row">
                <AppFormField :form-control="v$.form.peopleForm.identificationType">
                  <label for="identificationType">{{ t('academicAdministration.people.identificationType') }}</label>
                  <v-select
                    :reduce="(identificationType: any) => identificationType.id"
                    v-model="v$.form.peopleForm.identificationType.$model"
                    :options="identificationTypes"
                    input-id="identificationType"
                    label="name"
                  ></v-select>
                </AppFormField>

                <AppFormField :form-control="v$.form.peopleForm.identification">
                  <label>{{ t('academicAdministration.people.identification') }}</label>
                  <input
                    v-bind:class="{ disabledSelect: !editForm }"
                    class="form-control"
                    type="text"
                    v-model="v$.form.peopleForm.identification.$model"
                    pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                    title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
                  />
                </AppFormField>
              </div>

              <div class="row">
                <AppFormField :form-control="v$.form.peopleForm.name">
                  <label>{{ t('academicAdministration.people.name') }}</label>
                  <input
                    class="form-control"
                    type="text"
                    v-model="v$.form.peopleForm.name.$model"
                    pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                    title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
                  />
                </AppFormField>

                <AppFormField :form-control="v$.form.peopleForm.lastname">
                  <label>{{ t('academicAdministration.people.lastname') }}</label>
                  <input
                    class="form-control"
                    type="text"
                    v-model="v$.form.peopleForm.lastname.$model"
                    pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                    title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
                  />
                </AppFormField>
              </div>

              <div class="row">
                <AppFormField :form-control="v$.form.peopleForm.email">
                  <label>{{ t('academicAdministration.people.email') }}</label>
                  <input
                    class="form-control"
                    type="text"
                    v-model="v$.form.peopleForm.email.$model"
                    pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                    title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
                  />
                </AppFormField>

                <AppFormField :form-control="v$.form.peopleForm.mobile">
                  <label>{{ t('academicAdministration.people.mobile') }}</label>
                  <input
                    class="form-control"
                    type="text"
                    v-model="v$.form.peopleForm.mobile.$model"
                    pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                    title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
                  />
                </AppFormField>
              </div>

              <div class="row">
                <AppFormField :form-control="v$.form.peopleForm.alternateEmail" label="Email alterno">
                  <input v-model="v$.form.peopleForm.alternateEmail.$model" type="text" class="form-control" />
                </AppFormField>

                <AppFormField :form-control="v$.form.peopleForm.homePhone" label="academicAdministration.people.homePhone">
                  <input v-model="v$.form.peopleForm.homePhone.$model" type="text" class="form-control" />
                </AppFormField>
              </div>

              <div class="row">
                <AppFormField :form-control="v$.form.peopleForm.workPhone">
                  <label>{{ t('academicAdministration.people.workPhone') }}</label>
                  <input
                    class="form-control"
                    type="text"
                    v-model="v$.form.peopleForm.workPhone.$model"
                    pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                    title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
                  />
                </AppFormField>
                <AppFormField> </AppFormField>
              </div>
            </section>
            <hr />
            <section>
              <h4 class="text-capitalize">Información Personal</h4>

              <div class="row">
                <AppFormField :form-control="v$.form.peopleForm.gender">
                  <label for="gender">{{ t('academicAdministration.people.gender') }}</label>
                  <v-select :reduce="(gender: any) => gender.id" v-model="v$.form.peopleForm.gender.$model" :options="genders" input-id="gender" label="name"></v-select>
                </AppFormField>

                <AppFormField :form-control="v$.form.peopleForm.country" label="País de nacimiento">
                  <AppGeographicSearch :search-key="'country'" :id="v$.form.peopleForm.country.$model" @geographic-data="(data) => (v$.form.peopleForm.country.$model = data.id)"></AppGeographicSearch>
                </AppFormField>
              </div>

              <div class="row">
                <AppFormField :form-control="v$.form.peopleForm.region" label="Departamento de nacimiento">
                  <AppGeographicSearch
                    :search-key="'region'"
                    :country-id="v$.form.peopleForm.country.$model"
                    :id="v$.form.peopleForm.region.$model"
                    @geographic-data="(data) => (v$.form.peopleForm.region.$model = data.id)"
                  ></AppGeographicSearch>
                </AppFormField>

                <AppFormField :form-control="v$.form.peopleForm.municipality" label="Municipio de nacimiento">
                  <AppGeographicSearch
                    :search-key="'city'"
                    :country-id="v$.form.peopleForm.country.$model"
                    :region-id="v$.form.peopleForm.region.$model"
                    :id="v$.form.peopleForm.municipality.$model"
                    @geographic-data="(data) => (v$.form.peopleForm.municipality.$model = data.id)"
                  ></AppGeographicSearch>
                </AppFormField>
              </div>

              <div class="row">
                <AppFormField :form-control="v$.form.peopleForm.birthday" label="academicAdministration.people.birthday">
                  <input class="form-control" type="date" v-model="v$.form.peopleForm.birthday.$model" />
                </AppFormField>

                <AppFormField :form-control="v$.form.peopleForm.nationality" label="academicAdministration.people.nationality">
                  <input
                    class="form-control"
                    type="text"
                    v-model="v$.form.peopleForm.nationality.$model"
                    pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                    title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
                  />
                </AppFormField>
              </div>

              <div class="row">
                <AppFormField :form-control="v$.form.peopleForm.direction" label="dirección de residencia">
                  <input
                    class="form-control"
                    type="text"
                    v-model="v$.form.peopleForm.direction.$model"
                    pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                    title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
                  />
                </AppFormField>

                <AppFormField :form-control="v$.form.peopleForm.zone" label="Zona de residencia">
                  <input
                    class="form-control"
                    type="text"
                    v-model="v$.form.peopleForm.zone.$model"
                    pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                    title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
                  />
                </AppFormField>
              </div>

              <div class="row">
                <AppFormField :form-control="v$.form.peopleForm.religion" label="Religión">
                  <input
                    class="form-control"
                    type="text"
                    v-model="v$.form.peopleForm.religion.$model"
                    pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                    title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
                  />
                </AppFormField>

                <AppFormField :form-control="v$.form.peopleForm.primaryLanguage">
                  <label>{{ t('academicAdministration.people.primaryLanguage') }}</label>
                  <input
                    class="form-control"
                    type="text"
                    v-model="v$.form.peopleForm.primaryLanguage.$model"
                    pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                    title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
                  />
                </AppFormField>
              </div>
            </section>
            <hr />
            <section>
              <h4 class="text-capitalize">Información Laboral</h4>

              <div class="row">
                <AppFormField :form-control="v$.form.peopleForm.companyName" label="Nombre de la Empresa">
                  <input
                    class="form-control"
                    type="text"
                    v-model="v$.form.peopleForm.companyName.$model"
                    pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                    title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
                  />
                </AppFormField>

                <AppFormField :form-control="v$.form.peopleForm.companyPosition" label="cargo">
                  <input
                    class="form-control"
                    type="text"
                    v-model="v$.form.peopleForm.companyPosition.$model"
                    pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                    title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
                  />
                </AppFormField>
              </div>

              <div v-if="isACollaborator.value" class="row">
                <AppFormField :form-control="v$.form.peopleForm.companyAreaId" label="Vicepresidencia">
                  <AppAutocomplete v-model="v$.form.peopleForm.companyAreaId.$model" :options="companyAreas" />
                </AppFormField>

                <AppFormField> </AppFormField>
              </div>
            </section>
          </div>
        </div>
      </form>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import { defineComponent, onMounted, reactive, ref, Ref } from 'vue';

import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppGeographicSearch from '../../../shared/components/Forms/AppGeographicSearch.vue';

import { GetPeopleByIdentificationService } from '../services/getPeopleByIdentification.service';
import { GetMatriculateRelatedDataFormService } from '../../../shared/services/getMatriculateRelatedDataForm.service';
import { CreateOrUpdateMatriculateParentsService } from '../services/createOrUpdateMatriculateParents.service';
import { GetCompanyAreaService } from '../../../shared/services/getCompanyArea.service';

const getCompanyAreaService = new GetCompanyAreaService();
const createOrUpdateMatriculateParentsService = new CreateOrUpdateMatriculateParentsService();
const getMatriculateRelatedDataFormService = new GetMatriculateRelatedDataFormService();
const getPeopleByIdentificationService = new GetPeopleByIdentificationService();

export default defineComponent({
  name: 'StudentForm',
  props: ['title', 'routes', 'data'],
  components: {
    AppAutocomplete,
    AppButton,
    AppButtonBack,
    AppFormField,
    AppBaseList,
    AppLoading,
    AppCard,
    AppGeographicSearch,
  },

  setup(props) {
    const validateUser = ref(false);
    const { t } = useI18n();

    const formIdentification = reactive({
      identification: '',
    });
    const formIdentification$ = useVuelidate(
      {
        form: {
          identification: { required },
        },
      },
      { form: formIdentification }
    );

    const form: any = reactive({
      matriculateId: null,
      relationshipId: null,
      isEconomicManager: null,
      isEmergencyContact: null,
      isACollaborator: null,

      peopleForm: {
        identificationType: null,
        identification: null,
        name: null,
        lastname: null,
        mobile: null,
        email: null,
        alternateEmail: null,
        homePhone: null,
        workPhone: null,
        gender: null,
        religion: null,
        nationality: null,
        primaryLanguage: null,
        zone: null,
        country: null,
        region: null,
        municipality: null,
        direction: null,
        countryBirth: null,
        regionBirth: null,
        municipalityBirth: null,
        birthday: null,
        companyName: null,
        companyPosition: null,
        companyAreaId: null,
      },
    });
    const v$ = useVuelidate(
      {
        form: {
          matriculateId: { required },
          relationshipId: { required },
          isEconomicManager: {},
          isEmergencyContact: {},
          isACollaborator: {},

          peopleForm: {
            identificationType: { required },
            identification: { required },
            name: { required },
            lastname: { required },
            mobile: {},
            email: { required },
            alternateEmail: {},
            homePhone: {},
            workPhone: {},
            gender: {},
            religion: {},
            nationality: {},
            primaryLanguage: {},
            country: {},
            region: {},
            municipality: {},
            direction: {},
            countryBirth: {},
            regionBirth: {},
            municipalityBirth: {},
            birthday: {},
            zone: {},
            companyName: {},
            companyPosition: {},
            companyAreaId: {},
          },
        },
      },
      { form }
    );

    const identificationTypes = ref();
    const relationships = ref();
    const genders = ref();

    const currentAcademicPeriodGroupId = ref();
    const matriculateParentId = ref();
    const currentMatriculate = ref();
    const router = useRouter();
    const editForm = ref(false);
    const loading = ref(true);
    const route = useRoute();

    const companyAreas: Ref<any[]> = ref([]);
    const countries: { value: any[] } = reactive({
      value: [],
    });
    const regions: { value: any[] } = reactive({
      value: [],
    });
    const municipalities: { value: any[] } = reactive({
      value: [],
    });
    const countriesBirth: { value: any[] } = reactive({
      value: [],
    });
    const regionsBirth: { value: any[] } = reactive({
      value: [],
    });
    const municipalitiesBirth: { value: any[] } = reactive({
      value: [],
    });
    const data: { value: any | null } = reactive({
      value: props.data,
    });
    const isEconomicManager: { value: boolean } = reactive({
      value: false,
    });
    const isEmergencyContact: { value: boolean } = reactive({
      value: false,
    });
    const isACollaborator: { value: boolean } = reactive({
      value: false,
    });

    onMounted(async () => {
      loading.value = true;

      companyAreas.value = await getCompanyAreaService.run();
      currentMatriculate.value = route.params.matriculateParentId;
      currentAcademicPeriodGroupId.value = route.params.academicPeriodGroupId;

      if (data.value?.id) {
        matriculateParentId.value = data.value?.matriculateId;
      } else {
        currentMatriculate.value = route.params.matriculateId;
        matriculateParentId.value = currentMatriculate.value;
      }

      let relatedDataForm = await getMatriculateRelatedDataFormService.run();
      identificationTypes.value = relatedDataForm.identificationTypes;
      relationships.value = relatedDataForm.relationships;
      genders.value = relatedDataForm.genders;

      if (data.value?.id) {
        validateUser.value = true;
        editForm.value = true;
        await initForm();
      }

      loading.value = false;
    });

    const isMomOrDad = () => {
      if (form.relationshipId) {
        const currentRelationShip = relationships.value.find((item: any) => item.id == form.relationshipId);

        if (currentRelationShip && (currentRelationShip.name.includes('Madre') || currentRelationShip.name.includes('Padre'))) {
          return true;
        }
      }

      return false;
    };

    const validateIdentification = async () => {
      const isValid = await formIdentification$.value.$validate();

      if (!isValid) return;
      loading.value = true;

      try {
        const people = await getPeopleByIdentificationService.run(formIdentification.identification);

        data.value = {
          people,
        };
      } catch (e) {
        console.log(e);
      }

      initForm();

      validateUser.value = true;
      form.peopleForm.identification = formIdentification.identification;

      loading.value = false;
    };

    const initForm = () => {
      form.matriculateId = matriculateParentId.value;
      form.relationshipId = data.value?.relationshipId;
      form.isEconomicManager = data.value?.isEconomicManager ? true : false;
      form.isEmergencyContact = data.value?.isEmergencyContact ? true : false;
      form.isACollaborator = data.value?.people?.isACollaborator ? true : false;

      isEconomicManager.value = form.isEconomicManager ? true : false;
      isEmergencyContact.value = form.isEmergencyContact ? true : false;
      isACollaborator.value = form.isACollaborator ? true : false;

      form.peopleForm.identification = data.value?.people?.identification;
      form.peopleForm.identificationType = data.value?.people?.identificationTypeId;
      form.peopleForm.name = data.value?.people?.names;
      form.peopleForm.lastname = data.value?.people?.lastnames;
      form.peopleForm.mobile = data.value?.people?.mobile;
      form.peopleForm.email = data.value?.people?.email;
      form.peopleForm.alternateEmail = data.value?.people?.alternateemail;
      form.peopleForm.country = data.value?.people?.homeMunicipality?.region?.country?.id;
      form.peopleForm.region = data.value?.people?.homeMunicipality?.region?.id;
      form.peopleForm.municipality = data.value?.people?.homeMunicipality?.id;
      form.peopleForm.direction = data.value?.people?.direction;
      form.peopleForm.countryBirth = data.value?.people?.birthMunicipality?.region?.country?.id;
      form.peopleForm.regionBirth = data.value?.people?.birthMunicipality?.region?.id;
      form.peopleForm.municipalityBirth = data.value?.people?.birthMunicipality?.id;
      form.peopleForm.gender = data.value?.people?.genderId;
      form.peopleForm.birthday = data.value?.people?.birthDate;
      form.peopleForm.zone = data.value?.people?.zone;
      form.peopleForm.homePhone = data.value?.people?.homePhone;
      form.peopleForm.workPhone = data.value?.people?.workPhone;
      form.peopleForm.religion = data.value?.people?.religion;
      form.peopleForm.primaryLanguage = data.value?.people?.primaryLanguage;
      form.peopleForm.nationality = data.value?.people?.nationality;
      form.peopleForm.companyPosition = data.value?.people?.companyPosition;
      form.peopleForm.companyName = data.value?.people?.companyName;
      form.peopleForm.companyAreaId = data.value?.people?.companyAreaId;
    };

    const toEnrollment = async () => {
      await router.push({
        name: 'academicAdministration.editMatriculate',
        params: {
          academicPeriodGroupId: currentAcademicPeriodGroupId.value,
          matriculateId: data.value?.matriculateId ?? route.params.matriculateId,
        },
      });
    };

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;
      loading.value = true;

      const people: any = {
        identification: form.peopleForm.identification,
        identificationTypeId: form.peopleForm.identificationType,
        names: form.peopleForm.name,
        lastnames: form.peopleForm.lastname,
        mobile: form.peopleForm.mobile,
        email: form.peopleForm.email,
        alternateEmail: form.peopleForm.alternateEmailemail,
        homeMunicipalityId: form.peopleForm.municipality ?? null,
        direction: form.peopleForm.direction,
        birthDate: form.peopleForm.birthday,
        birthMunicipalityId: form.peopleForm.municipalityBirth ?? null,
        genderId: form.peopleForm.gender,
        homePhone: form.peopleForm.homePhone,
        workPhone: form.peopleForm.workPhone,
        religion: form.peopleForm.religion,
        primaryLanguage: form.peopleForm.primaryLanguage,
        nationality: form.peopleForm.nationality,
        zone: form.peopleForm.zone,
        companyName: form.peopleForm.companyName,
        companyPosition: form.peopleForm.companyPosition,
        companyAreaId: form.peopleForm.companyAreaId,

        isACollaborator: isACollaborator.value ? 1 : 0,
      };
      const matriculateParent: any = {
        matriculateId: form.matriculateId,
        relationshipId: form.relationshipId,
        isEconomicManager: isEconomicManager.value ? 1 : 0,
        isEmergencyContact: isEmergencyContact.value ? 1 : 0,
      };

      if (data.value?.people?.id) {
        people.id = data.value?.people?.id;
        matriculateParent.id = data.value?.id;
      }
      console.log('cionda', matriculateParent, 'otro', people);
      try {
        const response = await createOrUpdateMatriculateParentsService.run({
          matriculateParent,
          people,
        });

        await router.push({
          name: 'academicAdministration.editMatriculateParents',
          params: {
            academicPeriodGroupId: currentAcademicPeriodGroupId.value,
            matriculateParentId: response.data.matriculateParentId,
          },
        });

        loading.value = false;
      } catch (e) {
        console.log(e);
        loading.value = false;
      }
    };

    return {
      formIdentification$,
      validateUser,
      loading,
      v$,
      t,

      identificationTypes,
      municipalitiesBirth,
      municipalities,
      companyAreas,
      countriesBirth,
      relationships,
      regionsBirth,
      countries,
      editForm,
      genders,
      regions,
      isEmergencyContact,
      isEconomicManager,
      isACollaborator,

      validateIdentification,
      toEnrollment,
      isMomOrDad,
      save,
    };
  },
});
</script>

<style scoped>
.disabled {
  pointer-events: none;
  cursor: not-allowed;
  background-color: #dedede !important;
}

.disabledSelect {
  pointer-events: none;
  color: #bfcbd9;
  cursor: not-allowed;
  background-image: none;
  background-color: #eef1f6 !important;
  border-color: #d1dbe5;
}
</style>
