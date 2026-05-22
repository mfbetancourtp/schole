<template>
  <AppFormModal :title="title" @closed="emit('close')">
    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>

      <div v-else>
        <AppFormField label="Roles">
          <AppAutocomplete v-model="officialsReceiverId" :options="officialsReceivers" :clearable="false" @change="clearChecksOnRoleChange" />
        </AppFormField>

        <AppEmptyResponse v-if="!officialsReceivers.filter((receiver) => receiver.id == officialsReceiverId)[0].users.length" :show-image="false" :subtitle="false"></AppEmptyResponse>

        <template v-else>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="allOfficialsReceivers" value="allOfficialsReceivers" v-model="receiversAllSupervisors" @change="toggleSelectAll" />
            <label class="form-check-label" for="allOfficialsReceivers">Todos</label>
          </div>

          <template v-for="(user, index) in officialsReceivers.filter((receiver) => receiver.id == officialsReceiverId)[0].users" :key="index">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" :id="`${index}`" :value="user" v-model="receiversPeoples" @change="checkIndividualSelection" />
              <label class="form-check-label" :for="`${index}`">{{ user.fullName }}</label>
            </div>
          </template>
        </template>
      </div>
    </template>

    <template v-slot:actions>
      <AppButton @click="save" label="core.save" />
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { OfficialsReceiverDto } from '../dtos/message.dto';

import { GetOfficialsReceiversService } from '../services/getOfficialsReceivers.service';

const getOfficialsReceiversService = new GetOfficialsReceiversService();

export default defineComponent({
  name: 'AddReceiversMessagesForm',
  components: {
    AppEmptyResponse,
    AppAutocomplete,
    AppFormField,
    AppFormModal,
    AppLoading,
    AppButton,
  },

  props: {
    receiversTemp: {
      type: Object as PropType<any | null>,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const { t } = useI18n();
    let title = 'Agregar Funcionario';

    const officialsReceivers: Ref<OfficialsReceiverDto[]> = ref([]);
    const receiversPeoples: Ref<any[]> = ref([]);
    const receiversAllSupervisors: Ref<boolean> = ref(false);

    const officialsReceiverId = ref();
    const loading = ref(true);

    onMounted(async () => {
      try {
        if (props.receiversTemp && props.receiversTemp.peoples) {
          receiversPeoples.value = [...props.receiversTemp.peoples];
        }

        officialsReceivers.value = await getOfficialsReceiversService.run();
        if (officialsReceivers.value.length) {
          officialsReceiverId.value = officialsReceivers.value[0].id;
        }
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    watch(receiversPeoples, () => {
      const users = officialsReceivers.value.filter((receiver) => receiver.id == officialsReceiverId.value)[0]?.users || [];
      // Esto asegura que el checkbox "Todos" se selecciona sólo si todos los usuarios están seleccionados
      receiversAllSupervisors.value = receiversPeoples.value.length === users.length;
    });

    const toggleSelectAll = () => {
      const users = officialsReceivers.value.filter((receiver) => receiver.id == officialsReceiverId.value)[0]?.users || [];
      if (receiversAllSupervisors.value) {
        // Si seleccionamos "Todos", seleccionamos a todos los usuarios
        receiversPeoples.value = [...users];
      } else {
        // Si deseleccionamos "Todos", vaciamos la lista
        receiversPeoples.value = [];
      }
    };

    const checkIndividualSelection = () => {
      const users = officialsReceivers.value.filter((receiver) => receiver.id == officialsReceiverId.value)[0]?.users || [];
      // Si algún checkbox individual se deselecciona, actualizamos el checkbox "Todos" si es necesario
      if (receiversPeoples.value.length !== users.length) {
        receiversAllSupervisors.value = false;
      }
    };

    const clearChecksOnRoleChange = () => {
      // Limpiamos todos los checkboxes cuando se cambia de rol
      receiversPeoples.value = [];
      receiversAllSupervisors.value = false;
    };

    const save = async () => {
      const receivers = {
        courses: props.receiversTemp?.courses || [],
        students: props.receiversTemp?.students || [],
        peoples: [...new Set(receiversPeoples.value)],
      };
      emit('close', receivers);
    };

    return {
      loading,
      title,
      save,
      officialsReceiverId,
      officialsReceivers,
      receiversPeoples,
      receiversAllSupervisors,
      toggleSelectAll,
      checkIndividualSelection,
      clearChecksOnRoleChange,
      t,
      emit,
    };
  },
});
</script>

<style scoped></style>
