<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title" @closed="emit('close')">
      <template #content>
        <AppLoading v-if="loading"></AppLoading>
        <template v-else>
          <AppFormField :form-control="v$.form.numberSignature">
            <div class="autocomplete-container">
              <label for="name" class="label-text">Cantidad de directivos a firmar en el reporte</label>
              <div class="input-wrapper">
                <select class="form-control" id="name" v-model="v$.form.numberSignature.$model">
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
            </div>
          </AppFormField>
          <div class="autocomplete-container">
            <AppFormField :form-control="v$.form.academicPeriodId" class="col-4" label="Año Académico">
              <AppAutocomplete v-model="v$.form.academicPeriodId.$model" :input-id="'academicPeriodId'" :options="academicPeriods" :clearable="false" class="bg-white"></AppAutocomplete>
            </AppFormField>

            <AppFormField :form-control="v$.form.roleId">
              <label for="roles">Roles</label>
              <AppAutocomplete v-model="v$.form.roleId.$model" :input-id="'roleId'" :options="roles" :clearable="false" class="bg-white"></AppAutocomplete>
            </AppFormField>

            <AppFormField v-if="role" :form-control="v$.form.userId">
              <label for="roles">Usuarios</label>
              <AppAutocomplete v-model="v$.form.userId.$model" :input-id="'userID'" label="names" :options="usersByRole" :clearable="false" class="bg-white"></AppAutocomplete>
            </AppFormField>

            <AppFormField v-if="!role"></AppFormField>
          </div>
          <div class="button-container">
            <AppButton variant="primary" label="Agregar usuarios" class="add-users-button" @click="save()"> </AppButton>
          </div>
          <div>
            <h5>Lista de Firmantes:</h5>
            <AppAccordion class="mt-2" v-slot="{ accordionId }">
              <draggable tag="div" :list="usersSignatures" item-key="id" @change="changeOrder" style="display: inherit; flex-direction: inherit; gap: inherit">
                <template v-slot:item="{ element, index }">
                  <AppAccordionItem :accordion-id="accordionId" :key="element.id">
                    <template #head>
                      <AppIcon icon="arrows-alt" class="me-2"></AppIcon>
                      <span>
                        {{ index + 1 }}. {{ element.names ?? element.nameUser }} -
                        {{ element.nameRoleUser ?? element.roleName }}
                      </span>
                    </template>

                    <template #content>
                      <div class="d-flex justify-content-end align-items-end gap-2">
                        <div v-if="element.signature != null">
                          <a :href="element.signature" target="_blank">Ver Imagen</a>

                          <input accept="image/png, image/jpeg" type="file" :id="'fileIn'" style="display: none" @change="onFilefirma($event, element)" />

                          <button type="button" @click="getFile()" class="focus p-1 ps-2 pe-2 rounded-circle" @change="onFilefirma($event, element)">
                            <AppIcon icon="edit" class="text-primary" />
                          </button>
                        </div>
                        <div v-else>
                          <input
                            v-if="element.code !== 'coordinator' && element.code !== 'groupDirector'"
                            accept="image/png, image/jpeg"
                            type="file"
                            :id="'fileIn'"
                            @change="onFilefirma($event, element)"
                          />
                          <button
                            v-if="element.code !== 'coordinator' && element.code !== 'groupDirector'"
                            type="button"
                            @click="getFile()"
                            class="focus p-1 ps-2 pe-2 rounded-circle"
                            @change="onFilefirma($event, element)"
                          >
                            <AppIcon icon="edit" class="text-primary" />
                          </button>
                        </div>
                      </div>
                      <AppButtonDelete @click="openConfirmDelete(element)">></AppButtonDelete>
                    </template>
                  </AppAccordionItem>
                </template>
              </draggable>
            </AppAccordion>
          </div>
          <div></div>
          <AppModal v-model="signatureDelete">
            <AppConfirmDeleteModal v-if="signatureDelete" entity="Firma" @confirmDelete="confirmDelete" @close="signatureDelete = false"> </AppConfirmDeleteModal>
          </AppModal>
        </template>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, Ref, onMounted, watch, PropType } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import draggable from 'vuedraggable';

