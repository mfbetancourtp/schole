<template>
  <AppAutocomplete v-if="!loading" v-model="userId" :options="users" @search="searchData"></AppAutocomplete>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, Ref, ref, watch } from 'vue';
import { debounce } from 'ts-debounce';

import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { GetUsersForSelectService } from '../../services/getUsersForSelect.service';

const getUsersForSelectService = new GetUsersForSelectService();

export default defineComponent({
  name: 'AppSearchUser',
  components: { AppAutocomplete },

  props: {
    id: {
      type: Number as PropType<any>,
    },
  },
  emits: ['userData'],

  setup(props, { emit }) {
    const loading = ref(true);

    const users: Ref<any[]> = ref([]);

    const userId = ref();
    const currentData = ref();

    onMounted(async () => {
      if (props.id) {
        const params: any = { id: props.id };
        const response = await getUsersForSelectService.run(params);

        if (response.data.length) {
          users.value.push({
            ...response.data[0],
            name: response.data[0].people.names + ' ' + response.data[0].people.lastnames,
          });

          userId.value = response.data[0].id;
          currentData.value = response.data[0];
        }
      }

      loading.value = false;
    });

    watch(userId, () => {
      users.value.forEach((item) => {
        if (item.id == userId.value) {
          emit('userData', item);
        }
      });
    });

    const searchData = debounce(async (search: string, loading: Function) => {
      if (search) {
        loading(true);

        if (search.length >= 2) {
          users.value = [];

          const response = await getUsersForSelectService.run({
            search: search,
          });

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
      loading,

      userId,
      users,

      searchData,
    };
  },
});
</script>
