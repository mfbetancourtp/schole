<template>
  <nav class="app-navbar">
    <!-- <section>
      <div class="app-navbar-logo">
        <router-link to="/">
          <img :src="appLogo?.toString()" />
        </router-link>
      </div>
    </section> -->
    <div class="content-right">
      <!-- Botón de Notificaciones -->
      <div style="position: relative; display: inline-block">
        <AppButton icon="bell" v-tooltip="'Notificaciones'" @click="toggleNotifications"> </AppButton>

        <div v-if="!notificationsNotOpenAnnouncements.every((item) => item.open)" class="earring-container activities-earring" style="position: absolute; top: -5px; right: -3px; z-index: 19">
          <span v-if="notificationsNotOpenAnnouncements.length" @click="toggleNotifications" class="badge rounded-pill bubbleNotifications">
            <span class="hover-activity">
              {{ notificationsNotOpenAnnouncements.filter((item) => item.open === null).length }}
            </span>
          </span>
        </div>

        <AppDrawer :isVisible="isVisibleAnnouncements" @update:isVisible="toggleNotifications">
          <template #head>
            <span class="title-form">Notificaciones</span>
          </template>
          <template #body>
            <div class="section-content">
              <button :class="{ selected: activeSection === 'todas' }" @click="setActive('todas')">Todas</button>
              <button :class="{ selected: activeSection === 'noLeidas' }" @click="setActive('noLeidas')">No leídas</button>
              <AppCustomButton icon-name="checkAll" @click="CheckAllNotifications()" v-tooltip="'Marcar todas como leídas'"></AppCustomButton>
            </div>
            <AppLoading v-if="loading"></AppLoading>
            <AppEmptyResponse v-if="!notificationsNotOpenAnnouncements.length && !loading" :show-image="true"></AppEmptyResponse>
            <div v-else class="container-items" v-for="(item, index) in notificationsNotOpenAnnouncements" :key="index">
              <AppCardNotification
                :data="item"
                :avatar="item.avatar"
                :titleNotification="item.title"
                :textNotification="item.description"
                :notificationTime="item.differenceTime"
                @notificationRead="updateNotifications"
                :optionSelect="activeSection === 'noLeidas'"
                :url="item.urlRedirect"
              />
            </div>
            <div class="buttonLoadMoreAnnouncements">
              <button v-if="dataAllNotifications?.perPage < dataAllNotifications?.total" class="view-notifications-btn" @click="loadMoreAnnouncements">Ver notificaciones anteriores</button>

              <div class="message" v-else-if="notificationsNotOpenAnnouncements.length">
                <AppIcon icon="exclamation-triangle" class="me-1" size="lg"></AppIcon>
                No hay más notificaciones para ver
              </div>
            </div>
          </template>
          <template #footer> </template>
        </AppDrawer>
      </div>

      <!-- Botón de Mensajes -->
      <div style="position: relative; display: inline-block">
        <AppButton icon="envelope" v-tooltip="'Mensajes'" @click="toggleMessages"></AppButton>
        <div v-if="!notificationsNotOpenMessage.every((item) => item.open)" class="earring-container activities-earring" style="position: absolute; top: -5px; right: -3px; z-index: 19">
          <!-- los estilos para pasar los colores primaros class="badge p-2 rounded-pill text-bg-primary bg-primary" -->

          <span v-if="notificationsNotOpenMessage.length" @click="toggleMessages" class="badge rounded-pill bubbleNotifications">
            <span class="hover-activity">
              <!-- Cuenta de elementos con item.open === null -->
              {{ notificationsNotOpenMessage.filter((item) => item.open === null).length }}
            </span>
          </span>
        </div>
        <AppDrawer :isVisible="isVisibleMessage" @update:isVisible="toggleMessages">
          <template #head>
            <span class="title-form">Mensajes</span>
          </template>
          <template #body>
            <div class="section-content">
              <button :class="{ selected: activeSectionMessages === 'todas' }" @click="setActiveMessages('todas')">Todas</button>
              <button :class="{ selected: activeSectionMessages === 'noLeidas' }" @click="setActiveMessages('noLeidas')">No leídas</button>
              <AppCustomButton icon-name="checkAll" @click="CheckAllMessages()" v-tooltip="'Marcar todas como leídas'"></AppCustomButton>
            </div>
            <AppLoading v-if="loading"></AppLoading>
            <AppEmptyResponse v-if="!notificationsNotOpenMessage.length && !loading" :show-image="true"></AppEmptyResponse>
            <div v-else class="container-items" v-for="(item, index) in notificationsNotOpenMessage" :key="index">
              <AppCardNotification
                :data="item"
                :avatar="item.avatar"
                :titleNotification="item.title"
                :textNotification="item.description"
                :notificationTime="item.differenceTime"
                @notificationRead="updateNotifications"
                :optionSelect="activeSectionMessages === 'noLeidas'"
                :url="item.urlRedirect"
              />
            </div>
            <div class="buttonLoadMoreAnnouncements">
              <button v-if="dataAllMessages?.perPage < dataAllMessages?.total" class="view-notifications-btn" @click="loadMoreMessages">Ver notificaciones anteriores</button>

              <div class="message" v-else-if="notificationsNotOpenMessage.length">
                <AppIcon icon="exclamation-triangle" class="me-1" size="lg"></AppIcon>
                No hay más notificaciones para ver
              </div>
            </div>
          </template>
          <template #footer> </template>
        </AppDrawer>
      </div>

      <template v-if="typeof roleId === 'number'">
        <div class="container-roles">
          <AppAutocomplete :options="roles" v-model="roleId" :clearable="false" />
        </div>
      </template>

      <div v-if="user" class="user-panel-dropdown">
        <a href="#" class="dropdown-user" id="dropdownUser" data-bs-toggle="dropdown" aria-expanded="false">
          <AppAvatar :avatar="user.avatar" :name="user.people.names" size="sm" />
        </a>

        <ul class="dropdown-menu" aria-labelledby="dropdownUser">
          <div class="triangle"></div>

          <li>
            <router-link class="dropdown-item" :to="{ name: 'access.profile' }">
              <span>Perfil</span>
            </router-link>
          </li>

          <template v-if="typeof institutionId === 'number'">
            <hr class="dropdown-divider" />

            <li>
              <AppDropdownSelect itemName="Cambiar de institución" :options="institutions" v-model="institutionId" />
            </li>
          </template>

          <div class="mt-3" style="border-top: 2px dashed #cdcd">
            <li @click="signOut()">
              <div class="dropdown-item">
                <span class="fw-bold">Cerrar Sesión</span>
              </div>
            </li>
          </div>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, watch, computed, inject, onMounted } from 'vue';

