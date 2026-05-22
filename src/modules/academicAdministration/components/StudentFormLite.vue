<template>
  <AppLoading v-if="loading" />

  <template v-else>
    <form @submit.prevent="save">
      <div class="sm:tw-grid sm:tw-grid-cols-2 tw-gap-4 tw-gap-y-2 xl:tw-grid-cols-12">
        <AppFormField :form-control="v$.form.academicPeriodId" class="xl:tw-col-span-4" label="academicAdministration.matriculates.form.academicPeriod">
          <AppAutocomplete v-model="v$.form.academicPeriodId.$model" :options="[matriculate.academicPeriodGroup.academicPeriod]" :clearable="false" disabled />
        </AppFormField>

        <AppFormField :form-control="v$.form.academicPeriodGroupId" class="xl:tw-col-span-5" label="academicAdministration.matriculates.form.course">
          <AppAutocomplete v-model="v$.form.academicPeriodGroupId.$model" :options="[matriculate.academicPeriodGroup]" label="courseName" :clearable="false" disabled />
        </AppFormField>

        <div class="sm:tw-col-span-2 xl:tw-col-span-3">
          <div class="tw-flex tw-flex-col tw-items-end">
            <label>{{ t('academicAdministration.matriculates.form.quota') }}</label>

            <h2>
              {{ matriculate.academicPeriodGroup.quota ?? t('academicAdministration.matriculates.form.notAssigned') }}
            </h2>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-4">
          <StudentFormParents :matriculateId="matriculate.id" />
        </div>

        <!-- Form -->
        <div class="col">
          <section>
            <h4 class="text-capitalize">
              {{ t('academicAdministration.matriculates.form.sectionOne') }}
            </h4>

            <div class="form-row">
              <AppFormField :form-control="v$.form.peopleForm.identificationType" label="academicAdministration.people.identificationType">
                <AppAutocomplete v-model="v$.form.peopleForm.identificationType.$model" :options="identificationTypes" :clearable="false" />
              </AppFormField>

              <AppFormField :form-control="v$.form.peopleForm.identification" label="academicAdministration.people.identification">
                <input v-model="v$.form.peopleForm.identification.$model" type="text" class="form-control" />
              </AppFormField>
            </div>

            <div class="form-row">
              <AppFormField :form-control="v$.form.peopleForm.name" label="academicAdministration.people.name">
                <input v-model="v$.form.peopleForm.name.$model" type="text" class="form-control" />
              </AppFormField>

              <AppFormField :form-control="v$.form.peopleForm.lastname" label="academicAdministration.people.lastname">
                <input v-model="v$.form.peopleForm.lastname.$model" type="text" class="form-control" />
              </AppFormField>
            </div>

            <div class="form-row">
              <AppFormField :form-control="v$.form.peopleForm.email" label="academicAdministration.people.email">
                <input v-model="v$.form.peopleForm.email.$model" type="text" class="form-control" />
              </AppFormField>

              <AppFormField :form-control="v$.form.peopleForm.mobile" label="academicAdministration.people.mobile">
                <input v-model="v$.form.peopleForm.mobile.$model" type="text" class="form-control" />
              </AppFormField>
            </div>

            <div class="form-row">
              <AppFormField :form-control="v$.form.peopleForm.homePhone" label="academicAdministration.people.homePhone">
                <input v-model="v$.form.peopleForm.homePhone.$model" type="text" class="form-control" />
              </AppFormField>

              <AppFormField :form-control="v$.form.peopleForm.workPhone" label="Teléfono de emergencia">
                <input v-model="v$.form.peopleForm.workPhone.$model" type="text" class="form-control" />
              </AppFormField>
            </div>
          </section>

          <hr />

          <section>
            <h4 class="text-capitalize">Contactos de salida</h4>

            <div class="form-row">
              <AppFormField :form-control="v$.form.peopleForm.outputContactOneName" label="Nombre">
                <input v-model="v$.form.peopleForm.outputContactOneName.$model" type="text" class="form-control" />
              </AppFormField>

              <AppFormField :form-control="v$.form.peopleForm.outputContactOneNumber" label="celular">
                <input v-model="v$.form.peopleForm.outputContactOneNumber.$model" type="text" class="form-control" />
              </AppFormField>
            </div>

            <div class="form-row">
              <AppFormField :form-control="v$.form.peopleForm.outputContactTwoName" label="Nombre">
                <input v-model="v$.form.peopleForm.outputContactTwoName.$model" type="text" class="form-control" />
              </AppFormField>

              <AppFormField :form-control="v$.form.peopleForm.outputContactTwoNumber" label="celular">
                <input v-model="v$.form.peopleForm.outputContactTwoNumber.$model" type="text" class="form-control" />
              </AppFormField>
            </div>

            <AppFormField :form-control="v$.form.peopleForm.observations" label="Observaciones">
              <AppVoiceInput v-model="v$.form.peopleForm.observations.$model" textareaClass="form-control" />

            </AppFormField>
          </section>

          <hr />

          <section>
            <h4 class="text-capitalize">Información Personal</h4>

            <div class="form-row">
              <AppFormField :form-control="v$.form.peopleForm.gender" label="academicAdministration.people.gender">
                <AppAutocomplete v-model="v$.form.peopleForm.gender.$model" :options="genders" />
              </AppFormField>

              <AppFormField :form-control="v$.form.peopleForm.countryBirth" label="País de nacimiento">
                <AppGeographicSearch
                  :search-key="'country'"
                  :id="v$.form.peopleForm.countryBirth.$model"
                  @geographic-data="(data) => (v$.form.peopleForm.countryBirth.$model = data.id)"
                ></AppGeographicSearch>
              </AppFormField>
            </div>
            <div class="row">
              <AppFormField :form-control="v$.form.peopleForm.regionBirth" label="departamento de nacimiento">
                <AppGeographicSearch
                  :search-key="'region'"
                  :id="v$.form.peopleForm.regionBirth.$model"
                  @geographic-data="(data) => (v$.form.peopleForm.regionBirth.$model = data.id)"
                ></AppGeographicSearch>
              </AppFormField>

              <AppFormField :form-control="v$.form.peopleForm.municipalityBirth" label="municipio de nacimiento">
                <AppGeographicSearch
                  :search-key="'city'"
                  :id="v$.form.peopleForm.municipalityBirth.$model"
                  @geographic-data="(data) => (v$.form.peopleForm.municipalityBirth.$model = data.id)"
                ></AppGeographicSearch>
              </AppFormField>
            </div>

            <div class="form-row">
              <AppFormField :form-control="v$.form.peopleForm.birthday" label="Fecha de nacimiento">
                <input type="date" class="form-control" v-model="v$.form.peopleForm.birthday.$model" />
              </AppFormField>

              <AppFormField :form-control="v$.form.peopleForm.religion" label="academicAdministration.people.religion">
                <input v-model="v$.form.peopleForm.religion.$model" type="text" class="form-control" />
              </AppFormField>
            </div>

            <div class="form-row">
              <AppFormField :form-control="v$.form.peopleForm.nationality" label="academicAdministration.people.nationality">
                <input v-model="v$.form.peopleForm.nationality.$model" type="text" class="form-control" />
              </AppFormField>

              <AppFormField :form-control="v$.form.peopleForm.primaryLanguage" label="academicAdministration.people.primaryLanguage">
                <input v-model="v$.form.peopleForm.primaryLanguage.$model" type="text" class="form-control" />
              </AppFormField>
            </div>

            <div class="form-row">
              <AppFormField :form-control="v$.form.peopleForm.direction" label="Dirección de residencia">
                <input v-model="v$.form.peopleForm.direction.$model" type="text" class="form-control" />
              </AppFormField>

              <AppFormField :form-control="v$.form.peopleForm.zone" label="Zona de residencia">
                <input v-model="v$.form.peopleForm.zone.$model" type="text" class="form-control" />
              </AppFormField>
            </div>
          </section>

          <hr />

          <section>
            <h4 class="text-capitalize">
              {{ t('academicAdministration.matriculates.form.matriculateSection') }}
            </h4>

            <div class="row">
              <AppFormField :form-control="v$.form.peopleForm.enrollmentDate" label="Fecha de inscripción">
                <input class="form-control" v-model="v$.form.peopleForm.enrollmentDate.$model" type="date" />
              </AppFormField>

              <AppFormField :form-control="v$.form.codeStudent" label="academicAdministration.matriculates.form.codeStudent">
                <input class="form-control" type="text" id="codeStudent" v-model="v$.form.codeStudent.$model" />
              </AppFormField>
            </div>

            <div class="form-row">
              <AppFormField :form-control="v$.form.codeMEN" label="Código ministerio">
                <input class="form-control" type="text" id="codeMEN" v-model="v$.form.codeMEN.$model" />
              </AppFormField>

              <AppFormField :form-control="v$.form.studentCategoryId" label="academicAdministration.matriculates.form.studentCategory">
                <AppAutocomplete v-model="v$.form.studentCategoryId.$model" :options="studentCategories" input-id="studentCategoryId"></AppAutocomplete>
              </AppFormField>
            </div>

            <div class="form-row">
              <AppFormField :form-control="v$.form.peopleForm.scholarshipTypeId" label="Tipo de beca">
                <AppAutocomplete v-model="v$.form.peopleForm.scholarshipTypeId.$model" :options="scholarshipTypes" input-id="scholarshipTypeId"></AppAutocomplete>
              </AppFormField>

              <AppFormField :form-control="v$.form.peopleForm.schoolInsuranceId" label="Seguro escolar">
                <AppAutocomplete v-model="v$.form.peopleForm.schoolInsuranceId.$model" :options="schoolInsurance" input-id="schoolInsuranceId"></AppAutocomplete>
              </AppFormField>
            </div>
          </section>
        </div>
      </div>
    </form>
  </template>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, reactive, Ref, ref, watch } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';
