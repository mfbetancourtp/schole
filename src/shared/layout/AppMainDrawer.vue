<template>
  <div class="drawer drawer-mobile h-full">
    <input id="main-drawer" type="checkbox" class="drawer-toggle" v-model="showMenu">
    <main class="drawer-content">
      <slot></slot>
    </main>
    <div class="drawer-side">
      <label for="main-drawer" class="drawer-overlay"></label>

      <aside class="flex flex-col border-r border-base-300 bg-base-200 text-base-content w-80">
        <div class="w-full border-b border-base-300">
          <div class="mx-auto space-x-1 navbar max-w-none">
            <div class="flex items-center flex-none">
              <a href="/"
                 class="px-2 flex-0 btn btn-ghost md:px-4"
                 aria-label="Homepage">
                <div class="text-3xl text-primary capitalize">
                  Academia
                </div>
              </a>
            </div>
          </div>
        </div>

        <div>
          <ul class="menu flex flex-col p-4 pt-2 compact">
            <li class="mt-4 menu-title"><span>
                Docs
              </span>
            </li>
            <li>
              <a href="/docs/install" class="capitalize">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     class="inline-block w-6 h-6 mr-2 stroke-current"><!----> <!----> <!----> <!----> <!----> <!---->
                  <!----> <!----> <!----> <!----> <!----> <!----> <!----> <!----> <!----> <!----> <!----> <!---->
                  <!---->
                  <!----> <!----> <!---->
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20"></path>
                  <!----> <!----> <!----> <!----></svg>
                install
              </a>
            </li>

          </ul>
        </div>
      </aside>

    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, defineProps,  watch} from 'vue';

const showMenu = ref(true);

const props = defineProps<{
  changeStateMenu: any
}>();

watch(() => props.changeStateMenu, () => {
  showMenu.value = !showMenu.value;
});

</script>

<style scoped>

</style>