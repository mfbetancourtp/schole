<template>
  <AppBaseList :title="title" :subtitle="subtitle" isCard>
    <template #actions>
      <AppButtonBack :to="routes[0].url"></AppButtonBack>
    </template>

    <template #content>
      <AppLoading v-if="loading"></AppLoading>

      <div v-else>
        <div class="card-body">
          <div class="row">
            <div class="col-12 col-md-6 offset-md-6 col-lg-4 offset-lg-8">
              <AppFormField>
                <label for="module">Módulo</label>
                <v-select input-id="module" v-model="moduleId" :options="modules.value" label="name"
                  :reduce="(module: any) => module.id"></v-select>
              </AppFormField>
            </div>
            <div class="col-12">
              <table class="table">
                <thead>
                  <tr>
                    <th>Aplicación</th>
                    <th v-for="(permission, index) in permissions" :key="index" style="width: 10%">
                      {{ t('access.permissions.' + permission) }}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="(item, index) in items.value" :key="index">
                    <td>
                      <div :class="{
                        'tw-pl-5': item.itemParentId && item.showMenu,
                        'tw-pl-10': item.itemParentId && !item.showMenu,
                      }">
                        <AppIcon :icon="item.icon ?? 'angle-down'" class="me-2"></AppIcon>
                        <AppBadge variant="primary" v-if="!item.itemParentId && item.children.length">{{ t(item.name) }}
                        </AppBadge>
                        <span v-else>{{ t(item.name) }}</span>
                      </div>
                    </td>
                    <td v-for="permission in permissions" :key="`permission_${permission}_${item.id}`">
                      <template v-if="item.itemParentId || !item.children?.length">
                        <select class="form-control"
                          v-if="item.rolePermissions && item.rolePermissions[permission] && item.rolePermissions[permission].data.length"
                          v-model="item.rolePermissions[permission].selectedPermissionId"
                          @change="changePermission(item, permission)">
                          <option :value="0">No</option>
                          <option v-for="elementPermission in item.rolePermissions[permission].data"
                            :value="elementPermission.id" :key="`element_permission_${elementPermission.id}_${item.id}`">
                            {{ t(elementPermission.name) }}
                          </option>
                        </select>
                      </template>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref, watch } from 'vue';
import { useMeta } from 'vue-meta';
import { useRoute } from 'vue-router';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBadge from '../../../shared/components/AppBadge.vue';

import { RoleDto } from '../../../shared/dto/role.dto';
import { GetRelatedDataFormPermissionsService } from '../services/getRelatedDataFormPermissions.service';
import { ModuleDto } from '../../../shared/dto/module.dto';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import { GetItemsWithPermissionsService } from '../services/getItemsWithPermissions.service';
import { useI18n } from 'vue-i18n';
import { ItemDto } from '../../../shared/dto/item.dto';
import AppIcon from '../../../shared/components/AppIcon.vue';
import { DeleteItemRolePermissionsService } from '../services/deleteItemRolePermissions.service';
import { CreateOrUpdateItemRolePermissionsService } from '../services/createOrUpdateItemRolePermissions.service';
import { useHeaderStore } from '../../../stores/header.store';

const getRelatedDataFormPermissionsService = new GetRelatedDataFormPermissionsService();
const getItemsWithPermissionsService = new GetItemsWithPermissionsService();
const createOrUpdateItemRolePermissionsService = new CreateOrUpdateItemRolePermissionsService();
const deleteItemRolePermissionsService = new DeleteItemRolePermissionsService();

export default defineComponent({
  name: 'PermissionsPage',
  components: {
    AppIcon,
    AppFormField,
    AppLoading,
    AppButtonBack,
    AppBaseList,
    AppBadge,
  },
  setup() {
    const title = 'Permisos';
    let subtitle = ref('Configure los permisos del rol ');
    const routes = [
      {
        name: 'Roles',
        url: {
          name: 'access.rolesList',
        },
      },
      {
        name: title,
      },
    ];

    useMeta({
      title,
    });

    const { t } = useI18n();

    const loading = ref(true);
    // const loadingPermissions = ref(false);
    const route = useRoute();
    const roleId = parseInt(route.params.roleId.toString());
    const role: { value: RoleDto | null } = reactive({
      value: null,
    });

    const modules: { value: ModuleDto[] } = reactive({
      value: [],
    });
    const moduleId = ref();
    const permissions = ['list', 'create', 'edit', 'delete'];
    const items: { value: ItemDto[] } = reactive({
      value: [],
    });

    onMounted(async () => {
      const response = await getRelatedDataFormPermissionsService.run(roleId);

      role.value = response.role;
      subtitle.value = role.value?.name;
      modules.value = response.modulesInstitution;

      if (response.modulesInstitution.length) {
        moduleId.value = response.modulesInstitution[0].id;
      }
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Administración de Usuarios', url: '' };
      headerStorage.moduleItem = { name: 'roles', url: '' };
      headerStorage.moduleSubItem = { name: title + " " + subtitle.value, url: '' };

      loading.value = false;
    });

    watch(moduleId, async () => {
      await getItemsWithPermissions();
    });

    const getItemsWithPermissions = async () => {
      try {
        const response = await getItemsWithPermissionsService.run({
          moduleId: moduleId.value,
          roleId,
        });

        const newData: ItemDto[] = [];
        response.forEach((item) => {
          if (!item.itemParentId) {
            newData.push(item);
          }

          item.children.forEach((child) => {
            newData.push(child);
          });
        });

        newData.forEach((item) => {
          if (item.rolePermissions) {
            const keys = Object.keys(item.rolePermissions);

            keys.forEach((key) => {
              item.rolePermissions[key].selectedPermissionId = item.rolePermissions[key].selectedPermissionId ?? 0;
            });
          }
        });

        items.value = newData;
      } catch (e) {
        console.log('error', e);
      }
    };

    const createOrUpdatePermission = async (data: any, id: number) => {
      try {
        await createOrUpdateItemRolePermissionsService.run(data, id);
      } catch (e) {
        console.log('error', e);
      }
    };

    const deletePermission = async (id: number) => {
      try {
        await deleteItemRolePermissionsService.run(id);
      } catch (e) {
        console.log('error', e);
      }
    };

    const changePermission = async (item: ItemDto, permission: string) => {
      const itemRolePermission = item.rolePermissions[permission];
      const itemRolePermissionId = itemRolePermission.itemRolePermissionId;
      const selectedPermissionId = itemRolePermission.selectedPermissionId;

      if (itemRolePermissionId && selectedPermissionId === 0) {
        await deletePermission(itemRolePermissionId);
        await getItemsWithPermissions();
      } else if (selectedPermissionId) {
        const data = {
          roleId,
          itemId: item.id,
          permissionId: selectedPermissionId,
        };

        await createOrUpdatePermission(data, itemRolePermissionId);
        await getItemsWithPermissions();
      }
    };

    return {
      title,
      subtitle,
      routes,
      loading,
      modules,
      moduleId,
      permissions,
      t,
      items,
      changePermission,
    };
  },
});
</script>

<style scoped></style>
