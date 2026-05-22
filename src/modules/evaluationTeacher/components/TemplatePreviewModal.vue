<template>
  <AppDrawer :isVisible="isVisible" size="xxl" @update:isVisible="$emit('update:isVisible', $event)" :closeOnOverlay="true" :showCloseButton="true">
    <template #head>
      <div class="prev-head">
        <div class="prev-head__iconWrap">
          <svg class="prev-head__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7z" />
            <polyline points="14,2 14,8 20,8" />
            <line x1="9" y1="13" x2="15" y2="13" />
            <line x1="9" y1="17" x2="13" y2="17" />
          </svg>
        </div>
        <div class="prev-head__content">
          <h2 class="prev-head__title">Vista Previa de Plantilla</h2>
          <p class="prev-head__subtitle">
            <svg class="prev-head__subtitleIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            {{ templateData?.name || 'Sin nombre' }}
          </p>
        </div>
      </div>
    </template>

    <template #body>
      <div class="preview-shell">
        <aside class="preview-sidebar" v-if="dimensions.length">
          <div class="preview-sidebar__title">Dimensiones</div>
          <div class="preview-sidebar__meta">{{ dimensions.length }} • {{ totalQuestions }} preguntas</div>
          <ul class="preview-dims">
            <li v-for="(dim, idx) in dimensions" :key="dim.id || idx" :class="['preview-dim', { 'is-active': idx === activeDimIndex }]" @click="selectDimension(idx)">
              <div class="preview-dim__index">{{ idx + 1 }}</div>
              <div>
                <div class="preview-dim__name">
                  {{ dim.name || 'Dimensión ' + (idx + 1) }}
                </div>
                <div class="preview-dim__meta">{{ dim.weight }}% • {{ (dim.questions || []).length }} preguntas</div>
              </div>
            </li>
          </ul>
        </aside>

        <main class="preview-main">
          <div class="preview-info">
            <div class="info-row">
              <div class="info-label">Plantilla</div>
              <div class="info-val">
                {{ templateData?.name || 'Sin nombre' }}
              </div>
            </div>
            <div class="preview-nav">
              <button class="nav-btn" @click="prevDimension" :disabled="activeDimIndex === 0">←</button>
              <div class="nav-count">{{ activeDimIndex + 1 }} / {{ Math.max(dimensions.length, 1) }}</div>
              <button class="nav-btn" @click="nextDimension" :disabled="activeDimIndex >= dimensions.length - 1">→</button>
            </div>
          </div>

          <section class="preview-dimension" v-if="dimensions[activeDimIndex]" :data-dim-index="activeDimIndex">
            <div class="dimension-header">
              <div class="dimension-left">
                <div class="dimension-index">{{ activeDimIndex + 1 }}</div>
                <div>
                  <h3 class="dimension-title">
                    {{ dimensions[activeDimIndex].name }}
                  </h3>
                  <p class="dimension-desc">
                    {{ dimensions[activeDimIndex].description || '' }}
                  </p>
                </div>
              </div>
              <div class="dimension-weight">{{ dimensions[activeDimIndex].weight }}%</div>
            </div>

            <div class="questions-list">
              <article v-for="(q, qi) in dimensions[activeDimIndex].questions || []" :key="qi" :data-q="activeDimIndex + '-' + qi" class="question-card">
                <div class="question-card__head">
                  <div class="question-number">{{ qi + 1 }}</div>
                  <div>
                    <div class="question-text">
                      {{ q.text || 'Pregunta ' + (qi + 1) }}
                    </div>
                    <div class="question-tags">
                      <span class="tag" v-if="q.type">{{ q.type }}</span>
                      <span class="tag tag--warn" v-if="q.required">Obligatoria</span>
                    </div>
                  </div>
                </div>

                <div class="question-card__body">
                  <div v-if="q.type === 'likert'" class="likert-row">
                    <div v-for="n in q.scale || 5" :key="n" class="likert-item">
                      <div class="likert-dot"></div>
                      <div class="likert-num">{{ n }}</div>
                    </div>
                  </div>
                  <div v-else>
                    <textarea class="open-input" disabled placeholder="Respuesta abierta..." rows="3"></textarea>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </main>
      </div>
    </template>

    <template #footer>
      <div class="preview-footer">
        <AppButton variant="secondary" outlined @click="$emit('update:isVisible', false)">Cerrar</AppButton>
      </div>
    </template>
  </AppDrawer>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';

const props = defineProps<{ isVisible: boolean; templateData: any }>();
const emit = defineEmits(['update:isVisible']);

const dimensions = computed(() => props.templateData?.dimensions || []);
const totalQuestions = computed(() => dimensions.value.reduce((s, d) => s + ((d.questions && d.questions.length) || 0), 0));
const activeDimIndex = ref(0);
const shownQuestionsFor = ref<number | null>(null);

function selectDimension(idx: number) {
  activeDimIndex.value = idx;
  shownQuestionsFor.value = null;
  nextTick(() => {
    const el = document.querySelector(`[data-dim-index="${idx}"]`);
    if (el)
      (el as HTMLElement).scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
  });
}

function goToQuestion(dimIdx: number, qIdx: number) {
  shownQuestionsFor.value = dimIdx;
  nextTick(() => {
    const el = document.querySelector(`[data-q="${dimIdx}-${qIdx}"]`);
    if (el)
      (el as HTMLElement).scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
  });
}

function prevDimension() {
  if (activeDimIndex.value > 0) selectDimension(activeDimIndex.value - 1);
}

function nextDimension() {
  if (activeDimIndex.value < dimensions.value.length - 1) selectDimension(activeDimIndex.value + 1);
}

