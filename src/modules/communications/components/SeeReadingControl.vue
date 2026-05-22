<template>
  <AppFormModal :title="title" @closed="emit('close')">
   <template v-slot:content>
     <AppLoading v-if="loading"></AppLoading>

     <template v-else>
       <div class="table-responsive">
         <table v-if="messageReceiver.length" class="table">
           <thead>
             <tr>
               <th>Destinatario</th>
               <th class="col-4">Nombre estudiante</th>
               <th>Grado</th>
               <th class="col-2">Rol</th>
               <th class="col-2">Leído</th>
             </tr>
           </thead>

           <tbody>
             <tr v-for="(item, index) in messageReceiver" :key="index">
               <td>{{ item.receiverName }}</td>
               <td>{{ item.nameStudent }}</td>
               <td>{{ item.nameDegree }}</td>
               <td>{{ item.roles.split(',')[0] }}</td>
               <td>{{ item.openAt ?? 'Sin leer' }}</td>
             </tr>
           </tbody>
         </table>
       </div>
     </template>
   </template>
 </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';

import { MessageReceiverDto } from '../dtos/message.dto';

import { GetMessageReceiversService } from '../services/getMessageReceivers.service';

const getMessageReceiversService = new GetMessageReceiversService();

export default defineComponent({
 name: 'SeeReadingControl',
 components: { AppFormModal, AppLoading },

 emits:['close'],
 props: {
   messageId: {
     type: Number,
     required: true,
   },
 },

 setup(props, {emit}) {
   const { t } = useI18n();
   let title = 'Control de lectura';

   const messageReceiver: Ref<MessageReceiverDto[]> = ref([]);

   const loading = ref(true);

   onMounted(async () => {
   try {
     messageReceiver.value = await getMessageReceiversService.run(props.messageId);
   } catch (e) {
     console.log(e);
   }

   loading.value = false;
 });

   return {
     loading,
     title,
     emit,
     t,

     messageReceiver,
   };
 },
});
</script>

<style scoped></style>
