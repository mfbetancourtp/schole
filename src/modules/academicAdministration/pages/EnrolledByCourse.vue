<template>
  <AppBaseList :title="title" :routes="routes" :subtitle="subtitle" isCard>
    <template #actions>
      <AppButtonBack :to="{ name: 'academicAdministration.courseAdministration' }"></AppButtonBack>

      <AppCheckPermission permission="academicAdministration.matriculates.create">
        <AppButton
          style="color: white"
          :to="{
            name: 'academicAdministration.enrollStudent',
            params: {
              curriculumOfferingId: academicPeriodGroupId,
            },
          }"
          >Nuevo</AppButton
        >
      </AppCheckPermission>
    </template>

    <template v-slot:content>
      <section>
        <div class="bg-white shadow-sm">
          <nav>
            <div class="nav nav-tabs" id="nav-tab" role="tablist">
              <button
                class="nav-link active text-capitalize"
                data-bs-target="#basic-information"
                aria-controls="basic-information"
                id="basic-information-tab"
                data-bs-toggle="tab"
                aria-selected="true"
                type="button"
                role="tab"
              >
                {{ t('Estudiantes') }}
              </button>

              <button data-bs-target="#activos" aria-controls="activos" class="nav-link text-capitalize" id="activos-tab" aria-selected="false" data-bs-toggle="tab" type="button" role="tab">
                {{ t('Activos') }}
              </button>

              <button data-bs-target="#Retirados" aria-controls="Retirados" class="nav-link text-capitalize" id="Retirados-tab" aria-selected="false" data-bs-toggle="tab" type="button" role="tab">
                {{ t('Retirados') }}
              </button>
            </div>
          </nav>

          <div class="tab-content" id="nav-tabContent">
            <div class="tab-pane fade show active" id="basic-information" role="tabpanel" aria-labelledby="basic-information-tab">
              <section>
                <AppDatatable :service="getEnrolledStudentsServiceByAcademicGroupId" :params="params" :name="name">
                  <AppDatatableColumn :label="t('academicAdministration.matriculates.table.names')" field="lastnames" v-slot="{ row }">
                    <div class="tw-flex tw-items-center tw-px-4 tw-py-2">
                      <AppAvatar :size="'sm'" :avatar="row.avatar" :name="row.student.people.lastnames ?? '?'"></AppAvatar>
                      <div class="tw-min-w-0 tw-ml-4">
                        <div class="tw-font-medium tw-leading-5 tw-truncate">
                          {{ row.student.people.lastnames }}
                        </div>
                        <div class="tw-leading-5 tw-truncate tw-font-light">
                          {{ row.student.people.names }}
                        </div>
                      </div>
                    </div>
                  </AppDatatableColumn>

                  <AppDatatableColumn :label="t('academicAdministration.matriculates.table.identification')" field="identification" v-slot="{ row }">
                    {{ row.student.people.identification }}
                  </AppDatatableColumn>

                  <AppDatatableColumn :label="t('academicAdministration.matriculates.table.date')" field="date" v-slot="{ row }">
                    <!-- {{ row.student?.people?.enrollmentDate ? row.student.people.enrollmentDate.split(' ')[0] || '' : row.student?.people?.createdAt?.split(' ')[0] || '' }} -->
                    {{ row.registeredDate }}
                  </AppDatatableColumn>

                  <AppDatatableColumn v-slot="{ row }">
                    <div class="btn-group">
                      <!-- <AppCheckPermission permission="academicAdministration.matriculates.edit">
                        <AppButton
                          v-tooltip="t('core.edit')"
                          variant="primary"
                          outlined
                          icon="edit"
                          :to="{
                            name: 'academicAdministration.editMatriculate',
                            params: {
                              academicPeriodGroupId: academicPeriodGroupId,
                              matriculateId: row.id,
                            },
                          }"
                        ></AppButton>
                      </AppCheckPermission> -->

                      <AppCheckPermission permission="academicAdministration.matriculates.edit">
                        <AppButton
                          v-tooltip="t('academicAdministration.matriculates.notes')"
                          icon="clipboard-list"
                          variant="primary"
                          outlined
                          :to="{
                            name: 'academicAdministration.notesByStudent',
                            params: {
                              matriculateId: row.id,
                            },
                          }"
                        ></AppButton>
                      </AppCheckPermission>

                      <!-- <AppCheckPermission permission="academicAdministration.matriculates.edit">
                        <AppButton v-if="row.isRetired == 1" @click="openRemoveReenterStudentModal(row)" v-tooltip="'Reingresar Estudiante'" icon="user-plus" variant="primary" outlined></AppButton>
                        <AppButton v-else @click="openRemoveReenterStudentModal(row)" v-tooltip="'Retirar Estudiante'" icon="user-minus" variant="primary" outlined></AppButton>
                      </AppCheckPermission>

                      <AppCheckPermission permission="academicAdministration.matriculates.edit">
                        <AppButton
                          v-tooltip="'Perfil del Usuario'"
                          icon="user-circle"
                          variant="primary"
                          outlined
                          :to="{
                            name: 'access.profile',
                            params: { userId: row.student.people.userId },
                            query: {
                              routeBack: 'academicAdministration.enrolledByCourse',
                              academicPeriodGroupId: academicPeriodGroupId,
                            },
                          }"
                        ></AppButton>
                      </AppCheckPermission>

                      <AppCheckPermission permission="academicAdministration.matriculates.edit">
                        <AppButton
                          v-tooltip="'Trasladar Estudiante'"
                          icon="external-link-alt"
                          variant="primary"
                          outlined
                          :to="{
                            name: 'academicAdministration.transferStudent',
                            params: {
                              academicPeriodGroupId: academicPeriodGroupId,
                              enrollmentId: row.id,
                            },
                          }"
                        ></AppButton>
                      </AppCheckPermission> -->

                      <AppCheckPermission permission="academicAdministration.matriculates.delete">
                        <AppButtonDelete @click="openConfirmDelete(row.id)" />
                      </AppCheckPermission>
                    </div>
                  </AppDatatableColumn>
                </AppDatatable>
              </section>
            </div>

            <div class="tab-pane fade" id="activos" role="tab" aria-labelledby="activos-tab">
              <section>
                <AppDatatable :service="getEnrolledStudentsServiceActive" :params="activos">
                  <AppDatatableColumn :label="t('academicAdministration.matriculates.table.names')" field="lastnames" v-slot="{ row }">
                    <div class="tw-flex tw-items-center tw-px-4 tw-py-2">
                      <AppAvatar :size="'sm'" :name="row.student.people.lastnames ?? '?'"></AppAvatar>

                      <div class="tw-min-w-0 tw-ml-4">
                        <div class="tw-font-medium tw-leading-5 tw-truncate">
                          {{ row.student.people.lastnames }}
                        </div>
                        <div class="tw-leading-5 tw-truncate tw-font-light">
                          {{ row.student.people.names }}
                        </div>
                      </div>
                    </div>
                  </AppDatatableColumn>

                  <AppDatatableColumn :label="t('academicAdministration.matriculates.table.identification')" field="identification" v-slot="{ row }">
                    {{ row.student.people.identification }}
                  </AppDatatableColumn>

                  <AppDatatableColumn :label="t('academicAdministration.matriculates.table.date')" field="date" v-slot="{ row }">
                    {{ row.registeredDate }}
                  </AppDatatableColumn>

                  <AppDatatableColumn v-slot="{ row }">
                    <div class="btn-group">
                      <AppCheckPermission permission="academicAdministration.matriculates.edit">
                        <AppButton
                          v-tooltip="t('core.edit')"
                          variant="primary"
                          outlined
                          icon="edit"
                          :to="{
                            name: 'academicAdministration.editMatriculate',
                            params: {
                              academicPeriodGroupId: academicPeriodGroupId,
                              matriculateId: row.id,
                            },
                          }"
                        ></AppButton>
                      </AppCheckPermission>

                      <AppCheckPermission permission="academicAdministration.matriculates.edit">
                        <AppButton
                          v-tooltip="t('academicAdministration.matriculates.notes')"
                          icon="clipboard-list"
                          variant="primary"
                          outlined
                          :to="{
                            name: 'academicAdministration.notesByStudent',
                            params: {
                              academicPeriodGroupId: academicPeriodGroupId,
                              matriculateId: row.id,
                            },
                          }"
                        ></AppButton>
                      </AppCheckPermission>

                      <AppCheckPermission permission="academicAdministration.matriculates.edit">
                        <AppButton v-if="row.isRetired == 1" @click="openRemoveReenterStudentModal(row)" v-tooltip="'Reingresar Estudiante'" icon="user-plus" variant="primary" outlined></AppButton>
                        <AppButton v-else @click="openRemoveReenterStudentModal(row)" v-tooltip="'Retirar Estudiante'" icon="user-minus" variant="primary" outlined></AppButton>
                      </AppCheckPermission>

                      <AppCheckPermission permission="academicAdministration.matriculates.edit">
                        <AppButton
                          v-tooltip="'Perfil del Usuario'"
                          icon="user-circle"
                          variant="primary"
                          outlined
                          :to="{
                            name: 'access.profile',
                            params: { userId: row.student.people.userId },
                            query: {
                              routeBack: 'academicAdministration.enrolledByCourse',
                              academicPeriodGroupId: academicPeriodGroupId,
                            },
                          }"
                        ></AppButton>
                      </AppCheckPermission>

                      <AppCheckPermission permission="academicAdministration.matriculates.edit">
                        <AppButton
                          v-tooltip="'Trasladar Estudiante'"
                          icon="external-link-alt"
                          variant="primary"
                          outlined
                          :to="{
                            name: 'academicAdministration.transferStudent',
                            params: {
                              academicPeriodGroupId: academicPeriodGroupId,
                              enrollmentId: row.id,
                            },
                          }"
                        ></AppButton>
                      </AppCheckPermission>

                      <AppCheckPermission permission="academicAdministration.matriculates.delete">
                        <AppButtonDelete @click="openConfirmDelete(row.id)" />
                      </AppCheckPermission>
                    </div>
                  </AppDatatableColumn>
                </AppDatatable>
              </section>
            </div>

            <div class="tab-pane fade" id="Retirados" role="tab" aria-labelledby="Retirados-tab">
              <section>
                <AppDatatable :service="getEnrolledStudentsServiceByRetirado" :params="retirados">
                  <AppDatatableColumn :label="t('academicAdministration.matriculates.table.names')" field="lastnames" v-slot="{ row }">
                    <div class="tw-flex tw-items-center tw-px-4 tw-py-2">
                      <AppAvatar :size="'sm'" :name="row.student.people.lastnames ?? '?'"></AppAvatar>

                      <div class="tw-min-w-0 tw-ml-4">
                        <div class="tw-font-medium tw-leading-5 tw-truncate">
                          {{ row.student.people.lastnames }}
                        </div>
                        <div class="tw-leading-5 tw-truncate tw-font-light">
                          {{ row.student.people.names }}
                        </div>
                      </div>
                    </div>
                  </AppDatatableColumn>

                  <AppDatatableColumn :label="t('academicAdministration.matriculates.table.identification')" field="identification" v-slot="{ row }">
                    {{ row.student.people.identification }}
                  </AppDatatableColumn>

                  <AppDatatableColumn :label="t('academicAdministration.matriculates.table.date')" field="date" v-slot="{ row }">
                    {{ row.registeredDate }}
                  </AppDatatableColumn>

                  <AppDatatableColumn v-slot="{ row }">
                    <div class="btn-group">
                      <AppCheckPermission permission="academicAdministration.matriculates.edit">
                        <AppButton
                          v-tooltip="t('core.edit')"
                          variant="primary"
                          outlined
                          icon="edit"
                          :to="{
                            name: 'academicAdministration.editMatriculate',
                            params: {
                              academicPeriodGroupId: academicPeriodGroupId,
                              matriculateId: row.id,
                            },
                          }"
                        ></AppButton>
                      </AppCheckPermission>

                      <AppCheckPermission permission="academicAdministration.matriculates.edit">
                        <AppButton
                          v-tooltip="t('academicAdministration.matriculates.notes')"
                          icon="clipboard-list"
                          variant="primary"
                          outlined
                          :to="{
                            name: 'academicAdministration.notesByStudent',
                            params: {
                              academicPeriodGroupId: academicPeriodGroupId,
                              matriculateId: row.id,
                            },
                          }"
                        ></AppButton>
                      </AppCheckPermission>

                      <AppCheckPermission permission="academicAdministration.matriculates.edit">
                        <AppButton v-if="row.isRetired == 1" @click="openRemoveReenterStudentModal(row)" v-tooltip="'Reingresar Estudiante'" icon="user-plus" variant="primary" outlined></AppButton>
                        <AppButton v-else @click="openRemoveReenterStudentModal(row)" v-tooltip="'Retirar Estudiante'" icon="user-minus" variant="primary" outlined></AppButton>
                      </AppCheckPermission>

                      <AppCheckPermission permission="academicAdministration.matriculates.edit">
                        <AppButton
                          v-tooltip="'Perfil del Usuario'"
                          icon="user-circle"
                          variant="primary"
                          outlined
                          :to="{
                            name: 'access.profile',
                            params: { userId: row.student.people.userId },
                            query: {
                              routeBack: 'academicAdministration.enrolledByCourse',
                              academicPeriodGroupId: academicPeriodGroupId,
                            },
                          }"
                        ></AppButton>
                      </AppCheckPermission>

                      <AppCheckPermission permission="academicAdministration.matriculates.edit">
                        <AppButton
                          v-tooltip="'Trasladar Estudiante'"
                          icon="external-link-alt"
                          variant="primary"
                          outlined
                          :to="{
                            name: 'academicAdministration.transferStudent',
                            params: {
                              academicPeriodGroupId: academicPeriodGroupId,
                              enrollmentId: row.id,
                            },
                          }"
                        ></AppButton>
                      </AppCheckPermission>

                      <AppCheckPermission permission="academicAdministration.matriculates.delete">
                        <AppButtonDelete @click="openConfirmDelete(row.id)" />
                      </AppCheckPermission>
                    </div>
                  </AppDatatableColumn>
                </AppDatatable>
              </section>
            </div>
          </div>
        </div>
      </section>

      <AppModal v-model="removeReenterStudentModal">
        <RemoveReenterStudentForm
          v-if="removeReenterStudentModal"
          :academic-period-group-id="academicPeriodGroupId"
          :matriculate="currentMatriculate.value"
          @close="closeRemoveReenterStudentModal"
        ></RemoveReenterStudentForm>
      </AppModal>
    </template>
  </AppBaseList>

  <AppModal v-model="modalDelete">
    <template v-if="modalDelete">
      <AppConfirmDeleteModal entity="matrícula" @confirmDelete="confirmDelete()" />
    </template>
  </AppModal>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';
