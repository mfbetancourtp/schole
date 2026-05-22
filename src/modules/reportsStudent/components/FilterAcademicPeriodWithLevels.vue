<template>
  <div class="form-row">
    <AppFormField :form-control="v$.form.academicPeriodId" label="core.generalTerms.academic.academicPeriod.singular">
      <AppAutocomplete input-id="academicPeriodId" :options="academicPeriods"
                       v-model="v$.form.academicPeriodId.$model"></AppAutocomplete>
    </AppFormField>

    <AppFormField :form-control="v$.form.levelId" label="core.generalTerms.academic.level.singular">
      <AppAutocomplete input-id="levelId" :options="levels"
                       v-model="v$.form.levelId.$model"
                       :disabled="!v$.form.academicPeriodId.$model"></AppAutocomplete>
    </AppFormField>
  </div>

  <div class="form-row">
    <AppFormField :form-control="v$.form.degreeId" label="core.generalTerms.academic.degree.singular">
      <AppAutocomplete input-id="degreeId" :options="degrees"
                       v-model="v$.form.degreeId.$model"
                       :disabled="!v$.form.levelId.$model"></AppAutocomplete>
    </AppFormField>

    <AppFormField :form-control="v$.form.groupId" label="core.generalTerms.academic.group.singular">
      <AppAutocomplete input-id="groupId" :options="groups"
                       v-model="v$.form.groupId.$model"
                       :disabled="!v$.form.degreeId.$model"></AppAutocomplete>
    </AppFormField>
  </div>
</template>

<script lang="ts">
import {defineComponent, PropType, ref, watch} from 'vue';

import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import {AcademicPeriodDto} from '../../../shared/dto/academicPeriod.dto';
import {GetLevelsByAcademicPeriodIdService} from '../services/filters/getLevelsByAcademicPeriodId.service';
import {LevelDto} from '../../../shared/dto/level.dto';
import {DegreeDto} from '../../../shared/dto/degree.dto';
import {GroupDto} from '../../../shared/dto/group.dto';

const getLevelsByAcademicPeriodIdService = new GetLevelsByAcademicPeriodIdService();

export default defineComponent({
  name: 'FilterAcademicPeriodWithLevels',
  components: {AppAutocomplete, AppFormField},
  props: {
    v$: {
      type: Object,
      required: true,
    },
    academicPeriods: {
      type: Array as PropType<AcademicPeriodDto[]>,
      required: true,
    },
    permission: {
      type: String,
    },
  },
  setup(props) {
    const levels = ref<LevelDto[]>([]);
    const degrees = ref<DegreeDto[]>([]);
    const groups = ref<GroupDto[]>([]);

    const getLevelsByAcademicPeriodGroupId = async (academicPeriodId: number) => {
      levels.value = await getLevelsByAcademicPeriodIdService.run(academicPeriodId);
    };

    const getDegreesByLevelId = (levelId: number) => {
      levels.value.forEach((level) => {
        if (level.id === levelId) {
          degrees.value = level.degrees;
        }
      });
    };

    const getGroupsByDegreeId = (degreeId: number) => {
      degrees.value.forEach((degree) => {
        if (degree.id === degreeId) {
          groups.value = degree.groups;
        }
      });
    };

    watch(() => props.v$.form.academicPeriodId.$model, async (value) => {
      if (value) {
        await getLevelsByAcademicPeriodGroupId(value);
      } else {
        levels.value = [];
      }
    });

    watch(() => props.v$.form.levelId.$model, async (value) => {
      if (value) {
        await getDegreesByLevelId(value);
      } else {
        degrees.value = [];
      }
    });

    watch(() => props.v$.form.degreeId.$model, async (value) => {
      if (value) {
        await getGroupsByDegreeId(value);
      } else {
        groups.value = [];
      }
    });

    return {
      levels,
      degrees,
      groups,
    };
  },
});
</script>

<style scoped>

</style>
