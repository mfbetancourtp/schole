<template>
  <div class="appcard-container">
    <div
      class="content"
      :style="{
        backgroundColor: color,
      }"
    >
      <div v-if="showImage" class="container-img" :style="{ backgroundImage: `url(${dataImage})` }">
        <div class="filter-image">
          <img class="image" :src="dataImage" alt="Card image" @error="errorImage" />
        </div>
      </div>
      <div class="o-card-title">
        <slot name="title"></slot>
      </div>
      <div class="o-card-body">
        <slot name="body"></slot>
      </div>
      <div class="o-card-footer" ref="footer" v-show="showFooter">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import ImageNotAvailable from '../../../assets/images/image-not-available.png';

export default defineComponent({
  name: 'AppCard',
  props: {
    image: {
      type: String,
      required: false,
    },
    color: {
      type: String,
      required: false,
    },
  },
  setup(props) {
    const footer = ref<HTMLElement | null>(null);
    const showFooter = ref(false);

    const showImage = ref(false);
    const dataImage = ref(props.image);

    onMounted(() => {
      if (footer.value) {
        showFooter.value = !!footer.value.children.length;
      }

      showImage.value = !!props.image;

      if (!dataImage.value && showImage.value) {
        dataImage.value = ImageNotAvailable;
      }
    });

    const errorImage = (e: Event) => {
      (e.target as HTMLImageElement).src = ImageNotAvailable;
    };

    return {
      footer,
      showFooter,
      showImage,
      dataImage,
      errorImage,
    };
  },
});
</script>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  box-shadow: var(--default-shadow-2);
  border-radius: 20px;
  width: 100%;
  gap: 10px;
  justify-content: space-between;
  border: 1px solid #e4e7ec;
  flex-grow: 1; /* Todas las tarjetas ocupan el mismo espacio horizontal */
  min-height: inherit; /* Las tarjetas heredan la altura dinámica de la más grande */
}
.appcard-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: var(--default-shadow-2);
  height: 100%;
  flex-wrap: wrap; /* Permitir que las tarjetas se ajusten si hay varias filas */
  width: 100%;
}
.container-img {
  min-height: 13rem;
  max-height: 13rem;

  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;

  overflow: hidden;

  border-radius: 25px;
  margin: 18px 18px 0 18px;
}
.container-img .filter-image {
  min-height: 13rem;
  max-height: 13rem;

  backdrop-filter: blur(10px);
  background: rgb(0, 0, 0);
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%);

  display: flex;
  align-items: center;
  justify-content: center;
}
.container-img .filter-image .image {
  display: block;
  margin: 0 auto;
}

.o-card-title {
  font-size: 20px;
  line-height: 20px;
  font-family: 'Roboto';
  font-style: normal;
  letter-spacing: 0.1px;
  color: var(--color-primary);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  font-weight: 700;
  line-height: 28px;
  padding: 17px 24px 0px 24px;
}
.o-card-body {
  width: 100%;
  display: flex;
  gap: 10px;
  color: black;
  font-family: 'Roboto';
  font-style: normal;
  letter-spacing: 0.1px;
  word-wrap: break-word;
  flex-direction: column;
  height: 100%;
  padding: 0px 24px 17px 24px;
}
.o-card-footer {
  padding: 0px 24px;
  border-top: 2px solid #e4e7ec;
  background-color: #f5f8fa;
  border-bottom-left-radius: 20px; /* borde inferior izquierdo */
  border-bottom-right-radius: 20px; /* borde inferior derecho */
}

@media (max-width: 768px) {
  .container-img {
    min-height: 10rem;
    max-height: 10rem;
  }
  .container-img .filter-image {
    min-height: 10rem;
    max-height: 10rem;
  }
}
@media (max-width: 500px) {
  .o-card-title {
    padding: 17px 10px 17px 10px;
  }
  .o-card-body {
    padding: 0px 10px 17px 10px;
  }
}
</style>
