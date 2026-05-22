<template>
  <div class="col-12">
    <div  >
      <div class="card-body">
        <small>Búsqueda avanzada</small>

        <AppStepper class="mt-3" v-model.lazy="currentStep">
          <template v-slot:header>
            <AppStepperStep step="1">Nivel Académico</AppStepperStep>
            <AppStepperStep step="2">Grados</AppStepperStep>
            <AppStepperStep step="3">Áreas</AppStepperStep>
            <AppStepperStep step="4">Asignaturas</AppStepperStep>
          </template>

          <template v-slot:items>
            <AppStepperContent step="1">
              <div class="row g-2 mt-2">
                <div class="col-12 col-md-4 col-lg-3" v-for="level in currentLevels" :key="level.id">
                  <CardFilter
                    :thumbnail="level.thumbnail"
                    v-model="level.isSelected"
                    :name="level.name"
                    :id="level.id"
                  ></CardFilter>
                </div>
              </div>
            </AppStepperContent>

            <AppStepperContent step="2">
              <div class="row g-2 mt-2">
                <div class="col-12 col-md-4 col-lg-2" v-for="degree in currentDegrees" :key="degree.id">
                  <CardFilter
                    :thumbnail="degree.thumbnail"
                    v-model="degree.isSelected"
                    :name="degree.name"
                    :id="degree.id"
                  ></CardFilter>
                </div>
              </div>
            </AppStepperContent>

            <AppStepperContent step="3">
              <div class="row g-2 mt-2">
                <div class="col-12 col-md-4 col-lg-3" v-for="area in currentAreas" :key="area.id">
                  <CardFilter
                    :thumbnail="area.thumbnail"
                    v-model="area.isSelected"
                    :name="area.name"
                    :id="area.id"
                  ></CardFilter>
                </div>
              </div>
            </AppStepperContent>

            <AppStepperContent step="4">
              <div class="row g-2 mt-2">
                <div class="col-12 col-md-4 col-lg-2" v-for="subject in currentSubjects" :key="subject.id">
                  <CardFilter
                    :thumbnail="subject.thumbnail"
                    v-model="subject.isSelected"
                    :name="subject.name"
                    :id="subject.id"
                  ></CardFilter>
                </div>
              </div>
            </AppStepperContent>
          </template>
        </AppStepper>

        <div class="d-flex justify-content-end gap-2 mt-3">
          <AppButton
            @click="removeFilters()"
            label="Quitar Filtros"
            outlined
          ></AppButton>

          <AppButtonGroup>
            <AppButton
              :disabled="currentStep == 1"
              @click="currentStep -= 1"
              label="Atrás"
              outlined
            ></AppButton>

            <AppButton
              @click="nextStep()"
              :label="currentStep < 4 ? 'Siguiente' : 'Aplicar'"
            ></AppButton>
          </AppButtonGroup>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import CardFilter from './CardFilter.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from "../../../shared/components/AppButtonGroup.vue";
import AppStepper from '../../../shared/components/Stepper/AppStepper.vue';
import AppStepperStep from '../../../shared/components/Stepper/AppStepperStep.vue';
import AppStepperContent from '../../../shared/components/Stepper/AppStepperContent.vue';


import {LevelDto} from '../dtos/level.dto';
import {AreaDto} from '../dtos/area.dto';
import {DegreeDto} from '../dtos/degree.dto';
import {SubjectDto} from '../dtos/subject.dto';

interface ILevel extends LevelDto {
  isSelected: boolean;
}

interface IDegree extends DegreeDto {
  isSelected: boolean;
}

interface IArea extends AreaDto {
  isSelected: boolean;
}

interface ISubject extends SubjectDto {
  isSelected: boolean;
}

interface ICatalogueFilters {
  currentStep: number;
  currentLevels: ILevel[];
  currentDegrees: IDegree[],
  currentAreas: IArea[],
  currentSubjects: ISubject[],
}

