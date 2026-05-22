<template>
  <AppFormModal :title="title" @closed="emit('close')">
      <template v-slot:content>
          <div class="form-row">
              <AppFormField>
                  <ul>
                      <li v-for="responsible in data.responsible" :key="responsible.id">
                          {{ responsible.dataUser }}
                      </li>
                  </ul>
              </AppFormField>
          </div>
      </template>
  </AppFormModal>
</template>


<script lang="ts">
import { defineComponent, onMounted, PropType, reactive, ref } from 'vue';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
// import AppButtonLoading from '../../../shared/components/Buttons/AppButtonLoading.vue';


export default defineComponent({
  name: 'StorageModal',
  components: {
    AppFormModal,
    AppFormField,
    // AppButtonLoading,
  },
  props: {
    data: {
      type: Object as PropType<any | null>,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const data = props.data;
    let title = 'Responsables tarea';
    const loading = ref(true);

    onMounted(() => {
      loading.value = false;
    });
    return {
      title,
      loading,
      emit,
    };
  },
});
</script>
