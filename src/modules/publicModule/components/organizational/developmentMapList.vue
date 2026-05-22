<template>
  <AppLoading v-if="loading" />

  <div v-else>
    <div class="DevelopmentMapList__header">
      <div class="Header__figure_content">
        <div class="figure"></div>
        <div class="figure2__content"></div>
        <div class="figure_3"></div>
      </div>
      <div class="DevelopmentMapList__header_content">
        <div class="Header__content_titles">
          <div class="Content__titles_student">
            <h6 class="name-student">{{ dataDevelopmentMap.peopleNames }}</h6>
          </div>
          <div class="Content__titles_title">
            <h4 class="title">MAPA DE DESARROLLO</h4>
          </div>
        </div>
        <div class="Header__content_userInfo">
          <div class="User-info__values">
            <div class="Values__content">
              <span class="Values__content_item"
                >Avance:
                <span class="Content__item_value">{{ dataDevelopmentMap.completed.percentage }}</span>
              </span>
              <span class="Values__content_item"
                >Total:
                <span class="Content__item_value"
                  >{{ dataDevelopmentMap.completed.completedNoOptional }} de
                  {{ dataDevelopmentMap.completed.totalNoOptional }}
                  cursos</span
                >
              </span>
            </div>
          </div>
          <div class="UserInfo__data">
            <p class="Data__item_name">
              <span>Area</span>
              <span>Puesto</span>
              <span>Clave de Mapa</span>
            </p>
            <p class="Data__item_data">
              <span class="data">{{ dataDevelopmentMap.organizationalUnit ?? 'Sin Area' }}</span>
              <span class="data">{{ dataDevelopmentMap.organizationalJob ?? 'Sin Puesto' }}</span>
              <span class="data">{{ dataDevelopmentMap.codeMap ?? 'Sin Clave de Mapa' }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="DevelopmentMapList__body">
      <div class="pb-2" v-for="(degreed, index) in dataDevelopmentMap.degrees" :key="index">
        <DevelopmentMapListBody :data="degreed" :number="index + 1" :colors="colors[index]" />
        <div v-if="index < dataDevelopmentMap.degrees.length - 1" class="page-break-before"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import AppLoading from '../../../../shared/components/AppLoading.vue';
import DevelopmentMapListBody from './developmentMapListBody.vue';

import { GetDataDevelopmentMapService } from '../../services/organizational/getDataDevelopmentMap.service';

const getDataDevelopmentMapService = new GetDataDevelopmentMapService();

export default defineComponent({
  name: 'developmentMapList',
  props: {
    employeeId: {
      type: Number,
      required: true,
    },
    organizationalJobId: {
      type: Number,
      required: true,
    },
  },
  components: {
    AppLoading,
    DevelopmentMapListBody,
  },

  setup(props) {
    const { t } = useI18n();
    const title = 'Estructura organizacional';
    useMeta({ title: t(title) });
    const routes = [
      {
        name: 'Estructura organizacional',
        url: { name: 'organizational.organizationalStructure' },
      },
      {
        name: title,
      },
    ];
    const loading = ref(true);
    const colors = ['#a3e1f9', '#fbd017', '#5c6b74', '#2d903d', '#ef235e', '#a349a4', '#00cbcb', '#062354', '#0040c5'];
    const number = ref(Number);
    const dataDevelopmentMap = ref<any>();
    onMounted(async () => {
      try {
        dataDevelopmentMap.value = await getDataDevelopmentMapService.run(props.organizationalJobId, props.employeeId);
        loading.value = false;
      } catch (error) {
        console.log('this error onmounted', error);
        loading.value = false;
      }
    });
    watch(
      () => props.employeeId,
      async (valor) => {
        if (valor) {
          loading.value = true;
          dataDevelopmentMap.value = await getDataDevelopmentMapService.run(props.organizationalJobId, valor);
          loading.value = false;
        }
      }
    );
    watch(
      () => props.organizationalJobId,
      async (valor) => {
        if (valor) {
          loading.value = true;
          dataDevelopmentMap.value = await getDataDevelopmentMapService.run(valor, props.employeeId);
          loading.value = false;
        }
      }
    );

    return {
      title,
      routes,
      loading,
      colors,
      dataDevelopmentMap,
      number,
    };
  },
});
</script>
<style scoped>
.Header__figure_content {
  position: absolute;
  width: 100%;
  height: 100%;
}

.figure {
  top: 0;
  right: 0;
  position: absolute;
  width: 0;
  height: 0;
  border-right: 90px solid #76d097;
  border-bottom: 90px solid transparent;
}

.partFigure {
  top: 0;
  right: 0;
  position: absolute;
  width: 0;
  height: 0;
  border-right: 15px solid var(--color-light);
  border-bottom: 15px solid transparent;
}

.figure_3 {
  top: 0;
  right: 0;
  position: absolute;
  width: 0;
  height: 0;
  border-right: 45px solid #4a39b5;
  border-bottom: 45px solid transparent;
}

.DevelopmentMapList__header {
  position: relative;
}

.DevelopmentMapList__header_content {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--gap-1);
}

