<template>
    <form @submit.prevent="save">
        <AppFormModal :title="title">
            <template v-slot:content>
                <AppLoading v-if="loading"></AppLoading>

                <div v-else>
                    <div class="form-row">
                        <AppFormField :form-control="v$.form.title" :label="'Descripción'">
                            <input id="title" type="text" class="form-control" v-model="v$.form.title.$model">
                        </AppFormField>

                        <AppFormField :form-control="v$.form.unitValue" :label="'Valor'">
                            <input type="number" class="form-control" v-model="v$.form.unitValue.$model">
                        </AppFormField>
                    </div>

                    <AppFormField :form-control="v$.form.degreeIds" :label="'Aplica para los grados'">
                        <AppAutocomplete
                            v-model="v$.form.degreeIds.$model"
                            :options="degrees"
                            :multiple="true"
                        ></AppAutocomplete>
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
import {defineComponent, onMounted, reactive, ref} from 'vue';

import {useVuelidate} from '@vuelidate/core';
import {required} from '../../../shared/plugins/vuelidate.plugin';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import {GetDegreesForPricesService} from '../services/getDegreesForPrices.service';
import {CreateOrUpdatePriceToProductService} from '../services/createOrUpdatePriceToProduct.service';

const createOrUpdatePriceToProductService = new CreateOrUpdatePriceToProductService();
const getDegreesForPricesService = new GetDegreesForPricesService();

export default defineComponent({
    name: 'PriceForm',
    components: {AppFormModal, AppButton, AppFormField, AppAutocomplete, AppLoading},

    props: ['data', 'productId'],
    emits: ['close'],

    setup(props, {emit}) {
        const data = props.data;
        const productId = props.productId;
        let title = !data?.id ? 'Agregar precio' : 'Editar precio';

        const loading = ref(true);
        const degrees = ref();

        const form = reactive({
            productId: productId,
            title: data?.title ?? null,
            unitValue: data?.unitValue ?? null,
            degreeIds: [] as any,
        });
        const v$ = useVuelidate({
            form: {
                productId: {required},
                title: {required},
                unitValue: {required},
                degreeIds: {required},
            },
        }, {form});

        onMounted(async () => {
            try {
                degrees.value = await getDegreesForPricesService.run();

                let ids = data?.degreeIds ? data?.degreeIds.split(',') : [];

                ids.forEach((id: any) => {
                    let ide = parseInt(id);
                    form.degreeIds.push(ide);
                });
            } catch (e) {}

            loading.value = false;
        });

        const save = async () => {
            const formIsValid = await v$.value.$validate();
            if (!formIsValid) return;

            try {
                const dataSend = {
                    productId: form.productId,
                    title: form.title,
                    unitValue: form.unitValue,
                    degreeIds: form.degreeIds.toString(),
                }

                await createOrUpdatePriceToProductService.run(dataSend, data?.id);
                emit('close');
            } catch (e) {}
        };

        return {
            degrees,
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