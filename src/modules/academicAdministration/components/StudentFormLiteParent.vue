<template>
  <AppBaseList :title="title" isCard>
    <template #actions>
      <AppButtonBack :to="{ name: 'academicAdministration.detailMatriculate' }" />

      <template v-if="validateUser">
        <AppButton style="color: white" label="core.save" @click="save" />
      </template>
    </template>

    <template #content>
      <AppLoading v-if="loading" />

      <template v-else>
        <template v-if="!validateUser">
          <form @submit.prevent="validateIdentification">
            <h5 class="h6 mb-4">
              {{ t('academicAdministration.parents.form.validateIdentificationText') }}
            </h5>

            <AppFormField :form-control="formIdentification$.form.identification" label="academicAdministration.people.identification">
              <input v-model="formIdentification$.form.identification.$model" type="text" class="form-control" />
            </AppFormField>

            <div class="d-flex justify-content-center">
              <AppButton label="core.continue" />
            </div>
          </form>
        </template>

        <template v-else>
          <div class="d-flex align-items-center justify-content-end">
            <div class="w-25">
              <AppFormField :form-control="v$.form.relationshipId" label="academicAdministration.parents.form.relationship">
                <AppAutocomplete v-model="v$.form.relationshipId.$model" :options="relationships" />
              </AppFormField>
            </div>

            <div class="ms-3">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="isEconomicManager" v-model="v$.form.isEconomicManager.$model" />

                <label class="form-check-label" for="isEconomicManager">
                  {{ t('academicAdministration.parents.form.isEconomicManager') }}
                </label>
              </div>

              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="isEmergencyContact" v-model="v$.form.isEmergencyContact.$model" />

                <label class="form-check-label" for="isEmergencyContact">
                  {{ t('academicAdministration.parents.form.isEmergencyContact') }}
                </label>
              </div>

              <template v-if="isMomOrDad()">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="isACollaborator" v-model="v$.form.isACollaborator.$model" />

                  <label class="form-check-label" for="isACollaborator">
                    {{ t('academicAdministration.parents.form.isACollaborator') }}
                  </label>
                </div>
              </template>
            </div>
          </div>

          <hr />

          <div class="p-4">
            <section>
              <h4 class="text-capitalize">
                {{ t('academicAdministration.matriculates.form.sectionOne') }}
              </h4>

              <div class="row">
                <AppFormField :form-control="v$.form.basiData.identificationTypeId" label="academicAdministration.people.identificationType">
                  <AppAutocomplete v-model="v$.form.basiData.identificationTypeId.$model" :options="identificationTypes" />
                </AppFormField>

                <AppFormField :form-control="v$.form.basiData.identification" label="academicAdministration.people.identification">
                  <input v-model="v$.form.basiData.identification.$model" type="text" class="form-control" :disabled="!parent" />
                </AppFormField>
              </div>

              <div class="row">
                <AppFormField :form-control="v$.form.basiData.names" label="academicAdministration.people.name">
                  <input class="form-control" type="text" v-model="v$.form.basiData.names.$model" />
                </AppFormField>

                <AppFormField :form-control="v$.form.basiData.lastnames" label="academicAdministration.people.lastname">
                  <input v-model="v$.form.basiData.lastnames.$model" type="text" class="form-control" />
                </AppFormField>
              </div>

              <div class="row">
                <AppFormField :form-control="v$.form.basiData.email" label="academicAdministration.people.email">
                  <input v-model="v$.form.basiData.email.$model" type="text" class="form-control" />
                </AppFormField>

                <AppFormField :form-control="v$.form.basiData.mobile" label="academicAdministration.people.mobile">
                  <input v-model="v$.form.basiData.mobile.$model" type="text" class="form-control" />
                </AppFormField>
              </div>

              <div class="row">
                <AppFormField :form-control="v$.form.basiData.alternateEmail" label="Email alterno">
                  <input v-model="v$.form.basiData.alternateEmail.$model" type="text" class="form-control" />
                </AppFormField>

                <AppFormField :form-control="v$.form.basiData.homePhone" label="academicAdministration.people.homePhone">
                  <input v-model="v$.form.basiData.homePhone.$model" type="text" class="form-control" />
                </AppFormField>
              </div>

              <div class="row">
                <AppFormField :form-control="v$.form.basiData.workPhone" label="academicAdministration.people.workPhone">
                  <input v-model="v$.form.basiData.workPhone.$model" type="text" class="form-control" />
                </AppFormField>

                <AppFormField> </AppFormField>
              </div>
            </section>

            <hr />

            <section>
              <h4 class="text-capitalize">Información personal</h4>

              <div class="row">
                <AppFormField :form-control="v$.form.persData.genderId" label="academicAdministration.people.gender">
                  <AppAutocomplete v-model="v$.form.persData.genderId.$model" :options="genders" />
                </AppFormField>

                <AppFormField :form-control="v$.form.persData.birthCountryId" label="País de nacimiento">
                  <AppGeographicSearch
                    :search-key="'country'"
                    placeholder="Ingrese mínimo 2 caracteres para iniciar la búsqueda"
                    :id="v$.form.persData.birthCountryId.$model"
                    @geographic-data="(data) => (v$.form.persData.birthCountryId.$model = data.id)"
                  ></AppGeographicSearch>
                </AppFormField>
              </div>

              <div class="row">
                <AppFormField :form-control="v$.form.persData.birthRegionId" label="departamento de nacimiento">
                  <AppGeographicSearch
                    :search-key="'region'"
                    placeholder="Ingrese mínimo 2 caracteres para iniciar la búsqueda"
                    :id="v$.form.persData.birthRegionId.$model"
                    @geographic-data="(data) => (v$.form.persData.birthRegionId.$model = data.id)"
                  ></AppGeographicSearch>
                </AppFormField>

                <AppFormField :form-control="v$.form.persData.birthMunicipalityId" label="municipio de nacimiento">
                  <AppGeographicSearch
                    :search-key="'city'"
                    placeholder="Ingrese mínimo 2 caracteres para iniciar la búsqueda"
                    :id="v$.form.persData.birthMunicipalityId.$model"
                    @geographic-data="(data) => (v$.form.persData.birthMunicipalityId.$model = data.id)"
                  ></AppGeographicSearch>
                </AppFormField>
              </div>

              <div class="row">
                <AppFormField :form-control="v$.form.persData.birthDate" label="Fecha de nacimiento">
                  <input v-model="v$.form.persData.birthDate.$model" type="date" class="form-control" />
                </AppFormField>

                <AppFormField :form-control="v$.form.persData.nationality" label="academicAdministration.people.nationality">
                  <input v-model="v$.form.persData.nationality.$model" type="text" class="form-control" />
                </AppFormField>
              </div>

              <div class="row">
                <AppFormField :form-control="v$.form.persData.direction" label="Dirección de residencia">
                  <input v-model="v$.form.persData.direction.$model" type="text" class="form-control" />
                </AppFormField>

                <AppFormField :form-control="v$.form.persData.zone" label="Zona de residencia">
                  <input v-model="v$.form.persData.zone.$model" type="text" class="form-control" />
                </AppFormField>
              </div>

              <div class="row">
                <AppFormField :form-control="v$.form.persData.religion" label="Religión">
                  <input v-model="v$.form.persData.religion.$model" type="text" class="form-control" />
                </AppFormField>

                <AppFormField :form-control="v$.form.persData.primaryLanguage" label="academicAdministration.people.primaryLanguage">
                  <input v-model="v$.form.persData.primaryLanguage.$model" type="text" class="form-control" />
                </AppFormField>
              </div>
            </section>

            <hr />

            <section>
              <h4 class="text-capitalize">Información Laboral</h4>

              <div class="row">
                <AppFormField :form-control="v$.form.emplData.companyName" label="Nombre de la empresa">
                  <input v-model="v$.form.emplData.companyName.$model" type="text" class="form-control" />
                </AppFormField>

                <AppFormField :form-control="v$.form.emplData.companyPosition" label="Cargo">
                  <input v-model="v$.form.emplData.companyPosition.$model" type="text" class="form-control" />
                </AppFormField>
              </div>

              <div v-if="v$.form.isACollaborator.$model" class="row">
                <AppFormField :form-control="v$.form.emplData.companyAreaId" label="Vicepresidencia">
                  <AppAutocomplete v-model="v$.form.emplData.companyAreaId.$model" :options="companyAreas" />
                </AppFormField>

                <AppFormField> </AppFormField>
              </div>
            </section>
          </div>
        </template>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, onMounted, PropType, reactive, Ref, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
