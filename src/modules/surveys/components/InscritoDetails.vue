<template>
    <AppFormModal :title="title" @closed="emit('close')">
     <template v-slot:content>
       <section v-for="(dat, index) in data" class="mb-3" :key="index">
         <div class="row">
           <div class="col border h5 text-center m-0">
             {{ dat.title }}
           </div>
         </div>
 
         <div v-for="(question, index) in dat.questions" :key="index">
           <div class="row border border-top-0">
             <div class="col-4 ps-3 d-flex align-items-center" style="background-color: #eee">
               <div>
                 {{ question.text }}
               </div>
             </div>
 
             <div class="col">
               <div v-for="(answer, index) in question.answers" :key="index">
                 {{ answer.detailsAnswerOption == 'Otro cual ?' ? answer.detail : answer.detailsAnswerOption ?? answer.detail }}
               </div>
             </div>
           </div>
         </div>
 
         <div v-for="(field, index) in dat.fields" :key="index">
           <div class="row border border-top-0">
             <div class="col-4 ps-3" style="background-color: #eee">
               {{ field.label }}
             </div>
             <div class="col">{{ field.value }}</div>
           </div>
         </div>
       </section>
     </template>
   </AppFormModal>
 </template>
 
 <script lang="ts">
 import { defineComponent, onMounted, ref } from 'vue';
 
 import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
 
 import { GetInscritoDetailsService } from '../services/getInscritoDetails.service';
 
 const getInscritoDetailsService = new GetInscritoDetailsService();
 
 export default defineComponent({
   name: 'InscritoDetails',
   components: { AppFormModal },
 
   props: ['convocationEnrolStepId', 'name','paymentMethod'],
   emits: ['close'],
   setup(props, {emit}) {
     let title = `Formulario "${props.name}"`;
 
     const data = ref();
 
     onMounted(async () => {
       try {
         data.value = await getInscritoDetailsService.run(props.convocationEnrolStepId);
       } catch (e) {
         console.log(e);
       }
     });
 
     return {
       title,
       data,
       emit,
     };
   },
 });
 </script>
 
 <style scoped></style>
 