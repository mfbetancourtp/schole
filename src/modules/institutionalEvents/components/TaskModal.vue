<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title" @closed="emit('close')">
      <template v-slot:content>
        <div class="form-row">
          <AppFormField :form-control="v$.form.description">
            <label for="naspareKgme">Descripción</label>
            <input
              type="text"
              class="form-control"
              v-model="v$.form.description.$model"
            />
          </AppFormField>
        </div>
        <div class="form-row">
          <AppFormField :form-control="v$.form.startDate">
            <label for="name">Desde </label>
            <input
              type="datetime-local"
              class="form-control"
              v-model="v$.form.startDate.$model"
            />
          </AppFormField>
        </div>

        <div class="form-row">
          <AppFormField :form-control="v$.form.endDate">
            <label for="name">Hasta </label>
            <input
            type="datetime-local"
              class="form-control"
              v-model="v$.form.endDate.$model"
            />
          </AppFormField>
        </div>
        <div class="form-row">
          <AppFormField :form-control="v$.form.responsibles">
            <label for="name">Responsable</label>
            <v-select
              input-id="fixendList"
              :options="responsiblesList"
              label="peopleName"
              :reduce="(responsiblesList: any) => responsiblesList.id"
              v-model="v$.form.responsibles.$model"
              multiple
            />
          </AppFormField>
        </div>
        <div class="form-row">
          <AppFormField
            class="col-2"
            :form-control="v$.form.requiresEvent"
            label="Mostrar en agenda?"
          >
            <div class="mt-2 form-check form-switch">
              <input
                class="form-check-input"
                type="checkbox"
                id="requiresEvent"
                v-model="v$.form.requiresEvent.$model"
              />
            </div>
          </AppFormField>
        </div>

        <!-- <AppFormField :form-control="v$.form.scaleUnitId">
            <label for="name">Unidad de Medida</label>
            <v-select
              input-id="fixendList"
              :options="scaleUnitsList"
              label="name"
              :reduce="(scaleUnitsList: any) => scaleUnitsList.id"
              v-model="v$.form.scaleUnitId.$model"
            />
          </AppFormField> -->
      </template>
      <template v-slot:actions>
        <AppButton :label="'core.save'" :nativeType="'submit'"></AppButton>

      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, reactive, ref } from 'vue';
import { required } from '../../../shared/plugins/vuelidate.plugin';
import useVuelidate from '@vuelidate/core';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
// import AppButtonLoading from '../../../shared/components/Buttons/AppButtonLoading.vue';

import { CreateOrUpdateTaskService } from '../services/createOrUpdateTask.service';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
// import { CreateOrUpdateProductTypesService } from '../../Contracts/services/AdministrationsContracts/createOrUpdateProductTypes.service';

export default defineComponent({
  name: 'StorageModal',
  components: {
    AppFormModal,
    AppFormField,
    AppButton,
    // AppButtonLoading,
  },
  props: {
    data: {
      type: Object as PropType<any | null>,
    },
    scaleUnitsList: {
      type: Array as PropType<any[]>,
    },
    activitiesId: {
      type: Number,
    },
    responsiblesList:{
      type: Array as PropType<any[]>,
    }
    
  },
  emits: ['close'],
  setup(props, { emit }) {
    const createOrUpdateTaskService = new CreateOrUpdateTaskService();
    const data = props.data;
    let title = 'Agregar tareas a realizarse en el marco de la actividad';
    if (props.data?.id) {
      title = 'Editar tareas a realizarse en el marco de la actividad';
    }
    const loading = ref(true);
    const form: any = reactive({
      id: data?.id ? data?.id : null,
      description: data?.description,
      responsibles: data?.responsible ? data.responsible.map((r: any) => r.id).filter((id: any) => id != null) : [],
      startDate: data?.startDate,
      endDate: data?.endDate,
      requiresEvent: props.data?.requiresEvent ? true : false,
    });
    console.log("props.activitiesId",props.activitiesId);
    
    const v$ = useVuelidate(
      {
        form: {
          id: {},
          description: { required },
          startDate: { required },
          endDate: { required },
          responsibles: {},
          institutionalActivityId: {  },
          requiresEvent: {  },
        },
      },
      { form }
    );
    onMounted(() => {
      loading.value = false;
    });
    const save = async () => {
  const formIsValid = await v$.value.$validate();
  if (!formIsValid) return;
  loading.value = true;

  try {
    if (!form.id) {
      const dataSend = {
        description: form.description,
        startDate: form.startDate,
        requiresEvent: form.requiresEvent ? 1 : 0,
        endDate: form.endDate,
        institutionalActivityId: Number(localStorage.getItem('institutionalActivityId')),
        responsibles: null,
      };

      const response = await createOrUpdateTaskService.run(dataSend);
      form.id = response.data.id;
      await saveUpdate();


    } else {
      await saveUpdate();
    }
    loading.value = false;
    emit('close');
  } catch (error) {
    console.log('This is error', error);
    loading.value = false;
  }
};

    const saveUpdate = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;
      loading.value = true;
      try {
        const dataSend = {
          id: form.id,
          description: form.description,
          startDate: form.startDate,
          requiresEvent: form.requiresEvent ? 1 : 0,
          endDate: form.endDate,
          institutionalActivityId: Number(localStorage.getItem('institutionalActivityId')),
          responsibles: form.responsibles,
        };

        await createOrUpdateTaskService.run(dataSend, form.id);
        loading.value = false;
        emit('close');
      } catch (error) {
        console.log('This is error', error);
        loading.value = false;
      }
    };
    return {
      title,
      loading,
      v$,
      save,
      emit,
    };
  },
});
</script>
