<template>
  <AppLoading v-if="loading"></AppLoading>

  <div v-else>
    <div v-if="!isConvocation" style="height: 100vh">
      <!-- profile data -->
      <section
        style="height: 20vh"
        class="shadow-sm p-4 d-flex justify-content-between"
      >
        <div class="d-flex gap-2">
          <!-- icon -->
          <div>
            <AppAvatar
              :size="'lg'"
              :name="`${data.value?.people?.names}`"
              :avatar="avatar.value"
            ></AppAvatar>

            <!-- edit and delete -->
            <div class="d-flex justify-content-between">
              <div>
                <input
                  accept="image/png, image/jpeg"
                  type="file"
                  id="fileIn"
                  style="display: none"
                  @change="onFileSelected($event)"
                />
                <button
                  type="button"
                  @click="getFile()"
                  class="focus p-1 ps-2 pe-2 rounded-circle"
                >
                  <AppIcon icon="edit" class="text-primary" />
                </button>
              </div>

              <div>
                <button
                  :disabled="!avatar.value"
                  @click="confirmDelete()"
                  class="p-1 ps-2 pe-2 rounded-circle"
                  v-bind:class="{ focus: avatar.value }"
                >
                  <AppIcon
                    icon="trash"
                    class="text-primary"
                    v-bind:class="{ 'text-black-50': !avatar.value }"
                  />
                </button>
              </div>
            </div>
          </div>

          <!-- name and roles -->
          <div>
            <h5>{{ data.value?.people.names }}</h5>
            <p>{{ data.value?.people.lastnames }}</p>

            <span
              v-for="(item, index) in data.value?.roles"
              :key="index"
              class="badge rounded-pill text-bg-primary bg-primary me-1"
            >
              {{ item }}
            </span>
          </div>
        </div>

        <!-- actions -->
        <div class="d-flex flex-row align-items-center gap-2">
          <AppButtonBack
            class="button-back"
            v-if="routeBack.value.name"
            :to="{
              name: routeBack.value.name,
              params: {
                academicPeriodGroupId: routeBack.value.academicPeriodGroupId,
              },
            }"
          ></AppButtonBack>

          <AppButton label="core.save" @click="save()"></AppButton>
        </div>
      </section>

      <section style="height: 80vh; overflow: auto">
        <div class="bg-white" style="padding: 1rem 2rem 4rem">
          <nav>
            <div class="nav nav-tabs" id="nav-tab" role="tablist">
              <button
                class="nav-link active text-capitalize"
                data-bs-target="#basic-information"
                aria-controls="basic-information"
                id="basic-information-tab"
                data-bs-toggle="tab"
                aria-selected="true"
                type="button"
                role="tab"
              >
                {{ t('reports.filters.showBasicInformation') }}
              </button>

              <button
                v-if="showMedicalInformation"
                data-bs-target="#medical-information"
                aria-controls="medical-information"
                class="nav-link text-capitalize"
                id="medical-information-tab"
                aria-selected="false"
                data-bs-toggle="tab"
                type="button"
                role="tab"
              >
                {{ t('reports.filters.showMedicalInformation') }}
              </button>

              <button
                data-bs-target="#Cargar-firma"
                aria-controls="Cargar-firma"
                class="nav-link text-capitalize"
                id="Cargar-firma-tab"
                aria-selected="false"
                data-bs-toggle="tab"
                type="button"
                role="tab"
              >
                {{ t('Cargar firma') }}
              </button>
            </div>
          </nav>

          <div class="tab-content" id="nav-tabContent">
            <div
              class="tab-pane fade show active"
              id="basic-information"
              role="tabpanel"
              aria-labelledby="basic-information-tab"
            >
              <section>
                <h4 class="text-capitalize mt-3">
                  {{ t('academicAdministration.matriculates.form.sectionOne') }}
                </h4>

                <div class="row">
                  <AppFormField
                    :form-control="v$.form.peopleForm.identificationTypeId"
                    label="academicAdministration.people.identificationType"
                  >
                    <AppAutocomplete
                      v-model="v$.form.peopleForm.identificationTypeId.$model"
                      :options="relatedData.value.identificationTypes"
                      input-id="identificationTypeId"
                    ></AppAutocomplete>
                  </AppFormField>

                  <AppFormField
                    :form-control="v$.form.peopleForm.identification"
                    label="academicAdministration.people.identification"
                  >
                    <input
                      class="form-control"
                      type="text"
                      v-model="v$.form.peopleForm.identification.$model"
                    />
                  </AppFormField>
                </div>

                <div class="row">
                  <AppFormField
                    :form-control="v$.form.peopleForm.names"
                    label="academicAdministration.people.name"
                  >
                    <input
                      class="form-control"
                      type="text"
                      v-model="v$.form.peopleForm.names.$model"
                    />
                  </AppFormField>

                  <AppFormField
                    :form-control="v$.form.peopleForm.lastnames"
                    label="academicAdministration.people.lastname"
                  >
                    <input
                      class="form-control"
                      type="text"
                      v-model="v$.form.peopleForm.lastnames.$model"
                    />
                  </AppFormField>
                </div>

                <div class="row">
                  <AppFormField
                    :form-control="v$.form.peopleForm.email"
                    label="academicAdministration.people.email"
                  >
                    <input
                      class="form-control"
                      type="text"
                      v-model="v$.form.peopleForm.email.$model"
                    />
                  </AppFormField>

                  <AppFormField
                    :form-control="v$.form.peopleForm.mobile"
                    label="academicAdministration.people.mobile"
                  >
                    <input
                      class="form-control"
                      type="text"
                      v-model="v$.form.peopleForm.mobile.$model"
                    />
                  </AppFormField>
                </div>

                <div class="row">
                  <AppFormField
                    :form-control="v$.form.peopleForm.homePhone"
                    label="academicAdministration.people.homePhone"
                  >
                    <input
                      class="form-control"
                      type="text"
                      v-model="v$.form.peopleForm.homePhone.$model"
                    />
                  </AppFormField>

                  <AppFormField
                    :form-control="v$.form.peopleForm.workPhone"
                    label="academicAdministration.people.workPhone"
                  >
                    <input
                      class="form-control"
                      type="text"
                      v-model="v$.form.peopleForm.workPhone.$model"
                    />
                  </AppFormField>
                </div>

                <div class="row">
                  <AppFormField
                    :form-control="v$.form.peopleForm.genderId"
                    label="academicAdministration.people.gender"
                  >
                    <AppAutocomplete
                      v-model="v$.form.peopleForm.genderId.$model"
                      :options="relatedData.value.genders"
                      input-id="genderId"
                    ></AppAutocomplete>
                  </AppFormField>

                  <AppFormField
                    :form-control="v$.form.peopleForm.religion"
                    label="academicAdministration.people.religion"
                  >
                    <input
                      class="form-control"
                      type="text"
                      v-model="v$.form.peopleForm.religion.$model"
                    />
                  </AppFormField>
                </div>

                <div class="row">
                  <AppFormField
                    :form-control="v$.form.peopleForm.nationality"
                    label="academicAdministration.people.nationality"
                  >
                    <input
                      class="form-control"
                      type="text"
                      v-model="v$.form.peopleForm.nationality.$model"
                    />
                  </AppFormField>

                  <AppFormField
                    :form-control="v$.form.peopleForm.primaryLanguage"
                    label="academicAdministration.people.primaryLanguage"
                  >
                    <input
                      class="form-control"
                      type="text"
                      v-model="v$.form.peopleForm.primaryLanguage.$model"
                    />
                  </AppFormField>
                </div>
              </section>

              <hr />

              <section>
                <h4 class="text-capitalize">
                  {{ t('academicAdministration.matriculates.form.sectionTwo') }}
                </h4>

                <div class="row">
                  <AppFormField
                    :form-control="v$.form.peopleForm.country"
                    label="País"
                  >
                    <AppGeographicSearch
                      :search-key="'country'"
                      :id="v$.form.peopleForm.country.$model"
                      @geographic-data="
                        (data) => (v$.form.peopleForm.country.$model = data.id)
                      "
                    ></AppGeographicSearch>
                  </AppFormField>

                  <AppFormField
                    :form-control="v$.form.peopleForm.region"
                    label="Departamento"
                  >
                    <AppGeographicSearch
                      :search-key="'region'"
                      :country-id="v$.form.peopleForm.country.$model"
                      :id="v$.form.peopleForm.region.$model"
                      @geographic-data="
                        (data) => (v$.form.peopleForm.region.$model = data.id)
                      "
                    ></AppGeographicSearch>
                  </AppFormField>
                </div>

                <div class="row">
                  <AppFormField
                    :form-control="v$.form.peopleForm.homeMunicipalityId"
                    label="Municipio"
                  >
                    <AppGeographicSearch
                      :search-key="'city'"
                      :country-id="v$.form.peopleForm.country.$model"
                      :region-id="v$.form.peopleForm.region.$model"
                      :id="v$.form.peopleForm.homeMunicipalityId.$model"
                      @geographic-data="
                        (data) =>
                          (v$.form.peopleForm.homeMunicipalityId.$model =
                            data.id)
                      "
                    ></AppGeographicSearch>
                  </AppFormField>

                  <AppFormField
                    :form-control="v$.form.peopleForm.direction"
                    label="academicAdministration.people.direction"
                  >
                    <input
                      class="form-control"
                      type="text"
                      v-model="v$.form.peopleForm.direction.$model"
                    />
                  </AppFormField>
                </div>
              </section>

              <hr />

              <section>
                <h4 class="text-capitalize">
                  {{
                    t('academicAdministration.matriculates.form.sectionThree')
                  }}
                </h4>

                <div class="row">
                  <AppFormField
                    :form-control="v$.form.peopleForm.countryBirth"
                    label="País"
                  >
                    <AppGeographicSearch
                      :search-key="'country'"
                      :id="v$.form.peopleForm.countryBirth.$model"
                      @geographic-data="
                        (data) =>
                          (v$.form.peopleForm.countryBirth.$model = data.id)
                      "
                    ></AppGeographicSearch>
                  </AppFormField>

                  <AppFormField
                    :form-control="v$.form.peopleForm.regionBirth"
                    label="Departamento"
                  >
                    <AppGeographicSearch
                      :search-key="'region'"
                      :country-id="v$.form.peopleForm.countryBirth.$model"
                      :id="v$.form.peopleForm.regionBirth.$model"
                      @geographic-data="
                        (data) =>
                          (v$.form.peopleForm.regionBirth.$model = data.id)
                      "
                    ></AppGeographicSearch>
                  </AppFormField>
                </div>

                <div class="row">
                  <AppFormField
                    :form-control="v$.form.peopleForm.birthMunicipalityId"
                    label="Municipio"
                  >
                    <AppGeographicSearch
                      :search-key="'city'"
                      :country-id="v$.form.peopleForm.countryBirth.$model"
                      :region-id="v$.form.peopleForm.regionBirth.$model"
                      :id="v$.form.peopleForm.birthMunicipalityId.$model"
                      @geographic-data="
                        (data) =>
                          (v$.form.peopleForm.birthMunicipalityId.$model =
                            data.id)
                      "
                    ></AppGeographicSearch>
                  </AppFormField>

                  <AppFormField
                    :form-control="v$.form.peopleForm.birthDate"
                    label="academicAdministration.people.birthday"
                  >
                    <input
                      class="form-control"
                      type="date"
                      v-model="v$.form.peopleForm.birthDate.$model"
                    />
                  </AppFormField>
                </div>
              </section>
            </div>

            <div
              class="tab-pane fade"
              id="medical-information"
              role="tabpanel"
              aria-labelledby="medical-information-tab"
            >
              <h4 class="text-capitalize mt-3">
                {{ t('reports.filters.showMedicalInformation') }}
              </h4>

              <div class="row">
                <AppFormField
                  :form-control="v$.form.medicalInformation.rh"
                  label="Tipo de sangre"
                >
                  <input
                    class="form-control"
                    type="text"
                    v-model="v$.form.medicalInformation.rh.$model"
                  />
                </AppFormField>

                <AppFormField
                  :form-control="v$.form.medicalInformation.doctorName"
                  label="Nombre del médico"
                >
                  <input
                    class="form-control"
                    type="text"
                    v-model="v$.form.medicalInformation.doctorName.$model"
                  />
                </AppFormField>
              </div>

              <div class="row">
                <AppFormField
                  :form-control="v$.form.medicalInformation.doctorPhone"
                  label="Teléfono del médico"
                >
                  <input
                    class="form-control"
                    type="text"
                    v-model="v$.form.medicalInformation.doctorPhone.$model"
                  />
                </AppFormField>

                <AppFormField
                  :form-control="v$.form.medicalInformation.doctorAddress"
                  label="Dirección del médico"
                >
                  <input
                    class="form-control"
                    type="text"
                    v-model="v$.form.medicalInformation.doctorAddress.$model"
                  />
                </AppFormField>
              </div>

              <div class="row">
                <AppFormField
                  :form-control="v$.form.medicalInformation.hospitalName"
                  label="Nombre del hospital"
                >
                  <input
                    class="form-control"
                    type="text"
                    v-model="v$.form.medicalInformation.hospitalName.$model"
                  />
                </AppFormField>

                <AppFormField
                  :form-control="v$.form.medicalInformation.hospitalPhone"
                  label="Teléfono del hospital"
                >
                  <input
                    class="form-control"
                    type="text"
                    v-model="v$.form.medicalInformation.hospitalPhone.$model"
                  />
                </AppFormField>
              </div>

              <AppFormField
                :form-control="v$.form.medicalInformation.hospitalAddress"
                label="Dirección del hospital"
              >
                <input
                  class="form-control"
                  type="text"
                  v-model="v$.form.medicalInformation.hospitalAddress.$model"
                />
              </AppFormField>

              <div class="row">
                <AppFormField
                  :form-control="v$.form.medicalInformation.knowSwim"
                >
                  <div class="form-check form-switch">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="isEconomicManager"
                      v-model="v$.form.medicalInformation.knowSwim.$model"
                    />
                    <label class="form-check-label" for="isEconomicManager"
                      >Sabe nadar</label
                    >
                  </div>
                </AppFormField>

                <AppFormField
                  :form-control="v$.form.medicalInformation.haveDiabetes"
                >
                  <div class="form-check form-switch">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="isEconomicManager"
                      v-model="v$.form.medicalInformation.haveDiabetes.$model"
                    />
                    <label class="form-check-label" for="isEconomicManager"
                      >Tiene diabetes</label
                    >
                  </div>
                </AppFormField>
              </div>

              <AppFormField
                :form-control="v$.form.medicalInformation.allergies"
                label="Alergias"
              >
                <AppVoiceInput v-model="v$.form.medicalInformation.allergies.$model" textareaClass="form-control" />

              </AppFormField>

              <AppFormField
                :form-control="v$.form.medicalInformation.medicalConditions"
                label="Condiciones médicas"
              >
                <AppVoiceInput v-model="v$.form.medicalInformation.medicalConditions.$model" textareaClass="form-control" />

              </AppFormField>

              <AppFormField
                :form-control="v$.form.medicalInformation.surgicalOperations"
                label="Operaciones quirúrgicas"
              >
                <AppVoiceInput v-model="v$.form.medicalInformation.surgicalOperations.$model" textareaClass="form-control" />

              </AppFormField>

              <AppFormField
                :form-control="v$.form.medicalInformation.medicines"
                label="Medicamentos que toma"
              >
                <AppVoiceInput v-model="v$.form.medicalInformation.medicines.$model" textareaClass="form-control" />

              </AppFormField>

              <AppFormField
                :form-control="v$.form.medicalInformation.additionalNotes"
                label="Notas adicionales"
              >
                <AppVoiceInput v-model="v$.form.medicalInformation.additionalNotes.$model" textareaClass="form-control" />
              </AppFormField>
            </div>

            <div
              class="tab-pane fade"
              id="Cargar-firma"
              role="tab"
              aria-labelledby="Cargar-firma-tab"
            >
              <section>
                <h4 class="text-capitalize mt-3">
                  {{ t('Cargar firma') }}
                </h4>

                <div v-if="data.value?.signature != null">
                  <a :href="data.value?.signature" target="_blank"
                    >Ver Imagen</a
                  >
                </div>

                <AppFormField
                  @change="onFilefirma($event)"
                  :form-control="v$.form.cargarfirma.logo"
                  :label="'Permitido *.jpg, *.png Dimensiones (283 x 83 Px)'"
                >
                  <AppUploadImage
                    input-id="file"
                    v-model="v$.form.cargarfirma.logo.$model"
                    :current-thumbnail="currentThumbnail"
                  >
                  </AppUploadImage>
                </AppFormField>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div v-else>
      <AppLoading v-if="loading || !route.query.convocationId"></AppLoading>

      <AppBaseList v-else :title="'Perfil de usuario'" isCard>
        <template #actions>
          <AppButtonBack
            v-if="routeBack.value.name"
            :to="{
              name: routeBack.value.name,
              params: {
                academicPeriodGroupId: routeBack.value.academicPeriodGroupId,
              },
            }"
          ></AppButtonBack>
        </template>

        <template #content>
          <div>
            <o-steps
              v-model="stepIndex"
              :animated="true"
              :rounded="true"
              :has-navigation="false"
              :label-position="'bottom'"
            >
              <o-step-item
                v-for="(detail, index) in data.value.detail"
                :key="index + 1"
                :label="detail.title"
                :step="index + 1"
                :clickable="true"
              >
                <h1 class="title has-text-centered">{{ detail.title }}</h1>

                <AppLoading v-if="loadingQuestions"></AppLoading>
                <template v-else>
                  <MatrixForm
                    v-if="detail.isMatriz"
                    :step-index="stepIndex"
                    :section-id="detail.id"
                    :data-profile="data.value"
                    :object-form="objectForm.value['sectionId_' + detail.id]"
                    :response-object="
                      customFormAnswers['sectionId_' + detail.id]
                    "
                    @update-step="updateStep"
                  ></MatrixForm>

                  <CustomFormInput
                    v-if="!detail.isMatriz"
                    :step-index="stepIndex"
                    :survey-id="detail.surveyId"
                    :questions="detail.questions"
                    :get-procedure="detail.getProcedure"
                    :save-procedure="detail.saveProcedure"
                    :section-id="detail.id"
                    :object-form="objectForm.value['sectionId_' + detail.id]"
                    :response-object="
                      customFormAnswers['sectionId_' + detail.id]
                    "
                    @update-step="updateStep"
                  ></CustomFormInput>
                </template>
              </o-step-item>
            </o-steps>
          </div>
        </template>
      </AppBaseList>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, Ref, ref, watch } from 'vue';
