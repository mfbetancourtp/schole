<template>
  <AppBaseList :title="t('Editor de Plantilla')" isCard>
    <template #actions>
      <AppButtonBack :to="{ name: 'requestManagement.documentTemplates' }" />
      <AppButton class="vars-btn--mobile" outlined icon="code" :label="t('Variables')" @click="drawerOpen = true" style="color: white" />
      <AppButton style="color: white" :label="t('Guardar Plantilla')" icon="save" @click="save" />
    </template>

    <template #content>
      <AppLoading v-if="loading" />

      <div v-else class="editor-page">
        <!-- Panel izquierdo: variables (desktop) -->
        <div class="editor-page__vars-panel">
          <div class="editor-page__vars-header">
            <AppIcon icon="code" />
            <span class="editor-page__vars-title">{{ t('Variables Disponibles') }}</span>
          </div>
          <p class="editor-page__vars-hint">
            {{ t('Haz clic en una variable para insertarla en la posición del cursor.') }}
          </p>
          <div v-if="templateVars.length" class="editor-page__vars-list">
            <button v-for="v in templateVars" :key="v.id" type="button" class="editor-page__var-chip" @click="insertVariable(v)">
              <span class="editor-page__var-label">{{ toPlaceholder(v.label) }}</span>
              <span class="editor-page__var-code">{{ v.code }}</span>
            </button>
          </div>
          <p v-else class="editor-page__vars-empty">
            {{ t('No hay variables registradas para esta plantilla.') }}
          </p>
        </div>

        <!-- Editor principal -->
        <div class="editor-page__editor">
          <AppEditorDocument v-model="contentsHtml" :upload-url="`${services.structure}/document-templates/upload-image`" @editorRef="onEditorReady" />
        </div>
      </div>

      <!-- Drawer de variables (mobile) -->
      <AppDrawer v-model:isVisible="drawerOpen" size="sm">
        <template #head>
          <AppDrawerHeader icon="code" :title="t('Variables Disponibles')" />
        </template>
        <template #body>
          <div class="vars-drawer__body">
            <p class="vars-drawer__hint">
              {{ t('Haz clic en una variable para insertarla en la posición del cursor.') }}
            </p>
            <div v-if="templateVars.length" class="vars-drawer__list">
              <button
                v-for="v in templateVars"
                :key="v.id"
                type="button"
                class="editor-page__var-chip"
                @click="
                  insertVariable(v);
                  drawerOpen = false;
                "
              >
                <span class="editor-page__var-label">{{ toPlaceholder(v.label) }}</span>
                <span class="editor-page__var-code">{{ v.code }}</span>
              </button>
            </div>
            <p v-else class="editor-page__vars-empty">
              {{ t('No hay variables registradas para esta plantilla.') }}
            </p>
          </div>
        </template>
      </AppDrawer>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useRoute } from 'vue-router';
import { useHeaderStore } from '../../../stores/header.store';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppEditorDocument from '../../../shared/components/Editor/AppEditorDocument.vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppDrawerHeader from '../../../shared/components/AppDrawerHeader.vue';

import { services } from '../../../shared/constant/services';
import { GetDocumentTemplateByIdService } from '../services/getDocumentTemplateById.service';
import { GetDocumentTemplatesVarsService } from '../services/getDocumentTemplatesVars.service';
import { CreateOrUpdateDocumentTemplateService } from '../services/createOrUpdateDocumentTemplate.service';
import type { DocumentTemplateDto, DocumentTemplateVarDto } from '../dtos/documentTemplates.dto';

const getDocumentTemplateByIdService = new GetDocumentTemplateByIdService();
const getDocumentTemplatesVarsService = new GetDocumentTemplatesVarsService();
const createOrUpdateDocumentTemplateService = new CreateOrUpdateDocumentTemplateService();

