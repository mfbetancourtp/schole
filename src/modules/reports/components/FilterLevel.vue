<template>
    <AppFormField :form-control="v$.form.levelId" label="core.generalTerms.academic.level.singular">
        <AppAutocomplete input-id="levelId" :options="levels" v-model="v$.form.levelId.$model"
            :disabled="!v$.form.academicPeriodId.$model"
        ></AppAutocomplete>
    </AppFormField>
</template>

<script lang="ts">
import {defineComponent, PropType, ref, watch} from 'vue';

import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import {LevelDto} from '../../../shared/dto/level.dto';
import {AcademicPeriodDto} from '../../../shared/dto/academicPeriod.dto';

import {GetLevelsByAcademicPeriodIdService} from '../services/filters/getLevelsByAcademicPeriodId.service';

const getLevelsByAcademicPeriodIdService = new GetLevelsByAcademicPeriodIdService();

export default defineComponent({
    name: 'FilterLevel',
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

        const getLevelsByAcademicPeriodGroupId = async (academicPeriodId: number) => {
            levels.value = await getLevelsByAcademicPeriodIdService.run(academicPeriodId);
        };

        watch(() => props.v$.form.academicPeriodId.$model, async (value) => {
            if (value) {
                await getLevelsByAcademicPeriodGroupId(value);
            } else {
                levels.value = [];
            }
        });

        return {
            levels,
        };
    },
});
</script>