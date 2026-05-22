<template>
    <form @submit.prevent="save">
         <AppFormModal :title="title" @closed="emit('close')">
            <template v-slot:content>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Observación</th>
                            <th>Sig. Contacto</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr v-for="call, index in calls" :key="index">
                            <td>{{ call.createdAt }}</td>
                            <td>{{ call.observations }}</td>
                            <td>{{ call.dateNextContact }}</td>
                        </tr>
                    </tbody>
                </table>

                <AppFormField :form-control="v$.form.observations" :label="'Observaciones'">
                   <AppVoiceInput  v-model="v$.form.observations.$model" id="observations" textareaClass="form-control"  />
                </AppFormField>

                <AppFormField :form-control="v$.form.dateNextContact" label="Proximo Contacto">
                    <input class="form-control" type="date" id="dateNextContact" v-model="v$.form.dateNextContact.$model">
                </AppFormField>
            </template>

            <template v-slot:actions>
                <AppButton
                    :label="'core.save'" :nativeType="'submit'"
                ></AppButton>
            </template>
        </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, PropType, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

import { CallDto } from '../dtos/portfolioMonitoring.dto';

import { CreateOrUpdatePortfolioMonitoringCallService } from '../services/createOrUpdatePortfolioMonitoringCall.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdatePortfolioMonitoringCallService = new CreateOrUpdatePortfolioMonitoringCallService();

export default defineComponent({
    name: 'PortfolioMonitoringViewCalls',
    components: {AppFormModal, AppButton, AppFormField, AppVoiceInput},

    emits: ['close'],
    props: {
        receiverUserId: {
            type: Number,
            required: true,
        },
        data: {
            type: Object as PropType<CallDto[]>,
            required: true,
        },
    },

    setup(props, {emit}) {
        const calls: CallDto[] = props.data;
        const title = 'Visualizar llamadas';

        const form = reactive({
            receiverUserId: props.receiverUserId,
            observations: '',
            dateNextContact: null,
        });
        const v$ = useVuelidate({
            form: {
                receiverUserId: {required},
                observations: {required},
                dateNextContact: {},
            },
        }, { form });

        const save = async () => {
            const formIsValid = await v$.value.$validate();
            if (!formIsValid) return;

            try {
                await createOrUpdatePortfolioMonitoringCallService.run(form);
                emit('close');
            } catch (e) {}
        };

        return {
            calls,
            title,
            save,
            emit,
            v$,
        };
    },
});
</script>

<style scoped>
</style>