import { debounce } from 'ts-debounce';

import StudentFormParents from './StudentFormParents.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppGeographicSearch from '../../../shared/components/Forms/AppGeographicSearch.vue';

import { MatriculateDetailDto } from '../dto/matriculate.dto';

import { CreateOrUpdateMatriculateService } from '../services/createOrUpdateMatriculate.service';
import { GetMatriculateRelatedDataFormService } from '../../../shared/services/getMatriculateRelatedDataForm.service';
import { GetScholarShipService } from '../../institutionalConfiguration/services/getScholarShipType.service';
import { GetInsuranceService } from '../../institutionalConfiguration/services/getInsurance.service';
import { FindAllRegionsForSelectService } from '../../../shared/services/findAllRegionsForSelect.service';
import { FindAllCountriesForSelectService } from '../../../shared/services/findAllCountriesForSelect.service';
import { FindAllMunicipalitiesForSelectService } from '../../../shared/services/findAllMunicipalitiesForSelect.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const getMatriculateRelatedDataFormService = new GetMatriculateRelatedDataFormService();
const createOrUpdateMatriculateService = new CreateOrUpdateMatriculateService();
const getScholarShipService = new GetScholarShipService();
const getInsuranceService = new GetInsuranceService();
const findAllMunicipalitiesForSelectService = new FindAllMunicipalitiesForSelectService();
const findAllCountriesForSelectService = new FindAllCountriesForSelectService();
const findAllRegionsForSelectService = new FindAllRegionsForSelectService();

