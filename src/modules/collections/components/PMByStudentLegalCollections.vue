<template>
    <AppDatatable :service="getLegalCollectionsByMatriculateIdService" :params="{ matriculateId }" :name="name">
        <AppDatatableColumn label="Fecha envió" v-slot="{ row }" field="createdAt" :sortable="true">
            {{ dayjs(row.createdAt).format('DD/MM/YYYY') }}
        </AppDatatableColumn>
        <AppDatatableColumn label="Correo" v-slot="{ row }" field="email" :sortable="true">
            {{ row.email }}
        </AppDatatableColumn>
        <AppDatatableColumn label="Asunto" v-slot="{ row }" field="subject" :sortable="true">
            {{ row.subject }}
        </AppDatatableColumn>
        <AppDatatableColumn label="Cuotas" v-slot="{ row }" field="quotes" :sortable="true">
            <p v-for="quote, index in row.quotes.split(',')" :key="index" class="mb-0">
                {{ quote }}
            </p>
        </AppDatatableColumn>
        <AppDatatableColumn label="Valor" v-slot="{ row }" field="valuePending" :sortable="true">
            {{ n(row.valuePending, 'currency') }}
        </AppDatatableColumn>
        <AppDatatableColumn label="Documentos" v-slot="{ row }" field="documents" :sortable="true">
            <p v-for="document, index in row.documents.split(',')" :key="index" class="mb-0">
                {{ document }}
            </p>
        </AppDatatableColumn>
    </AppDatatable>

    <div class="d-flex justify-content-end">
        <AppButton
            :label="'Enviar mensaje'"
            class="text-white"
            :to="{
                name: 'collections.sendMessageOrToLegalCollections',
                params: { matriculateId: matriculateId, goTo: 'send-message' },
            }"
        ></AppButton>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';

import { GetLegalCollectionsByMatriculateIdService } from "../services/getLegalCollectionsByMatriculateId.service";

export default defineComponent({
    name: "PMByStudentLegalCollections",
    components: {
        AppDatatableColumn,
        AppDatatable,
        AppButton,
    },

    props: {
        matriculateId: {
            type: Number,
            required: true,
        },
    },

    setup(props) {
        const { t, n } = useI18n();

        const getLegalCollectionsByMatriculateIdService = new GetLegalCollectionsByMatriculateIdService();
        const name = 'PMByStudentLegalCollections';

        return {
            getLegalCollectionsByMatriculateIdService,
            name,
            t,
            n,

            dayjs,
        };
    },
});
</script>

<style scoped>
</style>