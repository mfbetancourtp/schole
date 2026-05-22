<template>
  <AppFormModal :title="t('Vista Previa del Documento')" @cancel="$emit('close')">
    <template #content>
      <iframe ref="iframeRef" :srcdoc="srcdoc" class="tpl-preview__iframe" title="Vista previa del documento" @load="resizeIframe" />
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, computed, ref, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import type { DocumentTemplateVarDto } from '../dtos/documentTemplates.dto';

export default defineComponent({
  name: 'TemplatePreviewModal',
  components: { AppFormModal },
  props: {
    templateName: { type: String, default: '' },
    documentType: { type: String, default: '' },
    content: { type: String, default: '' },
    vars: {
      type: Array as PropType<DocumentTemplateVarDto[]>,
      default: () => [],
    },
  },
  emits: ['close'],
  setup(props) {
    const { t } = useI18n();
    const iframeRef = ref<HTMLIFrameElement | null>(null);

    const srcdoc = computed(() => {
      let html = props.content;
      for (const v of props.vars) {
        html = html.replace(new RegExp(`\\{\\{${v.label}\\}\\}`, 'g'), v.value ?? `{{${v.label}}}`);
      }

      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 14px;
    line-height: 1.7;
    color: #454f5b;
    padding: 24px 28px;
    margin: 0;
  }

  /* Imágenes */
  figure.image {
    display: table;
    clear: both;
    text-align: center;
    margin: 0.9em auto;
  }
  figure.image img {
    display: block;
    margin: 0 auto;
    max-width: 100%;
    min-width: 50px;
    height: auto;
  }
  figure.image.image-style-align-center { margin-left: auto; margin-right: auto; }
  figure.image.image-style-align-left   { float: left;  margin-right: 1.5em; margin-left: 0; }
  figure.image.image-style-align-right  { float: right; margin-left: 1.5em; margin-right: 0; }
  figure.image_resized img { width: 100%; }

  /* Tablas */
  .table { margin: 1em auto; }
  .table table {
    border-collapse: collapse;
    border: 1px double #b3b3b3;
    width: 100%;
  }
  .table table td,
  .table table th {
    min-width: 2em;
    padding: 0.4em;
    border: 1px solid #bfbfbf;
  }
  .table table th { font-weight: bold; background: rgba(0,0,0,0.05); }

  /* Blockquote */
  blockquote {
    border-left: 5px solid #ccc;
    margin: 1.5em 0;
    padding: 0.5em 1.5em;
    font-style: italic;
  }

  /* Headings */
  h1, h2, h3, h4, h5, h6 { color: #212b36; line-height: 1.3; }

  /* Listas */
  ul, ol { padding-left: 2em; }

  /* Código */
  code {
    background: rgba(0,0,0,0.05);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-size: 0.9em;
  }
  pre {
    background: rgba(0,0,0,0.05);
    border: 1px solid rgba(0,0,0,0.1);
    border-radius: 3px;
    padding: 1em;
    overflow: auto;
  }

  /* Alineación de texto */
  .text-align-center  { text-align: center; }
  .text-align-right   { text-align: right; }
  .text-align-justify { text-align: justify; }
</style>
</head>
<body>${html}</body>
</html>`;
    });

    const resizeIframe = () => {
      const iframe = iframeRef.value;
      if (!iframe?.contentDocument?.body) return;
      iframe.style.height = iframe.contentDocument.body.scrollHeight + 'px';
    };

    return { t, srcdoc, iframeRef, resizeIframe };
  },
});
</script>

<style scoped>
.tpl-preview__iframe {
  width: 100%;
  border: none;
  display: block;
}
</style>
