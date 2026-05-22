<template>
  <AppBaseList :title="title" isCard>
    <template #actions>
      <AppCheckPermission permission="usersManagement.users.create">
        <AppButton style="color: white" label="core.new" :to="{ name: 'access.usersCreate' }" />
      </AppCheckPermission>
    </template>

    <template #content>
      <AppDatatable name="core.menu.Modules" :service="service" :params="params">
        <template #filters>
          <AppFilter v-model="roleId" filter-name="users.roleId">
            <AppFormField label="access.roles.singular" capitalize>
              <AppAutocomplete v-model="roleId" :options="roles" input-id="roleId" :multiple="true" />
            </AppFormField>
          </AppFilter>
        </template>

        <AppDatatableColumn v-slot="{ row }" label="core.menu.nit" field="people.names" :sortable="true">
          {{ row.people.names }} {{ row.people.lastnames }}

          <template v-if="row.courseGroup">
            <p class="m-0 text-muted" style="font-size: 0.9rem">( {{ row.courseGroup }} )</p>
          </template>
        </AppDatatableColumn>

        <AppDatatableColumn v-slot="props" label="core.menu.name" field="userToken" :sortable="true">
          {{ props.row.userToken }}
        </AppDatatableColumn>

        <AppDatatableColumn v-slot="props" label="core.menu.module">
          <AppBadge v-for="(rol, index) in props.row.roles.split(', ')" :key="index" :label="rol" />
        </AppDatatableColumn>

        <AppDatatableColumn label="Opciones" v-slot="{ row }">
          <div class="d-flex justify-content-between gap-1 mt-2">
            <div class="d-flex">
              <AppCheckPermission permission="usersManagement.users.edit">
                <AppButtonEdit :to="{ name: 'access.usersEdit', params: { userId: row.id } }" />
              </AppCheckPermission>
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
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';



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
    const title = 'core.menu.Modules';

    useMeta({ title: t(title) });
    const headerStorage = useHeaderStore();
    headerStorage.module = { name: 'core.menu.administrationTables', url: '' };
    headerStorage.moduleItem = { name: title, url: '' };
    headerStorage.moduleSubItem = { name: '', url: '' };

    // const service = new GetUsersAndMatriculatesWithPaginationService();

    const loading = ref(true);


    const refreshData = () => {
      updateDatatableService.run();
    };

    onMounted(async () => {


    });

   

    return {
      loading,
      title,
      refreshData,
    };
  },
});
</script>
