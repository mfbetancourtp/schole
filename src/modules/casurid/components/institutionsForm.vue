<template>
  <form @submit.prevent="save">
    <AppBaseList :title="title" :routes="routes">
      <template #actions>
        <AppButtonBack v-if="!fromProfile" :to="{ name: 'casurid.institutionsList' }" />
        <AppButton label="core.save" style="color: white" @click="save" />
      </template>

      <template #content>
        <AppLoading v-if="loading" />
        <AppCard v-else>
          <template #body>
            <div class="form-row">
              <AppFormField :form-control="v$.form.institution.name" label="Nombre">
                <input
                  type="text"
                  class="form-control"
                  id="name"
                  v-model="v$.form.institution.name.$model"
                  pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\\s\\-,_;.@()]+$"
                  title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
                />
              </AppFormField>

              <AppFormField :form-control="v$.form.institution.identification" label="NIT">
                <input
                  type="text"
                  class="form-control"
                  id="identification"
                  v-model="v$.form.institution.identification.$model"
                  pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\\s\\-,_;.@()]+$"
                  title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
                />
              </AppFormField>
            </div>

            <div class="form-row">
              <AppFormField :form-control="v$.form.institution.phone" label="Teléfono">
                <input type="tel" class="form-control" id="phone" v-model="v$.form.institution.phone.$model" />
              </AppFormField>

              <AppFormField :form-control="v$.form.institution.municipalityId" label="Ciudad">
                <AppGeographicSearch
                  :search-key="'city'"
                  label="MunicipalityRegionName"
                  :id="v$.form.institution.municipalityId.$model"
                  @geographic-data="(data: any) => (v$.form.institution.municipalityId.$model = data.id)"
                />
              </AppFormField>

              <AppFormField :form-control="v$.form.institution.address" label="Dirección">
                <input type="text" class="form-control" v-model="v$.form.institution.address.$model" />
              </AppFormField>
            </div>

            <div class="form-row">
              <AppFormField :form-control="v$.form.institution.email" label="Correo">
                <input
                  type="text"
                  class="form-control"
                  id="email"
                  v-model="v$.form.institution.email.$model"
                  :disabled="data?.institution?.id >= 0"
                />
              </AppFormField>

              <AppFormField :form-control="v$.form.user.password">
                <label>Contraseña*</label>
                <input
                  type="password"
                  class="form-control"
                  v-model="v$.form.user.password.$model"
                  placeholder="Contraseña"
                  @input="onPasswordInput"
                />
              </AppFormField>

              <AppFormField :form-control="v$.form.user.passwordConfirmation">
                <label>Confirmar contraseña*</label>
                <input
                  type="password"
                  class="form-control"
                  v-model="v$.form.user.passwordConfirmation.$model"
                  placeholder="Confirmar contraseña"
                  @input="onPasswordConfirmationInput"
                />
              </AppFormField>
            </div>

            <div class="form-row">
              <AppFormField
                @change="onFileSelected($event, 'logoInstitutional')"
                :form-control="v$.form.institution.logoInstitutional"
                :label="'Logo institucional'"
              >
                <AppUploadImage
                  input-id="file-institutional"
                  v-model="v$.form.institution.logoInstitutional.$model"
                  :current-thumbnail="currentThumbnailInstitutional"
                />
              </AppFormField>

              <AppFormField
                @change="onFileSelected($event, 'logo')"
                :form-control="v$.form.institution.logo"
                :label="'Logo reportes (1000 X 600 Pixeles)'"
              >
                <AppUploadImage
                  input-id="file-report"
                  v-model="v$.form.institution.logo.$model"
                  :current-thumbnail="currentThumbnail"
                />
              </AppFormField>
            </div>

            <div class="form-row">
              <AppFormField :form-control="v$.form.institution.colorPrimary" label="Color primario">
                <input class="form-control" type="color" id="color" v-model="v$.form.institution.colorPrimary.$model" />
              </AppFormField>

              <AppFormField :form-control="v$.form.institution.colorSecondary" label="Color segundario">
                <input class="form-control" type="color" id="color" v-model="v$.form.institution.colorSecondary.$model" />
              </AppFormField>

              <AppFormField :form-control="v$.form.institution.active" label="Estado">
                <AppAutocomplete
                  v-model="v$.form.institution.active.$model"
                  :input-id="'active'"
                  :clearable="false"
                  :options="status"
                />
              </AppFormField>

              <AppFormField :form-control="v$.form.institution.isClient">
                <div class="form-check mt-4">
                  <input type="checkbox" class="form-check-input" v-model="v$.form.institution.isClient.$model" id="isClient" />
                  <label for="isClient" class="form-check-label"> Habilitar como cliente</label>
                </div>
              </AppFormField>

              <AppFormField :form-control="v$.form.institution.enableAutoSessionConfig">
                <div class="form-check mt-4">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    v-model="v$.form.institution.enableAutoSessionConfig.$model"
                    id="enableAutoSessionConfig"
                  />
                  <label for="enableAutoSessionConfig" class="form-check-label">
                    Habilitar configuración de sesiones automáticas
                  </label>
                </div>
              </AppFormField>
            </div>
          </template>
        </AppCard>
      </template>
    </AppBaseList>
  </form>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, Ref, ref, computed } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { requiredIf, helpers } from '@vuelidate/validators';
