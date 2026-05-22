<template>
  <AppBaseList :title="title" :routes="routes">
    <template v-slot:actions>
      <AppCheckPermission permission="academicPrograms.levelsDegrees.create">
        <AppButton
        style="color: white;"
          class="button_position"
          :to="{ name: 'academicPrograms.programCreate' }"
          label="core.new"
        >
          {{ 'Agregar' }}
        </AppButton>
      </AppCheckPermission>
    </template>
    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <!--h2 class="tw-text-lg tw-font-light">{{ ('Programas') }}</h2-->
        <h2 class="tw-text-lg tw-font-light">Programas por Semestre</h2>
        <AppAccordion class="mt-2" v-slot="{ accordionId }">
          <AppAccordionItem
            :accordion-id="accordionId"
            v-for="program in programs"
            :key="program.id"
          >
            <template v-slot:head>{{ program.name }}</template>
            <template v-slot:content>
              <!--h6 class="tw-text-lg tw-font-light">{{ ('core.generalTerms.academic.subject.plural') }}</h6-->
              <h6 class="tw-text-lg tw-font-light">Semestre</h6>

              <div :class="{ 'grid-cards': program.degrees.length }">
                <AppCheckPermission
                  permission="academicPrograms.levelsDegrees.create"
                >
                  <AppButtonNewContainer
                    @click="openDegreeModal(program.id, null)"
                  >
                  </AppButtonNewContainer>
                </AppCheckPermission>

                <AppEmptyResponse
                  v-if="!program.degrees.length"
                ></AppEmptyResponse>

                <AppCard
                  v-for="(degree, index) in program.degrees"
                  :key="index"
                >
                  <template #body>
                    <span class="tw-text-sm">{{ degree.name }}</span>
                  </template>

                  <template #footer>
                    <div class="d-flex justify-content-end">
                      <AppButtonGroup>
                        <AppCheckPermission
                          permission="academicPrograms.levelsDegrees.edit"
                        >
                          <AppButtonEdit
                            @click="openDegreeModal(program.id, degree)"
                          >
                          </AppButtonEdit>
                        </AppCheckPermission>

                        <AppCheckPermission
                          permission="academicPrograms.levelsDegrees.delete"
                        >
                          <AppButtonDelete
                            @click="openConfirmDelete(entityDegree, degree)"
                          >
                          </AppButtonDelete>
                        </AppCheckPermission>
                      </AppButtonGroup>
                    </div>
                  </template>
                </AppCard>
              </div>

              <hr />

              <div class="d-flex justify-content-end">
                <AppButtonGroup>
                  <AppCheckPermission
                    permission="academicPrograms.levelsDegrees.edit"
                  >
                    <AppButtonEdit
                      :to="{
                        name: 'academicPrograms.programEdit',
                        params: { programsId: program.id },
                      }"
                    >
                    </AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission
                    permission="academicPrograms.levelsDegrees.delete"
                  >
                    <AppButtonDelete
                      v-if="!program.degrees.length"
                      @click="openConfirmDelete(entityProgram, program)"
                    >
                    </AppButtonDelete>
                  </AppCheckPermission>
                </AppButtonGroup>
              </div>
            </template>
          </AppAccordionItem>
        </AppAccordion>
      </template>

      <AppModal v-model="degreeModal">
        <DegreeModal
          v-if="degreeModal"
          :data="currentDegree.value"
          :level-id="currentProgramlId"
          @close="closeDegreeModal"
        ></DegreeModal>
      </AppModal>

      <AppModal v-model="deleteModal">
        <AppConfirmDeleteModal
          v-if="deleteModal"
          :entity="currentEntity"
          @confirmDelete="confirmDelete"
        >
        </AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import { ProgramDto } from '../../../../shared/dto/program.dto';
import { DegreeLevelsDto } from '../../../../shared/dto/degreeLevels.dto';

