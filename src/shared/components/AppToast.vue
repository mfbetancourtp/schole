<script lang="ts">
import { defineComponent, inject } from 'vue';
import ToastStore from '../stores/toast.store';

export default defineComponent<{
  state: any;
}>({
  name: 'AppToast',
  setup() {
    const state = inject('state', ToastStore.state);

    return {
      state,
    };
  },
  watch: {
    state: {
      deep: true,
      handler(value) {
        if (value.message) {
          this.$toast.open({
            message: value.message,
            type: value.type,
            position: 'top-right',
            duration: 5000,
          });
        }
      },
    },
  },
});
</script>

<style scoped></style>