import AppAvatar from '../components/AppAvatar.vue';
import { format } from 'date-fns';

import AppAutocomplete from '../components/Forms/AppAutocomplete.vue';
import AppDropdownSelect from '../components/Forms/AppDropdownSelect.vue';
import { settings } from '../constant/settings.contants';
import AuthenticatedUserStore from '../stores/authenticatedUser.store';

import { RoleDto } from '../dto/role.dto';
import { InstitutionDto } from '../dto/institution.dto';

import { RolesService } from '../services/roles.service';
import { SignOutService } from '../services/signOut.service';
import { InstitutionsService } from '../services/institutions.service';

import { GetNotificationsNotOpenAnnouncementsService } from '../../modules/administration/services/getNotificationsNotOpenAnnouncements.service';
import { GetNotificationsNotOpenMessagesService } from '../../modules/administration/services/getNotificationsNotOpenMessages.service';
import { CreateOrUpdateOpenAtService } from '../services/createOrUpdateAnnouncementOpenAt.service';
import AppEmptyResponse from '../components/AppEmptyResponse.vue';
import AppCardNotification from '../components/Card/AppCardNotification.vue';

import AppButton from '../components/Buttons/AppButton.vue';
import AppLoading from '../components/AppLoading.vue';
import AppDrawer from '../components/AppDrawer.vue';
import AppIcon from '../components/AppIcon.vue';
import AppCustomButton from '../components/Buttons/AppCustomButton.vue';

