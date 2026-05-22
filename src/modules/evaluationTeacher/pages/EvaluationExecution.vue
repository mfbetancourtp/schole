<template>
  <AppBaseList title="Realizar Evaluación">
    <template #actions>
      <AppButton color="white" outlined @click="router.push({ name: 'evaluation-teacher.MyEvaluations' })" style="color: white"> <AppIcon icon="arrow-left" /> Volver a Mis Evaluaciones </AppButton>
    </template>

    <template #content>
      <div class="eval-exec-page">
        <!-- Loading -->
        <div v-if="loading" class="loading-wrapper">
          <AppLoading />
        </div>

        <!-- Out of Date Range -->
        <template v-else-if="isOutOfDateRange">
          <div class="error-wrapper">
            <div class="error-card card">
              <div class="error-card__icon">
                <AppIcon icon="circle-exclamation" />
              </div>
              <h2 class="error-card__title">Evaluación no disponible</h2>
              <p class="error-card__sub">Lo sentimos, no puedes completar esta evaluación fuera de su período válido. Verifica que la fecha actual esté dentro del rango establecido.</p>
              <AppButton color="primary" @click="router.push({ name: 'evaluation-teacher.MyEvaluations' })"> Volver al listado </AppButton>
            </div>
          </div>
        </template>

        <!-- Completed screen -->
        <template v-else-if="completed">
          <div class="completed-wrapper">
            <div class="completed-card card">
              <div class="completed-card__check">
                <AppIcon icon="check" />
              </div>
              <h2 class="completed-card__title">Tu opinión ha sido enviada con éxito.</h2>
              <p class="completed-card__sub">Gracias por tomarte el tiempo de evaluar a tu docente. Tu retroalimentación es muy valiosa para mejorar la calidad educativa.</p>
              <p v-if="hasPendingAfterFinish" class="completed-card__pending">Tienes más evaluaciones pendientes, continúa y complétalas todas.</p>
              <AppButton color="primary" @click="router.push({ name: 'evaluation-teacher.MyEvaluations' })"> Volver al listado </AppButton>
            </div>
          </div>
        </template>

        <!-- Evaluation in progress -->
        <template v-else>
          <!-- Info card -->
          <div class="eval-header card">
            <div class="eval-header__top">
              <div class="eval-header__meta">
                <div class="eval-header__title">{{ evaluationName }}</div>
                <div class="eval-header__sub">
                  <span>Docente: {{ teacherName }}</span>
                  <span class="eval-header__divider">·</span>
                  <span>{{ subjectName }}</span>
                </div>
                <div class="eval-header__dim-row">
                  <span class="dim-name">{{ currentDimension?.name }}</span>
                  <span class="dim-counter">Dimensión {{ currentDimensionIndex + 1 }} de {{ dimensions.length }}</span>
                </div>
              </div>
              <div class="eval-header__progress-block">
                <div class="eval-progress-row">
                  <span class="eval-progress-count">{{ answeredCount }} de {{ totalQuestionsCount }} preguntas respondidas</span>
                </div>
                <div class="eval-progress-bar" role="presentation">
                  <div class="eval-progress-fill" :style="{ width: progressPercent + '%' }" role="progressbar" :aria-valuenow="progressPercent" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Questions list -->
          <div class="questions-list">
            <div
              v-for="(question, qIndex) in currentDimension?.questions"
              :key="question.id"
              :ref="(el) => setQuestionRef(el, qIndex)"
              class="question-card"
              :class="{ 'question-card--answered': isAnswered(question.id) }"
            >
              <div v-if="isAnswered(question.id)" class="q-check" aria-label="Pregunta respondida">
                <AppIcon icon="check" />
              </div>

              <div class="q-header">
                <div class="q-number" aria-hidden="true">{{ qIndex + 1 }}</div>
                <div class="q-body">
                  <p class="q-description">{{ question.description }}</p>
                  <span v-if="question.isRequired" class="q-required">* Campo obligatorio</span>
                </div>
              </div>

              <div v-if="question.typeQuestion === 'scale'" class="q-options" role="radiogroup" :aria-label="question.description">
                <label
                  v-for="option in question.options"
                  :key="option.id"
                  class="q-option"
                  :class="{
                    'q-option--selected': answers[question.id]?.score === option.value,
                  }"
                >
                  <input
                    type="radio"
                    :name="`question-${question.id}`"
                    :value="option.value"
                    :checked="answers[question.id]?.score === option.value"
                    class="q-option__input"
                    @change="setScaleAnswer(question.id, option.value, option.label)"
                  />
                  <span
                    class="q-option__value"
                    :class="{
                      'q-option__value--selected': answers[question.id]?.score === option.value,
                    }"
                    >{{ option.value }}</span
                  >
                  <span class="q-option__label">{{ option.label }}</span>
                </label>
              </div>

              <div v-else class="q-text">
                <textarea
                  class="form-control"
                  rows="3"
                  :value="answers[question.id]?.answer ?? ''"
                  placeholder="Escribe tu respuesta aquí..."
                  @input="setTextAnswer(question.id, ($event.target as HTMLTextAreaElement).value)"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Sticky nav card -->
          <div class="eval-nav-card">
            <div class="eval-nav">
              <AppButton outlined :disabled="currentDimensionIndex === 0" @click="previousDimension()"> <AppIcon icon="arrow-left" /> Dimensión anterior </AppButton>

              <div class="eval-nav__right">
                <span v-if="!canProceed" class="eval-nav__hint"> Responde todas las preguntas obligatorias para continuar </span>
                <AppButton color="primary" :disabled="!canProceed || saving" @click="isLastDimension ? finishEvaluation() : nextDimension()">
                  {{ isLastDimension ? 'Finalizar evaluación' : 'Siguiente dimensión' }}
                </AppButton>
              </div>
            </div>
          </div>
        </template>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, nextTick, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import { useHeaderStore } from '../../../stores/header.store';
