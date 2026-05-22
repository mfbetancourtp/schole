<template>
  <AppFormModal :title="title">
    <template v-slot:content>
      <section class="mb-3">
        <!-- Usuario -->
        <div class="row">
          <div class="col border h5 text-center m-0">
            {{ t('Usuario') }}
          </div>
        </div>

        <div class="row border border-top-0">
          <div class="col-4 ps-3 d-flex align-items-center" style="background-color: #eee">
            {{ t('Nombre') }}
          </div>
          <div class="col d-flex align-items-center">
            {{ loginAudit.user.names }}
          </div>
        </div>

        <div class="row border border-top-0">
          <div class="col-4 ps-3" style="background-color: #eee">ID Usuario</div>
          <div class="col">{{ loginAudit.user.userId }}</div>
        </div>

        <!-- Información de Sesión -->
        <div class="row">
          <div class="col border h5 text-center m-0 mt-3">
            {{ t('Información de Sesión') }}
          </div>
        </div>

        <div class="row border border-top-0">
          <div class="col-4 ps-3" style="background-color: #eee">ID Sesión</div>
          <div class="col">{{ loginAudit.idSesion }}</div>
        </div>

        <div class="row border border-top-0">
          <div class="col-4 ps-3" style="background-color: #eee">Estado</div>
          <div class="col">{{ loginAudit.loginStatus }}</div>
        </div>

        <div class="row border border-top-0">
          <div class="col-4 ps-3" style="background-color: #eee">Fecha y hora de inicio</div>
          <div class="col">
            {{ dayjs.utc(loginAudit.loginAt).tz(dayjs.tz.guess()).format('YYYY-MM-DD HH:mm:ss') }}
          </div>
        </div>

        <div class="row border border-top-0">
          <div class="col-4 ps-3" style="background-color: #eee">Fecha y hora de fin</div>
          <div class="col">
            {{ loginAudit.logoutAt ? dayjs.utc(loginAudit.logoutAt).tz(dayjs.tz.guess()).format('YYYY-MM-DD HH:mm:ss') : '-' }}
          </div>
        </div>

        <div class="row border border-top-0">
          <div class="col-4 ps-3" style="background-color: #eee">Duración de sesión</div>
          <div class="col">
            {{ formatSessionDuration(loginAudit.sessionDuration) }}
          </div>
        </div>

        <div class="row border border-top-0">
          <div class="col-4 ps-3" style="background-color: #eee">Tipo de evento</div>
          <div class="col">{{ loginAudit.eventType }}</div>
        </div>

        <!-- Información de Red -->
        <div class="row">
          <div class="col border h5 text-center m-0 mt-3">
            {{ t('Información de Red') }}
          </div>
        </div>

        <div class="row border border-top-0">
          <div class="col-4 ps-3" style="background-color: #eee">Dirección IP</div>
          <div class="col">{{ loginAudit.ipAddress }}</div>
        </div>

        <div class="row border border-top-0">
          <div class="col-4 ps-3" style="background-color: #eee">User Agent</div>
          <div class="col">{{ loginAudit.userAgent }}</div>
        </div>

        <div class="row border border-top-0">
          <div class="col-4 ps-3" style="background-color: #eee">Referer</div>
          <div class="col">{{ loginAudit.referer || '-' }}</div>
        </div>

        <div class="row border border-top-0">
          <div class="col-4 ps-3" style="background-color: #eee">Host</div>
          <div class="col">{{ loginAudit.host }}</div>
        </div>

        <div class="row border border-top-0">
          <div class="col-4 ps-3" style="background-color: #eee">HTTP Accept</div>
          <div class="col">{{ loginAudit.httpAccept }}</div>
        </div>

        <!-- Dispositivo y Navegador -->
        <div class="row">
          <div class="col border h5 text-center m-0 mt-3">
            {{ t('Dispositivo y Navegador') }}
          </div>
        </div>

        <div class="row border border-top-0">
          <div class="col-4 ps-3" style="background-color: #eee">Tipo de dispositivo</div>
          <div class="col">{{ loginAudit.deviceType }}</div>
        </div>

        <div class="row border border-top-0">
          <div class="col-4 ps-3" style="background-color: #eee">Sistema operativo</div>
          <div class="col">{{ loginAudit.osName }}</div>
        </div>

        <div class="row border border-top-0">
          <div class="col-4 ps-3" style="background-color: #eee">Navegador</div>
          <div class="col">{{ loginAudit.browserName }} {{ loginAudit.browserVersion }}</div>
        </div>

        <div class="row border border-top-0">
          <div class="col-4 ps-3" style="background-color: #eee">Resolución de pantalla</div>
          <div class="col">{{ loginAudit.screenResolution }}</div>
        </div>

        <!-- Ubicación e Idioma -->
        <div class="row">
          <div class="col border h5 text-center m-0 mt-3">
            {{ t('Ubicación e Idioma') }}
          </div>
        </div>

        <div class="row border border-top-0">
          <div class="col-4 ps-3" style="background-color: #eee">País</div>
          <div class="col">{{ loginAudit.country }}</div>
        </div>

        <div class="row border border-top-0">
          <div class="col-4 ps-3" style="background-color: #eee">Ciudad</div>
          <div class="col">{{ loginAudit.city }}</div>
        </div>

        <div class="row border border-top-0">
          <div class="col-4 ps-3" style="background-color: #eee">Zona horaria</div>
          <div class="col">{{ loginAudit.timezone }}</div>
        </div>

        <div class="row border border-top-0">
          <div class="col-4 ps-3" style="background-color: #eee">Idioma</div>
          <div class="col">{{ loginAudit.language }}</div>
        </div>
      </section>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';

dayjs.extend(utc);
dayjs.extend(timezone);

export default defineComponent({
  name: 'LoginAuditDetail',
  components: { AppFormModal },

  props: {
    loginAudit: {
      type: Object as PropType<any>,
      required: true,
    },
  },

  setup(props) {
    const { t } = useI18n();
    const title = `Auditoría de login - ${props.loginAudit.user.names}`;

    const formatSessionDuration = (seconds: number | null): string => {
      if (!seconds || seconds === null) return '-';

      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;

      if (hours > 0) {
        return `${hours}h ${minutes}m ${remainingSeconds}s`;
      } else if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`;
      } else {
        return `${remainingSeconds}s`;
      }
    };

    return {
      title,
      dayjs,
      t,

      formatSessionDuration,
    };
  },
});
</script>
