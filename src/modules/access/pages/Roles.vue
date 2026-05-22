<template>
  <AppBaseList :title="title">
    <template #content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <div class="grid-cards">
          <AppCheckPermission permission="usersManagement.roles.create">
            <AppButtonNewContainer @click="openFormModal"></AppButtonNewContainer>
          </AppCheckPermission>
          <AppCard v-for="role in roles.value" :key="role.id">
            <!-- nombre de la card principal -->
            <template #title>
              <div class="title-card">{{ role.name }}</div>
            </template>
            <template #body>
              <div class="content-card">{{ role.description }}</div>
            </template>

            <template #footer>
              <div class="buttons-card">
                <div class="button-right">
                  <AppCheckPermission permission="usersManagement.permissions.list">
                    <AppButton v-if="role.profile?.code !== 'admin'" :to="{
                      name: 'access.permissionsList',
                      params: { roleId: role.id },
                    }" v-tooltip="'Permisos'" variant="primary" outlined icon="key">
                    </AppButton>
                  </AppCheckPermission>
                </div>
                <div class="button-left">
                  <AppCheckPermission permission="usersManagement.roles.edit">
                    <AppButtonEdit @click="openFormModal(role)"></AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="usersManagement.roles.delete">
                    <AppButtonDelete @click="openModalDelete(role)"></AppButtonDelete>
                  </AppCheckPermission>
                </div>
              </div>
            </template>
          </AppCard>
        </div>
        <AppModal v-model="modalForm">
          <RoleForm v-if="modalForm" :profiles="profiles.value" :data="currentRole.value" @close="closeModalForm">
          </RoleForm>
        </AppModal>

        <AppModal v-model="modalDelete">
          <AppConfirmDeleteModal v-if="modalDelete" entity="rol" @confirmDelete="deleteRole"></AppConfirmDeleteModal>
        </AppModal>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { useMeta } from 'vue-meta';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppButtonNewContainer from '../../../shared/components/Buttons/AppButtonContainerNew.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import RoleForm from '../components/RoleForm.vue';
import { GetAllRolesService } from '../services/getAllRoles.service';
import { GetRoleRelatedDataFormService } from '../services/getRoleRelateDataForm.service';
import { DeleteRoleService } from '../services/deleteRole.service';
import { RoleDto } from '../../../shared/dto/role.dto';
import { ProfileDto } from '../../../shared/dto/profile.dto';
import { useHeaderStore } from '../../../stores/header.store';

const getAllRolesService = new GetAllRolesService();
const getRoleRelatedDataFormService = new GetRoleRelatedDataFormService();
const deleteRoleService = new DeleteRoleService();

export default defineComponent({
  components: {
    AppConfirmDeleteModal,
    AppModal,
    RoleForm,
    AppButtonDelete,
    AppButtonEdit,
    AppLoading,
    AppBaseList,
    AppButtonNewContainer,
    AppCheckPermission,
    AppCard,
    AppButton,
  },
  name: 'RolesView',
  setup() {
    const title = 'Roles';
    const routes = [
      {
        name: title,
      },
    ];

    useMeta({
      title,
    });

    const loading = ref(true);
    const profiles: { value: ProfileDto[] } = reactive({ value: [] });
    const roles: { value: RoleDto[] } = reactive({ value: [] });

    onMounted(async () => {
      await getData();
      const response = await getRoleRelatedDataFormService.run();
      profiles.value = response.profiles;
      loading.value = false;
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Administración de Usuarios', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
    });

    const getData = async () => {
      roles.value = await getAllRolesService.run();
    };

    const modalForm = ref(false);
    const currentRole: { value: RoleDto | null } = reactive({
      value: null,
    });

    const openFormModal = (role: RoleDto | null = null) => {
      currentRole.value = role;
      modalForm.value = true;
    };

    const closeModalForm = () => {
      modalForm.value = false;
      getData();
    };

    const modalDelete = ref(false);

    const openModalDelete = (role: RoleDto) => {
      modalDelete.value = true;
      currentRole.value = role;
    };

    const closeModalDelete = async () => {
      modalDelete.value = false;
      await getData();
    };

    const deleteRole = async () => {
      try {
        await deleteRoleService.run(currentRole.value?.id as number);
        await closeModalDelete();
      } catch (e) {
        console.log('this error', e);
      }
    };
    return {
      title,
      routes,
      loading,
      profiles,
      roles,
      modalForm,
      currentRole,
      modalDelete,
      openFormModal,
      closeModalForm,
      openModalDelete,
      closeModalDelete,
      deleteRole,
    };
  },
});
</script>

<style scoped>
.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
  padding: 10px;
}

.container-items {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-width: 320px;
  min-width: 287px;
}

.container-new {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.buttons-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.button-righ {
  display: flex;
  justify-content: space-between;
}

.button-left {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.content-card {
  width: 100%;
  word-wrap: break-word;
}
</style>
