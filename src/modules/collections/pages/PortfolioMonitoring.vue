<template>
    <AppBaseList :title="title" :routes="routes">
        <template #content>
            <AppLoading v-if="loading"></AppLoading>

            <AppDatatable v-else :service="getBalancesPendingPerStudentService" :params="params" :name="name">
                <template #filters>
                    <AppFilter v-model="academicPeriodId" :filter-name="`${name}.academicPeriodId`">
                        <label for="academicPeriodId">Ciclo Escolar</label>
                        <AppAutocomplete 
                            :input-id="'academicPeriodId'" v-model="academicPeriodId" :options="academicPeriods"
                        ></AppAutocomplete>
                    </AppFilter>

                    <AppFilter v-model="academicPeriodGroupId" :filter-name="`${name}.academicPeriodGroupId`">
                        <label for="academicPeriodGroupId">Grupo</label>
                        <AppAutocomplete 
                            :input-id="'academicPeriodGroupId'" v-model="academicPeriodGroupId" :options="academicPeriodGroups" 
                            :label="'degreeName'" :disabled="!academicPeriodId"
                        ></AppAutocomplete>
                    </AppFilter>
                </template>

                <AppDatatableColumn label="Identificación" v-slot="{ row }" field="identification" :sortable="true">
                    <span style="font-size: .8rem;">{{ row.identification }}</span>
                </AppDatatableColumn>
                <AppDatatableColumn label="Nombre Aspirante" v-slot="{ row }" field="student" :sortable="true">
                    <span style="font-size: .8rem;">{{ row.student }}</span>
                </AppDatatableColumn>
                <AppDatatableColumn label="Grado" v-slot="{ row }" field="degreeName" :sortable="true">
                    <span style="font-size: .8rem;">{{ row.degreeName }}</span>
                </AppDatatableColumn>
                <AppDatatableColumn label="Celular" v-slot="{ row }" field="phone" :sortable="true">
                    <span style="font-size: .8rem;">{{ row.homePhone ?? row.mobile ?? '---' }}</span>
                </AppDatatableColumn>
                <AppDatatableColumn label="Cartera" v-slot="{ row }" field="pending" :sortable="true">
                    <span style="font-size: .8rem;">{{ n(row.pending ?? 0, 'currency') }}</span>
                </AppDatatableColumn>
                <AppDatatableColumn label="Cartera Jurídica" v-slot="{ row }" field="pendingLegal" :sortable="true">
                    <span style="font-size: .8rem;">{{ n(row.pendingLegal ?? 0, 'currency') }}</span>
                </AppDatatableColumn>
                <AppDatatableColumn label="Seguimiento" v-slot="{ row }" field="monitoring">
                    <p style="font-size: .8rem;" class="m-0 d-flex"><span>Notificaciones:</span> <span class="ms-1">{{ row.notifications.length }}</span></p>
                    <p style="font-size: .8rem;" class="m-0">Llamadas: {{ row.calls.length }}</p>
                </AppDatatableColumn>
                <AppDatatableColumn label="Prox. Contacto" v-slot="{ row }" field="nexContact">
                    <span style="font-size: .8rem;">{{ row.nexContact }}</span>
                </AppDatatableColumn>

                <AppDatatableColumn v-slot="{ row }">
                    <AppButtonGroup :size="'sm'">
                        <AppButton 
                            v-tooltip="'Cartera de estudiante'" icon="file-alt" outlined
                            :to="{ 
                                name:'collections.portfolioMonitoringByStudent', 
                                params: { matriculateId: row.matriculateId }
                            }"
                        ></AppButton>

                        <AppButton 
                            v-tooltip="'Visualizar notificaciones'" icon="bell" outlined @click="openNotificationModal(row.notifications)"
                        ></AppButton>

                        <AppButton 
                            v-tooltip="'Llamadas'" icon="phone-square-alt" outlined @click="openCallModal(row.calls, row.userId)"
                        ></AppButton>
                    </AppButtonGroup>
                </AppDatatableColumn>
            </AppDatatable>

            <AppModal v-model="notificationModal">
                <PortfolioMonitoringViewNotifications
                    v-if="notificationModal" :data="currentNotifications"
                ></PortfolioMonitoringViewNotifications>
            </AppModal>

            <AppModal v-model="callsModal" :size="'lg'">
                <PortfolioMonitoringViewCalls
                    v-if="callsModal && receiverUserId" :data="currentCalls" :receiverUserId="receiverUserId" @close="closeCallModal()"
                ></PortfolioMonitoringViewCalls>
            </AppModal>
        </template>
    </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, Ref, ref, watch } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import AppFilter from '../../../shared/components/AppFilter.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import PortfolioMonitoringViewCalls from '../components/PortfolioMonitoringViewCalls.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import PortfolioMonitoringViewNotifications from '../components/PortfolioMonitoringViewNotifications.vue';

