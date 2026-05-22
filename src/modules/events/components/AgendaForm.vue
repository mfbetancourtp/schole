<template>
  <form @submit.prevent="save">
      <AppFormModal :title="title">
          <template v-slot:content>
              <div class="form-row">
                  <AppFormField :form-control="v$.form.name" label="Titulo">
                      <input class="form-control" type="text" id="name" v-model="v$.form.name.$model">
                  </AppFormField>

                  <AppFormField :form-control="v$.form.color" label="Color" class="col-2">
                      <input class="form-control" type="color" id="title" v-model="v$.form.color.$model">
                  </AppFormField>
              </div>

              <div class="form-row">
                <AppFormField :form-control="v$.form.isAllDay" :label="'Todo el dia'" class="form-check form-switch">
                  <input id="isAllDay" v-model="v$.form.isAllDay.$model" class="form-check-input" type="checkbox">
                </AppFormField>

                <AppFormField v-if="v$.form.isAllDay.$model" :form-control="v$.form.startDate" label="Fecha">
                    <input class="form-control" type="date" id="startDate" v-model="v$.form.startDate.$model">
                </AppFormField>

                <AppFormField v-if="!v$.form.isAllDay.$model" :form-control="v$.form.startDate" label="Desde">
                    <input class="form-control" type="datetime-local" id="startDate" v-model="v$.form.startDate.$model">
                </AppFormField>

                <AppFormField v-if="!v$.form.isAllDay.$model" :form-control="v$.form.endDate" label="Hasta">
                    <input class="form-control" type="datetime-local" id="endDate" v-model="v$.form.endDate.$model">
                </AppFormField>
              </div>

              <AppFormField :form-control="v$.form.description" :label="'collections.surcharges.form.description'">
                  <AppVoiceInput v-model="v$.form.description.$model" id="description" :rows="3" textareaClass="form-control"  />
              </AppFormField>
          </template>

          <template v-slot:actions>
              <AppButton
                v-if="data?.id"
                :outlined="true"
                :label="'Eliminar'" 
                @click="openConfirmDelete(data.id)"
              ></AppButton>

              <AppButton
                  :label="'core.save'" :nativeType="'submit'"
              ></AppButton>
          </template>
      </AppFormModal>
</form>
</template>

<script lang="ts">
import {required} from '../../../shared/plugins/vuelidate.plugin';
import {defineComponent, reactive} from 'vue';
import {useVuelidate} from '@vuelidate/core';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

import { CreateOrUpdateEventService } from '../services/createOrUpdateEvent.service';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const createOrUpdateEventService = new CreateOrUpdateEventService();

export default defineComponent({
  name: 'AgendaForm',
  components: {AppFormModal, AppButton, AppFormField, AppVoiceInput},

  props: ['data'],
  emits: ['close'],

  setup(props, {emit}) {
      const data: any | null = props.data;
      console.log(data);
      let title = data?.id ? 'Editar evento personal' : 'Nuevo evento personal';

      const form = reactive({
        eventType: data?.eventType ?? "personal",
        name: data?.name ?? null,
        description: data?.description ?? '',
        startDate: data?.startDate && data?.isAllDay ? data?.startDate.split(' ')[0] : data?.startDate,
        endDate: data?.endDate ?? '' as any,
        isAllDay: data?.isAllDay ? data?.isAllDay ? true : false : true,
        color: data?.color ?? "#f93969",
        requiresRepeat: 0,
        periodicityId: null
      });
      const v$ = useVuelidate({
          form: {
            eventType: {},
            name: { required },
            description: {},
            startDate: {},
            endDate: {},
            isAllDay: {},
            color: {},
            requiresRepeat: {},
            periodicityId: {},
          },
      }, {form});

      const save = async () => {
          const formIsValid = await v$.value.$validate();
          if (!formIsValid) return;

          try {
            if (form.startDate.indexOf('T')) {
              form.startDate = form.startDate.replace('T', ' ');
              form.endDate = form.endDate.replace('T', ' ');
            }

            form.endDate = !form.endDate ? null : form.endDate;

            console.log(form);

            await createOrUpdateEventService.run(form, data?.id);
            emit('close');
          } catch (e) {}
      };

      const openConfirmDelete = (id: any) => {
        emit('close', id);
      };

      return {
          title,
          save,
          v$,

          openConfirmDelete,
      };
  },
});
</script>

<style scoped>
</style>