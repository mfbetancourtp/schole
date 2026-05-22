<!-- eslint-disable vue/require-v-for-key -->
<!-- eslint-disable vue/no-use-v-if-with-v-for -->
<template>
  <div class="mb-3 tw-flex-1" ref="main">
    <label :for="controlId" v-if="label" :class="`${capitalize ? 'tw-capitalize' : ''}`">{{ t(label) }}</label>

    <slot></slot>

    <div class="tw-flex tw-flex-col">
      <small class="text-danger" v-if="formControl && formControl.$errors.length" v-for="error in formControl.$errors">
        <template v-if="typeof error.$message === 'string'">
          {{ error.$message }}
        </template>
      </small>

      <small class="text-danger" v-if="errors.value.length" v-for="error in errors.value">
        {{ t(`core.validationRules.${error}`) }}
      </small>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, nextTick, onMounted, reactive, ref, watch } from 'vue';
import ValidationsErrorsStore from '../../stores/validationsErrors.store';
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
    capitalize: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    // eslint-disable-next-line vue/no-setup-props-destructure
    const formControl = props.formControl;

    const name = formControl?.$path;
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
      () => formControl?.$error,
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
            if (formControl?.required && !label.value.innerText.includes('*')) {
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
