<template>
  <div class="notification-cards">
    <div class="notification-body" @click="navigateToUrl(data)">
      <div class="notification-icon">
        <AppAvatar :size="'md'" :name="`${avatar}`" :avatar="avatar">
        </AppAvatar>
      </div>
      <div class="notification-cards">
        <div class="notification-content">
          <div
            :class="[
              'notification-title',
              data.open ? 'notification-title-bold' : '',
            ]"
          >
            {{ titleNotification }}
          </div>
          <div
            :class="[
              'notification-text',
              data.open ? 'notification-title-bold' : '',
            ]"
          >
            {{ textNotification }}
          </div>
          <div class="notification-time">
            {{ notificationTime }}
          </div>
        </div>
      </div>
    </div>
    <!-- Botón para desplegar la opción de "marcar como leído" y punto naranja si la notificación está sin leer -->
    <div class="d-flex align-items-center">
      <div
        v-if="optionSelect"
        class="icono-notificaciones dropdown show d-flex align-items-center"
        @click="toggleReadOption"
      >
        <a
          class="buttonContent opc text-decoration-none text-dark"
          href="#"
          id="navbarDropdown"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          role="button"
        >
          <AppGetIcon
            class="iconThreeDots"
            :fillColor="'#999'"
            :name="'ThreeDots'"
          />
        </a>
        <ul
          class="dropdown-menu p-0"
          aria-labelledby="navbarDropdown"
          style="transform: translate(-18px, 25px); position: absolute"
        >
          <li>
            <div class="content-check">
              <AppGetIcon
                class="form__icon"
                :fillColor="'#999'"
                :name="'checkSm'"
              />
              <div class="dropdown-text w-100">
                <div class="notification-text w-100" @click="markAsRead(data)">
                  Marcar como leída
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <span v-if="!data.open" class="unread-dot"></span>
    </div>
    <!-- <div class="d-flex align-items-center">
      <button
        v-if="optionSelect"
        class="mark-as-read-btn"
        @click="toggleReadOption"
      >
        <AppGetIcon :fillColor="'#999'" :name="'ThreeDots'" />
      </button>
      <span v-if="!data.open" class="unread-dot"></span>
    </div>
    <div v-if="showMarkAsRead" class="mark-as-read-option">
      <span @click="markAsRead(data)">Marcar como leído</span>
    </div> -->
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from 'vue';

import ImageNotAvailable from '../../../assets/images/image-not-available.png';
import AppGetIcon from '../AppGetIcon.vue';
import { CreateOrUpdateOpenAtService } from '../../services/createOrUpdateAnnouncementOpenAt.service';
import AppAvatar from '../../../shared/components/AppAvatar.vue';
import { format } from 'date-fns';

const createOrUpdateOpenAtService = new CreateOrUpdateOpenAtService();

