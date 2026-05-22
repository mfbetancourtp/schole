<template>
  <AppBaseList title="Contenidos" isCard>
    <template #actions>
      <AppButton style="color: white;" variant="primary" outlined :to="{ name: 'casurid.contentsImportList' }"> Importar </AppButton>
      <AppButton style="color: white;" :to="{ name: 'casurid.contentsCreate' }" label="core.new"></AppButton>
    </template>

    <template #content>
      <AppDatatable name="contents" :service="getContentsWithPaginationService" :params="params">
        <template #filters>
          <AppFilter v-model="degreeId" filter-name="contents.degreeId">
            <label for="degreeId">Nivel - Grado</label>
            <v-select multiple input-id="degreeId" v-model="degreeId" class="tw-flex-1" :options="levelsDegrees.value" label="levelDegreeName" :reduce="(levelDegree) => levelDegree.degreeId">
            </v-select>
          </AppFilter>

          <AppFilter v-model="subjectId" filter-name="contents.subjectId">
            <label for="subjectId">Asignatura</label>
            <v-select multiple input-id="subjectId" class="tw-flex-1" v-model="subjectId" :options="subjects.value" label="name" :reduce="(subject) => subject.id"> </v-select>
          </AppFilter>
        </template>

        <AppDatatableColumn label="Nivel-Grado" field="levelDegree" :sortable="true" v-slot="{ row }">
          {{ row.levelDegree }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Asignatura" field="subject.name" :sortable="true" v-slot="{ row }">
          {{ row.subject.name }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Tipo de contenido" field="contentType.name" :sortable="true" v-slot="{ row }">
          {{ row.contentType.name }}
        </AppDatatableColumn>

        <AppDatatableColumn label="Título" field="title" :sortable="true" v-slot="{ row }">
          {{ row.title }}
        </AppDatatableColumn>

        <AppDatatableColumn v-slot="{ row }">
          <AppButtonGroup>
            <AppButtonEdit
              :to="{
                name: 'casurid.contentsEdit',
                params: { contentId: row.id },
              }"
            ></AppButtonEdit>
            <AppButtonDelete @click="confirmDelete(row)"></AppButtonDelete>
          </AppButtonGroup>
        </AppDatatableColumn>
      </AppDatatable>

      <AppModal v-model="showModalDelete">
        <AppConfirmDeleteModal v-if="showModalDelete" entity="Contenido" @confirmDelete="deleteContent"> </AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'vue-meta';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppFilter from '../../../shared/components/AppFilter.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';

import { GetFiltersContentService } from '../services/getFiltersContent.service';
import { GetContentsWithPaginationService } from '../services/getContentsWithPagination.service';
import { SubjectDto } from '../dtos/subject.dto';

import { LevelsDegreeDto } from '../dtos/levelsDegree.dto';
import { ContentTypeDto } from '../dtos/contentType.dto';
import { DeleteContentService } from '../services/deleteContent.service';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { useHeaderStore } from '../../../stores/header.store';

const getFiltersContentService = new GetFiltersContentService();
const deleteContentService = new DeleteContentService();
const updateDatatableService = new UpdateDatatableService();

export default defineComponent({
  name: 'ContentsPage',
  components: {
    AppButton,
    AppDatatableColumn,
    AppFilter,
    AppButtonDelete,
    AppButtonEdit,
    AppDatatable,
    AppBaseList,
    AppConfirmDeleteModal,
    AppModal,
    AppButtonGroup,
  },
  setup() {
    const title = 'Contenidos';

    useMeta({});
    const { t } = useI18n();
    const getContentsWithPaginationService = new GetContentsWithPaginationService();

    const subjects: { value: SubjectDto[] } = reactive({
      value: [],
    });
    const levelsDegrees: { value: LevelsDegreeDto[] } = reactive({
      value: [],
    });
    const contentTypes: { value: ContentTypeDto[] } = reactive({
      value: [],
    });
    const subjectId = ref();
    const degreeId = ref();
    const contentTypeId = ref();
    const showModalDelete = ref(false);
    const currentContent: { value: any } = reactive({
      value: null,
    });

    const routes = [
      {
        name: 'Contenidos',
      },
    ];

    onMounted(async () => {
      const response = await getFiltersContentService.run();

      subjects.value = response.subjects;
      levelsDegrees.value = response.levelsDegrees;
      contentTypes.value = response.contentTypes;

      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Casurid', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };
    });

    const params = computed(() => {
      let levelId = null;

      levelsDegrees.value.forEach((levelDegree) => {
        if (levelDegree.degreeId === degreeId.value) {
          levelId = levelDegree.levelId;
        }
      });

      return {
        subjectId: subjectId.value,
        degreeId: degreeId.value,
        levelId,
      };
    });

    const updateTable = () => {
      updateDatatableService.run();
    };

    const confirmDelete = async (content: any) => {
      currentContent.value = content;
      showModalDelete.value = true;
    };

    const deleteContent = async () => {
      try {
        await deleteContentService.run(currentContent.value.id);
        showModalDelete.value = false;
        updateTable();
      } catch (e) {
        console.log('error', e);
      }
    };

    return {
      getContentsWithPaginationService,
      subjects,
      levelsDegrees,
      contentTypes,
      params,
      subjectId,
      contentTypeId,
      degreeId,
      t,
      routes,
      showModalDelete,
      confirmDelete,
      deleteContent,
      title,
    };
  },
});
</script>

<style scoped></style>
