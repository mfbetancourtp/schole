<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="$emit('update:isVisible', $event)" size="lg">
    <!-- HEAD -->
    <template #head>
      <div class="ssd-head">
        <div class="ssd-head__icon">
          <AppIcon icon="graduation-cap" />
        </div>
        <div>
          <h6 class="ssd-head__title">
            {{ mode === 'edit' ? 'Editar Beca' : 'Nueva Beca' }}
          </h6>
          <p class="ssd-head__sub">
            {{ mode === 'edit' ? 'Actualiza la configuración de la beca' : 'Completa la información de la nueva convocatoria' }}
          </p>
        </div>
      </div>
    </template>

    <!-- BODY -->
    <template #body>
      <form id="scholarship-setting-form" class="ssd-form" @submit.prevent="handleSave">
        <!-- ── Información General ── -->
        <div class="ssd-section">
          <p class="ssd-section__title">Información General</p>

          <div class="ssd-row">
            <AppFormField :form-control="v$.form.name" label="Nombre *">
              <input type="text" class="form-control" v-model="v$.form.name.$model" placeholder="Ej. Beca de Excelencia 2024" />
            </AppFormField>

            <AppFormField :form-control="v$.form.code" label="Código *">
              <input type="text" class="form-control" v-model="v$.form.code.$model" placeholder="Ej. BE-2024" />
            </AppFormField>
          </div>

          <div class="ssd-row">
            <AppFormField :form-control="v$.form.typeScholarshipId" label="Tipo de beca *">
              <select class="form-select" v-model="v$.form.typeScholarshipId.$model">
                <option value="">Seleccione</option>
                <option v-for="t in typeScholarships" :key="t.id" :value="t.id">
                  {{ t.name }}
                </option>
              </select>
            </AppFormField>

            <AppFormField :form-control="v$.form.academicPeriodId" label="Periodo académico *">
              <select class="form-select" v-model="v$.form.academicPeriodId.$model">
                <option value="">Seleccione</option>
                <option v-for="p in academicPeriods" :key="p.id" :value="p.id">
                  {{ p.name }}
                </option>
              </select>
            </AppFormField>
          </div>

          <AppFormField :form-control="v$.form.statusScholarship" label="Estado *">
            <select class="form-select" v-model="v$.form.statusScholarship.$model" :disabled="form.statusScholarship === 'Cerrado'">
              <option value="">Seleccione</option>
              <option v-for="s in STATUS_OPTIONS" :key="s" :value="s">
                {{ s }}
              </option>
              <option v-if="form.statusScholarship === 'Cerrado'" value="Cerrado">Cerrado (automático)</option>
            </select>
          </AppFormField>
        </div>

        <!-- ── Alcance ── -->
        <div class="ssd-section">
          <p class="ssd-section__title">Alcance de la Beca</p>

          <div class="ssd-row">
            <AppFormField :form-control="v$.form.academicLevelId" label="Nivel de educación *">
              <AppAutocompleteRich v-model="selectedAcademicLevel" :service="educationLevelsService" :loadOnOpen="true" placeholder="Seleccione">
                <template #option="opt">
                  <span class="ssd-option-label">{{ opt.name }}</span>
                </template>
              </AppAutocompleteRich>
            </AppFormField>

            <div class="ssd-field">
              <label class="ssd-label">Categoría de estudiante</label>
              <select class="form-select" v-model="form.studentTypeId">
                <option :value="null">Todos</option>
                <option v-for="st in studentCategories" :key="st.id" :value="st.id">
                  {{ st.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="ssd-field">
            <label class="ssd-label">Facultad</label>
            <AppAutocompleteRich v-model="selectedFaculties" :service="facultyService" :loadOnOpen="true" :multiple="true" :placeholder="'Todas las facultades'">
              <template #option="opt">
                <span class="ssd-option-label">{{ opt.name }}</span>
              </template>
            </AppAutocompleteRich>
          </div>

          <div class="ssd-field" :class="{ 'ssd-field--loading': isLoadingPrograms }">
            <label class="ssd-label">Programa académico</label>
            <AppAutocompleteRich
              v-model="selectedPrograms"
              :options="programOptions"
              :multiple="true"
              :placeholder="isLoadingPrograms ? 'Cargando programas...' : form.facultyIds.length ? 'Buscar programa...' : 'Todos los programas'"
            >
              <template #option="opt">
                <span class="ssd-option-label">{{ opt.name }}</span>
              </template>
            </AppAutocompleteRich>
          </div>
        </div>

        <!-- ── Beneficio ── -->
        <div class="ssd-section">
          <p class="ssd-section__title">Beneficio</p>

          <div class="ssd-checks-row">
            <label class="ssd-check">
              <input type="checkbox" v-model="form.enrollmentPercentage" class="ssd-check__input" />
              <span>Porcentaje de matrícula</span>
            </label>
            <label class="ssd-check">
              <input type="checkbox" v-model="form.fixedValue" class="ssd-check__input" />
              <span>Valor fijo</span>
            </label>
          </div>

          <div class="ssd-row">
            <div class="ssd-field" v-if="form.enrollmentPercentage">
              <label class="ssd-label">Porcentaje <span class="ssd-req">*</span></label>
              <div class="ssd-input-suffix">
                <input type="number" class="form-control" v-model.number="form.percentage" min="0" max="100" placeholder="0" />
                <span class="ssd-suffix">%</span>
              </div>
            </div>

            <div class="ssd-field" v-if="form.fixedValue">
              <label class="ssd-label">Monto máximo</label>
              <div class="ssd-input-suffix">
                <span class="ssd-prefix">$</span>
                <input type="number" class="form-control" v-model.number="form.MaximumAmount" min="0" placeholder="0" />
              </div>
            </div>
          </div>

          <div class="ssd-row">
            <AppFormField :form-control="v$.form.capacity" label="Cupos *">
              <input type="number" class="form-control" v-model.number="v$.form.capacity.$model" min="1" placeholder="Ej. 50" />
            </AppFormField>

            <div class="ssd-field">
              <label class="ssd-label">Presupuesto total</label>
              <div class="ssd-input-suffix">
                <span class="ssd-prefix">$</span>
                <input type="number" class="form-control" v-model.number="form.totalBudget" min="0" placeholder="0" />
              </div>
            </div>
          </div>

          <div class="ssd-field">
            <label class="ssd-label">Duración del beneficio <span class="ssd-hint">(semestres)</span></label>
            <input type="number" class="form-control ssd-short-input" v-model.number="form.benefitDuration" min="1" placeholder="Ej. 4" />
          </div>
        </div>

        <!-- ── Fechas ── -->
        <div class="ssd-section">
          <p class="ssd-section__title">Fechas</p>

          <div class="ssd-row">
            <AppFormField :form-control="v$.form.startDate" label="Fecha inicio *">
              <input type="date" class="form-control" v-model="v$.form.startDate.$model" />
            </AppFormField>

            <AppFormField :form-control="v$.form.endDate" label="Fecha fin *">
              <input type="date" class="form-control" v-model="v$.form.endDate.$model" />
            </AppFormField>
          </div>

          <AppFormField :form-control="v$.form.publicationDate" label="Fecha publicación *">
            <input type="date" class="form-control" v-model="v$.form.publicationDate.$model" />
          </AppFormField>
        </div>

        <!-- ── Foto ── -->
        <div class="ssd-section">
          <p class="ssd-section__title">Imagen de la Beca</p>

          <div v-if="form.photoUrl" class="ssd-photo-preview">
            <img :src="form.photoUrl" alt="Foto beca" class="ssd-photo-img" />
            <button type="button" class="ssd-photo-remove" @click="form.photoUrl = null">
              <AppIcon icon="times" />
            </button>
          </div>

          <div class="ssd-photo-upload">
            <label class="ssd-photo-label">
              <AppIcon icon="image" class="ssd-photo-icon" />
              <span v-if="!isUploadingPhoto">{{ form.photoUrl ? 'Cambiar imagen' : 'Seleccionar imagen' }}</span>
              <span v-else>Subiendo...</span>
              <input type="file" accept="image/*" class="ssd-file-input" :disabled="isUploadingPhoto" @change="onPhotoChange" />
            </label>
            <p class="ssd-photo-hint">PNG, JPG o WEBP. Se subirá automáticamente al seleccionar.</p>
          </div>
        </div>
      </form>
    </template>

    <!-- FOOTER -->
    <template #footer>
      <div class="ssd-footer">
        <AppButton outlined variant="secondary" nativeType="button" @click="$emit('update:isVisible', false)"> Cancelar </AppButton>
        <AppButton variant="primary" :outlined="false" nativeType="submit" form="scholarship-setting-form" :disabled="isLoading">
          {{ mode === 'edit' ? 'Guardar Cambios' : 'Crear Beca' }}
        </AppButton>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, ref, watch, computed, nextTick } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minValue } from '../../../shared/plugins/vuelidate.plugin';

