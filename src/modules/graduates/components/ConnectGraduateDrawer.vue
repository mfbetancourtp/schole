<template>
  <AppDrawer :isVisible="isVisible" size="sm" @update:isVisible="$emit('update:isVisible', $event)">
    <!-- HEAD -->
    <template #head>
      <AppDrawerHeader variant="create" icon="user-plus" title="Conectar" />
    </template>

    <!-- BODY -->
    <template #body>
      <div v-if="graduate" class="cgd-body">
        <!-- User info card -->
        <div class="cgd-user-card">
          <img v-if="graduate.avatar" :src="graduate.avatar" :alt="fullName" class="cgd-avatar" />
          <span v-else class="cgd-initials">{{ initials }}</span>
          <div class="cgd-user-info">
            <p class="cgd-user-name">{{ fullName }}</p>
            <p v-if="graduate.mutualFriends > 0" class="cgd-user-meta">{{ graduate.mutualFriends }} conexiones en común</p>
            <p v-else class="cgd-user-meta">Sin conexiones en común</p>
          </div>
        </div>

        <!-- Message -->
        <div class="cgd-field">
          <label class="cgd-label">Mensaje (opcional)</label>
          <textarea v-model="message" class="cgd-textarea" rows="4" placeholder="Hola, me gustaría conectar contigo..."></textarea>
          <p class="cgd-hint">Agrega un mensaje personalizado para aumentar las posibilidades de que acepten tu solicitud</p>
        </div>

        <!-- Why connect info box -->
        <div class="cgd-info-box">
          <div class="cgd-info-icon"><AppIcon icon="user-plus" /></div>
          <div>
            <p class="cgd-info-title">¿Por qué conectar?</p>
            <p class="cgd-info-text">Al conectar podrás ver sus publicaciones, compartir oportunidades laborales y hacer networking profesional.</p>
          </div>
        </div>
      </div>
    </template>

    <!-- FOOTER -->
    <template #footer>
      <div class="d-flex gap-2 w-100">
        <AppButton outlined variant="secondary" nativeType="button" class="flex-grow-1" @click="$emit('update:isVisible', false)">Cancelar</AppButton>
        <AppButton variant="primary" nativeType="button" class="flex-grow-1" :disabled="sending" @click="send">
          <span v-if="sending" class="spinner-border spinner-border-sm me-1" role="status"></span>
          {{ sending ? 'Enviando...' : 'Enviar solicitud' }}
        </AppButton>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, watch } from 'vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppDrawerHeader from '../../../shared/components/AppDrawerHeader.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import type { FriendSuggestionDto } from '../dtos/friend.dto';

export default defineComponent({
  name: 'ConnectGraduateDrawer',
  components: { AppDrawer, AppDrawerHeader, AppButton, AppIcon },
  props: {
    isVisible: { type: Boolean, default: false },
    graduate: {
      type: Object as PropType<FriendSuggestionDto | null>,
      default: null,
    },
    sending: { type: Boolean, default: false },
  },
  emits: ['update:isVisible', 'send'],
  setup(props, { emit }) {
    const message = ref('');

    watch(
      () => props.isVisible,
      (val) => {
        if (val) message.value = '';
      }
    );

    const fullName = computed(() => (props.graduate ? `${props.graduate.names} ${props.graduate.lastnames}` : ''));
    const initials = computed(() => (props.graduate ? `${props.graduate.names?.[0] ?? ''}${props.graduate.lastnames?.[0] ?? ''}` : ''));

    const send = () => emit('send', message.value);

    return { message, fullName, initials, send };
  },
});
</script>

<style scoped>
.cgd-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* User card */
.cgd-user-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px;
}

.cgd-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e9ecef;
  flex-shrink: 0;
}

.cgd-initials {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #dbeafe;
  color: #1d4ed8;
  font-weight: 700;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid #e9ecef;
}

.cgd-user-info {
  flex: 1;
}

.cgd-user-name {
  font-weight: 700;
  font-size: 0.95rem;
  color: #111827;
  margin: 0 0 3px;
}

.cgd-user-meta {
  font-size: 0.78rem;
  color: #6b7280;
  margin: 0;
}

/* Message field */
.cgd-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cgd-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
}

.cgd-textarea {
  width: 100%;
  border: 1.5px solid #d1d5db;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 0.85rem;
  color: #374151;
  resize: vertical;
  outline: none;
  transition: border-color 0.15s;
  font-family: inherit;
}

.cgd-textarea:focus {
  border-color: var(--color-primary, #2563eb);
}

.cgd-textarea::placeholder {
  color: #9ca3af;
}

.cgd-hint {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
}

/* Info box */
.cgd-info-box {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  padding: 14px;
}

.cgd-info-icon {
  color: var(--color-primary, #2563eb);
  font-size: 1rem;
  flex-shrink: 0;
  margin-top: 1px;
}

.cgd-info-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-primary, #2563eb);
  margin: 0 0 4px;
}

.cgd-info-text {
  font-size: 0.8rem;
  color: var(--color-primary, #2563eb);
  margin: 0;
  line-height: 1.5;
}
</style>
