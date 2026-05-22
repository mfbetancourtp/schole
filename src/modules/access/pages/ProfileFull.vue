<template>
  <AppBaseList :title="title">
    <template #actions>
      <!-- <AppButtonBack
        v-if="routeBack.value.name"
        :to="{
          name: routeBack.value.name,
          params: {
            academicPeriodGroupId: routeBack.value.academicPeriodGroupId,
          },
        }"
      ></AppButtonBack> -->
      <AppButtonBack @click="goBack" />
    </template>

    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <div>
          <div class="container-form-nav">
            <div v-if="data" class="content-form-info-nav">
              <div class="personal-info-nav">
                <div class="text-title-form-nav">
                  {{ data.value?.profile?.people?.lastnames }}
                  {{ data.value?.profile?.people?.names }}
                </div>
                <div class="student-info-nav">
                  <span>
                    <span v-for="(role, index) in data.value?.roles" :key="index"> {{ role.name }}<span v-if="index < data.value.roles.length - 1">, </span> </span>

                    -
                    {{ data.value?.profile?.people?.identification || 'No found' }}
                  </span>
                  <span v-if="data.value?.profile?.people?.student?.id" class="state-tag" :class="data.value?.profile?.activeUserInstitution === 1 ? 'state-active' : 'state-inactive'">
                    {{ data.value?.profile?.activeUserInstitution === 1 ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
              </div>

              <div v-if="data.value?.matriculate?.id" class="academy-info-nav">
                <!-- data.value?.people?.student = if getMatrivcaulte-->
                <div class="academy-info-item">
                  <span class="text-title-form-nav">{{ data.value?.matriculate?.academicPeriodName }}</span>
                  <span>Ciclo Academico</span>
                </div>
                <hr />
                <div class="academy-info-item">
                  <span class="text-title-form-nav">{{ data.value?.matriculate?.academicPeriodGroupCourseName }}</span>
                  <span>Curso</span>

                  <span
                    class="state-tag"
                    :class="
                      data.value?.matriculate?.isPreEnrolled === 0 && data.value?.matriculate?.isRetired === 0
                        ? 'state-active'
                        : data.value?.matriculate?.isPreEnrolled === 1 && data.value?.matriculate?.isRetired === 0
                        ? 'state-inactive'
                        : 'state-retired'
                    "
                  >
                    {{
                      data.value?.matriculate?.isPreEnrolled === 0 && data.value?.matriculate?.isRetired === 0
                        ? 'Activo'
                        : data.value?.matriculate?.isPreEnrolled === 1 && data.value?.matriculate?.isRetired === 0
                        ? 'Oculto'
                        : 'Retirado'
                    }}
                  </span>
                </div>
              </div>
            </div>

            <div :class="{ 'cards-no-border': !data }" class="content-form-nav">
              <div v-if="data" class="contetn-avatar-form-nav">
                <div class="avatar-form-nav avatar-shadow">
                  <AppAvatar class="avatar-nav" :size="'lg'" :avatar="avatar.value" :name="`${data.value?.profile?.people?.lastnames}`"> </AppAvatar>
                </div>
              </div>
              <div class="form-navigation">
                <AppButton v-for="(section, index) in filteredSectionsForm" :key="index" :class="{ active: currentSectionForm === section.key }" @click="goToSectionForm(section.key)">
                  <AppIcon :icon="section.icon" class="icon-form-nav" />
                  <!-- Texto al lado del ícono -->
                  <span class="text-form-nav">{{ section.name }}</span>
                </AppButton>
              </div>
            </div>
          </div>

          <AppCard class="cards-form-form">
            <template #body>
              <form @submit.prevent="save">
                <div v-if="currentSectionForm === 'basicInformation'">
                  <div class="content-cards-form">
                    <div class="card-form-academy flex-1">
                      <AppCard class="cards-form-form">
                        <template #body>
                          <div style="display: flex; justify-content: flex-end; width: 100%">
                            <span v-if="!data" class="state-tag">Pendiente</span>
                          </div>
                          <div>
                            <!--<AppFormField :form-control="v$.form.basicInformation.peopleForm.avatar" >
                                  <AppUploadImageView input-id="thumbnail" v-model="v$.form.basicInformation.peopleForm.avatar.$model" :current-thumbnail="currentAvatar"></AppUploadImageView>
                                </AppFormField> -->
                            <div class="d-flex flex-column align-items-center">
                              <div class="avatar-circle-form">
                                <AppAvatar :size="'lg'" :name="`${data.value?.profile?.people?.lastnames}`" :avatar="avatar.value" class="avatar-form-form"></AppAvatar>
                              </div>
                              <!-- edit and delete -->
                              <div v-if="data" class="d-flex justify-content-between">
                                <div>
                                  <input accept="image/png, image/jpeg" type="file" id="fileIn" style="display: none" @change="onFileSelected($event)" />
                                  <button type="button" @click="getFile()" class="focus p-1 ps-2 pe-2 rounded-circle">
                                    <AppIcon icon="edit" class="text-primary" />
                                  </button>
                                </div>

                                <div>
                                  <button :disabled="!avatar.value" @click="confirmDelete()" class="p-1 ps-2 pe-2 rounded-circle" v-bind:class="{ focus: avatar.value }">
                                    <AppIcon
                                      icon="trash"
                                      class="text-primary"
                                      v-bind:class="{
                                        'text-black-50': !avatar.value,
                                      }"
                                    />
                                  </button>
                                </div>
                              </div>

                              <div class="text-info-type">
                                <span>Permitido *.jpeg *.jpg *.png</span>
                                <span>Tamaño maximo 3Mb</span>
                              </div>
                            </div>
                            <!--    <div v-if="data.value?.roles.some((role:any) => role.profileId === 2)">
                              <AppFormField :form-control="v$.form.basicInformation.academicPeriodId" label="academicAdministration.matriculates.form.academicPeriod">
                                <AppAutocomplete
                                  v-model="v$.form.basicInformation.academicPeriodId.$model"
                                  :disabled="true"
                                  :input-id="'academicPeriodId'"
                                  :options="academicPeriods"
                                  :clearable="false"
                                  class="bg-white"
                                >
                                </AppAutocomplete>
                              </AppFormField>

                              <AppFormField :form-control="v$.form.basicInformation.academicPeriodGroupId" label="academicAdministration.matriculates.form.course">
                                <AppAutocomplete
                                  :disabled="true"
                                  v-model="v$.form.basicInformation.academicPeriodGroupId.$model"
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
                                <h4>
                                  {{ quota() ?? t('academicAdministration.matriculates.form.notAssigned') }}
                                </h4>
                              </div>
                            </div>-->
                          </div>
                        </template>
                      </AppCard>
                    </div>
                    <div class="basic-card-form flex-2">
                      <AppCard class="cards-form-form" style="height: 100%">
                        <template #body>
                          <section>
                            <div class="form-row">
                              <AppFormField :form-control="v$.form.basicInformation.peopleForm.identificationType" label="academicAdministration.people.identificationType">
                                <AppAutocomplete
                                  v-model="v$.form.basicInformation.peopleForm.identificationType.$model"
                                  :options="relatedData.value.identificationTypes"
                                  input-id="identificationType"
                                  :clearable="false"
                                  class="bg-white"
                                ></AppAutocomplete>
                              </AppFormField>
                              <AppFormField :form-control="v$.form.basicInformation.peopleForm.identification" label="academicAdministration.people.identification">
                                <input :disabled="true" class="form-control" type="text" id="identification" v-model="v$.form.basicInformation.peopleForm.identification.$model" />
                              </AppFormField>
                            </div>
                            <div class="form-row">
                              <AppFormField :form-control="v$.form.basicInformation.peopleForm.name" label="academicAdministration.people.name">
                                <input class="form-control" type="text" id="name" v-model="v$.form.basicInformation.peopleForm.name.$model" />
                              </AppFormField>
                              <AppFormField :form-control="v$.form.basicInformation.peopleForm.lastname" label="academicAdministration.people.lastname">
                                <input class="form-control" type="text" id="lastname" v-model="v$.form.basicInformation.peopleForm.lastname.$model" />
                              </AppFormField>
                            </div>
                            <div class="form-row">
                              <AppFormField :form-control="v$.form.basicInformation.peopleForm.email" label="academicAdministration.people.email">
                                <input class="form-control" type="text" id="email" v-model="v$.form.basicInformation.peopleForm.email.$model" />
                              </AppFormField>
                              <AppFormField :form-control="v$.form.basicInformation.peopleForm.mobile" label="academicAdministration.people.mobile">
                                <input class="form-control" type="text" id="mobile" v-model="v$.form.basicInformation.peopleForm.mobile.$model" />
                              </AppFormField>
                            </div>
                            <div class="form-row">
                              <AppFormField :form-control="v$.form.basicInformation.peopleForm.homePhone" label="academicAdministration.people.homePhone">
                                <input class="form-control" type="text" id="homePhone" v-model="v$.form.basicInformation.peopleForm.homePhone.$model" />
                              </AppFormField>
                              <AppFormField :form-control="v$.form.basicInformation.peopleForm.workPhone" label="Teléfono de emergencia">
                                <input class="form-control" type="text" id="workPhone" v-model="v$.form.basicInformation.peopleForm.workPhone.$model" />
                              </AppFormField>
                            </div>
                          </section>
                          <div class="action-button-form" style="margin-top: auto">
                            <AppButton label="core.save" @click="goToNextSectionForm()"></AppButton>
                          </div>
                        </template>
                      </AppCard>
                    </div>
                  </div>
                </div>
                <div v-if="currentSectionForm === 'personalInformation'">
                  <section>
                    <div class="form-row">
                      <AppFormField :form-control="v$.form.personalInformation.peopleForm.gender" label="academicAdministration.people.gender">
                        <AppAutocomplete v-model="v$.form.personalInformation.peopleForm.gender.$model" :options="relatedData.value.genders" input-id="gender"> </AppAutocomplete>
                      </AppFormField>
                      <AppFormField :form-control="v$.form.personalInformation.peopleForm.countryBirth" label="País de nacimiento">
                        <AppGeographicSearch
                          :search-key="'country'"
                          :id="v$.form.personalInformation.peopleForm.countryBirth.$model"
                          @geographic-data="(data) => (v$.form.personalInformation.peopleForm.countryBirth.$model = data.id)"
                        >
                        </AppGeographicSearch>
                      </AppFormField>
                    </div>
                    <div class="form-row">
                      <AppFormField :form-control="v$.form.personalInformation.peopleForm.regionBirth" label="Departamento de nacimiento">
                        <AppGeographicSearch
                          :search-key="'region'"
                          :country-id="v$.form.personalInformation.peopleForm.countryBirth.$model"
                          :id="v$.form.personalInformation.peopleForm.regionBirth.$model"
                          @geographic-data="(data) => (v$.form.personalInformation.peopleForm.regionBirth.$model = data.id)"
                        >
                        </AppGeographicSearch>
                      </AppFormField>
                      <AppFormField :form-control="v$.form.personalInformation.peopleForm.municipalityBirth" label="Municipio de nacimiento">
                        <AppGeographicSearch
                          :search-key="'city'"
                          :country-id="v$.form.personalInformation.peopleForm.countryBirth.$model"
                          :region-id="v$.form.personalInformation.peopleForm.regionBirth.$model"
                          :id="v$.form.personalInformation.peopleForm.municipalityBirth.$model"
                          @geographic-data="(data) => (v$.form.personalInformation.peopleForm.municipalityBirth.$model = data.id)"
                        >
                        </AppGeographicSearch>
                      </AppFormField>
                    </div>
                    <div class="form-row">
                      <AppFormField :form-control="v$.form.personalInformation.peopleForm.birthday" label="Fecha de nacimiento">
                        <input class="form-control" type="date" v-model="v$.form.personalInformation.peopleForm.birthday.$model" />
                      </AppFormField>
                      <AppFormField :form-control="v$.form.personalInformation.peopleForm.religion" label="academicAdministration.people.religion">
                        <input class="form-control" type="text" id="religion" v-model="v$.form.personalInformation.peopleForm.religion.$model" />
                      </AppFormField>
                    </div>
                    <div class="form-row">
                      <AppFormField :form-control="v$.form.personalInformation.peopleForm.nationality" label="academicAdministration.people.nationality">
                        <input class="form-control" type="text" id="nationality" v-model="v$.form.personalInformation.peopleForm.nationality.$model" />
                      </AppFormField>
                      <AppFormField :form-control="v$.form.personalInformation.peopleForm.primaryLanguage" label="academicAdministration.people.primaryLanguage">
                        <input class="form-control" type="text" id="primaryLanguage" v-model="v$.form.personalInformation.peopleForm.primaryLanguage.$model" />
                      </AppFormField>
                    </div>
                    <div class="form-row">
                      <AppFormField :form-control="v$.form.personalInformation.peopleForm.direction" label="Dirección de residencia">
                        <input class="form-control" type="text" v-model="v$.form.personalInformation.peopleForm.direction.$model" />
                      </AppFormField>
                      <AppFormField :form-control="v$.form.personalInformation.peopleForm.zone" label="Zona de residencia">
                        <input class="form-control" type="text" id="zone" v-model="v$.form.personalInformation.peopleForm.zone.$model" />
                      </AppFormField>
                    </div>
                  </section>
                  <div class="action-button-form">
                    <AppButton label="core.save" @click="goToNextSectionForm()"></AppButton>
                  </div>
                </div>

                <div v-if="currentSectionForm === 'academicHistory'">
                  <div class="container-card-history">
                    <div class="tw-flex tw-justify-end">
                      <div class="mb-3 tw-w-full md:tw-w-72">
                        <label>{{ t('academicPlanning.periods.name') }}</label>
                        <AppAutocomplete v-model="academicPeriodHistoryId" :options="academicPeriodsHistory" :clearable="false" class="bg-white"> </AppAutocomplete>
                      </div>
                    </div>
                    <AppEmptyResponse v-if="!academicHistory.value.length" :show-image="true"></AppEmptyResponse>

                    <AppCard class="cards-form-form" v-for="(item, index) in academicHistory.value" :key="index">
                      <template #body>
                        <div class="content-cards-form">
                          <div class="academy-info-item justify-content-center text-center" style="flex: 0.5">
                            <span class="title-degree">{{ item.degree }}</span>
                            <span class="subtitle-level">{{ item.level }}</span>
                          </div>

                          <div class="grid-cards" style="flex: 2.5">
                            <div class="cards-tutor-form cards-form-history" v-for="(subject, index) in item.dataSubjects" :key="index">
                              <div
                                class="card-header-color"
                                :style="{
                                  backgroundColor: subject.colorArea || 'gray',
                                }"
                              ></div>
                              <div class="academy-info-item item-card-history">
                                <span class="card-subject-name" style="font-size: 18px">{{ subject.nameSubject }}</span>
                                <span class="card-subject-subject" style="font-size: 12px; color: #7f8c8d">({{ subject.codeSubject }})</span>
                              </div>
                              <div class="footer-card-history">
                                <span
                                  :style="{
                                    color: subject.colorArea || 'gray',
                                  }"
                                  >{{ subject.codeArea }}</span
                                >
                                <div>
                                  <span>PF: {{ subject.finalQuality || '--' }}</span>
                                  <AppIcon
                                    :icon="iconMappingSubject[subject.state]?.icon || iconMappingSubject['DEFAULT'].icon"
                                    :class="iconMappingSubject[subject.state]?.color || iconMappingSubject['DEFAULT'].color"
                                    v-tooltip="subject.state"
                                    class="ms-1"
                                  ></AppIcon>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </template>
                    </AppCard>
                  </div>

                  <div class="action-button-form mt-3">
                    <AppButton label="core.save" @click="goToNextSectionForm()"></AppButton>
                  </div>
                </div>

                <div v-if="currentSectionForm === 'uploadSignature'">
                  <h4 class="text-capitalize mt-3">
                    {{ t('Cargar firma') }}
                  </h4>
                  <div v-if="data.value?.profile?.signature != null">
                    <a :href="data.value?.profile?.signature" target="_blank">Ver Imagen</a>
                  </div>

                  <AppFormField
                    @change="onFilefirma($event)"
                    :form-control="v$.form.uploadSignature.logo"
                    :label="'Permitido *.jpg, *.png Dimensiones (283 x 83 Px)'"
                    class="text-info-type align-items-start"
                  >
                    <AppUploadImage input-id="file" v-model="v$.form.uploadSignature.logo.$model" :current-thumbnail="currentThumbnail"> </AppUploadImage>
                  </AppFormField>
                  <div class="action-button-form mt-3">
                    <AppButton label="core.continue" @click="goToNextSectionForm()"></AppButton>
                  </div>
                </div>

                <div v-if="currentSectionForm === 'jobInformation'">
                  <div class="form-row">
                    <AppFormField :form-control="v$.form.jobInformation.peopleForm.companyName" label="Nombre de la empresa">
                      <input v-model="v$.form.jobInformation.peopleForm.companyName.$model" type="text" class="form-control" />
                    </AppFormField>

                    <AppFormField :form-control="v$.form.jobInformation.peopleForm.companyPosition" label="Cargo">
                      <input v-model="v$.form.jobInformation.peopleForm.companyPosition.$model" type="text" class="form-control" />
                    </AppFormField>
                  </div>

                  <div v-if="v$.form.jobInformation.peopleForm.isACollaborator.$model" class="row">
                    <AppFormField :form-control="v$.form.jobInformation.peopleForm.companyAreaId" label="Vicepresidencia">
                      <AppAutocomplete v-model="v$.form.jobInformation.peopleForm.companyAreaId.$model" :options="companyAreas" />
                    </AppFormField>

                    <AppFormField> </AppFormField>
                  </div>
                  <div class="action-button-form mt-3">
                    <AppButton label="core.save" @click="goToNextSectionForm()"></AppButton>
                  </div>
                </div>

                <div v-if="currentSectionForm === 'teacherAvailability'">
                  <TeacherAvailability ref="teacherAvailabilityRef" :userId="Number(resolvedUserId)" @saved="onTeacherAvailabilitySaved" />
                </div>

                <div v-if="currentSectionForm === 'academicLoad'">
                  <AcademicLoad ref="academicLoadRef" :userId="Number(resolvedUserId)" @saved="onAcademicLoadSaved" />
                </div>

                <div v-if="currentSectionForm === 'changePasswordProfile'">
                  <ChangePasswordProfileForm></ChangePasswordProfileForm>
                </div>
              </form>
            </template>
          </AppCard>
        </div>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, Ref, ref, watch, computed } from 'vue';