.Header__content_titles {
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  flex: 1;
}

.Header__content_userInfo {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: var(--gap-1);
  flex: 1;
}

.name-student {
  color: var(--color-primary);
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.05rem;
}

.Content__title_title {
  display: flex;
}

.title {
  display: flex;
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  letter-spacing: -0.05rem;
}

.Values__content {
  display: flex;
  flex-direction: row;
  gap: var(--gap-2);
}

.Values__content_item {
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

.Content__item_value {
  color: var(--color-dark);
  font-weight: inherit;
}

.UserInfo__data {
  display: flex;
  flex-direction: row;
  flex: 1 1;
  gap: var(--gap-1);
}

.Data__item_name {
  display: flex;
  margin-bottom: 0;
  color: var(--color-primary);
  flex-direction: column;
  font-size: var(--font-size-1);
  text-align: end;
  flex: 2;
}

.data__item_name > span {
  max-height: 1.5rem;
}

.Data__item_data {
  flex-direction: column;
  display: flex;
  flex: 6;
  gap: calc(var(--gap-1) - 0.4rem);
}

.data {
  display: flex;
  color: var(--color-light);
  background: var(--color-primary);
  max-height: 1.5rem;
  flex: 5;
  text-transform: capitalize;
  font-size: var(--font-size-1);
  justify-content: center;
}

@media (min-width: 768px) {
  .figure {
    border-right: 150px solid #76d097;
    border-bottom: 150px solid transparent;
    z-index: -1;
  }

  .figure_3 {
    border-right: 80px solid #4a39b5;
    border-bottom: 80px solid transparent;
    z-index: -1;
  }

  .DevelopmentMapList__header_content {
    flex-direction: row;
    justify-content: space-between;
    padding-left: var(--padding-3);
  }

  .Header__content_titles {
    max-width: 250px;
  }

  .Header__content_userInfo {
    max-width: 350px;
    margin-right: 8rem;
  }

  .Data__item_name {
    font-size: 0.5rem;
  }

  .data {
    font-size: 0.5rem;
  }
}

@media (min-width: 992px) {
  .Header__content_titles {
    max-width: 350px;
    text-align: center;
    padding: 0;
  }

  .Header__content_userInfo {
    max-width: 500px;
    min-width: 300px;
    margin-right: 10rem;
  }

  .figure {
    border-right: 200px solid #76d097;
    border-bottom: 200px solid transparent;
    z-index: -1;
  }

  .figure_3 {
    border-right: 110px solid #4a39b5;
    border-bottom: 110px solid transparent;
    z-index: -1;
  }

  .Data__item_name {
    font-size: var(--font-size-1);
  }

  .data {
    font-size: var(--font-size-1);
  }
}

@media (min-width: 1200px) {
  .Header__content_userInfo {
    max-width: 500px;
    min-width: 300px;
    margin-right: 14rem;
  }
}

@media print {
  .page-break-before {
    page-break-before: always;
    break-before: page;
  }
  .DevelopmentMapList__header_content {
    display: flex;
    flex-direction: initial;
    max-width: 94%;
  }
}
</style>
