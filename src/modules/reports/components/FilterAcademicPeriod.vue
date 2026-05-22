<template>
    <AppFormField :form-control="v$.form.academicPeriodId" label="core.generalTerms.academic.academicPeriod.singular">
        <AppAutocomplete input-id="academicPeriodId" :options="academicPeriods" 
            v-model="v$.form.academicPeriodId.$model"
        ></AppAutocomplete>
    </AppFormField>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue';

import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import {AcademicPeriodDto} from '../../../shared/dto/academicPeriod.dto';

export default defineComponent({
    name: 'FilterAcademicPeriod',
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
    },
});

</script>