<template>
  <AppLoading v-if="loading"></AppLoading>
  <AppBaseList :title="title" :routes="routes" v-else>
    <template v-slot:content>
      <div class="ProgramsCreate">
        <div class="ProgramsCreate__content">
          <div class="form-row">
            <AppFormField :form-control="{ quantity }" label="Cantidad">
              <label>Cantidad</label>
              <input type="number" class="form-control" v-model="quantity" id="title" />
            </AppFormField>
          </div>
          <div class="form-row">
            <table class="table table-hover table-responsive">
              <thead>
                <tr>
                  <th></th>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th v-if="relatedData?.useCredits === 1">Min Créditos</th>
                  <th v-if="relatedData?.useCredits === 1">Max Créditos</th>
                  <th>Opciones</th>
                </tr>
              </thead>
              <draggable v-model="degrees" tag="tbody" item-key="id" @change="changeOrderVisit">
                <template v-slot:item="{ element }">
                  <tr class="tw-cursor-pointer" :key="element.id">
                    <td>
                      <AppIcon icon="arrows-alt" class="me-2"></AppIcon>
                    </td>
                    <td>
                      <AppFormField>
                        <input type="text" class="form-control" v-model="element.abbreviation" />
                      </AppFormField>
                    </td>
                    <td>
                      <AppFormField>
                        <input type="text" class="form-control" v-model="element.name" />
                      </AppFormField>
                    </td>
                    <td v-if="relatedData?.useCredits === 1">
                      <AppFormField>
                        <input type="text" class="form-control" v-model="element.maxCredits" />
                      </AppFormField>
                    </td>
                    <td v-if="relatedData?.useCredits === 1">
                      <AppFormField>
                        <input type="text" class="form-control" v-model="element.minCredits" />
                      </AppFormField>
                    </td>
                    <td>
                      <AppFormField>
                        <div class="d-flex gap-1">
                          <AppButtonDelete @click="confirmDelete(element)"> </AppButtonDelete>
                        </div>
                      </AppFormField>
                    </td>
                  </tr>
                </template>
              </draggable>
            </table>
            <AppModal v-model="modalDelete">
              <AppConfirmDeleteModal v-if="modalDelete" entity="Visita" @confirmDelete="deleteDegree"> </AppConfirmDeleteModal>
            </AppModal>
          </div>
        </div>
      </div>
    </template>
    <template v-slot:actions>
      <div class="ProgramsCreate__actions">
        <AppButtonBack :to="{ name: 'academicPrograms.programView' }"></AppButtonBack>
        <AppButton :nativeType="'submit'" :label="'core.save'" @click="save('Close')">Guardar y salir</AppButton>
        <AppButton :nativeType="'submit'" :label="'core.save'" @click="save('Continue')">Continuar</AppButton>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { defineComponent, onMounted, ref, watch } from 'vue';

import AppBaseList from '../../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../../shared/components/AppLoading.vue';
import AppModal from '../../../../shared/components/Modal/AppModal.vue';
import AppFormField from '../../../../shared/components/Forms/AppFormField.vue';
import AppButtonDelete from '../../../../shared/components/Buttons/AppButtonDelete.vue';
import AppButtonBack from '../../../../shared/components/Buttons/AppButtonBack.vue';
import AppIcon from '../../../../shared/components/AppIcon.vue';
import AppButton from '../../../../shared/components/Buttons/AppButton.vue';
import AppConfirmDeleteModal from '../../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import draggable from 'vuedraggable';

import { RelatedDataDto } from '../../dtos/programs/relatedData.dto';
import { DegreeDto } from '../../dtos/programs/degree.dto';

import { UpdateOrderDegreeService } from '../../services/programs/updateOrderDegree.service';
import { GetRelatedDataDegreesService } from '../../services/programs/getRelatedDataDegrees.service';

import { CreateDegreesService } from '../../services/programs/createDegrees.service';
import { GetDegreesByLevelService } from '../../services/programs/getDegreesByLevel.service';

