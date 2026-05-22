<template>
  <AppDrawer v-model:isVisible="visible">
    <template #head>
      <div class="drawer-title">{{ title }}</div>
    </template>

    <template #body>
      <div class="filters-wrap">
        <!-- Secciones -->
        <div class="filter-block">
          <div class="block-head">
            <div class="block-title">Secciones</div>
            <label class="select-all">
              <input class="form-check-input" type="checkbox" :checked="allSectionsChecked" :indeterminate.prop="someSectionsChecked && !allSectionsChecked" @change="toggleAllSections" />
              Seleccionar todas
            </label>
          </div>

          <ul class="list">
            <li v-for="sec in sectionsList" :key="sec.key" class="list-item">
              <label class="checkbox-row">
                <input class="form-check-input" type="checkbox" :value="sec.key" v-model="localSections" />
                <span>{{ translateFilter(sec.key) }}</span>
              </label>
            </li>
          </ul>
        </div>

        <!-- Opciones -->
        <div class="filter-block" v-if="hasOptions">
          <div class="block-head">
            <div class="block-title">Opciones</div>
            <label class="select-all">
              <input class="form-check-input" type="checkbox" :checked="allOptionsChecked" :indeterminate.prop="someOptionsChecked && !allOptionsChecked" @change="toggleAllOptions" />
              Seleccionar todas
            </label>
          </div>

          <ul class="list">
            <li v-for="opt in optionsList" :key="opt.key" class="list-item">
              <label class="checkbox-row">
                <input class="form-check-input" type="checkbox" :value="opt.key" v-model="localOptions" />
                <span>{{ translateFilter(opt.key) }}</span>
              </label>
            </li>
          </ul>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="footer-actions">
        <AppButton outlined @click="cancel">Cancelar</AppButton>
        <AppButton @click="apply">Aplicar</AppButton>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, ref, watch } from 'vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import { useI18n } from 'vue-i18n';

type DictBool = Record<string, boolean> | null;
type Scope = 'general' | 'student' | 'tutor';

