<template>
  <AppBaseList :title="title">
    <template v-slot:content>
      <AppDatatable
        :service="getAllowContentsCasuridService"
        :params="params"
        :name="name"
      >
        <template #filters>
          <AppFilter v-model="degreeId" filter-name="contents.degreeId">
            <label for="degreeId">{{ t('academicPrograms.degrees.name') }}</label>
            <v-select
              :reduce="(levelDegree) => levelDegree.degreeId"
              :options="levelsDegrees.value"
              label="levelDegreeName"
              input-id="degreeId"
              v-model="degreeId"
              class="tw-flex-1"
            ></v-select>
          </AppFilter>

          <AppFilter v-model="subjectId" filter-name="contents.subjectId">
            <label for="subjectId">{{ t('core.generalTerms.academic.subject.singular') }}</label>
            <v-select
              :reduce="(subject) => subject.id"
              :options="subjects.value"
              input-id="subjectId"
              v-model="subjectId"
              class="tw-flex-1"
              label="name"
            ></v-select>
          </AppFilter>
        </template>

        <AppDatatableColumn label="Curso" field="cursoLti" :sortable="true" v-slot="{ row }">
          <span>
            {{ row.title }}
            <AppButton
              @click="prepareDeepLinkData(row)"
              variant="primary"
              outlined
              icon="plus"
            ></AppButton>
          </span>
        </AppDatatableColumn>
      </AppDatatable>

      <!-- <div  >
        <div class="card-body d-flex flex-column">
          <div class="d-flex flex-column flex-md-row align-items-md-center gap-2">
            <span> Filtros: </span>

            <select class="form-select" v-model="degreeId" @change="updateContents()">
              <option value="null" selected disabled>Grado</option>
              <option value="all">Lista Todos</option>
              <option
                v-for="(degree, index) in levelsDegrees.value"
                :value="degree.degreeId"
                :key="index"
              >
                {{ degree.levelDegreeName }}
              </option>
            </select>

            <select class="form-select" v-model="subjectId" @change="updateContents()">
              <option value="null" selected disabled>Asignatura</option>
              <option value="all">Lista Todos</option>
              <option
                v-for="(subject, index) in subjects.value"
                :value="subject.id"
                :key="index"
              >
                {{ subject.name }}
              </option>
            </select>
          </div>
          <div class="mt-4">
            <div
              class="row"
              v-for="(content, index) in filteredContents.value"
              :key="index"
            >
              <div class="col-9">
                <h6>{{ content.title }}</h6>
              </div>
              <div class="col-3">
                <button
                  class="btn btn-sm"
                  @click="prepareDeepLinkData(content)"
                  v-tooltip="'Agregar Tema al LMS'"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div> -->
    
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import {useI18n} from 'vue-i18n';
import { computed, defineComponent, onMounted, reactive, ref } from "vue";

import AppFilter from '../../../shared/components/AppFilter.vue';
import AppBaseList from "../../../shared/components/AppBaseList.vue";
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';

import { SubjectDto } from "../dtos/subject.dto";
import { LevelDegreeDto } from "../dtos/levelDegree.dto";

import { SendDeepLinkService } from "../services/sendDeepLink.service";
import { GetAllowContentsCasuridService } from "../services/getAllowContentsCasurid.service";
import { GetRelatedDataAllowContentsService } from "../services/relatedDataAllowContents.service";

const getRelatedDataAllowContentsService = new GetRelatedDataAllowContentsService();

export default defineComponent({
  name: "ListAllowContents",
  components: {
    AppDatatableColumn,
    AppDatatable,
    AppBaseList, 
    AppFilter, 
    AppButton,
  },

  setup() {
    const title = "Contenidos disponibles en CASURID";
    const name = 'listAllowContents';

    const subjectId = ref(null);
    const degreeId = ref(null);
    const {t} = useI18n();

    const levelsDegrees: { value: LevelDegreeDto[] } = reactive({
      value: [],
    });
    const subjects: { value: SubjectDto[] } = reactive({
      value: [],
    });

    const getAllowContentsCasuridService = new GetAllowContentsCasuridService();
    const params = computed(() => {
      return {
        subjectId: subjectId.value,
        degreeId: degreeId.value,
      };
    });

    onMounted(async () => {
      const filters = await getRelatedDataAllowContentsService.run();
      // const filters = {
      //   levelsDegrees: [
      //     {
      //       degreeId: 1,
      //       levelId: 1,
      //       levelDegreeName: 'nivel 1 - grado 1',
      //     },
      //     {
      //       degreeId: 2,
      //       levelId: 1,
      //       levelDegreeName: 'nivel 1 - grado 2',
      //     },
      //     {
      //       degreeId: 3,
      //       levelId: 2,
      //       levelDegreeName: 'nivel 2- grado 3',
      //     },
      //     {
      //       degreeId: 4,
      //       levelId: 2,
      //       levelDegreeName: 'nivel 2 - grado 4',
      //     },
      //   ],
      //   subjects: [
      //     {
      //       id: 1,
      //       institutionId: 0,
      //       areaId: 1,
      //       name: 'Asignatura 1',
      //     },
      //     {
      //       id: 2,
      //       institutionId: 0,
      //       areaId: 1,
      //       name: 'Asignatura 2',
      //     },
      //     {
      //       id: 3,
      //       institutionId: 0,
      //       areaId: 1,
      //       name: 'Asignatura 3',
      //     },
      //   ],
      // };

      levelsDegrees.value = filters.levelsDegrees;
      subjects.value = filters.subjects;
    });

    const prepareDeepLinkData = async (content: any) => {
      const data = {
        id: content.id,
        title: content.title,
        urlLocation: content.urlLocation,
        productId: content.productId,
      };

      const sendDeepLink = new SendDeepLinkService();
      await sendDeepLink.run(data);
    };

    return {
      title,
      name,
      t,

      levelsDegrees,
      subjectId,
      subjects,
      degreeId,

      getAllowContentsCasuridService,
      params,

      prepareDeepLinkData,
    };
  },
});
</script>

<style scoped></style>
