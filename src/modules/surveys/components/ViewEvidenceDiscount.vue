<template>
    <AppFormModal :title="title">
        <template v-slot:content>
            <div v-if="!data.discount.requireAttachment">
                <h3 class="text-center">Este descuento no requiere de una evidencia.</h3>
            </div>

            <div v-else-if="!data.urlAttachment">
                <h3 class="text-center">No se ha subido un archivo para este descuento.</h3>
            </div>

            <iframe 
                v-else
                :src="data.urlAttachment" 
                style="width: 100%; height: 61rem; border: none;"
            ></iframe>

            <AppChat
                :row-table="'ConvocationEnrolDiscounts'"
                :comments-res="comments.value"
                :row-id="data.id"
                @new-comment="newComment"
            ></AppChat>
        </template>

        <template v-slot:actions>
            <AppButton
                @click="acceptOrRejectEvidence(false)"
                label="Rechazar"
                variant="primary"
                outlined
            ></AppButton>

            <AppButton
                @click="acceptOrRejectEvidence(true)"
                label="Aceptar"
                variant="primary"
            ></AppButton>
        </template>
    </AppFormModal>
</template>

<script lang="ts">
import {defineComponent, onMounted, reactive, ref} from 'vue';
import {useRoute} from "vue-router";

import AppChat from '../../../shared/components/AppChat.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import {GetInvoiceToEditService} from '../services/getInvoiceToEdit.service';
import {AcceptOrRejectEvidenceService} from '../services/acceptOrRejectEvidence.service';

const acceptOrRejectEvidenceService = new AcceptOrRejectEvidenceService();
const getInvoiceToEditService = new GetInvoiceToEditService();

export default defineComponent({
    name: 'ViewEvidenceDiscount',
    components: {AppFormModal, AppButton, AppChat},

    props: ['data'],
    emits: ['close'],

    setup(props, {emit}) {
        const data = props.data;
        const route = useRoute();
        let title = `Evidencia "${data.discount.title}"`;

        const comments: { value: any[] } = reactive({
            value: data.comments
        });
        
        onMounted(async () => {
            await newComment();
        });

        const acceptOrRejectEvidence = async (acceptFile: boolean) => {
            try {
                await acceptOrRejectEvidenceService.run(data.id, { isAccept: acceptFile })
                emit('close');
            } catch (e) {}
        };

        const newComment = async () => {
            if (route.query.convocationEnrolStepId) {
                let convocationEnrolStepId = parseInt(route.query.convocationEnrolStepId.toString(), 10);
                let invoiceId = parseInt(route.params.invoiceId.toString(), 10);

                try {
                    let res: any = await getInvoiceToEditService.run(invoiceId, convocationEnrolStepId);

                    res.enrolDiscounts.forEach((enrolDiscount: any) => {
                        if (data.id == enrolDiscount.id) {
                            comments.value = enrolDiscount.comments;
                        }
                    });
                } catch (e) {}
            }
        };

        return {
            title,

            comments,

            acceptOrRejectEvidence,
            newComment,
        };
    },
});
</script>

<style scoped>
</style>