import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';
import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import { GetAcademicPeriodsService } from '../../administration/services/getAcademicPeriods.service';
import { GetAllRolesWithProfileService } from '../services/reports/getAllRolesWithProfile.service';
import { GetUserByRoleService } from '../services/reports/getUserByRole.service';
import { UpdateOrdenDigitalSignaturesService } from '../services/reports/UpdateOrdenDigitalSignatures.service';
import { PostDigitalSignatureService } from '../services/reports/postDigitalSignature.service';
import { RelatedDataSignaturesService } from '../services/reports/relatedDataSignatures.service';
import { DeleteDigitalSignatureService } from '../services/reports/deleteDigitalSignature.service';
import { CreateOrUpdateSignatureByRoleIdservice } from '../services/reports/createOrUpdateSignatureByRoleId.service';
import { DeleteDigitalSignatureByRoleIdservice } from '../services/reports/deleteDigitalSignatureByRoleId.service';
import { UpdateUserSignatureservice } from '../services/reports/updateUserSignature.service';

const updateOrdenDigitalSignaturesService = new UpdateOrdenDigitalSignaturesService();
const academicPeriodsService = new GetAcademicPeriodsService();
const getAllRolesWithProfileService = new GetAllRolesWithProfileService();
const getUserByRoleService = new GetUserByRoleService();
const postDigitalSignatureService = new PostDigitalSignatureService();
const relatedDataSignaturesService = new RelatedDataSignaturesService();
const deleteDigitalSignatureService = new DeleteDigitalSignatureService();
const createOrUpdateSignatureByRoleIdservice = new CreateOrUpdateSignatureByRoleIdservice();
const deleteDigitalSignatureByRoleIdservice = new DeleteDigitalSignatureByRoleIdservice();
const updateUserSignatureservice = new UpdateUserSignatureservice();