import AppBaseList from '../../../../shared/components/AppBaseList.vue';
import AppLoading from '../../../../shared/components/AppLoading.vue';
import AppCheckPermission from '../../../../shared/components/AppCheckPermission.vue';
import AppButtonNewContainer from '../../../../shared/components/Buttons/AppButtonContainerNew.vue';
import AppAccordionItem from '../../../../shared/components/Accordion/AppAccordionItem.vue';
import AppAccordion from '../../../../shared/components/Accordion/AppAccordion.vue';
import AppConfirmDeleteModal from '../../../../shared/components/Modal/AppConfirmDeleteModal.vue';
import AppEmptyResponse from '../../../../shared/components/AppEmptyResponse.vue';
import AppButtonDelete from '../../../../shared/components/Buttons/AppButtonDelete.vue';
import AppButtonGroup from '../../../../shared/components/AppButtonGroup.vue';
import AppButtonEdit from '../../../../shared/components/Buttons/AppButtonEdit.vue';
import DegreeModal from '../../components/DegreeModal.vue';
import AppModal from '../../../../shared/components/Modal/AppModal.vue';
import AppCard from '../../../../shared/components/Card/AppCard.vue';
import AppButton from '../../../../shared/components/Buttons/AppButton.vue';

import { GetProgramsService } from '../../services/programs/getPrograms.service';
import { DeleteLevelService } from '../../services/deleteLevel.service';
import { DeleteDegreeService } from '../../services/deleteDegree.service';

const deleteLevelService = new DeleteLevelService();
const deleteDegreeService = new DeleteDegreeService();
const getProgramsService = new GetProgramsService();

export default defineComponent({
  name: 'ProgramsView',

  components: {
    AppButtonNewContainer,
    AppConfirmDeleteModal,
    AppCheckPermission,
    AppEmptyResponse,
    AppAccordionItem,
    AppButtonDelete,
    AppButtonGroup,
    AppButtonEdit,
    AppAccordion,
    AppBaseList,
    AppLoading,
    DegreeModal,
    AppButton,
    AppModal,
    AppCard,
  },
  setup() {
    const { t } = useI18n();
    //const title = 'core.menu.programDegrees';
    const title = 'Programas';
    const programs = ref<ProgramDto[]>([]);
    const currentDegree: { value: DegreeLevelsDto | null } = reactive({
      value: null,
    });
    const entityProgram = 'core.generalTerms.academic.area.singular';
    const entityDegree = 'core.generalTerms.academic.subject.singular';
    useMeta({ title: t(title) });
    const routes = [{ name: title }];

    const loading = ref(true);

    const currentProgram: { value: ProgramDto | null } = reactive({
      value: null,
    });
    const currentDataDelete: { value: any } = reactive({
      value: null,
    });

    const programModal = ref(false);
    const degreeModal = ref(false);
    const currentEntity = ref();
    const currentProgramlId = ref();
    const deleteModal = ref(false);

    onMounted(async () => {
      await getData();
      loading.value = false;
    });
    const getData = async () => {
      try {
        programs.value = await getProgramsService.run();
        console.log(programs.value);
      } catch (e) {}
    };

    const openDegreeModal = (
      programId: number,
      subject: DegreeLevelsDto | null
    ) => {
      currentDegree.value = subject;
      currentProgramlId.value = programId;
      degreeModal.value = true;
    };

    const openConfirmDelete = async (
      entity: string,
      data: ProgramDto | DegreeLevelsDto
    ) => {
      currentDataDelete.value = data;
      currentEntity.value = entity;
      deleteModal.value = true;
    };
    const confirmDelete = async () => {
      try {
        if (currentEntity.value === entityProgram) {
          await deleteLevelService.run(currentDataDelete.value.id);
        } else if (currentEntity.value === entityDegree) {
          await deleteDegreeService.run(currentDataDelete.value.id);
        }

        deleteModal.value = false;
        await getData();
      } catch (e) {}
    };

    const closeDegreeModal = async () => {
      degreeModal.value = false;
      await getData();
    };

    return {
      loading,
      title,
      routes,

      programs,
      entityProgram,
      programModal,
      currentProgram,
      degreeModal,
      currentDegree,
      currentProgramlId,
      deleteModal,
      currentEntity,
      entityDegree,

      openDegreeModal,
      openConfirmDelete,
      closeDegreeModal,
      confirmDelete,
    };
  },
});
</script>

<style scoped>
.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
}

.button_position {
  float: right;
}

a {
  text-decoration: none;
}
</style>
