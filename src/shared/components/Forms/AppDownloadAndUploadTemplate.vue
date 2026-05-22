<template>
    <AppLoading v-if="loading"></AppLoading>

    <section v-else>
        <div class="mb-2 d-flex align-items-center gap-3">
            <span>Paso 1: Descargar Plantilla</span>

            <AppButton :href="urlTemplate" :label="'Descargar'"></AppButton>
        </div>

        <div class="d-flex align-items-center gap-3">
            <span>Paso 2: Subir Plantilla</span>
            
            <div class="col-5">
                <AppUploadFile @update:modelValue="uploadTemplate"></AppUploadFile>
            </div>
        </div>
    </section>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { useI18n } from 'vue-i18n';

import AppLoading from '../AppLoading.vue'
import AppUploadFile from './AppUploadFile.vue';
import AppButton from '../Buttons/AppButton.vue';

export default defineComponent({
    name: "AppDownloadAndUploadTemplate",
    components: {
        AppUploadFile,
        AppLoading,
        AppButton,
    },

    emits: ['responseObject'],
    props: {
        templateGenerationService: {
            type: Object,
            required: true,
        },
        importTemplateService: {
            type: Object,
            required: true,
        },
        templateGenerationParams: {
      type: Object,
      default: () => ({}),
    },
    importTemplateParams: {
      type: Object,
      default: () => ({}),
    },
    },

    setup(props, {emit}) {
        const { t } = useI18n();
        const templateGenerationParamsPage = ref(props.templateGenerationParams);
    const importTemplateServicePage = ref(props.importTemplateService);
    const importTemplateParamsPage = ref(props.importTemplateParams);

        const urlTemplate = ref();

        const loading = ref(true);

        onMounted(async () => {
            loading.value = true;

            try {
                let res = await  props.templateGenerationService.value.run(templateGenerationParamsPage.value);
                urlTemplate.value = res.file;
            } catch (e) {console.log(e)}

            loading.value = false;
        });

        const uploadTemplate = async (file: any) => {
            loading.value = true;

            let dataSend = { files: file };

            try {
                let res: any = await importTemplateServicePage.run(dataSend, importTemplateParamsPage);
                emit('responseObject', res);
            } catch (e) {
                console.log('error',e);
                
            }

            loading.value = false;
        }

        return {
            urlTemplate,
            loading,
            t,

            uploadTemplate,
        };
    },
});
</script>

<style scoped>
</style>