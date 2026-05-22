<template>
  <AppDropdown>
    <template #button>
      <AppButton variant="primary" label="reports.btnGenerate"></AppButton>
    </template>

    <template #items>
      <li v-for="format in formatsRaw">
        <button class="dropdown-item" type="button" @click="selectFormat(format)">
          {{ t(formats[format]) }}
        </button>
      </li>
    </template>
  </AppDropdown>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import AppDropdown from '../../../shared/components/AppDropdown.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import {useI18n} from 'vue-i18n';

export default defineComponent({
  name: 'ButtonGenerate',
  components: {AppButton, AppDropdown},
  emits: ['selectFormat'],
  setup(props, {emit}) {
    const {t} = useI18n();
    const formats = {
      'xls': 'reports.xls',
      'pdf': 'reports.pdf',
      'html': 'reports.html',
    };

    const formatsRaw = [
      'xls',
      'pdf',
      'html',
    ];

    const selectFormat = (format: string) => {
      emit('selectFormat', format);
    };

    return {
      formats,
      formatsRaw,
      t,
      selectFormat,
    };
  },
});
</script>

<style scoped>

</style>