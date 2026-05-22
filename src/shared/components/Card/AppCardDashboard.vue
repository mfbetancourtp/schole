<template>
  <div class="appcard-container" :class="{ 'appcard--small': size === 'small' }">
    <div class="container-img" v-if="showImage">
      <img class="o-card-img-top" :src="dataImage" @error="errorImage" />
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
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import ImageNotAvailable from '../../../assets/images/image-not-available.png';

export default defineComponent({
  name: 'AppCardDashboard',
  props: {
    image: {
      type: String,
      default: undefined,
    },
    size: {
      type: String,
      default: 'default', // default | small
    },
  },
  setup(props) {
    const footer: any = ref(null);
    const showFooter = ref(false);

    const title: any = ref(null);
    const showTitle = ref(false);

    const showImage = ref(false);
    const dataImage = ref(props.image);

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
    };
  },
});
</script>

<style scoped>
.appcard-container {
  flex-grow: 1;
  background: #ffffff;
  box-shadow: 0px 12px 24px -4px rgba(145, 158, 171, 0.12), 0px 0px 2px 0px rgba(145, 158, 171, 0.2);
  border-radius: 16px;
  padding: 18px;
  gap: 5px;
  justify-content: center;
}

.o-card-title {
  font-family: 'Roboto';
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: 22px;
  letter-spacing: 0.1px;
  color: var(--text-primary, #212b36);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
}

.o-card-body {
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 10px;
  color: black;
  font-family: 'Roboto';
  font-style: normal;
  letter-spacing: 0.1px;
  word-wrap: break-word;
}

.o-card-footer {
  width: 100%;
}

.o-card-img-top {
  width: 100%;
  object-fit: contain;
  max-height: 250px;
}

/* MODO SMALL */
.appcard--small {
  padding: 12px;
  border-radius: 12px;
}

.appcard--small .o-card-title {
  font-size: 15px;
  line-height: 18px;
}

.appcard--small .o-card-body {
  gap: 6px;
  font-size: 13px;
}

.appcard--small .o-card-img-top {
  max-height: 120px;
}
</style>
