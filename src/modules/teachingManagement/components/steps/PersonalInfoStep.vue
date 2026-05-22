<template>
  <div>
    <div class="sectionHead">
      <div class="sectionHead__icon">
        <AppIcon icon="user" />
      </div>
      <div>
        <h3 class="sectionHead__title">Información Personal</h3>
        <p class="sectionHead__subtitle">Datos básicos de identificación</p>
      </div>
    </div>

    <!-- FOTO PERFIL -->
    <div class="card">
      <div class="profileCard">
        <div class="profileCard__left">
          <div class="profilePhotoWrap">
            <div class="profilePhoto">
              <template v-if="profileImage">
                <img :src="profileImage" alt="Perfil" />
              </template>
              <template v-else>
                <AppAvatar :name="userView.firstName" size="lg" />
              </template>
            </div>

            <button type="button" class="profilePhotoBtn" @click="handleImageClick" aria-label="Cambiar foto">
              <AppIcon icon="camera" />
            </button>

            <input ref="fileInputRef" type="file" class="d-none" accept="image/*" @change="handleImageChange" />
          </div>
        </div>

        <div class="profileCard__right">
          <h4 class="cardTitle">Fotografía de Perfil</h4>
          <p class="cardText">La foto debe ser reciente, de formato JPG o PNG, con un tamaño máximo de 2MB. Se recomienda usar una foto con fondo claro y de buena calidad.</p>

          <AppButton type="button" class="btnSecondary" @click="handleImageClick"> Cambiar Fotografía </AppButton>
        </div>
      </div>
    </div>

    <!-- DATOS PERSONALES (SOLO LECTURA pero look de formulario) -->
    <div class="card">
      <h4 class="cardTitle mb-3">Datos Personales</h4>

      <div class="formGrid">
        <div class="field">
          <label class="field__label">
            <span class="field__labelIcon"><AppIcon icon="user" /></span>
            Nombres
          </label>
          <div class="field__input field__input--readonly">
            {{ userView.firstName || '-' }}
          </div>
        </div>

        <div class="field">
          <label class="field__label">
            <span class="field__labelIcon"><AppIcon icon="user" /></span>
            Apellidos
          </label>
          <div class="field__input field__input--readonly">
            {{ userView.lastName || '-' }}
          </div>
        </div>

        <div class="field">
          <label class="field__label">
            <span class="field__labelIcon"><AppIcon icon="id-card" /></span>
            Tipo de Documento
          </label>
          <div class="field__input field__input--readonly">
            {{ userView.documentType || '-' }}
          </div>
        </div>

        <div class="field">
          <label class="field__label">
            <span class="field__labelIcon"><AppIcon icon="hashtag" /></span>
            Número de Documento
          </label>
          <div class="field__input field__input--readonly">
            {{ userView.documentNumber || '-' }}
          </div>
        </div>

        <div class="field">
          <label class="field__label">
            <span class="field__labelIcon"><AppIcon icon="envelope" /></span>
            Correo Electrónico
          </label>
          <div class="field__input field__input--readonly" :title="userView.email">
            {{ userView.email || '-' }}
          </div>
        </div>

        <div class="field">
          <label class="field__label">
            <span class="field__labelIcon"><AppIcon icon="phone" /></span>
            Teléfono
          </label>
          <div class="field__input field__input--readonly">
            {{ userView.phone || '-' }}
          </div>
        </div>

        <div class="field">
          <label class="field__label">
            <span class="field__labelIcon"><AppIcon icon="map-marker-alt" /></span>
            Ciudad
          </label>
          <div class="field__input field__input--readonly">
            {{ userView.city || '-' }}
          </div>
        </div>

        <div class="field">
          <label class="field__label">
            <span class="field__labelIcon"><AppIcon icon="globe" /></span>
            País
          </label>
          <div class="field__input field__input--readonly">
            {{ userView.country || '-' }}
          </div>
        </div>
      </div>
    </div>

    <!-- NOTA -->
    <div class="infoBox">
      <h5 class="infoBox__title">Información importante:</h5>
      <ul class="infoBox__list">
        <li>Los campos marcados con <span class="req">*</span> son obligatorios</li>
        <li>Asegúrate de que la información sea correcta y esté actualizada</li>
        <li>El correo institucional es usado para notificaciones oficiales</li>
        <li>Esta información será visible en documentos oficiales del sistema</li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';

import AppButton from '../../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../../shared/components/AppIcon.vue';
import AppAvatar from '../../../../shared/components/AppAvatar.vue';

interface UserView {
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  photoUrl?: string;
}

