<template>
    <AppFormField :form-control="v$.form.roles" label="access.roles.title">
        <AppAutocomplete 
            input-id="roles" :options="roles"
            v-model="v$.form.roles.$model"
            multiple
        ></AppAutocomplete>
    </AppFormField>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue';

import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

export default defineComponent({
    name: 'FilterRoles',
    components: {AppAutocomplete, AppFormField},
    props: {
        v$: {
            type: Object,
            required: true,
        },
        roles: {
            type: Array as PropType<any[]>,
            required: true,
        },
    },
});
</script>

<style scoped>
</style>