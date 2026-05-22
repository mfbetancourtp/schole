<template>
  <AppBaseList :title="title">
    <template v-slot:actions>
      <AppButtonBack v-if="isDashboard" :to="{ name: 'administration.dashboardStudent' }" />
      <AppCheckPermission permission="disciplinaryControl.disciplinaryOffenses.create" hide>
        <AppButton
          style="color: white"
          variant="primary"
          label="core.newFemale"
          :to="{
            name: 'disciplinaryControl.disciplinaryOffenses.create',
          }"
        ></AppButton>
      </AppCheckPermission>
    </template>

    <template v-slot:content>
      <template v-if="['tutor', 'student'].includes(profileCode)">
        <DiscOffeForTutorAndStudent />
      </template>

      <template v-else>
        <AppDatatable :service="getDisciplinaryOffensesService" :params="params" :name="name">
          <template v-slot:filters>
            <AppFilter v-model="academicPeriodId" :filter-name="`${name}.academicPeriodId`">
              <label for="academicPeriodId">{{ t('core.generalTerms.academic.academicPeriod.singular') }}</label>
              <AppAutocomplete :options="academicPeriods" :model-value="academicPeriodId" :input-id="'academicPeriodId'" v-model="academicPeriodId"></AppAutocomplete>
            </AppFilter>

            <AppFilter v-model="typeOffense" :filter-name="`${name}.typeOffense`">
              <label for="dateSince">Tipo de observación</label>
              <v-select input-id="typeOffense" v-model="typeOffenseId" :options="typeOffense.value" label="value" :reduce="(typeOffense: any) => typeOffense.label"> </v-select>
            </AppFilter>
            <AppFilter v-model="dateSince" :filter-name="`${name}.dateSince`" @isNotInitialized="null">
              <label for="dateSince">Fecha inicial</label>
              <input type="date" class="form-control" id="dateSince" v-model="dateSince" />
            </AppFilter>

            <AppFilter v-model="dateUntil" :filter-name="`${name}.dateUntil`" @isNotInitialized="null">
              <label for="dateUntil">Fecha final</label>
              <input type="date" class="form-control" id="dateUntil" v-model="dateUntil" />
            </AppFilter>
          </template>

          <AppDatatableColumn :label="t('disciplinaryControl.disciplinaryOffenses.table.student')" field="student" :sortable="true" v-slot="{ row }">
            <div class="tw-flex tw-items-center tw-px-4 tw-py-2">
              <AppAvatar :size="'sm'" :avatar="row.student.avatar" :name="row.student.people.names || '?'"> </AppAvatar>
              <div class="tw-min-w-0 tw-ml-4">
                <div class="tw-font-medium tw-leading-5 tw-truncate">
                  {{ row.student.people.names }}
                </div>
                <div class="tw-leading-5 tw-truncate tw-font-light">
                  {{ row.student.people.lastnames }}
                </div>
              </div>
            </div>
          </AppDatatableColumn>
          <AppDatatableColumn :label="t('academicPrograms.degrees.singular')" field="degreeName" :sortable="true" v-slot="{ row }">
            {{ row.degreeName }}
          </AppDatatableColumn>
          <AppDatatableColumn :label="t('core.generalTerms.academic.group.singular')" field="groupName" :sortable="true" v-slot="{ row }">
            {{ row.groupName }}
          </AppDatatableColumn>
          <AppDatatableColumn :label="t('disciplinaryControl.disciplinaryOffenses.table.dateTimeOffense')" field="dateTimeOffense" :sortable="true" v-slot="{ row }">
            {{ dayjs(row.dateTimeOffense).format('YYYY-MM-DD LT') }}
          </AppDatatableColumn>

          <AppDatatableColumn :label="t('disciplinaryControl.disciplinaryOffenses.table.levelOffense')" field="levelOffense" :sortable="true" v-slot="{ row }">
            <span style="font-size: 0.9rem">
              {{ row.offenseLevel.name ?? row.levelOffense }}
            </span>
          </AppDatatableColumn>

          <AppDatatableColumn :label="t('Observación')" field="offenseTemplates" :sortable="true" v-slot="{ row }">
            <div>
              <template v-if="row.offenseTemplateId">
                <AppGetIcon v-if="!isPositive(row.offenseTemplateId)" class="text-danger me-1" name="frown" v-tooltip="'Observación negativa'"></AppGetIcon>
                <AppGetIcon v-else class="text-success me-1" name="smile" v-tooltip="'Observación positiva'"></AppGetIcon>
              </template>

              <span style="font-size: 0.9rem">
                {{ row.offenseTemplate.name }}
              </span>
            </div>
          </AppDatatableColumn>

          <AppDatatableColumn :label="t('reports.filters.status')" field="status" :sortable="true" v-slot="{ row }">
            <AppBadge :variant="buildStatusVariant(row.isSentParents)" :label="row.isSentParents ? 'Enviada' : 'Cargada'"></AppBadge>
          </AppDatatableColumn>

          <AppDatatableColumn :label="t('core.table.actions')" v-slot="{ row }">
            <AppButtonGroup size="sm">
              <AppCheckPermission permission="disciplinaryControl.disciplinaryOffenses.edit">
                <AppButton v-tooltip="row.isSentParents ? 'Volver a enviar email' : 'Enviar email'" @click="openSendMailModalModal(row)" variant="primary" icon="envelope" outlined></AppButton>
              </AppCheckPermission>

              <AppCheckPermission permission="disciplinaryControl.disciplinaryOffenses.edit">
                <AppButton v-tooltip="'Generar documento'" @click="generateDocument(row)" icon="file-alt" variant="primary" outlined></AppButton>
              </AppCheckPermission>

              <AppCheckPermission permission="disciplinaryControl.disciplinaryOffenses.edit">
                <AppButtonEdit
                  :to="{
                    name: 'disciplinaryControl.disciplinaryOffenses.edit',
                    params: { disciplinaryOffenseId: row.id },
                  }"
                ></AppButtonEdit>
              </AppCheckPermission>

              <AppCheckPermission permission="disciplinaryControl.disciplinaryOffenses.delete">
                <AppButtonDelete @click="openConfirmDelete(row)"></AppButtonDelete>
              </AppCheckPermission>
            </AppButtonGroup>
          </AppDatatableColumn>
        </AppDatatable>
      </template>
    </template>
  </AppBaseList>

  <AppModal v-model="SendMailModal">
    <ConfirmSendMailParentsDisciplinaryOffenses v-if="SendMailModal" :offenseDisciplinaryId="currentData.value.id" @close="closeSendMailModalModal"></ConfirmSendMailParentsDisciplinaryOffenses>
  </AppModal>

  <AppModal v-model="modalDelete">
    <AppConfirmDeleteModal v-if="modalDelete" :entity="'disciplinaryControl.disciplinaryOffenses.singular'" @confirmDelete="confirmDelete"></AppConfirmDeleteModal>
  </AppModal>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted, Ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useRoute } from 'vue-router';

