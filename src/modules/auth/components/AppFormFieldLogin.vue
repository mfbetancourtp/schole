<template>
  <div class="container-input">
    <div class="input-institucion mb-1" ref="main">
      <label :for="controlId" v-if="label" class="text-capitalize">{{ t(label) }}</label>
      <slot></slot>
    </div>

    <div class="tw-flex tw-flex-col">
      <template v-if="formControl && formControl.$errors.length > 0">
        <small class="text-danger" v-for="error in formControl.$errors" :key="error">
          {{ error.$message }}
        </small>
      </template>

      <template v-if="errors.value.length > 0">
        <small class="text-danger" v-for="error in errors.value" :key="error">
          {{ t(`core.validationRules.${error}`) }}
        </small>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, nextTick, onMounted, reactive, ref, watch } from 'vue';
import ValidationsErrorsStore from '../../../shared/stores/validationsErrors.store';

import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    formControl: {
      type: Object,
      required: false,
    },
    label: {
      type: String,
      default: null,
    },
  },
  setup(props) {
    const formControl = ref(props.formControl);
    const name = formControl.value?.$path;
    const state = inject('state', ValidationsErrorsStore.state);
    const { t } = useI18n();
    const controlId = ref('');

    const classControlWhiteList = ['form-control', 'vs__search', 'form-field'];

    const control: { value: any } = reactive({
      value: null,
    });
    const label: { value: any } = reactive({
      value: null,
    });
    const main: any = ref(null);

    const errors: { value: string[] } = reactive({
      value: [],
    });

    watch(
      () => formControl.value?.$error,
      (value) => {
        if (!control.value) {
          return;
        }

        paintErrors(value);
      }
    );

    const paintErrors = (hasError: boolean) => {
      if (hasError) {
        control.value?.classList.add('is-invalid');
        label.value?.classList.add('text-danger');
      } else {
        control.value?.classList.remove('is-invalid');
        label.value?.classList.remove('text-danger');
      }
    };

    watch(
      () => state.errors,
      (value: any) => {
        if (value[name]) {
          errors.value = value[name];
          paintErrors(true);
        } else {
          errors.value = [];
          paintErrors(false);
        }
      }
    );

    const findControl = () => {
      classControlWhiteList.forEach((classControl: string) => {
        Array.from(main.value.getElementsByClassName(classControl)).forEach((el) => {
          control.value = el;
          return;
        });
      });
    };

    onMounted(() => {
      nextTick(() => {
        if (!main.value) return;
        findControl();

        if (!label.value) {
          Array.from(main.value.getElementsByTagName('label')).forEach((el) => {
            label.value = el;
            if (formControl.value?.required && !label.value.innerText.includes('*')) {
              label.value.innerText += '*';
            }
          });
        }

        if (control.value) {
          controlId.value = control.value.id ?? controlId.value;
        }

        paintErrors(false);
      });
    });

    return {
      main,
      errors,
      t,
      controlId,
    };
  },
});
</script>
<style scoped>
.input-institucion {
  position: relative;
  width: 100%;
}

.container-input {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.text-danger {
  color: #f04242 !important;
}
</style>