function printPreview() {
  window.print();
}

function onKeyDown(e: KeyboardEvent) {
  if (!props.isVisible) return;
  if (e.key === 'ArrowLeft') prevDimension();
  if (e.key === 'ArrowRight') nextDimension();
}

onMounted(() => window.addEventListener('keydown', onKeyDown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeyDown));
</script>

<style scoped>
/* ===== DRAWER HEAD (alineado con TemplateEditorModal) ===== */
.prev-head {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  width: 100%;
}

.prev-head__iconWrap {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.prev-head__icon {
  width: 26px;
  height: 26px;
  color: #fff;
}

.prev-head__content {
  flex: 1;
  min-width: 0;
}

.prev-head__title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 4px;
  letter-spacing: -0.02em;
}

.prev-head__subtitle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

.prev-head__subtitleIcon {
  width: 14px;
  height: 14px;
  opacity: 0.8;
  flex-shrink: 0;
}

/* ===== LAYOUT ===== */
.preview-shell {
  display: flex;
  height: calc(100vh - 180px);
  overflow: hidden;
}

/* ===== SIDEBAR ===== */
.preview-sidebar {
  width: 280px;
  flex-shrink: 0;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-sidebar__title {
  font-size: 13px;
  font-weight: 700;
  color: #334155;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 16px 20px 4px;
  margin: 0;
}

.preview-sidebar__meta {
  font-size: 12px;
  color: #64748b;
  padding: 4px 20px 14px;
  margin: 0;
  border-bottom: 1px solid #e2e8f0;
}

.preview-dims {
  list-style: none;
  padding: 10px 12px 12px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  flex: 1;
}

.preview-dim {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 12px;
  background: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preview-dim:hover {
  border-color: #cbd5e1;
}

.preview-dim.is-active {
  border-color: #2563eb;
  background: #eff6ff;
}

.preview-dim__index {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1d4ed8;
  font-weight: 700;
  font-size: 12px;
  flex-shrink: 0;
}

.preview-dim.is-active .preview-dim__index {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #fff;
}

.preview-dim__name {
  font-weight: 600;
  font-size: 13px;
  color: #0f172a;
  line-height: 1.4;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-dim__meta {
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}

/* ===== MAIN ===== */
.preview-main {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  background: #fff;
  display: flex;
  flex-direction: column;
}

/* Panel header (sticky, igual que tem-panel__header) */
.preview-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 22px;
  background: linear-gradient(135deg, #fafbfc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.info-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.info-label {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

.info-val {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}

.preview-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  font-size: 14px;
  transition: all 0.15s ease;
}

.nav-btn:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.nav-count {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  min-width: 40px;
  text-align: center;
}

/* ===== DIMENSION SECTION ===== */
.preview-dimension {
  padding: 18px 22px;
}

.dimension-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #fafbfc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 16px;
}

.dimension-left {
  display: flex;
  gap: 14px;
  align-items: center;
  flex: 1;
}

.dimension-index {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #fff;
  border-radius: 12px;
  font-weight: 700;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  flex-shrink: 0;
}

.dimension-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
}

.dimension-desc {
  margin: 3px 0 0;
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;
}

.dimension-weight {
  font-weight: 700;
  font-size: 12px;
  color: #1d4ed8;
  background: #dbeafe;
  padding: 4px 12px;
  border-radius: 999px;
  white-space: nowrap;
}

/* ===== QUESTION CARDS ===== */
.questions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.question-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  transition: border-color 0.2s ease;
}

.question-card:hover {
  border-color: #cbd5e1;
}

.question-card__head {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 12px;
}

.question-number {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1d4ed8;
  border-radius: 8px;
  font-weight: 700;
  font-size: 12px;
  flex-shrink: 0;
}

.question-text {
  font-weight: 600;
  font-size: 14px;
  color: #0f172a;
  line-height: 1.5;
  margin-bottom: 6px;
}

.question-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  background: #f1f5f9;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 11px;
  color: #475569;
}

.tag--warn {
  background: #fef2f2;
  color: #ef4444;
}

.question-card__body {
  padding: 14px;
  background: #fff;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
}

/* ===== LIKERT ===== */
.likert-row {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
}

.likert-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.likert-dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #2563eb;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.15);
  transition: all 0.2s ease;
  cursor: default;
}

.likert-num {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

/* ===== OPEN TEXTAREA ===== */
.open-input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  background: #f8fafc;
  font-size: 14px;
  color: #94a3b8;
  resize: none;
  min-height: 80px;
}

/* ===== FOOTER ===== */
.preview-footer {
  display: flex;
  justify-content: flex-end;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 900px) {
  .preview-shell {
    flex-direction: column;
    height: auto;
  }
  .preview-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }
  .preview-dims {
    max-height: 180px;
  }
  .likert-row {
    gap: 10px;
  }
  .likert-dot {
    width: 34px;
    height: 34px;
  }
}

@media (max-width: 768px) {
  .prev-head {
    gap: 12px;
  }
  .prev-head__iconWrap {
    width: 40px;
    height: 40px;
  }
  .prev-head__title {
    font-size: 17px;
  }
  .prev-head__subtitle {
    font-size: 11px;
  }
  .preview-dimension {
    padding: 14px 16px;
  }
}

/* ===== ANIMACIONES ===== */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.preview-dimension {
  animation: fadeIn 0.25s ease-out;
}

.question-card {
  animation: fadeIn 0.3s ease-out backwards;
}

.question-card:nth-child(1) {
  animation-delay: 0.04s;
}
.question-card:nth-child(2) {
  animation-delay: 0.08s;
}
.question-card:nth-child(3) {
  animation-delay: 0.12s;
}
</style>
