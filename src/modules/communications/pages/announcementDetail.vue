<template>
  <AppBaseList :title="title" :subtitle="subtitle" isCard>
    <template #actions>
      <AppButtonBack :to="{ name: 'communications.announcements' }"></AppButtonBack>
    </template>

    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>
      <div v-else>
        <div class="d-flex justify-content-end">
          <span>{{ dayjs.utc(announcement.announcement.createdAt).locale('es').fromNow() }}</span>
        </div>

        <div v-html="linkifyHtml(announcement.announcement.body, { target: '_blank' })"></div>

        <div class="border rounded p-2 d-flex align-items-center gap-2">
          <div class="rounded-circle overflow-hidden d-flex justify-content-center" style="width: 3rem">
            <div v-if="ownerUser.avatar">
              <img :src="ownerUser.avatar" alt="avatar" />
            </div>

            <AppIcon v-else icon="user-circle" :size="'2x'" class="text-primary" />
          </div>

          <div>
            <h5>{{ ownerUser.nameOwnerUser }}</h5>
            <AppBadge :variant="primary" v-for="(rol, index) in ownerUser.roles.split(',')" :key="index" :label="rol"></AppBadge>
          </div>
        </div>
        <hr />

        <div>
          <h5>{{ t('communications.announcements.form.attachments') }}</h5>

          <AppButton
            v-for="(file, index) in announcement.announcement.announcementAttachments"
            :key="index"
            :href="file.urlAttachmentFile"
            class="rounded-pill me-2"
            :label="file.name"
            :target="'_blank'"
            outlined
          ></AppButton>
        </div>

        <AppChat :row-table="'Announcements'" :comments-res="comments.value" :row-id="announcement.announcement.id" @new-comment="newComment"></AppChat>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, Ref, ref } from 'vue';
import relativeTime from 'dayjs/plugin/relativeTime';
import localeData from 'dayjs/plugin/localeData';
import linkifyHtml from 'linkify-html';
import * as linkify from 'linkifyjs';
import { useRoute } from 'vue-router';
import utc from 'dayjs/plugin/utc';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import dayjs from 'dayjs';

dayjs.extend(relativeTime);
dayjs.extend(localeData);
dayjs.locale('es');
dayjs.extend(utc);

import AppIcon from '../../../shared/components/AppIcon.vue';
import AppChat from '../../../shared/components/AppChat.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';

import { GetAnnouncementsByIdService } from '../services/getAnnouncementsById.service';

const getAnnouncementsByIdService = new GetAnnouncementsByIdService();

export default defineComponent({
  name: 'AnnouncementsPage',
  components: {
    AppButtonBack,
    AppBaseList,
    AppLoading,
    AppButton,
    AppBadge,
    AppIcon,
    AppChat,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const routes: any[] = [{ name: '' }];
    useMeta({ title: t('communications.announcements.singular') });

    const announcement: Ref<any> = ref();
    const ownerUser: Ref<any> = ref();
    const announcementId = ref();
    const loading = ref(true);
    const subtitle = ref('');
    const title = ref('');

    const comments: { value: any[] } = reactive({
      value: [],
    });

    onMounted(async () => {
      try {
        announcementId.value = parseInt(route.params.announcementId.toString(), 10);

        announcement.value = await getAnnouncementsByIdService.run(announcementId.value);

        title.value = `${t('communications.announcements.singular')}: "${announcement.value.announcement.title}"`;
        subtitle.value = `Autor del anuncio: ${announcement.value.announcement.nameOwnerUser}`;
        comments.value = announcement.value.comments;

        ownerUser.value = {
          nameOwnerUser: announcement.value.announcement.nameOwnerUser,
          avatar: route.query.avatar,
          roles: route.query.roles,
        };
      } catch (e) {
        console.log('error', e);
      }

      loading.value = false;
    });

    const newComment = async () => {
      try {
        let res = await getAnnouncementsByIdService.run(announcementId.value);

        comments.value = res.comments;
        console.log('nuevo comentario');
      } catch (e) {
        console.log('error', e);
      }
    };

    return {
      subtitle,
      loading,
      routes,
      title,
      t,

      announcement,
      ownerUser,
      comments,

      newComment,

      linkifyHtml,
      linkify,
      dayjs,
    };
  },
});
</script>

<style scoped></style>