export default defineComponent({
  name: 'SubjectPositionFormEdit',
  components: {
    AppFormModal,
    AppButton,
    AppFormField,
    AppAutocomplete,
    AppAccordionItem,
    AppAccordion,
    AppButtonDelete,
    draggable,
    AppLoading,
    AppIcon,
    AppModal,
    AppConfirmDeleteModal,
  },

  props: {
    data: {
      type: Object,
    },
    itemId: {
      type: Number as PropType<Number | any>,
    },
  },

  emits: ['close'],

  setup(props, { emit }) {
    const data = props.data ?? {};
    const title = 'Configuración de Firmas';

    const academicPeriodId = ref();
    const academicPeriods: Ref<any[]> = ref([]);
    const roles: Ref<any[]> = ref([]);
    const usersByRole: Ref<any[]> = ref([]);
    const usersSignatures: Ref<any[]> = ref([]);
    const relatedData = ref();
    const loading = ref(true);
    const signatureDelete = ref(false);
    const signatureIdToDelete = ref();
    const role = ref(true);
    const currentDataDelete: { value: any } = reactive({
      value: null,
    });

    const dataRoles: Ref<any> = ref([]);

    const form = reactive({
      numberSignature: data?.numberSignature,
      academicPeriodId: data?.academicPeriodId,
      roleId: null,
      userId: data?.userId,
    });

    const v$ = useVuelidate(
      {
        form: {
          numberSignature: { required },
          academicPeriodId: { required },
          roleId: {},
          userId: {},
        },
      },

      { form }
    );
    onMounted(async () => {
      loading.value = true;

      academicPeriods.value = await academicPeriodsService.run();

      roles.value = await getAllRolesWithProfileService.run({
        signatureRequired: true,
      });

      relatedData.value = await relatedDataSignaturesService.run(props.itemId);

      form.numberSignature = relatedData.value.numberSignature;
      form.academicPeriodId = relatedData.value.academicPeriodId;

      usersSignatures.value = relatedData.value.digitalSignatures;

      loading.value = false;
    });

    // Función de validación para verificar el código del perfil
    const isCoordinatorOrGroupDirector = (roleId: any) => {
      const role = roles.value.find((r) => r.id === roleId);
      dataRoles.value = role;
      return role?.profile?.code === 'coordinator' || role?.profile?.code === 'groupDirector';
    };

    // Actualizar el watch de form.roleId
    watch(
      () => form.roleId,
      async (value) => {
        if (value) {
          await selectUsersByRole(form.roleId);
          if (isCoordinatorOrGroupDirector(value)) {
            // Aquí puedes añadir la lógica adicional que necesitas

            role.value = false;
          } else {
            role.value = true;
          }
        }
      }
    );

    const getData = async () => {
      relatedData.value = await relatedDataSignaturesService.run(props.itemId);
    };

    const save = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;

      const cantidadMaximaFirmantes = form.numberSignature;

      if (usersSignatures.value.length >= cantidadMaximaFirmantes) {
        alert(`La cantidad de firmantes no puede ser mayor que ${cantidadMaximaFirmantes}.`);
        return;
      }

      const updatedUsersSignatures = usersSignatures.value.map((signature) => {
        return {
          ...signature,
          numberSignature: form.numberSignature,
        };
      });

      let dataSend: any = {
        itemId: props.itemId,
        academicPeriodId: form.academicPeriodId,
        digitalSignatures: [
          ...updatedUsersSignatures,
          {
            userId: form.userId,
            numberSignature: form.numberSignature,
            positionReports: 0,
            roleId: form.roleId,
          },
        ],
      };

      let dataRole: any = {
        itemId: props.itemId,
        academicPeriodId: form.academicPeriodId,
        numberSignature: form.numberSignature,
      };

      try {
        if (dataRoles.value.profile.code == 'groupDirector' || dataRoles.value.profile.code == 'coordinator') {
          console.log('e');

          await createOrUpdateSignatureByRoleIdservice.run(dataRole, dataRoles.value.id);
          await getData();
          usersSignatures.value = relatedData.value.digitalSignatures;
        } else {
          await postDigitalSignatureService.run(dataSend);

          await getData();
          usersSignatures.value = relatedData.value.digitalSignatures;
        }
      } catch (error) {
        console.log('Error al guardar', error);
      }
    };

    const selectUsersByRole = async (roleId: any) => {
      usersByRole.value = await getUserByRoleService.run(roleId);
    };

    const changeOrder = async () => {
      try {
        const digitalSignatures = usersSignatures.value.map((signature, key) => ({
          id: signature.id as number,
          positionReports: key + 1,
        }));

        await updateOrdenDigitalSignaturesService.run({ digitalSignatures });
      } catch (e) {
        console.log(e);
      }
    };

    const openConfirmDelete = async (signatureId: any) => {
      signatureDelete.value = true;
      currentDataDelete.value = signatureId;
    };

    const confirmDelete = async () => {
      try {
        if (currentDataDelete.value.id) {
          await deleteDigitalSignatureService.run(currentDataDelete.value.id);
          await getData();
          usersSignatures.value = relatedData.value.digitalSignatures;
        } else if (currentDataDelete.value.signatures) {
          const data = {
            roleId: currentDataDelete.value.signatures[0].roleId,
            itemId: props.itemId,
            academicPeriodId: currentDataDelete.value.signatures[0].academicPeriodId,
          };

          await deleteDigitalSignatureByRoleIdservice.run(data);
          await getData();
          usersSignatures.value = relatedData.value.digitalSignatures;
        }

        console.log('Respuesta de confirmación de eliminación:');
      } catch (error) {
        console.error('Error al confirmar eliminación:', error);
      }
      signatureDelete.value = false;
    };

    const onFilefirma = async (event: any, element: Object): Promise<void> => {
      const files = event.target.files;
      if (!files.length) return;

      const file = files[0];

      const maxWidth = 255;
      const maxHeight = 83;

      const image = new Image();
      image.src = URL.createObjectURL(file);

      image.onload = async () => {
        const width = image.width;
        const height = image.height;

        if (width > maxWidth || height > maxHeight) {
          alert(`Las dimensiones de la imagen no coinciden. El ancho máximo es ${maxWidth} píxeles y el alto máximo es ${maxHeight} píxeles.`);
          relatedData.value.asignature = false;
          event.target.value = '';
          return;
        }

        await updateUserSignatureservice.run(element.userId, file);
        await getData();
        usersSignatures.value = relatedData.value.digitalSignatures;
      };
    };

    const getFile = () => {
      let fileUpload = document.getElementById('fileIn');
      if (fileUpload != null) fileUpload.click();
    };

    return {
      title,
      loading,
      role,
      v$,
      save,
      emit,
      form,
      academicPeriodId,
      academicPeriods,
      roles,
      usersByRole,
      selectUsersByRole,
      usersSignatures,
      changeOrder,
      getFile,
      relatedData,
      openConfirmDelete,
      confirmDelete,

      signatureDelete,
      onFilefirma,
    };
  },
});
</script>
<style scoped>
.autocomplete-container {
  display: flex;
  gap: 10px;
  align-items: center;
}

.label-text {
  display: flex;
  gap: 510px;
}

.input-wrapper {
  flex: 1;
  max-width: 50px;
}

.button-container {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
}

.add-users-button {
  margin-left: auto;
}

.handle {
  cursor: grab;
}
</style>
