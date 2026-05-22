<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title" @closed="emit('close')">
      <template #content>
        <div class="modalAddSubjects">
          <div class="modalAddSubjects__header">
            <div class="modalAddSubjects__icon">
              <AppIcon icon="plus" />
            </div>

            <div>
              <h3 class="modalAddSubjects__title">Agregar Asignaturas Existentes</h3>
              <p class="modalAddSubjects__subtitle">Selecciona las asignaturas que deseas asociar a esta área</p>
            </div>
          </div>

          <div class="modalAddSubjects__body">
            <AppFormField :form-control="v$.form.search" label="Buscar asignatura">
              <AppInput v-model="v$.form.search.$model" type="text" placeholder="Buscar por nombre o código..." />
            </AppFormField>

            <div v-if="form.selectedIds.length > 0" class="selectedInfo">
              <p>
                {{ form.selectedIds.length }}
                {{ form.selectedIds.length === 1 ? 'asignatura seleccionada' : 'asignaturas seleccionadas' }}
              </p>

              <AppButton type="button" variant="ghost" @click="clearSelection"> Limpiar selección </AppButton>
            </div>

            <AppSelectableCard v-for="subject in filteredSubjects" :key="subject.id" :selected="form.selectedIds.includes(subject.id)" @toggle="toggleSubject(subject.id)">
              <div>
                <p class="subjectItem__name">{{ subject.shortName }}</p>
                <p class="subjectItem__code">{{ subject.code }}</p>

                <div class="subjectItem__badges">
                  <AppBadge :label="`${subject.credits} créditos`" variant="ghost" />
                  <AppBadge :label="`${subject.totalHours}h`" variant="ghost" />
                  <AppBadge :label="subject.type" variant="ghost" />
                </div>
              </div>
            </AppSelectableCard>
          </div>

          <div class="modalAddSubjects__footer">
            <p class="footerCount">
              {{ filteredSubjects.length }}
              {{ filteredSubjects.length === 1 ? 'asignatura disponible' : 'asignaturas disponibles' }}
            </p>
          </div>
        </div>
      </template>

      <template #actions>
        <AppButton> Agregar ({{ form.selectedIds.length }}) </AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { computed, defineComponent, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import AppInput from '../../../shared/components/Forms/AppInput.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppSelectableCard from '../../../shared/components/Card/AppSelectableCard.vue';

interface SubjectItem {
  id: string;
  code: string;
  name: string;
  shortName: string;
  credits: number;
  theoreticalHours?: number;
  practicalHours?: number;
  totalHours: number;
  type: string;
  spaceType?: string;
  isGraduationRequirement: boolean;
  linkedStudyPlan?: boolean;
  competenciesText?: string;
  learningResultsText?: string;
}

export default defineComponent({
  name: 'ModalAddSubjectsForm',
  components: {
    AppInput,
    AppButton,
    AppIcon,
    AppBadge,
    AppFormModal,
    AppFormField,
    AppSelectableCard,
  },
  props: {
    excludedSubjectIds: {
      type: Array as () => string[],
      default: () => [],
    },
  },
  emits: ['close', 'add'],
  setup(props, { emit }) {
    const title = 'Agregar asignaturas';

    const form = reactive({
      search: '',
      selectedIds: [] as string[],
    });

    const allSubjects = reactive<SubjectItem[]>([
      {
        id: 'a1',
        code: 'CB-MAT101',
        name: 'Cálculo Diferencial',
        shortName: 'Cálculo Diferencial',
        credits: 4,
        totalHours: 64,
        type: 'Teórica',
        isGraduationRequirement: false,
      },
      {
        id: 'a2',
        code: 'CB-FIS101',
        name: 'Física I',
        shortName: 'Física I',
        credits: 3,
        totalHours: 48,
        type: 'Teórico-Práctica',
        isGraduationRequirement: false,
      },
      {
        id: 'a3',
        code: 'CB-QUI101',
        name: 'Química General',
        shortName: 'Química General',
        credits: 3,
        totalHours: 48,
        type: 'Teórico-Práctica',
        isGraduationRequirement: false,
      },
      {
        id: 'a4',
        code: 'PD-PRG101',
        name: 'Fundamentos de Programación',
        shortName: 'Fundamentos de Programación',
        credits: 4,
        totalHours: 64,
        type: 'Teórico-Práctica',
        isGraduationRequirement: false,
      },
      {
        id: 'a5',
        code: 'PD-PRG201',
        name: 'Programación Orientada a Objetos',
        shortName: 'POO',
        credits: 4,
        totalHours: 64,
        type: 'Teórico-Práctica',
        isGraduationRequirement: false,
      },
      {
        id: 'a6',
        code: 'IP-INV301',
        name: 'Metodología de la Investigación',
        shortName: 'Metodología',
        credits: 2,
        totalHours: 32,
        type: 'Teórica',
        isGraduationRequirement: false,
      },
      {
        id: 'a7',
        code: 'IP-PRY401',
        name: 'Proyecto de Grado',
        shortName: 'Proyecto de Grado',
        credits: 6,
        totalHours: 96,
        type: 'Proyecto',
        isGraduationRequirement: true,
      },
      {
        id: 'a8',
        code: 'HU-COM101',
        name: 'Comunicación Oral y Escrita',
        shortName: 'Comunicación Oral y Escrita',
        credits: 2,
        totalHours: 32,
        type: 'Teórica',
        isGraduationRequirement: false,
      },
    ]);

    const availableSubjects = computed(() => {
      return allSubjects.filter((subject) => !props.excludedSubjectIds.includes(subject.id));
    });

    const filteredSubjects = computed(() => {
      const term = form.search.trim().toLowerCase();

      return availableSubjects.value.filter((subject) => {
        return !term || subject.shortName.toLowerCase().includes(term) || subject.code.toLowerCase().includes(term);
      });
    });

    const v$ = useVuelidate(
      {
        form: {
          search: {},
          selectedIds: { required },
        },
      },
      { form }
    );

    const toggleSubject = (id: string) => {
      if (form.selectedIds.includes(id)) {
        form.selectedIds = form.selectedIds.filter((item) => item !== id);
        return;
      }

      form.selectedIds = [...form.selectedIds, id];
    };

    const clearSelection = () => {
      form.selectedIds = [];
    };

    const closeModal = () => {
      form.search = '';
      form.selectedIds = [];
      emit('close');
    };

    const save = async () => {
      const isValid = await v$.value.$validate();

      if (!isValid) return;

      const subjects = allSubjects.filter((subject) => form.selectedIds.includes(subject.id));

      emit('add', subjects);

      form.search = '';
      form.selectedIds = [];
      emit('close');
    };

    return {
      title,
      form,
      v$,
      emit,
      availableSubjects,
      filteredSubjects,
      toggleSubject,
      clearSelection,
      closeModal,
      save,
    };
  },
});
</script>

<style scoped>
.modalAddSubjects {
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}

.modalAddSubjects__header {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eaecf0;
  margin-bottom: 1rem;
}

.modalAddSubjects__icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #dbeafe;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modalAddSubjects__title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #172033;
}

