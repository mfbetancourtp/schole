<template>
  <div class="app-base-list">
    <!-- Header -->
    <div class="header-contentainer">
      <AppHeader>
        <template #header-actions>
          <div class="content-buttons">
            <slot name="actions">
              {{ buttons }}
            </slot>
          </div>
        </template>
      </AppHeader>
    </div>

    <!--  Content  -->
    <div class="container-content">
      <!-- Banner -->
      <div class="container-banner" v-if="useBanner">
        <template v-if="useBanner">
          <section :style="loadBanner()">
            <div class="bannerContainer">
              <img :src="urlBanner ?? ImageNotAvailable" style="max-height: 15rem" class="img-fluid mx-auto" alt="banner" />
            </div>
          </section>
        </template>
      </div>

      <div
        class="content-main"
        :style="{
          backgroundColor: isCard ? '#ffff' : 'unset',
          boxShadow: isCard ? '1px 2px 6px rgba(0, 0, 0, 0.45)' : 'unset',
        }"
      >
        <div class="content-title">
          <!-- <div class="title">
            {{ t(title) }}
          </div> -->
          <!-- <div class="content-buttons">
            <slot name="actions"></slot>
          </div> -->
        </div>
        <div class="content" :style="useBanner ? 'overflow: auto;' : ''">
          <slot name="content"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

import ImageNotAvailable from '../../assets/images/image-not-available.png';

import AppHeader from '../layout/AppHeader.vue';

export default defineComponent({
  name: 'AppBaseList',
  components: { AppHeader },

  props: {
    routes: {
      type: Array,
      default: () => {
        return [];
      },
    },
    title: {
      type: String,
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
    },
    useBanner: {
      type: Boolean,
      default: false,
    },
    isCard: {
      type: Boolean,
      default: false,
    },
    urlBanner: {
      type: String,
      default: '',
    },
    buttons: {
      type: String,
      default: '',
    },
  },

  setup(props) {
    const { t } = useI18n();
    const newTitleArray: string[] = [];

    props.title.split(' ').forEach((textSplit: string) => {
      newTitleArray.push(t(textSplit));
    });

    const loadBanner = () => {
      return `
        height: 15rem;
        background-image: url(${props.urlBanner ?? ImageNotAvailable});
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        overflow: hidden;
      `;
    };
    console.log('rutas header', props.routes);

    return {
      newTitle: newTitleArray.join(' '),
      t,
      ImageNotAvailable,
      loadBanner,
    };
  },
});
</script>

<style scoped>
.app-base-list {
  width: 100%;
  max-width: 100%;
  margin: 0px;
  padding: 0px;
  box-sizing: border-box;
  overflow-x: hidden;
}

/* .header-content {
  width: 100%;
  position: fixed;
  z-index: 5;
} */

/* Altura del área debajo del header global */
.container-content {
  width: 100%;
  max-width: 100%;
  height: calc(100vh - 143px);
  z-index: 90;
  margin: 0;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #f0f2f5;
}
/* El card principal debe crecer y permitir que su hijo recorte */
.content-main {
  width: 100%;
  max-width: 100%;
  font-family: 'Roboto';
  border-radius: 4px;
  display: flex; /* ⬅️ nuevo */
  flex-direction: column; /* ⬅️ nuevo */
  flex: 1; /* ⬅️ ocupa el alto disponible */
  min-height: 0; /* ⬅️ CLAVE para que el hijo pueda hacer overflow */
  min-width: 0;
  box-sizing: border-box;
  /* padding: 17px 24px;  si lo necesitas, mantenlo */
}

.title {
  overflow: hidden;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 700;
  font-size: 22px;
  line-height: 28px;
  color: #2e3135;
  border-radius: 4px;
}

/* .content-title {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #9ea1a5;
  padding: 0px 0px 5px 0px;
  margin-bottom: 20px;
  border-radius: 4px;
} */
/* SOLO el contenido scrollea */
.content {
  height: 100%;
  width: 100%;
  padding: 1.5rem;
  /* max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  overflow-x: hidden; */
}

.content-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  max-width: 100%;
  min-width: 0;
}

.container-banner {
  padding: 10px;
  box-sizing: border-box;
  max-width: 100%;
}

@media (max-width: 500px) {
  .content {
    padding: 0.5rem 0.5rem 3rem 0.5rem;
  }
}
</style>
