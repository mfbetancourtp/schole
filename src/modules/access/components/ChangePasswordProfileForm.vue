<template>
  <form @submit.prevent="save">
    <!--Contraseña Anterior -->
    <div class="form-row">
      <AppFormField :form-control="v$.form.oldPassword">
        <label for="oldPassword">Contraseña actual</label>
        <div class="input-container">
          <input :type="showOldPassword ? 'text' : 'password'" class="form-control" id="oldPassword" v-model="v$.form.oldPassword.$model" />
          <button class="form__icon" type="button" @click="showOldPassword = !showOldPassword">
            <AppGetIcon :name="showOldPassword ? 'icon-pass-view' : 'icon-pass'" :fillColor="'var(--color-primary)'" :strokeColor="'var(--color-secundary)'" />
          </button>
        </div>
      </AppFormField>
    </div>

    <div class="form-row">
      <!-- Nueva Contraseña -->
      <AppFormField :form-control="v$.form.password">
        <label for="password">Nueva contraseña</label>
        <div class="input-container">
          <input :type="showPassword ? 'text' : 'password'" class="form-control" id="password" v-model="v$.form.password.$model" />
          <button class="form__icon" type="button" @click="showPassword = !showPassword">
            <AppGetIcon :name="showPassword ? 'icon-pass-view' : 'icon-pass'" :fillColor="'var(--color-primary)'" :strokeColor="'var(--color-secundary)'" />
          </button>
        </div>
      </AppFormField>

      <!-- Confirmar Contraseña -->
      <AppFormField :form-control="v$.form.passwordConfirmation" class="mb-4">
        <label for="passwordConfirmation">Confirmar contraseña</label>
        <div class="input-container">
          <input :type="passwordConfirmation ? 'text' : 'password'" class="form-control" id="passwordConfirmation" v-model="v$.form.passwordConfirmation.$model" />
          <button class="form__icon" type="button" @click="passwordConfirmation = !passwordConfirmation">
            <AppGetIcon :name="passwordConfirmation ? 'icon-pass-view' : 'icon-pass'" :fillColor="'var(--color-primary)'" :strokeColor="'var(--color-secundary)'" />
          </button>
        </div>
      </AppFormField>
    </div>

    <div class="d-flex justify-content-end mt-3">
      <AppButton variant="primary" @click="save"> Cambiar contraseña </AppButton>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { useMeta } from 'vue-meta';

import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppGetIcon from '../../../shared/components/AppGetIcon.vue';

import { PasswordChangeProfileService } from '../services/passwordChangeProfile.service';
import { settings } from '../../../shared/constant/settings.contants';
import { required, sameAs } from '../../../shared/plugins/vuelidate.plugin';

const passwordChangeProfileService = new PasswordChangeProfileService();

export default defineComponent({
  name: 'ChangePasswordProfileForm',
  components: { AppButton, AppFormField, AppGetIcon },
  setup() {
    useMeta({
      title: 'Cambiar contraseña',
    });
    const appLogo = settings.appLogo;
    const token = localStorage.getItem('token') ?? '';
    const passwordValue = computed(() => form.password);

    const showOldPassword = ref<boolean>(false);
    const showPassword = ref<boolean>(false);
    const passwordConfirmation = ref<boolean>(false);
    const form = reactive({
      token: token,
      oldPassword: '',
      password: '',
      passwordConfirmation: '',
    });

    const v$ = useVuelidate(
      {
        form: {
          token: { required },
          oldPassword: { required },
          password: { required },
          passwordConfirmation: {
            required,
            sameAs: sameAs(passwordValue, 'Nueva contraseña'),
          },
        },
      },
      { form }
    );

    const resetForm = () => {
      form.oldPassword = '';
      form.password = '';
      form.passwordConfirmation = '';
      v$.value.$reset();
    };

    const save = async () => {
      const isValid = await v$.value.$validate();

      if (!isValid) return;

      try {
        await passwordChangeProfileService.run(form);
        resetForm();
      } catch (e) {
        console.error(e);
      }
    };

    return {
      appLogo,
      v$,
      save,
      showPassword,
      showOldPassword,
      passwordConfirmation,
    };
  },
});
</script>

<style scoped>
.login-container {
  max-width: 450px;
}

.img-main {
  max-width: 300px;
}
.cards-form-form {
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.18);
  border-radius: 20px;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-container input {
  width: 100%;
  padding-right: 60px; /* Espacio para el ícono */
}

.form__icon {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}
</style>
