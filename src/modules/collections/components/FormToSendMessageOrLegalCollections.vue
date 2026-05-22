<template>
  <AppBaseList :title="title" :routes="routes">
    <template v-slot:actions>
      <AppButtonBack
        :to="{
          name: 'collections.portfolioMonitoringByStudent',
          params: { matriculateId: matriculateId },
        }"
      ></AppButtonBack>

      <AppButton :label="'core.save'" @click="save()"></AppButton>
    </template>

    <template v-slot:content>
      <AppCard v-if="!loading">
        <template #body>
          <div class="form-row">
            <AppFormField :form-control="v$.form.email" label="Correo">
              <input class="form-control" type="text" id="email" v-model="v$.form.email.$model" />
            </AppFormField>

            <AppFormField :form-control="v$.form.subject" label="Asunto">
              <input
                class="form-control"
                type="text"
                id="subject"
                v-model="v$.form.subject.$model"
                pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
              />
            </AppFormField>
          </div>

          <div class="form-row">
            <AppFormField :form-control="v$.form.convocationEnrolDocumentIds" label="Adjuntar Documentos">
              <AppAutocomplete
                v-model="v$.form.convocationEnrolDocumentIds.$model"
                :options="documents"
                :input-id="'convocationEnrolDocumentIds'"
                :label="'titleDocument'"
                :multiple="true"
              ></AppAutocomplete>
            </AppFormField>

            <AppFormField :form-control="v$.form.convocationEnrolAttachmentIds" label="Adjuntar Requisitos">
              <AppAutocomplete
                v-model="v$.form.convocationEnrolAttachmentIds.$model"
                :options="attachments"
                :input-id="'convocationEnrolAttachmentIds'"
                :label="'titleRequirement'"
                :multiple="true"
              ></AppAutocomplete>
            </AppFormField>
          </div>

          <AppFormField :form-control="v$.form.message" label="Mensaje">
            <AppEditorDocument v-model="v$.form.message.$model" @editorRef="getEditorRef"></AppEditorDocument>
          </AppFormField>
        </template>
      </AppCard>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, onMounted, PropType, reactive, Ref, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { useRouter } from 'vue-router';

import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppEditorDocument from '../../../shared/components/Editor/AppEditorDocument.vue';

import { ConvocationEnrolDocumentDto } from '../dtos/portfolioMonitoringByStudent.dto';
import { ConvocationEnrolAttachmentDto } from '../dtos/portfolioMonitoringByStudent.dto';
import { PortfolioMonitoringByStudentDto } from '../dtos/portfolioMonitoringByStudent.dto';

import { PostLegalCollectionsService } from '../services/postLegalCollections.service';

const postLegalCollectionsService = new PostLegalCollectionsService();

export default defineComponent({
  name: 'FormToSendMessageOrLegalCollections',
  components: {
    AppEditorDocument,
    AppAutocomplete,
    AppButtonBack,
    AppFormField,
    AppBaseList,
    AppButton,
    AppCard,
  },

  props: {
    title: {
      type: String,
      required: true,
    },
    routes: {
      type: Object as PropType<any[]>,
      required: true,
    },
    matriculateId: {
      type: Number,
      required: true,
    },
    relatedData: {
      type: Object as PropType<PortfolioMonitoringByStudentDto>,
      required: true,
    },
    quotesIds: {
      type: Object as PropType<number[]>,
      required: true,
    },
  },

  setup(props) {
    const router = useRouter();

    const attachments: Ref<ConvocationEnrolAttachmentDto[]> = ref([]);
    const documents: Ref<ConvocationEnrolDocumentDto[]> = ref([]);

    const editorRef: any = ref(null);
    const loading = ref(true);

    const getEditorRef = (editor: any) => {
      editorRef.value = editor;
    };

    const form = reactive({
      debtorUserId: props.relatedData.student.userId,
      email: '',
      subject: '',
      message: '',
      convocationEnrolDocumentIds: [],
      convocationEnrolAttachmentIds: [],
      quotesIds: props.quotesIds as number[],
    });
    const v$ = useVuelidate(
      {
        form: {
          debtorUserId: { required },
          email: { required },
          subject: { required },
          message: { required },
          quotesIds: {},
          convocationEnrolDocumentIds: {},
          convocationEnrolAttachmentIds: {},
        },
      },
      { form }
    );

    onMounted(async () => {
      try {
        attachments.value = props.relatedData.convocationEnrolAttachments.filter((attachment) => attachment.isAccept == 1);
        documents.value = props.relatedData.convocationEnrolDocuments.filter((document) => document.isAccept == 1);
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        await postLegalCollectionsService.run(form);

        await router.push({
          name: 'collections.portfolioMonitoringByStudent',
          params: { matriculateId: props.matriculateId },
        });
      } catch (e) {
        console.log(e);
      }
    };

    return {
      save,
      v$,

      attachments,
      documents,
      loading,

      getEditorRef,
    };
  },
});
</script>

<style scoped></style>
