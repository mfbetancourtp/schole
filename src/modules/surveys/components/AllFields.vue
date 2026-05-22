<template>
    <AppFormModal :title="title" @closed="emit('close')">
       <template #content>
           <p>Lista de variables y su código equivalente.</p>

           <div class="row" style="background-color: #eee;">
               <div class="col h6 m-0 border">Descripción</div>
               <div class="col h6 text-center m-0 border border-start-0">Campo</div>
           </div>

           <template v-for="allField, index in allFields" :key="index">
               <div class="row">
                   <div class="col h6 text-center m-0 p-1 border border-top-0">{{ allField.title }}</div>
               </div>

               <div class="row border border-top-0" v-for="field, index in allField.fields" :key="index">
                   <div class="col" style="background-color: #eee;">{{ field.label }}</div>
                   <div class="col text-center">{{ field.keyField }}</div>
               </div>
           </template>
       </template>
   </AppFormModal>
</template>
 
<script lang="ts">
import {defineComponent, reactive} from 'vue';
import {useI18n} from 'vue-i18n';

import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';

export default defineComponent({
   name: 'AllFields',
   components: {AppFormModal},

   props: ['allFields'],
   emits: ['close'],

   setup(props, {emit}) {
       const title = 'Lista de variables';
       const {t} = useI18n();

       return {
           title,
           emit,
           t,
       };
   },
});
</script>

<style scoped>

</style>