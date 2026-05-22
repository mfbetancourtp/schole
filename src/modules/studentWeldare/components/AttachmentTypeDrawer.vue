<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="$emit('update:isVisible', $event)" size="md">
    <!-- HEAD -->
    <template #head>
      <div class="drawer-head-layout">
        <div class="drawer-head-icon">
          <AppIcon icon="file" />
        </div>
        <div>
          <h6 class="drawer-head-title">
            {{ mode === 'edit' ? t('studentWelfare.attachmentManagement.drawer.titleEdit') : t('studentWelfare.attachmentManagement.drawer.titleCreate') }}
          </h6>
          <p class="drawer-head-subtitle">
            {{ t('studentWelfare.attachmentManagement.drawer.subtitle') }}
          </p>
        </div>
      </div>
    </template>

    <!-- BODY -->
    <template #body>
      <form class="drawer-body-form" @submit.prevent="handleSave" id="attachment-type-form">
        <AppFormField :form-control="v$.form.code" :label="t('studentWelfare.attachmentManagement.drawer.fieldCode')">
          <input type="text" class="form-control" v-model="v$.form.code.$model" :placeholder="t('studentWelfare.attachmentManagement.drawer.fieldCodePlaceholder')" />
        </AppFormField>

        <AppFormField :form-control="v$.form.name" :label="t('studentWelfare.attachmentManagement.drawer.fieldName')">
          <input type="text" class="form-control" v-model="v$.form.name.$model" :placeholder="t('studentWelfare.attachmentManagement.drawer.fieldNamePlaceholder')" />
        </AppFormField>

        <AppFormField :form-control="v$.form.description" :label="t('studentWelfare.attachmentManagement.drawer.fieldDescription')">
          <textarea class="form-control" v-model="v$.form.description.$model" rows="3" :placeholder="t('studentWelfare.attachmentManagement.drawer.fieldDescriptionPlaceholder')" />
        </AppFormField>

        <AppFormField :form-control="v$.form.abjuntoType" :label="t('studentWelfare.attachmentManagement.drawer.fieldType')">
          <select class="form-select" v-model="v$.form.abjuntoType.$model">
            <option value="">
              {{ t('studentWelfare.attachmentManagement.drawer.fieldTypeSelect') }}
            </option>
            <option value="Obligatorio">
              {{ t('studentWelfare.attachmentManagement.drawer.typeRequired') }}
            </option>
            <option value="Opcional">
              {{ t('studentWelfare.attachmentManagement.drawer.typeOptional') }}
            </option>
          </select>
        </AppFormField>

        <div class="status-row">
          <div>
            <label class="status-row__label">{{ t('studentWelfare.attachmentManagement.drawer.fieldStatus') }}</label>
            <p class="status-row__hint">
              {{ form.isActive ? t('studentWelfare.attachmentManagement.drawer.statusActive') : t('studentWelfare.attachmentManagement.drawer.statusInactive') }}
            </p>
          </div>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" id="attachmentIsActive" :checked="form.isActive" @change="form.isActive = !form.isActive" />
          </div>
        </div>
      </form>
    </template>

    <!-- FOOTER -->
    <template #footer>
      <div class="drawer-footer-actions">
        <AppButton outlined variant="secondary" nativeType="button" @click="$emit('update:isVisible', false)">
          {{ t('studentWelfare.attachmentManagement.drawer.btnCancel') }}
        </AppButton>
        <AppButton variant="primary" :outlined="false" nativeType="submit" form="attachment-type-form">
          {{ mode === 'edit' ? t('studentWelfare.attachmentManagement.drawer.btnSave') : t('studentWelfare.attachmentManagement.drawer.btnCreate') }}
        </AppButton>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';

import type { AttachmentTypeDto } from '../dtos/attachmentType.dto';

type DrawerMode = 'create' | 'edit';

export default defineComponent({
  name: 'AttachmentTypeDrawer',
  components: { AppDrawer, AppIcon, AppButton, AppFormField },
  emits: ['update:isVisible', 'save'],

  props: {
    isVisible: { type: Boolean, required: true },
    mode: { type: String as PropType<DrawerMode>, default: 'create' },
    formData: {
      type: Object as PropType<AttachmentTypeDto | null>,
      default: null,
    },
  },

  setup(props, { emit }) {
    const { t } = useI18n();
    const data = props.formData ?? null;

    const form = reactive({
      code: data?.code ?? '',
      name: data?.name ?? '',
      description: data?.description ?? '',
      abjuntoType: data?.abjuntoType ?? '',
      isActive: data ? !!data.isActive : true,
    });

    const v$ = useVuelidate(
      {
        form: {
          code: { required },
          name: { required },
          description: { required },
          abjuntoType: { required },
        },
      },
      { form }
    );

    const handleSave = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;
      emit('save', { ...form });
    };

    return { t, form, v$, handleSave };
  },
});
</script>

<style scoped>
/* ── Head ── */
.drawer-head-layout {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.drawer-head-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1rem;
  flex-shrink: 0;
}

.drawer-head-title {
  margin: 0;
  color: #fff;
  font-weight: 700;
  font-size: 0.95rem;
}

.drawer-head-subtitle {
  margin: 0.15rem 0 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

/* ── Body ── */
.drawer-body-form {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

/* ── Status toggle row ── */
.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.status-row__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.status-row__hint {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0.15rem 0 0;
}

/* ── Toggle switch ── */
.form-check-input {
  width: 2.5em;
  height: 1.25em;
  cursor: pointer;
}

.form-check-input:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

/* ── Footer ── */
.drawer-footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  width: 100%;
}
</style>
