<template>
  <div v-if="!hasPermission && !hide && !(notSee && !hasPermission)" class="disabled-permission" v-tooltip="'core.notPermissions'">
    <div class="disabled h-100 w-100">
      <slot></slot>
    </div>
  </div>
  <slot v-if="hasPermission && !(notSee && !hasPermission)"></slot>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { PermissionsService } from '../services/permissions.service';

const permissionsService = new PermissionsService();

export default defineComponent({
  name: 'AppCheckPermission',
  props: {
    permission: {
      type: String,
      required: true,
    },
    hide: {
      type: Boolean,
      default: false,
    },
    notSee: {
      // Nueva prop
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const hasPermission = permissionsService.check(props.permission);
    let isAdmin = false;

    const roles: any[] = JSON.parse(localStorage.getItem('roles') ?? '[]');

    roles.forEach((role) => {
      if (role.profile.code === 'admin') {
        isAdmin = true;
      }
    });

    return {
      hasPermission: isAdmin ? true : hasPermission,
    };
  },
});
</script>

<style scoped>
div.disabled {
  pointer-events: none;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
}

.disabled-permission {
  cursor: not-allowed !important;
  opacity: 0.65;
}
</style>