import { AcademicPeriodDto, AcademicPeriodGroupDto, NotificationDto, CallDto } from '../dtos/portfolioMonitoring.dto';

import { GetAcademicPeriodsService } from '../services/getAcademicPeriods.service';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { GetAcademicPeriodGroupsByAcademicPeriodIdService } from '../services/getAcademicPeriodGroupsByAcademicPeriodId.service';
import { GetBalancesPendingPerStudentService } from '../services/getBalancesPendingPerStudent.service';
import { useHeaderStore } from '../../../stores/header.store';

const getAcademicPeriodGroupsByAcademicPeriodIdService = new GetAcademicPeriodGroupsByAcademicPeriodIdService();
const getAcademicPeriodsService = new GetAcademicPeriodsService();
const updateDatatableService = new UpdateDatatableService();

export default defineComponent({
    name: 'PortfolioMonitoring',
    components: {
        PortfolioMonitoringViewNotifications,
        PortfolioMonitoringViewCalls,
        AppDatatableColumn,
        AppAutocomplete,
        AppButtonGroup,
        AppDatatable,
        AppBaseList,
        AppLoading,
        AppButton,
        AppFilter,
        AppModal,
    },

    setup() {
        const { n } = useI18n();

        const title = 'Seguimiento cartera';
        const routes = [{ name: title }];
        useMeta({ title });

        const getBalancesPendingPerStudentService = new GetBalancesPendingPerStudentService();
        const name = 'PortfolioMonitoring';

        const academicPeriodGroups: Ref<AcademicPeriodGroupDto[]> = ref([]);
        const currentNotifications: Ref<NotificationDto[]> = ref([]);
        const academicPeriods: Ref<AcademicPeriodDto[]> = ref([]);
        const currentCalls: Ref<CallDto[]> = ref([]);

        const academicPeriodGroupId = ref();
        const academicPeriodId = ref();
        const receiverUserId = ref();

        const notificationModal = ref(false);
        const callsModal = ref(false);
        const loading = ref(true);

        const params = computed(() => {
            return {
                academicPeriodGroupId: academicPeriodGroupId.value,
                academicPeriodId: academicPeriodId.value,
            };
        });

        onMounted(async () => {
            try {
                const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Cartera', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
                academicPeriods.value = await getAcademicPeriodsService.run();
            } catch (e) {}

            loading.value = false;
        });

        watch(academicPeriodId, async (value) => {
            if (value) {
                academicPeriodGroups.value = await getAcademicPeriodGroupsByAcademicPeriodIdService.run(value);
            } else {
                academicPeriodGroups.value = [];
            }
        });

        const openNotificationModal = (notifications: NotificationDto[]) => {
            currentNotifications.value = notifications;
            notificationModal.value = true;
        };

        const openCallModal = (calls: CallDto[], userId: number) => {
            receiverUserId.value = userId;
            currentCalls.value = calls;
            callsModal.value = true;
        };
        const closeCallModal = () => {
            updateDatatableService.run();
            callsModal.value = false;
        };

        return {
            loading,
            routes,
            title,
            n,
            
            getBalancesPendingPerStudentService,
            academicPeriodGroupId,
            academicPeriodGroups,
            academicPeriodId,
            academicPeriods,
            params,
            name,

            currentNotifications,
            notificationModal,
            receiverUserId,
            currentCalls,
            callsModal,

            openNotificationModal,
            closeCallModal,
            openCallModal,
        };
    },
});
</script>

<style scoped>

</style>