import { useRoute } from 'vue-router';
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';

import AppAvatar from '../../../shared/components/AppAvatar.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';

import RemoveReenterStudentForm from '../components/RemoveReenterStudentForm.vue';

import { GetMatriculatesService } from '../services/getMatriculates.service';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { useHeaderStore } from '../../../stores/header.store';
import { DeleteMatriculateService } from '../services/deleteMatriculate.service';

const deleteMatriculateService = new DeleteMatriculateService();
const updateDatatableService = new UpdateDatatableService();

export default defineComponent({
  name: 'EnrolledByCourse',
  components: {
    RemoveReenterStudentForm,
    AppConfirmDeleteModal,
    AppDatatableColumn,
    AppCheckPermission,
    AppButtonDelete,
    AppButtonBack,
    AppDatatable,
    AppBaseList,
    AppAvatar,
    AppButton,
    AppModal,
  },

  setup() {
    const title = 'Matriculados';
    const name = 'Matriculados';
    useMeta({ title: title });
    const routes = [
      {
        name: 'Administración de Cursos',
        url: {
          name: 'academicAdministration.courseAdministration',
        },
      },
      {
        name: title,
      },
    ];

    const removeReenterStudentModal = ref(false);
    const academicPeriodGroupId = ref();
    const searchValue = ref('');
    const loading = ref(true);
    const route = useRoute();
    const subtitle = ref();
    const { t } = useI18n();

    const currentMatriculate: { value: any } = reactive({
      value: null,
    });

    const getEnrolledStudentsServiceByAcademicGroupId = new GetMatriculatesService();
    const params = computed(() => {
      return {
        curriculumOfferingId: academicPeriodGroupId.value,
      };
    });

    const getEnrolledStudentsServiceActive = new GetMatriculatesService();
    const activos = computed(() => {
      return {
        curriculumOfferingId: academicPeriodGroupId.value,
        isRetired: 0,
      };
    });

    const getEnrolledStudentsServiceByRetirado = new GetMatriculatesService();
    const retirados = computed(() => {
      return {
        curriculumOfferingId: academicPeriodGroupId.value,
        isRetired: 1,
      };
    });

    const currentIdDelete: { value: number | null } = reactive({
      value: null,
    });

    const modalDelete = ref(false);

    onMounted(async () => {
      academicPeriodGroupId.value = route.params.curriculumOfferingId;

      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Administración académica', url: '' };
        headerStorage.moduleItem = {
          name: 'Administración de cursos',
          url: '',
        };
        headerStorage.moduleSubItem = { name: title, url: '' };
      } catch (e) {
        console.log('error', e);
      }

      loading.value = false;
    });

    const openRemoveReenterStudentModal = (matriculate: any) => {
      currentMatriculate.value = matriculate;
      removeReenterStudentModal.value = true;
    };
    const closeRemoveReenterStudentModal = async () => {
      removeReenterStudentModal.value = false;
      updateDatatableService.run();
    };

    const openConfirmDelete = async (id: number) => {
      currentIdDelete.value = id;
      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      if (!currentIdDelete.value) return;

      await deleteMatriculateService.run(currentIdDelete.value);
      modalDelete.value = false;

      updateDatatableService.run();
    };

    return {
      subtitle,
      loading,
      routes,
      title,
      name,
      t,

      getEnrolledStudentsServiceByAcademicGroupId,
      getEnrolledStudentsServiceActive,
      getEnrolledStudentsServiceByRetirado,
      removeReenterStudentModal,
      academicPeriodGroupId,
      currentMatriculate,
      searchValue,
      modalDelete,
      params,
      activos,
      retirados,

      closeRemoveReenterStudentModal,
      openRemoveReenterStudentModal,
      openConfirmDelete,
      confirmDelete,
    };
  },
});
</script>

<style scoped>
.hover:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.hover-white:hover {
  color: white;
}

.btn-group {
  gap: 0.5rem;
}
</style>
