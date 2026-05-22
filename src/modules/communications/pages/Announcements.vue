<template>
  <AppBaseList v-if="!loading" :title="title" :subtitle="subtitle" isCard>
    <template #actions>
      <AppCheckPermission permission="communications.announcements.create">
        <AppButton style="color: white;" :to="{ name: 'communications.announcements.create' }" :label="'core.newMale'"></AppButton>
      </AppCheckPermission>
    </template>

    <template v-slot:content>
      <AppDatatable :service="getAnnouncementsWithPaginationService" :params="{}" :name="name">
        <AppDatatableColumn field="announcement" v-slot="{ row }">
          <div class="container">
            <h6>{{ t('communications.announcements.singular') }}</h6>

            <div class="text-end" style="font-size: 0.8rem">
              <span class="text-muted">{{ dayjs.utc(row.createdAt).locale('es').fromNow() }}</span>
            </div>

            <div class="d-flex align-items-center">
              <AppAvatar :size="'sm'" :name="row.names" :avatar="row.avatar"></AppAvatar>

              <div class="ms-2 d-flex flex-column align-items-start">
                <h5 class="m-0">{{ row.title }}</h5>
                <p class="m-0">{{ row.names }} {{ row.lastnames }}</p>

                <template v-for="(rol, index) in row.roles.split(',')" :key="index">
                  <span class="badge rounded-pill text-bg-primary bg-primary me-1">{{ rol }}</span>
                </template>
              </div>
            </div>

            <div class="d-flex justify-content-end">
              <AppButtonGroup size="sm">
                <AppCheckPermission permission="communications.announcements.delete" :hide="true">
                  <AppButtonDelete @click="openConfirmDelete(row.id)"></AppButtonDelete>
                </AppCheckPermission>

                <AppButton
                  v-tooltip="'Detalle del anuncio'"
                  :icon="'comment-alt'"
                  outlined
                  :to="{
                    name: 'communications.announcementDetail',
                    params: { announcementId: row.id },
                    query: { avatar: row.avatar, roles: row.roles },
                  }"
                ></AppButton>
              </AppButtonGroup>
            </div>
          </div>
        </AppDatatableColumn>
      </AppDatatable>

      <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal v-if="modalDelete" entity="Anuncio" @confirmDelete="confirmDelete"></AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import relativeTime from 'dayjs/plugin/relativeTime';
import localeData from 'dayjs/plugin/localeData';
import { defineComponent, onMounted, ref } from 'vue';
import utc from 'dayjs/plugin/utc';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useRoute } from 'vue-router';
import dayjs from 'dayjs';

dayjs.extend(relativeTime);
dayjs.extend(localeData);
dayjs.locale('es');
dayjs.extend(utc);

// import AppBadge from '../../../shared/components/AppBadge.vue';
import AppAvatar from '../../../shared/components/AppAvatar.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { NavigationService } from '../../../shared/services/navigation.service';
import { DeleteAnnouncementService } from '../services/deleteAnnouncement.service';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { GetAnnouncementsWithPaginationService } from '../services/getAnnouncementsWithPagination.service';
import { useHeaderStore } from '../../../stores/header.store';

const deleteAnnouncementService = new DeleteAnnouncementService();
const updateDatatableService = new UpdateDatatableService();
const navigationService = new NavigationService();

export default defineComponent({
  name: 'AnnouncementsPage',
  components: {
    AppConfirmDeleteModal,
    AppDatatableColumn,
    AppCheckPermission,
    AppButtonDelete,
    AppButtonGroup,
    AppDatatable,
    AppBaseList,
    AppButton,
    // AppBadge,
    AppAvatar,
    AppModal,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();

    const getAnnouncementsWithPaginationService = new GetAnnouncementsWithPaginationService();

    const subtitle = 'Tablero de Anuncios institucional';
    const title = 'communications.announcements.name';
    const name = 'announcements';

    const routes = [{ name: title }];
    useMeta({ title: t(title) });

    const announcementId = ref<number | null>(null);
    const itemId = ref<number | null>(null);

    const modalDelete = ref(false);
    const loading = ref(true);

    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Comunicaciones', url: '' };
        headerStorage.moduleItem = { name: title, url: '' };
        headerStorage.moduleSubItem = { name: '', url: '' };

        const items: any[] = navigationService.get();
        const path = route.path;

        items.forEach((item) => {
          const children: any[] = item.children;

          children.forEach((itemChildren) => {
            if (itemChildren.link == path) {
              itemId.value = parseInt(itemChildren.id);
            }
          });
        });
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const openConfirmDelete = async (id: number) => {
      announcementId.value = id;
      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      if (announcementId.value) {
        const itemId = localStorage.getItem('itemId');
        if (itemId) {
          await deleteAnnouncementService.run(announcementId.value, itemId as any);
        }
      }

      announcementId.value = null;
      modalDelete.value = false;

      updateDatatableService.run();
    };

    return {
      getAnnouncementsWithPaginationService,
      subtitle,
      loading,
      routes,
      title,
      name,
      t,

      modalDelete,

      openConfirmDelete,
      confirmDelete,

      dayjs,
    };
  },
});
</script>

<style scoped>
.container {
  display: flex !important;
  flex-direction: column !important;
}

.title {
  font-family: Arial, Helvetica, sans-serif;
}
</style>