import { required, defaultImage } from '../../../shared/plugins/vuelidate.plugin';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppIcon from '../../../shared/components/AppIcon.vue';
//import MatrixForm from '../../surveys/components/MatrixForm.vue';
import AppAvatar from '../../../shared/components/AppAvatar.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
// import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
//import CustomFormInput from '../../surveys/components/CustomFormInput.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppGeographicSearch from '../../../shared/components/Forms/AppGeographicSearch.vue';
import AppUploadImage from '../../../shared/components/Forms/AppUploadImage.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import ChangePasswordProfileForm from '../components/ChangePasswordProfileForm.vue';
import TeacherAvailability from '../components/TeacherAvailability.vue';
import AcademicLoad from '../components/AcademicLoad.vue';
// import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { ProfileDto } from '../dtos/profile.dto';

import { GetProfileService } from '../services/getProfile.service';
import { UpdateAvatarService } from '../services/updateAvatar.service';
import { UpdateProfileService } from '../services/updateProfile.service';
//import { GetQuestionsOfEnrolService } from '../services/getQuestionsOfEnrol.service';
import { GetRelatedDataProfileService } from '../services/getRelatedDataProfile.service';
import { UpdateUserSignatureservice } from '../services/updateUserSignature.service';
import { useHeaderStore } from '../../../stores/header.store';
import { GetMatriculateRelatedDataFormService } from '../../../shared/services/getMatriculateRelatedDataForm.service';
import { GetAcademicHistoryByAcademicPeriodIdService } from '../../../shared/services/getAcademicHistoryByAcademicPeriodId.service';
import { GetCompanyAreaService } from '../../../shared/services/getCompanyArea.service';