const institutionsService = new InstitutionsService();
const signOutService = new SignOutService();
const rolesService = new RolesService();
const getNotificationsNotOpenAnnouncementsService = new GetNotificationsNotOpenAnnouncementsService();
const getNotificationsNotOpenMessagesService = new GetNotificationsNotOpenMessagesService();
const createOrUpdateOpenAtService = new CreateOrUpdateOpenAtService();

export default defineComponent({
  name: 'AppNavBar',

  components: {
    AppAutocomplete,
    AppAvatar,
    AppDropdownSelect,
    AppButton,
    AppCustomButton,
    AppEmptyResponse,
    AppCardNotification,
    AppDrawer,
    AppLoading,
    AppIcon,
  },

  setup() {
    const appLogo = ref<string | undefined>(settings.appLogo);

    const stateUser = inject('stateUser', AuthenticatedUserStore.state);
    const user = computed(() => stateUser.user);
    const isVisibleAnnouncements = ref(false);
    const isVisibleMessage = ref(false);
    const loading = ref(false);
    const activeSection = ref('noLeidas');
    const activeSectionMessages = ref('noLeidas');
    const notificationsNotOpenAnnouncements: Ref<any[]> = ref([]);
    const notificationsNotOpenMessage: Ref<any[]> = ref([]);
    const perPageAnnouncements = ref(10);
    const perPageMessages = ref(10);

    const dataAllNotifications: Ref<any> = ref({});
    const dataAllMessages: Ref<any> = ref({});

    const roles = ref<RoleDto[]>(rolesService.getRoles());
    const currentRole = ref<RoleDto | null>(rolesService.getSelectedRole());
    const institutions = ref<InstitutionDto[]>(institutionsService.getInstitutions());
    const currentInstitution = ref<InstitutionDto | null>(institutionsService.getSelectedInstitution());

    const roleId = ref<number | null>(currentRole.value?.id ?? null);
    const institutionId = ref<number | null>(currentInstitution.value?.id ?? null);

    if (currentInstitution.value && currentInstitution.value?.logoInstitutional) {
      appLogo.value = currentInstitution.value.logoInstitutional;
    }

    const fetchNotifications = async (stateOpen: any, perPage = perPageAnnouncements.value) => {
      const params = {
        userId: user.value?.id,
        stateOpen,
        perPage,
      };
      const response = await getNotificationsNotOpenAnnouncementsService.run(params);
      dataAllNotifications.value = response;
      notificationsNotOpenAnnouncements.value = response.data;
    };

    const fetchMessages = async (stateOpen: any, perPage = perPageMessages.value) => {
      const params = {
        userId: user.value?.id,
        stateOpen,
        perPage,
      };
      const response = await getNotificationsNotOpenMessagesService.run(params);
      dataAllMessages.value = response;
      notificationsNotOpenMessage.value = response.data;
    };
    const toggleNotifications = async () => {
      isVisibleAnnouncements.value = !isVisibleAnnouncements.value;
      if (isVisibleAnnouncements.value) {
        await fetchNotifications(activeSection.value === 'todas' ? 0 : 1);
      }
    };
    const toggleMessages = async () => {
      isVisibleMessage.value = !isVisibleMessage.value;
      if (isVisibleMessage.value) {
        await fetchMessages(activeSectionMessages.value === 'todas' ? 0 : 1);
      }
    };
    const loadMoreAnnouncements = async () => {
      perPageAnnouncements.value += 10;
      await fetchNotifications(activeSection.value === 'todas' ? 0 : 1, perPageAnnouncements.value);
    };
    const updateNotifications = async () => {
      // Llama a las funciones para actualizar las notificaciones y mensajes
      await fetchNotifications(activeSection.value === 'todas' ? 0 : 1, perPageAnnouncements.value);
      await fetchMessages(activeSectionMessages.value === 'todas' ? 0 : 1, perPageMessages.value);
    };
    const loadMoreMessages = async () => {
      perPageMessages.value += 10;
      await fetchMessages(activeSectionMessages.value === 'todas' ? 0 : 1, perPageMessages.value);
    };
    const setActive = (section: any) => {
      activeSection.value = section;
      perPageAnnouncements.value = 10; // Restablecer perPage a 10 cuando se cambia la sección
      fetchNotifications(section === 'todas' ? 0 : 1);
    };

    const setActiveMessages = (section: any) => {
      activeSectionMessages.value = section;
      perPageMessages.value = 10; // Restablecer perPage a 10 cuando se cambia la sección
      fetchMessages(section === 'todas' ? 0 : 1);
    };

    onMounted(async () => {
      loading.value = true;
      const dataAllNotifications = activeSection.value === 'todas' ? 0 : 1;
      const dataAllMessages = activeSection.value === 'todas' ? 0 : 1;

      fetchNotifications(dataAllNotifications);
      fetchMessages(dataAllMessages);
      loading.value = false;
    });

    // Observa cambios en `activeSection` y actualiza `stateOpen` en la función `fetchNotifications`
    watch(activeSection, (newSection) => {
      loading.value = true;
      const stateOpen = newSection === 'todas' ? 0 : 1;
      fetchNotifications(stateOpen);
      loading.value = false;
    });

    watch(activeSectionMessages, (newSection) => {
      loading.value = true;
      const dataAllMessages = newSection === 'todas' ? 0 : 1;
      fetchMessages(dataAllMessages);
      loading.value = false;
    });

    watch(institutionId, (value) => {
      if (currentInstitution.value && value !== currentInstitution.value.id) {
        institutionsService.setSelectedInstitutions(institutions.value.find((institution) => institution.id === value) as InstitutionDto);
        window.location.reload();
      }
    });
    watch(roleId, (value) => {
      if (currentRole.value && value !== currentRole.value.id) {
        rolesService.setSelectedRoles(roles.value.find((role) => role.id === value) as RoleDto);
        window.location.reload();
      }
    });

    const signOut = async () => {
      await signOutService.run();
      window.location.reload();
    };

    const CheckAllNotifications = async () => {
      // Crear un array con todas las notificaciones
      const notificationData = notificationsNotOpenAnnouncements.value.map((item: any) => ({
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
        open: 1, // Marcamos como leída
        openAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'), // Fecha formateada
      }));

      try {
        // Llamamos al servicio para marcar todas las notificaciones como leídas
        await createOrUpdateOpenAtService.run(notificationData);
        await updateNotifications(); // Actualiza el estado de las notificaciones
      } catch (error) {
        console.error('Error al marcar todas las notificaciones como leídas:', error);
      }
    };
    const CheckAllMessages = async () => {
      // Crear un array con todas las notificaciones
      const notificationData = notificationsNotOpenMessage.value.map((item: any) => ({
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
        open: 1, // Marcamos como leída
        openAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'), // Fecha formateada
      }));

      try {
        // Llamamos al servicio para marcar todas las notificaciones como leídas
        await createOrUpdateOpenAtService.run(notificationData);
        await updateNotifications(); // Actualiza el estado de las notificaciones
      } catch (error) {
        console.error('Error al marcar todas las notificaciones como leídas:', error);
      }
    };

    return {
      appLogo,
      user,

      institutionId,
      institutions,
      roleId,
      roles,
      notificationsNotOpenAnnouncements,
      notificationsNotOpenMessage,
      signOut,
      isVisibleAnnouncements,
      isVisibleMessage,
      loading,
      setActive,
      setActiveMessages,
      activeSection,
      activeSectionMessages,
      loadMoreAnnouncements,
      loadMoreMessages,
      updateNotifications,
      toggleNotifications,
      toggleMessages,
      dataAllMessages,
      dataAllNotifications,
      CheckAllNotifications,
      CheckAllMessages,
    };
  },
});
</script>

