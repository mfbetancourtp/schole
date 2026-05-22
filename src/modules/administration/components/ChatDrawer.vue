<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="updateVisibility">
    <template #head>
      <div class="drawer-header">
        <div class="drawer-header-left">
          <!-- Left side content (buttons would go here) -->
        </div>
        <div class="drawer-header-title">
          <h2 class="title-form">Chat</h2>
        </div>
      </div>
    </template>
    <!-- Contenido del Drawer: Componente de Chat -->
    <template #body>
      <div class="drawer-body">
        <AppChat
          v-if="!loadingComments"
          :row-table="'PlanningWeeks'"
          :comments-res="comments"
          :row-id="Number(planningWeekWithDetails?.id)"
          @new-comment="updateComments"
          :isSmallView="$props.isSmallView"
        />
        <div v-else class="loading-container">
          <div class="loading-spinner"></div>
          <span>Cargando comentarios...</span>
        </div>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppChat from '../../../shared/components/AppChat.vue';

export default defineComponent({
  name: 'ChatDrawer',
  components: {
    AppDrawer,
    AppChat,
  },
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
    loadingComments: {
      type: Boolean,
      default: false,
    },
    comments: {
      type: Array,
      default: () => [],
    },
    planningWeekWithDetails: {
      type: Object,
      default: null,
    },
    isSmallView: {
      type: Boolean,
      default: false, // Por defecto usará la vista grande (70vh)
    },
  },
  emits: ['update:isVisible', 'updateComments'],
  setup(props, { emit }) {
    // Se define una propiedad reactiva para la sección activa (se inicializa en 'general')
    const activeSection = ref('general');

    const updateVisibility = (value: boolean) => {
      emit('update:isVisible', value); // Emitimos el cambio para el v-model
      activeSection.value = 'general';
    };

    const updateComments = () => {
      emit('updateComments');
      emit('update:isVisible');
    };

    return {
      updateVisibility,
      updateComments,
      activeSection,
    };
  },
});
</script>

<style scoped>
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  color: var(--color-light);
}

.drawer-header-left {
  display: flex;
  align-items: center;
}

.drawer-header-title {
  display: flex;
  justify-content: flex-end;
  flex-grow: 1;
}

.title-form {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0;
}

.drawer-body {
  padding: 16px;
  height: 100%;
  background-color: var(--color-light-2);
  overflow-y: auto;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--color-gray-600);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-gray-400);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .drawer-header {
    padding: 12px 16px;
  }

  .title-form {
    font-size: 1.1rem;
  }
}
</style>
