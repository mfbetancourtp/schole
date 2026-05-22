<template>
  <AppAutocomplete v-if="!loading" v-model="userId" :options="users" :filterable="false" @search="searchData"></AppAutocomplete>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, Ref, ref, watch } from 'vue';
import { debounce } from 'ts-debounce';

import AppAutocomplete from './AppAutocomplete.vue';

import { GetUsersForSelectService } from '../../../modules/access/services/getUsersForSelect.service';

const getUsersForSelectService = new GetUsersForSelectService();

export default defineComponent({
  name: 'AppUsersForSelect',
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
      } else {
        const response = await getUsersForSelectService.run({});
        users.value = (response.data ?? []).map((user: any) => ({
          ...user,
          name: user.people.names + ' ' + user.people.lastnames,
        }));
        userId.value = null;
        currentData.value = null;
      }

      loading.value = false;
    });

    watch(userId, () => {
      if (!userId.value) {
        emit('userData', { id: null });
        return;
      }

      users.value.forEach((item) => {
        if (item.id == userId.value) {
          // Guardamos la referencia del usuario seleccionado para que
          // no se pierda cuando una búsqueda posterior reemplace
          // `users.value` con otros resultados.
          currentData.value = item;
          emit('userData', item);
        }
      });
    });

    const searchData = debounce(async (search: string, loading: Function) => {
      // Cuando el usuario selecciona un item, vue-select emite `@search`
      // con el label seleccionado. Evitamos llamar al servicio de nuevo
      // porque no aporta (mismo resultado) y además puede confundir al UX
      // mostrando un spinner innecesario.
      if (currentData.value && search === currentData.value.name) {
        loading(false);
        return;
      }

      loading(true);

      const params: any = search.length >= 2 ? { search } : {};
      const response = await getUsersForSelectService.run(params);

      const list = (response.data ?? []).map((user: any) => ({
        ...user,
        name: user.people.names + ' ' + user.people.lastnames,
      }));

      // Si hay un usuario seleccionado y la nueva lista no lo incluye,
      // lo anteponemos para que el autocomplete no pierda la etiqueta
      // visible tras cada búsqueda.
      if (currentData.value && !list.some((u: any) => u.id == currentData.value.id)) {
        list.unshift(currentData.value);
      }

      users.value = list;

      loading(false);
    }, 500);

    return {
      loading,

      userId,
      users,

      searchData,
    };
  },
});
</script>
