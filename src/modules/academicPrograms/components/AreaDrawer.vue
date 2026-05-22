<template>
  <AppDrawer :isVisible="isVisibleDrawer" @update:isVisible="updateVisibility" :size="'lg'">
    <template #head>
      <!-- CREATE / EDIT -->
      <div v-if="mode === 'create' || mode === 'edit'" class="drawerHead" :class="mode === 'create' ? 'drawerHead--create' : 'drawerHead--edit'">
        <div class="drawerHeadForm">
          <div class="drawerHeadForm__icon">
            <AppIcon :icon="mode === 'create' ? 'book' : 'edit'" />
          </div>

          <div class="drawerHeadForm__content">
            <h3 class="drawerHeadForm__title">
              {{ mode === 'create' ? t('academicPrograms.areaDrawer.createTitle') : t('academicPrograms.areaDrawer.editTitle') }}
            </h3>

            <p class="drawerHeadForm__subtitle">
              {{ mode === 'create' ? t('academicPrograms.areaDrawer.createSubtitle') : t('academicPrograms.areaDrawer.editSubtitle') }}
            </p>
          </div>
        </div>
      </div>

      <!-- VIEW -->
      <div v-else class="drawerHead drawerHead--view">
        <div class="drawerHeadView">
          <div class="drawerHeadView__left">
            <div class="drawerHeadView__icon">
              <AppIcon icon="eye" />
            </div>

            <div class="drawerHeadView__content">
              <h3 class="drawerHeadView__title">
                {{ t('academicPrograms.areaDrawer.viewTitle') }}
              </h3>

              <div class="drawerHeadView__meta">
                <h4 class="drawerHeadView__name">{{ form.name }}</h4>

                <AppBadge :label="form.code" variant="primary" class="badgeCode" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #body>
      <!-- CREATE / EDIT -->
      <form v-if="mode === 'create' || mode === 'edit'" class="drawerBody drawerBody--form" @submit.prevent="handleSave">
        <AppFormField :form-control="v$.form.name" :label="t('academicPrograms.areaDrawer.areaName')">
          <AppInput v-model="v$.form.name.$model" type="text" :placeholder="t('academicPrograms.areaDrawer.areaNamePlaceholder')" />
        </AppFormField>

        <p class="fieldHint">
          {{ t('academicPrograms.areaDrawer.areaNameHint') }}
        </p>

        <AppFormField :form-control="v$.form.code" :label="t('academicPrograms.areaDrawer.areaCode')">
          <AppInput v-model="v$.form.code.$model" type="text" :placeholder="t('academicPrograms.areaDrawer.areaCodePlaceholder')" maxlength="10" />
        </AppFormField>

        <p class="fieldHint">
          {{ t('academicPrograms.areaDrawer.areaCodeHint') }}
        </p>

        <AppFormField :form-control="v$.form.description" :label="t('academicPrograms.areaDrawer.description')">
          <textarea v-model="v$.form.description.$model" class="nativeTextarea" maxlength="500" :placeholder="t('academicPrograms.areaDrawer.descriptionPlaceholder')" />
        </AppFormField>

        <p class="fieldHint fieldHint--right">
          {{ form.description?.length || 0 }} / 500
          {{ t('academicPrograms.areaDrawer.characters') }}
        </p>

        <div class="infoBox">
          <div class="infoBox__icon">
            <AppIcon icon="info-circle" />
          </div>

          <div class="infoBox__content">
            <h4>{{ t('academicPrograms.areaDrawer.informationTitle') }}</h4>
            <ul>
              <li>
                {{ t('academicPrograms.areaDrawer.informationItemOne') }}
              </li>
              <li>
                {{ t('academicPrograms.areaDrawer.informationItemTwo') }}
              </li>
              <li>
                {{ t('academicPrograms.areaDrawer.informationItemThree') }}
              </li>
            </ul>
          </div>
        </div>
      </form>

      <!-- VIEW -->
      <div v-else class="drawerBody drawerBody--view">
        <section class="drawerSection">
          <div class="drawerSection__header">
            <div class="drawerSection__badge">1</div>
            <div>
              <h4 class="drawerSection__title">
                {{ t('academicPrograms.areaDrawer.generalInformation') }}
              </h4>
              <p class="drawerSection__subtitle">
                {{ t('academicPrograms.areaDrawer.generalInformationSubtitle') }}
              </p>
            </div>
          </div>

          <div class="drawerCard">
            <div class="infoGrid">
              <div class="infoItem">
                <p class="infoItem__label">
                  {{ t('academicPrograms.areaDrawer.code') }}
                </p>
                <p class="infoItem__value mono">{{ form.code }}</p>
              </div>

              <div class="infoItem">
                <p class="infoItem__label">
                  {{ t('academicPrograms.areaDrawer.areaName') }}
                </p>
                <p class="infoItem__value">{{ form.name }}</p>
              </div>

              <div class="infoItem">
                <p class="infoItem__label">
                  {{ t('academicPrograms.areaDrawer.createdAt') }}
                </p>

                <p class="infoItem__value">
                  {{ form.createdAt || t('academicPrograms.areaDrawer.emptyValue') }}
                </p>
              </div>

              <div class="infoItem">
                <p class="infoItem__label">
                  {{ t('academicPrograms.areaDrawer.updatedAt') }}
                </p>
                <p class="infoItem__value">
                  {{ form.updatedAt || t('academicPrograms.areaDrawer.emptyValue') }}
                </p>
              </div>
            </div>

            <div v-if="form.description" class="descriptionBlock">
              <p class="infoItem__label">
                {{ t('academicPrograms.areaDrawer.description') }}
              </p>
              <p class="descriptionText">{{ form.description }}</p>
            </div>
          </div>
        </section>

        <section v-if="totalSubjects > 0" class="drawerSection">
          <div class="drawerSection__header">
            <div class="drawerSection__badge">2</div>
            <div>
              <h4 class="drawerSection__title">
                {{ t('academicPrograms.areaDrawer.academicSummary') }}
              </h4>
              <p class="drawerSection__subtitle">
                {{ t('academicPrograms.areaDrawer.academicSummarySubtitle') }}
              </p>
            </div>
          </div>

          <div class="summaryGrid">
            <AppCardDashboard v-for="card in summaryCards" :key="card.key" class="summaryDashboardCard">
              <template #body>
                <div class="summaryDashboardCard__content">
                  <div class="summaryDashboardCard__icon" :class="`summaryDashboardCard__icon--${card.color}`">
                    <AppIcon :icon="card.icon" />
                  </div>

                  <div class="summaryDashboardCard__text">
                    <p class="summaryDashboardCard__label">
                      {{ card.label }}
                    </p>

                    <h5 class="summaryDashboardCard__value">
                      {{ card.value }}
                    </h5>
                  </div>
                </div>
              </template>
            </AppCardDashboard>
          </div>
        </section>
      </div>
    </template>

    <template #footer>
      <!-- CREATE / EDIT -->
      <div v-if="mode === 'create' || mode === 'edit'" class="drawerFooter drawerFooter--simple">
        <div class="drawerFooter__actions drawerFooter__actions--end">
          <AppButton variant="ghost" @click="handleClose">
            {{ t('academicPrograms.areaDrawer.cancel') }}
          </AppButton>

          <AppButton variant="primary" @click="handleSave">
            {{ mode === 'create' ? t('academicPrograms.areaDrawer.createArea') : t('academicPrograms.areaDrawer.saveChanges') }}
          </AppButton>
        </div>
      </div>

      <!-- VIEW -->
      <div v-else class="drawerFooter drawerFooter--simple">
        <div class="drawerFooter__actions drawerFooter__actions--end">
          <AppButton variant="primary" @click="handleClose">
            {{ t('academicPrograms.areaDrawer.close') }}
          </AppButton>
        </div>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';

