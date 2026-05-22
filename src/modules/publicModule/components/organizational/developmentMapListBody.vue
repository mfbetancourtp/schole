<template>
  <div class="DevelopmentMapList__body_content">
    <div class="Body__content_subjects" :style="{ background: colors ?? '#ef235e' }">
      <div class="Containter__content">
        <div class="subjectsTag__number">{{ number }}</div>
        <div class="subjectsTag__name">{{ data.name }}</div>
        <!-- <div class="Content__subjectsTag"></div> -->
      </div>
    </div>
    <div class="Body__content_curses">
      <div v-for="subjects in data.subjects" :key="subjects.id" class="Subjects__card">
        <div class="Subjects__card_title" :title="subjects.abbreviation" :style="{ background: colors }">
          <span class="card_title">{{ getShortenedTitle(subjects.abbreviation ?? subjects.name ?? '') }}</span>
        </div>
        <div class="Subjects__card_body" :class="{ completed: subjects.completed === true }">
          <div class="card_body">
            <p>{{ subjects.name }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType } from 'vue';

import { DegreesDto } from '../../dtos/organizational/developmentMap.dto';

export default defineComponent({
  name: 'developmentMapListBody',

  components: {},
  props: {
    data: {
      type: Object as PropType<DegreesDto | any>,
    },
    colors: {
      type: String,
    },
    number: {
      type: Number,
    },
  },

  setup() {
    onMounted(async () => {});

    const getShortenedTitle = (title: string) => {
      if (title.length > 10) {
        return title.slice(0, 10) + '...';
      } else {
        return title;
      }
    };

    return { getShortenedTitle };
  },
});
</script>
<style scoped>
.DevelopmentMapList__body_content {
  display: flex;
  gap: var(--gap-1);
  flex-direction: row;
}

.DevelopmentMapList__body {
  display: flex;
  flex-direction: column;
  gap: var(--gap-2);
}

.Containter__content {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  border-radius: 4px;
  margin: auto;
}

.Body__content_subjects {
  width: 90px;
  max-height: 175px;
  border-radius: 4px;
  background-color: v-bind(colors);
  border-bottom: 40px solid white;
  border-right: 40px solid transparent;
  border-left: 40px solid transparent;
}

.Content__subjectsTag {
  display: flex;
  width: 0px;
  height: 60px;
  border-left: 30px solid v-bind(colors);
  border-right: 30px solid v-bind(colors);
  border-bottom: 10px solid var(--color-light);
  align-items: center;
}

.subjectsTag__number {
  color: var(--color-light);
  left: 5px;
  font-size: 3rem;
}

.subjectsTag__name {
  text-align: center;
  font-size: 0.8rem;
  color: white;
  font-weight: 600;
  line-height: 13px;
}

.Subjects__cards {
  display: flex;
  gap: var(--gap-2);
  flex-wrap: wrap;
}

.Subjects__card {
  width: 45%;
  display: flex;
  flex-direction: column;
  background-color: var(--color-light);
  border-radius: 4px;
  box-shadow: 1px 2px 6px rgba(0, 0, 0, 0.45);
}

.Subjects__card_title {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  border-radius: 4px 4px 0px 0px;
  background-color: var(--color-primary);
  color: var(--color-light);
  padding: var(--padding-2);
  line-height: var(--line-height-1);
}

.card_title {
  font-weight: var(--font-weight-semibold);
  text-align: center;
  font-size: var(--font-size-1);
}

.card_body {
  display: flex;
  font-size: var(--font-size-1);
  padding-left: var(--padding-3);
  padding-right: var(--padding-3);
  padding-top: var(--padding-1);
  flex: 1 1;
  justify-content: center;
}

.Body__content_curses {
  width: calc(100% - 90px);
  display: flex;
  flex-wrap: wrap;
  gap: var(--gap-2);
}

.completed {
  background-color: rgb(71, 255, 95);
}

@media (min-width: 768px) {
  .Subjects__card {
    width: 150px;
  }
}

@media (min-width: 992px) {
  .Subjects__card {
    width: 135px;
  }
}

@media (min-width: 1200px) {
  .Subjects__card {
    width: 150px;
  }
}

@media print {
  .DevelopmentMapList__body_content {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .Subjects__card {
    max-width: 30%;
  }
}
</style>