export default defineComponent({
  name: 'CatalogFilters',
  components: { CardFilter, AppStepperContent, AppStepperStep, AppStepper, AppLoading, AppButton, AppButtonGroup },

  props: ['levels', 'areas'],
  data(): ICatalogueFilters {
    return {
      currentStep: 1,
      currentLevels: [],
      currentDegrees: [],
      currentAreas: [],
      currentSubjects: [],
    };
  },
  mounted() {
    const {levelsIds, areasIds, degreesIds, subjectsIds} = this.$route.query;

    this.currentLevels = this.levels.map((level: LevelDto) => {
      level.degrees.forEach((degree) => {
        this.currentDegrees.push({
          ...degree,
          isSelected: degreesIds?.includes(degree.id.toString()) ?? false,
        });
      });

      return {
        ...level,
        isSelected: levelsIds?.includes(level.id.toString()),
      };
    });

    this.currentAreas = this.areas.map((area: AreaDto) => {

      area.subjects.forEach((subject) => {
        let subjName = subject.name;

        this.currentSubjects.push({
          ...subject,
          isSelected: subjectsIds?.includes(subject.id.toString()) ?? false,
        });
      });

      return {
        ...area,
        isSelected: areasIds?.includes(area.id.toString()),
      };
    });

    this.changeFilters();
  },
  watch: {
    currentStep(value) {
      if (value == 2) {
        this.getDegrees();
      } else if (value == 4) {
        this.getSubjects();
      }
      this.changeFilters();
    },
    currentLevels: {
      deep: true,
      handler() {
        this.changeFilters();
      },
    },
    currentDegrees: {
      deep: true,
      handler() {
        this.changeFilters();
      },
    },
    currentAreas: {
      deep: true,
      handler() {
        this.changeFilters();
      },
    },
    currentSubjects: {
      deep: true,
      handler() {
        this.changeFilters();
      },
    },
  },
  methods: {
    getDegrees() {
      this.currentDegrees = [];
      const {degreesIds} = this.$route.query;

      let allSelected = true;

      this.currentLevels.forEach((level) => {
        if (level.isSelected) {
          allSelected = false;
        }
      });

      this.currentLevels.forEach((level) => {
        if (level.isSelected || allSelected) {
          this.currentDegrees.push(...level.degrees.map(degree => {
            return {
              ...degree,
              isSelected: degreesIds?.includes(degree.id.toString()) ?? false,
            };
          }));
        }
      });
    },
    getSubjects() {
      this.currentSubjects = [];
      const {subjectsIds} = this.$route.query;

      let allSelected = true;

      this.currentAreas.forEach((area) => {
        if (area.isSelected) {
          allSelected = false;
        }
      });

      this.currentAreas.forEach((area) => {
        if (area.isSelected || allSelected) {
          this.currentSubjects.push(...area.subjects.map((subject) => {
            return {
              ...subject,
              isSelected: subjectsIds?.includes(subject.id.toString()) ?? false,
            };
          }));
        }
      });
    },
    nextStep() {
      if (this.currentStep == 4) {
        this.changeFilters();
      } else {
        this.currentStep += 1;
      }

    },
    removeFilters() {
      this.currentLevels = this.currentLevels.map((level) => {
        level.isSelected = false;
        return level;
      });
      this.currentDegrees.forEach((degree) => {
        degree.isSelected = false;
      });
      this.currentAreas.forEach((area) => {
        area.isSelected = false;
      });
      this.currentSubjects.forEach((subject) => {
        subject.isSelected = false;
      });

      this.$router.push({
        path: this.$route.path,
        query: {},
      });

      this.changeFilters();
    },
    async changeFilters() {
      const filters: FiltersType = {
        currentLevels: this.currentLevels.filter((level) => level.isSelected).map(level => level.id),
        currentAreas: this.currentAreas.filter((area) => area.isSelected).map(area => area.id),
        currentDegrees: this.currentDegrees.filter((degree) => degree.isSelected).map(degree => degree.id),
        currentSubjects: this.currentSubjects.filter((subject) => subject.isSelected).map(subject => subject.id),
      };

      await this.$router.push({
        query: {
          ...this.$route.query,
          levelsIds: filters.currentLevels,
          degreesIds: filters.currentDegrees,
          areasIds: filters.currentAreas,
          subjectsIds: filters.currentSubjects,
        },
      });

      this.$emit('changeFilters', filters);
    },
  },
});
</script>

<style scoped>

</style>