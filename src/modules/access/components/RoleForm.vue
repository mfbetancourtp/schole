<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title" @closed="emit('close')">
      <template v-slot:content>
        <AppFormField :form-control="v$.form.name" label="Nombre">
          <input
            type="text"
            class="form-control"
            v-model="v$.form.name.$model"
            id="name"
            pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
            title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
          />
        </AppFormField>

        <AppFormField :form-control="v$.form.description" label="Descripción">
          <AppVoiceInput v-model="v$.form.description.$model" textareaClass="form-control" />
        </AppFormField>

        <AppFormField :form-control="v$.form.profileId" label="Perfil">
          <AppAutocomplete v-model="v$.form.profileId.$model" :input-id="'profileId'" :options="profiles"></AppAutocomplete>

          <div v-if="profile" class="form-text text-muted tw-flex tw-items-center tw-gap-2">
            <AppIcon icon="exclamation-circle"></AppIcon>
            <span>{{ profile.description }}</span>
          </div>
        </AppFormField>

        <div>
          <label>Requiere firma?</label>
        </div>

        <div class="d-flex">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="isSignatureRequired" v-model="v$.form.isSignatureRequired.$model" />
          </div>
        </div>
      </template>

      <template v-slot:actions>
        <AppButton label="core.save"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, reactive } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { useVuelidate } from '@vuelidate/core';

import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { ProfileDto } from '../../../shared/dto/profile.dto';

import { CreateOrUpdateRoleService } from '../services/createOrUpdateRole.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateRoleService = new CreateOrUpdateRoleService();

export default defineComponent({
  name: 'RoleForm',
  components: {
    AppAutocomplete,
    AppFormField,
    AppFormModal,
    AppButton,
    AppIcon,
    AppVoiceInput,
  },

  props: ['data', 'profiles'],
  emits: ['close'],

  setup(props, { emit }) {
    let title = 'Nuevo rol';
    const data = props.data ?? null;
    console.log('hoala hose2');

    if (props.data?.id) title = 'Editar rol';

    const form = reactive({
      name: data?.name,
      description: data?.description,
      profileId: data?.profileId,
      isSignatureRequired: data?.isSignatureRequired ? true : false,
    });

    const profile: ComputedRef<ProfileDto | null> = computed(() => {
      return props.profiles.find((prof: ProfileDto) => prof.id === form.profileId);
    });

    const v$ = useVuelidate(
      {
        form: {
          name: { required },
          description: { required },
          profileId: {},
          isSignatureRequired: {},
        },
      },
      { form }
    );

    const save = async () => {
      const formIsValid = await v$.value.$validate();

      if (!formIsValid) return;

      try {
        await createOrUpdateRoleService.run(form, data?.id);

        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      profile,
      title,
      save,
      v$,
      emit,
    };
  },
});
</script>
