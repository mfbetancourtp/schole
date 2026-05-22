<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="isVisible = !isVisible">
    <template #head>
      <span class="title-form">Asistente virtual</span>
      <div class="content-avatar">
        <img class="avatar-nav" src="https://img.freepik.com/vector-premium/logotipo-chat-bot-asistente-virtual-logotipo-icono-bot-cabeza-robot-auriculares_843540-99.jpg" />
      </div>
    </template>
    <template #body>
      <div class="chat-container">
        <div ref="messagesContainer" class="messages">
          <div v-for="(message, index) in messages" :key="index" :class="['message', message.from === 'Asistente' ? 'asistente' : 'user']">
            <div class="message-content">
              <span v-if="message.from === 'Asistente' && message.text === 'Escribiendo...'" class="assistant load">
                Escribiendo<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
              </span>
              <template v-else>
                <strong>{{ message.from }}:</strong> {{ message.text }}
              </template>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="d-flex">
        <input class="input-message" v-model="userMessage" @keyup.enter="sendMessage" placeholder="Escribe tu mensaje..." />
        <button class="button-form" @click="sendMessage">Enviar</button>
      </div>
    </template>
  </AppDrawer>
  <button class="floating-button" @click="isVisible = !isVisible">
    <img style="border-radius: 50%; width: 100%" src="https://img.freepik.com/vector-premium/logotipo-chat-bot-asistente-virtual-logotipo-icono-bot-cabeza-robot-auriculares_843540-99.jpg" />
  </button>
</template>

<script lang="ts">
import { defineComponent, ref, nextTick } from 'vue';
import { PostVirtualAssistantService } from '../services/postVirtualAssistant.service';

import AppDrawer from './AppDrawer.vue';

const postVirtualAssistantService = new PostVirtualAssistantService();

export default defineComponent({
  components: {
    AppDrawer,
    //AppAvatar,
  },
  name: 'AppVirtualAssistant',
  setup() {
    const messages = ref<any[]>([]);
    const userMessage = ref('');
    const messagesQuery = ref('');
    const isVisible = ref(false);
    const isTyping = ref(false);
    const messagesContainer = ref<HTMLElement | null>(null);
    const user = localStorage.getItem('user');
    const parsedUser = user ? JSON.parse(user) : null;
    let nameUser = 'Usuario';

    if (parsedUser?.people?.firstName || parsedUser?.people?.firstLastname) {
      // Si existe firstName y firstLastname, los concatena
      const firstName = parsedUser.people.firstName || ''; // Usar '' si no existe
      const firstLastname = parsedUser.people.firstLastname || ''; // Usar '' si no existe

      nameUser = `${firstName} ${firstLastname}`.trim(); // Combina y elimina espacios adicionales
    }

    messages.value.push({
      from: 'Asistente',
      text: `!Bienvenid@ ${nameUser}! ¿En que puedo ayudarte hoy?`,
    });

    const sendMessage = async () => {
      if (userMessage.value.trim() === '' || isTyping.value) return; //No envia mensajes segun la validacion

      // Agregar el mensaje del usuario a la lista
      messages.value.push({ from: nameUser, text: userMessage.value });
      messagesQuery.value = userMessage.value;
      userMessage.value = '';
      scrollToBottom(messagesContainer);
      // Mensaje de escribiendo
      isTyping.value = true;
      messages.value.push({ from: 'Asistente', text: 'Escribiendo...' });
      scrollToBottom(messagesContainer);
      // Llamar al servicio y obtener la respuesta
      try {
        const response = await postVirtualAssistantService.run(messagesQuery.value);
        messages.value.pop(); // Quita el mensaje temporal
        messages.value.push({ from: 'Asistente', text: response.answer });
      } catch (err) {
        console.error('Error al enviar el mensaje:', err);
        messages.value.pop();
        messages.value.push({
          from: 'Asistente',
          text: 'Ocurrió un error al procesar tu mensaje. Intenta nuevamente.',
        });
      } finally {
        isTyping.value = false; // Desactivar "escribiendo..."
        scrollToBottom(messagesContainer);
      }
      //scrollToBottom(messagesContainer);
    };

    async function scrollToBottom(containerRef: any) {
      await nextTick(); // Asegura que el DOM esté completamente actualizado
      if (containerRef.value) {
        containerRef.value.scrollTop = containerRef.value.scrollHeight;
      }
    }

    return {
      isVisible,
      messages,
      userMessage,
      sendMessage,
      messagesContainer,
    };
  },
});
</script>

<style scoped>
.title-form {
  margin-left: 8px;
  font-size: 18px;
  letter-spacing: 0.3px;
  font-weight: bold;
  color: #fff;
}
.content-avatar {
  margin-left: auto;
}
.avatar-nav {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.messages {
  flex: 1; /* Ocupa todo el espacio disponible, dejando espacio para el input */
  overflow-y: auto; /* Permite el desplazamiento si hay muchos mensajes */
  /* max-height: 300px; /* Ajusta la altura máxima */
  padding: 10px;
}

.message-content {
  padding: 8px 14px;
  border-radius: 20px;
  max-width: 85%;
  width: fit-content;
}

.message {
  /*margin-bottom: 10px; /* Espacio entre los mensajes */
  padding: 8px 24px;
  border-radius: 4px; /* Bordes redondeados */
  overflow-wrap: break-word;
}

.asistente .message-content {
  background-color: rgba(var(--color-primary-rgb), 0.15);
}

.user .message-content {
  background-color: #f0f0f0;
}
.user {
  display: flex;
  justify-content: flex-end;
}

.input-container {
  display: flex;
  padding: 10px; /* Espacio alrededor del input */
  border-top: 1px solid #ccc; /* Línea divisoria opcional */
}

.input-message {
  flex: 2; /* Ocupa todo el espacio disponible */
  padding: 10px; /* Espacio interno del input */
  border: 1px solid #ccc; /* Borde del input */
  border-radius: 4px; /* Bordes redondeados */
}
.input-message:focus {
  border-color: var(--color-primary);
  outline: 2px solid var(--color-primary);
}

.button-form {
  flex: 0.5;
  margin-left: 10px; /* Espacio entre el input y el botón */
  padding: 8px; /* Espacio interno del botón */
  background-color: var(--color-primary); /* Color de fondo del botón */
  color: white; /* Color del texto del botón */
  border: none; /* Sin borde */
  border-radius: 4px; /* Bordes redondeados */
  cursor: pointer; /* Cambia el cursor al pasar sobre el botón */
}

.button-form:hover {
  background-color: var(--color-primary); /* Color más oscuro al pasar el mouse */
}

.floating-button {
  position: fixed;
  bottom: 50px; /* Espacio desde abajo */
  right: 20px; /* Espacio desde la derecha */
  width: 60px;
  height: 60px;
  padding: 8px; /* Espacio interno del botón */
  border-radius: 50%;
  background-color: rgba(var(--color-primary-rgb), 0.8);
  color: white;
  border: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  font-size: 24px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.floating-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  background-color: var(--color-primary);
}

.load {
  color: #8c8c8c;
}
.dot {
  opacity: 0;
  animation: blink 1.5s infinite;
}

.dot:nth-child(1) {
  animation-delay: 0s;
}
.dot:nth-child(2) {
  animation-delay: 0.5s;
}
.dot:nth-child(3) {
  animation-delay: 1s;
}

@keyframes blink {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}
</style>
