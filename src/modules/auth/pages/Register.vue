<template>
  <div class="register-container">
    <div class="login-container__content">
      <div class="login-header">
        <div class="form__logo">
          <img class="logo-icon" :src="appLogo?.toString()" />
        </div>
        <div class="login-header_title">
          <div class="form__title">¡Crea una nueva cuenta!</div>
        </div>
      </div>

      <form action="" @submit.prevent="register">
        <p class="">Datos de la institución educativa</p>

        <AppErrorAlert></AppErrorAlert>

        <div class="form-row">
          <AppFormFieldLogin class="input-rut" :form-control="v$.form.institution.identification">
            <input type="text" class="form__input" id="textNit" placeholder=" " v-model="v$.form.institution.identification.$model" />
            <label for="textNit" class="form__label">Nit</label>
            <AppGetIcon class="form__icon" name="icon-institucion" fillColor="#F04242" strokeColor="#FFFF" />
          </AppFormFieldLogin>

          <AppFormFieldLogin class="input-name" :form-control="v$.form.institution.name">
            <input type="text" class="form__input" id="textName" placeholder=" " v-model="v$.form.institution.name.$model" />
            <label for="textName" class="form__label">Nombre</label>
            <AppGetIcon class="form__icon" name="Icon-person" fillColor="#FFFF" strokeColor="#F04242" />
          </AppFormFieldLogin>
        </div>
        <div class="form-row">
          <AppFormFieldLogin class="input-telephone" :form-control="v$.form.institution.phone">
            <input type="text" class="form__input" id="textPhone" placeholder=" " v-model="v$.form.institution.phone.$model" />
            <label for="textPhone" class="form__label">Celular / Teléfono</label>
            <AppGetIcon class="form__icon" name="Icon-telephone" fillColor="#F04242" strokeColor="#FFFF" />
          </AppFormFieldLogin>

          <AppFormFieldLogin class="input-city" :form-control="v$.form.institution.municipalityId">
            <AppAutocomplete v-model="v$.form.institution.municipalityId.$model" :label="'MunicipalityRegionName'" :options="municipalities.value" @search="searchMunicipalities"></AppAutocomplete>
            <label for="textCity" class="form__label">Ciudad</label>
          </AppFormFieldLogin>
        </div>
        <div class="form-row">
          <AppFormFieldLogin class="input-email" :form-control="v$.form.user.userToken">
            <input type="text" class="form__input" id="textEmail" placeholder=" " v-model="v$.form.user.userToken.$model" />
            <label for="textEmail" class="form__label">Email</label>
            <AppGetIcon class="form__icon" name="Icon-email" fillColor="#F04242" strokeColor="#FFFF" />
          </AppFormFieldLogin>

          <AppFormFieldLogin class="input-password" :form-control="v$.form.user.password">
            <input :type="showPassword ? 'text' : 'password'" class="form__input" id="textPassword" placeholder=" " v-model="v$.form.user.password.$model" />
            <label for="textPassword" class="form__label">Contraseña</label>
            <button class="form__icon" type="button" @click="showPassword = !showPassword">
              <AppGetIcon :name="showPassword ? 'icon-pass-view' : 'icon-pass'" fillColor="#F04242" strokeColor="#F04242" />
            </button>
          </AppFormFieldLogin>
        </div>
        <div class="form-row_column">
          <AppFormFieldLogin class="confirm-password" :form-control="v$.form.user.passwordConfirmation">
            <input :type="showNewPassword ? 'text' : 'password'" class="form__input" id="textConfirmPassword" placeholder=" " v-model="v$.form.user.passwordConfirmation.$model" />
            <label for="textConfirmPassword" class="form__label">Confirmar contraseña</label>
            <button class="form__icon" type="button" @click="showNewPassword = !showNewPassword">
              <AppGetIcon :name="showNewPassword ? 'icon-pass-view' : 'icon-pass'" fillColor="#F04242" strokeColor="#F04242" />
            </button>
          </AppFormFieldLogin>
        </div>
        <div class="button-create">
          <button class="button-login__start">Crear la cuenta</button>
        </div>
        <div class="text-center mt-2">
          <router-link to="/auth/login"> ¿Ya te encuentras registrado?, Inicia sesión </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { debounce } from 'ts-debounce';
import { settings } from '../../../shared/constant/settings.contants';

import AppErrorAlert from '../../../shared/components/AppErrorAlert.vue';
import AppFormFieldLogin from '../components/AppFormFieldLogin.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppGetIcon from '../../../shared/components/AppGetIcon.vue';

