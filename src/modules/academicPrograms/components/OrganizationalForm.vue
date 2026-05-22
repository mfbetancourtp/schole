<template>
  <form @submit.prevent="submit">
    <AppFormModal :title="title">
      <template #content>
        <AppFormField :form-control="v$.form.name" :label="'Nombre'">
          <input class="form-control" type="text" id="name" v-model="v$.form.name.$model" />
        </AppFormField>

        <AppFormField :form-control="v$.form.code" :label="'Código'">
          <input class="form-control" type="text" id="code" v-model="v$.form.code.$model" />
        </AppFormField>

        <AppFormField :form-control="v$.form.description" :label="'Descripción'">
          <textarea class="form-control" id="description" rows="3" v-model="v$.form.description.$model" />
        </AppFormField>

        <AppFormField :form-control="v$.form.directorUserId" :label="'Director'">
          <AppAutocomplete v-model="v$.form.directorUserId.$model" label="name" :options="listUsers" :clearable="false" placeholder="Buscar director..." @search="onSearchUser"></AppAutocomplete>
        </AppFormField>
      </template>

      <template #actions>
        <AppButton :label="'core.save'" :nativeType="'submit'" />
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, onMounted, ref, PropType, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, maxLength } from '../../../shared/plugins/vuelidate.plugin';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import { GetUsersForSelectService } from '../../../shared/services/getUsersForSelect.service';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import { debounce } from 'ts-debounce';

const getUsersForSelectService = new GetUsersForSelectService();

type OrgEntityType = 'campus' | 'faculty' | 'department' | 'program';

type OrgFormModel = {
  mode: 'create' | 'edit';
  uiId?: string;
  entityType: OrgEntityType;
  entityLabel: string;
  name: string;
  code: string;
  description: string;
  parentId: string | null;
  directorUserId?: number | null;
};

type UserOption = {
  id: number;
  name: string;
};

export default defineComponent({
  name: 'OrganizationalForm',
  components: { AppButton, AppFormModal, AppFormField, AppAutocomplete },

  props: {
    data: {
      type: Object as PropType<OrgFormModel>,
      required: true,
    },
  },

  emits: ['close', 'submit'],

  setup(props, { emit }) {
    const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
    const getCreateTitle = (entityLabel: string) => {
      const article = entityLabel === 'sede' || entityLabel === 'facultad' ? 'Nueva' : 'Nuevo';
      return `${article} ${capitalize(entityLabel)}`;
    };

    const title = computed(() => {
      const entityLabel = props.data?.entityLabel ?? 'unidad';
      return props.data?.mode === 'edit' ? `Editar ${capitalize(entityLabel)}` : getCreateTitle(entityLabel);
    });

    const listUsers = ref<UserOption[]>([]);
    const selectedDirectorOption = ref<UserOption | null>(null);

    const form = reactive<OrgFormModel>({
      mode: props.data?.mode ?? 'create',
      uiId: props.data?.uiId,
      entityType: props.data?.entityType ?? 'campus',
      entityLabel: props.data?.entityLabel ?? 'sede',
      name: props.data?.name ?? '',
      code: props.data?.code ?? '',
      description: props.data?.description ?? '',
      parentId: props.data?.parentId ?? null,
      directorUserId: props.data?.directorUserId ?? null,
    });

    const v$ = useVuelidate(
      {
        form: {
          name: { required, maxLength: maxLength(120) },
          code: { required, maxLength: maxLength(30) },
          description: { maxLength: maxLength(500) },
          parentId: {},
          directorUserId: { required },
        },
      },
      { form }
    );

    const mapUserOption = (user: any): UserOption => ({
      id: user.id,
      name: user.people ? `${user.people.names} ${user.people.lastnames}` : user.name,
    });

    const syncSelectedDirector = (options: UserOption[]) => {
      const selectedOption = options.find((option) => option.id === form.directorUserId) ?? selectedDirectorOption.value;

      selectedDirectorOption.value = selectedOption ?? null;
      listUsers.value = selectedDirectorOption.value ? [selectedDirectorOption.value, ...options.filter((option) => option.id !== selectedDirectorOption.value?.id)] : options;
    };

    onMounted(async () => {
      try {
        if (!props.data?.directorUserId) return;

        const response = await getUsersForSelectService.run({
          id: props.data.directorUserId,
        });
        const users = response.data || response;

        syncSelectedDirector(users.map((user: any) => mapUserOption(user)));
      } catch (e) {
        console.error('Error al cargar director actual', e);
      }
    });

    watch(
      () => form.directorUserId,
      (directorUserId) => {
        if (!directorUserId) {
          selectedDirectorOption.value = null;
          return;
        }

        const selectedOption = listUsers.value.find((option) => option.id === directorUserId);
        if (selectedOption) {
          selectedDirectorOption.value = selectedOption;
          syncSelectedDirector(listUsers.value);
        }
      }
    );

    const onSearchUser = debounce(async (search: string, loading: (value: boolean) => void) => {
      if (!search || search.length < 3) {
        syncSelectedDirector(selectedDirectorOption.value ? [selectedDirectorOption.value] : []);
        return;
      }

      loading(true);
      try {
        const response = await getUsersForSelectService.run({ search });
        syncSelectedDirector((response.data || response).map((u: any) => mapUserOption(u)));
      } catch (e) {
        console.error('Error al buscar usuarios', e);
      } finally {
        loading(false);
      }
    }, 500);

    const emitClose = () => emit('close');

    const submit = async () => {
      const ok = await v$.value.$validate();
      if (!ok) return;

      emit('submit', {
        ...form,
        name: form.name.trim(),
        code: form.code.trim(),
        description: form.description?.trim() || '',
        parentId: form.parentId ? String(form.parentId).trim() : null,
        directorUserId: form.directorUserId,
      });
    };

    return {
      title,
      v$,
      submit,
      emitClose,
      listUsers,
      onSearchUser,
    };
  },
});
</script>

<style scoped></style>
