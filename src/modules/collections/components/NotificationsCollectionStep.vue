<template>
    <section class="d-flex justify-content-between align-items-center">
        <h5 class="m-0">Notificaciones</h5>

        <AppButton
            label="core.newFemale"
            @click="openNotificationFormModal()"
        ></AppButton>
    </section>

    <table class="table">
        <thead>
            <tr>
                <th class="text-capitalize">{{ t('collections.collectionSteps.form.notifications.table.day') }}</th>
                <th class="text-capitalize">{{ t('collections.collectionSteps.form.notifications.table.title') }}</th>
                <th class="text-capitalize">{{ t('collections.collectionSteps.form.notifications.table.chanel') }}</th>
                <th class="text-capitalize">{{ t('collections.collectionSteps.form.notifications.table.receiver') }}</th>
                <th class="text-capitalize">Opciones</th>
            </tr>
        </thead>
        <tbody>
            <tr v-if="!notifications.length">
                <td colspan="5">
                    <AppEmptyResponse
                        :size="'xs'"
                        :show-image="false"
                    ></AppEmptyResponse>
                </td>
            </tr>
            <tr v-else v-for="notification, index in notifications" :key="index">
                <td>{{ notification.numberDay }}</td>
                <td>{{ notification.title }}</td>
                <td>{{ notification.chanelName }}</td>
                <td>{{ notification.configReceiverName }}</td>
                <td>
                    <AppButtonGroup>
                        <AppButtonEdit
                            @click="openNotificationFormModal(notification)"
                        ></AppButtonEdit>

                        <AppButtonDelete
                            @click="openConfirmDelete(notification)"
                        ></AppButtonDelete>
                    </AppButtonGroup>
                </td>
            </tr>
        </tbody>
    </table>

    <AppModal v-model="notificationForm" :size="'lg'">
        <NotificationsCollectionStepForm
            v-if="notificationForm"
            :collection-step-id="collectionStepId"
            :config-receivers="configReceivers"
            :data="currentNotification"
            :channels="channels"
            @close="closeNotificationFormModal"
        ></NotificationsCollectionStepForm>
    </AppModal>

    <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal
            v-if="modalDelete"
            entity="collections.collectionSteps.form.notifications.singular"
            @confirmDelete="confirmDelete"  @close="modalDelete = false"
        ></AppConfirmDeleteModal>
    </AppModal>
</template>
  
<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from "vue";
import { useI18n } from "vue-i18n";

import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from "../../../shared/components/AppLoading.vue";
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from "../../../shared/components/AppButtonGroup.vue";
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonEdit from "../../../shared/components/Buttons/AppButtonEdit.vue";
import NotificationsCollectionStepForm from './NotificationsCollectionStepForm.vue';
import AppButtonDelete from "../../../shared/components/Buttons/AppButtonDelete.vue";
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { CollectionStepDto, NotificationDto } from "../dtos/collectionStep.dto";

import { GetCollectionStepByIdService } from '../services/getCollectionStepById.service';
import { DeleteNotificationCollectionStepByIdService } from "../services/deleteNotificationCollectionStepById.service";

const deleteNotificationCollectionStepByIdService = new DeleteNotificationCollectionStepByIdService();
const getCollectionStepByIdService = new GetCollectionStepByIdService();
  
export default defineComponent({
    name: "NotificationsCollectionStep",
    components: {
        NotificationsCollectionStepForm,
        AppConfirmDeleteModal,
        AppEmptyResponse,
        AppButtonDelete,
        AppButtonGroup,
        AppButtonEdit,
        AppLoading,
        AppButton,
        AppModal,
        AppCard,
    },
  
    props: {
        collectionStepId: {
            type: Number,
            required: true,
        },
        configReceivers: {
            type: Array,
        },
        channels: {
            type: Array,
        },
    },
  
    setup(props) {
        const { t } = useI18n();
        
        const currentNotification: Ref<NotificationDto | null> = ref(null);
        const collectionStep: Ref<CollectionStepDto | null> = ref(null);
        const notifications: Ref<NotificationDto[]> = ref([]);
  
        const notificationForm = ref(false);
        const modalDelete = ref(false);
        const loading = ref(true);
  
        onMounted(async () => {
            await getData();

            loading.value = false;
        });
  
        const getData = async () => {
            try {
                collectionStep.value = await getCollectionStepByIdService.run(props.collectionStepId);
                notifications.value = collectionStep.value?.notifications ?? [];
            } catch (e) {}
        };

        const openNotificationFormModal = (data: NotificationDto | null = null) => {
            currentNotification.value = data;
            notificationForm.value = true;
        };
        const closeNotificationFormModal = async() => {
            await getData();

            notificationForm.value = false;
        };
        const openConfirmDelete = (data: NotificationDto) => {
            currentNotification.value = data;
            modalDelete.value = true;
        };
        const confirmDelete = async () => {
            try {
                if (currentNotification.value) {
                    await deleteNotificationCollectionStepByIdService.run(currentNotification.value?.id);
                    currentNotification.value = null;
                    
                    await getData();
                }
            } catch (e) {}

            modalDelete.value = false;
        };
  
        return {
            loading,
            t,

            currentNotification,
            notificationForm,
            notifications,
            modalDelete,

            closeNotificationFormModal,
            openNotificationFormModal,
            openConfirmDelete,
            confirmDelete,
        };
    },
});
</script>
  
<style scoped>
</style>