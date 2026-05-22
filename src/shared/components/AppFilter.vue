<template>
  <div class="mb-3 tw-flex-1">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { settings } from '../constant/settings.contants';
import type { LocationQueryValue } from 'vue-router';

/**
 * Wrapper que opcionalmente persiste su v-model en localStorage + URL.
 * Si NO se pasa la prop `filterName`, actúa sólo como contenedor visual.
 */
export default defineComponent({
  name: 'AppFilter',
  props: {
    modelValue: { required: false },
    filterName: { type: String, default: null },
  },
  emits: ['update:modelValue', 'isNotInitialized'],
  setup(props, { emit }) {
    /* ------------------------------------------------------------------ */
    /*   Early-return cuando el componente no debe persistir el filtro     */
    /* ------------------------------------------------------------------ */
    if (!props.filterName) {
      onMounted(() => emit('isNotInitialized'));
      return {};
    }

    /** Nombre completo, p. ej.  "homeTeacher.levelId"  */
    const filterFullName = props.filterName as string;
    const [filterApp, filterField] = filterFullName.split('.') as [string, string];

    const router = useRouter();
    const route = useRoute();

    /* ----------------------- utilidades localStorage ------------------ */
    const getFiltersLS = (): Record<string, unknown> => {
      try {
        return JSON.parse(localStorage.getItem(settings.appFilterNameOnLocalStorage) || '{}');
      } catch {
        return {};
      }
    };

    const setFiltersLS = (data: Record<string, unknown>) => {
      localStorage.setItem(settings.appFilterNameOnLocalStorage, JSON.stringify(data));
    };

    /* ---------------------------- helpers ----------------------------- */
    const coerceQueryValue = (v: LocationQueryValue | LocationQueryValue[]): unknown => {
      if (Array.isArray(v)) {
        return v.map((item) => {
          if (item == null) return item;
          const num = Number(item);
          return isNaN(num) ? item : num;
        });
      }
      if (v == null) return v;
      const num = Number(v);
      return isNaN(num) ? v : num;
    };

    const getInitialValue = () => {
      // 1) Revisa la URL primero.
      const queryVal = route.query[filterField];
      if (queryVal !== undefined) return coerceQueryValue(queryVal);

      // 2) Si no está en la URL, revisa LS.
      const filters = getFiltersLS();
      return filters[filterFullName] ?? null;
    };

    const updateRouteQuery = async (clear: boolean) => {
      const query: any = { ...route.query } as Record<string, unknown>;

      if (clear) delete query[filterField];

      // agrega los filtros de la misma app (homeTeacher.*, etc.)
      const filters = getFiltersLS();
      Object.keys(filters)
        .filter((k) => k.startsWith(`${filterApp}.`))
        .forEach((k) => {
          query[k.replace(`${filterApp}.`, '')] = filters[k];
        });

      await router.replace({ query });
    };

    /* ------------------------ watcher v-model ------------------------ */
    watch(
      () => props.modelValue,
      async (val) => {
        const filters = getFiltersLS();
        const isEmpty = val == null || (Array.isArray(val) && !val.length) || val === '';
        let clear = false;

        if (isEmpty) {
          delete filters[filterFullName];
          clear = true;
        } else {
          filters[filterFullName] = val;
        }

        setFiltersLS(filters);
        await updateRouteQuery(clear);
      }
    );

    /* --------------------------- mounted ----------------------------- */
    onMounted(async () => {
      const stored = getInitialValue();
      if (stored != null) {
        emit('update:modelValue', stored);
        await updateRouteQuery(false);
      } else {
        emit('isNotInitialized');
      }
    });

    return {};
  },
});
</script>

<style scoped>
/* sin estilos propios; el contenedor hereda los márgenes del slot */
</style>
