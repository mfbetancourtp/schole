<template>
    <AppLoading v-if="loading"></AppLoading>

    <AppBaseList v-else :title="title" :routes="routes">
        <template #actions>
            <AppButton
            style="color: white;"
                :to="{ name:'collections.collectionStepsCreate' }"
                :label="'core.newFemale'"
            ></AppButton>
        </template>

        <template v-slot:content>
            <AppEmptyResponse 
                v-if="!collectionSteps.length" :show-image="true"
            ></AppEmptyResponse>

            <div v-else class="grid-cards">
                <AppCard v-for="collectionStep, index in collectionSteps" :key="index">
                    <template #title>
                        <AppCardTitle :title="collectionStep.name"></AppCardTitle>
                    </template>

                    <template #body>
                        <section>
                            <p class="mb-0">
                                <span class="fw-bolder">{{ t('collections.collectionSteps.start') }}: </span> 
                                {{ Math.abs(collectionStep.startNumberDay) }} 
                                {{ Math.abs(collectionStep.startNumberDay) == 1 ? t('core.time.day') : t('core.time.days') }} 
                                {{ collectionStep.startNumberDay >= 0 ? 'después' : 'antes'}}
                            </p>

                            <p>
                                <span class="fw-bolder">{{ t('collections.collectionSteps.end') }}: </span> 
                                {{ Math.abs(collectionStep.endNumberDay) }} 
                                {{ Math.abs(collectionStep.endNumberDay) == 1 ? t('core.time.day') : t('core.time.days') }} 
                                {{ collectionStep.endNumberDay >= 0 ? t('core.time.after') : t('core.time.before')}}
                            </p>
                        </section>

                        <section>
                            <p class="fw-bolder mb-1">{{ t('collections.collectionSteps.notifications')}}</p>

                            <p class="ms-2 mb-0" v-for="notification, index in collectionStep.notifications" :key="index">
                                {{ notification.numberDay }} {{ t('core.time.day') }}: {{ notification.chanelName }}
                            </p>
                        </section>
                    </template>

                    <template #footer>
                        <div class="d-flex justify-content-end">
                            <AppButtonGroup>
                                <AppButtonEdit
                                    :to="{ name:'collections.collectionStepsEdit', params: { collectionStepId: collectionStep.id } }"
                                ></AppButtonEdit>

                                <AppButtonDelete
                                    @click="openConfirmDelete(collectionStep)"
                                ></AppButtonDelete>
                            </AppButtonGroup>
                        </div>
                    </template>
                </AppCard>
            </div>

            <AppModal v-model="modalDelete">
                <AppConfirmDeleteModal
                    v-if="modalDelete"
                    entity="collections.collectionSteps.singular"
                    @confirmDelete="confirmDelete"  @close="modalDelete = false"
                ></AppConfirmDeleteModal>
            </AppModal>
        </template>
    </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from "vue";
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from "../../../shared/components/AppLoading.vue";
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from "../../../shared/components/AppBaseList.vue";
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppCardTitle from '../../../shared/components/Card/AppCardTitle.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { CollectionStepDto } from "../dtos/collectionStep.dto";

import { GetCollectionStepsService } from "../services/getCollectionSteps.service";
import { DeleteCollectionStepByIdService } from "../services/deleteCollectionStepById.service";
import { useHeaderStore } from "../../../stores/header.store";

const deleteCollectionStepByIdService = new DeleteCollectionStepByIdService();
const getCollectionStepsService = new GetCollectionStepsService();

export default defineComponent({
    name: "CollectionSteps",
    components: {
        AppConfirmDeleteModal,
        AppEmptyResponse,
        AppButtonDelete,
        AppButtonGroup,
        AppButtonEdit,
        AppCardTitle,
        AppBaseList,
        AppLoading,
        AppButton,
        AppModal,
        AppCard,
    },

    setup() {
        const { t } = useI18n();

        const title = 'collections.collectionSteps.title';
        const routes = [{ name: title }];
        useMeta({ title: t(title) });

        const currentCollectionStep: Ref<CollectionStepDto | null> = ref(null);
        const collectionSteps: Ref<CollectionStepDto[]> = ref([]);

        const modalDelete = ref(false);
        const loading = ref(true);

        onMounted(async () => {
            try {
                const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Cartera', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
                await getData();
            } catch (e) {}

            loading.value = false;
        });

        const getData = async () => {
            loading.value = true;

            try {
                collectionSteps.value = await getCollectionStepsService.run();
            } catch (e) {console.log(e)}

            loading.value = false;
        };

        const openConfirmDelete = (data: CollectionStepDto) => {
            currentCollectionStep.value = data;
            modalDelete.value = true;
        };
        const confirmDelete = async () => {
            try {
                if (currentCollectionStep.value) {
                    await deleteCollectionStepByIdService.run(currentCollectionStep.value.id);
                    currentCollectionStep.value = null;
                    
                    await getData();
                }
            } catch (e) {}

            modalDelete.value = false;
        };

        return {
            loading,
            routes,
            title,
            t,

            collectionSteps,
            modalDelete,

            openConfirmDelete,
            confirmDelete,
        };
    },
});
</script>

<style scoped>
.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
}
</style>