import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocompleteRich from '../../../shared/components/Forms/AppAutocompleteRich.vue';

import type { ScholarshipSettingDto, ScholarshipSettingFacultyDto, ScholarshipSettingProgramDto, CreateOrUpdateScholarshipSettingDto, StatusScholarship } from '../dtos/scholarshipConfig.dto';
import { GetTypeScholarshipsService } from '../services/getTypeScholarships.service';
import { UploadScholarshipSettingPhotoService } from '../services/uploadScholarshipSettingPhoto.service';
import { GetAcademicPeriodsPaginatedService } from '../../academicPlanning/services/getAcademicPeriodsPaginated.service';
import { GetAuxiliaryInformationService } from '../../institutionalConfiguration/services/getAuxiliaryInformation.service';
import { GetEducationTypesService } from '../../institutionalConfiguration/services/getEducationTypes.service';
import { GetProgramsService } from '../../institutionalConfiguration/services/getPrograms.service';
import { GetFacultiesService } from '../../certificates/services/getFaculties.service';
import { ToastService } from '../../../shared/services/toast.service';

const STATUS_OPTIONS: StatusScholarship[] = ['Borrador', 'Activa'];

const getTypeScholarshipsService = new GetTypeScholarshipsService();
const getAcademicPeriodsService = new GetAcademicPeriodsPaginatedService();
const getAuxiliaryInformationService = new GetAuxiliaryInformationService();
const uploadPhotoService = new UploadScholarshipSettingPhotoService();
const toast = new ToastService();

