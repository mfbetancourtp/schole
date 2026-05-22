<template>
  <AppDrawer v-model:isVisible="localVisible" :size="drawerSize">
    <template #head>
      <!-- CREATE -->
      <div v-if="mode === 'create'" class="drawerHead drawerHead--create">
        <div class="drawerHeadBox">
          <div class="drawerHeadBox__icon drawerHeadBox__icon--create">
            <AppIcon icon="book-open" />
          </div>
          <div>
            <h3 class="drawerHeadBox__title">
              {{ t('academicPrograms.subjectDrawer.createTitle') }}
            </h3>
            <p class="drawerHeadBox__subtitle">
              {{ areaName || t('academicPrograms.subjectDrawer.unselectedArea') }}
            </p>
          </div>
        </div>
      </div>

      <!-- VIEW -->
      <div v-else-if="mode === 'view'" class="drawerHead drawerHead--view">
        <div class="drawerHeadBox">
          <div class="drawerHeadBox__icon drawerHeadBox__icon--view">
            <AppIcon icon="eye" />
          </div>
          <div>
            <h3 class="drawerHeadBox__title">
              {{ t('academicPrograms.subjectDrawer.viewTitle') }}
            </h3>
            <div class="drawerHeadMeta">
              <AppBadge :label="form.code" variant="primary" />
              <span class="drawerHeadMeta__text">{{ form.shortName }}</span>
            </div>
            <p class="drawerHeadBox__subtitle">
              {{ t('academicPrograms.subjectDrawer.areaLabel') }}
              {{ areaName || t('academicPrograms.subjectDrawer.unassigned') }}
            </p>
          </div>
        </div>
      </div>

      <!-- EDIT -->
      <div v-else class="drawerHead drawerHead--edit">
        <div class="drawerHeadBox">
          <div class="drawerHeadBox__icon drawerHeadBox__icon--edit">
            <AppIcon icon="edit" />
          </div>
          <div>
            <h3 class="drawerHeadBox__title">
              {{ t('academicPrograms.subjectDrawer.editTitle') }}
            </h3>
            <div class="drawerHeadMeta">
              <AppBadge :label="form.code || t('academicPrograms.subjectDrawer.withoutCode')" variant="warning" />
              <span class="drawerHeadMeta__text">{{ areaName }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #body>
      <!-- CREATE / EDIT -->
      <form v-if="mode !== 'view'" class="drawerBody" @submit.prevent="handleSaveAll">
        <!-- 1 -->
        <section class="drawerSection">
          <div class="drawerSection__header">
            <div class="drawerSection__badge">1</div>
            <div>
              <h4 class="drawerSection__title">
                {{ t('academicPrograms.subjectDrawer.generalInformation') }}
              </h4>
              <p class="drawerSection__subtitle">
                {{ t('academicPrograms.subjectDrawer.generalInformationSubtitle') }}
              </p>
            </div>
          </div>

          <div class="drawerCard">
            <div class="formGrid">
              <div>
                <AppFormField :form-control="v$.form.code" :label="t('academicPrograms.subjectDrawer.code')">
                  <AppInput v-model="v$.form.code.$model" type="text" :placeholder="t('academicPrograms.subjectDrawer.exampleCode')" @input="handleUppercaseCode" />
                </AppFormField>
              </div>

              <div>
                <AppFormField :form-control="v$.form.name" :label="t('academicPrograms.subjectDrawer.fullName')">
                  <AppInput v-model="v$.form.name.$model" type="text" :placeholder="t('academicPrograms.subjectDrawer.exampleFullName')" />
                </AppFormField>
              </div>

              <div>
                <AppFormField :form-control="v$.form.shortName" :label="t('academicPrograms.subjectDrawer.shortName')">
                  <AppInput v-model="v$.form.shortName.$model" type="text" :placeholder="t('academicPrograms.subjectDrawer.exampleShortName')" />
                </AppFormField>
              </div>

              <div>
                <AppFormField :form-control="v$.form.credits" :label="t('academicPrograms.subjectDrawer.credits')">
                  <AppInput v-model="v$.form.credits.$model" type="number" placeholder="4" />
                </AppFormField>
              </div>
            </div>
          </div>
        </section>

        <!-- 2 -->
        <section class="drawerSection">
          <div class="drawerSection__header">
            <div class="drawerSection__badge">2</div>
            <div>
              <h4 class="drawerSection__title">
                {{ t('academicPrograms.subjectDrawer.hourlyIntensity') }}
              </h4>
              <p class="drawerSection__subtitle">
                {{ t('academicPrograms.subjectDrawer.hourlyIntensitySubtitle') }}
              </p>
            </div>
          </div>

          <div class="form-row">
            <AppFormField :form-control="v$.form.theoricalHours" :label="t('academicPrograms.subjectDrawer.theoreticalHours')">
              <AppInput v-model="v$.form.theoricalHours.$model" type="number" placeholder="32" />
            </AppFormField>

            <AppFormField :form-control="v$.form.practicalHours" :label="t('academicPrograms.subjectDrawer.practicalHours')">
              <AppInput v-model="v$.form.practicalHours.$model" type="number" placeholder="32" />
            </AppFormField>

            <AppFormField :form-control="v$.form.theoricalHours" :label="t('academicPrograms.subjectDrawer.totalHours')">
              <AppInput :modelValue="form.totalHours" type="number" placeholder="32" :disabled="true" />
            </AppFormField>
          </div>

          <div class="formGrid">
            <AppFormField :form-control="v$.form.spaceTypeId" :label="t('academicPrograms.subjectDrawer.requiredSpaceType')">
              <AppAutocomplete
                input-id="subject-space-type"
                v-model="v$.form.spaceTypeId.$model"
                :options="spaceTypesData"
                label="name"
                :reduce="(option) => option.id"
                :clearable="true"
                :multiple="false"
              />
            </AppFormField>

            <AppFormField :form-control="v$.form.maximumHours" :label="t('academicPrograms.subjectDrawer.intensity')">
              <AppInput v-model="v$.form.maximumHours.$model" type="number" placeholder="32" />
            </AppFormField>
          </div>
        </section>

        <!-- 3 -->
        <section class="drawerSection">
          <div class="drawerSection__header">
            <div class="drawerSection__badge">3</div>
            <div>
              <h4 class="drawerSection__title">
                {{ t('academicPrograms.subjectDrawer.academicConfiguration') }}
              </h4>
              <p class="drawerSection__subtitle">
                {{ t('academicPrograms.subjectDrawer.academicConfigurationSubtitle') }}
              </p>
            </div>
          </div>

          <div class="drawerCard">
            <AppFormField :form-control="v$.form.subjectCategoryId" :label="t('academicPrograms.subjectDrawer.type')">
              <AppAutocomplete
                input-id="subject-type"
                v-model="v$.form.subjectCategoryId.$model"
                :options="subjectCategoriesData"
                label="name"
                :reduce="(option) => option.id"
                :clearable="true"
                :multiple="false"
              />
            </AppFormField>

            <label class="checkboxCard">
              <input v-model="form.isDegreeRequirement" type="checkbox" class="form-check-input" />
              <div>
                <span class="checkboxCard__title">
                  {{ t('academicPrograms.subjectDrawer.degreeRequirement') }}
                </span>
                <small class="checkboxCard__subtitle">
                  {{ t('academicPrograms.subjectDrawer.degreeRequirementSubtitle') }}
                </small>
              </div>
            </label>
          </div>

          <div class="programsBlock">
            <div class="programsBlock__header">
              <h5 class="programsBlock__title">
                {{ t('academicPrograms.subjectDrawer.academicPrograms') }}
              </h5>
              <p class="programsBlock__subtitle">
                {{ t('academicPrograms.subjectDrawer.academicProgramsSubtitle') }}
              </p>
            </div>

            <AppSelectableCard :selected="allProgramsSelected" @toggle="toggleAllPrograms">
              <div class="programCardContent programCardContent--all">
                <div>
                  <p class="programCardContent__title">
                    {{ t('academicPrograms.subjectDrawer.allPrograms') }}
                  </p>
                  <p class="programCardContent__subtitle">
                    {{ t('academicPrograms.subjectDrawer.allProgramsSubtitle') }}
                  </p>
                </div>

                <AppBadge :label="`${programsData.length} ${t('academicPrograms.subjectDrawer.programs')}`" variant="primary" />
              </div>
            </AppSelectableCard>

            <div class="programsGrid">
              <AppSelectableCard v-for="program in programsData" :key="program.id" :selected="isProgramSelected(program.id)" @toggle="toggleProgram(program.id)">
                <div class="programCardContent">
                  <div>
                    <p class="programCardContent__title">{{ program.name }}</p>
                    <p v-if="program.description" class="programCardContent__subtitle">
                      {{ program.description }}
                    </p>
                  </div>

                  <AppBadge :label="program.code || t('academicPrograms.subjectDrawer.withoutCode')" variant="secondary" />
                </div>
              </AppSelectableCard>
            </div>

            <div v-if="selectedProgramsCount > 0 && !allProgramsSelected" class="programsResume">
              <AppBadge :label="String(selectedProgramsCount)" variant="success" />
              <span>
                {{ selectedProgramsCount === 1 ? t('academicPrograms.subjectDrawer.singleProgramSelected') : t('academicPrograms.subjectDrawer.multipleProgramsSelected') }}
              </span>
            </div>
          </div>

          <div class="sectionActions">
            <AppButton type="button" variant="primary" :disabled="!canSaveSubject || savingSubject" @click="saveSubjectSection">
              {{ t('academicPrograms.subjectDrawer.saveSubject') }}
            </AppButton>
          </div>
        </section>

        <!-- 4 -->
        <section class="drawerSection" :class="{ sectionDisabled: !subjectSaved }">
          <div class="drawerSection__header">
            <div class="drawerSection__badge">4</div>
            <div>
              <h4 class="drawerSection__title">
                {{ t('academicPrograms.subjectDrawer.competencies') }}
              </h4>
              <p class="drawerSection__subtitle">
                {{ t('academicPrograms.subjectDrawer.competenciesSubtitle') }}
              </p>
            </div>
          </div>

          <div v-if="!subjectSaved" class="emptyMini">
            {{ t('academicPrograms.subjectDrawer.saveSubjectBeforeCompetencies') }}
          </div>

          <div v-else class="drawerCard">
            <div v-if="!form.competencies?.length" class="emptyMini">
              {{ t('academicPrograms.subjectDrawer.noCompetenciesAdded') }}
            </div>

            <div v-for="(competency, index) in form.competencies" :key="competency.id || `competency-${index}`" class="dynamicCard">
              <div class="dynamicCard__head">
                <strong>
                  {{ t('academicPrograms.subjectDrawer.competency') }}
                  {{ index + 1 }}
                </strong>
                <AppButton type="button" variant="danger" outlined @click="openConfirmDeleteCompetency(competency)">
                  <AppIcon icon="trash" />
                </AppButton>
              </div>

              <div class="form-row">
                <AppFormField>
                  <label>{{ t('academicPrograms.subjectDrawer.code') + '*' }}</label>
                  <AppInput
                    :modelValue="competency.code"
                    type="text"
                    :placeholder="t('academicPrograms.subjectDrawer.exampleCompetencyCode')"
                    @update:modelValue="updateCompetency(competency.id, 'code', $event)"
                  />
                </AppFormField>

                <AppFormField>
                  <label>{{ t('academicPrograms.subjectDrawer.type') + '*' }}</label>
                  <AppAutocomplete
                    :input-id="`competency-type-${index}`"
                    :modelValue="competency.competencyTypeId"
                    :options="competencyTypesData"
                    label="name"
                    :reduce="(option) => option.id"
                    :clearable="true"
                    :multiple="false"
                    @update:modelValue="updateCompetency(competency.id, 'competencyTypeId', $event)"
                  />
                </AppFormField>
              </div>

              <div>
                <label>{{ t('academicPrograms.subjectDrawer.description') + '*' }}</label>
                <textarea
                  :value="competency.name"
                  class="nativeTextarea"
                  :placeholder="t('academicPrograms.subjectDrawer.describeCompetency')"
                  @input="updateCompetency(competency.id, 'name', ($event.target as HTMLTextAreaElement).value)"
                />
              </div>
            </div>

            <AppButton type="button" variant="secondary" outlined @click="addCompetency">
              <AppIcon icon="plus" />
              {{ t('academicPrograms.subjectDrawer.addCompetency') }}
            </AppButton>

            <div class="sectionActions">
              <AppButton type="button" variant="primary" :disabled="!canSyncCompetenciesTree || savingCompetencies" @click="saveCompetenciesSection">
                {{ t('academicPrograms.subjectDrawer.saveCompetencies') }}
              </AppButton>
            </div>
          </div>
        </section>

        <!-- 5 -->
        <section class="drawerSection" :class="{ sectionDisabled: !competenciesSaved }">
          <div class="drawerSection__header">
            <div class="drawerSection__badge">5</div>
            <div>
              <h4 class="drawerSection__title">
                {{ t('academicPrograms.subjectDrawer.learningOutcomes') }}
              </h4>
              <p class="drawerSection__subtitle">
                {{ t('academicPrograms.subjectDrawer.learningOutcomesSubtitle') }}
              </p>
            </div>
          </div>

          <div v-if="!competenciesSaved" class="emptyMini">
            {{ t('academicPrograms.subjectDrawer.saveCompetenciesBeforeLearningOutcomes') }}
          </div>

          <div v-else class="drawerCard">
            <div v-if="!form.learningResults.length" class="emptyMini">
              {{ t('academicPrograms.subjectDrawer.noLearningOutcomesAdded') }}
            </div>

            <div v-for="(result, index) in form.learningResults" :key="result.id || `learning-result-${index}`" class="dynamicCard">
              <div class="dynamicCard__head">
                <strong>
                  {{ t('academicPrograms.subjectDrawer.result') }}
                  {{ index + 1 }}
                </strong>
                <AppButton type="button" variant="danger" outlined @click="openConfirmDeleteLearningResult(result)">
                  <AppIcon icon="trash" />
                </AppButton>
              </div>

              <div class="form-row">
                <AppFormField>
                  <label>{{ t('academicPrograms.subjectDrawer.code') + '*' }}</label>
                  <AppInput
                    :modelValue="result.code"
                    type="text"
                    :placeholder="t('academicPrograms.subjectDrawer.exampleResultCode')"
                    @update:modelValue="updateLearningResult(result.id, 'code', $event)"
                  />
                </AppFormField>
              </div>

              <div>
                <div class="formGroup formGroup--full">
                  <label>{{ t('academicPrograms.subjectDrawer.learningOutcome') + '*' }}</label>
                  <textarea
                    :value="result.text"
                    class="nativeTextarea"
                    :placeholder="t('academicPrograms.subjectDrawer.describeResult')"
                    @input="updateLearningResult(result.id, 'text', ($event.target as HTMLTextAreaElement).value)"
                  />
                </div>

                <div>
                  <label>{{ t('academicPrograms.subjectDrawer.associatedCompetency') + '*' }}</label>

                  <AppAutocomplete
                    :input-id="`learning-result-competency-${result.id || index}`"
                    :modelValue="result.competencyId"
                    :options="competenciesSelectorData"
                    label="name"
                    :reduce="(option) => option.id"
                    :clearable="true"
                    :multiple="false"
                    @update:modelValue="updateLearningResult(result.id, 'competencyId', $event)"
                  />
                </div>
              </div>
            </div>

            <AppButton type="button" variant="secondary" outlined @click="addLearningResult">
              <AppIcon icon="plus" />
              {{ t('academicPrograms.subjectDrawer.addResult') }}
            </AppButton>

            <div class="sectionActions">
              <AppButton type="button" variant="primary" :disabled="!canSaveLearningOutcomes || !canSyncCompetenciesTree || savingLearningOutcomes" @click="saveLearningOutcomesSection">
                {{ t('academicPrograms.subjectDrawer.saveResults') }}
              </AppButton>
            </div>
          </div>
        </section>
      </form>

      <!-- VIEW -->
      <div v-else class="drawerBody">
        <section class="drawerSection">
          <div class="drawerSection__header">
            <div class="drawerSection__badge">1</div>
            <div>
              <h4 class="drawerSection__title">
                {{ t('academicPrograms.subjectDrawer.generalInformation') }}
              </h4>
              <p class="drawerSection__subtitle">
                {{ t('academicPrograms.subjectDrawer.subjectBasicData') }}
              </p>
            </div>
          </div>

          <div class="drawerCard">
            <div class="infoGrid">
              <div class="infoItem">
                <p class="infoItem__label">
                  {{ t('academicPrograms.subjectDrawer.code') }}
                </p>
                <p class="infoItem__value mono">{{ form.code }}</p>
              </div>

              <div class="infoItem">
                <p class="infoItem__label">
                  {{ t('academicPrograms.subjectDrawer.name') }}
                </p>
                <p class="infoItem__value">{{ form.name || form.shortName }}</p>
              </div>

              <div class="infoItem">
                <p class="infoItem__label">
                  {{ t('academicPrograms.subjectDrawer.shortName') }}
                </p>
                <p class="infoItem__value">{{ form.shortName }}</p>
              </div>

              <div class="infoItem">
                <p class="infoItem__label">
                  {{ t('academicPrograms.subjectDrawer.credits') }}
                </p>
                <p class="infoItem__value">{{ form.credits }}</p>
              </div>
            </div>
          </div>
        </section>

        <section class="drawerSection">
          <div class="drawerSection__header">
            <div class="drawerSection__badge">2</div>
            <div>
              <h4 class="drawerSection__title">
                {{ t('academicPrograms.subjectDrawer.hourlyIntensity') }}
              </h4>
            </div>
          </div>

          <div class="summaryGrid">
            <div class="summaryMiniCard">
              <p>
                {{ t('academicPrograms.subjectDrawer.shortTheoreticalHours') }}
              </p>
              <strong>{{ form.theoricalHours }}h</strong>
            </div>
            <div class="summaryMiniCard">
              <p>
                {{ t('academicPrograms.subjectDrawer.shortPracticalHours') }}
              </p>
              <strong>{{ form.practicalHours }}h</strong>
            </div>
            <div class="summaryMiniCard">
              <p>{{ t('academicPrograms.subjectDrawer.total') }}</p>
              <strong>{{ subjectTotalHours }}h</strong>
            </div>
          </div>
        </section>

        <section class="drawerSection">
          <div class="drawerSection__header">
            <div class="drawerSection__badge">3</div>
            <div>
              <h4 class="drawerSection__title">
                {{ t('academicPrograms.subjectDrawer.academicConfiguration') }}
              </h4>
            </div>
          </div>

          <div class="drawerCard">
            <div class="infoGrid">
              <div class="infoItem">
                <p class="infoItem__label">
                  {{ t('academicPrograms.subjectDrawer.type') }}
                </p>
                <p class="infoItem__value">
                  {{ selectedSubjectCategoryName }}
                </p>
              </div>

              <div class="infoItem">
                <p class="infoItem__label">
                  {{ t('academicPrograms.subjectDrawer.space') }}
                </p>
                <p class="infoItem__value">{{ selectedSpaceTypeName }}</p>
              </div>

              <div class="infoItem infoItem--full">
                <p class="infoItem__label">
                  {{ t('academicPrograms.subjectDrawer.degreeRequirementLabel') }}
                </p>
                <p class="infoItem__value">
                  {{ form.isDegreeRequirement ? t('academicPrograms.subjectDrawer.yes') : t('academicPrograms.subjectDrawer.no') }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section class="drawerSection">
          <div class="drawerSection__header">
            <div class="drawerSection__badge">4</div>
            <div>
              <h4 class="drawerSection__title">
                {{ t('academicPrograms.subjectDrawer.competencies') }}
              </h4>
            </div>
          </div>

          <div class="drawerCard">
            <div v-if="!form.competencies?.length" class="emptyMini">
              {{ t('academicPrograms.subjectDrawer.noDefinedCompetencies') }}
            </div>

            <div v-for="(competency, index) in form.competencies" :key="competency.id || `competency-view-${index}`" class="viewBlock">
              <p class="viewBlock__title">
                {{ t('academicPrograms.subjectDrawer.competency') }}
                {{ index + 1 }}
                <span v-if="competency.competencyType?.name"> - {{ competency.competencyType.name }} </span>
              </p>
              <p class="viewBlock__text">{{ competency.name }}</p>
            </div>
          </div>
        </section>

        <section class="drawerSection">
          <div class="drawerSection__header">
            <div class="drawerSection__badge">5</div>
            <div>
              <h4 class="drawerSection__title">
                {{ t('academicPrograms.subjectDrawer.learningOutcomes') }}
              </h4>
            </div>
          </div>

          <div class="drawerCard">
            <div v-if="!form.learningResults.length" class="emptyMini">
              {{ t('academicPrograms.subjectDrawer.noDefinedLearningOutcomes') }}
            </div>

            <div v-for="(result, index) in form.learningResults" :key="result.id || `result-view-${index}`" class="viewBlock">
              <p class="viewBlock__title">
                {{ t('academicPrograms.subjectDrawer.result') }}
                {{ index + 1 }}
                <span v-if="getCompetencyNameById(result.competencyId)"> - {{ getCompetencyNameById(result.competencyId) }} </span>
              </p>
              <p class="viewBlock__text">{{ result.text }}</p>
            </div>
          </div>
        </section>
      </div>
    </template>

    <template #footer>
      <div class="drawerFooter">
        <div class="drawerFooter__hint"></div>

        <div class="drawerFooter__actions">
          <AppButton variant="ghost" @click="handleClose">
            {{ isView ? t('academicPrograms.subjectDrawer.close') : t('academicPrograms.subjectDrawer.cancel') }}
          </AppButton>
        </div>
      </div>
    </template>
  </AppDrawer>

  <AppModal v-model="confirmExitModalVisible">
    <AppConfirmModal
      v-if="confirmExitModalVisible"
      :entity="t('academicPrograms.subjectDrawer.subjectEntity')"
      :textButton="t('academicPrograms.subjectDrawer.exit')"
      :textContent="t('academicPrograms.subjectDrawer.exitWithoutSaving')"
      @confirmDelete="confirmExitWithoutSaving"
    />
  </AppModal>

  <AppModal v-model="deleteModalVisible">
    <AppConfirmDeleteModal v-if="deleteModalVisible && pendingDeleteItem" :entity="pendingDeleteItem.entity" @confirmDelete="confirmDeleteItem" />
  </AppModal>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, reactive, ref, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useI18n } from 'vue-i18n';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppInput from '../../../shared/components/Forms/AppInput.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppSelectableCard from '../../../shared/components/Card/AppSelectableCard.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmModal from '../../../shared/components/Modal/AppConfirmModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { CreateOrUpdateSubjectService } from '../services/createOrUpdateSubject.service';
import { CreateOrUpdateCompetenciesPayload } from '../services/createOrUpdateCompetencies.service';
import { DeleteCompetencieService } from '../services/deleteCompetencie.service';
import { DeleteLearningOutcomesService } from '../services/deleteLearningOutcomes.service';

const createOrUpdateSubjectService = new CreateOrUpdateSubjectService();
const deleteCompetencieService = new DeleteCompetencieService();
const deleteLearningOutcomesService = new DeleteLearningOutcomesService();

interface ProgramItem {
  id: string | number;
  name: string;
  code?: string;
  description?: string;
}

type DrawerMode = 'create' | 'edit' | 'view';
type DeleteItemType = 'competency' | 'learningResult';

interface DeleteItemContext {
  entity: string;
  id: string | number;
  type: DeleteItemType;
}

export default defineComponent({
  name: 'SubjectDrawer',
  components: {
    AppDrawer,
    AppInput,
    AppButton,
    AppIcon,
    AppBadge,
    AppFormField,
    AppAutocomplete,
    AppSelectableCard,
    AppModal,
    AppConfirmModal,
    AppConfirmDeleteModal,
  },
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
    mode: {
      type: String as PropType<DrawerMode>,
      required: true,
    },
    areaName: {
      type: String,
      default: '',
    },
    areaId: {
      type: [String, Number],
      default: '',
    },
    formData: {
      type: [Object, Array] as PropType<any>,
      required: true,
    },
    spaceTypesData: {
      type: Array,
      required: true,
    },
    subjectCategoriesData: {
      type: Array,
      required: true,
    },
    programsData: {
      type: Array as PropType<ProgramItem[]>,
      default: () => [],
    },
    competencyTypesData: {
      type: Array,
      required: true,
    },
  },
  emits: ['update:isVisible', 'update:formData', 'close', 'reload-data'],
  setup(props, { emit }) {
    const savingSubject = ref(false);
    const savingCompetencies = ref(false);
    const savingLearningOutcomes = ref(false);
    const savingAll = ref(false);
    const { t } = useI18n();
    const localCompetencyKey = ref(0);
    const localLearningOutcomeKey = ref(0);
    const confirmExitModalVisible = ref(false);
    const deleteModalVisible = ref(false);
    const pendingDeleteItem = ref<DeleteItemContext | null>(null);
    const initialFormSnapshot = ref('');
    const mapCompetenciesFromData = (data: any) => {
      if (!Array.isArray(data?.competencies)) return [];

      return data.competencies.map((item: any) => ({
        id: item.id,
        code: item.code || '',
        name: item.name || '',
        competencyTypeId: item.competencyTypeId || null,
        competencyType: item.competencyType || null,
        learningResults: Array.isArray(item.learningOutcomes)
          ? item.learningOutcomes.map((outcome: any) => ({
              id: outcome.id,
              code: outcome.code || '',
              text: outcome.name || '',
              competencyId: outcome.competencyId || item.id,
            }))
          : [],
      }));
    };
    const mapLearningResultsFromData = (data: any) => {
      if (!Array.isArray(data?.competencies)) return [];

      return data.competencies.flatMap((competency: any) => {
        if (!Array.isArray(competency.learningOutcomes)) return [];

        return competency.learningOutcomes.map((outcome: any) => ({
          id: outcome.id,
          code: outcome.code || '',
          text: outcome.name || '',
          competencyId: outcome.competencyId || competency.id,
        }));
      });
    };
    const getComparableForm = () => ({
      id: form.id || '',
      code: String(form.code || '').trim(),
      name: String(form.name || '').trim(),
      shortName: String(form.shortName || '').trim(),
      credits: Number(form.credits || 0),
      theoricalHours: Number(form.theoricalHours || 0),
      practicalHours: Number(form.practicalHours || 0),
      totalHours: Number(form.totalHours || 0),
      maximumHours: String(form.maximumHours || '').trim() !== '' ? Number(form.maximumHours) : '',
      subjectCategoryId: form.subjectCategoryId || null,
      spaceTypeId: form.spaceTypeId || null,
      isDegreeRequirement: !!form.isDegreeRequirement,
      allPrograms: Number(form.allPrograms) === 1 ? 1 : 0,
      programIds: Array.isArray(form.programIds) ? [...form.programIds].map((id) => String(id)).sort() : [],
      competencies: Array.isArray(form.competencies)
        ? form.competencies.map((item: any) => ({
            id: item.id || '',
            code: String(item.code || '').trim(),
            name: String(item.name || '').trim(),
            competencyTypeId: item.competencyTypeId || null,
          }))
        : [],
      learningResults: Array.isArray(form.learningResults)
        ? form.learningResults.map((item: any) => ({
            id: item.id || '',
            code: String(item.code || '').trim(),
            text: String(item.text || '').trim(),
            competencyId: item.competencyId || null,
          }))
        : [],
    });
    const hasUnsavedChanges = computed(() => {
      return JSON.stringify(getComparableForm()) !== initialFormSnapshot.value;
    });

    const hasContentInCreate = computed(() => {
      const comparable = getComparableForm();

      return !!(
        comparable.code ||
        comparable.name ||
        comparable.shortName ||
        comparable.credits ||
        comparable.theoricalHours ||
        comparable.practicalHours ||
        comparable.maximumHours ||
        comparable.subjectCategoryId ||
        comparable.spaceTypeId ||
        comparable.isDegreeRequirement ||
        comparable.programIds.length ||
        comparable.competencies.length ||
        comparable.learningResults.length
      );
    });

    const shouldConfirmExit = computed(() => {
      if (props.mode === 'view') return false;

      if (props.mode === 'create') {
        return hasContentInCreate.value;
      }

      if (props.mode === 'edit') {
        return hasUnsavedChanges.value;
      }

      return false;
    });
    const getFormSource = (data: any) => {
      if (Array.isArray(data)) {
        return data[0] || {};
      }
      return data || {};
    };
    const buildInitialForm = (rawData: any) => {
      const data = getFormSource(rawData);
      const allPrograms = Number(data?.allPrograms) === 1 ? 1 : 0;

      const safeProgramsData = Array.isArray(props.programsData) ? props.programsData : [];

      return {
        id: data?.id || '',
        code: data?.code || '',
        name: data?.name || '',
        shortName: data?.shortName || '',
        credits: data?.credits ?? '',
        theoricalHours: data?.theoricalHours ?? '',
        practicalHours: data?.practicalHours ?? '',
        totalHours: Number(data?.theoricalHours || 0) + Number(data?.practicalHours || 0),
        maximumHours: data?.maximumHours ?? '',
        subjectCategoryId: data?.subjectCategoryId || null,
        spaceTypeId: data?.spaceTypeId || null,
        isDegreeRequirement: data?.isDegreeRequirement === 1,
        competencies: mapCompetenciesFromData(data),
        learningResults: mapLearningResultsFromData(data),
        programIds: allPrograms === 1 ? safeProgramsData.map((item) => item.id) : Array.isArray(data?.programIds) ? data.programIds : [],
        allPrograms,
      };
    };

    const form: any = reactive(buildInitialForm(props.formData));

    watch(
      () => props.formData,
      (newValue) => {
        const nextForm = buildInitialForm(newValue);

        form.id = nextForm.id;
        form.code = nextForm.code;
        form.name = nextForm.name;
        form.shortName = nextForm.shortName;
        form.credits = nextForm.credits;
        form.theoricalHours = nextForm.theoricalHours;
        form.practicalHours = nextForm.practicalHours;
        form.totalHours = nextForm.totalHours;
        form.maximumHours = nextForm.maximumHours;
        form.subjectCategoryId = nextForm.subjectCategoryId;
        form.spaceTypeId = nextForm.spaceTypeId;
        form.isDegreeRequirement = nextForm.isDegreeRequirement;
        form.competencies = nextForm.competencies;
        form.learningResults = nextForm.learningResults;
        form.allPrograms = nextForm.allPrograms;
        form.programIds = nextForm.programIds;

        initialFormSnapshot.value = JSON.stringify(getComparableForm());
      },
      { deep: true, immediate: true }
    );

    watch(
      form,
      (value) => {
        emit('update:formData', {
          ...value,
          competencies: Array.isArray(value.competencies) ? value.competencies.map((item: any) => ({ ...item })) : [],
          learningResults: Array.isArray(value.learningResults) ? value.learningResults.map((item: any) => ({ ...item })) : [],
          programIds: Array.isArray(value.programIds) ? [...value.programIds] : [],
          allPrograms: Number(value.allPrograms) === 1 ? 1 : 0,
        });
      },
      { deep: true }
    );

    watch(deleteModalVisible, (value) => {
      if (!value) {
        pendingDeleteItem.value = null;
      }
    });

    const v$ = useVuelidate(
      {
        form: {
          code: { required },
          name: { required },
          shortName: { required },
          credits: { required },
          theoricalHours: { required },
          practicalHours: {},
          subjectCategoryId: { required },
          spaceTypeId: {},
          maximumHours: {},
          isDegreeRequirement: {},
          competencies: {},
          learningResults: {},
          programIds: {},
          allPrograms: {},
        },
      },
      { form }
    );

    const closeDrawerDirectly = () => {
      emit('update:isVisible', false);
      emit('close');
    };

    const requestClose = () => {
      if (shouldConfirmExit.value) {
        confirmExitModalVisible.value = true;
        return;
      }

      closeDrawerDirectly();
    };

    const confirmExitWithoutSaving = () => {
      confirmExitModalVisible.value = false;
      closeDrawerDirectly();
    };

    const localVisible = computed({
      get: () => props.isVisible,
      set: (value: boolean) => {
        if (value) {
          emit('update:isVisible', true);
          return;
        }

        requestClose();
      },
    });

    const isView = computed(() => props.mode === 'view');
    const drawerSize = computed<'lg' | 'xl'>(() => 'lg');
    const subjectSaved = computed(() => !!form.id);

    const subjectTotalHours = computed(() => {
      return Number(v$.value.form.theoricalHours.$model || 0) + Number(v$.value.form.practicalHours.$model || 0);
    });

    const competenciesSaved = computed(() => {
      return Array.isArray(form.competencies) && form.competencies.length > 0 && form.competencies.every((item: any) => !!item.id);
    });

    const canSaveSubject = computed(() => {
      return (
        !!String(form.code || '').trim() &&
        !!String(form.name || '').trim() &&
        !!String(form.shortName || '').trim() &&
        !!String(form.credits ?? '').trim() &&
        !!String(form.theoricalHours ?? '').trim() &&
        !!Number(form.subjectCategoryId || '')
      );
    });

    const canSaveCompetencies = computed(() => {
      return (
        subjectSaved.value &&
        Array.isArray(form.competencies) &&
        form.competencies.length > 0 &&
        form.competencies.every((item: any) => !!String(item.code || '').trim() && !!String(item.name || '').trim() && !!item.competencyTypeId)
      );
    });

    const canSaveLearningOutcomes = computed(() => {
      return (
        competenciesSaved.value &&
        Array.isArray(form.learningResults) &&
        form.learningResults.length > 0 &&
        form.learningResults.every((item: any) => !!String(item.text || '').trim() && !!item.competencyId)
      );
    });

    const canSyncCompetenciesTree = computed(() => {
      if (!canSaveCompetencies.value) return false;

      if (!Array.isArray(form.learningResults) || !form.learningResults.length) {
        return true;
      }

      return canSaveLearningOutcomes.value;
    });

    watch(
      [() => form.theoricalHours, () => form.practicalHours],
      () => {
        form.totalHours = Number(form.theoricalHours || 0) + Number(form.practicalHours || 0);
      },
      { immediate: true }
    );

    const normalizeId = (id: string | number) => String(id);

    const allProgramIds = computed(() => {
      return Array.isArray(props.programsData) ? props.programsData.map((item) => item.id) : [];
    });

    const allProgramsSelected = computed(() => {
      if (!allProgramIds.value.length) return false;
      if (!Array.isArray(form.programIds)) return false;

      const selectedIds = form.programIds.map((id: string | number) => normalizeId(id));

      return allProgramIds.value.every((id) => selectedIds.includes(normalizeId(id)));
    });

    const selectedProgramsCount = computed(() => {
      return Array.isArray(form.programIds) ? form.programIds.length : 0;
    });

    const isProgramSelected = (programId: string | number) => {
      return Array.isArray(form.programIds) && form.programIds.some((id: string | number) => normalizeId(id) === normalizeId(programId));
    };

    const toggleAllPrograms = () => {
      if (allProgramsSelected.value) {
        form.programIds = [];
        form.allPrograms = 0;
        return;
      }

      form.programIds = [...allProgramIds.value];
      form.allPrograms = 1;
    };

    const toggleProgram = (programId: string | number) => {
      const currentIds = Array.isArray(form.programIds) ? [...form.programIds] : [];

      const exists = currentIds.some((id: string | number) => normalizeId(id) === normalizeId(programId));

      if (exists) {
        form.programIds = currentIds.filter((id: string | number) => normalizeId(id) !== normalizeId(programId));
      } else {
        form.programIds = [...currentIds, programId];
      }

      form.allPrograms = allProgramIds.value.length > 0 && form.programIds.length === allProgramIds.value.length ? 1 : 0;
    };

    watch(
      () => props.programsData,
      (newPrograms) => {
        if (!Array.isArray(newPrograms)) return;

        if (Number(form.allPrograms) === 1) {
          form.programIds = newPrograms.map((item) => item.id);
        }
      },
      { immediate: true, deep: true }
    );

    watch(
      () => form.programIds,
      (newProgramIds) => {
        if (!Array.isArray(newProgramIds) || !allProgramIds.value.length) {
          form.allPrograms = 0;
          return;
        }

        form.allPrograms = newProgramIds.length === allProgramIds.value.length ? 1 : 0;
      },
      { deep: true, immediate: true }
    );

    const competenciesSelectorData = computed(() => {
      return Array.isArray(form.competencies)
        ? form.competencies.map((item: any) => ({
            id: item.id,
            name: item.name || item.code || `${t('academicPrograms.subjectDrawer.competency')} ${item.id}`,
          }))
        : [];
    });

    const selectedSubjectCategoryName = computed(() => {
      const item = Array.isArray(props.subjectCategoriesData) ? (props.subjectCategoriesData as any[]).find((category) => Number(category.id) === Number(form.subjectCategoryId)) : null;

      return item?.name || t('academicPrograms.subjectDrawer.undefined');
    });

    const selectedSpaceTypeName = computed(() => {
      const item = Array.isArray(props.spaceTypesData) ? (props.spaceTypesData as any[]).find((space) => Number(space.id) === Number(form.spaceTypeId)) : null;

      return item?.name || t('academicPrograms.subjectDrawer.undefined');
    });

    const getCompetencyNameById = (competencyId: string | number) => {
      const competency = Array.isArray(form.competencies) ? form.competencies.find((item: any) => String(item.id) === String(competencyId)) : null;

      return competency?.name || competency?.code || '';
    };

    const handleClose = () => {
      requestClose();
    };

    const handleUppercaseCode = (event: Event) => {
      const target = event.target as HTMLInputElement;
      form.code = target.value.toUpperCase();
    };

    const buildSubjectPayload = () => {
      const safeProgramIds = Array.isArray(form.programIds) ? form.programIds : [];

      return {
        name: String(form.name || '').trim() || null,
        code:
          String(form.code || '')
            .trim()
            .toUpperCase() || null,
        description: String(form.name || '').trim() || null,
        shortName: String(form.shortName || '').trim() || null,
        maximumHours: String(form.maximumHours || '').trim() !== '' ? Number(form.maximumHours) : null,
        areaId: Number(props.areaId),
        credits: Number(form.credits || 0),
        theoricalHours: Number(form.theoricalHours || 0),
        practicalHours: Number(form.practicalHours || 0),
        subjectCategoryId: form.subjectCategoryId || null,
        spaceTypeId: form.spaceTypeId || null,
        isDegreeRequirement: form.isDegreeRequirement === true ? 1 : 0,
        programIds: form.allPrograms ? props.programsData.map((item) => Number(item.id)) : safeProgramIds.map((id: any) => Number(id)),
        allPrograms: form.allPrograms ? 1 : 0,
      };
    };

    const getSubjectIdFromResponse = (response: any): number | null => {
      if (!response) return null;
      if (typeof response?.id === 'number') return response.id;
      if (typeof response?.data?.id === 'number') return response.data.id;
      if (typeof response?.subject?.id === 'number') return response.subject.id;
      return null;
    };

    const buildCompetenciesPayload = (): CreateOrUpdateCompetenciesPayload => {
      const subjectId = Number(form.id);
      const subjectPayload = buildSubjectPayload();

      return {
        ...subjectPayload,
        competencies: (Array.isArray(form.competencies) ? form.competencies : []).map(({ id, name, code, competencyTypeId }: any) => {
          const competencyId = id && !String(id).startsWith('new-') ? Number(id) : null;
          const learningOutcomes = (Array.isArray(form.learningResults) ? form.learningResults : [])
            .filter((result: any) => String(result.competencyId) === String(id))
            .map((result: any, index: number) => {
              const learningOutcomeId = result.id && !String(result.id).startsWith('new-') ? Number(result.id) : null;

              return {
                id: learningOutcomeId ?? undefined,
                name: String(result.text || '').trim() || null,
                code:
                  String(result.code || `RA-${index + 1}`)
                    .trim()
                    .toUpperCase() || null,
                ...(learningOutcomeId && competencyId ? { competencyId } : {}),
              };
            });

          return {
            id: competencyId ?? undefined,
            name: String(name || '').trim() || null,
            code:
              String(code || '')
                .trim()
                .toUpperCase() || null,
            competencyTypeId: competencyTypeId ? Number(competencyTypeId) : null,
            ...(competencyId ? { subjectId } : {}),
            learningOutcomes,
          };
        }),
      };
    };

    const getSyncedSubjectFromResponse = (response: any) => {
      if (!response) return null;
      if (Array.isArray(response)) return null;
      if (Array.isArray(response?.competencies)) return response;
      if (Array.isArray(response?.data?.competencies)) return response.data;
      if (Array.isArray(response?.subject?.competencies)) return response.subject;
      if (Array.isArray(response?.data?.subject?.competencies)) return response.data.subject;
      return null;
    };

    const applySyncedCompetenciesResponse = (response: any) => {
      const syncedSubject = getSyncedSubjectFromResponse(response);

      if (!syncedSubject) {
        return;
      }

      form.competencies = mapCompetenciesFromData(syncedSubject);
      form.learningResults = mapLearningResultsFromData(syncedSubject);
    };

    const addCompetency = () => {
      localCompetencyKey.value += 1;

      form.competencies.push({
        id: `new-competency-${localCompetencyKey.value}`,
        code: '',
        name: '',
        competencyTypeId: null,
        competencyType: null,
        learningResults: [],
      });
    };

    const updateCompetency = (id: string | number | undefined, field: keyof any, value: any) => {
      form.competencies = (Array.isArray(form.competencies) ? form.competencies : []).map((item: any) => (item.id === id ? { ...item, [field]: value } : item));
    };

    const cloneFormCollection = (items: any[]) => {
      return JSON.parse(JSON.stringify(items || []));
    };

    const isPersistedItem = (id: string | number | undefined) => {
      return !!id && !String(id).startsWith('new-');
    };

    const setDeleteSavingState = (type: DeleteItemType, value: boolean) => {
      if (type === 'competency') {
        savingCompetencies.value = value;
      } else {
        savingLearningOutcomes.value = value;
      }
    };

    const closeDeleteModal = () => {
      deleteModalVisible.value = false;
      pendingDeleteItem.value = null;
    };

    const openConfirmDeleteCompetency = (competency: any) => {
      if (!competency?.id) return;

      pendingDeleteItem.value = {
        id: competency.id,
        type: 'competency',
        entity: t('academicPrograms.subjectDrawer.competency'),
      };
      deleteModalVisible.value = true;
    };

    const openConfirmDeleteLearningResult = (result: any) => {
      if (!result?.id) return;

      pendingDeleteItem.value = {
        id: result.id,
        type: 'learningResult',
        entity: t('academicPrograms.subjectDrawer.learningOutcome'),
      };
      deleteModalVisible.value = true;
    };

    const removeCompetency = async (id: string | number | undefined) => {
      if (!id) return false;

      try {
        form.competencies = (Array.isArray(form.competencies) ? form.competencies : []).filter((item: any) => item.id !== id);

        form.learningResults = (Array.isArray(form.learningResults) ? form.learningResults : []).filter((result: any) => result.competencyId !== id);
        return true;
      } catch (error) {
        console.log('error deleting competency', error);
        return false;
      }
    };

    const addLearningResult = () => {
      if (!competenciesSaved.value || !Array.isArray(form.competencies) || !form.competencies.length) {
        return;
      }

      localLearningOutcomeKey.value += 1;

      form.learningResults.push({
        id: `new-learning-outcome-${localLearningOutcomeKey.value}`,
        code: '',
        text: '',
        competencyId: form.competencies[0]?.id || '',
      });
    };

    const updateLearningResult = (id: string | number | undefined, field: keyof any, value: any) => {
      form.learningResults = (Array.isArray(form.learningResults) ? form.learningResults : []).map((item: any) => (item.id === id ? { ...item, [field]: value } : item));
    };

    const removeLearningResult = async (id: string | number | undefined) => {
      if (!id) return false;

      try {
        form.learningResults = (Array.isArray(form.learningResults) ? form.learningResults : []).filter((item: any) => item.id !== id);
        return true;
      } catch (error) {
        console.log('error deleting learning outcome', error);
        return false;
      }
    };

    const deletePersistedItem = async (item: DeleteItemContext) => {
      if (!isPersistedItem(item.id)) {
        return true;
      }

      try {
        if (item.type === 'competency') {
          const relatedLearningResults = (Array.isArray(form.learningResults) ? form.learningResults : []).filter((result: any) => String(result.competencyId) === String(item.id));
          const persistedLearningResults = relatedLearningResults.filter((result: any) => isPersistedItem(result.id));

          await Promise.all(persistedLearningResults.map((result: any) => deleteLearningOutcomesService.run(Number(result.id))));
          await deleteCompetencieService.run(Number(item.id));
        } else {
          await deleteLearningOutcomesService.run(Number(item.id));
        }

        return true;
      } catch (error) {
        console.log('error deleting persisted item', error);
        return false;
      }
    };

    const syncSubjectTreeAfterDelete = async () => {
      if (!form.id || String(form.id).startsWith('new-')) {
        return true;
      }

      try {
        await saveSubjectTreeSection();
        return true;
      } catch (error) {
        console.log('error syncing subject tree after delete', error);
        return false;
      }
    };

    const confirmDeleteItem = async () => {
      if (!pendingDeleteItem.value?.id) return;
      if (savingCompetencies.value || savingLearningOutcomes.value) return;

      const itemToDelete = pendingDeleteItem.value;
      const previousCompetencies = cloneFormCollection(form.competencies);
      const previousLearningResults = cloneFormCollection(form.learningResults);

      setDeleteSavingState(itemToDelete.type, true);

      const wasDeletedFromBackend = await deletePersistedItem(itemToDelete);

      if (!wasDeletedFromBackend) {
        setDeleteSavingState(itemToDelete.type, false);
        return;
      }

      const wasDeletedFromForm = itemToDelete.type === 'competency' ? await removeCompetency(itemToDelete.id) : await removeLearningResult(itemToDelete.id);

      if (!wasDeletedFromForm) {
        setDeleteSavingState(itemToDelete.type, false);
        return;
      }

      const wasSynced = await syncSubjectTreeAfterDelete();
      setDeleteSavingState(itemToDelete.type, false);

      if (!wasSynced) {
        if (!isPersistedItem(itemToDelete.id)) {
          form.competencies = previousCompetencies;
          form.learningResults = previousLearningResults;
        }
        return;
      }

      closeDeleteModal();
    };

    const saveSubjectSection = async () => {
      if (!canSaveSubject.value || savingSubject.value) return;

      const isValid = await v$.value.$validate();
      if (!isValid) return;

      try {
        savingSubject.value = true;

        const payload = buildSubjectPayload();

        const response = await createOrUpdateSubjectService.run(payload, form.id && !String(form.id).startsWith('new-') ? Number(form.id) : undefined);

        const savedId = form.id && !String(form.id).startsWith('new-') ? Number(form.id) : getSubjectIdFromResponse(response);

        if (!savedId) {
          throw new Error('No fue posible obtener el id de la asignatura');
        }

        form.id = String(savedId);
        initialFormSnapshot.value = JSON.stringify(getComparableForm());
      } catch (error) {
        console.log('error save subject section', error);
      } finally {
        savingSubject.value = false;
      }
    };

    const saveSubjectTreeSection = async (shouldEmitReload = true) => {
      const response = await createOrUpdateSubjectService.run(buildCompetenciesPayload(), Number(form.id));
      const savedId = getSubjectIdFromResponse(response);

      if (savedId) {
        form.id = String(savedId);
      }

      applySyncedCompetenciesResponse(response);
      initialFormSnapshot.value = JSON.stringify(getComparableForm());

      if (shouldEmitReload) {
        emit('reload-data');
      }
    };

    const saveCompetenciesSection = async () => {
      if (!form.id || !canSyncCompetenciesTree.value || savingCompetencies.value) {
        return;
      }

      try {
        savingCompetencies.value = true;

        await saveSubjectTreeSection();
      } catch (error) {
        console.log('error save competencies section', error);
      } finally {
        savingCompetencies.value = false;
      }
    };

    const saveLearningOutcomesSection = async () => {
      if (!form.id || !canSaveLearningOutcomes.value || !canSyncCompetenciesTree.value || savingLearningOutcomes.value) {
        return;
      }

      try {
        savingLearningOutcomes.value = true;

        await saveSubjectTreeSection();
      } catch (error) {
        console.log('error save learning outcomes section', error);
      } finally {
        savingLearningOutcomes.value = false;
      }
    };

    const handleSaveAll = async () => {
      if (props.mode === 'view' || savingAll.value) return;

      try {
        savingAll.value = true;

        await saveSubjectSection();
        if (!form.id) return;

        const hasCompetencies = Array.isArray(form.competencies) && form.competencies.length > 0;
        const hasLearningResults = Array.isArray(form.learningResults) && form.learningResults.length > 0;

        if ((hasCompetencies || hasLearningResults) && !canSyncCompetenciesTree.value) {
          return;
        }

        if (hasCompetencies || hasLearningResults) {
          await saveSubjectTreeSection(false);
        }
        initialFormSnapshot.value = JSON.stringify(getComparableForm());
        emit('reload-data');
        emit('close');
      } catch (error) {
        console.log('error save all flow', error);
      } finally {
        savingAll.value = false;
      }
    };

    return {
      t,
      form,
      v$,
      localVisible,
      isView,
      drawerSize,
      subjectTotalHours,
      handleClose,
      handleSaveAll,
      handleUppercaseCode,
      addCompetency,
      updateCompetency,
      removeCompetency,
      openConfirmDeleteCompetency,
      addLearningResult,
      updateLearningResult,
      removeLearningResult,
      openConfirmDeleteLearningResult,
      selectedProgramsCount,
      toggleAllPrograms,
      allProgramsSelected,
      toggleProgram,
      isProgramSelected,
      competenciesSelectorData,
      selectedSubjectCategoryName,
      selectedSpaceTypeName,
      getCompetencyNameById,
      savingSubject,
      savingCompetencies,
      savingLearningOutcomes,
      savingAll,
      subjectSaved,
      competenciesSaved,
      canSaveSubject,
      canSaveCompetencies,
      canSyncCompetenciesTree,
      canSaveLearningOutcomes,
      saveSubjectSection,
      saveCompetenciesSection,
      saveLearningOutcomesSection,

      confirmExitModalVisible,
      confirmExitWithoutSaving,
      deleteModalVisible,
      pendingDeleteItem,
      confirmDeleteItem,
    };
  },
});
</script>