import {
  required,
  defaultImage,
} from '../../../shared/plugins/vuelidate.plugin';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppIcon from '../../../shared/components/AppIcon.vue';
import MatrixForm from '../../surveys/components/MatrixForm.vue';
import AppAvatar from '../../../shared/components/AppAvatar.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
// import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import CustomFormInput from '../../surveys/components/CustomFormInput.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppGeographicSearch from '../../../shared/components/Forms/AppGeographicSearch.vue';
import AppUploadImage from '../../../shared/components/Forms/AppUploadImage.vue';
// import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { ProfileDto } from '../dtos/profile.dto';

import { GetProfileService } from '../services/getProfile.service';
import { UpdateAvatarService } from '../services/updateAvatar.service';
import { UpdateProfileService } from '../services/updateProfile.service';
import { GetQuestionsOfEnrolService } from '../services/getQuestionsOfEnrol.service';
import { GetRelatedDataProfileService } from '../services/getRelatedDataProfile.service';
import { UpdateUserSignatureservice } from '../services/updateUserSignature.service';
import { useHeaderStore } from '../../../stores/header.store';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const getRelatedDataProfileService = new GetRelatedDataProfileService();
const getQuestionsOfEnrolService = new GetQuestionsOfEnrolService();
const updateProfileService = new UpdateProfileService();
const updateAvatarService = new UpdateAvatarService();
const getProfileService = new GetProfileService();
const updateUserSignatureservice = new UpdateUserSignatureservice();

