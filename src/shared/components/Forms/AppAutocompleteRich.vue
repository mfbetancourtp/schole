<template>
  <v-select
    v-model="value"
    class="appAutocompleteRich"
    :class="{
      'appAutocompleteRich--single': !multiple,
      'appAutocompleteRich--multiple': multiple,
      'appAutocompleteRich--remote': isRemote,
    }"
    ref="autocomplete"
    :style="rootStyle"
    :input-id="inputId"
    :options="displayOptions"
    :label="label"
    :reduce="reduce"
    :clearable="clearable"
    :multiple="multiple"
    :placeholder="placeholder"
    :filterable="effectiveFilterable"
    :append-to-body="appendToBody"
    :calculate-position="appendToBody ? withPopper : undefined"
    :close-on-select="!multiple"
    :hide-selected="multiple"
    @open="handleOpen"
    @search="handleSearch"
    @option:selected="handleOptionSelected"
  >
    <template v-if="$slots.option" #option="slotProps">
      <slot name="option" v-bind="slotProps" />
    </template>

    <template v-if="$slots['selected-option']" #selected-option="slotProps">
      <slot name="selected-option" v-bind="slotProps" />
    </template>

    <template #no-options="slotProps">
      <slot name="no-options" v-bind="{ ...slotProps, isLoadingRemote, minSearchLength, loadOnOpen }">
        <template v-if="isRemote">
          <span v-if="isLoadingRemote">Cargando opciones...</span>
          <span v-else-if="loadOnOpen && normalizedSearch.length === 0"> Selecciona una opción o escribe para refinar la búsqueda. </span>
          <span v-else-if="normalizedSearch.length < minSearchLength"> Escribe al menos {{ minSearchLength }} caracteres para buscar. </span>
          <span v-else>No se encontraron resultados.</span>
        </template>
        <template v-else>
          <template v-if="slotProps.searching">
            No se encontraron resultados para <em>{{ slotProps.search }}</em
            >.
          </template>
          <span v-else style="opacity: 0.5"> Comience a escribir para buscar opciones. </span>
        </template>
      </slot>
    </template>
  </v-select>
</template>

<script lang="ts">
import { createPopper } from '@popperjs/core';
import { computed, defineComponent, onUnmounted, PropType, ref, Ref, watch } from 'vue';

type Scalar = any;
type Multi = Scalar[];
type ServiceMethod = (...args: any[]) => Promise<any>;
type SelectOption = Record<string, unknown> | Scalar;

function toInitial(val: any, multiple: boolean): Scalar | Multi {
  return multiple ? (val as Multi) ?? [] : (val as Scalar);
}