<style scoped>
.drawerHead {
  width: 100%;
}
.drawerHeadBox {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
}
.drawerHeadBox__icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.drawerHeadBox__icon--create,
.drawerHeadBox__icon--view,
.drawerHeadBox__icon--edit {
  background: rgba(255, 255, 255, 0.18);
}
.drawerHeadBox__title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: white;
}
.drawerHeadBox__subtitle {
  margin: 0.25rem 0 0;
  color: rgba(255, 255, 255, 0.85);
}
.drawerHeadMeta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.35rem;
}
.drawerHeadMeta__text {
  color: white;
  font-weight: 600;
}

.drawerBody {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.25rem;
}
.drawerSection {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.drawerSection__header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}
.drawerSection__badge {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.drawerSection__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #172033;
}
.drawerSection__subtitle {
  margin: 0.2rem 0 0;
  color: #667085;
  font-size: 0.92rem;
}
.formGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.formGroup {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}
.formGroup--full {
  grid-column: 1 / -1;
}
.formGroup label {
  font-size: 0.92rem;
  font-weight: 600;
  color: #344054;
}
.nativeTextarea {
  min-height: 110px;
  width: 100%;
  border: 1px solid #d0d5dd;
  border-radius: 12px;
  padding: 0.9rem;
  resize: vertical;
  outline: none;
  font-family: inherit;
}
.checkboxCard {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid #e4e7ec;
  border-radius: 14px;
  background: #f8fafc;
}
.checkboxCard__title {
  display: block;
  font-weight: 700;
  color: #172033;
}
.checkboxCard__subtitle {
  display: block;
  margin-top: 0.2rem;
  color: #667085;
}
.required {
  color: #dc2626;
}
.dynamicCard {
  padding: 1rem;
  border: 1px solid #e4e7ec;
  border-radius: 14px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.dynamicCard__head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
}
.emptyMini {
  padding: 1rem;
  border: 1px dashed #d0d5dd;
  border-radius: 12px;
  text-align: center;
  color: #667085;
}
.infoGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem 1.5rem;
}
.infoItem--full {
  grid-column: 1 / -1;
}
.infoItem__label {
  margin: 0 0 0.35rem 0;
  font-size: 0.75rem;
  font-weight: 700;
  color: #667085;
  text-transform: uppercase;
}
.infoItem__value {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #172033;
}
.summaryGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
.summaryMiniCard {
  border: 1px solid #e4e7ec;
  border-radius: 16px;
  padding: 1rem;
  background: white;
}
.summaryMiniCard p {
  margin: 0;
  color: #667085;
  font-size: 0.85rem;
}
.summaryMiniCard strong {
  display: block;
  margin-top: 0.4rem;
  font-size: 1.2rem;
  color: #101828;
}
.viewBlock {
  padding: 1rem;
  border: 1px solid #e4e7ec;
  border-radius: 14px;
  background: #fcfcfd;
}
.viewBlock__title {
  margin: 0;
  font-weight: 700;
  color: #172033;
}
.viewBlock__text {
  margin: 0.35rem 0 0;
  color: #475467;
  line-height: 1.5;
}
.drawerFooter {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
.drawerFooter__hint {
  color: #667085;
  font-size: 0.9rem;
}
.drawerFooter__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
.mono {
  font-family: monospace;
  font-weight: 700;
}
.drawerCard {
  gap: 10px;
  display: flex;
  flex-direction: column;
}

.programsBlock {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin-top: 1rem;
}
.programsBlock__header {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.programsBlock__title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #172033;
}
.programsBlock__subtitle {
  margin: 0;
  font-size: 0.88rem;
  color: #667085;
}
.programsGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}
.programCardContent {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.programCardContent--all {
  align-items: center;
}
.programCardContent--disabled {
  opacity: 0.6;
}
.programCardContent__title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #172033;
}
.programCardContent__subtitle {
  margin: 0.2rem 0 0;
  font-size: 0.84rem;
  color: #667085;
}
.programsResume {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  background: #ecfdf3;
  border: 1px solid #abefc6;
  color: #027a48;
  font-weight: 600;
}

.sectionActions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}
.sectionDisabled {
  opacity: 0.75;
}

@media (max-width: 992px) {
  .formGrid,
  .infoGrid,
  .summaryGrid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 768px) {
  .drawerFooter {
    flex-direction: column;
    align-items: stretch;
  }
  .drawerFooter__actions {
    width: 100%;
    flex-direction: column;
  }
}
.totalHoursBox {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.totalHoursBox__label {
  font-size: 0.92rem;
  font-weight: 600;
  color: #344054;
}

.totalHoursBox__value {
  min-height: 44px;
  display: flex;
  align-items: center;
  padding: 0.85rem 1rem;
  border: 1px solid #e4e7ec;
  border-radius: 12px;
  background: #f8fafc;
  color: #172033;
  font-weight: 700;
}

.totalHoursBox__hint {
  color: #667085;
  font-size: 0.8rem;
}
</style>