export default defineComponent({
  name: 'DocumentTemplateEditor',
  components: {
    AppBaseList,
    AppButton,
    AppButtonBack,
    AppLoading,
    AppIcon,
    AppEditorDocument,
    AppDrawer,
    AppDrawerHeader,
  },
  setup() {
    const { t } = useI18n();
    const route = useRoute();
    useMeta({ title: 'Editor de Plantilla' });

    const headerStore = useHeaderStore();
    headerStore.module = { name: 'Gestión de Solicitudes', url: '' };
    headerStore.moduleItem = {
      name: 'Plantillas de Documentos',
      url: 'requestManagement.documentTemplates',
    };
    headerStore.moduleSubItem = { name: 'Editor de Plantilla', url: '' };

    const loading = ref(true);
    const template = ref<DocumentTemplateDto | null>(null);
    const templateVars = ref<DocumentTemplateVarDto[]>([]);
    const contentsHtml = ref('');
    const editorInstance = ref<any>(null);
    const drawerOpen = ref(false);

    onMounted(async () => {
      const id = Number(route.params.id);
      try {
        const [tpl, vars] = await Promise.all([getDocumentTemplateByIdService.run(id), getDocumentTemplatesVarsService.run({ documentTemplateId: id })]);
        template.value = tpl;
        contentsHtml.value = tpl.contentsHtml ?? '';
        templateVars.value = vars;
      } catch (e) {
        console.error(e);
      } finally {
        loading.value = false;
      }
    });

    const onEditorReady = (editor: any) => {
      editorInstance.value = editor;
    };

    const insertVariable = (v: DocumentTemplateVarDto) => {
      if (!editorInstance.value) return;
      const placeholder = toPlaceholder(v.label);
      const viewFragment = editorInstance.value.data.processor.toView(placeholder);
      const modelFragment = editorInstance.value.data.toModel(viewFragment);
      editorInstance.value.model.insertContent(modelFragment);
    };

    const toPlaceholder = (label: string) => '{' + '{' + label + '}' + '}';

    const save = async () => {
      if (!template.value) return;
      try {
        await createOrUpdateDocumentTemplateService.run(
          {
            code: template.value.code,
            name: template.value.name,
            documentTemplatesTypeId: template.value.documentTemplatesTypeId,
            contentsHtml: contentsHtml.value,
            status: template.value.status,
          },
          template.value.id
        );
      } catch (e) {
        console.error(e);
      }
    };

    return {
      t,
      services,
      loading,
      templateVars,
      contentsHtml,
      drawerOpen,
      toPlaceholder,
      insertVariable,
      onEditorReady,
      save,
    };
  },
});
</script>

<style scoped>
.editor-page {
  display: flex;
  gap: 20px;
  height: calc(100vh - 140px);
  min-height: 500px;
}

/* ─── Panel variables (desktop) ─── */
.editor-page__vars-panel {
  width: 260px;
  min-width: 260px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

.editor-page__vars-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #212b36;
}

.editor-page__vars-title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.editor-page__vars-hint {
  font-size: 12px;
  color: #919eab;
  margin: 0;
}

.editor-page__vars-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.editor-page__var-chip {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s, border-color 0.15s;
}

.editor-page__var-chip:hover {
  background: #f0ecff;
  border-color: #c4b5fd;
}

.editor-page__var-label {
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  font-weight: 600;
  color: #7c3aed;
}

.editor-page__var-code {
  font-size: 11px;
  color: #919eab;
}

.editor-page__vars-empty {
  font-size: 13px;
  color: #919eab;
  margin: 0;
}

/* ─── Botón Variables (solo mobile) ─── */
.vars-btn--mobile {
  display: none;
}

/* ─── Editor ─── */
.editor-page__editor {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.editor-page__editor :deep(.document-editor) {
  flex: 1 !important;
  max-height: none !important;
  height: 100% !important;
  max-width: 100%;
  min-width: 0;
}

.editor-page__editor :deep(.document-editor__editable-container) {
  flex: 1 !important;
  min-height: 0 !important;
  overflow-y: auto !important;
}

.editor-page__editor :deep(.document-editor__editable-container .ck-editor__editable) {
  min-height: 100% !important;
}

.editor-page__editor :deep(.document-editor__editable-container::-webkit-scrollbar) {
  width: 6px;
}

.editor-page__editor :deep(.document-editor__editable-container::-webkit-scrollbar-track) {
  background: transparent;
}

.editor-page__editor :deep(.document-editor__editable-container::-webkit-scrollbar-thumb) {
  background: #cbd5e1;
  border-radius: 3px;
}

.editor-page__editor :deep(.document-editor__editable-container::-webkit-scrollbar-thumb:hover) {
  background: #94a3b8;
}

/* ─── Drawer mobile (body) ─── */
.vars-drawer__body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vars-drawer__hint {
  font-size: 12px;
  color: #919eab;
  margin: 0;
}

.vars-drawer__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* ─── Responsive ─── */
@media (max-width: 860px) {
  .editor-page__vars-panel {
    display: none;
  }

  .vars-btn--mobile {
    display: inline-flex;
  }
}
</style>