export default defineComponent({
  name: 'FieldsOptionsDrawer',
  components: { AppDrawer, AppButton },
  props: {
    isVisible: { type: Boolean, default: false },
    title: { type: String, default: 'Seleccionar campos de información' },
    v$: { type: Object as PropType<any>, required: true },
    sections: {
      type: Object as PropType<Record<string, boolean>>,
      required: true,
    },
    availableOptions: { type: Object as PropType<DictBool>, default: null },
    selectedOptionsMap: {
      type: Object as PropType<Record<string, boolean>>,
      default: () => ({}),
    },
    /** 👇 NUEVO: indica a qué namespace debe escribir */
    scope: { type: String as PropType<Scope>, default: 'general' },
  },
  emits: ['update:isVisible', 'sections-changed'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const translateFilter = (key: string) => t(`reports.filters.${key}`, key);
    const visible = computed({
      get: () => props.isVisible,
      set: (v: boolean) => emit('update:isVisible', v),
    });
    // Helpers seguros
    const getFormNode = () => {
      const root = (props.v$?.form ? props.v$ : props.v$?.value) ?? {};
      return root.form ?? {};
    };
    const trySetModel = (key: string, value: any) => {
      const formNode = getFormNode();
      const target = formNode?.[key];
      if (target && typeof target === 'object' && '$model' in target) {
        target.$model = value;
        return true;
      }
      return false;
    };

    // Selección local (staging)
    const localSections = ref<string[]>([]);
    const localOptions = ref<string[]>([]);
    const hydrateFromProps = () => {
      localSections.value = Object.keys(props.sections || {}).filter((k) => props.sections[k]);
      localOptions.value = Object.keys(props.selectedOptionsMap || {}).filter((k) => props.selectedOptionsMap[k]);
    };
    watch(
      () => props.isVisible,
      (open) => {
        if (open) hydrateFromProps();
      }
    );
    watch(
      [() => props.sections, () => props.selectedOptionsMap],
      () => {
        if (props.isVisible) hydrateFromProps();
      },
      { deep: true }
    );

    // Preview de secciones → padre recalcula opciones
    watch(
      () => localSections.value,
      (arr) => emit('sections-changed', arr),
      { deep: true }
    );

    // Si cambian opciones disponibles, purga las locales que ya no existan
    watch(
      () => props.availableOptions,
      (newAvail) => {
        if (!props.isVisible) return;
        const availSet = new Set(Object.keys(newAvail || {}));
        localOptions.value = localOptions.value.filter((k) => availSet.has(k));
      },
      { deep: true, immediate: true }
    );

    // Secciones
    const sectionsList = computed(() => Object.keys(props.sections || {}).map((k) => ({ key: k })));
    const allSectionsChecked = computed(() => sectionsList.value.length > 0 && localSections.value.length === sectionsList.value.length);
    const someSectionsChecked = computed(() => localSections.value.length > 0 && localSections.value.length < sectionsList.value.length);
    const toggleAllSections = (e: Event) => {
      const checked = (e.target as HTMLInputElement).checked;
      localSections.value = checked ? sectionsList.value.map((i) => i.key) : [];
    };

    // Opciones
    const hasOptions = computed(() => !!props.availableOptions && Object.keys(props.availableOptions!).length > 0);
    const optionsList = computed(() => (hasOptions.value ? Object.keys(props.availableOptions as Record<string, boolean>).map((k) => ({ key: k })) : []));
    const allOptionsChecked = computed(() => optionsList.value.length > 0 && localOptions.value.length === optionsList.value.length);
    const someOptionsChecked = computed(() => localOptions.value.length > 0 && localOptions.value.length < optionsList.value.length);
    const toggleAllOptions = (e: Event) => {
      const checked = (e.target as HTMLInputElement).checked;
      localOptions.value = checked ? optionsList.value.map((i) => i.key) : [];
    };

    // APLICAR / CANCELAR
    const apply = () => {
      const showFields: Record<string, boolean> = {};
      Object.keys(props.sections).forEach((k) => {
        showFields[k] = localSections.value.includes(k);
      });

      // 👉 escribe SOLO en el namespace indicado
      if (props.scope === 'student') {
        trySetModel('showFieldsStudent', showFields);
      } else if (props.scope === 'tutor') {
        trySetModel('showFieldsTutor', showFields);
      } else {
        trySetModel('showFields', showFields);
      }

      if (props.availableOptions) {
        const opts: Record<string, boolean> = {};
        Object.keys(props.availableOptions).forEach((k) => {
          opts[k] = localOptions.value.includes(k);
        });

        if (props.scope === 'student') {
          trySetModel('optionsStudent', opts);
        } else if (props.scope === 'tutor') {
          trySetModel('optionsTutor', opts);
        } else {
          trySetModel('options', opts);
        }
      }

      visible.value = false; // en vez de emit('update:isVisible', false)
    };

    const cancel = () => {
      hydrateFromProps();
      visible.value = false; // idem
    };

    return {
      translateFilter,
      sectionsList,
      localSections,
      allSectionsChecked,
      someSectionsChecked,
      toggleAllSections,
      hasOptions,
      optionsList,
      localOptions,
      allOptionsChecked,
      someOptionsChecked,
      toggleAllOptions,
      apply,
      cancel,
      visible,
    };
  },
});
</script>

<style scoped>
.drawer-title {
  color: #fff;
  font-weight: 700;
  font-size: 16px;
}
.filters-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px 12px 20px;
}
.filter-block {
  background: #fff;
  border: 1px solid rgba(145, 158, 171, 0.2);
  border-radius: 12px;
  overflow: hidden;
}
.block-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(145, 158, 171, 0.2);
  background: #f7f8fa;
}
.block-title {
  font-weight: 600;
}
.select-all {
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.list {
  list-style: none;
  margin: 0;
  padding: 8px 12px;
  max-height: 50vh;
  overflow: auto;
}
.list-item + .list-item {
  margin-top: 6px;
}
.checkbox-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
