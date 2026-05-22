<template>
  <div class="form-row">
    <AppFormField :form-control="v$.form.academicPeriodId" label="core.generalTerms.academic.academicPeriod.singular">
      <AppAutocomplete input-id="academicPeriodId" :options="academicPeriods"
                       v-model="v$.form.academicPeriodId.$model"></AppAutocomplete>
    </AppFormField>

    <AppFormField :form-control="v$.form.academicPeriodGroupId"
                  label="core.generalTerms.academic.group.singular">
      <AppAutocomplete input-id="academicPeriodGroupId" :options="academicPeriodGroups"
                       v-model="v$.form.academicPeriodGroupId.$model"
                       :disabled="!v$.form.academicPeriodId.$model"></AppAutocomplete>
    </AppFormField>
  </div>
</template>

<script lang="ts">
import {defineComponent, PropType, ref, watch} from 'vue';

import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import {
  GetAcademicPeriodGroupsFromAcademicPeriodIdService,
} from '../services/filters/getAcademicPeriodGroupsFromAcademicPeriodId.service';
import {AcademicPeriodDto} from '../../../shared/dto/academicPeriod.dto';
import {AcademicPeriodGroupDto} from '../../academicAdministration/dto/academicPeriodGroup.dto';

const getAcademicPeriodGroupsFromAcademicPeriodIdService = new GetAcademicPeriodGroupsFromAcademicPeriodIdService();

export default defineComponent({
  name: 'FilterAcademicPeriodWithGroups',
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
    const academicPeriodGroups = ref<AcademicPeriodGroupDto[]>([]);

    const getAcademicPeriodGroups = async (academicPeriodId: number) => {
      academicPeriodGroups.value = await getAcademicPeriodGroupsFromAcademicPeriodIdService.run(academicPeriodId, props.permission);
    };

    watch(() => props.v$.form.academicPeriodId.$model, async (value) => {
      if (value) {
        await getAcademicPeriodGroups(value);
      } else {
        academicPeriodGroups.value = [];
      }
    });

    return {
      academicPeriodGroups,
    };
  },
});
</script>

<style scoped>

</style>
