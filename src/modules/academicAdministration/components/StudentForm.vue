<template>
  <AppBaseList :title="title" isCard>
    <template #actions>
      <!-- <AppButton v-if="!enrollsMatriculates" label="Información complementaria" @click="openModalInfoComplementaria"></AppButton>
      <AppButton v-else label=" Ver Información complementaria" @click="redirect"></AppButton> -->

      <AppButtonBack v-if="editForm || fromAdmin" :to="{ name: 'academicAdministration.enrolledByCourse' }"> </AppButtonBack>

      <AppButton style="color: white" v-if="validateUser" label="core.save" @click="save"></AppButton>
    </template>
    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <div v-if="!validateUser">
          <div>
            <form @submit.prevent="validateIdentification">
              <h5 class="h6 mb-4">
                {{ t('academicAdministration.matriculates.form.validateIdentificationText') }}
              </h5>

              <AppFormField :form-control="formIdentification$.form.identification" label="academicAdministration.people.identification">
                <input id="identification" type="text" class="form-control" v-model="formIdentification$.form.identification.$model" />
              </AppFormField>

              <div class="d-flex justify-content-center">
                <AppButton label="academicAdministration.matriculates.form.btnValidate" native-type="submit"></AppButton>
              </div>
            </form>
          </div>
        </div>
        <form @submit.prevent="save" v-else>
          <div class="row">
            <AppFormField :form-control="v$.form.academicPeriodId" class="col-4" label="academicAdministration.matriculates.form.academicPeriod">
              <AppAutocomplete
                v-model="v$.form.academicPeriodId.$model"
                :disabled="editForm || fromAdmin"
                :input-id="'academicPeriodId'"
                :options="academicPeriods"
                :clearable="false"
                class="bg-white"
              >
              </AppAutocomplete>
            </AppFormField>

            <AppFormField :form-control="v$.form.academicPeriodGroupId" class="col-5" label="academicAdministration.matriculates.form.course">
              <AppAutocomplete
                :disabled="editForm || fromAdmin || !currentAcademicPeriodGroups.value.length"
                v-model="v$.form.academicPeriodGroupId.$model"
                :options="currentAcademicPeriodGroups.value"
                :input-id="'academicPeriodGroupId'"
                label="courseName"
                :clearable="false"
                class="bg-white"
              >
              </AppAutocomplete>
            </AppFormField>

            <div class="col d-flex flex-column">
              <label>{{ 'Cupos establecidos' }}</label>
              <h2>
                {{ quota() ?? t('academicAdministration.matriculates.form.notAssigned') }}
              </h2>
            </div>
          </div>
          <spam>{{ t('core.generalTerms.academic.parents.plural') }}</spam>
          <div class="row mt-1">
            <!-- Tutors -->
            <div class="col-4">
              <div class="content-tutores" v-tooltip="!editForm ? t('academicAdministration.matriculates.form.saveFirst') : ''">
                <div class="button-tutores d-flex align-items-center p-2 bg-white border-bottom shadow-sm" v-for="(item, index) in matriculatesParents.value" :key="index">
                  <div style="display: flex; align-items: center; width: 100%; text-align: center">
                    <AppIcon @click="toParents(item)" type="button" icon="user-circle" class="text-primary me-3 fs-5" />

                    <div @click="toParents(item)" style="width: 100%; border-right: 2px solid #dee2e6; padding-right: 20px" type="button" class="d-flex flex-column text-start">
                      <h5 class="m-0">{{ item.people.names }}</h5>
                      <span>{{ item.people.lastnames }} </span>
                    </div>
                  </div>

                  <div style="padding-left: 10px">
                    <AppButtonDelete @click="openConfirmDelete(item)"></AppButtonDelete>
                  </div>
                </div>

                <AppModal v-model="signatureDelete">
                  <AppConfirmDeleteModal v-if="signatureDelete" entity="Acudiente" @confirmDelete="confirmDelete" @close="signatureDelete = false"> </AppConfirmDeleteModal>
                </AppModal>

                <button class="button-tutores d-flex align-items-center p-3 bg-white shadow-sm" :disabled="!editForm" @click="toParents()" type="button">
                  <AppIcon icon="user-plus" class="text-primary me-3" />

                  <div class="d-flex flex-column text-start">
                    <h5 class="m-0">{{ t('core.new') }}</h5>
                    <span>{{ t('core.generalTerms.academic.parents.singular') }}</span>
                  </div>
                </button>
              </div>
            </div>
            <!-- Form -->
            <div class="col bg-white p-4 shadow-sm">
              <section>
                <h4 class="text-capitalize">
                  {{ t('academicAdministration.matriculates.form.sectionOne') }}
                </h4>
                <div class="form-row">
                  <AppFormField :form-control="v$.form.peopleForm.identificationType" label="academicAdministration.people.identificationType">
                    <AppAutocomplete
                      v-model="v$.form.peopleForm.identificationType.$model"
                      :options="identificationTypes"
                      input-id="identificationType"
                      :clearable="false"
                      class="bg-white"
                    ></AppAutocomplete>
                  </AppFormField>
                  <AppFormField :form-control="v$.form.peopleForm.identification" label="academicAdministration.people.identification">
                    <input :disabled="!editForm" class="form-control" type="text" id="identification" v-model="v$.form.peopleForm.identification.$model" />
                  </AppFormField>
                </div>
                <div class="form-row">
                  <AppFormField :form-control="v$.form.peopleForm.name" label="academicAdministration.people.name">
                    <input class="form-control" type="text" id="name" v-model="v$.form.peopleForm.name.$model" />
                  </AppFormField>
                  <AppFormField :form-control="v$.form.peopleForm.lastname" label="academicAdministration.people.lastname">
                    <input class="form-control" type="text" id="lastname" v-model="v$.form.peopleForm.lastname.$model" />
                  </AppFormField>
                </div>
                <div class="form-row">
                  <AppFormField :form-control="v$.form.peopleForm.email" label="academicAdministration.people.email">
                    <input class="form-control" type="text" id="email" v-model="v$.form.peopleForm.email.$model" />
                  </AppFormField>
                  <AppFormField :form-control="v$.form.peopleForm.mobile" label="academicAdministration.people.mobile">
                    <input class="form-control" type="text" id="mobile" v-model="v$.form.peopleForm.mobile.$model" />
                  </AppFormField>
                </div>
                <div class="form-row">
                  <AppFormField :form-control="v$.form.peopleForm.homePhone" label="academicAdministration.people.homePhone">
                    <input class="form-control" type="text" id="homePhone" v-model="v$.form.peopleForm.homePhone.$model" />
                  </AppFormField>
                  <AppFormField :form-control="v$.form.peopleForm.workPhone" label="Teléfono de emergencia">
                    <input class="form-control" type="text" id="workPhone" v-model="v$.form.peopleForm.workPhone.$model" />
                  </AppFormField>
                </div>

                <hr />
                <section>
                  <h4 class="text-capitalize">Contactos de salida</h4>
                  <div class="form-row">
                    <AppFormField :form-control="v$.form.peopleForm.outputContactOneName" label="Nombre">
                      <input class="form-control" type="text" id="outputContactOne" v-model="v$.form.peopleForm.outputContactOneName.$model" />
                    </AppFormField>
                    <AppFormField :form-control="v$.form.peopleForm.outputContactOneNumber" label="celular">
                      <input class="form-control" type="text" id="outputContactOneNumber" v-model="v$.form.peopleForm.outputContactOneNumber.$model" />
                    </AppFormField>
                  </div>
                  <div class="form-row">
                    <AppFormField :form-control="v$.form.peopleForm.outputContactTwoName" label="Nombre">
                      <input class="form-control" type="text" id="outputContactTwo" v-model="v$.form.peopleForm.outputContactTwoName.$model" />
                    </AppFormField>
                    <AppFormField :form-control="v$.form.peopleForm.outputContactTwoNumber" label="celular">
                      <input class="form-control" type="text" id="outputContactTwoNumber" v-model="v$.form.peopleForm.outputContactTwoNumber.$model" />
                    </AppFormField>
                  </div>
                  <div class="form-row" style="padding: ">
                    <AppFormField :form-control="v$.form.peopleForm.observations" label="Observaciones">
                     
                      <AppVoiceInput v-model="v$.form.peopleForm.observations.$model" textareaClass="form-control" />

                    </AppFormField>
                  </div>
                </section>
              </section>

              <hr />
              <section>
                <h4 class="text-capitalize">Información Personal</h4>

                <div class="form-row">
                  <AppFormField :form-control="v$.form.peopleForm.gender" label="academicAdministration.people.gender">
                    <AppAutocomplete v-model="v$.form.peopleForm.gender.$model" :options="genders" input-id="gender"> </AppAutocomplete>
                  </AppFormField>
                  <AppFormField :form-control="v$.form.peopleForm.countryBirth" label="País de nacimiento">
                    <AppGeographicSearch :search-key="'country'" :id="v$.form.peopleForm.countryBirth.$model" @geographic-data="(data) => (v$.form.peopleForm.countryBirth.$model = data.id)">
                    </AppGeographicSearch>
                  </AppFormField>
                </div>
                <div class="row">
                  <AppFormField :form-control="v$.form.peopleForm.regionBirth" label="Departamento de nacimiento">
                    <AppGeographicSearch
                      :search-key="'region'"
                      :country-id="v$.form.peopleForm.countryBirth.$model"
                      :id="v$.form.peopleForm.regionBirth.$model"
                      @geographic-data="(data) => (v$.form.peopleForm.regionBirth.$model = data.id)"
                    >
                    </AppGeographicSearch>
                  </AppFormField>
                  <AppFormField :form-control="v$.form.peopleForm.municipalityBirth" label="Municipio de nacimiento">
                    <AppGeographicSearch
                      :search-key="'city'"
                      :country-id="v$.form.peopleForm.countryBirth.$model"
                      :region-id="v$.form.peopleForm.regionBirth.$model"
                      :id="v$.form.peopleForm.municipalityBirth.$model"
                      @geographic-data="(data) => (v$.form.peopleForm.municipalityBirth.$model = data.id)"
                    >
                    </AppGeographicSearch>
                  </AppFormField>
                </div>
                <div class="row">
                  <AppFormField :form-control="v$.form.peopleForm.birthday" label="Fecha de nacimiento">
                    <input class="form-control" type="date" v-model="v$.form.peopleForm.birthday.$model" />
                  </AppFormField>
                  <AppFormField :form-control="v$.form.peopleForm.religion" label="academicAdministration.people.religion">
                    <input class="form-control" type="text" id="religion" v-model="v$.form.peopleForm.religion.$model" />
                  </AppFormField>
                </div>
                <div class="form-row">
                  <AppFormField :form-control="v$.form.peopleForm.nationality" label="academicAdministration.people.nationality">
                    <input class="form-control" type="text" id="nationality" v-model="v$.form.peopleForm.nationality.$model" />
                  </AppFormField>
                  <AppFormField :form-control="v$.form.peopleForm.primaryLanguage" label="academicAdministration.people.primaryLanguage">
                    <input class="form-control" type="text" id="primaryLanguage" v-model="v$.form.peopleForm.primaryLanguage.$model" />
                  </AppFormField>
                </div>
                <div class="row">
                  <AppFormField :form-control="v$.form.peopleForm.direction" label="Dirección de residencia">
                    <input class="form-control" type="text" v-model="v$.form.peopleForm.direction.$model" />
                  </AppFormField>
                  <AppFormField :form-control="v$.form.peopleForm.zone" label="Zona de residencia">
                    <input class="form-control" type="text" id="zone" v-model="v$.form.peopleForm.zone.$model" />
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
                    <AppAutocomplete v-model="v$.form.peopleForm.scholarshipTypeId.$model" :options="scholarshipType" input-id="scholarshipTypeId"></AppAutocomplete>
                  </AppFormField>
                  <AppFormField :form-control="v$.form.peopleForm.schoolInsuranceId" label="Seguro escolar">
                    <AppAutocomplete v-model="v$.form.peopleForm.schoolInsuranceId.$model" :options="schoolInsurance" input-id="schoolInsuranceId"></AppAutocomplete>
                  </AppFormField>
                </div>
              </section>
            </div>
          </div>
        </form>
        <template v-if="data">
          <AppModal v-model="infoComple" size="lg">
            <AdditionalInformationForm v-if="infoComple" :matriculateId="data.id" @close="closeModalInfoComplementaria"> </AdditionalInformationForm>
          </AppModal>
        </template>
      </template>
    </template>
  </AppBaseList>