<style scoped>
.app-navbar {
  position: sticky;
  z-index: 6;
  top: 0;

  display: flex;
  justify-content: space-between;
  height: var(--navbar-height);
  padding: 0.2rem 1rem;

  border-bottom: 0.5px solid rgba(var(--color-gray-600-rgb), var(--opacity-color-10));
  /* background: linear-gradient(305.13deg, #9eaaaf 27.47%, #ffffff 92.8%); */
}

.app-navbar-logo {
  display: flex;
  align-items: center;
  height: 100%;
}
.app-navbar-logo > a,
img {
  height: 100%;
}

.content-right {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}
.content-right .container-roles {
  max-width: 300px;
  min-width: 186px;
}
.content-right .container-roles :deep(.v-select) {
  background-color: var(--color-light);
  border-radius: var(--border-radius-1);
}

.card__notification {
  display: none;
}
.container-items {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.dropdown-text {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  box-shadow: 1px 2px 6px rgba(0, 0, 0, 0.45);
  border-radius: 4px;
  padding: 17px 24px;
  width: 100%;
  gap: 12px;
  justify-content: space-between;
}
.dropdown-menu {
  width: 300px;
  max-height: 400px;
  overflow: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;
  z-index: 2;
  gap: 10px;
}
.title-form {
  font-size: 18px;
  letter-spacing: 0.3px;
  font-weight: bold;
  color: #fff;
  display: flex;
  width: 100%;
  justify-content: flex-end;
}
.section-content {
  min-height: 38px;
  background-color: #f4f6f8;
  padding: 10px 8px;
  display: flex;
  gap: 10px;
}

.section-content button {
  padding: 8px 0px;

  /*margin-right: 10px;
  border: 1px solid #ccc;
  background-color: white;*/
  cursor: pointer;
  border-radius: 12px;
  flex: 1 1 0px;
  color: #8d8d8d;
  transition: all 0.55s ease;
  font-size: 0.875rem;
  /*font-weight: bold;*/
  letter-spacing: 0.2px;
  transform: translatey(0);
}

.section-content button.selected {
  background-color: var(--color-primary);
  color: #fff;
  border-color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transform: translatey(-2px);
  font-weight: bold;
}
.view-notifications-btn {
  width: 100%;
  color: var(--color-primary);
  background-color: transparent;
  border-color: currentColor;
  padding: 5px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: var(--border-radius-1);
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
  border: 1px solid var(--color-primary);
}

.view-notifications-btn:hover {
  color: var(--color-light);
  background-color: var(--color-secondary);
  cursor: pointer;
}
.buttonLoadMoreAnnouncements {
  width: 100%;
  padding: 18px;
  display: flex;
  justify-content: center;
}
.message {
  width: 100%;
  display: flex;
  justify-content: center;
  color: var(--color-primary);
  background-color: transparent;
  font-size: 14px;
  font-weight: 500;
  border-radius: var(--border-radius-1);
  transition: background-color 0.3s ease, color 0.3s ease;
}
.bubbleNotifications {
  background-color: #ff5630; /* rojo brillante */
  color: white;
  width: 2em;
  height: 2em;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.6rem;
  cursor: pointer;
}

.earring-container {
  position: relative;
  /* padding: 10px; */
}

/* .activities-earring {
  margin-top: 5px;
  padding: 5px;
} */

.hover-activity {
  transition: color 0.3s ease;
}

@media (max-width: 768px) {
  .app-navbar-logo {
    display: none;
  }
}
</style>