export default defineComponent({
  name: 'AppCardNotification',
  props: {
    avatar: {
      type: String,
      default: '',
    },
    iconoName: {
      type: String,
      default: '',
    },
    titleNotification: {
      type: String,
      default: '',
    },
    textNotification: {
      type: String,
      default: '',
    },
    notificationTime: {
      type: String,
      default: '',
    },
    data: {
      type: Object, // Definir tipo adecuado para `data`
      required: true,
    },
    optionSelect: {
      type: Boolean,
      default: false,
    },
    url: {
      type: String,
      default: '',
    },
    image: {},
  },
  setup(props, { emit }) {
    const footer: any = ref(null);
    const showFooter = ref(false);
    const title: any = ref(null);
    const showTitle = ref(false);
    const showImage = ref(false);
    const dataImage = ref(props.image);


    // Estado para la opción de "marcar como leído"
    const showMarkAsRead = ref(false);
    const navigateToUrl = async (item: any) => {

      if (item.urlRedirect) {
        if (props.optionSelect) {
          await markAsRead(item);
        }
        window.location.href = item.urlRedirect;
      }
    };
    // Función para alternar la visibilidad de la opción "marcar como leído"
    const toggleReadOption = () => {
      showMarkAsRead.value = !showMarkAsRead.value;
    };

    // Función para marcar como leído (aquí puedes implementar lógica adicional)
    const markAsRead = async (item: any) => {
      const notificationData = [
        {
          id: item?.id,
          institutionId: item?.institutionId,
          avatar: item?.avatar,
          title: item?.title,
          description: item?.description,
          urlRedirect: item?.urlRedirect,
          titleAnnouncements: item?.titleAnnouncements,
          notificationType: item?.notificationType,
          communicationId: item?.communicationId,
          createdAt: item?.createdAt,
          updatedAt: item?.updatedAt,
          notificationReceiverId: item?.notificationReceiverId,
          open: 1,
          openAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'), // Formateamos la fecha
        },
      ];

      try {
        await createOrUpdateOpenAtService.run(notificationData);
        showMarkAsRead.value = false;

        // Emitir evento al padre para que actualice las notificaciones
        emit('notificationRead', item); // Pasar el id o datos necesarios
      } catch (error) {
        console.error('Error al marcar como leída:', error);
      }
    };

    onMounted(() => {
      if (footer.value) {
        showFooter.value = !!footer.value.children.length;
      }
      if (title.value) {
        showTitle.value = !!title.value.children.length;
      }
      showImage.value = props.image !== undefined;
      if (!dataImage.value && showImage.value) {
        dataImage.value = ImageNotAvailable;
      }
    });

    const errorImage = (e: any) => {
      e.target.src = ImageNotAvailable;
    };

    return {
      footer,
      showFooter,
      title,
      showTitle,
      showImage,
      dataImage,
      errorImage,
      showMarkAsRead,
      toggleReadOption,
      markAsRead,
      navigateToUrl,
    };
  },
  components: { AppGetIcon, AppAvatar },
});
</script>

<style scoped>
.notification-cards {
  width: 100%;
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 5px;
  border-bottom: 1px solid #f0f2f5;
  position: relative;
  justify-content: space-between;
}
.notification-body {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
.notification-cards:hover {
  background: #f1f1f1;
  border-radius: 8px;
}
.notification-content {
  max-width: 326px;
  display: flex;
  flex-direction: column;
}
.notification-title-bold {
  font-family: 'Roboto';
  font-weight: 500;
  font-size: 14px;
  color: gray !important;
}
.notification-title {
  font-family: 'Roboto';
  font-weight: 900;
  font-size: 14px;
}
.notification-text {
  font-family: 'Roboto';
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: #2e3135;
}
.notification-time {
  font-family: 'Roboto';
  font-weight: 400;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.colorAmarrillo {
  border-radius: 50%;
  background: #fff4d8;
  padding: 4px;
}
.colorTime {
  border-radius: 50%;
  background: #ffc7c7;
  padding: 4px;
}
.colorSee {
  border-radius: 50%;
  background: #fbe2ff;
  padding: 4px;
}
.colorMessage {
  border-radius: 50%;
  background: #e4e9ff;
  padding: 4px;
}
.bold-text {
  font-weight: bold;
}

.unread-dot {
  width: 10px;
  height: 10px;
  background-color: var(--color-primary);
  border-radius: 50%;
  margin-left: 8px;
}
.content-check {
  display: flex !important;
  align-items: center;
  justify-content: flex-start;
  gap: 5px;
  padding: 5px;
  box-shadow: 1px 2px 6px #00000073;
  transition: background-color 0.3s ease; /* Agrega transición para suavizar el cambio */
}

.content-check:hover {
  background-color: var(--color-primary);
  cursor: pointer;
}

.content-check:hover .dropdown-text .notification-text {
  color: var(--color-light);
  font-weight: bold;
}
.dropdown-menu {
  width: 200px;
  max-height: 400px;
  overflow: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;
  z-index: 2;
  gap: 10px;
}
.form__icon {
  width: 14%;
  height: 14%;
}
.iconThreeDots:hover {
  width: unset !important;
}
.buttonContent:hover {
  width: var(--width-btn-icon);
  height: var(--height-btn-icon);
  border-radius: 50px;
  color: var(--color-light);
  background-color: var(--color-secondary);
}
</style>
