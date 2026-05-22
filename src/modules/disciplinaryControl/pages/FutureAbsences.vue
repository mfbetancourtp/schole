<template>
  <AppBaseList :title="title">
    <template #actions>
      <AppButtonBack :to="{ name: 'disciplinaryControl.observer' }" />

      <AppCheckPermission permission="disciplinaryControl.observerAbsence.create">
        <AppButton style="color: white" :label="'core.new'" @click="toggleDrawer()" />
      </AppCheckPermission>
    </template>

    <template v-slot:content>
      <AppDatatable :service="service" :params="params" :name="title" :enableSearchFilter="false">
        <template v-slot:filters>
          <AppFilter v-model="dateSince" :filter-name="`${title}.dateSince`" @isNotInitialized="null">
            <label for="dateSince">Fecha inicial</label>
            <input type="date" class="form-control" id="dateSince" v-model="dateSince" />
          </AppFilter>

          <AppFilter v-model="dateUntil" :filter-name="`${title}.dateUntil`" @isNotInitialized="null">
            <label for="dateUntil">Fecha final</label>
            <input type="date" class="form-control" id="dateUntil" v-model="dateUntil" />
          </AppFilter>
        </template>

        <AppDatatableColumn :label="t('Fecha')" v-slot="{ row }" :width="'13rem'"> {{ row.startAbsence }} - {{ row.endAbsence }} </AppDatatableColumn>
        <AppDatatableColumn :label="t('Tipo de inasistencia')" v-slot="{ row }" :width="'13rem'">
          {{ row.absenceType }}
        </AppDatatableColumn>
        <AppDatatableColumn :label="t('Sesiones que va a faltar')" v-slot="{ row }" :width="'13rem'">
          {{ row.sesionNumbers }}
        </AppDatatableColumn>
        <AppDatatableColumn :label="t('Justificación')" v-slot="{ row }">
          {{ row.justificationAbsence }}
        </AppDatatableColumn>

        <AppDatatableColumn :label="t('core.table.actions')" v-slot="{ row }" :position="'centered'" :width="'13rem'">
          <AppButtonGroup size="lg">
            <AppCheckPermission permission="disciplinaryControl.observerAbsence.edit">
              <AppButtonEdit @click="toggleDrawer(row)" />
            </AppCheckPermission>

            <AppCheckPermission permission="disciplinaryControl.observerAbsence.delete">
              <AppButtonDelete @click="openConfirmDelete(row)" />
            </AppCheckPermission>
          </AppButtonGroup>
        </AppDatatableColumn>
      </AppDatatable>
    </template>
  </AppBaseList>

  <FutureAbsencesFormDrawer
    v-if="relaDataFormFutureAbsences"
    v-model:isVisible="isVisibleDrawer"
    :matriculateId="matriculateId"
    :userName="username ?? '--'"
    :relatedData="relaDataFormFutureAbsences"
    :futureAbsence="futureAbsence"
    @reload-data="updateDatatable()"
  />

  <AppModal v-model="modalDelete">
    <template v-if="modalDelete">
      <AppConfirmDeleteModal :entity="'Inasistencia futura'" @confirmDelete="confirmDelete" />
    </template>
  </AppModal>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import { useHeaderStore } from '../../../stores/header.store';

import AppFilter from '../../../shared/components/AppFilter.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import FutureAbsencesFormDrawer from '../components/FutureAbsencesFormDrawer.vue';

import { DTFutureAbsencesDto, RelaDataFormFutureAbsencesDto } from '../dtos/futureAbsences.dto';

import { GetUserToEditByIdService } from '../../access/services/getUserToEditById.service';

import { GetRelaDataFormFutureAbsencesService } from '../services/getRelaDataFormFutureAbsences.service';
import { GetFutureAbsencesWithPagService } from '../services/getFutureAbsencesWithPag.service';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { DeleteFutureAbsenceService } from '../services/deleteFutureAbsence.service';

const getRelaDataFormFutureAbsencesService = new GetRelaDataFormFutureAbsencesService();
const deleteFutureAbsenceService = new DeleteFutureAbsenceService();
const getUserToEditByIdService = new GetUserToEditByIdService();
const updateDatatableService = new UpdateDatatableService();

export default defineComponent({
  name: 'FutureAbsences',
  components: {
    AppConfirmDeleteModal,
    AppDatatableColumn,
    AppCheckPermission,
    AppButtonDelete,
    AppButtonGroup,
    AppButtonBack,
    AppButtonEdit,
    AppDatatable,
    AppBaseList,
    AppFilter,
    AppButton,
    AppModal,

    FutureAbsencesFormDrawer,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const title = t('Inasistencias futuras');

    useMeta({ title });

    const matriculateId = route.params.matriculateId as unknown as number;

    const service = new GetFutureAbsencesWithPagService();
    const params = computed(() => {
      return {
        matriculateId: matriculateId,
        dateSince: dateSince.value,
        dateUntil: dateUntil.value,
      };
    });

    const dateSince = ref<string | null>(null);
    const dateUntil = ref<string | null>(null);
    const username = ref<string | null>(null);
    const futureAbsence = ref<DTFutureAbsencesDto | null>(null);
    const relaDataFormFutureAbsences = ref<RelaDataFormFutureAbsencesDto | null>(null);

    const loading = ref(true);
    const modalDelete = ref(false);
    const isVisibleDrawer = ref(false);

    onMounted(async () => {
      try {
        if (route.query.userId) {
          const userId = parseInt(route.query.userId.toString());
          const user = await getUserToEditByIdService.run(userId);

          username.value = `${user.people.names} ${user.people.lastnames}`;
        }

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Control disciplinario', url: '' };
        headerStorage.moduleItem = { name: 'core.menu.observer', url: '' };
        headerStorage.moduleSubItem = {
          name: `${title} - ${username.value ?? '---'}`,
          url: '',
        };

        const academicPeriodGroupId = route.query.academicPeriodGroupId as string | undefined;
        relaDataFormFutureAbsences.value = await getRelaDataFormFutureAbsencesService.run({
          academicPeriodGroupId,
        });
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const updateDatatable = async () => {
      updateDatatableService.run();
    };

    const toggleDrawer = (data: DTFutureAbsencesDto | null = null) => {
      futureAbsence.value = data;
      isVisibleDrawer.value = !isVisibleDrawer.value;
    };

    const openConfirmDelete = async (data: DTFutureAbsencesDto) => {
      futureAbsence.value = data;
      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      if (!futureAbsence.value) return;

      await deleteFutureAbsenceService.run(futureAbsence.value?.id);

      modalDelete.value = false;
      futureAbsence.value = null;

      updateDatatable();
    };

    return {
      title,
      t,

      isVisibleDrawer,
      modalDelete,
      loading,

      service,
      params,

      relaDataFormFutureAbsences,
      matriculateId,
      futureAbsence,
      dateSince,
      dateUntil,
      username,

      openConfirmDelete,
      updateDatatable,
      confirmDelete,
      toggleDrawer,
    };
  },
});
</script>

<style scoped></style>