</template>
<script lang="ts">
import { defineComponent, onMounted, reactive, Ref, ref, watch } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useVuelidate } from '@vuelidate/core';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppGeographicSearch from '../../../shared/components/Forms/AppGeographicSearch.vue';
import AdditionalInformationForm from '../components/AdditionalInformationForm.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { EnrolledStudentDto } from '../dto/enrolledStudent.dto';
import { GetMatriculatesParentsService } from '../services/getMatriculatesParents.service';
import { CreateOrUpdateMatriculateService } from '../services/createOrUpdateMatriculate.service';
import { GetStudentByIdentificationService } from '../services/getStudentByIdentification.service';
import { GetMatriculateRelatedDataFormService } from '../../../shared/services/getMatriculateRelatedDataForm.service';
import { GetEnrolMatriculateService } from '../services/getEnrolMatriculate.service';
import { GetScholarShipService } from '../../institutionalConfiguration/services/getScholarShipType.service';
import { GetInsuranceService } from '../../institutionalConfiguration/services/getInsurance.service';
import { DeleteMatriculateParentByIdservice } from '../services/deleteMatriculateParentById.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const getMatriculateRelatedDataFormService = new GetMatriculateRelatedDataFormService();
const getScholarShipService = new GetScholarShipService();
const getInsuranceService = new GetInsuranceService();
const getStudentByIdentificationService = new GetStudentByIdentificationService();
const createOrUpdateMatriculateService = new CreateOrUpdateMatriculateService();
const getMatriculatesParentsService = new GetMatriculatesParentsService();
const getEnrolMatriculateService = new GetEnrolMatriculateService();
const deleteMatriculateParentByIdservice = new DeleteMatriculateParentByIdservice();