import dayjs from 'dayjs';

import AppBadge from '../../../shared/components/AppBadge.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppAvatar from '../../../shared/components/AppAvatar.vue';
import AppGetIcon from '../../../shared/components/AppGetIcon.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import DiscOffeForTutorAndStudent from '../components/DiscOffeForTutorAndStudent.vue';
import ConfirmSendMailParentsDisciplinaryOffenses from '../components/ConfirmSendMailParentsDisciplinaryOffenses.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';

import { useHeaderStore } from '../../../stores/header.store';
import { VariantsConstant } from '../../../shared/constant/variants.constant';

import { RolesService } from '../../../shared/services/roles.service';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';

import { GetFiltersOffensesService } from '../services/getFiltersOffenses.service';
import { GetOffenseTemplatesService } from '../services/getOffenseTemplates.service';
import { GetDisciplinaryOffensesService } from '../services/getDisciplinaryOffenses.service';
import { DeleteDisciplinaryOffensesService } from '../services/deleteDisciplinaryOffenses.service';
import { GenerateDocumentoDisciplinaryOffenseService } from '../services/generateDocumentoDisciplinaryOffense.service';

const updateDatatableService = new UpdateDatatableService();
const rolesService = new RolesService();

const generateDocumentoDisciplinaryOffenseService = new GenerateDocumentoDisciplinaryOffenseService();
const deleteDisciplinaryOffensesService = new DeleteDisciplinaryOffensesService();
const getOffenseTemplatesService = new GetOffenseTemplatesService();
const getFilters = new GetFiltersOffensesService();

