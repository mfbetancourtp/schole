<template>
  <AppBaseList :title="title" isCard>
    <template #actions>
      <AppButtonBack :to="{ name: 'access.usersList' }"></AppButtonBack>
      <!-- <template v-if="data?.lastMatriculate || data?.lastMatriculatesChildren.length">
        <AppCheckPermission permission="academicAdministration.matriculates.edit">
          <AppButton
            label="core.details"
            style="color: white"
            :to="{
              name: 'academicAdministration.detailMatriculate',
              params: { userId: data.user.id },
            }"
          />
        </AppCheckPermission>
      </template>-->
      <AppButton style="color: white" label="core.save" @click="saveMain"></AppButton>
    </template>

    <template #content>
      <div>
        <form @submit.prevent="validateIdentification" v-if="!validateUser">
          <h5 class="h6 mb-4">
            {{ t('access.users.form.validateIdentificationText') }}
          </h5>

          <AppFormField :form-control="formIdentification$.form.identification">
            <label for="identification">Identificación</label>
            <input id="identification" type="text" class="form-control" v-model="formIdentification$.form.identification.$model" />
          </AppFormField>

          <div class="d-flex justify-content-center">
            <AppButton> Continuar </AppButton>
          </div>
        </form>
        <form @submit.prevent="save" v-else>
          <h5 class="h6">{{ t('access.users.form.personalInformation') }}</h5>
          <div class="form-row">
            <AppFormField :form-control="v$.form.people.identification">
              <label for="identification">Identificación</label>
              <input type="text" class="form-control" disabled v-model="v$.form.people.identification.$model" />
            </AppFormField>

            <AppFormField :form-control="v$.form.people.names">
              <label for="names">Nombres</label>
              <input type="text" class="form-control" v-model="v$.form.people.names.$model" />
            </AppFormField>

            <AppFormField :form-control="v$.form.people.lastnames">
              <label for="lastnames">Apellidos</label>
              <input type="text" class="form-control" v-model="v$.form.people.lastnames.$model" />
            </AppFormField>
          </div>

          <div class="form-row">
            <AppFormField :form-control="v$.form.people.email">
              <label for="email">Email</label>
              <input type="text" class="form-control" v-model="v$.form.people.email.$model" />
            </AppFormField>

            <AppFormField :form-control="v$.form.people.mobile">
              <label for="mobile">Celular</label>
              <input type="text" class="form-control" v-model="v$.form.people.mobile.$model" />
            </AppFormField>
          </div>

          <h5 class="h6">{{ t('access.users.form.userData') }}</h5>

          <div class="form-row">
            <AppFormField :form-control="v$.form.user.username">
              <label for="username">Nombre de usuario</label>
              <input type="text" class="form-control" v-model="v$.form.user.username.$model" />
            </AppFormField>

            <AppFormField :form-control="v$.form.user.password">
              <label for="password">Contraseña</label>
              <input id="password" type="password" class="form-control" v-model="v$.form.user.password.$model" />
            </AppFormField>

            <AppFormField :form-control="v$.form.user.passwordConfirmation">
              <label for="passwordConfirmation">Confirmar contraseña</label>
              <input id="passwordConfirmation" type="password" class="form-control" v-model="v$.form.user.passwordConfirmation.$model" />
            </AppFormField>
          </div>

          <div class="form-row">
            <AppFormField :form-control="v$.form.roles">
              <label for="roles">Roles</label>
              <v-select input-id="roles" :options="roles.value" label="name" :reduce="(role) => role.id" multiple v-model="v$.form.roles.$model"></v-select>
            </AppFormField>
          </div>
        </form>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';
import { required, requiredIf, sameAs } from '../../../shared/plugins/vuelidate.plugin';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

import { CheckIfUserExistOnInstitutionByIdentificationService } from '../services/checkIfUserExistOnInstitutionByIdentification.service';
import { CreateOrUpdateUserDto } from '../dtos/createOrUpdateUser.dto';
import { GetUsersRelatedDataFormService } from '../services/getUsersRelatedDataForm.service';
import { RoleDto } from '../../../shared/dto/role.dto';
import { CreateOrUpdateUserService } from '../services/createOrUpdateUser.service';
import { useRouter } from 'vue-router';

