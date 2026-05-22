<template>
  <AppBaseList title="Perfiles Profesionales">
    <template #actions>
      <AppButton variant="light" outlined size="sm" nativeType="button" @click="showPublicProfile = true"><AppIcon icon="eye" /> Ver perfil público</AppButton>
    </template>

    <template #content>
      <AppLoading v-if="isLoading" />

      <template v-else>
        <div class="page-header">
          <h1 class="page-title">Perfiles Profesionales</h1>
          <p class="page-subtitle">Gestiona tu perfil profesional de egresado</p>
        </div>

        <!-- Profile Completion Card -->
        <div class="section-wrap">
          <div class="completion-card">
            <div class="completion-top">
              <div>
                <h2 class="completion-title">Completa tu perfil profesional</h2>
                <p class="completion-hint">Un perfil completo aumenta tus oportunidades laborales</p>
              </div>
              <div class="completion-pct-wrap">
                <span class="completion-percentage">{{ completionPct }}%</span>
                <p class="completion-done">Completado</p>
              </div>
            </div>
            <div class="completion-bar">
              <div class="completion-bar-fill" :style="{ width: `${completionPct}%` }"></div>
            </div>
            <div class="completion-items">
              <div v-for="item in completionItems" :key="item.label" class="completion-item">
                <AppIcon icon="check-circle" :class="item.completed ? 'completion-item-icon--done' : 'completion-item-icon--pending'" class="completion-item-icon" />
                <span class="completion-item-label" :class="{ 'completion-item-label--pending': !item.completed }">{{ item.label }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Header Card -->
        <div class="section-wrap">
          <div class="profile-header-card">
            <div class="profile-header-bg">
              <AppButton nativeType="button" class="profile-header-edit-btn" @click="openPersonalInfoModal" title="Editar información">
                <AppIcon icon="pen" />
              </AppButton>
              <div class="profile-header-content">
                <div class="profile-avatar-wrap">
                  <img v-if="profile.photoUrl" :src="profile.photoUrl" alt="Foto" class="profile-avatar-img" />
                  <span v-else class="profile-avatar-initials">{{ initials }}</span>
                </div>
                <div class="profile-header-info">
                  <h2 class="profile-name">{{ profile.fullName }}</h2>
                  <p class="profile-program">{{ profile.program }}</p>
                  <div class="profile-meta">
                    <span><AppIcon icon="graduation-cap" class="meta-icon" /> Graduado {{ profile.graduationYear }}</span>
                    <span><AppIcon icon="map-marker-alt" class="meta-icon" /> {{ profile.city }}, {{ profile.country }}</span>
                    <span class="employment-badge" :class="`employment-badge--${employmentClass}`"> <AppIcon icon="briefcase" class="meta-icon" />{{ profile.employmentStatus }} </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="profile-header-body">
              <p class="profile-summary">{{ profile.professionalSummary }}</p>
              <div class="profile-links">
                <a v-if="profile.email" :href="`mailto:${profile.email}`" class="profile-link">
                  <AppIcon icon="envelope" class="meta-icon" />
                  {{ profile.email }}
                </a>
                <a v-if="profile.linkedin" :href="toExternalUrl(profile.linkedin)" target="_blank" rel="noopener noreferrer" class="profile-link profile-link--linkedin">
                  <AppIcon icon="external-link-alt" class="meta-icon" />
                  LinkedIn
                </a>
                <a v-if="profile.portfolio" :href="toExternalUrl(profile.portfolio)" target="_blank" rel="noopener noreferrer" class="profile-link profile-link--portfolio">
                  <AppIcon icon="globe" class="meta-icon" /> Portafolio
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="section-wrap tabs-wrap">
          <nav>
            <div class="nav nav-tabs tabs-nav" id="profile-tabs" role="tablist">
              <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#tab-personal" type="button" role="tab" @click="activeTab = 'personal'">
                <AppIcon icon="user" class="tab-icon" /> Información personal
              </button>
              <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-work" type="button" role="tab" @click="activeTab = 'work'">
                <AppIcon icon="briefcase" class="tab-icon" /> Experiencia laboral
              </button>
              <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-education" type="button" role="tab" @click="activeTab = 'education'">
                <AppIcon icon="graduation-cap" class="tab-icon" /> Educación adicional
              </button>
              <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-skills" type="button" role="tab" @click="activeTab = 'skills'">
                <AppIcon icon="star" class="tab-icon" /> Habilidades
              </button>
              <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-languages" type="button" role="tab" @click="activeTab = 'languages'">
                <AppIcon icon="language" class="tab-icon" /> Idiomas
              </button>
              <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-files" type="button" role="tab" @click="activeTab = 'files'">
                <AppIcon icon="file-alt" class="tab-icon" /> Archivos
              </button>
            </div>
          </nav>

          <div class="tab-content tab-body">
            <!-- ── Tab: Información personal ── -->
            <div class="tab-pane fade show active" id="tab-personal" role="tabpanel">
              <div class="tab-section-header">
                <div>
                  <h3 class="tab-section-title">Información personal</h3>
                  <p class="tab-section-subtitle">Datos básicos y de contacto</p>
                </div>
                <AppButton outlined variant="secondary" size="sm" nativeType="button" @click="openPersonalInfoModal"><AppIcon icon="edit" /> Editar información</AppButton>
              </div>

              <div class="info-panel">
                <div class="info-grid">
                  <div>
                    <h4 class="info-group-title">Contacto</h4>
                    <div class="info-item">
                      <AppIcon icon="envelope" class="info-icon" />
                      <div>
                        <p class="info-label">Email</p>
                        <p class="info-value">{{ profile.email }}</p>
                      </div>
                    </div>
                    <div class="info-item">
                      <AppIcon icon="phone" class="info-icon" />
                      <div>
                        <p class="info-label">Teléfono</p>
                        <p class="info-value info-value--accent">
                          {{ profile.phone }}
                        </p>
                      </div>
                    </div>
                    <div class="info-item">
                      <AppIcon icon="map-marker-alt" class="info-icon" />
                      <div>
                        <p class="info-label">Ubicación</p>
                        <p class="info-value">{{ profile.city }}, {{ profile.country }}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 class="info-group-title">Enlaces profesionales</h4>
                    <div class="info-item">
                      <AppIcon icon="external-link-alt" class="info-icon info-icon--blue" />
                      <div>
                        <p class="info-label">LinkedIn</p>
                        <p class="info-value info-value--link">
                          {{ personalInformation?.linkedin || '—' }}
                        </p>
                      </div>
                    </div>
                    <div class="info-item">
                      <AppIcon icon="globe" class="info-icon info-icon--purple" />
                      <div>
                        <p class="info-label">Portafolio</p>
                        <p class="info-value info-value--link">
                          {{ personalInformation?.briefcase || '—' }}
                        </p>
                      </div>
                    </div>
                    <div class="info-item">
                      <AppIcon icon="globe" class="info-icon info-icon--green" />
                      <div>
                        <p class="info-label">Sitio web</p>
                        <p class="info-value info-value--link">
                          {{ personalInformation?.webSite || '—' }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="info-summary-section">
                  <h4 class="info-group-title">Resumen profesional</h4>
                  <p class="info-summary-text">
                    {{ personalInformation?.summary || '—' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- ── Tab: Experiencia laboral ── -->
            <div class="tab-pane fade" id="tab-work" role="tabpanel">
              <div class="tab-section-header">
                <div>
                  <h3 class="tab-section-title">Experiencia laboral</h3>
                  <p class="tab-section-subtitle">{{ workExperiences.length }} experiencia{{ workExperiences.length !== 1 ? 's' : '' }} registrada{{ workExperiences.length !== 1 ? 's' : '' }}</p>
                </div>
                <AppButton outlined variant="primary" size="sm" nativeType="button" @click="openCreateWorkModal"><AppIcon icon="plus" /> Agregar experiencia</AppButton>
              </div>

              <div v-if="!workExperiences.length" class="empty-state">
                <AppIcon icon="briefcase" size="2x" class="empty-state-icon" />
                <p class="empty-state-text">No hay experiencias registradas</p>
              </div>

              <div class="items-list" v-else>
                <div v-for="exp in workExperiences" :key="exp.id" class="list-card">
                  <div class="list-card-icon list-card-icon--blue">
                    <AppIcon icon="briefcase" />
                  </div>
                  <div class="list-card-body">
                    <div class="list-card-header">
                      <h4 class="list-card-title">{{ exp.jobTitle }}</h4>
                      <div class="d-flex gap-1">
                        <AppButtonEdit @click="openEditWorkModal(exp)" />
                        <AppButtonDelete @click="confirmDeleteWork(exp)" />
                      </div>
                    </div>
                    <p class="list-card-subtitle">{{ exp.company }}</p>
                    <div class="list-card-meta">
                      <span v-if="exp.area"><AppIcon icon="tags" class="meta-icon" />{{ exp.area }}</span>
                      <span v-if="exp.municipality?.name"><AppIcon icon="map-marker-alt" class="meta-icon" />{{ exp.municipality.name }}</span>
                      <span class="meta-date">
                        <AppIcon icon="calendar" class="meta-icon" />{{ formatDate(exp.startDate) }}
                        –
                        {{ exp.currentlyWorksThere ? 'Presente' : formatDate(exp.endDate) }}
                      </span>
                    </div>
                    <p class="list-card-desc">{{ exp.functionsDescription }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── Tab: Educación adicional ── -->
            <div class="tab-pane fade" id="tab-education" role="tabpanel">
              <div class="tab-section-header">
                <div>
                  <h3 class="tab-section-title">Educación adicional</h3>
                  <p class="tab-section-subtitle">{{ educations.length }} formacion{{ educations.length !== 1 ? 'es' : '' }} registrada{{ educations.length !== 1 ? 's' : '' }}</p>
                </div>
                <AppButton outlined variant="primary" size="sm" nativeType="button" @click="openCreateEducationModal"><AppIcon icon="plus" /> Agregar formación</AppButton>
              </div>

              <div v-if="!educations.length" class="empty-state">
                <AppIcon icon="graduation-cap" size="2x" class="empty-state-icon" />
                <p class="empty-state-text">No hay formaciones registradas</p>
              </div>

              <div class="items-list" v-else>
                <div v-for="edu in educations" :key="edu.id" class="list-card">
                  <div class="list-card-icon list-card-icon--purple">
                    <AppIcon icon="certificate" />
                  </div>
                  <div class="list-card-body">
                    <div class="list-card-header">
                      <div>
                        <span class="edu-type-badge">{{ edu.studyType?.name || '—' }}</span>
                        <h4 class="list-card-title" style="margin-top: 4px">
                          {{ edu.title }}
                        </h4>
                      </div>
                      <div class="d-flex gap-1">
                        <AppButtonEdit @click="openEditEducationModal(edu)" />
                        <AppButtonDelete @click="confirmDeleteEducation(edu)" />
                      </div>
                    </div>
                    <p class="list-card-subtitle">{{ edu.institution }}</p>
                    <div class="list-card-meta">
                      <span v-if="edu.area"><AppIcon icon="tags" class="meta-icon" />{{ edu.area }}</span>
                      <span class="meta-date">
                        <AppIcon icon="calendar" class="meta-icon" />{{ formatDate(edu.startDate) }}
                        –
                        {{ edu.currentlyStudyThere ? 'Presente' : formatDate(edu.endDate) }}
                      </span>
                    </div>
                    <p class="list-card-desc">{{ edu.description }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── Tab: Habilidades ── -->
            <div class="tab-pane fade" id="tab-skills" role="tabpanel">
              <div class="tab-section-header">
                <div>
                  <h3 class="tab-section-title">Habilidades técnicas y profesionales</h3>
                  <p class="tab-section-subtitle">{{ skills.length }} habilidades en {{ skillCategories.length }} categoría{{ skillCategories.length !== 1 ? 's' : '' }}</p>
                </div>
                <AppButton outlined variant="primary" size="sm" nativeType="button" @click="openCreateSkillModal"><AppIcon icon="plus" /> Agregar habilidad</AppButton>
              </div>

              <div v-if="!skills.length" class="empty-state">
                <AppIcon icon="star" size="2x" class="empty-state-icon" />
                <p class="empty-state-text">No hay habilidades registradas</p>
              </div>

              <div v-else>
                <div v-for="cat in skillCategories" :key="cat" class="skill-category-block">
                  <p class="skill-category-label">{{ cat }}</p>
                  <div class="skills-grid">
                    <div v-for="skill in skillsByCategory(cat)" :key="skill.id" class="skill-card">
                      <div class="skill-card-header">
                        <div>
                          <p class="skill-name">{{ skill.name }}</p>
                          <div class="skill-stars">
                            <AppIcon v-for="s in 5" :key="s" icon="star" :class="s <= skillStars(skill.domainLevel) ? 'star-filled' : 'star-empty'" />
                          </div>
                          <p class="skill-level-text">
                            {{ skill.domainLevel }}
                          </p>
                        </div>
                        <div class="d-flex gap-1">
                          <AppButtonEdit @click="openEditSkillModal(skill)" />
                          <AppButtonDelete @click="confirmDeleteSkill(skill)" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── Tab: Idiomas ── -->
            <div class="tab-pane fade" id="tab-languages" role="tabpanel">
              <div class="tab-section-header">
                <div>
                  <h3 class="tab-section-title">Idiomas</h3>
                  <p class="tab-section-subtitle">{{ languages.length }} idioma{{ languages.length !== 1 ? 's' : '' }} registrado{{ languages.length !== 1 ? 's' : '' }}</p>
                </div>
                <AppButton outlined variant="primary" size="sm" nativeType="button" @click="openCreateLanguageModal"><AppIcon icon="plus" /> Agregar idioma</AppButton>
              </div>

              <div v-if="!languages.length" class="empty-state">
                <AppIcon icon="language" size="2x" class="empty-state-icon" />
                <p class="empty-state-text">No hay idiomas registrados</p>
              </div>

              <div class="items-list" v-else>
                <div v-for="lang in languages" :key="lang.id" class="language-card">
                  <div class="language-card-header">
                    <div class="lang-header-left">
                      <span class="lang-code-badge">{{ lang.code }}</span>
                      <h4 class="lang-name">{{ lang.language }}</h4>
                    </div>
                    <div class="d-flex gap-1">
                      <AppButtonEdit @click="openEditLanguageModal(lang)" />
                      <AppButtonDelete @click="confirmDeleteLanguage(lang)" />
                    </div>
                  </div>
                  <div class="lang-levels-grid">
                    <div>
                      <p class="lang-level-label">Lectura</p>
                      <span class="lang-level-badge" :class="`lang-level--${levelClass(lang.readingLevel)}`">{{ lang.readingLevel }}</span>
                    </div>
                    <div>
                      <p class="lang-level-label">Escritura</p>
                      <span class="lang-level-badge" :class="`lang-level--${levelClass(lang.writingLevel)}`">{{ lang.writingLevel }}</span>
                    </div>
                    <div>
                      <p class="lang-level-label">Conversación</p>
                      <span class="lang-level-badge" :class="`lang-level--${levelClass(lang.conversationLevel)}`">{{ lang.conversationLevel }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="lang-tip">
                <AppIcon icon="info-circle" class="lang-tip-icon" />
                <span><strong>Consejo:</strong> Evalúa honestamente tu nivel en cada área (lectura, escritura, conversación) para que empresas tengan una referencia clara de tus capacidades.</span>
              </div>
            </div>

            <!-- ── Tab: Archivos ── -->
            <div class="tab-pane fade" id="tab-files" role="tabpanel">
              <div class="tab-section-header">
                <div>
                  <h3 class="tab-section-title">Archivos y documentos</h3>
                  <p class="tab-section-subtitle">CV, portafolio, certificaciones y otros documentos relevantes</p>
                </div>
                <AppButton outlined variant="primary" size="sm" nativeType="button" @click="fileUploadInputRef?.click()"><AppIcon icon="upload" /> Subir archivo</AppButton>
                <input ref="fileUploadInputRef" type="file" class="d-none" accept=".pdf,.doc,.docx" @change="handleFileUpload" />
              </div>

              <div
                class="file-dropzone"
                :class="{ 'file-dropzone--active': isDragging }"
                @click="fileUploadInputRef?.click()"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
              >
                <AppIcon icon="upload" size="2x" class="file-dropzone-icon" />
                <p class="file-dropzone-text">Arrastra archivos aquí o haz clic para seleccionar</p>
                <p class="file-dropzone-hint">PDF, DOC, DOCX hasta 10MB</p>
              </div>

              <div class="items-list" v-if="graduateFiles.length">
                <div v-for="file in graduateFiles" :key="file.id" class="file-item">
                  <div class="file-icon" :class="`file-icon--${fileCategoryClass(file.category)}`">
                    <AppIcon icon="file-pdf" />
                  </div>
                  <div class="file-info">
                    <p class="file-name">{{ file.name }}</p>
                    <div class="file-meta">
                      <span class="file-category-badge" :class="`file-category-badge--${fileCategoryClass(file.category)}`">{{ file.category }}</span>
                      <span>{{ formatFileSize(file.sizeKb) }}</span>
                      <span>Subido {{ file.uploadedAt }}</span>
                    </div>
                  </div>
                  <div class="d-flex gap-1">
                    <a :href="file.url" target="_blank" class="btn btn-sm btn-outline-secondary btn-icon" title="Descargar">
                      <AppIcon icon="download" />
                    </a>
                    <AppButtonDelete @click="confirmDeleteFile(file)" />
                  </div>
                </div>
              </div>

              <div class="file-tips-grid">
                <div class="file-tip file-tip--blue">
                  <p class="file-tip-title">CV actualizado</p>
                  <p class="file-tip-text">Mantén tu CV actualizado para aumentar tus oportunidades laborales</p>
                </div>
                <div class="file-tip file-tip--purple">
                  <p class="file-tip-title">Portafolio de proyectos</p>
                  <p class="file-tip-text">Muestra tus mejores proyectos y trabajos destacados</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Drawers -->
        <PersonalInfoDrawer :isVisible="showPersonalInfoModal" :data="profile" :personal-info="personalInformation" @update:isVisible="showPersonalInfoModal = $event" @save="handleProfileSave" />
        <WorkExperienceDrawer :isVisible="showWorkDrawer" :data="selectedWork" @update:isVisible="showWorkDrawer = $event" @save="handleWorkSave" />
        <AdditionalEducationDrawer :isVisible="showEducationDrawer" :data="selectedEducation" @update:isVisible="showEducationDrawer = $event" @save="handleEducationSave" />
        <SkillDrawer :isVisible="showSkillDrawer" :data="selectedSkill" :institution-id="institutionId" @update:isVisible="showSkillDrawer = $event" @save="handleSkillSave" />
        <LanguageDrawer :isVisible="showLanguageModal" :data="selectedLanguage" :used-language-ids="usedLanguageIds" @update:isVisible="showLanguageModal = $event" @save="handleLanguageSave" />
        <AppModal v-model="showPublicProfile" size="lg">
          <PublicProfileModal v-if="showPublicProfile" :profile="profile" :work-experiences="workExperiences" :educations="educations" :skills="skillsForPublicProfile" :languages="languages" />
        </AppModal>
        <AppModal v-model="showDeleteWorkModal">
          <AppConfirmDeleteModal v-if="showDeleteWorkModal" entity="experiencia laboral" @confirmDelete="handleDeleteWork" />
        </AppModal>
        <AppModal v-model="showDeleteEducationModal">
          <AppConfirmDeleteModal v-if="showDeleteEducationModal" entity="formación" @confirmDelete="handleDeleteEducation" />
        </AppModal>
        <AppModal v-model="showDeleteSkillModal">
          <AppConfirmDeleteModal v-if="showDeleteSkillModal" entity="habilidad" @confirmDelete="handleDeleteSkill" />
        </AppModal>
        <AppModal v-model="showDeleteLanguageModal">
          <AppConfirmDeleteModal v-if="showDeleteLanguageModal" entity="idioma" @confirmDelete="handleDeleteLanguage" />
        </AppModal>
        <AppModal v-model="showDeleteFileModal">
          <AppConfirmDeleteModal v-if="showDeleteFileModal" entity="archivo" @confirmDelete="handleDeleteFile" />
        </AppModal>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useMeta } from 'vue-meta';
import dayjs from 'dayjs';

import { useHeaderStore } from '../../../stores/header.store';
import { useUserStore } from '../../../stores/user';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import InstitutionsStore from '../../../shared/stores/institutions.store';

import PersonalInfoDrawer from '../components/PersonalInfoDrawer.vue';
import WorkExperienceDrawer from '../components/WorkExperienceDrawer.vue';
import AdditionalEducationDrawer from '../components/AdditionalEducationDrawer.vue';
import SkillDrawer from '../components/SkillDrawer.vue';
import LanguageDrawer from '../components/LanguageDrawer.vue';
import PublicProfileModal from '../components/PublicProfileModal.vue';

import { CreateOrUpdatePersonalInformationService } from '../services/createOrUpdatePersonalInformation.service';
import { GetSkillsParams, GraduateSkillDto } from '../dtos/graduateProfile.dto';
import { AdditionalEducation, GraduateProfileDto, PersonalInformation, ProfileCompletionDto, UpsertPersonalInformationRequest, WorkExperience } from '../dtos/graduateProfile.dto';
import { GetProfileCompletionService } from '../services/getProfileCompletion.service';
import { FindAllMunicipalitiesForSelectService } from '../../../shared/services/findAllMunicipalitiesForSelect.service';
import { FindAllCountriesForSelectService } from '../../../shared/services/findAllCountriesForSelect.service';
import { GetPersonalInformationService } from '../services/getPersonalInformation.service';
import { GetWorkExperiencesService } from '../services/getWorkExperiences.service';
import { normalizeWorkExperience, normalizeAdditionalEducation } from '../dtos/graduateProfile.dto';
import { GetAdditionalEducationsService } from '../services/getAdditionalEducations.service';
import { GetSkillsService } from '../services/getSkills.service';
import { GetLanguagesService } from '../services/getLanguages.service';
import { GetGraduateFilesService } from '../services/getGraduateFiles.service';
import { DeleteWorkExperienceService } from '../services/deleteWorkExperience.service';
import { DeleteAdditionalEducationService } from '../services/deleteAdditionalEducation.service';
import { DeleteSkillService } from '../services/deleteSkill.service';
import { DeleteLanguageService } from '../services/deleteLanguage.service';
import { DeleteGraduateFileService } from '../services/deleteGraduateFile.service';
import { CreateOrUpdateLanguageService } from '../services/createOrUpdateLanguage.service';
import { UploadGraduateFileService, IUploadGraduateFileService } from '../services/uploadGraduateFile.service';
import { SkillDto, SkillLevel, SKILL_LEVEL_STARS } from '../dtos/skill.dto';
import { LanguageDto, LanguageLevel } from '../dtos/language.dto';
import { GraduateFileDto, FileCategory } from '../dtos/graduateFile.dto';

export default defineComponent({
  name: 'ProfessionalProfile',
  components: {
    AppBaseList,
    AppLoading,
    AppModal,
    AppConfirmDeleteModal,
    AppIcon,
    AppButton,
    AppButtonEdit,
    AppButtonDelete,
    PersonalInfoDrawer,
    WorkExperienceDrawer,
    AdditionalEducationDrawer,
    SkillDrawer,
    LanguageDrawer,
    PublicProfileModal,
  },
  setup() {
    const title = 'Perfiles Profesionales';
    useMeta({ title });

    const headerStore = useHeaderStore();
    headerStore.module = { name: 'Egresados', url: '' };
    headerStore.moduleItem = { name: title, url: '' };
    headerStore.moduleSubItem = { name: '', url: '' };

    const isLoading = ref(true);
    const fileUploadInputRef = ref<HTMLInputElement | null>(null);
    const userStore = useUserStore();
    const peopleId = computed(() => userStore.user?.people?.id);
    const institutionId = computed(() => InstitutionsStore.state.selectedInstitution?.id ?? userStore.user?.people?.institutionId ?? null);

    const getCommonParams = (): GetSkillsParams | undefined => {
      const params = {
        peopleId: peopleId.value,
        institutionId: institutionId.value,
      };
      return params.peopleId && params.institutionId ? params : undefined;
    };
    onMounted(async () => {
      try {
        const params = getCommonParams();
        const canQuery = Boolean(params);

        const [personalResponse, workResponse, additionalEducations, skillsResponse] = await Promise.all([
          canQuery ? getPersonalInformationService.run(params) : getPersonalInformationService.run(),
          canQuery ? getWorkExperiencesService.run(params) : getWorkExperiencesService.run(),
          canQuery ? getAdditionalEducationsService.run(params) : Promise.resolve([]),
          params
            ? getSkillsService.run(params)
            : Promise.resolve({
                data: [],
                pagination: {
                  page: 1,
                  perPage: 10,
                  totalCount: 0,
                  hasPreviousPage: false,
                  hasNextPage: false,
                },
              }),
        ]);
        personalInformation.value = personalResponse?.data?.[0] ?? null;
        workExperiences.value = toWorkExperiences(workResponse);
        educations.value = toAdditionalEducations(additionalEducations);
        skills.value = skillsResponse.data ?? [];

        const user = userStore.user;
        profile.value = {
          ...profile.value,
          id: personalInformation.value?.id ?? 0,
          fullName: user?.people?.names && user?.people?.lastnames ? `${user.people.names} ${user.people.lastnames}` : user?.people?.names || user?.fullName || '',
          email: user?.people?.email ?? '',
          phone: user?.people?.mobile ?? '',
          city: user?.people?.homeMunicipality?.name ?? '',
          country: user?.people?.nationality ?? '',
          program: '',
          graduationYear: new Date().getFullYear(),
          photoUrl: user?.avatar ?? null,
          professionalSummary: personalInformation.value?.summary ?? '',
          linkedin: personalInformation.value?.linkedin ?? '',
          portfolio: personalInformation.value?.briefcase ?? '',
          website: personalInformation.value?.webSite ?? '',
          employmentStatus: (personalInformation.value?.employmentStatus as GraduateProfileDto['employmentStatus']) ?? 'Empleado',
        };

        const pi = personalInformation.value;
        if (pi?.municipalityId || pi?.countryId) {
          const [cityRes, countryRes] = await Promise.all([
            pi.municipalityId
              ? findAllMunicipalitiesForSelectService.run({
                  municipalityId: pi.municipalityId,
                })
              : Promise.resolve(null),
            pi.countryId
              ? findAllCountriesForSelectService.run({
                  countryId: pi.countryId,
                })
              : Promise.resolve(null),
          ]);
          if (cityRes?.data?.[0]?.name) profile.value.city = cityRes.data[0].name;
          if (countryRes?.data?.[0]?.name) profile.value.country = countryRes.data[0].name;
        }

        void refreshCompletion();

        const [langData, filesData] = await Promise.all([getLanguagesService.run(), peopleId.value ? getGraduateFilesService.run({ peopleId: peopleId.value }) : Promise.resolve([])]);
        const langArray = Array.isArray(langData) ? langData : (langData as any)?.data ?? [];
        languages.value = langArray.map(normalizeLanguage);
        graduateFiles.value = Array.isArray(filesData) ? filesData : (filesData as any)?.data ?? [];
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setTimeout(() => {
          isLoading.value = false;
        }, 600);
      }
    });

    const activeTab = ref('personal');

    const profile = ref<GraduateProfileDto>({
      id: 0,
      fullName: '',
      program: '',
      graduationYear: new Date().getFullYear(),
      city: '',
      country: '',
      email: '',
      phone: '',
      professionalSummary: '',
      employmentStatus: 'Empleado',
      photoUrl: null,
      linkedin: '',
      portfolio: '',
      website: '',
      completionPercentage: 0,
    });

    const findAllMunicipalitiesForSelectService = new FindAllMunicipalitiesForSelectService();
    const findAllCountriesForSelectService = new FindAllCountriesForSelectService();
    const getProfileCompletionService = new GetProfileCompletionService();
    const getPersonalInformationService = new GetPersonalInformationService();
    const getWorkExperiencesService = new GetWorkExperiencesService();
    const getAdditionalEducationsService = new GetAdditionalEducationsService();
    const getSkillsService = new GetSkillsService();
    const getLanguagesService = new GetLanguagesService();
    const getGraduateFilesService = new GetGraduateFilesService();
    const deleteWorkExperienceService = new DeleteWorkExperienceService();

    const toWorkExperiences = (raw: any): WorkExperience[] => {
      const rows: any[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
      return rows.map(normalizeWorkExperience).sort((a, b) => {
        if (a.currentlyWorksThere !== b.currentlyWorksThere) return b.currentlyWorksThere - a.currentlyWorksThere;
        return (b.startDate ?? '').localeCompare(a.startDate ?? '');
      });
    };
    const toAdditionalEducations = (raw: any): AdditionalEducation[] => {
      const rows: any[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
      return rows.map(normalizeAdditionalEducation).sort((a, b) => {
        if (a.currentlyStudyThere !== b.currentlyStudyThere) return b.currentlyStudyThere - a.currentlyStudyThere;
        return (b.startDate ?? '').localeCompare(a.startDate ?? '');
      });
    };
    const deleteAdditionalEducationService = new DeleteAdditionalEducationService();
    const deleteSkillService = new DeleteSkillService();
    const deleteLanguageService = new DeleteLanguageService();
    const deleteGraduateFileService = new DeleteGraduateFileService();
    const createOrUpdateLanguageService = new CreateOrUpdateLanguageService();

    const normalizeLanguage = (raw: any): LanguageDto => ({
      id: raw?.id,
      languageId: raw?.language?.id ?? raw?.languageId,
      language: raw?.language?.name ?? raw?.language ?? '',
      code: (raw?.language?.key ?? raw?.code ?? '').toUpperCase(),
      readingLevel: raw?.readingLevel,
      writingLevel: raw?.writingLevel,
      conversationLevel: raw?.speakingLevel ?? raw?.conversationLevel,
    });

    const refreshLanguages = async () => {
      try {
        const langData = await getLanguagesService.run();
        const langArray = Array.isArray(langData) ? langData : (langData as any)?.data ?? [];
        languages.value = langArray.map(normalizeLanguage);
      } catch {
        // keep existing list
      }
    };

    const refreshWorkExperiences = async () => {
      const params = getCommonParams();
      workExperiences.value = toWorkExperiences(await getWorkExperiencesService.run(params ?? undefined));
    };

    const refreshAdditionalEducations = async () => {
      const params = getCommonParams();
      if (!params) return;
      educations.value = toAdditionalEducations(await getAdditionalEducationsService.run(params));
    };

    const refreshSkills = async () => {
      const params = getCommonParams();
      if (!params) return;
      const res = await getSkillsService.run(params);
      skills.value = res.data ?? [];
    };

    const personalInformation = ref<PersonalInformation | null>(null);
    const workExperiences = ref<WorkExperience[]>([]);

    const initials = computed(() =>
      profile.value.fullName
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
    );
    const employmentClass = computed(
      () =>
        ({
          Empleado: 'employed',
          Desempleado: 'unemployed',
          Independiente: 'independent',
          Estudiando: 'studying',
        }[profile.value.employmentStatus] ?? 'employed')
    );

    const SECTION_LABELS: Record<string, string> = {
      personalInformation: 'Información personal',
      workExperiences: 'Experiencia laboral',
      additionalEducations: 'Educación adicional',
      skills: 'Habilidades',
      languages: 'Idiomas',
      files: 'Archivos (CV)',
    };

    const profileCompletion = ref<ProfileCompletionDto | null>(null);

    const completionPct = computed(() => Math.min(profileCompletion.value?.percentage ?? 0, 100));

    const completionItems = computed(() =>
      (profileCompletion.value?.sections ?? []).map((s) => ({
        label: SECTION_LABELS[s.section] ?? s.section,
        completed: s.completed,
      }))
    );

    const refreshCompletion = async () => {
      if (!peopleId.value) return;
      try {
        profileCompletion.value = await getProfileCompletionService.run(peopleId.value);
      } catch {
        // no bloquea la UI si falla
      }
    };

    const showPersonalInfoModal = ref(false);
    const showPublicProfile = ref(false);
    const openPersonalInfoModal = () => {
      showPersonalInfoModal.value = true;
    };
    const createOrUpdatePersonalInformationService = new CreateOrUpdatePersonalInformationService();
    const handleProfileSave = async (form: any) => {
      if (!peopleId.value) return;
      try {
        const payload: UpsertPersonalInformationRequest = {
          peopleId: peopleId.value,
          municipalityId: form.municipalityId ?? null,
          countryId: form.countryId ?? null,
          summary: form.professionalSummary,
          briefcase: form.portfolio,
          webSite: form.website,
          linkedin: form.linkedin,
        };
        const response = await createOrUpdatePersonalInformationService.run(payload, personalInformation.value?.id);
        profile.value.professionalSummary = form.professionalSummary;
        profile.value.linkedin = form.linkedin;
        profile.value.portfolio = form.portfolio;
        profile.value.website = form.website;
        if (form.municipalityName) profile.value.city = form.municipalityName;
        if (form.countryName) profile.value.country = form.countryName;
        if (personalInformation.value) {
          Object.assign(personalInformation.value, payload);
        } else {
          personalInformation.value = {
            ...payload,
            id: (response as any)?.id ?? 0,
            createdAt: '',
            updatedAt: '',
            deletedAt: null,
          } as PersonalInformation;
        }
        showPersonalInfoModal.value = false;
        void refreshCompletion();
      } catch (error) {
        console.error('Error al actualizar información personal:', error);
      }
    };

    // Work
    const showWorkDrawer = ref(false);
    const showDeleteWorkModal = ref(false);
    const selectedWork = ref<WorkExperience | null>(null);
    const workToDelete = ref<number | null>(null);
    const openCreateWorkModal = () => {
      selectedWork.value = null;
      showWorkDrawer.value = true;
    };
    const openEditWorkModal = (w: WorkExperience) => {
      selectedWork.value = w;
      showWorkDrawer.value = true;
    };
    const handleWorkSave = async () => {
      await refreshWorkExperiences();
      void refreshCompletion();
    };
    const confirmDeleteWork = (w: WorkExperience) => {
      workToDelete.value = w.id;
      showDeleteWorkModal.value = true;
    };
    const handleDeleteWork = async () => {
      if (!workToDelete.value) return;
      try {
        await deleteWorkExperienceService.run(workToDelete.value);
        showDeleteWorkModal.value = false;
        await refreshWorkExperiences();
        void refreshCompletion();
      } catch (error) {
        console.error('Error al eliminar experiencia laboral:', error);
        showDeleteWorkModal.value = false;
      }
    };

    // Education
    const educations = ref<AdditionalEducation[]>([]);
    const showEducationDrawer = ref(false);
    const showDeleteEducationModal = ref(false);
    const selectedEducation = ref<AdditionalEducation | null>(null);
    const educationToDelete = ref<number | null>(null);
    const openCreateEducationModal = () => {
      selectedEducation.value = null;
      showEducationDrawer.value = true;
    };
    const openEditEducationModal = (e: AdditionalEducation) => {
      selectedEducation.value = e;
      showEducationDrawer.value = true;
    };
    const handleEducationSave = () => {
      void refreshAdditionalEducations();
      void refreshCompletion();
    };
    const confirmDeleteEducation = (e: AdditionalEducation) => {
      educationToDelete.value = e.id;
      showDeleteEducationModal.value = true;
    };
    const handleDeleteEducation = async () => {
      if (!educationToDelete.value) return;
      try {
        await deleteAdditionalEducationService.run(educationToDelete.value);
        educations.value = educations.value.filter((e) => e.id !== educationToDelete.value);
        void refreshCompletion();
      } catch (error) {
        console.error('Error al eliminar formación:', error);
      }
      showDeleteEducationModal.value = false;
    };

    // Skills
    const skills = ref<GraduateSkillDto[]>([]);
    const showSkillDrawer = ref(false);
    const showDeleteSkillModal = ref(false);
    const selectedSkill = ref<GraduateSkillDto | null>(null);
    const skillToDelete = ref<number | null>(null);
    const skillCategories = computed(() => [...new Set(skills.value.map((s) => s.skillCategory?.name ?? '—'))]);
    const skillsByCategory = (cat: string) => skills.value.filter((s) => (s.skillCategory?.name ?? '—') === cat);
    const skillStars = (level: GraduateSkillDto['domainLevel']) => SKILL_LEVEL_STARS[level as SkillLevel] ?? 1;
    const skillsForPublicProfile = computed<SkillDto[]>(() =>
      skills.value.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.skillCategory?.name ?? '—',
        level: s.domainLevel as SkillLevel,
      }))
    );
    const openCreateSkillModal = () => {
      selectedSkill.value = null;
      showSkillDrawer.value = true;
    };
    const openEditSkillModal = (s: GraduateSkillDto) => {
      selectedSkill.value = s;
      showSkillDrawer.value = true;
    };
    const handleSkillSave = () => {
      void refreshSkills();
      void refreshCompletion();
    };
    const confirmDeleteSkill = (s: GraduateSkillDto) => {
      skillToDelete.value = s.id;
      showDeleteSkillModal.value = true;
    };
    const handleDeleteSkill = async () => {
      const id = Number(skillToDelete.value ?? 0);
      if (!id) return;
      await deleteSkillService.run(id);
      showDeleteSkillModal.value = false;
      await refreshSkills();
      void refreshCompletion();
    };

    // Languages
    const languages = ref<LanguageDto[]>([]);
    const usedLanguageIds = computed(() => languages.value.map((l) => l.languageId).filter((id): id is number => id != null));
    const showLanguageModal = ref(false);
    const showDeleteLanguageModal = ref(false);
    const selectedLanguage = ref<LanguageDto | null>(null);
    const languageToDelete = ref<number | null>(null);
    const levelClass = (level: LanguageLevel) =>
      ({
        Básico: 'basic',
        Intermedio: 'intermediate',
        Avanzado: 'advanced',
        Nativo: 'native',
      }[level]);
    const openCreateLanguageModal = () => {
      selectedLanguage.value = null;
      showLanguageModal.value = true;
    };
    const openEditLanguageModal = (l: LanguageDto) => {
      selectedLanguage.value = l;
      showLanguageModal.value = true;
    };
    const handleLanguageSave = async (payload: any) => {
      try {
        if (selectedLanguage.value?.id) {
          await createOrUpdateLanguageService.run(payload, selectedLanguage.value.id);
        } else {
          await createOrUpdateLanguageService.run(payload);
        }
        await refreshLanguages();
        void refreshCompletion();
      } catch (error) {
        console.error('Error al guardar idioma:', error);
      }
    };
    const confirmDeleteLanguage = (l: LanguageDto) => {
      languageToDelete.value = l.id;
      showDeleteLanguageModal.value = true;
    };
    const handleDeleteLanguage = async () => {
      if (!languageToDelete.value) return;
      try {
        await deleteLanguageService.run(languageToDelete.value);
        languages.value = languages.value.filter((l) => l.id !== languageToDelete.value);
        void refreshCompletion();
      } catch (error) {
        console.error('Error al eliminar idioma:', error);
      }
      showDeleteLanguageModal.value = false;
    };

    // Files
    const graduateFiles = ref<GraduateFileDto[]>([]);
    const showDeleteFileModal = ref(false);
    const fileToDelete = ref<number | null>(null);
    const formatFileSize = (kb: number) => (kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`);
    const fileCategoryClass = (cat: FileCategory) =>
      ({
        CV: 'cv',
        Portafolio: 'portfolio',
        Certificación: 'cert',
        Otro: 'other',
      }[cat]);
    const isDragging = ref(false);
    const uploadGraduateFileService = new UploadGraduateFileService();

    const uploadFile = async (file: File) => {
      if (!peopleId.value) return;
      try {
        const payload: IUploadGraduateFileService = {
          file,
          peopleId: peopleId.value,
        };
        const uploaded = await uploadGraduateFileService.run(payload);
        if (uploaded && uploaded.id) {
          graduateFiles.value.unshift(uploaded);
        } else if (Array.isArray(uploaded)) {
          graduateFiles.value = uploaded;
        } else {
          const filesData = peopleId.value ? await getGraduateFilesService.run({ peopleId: peopleId.value }) : [];
          graduateFiles.value = Array.isArray(filesData) ? filesData : filesData?.data ?? [];
        }
        void refreshCompletion();
      } catch (error) {
        console.error('Error al subir archivo:', error);
      }
    };

    const handleFileUpload = async (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) await uploadFile(file);
      (event.target as HTMLInputElement).value = '';
    };

    const handleDrop = async (event: DragEvent) => {
      isDragging.value = false;
      const file = event.dataTransfer?.files?.[0];
      if (file) await uploadFile(file);
    };

    const confirmDeleteFile = (f: GraduateFileDto) => {
      fileToDelete.value = f.id;
      showDeleteFileModal.value = true;
    };

    const toExternalUrl = (url: string) => (url && !/^https?:\/\//i.test(url) ? `https://${url}` : url);

    const formatDate = (dateStr: string | null | undefined): string => {
      if (!dateStr) return '—';
      const normalized = dateStr.includes('/') ? dateStr.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$1-$2') : dateStr;
      const parsed = dayjs(normalized);
      return parsed.isValid() ? parsed.format('MMM YYYY') : dateStr;
    };
    const handleDeleteFile = async () => {
      if (!fileToDelete.value) return;
      try {
        await deleteGraduateFileService.run(fileToDelete.value);
        graduateFiles.value = graduateFiles.value.filter((f) => f.id !== fileToDelete.value);
        void refreshCompletion();
      } catch (error) {
        console.error('Error al eliminar archivo:', error);
      }
      showDeleteFileModal.value = false;
    };

    return {
      title,
      isLoading,
      fileUploadInputRef,
      institutionId,
      activeTab,
      profile,
      initials,
      employmentClass,
      completionPct,
      completionItems,
      showPersonalInfoModal,
      showPublicProfile,
      openPersonalInfoModal,
      handleProfileSave,
      workExperiences,
      showWorkDrawer,
      showDeleteWorkModal,
      selectedWork,
      openCreateWorkModal,
      openEditWorkModal,
      handleWorkSave,
      confirmDeleteWork,
      handleDeleteWork,
      educations,
      showEducationDrawer,
      showDeleteEducationModal,
      selectedEducation,
      openCreateEducationModal,
      openEditEducationModal,
      handleEducationSave,
      confirmDeleteEducation,
      handleDeleteEducation,
      skills,
      showSkillDrawer,
      showDeleteSkillModal,
      selectedSkill,
      skillCategories,
      skillsByCategory,
      skillStars,
      openCreateSkillModal,
      openEditSkillModal,
      handleSkillSave,
      confirmDeleteSkill,
      handleDeleteSkill,
      languages,
      usedLanguageIds,
      showLanguageModal,
      showDeleteLanguageModal,
      selectedLanguage,
      levelClass,
      openCreateLanguageModal,
      openEditLanguageModal,
      handleLanguageSave,
      confirmDeleteLanguage,
      handleDeleteLanguage,
      graduateFiles,
      showDeleteFileModal,
      formatFileSize,
      fileCategoryClass,
      isDragging,
      handleFileUpload,
      handleDrop,
      confirmDeleteFile,
      handleDeleteFile,
      personalInformation,
      skillsForPublicProfile,
      formatDate,
      toExternalUrl,
    };
  },
});
</script>

<style scoped>
/* ── Layout ─────────────────────────────────────────────────────────── */
.page-header {
  padding: 1rem 1.5rem 0.5rem;
}
.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}
.page-subtitle {
  font-size: 0.875rem;
  color: #3b82f6;
  margin: 0;
}
.section-wrap {
  margin: 0 1.5rem 1rem;
}
.tabs-wrap {
  margin-bottom: 1.5rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

/* ── Completion card ─────────────────────────────────────────────────── */
.completion-card {
  background: #f0f4ff;
  border: 1px solid #c7d7fc;
  border-radius: 10px;
  padding: 1.25rem;
}
.completion-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}
.completion-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}
.completion-hint {
  font-size: 0.8125rem;
  color: #64748b;
  margin: 0;
}
.completion-pct-wrap {
  text-align: right;
}
.completion-percentage {
  font-size: 1.75rem;
  font-weight: 800;
  color: #3b82f6;
  line-height: 1;
  display: block;
}
.completion-done {
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 0;
}
.completion-bar {
  height: 8px;
  background: #dbeafe;
  border-radius: 99px;
  overflow: hidden;
}
.completion-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 99px;
  transition: width 0.6s ease;
}
.completion-items {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem 2rem;
  margin-top: 0.75rem;
}
.completion-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}
.completion-item-icon {
  font-size: 0.875rem;
  flex-shrink: 0;
}
.completion-item-icon--done {
  color: #22c55e;
}
.completion-item-icon--pending {
  color: #cbd5e1;
}
.completion-item-label {
  font-size: 0.8125rem;
  color: #1e293b;
}
.completion-item-label--pending {
  color: #94a3b8;
}

/* ── Profile header ──────────────────────────────────────────────────── */
.profile-header-card {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}
.profile-header-bg {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  padding: 1.25rem 1.5rem 1rem;
  position: relative;
}
.profile-header-edit-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  transition: background 0.15s;
}
.profile-header-edit-btn:hover {
  background: rgba(255, 255, 255, 0.35);
}
.profile-header-content {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}
.profile-avatar-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.2);
  border: 3px solid rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.profile-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.profile-avatar-initials {
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
}
.profile-header-info {
  flex: 1;
  min-width: 0;
}
.profile-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin: 0;
}
.profile-program {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.85);
  margin: 0.125rem 0;
}
.profile-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.85);
  align-items: center;
}
.meta-icon {
  margin-right: 3px;
}
.profile-header-body {
  padding: 1rem 1.5rem 1.25rem;
  background: white;
}
.profile-summary {
  font-size: 0.875rem;
  color: #374151;
  margin-bottom: 0.75rem;
}
.profile-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.profile-link {
  font-size: 0.8125rem;
  color: #374151;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
.profile-link--linkedin {
  color: #0077b5;
}
.profile-link--portfolio {
  color: #7c3aed;
}
.employment-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.625rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}
.employment-badge--employed {
  background: #d1fae5;
  color: #065f46;
}
.employment-badge--unemployed {
  background: #fee2e2;
  color: #991b1b;
}
.employment-badge--independent {
  background: #fef3c7;
  color: #92400e;
}
.employment-badge--studying {
  background: #dbeafe;
  color: #1e40af;
}

