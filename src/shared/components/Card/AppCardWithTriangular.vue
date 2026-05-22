<template>
  <div class="appcard-container">
    <!-- ▸ Figura triangular ------------------------------------------------>
    <div class="card-ribbon" :class="{ 'has-image': showImage }">
      <!-- Imagen recortada en la figura -->
      <img v-if="showImage" class="ribbon-img" :src="dataImage" @error="errorImage" />
      <!-- Icono si existe prop `icon` y NO hay imagen -->
      <AppGetIcon v-else-if="icon" :name="icon" :stroke-color="'#5B5F62'" :fillColor="'#5B5F62'" class="ribbon-icon" />
    </div>

    <!-- ▸ Imagen grande opcional (tu estructura original) ----------------->
    <div v-if="showImage" class="container-img">
      <img class="o-card-img-top" :src="dataImage" @error="errorImage" />
    </div>

    <!-- ▸ Título -->
    <div class="o-card-title">
      <slot name="title"></slot>
    </div>

    <!-- ▸ Cuerpo -->
    <div class="o-card-body">
      <slot name="body"></slot>
    </div>

    <!-- ▸ Footer opcional -->
    <div class="o-card-footer" ref="footer" v-show="showFooter">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import ImageNotAvailable from '../../../assets/images/image-not-available.png';
import AppGetIcon from '../AppGetIcon.vue'; // ajusta la ruta si cambia

export default defineComponent({
  name: 'AppCardWithTriangular',
  components: { AppGetIcon },
  props: {
    image: String,
    icon: String, // ← NUEVO: nombre del icono para AppGetIcon
  },
  setup(props) {
    const footer = ref<HTMLElement | null>(null);
    const showFooter = ref(false);

    const title = ref<HTMLElement | null>(null);
    const showTitle = ref(false);

    const showImage = ref(false);
    const dataImage = ref(props.image);

    onMounted(() => {
      if (footer.value) showFooter.value = !!footer.value.children.length;
      if (title.value) showTitle.value = !!title.value.children.length;

      showImage.value = props.image !== undefined;
      if (!dataImage.value && showImage.value) dataImage.value = ImageNotAvailable;
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
    };
  },
});
</script>

<style scoped>
/* contenedor principal -------------------------------------------------- */
.appcard-container {
  position: relative;
  flex-grow: 1;
  background: #fff;
  box-shadow: 0 12px 24px -4px rgba(145, 158, 171, 0.12), 0 0 2px rgba(145, 158, 171, 0.2);
  border-radius: 16px;
  padding: 24px 70px 24px 24px;
  gap: 5px;
  overflow: hidden; /* recorta la figura */
}

/* figura triangular ----------------------------------------------------- */
.card-ribbon {
  --apex-x: 24%;
  --border: 3px;
  --fill: var(--color-primary);
  --stroke: var(--color-primary);

  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;

  --clip: polygon(100% 0, 100% 100%, calc(100% - var(--apex-x)) 50%);
  clip-path: var(--clip);
}
.card-ribbon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--fill);
  clip-path: var(--clip);
  border: var(--border) solid var(--stroke);
  border-top-right-radius: 16px;
  border-bottom-right-radius: 16px;
}

/* icono centrado -------------------------------------------------------- */
.ribbon-icon {
  position: absolute;
  top: 50%;
  right: calc(var(--apex-x) / 17);
  transform: translate(-10%, -50%);
  font-size: 56px; /* si AppGetIcon usa tamaño de fuente */
  pointer-events: none;
}

/* imagen recortada en la figura ---------------------------------------- */
.ribbon-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  clip-path: var(--clip);
  border-top-right-radius: 16px;
  border-bottom-right-radius: 16px;
}
.card-ribbon.has-image::before {
  background: transparent;
}

/* tipografías originales ------------------------------------------------ */
.o-card-title {
  font: 600 20px/28px 'Roboto', sans-serif;
  color: #212b36;
}
.o-card-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: #000;
  font-family: 'Roboto';
}

/* img grande opcional --------------------------------------------------- */
.o-card-img-top {
  width: 100%;
  max-height: 250px;
  object-fit: contain;
}
</style>
