<template>
  <v-select
    :input-id="inputId"
    :options="options"
    :label="label"
    :reduce="reduce"
    :clearable="clearable"
    :multiple="multiple"
    :selectable="selectable"
    :filterable="filterable"
    v-model="value"
    ref="autocomplete"
    :calculate-position="withPopper"
    append-to-body
    :close-on-select="!multiple"
    :hide-selected="false"
    @search="(s: string, l: any) => $emit('search', s, l)"
  >
    <template #no-options="{ search, searching }">
      <template v-if="searching">
        No se encontraron resultados para <em>{{ search }}</em
        >.
      </template>
      <span v-else style="opacity: 0.5"> Comience a escribir para buscar opciones. </span>
    </template>
  </v-select>
</template>

<script lang="ts">
import { defineComponent, ref, watch, Ref, PropType } from 'vue';
import { createPopper } from '@popperjs/core';

type Scalar = any;
type Multi = Scalar[];

function toInitial(val: any, multiple: boolean): Scalar | Multi {
  return multiple ? (val as Multi) : (val as Scalar);
}

export default defineComponent({
  name: 'AppAutocomplete',
  props: {
    inputId: String,

    options: {
      type: Array as () => any[],
      required: true,
    },

    label: {
      type: String,
      default: 'name',
    },

    reduce: {
      type: Function as PropType<(o: any) => Scalar>,
      default: (o: any) => o?.id ?? o,
    },

    selectable: {
      type: Function as PropType<(o: any) => boolean>,
    },

    filterable: {
      type: Boolean,
      default: true,
    },
    clearable: {
      type: Boolean,
      default: true,
    },
    multiple: {
      type: Boolean,
      default: false,
    },

    modelValue: {
      type: [String, Number, Object, Array] as PropType<Scalar | Multi>,
      default: null,
    },
  },
  emits: ['update:modelValue', 'search'],

  setup(props, { emit }) {
    /* valor reactivo del selector */
    const value: Ref<Scalar | Multi> = ref(toInitial(props.modelValue, props.multiple));
    const autocomplete = ref();

    /* Sincronizar cambios externos */
    watch(
      () => props.modelValue,
      (mv) => (value.value = toInitial(mv, props.multiple))
    );
    watch(
      () => props.modelValue,
      (newValue) => {
        value.value = newValue;
      }
    );

    /* Emitir cambios internos */
    watch(value, (nv) => emit('update:modelValue', nv), { deep: true });

    /* Limpiar selección si ya no existe en las opciones */
    watch(
      () => props.options,
      (opts) => {
        const exists = Array.isArray(value.value) ? opts.some((opt) => (value.value as Multi).includes(props.reduce(opt))) : opts.some((opt) => props.reduce(opt) === value.value);

        if (!exists && value.value) {
          autocomplete.value?.$el.querySelector('.vs__clear')?.dispatchEvent(new Event('click'));
        }
      }
    );

    return { value, autocomplete };
  },

  methods: {
    /** Posiciona el menú y lo mantiene sincronizado con el tamaño del selector */
    withPopper(dropdownList: HTMLElement, component: any, { width }: { width: string }) {
      /* ancho inicial */
      dropdownList.style.width = width;
      dropdownList.style.maxHeight = '200px';

      /* instancia Popper */
      const popper = createPopper(component.$refs.toggle, dropdownList, {
        placement: 'bottom',
        strategy: 'fixed', // evita “saltos” en scroll
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

      /* 👉 Observa cambios de tamaño en el selector */
      const ro = new ResizeObserver(() => {
        // reajustar ancho y reposicionar
        dropdownList.style.width = component.$refs.toggle.offsetWidth + 'px';
        popper.update();
      });
      ro.observe(component.$refs.toggle);

      /* Limpieza cuando el dropdown se cierra/destroza */
      return () => {
        ro.disconnect();
        popper.destroy();
      };
    },
  },
});
</script>

<style scoped>
:deep(.vs__selected-options) {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

:deep(.vs__dropdown-toggle) {
  padding: 0 0 7px !important;
  height: auto;
}

.v-select.drop-up.vs--open :deep(.vs__dropdown-toggle) {
  border-radius: 0 0 8px 8px;
  border-top-color: transparent;
  border-bottom-color: rgba(60, 60, 60, 0.26);
  padding: 0 0 8px !important;
}

:deep([data-popper-placement='bottom']) {
  border-radius: 8px 8px 0 0;
  border-top-style: solid;
  border-bottom-style: none;
  box-shadow: 0 -3px 6px rgba(0, 0, 0, 0.15);
}
</style>