export default defineComponent({
  name: 'StudentForm',
  props: ['title', 'routes', 'data', 'fromAdmin'],
  components: {
    AdditionalInformationForm,
    AppConfirmDeleteModal,
    AppGeographicSearch,
    AppButtonDelete,
    AppAutocomplete,
    AppButtonBack,
    AppFormField,
    AppBaseList,
    AppLoading,
    AppButton,
    AppIcon,
    AppModal,
    AppVoiceInput,
  },

  setup(props) {
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const data: Ref<EnrolledStudentDto | any> = ref(props.data);
    const currentAcademicPeriodGroupId = ref();
    const academicPeriodGroups = ref();
    const identificationTypes = ref();
    const studentCategories = ref();
    const academicPeriods = ref();
    const genders = ref();
    const scholarshipType = ref<any[]>([]);
    const schoolInsurance = ref<any[]>([]);
    const infoComple = ref(false);
    const quotasAvailable = ref<number>(0);
    const matriculateId = ref<number>();
    const enrollsMatriculates = ref<any>(null);
    const currentDataDelete: { value: any } = reactive({
      value: null,
    });
    const signatureDelete = ref(false);

    const validateUser = ref(false);
    const editForm = ref(false);
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
      {
        form: formIdentification,
      }
    );
    const form: any = reactive({
      academicPeriodId: null,
      academicPeriodGroupId: null,
      studentCategoryId: null,
      codeStudent: null,
      codeMEN: null,
      peopleForm: {
        identificationType: null,
        identification: null,
        name: null,
        lastname: null,
        mobile: null,
        email: null,
        homePhone: null,
        workPhone: null,
        gender: null,
        religion: null,
        nationality: null,
        primaryLanguage: null,
        country: null,
        region: null,
        municipality: null,
        direction: null,
        countryBirth: null,
        regionBirth: null,
        municipalityBirth: null,
        birthday: null,
        registrationDate: null,
        enrollmentDate: null,
        outputContactOneName: null,
        outputContactOneNumber: null,
        outputContactTwoName: null,
        outputContactTwoNumber: null,
        observations: null,
        zone: null,
        scholarshipTypeId: null,
        schoolInsuranceId: null,
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
    const currentAcademicPeriodGroups: { value: any[] } = reactive({
      value: [],
    });
    const matriculatesParents: { value: any[] } = reactive({
      value: [],
    });
    onMounted(async () => {
      loading.value = true;

      if (data.value) {
        const params = {
          matriculateId: data.value.id,
        };
        enrollsMatriculates.value = await getEnrolMatriculateService.run(params);
      }

      currentAcademicPeriodGroupId.value = route.params.academicPeriodGroupId;
      let relatedDataForm = await getMatriculateRelatedDataFormService.run();

      academicPeriodGroups.value = relatedDataForm.academicPeriodGroups;
      identificationTypes.value = relatedDataForm.identificationTypes;
      studentCategories.value = relatedDataForm.studentCategories;
      academicPeriods.value = relatedDataForm.academicPeriods;
      genders.value = relatedDataForm.genders;

      let scholarshipTypeDataForm = await getScholarShipService.run();
      scholarshipType.value = scholarshipTypeDataForm;

      let schoolInsuranceDataForm = await getInsuranceService.run();
      schoolInsurance.value = schoolInsuranceDataForm;

      if (data.value?.id) {
        editForm.value = true;
        await initForm();
        matriculatesParents.value = await getMatriculatesParentsService.run(data.value.id);
        validateUser.value = true;
      }
      loading.value = false;
    });
    watch(v$.value.form.academicPeriodId, () => {
      if (form.academicPeriodId) {
        onChangeAcademicPeriod();
      }
    });
    const onChangeAcademicPeriod = () => {
      currentAcademicPeriodGroups.value = [];
      academicPeriodGroups.value.forEach((academicPeriodGroup: any) => {
        if (academicPeriodGroup.academicPeriodId == form.academicPeriodId) {
          currentAcademicPeriodGroups.value.push(academicPeriodGroup);
        }
      });
    };
    const quota = () => {
      let quota = null;
      if (form.academicPeriodId) {
        currentAcademicPeriodGroups.value.forEach((currentAcademicPeriodGroup: any) => {
          if (form.academicPeriodGroupId == currentAcademicPeriodGroup.id) {
            quota = currentAcademicPeriodGroup.quota;
          }
        });
      }
      return quota;
    };
    const validateIdentification = async () => {
      const isValid = await formIdentification$.value.$validate();
      if (!isValid) return;
      try {
        const response = await getStudentByIdentificationService.run(formIdentification.identification);
        data.value = {
          id: null,
          academicPeriodGroupId: null,
          student: {
            ...response.student,
            people: response.people,
          },
        };
      } catch (e) {
        console.log(e);
      }
      initForm();
      validateUser.value = true;
      form.peopleForm.identification = formIdentification.identification;
    };
    const initForm = () => {
      form.academicPeriodId = data.value?.academicPeriodGroup?.academicPeriod.id;
      form.academicPeriodGroupId = data.value?.academicPeriodGroupId;
      form.studentCategoryId = data.value?.studentCategoryId;
      form.codeStudent = data.value?.student.code;
      form.codeMEN = data.value?.student.codeMEN;
      form.peopleForm.identification = data.value?.student.people?.identification;
      form.peopleForm.identificationType = data.value?.student.people?.identificationTypeId;
      form.peopleForm.name = data.value?.student.people?.names;
      form.peopleForm.lastname = data.value?.student.people?.lastnames;
      form.peopleForm.mobile = data.value?.student.people?.mobile;
      form.peopleForm.email = data.value?.student.people?.email;
      form.peopleForm.country = data.value?.student.people?.homeMunicipality?.region?.country?.id;
      form.peopleForm.region = data.value?.student.people?.homeMunicipality?.region?.id;
      form.peopleForm.municipality = data.value?.student.people?.homeMunicipality?.id;
      form.peopleForm.direction = data.value?.student.people?.direction;
      form.peopleForm.countryBirth = data.value?.student.people?.birthMunicipality?.region?.country?.id;
      form.peopleForm.regionBirth = data.value?.student.people?.birthMunicipality?.region?.id;
      form.peopleForm.municipalityBirth = data.value?.student.people?.birthMunicipality?.id;
      form.peopleForm.gender = data.value?.student.people?.genderId;
      form.peopleForm.birthday = data.value?.student.people?.birthDate;
      form.peopleForm.homePhone = data.value?.student.people?.homePhone;
      form.peopleForm.workPhone = data.value?.student.people?.workPhone;
      form.peopleForm.religion = data.value?.student.people?.religion;
      form.peopleForm.primaryLanguage = data.value?.student.people?.primaryLanguage;
      form.peopleForm.nationality = data.value?.student.people?.nationality;
      form.peopleForm.enrollmentDate = data.value?.student.people.enrollmentDate
        ? data.value?.student.people.enrollmentDate.split(' ')[0] || ''
        : data.value?.student.people.createdAt?.split(' ')[0] || '';
      form.peopleForm.outputContactOneName = data.value?.student?.people?.outputContactNameOne;
      form.peopleForm.outputContactOneNumber = data.value?.student?.people?.outputContactPhoneOne;
      form.peopleForm.outputContactTwoName = data.value?.student?.people?.outputContactNameTwo;
      form.peopleForm.outputContactTwoNumber = data.value?.student?.people?.outputContactPhoneTwo;
      form.peopleForm.observations = data.value?.student.people.observations;
      form.peopleForm.zone = data.value?.student.people.zone;
      form.peopleForm.scholarshipTypeId = data.value.student.people.scholarshipTypeId;
      form.peopleForm.schoolInsuranceId = data.value.student.people.schoolInsuranceId;

      onChangeAcademicPeriod();
      if (currentAcademicPeriodGroupId.value) {
        let academicPeriodGroup: any = null;
        academicPeriodGroups.value.forEach((apg: any) => {
          if (currentAcademicPeriodGroupId.value == apg.id) {
            academicPeriodGroup = apg;
          }
        });
        currentAcademicPeriodGroups.value = academicPeriodGroups.value;
        form.academicPeriodId = academicPeriodGroup.academicPeriodId;
        form.academicPeriodGroupId = academicPeriodGroup.id;
      }
    };
    const toParents = async (dataTutor: any = null) => {
      if (!dataTutor) {
        await router.push({
          name: 'academicAdministration.createMatriculateParents',
          params: {
            academicPeriodGroupId: currentAcademicPeriodGroupId.value,
            matriculateId: data.value?.id,
          },
        });
      } else {
        await router.push({
          name: 'academicAdministration.editMatriculateParents',
          params: {
            academicPeriodGroupId: currentAcademicPeriodGroupId.value,
            matriculateParentId: dataTutor.id,
          },
        });
      }
    };
    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      // if (form.peopleForm.outputContactOneName !== null && form.peopleForm.outputContactOneNumber !== null) {
      //   form.peopleForm.outputContactOne = form.peopleForm.outputContactOneName + '-' + form.peopleForm.outputContactOneNumber;
      // }

      // if (form.peopleForm.outputContactTwoName !== null && form.peopleForm.outputContactTwoNumber !== null) {
      //   form.peopleForm.outputContactTwo = form.peopleForm.outputContactTwoName + '-' + form.peopleForm.outputContactTwoNumber;
      // }

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
      const matriculate: any = {
        academicPeriodGroupId: form.academicPeriodGroupId,
        studentCategoryId: form.studentCategoryId,
      };
      currentAcademicPeriodGroupId.value = matriculate.academicPeriodGroupId;
      if (data.value?.student.people?.id) {
        people.id = data.value?.student.people?.id;
        matriculate.id = data.value?.id;
      }
      if (data.value?.student.people?.user) {
        people.user = data.value.student.people.user;
      }
      const student = {
        id: data.value?.student?.id ?? null,
        code: form.codeStudent,
        codeMEN: form.codeMEN,
      };
      console.log('people', people);
      try {
        const response = await createOrUpdateMatriculateService.run({
          matriculate,
          student,
          people,
        });
        await router.push({
          name: 'academicAdministration.editMatriculate',
          params: {
            academicPeriodGroupId: currentAcademicPeriodGroupId.value,
            matriculateId: response.data.matriculateId,
          },
        });
      } catch (e) {
        console.log(e);
      }
    };
    const openModalInfoComplementaria = async () => {
      infoComple.value = true;
    };
    const closeModalInfoComplementaria = async () => {
      infoComple.value = false;
      const params = {
        matriculateId: data.value.id,
      };
      enrollsMatriculates.value = await getEnrolMatriculateService.run(params);
    };
    const redirect = async () => {
      await router.push({
        name: 'surveys.userConvocations.registration',
        params: {
          institutionId: data.value.institutionId,
          convocationId: enrollsMatriculates.value.convocationId,
          convocationEnrollId: enrollsMatriculates.value.convocationEnrolId,
        },
      });
    };

    const openConfirmDelete = async (signatureId: any) => {
      signatureDelete.value = true;
      currentDataDelete.value = signatureId;
    };

    const confirmDelete = async () => {
      try {
        await deleteMatriculateParentByIdservice.run(matriculatesParents.value[0].id);
        matriculatesParents.value = await getMatriculatesParentsService.run(data.value.id);
        validateUser.value = true;

        console.log('Respuesta de confirmación de eliminación:');
      } catch (error) {
        console.error('Error al confirmar eliminación:', error);
      }
      signatureDelete.value = false;
    };

    return {
      formIdentification$,
      validateUser,
      loading,
      v$,
      t,
      currentAcademicPeriodGroupId,
      currentAcademicPeriodGroups,
      identificationTypes,
      matriculatesParents,
      studentCategories,
      academicPeriods,
      editForm,
      genders,
      scholarshipType,
      schoolInsurance,
      infoComple,
      openModalInfoComplementaria,
      closeModalInfoComplementaria,
      quotasAvailable,
      matriculateId,
      enrollsMatriculates,
      redirect,

      validateIdentification,
      toParents,
      quota,
      save,
      openConfirmDelete,
      confirmDelete,
      signatureDelete,
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