const checkIfUserExistOnInstitutionByIdentificationService = new CheckIfUserExistOnInstitutionByIdentificationService();
const getUsersRelatedDataFormService = new GetUsersRelatedDataFormService();
const createOrUpdateUserService = new CreateOrUpdateUserService();

export default defineComponent({
  name: 'UserForm',
  components: { AppFormField, AppButton, AppButtonBack, AppBaseList },
  props: ['title', 'routes', 'data'],
  setup(props) {
    const { t } = useI18n();
    const router = useRouter();

    const data: { value: CreateOrUpdateUserDto | null } = reactive({
      value: props.data,
    });
    const validateUser = ref(false);

    const formIdentification = reactive({
      identification: '',
    });

    const formIdentification$ = useVuelidate(
      {
        form: {
          identification: { required },
        },
      },
      { form: formIdentification }
    );

    const roles: { value: RoleDto[] } = reactive({
      value: [],
    });

    const form: any = reactive({
      people: {
        names: null,
        lastnames: null,
        email: null,
        mobile: null,
        identification: null,
      },
      user: {
        username: null,
        password: null,
        passwordConfirmation: null,
      },
      roles: [],
    });

    const passwordRef = computed(() => form.user.password);

    const v$ = useVuelidate(
      {
        form: {
          people: {
            names: { required },
            lastnames: { required },
            email: { required },
            mobile: {},
            identification: { required },
          },
          user: {
            username: { required },
            password: {
              requiredIf: requiredIf(() => {
                return !data.value?.isUserCreate;
              }),
            },
            passwordConfirmation: {
              requiredIf: requiredIf(() => {
                return !!form.user.password;
              }),
              sameAs: sameAs(passwordRef, 'Contraseña'),
            },
          },
          roles: { required },
        },
      },
      { form }
    );

    const initForm = async (identification: string) => {
      form.people.identification = identification;
      form.people.names = data.value?.people.names;
      form.people.lastnames = data.value?.people.lastnames;
      form.people.email = data.value?.people.email;
      form.people.mobile = data.value?.people.mobile;
      form.user.username = data.value?.user.username;
      form.roles = data.value?.roles;

      const response = await getUsersRelatedDataFormService.run();

      roles.value = response.roles;
    };

    onMounted(() => {
      if (data.value?.user.id) {
        validateUser.value = true;
        initForm(data.value?.people.identification);
      }
    });

    const saveMain = async () => {
      if (!validateUser.value) {
        await validateIdentification();
      } else {
        await save();
      }
    };

    const validateIdentification = async () => {
      const isValid = await formIdentification$.value.$validate();

      if (!isValid) return;

      try {
        const response = await checkIfUserExistOnInstitutionByIdentificationService.run(formIdentification.identification);

        validateUser.value = true;
        data.value = response;

        await initForm(formIdentification.identification);
      } catch (e) {
        console.log('error', e);
      }
    };

    const save = async () => {
      const isValid = await v$.value.$validate();

      if (!isValid) return;

      try {
        const dataSend: CreateOrUpdateUserDto = {
          isUserCreate: data.value?.isUserCreate ?? false,
          people: {
            id: data.value?.people?.id ?? null,
            names: form.people.names,
            lastnames: form.people.lastnames,
            email: form.people.email,
            mobile: form.people.mobile,
            identification: form.people.identification,
          },
          user: {
            id: data.value?.user?.id ?? null,
            username: form.user.username,
            password: form.user.password,
            passwordConfirmation: form.user.passwordConfirmation,
          },
          roles: form.roles,
        };

        await createOrUpdateUserService.run(dataSend);

        await router.push({
          name: 'access.usersList',
        });
      } catch (e) {
        console.log('error', e);
      }
    };

    return {
      t,
      formIdentification$,
      v$,
      validateUser,
      roles,
      saveMain,
      validateIdentification,
      save,
    };
  },
});
</script>

<style scoped></style>
