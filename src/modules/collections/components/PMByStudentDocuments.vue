<template>
    <AppLoading v-if="loading"></AppLoading>

    <div v-else>
        <AppEmptyResponse 
            v-if="!convocationEnrolDocuments.length && !convocationEnrolAttachments.length" 
            :show-image="true" :subtitle="false"
        ></AppEmptyResponse>

        <div v-else class="row">
            <section class="col-3">
                <AppCard 
                    v-for="document, index in convocationEnrolDocuments" :key="index" 
                    v-bind:class="{'borde-left': currentDocument && currentDocument.id  == document.id}"
                    @click="changeCurrentDocumentOrAttachment(null, document)"
                    class="card-hover mt-1 mb-1 pointer"
                >
                    <template #body>
                        <div class="d-flex justify-content-end">
                            <span 
                                class="badge rounded-pill text-bg-primary"
                                v-bind:class="{
                                    'bg-dark': document.isAccept == null,
                                    'bg-danger': document.isAccept == 0,
                                    'bg-success': document.isAccept == 1,
                                }"
                            >
                                {{ document.isAccept == null ? 'Pendiente' : document.isAccept == 0 ? 'Rechazado' : 'Aprobado' }}
                            </span>
                        </div>

                        <p class="mb-1">{{ document.titleDocument }}</p>
                    </template>                
                </AppCard>

                <AppCard 
                    v-for="attachment, index in convocationEnrolAttachments" :key="index" 
                    v-bind:class="{'borde-left': currentAttachment && currentAttachment.id  == attachment.id}"
                    @click="changeCurrentDocumentOrAttachment(attachment)"
                    class="card-hover mt-1 mb-1 pointer"
                >
                    <template #body>
                        <div class="d-flex justify-content-end">
                            <span 
                                class="badge rounded-pill text-bg-primary"
                                v-bind:class="{
                                    'bg-dark': attachment.isAccept == null,
                                    'bg-danger': attachment.isAccept == 0,
                                    'bg-success': attachment.isAccept == 1,
                                }"
                            >
                                {{ attachment.isAccept == null ? 'Pendiente' : attachment.isAccept == 0 ? 'Rechazado' : 'Aprobado' }}
                            </span>
                        </div>
                        
                        <p class="mb-1">{{ attachment.titleRequirement }}</p>
                    </template>
                </AppCard>
            </section>

            <section class="col-9">
                <iframe 
                    v-if="currentAttachment && currentAttachment.urlAttachment"
                    style="width: 100%; height: 61rem; border: 0"
                    :src="currentAttachment.urlAttachment" 
                    allowfullscreen
                ></iframe>

                <iframe 
                    v-else-if="currentDocument && (currentDocument.urlSignedDocument || currentDocument.urlDocumentWithSigners || currentDocument.urlDocument)"
                    :src="currentDocument.urlSignedDocument ?? currentDocument.urlDocumentWithSigners ?? currentDocument.urlDocument" 
                    style="width: 100%; height: 61rem; border: 0"
                    allowfullscreen
                ></iframe>

                <AppEmptyResponse 
                    v-else :show-image="true" :subtitle="false"
                ></AppEmptyResponse>

                <hr>

                <div class="d-flex justify-content-end">
                    <AppButton
                        :disabled="!downloadUrl.value"
                        @click="downloadFile"
                        :label="'Descargar'"
                        outlined
                    ></AppButton>
                </div>
            </section>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, reactive, Ref, ref } from "vue";
import { useI18n } from 'vue-i18n';

import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from "../../../shared/components/AppLoading.vue";
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';

import { ConvocationEnrolDocumentDto, ConvocationEnrolAttachmentDto } from '../dtos/portfolioMonitoringByStudent.dto';

export default defineComponent({
    name: "PMByStudentDocuments",
    components: {
        AppEmptyResponse,
        AppLoading,
        AppButton,
        AppCard,
    },

    props: {
        convocationEnrolDocuments: {
            type: Array as PropType<ConvocationEnrolDocumentDto[]>,
            default: [],
        },
        convocationEnrolAttachments: {
            type: Array as PropType<ConvocationEnrolAttachmentDto[]>,
            default: [],
        },
    },

    setup(props) {
        const { t } = useI18n();

        const currentDocument: Ref<ConvocationEnrolDocumentDto | null> = ref(null);
        const currentAttachment: Ref<ConvocationEnrolAttachmentDto | null> = ref(null);
        // const : Ref<string> = ref('');
        const downloadUrl: { value: string } = reactive({
            value: '',
        });

        const loading = ref(true);

        onMounted(async () => {
            try {
                if (props.convocationEnrolDocuments.length) {
                    currentDocument.value = props.convocationEnrolDocuments[0];
                } else if (props.convocationEnrolAttachments.length) {
                    currentAttachment.value = props.convocationEnrolAttachments[0];
                }
            } catch (e) {}

            loading.value = false;
        });

        const changeCurrentDocumentOrAttachment = async (
            attachment?: ConvocationEnrolAttachmentDto | null, 
            document?: ConvocationEnrolDocumentDto
        ) => {
            currentDocument.value = null;
            currentAttachment.value = null;
            downloadUrl.value = '';

            if (document) {
                currentDocument.value = document;
                downloadUrl.value = document.urlSignedDocument ?? document.urlDocumentWithSigners ?? document.urlDocument ?? '';
            } else if (attachment) {
                currentAttachment.value = attachment;
                downloadUrl.value = attachment.urlAttachment ?? '';
            }
        };

        const downloadFile = () => {
            window.open(downloadUrl.value, '_blank');
        };

        return {
            loading,
            t,

            currentAttachment,
            currentDocument,
            downloadUrl,

            changeCurrentDocumentOrAttachment,
            downloadFile,

            color: import.meta.env.VITE_COLOR_PRIMARY
        };
    },
});
</script>

<style scoped>
.pointer {
    cursor: pointer;
}

.borde-left {
    border-left-color: v-bind(color);
    border-left-width: 4px;
}
</style>