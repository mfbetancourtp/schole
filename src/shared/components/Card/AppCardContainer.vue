<template>
  <div class="cards-roles">
    <div class="header-card">
      <slot name="header"> </slot>
    </div>
    <div class="body-card">
      <slot name="body"> </slot>
    </div>
    <div class="footer-card">
      <slot name="footer"> </slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import ImageNotAvailable from '../../../assets/images/image-not-available.png';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'AppCard',
  components: {},
  props: {
    image: {},
  },
  setup(props) {
    // const titleCard: any = ref(props.titleCard);
    // const showTitleCard = ref(false);
    const { t } = useI18n();

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
      t,
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
.cards-roles {
  width: 100%;
  display: flex;
  box-shadow: 1px 2px 6px rgba(0, 0, 0, 0.45);
  border-radius: 4px;
  max-width: 287px;
  min-width: 287px;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
}

.header-card {
  font-size: 22px;
  line-height: 20px;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 600;
  letter-spacing: 0.1px;
  color: var(--color-primary);
  padding: 10px;
  width: 100%;
}
.body-card {
  padding: 10px;
}
.footer-card {
  width: 100%;
  padding: 16px;
}
</style>
