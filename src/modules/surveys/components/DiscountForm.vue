<template>
    <form @submit.prevent="save">
        <AppFormModal :title="title">
            <template v-slot:content>
                <AppLoading v-if="loading"></AppLoading>

                <div v-else>
                    <AppFormField :form-control="v$.form.title" :label="'Nombre'">
                        <input type="text" class="form-control" v-model="v$.form.title.$model" id="title"/>
                    </AppFormField>

                    <AppFormField :form-control="v$.form.description" :label="'Descripción'">
                        <AppVoiceInput v-model="v$.form.description.$model"
                 id="description" textareaClass="form-control"  />
                    </AppFormField>

                    <div class="form-row">
                        <AppFormField :form-control="v$.form.value" :label="'Valor'">
                            <input type="text" class="form-control" v-model="v$.form.value.$model" id="value"/>
                        </AppFormField>

                        <div class="col-6 d-flex align-items-end">
                            <AppFormField :form-control="v$.form.isPercent" :label="'Es porcentaje?'" class="form-check form-switch">
                                <input v-model="v$.form.isPercent.$model" class="form-check-input" type="checkbox">
                            </AppFormField>

                            <AppFormField :form-control="v$.form.allowEdit" :label="'Es editable?'" class="form-check form-switch">
                                <input v-model="v$.form.allowEdit.$model" class="form-check-input" type="checkbox">
                            </AppFormField>
                        </div>
                    </div>

                    <div class="form-row">
                        <AppFormField :label="'Descuento aplicable a:'">
                            <div class="d-flex gap-2">
                                <div class="form-check">
                                    <input 
                                        class="form-check-input" type="radio" name="invoiceDiscount" 
                                        id="applyInvoice" v-model="v$.form.applyInvoice.$model"
                                        :checked="v$.form.applyInvoice.$model"
                                    >
                                    <label class="form-check-label" for="applyInvoice">Factura</label>
                                </div>

                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="invoiceDiscount" 
                                        id="applyProduct" v-model="v$.form.applyProduct.$model"
                                        :checked="v$.form.applyProduct.$model"
                                    >
                                    <label class="form-check-label" for="applyProduct">Concepto a producto</label>
                                </div>
                            </div>
                        </AppFormField>

                        <div class="col-6 d-flex align-items-end">
                            <AppFormField :form-control="v$.form.requireAttachment" :label="'Requiere evidencia?'" class="form-check form-switch">
                                <input v-model="v$.form.requireAttachment.$model" class="form-check-input" type="checkbox">
                            </AppFormField>
                        </div>
                    </div>

                    <AppFormField :form-control="v$.form.descriptionAttachment" :label="'Describa al usuario que debe adjuntar como evidencia'">
                        <AppVoiceInput v-model="v$.form.descriptionAttachment.$model"
                id="descriptionAttachment" textareaClass="form-control"  />
                    </AppFormField>
                </div>
            </template>

            <template v-slot:actions>
                <AppButton>Guardar</AppButton>
            </template>
        </AppFormModal>
  </form>
</template>

<script lang="ts">
import {defineComponent, onMounted, reactive, ref, watch} from 'vue';

import {useVuelidate} from '@vuelidate/core';
import {required} from '../../../shared/plugins/vuelidate.plugin';

import AppLoading from "../../../shared/components/AppLoading.vue";
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import {GetDiscountByIdService} from '../services/getDiscountById.service';
import {CreateOrUpdateDiscountService} from '../services/createOrUpdateDiscount.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateDiscountService = new CreateOrUpdateDiscountService();
const getDiscountByIdService = new GetDiscountByIdService();

export default defineComponent({
    name: 'DiscountForm',
    components: {AppFormModal, AppButton, AppFormField, AppLoading, AppVoiceInput},

    props: ['discountId'],
    emits: ['close'],

    setup(props, {emit}) {
        const discountId = props.discountId ?? null;
        let title = !discountId ? 'Agregar descuento' : 'Editar descuento';

        const loading = ref(true);

        const form = reactive({
            title: null,
            description: '',
            value: null,
            isPercent: false,
            allowEdit: false,
            applyProduct: true,
            applyInvoice: false,
            requireAttachment: true,
            descriptionAttachment: '',
        });
        const v$ = useVuelidate({
            form: {
                title: {required},
                description: {},
                value: {required},
                isPercent: {},
                allowEdit: {},
                applyProduct: {},
                applyInvoice: {},
                requireAttachment: {},
                descriptionAttachment: {},
            },
        }, {form});

        onMounted(async () => {
            try {
                if (discountId) {
                    let discount = await getDiscountByIdService.run(discountId);

                    form.title = discount.title;
                    form.description = discount.description;
                    form.value = discount.value;
                    form.isPercent = discount.isPercent ? true : false;
                    form.allowEdit = discount.allowEdit ? true : false;
                    form.applyProduct = discount.applyProduct ? true : false;
                    form.applyInvoice = discount.applyInvoice ? true : false;
                    form.requireAttachment = discount.requireAttachment ? true : false;
                    form.descriptionAttachment = discount.descriptionAttachment ?? '';
                }
            } catch (e) {}

            loading.value = false;
        });

        watch(() => form.applyProduct, (value: any) => {
            form.applyInvoice = !value;
        });
        watch(() => form.applyInvoice, (value: any) => {
            form.applyProduct = !value;
        });

        const save = async () => {
            const formIsValid = await v$.value.$validate();
            if (!formIsValid) return;

            const dataSend = {
                title: form.title,
                description: form.description,
                value: form.value,
                isPercent: form.isPercent ? 1 : 0,
                allowEdit: form.allowEdit ? 1 : 0,
                applyProduct: form.applyProduct ? 1 : 0,
                applyInvoice: form.applyInvoice ? 1 : 0,
                requireAttachment: form.requireAttachment ? 1 : 0,
                descriptionAttachment: form.descriptionAttachment,
            };

            try {
                await createOrUpdateDiscountService.run(dataSend, discountId);
                emit('close');
            } catch (e) {}
        };

        return {
            loading,
            title,
            save,
            v$,
        };
    },
});
</script>

<style scoped>
</style>