export default defineComponent({
  name: 'DisciplinaryOffenses',
  components: {
    AppConfirmDeleteModal,
    AppDatatableColumn,
    AppCheckPermission,
    AppButtonDelete,
    AppAutocomplete,
    AppButtonGroup,
    AppButtonEdit,
    AppDatatable,
    AppBaseList,
    AppGetIcon,
    AppButton,
    AppFilter,
    AppAvatar,
    AppModal,
    AppBadge,
    AppButtonBack,
    ConfirmSendMailParentsDisciplinaryOffenses,
    DiscOffeForTutorAndStudent,
  },

  setup() {
    const { t } = useI18n();
    const title = t('disciplinaryControl.disciplinaryOffenses.name');
    const routes = [{ name: title }];
    useMeta({ title: title });
    const name = title;
    const route = useRoute();

    const headerStorage = useHeaderStore();
    headerStorage.module = { name: 'Control disciplinario', url: '' };
    headerStorage.moduleItem = { name: title, url: '' };
    headerStorage.moduleSubItem = { name: '', url: '' };

    const getDisciplinaryOffensesService = new GetDisciplinaryOffensesService();
    const params = computed(() => {
      return {
        academicPeriodId: academicPeriodId.value,
        isPositive: typeOffenseId.value,
        startDate: dateSince.value,
        endDate: dateUntil.value,
      };
    });

    const profileCode: Ref<string> = ref('');

    const offenseTemplates: Ref<any[]> = ref([]);
    const academicPeriods: { value: any } = reactive({
      value: [],
    });
    const typeOffense: { value: any } = reactive({
      value: [],
    });
    const academicPeriodId = ref([]);
    const activeAcademicPeriods = ref([]);
    const dateSince = ref();
    const isDashboard = ref();
    const dateUntil = ref();
    const typeOffenseId = ref();

    const SendMailModal = ref(false);
    const modalDelete = ref(false);
    const loading = ref(true);

    const currentData: { value: any } = reactive({
      value: null,
    });

    onMounted(async () => {
      try {
        const roleSelected = rolesService.getSelectedRole();
        profileCode.value = roleSelected?.profile?.code ?? '';

        offenseTemplates.value = await getOffenseTemplatesService.run();
        let response = await getFilters.run();
        const allAcademicPeriods: any = response.academicPeriods;
        activeAcademicPeriods.value = allAcademicPeriods.filter((period: any) => period.active === 1);
        typeOffense.value = response.TypeOffenseTemplate;

        isDashboard.value = route.query.user === 'true';

      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const isPositive = (offenseTemplateId: number) => {
      let iconSmile = true;

      iconSmile = offenseTemplates.value.filter((item) => item.id == offenseTemplateId)[0].isPositive ? true : false;

      return iconSmile;
    };

    const generateDocument = async (data: any) => {
      try {
        const itemId: any = localStorage.getItem('itemId');
        const params = {
          itemId: itemId,
        };
        console.log('item', itemId);
        const response = await generateDocumentoDisciplinaryOffenseService.run(data.id);

        window.open(response.file, '_blank');
      } catch (e) {
        console.log(e);
      }
    };

    const openSendMailModalModal = (data: any) => {
      currentData.value = data;
      SendMailModal.value = true;
    };
    const closeSendMailModalModal = async () => {
      SendMailModal.value = false;
      updateDatatableService.run();
    };

    const openConfirmDelete = async (data: any) => {
      currentData.value = data;
      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      await deleteDisciplinaryOffensesService.run(currentData.value.id);
      modalDelete.value = false;
      updateDatatableService.run();
    };
    const buildStatusVariant = (isSentParents: string): VariantsConstant => {
      const colors: { [key: string]: VariantsConstant } = {
        '1': 'primary',
      };
      return colors[isSentParents] ?? 'dark';
    };

    return {
      loading,
      routes,
      title,
      t,

      getDisciplinaryOffensesService,
      params,

      profileCode,

      SendMailModal,
      modalDelete,
      currentData,
      name,
      academicPeriods: activeAcademicPeriods,
      academicPeriodId,
      closeSendMailModalModal,
      openSendMailModalModal,
      buildStatusVariant,
      openConfirmDelete,
      generateDocument,
      confirmDelete,
      isPositive,
      dateSince,
      dateUntil,
      typeOffense,
      typeOffenseId,
      isDashboard,
      dayjs,
    };
  },
});
</script>

<style scoped></style>