//import { debounce } from 'ts-debounce';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppGeographicSearch from '../../../shared/components/Forms/AppGeographicSearch.vue';

import { GenderDto } from '../../../shared/dto/gender.dto';
import { PeopleWithUserDto } from '../../../shared/dto/people.dto';
import { ParentDetailDto, RelationshipDto } from '../dto/parent.dto';
import { IdentificationTypeDto } from '../../../shared/dto/identificationTypeDto';
//import { FindAllRegionsForSelectService } from '../../../shared/services/findAllRegionsForSelect.service';
//import { FindAllCountriesForSelectService } from '../../../shared/services/findAllCountriesForSelect.service';
//import { FindAllMunicipalitiesForSelectService } from '../../../shared/services/findAllMunicipalitiesForSelect.service';

import { GetPeopleByIdentificationService } from '../services/getPeopleByIdentification.service';
import { GetMatriculateRelatedDataFormService } from '../../../shared/services/getMatriculateRelatedDataForm.service';
import { GetCompanyAreaService } from '../../../shared/services/getCompanyArea.service';
import { CreateOrUpdateMatriculateParentsService } from '../services/createOrUpdateMatriculateParents.service';

const createOrUpdateMatriculateParentsService = new CreateOrUpdateMatriculateParentsService();
const getMatriculateRelatedDataFormService = new GetMatriculateRelatedDataFormService();
const getPeopleByIdentificationService = new GetPeopleByIdentificationService();
const getCompanyAreaService = new GetCompanyAreaService();