export default defineComponent({
  name: 'PersonalInfoStep',
  components: {
    AppButton,
    AppIcon,
    AppAvatar,
  },
  setup() {
    const userView = ref<UserView>({
      firstName: '',
      lastName: '',
      documentType: '',
      documentNumber: '',
      email: '',
      phone: '',
      city: '',
      country: '',
      photoUrl: '',
    });

    const fileInputRef = ref<HTMLInputElement | null>(null);

    const readUserFromLocalStorage = () => {
      const raw = localStorage.getItem('user');
      if (!raw) return;

      try {
        const u = JSON.parse(raw);

        // 👇 según tu última estructura: u.people
        const p = u?.people ?? u;

        userView.value = {
          firstName: p?.firstName || p?.names || '',
          lastName: p?.lastnames || [p?.firstLastName, p?.secondLastName].filter(Boolean).join(' ') || '',
          documentType: String(p?.identificationTypeId ?? ''),
          documentNumber: p?.identification || '',
          email: p?.email || '',
          phone: p?.mobile || p?.homePhone || p?.workPhone || '',
          city: String(p?.homeMunicipalityId ?? ''),
          country: p?.nationality || '',
          photoUrl: p?.photoUrl || p?.avatarUrl || p?.photo || '',
        };
      } catch (e) {
        console.warn('No se pudo parsear el user del localStorage', e);
      }
    };

    onMounted(() => {
      readUserFromLocalStorage();
    });

    const profileImage = computed(() => userView.value.photoUrl || '');

    const handleImageClick = () => {
      fileInputRef.value?.click();
    };

    const handleImageChange = (e: Event) => {
      const input = e.target as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;

      const maxBytes = 2 * 1024 * 1024;
      if (file.size > maxBytes) {
        alert('La imagen supera el tamaño máximo permitido (2MB).');
        input.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        userView.value.photoUrl = String(reader.result || '');
      };
      reader.readAsDataURL(file);
    };

    return {
      userView,
      profileImage,
      fileInputRef,
      handleImageClick,
      handleImageChange,
    };
  },
});
</script>

<style scoped>
/* Head sección */
.sectionHead {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 6px 0 18px;
}
.sectionHead__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(var(--color-primary-rgb, 27, 46, 131), 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary, #1b2e83);
}
.sectionHead__title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
}
.sectionHead__subtitle {
  font-size: 14px;
  margin: 2px 0 0;
  color: var(--color-on-surface-variant, #667085);
}

/* Cards */
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 14px;
}
.cardTitle {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 8px 0;
}
.cardText {
  margin: 0 0 14px 0;
  color: #667085;
  font-size: 14px;
}

/* Profile card */
.profileCard {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 18px;
  align-items: center;
}
.profilePhotoWrap {
  position: relative;
  width: 150px;
  height: 150px;
}
.profilePhoto {
  width: 150px;
  height: 150px;
  border-radius: 999px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top left, #1b2e83, #132364);
  border: 6px solid #f3f4f6;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}
.profilePhoto img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.profilePhotoBtn {
  position: absolute;
  right: 6px;
  bottom: 6px;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background: var(--color-primary, #1b2e83);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.18);
}
.btnSecondary {
  padding: 10px 14px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}

/* Form (reutiliza el look anterior) */
.formGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.field__label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #344054;
  margin-bottom: 6px;
}
.field__labelIcon {
  color: #667085;
}
.field__input {
  width: 100%;
  border: 1px solid #d0d5dd;
  border-radius: 12px;
  padding: 12px 14px;
  outline: none;
}
.field__input--readonly {
  background: #f9fafb;
  color: #101828;
  cursor: default;
  user-select: text;
  display: flex;
  align-items: center;
  min-height: 46px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Info box */
.infoBox {
  background: rgba(var(--color-primary-rgb, 27, 46, 131), 0.06);
  border: 1px solid rgba(var(--color-primary-rgb, 27, 46, 131), 0.18);
  border-radius: 16px;
  padding: 16px;
}
.infoBox__title {
  margin: 0 0 10px 0;
  color: var(--color-primary, #1b2e83);
  font-weight: 800;
  font-size: 14px;
}
.infoBox__list {
  margin: 0;
  padding-left: 18px;
  color: #1f3a8a;
  font-size: 13px;
  display: grid;
  gap: 6px;
}
.req {
  color: #ef4444;
}

@media (max-width: 900px) {
  .profileCard {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .profilePhotoWrap {
    margin: 0 auto;
  }
  .formGrid {
    grid-template-columns: 1fr;
  }
}
</style>
