<template>
  <template v-if="!loading">
    <AppAutocomplete v-model="value" :options="users" @search="searchData" />
  </template>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, Ref, ref, watch } from 'vue';
import { debounce } from 'ts-debounce';

import AppAutocomplete from './AppAutocomplete.vue';

import { GetStudentsForSelectByDisciplinaryControlService } from '../../services/getStudentsForSelectByDisciplinaryControl.service';

const getStudentsForSelectByDisciplinaryControlService =
  new GetStudentsForSelectByDisciplinaryControlService();

export default defineComponent({
  name: 'AppSearchStudents',
  components: { AppAutocomplete },

  props: {
    extraParams: {
      type: Object,
      default: () => ({}),
    },
    modelValue: {
      type: Number as PropType<number | null>,
    },
  },
  emits: ['userData', 'update:modelValue'],

  setup(props, { emit }) {
    const value = ref(props.modelValue);

    const users: Ref<any[]> = ref([]);

    const currentData = ref();
    const academicPeriodGroupId = ref<number | null>(null);
    const loading = ref(true);

    onMounted(async () => {
      if (value.value) {
        const params: any = { id: value.value };

        const response =
          await getStudentsForSelectByDisciplinaryControlService.run(params);

        if (response.data.length) {
          users.value.push({
            ...response.data[0],
            id: response.data[0].matriculate.studentId,
            name:
              response.data[0].people.names +
              ' ' +
              response.data[0].people.lastnames,
          });
          value.value = response.data[0].id;
          currentData.value = response.data[0];
        }
      } else {
        users.value = [];
        value.value = null;
        currentData.value = null;
      }

      loading.value = false;
    });

    watch(value, async (newValue) => {
      const selectedUser = users.value.find((user) => user.id === newValue);
      if (selectedUser) {
        emit('userData', {
          id: selectedUser.id,
          academicPeriodGroupId: selectedUser.academicPeriodGroupId,
        });
        emit('update:modelValue', newValue);
      }
    });

    const searchData = debounce(async (search: string, loading: Function) => {
      if (search) {
        loading(true);

        if (search.length >= 2) {
          users.value = [];

          const params = { search: search, ...props.extraParams };
          const response =
            await getStudentsForSelectByDisciplinaryControlService.run(params);

          response.data.forEach((user) => {
            users.value.push({
              ...user,
              id: user.people.userId,
              name: user.people.names + ' ' + user.people.lastnames,
              academicPeriodGroupId: user.matriculate.academicPeriodGroupId,
            });
          });
        } else {
          users.value = [];
        }
        loading(false);
      }
    }, 800);

    return {
      loading,

      value,
      users,
      academicPeriodGroupId,

      searchData,
    };
  },
});
</script>
