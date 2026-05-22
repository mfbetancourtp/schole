<template>
    <DisciplinaryOffensesForm :title="title">
    </DisciplinaryOffensesForm>
</template>

<script lang="ts">
import {useI18n} from 'vue-i18n';
import {useMeta} from 'vue-meta';
import {defineComponent} from "vue";

import DisciplinaryOffensesForm from '../components/DisciplinaryOffensesForm.vue';

export default defineComponent({
    name: "CreateDisciplinaryOffenses",
    components: { DisciplinaryOffensesForm },

    setup() {
        const {t} = useI18n();
        const title = `${t('core.newFemale')} ${t('disciplinaryControl.disciplinaryOffenses.singular')}`;
        useMeta({title: title});

        return {
            title,
        };
    },
});
</script>