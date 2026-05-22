<template>
  <form @submit.prevent="save">
    <!--Contraseña Anterior -->
    <div class="form-row">
      <AppFormFieldLogin class="input-user" :formControl="v$.form.oldPassword">
        <input :type="showOldPassword ? 'text' : 'password'" class="form__input" id="oldPassword" placeholder=" " v-model="v$.form.oldPassword.$model" />
        <label for="oldPassword" class="form__label">Contraseña actual</label>
        <button class="form__icon" type="button" @click="showOldPassword = !showOldPassword">
          <AppGetIcon :name="showOldPassword ? 'icon-pass-view' : 'icon-pass'" :fillColor="'var(--color-primary)'" :strokeColor="'var(--color-secundary)'" />
        </button>
      </AppFormFieldLogin>
    </div>

    <!-- Nueva Contraseña -->
    <div class="form-row">
      <AppFormFieldLogin class="input-user" :formControl="v$.form.password">
        <input :type="showPassword ? 'text' : 'password'" class="form__input" id="password" placeholder=" " v-model="v$.form.password.$model" />
        <label for="password" class="form__label">Nueva contraseña</label>
        <button class="form__icon" type="button" @click="showPassword = !showPassword">
          <AppGetIcon :name="showPassword ? 'icon-pass-view' : 'icon-pass'" :fillColor="'var(--color-primary)'" :strokeColor="'var(--color-secundary)'" />
        </button>
      </AppFormFieldLogin>
    </div>

    <!-- Confirmar Contraseña -->
    <div class="form-row">
      <AppFormFieldLogin class="input-user" :formControl="v$.form.passwordConfirmation">
        <input :type="passwordConfirmation ? 'text' : 'password'" class="form__input" id="passwordConfirmation" placeholder=" " v-model="v$.form.passwordConfirmation.$model" />
        <label for="passwordConfirmation" class="form__label">Confirmar contraseña</label>
        <button class="form__icon" type="button" @click="passwordConfirmation = !passwordConfirmation">
          <AppGetIcon :name="passwordConfirmation ? 'icon-pass-view' : 'icon-pass'" :fillColor="'var(--color-primary)'" :strokeColor="'var(--color-secundary)'" />
        </button>
      </AppFormFieldLogin>
    </div>

    <div class="button-save d-flex justify-content-end mt-3">
      <AppButton @click="save" class="button-login__start"> Cambiar contraseña </AppButton>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { useMeta } from 'vue-meta';

import AppFormFieldLogin from './AppFormFieldLogin.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppGetIcon from '../../../shared/components/AppGetIcon.vue';

import { PasswordChangeProfileService } from '../services/passwordChange.service';
import { settings } from '../../../shared/constant/settings.contants';
import { required, sameAs } from '../../../shared/plugins/vuelidate.plugin';

const passwordChangeService = new PasswordChangeProfileService();

export default defineComponent({
  name: 'ChangePasswordLoggedForm',
  components: { AppButton, AppGetIcon, AppFormFieldLogin },
  emits: ['close'],
  setup(_, { emit }) {
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
        await passwordChangeService.run(form);
        resetForm();
        emit('close');
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
  padding-right: 40px;
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
}
.form__input {
  width: 100%;
  height: 48px;
  display: block;
  padding: 0px 0px 0px 17px;
  border-radius: 8px;
  border: 0;
  outline: 1px solid #5b5f62;
}
.form__input:focus {
  outline: solid 2px var(--color-secondary);
}

.form__input:focus + .form__label {
  transform: translateY(-1.6rem);
  font-size: 16px;
  color: var(--color-secondary);
}

.form__input:not(:placeholder-shown) + .form__label {
  transform: translateY(-1.6rem);
  transition: 0.5s;
  font-size: 16px;
}
.form__label {
  position: absolute;
  top: 12px;
  background: white;
  margin: 0px 0px 0px 13px;
  color: #5b5f62;
  transition: all 0.5s;
  /* font-family: 'Roboto'; */
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
}
.input-user {
  position: relative;
  width: 100%;
  margin: 14px 0px 14px 0px;
}
.form__icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: unset;
  right: 14px;
}

.button-login__start {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  padding: 8px 10px;
  background: var(--color-primary);
  box-shadow: 1px 2px 6px rgba(0, 0, 0, 0.4);
  color: #ffffff;
  font-style: normal;
  font-weight: 400;
  font-size: 18px;
  line-height: 24px;
  border: none;
}
</style>