/* ── Tabs nav ────────────────────────────────────────────────────────── */
.tabs-nav {
  padding: 0 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}
.nav-tabs .nav-link {
  color: #64748b;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 0.75rem 1rem;
  font-size: 0.8125rem;
  font-weight: 500;
  border-radius: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}
.nav-tabs .nav-link:hover {
  color: #3b82f6;
  border-bottom-color: #bfdbfe;
  background: transparent;
}
.nav-tabs .nav-link.active {
  color: #3b82f6;
  border-bottom: 2px solid #3b82f6;
  background: transparent;
  font-weight: 600;
}
.tab-icon {
  font-size: 0.8rem;
}
.tab-body {
  padding: 1.25rem;
}

/* ── Tab common header ───────────────────────────────────────────────── */
.tab-section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}
.tab-section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}
.tab-section-subtitle {
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 0;
}

/* ── Empty state ─────────────────────────────────────────────────────── */
.empty-state {
  text-align: center;
  padding: 2.5rem 1rem;
  color: #94a3b8;
}
.empty-state-icon {
  color: #cbd5e1;
}
.empty-state-text {
  font-size: 0.875rem;
  margin: 0.5rem 0 0;
}

/* ── Personal info ───────────────────────────────────────────────────── */
.info-panel {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.25rem;
}
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
.info-group-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.875rem;
}
.info-item {
  display: flex;
  gap: 0.625rem;
  align-items: flex-start;
  margin-bottom: 0.875rem;
}
.info-icon {
  color: #94a3b8;
  margin-top: 2px;
  font-size: 0.875rem;
  flex-shrink: 0;
  width: 14px;
}
.info-icon--blue {
  color: #3b82f6;
}
.info-icon--purple {
  color: #7c3aed;
}
.info-icon--green {
  color: #10b981;
}
.info-label {
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 0;
}
.info-value {
  font-size: 0.875rem;
  color: #1e293b;
  margin: 0;
}
.info-value--accent {
  color: #2563eb;
}
.info-value--link {
  color: #2563eb;
}
.info-summary-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}
.info-summary-text {
  font-size: 0.875rem;
  color: #4b5563;
  margin: 0;
}
@media (max-width: 600px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}