export default defineComponent({
  name: 'StudentFormLite',

  components: {
    AppGeographicSearch,
    StudentFormParents,
    AppAutocomplete,
    AppFormField,
    AppLoading,
    AppVoiceInput,
  },

  props: {
    matriculate: {
      type: Object as PropType<MatriculateDetailDto>,
      required: true,
    },
    onSave: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['reload'],

  setup(props, { emit }) {
    const { t } = useI18n();

    const matriculateData: Ref<MatriculateDetailDto> = ref(props.matriculate);

    const identificationTypes: Ref<any[]> = ref([]);
    const studentCategories: Ref<any[]> = ref([]);
    const scholarshipTypes = ref<any[]>([]);
    const schoolInsurance = ref<any[]>([]);
    const genders: Ref<any[]> = ref([]);
    const countriesBirth: { value: any[] } = reactive({
      value: [],
    });
    const regionsBirth: { value: any[] } = reactive({
      value: [],
    });
    const municipalitiesBirth: { value: any[] } = reactive({
      value: [],
    });

    const loading = ref(true);

    const form: any = reactive({
      academicPeriodId: matriculateData.value?.academicPeriodGroup?.academicPeriod.id,
      academicPeriodGroupId: matriculateData.value?.academicPeriodGroupId,
      studentCategoryId: matriculateData.value?.studentCategoryId,
      codeStudent: matriculateData.value?.student.code,
      codeMEN: matriculateData.value?.student.codeMEN,
      peopleForm: {
        identificationType: matriculateData.value?.student?.people.identificationTypeId,
        identification: matriculateData.value?.student?.people.identification,
        name: matriculateData.value?.student.people?.names,
        lastname: matriculateData.value?.student?.people?.lastnames,
        mobile: matriculateData.value?.student.people?.mobile,
        email: matriculateData.value?.student.people?.email,
        homePhone: matriculateData.value?.student.people?.homePhone,
        workPhone: matriculateData.value?.student.people.workPhone,
        gender: matriculateData.value?.student.people.genderId,
        religion: matriculateData.value?.student.people.religion,
        nationality: matriculateData.value?.student.people.nationality,
        primaryLanguage: matriculateData.value?.student.people.primaryLanguage,
        country: matriculateData.value?.student.people.homeMunicipality.region.country.id,
        region: matriculateData.value?.student.people.homeMunicipality.region.id,
        municipality: matriculateData.value?.student?.people.homeMunicipality?.id,
        direction: matriculateData.value?.student.people.direction,
        countryBirth: matriculateData.value?.student.people.birthMunicipality.region.country.id,
        regionBirth: matriculateData.value?.student.people.birthMunicipality.region.id,
        municipalityBirth: matriculateData.value?.student.people.birthMunicipality.id,
        birthday: matriculateData.value?.student.people.birthDate,
        registrationDate: null,
        enrollmentDate: matriculateData.value?.student.people.enrollmentDate
          ? matriculateData.value?.student.people.enrollmentDate.split(' ')[0] || ''
          : matriculateData.value?.student.people.createdAt?.split(' ')[0] || '',
        outputContactOneName: matriculateData.value?.student.people.outputContactNameOne,
        outputContactOneNumber: matriculateData.value?.student.people.outputContactPhoneOne,
        outputContactTwoName: matriculateData.value?.student.people.outputContactNameTwo,
        outputContactTwoNumber: matriculateData.value?.student.people.outputContactPhoneTwo,
        observations: matriculateData.value?.student.people.observations,
        zone: matriculateData.value?.student.people.zone,
        scholarshipTypeId: matriculateData.value?.student.people.scholarshipTypeId,
        schoolInsuranceId: matriculateData.value?.student.people.schoolInsuranceId,
      },
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          academicPeriodGroupId: { required },
          studentCategoryId: {},
          codeStudent: {},
          codeMEN: {},
          peopleForm: {
            identificationType: { required },
            identification: { required },
            name: { required },
            lastname: { required },
            mobile: {},
            email: { required },
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
            registrationDate: {},
            enrollmentDate: {},
            outputContactOneName: {},
            outputContactOneNumber: {},
            outputContactTwoName: {},
            outputContactTwoNumber: {},
            observations: {},
            zone: {},
            scholarshipTypeId: {},
            schoolInsuranceId: {},
          },
        },
      },
      { form }
    );

    onMounted(async () => {
      loading.value = true;

      try {
        const relatedData = await getMatriculateRelatedDataFormService.run();

        identificationTypes.value = relatedData.identificationTypes;
        studentCategories.value = relatedData.studentCategories;
        genders.value = relatedData.genders;

        scholarshipTypes.value = await getScholarShipService.run();
        schoolInsurance.value = await getInsuranceService.run();
      } catch (e) {
        console.log('err', e);
      }

      loading.value = false;
    });

    watch(
      () => props.onSave,
      () => {
        save();
      }
    );

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      const people: any = {
        identification: form.peopleForm.identification,
        identificationTypeId: form.peopleForm.identificationType,
        names: form.peopleForm.name,
        lastnames: form.peopleForm.lastname,
        mobile: form.peopleForm.mobile,
        email: form.peopleForm.email,
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
        createdAt: form.peopleForm.registrationDate,
        enrollmentDate: form.peopleForm.enrollmentDate,

        outputContactNameOne: form.peopleForm.outputContactOneName,
        outputContactPhoneOne: form.peopleForm.outputContactOneNumber,
        outputContactNameTwo: form.peopleForm.outputContactTwoName,
        outputContactPhoneTwo: form.peopleForm.outputContactTwoNumber,
        observations: form.peopleForm.observations,
        zone: form.peopleForm.zone,
        scholarshipTypeId: form.peopleForm.scholarshipTypeId,
        schoolInsuranceId: form.peopleForm.schoolInsuranceId,
      };

      const student = {
        id: matriculateData.value?.student?.id ?? null,
        code: form.codeStudent,
        codeMEN: form.codeMEN,
      };

      const matriculate: any = {
        academicPeriodGroupId: form.academicPeriodGroupId,
        studentCategoryId: form.studentCategoryId,
      };

      if (matriculateData.value?.student.people?.id) {
        people.id = matriculateData.value?.student.people?.id;
        matriculate.id = matriculateData.value?.id;
      }
      // The 'user' key is missing
      // if (matriculateData.value?.student.people?.user) {
      //   people.user = matriculateData.value.student.people.user;
      // }

      try {
        const dataSend = { matriculate, student, people };

        await createOrUpdateMatriculateService.run(dataSend);
      } catch (e) {
        console.log(e);
      }

      emit('reload');
    };
    const searchCountryBirth = debounce(async (search: string, loading: Function) => {
      if (search) {
        loading(true);

        if (search.length < 2) {
          countriesBirth.value = [];
        }

        if (search.length >= 2) {
          countriesBirth.value = [];
          const response = await findAllCountriesForSelectService.run({
            search: search,
          });

          response.data.forEach((country: any) => {
            countriesBirth.value.push(country);
          });
        }

        loading(false);
      }
    }, 800);

    const searchRegionsBirth = debounce(async (search: string, loading: Function) => {
      if (search) {
        loading(true);

        if (search.length < 2) {
          regionsBirth.value = [];
        }

        if (search.length >= 2) {
          regionsBirth.value = [];
          let params = {
            search: search,
            countryId: form.peopleForm.countryBirth,
          };
          const response = await findAllRegionsForSelectService.run(params);

          response.data.forEach((region: any) => {
            regionsBirth.value.push(region);
          });
        }

        loading(false);
      }
    }, 800);

    const searchMunicipalitiesBirth = debounce(async (search: string, loading: Function) => {
      if (search) {
        loading(true);

        if (search.length < 2) {
          municipalitiesBirth.value = [];
        }

        if (search.length >= 2) {
          municipalitiesBirth.value = [];
          let params = {
            search: search,
            regionId: form.peopleForm.regionBirth,
          };
          const response = await findAllMunicipalitiesForSelectService.run(params);

          response.data.forEach((municipality: any) => {
            municipalitiesBirth.value.push(municipality);
          });
        }

        loading(false);
      }
    }, 800);

    return {
      loading,
      v$,
      t,

      identificationTypes,
      studentCategories,
      scholarshipTypes,
      schoolInsurance,
      genders,
      searchMunicipalitiesBirth,
      searchRegionsBirth,
      searchCountryBirth,
      municipalitiesBirth,
      countriesBirth,
      regionsBirth,
      save,
    };
  },
});
</script>
