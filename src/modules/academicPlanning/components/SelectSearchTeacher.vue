<template>
    <div v-if="loading"></div>
    
    <AppAutocomplete
        v-else
        v-model="data[keyVModel]"
        :reduce="(d) => d.people.id"
        :options="teachers.value"
        @search="searchTeacher"
    ></AppAutocomplete>
</template>

<script lang="ts">
import { debounce } from "ts-debounce";
import {defineComponent, onMounted, reactive, ref} from "vue";

import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { GetTeachersSelectService } from "../services/getTeachersSelect.service";

const getTeachersSelectService = new GetTeachersSelectService();

export default defineComponent({
    name: "SelectSearchTeacher",
    components: {AppAutocomplete},
    props: {
        data: {
            type: Object,
            required: true,
        },
        keyVModel: {
            type: String,
            required: true,
        },
        keyName: {
            type: String,
            required: false,
        },
    },

    setup(props) {
        const teachers: { value: any[] } = reactive({
            value: [],
        });

        const loading = ref(true);

        onMounted(async () => {
            try {
                if (props.data[props.keyName]) {
                    let director: string = props.data[props.keyName];
                    const response = await getTeachersSelectService.run({search: director});

                    response.data.forEach((teacher: any) => {
                        teachers.value.push({
                            ...teacher,
                            name: teacher.people.names + ' ' + teacher.people.lastnames,
                        });
                    });
                }

            } catch (e) {}

            loading.value = false;
        });

        const searchTeacher = debounce(async (search: string, loading: Function) => {
            if (search) {
                loading(true);

                if (search.length >= 2) {
                    teachers.value = [];
                    const response = await getTeachersSelectService.run({search: search});

                    response.data.forEach((teacher: any) => {
                        teachers.value.push({
                            ...teacher,
                            name: teacher.people.names + ' ' + teacher.people.lastnames,
                        });
                    });
                } else {
                    teachers.value = [];
                }

                loading(false);
            }
        }, 800);

        return {
            teachers,
            loading,

            searchTeacher,
        };
    },
});
</script>

<style scoped>
</style>