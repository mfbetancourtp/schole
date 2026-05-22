<template>
  <AppLoading v-if="loading"></AppLoading>

  <AppBaseList v-else :title="title" isCard>
    <template v-slot:content>
      <section class="form-row">
        <AppFormField>
          <label for="organizationalUnitId">Selecciona la unidad organizacional para configurar los cursos de cada cargo</label>

          <AppAutocomplete :input-id="'organizationalUnitId'" :options="organizationalUnits" v-model="organizationalUnitId" :clearable="false" class="bg-white"></AppAutocomplete>
        </AppFormField>

        <AppFormField class="col-4">
          <label for="levelId">Selecciona el plan carrera a usar</label>

          <AppAutocomplete :options="careerPlans" :input-id="'levelId'" :clearable="false" v-model="levelId" class="bg-white"></AppAutocomplete>
        </AppFormField>
      </section>

      <div>
        <AppLoading v-if="loadingCurriculumJobsSubjects"></AppLoading>

        <template v-if="!loadingCurriculumJobsSubjects && curriculumJobsSubjects">
          <AppEmptyResponse v-if="!curriculumJobsSubjects.degrees.length" :show-image="true" :subtitle="false"> </AppEmptyResponse>

          <div v-else class="table-container">
            <table class="custom-table">
              <thead>
                <tr>
                  <th style="min-width: 200px" class="sticky">Cluster / Curso</th>

                  <template v-for="(organizationalJob, index) in curriculumJobsSubjects.organizationalJobs" :key="index">
                    <th>
                      <div class="d-flex justify-content-center">
                        <AppIcon v-if="!organizationalJob.showCode" @click="organizationalJob.showCode = true" class="text-primary pointer" icon="minus"></AppIcon>
                        <AppIcon v-else @click="organizationalJob.showCode = false" class="text-primary pointer" icon="plus"></AppIcon>
                      </div>
                      <div class="d-flex justify-content-center text-center">
                        <span>{{ organizationalJob.showCode ? organizationalJob.code : organizationalJob.name }}</span>
                      </div>
                    </th>
                  </template>
                </tr>
              </thead>

              <tbody>
                <template v-for="(degree, index) in curriculumJobsSubjects.degrees" :key="index">
                  <tr>
                    <td class="sticky"></td>
                    <th :colspan="curriculumJobsSubjects.organizationalJobs.length" class="text-center">
                      {{ degree.name }}
                    </th>
                  </tr>

                  <tr v-if="!degree.subjects.length">
                    <td class="sticky"></td>
                    <td :colspan="curriculumJobsSubjects.organizationalJobs.length + 1" class="text-center">Todavía no hay registros disponibles aquí</td>
                  </tr>

                  <tr v-else v-for="(subject, index) in degree.subjects" :key="index">
                    <td class="sticky">{{ subject.name }}</td>

                    <template v-for="(organizationalJob, index) in curriculumJobsSubjects.organizationalJobs" :key="index">
                      <td class="text-center">
                        <AppIcon
                          v-if="selectIcon(organizationalJob.id, subject.curriculumSubjectId) == 0"
                          @click="updateCheck(organizationalJob.id, subject.curriculumSubjectId)"
                          class="text-primary pointer"
                          v-tooltip="'Curso obligatorio'"
                          icon="check-square"
                        ></AppIcon>
                        <AppIcon
                          v-if="selectIcon(organizationalJob.id, subject.curriculumSubjectId) == 1"
                          @click="updateCheck(organizationalJob.id, subject.curriculumSubjectId)"
                          class="text-primary pointer"
                          v-tooltip="'Curso opcional'"
                          icon="minus-square"
                        ></AppIcon>
                        <AppIcon
                          v-if="selectIcon(organizationalJob.id, subject.curriculumSubjectId) == null"
                          @click="updateCheck(organizationalJob.id, subject.curriculumSubjectId)"
                          class="text-white border border-primary border-3 pointer"
                          v-tooltip="'Curso no aplica'"
                          icon="square"
                        ></AppIcon>
                      </td>
                    </template>
                  </tr>
                </template>
                <!-- delete div -->
                <!-- <template v-for="(degree, index) in curriculumJobsSubjects.degrees" :key="index">
                    <tr>
                      <td class="sticky"></td>
                      <th :colspan="curriculumJobsSubjects.organizationalJobs.length" class="text-center">
                        {{ degree.name }}
                      </th>
                    </tr>

                    <tr v-if="!degree.subjects.length">
                      <td class="sticky"></td>
                      <td :colspan="curriculumJobsSubjects.organizationalJobs.length + 1" class="text-center">Todavía no hay registros disponibles aquí</td>
                    </tr>
                    
                    <tr v-else v-for="(subject, index) in degree.subjects" :key="index">
                      <td class="sticky">{{ subject.name }}</td>

                      <template v-for="(organizationalJob, index) in curriculumJobsSubjects.organizationalJobs" :key="index">
                        <td class="text-center">
                          <AppIcon
                            v-if="selectIcon(organizationalJob.id, subject.curriculumSubjectId) == 0"
                            @click="updateCheck(organizationalJob.id, subject.curriculumSubjectId)"
                            class="text-primary pointer"
                            v-tooltip="'Curso obligatorio'"
                            icon="check-square"
                          ></AppIcon>
                          <AppIcon
                            v-if="selectIcon(organizationalJob.id, subject.curriculumSubjectId) == 1"
                            @click="updateCheck(organizationalJob.id, subject.curriculumSubjectId)"
                            class="text-primary pointer"
                            v-tooltip="'Curso opcional'"
                            icon="minus-square"
                          ></AppIcon>
                          <AppIcon
                            v-if="selectIcon(organizationalJob.id, subject.curriculumSubjectId) == null"
                            @click="updateCheck(organizationalJob.id, subject.curriculumSubjectId)"
                            class="text-white border border-primary border-3 pointer"
                            v-tooltip="'Curso no aplica'"
                            icon="square"
                          ></AppIcon>
                        </td>
                      </template>
                    </tr>

                    <template v-if="degree.subjects.length">
                      <tr v-for="(subject, index) in degree.subjects" :key="index">
                        <td class="sticky">{{ subject.name }}</td>

                        <template v-for="(organizationalJob, index) in curriculumJobsSubjects.organizationalJobs" :key="index">
                          <td class="text-center">
                            <AppIcon
                              v-if="selectIcon(organizationalJob.id, subject.curriculumSubjectId) == 0"
                              @click="updateCheck(organizationalJob.id, subject.curriculumSubjectId)"
                              class="text-primary pointer"
                              v-tooltip="'Curso obligatorio'"
                              icon="check-square"
                            ></AppIcon>
                            <AppIcon
                              v-if="selectIcon(organizationalJob.id, subject.curriculumSubjectId) == 1"
                              @click="updateCheck(organizationalJob.id, subject.curriculumSubjectId)"
                              class="text-primary pointer"
                              v-tooltip="'Curso opcional'"
                              icon="minus-square"
                            ></AppIcon>
                            <AppIcon
                              v-if="selectIcon(organizationalJob.id, subject.curriculumSubjectId) == null"
                              @click="updateCheck(organizationalJob.id, subject.curriculumSubjectId)"
                              class="text-white border border-primary border-3 pointer"
                              v-tooltip="'Curso no aplica'"
                              icon="square"
                            ></AppIcon>
                          </td>
                        </template>
                      </tr>
                      <tr v-for="(subject, index) in degree.subjects" :key="index">
                        <td class="sticky">{{ subject.name }}</td>

                        <template v-for="(organizationalJob, index) in curriculumJobsSubjects.organizationalJobs" :key="index">
                          <td class="text-center">
                            <AppIcon
                              v-if="selectIcon(organizationalJob.id, subject.curriculumSubjectId) == 0"
                              @click="updateCheck(organizationalJob.id, subject.curriculumSubjectId)"
                              class="text-primary pointer"
                              v-tooltip="'Curso obligatorio'"
                              icon="check-square"
                            ></AppIcon>
                            <AppIcon
                              v-if="selectIcon(organizationalJob.id, subject.curriculumSubjectId) == 1"
                              @click="updateCheck(organizationalJob.id, subject.curriculumSubjectId)"
                              class="text-primary pointer"
                              v-tooltip="'Curso opcional'"
                              icon="minus-square"
                            ></AppIcon>
                            <AppIcon
                              v-if="selectIcon(organizationalJob.id, subject.curriculumSubjectId) == null"
                              @click="updateCheck(organizationalJob.id, subject.curriculumSubjectId)"
                              class="text-white border border-primary border-3 pointer"
                              v-tooltip="'Curso no aplica'"
                              icon="square"
                            ></AppIcon>
                          </td>
                        </template>
                      </tr>
                      <tr v-for="(subject, index) in degree.subjects" :key="index">
                        <td class="sticky">{{ subject.name }}</td>

                        <template v-for="(organizationalJob, index) in curriculumJobsSubjects.organizationalJobs" :key="index">
                          <td class="text-center">
                            <AppIcon
                              v-if="selectIcon(organizationalJob.id, subject.curriculumSubjectId) == 0"
                              @click="updateCheck(organizationalJob.id, subject.curriculumSubjectId)"
                              class="text-primary pointer"
                              v-tooltip="'Curso obligatorio'"
                              icon="check-square"
                            ></AppIcon>
                            <AppIcon
                              v-if="selectIcon(organizationalJob.id, subject.curriculumSubjectId) == 1"
                              @click="updateCheck(organizationalJob.id, subject.curriculumSubjectId)"
                              class="text-primary pointer"
                              v-tooltip="'Curso opcional'"
                              icon="minus-square"
                            ></AppIcon>
                            <AppIcon
                              v-if="selectIcon(organizationalJob.id, subject.curriculumSubjectId) == null"
                              @click="updateCheck(organizationalJob.id, subject.curriculumSubjectId)"
                              class="text-white border border-primary border-3 pointer"
                              v-tooltip="'Curso no aplica'"
                              icon="square"
                            ></AppIcon>
                          </td>
                        </template>
                      </tr>
                      <tr v-for="(subject, index) in degree.subjects" :key="index">
                        <td class="sticky">{{ subject.name }}</td>

                        <template v-for="(organizationalJob, index) in curriculumJobsSubjects.organizationalJobs" :key="index">
                          <td class="text-center">
                            <AppIcon
                              v-if="selectIcon(organizationalJob.id, subject.curriculumSubjectId) == 0"
                              @click="updateCheck(organizationalJob.id, subject.curriculumSubjectId)"
                              class="text-primary pointer"
                              v-tooltip="'Curso obligatorio'"
                              icon="check-square"
                            ></AppIcon>
                            <AppIcon
                              v-if="selectIcon(organizationalJob.id, subject.curriculumSubjectId) == 1"
                              @click="updateCheck(organizationalJob.id, subject.curriculumSubjectId)"
                              class="text-primary pointer"
                              v-tooltip="'Curso opcional'"
                              icon="minus-square"
                            ></AppIcon>
                            <AppIcon
                              v-if="selectIcon(organizationalJob.id, subject.curriculumSubjectId) == null"
                              @click="updateCheck(organizationalJob.id, subject.curriculumSubjectId)"
                              class="text-white border border-primary border-3 pointer"
                              v-tooltip="'Curso no aplica'"
                              icon="square"
                            ></AppIcon>
                          </td>
                        </template>
                      </tr>
                    </template>
                  </template> -->
              </tbody>
            </table>
          </div>
        </template>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue';