import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppInput from '../../../shared/components/Forms/AppInput.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppCardDashboard from '../../../shared/components/Card/AppCardDashboard.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import { CreateOrUpdateAreaService } from '../services/createOrUpdateArea.service';

const createOrUpdateAreaService = new CreateOrUpdateAreaService();

interface SubjectItem {
  id: string;
  code: string;
  name: string;
  shortName: string;
  credits: number;
  theoricalHours?: number;
  practicalHours?: number;
  totalHours: number;
  type: string;
  spaceType?: string;
  isGraduationRequirement: boolean;
}

interface AreaForm {
  id: string;
  name: string;
  code: string;
  description: string;
  subjects: SubjectItem[];
  createdAt?: string;
  updatedAt?: string;
}

type DrawerMode = 'create' | 'edit' | 'view';

export default defineComponent({
  name: 'AreaDrawer',
  components: {
    AppDrawer,
    AppInput,
    AppButton,
    AppIcon,
    AppBadge,
    AppCardDashboard,
    AppFormField,
  },
  props: {
    isVisibleDrawer: {
      type: Boolean,
      required: false,
    },
    mode: {
      type: String as () => DrawerMode,
      required: true,
    },
    formData: {
      type: Object,
      required: false,
    },
  },
  emits: ['update:isVisible', 'reload-data', 'close'],

  setup(props, { emit }) {
    const data = props.formData ?? null;
    const { t } = useI18n();
    const form: any = reactive({
      id: data?.id,
      name: data?.name,
      code: data?.code,
      description: data?.description,
      createdAt: data?.createdAt ? dayjs(data.createdAt).format('DD/MM/YYYY HH:mm') : '',
      updatedAt: data?.updatedAt ? dayjs(data.updatedAt).format('DD/MM/YYYY HH:mm') : '',
      subjects: data?.subjects,
    });

    const v$ = useVuelidate(
      {
        form: {
          name: { required },
          code: { required },
          description: {},
          subjects: {},
          createdAt: {},
          updatedAt: {},
        },
      },
      { form }
    );
    const updateVisibility = (value: boolean) => {
      emit('update:isVisible', value); // Emitimos el evento para v-model
    };
    const totalSubjects = computed(() => form.subjects?.length || 0);

    const totalCredits = computed(() => {
      return (form.subjects || []).reduce((sum: number, item: SubjectItem) => {
        return sum + Number(item.credits || 0);
      }, 0);
    });

    const totalHoursTheoretical = computed(() => {
      return (form.subjects || []).reduce((sum: number, item: SubjectItem) => {
        return sum + Number(item.theoricalHours || 0);
      }, 0);
    });

    const totalHoursPractical = computed(() => {
      return (form.subjects || []).reduce((sum: number, item: SubjectItem) => {
        return sum + Number(item.practicalHours || 0);
      }, 0);
    });

    const summaryCards = computed(() => [
      {
        key: 'subjects',
        label: t('academicPrograms.areaDrawer.subjects'),
        value: totalSubjects.value,
        icon: 'book-open',
        color: 'blue',
      },
      {
        key: 'credits',
        label: t('academicPrograms.areaDrawer.credits'),
        value: totalCredits.value,
        icon: 'graduation-cap',
        color: 'green',
      },
      {
        key: 'theoretical',
        label: t('academicPrograms.areaDrawer.shortTheoreticalHours'),
        value: `${totalHoursTheoretical.value}h`,
        icon: 'clock',
        color: 'purple',
      },
      {
        key: 'practical',
        label: t('academicPrograms.areaDrawer.shortPracticalHours'),
        value: `${totalHoursPractical.value}h`,
        icon: 'clock',
        color: 'orange',
      },
    ]);

    const handleClose = () => {
      emit('close');
      updateVisibility(false);
    };

    const handleSave = async () => {
      if (props.mode === 'view') return;

      const isValid = await v$.value.$validate();
      if (!isValid) return;
      try {
        const dataSend = {
          ...form,
        };
        await createOrUpdateAreaService.run(dataSend, data?.id);
      } catch (error) {
        console.log('error save area', error);
      }
      updateVisibility(false);
      emit('reload-data');
    };

    return {
      form,
      v$,
      updateVisibility,
      totalSubjects,
      totalCredits,
      totalHoursTheoretical,
      totalHoursPractical,
      summaryCards,
      t,
      handleClose,
      handleSave,
    };
  },
});
</script>

