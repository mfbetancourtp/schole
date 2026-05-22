<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField>
          <label for="whiteListEmails">Escriba el correo electrónico de los usuarios con acceso al contenido. Para agregar mas de un email, puede separarlo por comas.</label>
          <v-select
            inputId="whiteListEmails"
            v-model="whiteListEmailsModel.value"
            :options="whiteListEmailsOptions.value"
            pushTags
            taggable
            multiple
            :filterable="false"
            :dropdownShouldOpen="() => false"
            :reduce="(whiteList) => whiteList.label ?? whiteList"
          ></v-select>
        </AppFormField>
      </template>

      <template v-slot:actions>
        <AppButton>Guardar</AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { defineComponent, reactive, watch } from 'vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import { AddAuthorizedUsersService } from '../services/addAuthorizedUsers.service';

const addAuthorizedUsersService = new AddAuthorizedUsersService();

export default defineComponent({
  name: 'authorizedUsers',
  components: { AppFormField, AppButton, AppFormModal },
  props: ['whiteListEmails', 'shopId'],
  emits: ['finish'],
  setup(props, { emit }) {
    const title = 'Usuarios autorizados';
    const whiteListEmailsOptions: { value: any } = reactive({
      value: [],
    });
    const whiteListEmailsModel: { value: string[] } = reactive({
      value: [],
    });

    if (props.whiteListEmails) {
      props.whiteListEmails.split(',').forEach((email: string) => {
        whiteListEmailsOptions.value.push({
          value: email,
          label: email,
        });
        whiteListEmailsModel.value.push(email);
      });
    }

    watch(whiteListEmailsModel, (newValue) => {
      const newEmails: string[] = [];

      if (!newValue.value.length) return;

      newValue.value.forEach((emails) => {
        const emailsSplit = emails.split(',');

        emailsSplit.forEach((email) => {
          newEmails.push(email.trim());
        });
      });

      if (newEmails.length !== whiteListEmailsModel.value.length) {
        whiteListEmailsModel.value = newEmails;
      }
    });

    const save = async () => {
      try {
        await addAuthorizedUsersService.run(
          {
            whiteListEmails: whiteListEmailsModel.value.join(','),
          },
          props.shopId
        );
        emit('finish');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      title,
      whiteListEmailsOptions,
      whiteListEmailsModel,
      save,
    };
  },
});
</script>

<style scoped></style>