const getRelatedDataProfileService = new GetRelatedDataProfileService();
//const getQuestionsOfEnrolService = new GetQuestionsOfEnrolService();
const updateProfileService = new UpdateProfileService();
const updateAvatarService = new UpdateAvatarService();
const getProfileService = new GetProfileService();
const updateUserSignatureservice = new UpdateUserSignatureservice();
const getMatriculateRelatedDataFormService = new GetMatriculateRelatedDataFormService();
const getAcademicHistoryByAcademicPeriodIdService = new GetAcademicHistoryByAcademicPeriodIdService();
const getCompanyAreaService = new GetCompanyAreaService();

export default defineComponent({
  name: 'ProfileFullPag',
  components: {
    // AppConfirmDeleteModal,
    AppGeographicSearch,
    //CustomFormInput,
    AppAutocomplete,
    AppButtonBack,
    AppUploadImage,
    AppFormField,
    AppBaseList,
    AppLoading,
    //MatrixForm,
    AppButton,
    AppAvatar,
    AppCard,
    AppEmptyResponse,
    // AppModal,
    AppIcon,
    ChangePasswordProfileForm,
    TeacherAvailability,
    AcademicLoad,
  },

  props: ['userId', 'dataProps'],

  setup(props) {
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();

    useMeta({ title: 'Perfil' });
    let title = 'Perfil de usuario';

    const isConvocation: Ref<boolean> = ref(false);

    const customFormAnswers: any = reactive({});

    const cargar = props.dataProps ?? null;
    const currentThumbnail = cargar?.cargarfirma?.logo ?? null; //revisar cargar.signature

    //const medicalInformationId = ref();
    const stepIndex = ref(1);
    const userId = ref();

    const loadingQuestions = ref(false);
    //const showMedicalInformation = ref(true);
    const modalDelete = ref(false);
    const loading = ref(true);
    const academicPeriods = ref();
    const academicPeriodsHistory = ref();
    const academicPeriodHistoryId = ref();
    const academicPeriodGroups = ref();
    const companyAreas: Ref<any[]> = ref([]);
    //const identificationTypes = ref();
    //const genders = ref();

    const data: { value: ProfileDto | any } = reactive({
      value: null,
    });
    const relatedData: { value: any } = reactive({
      value: null,
    });
    const routeBack: { value: any } = reactive({
      value: {
        name: '',
        academicPeriodGroupId: 0,
      },
    });
    const goBack = () => {
      if (window.history.length > 1) {
        router.back();
      }
    };
    const avatar: { value: any } = reactive({
      value: null,
    });
    const objectForm: { value: any } = reactive({
      value: {},
    });
    const academicHistory: { value: any[] } = reactive({
      value: [],
    });
    const currentAcademicPeriodGroups: { value: any[] } = reactive({
      value: [],
    });
    const headerStorage = useHeaderStore();
    if (routeBack.value?.name) {
      headerStorage.moduleSubItem = { name: title, url: '' };
      headerStorage.moduleItem = {
        name: 'Administración de curso',
        url: '',
      };
      headerStorage.module = { name: 'Administración académica', url: '' };
    } else {
      headerStorage.moduleSubItem = { name: '', url: '' };
      headerStorage.moduleItem = {
        name: '',
        url: '',
      };
      headerStorage.module = { name: title, url: '' };
    }

    const teacherAvailabilityRef = ref<any>(null);
    const academicLoadRef = ref<any>(null);
    const currentSectionForm = ref('basicInformation');
    const sectionsForm = ref([
      {
        key: 'basicInformation',
        name: t('academicAdministration.matriculates.form.sectionOne'),
        icon: 'user-circle',
      },
      {
        key: 'personalInformation',
        name: 'Información personal',
        icon: 'file-alt',
      },
      {
        key: 'academicHistory',
        name: 'Historial académico',
        icon: 'folder-open',
      },
      {
        key: 'jobInformation',
        name: 'Información Laboral',
        icon: 'user-tie',
      },
      {
        key: 'teacherAvailability',
        name: 'Disponibilidad Horaria',
        icon: 'calendar-alt',
      },
      {
        key: 'academicLoad',
        name: 'Carga Académica',
        icon: 'book-open',
      },
      {
        key: 'uploadSignature',
        name: 'Cargar Firma',
        icon: 'file-signature',
      },
      {
        key: 'changePasswordProfile',
        name: 'Cambiar Contraseña',
        icon: 'unlock-alt',
      },
    ]);

    const goToSectionForm = async (section: any) => {
      // Guarda la sección actual antes de cambiar
      const saved = await save();

      // Si el guardado fue exitoso, cambia a la nueva sección
      if (saved) {
        currentSectionForm.value = section;
      } else {
        // Manejo de errores
        console.error('Error al guardar los datos.');
      }
    };
    const goToNextSectionForm = async () => {
      const currentIndex = filteredSectionsForm.value.findIndex((section) => section.key === currentSectionForm.value);

      if (currentIndex !== -1) {
        // Primero guardar los datos antes de cambiar de sección
        const saved = await save();

        // Si el guardado fue exitoso, avanza a la siguiente sección o redirige
        if (saved) {
          if (currentIndex < filteredSectionsForm.value.length - 1) {
            // Si no es la última sección, avanza a la siguiente
            currentSectionForm.value = filteredSectionsForm.value[currentIndex + 1].key;
          } else {
            // Si es la última sección, redirige
            /*  await router.push({
              name: 'academicAdministration.enrolledByCourse',
            }); */
          }
        } else {
          // Manejo de errores
          console.error('Error al guardar los datos.');
        }
      }
    };

    const form = reactive({
      basicInformation: {
        academicPeriodId: null,
        academicPeriodGroupId: null,
        peopleForm: {
          identificationType: null,
          identification: null as string | null,
          name: null,
          lastname: null,
          mobile: null,
          email: null,
          homePhone: null,
          workPhone: null,
          registrationDate: null,
          // avatar: null,
        },
      },
      personalInformation: {
        peopleForm: {
          gender: null,
          religion: null,
          nationality: null,
          primaryLanguage: null,
          country: null,
          region: null,
          municipality: null,
          direction: null,
          countryBirth: undefined as number | undefined,
          regionBirth: undefined as number | undefined,
          municipalityBirth: null,
          birthday: null,
          zone: null,
        },
      },
      academicHistory: {
        peopleForm: {
          // campos específicos para el historial académico
        },
      },
      jobInformation: {
        peopleForm: {
          companyName: null,
          companyPosition: null,
          companyAreaId: null,
          isACollaborator: null,
        },
      },
      uploadSignature: {
        logo: false,
      },
    });

    const v$ = useVuelidate(
      {
        form: {
          basicInformation: {
            academicPeriodId: {},
            academicPeriodGroupId: {},
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
              // avatar: {},
            },
          },
          personalInformation: {
            peopleForm: {
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
            },
          },
          academicHistory: {
            peopleForm: {},
          },
          jobInformation: {
            peopleForm: {
              companyName: {},
              companyPosition: {},
              companyAreaId: {},
              isACollaborator: {},
            },
          },
          uploadSignature: {
            logo: { defaultImage },
          },
        },
      },
      { form }
    );

    watch(props.userId, () => {
      userId.value = props.userId;
      loadData(userId.value);
    });

    onMounted(async () => {
      try {
        if (route.params.userId) {
          userId.value = parseInt(route.params.userId.toString(), 10);
          let academicPeriodGroupId = route.query.academicPeriodGroupId;

          const headerStorage = useHeaderStore();
          headerStorage.moduleSubItem = { name: title, url: '' };
          headerStorage.moduleItem = {
            name: 'Administración de curso',
            url: '',
          };
          headerStorage.module = { name: 'Administración académica', url: '' };

          routeBack.value.name = route.query.routeBack;
          routeBack.value.academicPeriodGroupId = academicPeriodGroupId;
        } else if (props.userId) {
          userId.value = props.userId;
        } else {
          userId.value = JSON.parse(localStorage.getItem('user') ?? '').id;
        }
        relatedData.value = await getRelatedDataProfileService.run();
        console.log('localStorage', localStorage);

        await getData();

        if (data.value?.roles.some((role: any) => role.profileId === 2)) {
          //estudiante
          let relatedDataForm = await getMatriculateRelatedDataFormService.run();
          //identificationTypes.value = relatedDataForm.identificationTypes;
          //genders.value = relatedDataForm.genders;
          academicPeriodGroups.value = relatedDataForm.academicPeriodGroups;
          academicPeriods.value = relatedDataForm.academicPeriods;
          academicPeriodsHistory.value = [...relatedDataForm.academicPeriods]; // Crear una copia de relatedDataForm.academicPeriods
          academicPeriodsHistory.value.unshift({ name: 'TODOS' }); //opcion de todos los academicPeriods
          academicPeriodHistoryId.value = academicPeriodsHistory.value[0]?.id; //la opcion todos pasa el valor de undefined y el servicio trae todos los academicPeriods
          //console.log('academicP', academicPeriods.value);
          console.log('acamichistiory', academicPeriodsHistory.value);
          console.log('relatedDataForm', relatedDataForm);
          loadAcademicHistory();
        }
        if (data.value?.roles.some((role: any) => role.profileId === 4)) {
          //tutor
          companyAreas.value = await getCompanyAreaService.run();
        }
        await loadData(userId.value);
        console.log(data);
        //if (!isConvocation.value) await loadData(userId.value);
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });
    const filteredSectionsForm = computed(() => {
      return sectionsForm.value.filter((section) => {
        // Mostrar la secciones segun su profile o validacion.
        if (section.key === 'academicHistory') {
          return data.value?.roles.some((role: any) => role.profileId === 2) || false; // 2 = student
        }
        if (section.key === 'uploadSignature') {
          return data.value?.roles.some((role: any) => role.isSignatureRequired === 1) || false;
        }
        if (section.key === 'jobInformation') {
          return data.value?.roles.some((role: any) => role.profileId === 4) || false; // 4 = tutor
        }
        if (section.key === 'teacherAvailability') {
          return data.value?.roles.some((role: any) => role.profileId === 3) || false; // 3 = teacher
        }
        if (section.key === 'academicLoad') {
          return data.value?.roles.some((role: any) => role.profileId === 3) || false; // 3 = teacher
        }
        return true; // Mostrar el resto de las secciones siempre
      });
    });

    const getData = async () => {
      loading.value = true;

      try {
        data.value = await getProfileService.run(userId.value);

        if (data.value?.isConvocation) {
          isConvocation.value = true;

          let roleId = localStorage.getItem('roleId');
          data.value.detail.forEach((detail: any) => {
            detail.questions.forEach((question: any) => {
              question.blockQuestion = question.rolesIdsBlocked && question.rolesIdsBlocked.split(',').includes(roleId) ? true : false;
            });
          });

          const query: any = {
            ...route.query,
            convocationId: data.value?.convocationId,
            convocationEnrollId: data.value?.convocationEnrolId,
            stepId: data.value.id,
          };

          router.push({ query });

          //await loadForm();
        } else {
          router.push({});
          //if (!data.value?.people.student) showMedicalInformation.value = false;
        }
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    };

    watch(v$.value.form.basicInformation.academicPeriodId, () => {
      if (form.basicInformation?.academicPeriodId) {
        onChangeAcademicPeriod();
      }
    });
    watch(academicPeriodHistoryId, async () => {
      loadAcademicHistory();
    });
    const loadAcademicHistory = async () => {
      if (data.value?.profile?.people?.student?.id) {
        const params = {
          academicPeriodId: academicPeriodHistoryId.value,
        };
        academicHistory.value = await getAcademicHistoryByAcademicPeriodIdService.run(data.value.profile.people.student.id, params);
      }
    };
    const onChangeAcademicPeriod = () => {
      currentAcademicPeriodGroups.value = [];
      academicPeriodGroups.value.forEach((academicPeriodGroup: any) => {
        if (academicPeriodGroup.academicPeriodId == form.basicInformation?.academicPeriodId) {
          currentAcademicPeriodGroups.value.push(academicPeriodGroup);
        }
      });
    };
    const quota = () => {
      let quota = null;
      if (form.basicInformation.academicPeriodId) {
        currentAcademicPeriodGroups.value.forEach((currentAcademicPeriodGroup: any) => {
          if (form.basicInformation?.academicPeriodGroupId == currentAcademicPeriodGroup.id) {
            quota = currentAcademicPeriodGroup.quota;
          }
        });
      }
      return quota;
    };

    const loadData = async (pUserId: number) => {
      userId.value = pUserId;
      loading.value = true;

      form.basicInformation.academicPeriodId = data.value?.academicPeriodGroup?.academicPeriod.id;
      form.basicInformation.academicPeriodGroupId = data.value?.matriculate?.academicPeriodGroupId;
      //form.tuition.studentCategoryId = data.value?.studentCategoryId;
      //form.tuition.codeStudent = data.value?.student?.code;
      //form.tuition.codeMEN = data.value?.student?.codeMEN;
      form.basicInformation.peopleForm.identification = data.value?.profile?.people?.identification;
      form.basicInformation.peopleForm.identificationType = await data.value?.profile?.people?.identificationTypeId;
      form.basicInformation.peopleForm.name = data.value?.profile?.people?.names;
      form.basicInformation.peopleForm.lastname = data.value?.profile?.people?.lastnames;
      form.basicInformation.peopleForm.mobile = data.value?.profile?.people?.mobile;
      form.basicInformation.peopleForm.email = data.value?.profile?.people?.email;
      form.personalInformation.peopleForm.country = data.value?.profile?.people?.homeMunicipality?.region?.country?.id;
      form.personalInformation.peopleForm.region = data.value?.profile?.people?.homeMunicipality?.region?.id;
      form.personalInformation.peopleForm.municipality = data.value?.profile?.people?.homeMunicipality?.id;
      form.personalInformation.peopleForm.direction = data.value?.profile?.people?.direction;
      form.personalInformation.peopleForm.countryBirth = data.value?.profile?.people?.birthMunicipality?.region?.country?.id;
      form.personalInformation.peopleForm.regionBirth = data.value?.profile?.people?.birthMunicipality?.region?.id;
      form.personalInformation.peopleForm.municipalityBirth = data.value?.profile?.people?.birthMunicipality?.id;
      form.personalInformation.peopleForm.gender = data.value?.profile?.people?.genderId;
      form.personalInformation.peopleForm.birthday = data.value?.profile?.people?.birthDate;
      form.basicInformation.peopleForm.homePhone = data.value?.profile?.people?.homePhone;

      form.basicInformation.peopleForm.workPhone = data.value?.profile?.people?.workPhone;
      form.personalInformation.peopleForm.religion = data.value?.profile?.people?.religion;
      form.personalInformation.peopleForm.primaryLanguage = data.value?.profile?.people?.primaryLanguage;
      form.personalInformation.peopleForm.nationality = data.value?.profile?.people?.nationality;
      form.personalInformation.peopleForm.zone = data.value?.profile?.people?.zone;
      form.jobInformation.peopleForm.companyName = data.value?.profile?.people?.companyName;
      form.jobInformation.peopleForm.companyPosition = data.value?.profile?.people?.companyPosition;
      form.jobInformation.peopleForm.companyAreaId = data.value?.profile?.people?.companyAreaId;
      form.jobInformation.peopleForm.isACollaborator = data.value?.profile?.people?.isACollaborator;

      /*form.tuition.peopleForm.enrollmentDate = data.value?.student?.people?.enrollmentDate
            ? data.value?.student.people.enrollmentDate.split(' ')[0] || ''
            : data.value?.student.people.createdAt?.split(' ')[0] || '';
          form.outputContacts.peopleForm.outputContactOneName = data.value?.student?.people?.outputContactNameOne;
          form.outputContacts.peopleForm.outputContactOneNumber = data.value?.student?.people?.outputContactPhoneOne;
          form.outputContacts.peopleForm.outputContactTwoName = data.value?.student?.people?.outputContactNameTwo;
          form.outputContacts.peopleForm.outputContactTwoNumber = data.value?.student?.people?.outputContactPhoneTwo;
          form.outputContacts.peopleForm.observations = data.value?.student?.people?.observations;
          
          form.tuition.peopleForm.scholarshipTypeId = data.value?.student?.people?.scholarshipTypeId;
          form.tuition.peopleForm.schoolInsuranceId = data.value?.student?.people?.schoolInsuranceId;*/

      //avatar.value = data.value?.student?.people?.avatar;
      /*
          onChangeAcademicPeriod();
          if (currentAcademicPeriodGroupId.value) {
            let academicPeriodGroup: any = null;
            academicPeriodGroups.value.forEach((apg: any) => {
              if (currentAcademicPeriodGroupId.value == apg.id) {
                academicPeriodGroup = apg;
              }
            });
            currentAcademicPeriodGroups.value = academicPeriodGroups.value;
            form.basicInformation.academicPeriodId = academicPeriodGroup.academicPeriodId;
            form.basicInformation.academicPeriodGroupId = academicPeriodGroup.id;
          }
        };*/
      /*
      if (showMedicalInformation.value) {
        medicalInformationId.value =
          data.value?.people.student.medicalInformation.id;

        form.medicalInformation.rh =
          data.value?.people?.student?.medicalInformation?.rh;
        form.medicalInformation.doctorName =
          data.value?.people?.student?.medicalInformation?.doctorName;
        form.medicalInformation.doctorPhone =
          data.value?.people?.student?.medicalInformation?.doctorPhone;
        form.medicalInformation.doctorAddress =
          data.value?.people?.student?.medicalInformation?.doctorAddress;
        form.medicalInformation.hospitalName =
          data.value?.people?.student?.medicalInformation?.hospitalName;
        form.medicalInformation.hospitalPhone =
          data.value?.people?.student?.medicalInformation?.hospitalPhone;
        form.medicalInformation.hospitalAddress =
          data.value?.people?.student?.medicalInformation?.hospitalAddress;

        form.medicalInformation.knowSwim = data.value?.people?.student
          ?.medicalInformation?.knowSwim
          ? true
          : false;
        form.medicalInformation.haveDiabetes = data.value?.people?.student
          ?.medicalInformation?.haveDiabetes
          ? true
          : false;

        form.medicalInformation.allergies =
          data.value?.people?.student?.medicalInformation?.allergies;
        form.medicalInformation.medicalConditions =
          data.value?.people?.student?.medicalInformation?.medicalConditions;
        form.medicalInformation.surgicalOperations =
          data.value?.people?.student?.medicalInformation?.surgicalOperations;
        form.medicalInformation.medicines =
          data.value?.people?.student?.medicalInformation?.medicines;
        form.medicalInformation.additionalNotes =
          data.value?.people?.student?.medicalInformation?.additionalNotes;
      }*/

      avatar.value = data.value?.profile?.avatar;

      loading.value = false;
    };
    const iconMappingSubject: any = {
      'SIN ASIGNAR': { icon: 'minus-circle', color: 'text-dark' },
      APROBADO: { icon: 'check-circle', color: 'text-success' },
      REPROBADO: { icon: 'times-circle', color: 'text-danger' },
      'EN CURSO': { icon: 'clock', color: 'text-warning' },
      DEFAULT: { icon: 'question-circle', color: 'text-muted' },
    };
    const validateSection = async () => {
      // Seleccionar la sección actual, para validar solo esa seccion de datos
      //console.log(data)
      switch (currentSectionForm.value) {
        case 'basicInformation':
          return await v$.value.form.basicInformation.$validate();
        case 'personalInformation':
          return await v$.value.form.personalInformation.$validate();
        case 'academicHistory':
          return await v$.value.form.academicHistory.$validate();
        case 'jobInformation':
          return await v$.value.form.jobInformation.$validate();
        case 'uploadSignature':
          return await v$.value.form.uploadSignature.$validate();
        default:
          return true;
      }
    };

    const save = async () => {
      //console.log(data.value?.roles[0]?.profileId)

      if (currentSectionForm.value === 'teacherAvailability') {
        return (await teacherAvailabilityRef.value?.handleSave()) ?? true;
      }

      if (currentSectionForm.value === 'academicLoad') {
        return (await academicLoadRef.value?.handleSave()) ?? true;
      }

      // Self-contained sections manage their own data; skip profile API call
      if (currentSectionForm.value === 'changePasswordProfile') {
        return true;
      }

      const sectionIsValid = await validateSection();

      if (!sectionIsValid) return;

      const dataSend: any = {
        people: {
          id: data.value?.profile?.people.id,
          identification: form.basicInformation.peopleForm.identification,
          identificationTypeId: form.basicInformation.peopleForm.identificationType,
          names: form.basicInformation.peopleForm.name,
          lastnames: form.basicInformation.peopleForm.lastname,
          mobile: form.basicInformation.peopleForm.mobile,
          email: form.basicInformation.peopleForm.email,
          homeMunicipalityId: form.personalInformation.peopleForm.municipality ?? null,
          direction: form.personalInformation.peopleForm.direction,
          birthDate: form.personalInformation.peopleForm.birthday,
          birthMunicipalityId: form.personalInformation.peopleForm.municipalityBirth ?? null,
          genderId: form.personalInformation.peopleForm.gender,
          homePhone: form.basicInformation.peopleForm.homePhone,
          workPhone: form.basicInformation.peopleForm.workPhone,
          religion: form.personalInformation.peopleForm.religion,
          primaryLanguage: form.personalInformation.peopleForm.primaryLanguage,
          nationality: form.personalInformation.peopleForm.nationality,
          createdAt: form.basicInformation.peopleForm.registrationDate,
          zone: form.personalInformation.peopleForm.zone,

          //se envia solo si es pefil acudiente
          //companyName: form.jobInformation.peopleForm.companyName,
          //companyPosition: form.jobInformation.peopleForm.companyPosition,
          //companyAreaId: form.jobInformation.peopleForm.companyAreaId,
        },
      };
      if (data.value?.roles.some((role: any) => role.profileId === 4)) {
        dataSend.people.companyName = form.jobInformation.peopleForm.companyName;
        dataSend.people.companyPosition = form.jobInformation.peopleForm.companyPosition;
        dataSend.people.companyAreaId = form.jobInformation.peopleForm.companyAreaId;
      }

      try {
        await updateProfileService.run(dataSend);
        console.log(dataSend);
        /*if (response.data.medicalInformationId)
        medicalInformationId.value = response.data.medicalInformationId;*/
        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    };

    const updateAvatar = async (file: any): Promise<void> => {
      try {
        const response = await updateAvatarService.run(userId.value, file);
        avatar.value = response.data.avatar;
      } catch (e) {
        console.log(e);
      }
    };

    const onFileSelected = async (event: any): Promise<void> => {
      const files = event.target.files;
      if (!files.length) return;

      const file = files[0];

      await updateAvatar(file);
    };

    /* const openConfirmDelete = async () => {
      modalDelete.value = true;
    };*/
    const confirmDelete = async () => {
      await updateAvatar(null);

      modalDelete.value = false;
    };

    const getFile = () => {
      let fileUpload = document.getElementById('fileIn');
      if (fileUpload != null) fileUpload.click();
    };

    const onFilefirma = async (event: any): Promise<void> => {
      const files = event.target.files;
      if (!files.length) return;

      const file = files[0];

      const maxWidth = 283;
      const maxHeight = 83;

      const image = new Image();
      image.src = URL.createObjectURL(file);

      image.onload = async () => {
        const width = image.width;
        const height = image.height;

        if (width > maxWidth || height > maxHeight) {
          alert(`Las dimensiones de la imagen no coinciden. El ancho máximo es ${maxWidth} píxeles y el alto máximo es ${maxHeight} píxeles.`);
          relatedData.value.logo = false;
          event.target.value = '';
          return;
        }
        await updateUserSignatureservice.run(userId.value, file);
        console.log('guardo la imagen', file);
        await getData();
      };
    };

    const advanceSection = () => {
      const currentIndex = filteredSectionsForm.value.findIndex((s) => s.key === currentSectionForm.value);
      if (currentIndex !== -1 && currentIndex < filteredSectionsForm.value.length - 1) {
        currentSectionForm.value = filteredSectionsForm.value[currentIndex + 1].key;
      }
    };

    const onTeacherAvailabilitySaved = advanceSection;
    const onAcademicLoadSaved = advanceSection;

    return {
      routeBack,
      loading,
      route,
      v$,
      t,

      title,
      //showMedicalInformation,
      loadingQuestions,
      isConvocation,
      relatedData,
      modalDelete,
      avatar,
      data,
      currentSectionForm,
      //sectionsForm,
      filteredSectionsForm,
      academicPeriods,
      currentAcademicPeriodGroups,
      //identificationTypes,
      //genders,
      goToSectionForm,
      goToNextSectionForm,
      quota,
      goBack,
      academicPeriodHistoryId,
      academicPeriodsHistory,
      academicHistory,
      iconMappingSubject,
      companyAreas,
      resolvedUserId: userId,

      //openConfirmDelete,
      onFileSelected,
      confirmDelete,
      onFilefirma,
      getFile,
      save,
      currentThumbnail,
      customFormAnswers,
      objectForm,
      stepIndex,
      teacherAvailabilityRef,
      onTeacherAvailabilitySaved,
      academicLoadRef,
      onAcademicLoadSaved,
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
.container-form-nav {
  /*background-color: #fff;
      box-shadow: 1px 2px 6px rgba(0, 0, 0, 0.45);
      border-radius: 4px;
      margin-bottom: 10px;
      */

  background-color: #fff;
  box-shadow: 0px 0px 15px rgba(38, 45, 118, 0.15); /*0px 10px 60px rgba(38, 45, 118, 0.08);*/
  border-radius: 20px;
  margin-bottom: 15px;
}
.cards-form-form {
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.18);
  border-radius: 20px;
}
.cards-no-border {
  border: none !important;
  border-radius: 20px;
}
.content-form-info-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  background-color: var(--color-primary);
  padding: 17px 24px;
  border-top-left-radius: 20px; /*4px 4px*/
  border-top-right-radius: 20px;
  /*align-items: flex-end;*/
}
.personal-info-nav {
  display: flex;
  flex-direction: column;
  margin-left: 130px;
}
.academy-info-nav {
  text-align: center;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}
.academy-info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.academy-info-nav hr {
  height: 80px;
  width: 1.5px;
  background-color: #fff;
  margin: 0 14px;
  opacity: 1;
}
.text-title-form-nav {
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 0.3px;
}
.student-info-nav {
  display: flex;
  align-items: center;
}
.state-tag {
  font-size: 12px;
  padding: 1px 12px;
  border-radius: 10px;
  margin-left: 6px;
  border: 2px solid #fff;
  background-color: gray;
  box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.1);
  color: #fff;
  background-color: black;
  letter-spacing: 0.3px;
}
.state-active {
  background-color: #00b74a;
}
.state-inactive {
  background-color: #9b9b9b;
}
.state-retired {
  background-color: #fcce01;
}
.content-form-nav {
  display: flex;
  padding: 27px 24px 0px 24px;
  /*new*/
  border: 5px solid var(--color-primary);
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}

.form-navigation {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}
.contetn-avatar-form-nav {
  height: 0px;
}
.avatar-form-nav {
  transform: translate(0px, -100px);
  border-radius: 50%;
  width: fit-content;
  height: fit-content;
  background-color: #ffffff;
}
.avatar-shadow {
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
}
.avatar-nav {
  width: 120px;
  height: 120px;
}

.form-navigation button {
  background-color: transparent;
  color: gray;
  border: none;
  border-radius: 0;
  margin-bottom: 12px;
}
.form-navigation button:hover {
  background-color: transparent;
  color: gray;
  border-bottom: 3px solid gray;
}
.form-navigation button.active {
  background-color: transparent;
  color: black;
  border-bottom: 3px solid black;
  box-shadow: 0px 8px 8px -7px rgba(0, 0, 0, 0.3);
}
:deep(.form-navigation button .o-btn__label) {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.form-navigation .icon-form-nav {
  width: 34px;
  height: 26px;
}
.form-navigation .text-form-nav {
  white-space: normal;
  max-width: 100px;
  min-width: 100px;
  display: block;
}
.content-cards-form {
  display: flex;
  flex-direction: row;
  gap: 15px;
}
.flex-1 {
  flex: 1;
}
.flex-2 {
  flex: 2;
}
.avatar-circle-form {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  border: 2px solid rgb(180, 180, 180);
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  box-shadow: 0 0 0 7px #ffffff, /* El borde medio, más ancho */ 0 0 0 8.5px rgb(190, 190, 190), /*Borde exterior*/ 0 8px 12px rgba(0, 0, 0, 0.5); /*sombra*/
  margin-bottom: 15px;
}
.avatar-form-form {
  width: 100%;
  height: 100%;
}

.text-info-type {
  font-size: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: gray;
}
.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 13rem), 1fr));
  justify-content: center;
  padding: 10px 4px;
}
.cards-tutor-form {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.content-status-end {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  padding: 6px 8px 0px 0px;
}
.card-tutor-name {
  text-align: center;
  padding: 1px 8px;
}
.footer-card-tutor {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 2px 10px;
  background: rgba(182, 182, 182, 0.15);
  border-bottom-left-radius: 19px;
  border-bottom-right-radius: 19px;
  border-top: 2px solid rgba(0, 0, 0, 0.02);
  margin-top: auto;
}
.scroll {
  max-height: 100vh;
  overflow-y: auto;
}
.container-card-history {
  gap: 15px;
  display: flex;
  flex-direction: column;
}

.card-header-color {
  height: 12px;
  width: 100%;
  /* background-color: #007bff; /* Color superior */
  border-top-left-radius: 13px;
  border-top-right-radius: 13px;
}
.title-degree {
  font-size: 40px;
  font-weight: bold;
  color: #2c3e50;
}
.subtitle-level {
  font-size: 24px;
  color: #7f8c8d;
  font-weight: normal;
}
.cards-form-history {
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.18);
  border-radius: 14px;
}
.item-card-history {
  text-align: center;
  padding: 4px 12px 0px 12px;
}
.footer-card-history {
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  padding: 0px 12px;
  width: 100%;
  margin-top: auto;
}
:deep(.avatar-form-form div) {
  font-size: 2rem;
}
.action-button-form {
  display: flex;
  justify-content: flex-end;
}
@media (max-width: 768px) {
  .content-form-nav {
    flex-direction: column;
  }
  .content-form-info-nav {
    flex-direction: column;
  }
  .personal-info-nav {
    text-align: center;
  }
  .student-info-nav {
    flex-direction: column;
  }
  .contetn-avatar-form-nav {
    height: 0px;
    display: flex;
    justify-content: center;
    margin-bottom: 58px;
  }
  .form-navigation .text-form-nav {
    max-width: 80px;
    min-width: 80px;
  }
}
@media (max-width: 1024px) {
  .content-form-info-nav {
    padding-bottom: 54px;
  }
  .personal-info-nav {
    margin-left: 0px;
  }
  .academy-info-nav hr {
    display: none;
  }
  .avatar-form-nav {
    transform: translate(0px, -80px);
  }
  .content-cards-form {
    flex-direction: column;
  }
}
</style>
