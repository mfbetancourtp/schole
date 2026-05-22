<template>
  <div class="form-row">
    <!-- Periodo académico -->
    <AppFormField :form-control="v$.form.academicPeriodId"
                  label="core.generalTerms.academic.academicPeriod.singular">
      <AppAutocomplete input-id="academicPeriodId"
                       :options="academicPeriods"
                       v-model="v$.form.academicPeriodId.$model"/>
    </AppFormField>

    <!-- Nivel -->
    <AppFormField :form-control="v$.form.levelId"
                  label="core.generalTerms.academic.level.singular">
      <AppAutocomplete input-id="levelId"
                       :options="levels"
                       v-model="v$.form.levelId.$model"
                       :disabled="!v$.form.academicPeriodId.$model"/>
    </AppFormField>
  </div>

  <div class="form-row">
    <!-- Grado -->
    <AppFormField :form-control="v$.form.degreeId"
                  label="core.generalTerms.academic.degree.singular">
      <AppAutocomplete input-id="degreeId"
        :key="`${v$.form.levelId.$model}`"

                       :options="degrees"
                       v-model="v$.form.degreeId.$model"
                       :disabled="!v$.form.levelId.$model"/>
    </AppFormField>

    <!-- Asignatura (solo si isSubjects) -->
    <AppFormField v-if="isSubjects"
                  :form-control="v$.form.subjectId"
                  label="Asignatura">
      <AppAutocomplete input-id="subjectId"
        :key="`${v$.form.levelId.$model}-${v$.form.degreeId.$model}`"
                       :options="subjectAssignments"
                       v-model="v$.form.subjectId.$model"
                       :reduce="(item: any) => item.id"
                       :disabled="!v$.form.levelId.$model"
                       />
    </AppFormField>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch, nextTick } from 'vue';
import AppFormField    from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { AcademicPeriodDto } from '../../../shared/dto/academicPeriod.dto';
import { LevelDto }          from '../../../shared/dto/level.dto';
import { DegreeDto }         from '../../../shared/dto/degree.dto';

import { GetLevelsByAcademicPeriodIdService } from '../services/filters/getLevelsByAcademicPeriodId.service';
import { GetCoursesByAcadPeriIdService }      from '../../administration/services/getCoursesByAcadPeriId.service';

/* Servicios */
const getLevelsByAcademicPeriodIdService = new GetLevelsByAcademicPeriodIdService();
const getCoursesByAcadPeriIdService      = new GetCoursesByAcadPeriIdService();

export default defineComponent({
  name: 'FilterAcademicPeriodWithDegrees',
  components: { AppAutocomplete, AppFormField },
  props: {
    v$:              { type: Object, required: true },
    academicPeriods: { type: Array as PropType<AcademicPeriodDto[]>, required: true },
    isSubjects:      { type: Boolean, default: false },
    permission:      String,
  },
  setup(props) {
    /* Estado */
    const levels             = ref<LevelDto[]>([]);
    const degrees            = ref<DegreeDto[]>([]);
    const allCourses         = ref<{ id:number; name:string; degreeId:number|null; levelId:number|null }[]>([]);
    const coursesByLevel     = ref<typeof allCourses.value>([]);
    const subjectAssignments = ref<{ id:number; name:string }[]>([]);
    /** Quita duplicados dejando 1 solo registro por id */
    const uniqBySubjectId = (list: typeof allCourses.value) =>
      Array.from(new Map(list.map(c => [c.id, c])).values());

    /* Helpers */
    const fetchLevels = async (academicPeriodId:number) => {
      levels.value = await getLevelsByAcademicPeriodIdService.run(academicPeriodId);
    };

    const fetchCourses = async (academicPeriodId: number) => {
  if (!props.isSubjects) return;

  const response = await getCoursesByAcadPeriIdService.run(academicPeriodId, {});

  // ── 1. Aplanar grados ➜ cursos ────────────────────────────────
  const flat = response.flatMap((deg: any) =>
    (deg.courses ?? []).map((c: any) => ({
      id:       c.subjectId,
      name:     c.subjectName,
      degreeId: c.degree?.id ?? null,
      levelId:  deg.levelId, // ← queda asociado al nivel
    })),
  );

  // ── 2. Deduplicar por (id, degreeId, levelId) ─────────────────
  const unique = Array.from(
    new Map(
      flat.map(course => [
        `${course.id}-${course.degreeId ?? 'null'}-${course.levelId ?? 'null'}`,
        course,
      ]),
    ).values(),
  );

  // ── 3. Actualizar estados reactivos ───────────────────────────
  allCourses.value         = unique;
  coursesByLevel.value     = [...unique];
  subjectAssignments.value = [...unique];

  console.log('Cursos deduplicados:', allCourses.value);
};



    const fillDegrees = (levelId:number) => {
      const level = levels.value.find(l => l.id === levelId);
      degrees.value = level ? level.degrees : [];
    };

    /* Watchers */
    // 1. Periodo académico
    watch(
      () => props.v$.form.academicPeriodId.$model,
      async periodId => {
        levels.value = degrees.value = [];
        allCourses.value = coursesByLevel.value = subjectAssignments.value = [];
        props.v$.form.levelId.$model   = null;
        props.v$.form.degreeId.$model  = null;
        if (props.isSubjects) props.v$.form.subjectId.$model = null;

        if (periodId) {
          await Promise.all([fetchLevels(periodId), fetchCourses(periodId)]);
        }
      }
    );

    // 2. Nivel
    watch(
  () => props.v$.form.levelId.$model,
  async levelId => {
    degrees.value              = [];
    subjectAssignments.value    = [];
    props.v$.form.degreeId.$model   = null;
    props.v$.form.subjectId.$model  = null;

    /* ── Filtrar cursos del nivel seleccionado ─────────────── */
    if (props.isSubjects) {
      const byLevel = levelId
        ? allCourses.value.filter(c => c.levelId === levelId)
        : [...allCourses.value];

      coursesByLevel.value     = byLevel;               // seguimos guardando todos
      subjectAssignments.value = uniqBySubjectId(byLevel); // ⚠️ solo id único
    }

    if (levelId) fillDegrees(levelId);
  }
);


    // 3. Grado → filtra dentro del conjunto ya filtrado por nivel
    if (props.isSubjects) {
  watch(
    () => props.v$.form.degreeId.$model,
    async degreeId => {
      props.v$.form.subjectId.$model = null;
      subjectAssignments.value       = [];

      const list = degreeId
        ? coursesByLevel.value.filter(c => c.degreeId === degreeId)
        : [...coursesByLevel.value];

      subjectAssignments.value = uniqBySubjectId(list);   // también sin repes
    }
  );
}


    /* Exposición al template */
    return {
      isSubjects: props.isSubjects,
      levels,
      degrees,
      subjectAssignments,
    };
  },
});
</script>