import { MunicipalityDto } from '../../../shared/dto/municipality.dto';

import { GetMunicipalitiesService } from '../services/getMunicipalities.service';
import { RegisterCustomerService } from '../services/registerCustomer.service';

const getMunicipalitiesService = new GetMunicipalitiesService();
const registerCustomerService = new RegisterCustomerService();

export default defineComponent({
  name: 'RegisterCostumer',
  components: {
    AppAutocomplete,
    AppErrorAlert,
    AppFormFieldLogin,
    AppGetIcon,
  },

  setup() {
    const router = useRouter();
    const route = useRoute();
    const appLogo = settings.appLogo;
    const showPassword = ref(false);
    const showNewPassword = ref(false);
    const query = route.query;

    // colocar un header
    // const title = 'Registrarse';
    // const subtitle = 'Deseas implementar contenidos de calidad en tu Institución Educativa?. Regístrate y nos pondremos en contacto contigo';

    const municipalities: { value: MunicipalityDto[] } = reactive({
      value: [],
    });

    const loading = ref(false);

    const form = reactive({
      institution: {
        identification: '',
        name: '',
        phone: '',
        municipalityId: '',
        email: '',
      },
      user: {
        userToken: '',
        password: '',
        passwordConfirmation: '',
      },
    });

    const v$ = useVuelidate(
      {
        form: {
          institution: {
            identification: { required },
            name: { required },
            phone: { required },
            municipalityId: { required },
            email: { required },
          },
          user: {
            userToken: { required },
            password: { required },
            passwordConfirmation: { required },
          },
        },
      },
      { form }
    );

    const register = async () => {
      form.institution.email = form.user.userToken;

      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      loading.value = true;

      try {
        await registerCustomerService.run(form);

        await router.push({
          name: 'auth.login',
          query,
        });
      } catch (e) {
        console.log('this error', e);
      }

      loading.value = false;
    };

    const searchMunicipalities = debounce(async (search: string, loading: Function) => {
      if (search) {
        loading(true);

        const response = await getMunicipalities(search);
        municipalities.value = response.data;

        loading(false);
      }
    }, 800);

    const getMunicipalities = (search: string) => {
      return getMunicipalitiesService.run({
        search,
        page: 1,
        perPage: 25,
      });
    };

    return {
      // subtitle,
      // title,
      v$,
      showPassword,
      showNewPassword,
      municipalities,
      loading,
      query,
      appLogo,
      searchMunicipalities,
      register,
    };
  },
});
</script>

<style scoped>
.register-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 800px;
  margin: auto;
}
.login-container__content {
  justify-content: center;
  width: 70%;
  display: flex;
  flex-direction: column;
  padding: 2rem 2rem;
  box-shadow: 1px 2px 6px #00000073;
  border-radius: 16px;
}

.container-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: space-between;
  background: #ffffff;
  box-shadow: 1px 2px 6px #00000073;
  border-radius: 4px;
  padding: 17px 24px;
}

.card-body {
  display: flex;
  flex-direction: column;
  padding: 2rem 2rem;
  box-shadow: 1px 2px 6px #00000073;
}

.form__logo {
  display: flex;
  justify-content: center;
  text-align: center;
}

.logo-icon {
  max-width: 260px;
}

.form__title {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  line-height: 32px;
  font-style: normal;
  font-weight: 400;
  width: 100%;
  padding: 0px 0px 17px 0px;
}

.form__icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: unset;
  right: 14px;
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

.form__label {
  position: absolute;
  top: 12px;
  background: white;
  margin: 0px 50px 0px 13px;
  color: #5b5f62;
  transition: all 0.5s;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
}

.input-city,
.input-telephone,
.input-email,
.input-password,
.confirm-password {
  position: relative;
  width: 100%;
  margin: 30px 0px 0px 0px;
}

.form__input:focus {
  outline: solid 2px #f04242;
}

.form__input:focus + .form__label {
  transform: translateY(-1.6rem);
  font-size: 16px;
  color: #f04242;
}

.form__input:not(:placeholder-shown) + .form__label {
  transform: translateY(-1.6rem);
  transition: 0.5s;
  font-size: 16px;
}

.form-row_column {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  width: 49%;
}

.button-create {
  margin: 16px 0px 24px 0px;
}

.button-login__start {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  padding: 8px 10px;
  background: #f04242;
  box-shadow: 1px 2px 6px rgba(0, 0, 0, 0.4);
  color: #ffffff;
  font-style: normal;
  font-weight: 400;
  font-size: 18px;
  line-height: 24px;
}
</style>
