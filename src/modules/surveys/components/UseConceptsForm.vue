<template>
    <form @submit.prevent="save">
        <AppFormModal :title="title">
            <template #content>
                <AppFormField :form-control="v$.form.productIds" :label="'Conceptos'">

                    <AppAutocomplete
                        v-model="v$.form.productIds.$model"
                        :label="'title'"
                        :options="conceptsAndDiscounts.products"
                        :multiple="true"
                    ></AppAutocomplete>
                </AppFormField>

                <AppFormField :form-control="v$.form.discountIds" :label="'Descuentos'">

                    <AppAutocomplete
                        v-model="v$.form.discountIds.$model"
                        :label="'title'"
                        :options="conceptsAndDiscounts.discounts"
                        :multiple="true"
                    ></AppAutocomplete>
                </AppFormField>
            </template>

            <template #actions>
                <AppButton>
                {{ t('core.save') }}
                </AppButton>
            </template>
        </AppFormModal>
    </form>
</template>
  
<script lang="ts">
import {defineComponent, reactive} from 'vue';
import {useVuelidate} from '@vuelidate/core';
import {useI18n} from 'vue-i18n';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import {ConceptsAndDiscountsDto} from '../dtos/conceptsAndDiscounts.dto';

import {AddconceptsAndDiscountsInDocumentEditService} from '../services/addconceptsAndDiscountsInDocumentEdit.service';

const addconceptsAndDiscountsInDocumentEditService = new AddconceptsAndDiscountsInDocumentEditService();

export default defineComponent({
    name: 'UseConceptsForm',
    components: {AppButton, AppFormField, AppFormModal, AppAutocomplete},

    props: ['document', 'conceptsAndDiscounts'],
    emits: ['close'],

    setup(props, {emit}) {
        const title = 'Seleccione los formularios';
        const conceptsAndDiscounts: ConceptsAndDiscountsDto = props.conceptsAndDiscounts;
        const {t} = useI18n();

        const defaultProductIds: any = [];
        const defaultDiscountIds: any = [];

        conceptsAndDiscounts.products.forEach((f: any) => {
            if (f.checked) {
                defaultProductIds.push(f.id);
            }
        });
        conceptsAndDiscounts.discounts.forEach((f: any) => {
            if (f.checked) {
                defaultDiscountIds.push(f.id);
            }
        });

        const form: any = reactive({
            productIds: defaultProductIds,
            discountIds: defaultDiscountIds,
        });

        const v$ = useVuelidate({
            form: {
                productIds: {},
                discountIds: {},
            },
        }, {form});

        const save = async () => {
            const isValid = await v$.value.$validate();
            if (!isValid) return;

            try {
                await addconceptsAndDiscountsInDocumentEditService.run({
                    documentId: props.document.id,
                    ...form,
                });

                emit('close');
            } catch (e) {}
        };

        return {
            title,
            v$,
            t,

            conceptsAndDiscounts,

            save,
        };
    },
});
</script>

<style scoped>

</style>