import { useMeta } from 'vue-meta';

import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import { GetCurriculumJobsSubjectsService } from '../services/getCurriculumJobsSubjects.service';
import { GetCurriculumOrgJobsRelatedDataService } from '../services/getCurriculumOrgJobsRelatedData.service';
import { DeleteCurJobsSubjByOrgJobCurSubIdService } from '../services/deleteCurJobsSubjByOrgJobCurSubId.service';
import { CreateOrUpdateCurriculumJobsSubjectsService } from '../services/createOrUpdateCurriculumJobsSubjects.service';
import { useHeaderStore } from '../../../stores/header.store';

const createOrUpdateCurriculumJobsSubjectsService = new CreateOrUpdateCurriculumJobsSubjectsService();
const deleteCurJobsSubjByOrgJobCurSubIdService = new DeleteCurJobsSubjByOrgJobCurSubIdService();
const getCurriculumOrgJobsRelatedDataService = new GetCurriculumOrgJobsRelatedDataService();
const getCurriculumJobsSubjectsService = new GetCurriculumJobsSubjectsService();

export default defineComponent({
  name: 'ConfigurationDevelopmentMaps',
  components: {
    AppEmptyResponse,
    AppAutocomplete,
    AppFormField,
    AppBaseList,
    AppLoading,
    AppIcon,
  },

  setup() {
    const title = 'Configuración de mapas de desarrollo';

    useMeta({ title: title });
    const routes = [{ name: title }];

    const curriculumJobsSubjects: Ref<any> = ref(null);
    const organizationalUnits: Ref<any[]> = ref([]);
    const careerPlans: Ref<any[]> = ref([]);

    const organizationalUnitId = ref();
    const levelId = ref();

    const loadingCurriculumJobsSubjects = ref(false);
    const loading = ref(true);

    onMounted(async () => {
      try {
        const relatedData = await getCurriculumOrgJobsRelatedDataService.run();
        organizationalUnits.value = relatedData.organizationalUnits;
        careerPlans.value = relatedData.levels;

        if (!organizationalUnits.value.length) {
          organizationalUnits.value.push({
            id: null,
            name: 'Todos los cargos',
          });
        }

        organizationalUnitId.value = organizationalUnits.value[0].id;
        levelId.value = careerPlans.value[0].id;

        await getCurriculumJobsSubjects();

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Empresa', url: '' };
        headerStorage.moduleItem = { name: title, url: '' };
        headerStorage.moduleSubItem = { name: '', url: '' };
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    // watch(organizationalUnitId, async (value) => {
    //   await getCurriculumJobsSubjects();
    // });
    // watch(levelId, async (value) => {
    //   await getCurriculumJobsSubjects();
    // });

    const getCurriculumJobsSubjects = async () => {
      loadingCurriculumJobsSubjects.value = true;

      const params: any = {};

      if (organizationalUnitId.value) params['organizationalUnitId'] = organizationalUnitId.value;
      if (levelId.value) params['levelId'] = levelId.value;

      curriculumJobsSubjects.value = await getCurriculumJobsSubjectsService.run(params);

      if (curriculumJobsSubjects.value.organizationalJobs.length) {
        curriculumJobsSubjects.value.organizationalJobs.forEach((organizationalJob: any) => {
          organizationalJob.showCode = false;
        });
      }

      loadingCurriculumJobsSubjects.value = false;
    };

    const updateCheck = async (orgaJobId: number, curriSubjId: number) => {
      const dataSend: any = {
        organizationalJobId: orgaJobId,
        curriculumSubjectId: curriSubjId,
        isOptional: 0,
      };

      let orgJCurrSubject: any = {};
      const params: any = {};

      curriculumJobsSubjects.value.orgJobsCurriculumSubjects.forEach((orgJCurrSubj: any) => {
        if (orgaJobId == orgJCurrSubj.organizationalJobId && curriSubjId == orgJCurrSubj.curriculumSubjectId) {
          orgJCurrSubject = orgJCurrSubj;
        }
      });

      if (!orgJCurrSubject.id) await createOrUpdateCurriculumJobsSubjectsService.run(dataSend);
      else if (!orgJCurrSubject.isOptional) {
        dataSend.isOptional = 1;

        await createOrUpdateCurriculumJobsSubjectsService.run(dataSend, orgJCurrSubject.id);
      } else {
        await deleteCurJobsSubjByOrgJobCurSubIdService.run(orgJCurrSubject.id);
      }

      // update icons
      if (organizationalUnitId.value) params['organizationalUnitId'] = organizationalUnitId.value;
      if (levelId.value) params['levelId'] = levelId.value;

      const res = await getCurriculumJobsSubjectsService.run(params);
      curriculumJobsSubjects.value.orgJobsCurriculumSubjects = res.orgJobsCurriculumSubjects;
    };

    const selectIcon = (orgaJobId: number, curriSubjId: number) => {
      let select: any;

      curriculumJobsSubjects.value.orgJobsCurriculumSubjects.forEach((orgJCurrSubj: any) => {
        if (orgaJobId == orgJCurrSubj.organizationalJobId && curriSubjId == orgJCurrSubj.curriculumSubjectId) {
          select = orgJCurrSubj.isOptional ? 1 : 0;
        }
      });

      if (select == undefined) select = null;

      return select;
    };

    return {
      loading,
      routes,
      title,

      loadingCurriculumJobsSubjects,
      curriculumJobsSubjects,
      organizationalUnitId,
      organizationalUnits,
      careerPlans,
      levelId,

      updateCheck,
      selectIcon,
    };
  },
});
</script>

<style scoped>
.pointer {
  cursor: pointer;
}

.custom-table {
  border-top: 1px solid #ddd;
  border-spacing: 0;
  width: 100%;
  max-height: 300px;
}

.custom-table thead tr {
  background: #eee;
  border-bottom: 1px solid #ddd;
}

.custom-table th,
.custom-table td {
  border-right: 1px solid #ddd;
  min-width: 150px;
  padding: 0 0.5rem;
}

.custom-table th:last-child,
.custom-table td:last-child {
  border-right: 0;
}

.custom-table td {
  border: 1px solid #ddd;
  border-left: 0;
}

.custom-table .sticky {
  position: sticky;
  left: 0;
}

.custom-table thead tr .sticky {
  background: #eee;
}

.custom-table tbody tr .sticky {
  background: #fff;
}

.table-container {
  width: 100%;
  overflow-x: scroll;
  margin: 0 auto;
  border-right: 1px solid #ddd;
  border-left: 1px solid #ddd;
}

@media screen and (min-width: 1000px) {
  .table-container {
    max-width: 700px;
  }
}

@media screen and (min-width: 1200px) {
  .table-container {
    max-width: 850px;
  }
}

@media screen and (min-width: 1300px) {
  .table-container {
    max-width: 1000px;
  }
}

@media screen and (min-width: 1500px) {
  .table-container {
    max-width: 1100px;
  }
}

@media screen and (min-width: 1700px) {
  .table-container {
    max-width: 1300px;
  }
}

@media screen and (min-width: 1800px) {
  .table-container {
    max-width: 1700px;
  }
}

@media screen and (min-width: 2000px) {
  .table-container {
    max-width: 1900px;
  }
}
</style>
