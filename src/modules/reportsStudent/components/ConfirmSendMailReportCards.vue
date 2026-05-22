<template>
    <AppFormModal :title="title">
        <template v-slot:content>
            <AppLoading v-if="loading"></AppLoading>

            <div v-else>
                Se enviará el reporte
                a {{ total }} {{ total === 1 ? t('core.generalTerms.academic.tutor.singular') : t('core.generalTerms.academic.tutor.plural') }}
            </div>
        </template>

        <template v-slot:actions>
            <AppButton 
                @click="sendMail()"
            >{{ t('reports.send') }}</AppButton>
        </template>
    </AppFormModal>
</template>

<script lang="ts">
import {useI18n} from 'vue-i18n';
import {defineComponent, onMounted, reactive, ref} from 'vue';

import AppLoading from "../../../shared/components/AppLoading.vue";
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import {SendEmailReportsCardsToParentsService} from '../services/filters/sendEmailReportsCardsToParents.service';
import { SendEmailReportsCardsToParentsByStudentService } from '../services/filters/sendEmailReportsCardsToParentsByStudent.service';
import {GetCountParentsSendMailPerformancePerPeriodService} from '../services/filters/getCountParentsSendMailPerformancePerPeriod.service';

const getCountParentsSendMailPerformancePerPeriodService = new GetCountParentsSendMailPerformancePerPeriodService();
const sendEmailReportsCardsToParentsByStudentService = new SendEmailReportsCardsToParentsByStudentService();
const sendEmailReportsCardsToParentsService = new SendEmailReportsCardsToParentsService();

export default defineComponent({
    name: 'ConfirmSendMailReportCards',
    components: {AppFormModal, AppButton, AppLoading},

    props: ['filters'],
    emits: ['close'],

    setup(props, {emit}) {
        const {t} = useI18n();
        const filters = props.filters;
        let title = 'Enviar email a tutores';

        const loading = ref(true);
        const total = ref();

        onMounted(async () => {
            let response = await getCountParentsSendMailPerformancePerPeriodService.run(filters);
            total.value = response.cantParents;

            loading.value = false;
        });

        const sendMail = async () => {
            try {
                if (!filters.matriculateId) {
                    await sendEmailReportsCardsToParentsService.run(filters);
                } else {
                    await sendEmailReportsCardsToParentsByStudentService.run(filters);
                }
                emit('close');
            } catch (e) {}
        };

        return {
            loading,
            title,
            total,
            t,

            sendMail,
        };
    },
});
</script>

<style scoped>
</style>