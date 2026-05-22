<!-- <template>
  <AppBaseList :title="title">
    <template #actions>
      <AppButton v-if="!enrollsMatriculates" label="Información complementaria" @click="openModalInfoComplementaria"></AppButton>
        <AppButton v-else label=" Ver Información complementaria" @click="redirect"></AppButton> 

      <AppButtonBack v-if="editForm || fromAdmin" :to="{ name: 'academicAdministration.enrolledByCourse' }"> </AppButtonBack> 
    </template>-->
<template>
  <AppLoading v-if="loading"></AppLoading>
  <template v-else>
    <div v-if="!validateUser">
      <AppCard>
        <template #body>
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
        </template>
      </AppCard>
    </div>

    <div v-else>
      <div class="container-form-nav">
        <div v-if="data" class="content-form-info-nav">
          <div class="personal-info-nav">
            <div class="text-title-form-nav">
              {{ data?.student?.people?.lastnames }}
              {{ data?.student?.people?.names }}
            </div>
            <div class="student-info-nav">
              <span
                >Estudiante -
                {{ data.student?.people?.identification || data.student?.code || 'No found' }}
              </span>
              <span class="state-tag" :class="data.activeUserInstitution === 1 ? 'state-active' : 'state-inactive'">
                {{ data.activeUserInstitution === 1 ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
          </div>
          <div class="academy-info-nav">
            <div class="academy-info-item">
              <span class="text-title-form-nav">{{ data?.academicPeriodGroup?.academicPeriod?.name }}</span>
              <span>Ciclo Academico</span>
            </div>
            <hr />
            <div class="academy-info-item">
              <span class="text-title-form-nav">{{ data?.academicPeriodGroup?.courseName }}</span>
              <span>Curso</span>

              <span
                class="state-tag"
                :class="data.isPreEnrolled === 0 && data.isRetired === 0 ? 'state-active' : data.isPreEnrolled === 1 && data.isRetired === 0 ? 'state-inactive' : 'state-retired'"
              >
                {{ data.isPreEnrolled === 0 && data.isRetired === 0 ? 'Activo' : data.isPreEnrolled === 1 && data.isRetired === 0 ? 'Oculto' : 'Retirado' }}
              </span>
            </div>
          </div>
        </div>

        <div :class="{ 'cards-no-border': !data }" class="content-form-nav">
          <div v-if="data" class="contetn-avatar-form-nav">
            <div class="avatar-form-nav avatar-shadow">
              <AppAvatar class="avatar-nav" :size="'lg'" :avatar="avatar.value" :name="data.student?.people?.lastnames ?? '?'"> </AppAvatar>
            </div>
          </div>
          <div class="form-navigation">
            <AppButton v-for="(section, index) in sectionsForm" :key="index" :class="{ active: currentSectionForm === section.key }" @click="goToSectionForm(section.key)">
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
                            <AppAvatar v-if="data" :size="'lg'" :name="data.student?.people?.lastnames ?? '?'" :avatar="avatar.value" class="avatar-form-form"></AppAvatar>

                            <template v-else>
                              <input type="file" class="file-input" @change="changeFile" accept="image/*" ref="fileInput" style="display: none" />
                              <img
                                :src="imageURL || ImageNotAvailable"
                                @click="triggerFileInput()"
                                alt="No found"
                                class="tw-object-cover tw-w-full tw-h-full avatar-form-form"
                                style="cursor: pointer"
                              />
                            </template>
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
                              <button :disabled="!avatar.value" @click="confirmDeleteAvatar()" class="p-1 ps-2 pe-2 rounded-circle" v-bind:class="{ focus: avatar.value }">
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

                        <AppFormField :form-control="v$.form.basicInformation.academicPeriodId" label="academicAdministration.matriculates.form.academicPeriod">
                          <AppAutocomplete
                            v-model="v$.form.basicInformation.academicPeriodId.$model"
                            :disabled="editForm || fromAdmin"
                            :input-id="'academicPeriodId'"
                            :options="academicPeriods"
                            :clearable="false"
                            class="bg-white"
                          >
                          </AppAutocomplete>
                        </AppFormField>

                        <AppFormField :form-control="v$.form.basicInformation.academicPeriodGroupId" label="academicAdministration.matriculates.form.course">
                          <AppAutocomplete
                            :disabled="editForm || fromAdmin || !currentAcademicPeriodGroups.value.length"
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
                              :options="identificationTypes"
                              input-id="identificationType"
                              :clearable="false"
                              class="bg-white"
                            ></AppAutocomplete>
                          </AppFormField>
                          <AppFormField :form-control="v$.form.basicInformation.peopleForm.identification" label="academicAdministration.people.identification">
                            <input :disabled="!editForm" class="form-control" type="text" id="identification" v-model="v$.form.basicInformation.peopleForm.identification.$model" />
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
                    <AppAutocomplete v-model="v$.form.personalInformation.peopleForm.gender.$model" :options="genders" input-id="gender"> </AppAutocomplete>
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
            <div v-if="currentSectionForm === 'tuition'">
              <section>
                <!-- <h4 class="text-capitalize">
                      {{ t('academicAdministration.matriculates.form.matriculateSection') }}
                    </h4> -->
                <div class="form-row">
                  <AppFormField :form-control="v$.form.tuition.peopleForm.enrollmentDate" label="Fecha de inscripción">
                    <input class="form-control" v-model="v$.form.tuition.peopleForm.enrollmentDate.$model" type="date" />
                  </AppFormField>

                  <AppFormField :form-control="v$.form.tuition.codeStudent" label="academicAdministration.matriculates.form.codeStudent">
                    <input class="form-control" type="text" id="codeStudent" v-model="v$.form.tuition.codeStudent.$model" />
                  </AppFormField>
                </div>
                <div class="form-row">
                  <AppFormField :form-control="v$.form.tuition.codeMEN" label="Código ministerio">
                    <input class="form-control" type="text" id="codeMEN" v-model="v$.form.tuition.codeMEN.$model" />
                  </AppFormField>
                  <AppFormField :form-control="v$.form.tuition.studentCategoryId" label="academicAdministration.matriculates.form.studentCategory">
                    <AppAutocomplete v-model="v$.form.tuition.studentCategoryId.$model" :options="studentCategories" input-id="studentCategoryId"></AppAutocomplete>
                  </AppFormField>
                </div>
                <div class="form-row">
                  <AppFormField :form-control="v$.form.tuition.peopleForm.scholarshipTypeId" label="Tipo de beca">
                    <AppAutocomplete v-model="v$.form.tuition.peopleForm.scholarshipTypeId.$model" :options="scholarshipType" input-id="scholarshipTypeId"></AppAutocomplete>
                  </AppFormField>
                  <AppFormField :form-control="v$.form.tuition.peopleForm.schoolInsuranceId" label="Seguro escolar">
                    <AppAutocomplete v-model="v$.form.tuition.peopleForm.schoolInsuranceId.$model" :options="schoolInsurance" input-id="schoolInsuranceId"></AppAutocomplete>
                  </AppFormField>
                </div>
              </section>
              <div class="action-button-form">
                <AppButton label="core.save" @click="goToNextSectionForm()"></AppButton>
              </div>
            </div>
            <div v-if="currentSectionForm === 'tutor'">
              <!--   <spam>{{ t('core.generalTerms.academic.parents.plural') }}</spam> -->
              <div class="container-tutores content-cards-form">
                <div class="content-tutores flex-1" v-tooltip="!editForm ? t('academicAdministration.matriculates.form.saveFirst') : ''">
                  <AppButton class="mb-3" style="width: 100%; height: 60px" :disabled="!editForm" @click="toParents()">
                    <AppIcon icon="user-plus" />
                    {{ t('core.new') }}
                    {{ t('core.generalTerms.academic.parents.singular') }}
                  </AppButton>

                  <div class="grid-cards scroll">
                    <div class="cards-tutor-form cards-form-form" v-for="(item, index) in matriculatesParents.value" :key="index">
                      <div class="content-status-end">
                        <span class="state-tag" :class="item.people?.activeUserInstitution === 1 ? 'state-active' : 'state-inactive'">
                          {{ item.people?.activeUserInstitution === 1 ? 'Activo' : 'Inactivo' }}
                        </span>
                      </div>
                      <div>
                        <AppAvatar :avatar="item.people?.avatar" :name="item.people?.lastnames ?? '?'" size="lg"></AppAvatar>
                      </div>
                      <div class="academy-info-item">
                        <span class="card-tutor-name"
                          >{{ item.people?.names }}
                          {{ item.people?.lastnames }}
                        </span>
                        <span style="font-size: 14px; color: #7f8c8d">{{ item.relationship.name }}</span>
                      </div>
                      <div class="footer-card-tutor">
                        <AppButtonEdit @click="toParents(item)"></AppButtonEdit>
                        <AppButtonDelete @click="openConfirmDelete(item)"></AppButtonDelete>
                      </div>
                    </div>
                  </div>

                  <AppModal v-model="parentDelete">
                    <AppConfirmDeleteModal
                      v-if="parentDelete"
                      :entity="`${currentParentDelete.value.people.firstName || ''} ${currentParentDelete.value.people.firstLastname || ''}`"
                      @confirmDelete="confirmDelete"
                    ></AppConfirmDeleteModal>
                  </AppModal>
                </div>
                <div class="content-form-tutor flex-2">
                  <AppCard class="cards-form-form scroll">
                    <template #body>
                      <StudentFormFullParent
                        :key="isEditingTutor ? parentTutor?.id : 'create'"
                        :title="isEditingTutor ? 'academicAdministration.parents.edit.title' : 'academicAdministration.parents.create.title'"
                        :parent="parentTutor"
                        :matriculateId="data.id"
                        @form-saved="handleFormParentSaved"
                      ></StudentFormFullParent>
                    </template>
                  </AppCard>
                </div>
              </div>
              <div class="action-button-form mt-3">
                <AppButton label="core.continue" @click="goToNextSectionForm()"></AppButton>
              </div>
            </div>
            <div v-if="currentSectionForm === 'outputContacts'">
              <section>
                <div class="form-row">
                  <AppFormField :form-control="v$.form.outputContacts.peopleForm.outputContactOneName" label="Nombre">
                    <input class="form-control" type="text" id="outputContactOne" v-model="v$.form.outputContacts.peopleForm.outputContactOneName.$model" />
                  </AppFormField>
                  <AppFormField :form-control="v$.form.outputContacts.peopleForm.outputContactOneNumber" label="celular">
                    <input class="form-control" type="text" id="outputContactOneNumber" v-model="v$.form.outputContacts.peopleForm.outputContactOneNumber.$model" />
                  </AppFormField>
                </div>
                <div class="form-row">
                  <AppFormField :form-control="v$.form.outputContacts.peopleForm.outputContactTwoName" label="Nombre">
                    <input class="form-control" type="text" id="outputContactTwo" v-model="v$.form.outputContacts.peopleForm.outputContactTwoName.$model" />
                  </AppFormField>
                  <AppFormField :form-control="v$.form.outputContacts.peopleForm.outputContactTwoNumber" label="celular">
                    <input class="form-control" type="text" id="outputContactTwoNumber" v-model="v$.form.outputContacts.peopleForm.outputContactTwoNumber.$model" />
                  </AppFormField>
                </div>
                <div class="form-row" style="padding: ">
                  <AppFormField :form-control="v$.form.outputContacts.peopleForm.observations" label="Observaciones">
                    <AppVoiceInput v-model="v$.form.outputContacts.peopleForm.observations.$model" textareaClass="form-control" />
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

            <div v-if="currentSectionForm === 'additionalInfo'">
              <StudentFormFullAdditionalInfo :surveySections="data.student.customFields" @save="getAdditionalInfo" />
            </div>
          </form>
        </template>
      </AppCard>
    </div>
    <template v-if="data">
      <AppModal v-model="infoComple" size="lg">
        <AdditionalInformationForm v-if="infoComple" :matriculateId="data.id" @close="closeModalInfoComplementaria"> </AdditionalInformationForm>
      </AppModal>
    </template>
  </template>
</template>

<!--  </AppBaseList>
</template> -->
<script lang="ts">
import { defineComponent, onMounted, reactive, Ref, ref, watch } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useVuelidate } from '@vuelidate/core';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
//import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppGeographicSearch from '../../../shared/components/Forms/AppGeographicSearch.vue';
import AdditionalInformationForm from '../components/AdditionalInformationForm.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppAvatar from '../../../shared/components/AppAvatar.vue';
import ImageNotAvailable from '../../../assets/images/image-not-available.png';
import StudentFormFullParent from './StudentFormFullParent.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import StudentFormFullAdditionalInfo from '../components/StudentFormFullAdditionalInfo.vue';

import { CustomFieldDto, EnrolledStudentDto } from '../dto/enrolledStudent.dto';
import { GetMatriculatesParentsService } from '../services/getMatriculatesParents.service';
import { CreateOrUpdateMatriculateService } from '../services/createOrUpdateMatriculate.service';
import { GetStudentByIdentificationService } from '../services/getStudentByIdentification.service';
import { GetMatriculateRelatedDataFormService } from '../../../shared/services/getMatriculateRelatedDataForm.service';
import { GetEnrolMatriculateService } from '../services/getEnrolMatriculate.service';
import { GetScholarShipService } from '../../institutionalConfiguration/services/getScholarShipType.service';
import { GetInsuranceService } from '../../institutionalConfiguration/services/getInsurance.service';
import { DeleteMatriculateParentByIdservice } from '../services/deleteMatriculateParentById.service';
import { UpdateAvatarService } from '../../access/services/updateAvatar.service';
import { GetAcademicHistoryByAcademicPeriodIdService } from '../../../shared/services/getAcademicHistoryByAcademicPeriodId.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';
//import AppEmptyLayout from '../../../shared/layout/AppEmptyLayout.vue';

const getMatriculateRelatedDataFormService = new GetMatriculateRelatedDataFormService();
const getScholarShipService = new GetScholarShipService();
const getInsuranceService = new GetInsuranceService();
const getStudentByIdentificationService = new GetStudentByIdentificationService();
const createOrUpdateMatriculateService = new CreateOrUpdateMatriculateService();
const getMatriculatesParentsService = new GetMatriculatesParentsService();
const getEnrolMatriculateService = new GetEnrolMatriculateService();
const deleteMatriculateParentByIdservice = new DeleteMatriculateParentByIdservice();
const updateAvatarService = new UpdateAvatarService();
const getAcademicHistoryByAcademicPeriodIdService = new GetAcademicHistoryByAcademicPeriodIdService();
export default defineComponent({
  name: 'StudentFormFull',
  props: ['title', 'routes', 'data', 'fromAdmin'],
  components: {
    AdditionalInformationForm,
    AppConfirmDeleteModal,
    AppGeographicSearch,
    AppButtonDelete,
    AppButtonEdit,
    AppAutocomplete,
    AppFormField,
    //AppBaseList,
    AppLoading,
    AppButton,
    AppIcon,
    AppModal,
    AppCard,
    AppAvatar,
    StudentFormFullParent,
    AppEmptyResponse,
    AppVoiceInput,
    StudentFormFullAdditionalInfo,
  },

  setup(props) {
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const data: Ref<EnrolledStudentDto | any> = ref(props.data);
    console.log('dataformfull', data);
    const currentAcademicPeriodGroupId = ref();
    const academicPeriodGroups = ref();
    const identificationTypes = ref();
    const studentCategories = ref();
    const academicPeriods = ref();
    const academicPeriodsHistory = ref();
    const academicPeriodHistoryId = ref();
    const genders = ref();
    const scholarshipType = ref<any[]>([]);
    const schoolInsurance = ref<any[]>([]);
    const infoComple = ref(false);
    const quotasAvailable = ref<number>(0);
    const matriculateId = ref<number>();
    const enrollsMatriculates = ref<any>(null);
    const isEditingTutor = ref(false);
    //const parentTutor = ref(null);
    const parentTutor = ref<any>({});
    const currentParentDelete: { value: any } = reactive({
      value: null,
    });
    const parentDelete = ref(false);
    //const currentAvatar = data.value?.basicInformation?.peopleForm?.avatar;
    const validateUser = ref(false);
    const editForm = ref(false);
    const loading = ref(true);
    const avatar: { value: any } = reactive({
      value: null,
    });
    //create img
    const fileInput = ref<HTMLInputElement | null>(null);
    const imageURL = ref<string | null>(null);
    const selectedImageFirt = ref<any>(null);

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
      { key: 'tuition', name: 'Matrícula', icon: 'graduation-cap' },
      { key: 'tutor', name: 'Acudientes', icon: 'user-friends' },
      {
        key: 'outputContacts',
        name: 'Contactos de salida',
        icon: 'phone-square-alt',
      },
      {
        key: 'academicHistory',
        name: 'Historial académico',
        icon: 'folder-open',
      },
      {
        key: 'additionalInfo',
        name: 'Información adicional',
        icon: 'info-circle',
      },
    ]);

    const additionalInfo = ref<CustomFieldDto[]>([]);

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
      const currentIndex = sectionsForm.value.findIndex((section) => section.key === currentSectionForm.value);

      if (currentIndex !== -1) {
        // Primero guardar los datos antes de cambiar de sección
        const saved = await save();

        // Si el guardado fue exitoso, avanza a la siguiente sección o redirige
        if (saved) {
          if (currentIndex < sectionsForm.value.length - 1) {
            // Si no es la última sección, avanza a la siguiente
            currentSectionForm.value = sectionsForm.value[currentIndex + 1].key;
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
      tuition: {
        codeStudent: null,
        codeMEN: null,
        studentCategoryId: null,
        peopleForm: {
          registrationDate: null,
          enrollmentDate: null,
          scholarshipTypeId: null,
          schoolInsuranceId: null,
        },
      },
      tutor: {
        peopleForm: {
          // campos específicos para el tutor
        },
      },
      outputContacts: {
        peopleForm: {
          outputContactOneName: null,
          outputContactOneNumber: null,
          outputContactTwoName: null,
          outputContactTwoNumber: null,
          observations: '',
        },
      },
      academicHistory: {
        peopleForm: {
          // campos específicos para el historial académico
        },
      },
    });

    const v$ = useVuelidate(
      {
        form: {
          basicInformation: {
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
          tuition: {
            studentCategoryId: {},
            codeStudent: {},
            codeMEN: {},
            peopleForm: {
              registrationDate: {},
              enrollmentDate: {},
              scholarshipTypeId: {},
              schoolInsuranceId: {},
            },
          },
          tutor: {
            peopleForm: {},
          },
          outputContacts: {
            peopleForm: {
              outputContactOneName: {},
              outputContactOneNumber: {},
              outputContactTwoName: {},
              outputContactTwoNumber: {},
              observations: {},
            },
          },
          academicHistory: {
            peopleForm: {},
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
    const academicHistory: { value: any[] } = reactive({
      value: [],
    });

    onMounted(async () => {
      //loading.value = true;
      try {
        if (data.value) {
          console.log('data', data);
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
        console.log('antes', relatedDataForm.academicPeriods);

        academicPeriodsHistory.value = [{ id: null, name: 'TODOS' }, ...relatedDataForm.academicPeriods];

        // Selecciona por defecto la opción TODOS
        academicPeriodHistoryId.value = null;

        console.log('academicP', academicPeriods.value);
        console.log('acamichistiory', academicPeriodsHistory.value);

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
        loadAcademicHistory();
        toParents();
      } catch (error) {
        console.error('Error loading data:', error);
      }
      loading.value = false;
    });
    const handleFormParentSaved = async () => {
      matriculatesParents.value = await getMatriculatesParentsService.run(data.value.id);
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
      if (!data.value?.student?.id) {
        console.log('[loadAcademicHistory] No student id, skip');
        return;
      }

      // Si es null => TODOS (no enviamos academicPeriodId)
      const isAll = academicPeriodHistoryId.value?.id === null;

      // Construimos params solo si NO es "Todos"
      const params: Record<string, any> = {};
      if (!isAll) {
        params.academicPeriodId = academicPeriodHistoryId.value;
      }

      console.log('[loadAcademicHistory] params to service:', params, ' (isAll:', isAll, ')');

      try {
        const res = await getAcademicHistoryByAcademicPeriodIdService.run(data.value.student.id, params);
        academicHistory.value = res;
        console.log('[loadAcademicHistory] response length:', academicHistory.value?.length ?? 0);
      } catch (err) {
        console.error('[loadAcademicHistory] error:', err);
        academicHistory.value = [];
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
      form.basicInformation.peopleForm.identification = formIdentification.identification;
    };
    const initForm = () => {
      form.basicInformation.academicPeriodId = data.value?.academicPeriodGroup?.academicPeriod.id;
      form.basicInformation.academicPeriodGroupId = data.value?.academicPeriodGroupId;
      form.tuition.studentCategoryId = data.value?.studentCategoryId;
      form.tuition.codeStudent = data.value?.student?.code;
      form.tuition.codeMEN = data.value?.student?.codeMEN;
      form.basicInformation.peopleForm.identification = data.value?.student?.people?.identification;
      form.basicInformation.peopleForm.identificationType = data.value?.student.people?.identificationTypeId;
      form.basicInformation.peopleForm.name = data.value?.student?.people?.names;
      form.basicInformation.peopleForm.lastname = data.value?.student?.people?.lastnames;
      form.basicInformation.peopleForm.mobile = data.value?.student?.people?.mobile;
      form.basicInformation.peopleForm.email = data.value?.student?.people?.email;
      form.personalInformation.peopleForm.country = data.value?.student?.people?.homeMunicipality?.region?.country?.id;
      form.personalInformation.peopleForm.region = data.value?.student?.people?.homeMunicipality?.region?.id;
      form.personalInformation.peopleForm.municipality = data.value?.student?.people?.homeMunicipality?.id;
      form.personalInformation.peopleForm.direction = data.value?.student?.people?.direction;
      form.personalInformation.peopleForm.countryBirth = data.value?.student?.people?.birthMunicipality?.region?.country?.id;
      form.personalInformation.peopleForm.regionBirth = data.value?.student?.people?.birthMunicipality?.region?.id;
      form.personalInformation.peopleForm.municipalityBirth = data.value?.student?.people?.birthMunicipality?.id;
      form.personalInformation.peopleForm.gender = data.value?.student?.people?.genderId;
      form.personalInformation.peopleForm.birthday = data.value?.student?.people?.birthDate;
      form.basicInformation.peopleForm.homePhone = data.value?.student?.people?.homePhone;

      form.basicInformation.peopleForm.workPhone = data.value?.student?.people?.workPhone;
      form.personalInformation.peopleForm.religion = data.value?.student?.people?.religion;
      form.personalInformation.peopleForm.primaryLanguage = data.value?.student?.people?.primaryLanguage;
      form.personalInformation.peopleForm.nationality = data.value?.student?.people?.nationality;
      form.tuition.peopleForm.enrollmentDate = data.value?.student?.people?.enrollmentDate
        ? data.value?.student.people.enrollmentDate.split(' ')[0] || ''
        : data.value?.student.people.createdAt?.split(' ')[0] || '';
      form.outputContacts.peopleForm.outputContactOneName = data.value?.student?.people?.outputContactNameOne;
      form.outputContacts.peopleForm.outputContactOneNumber = data.value?.student?.people?.outputContactPhoneOne;
      form.outputContacts.peopleForm.outputContactTwoName = data.value?.student?.people?.outputContactNameTwo;
      form.outputContacts.peopleForm.outputContactTwoNumber = data.value?.student?.people?.outputContactPhoneTwo;
      form.outputContacts.peopleForm.observations = data.value?.student?.people?.observations;
      form.personalInformation.peopleForm.zone = data.value?.student?.people?.zone;
      form.tuition.peopleForm.scholarshipTypeId = data.value?.student?.people?.scholarshipTypeId;
      form.tuition.peopleForm.schoolInsuranceId = data.value?.student?.people?.schoolInsuranceId;

      avatar.value = data.value?.student?.people?.avatar;

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
    };
    const toParents = async (dataTutor: any = null) => {
      if (dataTutor) {
        isEditingTutor.value = true; // Modo de edición
        parentTutor.value = { ...dataTutor }; // Pasamos los datos del tutor
      } else {
        isEditingTutor.value = false; // Modo de creación
        parentTutor.value = null; // No hay datos para crear
      }
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
      switch (currentSectionForm.value) {
        case 'basicInformation':
          return await v$.value.form.basicInformation.$validate();
        case 'personalInformation':
          return await v$.value.form.personalInformation.$validate();
        case 'tuition':
          return await v$.value.form.tuition.$validate();
        case 'tutor':
          return await v$.value.form.tutor.$validate();
        case 'outputContacts':
          return await v$.value.form.outputContacts.$validate();
        case 'academicHistory':
          return await v$.value.form.academicHistory.$validate();
        default:
          return true;
      }
    };

    const getAdditionalInfo = async (formData: CustomFieldDto[]) => {
      additionalInfo.value = formData;
      await save(true);
    };

    const save = async (saveAdditionalInfo: boolean = false) => {
      //const formIsValid = await v$.value.$validate();
      //if (!formIsValid) return;

      const sectionIsValid = await validateSection();
      if (!sectionIsValid) return;

      // if (form.peopleForm.outputContactOneName !== null && form.peopleForm.outputContactOneNumber !== null) {
      //   form.peopleForm.outputContactOne = form.peopleForm.outputContactOneName + '-' + form.peopleForm.outputContactOneNumber;
      // }

      // if (form.peopleForm.outputContactTwoName !== null && form.peopleForm.outputContactTwoNumber !== null) {
      //   form.peopleForm.outputContactTwo = form.peopleForm.outputContactTwoName + '-' + form.peopleForm.outputContactTwoNumber;
      // }

      const people: any = {
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
        enrollmentDate: form.tuition.peopleForm.enrollmentDate,

        outputContactNameOne: form.outputContacts.peopleForm.outputContactOneName,
        outputContactPhoneOne: form.outputContacts.peopleForm.outputContactOneNumber,
        outputContactNameTwo: form.outputContacts.peopleForm.outputContactTwoName,
        outputContactPhoneTwo: form.outputContacts.peopleForm.outputContactTwoNumber,
        observations: form.outputContacts.peopleForm.observations,
        zone: form.personalInformation.peopleForm.zone,
        scholarshipTypeId: form.tuition.peopleForm.scholarshipTypeId,
        schoolInsuranceId: form.tuition.peopleForm.schoolInsuranceId,

        //avatar: form.basicInformation.peopleForm.avatar,
      };
      const matriculate: any = {
        academicPeriodGroupId: form.basicInformation.academicPeriodGroupId,
        studentCategoryId: form.tuition.studentCategoryId,
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
        code: form.tuition.codeStudent,
        codeMEN: form.tuition.codeMEN,
      };
      console.log('people', people);
      console.log('matriculate', matriculate);
      console.log('student', student);

      try {
        //const people = { ...peopleData };
        // Verifica si el avatar es nulo o vacío, y se elimina si no es necesario enviarlo
        /* if (!people.avatar) {
          delete people.avatar;
        }*/
        const sendData: any = {
          matriculate,
          student,
          people,
        };

        if (saveAdditionalInfo) {
          sendData['customFields'] = additionalInfo.value;
        }

        const response = await createOrUpdateMatriculateService.run(sendData);

        if (!data.value?.id) {
          //Se valida que en el props de data no existe un id, es decir sin matricula
          console.log('test !data');
          if (selectedImageFirt.value) {
            //Se valida si se selcciono una imagen
            await updateAvatarService.run(response.data?.userId, selectedImageFirt.value);
          }
          //Validamos que al crear la matricula se redireccione a editMatriculate
          await router.push({
            name: 'academicAdministration.editMatriculate',
            params: {
              academicPeriodGroupId: currentAcademicPeriodGroupId.value,
              matriculateId: response.data.matriculateId,
            },
          });
          //const userIdCreate = response.data?.userId;
          //savedFirtImg(response); firtFile
        }

        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    };

    //create img
    const triggerFileInput = () => {
      fileInput.value?.click();
    };

    const changeFile = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const firtsFiles = target.files;

      // Verifica si hay archivos seleccionados
      if (!firtsFiles || !firtsFiles.length) return;

      const firtFile = firtsFiles[0]; // Selecciona el primer archivo
      selectedImageFirt.value = firtFile; // Guarda el archivo seleccionado en la variable

      // Crea la URL de la imagen seleccionada para mostrarla
      imageURL.value = URL.createObjectURL(firtFile);
    };

    //edit img
    const getFile = () => {
      let fileUpload = document.getElementById('fileIn');
      if (fileUpload != null) fileUpload.click();
    };
    const confirmDeleteAvatar = async () => {
      await updateAvatar(null);
    };

    const updateAvatar = async (file: any): Promise<void> => {
      try {
        const response = await updateAvatarService.run(data.value?.student?.people?.userId, file);
        avatar.value = response.data.avatar;
        console.log('new avatar', response, 'user', data.value?.student?.people?.userId);
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

    const openConfirmDelete = async (parentData: any) => {
      parentDelete.value = true;
      currentParentDelete.value = parentData;
    };

    const confirmDelete = async () => {
      try {
        if (currentParentDelete.value) {
          await deleteMatriculateParentByIdservice.run(currentParentDelete.value.id);
          if (currentParentDelete.value?.id == parentTutor.value?.id) {
            //si se elimina el parent que se estaba editando, se cierra la vista de editar
            await toParents();
          }
          currentParentDelete.value = null;
          matriculatesParents.value = await getMatriculatesParentsService.run(data.value.id);
          validateUser.value = true;
        }
        console.log('Respuesta de confirmación de eliminación:');
      } catch (error) {
        console.error('Error al confirmar eliminación:', error);
      }
      parentDelete.value = false;
    };

    return {
      formIdentification$,
      validateUser,
      loading,
      v$,
      t,
      sectionsForm,
      currentSectionForm,
      goToSectionForm,
      goToNextSectionForm,

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
      //currentAvatar,
      onFileSelected,
      getFile,
      avatar,
      ImageNotAvailable,
      triggerFileInput,
      changeFile,
      imageURL,
      fileInput,
      //selectedImageFirt,

      isEditingTutor,
      parentTutor,
      handleFormParentSaved,
      academicHistory,
      iconMappingSubject,
      academicPeriodsHistory,
      academicPeriodHistoryId,

      validateIdentification,
      toParents,
      quota,
      save,
      openConfirmDelete,
      confirmDelete,
      parentDelete,
      confirmDeleteAvatar,
      currentParentDelete,

      getAdditionalInfo,
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
