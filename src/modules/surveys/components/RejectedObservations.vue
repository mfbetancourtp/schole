<template>
    <form @submit.prevent="save">
        <AppFormModal :title="title">
            <template v-slot:content>
                <AppFormField 
                    :form-control="v$.form.observations" 
                    label="Motivo - Observaciones"
                >
                    <AppVoiceInput 
                    :cols="30" :rows="2"
                        class="form-control" 
                        v-model="v$.form.observations.$model" textareaClass="form-control"  />
                    <span>
                        Puede cambiar el estado a "Aprobado" posteriormente, si cambias de opinión.
                    </span>
                </AppFormField>
            </template>

            <template v-slot:actions>
                <AppButton>Guardar</AppButton>
            </template>
        </AppFormModal>
  </form>
</template>

<script lang="ts">
import {defineComponent, reactive, ref} from 'vue';

import {useVuelidate} from '@vuelidate/core';
import {required} from '../../../shared/plugins/vuelidate.plugin';

import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import {UpdateApprovedByInscritoService} from '../services/updateApprovedByInscrito.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const updateApprovedByInscritoService = new UpdateApprovedByInscritoService();

export default defineComponent({
    name: 'RejectedObservations',
    components: {AppFormModal, AppButton, AppFormField, AppVoiceInput},

    props: ['data'],
    emits: ['close'],

    setup(props, {emit}) {
        const data = props.data;
        const title = 'Detener Inscripción';

        const form = reactive({
            observations: data.rejectedObservations,
        });
        const v$ = useVuelidate({
            form: {
                observations: {},
            },
        }, {form});

        const save = async () => {
            const formIsValid = await v$.value.$validate();
            if (!formIsValid) return;

            try {
                data.rejectedObservations = form.observations;

                await updateApprovedByInscritoService.run(data);
                emit('close');
            } catch (e) {}
        };

        return {
            title,
            save,
            v$,
        };
    },
});
</script>

<style scoped>
</style>