import { GetEvaluationQuestionsService } from '../services/getEvaluationQuestions.service';
import { CreateEvaluationAnswersService } from '../services/createEvaluationAnswers.service';
import { GetPendingSummaryService } from '../services/getPendingSummary.service';
import { PendingEvaluationsService } from '../../../shared/services/pendingEvaluations.service';
import type { EvaluationDimensionDto, EvaluationQuestionDto, SaveAnswerItemDto } from '../dtos/evaluationQuestions.dto';

type AnswerEntry = { score?: number; answer: string };

export default defineComponent({
  name: 'EvaluationExecution',
  components: {
    AppBaseList,
    AppButton,
    AppIcon,
    AppLoading,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const headerStorage = useHeaderStore();
    headerStorage.module = { name: 'Evaluación Docente', url: '' };
    headerStorage.moduleItem = { name: 'Mis Evaluaciones', url: '' };
    headerStorage.moduleSubItem = { name: 'Realizar Evaluación', url: '' };

    const loading = ref(true);
    const saving = ref(false);
    const completed = ref(false);
    const hasPendingAfterFinish = ref(false);
    const isOutOfDateRange = ref(false);
    const evaluationName = ref('');
    const teacherName = ref('');
    const subjectName = ref('');
    const dimensions = ref<EvaluationDimensionDto[]>([]);
    const currentDimensionIndex = ref(0);
    const answers = reactive<Record<number, AnswerEntry>>({});
    const questionRefs = ref<(HTMLElement | null)[]>([]);

    const assignmentId = computed(() => Number(route.params.assignmentId));

    const currentDimension = computed<EvaluationDimensionDto | undefined>(() => dimensions.value[currentDimensionIndex.value]);

    const totalQuestionsCount = computed(() => dimensions.value.reduce((acc, dim) => acc + dim.questions.length, 0));

    const answeredCount = computed(() => Object.keys(answers).length);

    const progressPercent = computed(() => (totalQuestionsCount.value === 0 ? 0 : Math.round((answeredCount.value / totalQuestionsCount.value) * 100)));

    const canProceed = computed(() => {
      if (!currentDimension.value) return false;
      return currentDimension.value.questions.filter((q) => q.isRequired).every((q) => answers[q.id] !== undefined);
    });

    const isLastDimension = computed(() => currentDimensionIndex.value === dimensions.value.length - 1);

    function isAnswered(questionId: number): boolean {
      return !!answers[questionId];
    }

    function setQuestionRef(el: unknown, index: number) {
      questionRefs.value[index] = el as HTMLElement | null;
    }

    function setScaleAnswer(questionId: number, score: number, label: string) {
      answers[questionId] = { score, answer: label };
    }

    function setTextAnswer(questionId: number, text: string) {
      if (text.trim()) {
        answers[questionId] = { answer: text };
      } else {
        delete answers[questionId];
      }
    }

    function prePopulateAnswers(dims: EvaluationDimensionDto[]) {
      for (const dim of dims) {
        for (const q of dim.questions) {
          if (q.response) {
            const hasScore = q.response.score !== undefined;
            const hasAnswer = !!q.response.answer && q.response.answer.trim() !== '';
            if (hasScore || hasAnswer) {
              answers[q.id] = {
                score: q.response.score,
                answer: q.response.answer ?? '',
              };
            }
          }
        }
      }
    }

    function findFirstIncompleteDimensionIndex(dims: EvaluationDimensionDto[]): number {
      const idx = dims.findIndex((dim) =>
        dim.questions.some((q) => {
          if (!q.response) return true;
          const hasScore = q.response.score !== undefined;
          const hasAnswer = !!q.response.answer && q.response.answer.trim() !== '';
          return !hasScore && !hasAnswer;
        })
      );
      return idx === -1 ? dims.length - 1 : idx;
    }

    async function scrollToFirstUnanswered() {
      await nextTick();
      const firstUnansweredIndex = currentDimension.value?.questions.findIndex((q) => !answers[q.id]) ?? -1;
      if (firstUnansweredIndex >= 0 && questionRefs.value[firstUnansweredIndex]) {
        questionRefs.value[firstUnansweredIndex]?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }

    async function loadData() {
      loading.value = true;
      try {
        const service = new GetEvaluationQuestionsService();
        const response = await service.run(assignmentId.value);
        const data = response.data;

        evaluationName.value = data.evaluation.name;
        teacherName.value = data.teacher.fullName;
        subjectName.value = data.subject.name;
        dimensions.value = data.dimensions;

        // Validar rango de fechas: API primero, sessionStorage como fallback
        const now = new Date();
        let startDateStr = data.evaluation?.startDate;
        let endDateStr = data.evaluation?.endDate;

        if (!startDateStr || !endDateStr) {
          try {
            const storedDates = sessionStorage.getItem(`evaluation_dates_${assignmentId.value}`);
            if (storedDates) {
              const parsed = JSON.parse(storedDates);
              if (!startDateStr) startDateStr = parsed.startDate;
              if (!endDateStr) endDateStr = parsed.endDate;
            }
          } catch {
            // silent
          }
        }

        const startDate = startDateStr ? new Date(startDateStr) : null;
        const endDate = endDateStr ? new Date(endDateStr) : null;

        if (startDate && now < startDate) {
          isOutOfDateRange.value = true;
          return;
        }

        if (endDate && now > endDate) {
          isOutOfDateRange.value = true;
          return;
        }

        isOutOfDateRange.value = false;
        prePopulateAnswers(data.dimensions);
        currentDimensionIndex.value = findFirstIncompleteDimensionIndex(data.dimensions);

        await scrollToFirstUnanswered();
      } catch (error) {
        console.error('Error al cargar evaluación:', error);
      } finally {
        loading.value = false;
      }
    }

    async function saveCurrentDimensionAnswers() {
      if (!currentDimension.value) return;

      const responses: SaveAnswerItemDto[] = currentDimension.value.questions
        .filter((q: EvaluationQuestionDto) => answers[q.id] !== undefined)
        .map((q: EvaluationQuestionDto) => {
          const ans = answers[q.id];
          if (q.typeQuestion === 'scale') {
            return {
              dimensionQuestionId: q.id,
              score: ans.score,
              answer: ans.answer,
            };
          }
          return { dimensionQuestionId: q.id, answer: ans.answer };
        });

      const createService = new CreateEvaluationAnswersService();
      await createService.run({ assignmentId: assignmentId.value, responses });
    }

    async function nextDimension() {
      saving.value = true;
      try {
        await saveCurrentDimensionAnswers();
        questionRefs.value = [];
        currentDimensionIndex.value++;
        await scrollToFirstUnanswered();
      } finally {
        saving.value = false;
      }
    }

    function previousDimension() {
      questionRefs.value = [];
      currentDimensionIndex.value--;
    }

    async function finishEvaluation() {
      saving.value = true;
      try {
        await saveCurrentDimensionAnswers();

        const pendingSummaryService = new GetPendingSummaryService();
        const summaryResponse = await pendingSummaryService.run();
        const pendingEvaluationsService = new PendingEvaluationsService();
        pendingEvaluationsService.set(summaryResponse.data);
        hasPendingAfterFinish.value = pendingEvaluationsService.hasRequiredPending();

        completed.value = true;
      } finally {
        saving.value = false;
      }
    }

    onMounted(loadData);

    return {
      loading,
      saving,
      completed,
      hasPendingAfterFinish,
      isOutOfDateRange,
      evaluationName,
      teacherName,
      subjectName,
      dimensions,
      currentDimensionIndex,
      currentDimension,
      totalQuestionsCount,
      answeredCount,
      progressPercent,
      canProceed,
      isLastDimension,
      answers,
      isAnswered,
      setQuestionRef,
      setScaleAnswer,
      setTextAnswer,
      nextDimension,
      previousDimension,
      finishEvaluation,
      router,
    };
  },
});
</script>

<style scoped lang="scss">
.eval-exec-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 100px;
}