const updateOrderDegreeService = new UpdateOrderDegreeService();
const getRelatedDataDegreesService = new GetRelatedDataDegreesService();

const createDegreesService = new CreateDegreesService();
const getDegreesByLevelService = new GetDegreesByLevelService();

export default defineComponent({
  name: 'DegreesForm',
  components: {
    AppBaseList,
    AppLoading,
    AppButtonBack,
    AppModal,
    AppFormField,
    AppButtonDelete,
    draggable,
    AppIcon,
    AppButton,
    AppConfirmDeleteModal,
  },
  props: ['routes', 'data'],

  setup() {
    const loading = ref(true);
    const title = 'Programas';
    //const routes = [{ name: title }];
    // const routes = props.routes;
    // const data = props.data;

    const quantity = ref(0);
    const degrees = ref<DegreeDto[]>([]);

    const router = useRouter();
    const route = useRoute();
    const currentLevel = ref();
    const relatedData = ref<RelatedDataDto | any>();

    const currentDegree = ref();
    const modalDelete = ref(false);
    const loadingAddDegrees = ref(false);
    const degreesByLevel = ref<DegreeDto[]>([]);

    onMounted(async () => {
      try {
        currentLevel.value = parseInt(route.params.levelId.toString());
        relatedData.value = await getRelatedDataDegreesService.run(currentLevel.value);
        degreesByLevel.value = await getDegreesByLevelService.run(currentLevel.value);
        console.log('degrees by level: ', degreesByLevel.value);
        console.log('Related data: ', relatedData.value);
        console.log('Current Level: ', currentLevel.value);
      } catch (e) {
        console.log(e);
      }
      loading.value = false;
    });

    watch(
      () => quantity.value,
      (valor) => {
        console.log('Valor', valor);
        if (valor) {
          degrees.value = [];
          let maxDegrees = valor ? valor : 0;

          for (let i = 0; i < maxDegrees; i++) {
            let dataDegrees: DegreeDto = {
              id: i,
              name: '',
              abbreviation: '',
              maxCredits: 0,
              minCredits: 0,
              order: i + 1,
            };
            degrees.value.push(dataDegrees);
            console.log('Degrees', degrees);
          }
        }
      }
    );
    const save = async (action: string) => {
      try {
        await createDegreesService.run(degrees.value, currentLevel.value);

        if (action === 'Close') {
          await router.push({
            name: 'academicPrograms.programView',
          });
        }

        if (action === 'Continue') {
          await router.push({
            name: 'academicPrograms.programCreate2',
            params: {
              levelId: currentLevel.value,
            },
          });
        }
      } catch (e) {
        console.log('This error send data', e);
      }
    };
    const changeOrderVisit = async () => {
      try {
        let newData = degrees.value.map((degree: DegreeDto, key) => ({
          ...degree,
          order: key + 1,
        }));
        await updateOrderDegreeService.run(currentLevel.value, (degrees.value = newData));
        console.log('Arrastrar y soltar', degrees.value);
      } catch (e) {
        console.log('this error changeOrderDegrees', e);
      }
    };

    const confirmDelete = async (deg: DegreeDto) => {
      currentDegree.value = deg;
      modalDelete.value = true;
    };

    const deleteDegree = async () => {
      loadingAddDegrees.value = true;
      degrees.value = degrees.value.filter((item) => item.id !== currentDegree.value?.id);
      modalDelete.value = false;
    };

    return {
      loading,
      degrees,
      title,
      quantity,
      relatedData,
      modalDelete,
      degreesByLevel,

      changeOrderVisit,
      confirmDelete,
      deleteDegree,
      save,
    };
  },
});
</script>

<style scoped>
.ProgramsCreate {
  display: flex;
  gap: 1rem;
}

.ProgramsCreate__content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.ProgramsCreate__actions {
  display: flex;
  justify-content: flex-end;
}
</style>
