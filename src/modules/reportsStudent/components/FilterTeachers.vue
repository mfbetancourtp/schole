<template>
  <AppFormField :form-control="v$.form.teacherId" label="core.generalTerms.academic.teacher.singular">
    <v-select
        :placeholder="`${t('core.remoteSelect.start')} 2 ${t('core.remoteSelect.end')}`"
        v-model="v$.form.teacherId.$model"
        :reduce="(teacher) => teacher.id"
        :options="teachers.value"
        @search="searchTeacher"
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

import {GetTeachersSelectService} from '../../administration/services/getTeachersSelect.service';

const getTeachersSelectService = new GetTeachersSelectService();

export default defineComponent({
    name: 'FilterTeachers',
    components: {AppAutocomplete, AppFormField},
    props: {
        v$: {
            type: Object,
            required: true,
        },
    },

    setup() {
        const {t} = useI18n();

        const teachers: { value: any[] } = reactive({
            value: [],
        });

        const searchTeacher = debounce(async (search: string, loading: Function) => {
            if (search) {
                loading(true);

                if (search.length >= 2) {
                    teachers.value = [];
                    const response = await getTeachersSelectService.run({search: search});

                    response.data.forEach((user: any) => {
                        teachers.value.push({
                        ...user,
                        name: user.people.names + ' ' + user.people.lastnames,
                        });
                    });
                } else {
                    teachers.value = [];
                }

                loading(false);
            }
        }, 800);

        return {
            t,
            teachers,
            searchTeacher,
        };
    },
});
</script>

<style scoped>
</style>