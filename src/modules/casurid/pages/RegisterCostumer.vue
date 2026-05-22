<template>
  <AppBaseList :title="title" :subtitle="subtitle">
    <template v-slot:content>
      <form @submit.prevent="register">
        <div  >
          <div class="card-body">
            <p>Datos de la institución educativa</p>

            <AppErrorAlert></AppErrorAlert>

            <div class="form-row">
              <AppFormField :form-control="v$.form.institution.identification" :label="'Nit'">
                <input 
                  type="text" class="form-control" name="identification" id="identification"
                  v-model="v$.form.institution.identification.$model"
                />
              </AppFormField>

              <AppFormField :form-control="v$.form.institution.name" :label="'Nombre'">
                <input 
                  type="text" class="form-control" name="name" id="name" 
                  v-model="v$.form.institution.name.$model"
                />
              </AppFormField>

              <AppFormField :form-control="v$.form.institution.phone" :label="'Celular / Teléfono'">
                <input 
                  type="text" class="form-control" name="phone" id="phone"
                  v-model="v$.form.institution.phone.$model"
                />
              </AppFormField>
            </div>

            <div class="form-row">
              <AppFormField :form-control="v$.form.institution.municipalityId" :label="'Ciudad'">
                <AppAutocomplete
                  v-model="v$.form.institution.municipalityId.$model"
                  :label="'MunicipalityRegionName'"
                  :options="municipalities.value"
                  @search="searchMunicipalities"
                ></AppAutocomplete>
              </AppFormField>

              <AppFormField :form-control="v$.form.user.userToken" :label="'Email'">
                <input 
                  type="text" class="form-control" name="email" id="email" 
                  v-model="v$.form.user.userToken.$model"
                />
              </AppFormField>
            </div>

            <div class="form-row">
              <AppFormField :form-control="v$.form.user.password" :label="'Contraseña'">
                <input 
                  type="password" class="form-control" name="password" id="password"
                  v-model="v$.form.user.password.$model"
                />
              </AppFormField>

              <AppFormField :form-control="v$.form.user.passwordConfirmation" :label="'Confirmar contraseña'">
                <input 
                  type="password" class="form-control" name="confirm_password" id="confirm_password"
                  v-model="v$.form.user.passwordConfirmation.$model"
                />
              </AppFormField>
            </div>

            <div class="d-flex justify-content-center">
              <AppButton >
                Registrarme
              </AppButton>
            </div>

            <div class="text-center mt-2">
              <!-- <router-link :to="{ name: 'auth.login', query }"> -->
              <router-link to="/portal/login">
                ¿Ya te encuentras registrado?, Inicia sesión
              </router-link>
            </div>
          </div>
        </div>
      </form>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { debounce } from 'ts-debounce';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppErrorAlert from '../../../shared/components/AppErrorAlert.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { MunicipalityDto } from '../../../shared/dto/municipality.dto';

import { GetMunicipalitiesService } from '../services/getMunicipalities.service';
import { RegisterCustomerService } from '../services/registerCustomer.service';

const getMunicipalitiesService = new GetMunicipalitiesService();
const registerCustomerService = new RegisterCustomerService();

export default defineComponent({
  name: 'RegisterCostumer',
  components: {
    AppButton, 
    AppAutocomplete,
    AppErrorAlert, 
    AppFormField,
    AppBaseList, 
    AppLoading, 
  },

  setup() {
    const router = useRouter();
    const route = useRoute();
    
    const query = route.query;
    const title = 'Registrarse';
    const subtitle = 'Deseas implementar contenidos de calidad en tu Institución Educativa?. Regístrate y nos pondremos en contacto contigo';

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

    const v$ = useVuelidate({
      form: {
        institution: {
          identification: {required},
          name: {required},
          phone: {required},
          municipalityId: {required},
          email: {required},
        },
        user: {
          userToken: {required},
          password: {required},
          passwordConfirmation: {required},
        },
      },
    }, {form});

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
      } catch (e) {}

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
      subtitle,
      title,
      v$,

      municipalities,
      loading,
      query,

      searchMunicipalities,
      register,
    };
  },
});
</script>

<style scoped>

</style>