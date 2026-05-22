<template>
  <AppBaseList :title="title" isCard>
    <template #actions>
      <AppButtonBack :to="{ name: 'academicAdministration.courseAdministration' }"></AppButtonBack>

      <AppButton style="color: white" @click="save()">Matricular</AppButton>
    </template>

    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <div class="bg-white pt-2 row">
          <div class="col ps-2 pe-2">
            <p class="h5 fw-lighter">
              Estudiantes {{ grade }} {{ levelName }} -
              {{ academicPeriod.value?.name }}
            </p>

            <table class="table">
              <thead>
                <tr>
                  <th class="check">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="selectAllStudents" @change="toggleSelectAllStudents" />
                    </div>
                  </th>
                  <th>Estudiante</th>
                  <th class="text-center">Asignaturas Perdidas</th>
                  <th class="text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(element, index) in matriculates.value" :key="index">
                  <td>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="element.isPromoted" />
                    </div>
                  </td>
                  <td>{{ element.student }}</td>
                  <td class="text-center">
                    {{ element.numberSubjectsReproved }}
                  </td>

                  <td class="text-center">
                    <template v-if="element.state === null">
                      <span class="badge rounded-pill text-bg-danger bg-dark">Sin definir</span>
                    </template>

                    <template v-if="element.state === 0">
                      <span class="badge rounded-pill text-bg-dark bg-danger">No aprobado</span>
                    </template>

                    <template v-if="element.state === 1">
                      <span class="badge rounded-pill text-bg-primary bg-success">Promovido</span>
                    </template>
                    <template v-if="element.state === 2">
                      <span class="badge rounded-pill text-bg-primary bg-info">Matriculado</span>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="col ps-2 pe-2">
            <p class="h5 fw-lighter text-capitalize">Promover estudiantes seleccionados al grupo</p>

            <div class="row">
              <div class="col">
                <AppFormField :form-control="v$.form.academicPeriodId">
                  <v-select
                    :reduce="(academicPeriod: any) => academicPeriod.id"
                    v-model="v$.form.academicPeriodId.$model"
                    @option:selected="getAcademicGroups()"
                    :options="academicPeriods.value"
                    input-id="academicPeriod"
                    label="name"
                  ></v-select>
                </AppFormField>
              </div>
              <div class="col">
                <AppFormField :form-control="v$.form.changeAPGId">
                  <v-select
                    v-bind:class="{ disabledSelect: loadingGroups }"
                    v-model="v$.form.changeAPGId.$model"
                    :options="academicGroups.value"
                    :reduce="(group: any) => group.id"
                    input-id="group"
                    label="name"
                  ></v-select>
                </AppFormField>
              </div>
            </div>

            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="copyTutors" v-model="v$.form.copyTutors.$model" />
              <label class="form-check-label" for="copyTutors"> Copiar en la nueva matricula los mismos tutores. </label>
            </div>
          </div>
        </div>
      </template>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { useMeta } from 'vue-meta';
import { useRoute } from 'vue-router';
import { defineComponent, onMounted, reactive, ref } from 'vue';

import { useVuelidate } from '@vuelidate/core';
import { required } from '../../../shared/plugins/vuelidate.plugin';

import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

import { AcademicPeriodDto } from '../dto/academicPeriod.dto';
import { MatriculateGPDto } from '../dto/matriculateGroupPromotion.dto';
import { AcademicPeriodGroupGPDto } from '../dto/academicPeriodGroupGroupPromotion.dto';

import { PostGroupPromotionService } from '../services/postGroupPromotion.service';
import { GetGroupPromotionRelatedDataService } from '../services/getGroupPromotionRelatedData.service';
import { GetAcademicGroupsByAcademicPeriodIdService } from '../services/getAcademicGroupsByAcademicPeriodId.service';

const getAcademicGroupsByAcademicPeriodIdService = new GetAcademicGroupsByAcademicPeriodIdService();
const getGroupPromotionRelatedDataService = new GetGroupPromotionRelatedDataService();
const postGroupPromotionService = new PostGroupPromotionService();

