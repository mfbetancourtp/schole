<template>
  <AppBaseList :title="title">
    <template #actions>
      <!--  <AppButtonBack :to="{ name: 'access.usersEdit', params: { userId } }" />   -->
      <AppButtonBack :to="{ name: 'access.usersList' }"></AppButtonBack>

      <!--<AppButton style="color: white" label="core.save" @click="onSave = !onSave" /> -->
    </template>

    <template #content>
      <AppLoading v-if="loading" />

      <template v-else>
        <template v-if="user && selectedRole && selectedRole.profile.code == 'tutor'">
          <AppFormField label="core.generalTerms.academic.student.plural">
            <AppAutocomplete v-model="matriculateId" :options="user.lastMatriculatesChildren" label="studentName" :clearable="false" />
          </AppFormField>

          <hr class="mb-4" />
        </template>

        <AppLoading v-if="loadingMatriculate" />

        <template v-if="!loadingMatriculate && matriculate">
          <StudentFormFull :data="matriculate" />
        </template>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import { useHeaderStore } from '../../../stores/header.store';

import StudentFormFull from '../components/StudentFormFull.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
//import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { RoleDto } from '../../../shared/dto/role.dto';
import { UserDataDto } from '../../access/dtos/user.dto';
import { MatriculateDetailDto } from '../dto/matriculate.dto';

import { GetAllRolesService } from '../../access/services/getAllRoles.service';
import { GetMatriculatesByIdService } from '../services/getMatriculatesById.service';
import { GetUserToEditByIdService } from '../../access/services/getUserToEditById.service';

const getMatriculatesByIdService = new GetMatriculatesByIdService();
const getUserToEditByIdService = new GetUserToEditByIdService();
const getAllRolesService = new GetAllRolesService();

export default defineComponent({
  name: 'DetailMatriculate',

  components: {
    AppAutocomplete,
    StudentFormFull,
    AppButtonBack,
    AppFormField,
    AppBaseList,
    AppLoading,
    //AppButton,
  },

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const title = 'academicAdministration.matriculates.editPage.title';

    const userId = route.params.userId;

    useMeta({ title: t(title) });
    const headerStorage = useHeaderStore();
    headerStorage.module = { name: 'core.menu.usersManagement', url: '' };
    headerStorage.moduleItem = { name: title, url: '' };
    headerStorage.moduleSubItem = { name: '', url: '' };

    const matriculate: Ref<MatriculateDetailDto | null> = ref(null);
    const matriculateId: Ref<number | null> = ref(null);
    const selectedRole: Ref<RoleDto | null> = ref(null);
    const user: Ref<UserDataDto | null> = ref(null);
    const roles: Ref<RoleDto[]> = ref([]);

    const loadingMatriculate = ref(true);
    //const onSave = ref(false);
    const loading = ref(true);

    onMounted(async () => {
      try {
        user.value = await getUserToEditByIdService.run(userId);
        roles.value = await getAllRolesService.run();

        selectedRole.value =
          roles.value.find((item) => {
            return user.value?.roles.includes(item.id);
          }) ?? null;

        if (user.value && user.value.lastMatriculatesChildren.length) {
          matriculateId.value = user.value.lastMatriculatesChildren[0].id;
        } else if (user.value && user.value.lastMatriculate) {
          matriculateId.value = user.value.lastMatriculate.id;
        }
      } catch (e) {
        console.log(e);
      }

      setTimeout(() => (loading.value = false), 500);
    });

    watch(matriculateId, async () => {
      await getMetriculate();
    });

    const getMetriculate = async () => {
      loadingMatriculate.value = true;

      try {
        if (matriculateId.value) {
          matriculate.value = await getMatriculatesByIdService.run(matriculateId.value);
          console.log(matriculate.value);
        }
      } catch (e) {
        console.log('err', e);
      }

      loadingMatriculate.value = false;
    };

    return {
      loading,
      userId,
      title,
      t,

      loadingMatriculate,
      matriculateId,
      selectedRole,
      matriculate,
      // onSave,
      user,

      //getMetriculate,
    };
  },
});
</script>
