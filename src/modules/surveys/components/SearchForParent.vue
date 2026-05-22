<template>
    <form @submit.prevent="search">
        <h5 class="h6 mb-4">Ingrese el número de identificación del acudiente.</h5>

        <AppFormField :form-control="v$.form.identification" :label="'Identificación'">
            <input
                type="text" class="form-control"
                v-model="v$.form.identification.$model">
        </AppFormField>

        <div class="d-flex justify-content-center">
            <AppButton>Continuar</AppButton>
        </div>
  </form>
</template>

<script lang="ts">
import {defineComponent, reactive, ref} from 'vue';

import {useVuelidate} from '@vuelidate/core';
import {required} from '../../../shared/plugins/vuelidate.plugin';

import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { PeopleByIdentificationSurveysService } from '../services/peopleByIdentificationSurveys.service';

const peopleByIdentificationSurveysService = new PeopleByIdentificationSurveysService();

export default defineComponent({
    name: 'SearchForParent',
    components: {AppButton, AppFormField},

    emits: ['dataPeople'],
    props: ['convocationStepId', 'surveySectionId'],

    setup(props, {emit}) {
        const form = reactive({
            identification: null,
        });
        const v$ = useVuelidate({
            form: {
                identification: {required},
            },
        }, {form});

        const search = async () => {
            const formIsValid = await v$.value.$validate();
            if (!formIsValid) return;

            try {
                let params = {
                    identification: form.identification,
                    convocationStepId: props.convocationStepId,
                    surveySectionId: props.surveySectionId,
                }

                let data = await peopleByIdentificationSurveysService.run(params);

                emit('dataPeople', data);
            } catch (e) {}
        };

        return {
            search,
            v$,
        };
    },
});
</script>

<style scoped>
</style>