/* ── List cards (work / education) ──────────────────────────────────── */
.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.list-card {
  display: flex;
  gap: 0.875rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
.list-card-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.list-card-icon--blue {
  background: #dbeafe;
  color: #3b82f6;
}
.list-card-icon--purple {
  background: #ede9fe;
  color: #7c3aed;
}
.list-card-body {
  flex: 1;
  min-width: 0;
}
.list-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.list-card-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}
.list-card-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.125rem 0 0;
}
.list-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 0.375rem 0;
  font-size: 0.75rem;
  color: #94a3b8;
  align-items: center;
}
.meta-date {
  color: #3b82f6;
}
.list-card-desc {
  font-size: 0.8125rem;
  color: #4b5563;
  margin: 0;
}
.edu-type-badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: 20px;
  font-size: 0.6875rem;
  font-weight: 600;
  background: #ede9fe;
  color: #7c3aed;
}

/* ── Skills ──────────────────────────────────────────────────────────── */
.skill-category-block {
  margin-bottom: 1.25rem;
}
.skill-category-label {
  font-size: 0.6875rem;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}
.skills-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
.skill-card {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
.skill-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.skill-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
  margin: 0 0 0.25rem;
}
.skill-stars {
  display: flex;
  gap: 2px;
  margin-bottom: 0.125rem;
}
.skill-level-text {
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 0;
}
.star-filled {
  color: #f59e0b;
}
.star-empty {
  color: #d1d5db;
}
@media (max-width: 600px) {
  .skills-grid {
    grid-template-columns: 1fr;
  }
}

