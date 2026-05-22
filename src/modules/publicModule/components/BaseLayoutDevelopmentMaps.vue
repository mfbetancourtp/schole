<template>
  <!-- Header -->
  <div class="header-content">
    <!-- Banner -->
    <div class="banner-container">
      <img src="../../../assets/images/image-header-develop-map.png" alt="Image banner" />
    </div>

    <div class="content-title">
      <h2 class="title">
        {{ newTitle ? t(newTitle) : `${user ? user.people.names : ''} ${user ? user.people.lastnames : ''}` }}
      </h2>

      <div class="content-buttons">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>

  <!--  Content  -->
  <div class="content-container">
    <slot name="content"></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

import { AuthenticatedUserService } from '../../../shared/services/authenticatedUser.service';

const authUserService = new AuthenticatedUserService();

export default defineComponent({
  name: 'BaseLayoutDevelopmentMaps',

  props: {
    title: {
      type: String,
      default: '',
    },
  },

  setup(props) {
    const { t } = useI18n();
    const user = authUserService.get();

    const newTitleArray: string[] = [];
    props.title.split(' ').forEach((textSplit: string) => newTitleArray.push(t(textSplit)));

    return {
      newTitle: newTitleArray.join(' '),
      user,
      t,
    };
  },
});
</script>

<style scoped>
.header-content {
  border-bottom: 1px solid #ded;
}

.header-content .banner-container {
  max-height: 3rem;
  overflow: hidden;
}
.header-content .banner-container img {
  width: 100%;
  height: 5rem;
}

.content-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}
.content-title .title {
  font-style: italic;
}

.content-container {
  height: 80%;
  overflow: auto;
  padding: 1.5rem 1.5rem 7rem;
}
.content-container::-webkit-scrollbar {
  width: 0.4rem;
}
.content-container::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 4px;
}
.content-container::-webkit-scrollbar-track {
  background: transparent;
}

/* Small devices (tablets) */
@media screen and (min-width: 576px) and (max-width: 767.98px) {
  /* .header-content {
    background-color: orange;
  } */

  .header-content .banner-container {
    max-height: 6rem;
  }
  .header-content .banner-container img {
    height: 10rem;
  }
}

/* Medium devices (desktops) */
@media screen and (min-width: 768px) and (max-width: 991.98px) {
  /* .header-content {
    background-color: purple;
  } */

  .header-content .banner-container {
    max-height: 7rem;
  }
  .header-content .banner-container img {
    height: 12rem;
  }
}

/* Large devices (large desktops) */
@media screen and (min-width: 992px) and (max-width: 1199.98px) {
  /* .header-content {
    background-color: aqua;
  } */

  .header-content .banner-container {
    max-height: 8rem;
  }
  .header-content .banner-container img {
    height: 14rem;
  }
}

/* Extra large devices (larger desktops) */
@media screen and (min-width: 1200px) {
  /* .header-content {
    background-color: greenyellow;
  } */

  .header-content .banner-container {
    max-height: 10rem;
  }
  .header-content .banner-container img {
    height: 16rem;
  }
}

@media print {
  .header-content,
  .content-container {
    display: none;
  }
}
</style>