const facultyService = new GetFacultiesService();
const programsService = new GetProgramsService();
const educationLevelsService = new GetEducationTypesService();

const extractList = (res: any): any[] => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.items)) return res.items;
  return [];
};

export default defineComponent({
  name: 'ScholarshipSettingDrawer',
  components: {
    AppDrawer,
    AppIcon,
    AppButton,
    AppFormField,
    AppAutocompleteRich,
  },
  emits: ['update:isVisible', 'save'],

  props: {
    isVisible: { type: Boolean, required: true },
    mode: { type: String as PropType<'create' | 'edit'>, default: 'create' },
    formData: {
      type: Object as PropType<ScholarshipSettingDto | null>,
      default: null,
    },
  },

  setup(props, { emit }) {
    const isLoading = ref(false);
    const isUploadingPhoto = ref(false);

    const typeScholarships = ref<any[]>([]);
    const academicPeriods = ref<any[]>([]);
    const studentCategories = ref<any[]>([]);

    const selectedAcademicLevel = ref<any>(null);
    const selectedFaculties = ref<any[]>([]);
    const selectedPrograms = ref<any[]>([]);
    const programOptions = ref<any[]>([]);
    const isLoadingPrograms = ref(false);
    const isResettingForm = ref(false);
    let _programLoadToken = 0;

    const loadProgramsForFaculties = async (facultyIds: number[], autoFilterOrphans = false) => {
      const token = ++_programLoadToken;
      isLoadingPrograms.value = true;
      try {
        let options: any[];
        if (!facultyIds.length) {
          const res = await programsService.run({ page: 1, perPage: 200 });
          options = extractList(res);
        } else {
          const results = await Promise.all(facultyIds.map((id) => programsService.run({ facultyId: id, page: 1, perPage: 200 })));
          const merged = new Map<number, any>();
          results.forEach((res) => {
            extractList(res).forEach((p: any) => merged.set(p.id, p));
          });
          options = Array.from(merged.values());
        }
        if (token !== _programLoadToken) return;
        programOptions.value = options;
        if (autoFilterOrphans && selectedPrograms.value.length) {
          const validIds = new Set(options.map((p: any) => p.id));
          const kept = selectedPrograms.value.filter((p: any) => validIds.has(p.id));
          if (kept.length !== selectedPrograms.value.length) {
            selectedPrograms.value = kept;
          }
        }
      } catch {
        if (token === _programLoadToken) programOptions.value = [];
      } finally {
        if (token === _programLoadToken) isLoadingPrograms.value = false;
      }
    };

    const toDateInput = (val?: string | null) => (val ? val.substring(0, 10) : '');

    const buildForm = (data: ScholarshipSettingDto | null) => ({
      id: data?.id ?? (undefined as number | undefined),
      name: data?.name ?? '',
      code: data?.code ?? '',
      typeScholarshipId: (data?.typeScholarshipId ?? (data as any)?.typeScholarship?.id ?? '') as any,
      academicPeriodId: (data?.academicPeriodId ?? (data as any)?.academicPeriod?.id ?? '') as any,
      statusScholarship: data?.statusScholarship ?? ('' as any),
      academicLevelId: (data?.academicLevelId ?? (data as any)?.academicLevel?.id ?? '') as any,
      facultyIds: (data?.faculties ?? []).map((f: ScholarshipSettingFacultyDto) => f.faculty.id),
      programIds: (data?.programs ?? []).map((p: ScholarshipSettingProgramDto) => p.program.id),
      studentTypeId: (data?.studentTypeId ?? (data as any)?.studentType?.id ?? null) as number | null,
      enrollmentPercentage: Boolean(data?.enrollmentPercentage ?? true),
      fixedValue: Boolean(data?.fixedValue ?? false),
      percentage: data?.percentage ?? 0,
      MaximumAmount: data?.MaximumAmount ?? 0,
      benefitDuration: data?.benefitDuration ?? 1,
      capacity: data?.capacity ?? ('' as any),
      totalBudget: data?.totalBudget ?? 0,
      startDate: toDateInput(data?.startDate),
      endDate: toDateInput(data?.endDate),
      publicationDate: toDateInput(data?.publicationDate),
      photoUrl: data?.photoUrl ?? (null as string | null),
    });

    const form = reactive(buildForm(null));

    const rules = {
      form: {
        name: { required },
        code: { required },
        typeScholarshipId: { required },
        academicPeriodId: { required },
        statusScholarship: { required },
        academicLevelId: { required },
        capacity: { required, minValue: minValue(1) },
        startDate: { required },
        endDate: { required },
        publicationDate: { required },
      },
    };

    const v$ = useVuelidate(rules, { form }, { $scope: false });

    watch(
      selectedAcademicLevel,
      (level) => {
        if (isResettingForm.value) return;
        form.academicLevelId = level?.id ?? ('' as any);
      },
      { flush: 'sync' }
    );

    watch(
      selectedFaculties,
      async (faculties) => {
        if (isResettingForm.value) return;
        form.facultyIds = faculties.map((f: any) => f.id);
        await loadProgramsForFaculties(form.facultyIds, true);
      },
      { flush: 'sync' }
    );

    watch(
      selectedPrograms,
      (programs) => {
        if (isResettingForm.value) return;
        form.programIds = programs.map((p: any) => p.id);
      },
      { flush: 'sync' }
    );

    const loadSelects = async () => {
      try {
        const [typesRes, periodsRes, auxiliaryRes] = await Promise.all([
          getTypeScholarshipsService.run({ noPag: 'true' }),
          getAcademicPeriodsService.run({ noPag: 'true' }),
          getAuxiliaryInformationService.run(),
        ]);

        typeScholarships.value = extractList(typesRes)
          .filter((t: any) => t.isActive)
          .map((t: any) => ({ id: t.id, name: t.name }));
        academicPeriods.value = extractList(periodsRes).map((p: any) => ({
          id: p.id,
          name: p.name,
        }));
        studentCategories.value = ((auxiliaryRes as any)?.studentCategories ?? []).map((s: any) => ({ id: s.id, name: s.name }));
      } catch (e) {
        console.error('Error cargando selects del drawer:', e);
      }
    };

    const resetForm = async (data: ScholarshipSettingDto | null) => {
      isResettingForm.value = true;
      Object.assign(form, buildForm(data));
      selectedAcademicLevel.value = data?.academicLevel ?? null;
      selectedFaculties.value = (data?.faculties ?? []).map((f: ScholarshipSettingFacultyDto) => f.faculty);
      selectedPrograms.value = (data?.programs ?? []).map((p: ScholarshipSettingProgramDto) => p.program);
      v$.value.$reset();
      await loadProgramsForFaculties(form.facultyIds);
      await nextTick();
      isResettingForm.value = false;
    };

    watch(
      () => props.formData,
      async (newData) => {
        await resetForm(newData);
      },
      { immediate: true }
    );

    watch(
      () => props.isVisible,
      (visible) => {
        if (visible) loadSelects();
      },
      { immediate: true }
    );

    const onPhotoChange = async (event: Event) => {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;

      isUploadingPhoto.value = true;
      try {
        const res = await uploadPhotoService.run(file, form.id);
        form.photoUrl = res.photoUrl ?? res.url ?? null;
      } catch (e) {
        toast.show('Error al subir la imagen', 'danger');
      } finally {
        isUploadingPhoto.value = false;
        input.value = '';
      }
    };

    const handleSave = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;

      isLoading.value = true;
      try {
        const payload: CreateOrUpdateScholarshipSettingDto & { id?: number } = {
          id: form.id,
          name: form.name.trim(),
          code: form.code.trim(),
          typeScholarshipId: Number(form.typeScholarshipId),
          academicPeriodId: Number(form.academicPeriodId),
          statusScholarship: form.statusScholarship as StatusScholarship,
          academicLevelId: Number(form.academicLevelId),
          facultyIds: form.facultyIds,
          programIds: form.programIds,
          studentTypeId: form.studentTypeId ?? null,
          enrollmentPercentage: form.enrollmentPercentage,
          fixedValue: form.fixedValue,
          percentage: form.percentage,
          MaximumAmount: form.MaximumAmount,
          benefitDuration: form.benefitDuration,
          capacity: Number(form.capacity),
          totalBudget: form.totalBudget,
          startDate: form.startDate,
          endDate: form.endDate,
          publicationDate: form.publicationDate,
          photoUrl: form.photoUrl,
        };
        emit('save', payload);
      } finally {
        isLoading.value = false;
      }
    };

    return {
      form,
      v$,
      isLoading,
      isUploadingPhoto,
      typeScholarships,
      academicPeriods,
      studentCategories,
      selectedAcademicLevel,
      selectedFaculties,
      selectedPrograms,
      programOptions,
      isLoadingPrograms,
      educationLevelsService,
      facultyService,
      STATUS_OPTIONS,
      onPhotoChange,
      handleSave,
    };
  },
});
</script>

