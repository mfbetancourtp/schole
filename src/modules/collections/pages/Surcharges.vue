<template>
    <AppLoading v-if="loading"></AppLoading>

    <AppBaseList v-else :title="title" :routes="routes">
        <template #actions>
            <AppButton
            style="color: white;"
                @click="openSurchargeModal()"
                :label="'core.newMale'"
            ></AppButton>
        </template>

        <template v-slot:content>
            <AppEmptyResponse 
                v-if="!surcharges.length" :show-image="true"
            ></AppEmptyResponse>

            <div v-else class="grid-cards">
                <AppCard v-for="surcharge, index in surcharges" :key="index">
                    <template #title>
                        {{surcharge.title}}
                    </template>

                    <template #body>
                        <p>{{ surcharge.description }}</p>
                    </template>

                    <template #footer>
                        <div class="d-flex justify-content-end">
                            <AppButtonGroup>
                                <AppButtonEdit
                                    @click="openSurchargeModal(surcharge)"
                                ></AppButtonEdit>

                                <AppButtonDelete
                                    @click="openConfirmDelete(surcharge)"
                                ></AppButtonDelete>
                            </AppButtonGroup>
                        </div>
                    </template>
                </AppCard>
            </div>

            <AppModal v-model="surchargeModal">
                <SurchargeForm
                    v-if="surchargeModal"
                    :data="currentSurcharge"
                    @close="closeSurchargeModal"
                ></SurchargeForm>
            </AppModal>

            <AppModal v-model="modalDelete">
                <AppConfirmDeleteModal
                    v-if="modalDelete"
                    entity="collections.surcharges.singular"
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

import SurchargeForm from '../components/SurchargeForm.vue';
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

import { SurchargeDto } from "../dtos/surcharge.dto";

import { GetSurchargesService } from "../services/getSurcharges.service";
import { DeleteSurchargeByIdService } from "../services/deleteSurchargeById.service";
import { useHeaderStore } from "../../../stores/header.store";

const deleteSurchargeByIdService = new DeleteSurchargeByIdService();
const getSurchargesService = new GetSurchargesService();

export default defineComponent({
    name: "Surcharges",
    components: {
        AppConfirmDeleteModal,
        AppEmptyResponse,
        AppButtonDelete,
        AppButtonGroup,
        SurchargeForm,
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

        const title = 'collections.surcharges.title';
        useMeta({ title: t(title) });
        const routes = [{ name: title }];

        const currentSurcharge: Ref<SurchargeDto | null> = ref(null);
        const surcharges: Ref<SurchargeDto[]> = ref([]);

        const surchargeModal = ref(false);
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
                surcharges.value = await getSurchargesService.run();
            } catch (e) {console.log(e)}

            loading.value = false;
        };

        const openSurchargeModal = (data: SurchargeDto | null = null) => {
            currentSurcharge.value = data;
            surchargeModal.value = true;
        };
        const closeSurchargeModal = async() => {
            await getData();

            surchargeModal.value = false;
        };
        const openConfirmDelete = (data: SurchargeDto) => {
            currentSurcharge.value = data;
            modalDelete.value = true;
        };
        const confirmDelete = async () => {
            try {
                if (currentSurcharge.value) {
                    await deleteSurchargeByIdService.run(currentSurcharge.value?.id);
                    currentSurcharge.value = null;
                    
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

            currentSurcharge,
            surchargeModal,
            modalDelete,
            surcharges,

            closeSurchargeModal,
            openSurchargeModal,
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
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 15rem), 1fr));
}
</style>