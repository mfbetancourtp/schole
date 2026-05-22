<template>
    <AppLoading v-if="loading"></AppLoading>

    <DisciplinaryOffensesForm
        v-else
        :data="data"
        :title="title"
    >
    </DisciplinaryOffensesForm>
</template>

<script lang="ts">
import {useI18n} from 'vue-i18n';
import {useMeta} from 'vue-meta';
import {useRoute} from "vue-router";
import {defineComponent, onMounted, ref} from "vue";

import DisciplinaryOffensesForm from '../components/DisciplinaryOffensesForm.vue';
import {GetDisciplinaryOffensesByIdService} from '../services/getDisciplinaryOffensesById.service';

const getDisciplinaryOffensesByIdService = new GetDisciplinaryOffensesByIdService();

export default defineComponent({
    name: "EditDisciplinaryOffenses",
    components: { DisciplinaryOffensesForm },

    setup() {
        const {t} = useI18n();
        const title = `${t('core.edit')} ${t('disciplinaryControl.disciplinaryOffenses.singular')}`;
        useMeta({title: title});

        const loading = ref(true);
        const route = useRoute();
        const data = ref();

        onMounted(async () => {
            try {
                let disciplinaryOffenseId = parseInt(route.params.disciplinaryOffenseId.toString(), 10);
                data.value = await getDisciplinaryOffensesByIdService.run(disciplinaryOffenseId);
            } catch (e) {}

            loading.value = false;
        });

        return {
            loading,
            title,
            data,
        };
    },
});
</script>

<style scoped>
</style>