export default defineComponent({
  name: 'ProfilePag',
  components: {
    // AppConfirmDeleteModal,
    AppGeographicSearch,
    CustomFormInput,
    AppAutocomplete,
    AppButtonBack,
    AppUploadImage,
    AppFormField,
    AppBaseList,
    AppLoading,
    MatrixForm,
    AppButton,
    AppAvatar,
    // AppModal,
    AppIcon,
    AppVoiceInput,
  },

  props: ['userId', 'data'],

  setup(props) {
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();

    useMeta({ title: 'Perfil' });
    let title = 'Perfil de usuario';

    const isConvocation: Ref<boolean> = ref(false);

    const customFormAnswers: any = reactive({});

    const cargar = props.data ?? null;
    const currentThumbnail = cargar?.cargarfirma?.logo ?? null;

    const medicalInformationId = ref();
    const stepIndex = ref(1);
    const userId = ref();

    const loadingQuestions = ref(false);
    const showMedicalInformation = ref(true);
    const modalDelete = ref(false);
    const loading = ref(true);

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
    const avatar: { value: any } = reactive({
      value: null,
    });
    const objectForm: { value: any } = reactive({
      value: {},
    });

    const form: any = reactive({
      peopleForm: {
        identificationTypeId: null,
        identification: null,
        names: null,
        lastnames: null,
        email: null,
        mobile: null,
        homePhone: null,
        workPhone: null,
        genderId: null,
        religion: null,
        nationality: null,
        primaryLanguage: null,

        country: null,
        region: null,
        homeMunicipalityId: null,
        direction: null,

        countryBirth: null,
        regionBirth: null,
        birthMunicipalityId: null,
        birthDate: null,
      },
      medicalInformation: {
        rh: null,
        doctorName: null,
        doctorPhone: null,
        doctorAddress: null,
        hospitalName: null,
        hospitalPhone: null,
        hospitalAddress: null,

        knowSwim: false,
        haveDiabetes: false,

        allergies: null,
        medicalConditions: null,
        surgicalOperations: null,
        medicines: null,
        additionalNotes: null,
      },
      cargarfirma: {
        logo: false,
      },
    });
    const v$ = useVuelidate(
      {
        form: {
          peopleForm: {
            identificationTypeId: { required },
            identification: { required },
            names: { required },
            lastnames: { required },
            email: { required },
            mobile: {},
            homePhone: {},
            workPhone: {},
            genderId: {},
            religion: {},
            nationality: {},
            primaryLanguage: {},

            country: {},
            region: {},
            homeMunicipalityId: {},
            direction: {},

            countryBirth: {},
            regionBirth: {},
            birthMunicipalityId: {},
            birthDate: {},
          },
          medicalInformation: {
            rh: {},
            doctorName: {},
            doctorPhone: {},
            doctorAddress: {},
            hospitalName: {},
            hospitalPhone: {},
            hospitalAddress: {},

            knowSwim: {},
            haveDiabetes: {},

            allergies: {},
            medicalConditions: {},
            surgicalOperations: {},
            medicines: {},
            additionalNotes: {},
          },
          cargarfirma: {
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

        await getData();

        if (!isConvocation.value) await loadData(userId.value);
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
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
              question.blockQuestion =
                question.rolesIdsBlocked &&
                question.rolesIdsBlocked.split(',').includes(roleId)
                  ? true
                  : false;
            });
          });

          const query: any = {
            ...route.query,
            convocationId: data.value?.convocationId,
            convocationEnrollId: data.value?.convocationEnrolId,
            stepId: data.value.id,
          };

          router.push({ query });

          await loadForm();
        } else {
          router.push({});

          if (!data.value?.people.student) showMedicalInformation.value = false;
        }
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    };

    const loadData = async (pUserId: number) => {
      userId.value = pUserId;
      loading.value = true;

      form.peopleForm.identificationTypeId = await data.value?.people
        ?.identificationTypeId;
      form.peopleForm.identification = data.value?.people?.identification;
      form.peopleForm.names = data.value?.people?.names;
      form.peopleForm.lastnames = data.value?.people?.lastnames;
      form.peopleForm.email = data.value?.people?.email;
      form.peopleForm.mobile = data.value?.people?.mobile;
      form.peopleForm.homePhone = data.value?.people?.homePhone;
      form.peopleForm.workPhone = data.value?.people?.workPhone;
      form.peopleForm.genderId = data.value?.people?.genderId;
      form.peopleForm.religion = data.value?.people?.religion;
      form.peopleForm.nationality = data.value?.people?.nationality;
      form.peopleForm.primaryLanguage = data.value?.people?.primaryLanguage;

      form.peopleForm.country =
        data.value?.people?.homeMunicipality?.region?.country?.id;
      form.peopleForm.region = data.value?.people?.homeMunicipality?.region?.id;
      form.peopleForm.homeMunicipalityId =
        data.value?.people?.homeMunicipality?.id;
      form.peopleForm.direction = data.value?.people?.direction;

      form.peopleForm.countryBirth =
        data.value?.people?.birthMunicipality?.region?.country?.id;
      form.peopleForm.regionBirth =
        data.value?.people?.birthMunicipality?.region?.id;
      form.peopleForm.birthMunicipalityId =
        data.value?.people?.birthMunicipality?.id;
      form.peopleForm.birthDate = data.value?.people?.birthDate;

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
      }

      avatar.value = data.value?.avatar;

      loading.value = false;
    };

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      const dataSend: any = {
        people: {
          id: data.value?.people.id,
          identificationTypeId: form.peopleForm.identificationTypeId,
          identification: form.peopleForm.identification,
          names: form.peopleForm.names,
          lastnames: form.peopleForm.lastnames,
          mobile: form.peopleForm.mobile,
          email: form.peopleForm.email,
          genderId: form.peopleForm.genderId,
          homePhone: form.peopleForm.homePhone,
          workPhone: form.peopleForm.workPhone,
          religion: form.peopleForm.religion,
          primaryLanguage: form.peopleForm.primaryLanguage,
          nationality: form.peopleForm.nationality,

          homeMunicipalityId: form.peopleForm.homeMunicipalityId?.id ?? null,
          direction: form.peopleForm.direction,

          birthDate: form.peopleForm.birthDate,
          birthMunicipalityId: form.peopleForm.birthMunicipalityId?.id ?? null,
        },
      };

      if (data.value?.people?.student) {
        dataSend.medicalInformation = {
          id: medicalInformationId.value,
          studentId: data.value.people.student.id,
          rh: form.medicalInformation.rh,
          doctorName: form.medicalInformation.doctorName,
          doctorPhone: form.medicalInformation.doctorPhone,
          doctorAddress: form.medicalInformation.doctorAddress,
          hospitalName: form.medicalInformation.hospitalName,
          hospitalPhone: form.medicalInformation.hospitalPhone,
          hospitalAddress: form.medicalInformation.hospitalAddress,
          knowSwim: form.medicalInformation.knowSwim,
          haveDiabetes: form.medicalInformation.haveDiabetes,
          allergies: form.medicalInformation.allergies,
          medicalConditions: form.medicalInformation.medicalConditions,
          surgicalOperations: form.medicalInformation.surgicalOperations,
          medicines: form.medicalInformation.medicines,
          additionalNotes: form.medicalInformation.additionalNotes,
        };
      }

      let response = await updateProfileService.run(dataSend);

      if (response.data.medicalInformationId)
        medicalInformationId.value = response.data.medicalInformationId;
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

    const openConfirmDelete = async () => {
      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      await updateAvatar(null);

      modalDelete.value = false;
    };

    const getFile = () => {
      let fileUpload = document.getElementById('fileIn');
      if (fileUpload != null) fileUpload.click();
    };

    // funciones para formularios personalizados
    const loadForm = async () => {
      let sectionForm: any = {};
      let sectionData: any = {};
      let selected: any[] = [];
      let sectionKey = '';
      let formKey = '';

      if (data.value) {
        const detailIds = data.value.detail.map((detail: any) => {
          return detail.id;
        });

        let counter = 0;

        while (counter < detailIds.length) {
          const params = {
            convocationEnrolId: data.value.convocationEnrolId,
            convocationStepId: data.value.id,
          };

          const questionsAndresponses: any =
            await getQuestionsOfEnrolService.run(detailIds[counter], params);

          sectionKey = 'sectionId_' + detailIds[counter];

          if (questionsAndresponses.questions) {
            questionsAndresponses.questions.forEach((question: any) => {
              formKey = 'question_' + question.id;

              if (question.answerOptions.length) {
                question.answerOptions.forEach((answer: any) => {
                  if (answer.selected) selected.push(answer.id);
                });

                sectionForm[formKey] =
                  question.questionTypeId == 3 ? selected[0] : selected;
                selected = [];
              } else {
                if (question.typeData == 'falso_verdadero')
                  sectionForm[formKey] = question.rowId == 1 ? true : false;
                else
                  sectionForm[formKey] = question.rowId
                    ? question.rowId
                    : question.answer ?? null;
              }

              sectionData[formKey] = question.required ? { required } : {};
            });
          }

          objectForm.value[sectionKey] = {
            form: sectionForm,
            v$: sectionData,
          };

          sectionForm = {};
          sectionData = {};
          counter += 1;
        }

        await loadResponseObjectForm(detailIds);
      }
    };

    const loadResponseObjectForm = async (detailIds: number[]) => {
      let counter = 0;

      while (counter < detailIds.length) {
        const params = {
          convocationEnrolId: data.value?.convocationEnrolId,
          convocationStepId: data.value?.id,
        };

        const questionsAndresponses: any = await getQuestionsOfEnrolService.run(
          detailIds[counter],
          params
        );

        data.value?.detail.forEach((detailStep: any) => {
          if (detailStep.id === detailIds[counter]) {
            detailStep.questions = questionsAndresponses.questions;
            detailStep.responses = questionsAndresponses.responses;
          }
        });

        let sectionKey = 'sectionId_' + detailIds[counter];

        if (questionsAndresponses.questions) {
          customFormAnswers[sectionKey] = [];
          let questions: any[] = [];

          questionsAndresponses.questions.forEach((question: any) => {
            questions.push({
              id: question.id,
              questionTypeId: question.questionTypeId,
              answerOptions: question.answerOptions,
              fieldName: question.fieldName,
              answer: question.answer,
            });
          });

          customFormAnswers[sectionKey] = questions;
          questions = [];

          counter += 1;
        }
      }
    };

    const updateStep = async (value: boolean) => {
      if (value && stepIndex.value == data.value?.detail.length)
        stepIndex.value = 0;

      loadingQuestions.value = true;
      await loadForm();
      loadingQuestions.value = false;

      stepIndex.value = value ? stepIndex.value + 1 : stepIndex.value - 1;
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
          alert(
            `Las dimensiones de la imagen no coinciden. El ancho máximo es ${maxWidth} píxeles y el alto máximo es ${maxHeight} píxeles.`
          );
          relatedData.value.logo = false;
          event.target.value = '';
          return;
        }
        await updateUserSignatureservice.run(userId.value, file);
        console.log('guardo la imagen', file);
        await getData();
      };
    };

    return {
      routeBack,
      loading,
      route,
      v$,
      t,

      showMedicalInformation,
      loadingQuestions,
      isConvocation,
      relatedData,
      modalDelete,
      avatar,
      data,

      openConfirmDelete,
      onFileSelected,
      confirmDelete,
      onFilefirma,
      getFile,
      save,
      currentThumbnail,
      customFormAnswers,
      objectForm,
      updateStep,
      stepIndex,
    };
  },
});
</script>

<style scoped>
.focus:hover {
  background-color: rgba(0, 0, 0, 0.1) !important;
}
.button-back {
  color: rgb(244, 63, 94) !important;
}
.button-back:hover {
  color: white !important;
}
</style>
