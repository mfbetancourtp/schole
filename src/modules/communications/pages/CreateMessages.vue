<template>
  <AppLoading v-if="loading"></AppLoading>

  <MessagesForm v-else :title="title" :routes="routes" :is-student-or-parent="isStudentOrParent"></MessagesForm>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import MessagesForm from '../components/MessagesForm.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';

export default defineComponent({
  name: 'CreateMessages',
  components: { MessagesForm, AppLoading },
  setup() {
    const { t } = useI18n();
    const title = `${t('core.newMale')} Mensaje`;

    useMeta({ title });

    const isStudentOrParent = ref(false);
    const loading = ref(true);

    onMounted(async () => {
      try {
        await studentOrParent();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const studentOrParent = async (): Promise<boolean> => {
      const profileId: any = localStorage.getItem('profileId');
      const isStudentOrParent = profileId === '2' || profileId === '4';
      console.log('aca', isStudentOrParent);
      return isStudentOrParent;
    };

    const routes = [
      {
        name: 'Mensajes',
        url: { name: 'communications.messagesList' },
      },
      {
        name: title,
      },
    ];

    return {
      loading,
      routes,
      title,

      isStudentOrParent,
    };
  },
});
</script>

<style scoped></style>