.modalAddSubjects__subtitle {
  margin: 0.25rem 0 0;
  color: #667085;
}

.modalAddSubjects__body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.searchBox {
  width: 100%;
}

.selectedInfo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 0.85rem 1rem;
}

.selectedInfo p {
  margin: 0;
  color: #1d4ed8;
  font-weight: 600;
}

.subjectsList {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 350px;
  overflow-y: auto;
}

.subjectItem {
  display: flex;
  gap: 0.9rem;
  padding: 1rem;
  border: 1px solid #e4e7ec;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fff;
}

.subjectItem:hover {
  background: #f9fafb;
}

.subjectItem--selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.subjectItem__checkbox {
  display: flex;
  align-items: center;
}

.subjectItem__content {
  flex: 1;
  min-width: 0;
}

.subjectItem__top {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.65rem;
}

.subjectItem__name {
  margin: 0;
  font-weight: 700;
  color: #172033;
}

.subjectItem__code {
  margin: 0.2rem 0 0;
  font-size: 0.82rem;
  color: #667085;
  font-family: monospace;
}

.subjectItem__check {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: #2563eb;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.subjectItem__badges {
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.emptyState {
  text-align: center;
  padding: 2rem 1rem;
  border: 1px dashed #d0d5dd;
  border-radius: 14px;
}

.emptyState__icon {
  width: 56px;
  height: 56px;
  border-radius: 999px;
  background: #f2f4f7;
  margin: 0 auto 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667085;
}

.emptyState__title {
  margin: 0;
  font-weight: 700;
  color: #172033;
}

.emptyState__subtitle {
  margin: 0.35rem 0 0;
  color: #667085;
}

.modalAddSubjects__footer {
  margin-top: 1rem;
}

.footerCount {
  margin: 0;
  color: #667085;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .selectedInfo,
  .subjectItem__top {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
