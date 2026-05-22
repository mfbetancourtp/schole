<template>
        <AppFormModal :title="title">
            <template v-slot:content>
                <p>Los datos serán reemplazados.</p>
            </template>

            <template v-slot:actions>
                <AppButton
                    variant="primary"
                    @click="save()"
                    label="Aceptar"
                ></AppButton>
            </template>
        </AppFormModal>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';

export default defineComponent({
    name: 'ModalDataChangeWarning',
    components: {AppFormModal, AppButton},

    props: ['data'],
    emits: ['close'],

    setup(props, {emit}) {
        let title = 'Advertencia';

        const save = () => {
            emit('close');
        };

        return {
            title,
            save,
        };
    },
});
</script>

<style scoped>
</style>