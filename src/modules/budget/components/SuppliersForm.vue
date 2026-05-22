<template>
  <form @submit.prevent="save">
    <AppLoading v-if="loading" />
    <AppFormModal v-else :title="title">
      <template v-slot:content>
        <div class="form-row">
          <AppFormField
            :form-control="v$.form.typePersonId"
            label="core.typePerson"
          >
            <v-select
              input-id="degreeId"
              v-model="v$.form.typePersonId.$model"
              :reduce="(typePersonId: any) => typePersonId.id"
              :options="typePersons"
            ></v-select>
          </AppFormField>
          <AppFormField
            :form-control="v$.form.businessName"
            label="core.businessName"
          >
            <input
              class="form-control"
              type="text"
              id="businessName"
              v-model="v$.form.businessName.$model"
            />
          </AppFormField>
</div>
<div class="row">

          <AppFormField
            :form-control="v$.form.identificationTypeId"
            label="core.typeIdentification"
          >
            <v-select
              input-id="identificationTypeId"
              v-model="v$.form.identificationTypeId.$model"
              :reduce="(identificationTypeId: any) => identificationTypeId.id"
              :options="typeIdentifications"
              label="name"
            ></v-select>
          </AppFormField>
          <AppFormField
            :form-control="v$.form.identification"
            label="core.identification"
          >
            <input
              class="form-control"
              type="text"
              id="identification"
              v-model="v$.form.identification.$model"
            />
          </AppFormField>
          </div>
        <div class="row">

          <AppFormField :form-control="v$.form.address" label="core.address">
            <input
              class="form-control"
              type="text"
              id="address"
              v-model="v$.form.address.$model"
            />
          </AppFormField>
          <AppFormField
            :form-control="v$.form.phoneNumber"
            label="core.phoneNumber"
          >
            <input
              class="form-control"
              type="number"
              id="phoneNumber"
              v-model="v$.form.phoneNumber.$model"
            />
          </AppFormField>
        </div>
        <div class="row">

          <AppFormField :form-control="v$.form.email" label="core.email">
            <input
              class="form-control"
              type="text"
              id="email"
              v-model="v$.form.email.$model"
            />
          </AppFormField>
          <AppFormField
            :form-control="v$.form.contactPerson"
            label="core.contactPerson"
          >
            <input
              class="form-control"
              type="text"
              id="contactPerson"
              v-model="v$.form.contactPerson.$model"
            />
          </AppFormField>
          </div>
        <div class="row">
</div>
<div class="row">

          <AppFormField :form-control="v$.form.bankId" label="core.bankName">
            <v-select
              input-id="bankId"
              v-model="v$.form.bankId.$model"
              :reduce="(bankId: any) => bankId.id"
              :options="bankList"
              label="name"
            ></v-select>
          </AppFormField>

          <AppFormField
            :form-control="v$.form.accountNumber"
            label="core.accountNumber"
          >
            <input
              class="form-control"
              type="text"
              id="accountNumber"
              v-model="v$.form.accountNumber.$model"
            />
          </AppFormField>
          </div>
        <div class="row">

          <AppFormField
            :form-control="v$.form.typeAccountId"
            label="core.accountType"
          >
            <v-select
              input-id="typeAccountId"
              v-model="v$.form.typeAccountId.$model"
              :reduce="(typeAccountId: any) => typeAccountId.id"
              :options="accountTypes"
              label="name"
            ></v-select>
          </AppFormField>
           <!-- Campo para subir archivo -->
           <div class="content-document">
              <AppFormField style="margin-bottom: 0px !important" :form-control="v$.form.file" :label="'Firma'">
                <AppUploadImage input-id="thumbnail" v-model="v$.form.file.$model" :current-thumbnail="currentThumbnail"></AppUploadImage>
              </AppFormField>

              <!-- <div v-if="currentThumbnail" class="form-row" style="display: flex; flex-direction: column; gap: 0; justify-content: center">
                <label> </label>
                <button @click="confirmDelete()" class="p-1 ps-2 pe-2 rounded-circle" v-bind:class="{ focus: currentThumbnail }">
                  <AppIcon icon="trash" class="text-primary" v-bind:class="{ 'text-black-50': currentThumbnail }" />
                </button>
              </div> -->
            </div>
        </div>
      </template>

      <template v-slot:actions>
        <AppButton :label="'core.save'" :nativeType="'submit'"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, reactive, onMounted, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';

import { CreateOrUpdateSuppliersService } from '../services/createOrUpdateSuppliers.service';
import AppUploadImage from '../../../shared/components/Forms/AppUploadImage.vue';

const createOrUpdateSuppliersService = new CreateOrUpdateSuppliersService();

export default defineComponent({
  name: 'BankAccountForm',
  components: { AppFormModal, AppFormField, AppButton, AppLoading,AppUploadImage },

  props: {
    data: { type: Object, required: false },
    typePersons: { type: Array, required: true },
    typeIdentifications: { type: Array, required: true },
    accountTypes: { type: Array, required: true },
    bankList: { type: Array, required: true },

  },
  emits: ['close'],

  setup(props, { emit }) {
    const data = props.data;
    let title = ref(
      data?.id ? `Editar cuenta - ${data?.name}` : 'Crear nueva cuenta'
    );
    const currentThumbnail = ref(data?.signature ?? null);

    const loading = ref(true);
    const form = reactive({
      id: data?.id || null,
      typePersonId: data?.typePersonId || null,
      businessName: data?.businessName || '',
      identificationTypeId: data?.identificationTypeId || null,
      identification: data?.identification || '',
      address: data?.address || '',
      phoneNumber: data?.phoneNumber || '',
      email: data?.email || '',
      contactPerson: data?.contactPerson || '',
      bankId: data?.bankId || null,
      accountNumber: data?.accountNumber || '',
      typeAccountId: data?.typeAccountId || null,
      file: null,
      signature: data?.signature ?? '',
    });

    const v$ = useVuelidate(
      {
        form: {
          typePersonId: { required },
          businessName: { required },
          identificationTypeId: { required },
          identification: { required },
          address: { required },
          email: { required },
          phoneNumber: { required },
          contactPerson: { required },
          accountNumber: { required },
          bankId: { required },
          typeAccountId: { required },
          file: {},
          signature: {},
        },
      },
      { form }
    );

    onMounted(async () => {
      loading.value = false;
    });

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;
      console.log("holaa guarda")
      let dataSend = {
        id: form.id,
        typePersonId: Number(form.typePersonId),
        businessName: form.businessName,
        identificationTypeId: Number(form.identificationTypeId),
        identification: form.identification,
        address: form.address,
        email: form.email,
        phoneNumber: form.phoneNumber,
        contactPerson: form.contactPerson,
        accountNumber: form.accountNumber,
        bankId: form.bankId,
        typeAccountId: Number(form.typeAccountId),
        file: form.file,
        signature: form.signature
      }
      try {
        await createOrUpdateSuppliersService.run(dataSend, data?.id);
        emit('close');
      } catch (e) {
        console.error(e);
      }
    };
    // const confirmDelete = async () => {
    //   form.file = null;
    //   form.signature = null;
    //   await save();
    // };

  
    return {
      title,
      loading,
      save,
      v$,
      currentThumbnail,
      // confirmDelete,
    };
  },
});
</script>

<style scoped>
.content-document {
  display: flex;
  gap: 1rem;
  width: 50%;
  margin-bottom: 1rem;
}
@media (max-width: 767px) {
  .content-document {
    width: 100%;
  }
}</style>