export default defineComponent({
  name: 'AppAutocompleteRich',
  props: {
    inputId: String,
    modelValue: {
      type: [String, Number, Object, Array] as PropType<Scalar | Multi>,
      default: null,
    },
    options: {
      type: Array as PropType<SelectOption[]>,
      default: () => [],
    },
    service: {
      type: Object as PropType<Record<string, ServiceMethod>>,
      default: null,
    },
    serviceMethod: {
      type: String,
      default: 'run',
    },
    paramsService: {
      type: Object as PropType<Record<string, unknown>>,
      default: () => ({}),
    },
    label: {
      type: String,
      default: 'name',
    },
    reduce: {
      type: Function as PropType<(option: any) => Scalar>,
      default: (option: any) => option,
    },
    placeholder: {
      type: String,
      default: 'Seleccionar...',
    },
    clearable: {
      type: Boolean,
      default: true,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    appendToBody: {
      type: Boolean,
      default: true,
    },
    minSearchLength: {
      type: Number,
      default: 2,
    },
    debounceMs: {
      type: Number,
      default: 400,
    },
    remotePerPage: {
      type: Number,
      default: 25,
    },
    dropdownMaxHeight: {
      type: [String, Number] as PropType<string | number>,
      default: '260px',
    },
    minWidth: {
      type: [String, Number] as PropType<string | number>,
      default: undefined,
    },
    maxWidth: {
      type: [String, Number] as PropType<string | number>,
      default: undefined,
    },
    filterable: {
      type: Boolean,
      default: true,
    },
    loadOnOpen: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'search', 'option:selected', 'loading-finished'],
  setup(props, { emit }) {
    const value: Ref<Scalar | Multi> = ref(toInitial(props.modelValue, props.multiple));
    const autocomplete = ref();
    const remoteOptions = ref<SelectOption[]>([]);
    const normalizedSearch = ref('');
    const isLoadingRemote = ref(false);
    const activeLoadingFn = ref<((state: boolean) => void) | null>(null);
    const requestToken = ref(0);
    let searchTimeout: ReturnType<typeof setTimeout> | null = null;

    const isRemote = computed(() => !!props.service);
    const effectiveFilterable = computed(() => (isRemote.value ? false : props.filterable));
    const normalizeDimension = (value: string | number | undefined) => {
      if (value == null) return undefined;
      return typeof value === 'number' ? `${value}px` : value;
    };
    const rootStyle = computed(() => ({
      '--app-autocomplete-rich-max-height': typeof props.dropdownMaxHeight === 'number' ? `${props.dropdownMaxHeight}px` : props.dropdownMaxHeight,
      '--app-autocomplete-rich-min-width': normalizeDimension(props.minWidth),
      '--app-autocomplete-rich-max-width': normalizeDimension(props.maxWidth),
      minWidth: normalizeDimension(props.minWidth),
      maxWidth: normalizeDimension(props.maxWidth),
    }));

    watch(
      () => props.modelValue,
      (newValue) => {
        value.value = toInitial(newValue, props.multiple);
      }
    );

    watch(
      value,
      (newValue) => {
        emit('update:modelValue', newValue);
      },
      { deep: true }
    );

    const stopLoading = () => {
      activeLoadingFn.value?.(false);
      activeLoadingFn.value = null;
      isLoadingRemote.value = false;
    };

    const normalizeRemoteOptions = (response: any): SelectOption[] => {
      if (Array.isArray(response)) return response;
      if (Array.isArray(response?.data)) return response.data;
      return [];
    };

    const executeRemoteSearch = async (searchTerm: string, token: number) => {
      if (!props.service) return;

      const methodName = props.serviceMethod || 'run';
      const method = props.service[methodName];

      if (typeof method !== 'function') {
        throw new Error(`[AppAutocompleteRich] Método '${methodName}' no existe en el servicio`);
      }

      const response = await method({
        ...props.paramsService,
        page: 1,
        perPage: props.remotePerPage,
        search: searchTerm,
      });

      if (token !== requestToken.value) return;

      remoteOptions.value = normalizeRemoteOptions(response);
    };

    const loadRemoteOptions = async (searchTerm: string) => {
      const token = requestToken.value + 1;
      requestToken.value = token;
      isLoadingRemote.value = true;

      try {
        await executeRemoteSearch(searchTerm, token);
      } catch (error) {
        if (token === requestToken.value) {
          remoteOptions.value = [];
        }
        console.error('[AppAutocompleteRich] Error en carga remota:', error);
      } finally {
        if (token === requestToken.value) {
          stopLoading();
          emit('loading-finished');
        }
      }
    };

    const handleOpen = async () => {
      if (!isRemote.value || !props.loadOnOpen) return;

      normalizedSearch.value = '';
      if (searchTimeout) clearTimeout(searchTimeout);
      stopLoading();

      await loadRemoteOptions('');
    };

    const handleSearch = (search: string, loading: (state: boolean) => void) => {
      emit('search', search);

      if (!isRemote.value) return;

      normalizedSearch.value = search.trim();

      if (searchTimeout) clearTimeout(searchTimeout);
      stopLoading();

      if (normalizedSearch.value.length < props.minSearchLength) {
        remoteOptions.value = [];
        emit('loading-finished');
        return;
      }

      activeLoadingFn.value = loading;
      isLoadingRemote.value = true;
      activeLoadingFn.value(true);

      searchTimeout = setTimeout(async () => {
        await loadRemoteOptions(normalizedSearch.value);
      }, props.debounceMs);
    };

    const handleOptionSelected = (option: SelectOption) => {
      emit('option:selected', option);
    };

    const getOptionIdentity = (option: SelectOption): string => {
      if (option == null) return '';
      if (typeof option !== 'object') return String(option);

      const optionRecord = option as Record<string, unknown>;

      if (optionRecord.id != null) return String(optionRecord.id);

      try {
        const reducedValue = props.reduce(optionRecord);
        if (reducedValue != null && typeof reducedValue !== 'object') {
          return String(reducedValue);
        }
      } catch {
        // noop
      }

      const labelValue = optionRecord[props.label];
      if (labelValue != null) return String(labelValue);

      return JSON.stringify(optionRecord);
    };

    const mergeUniqueOptions = (...collections: SelectOption[][]) => {
      const uniqueOptions = new Map<string, SelectOption>();

      collections.flat().forEach((option) => {
        const identity = getOptionIdentity(option);
        if (!identity) return;
        uniqueOptions.set(identity, option);
      });

      return Array.from(uniqueOptions.values());
    };

    const selectedValueOptions = computed<SelectOption[]>(() => {
      if (Array.isArray(value.value)) {
        return value.value.filter((item) => item != null) as SelectOption[];
      }

      if (value.value != null) {
        return [value.value as SelectOption];
      }

      return [];
    });

    const selectedValueIdentities = computed<Set<string>>(() => new Set(selectedValueOptions.value.map((option) => getOptionIdentity(option)).filter(Boolean)));

    const displayOptions = computed<SelectOption[]>(() => {
      const mergedOptions = mergeUniqueOptions(props.options, remoteOptions.value, selectedValueOptions.value);

      if (!props.multiple) return mergedOptions;

      return mergedOptions.filter((option) => !selectedValueIdentities.value.has(getOptionIdentity(option)));
    });

    onUnmounted(() => {
      if (searchTimeout) clearTimeout(searchTimeout);
      stopLoading();
    });

    return {
      autocomplete,
      displayOptions,
      effectiveFilterable,
      handleOpen,
      handleOptionSelected,
      handleSearch,
      isLoadingRemote,
      isRemote,
      normalizedSearch,
      rootStyle,
      value,
    };
  },
  methods: {
    withPopper(dropdownList: HTMLElement, component: any, { width }: { width: string }) {
      dropdownList.style.width = width;
      dropdownList.style.maxHeight = typeof this.dropdownMaxHeight === 'number' ? `${this.dropdownMaxHeight}px` : this.dropdownMaxHeight;

      const popper = createPopper(component.$refs.toggle, dropdownList, {
        placement: 'bottom',
        strategy: 'fixed',
        modifiers: [
          { name: 'offset', options: { offset: [0, -1] } },
          {
            name: 'toggleClass',
            enabled: true,
            phase: 'write',
            fn({ state }) {
              component.$el.classList.toggle('drop-up', state.placement === 'bottom');
            },
          },
        ],
      });

      const resizeObserver = new ResizeObserver(() => {
        dropdownList.style.width = `${component.$refs.toggle.offsetWidth}px`;
        popper.update();
      });

      resizeObserver.observe(component.$refs.toggle);

      return () => {
        resizeObserver.disconnect();
        popper.destroy();
      };
    },
  },
});
</script>

<style scoped>
.appAutocompleteRich {
  display: block;
  width: 100%;
  min-width: var(--app-autocomplete-rich-min-width, 0);
  max-width: var(--app-autocomplete-rich-max-width, 100%);
}

:deep(.vs__selected-options) {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  align-items: center;
  flex-basis: 100%;
  flex-grow: 1;
  min-width: 0;
}

:deep(.vs__dropdown-toggle) {
  width: 100%;
  min-width: var(--app-autocomplete-rich-min-width, 0);
  max-width: var(--app-autocomplete-rich-max-width, 100%);
  align-items: center;
  min-height: 42px;
  padding: 0.2rem 0.65rem !important;
  border: 1px solid #dbe3ee;
  border-radius: 12px;
  background: #fff;
  box-shadow: none;
}

:deep(.vs__selected),
:deep(.vs__search),
:deep(.vs__dropdown-option),
:deep(.vs__no-options) {
  font-size: 0.95rem;
  color: #0f172a;
}

:deep(.vs__selected) {
  display: flex;
  align-items: center;
  min-width: 0;
  max-width: 100%;
}

:deep(.vs__selected > *) {
  min-width: 0;
  max-width: 100%;
  flex: 1 1 auto;
}

:deep(.vs__search) {
  min-width: 0;
}

:deep(.vs__actions) {
  flex-shrink: 0;
  padding-left: 0.5rem;
}

:deep(.vs__dropdown-menu) {
  max-height: var(--app-autocomplete-rich-max-height, 260px);
  border: 1px solid #dbe3ee;
  border-radius: 14px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
  overflow-x: hidden;
  overflow-y: auto;
  z-index: 100;
}

:deep(.vs__dropdown-option) {
  line-height: 1.35;
}

:deep(.vs__dropdown-option > *) {
  min-width: 0;
}

:deep(.vs__dropdown-option--selected),
:deep(.vs__dropdown-option--highlight) {
  background: rgba(var(--color-primary-rgb), var(--opacity-color-10));
  color: var(--color-primary);
}

.appAutocompleteRich--single :deep(.vs__selected-options) {
  flex-wrap: nowrap;
  overflow: hidden;
}

.appAutocompleteRich--single :deep(.vs__selected) {
  flex: 1 1 auto;
  overflow: hidden;
  white-space: nowrap;
}

.appAutocompleteRich--single :deep(.vs__selected > *) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.appAutocompleteRich--single :deep(.vs__search),
.appAutocompleteRich--single :deep(.vs__search:focus) {
  width: 100% !important;
  min-width: 7rem;
  flex: 1 0 7rem;
  padding-left: 0;
}

.appAutocompleteRich--single :deep(.vs__selected + .vs__search) {
  width: 1px !important;
  min-width: 0;
  flex: 0 1 1px;
  padding: 0;
  opacity: 0;
}

.appAutocompleteRich--single.vs--open :deep(.vs__selected + .vs__search),
.appAutocompleteRich--single.vs--searching :deep(.vs__selected + .vs__search),
.appAutocompleteRich--single :deep(.vs__selected + .vs__search:focus) {
  width: 100% !important;
  min-width: 7rem;
  flex: 1 0 7rem;
  padding-left: 0;
  opacity: 1;
}

.appAutocompleteRich--multiple :deep(.vs__selected-options) {
  align-items: flex-start;
}

.v-select.drop-up.vs--open :deep(.vs__dropdown-toggle) {
  border-radius: 0 0 12px 12px;
  border-top-color: transparent;
  padding: 0.2rem 0.65rem 0.45rem !important;
}

:deep([data-popper-placement='bottom']) {
  border-radius: 14px 14px 0 0;
  border-top-style: solid;
  border-bottom-style: none;
  box-shadow: 0 -3px 6px rgba(0, 0, 0, 0.15);
}
</style>
