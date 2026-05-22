<template>
  <div class="content">
    <div class="graphWrapper">
      <div class="graph">
        <div v-if="operationalScheme.stepOne" class="graph-step">
          <div class="rectangle rectangle--first">
            <span :class="isDocument ? 'margin-adjustment' : ''">
              {{ operationalScheme.stepOne }}
            </span>
          </div>

          <div class="arrow" :class="{ 'rotate-left': isDocument }">
            <AppGetIcon name="bigRightArrow" />
          </div>
        </div>

        <div v-if="operationalScheme.stepTwo" class="graph-step">
          <div class="rectangle">
            <span :class="isDocument ? 'margin-adjustment' : ''">
              {{ operationalScheme.stepTwo }}
            </span>
          </div>

          <div class="arrow" :class="{ 'rotate-left': isDocument }">
            <AppGetIcon name="bigRightArrow" />
          </div>
        </div>

        <div class="blocks">
          <div v-for="(semester, index) in operationalScheme.periodTemplates" :key="index" class="block">
            <div v-if="semester.types?.length == 0" class="types one-type">
              <div class="type type--default">
                <div :class="isDocument ? 'margin-adjustment' : ''">
                  {{ `${operationalScheme.name || 'SEMESTRE'} ${decimalToRoman(index + 1)}` }}
                </div>
              </div>
            </div>

            <div v-else class="types" :class="getTypesLayoutClass(semester.types)">
              <div
                v-for="(type, typeIndex) in orderTypes(semester.types)"
                :key="typeIndex"
                class="type"
                :style="{
                  backgroundColor: getColorForType(type.id),
                  gridArea: getTypeGridArea(semester.types.length, typeIndex),
                }"
              >
                <div :class="isDocument ? 'margin-adjustment' : ''">
                  {{ getAbbreviationForType(type.id) }}
                </div>
              </div>
            </div>

            <div class="evaluation-block"></div>
          </div>
        </div>

        <div v-if="operationalScheme.stepThree" class="graph-step">
          <div class="arrow" :class="{ 'rotate-left': isDocument }">
            <AppGetIcon name="bigRightArrow" />
          </div>

          <div class="rectangle">
            <span :class="isDocument ? 'margin-adjustment' : ''">
              {{ operationalScheme.stepThree }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="infoTableWrapper">
      <div class="info-table">
        <table>
          <tr>
            <th>
              <div :class="isDocument ? 'margin-adjustment' : ''">SEMANAS</div>
            </th>

            <template v-for="(semester, index) in operationalScheme.periodTemplates" :key="index">
              <td v-if="!Dual.includes(semester)">
                <div :class="isDocument ? 'margin-adjustment' : ''">
                  {{ operationalScheme.classWeeks }}
                </div>
              </td>

              <td v-if="Dual.includes(semester)">
                <div :class="isDocument ? 'margin-adjustment' : ''">
                  {{ operationalScheme.trainingWeeks }}
                </div>
              </td>

              <td v-if="Dual.includes(semester)">
                <div :class="isDocument ? 'margin-adjustment' : ''">
                  {{ operationalScheme.seminary }}
                </div>
              </td>

              <td>
                <div :class="isDocument ? 'margin-adjustment' : ''">
                  {{ operationalScheme.evaluationWeeks }}
                </div>
              </td>
            </template>
          </tr>

          <tr>
            <th>
              <div :class="isDocument ? 'margin-adjustment' : ''">{{ operationalScheme.moduleName || 'SEMESTRE' }} (HORAS)</div>
            </th>

            <template v-for="(semester, index) in operationalScheme.periodTemplates" :key="index">
              <td :colspan="Dual.includes(semester) ? 3 : 2">
                <div :class="isDocument ? 'margin-adjustment' : ''">{{ decimalToRoman(index + 1) }} ({{ operationalScheme.semesterHours }})</div>
              </td>
            </template>
          </tr>

          <tr v-if="showStages && operationalScheme.showTypes">
            <th>ETAPAS</th>
            <td v-if="EG.length > 0" :colspan="2 * EG.length">Estudios Generales</td>
            <td v-if="FBC.length > 0" :colspan="2 * FBC.length">Formación Básica</td>
            <td v-if="Dual.length > 0" :colspan="3 * Dual.length">Formación Específica DUAL</td>
          </tr>
        </table>

        <div class="hoursSummary">
          <p :class="isDocument ? 'margin-adjustment' : ''">
            =
            {{ operationalScheme?.semesterHours * operationalScheme?.periodTemplates?.length }}
            horas
          </p>

          <p v-if="operationalScheme?.practicalHours" class="hoursSummary__extra">
            +
            {{ operationalScheme?.practicalHours }}
            horas
          </p>

          <div v-if="operationalScheme?.practicalHours" class="hoursSummary__divider"></div>

          <p v-if="operationalScheme?.practicalHours" :class="isDocument ? 'margin-adjustment' : ''">
            =
            {{ operationalScheme?.semesterHours * operationalScheme?.periodTemplates?.length + operationalScheme?.practicalHours }}
            horas
          </p>
        </div>
      </div>
    </div>

    <div class="caption">
      <table v-if="operationalScheme.showTypes" class="legendTable">
        <tr>
          <td>
            <div class="legendItem">
              <div class="color-box" style="background-color: #d1e5f0">
                <div :class="isDocument ? 'margin-adjustment' : ''">EG</div>
              </div>
              <span :class="isDocument ? 'margin-adjustment' : ''">ESTUDIOS GENERALES</span>
            </div>
          </td>

          <td>
            <div class="legendItem">
              <div class="color-box" style="background-color: #a333c8">
                <div :class="isDocument ? 'margin-adjustment' : ''">FC</div>
              </div>
              <span :class="isDocument ? 'margin-adjustment' : ''">FORMACIÓN EN CENTRO</span>
            </div>
          </td>
        </tr>

        <tr>
          <td>
            <div class="legendItem">
              <div class="color-box" style="background-color: #81e6d9">
                <div :class="isDocument ? 'margin-adjustment' : ''">FBC</div>
              </div>
              <span :class="isDocument ? 'margin-adjustment' : ''">FORMACIÓN BÁSICA EN CENTRO</span>
            </div>
          </td>

          <td>
            <div class="legendItem">
              <div class="pattern-box"></div>
              <span :class="isDocument ? 'margin-adjustment' : ''">SEMINARIO DE HABILIDADES PRÁCTICAS</span>
            </div>
          </td>
        </tr>

        <tr>
          <td>
            <div class="legendItem">
              <div class="color-box" style="background-color: #2185d0">
                <div :class="isDocument ? 'margin-adjustment' : ''">FPE</div>
              </div>
              <span :class="isDocument ? 'margin-adjustment' : ''">FORMACIÓN PRÁCTICA EN EMPRESA</span>
            </div>
          </td>

          <td>
            <div class="legendItem">
              <div class="pattern-box" style="background-image: linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 50%, #ccc 50%, #ccc 75%, transparent 75%, transparent)"></div>
              <span :class="isDocument ? 'margin-adjustment' : ''">EVALUACIÓN SEMESTRAL</span>
            </div>
          </td>
        </tr>
      </table>

      <div class="curriculumTable" v-if="curriculum">
        <table>
          <tr>
            <th>
              <div :class="isDocument ? 'margin-adjustment' : ''">Nombre de la carrera</div>
            </th>
            <th>
              <div :class="isDocument ? 'margin-adjustment' : ''">N° Semestre</div>
            </th>
            <th>
              <div :class="isDocument ? 'margin-adjustment' : ''">N° Horas</div>
            </th>
            <th>
              <div :class="isDocument ? 'margin-adjustment' : ''">N° Créditos</div>
            </th>
          </tr>
          <tr>
            <td>
              <div :class="isDocument ? 'margin-adjustment' : ''">
                {{ curriculum.levelName }}
              </div>
            </td>
            <td>{{ operationalScheme.numberSemesters }}</td>
            <td>
              {{ operationalScheme.semesterHours * operationalScheme.numberSemesters }}
            </td>
            <td>{{ operationalScheme.credits }}</td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue';

import AppGetIcon from '../../../shared/components/AppGetIcon.vue';

export default defineComponent({
  name: 'OperationalSchemeGraph',
  components: { AppGetIcon },
  props: {
    operationalScheme: {
      type: Object,
      required: true,
    },
    curriculum: {
      type: Object,
      required: false,
    },
    isDocument: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    const EG = ref<any>([]);
    const FBC = ref<any>([]);
    const Dual = ref<any>([]);
    const showStages = ref(true);

    onMounted(() => {
      classifySmesters();
    });

    watch(
      () => props.operationalScheme,
      () => {
        classifySmesters();
      },
      { deep: true }
    );

    const getColorForType = (typeName: string | number) => {
      const colorMap: any = {
        1: '#dcedf4',
        2: '#4aacc5',
        3: '#0072c4',
        4: '#80639e',
        5: '#e3e4e5',
        7: '#dcedf4',
        8: '#4aacc5',
        9: '#0072c4',
        10: '#80639e',
        11: '#e3e4e5',
      };
      return colorMap[typeName] || '#fff';
    };

    const getAbbreviationForType = (typeName: string | number) => {
      const abbreviationMap: any = {
        1: 'EG',
        2: 'FBC',
        3: 'FPE',
        4: 'FC',
        5: 'S',
        7: 'EG',
        8: 'FBC',
        9: 'FPE',
        10: 'FC',
        11: 'S',
      };
      return abbreviationMap[typeName] || '';
    };
    const orderTypes = (types: any[]) => {
      return [...(types || [])].sort((a, b) => {
        if (a.id === 4 || a.id === 10) return 1;
        if (b.id === 4 || b.id === 10) return -1;
        return 0;
      });
    };

    const getTypesLayoutClass = (types: any) => {
      if (types?.length === 2) {
        const typeIds = types.map((type: any) => type.id);

        if ((typeIds.includes(2) && typeIds.includes(5)) || (typeIds.includes(8) && typeIds.includes(11))) {
          return 'two-types-seminary';
        }

        return 'two-types';
      }

      switch (types?.length) {
        case 1:
          return 'one-type';
        case 3:
          return 'three-types';
        default:
          return '';
      }
    };

    const getTypeGridArea = (typesLength: number, typeIndex: number) => {
      switch (typesLength) {
        case 1:
          return 'one';
        case 2:
          return typeIndex === 0 ? 'top' : 'bottom';
        case 3:
          return typeIndex === 0 ? 'left' : typeIndex === 1 ? 'right' : 'bottom';
        default:
          return '';
      }
    };

    const decimalToRoman: (num: number) => string = (num) => {
      const romanNumerals: { value: number; symbol: string }[] = [
        { value: 10, symbol: 'X' },
        { value: 9, symbol: 'IX' },
        { value: 5, symbol: 'V' },
        { value: 4, symbol: 'IV' },
        { value: 1, symbol: 'I' },
      ];

      let roman = '';
      for (const { value, symbol } of romanNumerals) {
        while (num >= value) {
          roman += symbol;
          num -= value;
        }
      }
      return roman;
    };

    const classifySmesters = () => {
      EG.value = [];
      FBC.value = [];
      Dual.value = [];
      showStages.value = true;

      props.operationalScheme.periodTemplates?.forEach((template: any) => {
        let egFound = false;
        let fbcFound = false;

        if (template.types?.length == 0) showStages.value = false;

        template.types?.forEach((type: any) => {
          if (type.id === 1 || type.id === 7) {
            egFound = true;
          } else if (type.id === 2 || type.id === 8) {
            fbcFound = true;
          }
        });

        if (egFound) {
          EG.value.push(template);
        } else if (fbcFound) {
          FBC.value.push(template);
        } else if (template.types?.length > 0) {
          Dual.value.push(template);
        }
      });
    };

    return {
      EG,
      FBC,
      Dual,
      showStages,
      getColorForType,
      getTypesLayoutClass,
      getTypeGridArea,
      getAbbreviationForType,
      decimalToRoman,
      orderTypes,
    };
  },
});
</script>
<style scoped>
* {
  font-family: 'Times New Roman', serif;
  box-sizing: border-box;
}

.content {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  gap: 24px;
  background-color: rgb(255, 255, 255);
  box-shadow: rgba(0, 0, 0, 0.45) 1px 2px 6px;
  /* height: calc(-200px + 100vh); */
  overflow: auto;
}

/* wrappers */
.graphWrapper,
.infoTableWrapper,
.curriculumTable {
  width: 100%;
  overflow-x: auto;
}

/* graph */
.content .graph {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 14px;
  padding: 20px;
  margin: 0 auto;
  width: max-content;
  min-width: 100%;
}

.graph-step {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.blocks {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 0;
}

.block {
  display: flex;
  flex-direction: row;
  min-width: 110px;
  min-height: 210px;
  flex-shrink: 0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}

.types {
  width: 80%;
  height: 100%;
  display: grid;
  border: 1px solid #d7dce3;
  background: #fff;
}

.one-type {
  grid-template-areas: 'one';
}

.two-types {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  grid-template-areas:
    'top top'
    'bottom bottom';
}

.two-types-seminary {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 1fr;
  grid-template-areas: 'top bottom';
}

.three-types {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(4, 1fr);
  grid-template-areas:
    'left right'
    'left right'
    'left right'
    'bottom bottom';
}

.type {
  font-weight: 700;
  color: #1f2937;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 10px 8px;
  font-size: 14px;
  line-height: 1.15;
  word-break: break-word;
}

.type--default {
  background-color: #5a6ad7;
  color: #fff;
}

.type[style*='grid-area: one'] {
  grid-area: one;
}

.type[style*='grid-area: top'] {
  grid-area: top;
}

.type[style*='grid-area: bottom'] {
  grid-area: bottom;
}

.type[style*='grid-area: left'] {
  grid-area: left;
}

.type[style*='grid-area: right'] {
  grid-area: right;
}

.evaluation-block {
  width: 20%;
  height: 100%;
  border-top: 1px solid #d7dce3;
  border-bottom: 1px solid #d7dce3;
  background-image: linear-gradient(45deg, #d7dce3 25%, transparent 25%, transparent 50%, #d7dce3 50%, #d7dce3 75%, transparent 75%, transparent);
  background-size: 10px 10px;
  background-color: #f8fafc;
}

.arrow {
  color: #25a4ff;
  width: 90px;
  min-width: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.rectangle {
  min-width: 150px;
  min-height: 96px;
  max-width: 240px;
  background: linear-gradient(135deg, var(--color-primary), #3f7ee8);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
  padding: 18px 12px;
  border-radius: 16px;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.18);
  word-break: break-word;
  line-height: 1.2;
}

.rectangle--first {
  max-width: 170px;
}

/* info table */
.content .info-table {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 18px;
  width: max-content;
  min-width: 100%;
  padding: 8px 0 4px;
}

.info-table table {
  border-collapse: separate;
  border-spacing: 0;
  font-family: Arial, sans-serif;
  font-size: 14px;
  overflow: hidden;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  background: #fff;
}

.info-table th {
  border: 1px solid #d7dce3;
  padding: 10px 14px;
  text-align: left;
  background-color: #f8fafc;
  color: #0f172a;
  white-space: nowrap;
  font-weight: 700;
}

.info-table td {
  border: 1px solid #d7dce3;
  padding: 10px;
  text-align: center;
  min-width: 56px;
  background: #fff;
}

.hoursSummary {
  min-width: 170px;
  background: #fff;
  border: 1px solid #d7dce3;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hoursSummary p {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #0f172a;
  text-align: center;
}

.hoursSummary__extra {
  padding-bottom: 6px;
}

.hoursSummary__divider {
  min-height: 2px;
  background-color: #0f172a;
  width: 100%;
  opacity: 0.3;
}

/* caption */
.content .caption {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 20px;
  width: 100%;
}

.legendTable {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  max-width: 760px;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  background: #fff;
}

.caption td {
  border: 1px solid #d7dce3;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  width: 350px;
  background: #fff;
}

.legendItem {
  display: flex;
  align-items: center;
  gap: 12px;
}

.caption span {
  flex: 1;
  text-align: left;
  line-height: 1.2;
  color: #1f2937;
}

.caption .color-box {
  width: 80px;
  min-width: 80px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #000;
  font-weight: 700;
  border: 1px solid #000;
  border-radius: 6px;
}

.caption .pattern-box {
  width: 80px;
  min-width: 80px;
  height: 24px;
  display: inline-block;
  background-size: 10px 10px;
  border: 1px solid #000;
  border-radius: 6px;
}

/* curriculum */
.curriculumTable table {
  font-family: Arial, sans-serif;
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  min-width: 600px;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}

.curriculumTable th,
.curriculumTable td {
  border: 1px solid #d7dce3;
  padding: 14px 10px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  background: #fff;
}

.curriculumTable th {
  background: linear-gradient(135deg, #03aef3, #0284c7);
  color: white;
}

/* helpers */
.margin-adjustment {
  margin-top: -12px;
}

.rotate-left {
  transform: rotate(180deg);
  display: inline-block;
}

/* tablet */
@media (max-width: 1024px) {
  .content .graph {
    padding: 16px;
    gap: 10px;
  }

  .block {
    min-width: 94px;
    min-height: 180px;
  }

  .rectangle {
    min-width: 130px;
    min-height: 88px;
    max-width: 190px;
    padding: 14px 10px;
    font-size: 14px;
  }

  .arrow {
    width: 65px;
    min-width: 50px;
  }

  .type {
    font-size: 13px;
  }

  .hoursSummary p {
    font-size: 16px;
  }
}

/* mobile */
@media (max-width: 768px) {
  .content {
    gap: 16px;
  }

  .content .graph {
    padding: 10px;
    gap: 8px;
  }

  .block {
    min-width: 76px;
    min-height: 150px;
  }

  .rectangle {
    min-width: 110px;
    min-height: 72px;
    max-width: 150px;
    padding: 12px 8px;
    border-radius: 12px;
    font-size: 12px;
  }

  .arrow {
    width: 42px;
    min-width: 34px;
  }

  .type {
    font-size: 11px;
    padding: 6px;
  }

  .content .info-table {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    min-width: unset;
  }

  .info-table table {
    font-size: 12px;
  }

  .info-table th,
  .info-table td {
    padding: 8px 6px;
  }

  .hoursSummary {
    width: 100%;
    min-width: unset;
  }

  .hoursSummary p {
    font-size: 15px;
    text-align: left;
  }

  .content .caption {
    flex-direction: column;
    align-items: stretch;
  }

  .caption td {
    width: auto;
    padding: 10px;
  }

  .legendItem {
    align-items: flex-start;
  }

  .caption .color-box,
  .caption .pattern-box {
    width: 60px;
    min-width: 60px;
    height: 22px;
  }

  .caption span {
    font-size: 12px;
  }

  .curriculumTable table {
    min-width: 480px;
  }

  .curriculumTable th,
  .curriculumTable td {
    font-size: 12px;
    padding: 10px 6px;
  }
}

/* small mobile */
@media (max-width: 480px) {
  .block {
    min-width: 66px;
    min-height: 128px;
  }

  .rectangle {
    min-width: 96px;
    min-height: 62px;
    max-width: 120px;
    font-size: 11px;
    padding: 10px 6px;
  }

  .arrow {
    width: 34px;
    min-width: 28px;
  }

  .type {
    font-size: 10px;
    padding: 4px;
  }

  .hoursSummary p {
    font-size: 14px;
  }

  .curriculumTable table {
    min-width: 420px;
  }
}
</style>