<style scoped>
.drawerHead {
  width: 100%;
}

.drawerBody {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.25rem;
}

.drawerBody--form {
  gap: 1.5rem;
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

.drawerHeadForm,
.drawerHeadView {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.drawerHeadForm__icon,
.drawerHeadView__icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drawerHead--create .drawerHeadForm__icon {
  background: #dbeafe;
  color: #2563eb;
}

.drawerHead--edit .drawerHeadForm__icon {
  background: #fef3c7;
  color: #b45309;
}

.drawerHeadView__icon {
  background: #2563eb;
  color: white;
}

.drawerHeadForm__title,
.drawerHeadView__title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: white;
}

.drawerHeadForm__subtitle {
  margin: 0.25rem 0 0;
  color: rgba(255, 255, 255, 0.85);
}

.drawerHeadView__content {
  flex: 1;
  min-width: 0;
}

.drawerHeadView__meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.drawerHeadView__name {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: white;
}

.drawerCard {
  background: #fff;
  border: 1px solid #e4e7ec;
  border-radius: 18px;
  padding: 1rem;
  box-shadow: var(--default-shadow-2);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.drawerCard--table {
  padding: 0;
  overflow: hidden;
}

.fieldHint {
  margin: -0.75rem 0 0 0;
  font-size: 0.78rem;
  color: #667085;
}

.fieldHint--right {
  text-align: right;
}

.nativeTextarea {
  min-height: 120px;
  width: 100%;
  border: 1px solid #d0d5dd;
  border-radius: 12px;
  padding: 0.9rem;
  resize: none;
  outline: none;
  font-family: inherit;
}

.nativeTextarea:focus {
  border-color: var(--color-primary);
}

.infoBox {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 14px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
}

.infoBox__icon {
  color: #1d4ed8;
  flex-shrink: 0;
}

.infoBox__content h4 {
  margin: 0 0 0.45rem 0;
  color: #1e3a8a;
  font-size: 0.92rem;
  font-weight: 700;
}

.infoBox__content ul {
  margin: 0;
  padding-left: 1rem;
  color: #1d4ed8;
  font-size: 0.82rem;
}

.infoBox__content li + li {
  margin-top: 0.25rem;
}

.infoGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem 1.5rem;
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

.descriptionBlock {
  padding-top: 0.5rem;
  border-top: 1px solid #eaecf0;
}

.descriptionText {
  margin: 0.35rem 0 0;
  color: #475467;
  line-height: 1.55;
}

.summaryGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.summaryDashboardCard {
  height: 100%;
}

.summaryDashboardCard__content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.summaryDashboardCard__icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.summaryDashboardCard__icon--blue {
  background: #eff6ff;
  color: #2563eb;
}

.summaryDashboardCard__icon--green {
  background: #ecfdf3;
  color: #16a34a;
}

.summaryDashboardCard__icon--purple {
  background: #f5f3ff;
  color: #7c3aed;
}

.summaryDashboardCard__icon--orange {
  background: #fff7ed;
  color: #ea580c;
}

.summaryDashboardCard__text {
  min-width: 0;
}

.summaryDashboardCard__label {
  margin: 0;
  font-size: 0.78rem;
  color: #667085;
}

.summaryDashboardCard__value {
  margin: 0.2rem 0 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #101828;
  line-height: 1.2;
}

.emptySubjects {
  border: 2px dashed #d0d5dd;
  border-radius: 18px;
  background: #fcfcfd;
  padding: 2.5rem 1rem;
  text-align: center;
}

.emptySubjects__icon {
  width: 60px;
  height: 60px;
  border-radius: 999px;
  background: #f2f4f7;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.85rem auto;
  color: #667085;
}

.emptySubjects__title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #172033;
}

.emptySubjects__subtitle {
  margin: 0.35rem 0 0;
  font-size: 0.85rem;
  color: #667085;
}

.tableWrap {
  overflow-x: auto;
}

.subjectsTable {
  width: 100%;
  border-collapse: collapse;
}

.subjectsTable thead tr {
  background: #f9fafb;
}

.subjectsTable th,
.subjectsTable td {
  padding: 0.95rem 1rem;
  text-align: left;
  border-bottom: 1px solid #eaecf0;
  font-size: 0.92rem;
}

.tCenter {
  text-align: center !important;
}

.mono {
  font-family: monospace;
  font-weight: 700;
}

.mutedDash {
  color: #98a2b3;
}

.badgeCode {
  display: inline-flex;
}

.drawerFooter {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
}

.drawerFooter--simple {
  justify-content: flex-end;
}

.drawerFooter__actions {
  display: flex;
  gap: 0.75rem;
}

.drawerFooter__actions--end {
  justify-content: flex-end;
  width: 100%;
}

@media (max-width: 1100px) {
  .summaryGrid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .infoGrid,
  .summaryGrid {
    grid-template-columns: 1fr;
  }

  .drawerFooter__actions {
    width: 100%;
    flex-direction: column;
  }
}
</style>