<style scoped>
/* Head */
.ssd-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.ssd-head__icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1rem;
  flex-shrink: 0;
}

.ssd-head__title {
  margin: 0;
  color: #fff;
  font-weight: 700;
  font-size: 0.95rem;
}

.ssd-head__sub {
  margin: 0.15rem 0 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

/* Form body */
.ssd-form {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Section */
.ssd-section {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1rem 1.125rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ssd-section__title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

/* Row layout (2 cols) */
.ssd-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

/* Generic field */
.ssd-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
}

.ssd-field--loading {
  opacity: 0.55;
  pointer-events: none;
}

.ssd-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #374151;
}

.ssd-req {
  color: #dc2626;
}

.ssd-hint {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 400;
}

/* Checkboxes */
.ssd-checks-row {
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.ssd-check {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
}

.ssd-check__input {
  width: 15px;
  height: 15px;
  accent-color: #3b82f6;
  cursor: pointer;
  flex-shrink: 0;
}

/* Input with prefix/suffix */
.ssd-input-suffix {
  display: flex;
  align-items: stretch;
}

.ssd-prefix,
.ssd-suffix {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 6px 10px;
  font-size: 0.8125rem;
  color: #64748b;
  white-space: nowrap;
  display: flex;
  align-items: center;
}

.ssd-prefix {
  border-right: none;
  border-radius: 6px 0 0 6px;
}

.ssd-suffix {
  border-left: none;
  border-radius: 0 6px 6px 0;
}

.ssd-input-suffix .form-control {
  border-radius: 0;
}

.ssd-input-suffix .ssd-prefix + .form-control {
  border-radius: 0 6px 6px 0;
}

.ssd-short-input {
  max-width: 120px;
}

/* Photo */
.ssd-photo-preview {
  position: relative;
  display: inline-block;
}

.ssd-photo-img {
  width: 120px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.ssd-photo-remove {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  background: #ef4444;
  color: #fff;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  cursor: pointer;
}

.ssd-photo-upload {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.ssd-photo-label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 7px 14px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  font-size: 0.8125rem;
  color: #374151;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.ssd-photo-label:hover {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #2563eb;
}

.ssd-photo-icon {
  font-size: 0.875rem;
  color: #94a3b8;
}

.ssd-file-input {
  display: none;
}

.ssd-photo-hint {
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 0;
}

/* Footer */
.ssd-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  width: 100%;
}

/* Dropdown option label — allows long names to wrap */
.ssd-option-label {
  display: block;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: break-word;
  line-height: 1.4;
}
</style>
