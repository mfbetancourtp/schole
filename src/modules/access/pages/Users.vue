<template>
  <AppBaseList v-if="loading" :title="title" isCard>
    <template #actions>
      <AppCheckPermission permission="usersManagement.users.create">
        <AppButton label="core.new" :to="{ name: 'access.usersCreate' }" />
      </AppCheckPermission>
    </template>

    <template #content>
      <AppLoading v-if="loading" />
    </template>
  </AppBaseList>

  <AppBaseList v-else :title="title" isCard>
    <template #actions>
      <AppCheckPermission permission="usersManagement.users.create">
        <AppButton style="color: white" label="core.new" :to="{ name: 'access.usersCreate' }" />
      </AppCheckPermission>
    </template>

    <template #content>
      <AppDatatable name="users" :service="service" :params="params">
        <template #filters>
          <AppFilter v-model="roleId" filter-name="users.roleId">
            <AppFormField label="access.roles.singular" capitalize>
              <AppAutocomplete v-model="roleId" :options="roles" input-id="roleId" :multiple="true" />
            </AppFormField>
          </AppFilter>
        </template>

        <AppDatatableColumn v-slot="{ row }" label="access.users.table.name" field="people.names" :sortable="true">
          {{ row.people.names }} {{ row.people.lastnames }}

          <template v-if="row.courseGroup">
            <p class="m-0 text-muted" style="font-size: 0.9rem">( {{ row.courseGroup }} )</p>
          </template>
        </AppDatatableColumn>

        <AppDatatableColumn v-slot="props" label="access.users.table.username" field="userToken" :sortable="true">
          {{ props.row.userToken }}
        </AppDatatableColumn>

        <AppDatatableColumn v-slot="props" label="access.roles.name">
          <AppBadge v-for="(rol, index) in props.row.roles.split(', ')" :key="index" :label="rol" />
        </AppDatatableColumn>

        <AppDatatableColumn label="Opciones" v-slot="{ row }">
          <div class="d-flex justify-content-between gap-1 mt-2">
            <div class="d-flex">
              <AppCheckPermission permission="usersManagement.users.edit">
                <AppButtonEdit :to="{ name: 'access.usersEdit', params: { userId: row.id } }" />
              </AppCheckPermission>
              <template v-if="row.lastMatriculate || row.lastMatriculatesChildren[0]?.length">
                <AppCheckPermission permission="academicAdministration.matriculates.edit">
                  <AppButton
                    icon="user-edit"
                    v-tooltip="'Editar Usuario'"
                    :to="{
                      name: 'academicAdministration.detailMatriculate',
                      params: { userId: row.id },
                    }"
                  />
                </AppCheckPermission>
              </template>
              <AppCustomButton v-if="row.active == 1" icon-name="inactive" v-tooltip="'Inactivar'" @click="InactiveUser(row.id)"> </AppCustomButton>

              <AppCustomButton v-if="row.active == 0" icon-name="Active" v-tooltip="'activar'" @click="ActiveUser(row.id)"> </AppCustomButton>
            </div>
          </div>
        </AppDatatableColumn>
      </AppDatatable>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, Ref, ref } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import { useHeaderStore } from '../../../stores/header.store';

import AppBadge from '../../../shared/components/AppBadge.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppCustomButton from '../../../shared/components/Buttons/AppCustomButton.vue';

import { RoleDto } from '../../../shared/dto/role.dto';

//import { GetUsersWithPaginationService } from '../services/getUsersWithPagination.service';
import { GetAllRolesService } from '../services/getAllRoles.service';
import { UpdateUserService } from '../services/updateUser.service';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { GetUsersAndMatriculatesWithPaginationService } from '../services/getUsersAndMatriculatesWithPagination.service';

const getAllRolesService = new GetAllRolesService();
const updateUserService = new UpdateUserService();
const updateDatatableService = new UpdateDatatableService();
//const getUsersAndMatriculatesWithPaginationService = new GetUsersAndMatriculatesWithPaginationService();

export default defineComponent({
  name: 'UsersPage',

  components: {
    AppCheckPermission,
    AppDatatableColumn,
    AppAutocomplete,
    AppButtonEdit,
    AppFormField,
    AppDatatable,
    AppBaseList,
    AppLoading,
    AppButton,
    AppFilter,
    AppBadge,

    AppCustomButton,
  },

  setup() {
    const { t } = useI18n();
    const title = 'access.users.title';

    useMeta({ title: t(title) });
    const headerStorage = useHeaderStore();
    headerStorage.module = { name: 'core.menu.usersManagement', url: '' };
    headerStorage.moduleItem = { name: title, url: '' };
    headerStorage.moduleSubItem = { name: '', url: '' };

    const service = new GetUsersAndMatriculatesWithPaginationService();

    const roleId: Ref<number[] | null> = ref(null);
    const roles: Ref<RoleDto[]> = ref([]);

    const loading = ref(true);

    const params = computed(() => ({
      roleId: roleId.value,
    }));

    const refreshData = () => {
      updateDatatableService.run();
    };

    onMounted(async () => {
      roles.value = await getAllRolesService.run();

      const localfilters: any = JSON.parse(localStorage.getItem('filters') ?? '{}');

      if (localfilters && !!localfilters['users.roleId']) {
        if (roles.value.length) roleId.value = localfilters['users.roleId'] as number[];
      }

      setTimeout(() => (loading.value = false), 500);
    });

    const InactiveUser = async (dataId: number) => {
      try {
        await updateUserService.run(dataId, 0);
        refreshData();
      } catch (error) {
        console.log(error);
      }
    };

    const ActiveUser = async (dataId: number) => {
      try {
        await updateUserService.run(dataId, 1);
        refreshData();
      } catch (error) {
        console.log(error);
      }
    };

    return {
      loading,
      title,

      service,
      params,

      roleId,
      roles,

      ActiveUser,
      InactiveUser,
      refreshData,
    };
  },
});
</script>
