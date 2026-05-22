<template>
  <AnnouncementForm :title="title"></AnnouncementForm>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import AnnouncementForm from '../components/AnnouncementForm.vue';

export default defineComponent({
  name: 'CreateAnnouncement',
  components: { AnnouncementForm },

  setup() {
    const { t } = useI18n();
    const title = `${t('core.newMale')} ${t('communications.announcements.singular')}`;
    useMeta({ title });

    const routes = [
      {
        name: 'communications.announcements.name',
        url: {
          name: 'communications.announcements',
        },
      },
      {
        name: title,
      },
    ];

    return {
      title,
      routes,
    };
  },
});
</script>

<style scoped></style>