import { required, numeric, defaultImage } from '../../../shared/plugins/vuelidate.plugin';
import { useRouter } from 'vue-router';
import { useMeta } from 'vue-meta';

import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppUploadImage from '../../../shared/components/Forms/AppUploadImage.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppGeographicSearch from '../../../shared/components/Forms/AppGeographicSearch.vue';

import { StatusInstitutionFormDto } from '../dtos/statusInstitucionForm.dto';
import { CreateOrUpdateInstitutionService } from '../services/createOrUpdateInstitution.service';

const createOrUpdateInstitutionService = new CreateOrUpdateInstitutionService();

export default defineComponent({
  name: 'institutionsForm',
  components: {
    AppGeographicSearch,
    AppAutocomplete,
    AppButtonBack,
    AppFormField,
    AppBaseList,
    AppLoading,
    AppButton,
    AppCard,
    AppUploadImage,
  },
  props: ['title', 'routes', 'data', 'fromProfile'],
  setup(props) {
    const router = useRouter();
    useMeta({ title: props.title });

    const data = props.data ?? null;
    const currentThumbnail = data?.institution?.logo ?? null;
    const currentThumbnailInstitutional = data?.institution?.logoInstitutional ?? null;

    const status: Ref<StatusInstitutionFormDto[]> = ref([]);
    const loading = ref(true);

    const form = reactive({
      institution: {
        name: props.data?.institution?.name,
        identification: props.data?.institution?.identification,

        phone: props.data?.institution?.phone ?? null,
        municipalityId: props.data?.institution?.municipalityId,
        address: props.data?.institution?.address,

        email: props.data?.institution?.email,

        active: props.data?.institution?.active ?? 0,
        isClient: !!props.data?.institution?.isClient as any,

        publicKey: props.data?.institution?.publicKey ?? null,
        logo: null as File | null,
        logoInstitutional: null as File | null,
        colorPrimary: props.data?.institution?.colorPrimary,
        colorSecondary: props.data?.institution?.colorSecondary,
        enableAutoSessionConfig: !!props.data?.institution?.enableAutoSessionConfig,
      },
      user: {
        id: props.data?.user?.id ?? null,
        userToken: props.data?.user?.userToken,
        password: '',
        passwordConfirmation: '',
      },
    });

    const isEdit = computed(() => !!props.data?.user?.id);

    // ---- Validador custom para "no coinciden" que solo actúa si hay valor ----
    const matchesPassword = helpers.withMessage(
      'Las contraseñas no coinciden',
      (value: string) => {
        // Si está vacío, no evaluamos igualdad. 'required' se encarga de eso.
        if (!helpers.req(value)) return true;
        return value === form.user.password;
      }
    );

    const v$ = useVuelidate(
      {
        form: {
          institution: {
            name: { required },
            identification: { required },
            phone: { required },
            municipalityId: { required },
            address: { required },
            email: { required },
            active: { numeric },

            isClient: {},
            publicKey: {},
            logo: { defaultImage },
            logoInstitutional: { defaultImage },
            colorPrimary: { required },
            colorSecondary: { required },
            enableAutoSessionConfig: {},
          },
          user: {
            id: { numeric },
            userToken: {},
            password: {
              required: helpers.withMessage(
                'La contraseña es obligatoria',
                requiredIf(() => !isEdit.value || !!form.user.passwordConfirmation)
              ),
            },
            passwordConfirmation: {
              required: helpers.withMessage(
                'La confirmación es obligatoria',
                requiredIf(() => !isEdit.value || !!form.user.password)
              ),
              matchesPassword, // <- usamos el custom en vez de sameAs
            },
          },
        },
      },
      { form },
      {
        $autoDirty: true,
        $lazy: false,
      }
    );

    // Revalida en tiempo real desde contraseña
    const onPasswordInput = () => {
      // En edición, si ambos vacíos, limpia estado
      if (isEdit.value && !form.user.password && !form.user.passwordConfirmation) {
        v$.value.form.user.password.$reset();
        v$.value.form.user.passwordConfirmation.$reset();
        return;
      }
      // Revalida confirmación
      v$.value.form.user.passwordConfirmation.$touch();
      v$.value.form.user.passwordConfirmation.$validate();

      // Si coinciden, hacemos un mini reset+touch para limpiar mensaje residual
      if (form.user.password && form.user.password === form.user.passwordConfirmation) {
        v$.value.form.user.passwordConfirmation.$reset();
        v$.value.form.user.passwordConfirmation.$touch();
      }
    };

    // Revalida en tiempo real desde confirmación
    const onPasswordConfirmationInput = () => {
      if (isEdit.value && !form.user.password && !form.user.passwordConfirmation) {
        v$.value.form.user.password.$reset();
        v$.value.form.user.passwordConfirmation.$reset();
        return;
      }
      v$.value.form.user.password.$touch();
      v$.value.form.user.password.$validate();

      if (form.user.password && form.user.password === form.user.passwordConfirmation) {
        v$.value.form.user.passwordConfirmation.$reset();
        v$.value.form.user.passwordConfirmation.$touch();
      }
    };

    onMounted(async () => {
      try {
        status.value = [
          { id: 0, name: 'Inactivo' },
          { id: 1, name: 'Activo' },
        ];
      } catch (e) {
        console.log(e);
      } finally {
        loading.value = false;
      }
    });

    // HEX a "r, g, b"
    function hexToRgb(hex: string) {
      const cleanedHex = hex.replace('#', '');
      const r = parseInt(cleanedHex.substring(0, 2), 16);
      const g = parseInt(cleanedHex.substring(2, 4), 16);
      const b = parseInt(cleanedHex.substring(4, 6), 16);
      return `${r}, ${g}, ${b}`;
    }

    // Evita booleans en FormData; usa flags *_Keep como strings
    function appendLogo(formData: FormData, fileValue: File | null, existsInData: any, key: 'logo' | 'logoInstitutional') {
      if (fileValue instanceof File) {
        formData.append(key, fileValue);            // sube archivo nuevo
        formData.append(`${key}Keep`, 'false');     // no conservar anterior
      } else {
        const keep = existsInData ? 'true' : 'false';
        formData.append(`${key}Keep`, keep);
      }
    }

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      try {
        const formData: any = new FormData();

        appendLogo(formData, form.institution.logo, data?.institution?.logo, 'logo');
        appendLogo(formData, form.institution.logoInstitutional, data?.institution?.logoInstitutional, 'logoInstitutional');

        formData.append(
          'institution',
          JSON.stringify({
            name: form.institution?.name,
            identification: form.institution?.identification,
            phone: form.institution?.phone,
            municipalityId: form.institution?.municipalityId,
            address: form.institution?.address,
            email: form.institution?.email,
            active: form.institution?.active,
            colorPrimary: form.institution?.colorPrimary,
            colorPrimaryRgb: hexToRgb(form.institution?.colorPrimary),
            colorSecondary: form.institution?.colorSecondary,
            colorSecondaryRgb: hexToRgb(form.institution?.colorSecondary),
            isClient: form.institution?.isClient,
            publicKey: form.institution?.publicKey,
            enableAutoSessionConfig: form.institution?.enableAutoSessionConfig,
          })
        );

        formData.append(
          'user',
          JSON.stringify({
            id: form.user?.id,
            userToken: form.institution?.email,
            password: form.user?.password,
            passwordConfirmation: form.user?.passwordConfirmation,
          })
        );

        await createOrUpdateInstitutionService.run(formData, props.data?.institution?.id);

        if (!props.fromProfile) {
          await router.push({ name: 'casurid.institutionsList' });
        }
      } catch (e) {
        console.log(e);
      }
    };

    const onFileSelected = (event: any, logoType: 'logo' | 'logoInstitutional') => {
      const files = event.target.files;
      if (!files?.length) return;

      const file = files[0];
      const maxWidth = 1000;
      const maxHeight = 600;

      const image = new Image();
      image.src = URL.createObjectURL(file);

      image.onload = () => {
        const width = image.width;
        const height = image.height;

        if (width > maxWidth || height > maxHeight) {
          alert(`Las dimensiones de la imagen son demasiado grandes. El ancho máximo es ${maxWidth} píxeles y el alto máximo es ${maxHeight} píxeles.`);

          if (logoType === 'logo') {
            v$.value.form.institution.logo.$model = null;
          } else {
            v$.value.form.institution.logoInstitutional.$model = null;
          }

          event.target.value = '';
          return;
        }

        if (logoType === 'logo') {
          v$.value.form.institution.logo.$model = file;
        } else {
          v$.value.form.institution.logoInstitutional.$model = file;
        }
      };
    };

    return {
      loading,
      save,
      v$,
      status,
      onFileSelected,
      onPasswordInput,
      onPasswordConfirmationInput,
      currentThumbnail,
      currentThumbnailInstitutional,
      data,
      fromProfile: props.fromProfile,
      title: props.title,
      routes: props.routes,
    };
  },
});
</script>
