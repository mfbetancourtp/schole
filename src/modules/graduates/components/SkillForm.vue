<template>
  <form @submit.prevent="save">
    <div class="row g-3">
      <div class="col-12">
        <AppFormField :form-control="v$.form.name" label="Nombre de la habilidad">
          <input type="text" class="form-control" v-model="v$.form.name.$model" placeholder="ej. React & Next.js" />
        </AppFormField>
      </div>

      <div class="col-12">
        <AppFormField :form-control="v$.form.skillCategoryId" label="Categoría">
          <select class="form-control" v-model="v$.form.skillCategoryId.$model" :class="{ 'is-invalid': v$.form.skillCategoryId.$error }">
            <option :value="0">Seleccionar categoría</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">
              {{ c.name }}
            </option>
          </select>
        </AppFormField>
      </div>

      <div class="col-12">
        <AppFormField :form-control="v$.form.domainLevel" label="Nivel de dominio">
          <div class="level-options" :class="{ 'level-options--error': v$.form.domainLevel.$error }">
            <div
              v-for="level in levels"
              :key="level.name"
              class="level-option"
              :class="{
                'level-option--selected': v$.form.domainLevel.$model === level.name,
              }"
              @click="v$.form.domainLevel.$model = level.name"
            >
              <span class="level-name">{{ level.name }}</span>
              <span class="level-stars">
                <AppIcon v-for="s in 5" :key="s" icon="star" class="level-star" :class="s <= level.stars ? 'level-star--on' : 'level-star--off'" />
              </span>
            </div>
          </div>
        </AppFormField>
      </div>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, reactive, ref, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minValue } from '../../../shared/plugins/vuelidate.plugin';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import { AuthenticatedUserService } from '../../../shared/services/authenticatedUser.service';
import type { GraduateSkillCategoryDto, GraduateSkillDomainLevel, GraduateSkillDto, UpsertGraduateSkillRequest } from '../dtos/graduateProfile.dto';
import { CreateOrUpdateSkillService } from '../services/createOrUpdateSkill.service';
import { GetSkillCategoriesService } from '../services/getSkillCategories.service';

const LEVELS: { name: GraduateSkillDomainLevel; stars: number }[] = [
  { name: 'Principiante', stars: 1 },
  { name: 'Básico', stars: 2 },
  { name: 'Intermedio', stars: 3 },
  { name: 'Avanzado', stars: 4 },
  { name: 'Experto', stars: 5 },
];

export default defineComponent({
  name: 'SkillForm',
  components: { AppIcon, AppFormField },
  props: {
    data: { type: Object as PropType<GraduateSkillDto | null>, default: null },
    institutionId: { type: Number as PropType<number | null>, default: null },
  },
  emits: ['save'],
  setup(props, { emit, expose }) {
    const saving = ref(false);
    const authenticatedUserService = new AuthenticatedUserService();
    const createOrUpdateSkillService = new CreateOrUpdateSkillService();
    const getSkillCategoriesService = new GetSkillCategoriesService();
    const categories = ref<GraduateSkillCategoryDto[]>([]);

    const form = reactive({
      name: props.data?.name ?? '',
      skillCategoryId: props.data?.skillCategoryId ?? 0,
      domainLevel: (props.data?.domainLevel ?? '') as GraduateSkillDomainLevel | '',
    });

    const v$ = useVuelidate(
      {
        form: {
          name: { required },
          skillCategoryId: { required, minValue: minValue(1) },
          domainLevel: { required },
        },
      },
      { form },
      { $scope: false }
    );

    watch(
      () => props.data,
      (next) => {
        form.name = next?.name ?? '';
        form.skillCategoryId = next?.skillCategoryId ?? 0;
        form.domainLevel = (next?.domainLevel ?? '') as GraduateSkillDomainLevel | '';
        v$.value.$reset();
      }
    );

    const resolveInstitutionId = () => {
      const user = authenticatedUserService.get();
      const id = Number(props.institutionId ?? user?.people?.institutionId ?? props.data?.skillCategory?.institutionId ?? 0);
      return Number.isFinite(id) && id > 0 ? id : null;
    };

    const loadCategories = async () => {
      const institutionId = resolveInstitutionId();
      if (!institutionId) return;
      try {
        const res = await getSkillCategoriesService.run({ institutionId });
        categories.value = res.data ?? [];
      } catch {
        categories.value = [];
      }
    };

    onMounted(() => {
      void loadCategories();
    });
    watch(
      () => props.institutionId,
      () => {
        void loadCategories();
      }
    );

    const save = async () => {
      const valid = await v$.value.$validate();
      if (!valid) return;
      saving.value = true;
      try {
        const user = authenticatedUserService.get();
        const peopleId = Number(user?.people?.id ?? props.data?.peopleId ?? 0);
        if (!peopleId) return;
        const payload: UpsertGraduateSkillRequest = {
          peopleId,
          name: form.name,
          skillCategoryId: Number(form.skillCategoryId),
          domainLevel: form.domainLevel as GraduateSkillDomainLevel,
        };
        const saved = await createOrUpdateSkillService.run(payload, props.data?.id ?? undefined);
        emit('save', (saved as any)?.data ?? saved);
      } finally {
        saving.value = false;
      }
    };

    const submitForm = () => save();
    expose({ submitForm });

    return { form, v$, save, categories, levels: LEVELS };
  },
});
</script>

<style scoped>
.level-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-radius: 6px;
}
.level-options--error {
  border: 1px solid #dc3545;
  border-radius: 6px;
  padding: 4px;
}
.level-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}
.level-option:hover {
  border-color: #3b82f6;
  background: #f0f7ff;
}
.level-option--selected {
  border-color: #3b82f6;
  background: #eff6ff;
}
.level-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}
.level-option--selected .level-name {
  color: #2563eb;
}
.level-stars {
  display: flex;
  gap: 3px;
  align-items: center;
}
.level-star {
  font-size: 0.8rem;
}
.level-star--on {
  color: #f59e0b;
}
.level-star--off {
  color: #d1d5db;
}
</style>
