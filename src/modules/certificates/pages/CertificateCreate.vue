<template>
  <AppBaseList :title="title" :subtitle="subtitle" :content-padding="false" isCard>
    <template #actions>
      <AppButtonBack :to="{ name: 'certificates.certificatesList' }" />
      <AppButton @click="save" variant="light" label="Guardar" :loading="saving" />
    </template>

    <template v-slot:content>
      <div class="certificate-editor-container">
        <CertificateEditor :template-id="templateId || undefined" @export="exportCertificate" :isSaving="saving" @save="saveCertificate" />
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { ToastService } from '../../../shared/services/toast.service';

// Componentes
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import CertificateEditor from '../components/CertificateEditor.vue';
import { CreateOrUpdateCertificatesService } from '../services/createOrUpdateCertificates.service';
import { CreateFilesUploadService } from '../services/createFilesUpload.service';
import { useCertificateEditorStore } from '../../../stores/certificateEditor.store';
import { useHeaderStore } from '../../../stores/header.store';

const createOrUpdateCertificatesService = new CreateOrUpdateCertificatesService();
const createFilesUploadService = new CreateFilesUploadService();
export default defineComponent({
  name: 'CertificateCreate',
  components: {
    AppButton,
    AppButtonBack,
    AppBaseList,
    CertificateEditor,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const toastService = new ToastService();
    const { t } = useI18n();
    const editorStore = useCertificateEditorStore();

    const title = computed(() => (isEditing.value ? 'Editar Certificado' : 'Crear Certificado'));
    const subtitle = computed(() => (isEditing.value ? 'Modifica tu certificado existente' : 'Diseña un nuevo certificado personalizado'));
    useMeta({ title: t('certificates.create.title') });

    // Estado reactivo
    const saving = ref(false);
    const isEditing = ref(false);
    const templateId = computed(() => (route.params.id as string) || null);

    // Métodos
    const goBack = () => {
      router.push({ name: 'certificates-index' });
    };

    const save = async () => {
      saving.value = true;
      try {
        // JSON
        const json = JSON.stringify(editorStore.exportToJSON(), null, 2);
        const blobJson = new Blob([json], { type: 'application/json' });
        const file = new File([blobJson], 'plantilla.json', {
          type: 'application/json',
        });

        // HTML
        const html = await editorStore.exportToHTMLFromJSON();
        const blobHtml = new Blob([html], { type: 'text/html' });
        const fileHtml = new File([blobHtml], 'plantilla.html', {
          type: 'text/html',
        });

        const responseJson = await createFilesUploadService.run({
          file: file,
        });
        const responseHtml = await createFilesUploadService.run({
          file: fileHtml,
        });
        const dataSend = {
          name: editorStore.currentTemplate?.name?.trim() || 'Plantilla nueva',
          typeDocumentId: 5,
          body: null,
          header: null,
          footer: null,
          urlJsonTemplate: responseJson.data.url,
          urlHtmlTemplate: responseHtml.data.url,
          marginTop: null,
          marginBottom: null,
          marginLeft: null,
          marginRight: null,
          backgroundImage: null,
        };

        await createOrUpdateCertificatesService.run(dataSend, Number(templateId.value));
        editorStore.clearTemplate();
        router.push({
          name: 'certificates.certificatesList',
        });
      } catch (error) {
        toastService.show('Error al guardar el borrador', 'error');
      } finally {
        saving.value = false;
      }
    };

    const exportCertificate = async () => {
      try {
        toastService.show('Exportando certificado...', 'info');
        // TODO: Implementar exportación con html-to-image
        // const certificateElement = document.querySelector('.certificate-canvas');
        // if (certificateElement) {
        //   const dataUrl = await htmlToImage.toPng(certificateElement);
        //   // Descargar imagen
        //   const link = document.createElement('a');
        //   link.download = 'certificado.png';
        //   link.href = dataUrl;
        //   link.click();
        // }
        toastService.show('Funcionalidad de exportación en desarrollo');
      } catch (error) {
        toastService.show('Error al exportar el certificado', 'error');
      }
    };

    const saveCertificate = async () => {
      saving.value = true;
      try {
        // TODO: Implementar guardado de la plantilla
        await new Promise((resolve) => setTimeout(resolve, 1000));
        toastService.show('Plantilla guardada exitosamente');
      } catch (error) {
        toastService.show('Error al guardar la plantilla', 'error');
      } finally {
        saving.value = false;
      }
    };

    // Lifecycle
    onMounted(() => {
      isEditing.value = !!route.params.id;
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Grados y títulos', url: '' };
      headerStorage.moduleItem = { name: 'Editar Certificado', url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
    });

    return {
      title,
      subtitle,
      saving,
      isEditing,
      templateId,
      goBack,
      save,
      exportCertificate,
      saveCertificate,
    };
  },
});
</script>

<style scoped>
.certificate-editor-container {
  height: calc(100vh - 143px);
  width: 100%;
  overflow: hidden;
}

/* Responsive */
@media (max-width: 768px) {
  .certificate-editor-container {
    height: calc(100vh - 120px);
  }
}
</style>
