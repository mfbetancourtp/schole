<template>
  <AppFormField :form-control="v$.form.userId" label="core.generalTerms.academic.student.singular">
    <v-select
        :placeholder="`${t('core.remoteSelect.start')} 2 ${t('core.remoteSelect.end')}`"
        v-model="v$.form.userId.$model"
        :reduce="(user) => user.id"
        :options="users.value"
        @search="searchUser"
        class="bg-white"
        label="name"
    ></v-select>
  </AppFormField>
</template>

<script lang="ts">
import {useI18n} from 'vue-i18n';
import {debounce} from 'ts-debounce';
import {defineComponent, reactive} from 'vue';

import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import {GetStudentsForSelectService} from '../../disciplinaryControl/services/getStudentsForSelect.service';

const getUsersForSelectService = new GetStudentsForSelectService();

export default defineComponent({
    name: 'FilterStudents',
    components: {AppAutocomplete, AppFormField},
    props: {
        v$: {
            type: Object,
            required: true,
        },
    },

    setup() {
        const {t} = useI18n();

        const users: { value: any[] } = reactive({
            value: [],
        });

        const searchUser = debounce(async (search: string, loading: Function) => {
            if (search) {
                loading(true);

                if (search.length >= 2) {
                    users.value = [];
                    const response = await getUsersForSelectService.run({search: search});

                    response.data.forEach((user: any) => {
                        users.value.push({
                        ...user,
                        name: user.people.names + ' ' + user.people.lastnames,
                        });
                    });
                } else {
                    users.value = [];
                }

                loading(false);
            }
        }, 800);

        return {
            t,
            users,
            searchUser,
        };
    },
});
</script>

<style scoped>
</style>