/* ── Languages ───────────────────────────────────────────────────────── */
.language-card {
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
.language-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}
.lang-header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.lang-code-badge {
  min-width: 34px;
  height: 34px;
  padding: 0 6px;
  border-radius: 6px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 700;
  color: #475569;
}
.lang-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}
.lang-levels-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
}
.lang-level-label {
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 0 0 0.25rem;
}
.lang-level-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}
.lang-level--basic {
  background: #f1f5f9;
  color: #475569;
}
.lang-level--intermediate {
  background: #fef3c7;
  color: #92400e;
}
.lang-level--advanced {
  background: #dbeafe;
  color: #1e40af;
}
.lang-level--native {
  background: #d1fae5;
  color: #065f46;
}
.lang-tip {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  font-size: 0.8125rem;
  color: #1d4ed8;
}
.lang-tip-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

/* ── Files ───────────────────────────────────────────────────────────── */
.file-dropzone {
  border: 2px dashed #d1d5db;
  border-radius: 10px;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.file-dropzone--active {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.05);
}
.file-dropzone-icon {
  color: #cbd5e1;
}
.file-dropzone-text {
  font-size: 0.875rem;
  color: #94a3b8;
  margin: 0.5rem 0 0;
}
.file-dropzone-hint {
  font-size: 0.75rem;
  color: #cbd5e1;
  margin: 0.25rem 0 0;
}
.file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
.file-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.file-icon--cv {
  background: #dbeafe;
  color: #2563eb;
}
.file-icon--portfolio {
  background: #ede9fe;
  color: #7c3aed;
}
.file-icon--cert {
  background: #d1fae5;
  color: #059669;
}
.file-icon--other {
  background: #f1f5f9;
  color: #64748b;
}
.file-info {
  flex: 1;
  min-width: 0;
}
.file-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #2563eb;
  margin: 0;
}
.file-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.25rem;
  flex-wrap: wrap;
}
.file-category-badge {
  display: inline-block;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
}
.file-category-badge--cv {
  background: #dbeafe;
  color: #2563eb;
}
.file-category-badge--portfolio {
  background: #ede9fe;
  color: #7c3aed;
}
.file-category-badge--cert {
  background: #d1fae5;
  color: #059669;
}
.file-category-badge--other {
  background: #f1f5f9;
  color: #64748b;
}
.file-tips-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-top: 1rem;
}
.file-tip {
  padding: 0.875rem;
  border-radius: 8px;
}
.file-tip-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
}
.file-tip-text {
  font-size: 0.8125rem;
  margin: 0;
}
.file-tip--blue {
  background: #eff6ff;
  color: #1e40af;
}
.file-tip--purple {
  background: #f5f3ff;
  color: #4c1d95;
}
.btn-icon {
  width: 28px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
@media (max-width: 600px) {
  .file-tips-grid {
    grid-template-columns: 1fr;
  }
  .lang-levels-grid {
    grid-template-columns: 1fr;
    gap: 0.375rem;
  }
}

/* ── Drawer shared ───────────────────────────────────────────────────── */
.drawer-form-body {
  padding: 20px;
}
.req-note {
  font-size: 0.75rem;
  color: #94a3b8;
}
</style>
