<template>
  <div class="d-flex flex-column w-100 h-100 justify-content-center align-items-center p-4">
    <h2>Bienvenido</h2>
    <h1>{{ message }}</h1>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { TokenLtiService } from '../../../shared/services/tokenLti.service';
import { TokenService } from '../../../shared/services/token.service';
import { SignOutService } from '../../../shared/services/signOut.service';

export default defineComponent({
  name: 'LoginLTI',
  setup() {
    const route = useRoute();
    const tokenLtiService = new TokenLtiService();
    const tokenService = new TokenService();

    const message = ref();

    onMounted(async () => {
      const token = route.query ? route.query.SGAtoken : null;
      if (token) {
        const logout = new SignOutService();
        logout.run();
        tokenService.set(token.toString());
      }

      const ltik = route.query ? route.query.LTItoken : null;
      if (ltik) tokenLtiService.set(ltik.toString());

      const success = route.query ? route.query.success : null;
      message.value = route.query.msg ? route.query.msg.toString() : '';

      const urlRedirect = route.query ? route.query.redirect : null;
      if (urlRedirect && success === 'true') {
        window.location.href = urlRedirect.toString();
      }
    });

    return {
      message,
    };
  },
});
</script>