export default defineComponent({
  name: 'GroupPromotions',
  components: {
    AppButton,
    AppButtonBack,
    AppFormField,
    AppBaseList,
    AppLoading,
  },

  setup() {
    const title = 'Promoción Del Grupo';
    useMeta({ title: title });
    const routes = [
      {
        name: 'Administración de Cursos',
        url: {
          name: 'academicAdministration.courseAdministration',
        },
      },
      {
        name: title,
      },
    ];

    const currentAcademicPeriodGroupId = ref();
    const academicPeriodGroupId = ref();
    const loadingGroups = ref(true);
    const loading = ref(true);
    const route = useRoute();
    const lastPeriod = ref();
    const levelName = ref();
    const grade = ref();
    const selectAllStudents = ref(false);
    const selectAllEnabled = ref(true);

    const academicGroups: { value: AcademicPeriodGroupGPDto[] } = reactive({
      value: [],
    });
    const academicPeriod: { value: AcademicPeriodDto | null } = reactive({
      value: null,
    });
    const academicPeriods: { value: AcademicPeriodDto[] } = reactive({
      value: [],
    });
    const matriculates: { value: MatriculateGPDto[] } = reactive({
      value: [],
    });

    const form = reactive({
      academicPeriodId: null,
      changeAPGId: null,
      copyTutors: false,
    });
    const v$ = useVuelidate(
      {
        form: {
          academicPeriodId: { required },
          changeAPGId: { required },
          copyTutors: {},
        },
      },
      { form }
    );
    onMounted(async () => {
      try {
        academicPeriodGroupId.value = parseInt(route.params.academicPeriodGroupId.toString(), 10);

        let response = await getGroupPromotionRelatedDataService.run(academicPeriodGroupId.value);
        academicPeriod.value = response.academicPeriodGroup.academicPeriod;
        levelName.value = response.academicPeriodGroup.degree.level.name;
        grade.value = response.academicPeriodGroup.degree.name;
        academicPeriods.value = response.academicPeriods;
        matriculates.value = response.matriculates;

        lastPeriod.value = academicPeriods.value[0].id;
        form.academicPeriodId = lastPeriod.value;

        await getAcademicGroups();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    const getAcademicGroups = async () => {
      loadingGroups.value = true;
      let academicPeriodId = form.academicPeriodId;

      academicGroups.value = await getAcademicGroupsByAcademicPeriodIdService.run(academicPeriodId);
      academicGroups.value.forEach((group) => {
        group.name = `${group.degreeName} ${group.GroupName}`;
      });

      currentAcademicPeriodGroupId.value = academicGroups.value[0].id;
      form.changeAPGId = currentAcademicPeriodGroupId.value;

      loadingGroups.value = false;
    };

    const save = async () => {
      const formIsValid = await v$.value.$validate();
      if (!formIsValid) return;

      const notApprovedStudents = matriculates.value.filter((student) => (student.state === 0 && student.isPromoted) || (student.state === 2 && student.isPromoted));

      if (notApprovedStudents.length > 0) {
        window.alert('Verifique que todos los estudiantes seleccionados hayan sido promovidos o que no esten matriculados');
      } else {
        let auxData: any[] = [];
        matriculates.value.forEach((student) => {
          auxData.push({
            id: student['id'],
            studentId: student['studentId'],
            studentCategoryId: student['studentCategoryId'],
            isPromoted: student['isPromoted'],
          });
        });

        let dataForm = {
          academicPeriodGroupId: form.changeAPGId,
          copyTutors: form.copyTutors,
          matriculates: auxData,
        };

        try {
          await postGroupPromotionService.run(dataForm);
          let response = await getGroupPromotionRelatedDataService.run(academicPeriodGroupId.value);
          academicPeriod.value = response.academicPeriodGroup.academicPeriod;
          levelName.value = response.academicPeriodGroup.degree.level.name;
          grade.value = response.academicPeriodGroup.degree.name;
          academicPeriods.value = response.academicPeriods;
          matriculates.value = response.matriculates;
        } catch (e) {
          console.log(e);
        }
      }
    };

    const toggleSelectAllStudents = () => {
      if (selectAllEnabled.value) {
        matriculates.value.forEach((student) => {
          student.isPromoted = selectAllStudents.value;
        });
      }
    };

    return {
      loading,
      routes,
      title,
      v$,

      academicPeriods,
      academicGroups,
      academicPeriod,
      loadingGroups,
      matriculates,
      levelName,
      grade,
      selectAllStudents,
      toggleSelectAllStudents,

      getAcademicGroups,
      save,
    };
  },
});
</script>
<style scoped>
.disabledSelect {
  pointer-events: none;
  color: #bfcbd9;
  cursor: not-allowed;
  background-image: none;
  background-color: #eef1f6 !important;
  border-color: #d1dbe5;
}
</style>
