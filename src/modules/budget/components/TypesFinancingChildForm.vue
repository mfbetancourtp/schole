<template>
  <form @submit.prevent="save">
    <AppFormModal :title="title">
      <template v-slot:content>
        <AppFormField :form-control="v$.form.name" :label="'Nombre'">
          <input class="form-control" type="text" id="name" v-model="v$.form.name.$model" />
        </AppFormField>
        <AppFormField :form-control="v$.form.code" :label="'Codigo'">
          <input :disabled="haveChildren" class="form-control" type="text" id="code" @input="validateCode" :maxlength="currentMaxDigits" v-model="v$.form.code.$model" />
        </AppFormField>
        <AppFormField :form-control="v$.form.externalCode" :label="'Codigo externo'">
          <input class="form-control" type="text" id="externalCode" v-model="v$.form.externalCode.$model" />
        </AppFormField>
        <!--    <AppFormField :form-control="v$.form.level" :label="'Nivel'">
          <input class="form-control" type="number" id="level" v-model="v$.form.level.$model" />
        </AppFormField> -->
        <AppFormField :form-control="v$.form.description" :label="'Descripcion'">
          <input class="form-control" type="text" id="description" v-model="v$.form.description.$model" />
        </AppFormField>
      </template>

      <template v-slot:actions>
        <AppButton :label="'core.save'" :nativeType="'submit'"></AppButton>
      </template>
    </AppFormModal>
  </form>
</template>

<script lang="ts">
import { required } from '../../../shared/plugins/vuelidate.plugin';
import { defineComponent, reactive, computed, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';

import { CreateOrUpdateTypesFinancingChildByParentIdService } from '../services/createOrUpdateTypesFinancingChildByParentId.service';

const createOrUpdateTypesFinancingChildByParentIdService = new CreateOrUpdateTypesFinancingChildByParentIdService();
export default defineComponent({
  name: 'TypesFinancingParentForm',
  components: { AppFormModal, AppFormField, AppButton },

  props: {
    data: {
      type: Object,
      required: true,
    },
    dataParent: {
      type: Object,
      required: true,
    },
    constantTypes: {
      type: Object,
      required: true,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const typeFinancingTranslation = 'Tipo fuente de financiación';
    const title = props.data?.key ? `core.edit ${typeFinancingTranslation}` : `core.new ${typeFinancingTranslation}`;
    const haveChildren = !!props.data?.children.length;

    const form = reactive({
      name: props.data?.data?.name ?? null,
      level: props.data?.data?.level ?? null,
      code: props.data?.data?.code || props.dataParent?.data.code,
      externalCode: props.data?.data?.externalCode ?? null,
      description: props.data?.data?.description ?? null,
      type: props.data?.data?.type ?? null,
      parentId: props.data?.data?.parentId || props.dataParent?.key,
      typeFinancingSourceId: props.data?.data?.typeFinancingSourceId ?? props.dataParent?.data?.typeFinancingSourceId,
      standardizedAccountingSystemId: props.data?.data?.standardizedAccountingSystemId ?? props.dataParent?.data?.standardizedAccountingSystemId,
    });
    const v$ = useVuelidate(
      {
        form: {
          name: { required },
          //level: { },
          code: { required },
          externalCode: {},
          description: {},
        },
      },
      { form }
    );
    //const constantTypes = props.constantTypes;

    const validateCode = (event: any) => {
      const baseCode = props.dataParent?.data?.code || ''; // Código inicial
      const newValue = event.target.value;
      // Solo permitir agregar dígitos al final del baseCode
      if (!newValue.startsWith(baseCode)) {
        form.code = baseCode;
      } else {
        // Permitimos añadir dígitos adicionales después del baseCode
        form.code = newValue;
      }
    };

    const currentMaxDigits: any = computed(() => {
      //const codeParent = props.dataParent?.data?.code;
      const currentDigit = ref();
      if (props.data?.data?.level) {
        currentDigit.value = props.constantTypes.find((item: any) => item.level === form.level);
      } else {
        const levelParent = props.dataParent?.data?.level;
        currentDigit.value = props.constantTypes.find((item: any) => item.level === levelParent + 1);
      }
      return currentDigit?.value?.numberDigits || null; // Número máximo de dígitos, por defecto null
    });

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;
      console.log(props.data);
      if (!form.typeFinancingSourceId && props.dataParent?.entity === 'Parent') {
        form.typeFinancingSourceId = props.dataParent?.key;
      }
      if (props.dataParent?.entity === 'Parent') {
        form.parentId = null;
      }
      if (!form.type) {
        //const levelToFind = props.dataParent.data.level + 1;
        const matchingItem = Array.isArray(props.constantTypes) ? props.constantTypes.find((item: any) => item.level === props.dataParent.data.level + 1) : null;
        console.log(matchingItem);
        form.type = matchingItem.level;
        form.level = matchingItem.level;
      }
      try {
        await createOrUpdateTypesFinancingChildByParentIdService.run(form, props.data?.key);
        emit('close');
      } catch (e) {
        console.log(e);
      }
    };

    return {
      title,
      save,
      v$,
      validateCode,
      currentMaxDigits,
      haveChildren,
    };
  },
});
</script>

<style scoped></style>
