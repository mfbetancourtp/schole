<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppFormModal :title="title" @closed="emit('close')">
    <template v-slot:content>

      <template v-if="data">
          <div v-for="(details, index) in orderedPayments" :key="index">
            <div class="estado-transaccion" v-if="hasDifferentStateBefore(index)">
              <h4>--- Transacción {{ details.stateGateway }} ---</h4>
            </div>
         
          <table class="table">
            <thead>
              <tr>
                <th style="color: #f43f5e">INFORMACIÓN DEL PAGO</th>
                
              </tr>
              <tr>
                <th class="texto-1">Nombre del comercio:</th>
                <td>{{ data.institution.name }}</td>
              </tr>
              <tr>
                <th class="texto-1">Id de pago:</th>
                <td>{{ details.code }}</td>
              </tr>
              <tr>
                <th class="texto-1">Fecha de pago:</th>
                <td>{{ details.datePayment }}</td>
              </tr>
              <tr>
                <th class="texto-1">Estado:</th>
                <td>{{ details.stateGateway }}</td>
              </tr>
              <tr>
                <th class="texto-1">Valor del pago:</th>
                <td>${{ n(parseFloat(details.paymentValue), 'currency') }}</td>
              </tr>
              <tr>
                <th class="texto-1">Medio de pago:</th>
                <td>{{ details.halfPayment }}</td>
              </tr>
              <tr>
                <th class="texto-1">Concepto del Pago:</th>
                <td>{{ data.details[0].productName }}</td>
              </tr>
              <tr>
                <th style="color: #f43f5e">RESPONSABLE ECONÓMICO</th>
              </tr>
              <tr>
                <th>Nombre Completo:</th>
                <td>{{ details.nameGuardianPeopleStudent }}</td>
              </tr>
              <tr>
                <th>N° de Documento:</th>
                <td>{{ details.identityGuardianPeopleStudent }}</td>
              </tr>
              <tr>
                <th>Correo Electrónico:</th>
                <td>{{ details.emailGuardianPeopleStudent }}</td>
              </tr>
              <tr>
                <th>Dirección:</th>
                <td>{{ details.addressGuardianPeopleStudent }}</td>
              </tr>
              <tr>
                <th>Teléfono:</th>
                <td>{{ details.telephoneNumberGuardianPeopleStudent }}</td>
              </tr>
              <tr>
                <th style="color: #f43f5e">RESPONSABLE DEL PAGO</th>
              </tr>
              <tr v-if="details.halfPayment == 'PSE'">
                <th class="texto-1">N° de Documento:</th>
                <td>{{ details.identityCardOfPays }}</td>
              </tr>
              <tr v-else>
                <th class="texto-1">Nombre Completo:</th>
                <td>{{ details.nameCardOfPays }}</td>
              </tr>
              <tr>
                <th class="texto-1">Correo Electrónico:</th>
                <td>{{ details.emailCardOfPays }}</td>
              </tr>
              <tr>
                <th style="color: #f43f5e">INFORMACIÓN DEL ESTUDIANTE</th>
              </tr>
              <tr>
                <th class="texto-1">Nombre del Estudiante:</th>
                <td>{{ details.nameStudent }}</td>
              </tr>
              <tr>
                <th class="texto-1">N° De Documento:</th>
                <td>{{ details.identityStudent }}</td>
              </tr>
              <tr>
                <th class="texto-1">Grado:</th>
                <td>{{ details.nameDegree }}</td>
              </tr>
            </thead>
          </table>
          
          <template v-if="data && data.quotes && data.quotes.length">
            <h5>Cuotas</h5>
            
            <table class="table">
              <thead>
                <tr>
                  <th class="col-1 text-center pe-0">#Cuota</th>
                  <th class="col-3 text-center ps-0 pe-0">Fecha vencimiento</th>
                  <th>Valor</th>
                  <th>Saldo</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(item, index) in details.quotes" :key="index">
                  <td class="text-center pe-0">{{ item.numberQuote }}</td>
                  <td class="text-center ps-0 pe-0">{{ item.dueDate }}</td>
                  <td>${{ n(item.quoteValue, 'currency') }}</td>
                  <td>${{ n(item.pendingValue, 'currency') }}</td>
                </tr>
              </tbody>
            </table>
          </template>
          <hr v-if="index !== orderedPayments.length - 1" />
         </div>
      </template>     
   </template>
  </AppFormModal>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';

import { GetInscritoDetailsService } from '../services/getInscritoDetails.service';
import { emit } from 'process';

const getInscritoDetailsService = new GetInscritoDetailsService();

export default defineComponent({
  name: 'InscritoDetailsCobro',
  components: { AppFormModal, AppLoading },

  props: ['convocationEnrolStepId', 'name', 'paymentMethod'],

  setup(props, {emit}) {
    const { t, n } = useI18n();
    let title = `Detalle Recibo ${props.name}`;

    const data = ref();
    const loading = ref(true);
    const orderedPayments = ref<any>([]);

    onMounted(async () => {
      try {
        console.log('props',props.paymentMethod)
        data.value = await getInscritoDetailsService.run(props.convocationEnrolStepId,{paymentMethod:props.paymentMethod});
        orderedPayments.value = data.value.payments.sort((a: any, b: any) => {
          const dateA = new Date(a.datePayment).getTime();
          const dateB = new Date(b.datePayment).getTime();
          return dateB - dateA;
        });
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const hasDifferentStateBefore = (index: any) => {
      if (index === 0) {
        return true;
      }
      return orderedPayments.value[index].stateGateway !== orderedPayments.value[index - 1].stateGateway;
    };

    return {
      loading,
      title,
      data,
      t,
      n,
      orderedPayments,
      hasDifferentStateBefore,
      emit,
    };
  },
});
</script>

<style scoped>
.table td {
  text-align: start;
}
.texto-1 {
  text-align: start;
  text-justify: auto;
}
.estado-transaccion {
  text-align: center;
}
</style>