/* ── Info header card ── */
.eval-header {
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 6px 18px rgba(14, 30, 64, 0.08);

  &__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  &__title {
    font-size: 22px;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 6px;
  }

  &__sub {
    font-size: 15px;
    color: #6b7280;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 10px;
  }

  &__divider {
    color: #d1d5db;
  }

  &__dim-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;

    .dim-name {
      font-size: 16px;
      font-weight: 600;
      color: #374151;
    }

    .dim-counter {
      font-size: 14px;
      color: var(--color-primary, #4f46e5);
      background: rgba(var(--color-primary-rgb, 79, 70, 229), 0.1);
      padding: 3px 10px;
      border-radius: 999px;
      white-space: nowrap;
    }
  }

  &__progress-block {
    flex-shrink: 0;
    min-width: 220px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}

.eval-progress-row {
  display: flex;
  justify-content: flex-end;
}

.eval-progress-count {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  text-align: right;
}

.eval-progress-bar {
  background: #e9eafc;
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
}

.eval-progress-fill {
  height: 8px;
  background: linear-gradient(90deg, #6b46ff, #8b5cf6);
  border-radius: 999px;
  transition: width 0.3s ease;
}

/* ── Questions ── */
.questions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-card {
  position: relative;
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 14px rgba(14, 30, 64, 0.06);
}

.q-check {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #ecfdf5;
  color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}

.q-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 16px;
}

.q-number {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(var(--color-secondary-rgb, 229, 231, 235), 0.4);
  color: var(--color-primary, #4f46e5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
}

.q-body {
  flex: 1;
  padding-right: 40px;
}

.q-description {
  margin: 0;
  font-size: 16px;
  color: #1f2937;
  line-height: 1.55;
}

.q-required {
  display: block;
  margin-top: 5px;
  font-size: 13px;
  color: #dc2626;
  font-weight: 500;
}

.q-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.q-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;

  &:hover {
    background: rgba(var(--color-primary-rgb, 79, 70, 229), 0.04);
    border-color: var(--color-primary, #4f46e5);
  }

  &--selected {
    background: rgba(var(--color-primary-rgb, 79, 70, 229), 0.08);
    border-color: var(--color-primary, #4f46e5);

    .q-option__label {
      color: var(--color-primary, #4f46e5);
      font-weight: 600;
    }
  }

  &__input {
    flex-shrink: 0;
    accent-color: var(--color-primary, #4f46e5);
  }

  &__value {
    flex-shrink: 0;
    background: #f3f4f6;
    color: var(--color-primary, #4f46e5);
    font-size: 14px;
    font-weight: 700;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, color 0.15s;

    &--selected {
      background: var(--color-primary, #4f46e5);
      color: #fff;
    }
  }

  &__label {
    font-size: 15px;
    color: #374151;
    cursor: pointer;
  }
}

.q-text {
  .form-control {
    width: 100%;
    resize: vertical;
    font-size: 15px;
  }
}

/* ── Sticky nav card ── */
.eval-nav-card {
  position: sticky;
  bottom: 5px;
  z-index: 10;
  background: #fff;
  border-radius: 12px;
  padding: 12px 20px;
  box-shadow: 0 -4px 18px rgba(14, 30, 64, 0.08);
}

.eval-nav {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;

  &__right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
  }

  &__hint {
    font-size: 13px;
    color: #9ca3af;
  }
}

/* ── Completed screen ── */
.completed-wrapper {
  display: flex;
  justify-content: center;
  padding: 32px 0;
}

.completed-card {
  background: #fff;
  border-radius: 16px;
  padding: 40px 32px;
  box-shadow: 0 6px 24px rgba(14, 30, 64, 0.1);
  max-width: 520px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;

  &__check {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: #ecfdf5;
    color: #10b981;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
  }

  &__title {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #1f2937;
  }

  &__sub {
    margin: 0;
    font-size: 15px;
    color: #6b7280;
    line-height: 1.6;
  }

  &__pending {
    margin: 0;
    font-size: 14px;
    color: #d97706;
    background: #fff7ed;
    border: 1px solid #fed7aa;
    border-radius: 8px;
    padding: 10px 16px;
    width: 100%;
  }
}

/* ── Error Card ── */
.error-card {
  background: #fff;
  border-radius: 16px;
  padding: 40px 32px;
  box-shadow: 0 6px 24px rgba(14, 30, 64, 0.1);
  max-width: 520px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;

  &__icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: #fef2f2;
    color: #dc2626;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
  }

  &__title {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #1f2937;
  }

  &__sub {
    margin: 0;
    font-size: 15px;
    color: #6b7280;
    line-height: 1.6;
  }
}

.error-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  min-height: 400px;
}

.completed-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  min-height: 400px;
}

/* ── Misc ── */
.loading-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
}

@media (max-width: 768px) {
  .eval-header__top {
    flex-direction: column;
    gap: 12px;
  }

  .eval-header__progress-block {
    min-width: unset;
    width: 100%;
  }

  .eval-progress-row {
    justify-content: flex-start;
  }

  .eval-progress-count {
    text-align: left;
  }

  .eval-nav {
    flex-direction: column;
    align-items: stretch;

    &__right {
      align-items: stretch;
    }
  }

  .completed-card {
    padding: 28px 20px;
  }
}
</style>