export default defineComponent({
  name: 'StudentFormLiteParent',

  components: {
    AppGeographicSearch,
    AppAutocomplete,
    AppButtonBack,
    AppFormField,
    AppBaseList,
    AppLoading,
    AppButton,
  },

  props: {
    title: {
      type: String,
      required: true,
    },
    parent: {
      type: Object as PropType<ParentDetailDto | null>,
      default: null,
    },
  },

  setup(props) {
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();

    const matriculateId = parseInt(route.params.matriculateId as string);

    const identificationTypes: Ref<IdentificationTypeDto[]> = ref([]);
    const relationships: Ref<RelationshipDto[]> = ref([]);
    const genders: Ref<GenderDto[]> = ref([]);
    const companyAreas: Ref<any[]> = ref([]);
    const countriesBirth: { value: any[] } = reactive({
      value: [],
    });
    const regionsBirth: { value: any[] } = reactive({
      value: [],
    });
    const municipalitiesBirth: { value: any[] } = reactive({
      value: [],
    });

    const validateUser = ref(false);
    const loading = ref(true);

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

    const form = reactive({
      matriculateId: matriculateId,

      relationshipId: props.parent?.relationshipId ?? null,
      isEconomicManager: props.parent ? (props.parent.isEconomicManager ? true : false) : false,
      isEmergencyContact: props.parent ? (props.parent.isEmergencyContact ? true : false) : false,
      isACollaborator: props.parent ? (props.parent.people?.isACollaborator ? true : false) : false,

      basiData: {
        id: props.parent?.people?.id ?? null,
        identificationTypeId: props.parent?.people?.identificationTypeId ?? null,
        identification: props.parent?.people?.identification ?? null,
        names: props.parent?.people?.names ?? null,
        lastnames: props.parent?.people?.lastnames ?? null,
        email: props.parent?.people?.email ?? null,
        mobile: props.parent?.people?.mobile ?? null,
        alternateEmail: props.parent?.people?.alternateEmail ?? null,
        homePhone: props.parent?.people?.homePhone ?? null,
        workPhone: props.parent?.people?.workPhone ?? null,
      },

      persData: {
        genderId: props.parent?.people?.genderId ?? null,
        birthCountryId: props.parent?.people?.birthMunicipality?.region?.country.id ?? null,
        birthRegionId: props.parent?.people?.birthMunicipality?.region.id ?? null,
        birthMunicipalityId: props.parent?.people?.birthMunicipality?.id ?? null,
        birthDate: props.parent?.people?.birthDate ?? null,
        nationality: props.parent?.people?.nationality ?? null,
        direction: props.parent?.people?.direction ?? null,
        zone: props.parent?.people?.zone ?? null,
        religion: props.parent?.people?.religion ?? null,
        primaryLanguage: props.parent?.people?.primaryLanguage ?? null,
      },

      emplData: {
        companyName: props.parent?.people?.companyName ?? null,
        companyPosition: props.parent?.people?.companyPosition ?? null,
        companyAreaId: props.parent?.people?.companyAreaId ?? null,
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

          basiData: {
            id: {},
            identificationTypeId: { required },
            identification: { required },
            names: { required },
            lastnames: { required },
            email: { required },
            mobile: {},
            alternateEmail: {},
            homePhone: {},
            workPhone: {},
          },

          persData: {
            genderId: {},
            birthCountryId: {},
            birthRegionId: {},
            birthMunicipalityId: {},
            birthDate: {},
            nationality: {},
            direction: {},
            zone: {},
            religion: {},
            primaryLanguage: {},
          },

          emplData: {
            companyName: {},
            companyPosition: {},
            companyAreaId: {},
          },
        },
      },
      { form }
    );

    onMounted(async () => {
      loading.value = true;

      try {
        const relatedData = await getMatriculateRelatedDataFormService.run();
        companyAreas.value = await getCompanyAreaService.run();

        identificationTypes.value = relatedData.identificationTypes;
        relationships.value = relatedData.relationships;
        genders.value = relatedData.genders;

        if (props.parent) validateUser.value = true;
      } catch (e) {
        console.log('err', e);
      }

      loading.value = false;
    });

    const isMomOrDad = () => {
      if (form.relationshipId) {
        const currentRelationShip = relationships.value.find((item) => item.id == form.relationshipId);

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
        const people: PeopleWithUserDto = await getPeopleByIdentificationService.run(formIdentification.identification);

        if (Object.keys(people).length) {
          form.basiData.id = people.id;
          form.basiData.identificationTypeId = people.identificationTypeId;
          form.basiData.identification = people.identification;
          form.basiData.names = people.names;
          form.basiData.lastnames = people.lastnames;
          form.basiData.email = people.email;
          form.basiData.mobile = people.mobile;
          form.basiData.alternateEmail = people.alternateEmail;
          form.basiData.homePhone = people.homePhone;
          form.basiData.workPhone = people.workPhone;

          form.persData.genderId = people.genderId;
          form.persData.birthMunicipalityId = people.birthMunicipalityId ?? null;
          form.persData.birthDate = people.birthDate;
          form.persData.nationality = people.nationality;
          form.persData.direction = people.direction;
          form.persData.zone = people.zone;
          form.persData.religion = people.religion;
          form.persData.primaryLanguage = people.primaryLanguage;

          form.emplData.companyName = people.companyName;
          form.emplData.companyPosition = people.companyPosition;
          form.emplData.companyAreaId = people.companyAreaId;
        } else {
          form.basiData.identification = formIdentification.identification;
        }

        validateUser.value = true;
      } catch (e) {
        console.log('error', e);
      }

      loading.value = false;
    };

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      loading.value = true;

      try {
        const people: any = {
          id: form.basiData.id,
          identificationTypeId: form.basiData.identificationTypeId,
          identification: form.basiData.identification,
          names: form.basiData.names,
          lastnames: form.basiData.lastnames,
          email: form.basiData.email,
          mobile: form.basiData.mobile,
          alternateEmail: form.basiData.alternateEmail,
          homePhone: form.basiData.homePhone,
          workPhone: form.basiData.workPhone,

          genderId: form.persData.genderId,
          birthMunicipalityId: form.persData.birthMunicipalityId ?? null,
          birthDate: form.persData.birthDate,
          nationality: form.persData.nationality,
          direction: form.persData.direction,
          zone: form.persData.zone,
          religion: form.persData.religion,
          primaryLanguage: form.persData.primaryLanguage,

          companyName: form.emplData.companyName,
          companyPosition: form.emplData.companyPosition,
          companyAreaId: form.emplData.companyAreaId,

          isACollaborator: form.isACollaborator ? 1 : 0,
        };

        const matriculateParent: any = {
          matriculateId: form.matriculateId,

          relationshipId: form.relationshipId,
          isEconomicManager: form.isEconomicManager ? 1 : 0,
          isEmergencyContact: form.isEmergencyContact ? 1 : 0,
        };

        if (props.parent) {
          people.id = props.parent?.people?.id;
          matriculateParent.id = props.parent?.id;
        }

        const dataSend = { people, matriculateParent };

        const response = await createOrUpdateMatriculateParentsService.run(dataSend);

        await router.push({
          name: 'academicAdministration.detailMatriculateParentEdit',
          params: {
            parentId: response.data.matriculateParentId,
            userId: route.params.userId,
            matriculateId,
          },
        });
      } catch (e) {
        console.log('err', e);
      }

      loading.value = false;
    };

    return {
      formIdentification$,
      validateUser,
      loading,
      v$,
      t,

      identificationTypes,
      relationships,
      companyAreas,
      genders,
      municipalitiesBirth,
      countriesBirth,
      regionsBirth,
      validateIdentification,
      isMomOrDad,
      save,
    };
  },
});
</script>

<style scoped>
.disabledSelect {
  pointer-events: none;
  color: #bfcbd9;
  cursor: not-allowed;
  background-image: none;
  background-color: #eef1f6 !important;
  border-color: #d1dbe5;
}
</style>
