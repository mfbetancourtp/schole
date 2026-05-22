<template>
  <div class="menu-cards">
    <div class="title-menu w-100">
      <div class="pb-1 d-flex align-items-center justify-content-between">
        <AppBadge :variant="'primary'">{{ t('core.generalTerms.academic.subject.singular') }}</AppBadge>

        <AppIcon class="icon-size-8 m-1" style="color: #198754" icon="check-circle"></AppIcon>
      </div>
      {{ titleCard }}
    </div>
    <div class="info-teacher">
      <div class="content-teacher">
        <div v-if="nameTeacherName" class="title-teacher">Profesor</div>
        <div class="name-teacher">
          {{ nameTeacherName }}
          {{ nameTeacherLastName }}
        </div>
      </div>
      <div v-if="nameTeacherName" class="icon-teacher">
        <slot name="icon-teacher"></slot>
      </div>
    </div>
    <div class="buttons-activitys">
      <slot name="buttons-activitys"></slot>
    </div>
    <div class="container-progress w-100">
      <div class="progress-title">{{ titleProgress }}</div>
      <slot name="graph"></slot>
    </div>
    <div class="activity-last w-100">
      <div class="qualification-title">{{ titleQualification }}</div>
      <slot name="qualification"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import ImageNotAvailable from '../../../assets/images/image-not-available.png';
import { defineComponent, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
// import { number } from '@intlify/core-base';
import AppBadge from '../../../shared/components/AppBadge.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';

export default defineComponent({
  name: 'AppCard',
  components: {
    AppBadge,
    AppIcon,
  },
  props: {
    titleCard: {
      type: String,
      default: '',
    },
    titleTeacher: {
      type: String,
      default: '',
    },
    nameTeacherName: {
      type: String,
      default: '',
    },
    nameTeacherLastName: {
      type: String,
      default: '',
    },
    titleProgress: {
      type: String,
      default: '',
    },
    titleQualification: {
      type: String,
      default: '',
    },

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
.menu-cards {
  height: 100%;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  background: #ffffff;
  box-shadow: 1px 2px 6px rgba(0, 0, 0, 0.45);
  border-radius: 16px;
  padding: 23px;
  /* max-width: 320px;
  min-width: 287px; */
}

.title-menu {
  font-size: 22px;
  line-height: 20px;
  letter-spacing: 0.1px;
  padding: 0px 0px 15px 0px;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 600;
  letter-spacing: 0.1px;
  color: var(--color-primary);
}

.info-teacher {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-teacher,
.progress-title,
.qualification-title {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 700;
  font-size: 17px;
  line-height: 20px;
  color: black;
  letter-spacing: 0.1px;
}

.name-teacher {
  font-family: 'Roboto';
  font-style: italic;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.25px;
  color: #3c4248;
}

/* .icon-teacher {

  width: 20%;
} */

.activity-title {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 700;
  font-size: 17px;
  line-height: 20px;
  letter-spacing: 0.1px;
  color: #3c4248;
  margin-bottom: 0;
}

.buttons-activitys {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  width: 100%;
  justify-content: center;
  align-items: center;
  padding: 16px 0px;
}

.container-icon {
  width: 24px;
  height: 24px;
  padding: 0px;
}
</style>
