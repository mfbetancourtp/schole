<template>
  <AppDrawer :isVisible="isVisible" size="xxl" @update:isVisible="emitUpdate" :closeOnOverlay="false" :showCloseButton="false" @overlay-click="handleOverlayClick">
    <!-- HEAD -->
    <template #head>
      <div class="tem-drawerHead">
        <div class="tem-drawerHead__iconWrap">
          <svg class="tem-drawerHead__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            <path d="M9 12h6M9 16h6" />
          </svg>
        </div>
        <div class="tem-drawerHead__content">
          <h2 class="tem-drawerHead__title">
            {{ template?.id ? 'Editar Plantilla' : 'Nueva Plantilla de Evaluación' }}
          </h2>
          <p class="tem-drawerHead__subtitle">
            <svg class="tem-drawerHead__subtitleIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            Configura dimensiones, preguntas y ponderaciones para tu evaluación
          </p>
        </div>
      </div>
    </template>

    <!-- BODY -->
    <template #body>
      <form class="tem-form" @submit.prevent="save">
        <div v-if="!canSave" class="tem-topAlert" role="status">
          <div class="tem-topAlert__inner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#92400e" stroke-width="2" style="flex-shrink: 0">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span class="tem-topAlert__text">{{ validationMessage }}</span>
          </div>
        </div>
        <div v-else class="tem-topAlert tem-topAlert--success" role="status">
          <div class="tem-topAlert__inner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2" style="flex-shrink: 0">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span class="tem-topAlert__text">{{ validationMessage }}</span>
          </div>
        </div>
        <div class="tem-layout">
          <!-- SIDEBAR - Navigation Panel -->
          <aside class="tem-sidebar">
            <div class="tem-sidebar__header">
              <h3 class="tem-sidebar__title">Estructura</h3>
              <span
                class="tem-sidebar__badge"
                :class="{
                  'tem-sidebar__badge--success': totalDimensionWeight === 100,
                }"
              >
                {{ totalDimensionWeight }}%
              </span>
            </div>

            <!-- Info card compact -->
            <div
              class="tem-sidebar__infoCard"
              :class="{
                'tem-sidebar__infoCard--active': activePanel === 'info',
              }"
              @click="activePanel = 'info'"
            >
              <div class="tem-sidebar__infoIcon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                </svg>
              </div>
              <div class="tem-sidebar__infoContent">
                <span class="tem-sidebar__infoTitle">Información General</span>
                <span
                  class="tem-sidebar__infoMeta"
                  :class="{
                    'tem-sidebar__infoMeta--valid': form.name.length >= 3,
                  }"
                >
                  <svg v-if="form.name.length >= 3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                  {{ form.name.length >= 3 ? 'Completo' : 'Pendiente' }}
                </span>
              </div>
            </div>

            <div class="tem-sidebar__sectionTitle">
              <span>Dimensiones</span>
              <button type="button" class="tem-sidebar__addBtn" @click="handleAddDimensionClick" title="Agregar dimensión">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>

            <div class="tem-sidebar__dimList">
              <div v-if="dimensions.length === 0" class="tem-sidebar__empty">
                <span>Sin dimensiones</span>
              </div>
              <div
                v-for="(dim, dimIndex) in dimensions"
                :key="dim.id"
                class="tem-sidebar__dimItem"
                :class="{
                  'tem-sidebar__dimItem--active': activePanel === 'dim' && activeDimIndex === dimIndex,
                }"
                @click="selectDimension(dimIndex)"
              >
                <span class="tem-sidebar__dimNum">{{ dimIndex + 1 }}</span>
                <div class="tem-sidebar__dimContent">
                  <span class="tem-sidebar__dimName">{{ dim.name || 'Sin nombre' }}</span>
                  <div class="tem-sidebar__dimMeta">
                    <span class="tem-sidebar__dimQuestions">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      {{ dim.questions.length }}
                    </span>
                    <span
                      class="tem-sidebar__dimWeight"
                      :class="{
                        'tem-sidebar__dimWeight--warning': !dim.weight || dim.weight === 0,
                      }"
                    >
                      {{ dim.weight || 0 }}%
                    </span>
                  </div>
                </div>
                <button type="button" class="tem-sidebar__dimDelete" @click.stop="removeDimension(dim.id)" title="Eliminar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Progress summary -->
            <div class="tem-sidebar__progress">
              <div class="tem-sidebar__progressHeader">
                <span>Progreso</span>
                <span class="tem-sidebar__progressValue">{{ progressPercentage }}%</span>
              </div>
              <div class="tem-sidebar__progressTrack">
                <div class="tem-sidebar__progressFill" :style="{ width: progressPercentage + '%' }" />
              </div>
            </div>
          </aside>

          <!-- MAIN CONTENT -->
          <main class="tem-main">
            <!-- Info General Panel -->
            <div v-show="activePanel === 'info'" class="tem-panel">
              <header class="tem-panel__header">
                <div class="tem-panel__iconBox tem-panel__iconBox--primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <div class="tem-panel__headerText">
                  <h3 class="tem-panel__title">Información General</h3>
                  <p class="tem-panel__subtitle">Define el nombre y propósito de la plantilla</p>
                </div>
              </header>

              <div class="tem-panel__body">
                <div class="tem-formRow">
                  <div class="tem-field tem-field--full">
                    <label class="tem-field__label">
                      Nombre de la Plantilla
                      <span class="tem-field__required">*</span>
                    </label>
                    <div class="tem-field__inputWrap" :class="{ 'tem-field__inputWrap--focus': nameFocused }">
                      <svg class="tem-field__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      <input
                        v-model="form.name"
                        type="text"
                        class="tem-field__input"
                        placeholder="Ej: Evaluación Docente Semestre 2024-I"
                        required
                        @focus="nameFocused = true"
                        @blur="nameFocused = false"
                      />
                    </div>
                    <span v-if="form.name.length > 0 && form.name.length < 3" class="tem-field__hint tem-field__hint--error">Mínimo 3 caracteres</span>
                  </div>
                </div>

                <div class="tem-formRow">
                  <div class="tem-field tem-field--full">
                    <label class="tem-field__label">Descripción</label>
                    <div class="tem-field__inputWrap tem-field__inputWrap--textarea" :class="{ 'tem-field__inputWrap--focus': descFocused }">
                      <textarea
                        v-model="form.description"
                        rows="4"
                        class="tem-field__textarea"
                        placeholder="Describe el propósito y alcance de esta plantilla de evaluación…"
                        @focus="descFocused = true"
                        @blur="descFocused = false"
                      />
                    </div>
                    <span class="tem-field__charCount">{{ form.description.length }} / 500</span>
                  </div>
                </div>

                <!-- Stats -->
                <div class="tem-statsGrid">
                  <div class="tem-statCard">
                    <div class="tem-statCard__icon tem-statCard__icon--blue">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                      </svg>
                    </div>
                    <div class="tem-statCard__content">
                      <span class="tem-statCard__value">{{ dimensions.length }}</span>
                      <span class="tem-statCard__label">{{ dimensions.length === 1 ? 'Dimensión' : 'Dimensiones' }}</span>
                    </div>
                  </div>

                  <div class="tem-statCard">
                    <div class="tem-statCard__icon tem-statCard__icon--green">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </div>
                    <div class="tem-statCard__content">
                      <span class="tem-statCard__value">{{ totalQuestions }}</span>
                      <span class="tem-statCard__label">{{ totalQuestions === 1 ? 'Pregunta' : 'Preguntas' }}</span>
                    </div>
                  </div>

                  <div class="tem-statCard">
                    <div class="tem-statCard__icon" :class="totalDimensionWeight === 100 ? 'tem-statCard__icon--emerald' : 'tem-statCard__icon--amber'">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    <div class="tem-statCard__content">
                      <span
                        class="tem-statCard__value"
                        :class="{
                          'tem-statCard__value--success': totalDimensionWeight === 100,
                          'tem-statCard__value--warning': totalDimensionWeight !== 100,
                        }"
                        >{{ totalDimensionWeight }}%</span
                      >
                      <span class="tem-statCard__label">Peso Total</span>
                    </div>
                  </div>
                </div>

                <!-- Next action -->
                <div class="tem-panel__action">
                  <button type="button" class="tem-panel__nextBtn" @click="dimensions.length > 0 ? selectDimension(0) : addDimension()">
                    <span>{{ dimensions.length > 0 ? 'Ir a Dimensiones' : 'Crear Primera Dimensión' }}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Dimension Panel -->
            <div v-show="activePanel === 'dim' && activeDimension" class="tem-panel">
              <header class="tem-panel__header">
                <div class="tem-panel__iconBox tem-panel__iconBox--violet">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>
                <div class="tem-panel__headerText">
                  <h3 class="tem-panel__title">Dimensión {{ activeDimIndex + 1 }}</h3>
                  <p class="tem-panel__subtitle">
                    {{ activeDimension?.name || 'Configura nombre, peso y preguntas' }}
                  </p>
                </div>
                <div class="tem-panel__nav">
                  <button type="button" class="tem-panel__navBtn" :disabled="activeDimIndex === 0" @click="selectDimension(activeDimIndex - 1)" title="Anterior">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <span class="tem-panel__navCount">{{ activeDimIndex + 1 }} / {{ dimensions.length }}</span>
                  <button type="button" class="tem-panel__navBtn" :disabled="activeDimIndex === dimensions.length - 1" @click="selectDimension(activeDimIndex + 1)" title="Siguiente">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </header>

              <div v-if="activeDimension" class="tem-panel__body">
                <!-- Dimension info -->
                <div class="tem-dimEditor">
                  <div class="tem-dimEditor__row">
                    <div class="tem-field tem-field--grow">
                      <label class="tem-field__label">Nombre de la Dimensión <span class="tem-field__required">*</span></label>
                      <input v-model="activeDimension.name" type="text" class="tem-field__inputSimple" placeholder="Ej: Metodología de Enseñanza" />
                    </div>
                    <div class="tem-field tem-field--weight">
                      <label class="tem-field__label">Peso <span class="tem-field__required">*</span></label>
                      <div class="tem-weightInput">
                        <input v-model.number="activeDimension.weight" type="number" min="0" max="100" step="1" placeholder="0" />
                        <span>%</span>
                      </div>
                    </div>
                  </div>
                  <div class="tem-dimEditor__row">
                    <div class="tem-field tem-field--full">
                      <label class="tem-field__label">Descripción</label>
                      <input v-model="activeDimension.description" type="text" class="tem-field__inputSimple" placeholder="Breve descripción de esta dimensión (opcional)" />
                    </div>
                  </div>
                </div>

                <!-- Questions section -->
                <div class="tem-questions">
                  <div class="tem-questions__header">
                    <div class="tem-questions__headerLeft">
                      <h4 class="tem-questions__title">Preguntas</h4>
                      <span
                        v-if="activeDimension.questions.length > 0"
                        class="tem-questions__weightBadge"
                        :class="{
                          'tem-questions__weightBadge--valid': calculateTotalWeight(activeDimension.questions) === 100,
                          'tem-questions__weightBadge--invalid': calculateTotalWeight(activeDimension.questions) !== 100,
                        }"
                      >
                        Suma:
                        {{ calculateTotalWeight(activeDimension.questions) }}%
                      </span>
                    </div>
                    <div class="tem-questions__headerRight">
                      <div v-if="activeDimension.questions.length > 0" class="tem-questions__nav">
                        <button type="button" class="tem-questions__navBtn" :disabled="activeQuestionIndex === 0" @click="selectQuestion(activeQuestionIndex - 1)" title="Pregunta anterior">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="15 18 9 12 15 6" />
                          </svg>
                        </button>
                        <span class="tem-questions__navCount">{{ activeQuestionIndex + 1 }} / {{ activeDimension.questions.length }}</span>
                        <button
                          type="button"
                          class="tem-questions__navBtn"
                          :disabled="activeQuestionIndex === activeDimension.questions.length - 1"
                          @click="selectQuestion(activeQuestionIndex + 1)"
                          title="Pregunta siguiente"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </button>
                      </div>
                      <button type="button" class="tem-questions__addBtn" @click="handleAddQuestionClick(activeDimension?.id, activeDimIndex)" title="Nueva Pregunta">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Nueva Pregunta
                      </button>
                    </div>
                  </div>

                  <!-- Empty questions -->
                  <div v-if="activeDimension.questions.length === 0" class="tem-questions__empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <line x1="9" y1="9" x2="15" y2="9" />
                      <line x1="9" y1="13" x2="15" y2="13" />
                      <line x1="9" y1="17" x2="12" y2="17" />
                    </svg>
                    <span>No hay preguntas en esta dimensión</span>
                    <button type="button" class="tem-questions__emptyBtn" @click="handleAddQuestionClick(activeDimension?.id, activeDimIndex)" title="Agregar primera pregunta">
                      Agregar primera pregunta
                    </button>
                  </div>

                  <!-- Single question view with navigation -->
                  <div v-else-if="activeQuestion" class="tem-questions__single">
                    <div class="tem-qItem">
                      <div class="tem-qItem__header">
                        <span class="tem-qItem__number">{{ activeQuestionIndex + 1 }}</span>
                        <button type="button" class="tem-qItem__deleteBtn" @click="removeQuestion(activeDimension.id, activeQuestion.id)">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                        </button>
                      </div>
                      <div class="tem-qItem__body">
                        <textarea
                          v-model="activeQuestion.text"
                          rows="3"
                          :class="[
                            'tem-qItem__textarea',
                            {
                              'is-invalid': submitted && !activeQuestion.text?.trim(),
                            },
                          ]"
                          placeholder="Escribe tu pregunta aquí..."
                        />
                        <small v-if="submitted && !activeQuestion.text?.trim()" class="text-danger">El texto de la pregunta es requerido</small>
                        <div class="tem-qItem__options">
                          <div class="tem-qItem__option">
                            <label>Tipo</label>
                            <select v-model="activeQuestion.type" class="tem-qItem__select">
                              <option value="likert">Escala Likert</option>
                              <option value="open">Respuesta Abierta</option>
                            </select>
                          </div>
                          <div v-if="activeQuestion.type === 'likert'" class="tem-qItem__option tem-qItem__option--scale">
                            <label>Escala</label>
                            <select v-model.number="activeQuestion.evaluationScaleId" class="tem-qItem__select" :disabled="isLoadingScales">
                              <option :value="undefined" disabled>
                                {{ isLoadingScales ? 'Cargando...' : 'Selecciona una escala' }}
                              </option>
                              <option v-for="scale in availableScales" :key="scale.id" :value="scale.id">
                                {{ scale.name }}
                              </option>
                            </select>
                          </div>
                          <div class="tem-qItem__option tem-qItem__option--weight">
                            <label>Peso</label>
                            <div class="tem-qItem__weightWrap">
                              <input v-model.number="activeQuestion.weight" type="number" min="0" max="100" step="1" placeholder="0" />
                              <span>%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty state when no dimension selected -->
            <div v-show="activePanel === 'dim' && !activeDimension && dimensions.length === 0" class="tem-panel tem-panel--empty">
              <div class="tem-emptyMain">
                <div class="tem-emptyMain__illustration">
                  <svg viewBox="0 0 120 120" fill="none">
                    <circle cx="60" cy="60" r="50" fill="#f1f5f9" />
                    <rect x="35" y="40" width="50" height="6" rx="3" fill="#cbd5e1" />
                    <rect x="35" y="52" width="35" height="6" rx="3" fill="#cbd5e1" />
                    <rect x="35" y="64" width="50" height="6" rx="3" fill="#cbd5e1" />
                    <rect x="35" y="76" width="25" height="6" rx="3" fill="#cbd5e1" />
                    <circle cx="85" cy="85" r="18" fill="#7c3aed" />
                    <line x1="85" y1="78" x2="85" y2="92" stroke="white" stroke-width="3" stroke-linecap="round" />
                    <line x1="78" y1="85" x2="92" y2="85" stroke="white" stroke-width="3" stroke-linecap="round" />
                  </svg>
                </div>
                <h4 class="tem-emptyMain__title">Comienza agregando dimensiones</h4>
                <p class="tem-emptyMain__text">Las dimensiones te permiten categorizar las preguntas de tu evaluación</p>
                <button type="button" class="tem-emptyMain__btn" @click="addDimension">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Crear Primera Dimensión
                </button>
              </div>
            </div>
          </main>
        </div>
      </form>
    </template>

    <!-- FOOTER -->
    <template #footer>
      <div class="tem-footer">
        <div v-if="canSave" class="tem-footer__validation tem-footer__validation--success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>Lista para guardar</span>
        </div>
        <div v-else class="tem-footer__validation tem-footer__validation--warning">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>Revisa los campos obligatorios</span>
        </div>

        <div class="tem-footer__actions">
          <button type="button" class="tem-footer__cancelBtn" @click="close">Cancelar</button>
          <button type="button" class="tem-footer__previewBtn" @click="openPreview">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Previsualizar
          </button>
          <button type="button" class="tem-footer__saveBtn" @click="save">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Guardar Borrador
          </button>
        </div>
      </div>
    </template>
  </AppDrawer>

  <!-- Inline confirm dialog for unsaved changes (teleported to body to appear above overlays) -->
  <teleport to="body">
    <div v-if="showCloseConfirm" class="tem-confirmOverlay" role="dialog" aria-modal="true">
      <div class="tem-confirmBox">
        <h4 class="tem-confirmBox__title">Hay cambios sin guardar</h4>
        <p class="tem-confirmBox__text">Tienes cambios sin guardar. ¿Deseas guardar antes de cerrar o descartarlos?</p>
        <div class="tem-confirmBox__actions">
          <button type="button" class="tem-confirmBox__btn tem-confirmBox__btn--primary" @click="saveAndClose">Guardar</button>
          <button type="button" class="tem-confirmBox__btn tem-confirmBox__btn--danger" @click="discardAndClose">Descartar</button>
          <button type="button" class="tem-confirmBox__btn" @click="closeCloseConfirm">Cancelar</button>
        </div>
      </div>
    </div>
  </teleport>

  <!-- Preview Modal (Outside main drawer) -->
  <TemplatePreviewModal v-model:isVisible="showPreview" :templateData="previewData" />
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, watch, onMounted } from 'vue';

import AppDrawer from '../../../shared/components/AppDrawer.vue';
import TemplatePreviewModal from './TemplatePreviewModal.vue';
import { GetEvaluationScalesService } from '../services/getEvaluationScales.service';
import type { EvaluationScale } from '../dtos/evaluationScale.dto';
import { useUserStore } from '../../../stores/user';
import { ToastService } from '../../../shared/services/toast.service';

type QuestionType = 'likert' | 'open';

type Question = {
  id: string;
  text: string;
  type: QuestionType;
  weight: number;
  evaluationScaleId?: number;
  isRequired?: boolean;
};

type Dimension = {
  id: string;
  name: string;
  description: string;
  weight: number;
  questions: Question[];
};

// Ajusta si tu Template tiene otro shape
export type Template = {
  id: number;
  name: string;
  description: string;
  dimensionCount: number;
  questionCount: number;
  lastModified?: string;
  usageCount: number;
  status?: string;
  dimensions?: Dimension[];
};

export default defineComponent({
  name: 'TemplateEditorModal',
  components: {
    AppDrawer,
    TemplatePreviewModal,
  },
  // local modal for confirms
  props: {
    isVisible: { type: Boolean, default: false },
    template: { type: Object as () => any, default: null },
    isNew: { type: Boolean, default: false },
  },
  emits: ['update:isVisible', 'saved'],
  setup(props, { emit }) {
    // confirm modal UI will be rendered inline using local state (`showCloseConfirm`)
    const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const userStore = useUserStore();
    const evaluationScalesService = new GetEvaluationScalesService();
    const toastService = new ToastService();

    // Evaluation scales state
    const availableScales = ref<EvaluationScale[]>([]);
    const isLoadingScales = ref(false);
    const submitted = ref(false);

    // UI state for focus effects
    const nameFocused = ref(false);
    const descFocused = ref(false);

    // Navigation state
    const activePanel = ref<'info' | 'dim'>('info');
    const activeDimIndex = ref(0);
    const activeQuestionIndex = ref(0);

    const form = reactive({
      id: 0,
      name: '',
      description: '',
      dimensionCount: 0,
      questionCount: 0,
      lastModified: '',
      usageCount: 0,
    });

    const dimensions = reactive<Dimension[]>([]);
    // UX: refs para scroll y colapsado
    const dimListRef = ref<HTMLElement | null>(null);
    const dimCardRefs = ref<any[]>([]);
    const qCardRefs = ref<any[][]>([]);
    const collapsedDims = ref<boolean[]>([]);
    // Snapshot used to detect unsaved changes
    const initialSnapshot = ref<string>('');
    const isDirty = computed(() => {
      try {
        const currentObj = {
          form: JSON.parse(JSON.stringify(form)),
          dimensions: JSON.parse(JSON.stringify(dimensions)),
        };
        const current = JSON.stringify(currentObj);
        // If we have an initial snapshot (editing an existing template), compare snapshots
        if (initialSnapshot.value !== '') {
          return current !== initialSnapshot.value;
        }
        // New template: consider dirty when user entered any meaningful data
        const hasName = String(form.name || '').trim().length > 0;
        const hasDesc = String(form.description || '').trim().length > 0;
        const hasDims = Array.isArray(dimensions) && dimensions.length > 0;
        if (hasName || hasDesc || hasDims) return true;
        return false;
      } catch (e) {
        return false;
      }
    });

    const getDefaultScaleId = () => {
      return availableScales.value.length > 0 ? availableScales.value[0].id : undefined;
    };

    const syncLikertQuestionsScale = () => {
      const validScaleIds = new Set(availableScales.value.map((scale) => scale.id));
      const defaultScaleId = getDefaultScaleId();

      dimensions.forEach((dimension) => {
        dimension.questions.forEach((question) => {
          if (question.type !== 'likert') {
            question.evaluationScaleId = undefined;
            return;
          }

          if (defaultScaleId === undefined) {
            question.evaluationScaleId = undefined;
            return;
          }

          const hasValidScale = typeof question.evaluationScaleId === 'number' && validScaleIds.has(question.evaluationScaleId);
          if (!hasValidScale) {
            question.evaluationScaleId = defaultScaleId;
          }
        });
      });
    };

    const resolveInstitutionId = () => {
      const fromStore = userStore.user?.people?.institutionId;
      const fromStorage = localStorage.getItem('institutionId');
      const value = fromStore || fromStorage;
      return value ? String(value) : '';
    };

    // Active dimension computed
    const activeDimension = computed(() => {
      if (activePanel.value === 'dim' && dimensions.length > 0 && activeDimIndex.value < dimensions.length) {
        return dimensions[activeDimIndex.value];
      }
      return null;
    });

    // Select a dimension
    const selectDimension = (index: number) => {
      activeDimIndex.value = index;
      activePanel.value = 'dim';
      activeQuestionIndex.value = 0; // Reset question index when changing dimension
    };

    // Navigate between questions
    const selectQuestion = (index: number) => {
      if (activeDimension.value && index >= 0 && index < activeDimension.value.questions.length) {
        activeQuestionIndex.value = index;
      }
    };

    const activeQuestion = computed(() => {
      if (activeDimension.value && activeDimension.value.questions.length > 0 && activeQuestionIndex.value < activeDimension.value.questions.length) {
        return activeDimension.value.questions[activeQuestionIndex.value];
      }
      return null;
    });

    function setDimCardRef(el: any, idx: number) {
      if (el) dimCardRefs.value[idx] = el;
    }
    function setQCardRef(el: any, dimIdx: number, qIdx: number) {
      if (!qCardRefs.value[dimIdx]) qCardRefs.value[dimIdx] = [];
      if (el) qCardRefs.value[dimIdx][qIdx] = el;
    }
    // Solo una dimensión expandida a la vez
    function toggleCollapse(idx: number) {
      collapsedDims.value = dimensions.map((_, i) => i !== idx);
    }

    const totalQuestions = computed(() => dimensions.reduce((sum, d) => sum + d.questions.length, 0));

    // Progress percentage for the progress bar
    const progressPercentage = computed(() => {
      let progress = 0;
      // Name filled (30%)
      if (form.name.length >= 3) progress += 30;
      // At least one dimension (30%)
      if (dimensions.length > 0) progress += 30;
      // Dimension weights sum to 100% (40%)
      if (totalDimensionWeight.value === 100) progress += 40;
      return progress;
    });

    watch(
      () => [dimensions.length, totalQuestions.value],
      () => {
        form.dimensionCount = dimensions.length;
        form.questionCount = totalQuestions.value;
      },
      { immediate: true }
    );

    const calculateTotalWeight = (questions: Question[]) => questions.reduce((sum, q) => sum + (Number(q.weight) || 0), 0);

    const isDimensionWeightValid = (dimension: Dimension) => {
      // La dimensión debe tener al menos 1 pregunta
      if (dimension.questions.length === 0) return false;
      // La suma de los pesos de todas las preguntas debe ser 100%
      const total = calculateTotalWeight(dimension.questions);
      return total === 100;
    };

    // Suma directa de los pesos de dimensiones (el usuario ingresa valores enteros como 50 para 50%)
    const totalDimensionWeight = computed(() => dimensions.reduce((sum, d) => sum + (Number(d.weight) || 0), 0));

    const canSave = computed(() => {
      // Nombre requerido (mínimo 3 caracteres)
      if (String(form.name).trim().length < 3) return false;
      // Al menos una dimensión
      if (dimensions.length === 0) return false;
      // Todas las dimensiones deben tener peso definido y mayor a 0
      if (dimensions.some((d) => !d.weight || Number(d.weight) <= 0)) return false;
      // La suma de los pesos de dimensiones debe ser 100%
      if (totalDimensionWeight.value !== 100) return false;
      // Cada dimensión debe tener al menos 1 pregunta y la suma de pesos de preguntas debe ser 100%
      if (!dimensions.every((d) => isDimensionWeightValid(d))) return false;
      // Todas las preguntas deben tener texto
      if (dimensions.some((d) => d.questions.some((q) => !String(q.text).trim()))) return false;
      return true;
    });

    // Mensaje descriptivo de lo que falta para guardar
    const validationMessage = computed(() => {
      if (String(form.name).trim().length < 3) return 'Ingresa un nombre (mínimo 3 caracteres)';
      if (dimensions.length === 0) return 'Agrega al menos una dimensión';
      if (dimensions.some((d) => !d.weight || Number(d.weight) <= 0)) return 'Define el peso de cada dimensión';
      if (totalDimensionWeight.value !== 100) return `Peso de dimensiones: ${totalDimensionWeight.value}% (debe ser 100%)`;
      // Verificar cada dimensión
      for (let i = 0; i < dimensions.length; i++) {
        const d = dimensions[i];
        if (d.questions.length === 0) return `"${d.name || 'Dimensión ' + (i + 1)}" necesita al menos 1 pregunta`;
        const emptyQ = d.questions.findIndex((q) => !String(q.text).trim());
        if (emptyQ >= 0) return `Pregunta ${emptyQ + 1} de "${d.name || 'Dimensión ' + (i + 1)}" no tiene texto`;
        const qTotal = calculateTotalWeight(d.questions);
        if (qTotal !== 100) return `Preguntas de "${d.name || 'Dimensión ' + (i + 1)}": ${qTotal}% (debe ser 100%)`;
      }
      return 'Plantilla lista para guardar';
    });

    // CRUD
    const addDimension = () => {
      dimensions.push({
        id: `dim-${uid()}`,
        name: '',
        description: '',
        weight: 0,
        questions: [],
      });
      // Select the new dimension
      const newIndex = dimensions.length - 1;
      activeDimIndex.value = newIndex;
      activePanel.value = 'dim';
      // UX: abrir solo la nueva dimensión y colapsar las demás
      setTimeout(() => {
        collapsedDims.value = dimensions.map((_, i) => i !== newIndex);
      }, 50);
    };

    // Handler wrapper used by the UI
    const handleAddDimensionClick = () => {
      addDimension();
    };

    const removeDimension = (dimensionId: string) => {
      const idx = dimensions.findIndex((d) => d.id === dimensionId);
      if (idx >= 0) {
        dimensions.splice(idx, 1);
        // Adjust active index if needed
        if (activeDimIndex.value >= dimensions.length) {
          activeDimIndex.value = Math.max(0, dimensions.length - 1);
        }
        if (dimensions.length === 0) {
          activePanel.value = 'info';
        }
      }
    };

    const addQuestion = (dimensionId: string, dimIdx?: number) => {
      const dim = dimensions.find((d) => d.id === dimensionId);
      if (!dim) return;
      dim.questions.push({
        id: `q-${uid()}`,
        text: '',
        type: 'likert',
        weight: 0,
        evaluationScaleId: getDefaultScaleId(),
      });
      // Navigate to the new question
      activeQuestionIndex.value = dim.questions.length - 1;
    };

    const handleAddQuestionClick = (dimensionId?: string | null, dimIdx?: number) => {
      if (!dimensionId) return;
      addQuestion(dimensionId, dimIdx);
    };

    const removeQuestion = (dimensionId: string, questionId: string) => {
      const dim = dimensions.find((d) => d.id === dimensionId);
      if (!dim) return;

      const idx = dim.questions.findIndex((q) => q.id === questionId);
      if (idx >= 0) {
        dim.questions.splice(idx, 1);
        // Adjust active question index if needed
        if (activeQuestionIndex.value >= dim.questions.length) {
          activeQuestionIndex.value = Math.max(0, dim.questions.length - 1);
        }
      }
    };

    // move (drag simple)
    const moveDimension = (index: number, dir: -1 | 1) => {
      const newIndex = index + dir;
      if (newIndex < 0 || newIndex >= dimensions.length) return;
      const item = dimensions.splice(index, 1)[0];
      dimensions.splice(newIndex, 0, item);
    };

    const moveQuestion = (dimensionId: string, qIndex: number, dir: -1 | 1) => {
      const dim = dimensions.find((d) => d.id === dimensionId);
      if (!dim) return;

      const newIndex = qIndex + dir;
      if (newIndex < 0 || newIndex >= dim.questions.length) return;

      const item = dim.questions.splice(qIndex, 1)[0];
      dim.questions.splice(newIndex, 0, item);
    };

    // Función para cargar los datos de la plantilla en el formulario
    const loadTemplateData = (val: any) => {
      console.log('[loadTemplateData] val:', val);
      console.log('[loadTemplateData] val.dimensions:', val?.dimensions);
      // reset
      form.id = 0;
      form.name = '';
      form.description = '';
      form.dimensionCount = 0;
      form.questionCount = 0;
      form.lastModified = '';
      form.usageCount = 0;
      dimensions.splice(0, dimensions.length);
      collapsedDims.value = [];
      dimCardRefs.value = [];
      qCardRefs.value = [];
      activePanel.value = 'info';
      activeDimIndex.value = 0;
      activeQuestionIndex.value = 0;
      submitted.value = false;
      if (!val) return;
      form.id = val.id ?? 0;
      form.name = val.name ?? '';
      form.description = val.description ?? '';
      form.dimensionCount = val.dimensionCount ?? val.totalDimensions ?? 0;
      form.questionCount = val.questionCount ?? val.totalQuestions ?? 0;
      form.lastModified = val.lastModified ?? '';
      form.usageCount = val.usageCount ?? val.totalUsed ?? 0;
      // si ya tiene dimensiones guardadas, las cargamos
      if (Array.isArray(val.dimensions) && val.dimensions.length) {
        console.log('[loadTemplateData] Cargando dimensiones:', val.dimensions.length);
        val.dimensions.forEach((d: any, idx: number) => {
          console.log('[loadTemplateData] Dimension:', d);
          // Normalizar peso: si viene como decimal (0-1), convertir a porcentaje (0-100)
          const dimWeight = typeof d.weight === 'number' ? (d.weight <= 1 && d.weight > 0 ? d.weight * 100 : d.weight) : 0;
          dimensions.push({
            id: String(d.id) || `dim-${uid()}`,
            name: d.name || '',
            description: d.description || '',
            weight: dimWeight,
            questions: (d.questions || []).map((q: any) => {
              // Normalizar peso de pregunta: si viene como decimal, convertir a porcentaje
              const qWeight = typeof q.weight === 'number' ? (q.weight <= 1 && q.weight > 0 ? q.weight * 100 : q.weight) : 0;
              return {
                id: String(q.id) || `q-${uid()}`,
                text: q.description || q.text || '',
                type: q.typeQuestion === 'scale' ? 'likert' : q.typeQuestion || q.type || 'likert',
                weight: qWeight,
                evaluationScaleId: q.evaluationScaleId ?? undefined,
                isRequired: q.isRequired !== undefined ? q.isRequired : true,
              };
            }),
          });
        });
        syncLikertQuestionsScale();
        // Solo la primera expandida
        collapsedDims.value = val.dimensions.map((_: any, i: number) => i !== 0);
        console.log('[loadTemplateData] Dimensions loaded:', dimensions.length, dimensions);
      }
      // Snapshot initial state to detect unsaved changes
      try {
        initialSnapshot.value = JSON.stringify({
          form: JSON.parse(JSON.stringify(form)),
          dimensions: JSON.parse(JSON.stringify(dimensions)),
        });
      } catch (e) {
        initialSnapshot.value = '';
      }
    };

    // Observar cuando el modal se abre para cargar datos
    watch(
      () => props.isVisible,
      (visible) => {
        console.log('[TemplateEditorModal] isVisible changed:', visible, 'template:', props.template);
        if (visible) {
          loadTemplateData(props.template);
        }
      }
    );

    // También observar cambios en template cuando el modal está visible
    watch(
      () => props.template,
      (val) => {
        console.log('[TemplateEditorModal] template changed:', val, 'isVisible:', props.isVisible);
        if (props.isVisible) {
          loadTemplateData(val);
        }
      },
      { immediate: true }
    );

    // Load evaluation scales
    const loadEvaluationScales = async () => {
      try {
        isLoadingScales.value = true;
        const institutionId = resolveInstitutionId();
        const response = await evaluationScalesService.run(
          {
            noPag: true,
            order: 'ASC',
            institutionId,
          },
          institutionId
        );
        availableScales.value = response.data || [];
        syncLikertQuestionsScale();
      } catch (error) {
        console.error('[TemplateEditorModal] Error loading evaluation scales:', error);
        availableScales.value = [];
      } finally {
        isLoadingScales.value = false;
      }
    };

    // Load scales when modal is visible
    watch(
      () => props.isVisible,
      (visible) => {
        if (visible && availableScales.value.length === 0) {
          loadEvaluationScales();
        }
      },
      { immediate: true }
    );

    watch(
      () => activeQuestion.value?.type,
      (type) => {
        if (!activeQuestion.value) return;

        if (type === 'likert') {
          const defaultScaleId = getDefaultScaleId();
          if (defaultScaleId !== undefined && !activeQuestion.value.evaluationScaleId) {
            activeQuestion.value.evaluationScaleId = defaultScaleId;
          }
        } else {
          activeQuestion.value.evaluationScaleId = undefined;
        }
      }
    );

    function emitUpdate(val: boolean) {
      emit('update:isVisible', val);
    }

    function close() {
      if (isDirty.value) {
        openCloseConfirm();
        return;
      }
      emit('update:isVisible', false);
    }

    const save = () => {
      submitted.value = true;
      // Validación básica: nombre requerido
      if (String(form.name).trim().length < 3) {
        toastService.show('Ingresa un nombre válido (mínimo 3 caracteres)', 'error');
        return;
      }

      // Validación: al menos una dimensión
      if (dimensions.length === 0) {
        toastService.show('Agrega al menos una dimensión', 'error');
        return;
      }

      // Validación: todas las dimensiones deben tener peso definido y mayor a 0
      if (dimensions.some((d) => !d.weight || Number(d.weight) <= 0)) {
        toastService.show('Define el peso de cada dimensión (mayor a 0%)', 'error');
        return;
      }

      // Validación: la suma de los pesos de dimensiones no debe exceder ni ser menor a 100%
      if (totalDimensionWeight.value !== 100) {
        if (totalDimensionWeight.value > 100) {
          toastService.show(`No se pudo guardar: Los pesos de las dimensiones suman ${totalDimensionWeight.value}% y exceden el 100%`, 'error');
        } else {
          toastService.show(`No se pudo guardar: Los pesos de las dimensiones suman ${totalDimensionWeight.value}% y deben ser exactamente 100%`, 'error');
        }
        return;
      }

      // Validación: cada dimensión debe tener al menos 1 pregunta y la suma de pesos de preguntas debe ser 100%
      for (let i = 0; i < dimensions.length; i++) {
        const d = dimensions[i];
        if (d.questions.length === 0) {
          toastService.show(`No se pudo guardar: La dimensión "${d.name || 'Dimensión ' + (i + 1)}" necesita al menos 1 pregunta`, 'error');
          return;
        }

        for (let j = 0; j < d.questions.length; j++) {
          if (!String(d.questions[j].text).trim()) {
            toastService.show(`No se pudo guardar: La pregunta ${j + 1} de "${d.name || 'Dimensión ' + (i + 1)}" no tiene texto`, 'error');
            return;
          }
        }

        const hasLikertWithoutScale = d.questions.some((q) => q.type === 'likert' && !q.evaluationScaleId);
        if (hasLikertWithoutScale) {
          toastService.show(`No se pudo guardar: Selecciona una escala en cada pregunta tipo Likert de "${d.name || 'Dimensión ' + (i + 1)}"`, 'error');
          return;
        }

        const qTotal = calculateTotalWeight(d.questions);
        if (qTotal !== 100) {
          if (qTotal > 100) {
            toastService.show(`No se pudo guardar: Los pesos de las preguntas de "${d.name || 'Dimensión ' + (i + 1)}" suman ${qTotal}% y exceden el 100%`, 'error');
          } else {
            toastService.show(`No se pudo guardar: Los pesos de las preguntas de "${d.name || 'Dimensión ' + (i + 1)}" suman ${qTotal}% y deben ser exactamente 100%`, 'error');
          }
          return;
        }
      }

      const payload: any = {
        name: form.name,
        description: form.description,
        dimensionCount: dimensions.length,
        questionCount: totalQuestions.value,
        lastModified: new Date().toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        usageCount: props.template?.usageCount ?? 0,
        dimensions: JSON.parse(JSON.stringify(dimensions)),
      };

      // Solo incluir el id si existe (modo edición)
      if (props.template?.id) {
        payload.id = props.template.id;
      }

      emit('saved', payload);
      // close without triggering confirmation (we just saved)
      emitUpdate(false);
    };
    // Manage a custom confirmation modal instead of native confirm
    const showCloseConfirm = ref(false);

    const openCloseConfirm = () => {
      showCloseConfirm.value = true;
    };

    const closeCloseConfirm = () => {
      showCloseConfirm.value = false;
    };

    const handleOverlayClick = () => {
      if (!isDirty.value) {
        emitUpdate(false);
        return;
      }
      openCloseConfirm();
    };

    const discardAndClose = () => {
      closeCloseConfirm();
      emitUpdate(false);
    };

    const saveAndClose = async () => {
      closeCloseConfirm();
      await save();
    };

    // Preview modal
    const showPreview = ref(false);
    const previewData = computed(() => ({
      name: form.name,
      description: form.description,
      dimensions: JSON.parse(JSON.stringify(dimensions)),
    }));

    const openPreview = () => {
      console.log('[openPreview] Opening preview modal');
      console.log('[openPreview] Preview data:', previewData.value);
      console.log('[openPreview] Dimensions:', dimensions.length);
      showPreview.value = true;
      console.log('[openPreview] showPreview set to:', showPreview.value);
    };

    return {
      // props ui
      emitUpdate,
      close,
      save,
      handleOverlayClick,

      // UI state
      nameFocused,
      descFocused,
      progressPercentage,
      availableScales,
      isLoadingScales,

      // Navigation state
      activePanel,
      activeDimIndex,
      activeDimension,
      selectDimension,
      activeQuestionIndex,
      activeQuestion,
      selectQuestion,

      // state
      form,
      dimensions,
      totalQuestions,
      totalDimensionWeight,
      dimListRef,
      dimCardRefs,
      qCardRefs,
      collapsedDims,

      // methods
      addDimension,
      removeDimension,
      addQuestion,
      handleAddDimensionClick,
      handleAddQuestionClick,
      removeQuestion,
      calculateTotalWeight,
      isDimensionWeightValid,
      moveDimension,
      moveQuestion,
      setDimCardRef,
      setQCardRef,
      toggleCollapse,

      // validation
      canSave,
      validationMessage,
      isDirty,
      submitted,
      // confirm dialog
      showCloseConfirm,
      openCloseConfirm,
      closeCloseConfirm,
      saveAndClose,
      discardAndClose,

      // preview
      showPreview,
      previewData,
      openPreview,
    };
  },
});
</script>

<style scoped>
/* ===== ANIMATIONS ===== */
.tem-qAnim-enter-active,
.tem-qAnim-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.tem-qAnim-enter-from,
.tem-qAnim-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

/* Top alert for validation messages (prominent and sticky) */
.tem-topAlert {
  position: sticky;
  top: 0;
  z-index: 10;
  width: 100%;
  padding: 10px 20px;
  box-sizing: border-box;
  background: #fff7ed; /* soft yellow */
  border-bottom: 1px solid #fcd34d;
  margin: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.tem-topAlert--success {
  background: #f0fdf4; /* soft green */
  border-bottom: 1px solid #86efac;
}
.tem-topAlert--success .tem-topAlert__inner {
  color: #15803d;
}
.tem-topAlert__inner {
  display: flex;
  gap: 10px;
  align-items: center;
  color: #92400e;
  font-weight: 600;
}
.tem-topAlert__text {
  font-size: 13px;
}

/* ===== DRAWER HEAD ===== */
.tem-drawerHead {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  width: 100%;
}

.tem-drawerHead__iconWrap {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tem-drawerHead__icon {
  width: 26px;
  height: 26px;
  color: #fff;
}

.tem-drawerHead__content {
  flex: 1;
  min-width: 0;
}

.tem-drawerHead__title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.tem-drawerHead__subtitle {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
}

.tem-drawerHead__subtitleIcon {
  width: 14px;
  height: 14px;
  opacity: 0.8;
}

/* ===== FORM & LAYOUT ===== */
.tem-form {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tem-layout {
  display: flex;
  flex: 1;
  min-height: 0; /* Critical for proper flex behavior */
  overflow: hidden;
}

/* ===== SIDEBAR ===== */
.tem-sidebar {
  width: 280px;
  flex-shrink: 0;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tem-sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.tem-sidebar__title {
  font-size: 13px;
  font-weight: 700;
  color: #334155;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tem-sidebar__badge {
  padding: 4px 10px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.tem-sidebar__badge--success {
  background: #dcfce7;
  color: #166534;
}

/* Sidebar info card */
.tem-sidebar__infoCard {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  margin: 12px;
  background: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tem-sidebar__infoCard:hover {
  border-color: #cbd5e1;
}

.tem-sidebar__infoCard--active {
  border-color: #2563eb;
  background: #eff6ff;
}

.tem-sidebar__infoIcon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tem-sidebar__infoIcon svg {
  width: 18px;
  height: 18px;
  color: #fff;
}

.tem-sidebar__infoContent {
  flex: 1;
  min-width: 0;
}

.tem-sidebar__infoTitle {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}

.tem-sidebar__infoMeta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

.tem-sidebar__infoMeta svg {
  width: 12px;
  height: 12px;
}

.tem-sidebar__infoMeta--valid {
  color: #10b981;
}

/* Sidebar section title */
.tem-sidebar__sectionTitle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px 8px;
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tem-sidebar__addBtn {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tem-sidebar__addBtn:hover {
  transform: scale(1.1);
}

.tem-sidebar__addBtn svg {
  width: 14px;
  height: 14px;
  color: #fff;
}

/* Appear disabled but still clickable to show helpful toasts */
.tem-sidebar__addBtn.is-disabled,
.tem-questions__addBtn.is-disabled,
.tem-questions__emptyBtn.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Sidebar dimension list */
.tem-sidebar__dimList {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tem-sidebar__empty {
  padding: 20px;
  text-align: center;
  color: #94a3b8;
  font-size: 12px;
}

/* Sidebar dimension item */
.tem-sidebar__dimItem {
  display: flex;
  align-items: stretch;
  gap: 10px;
  padding: 12px;
  background: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tem-sidebar__dimItem:hover {
  border-color: #c7d2fe;
}

.tem-sidebar__dimItem--active {
  border-color: #7c3aed;
  background: #f5f3ff;
}

.tem-sidebar__dimNum {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1d4ed8;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  align-self: center;
}

.tem-sidebar__dimContent {
  flex: 1;
  min-width: 0;
}

.tem-sidebar__dimName {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tem-sidebar__dimMeta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}

.tem-sidebar__dimQuestions {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #64748b;
}

.tem-sidebar__dimQuestions svg {
  width: 12px;
  height: 12px;
}

.tem-sidebar__dimWeight {
  font-size: 11px;
  font-weight: 700;
  color: #10b981;
}

.tem-sidebar__dimWeight--warning {
  color: #f59e0b;
}

.tem-sidebar__dimDelete {
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.15s ease;
  align-self: center;
}

.tem-sidebar__dimDelete:hover {
  background: #fef2f2;
  color: #ef4444;
}

.tem-sidebar__dimDelete svg {
  width: 14px;
  height: 14px;
}

/* Sidebar progress */
.tem-sidebar__progress {
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
  background: #fff;
}

.tem-sidebar__progressHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.tem-sidebar__progressHeader span:first-child {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
}

.tem-sidebar__progressValue {
  font-size: 12px;
  font-weight: 700;
  color: #2563eb;
}

.tem-sidebar__progressTrack {
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.tem-sidebar__progressFill {
  height: 100%;
  background: linear-gradient(90deg, #2563eb 0%, #7c3aed 100%);
  border-radius: 999px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ===== MAIN CONTENT ===== */
.tem-main {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  overflow-x: hidden;
  background: #fff;
  display: flex;
  flex-direction: column;
}

/* ===== PANEL ===== */
.tem-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tem-panel--empty {
  align-items: center;
  justify-content: center;
}

.tem-panel__header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 22px;
  background: linear-gradient(135deg, #fafbfc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
}

.tem-panel__iconBox {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tem-panel__iconBox svg {
  width: 22px;
  height: 22px;
}

.tem-panel__iconBox--primary {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.tem-panel__iconBox--violet {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
}

.tem-panel__headerText {
  flex: 1;
  min-width: 0;
}

.tem-panel__title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.tem-panel__subtitle {
  font-size: 13px;
  color: #64748b;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tem-panel__nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tem-panel__navBtn {
  width: 32px;
  height: 32px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #475569;
  transition: all 0.15s ease;
}

.tem-panel__navBtn:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.tem-panel__navBtn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.tem-panel__navBtn svg {
  width: 16px;
  height: 16px;
}

.tem-panel__navCount {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  min-width: 48px;
  text-align: center;
}

.tem-panel__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 18px 22px;
}

.tem-panel__action {
  margin-top: 16px;
  text-align: center;
}

.tem-panel__nextBtn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
}

.tem-panel__nextBtn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(124, 58, 237, 0.35);
}

.tem-panel__nextBtn svg {
  width: 18px;
  height: 18px;
}

/* ===== FORM ROW ===== */
.tem-formRow {
  margin-bottom: 14px;
}

/* ===== FIELD ===== */
.tem-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tem-field--full {
  width: 100%;
}

.tem-field--grow {
  flex: 1;
  min-width: 0;
}

.tem-field--weight {
  width: 120px;
  flex-shrink: 0;
}

.tem-field__label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.tem-field__required {
  color: #ef4444;
}

.tem-field__inputWrap {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.tem-field__inputWrap--focus {
  background: #fff;
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.tem-field__inputWrap--textarea {
  padding: 12px 14px;
  align-items: flex-start;
}

.tem-field__icon {
  width: 20px;
  height: 20px;
  color: #94a3b8;
  flex-shrink: 0;
}

.tem-field__input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #0f172a;
  font-weight: 500;
}

.tem-field__input::placeholder {
  color: #94a3b8;
  font-weight: 400;
}

.tem-field__inputSimple {
  width: 100%;
  padding: 12px 14px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  color: #0f172a;
  outline: none;
  transition: all 0.2s ease;
}

.tem-field__inputSimple:focus {
  background: #fff;
  border-color: #818cf8;
  box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.15);
}

.tem-field__inputSimple::placeholder {
  color: #94a3b8;
}

.tem-field__textarea {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #0f172a;
  resize: vertical;
  min-height: 70px;
  line-height: 1.5;
}

.tem-field__textarea::placeholder {
  color: #94a3b8;
}

.tem-field__hint {
  font-size: 12px;
  color: #64748b;
}

.tem-field__hint--error {
  color: #ef4444;
}

.tem-field__charCount {
  font-size: 11px;
  color: #94a3b8;
  text-align: right;
}

/* ===== WEIGHT INPUT ===== */
.tem-weightInput {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
}

.tem-weightInput input {
  width: 50px;
  border: none;
  background: transparent;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  text-align: center;
  outline: none;
}

.tem-weightInput input::-webkit-outer-spin-button,
.tem-weightInput input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.tem-weightInput span {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
}

/* ===== STATS GRID ===== */
.tem-statsGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 16px;
}

.tem-statCard {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.tem-statCard__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tem-statCard__icon svg {
  width: 22px;
  height: 22px;
}

.tem-statCard__icon--blue {
  background: #dbeafe;
  color: #2563eb;
}

.tem-statCard__icon--green {
  background: #dcfce7;
  color: #16a34a;
}

.tem-statCard__icon--emerald {
  background: #d1fae5;
  color: #059669;
}

.tem-statCard__icon--amber {
  background: #fef3c7;
  color: #d97706;
}

.tem-statCard__content {
  flex: 1;
  min-width: 0;
}

.tem-statCard__value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1;
}

.tem-statCard__value--success {
  color: #059669;
}

.tem-statCard__value--warning {
  color: #d97706;
}

.tem-statCard__label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  margin-top: 4px;
}

/* ===== DIMENSION EDITOR ===== */
.tem-dimEditor {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 14px;
  margin-bottom: 16px;
}

.tem-dimEditor__row {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.tem-dimEditor__row:last-child {
  margin-bottom: 0;
}

/* ===== QUESTIONS SECTION ===== */
.tem-questions {
  flex: 1;
}

.tem-questions__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 16px;
}

.tem-questions__headerLeft {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.tem-questions__headerRight {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.tem-questions__title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.tem-questions__weightBadge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.tem-questions__weightBadge--valid {
  background: #dcfce7;
  color: #166534;
}

.tem-questions__weightBadge--invalid {
  background: #fef3c7;
  color: #92400e;
}

.tem-questions__addBtn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.25);
  white-space: nowrap;
}

.tem-questions__addBtn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.35);
}

.tem-questions__addBtn svg {
  width: 16px;
  height: 16px;
}

/* Questions navigation controls */
.tem-questions__nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tem-questions__navBtn {
  width: 32px;
  height: 32px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #475569;
  transition: all 0.15s ease;
}

.tem-questions__navBtn:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.tem-questions__navBtn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.tem-questions__navBtn svg {
  width: 16px;
  height: 16px;
}

.tem-questions__navCount {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  min-width: 48px;
  text-align: center;
}

.tem-questions__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 24px;
  background: #f8fafc;
  border: 2px dashed #e2e8f0;
  border-radius: 16px;
  text-align: center;
}

.tem-questions__empty svg {
  width: 48px;
  height: 48px;
  color: #cbd5e1;
  margin-bottom: 12px;
}

.tem-questions__empty span {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 16px;
}

.tem-questions__emptyBtn {
  padding: 10px 20px;
  background: #fff;
  border: 2px solid #c7d2fe;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #6366f1;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tem-questions__emptyBtn:hover {
  background: #eef2ff;
  border-color: #a5b4fc;
}

/* ===== QUESTION ITEM ===== */
.tem-qItem {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.tem-qItem__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #f1f5f9;
}

.tem-qItem__number {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1d4ed8;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.tem-qItem__deleteBtn {
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  margin-left: auto;
  transition: all 0.15s ease;
}

.tem-qItem__deleteBtn:hover {
  background: #fef2f2;
  color: #ef4444;
}

.tem-qItem__deleteBtn svg {
  width: 16px;
  height: 16px;
}

.tem-qItem__body {
  padding: 14px;
}

.tem-qItem__textarea {
  width: 100%;
  padding: 12px 14px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  color: #0f172a;
  line-height: 1.5;
  resize: vertical;
  min-height: 70px;
  max-height: 160px;
  outline: none;
  transition: all 0.2s ease;
}

.tem-qItem__textarea:focus {
  background: #fff;
  border-color: #818cf8;
  box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.1);
}

.tem-qItem__textarea::placeholder {
  color: #94a3b8;
}

.tem-qItem__options {
  display: flex;
  gap: 16px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.tem-qItem__option {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 160px;
}

.tem-qItem__option--scale {
  flex: 1.5;
  min-width: 200px;
}

.tem-qItem__option--weight {
  flex: 0 0 100px;
  min-width: 100px;
}

.tem-qItem__option label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tem-qItem__select {
  padding: 10px 14px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #334155;
  cursor: pointer;
  outline: none;
  min-width: 180px;
}

.tem-qItem__select:focus {
  border-color: #818cf8;
}

.tem-qItem__weightWrap {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.tem-qItem__weightWrap input {
  width: 40px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  text-align: center;
  outline: none;
}

.tem-qItem__weightWrap input::-webkit-outer-spin-button,
.tem-qItem__weightWrap input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.tem-qItem__weightWrap span {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}

/* ===== EMPTY MAIN ===== */
.tem-emptyMain {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 48px;
}

.tem-emptyMain__illustration {
  width: 120px;
  height: 120px;
  margin-bottom: 20px;
}

.tem-emptyMain__title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
}

.tem-emptyMain__text {
  font-size: 14px;
  color: #64748b;
  max-width: 320px;
  line-height: 1.5;
  margin-bottom: 24px;
}

.tem-emptyMain__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}

.tem-emptyMain__btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(124, 58, 237, 0.4);
}

.tem-emptyMain__btn svg {
  width: 20px;
  height: 20px;
}

/* ===== FOOTER ===== */
.tem-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 20px;
}

.tem-footer__validation {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #fef3c7;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  color: #92400e;
}

.tem-footer__validation--success {
  background: #dcfce7;
  color: #166534;
}

.tem-footer__validation--warning {
  background: #fef3c7;
  color: #92400e;
}

.tem-footer__validation svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.tem-footer__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.tem-footer__cancelBtn {
  padding: 12px 24px;
  background: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tem-footer__cancelBtn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #475569;
}

.tem-footer__previewBtn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #fff;
  border: 2px solid #2563eb;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #2563eb;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tem-footer__previewBtn:hover {
  background: #eff6ff;
  border-color: #1d4ed8;
  color: #1d4ed8;
}

.tem-footer__previewBtn svg {
  width: 18px;
  height: 18px;
}

.tem-footer__saveBtn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.tem-footer__saveBtn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
}

.tem-footer__saveBtn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.tem-footer__saveBtn svg {
  width: 18px;
  height: 18px;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .tem-layout {
    flex-direction: column;
  }

  .tem-sidebar {
    width: 100%;
    max-height: 280px;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }

  .tem-sidebar__dimList {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 12px 12px;
  }

  .tem-sidebar__dimItem {
    flex: 1 1 calc(50% - 4px);
    min-width: 160px;
  }

  .tem-sidebar__progress {
    display: none;
  }

  .tem-panel__header {
    flex-wrap: wrap;
    gap: 12px;
  }

  .tem-statsGrid {
    grid-template-columns: repeat(2, 1fr);
  }

  .tem-dimEditor__row {
    flex-direction: column;
  }

  .tem-field--weight {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .tem-drawerHead {
    gap: 12px;
  }

  .tem-drawerHead__iconWrap {
    width: 40px;
    height: 40px;
  }

  .tem-drawerHead__title {
    font-size: 17px;
  }

  .tem-drawerHead__subtitle {
    font-size: 11px;
  }

  .tem-sidebar {
    max-height: 220px;
  }

  .tem-sidebar__header {
    padding: 12px 16px;
  }

  .tem-sidebar__infoCard {
    padding: 12px 16px;
    margin: 8px;
  }

  .tem-sidebar__sectionTitle {
    padding: 10px 16px 6px;
  }

  .tem-sidebar__dimItem {
    flex: 1 1 100%;
    min-width: auto;
  }

  .tem-panel__body {
    padding: 16px;
  }

  .tem-statsGrid {
    grid-template-columns: 1fr;
  }

  .tem-qItem__options {
    flex-direction: column;
    gap: 12px;
  }

  .tem-qItem__option {
    width: 100%;
    min-width: auto;
  }

  .tem-qItem__option--scale {
    width: 100%;
    min-width: auto;
  }

  .tem-qItem__option--weight {
    width: 100%;
    flex: 1;
    min-width: auto;
  }

  .tem-qItem__select {
    min-width: auto;
    width: 100%;
  }

  .tem-footer {
    flex-direction: column;
    gap: 12px;
  }

  .tem-footer__validation {
    width: 100%;
    justify-content: center;
  }

  .tem-footer__actions {
    width: 100%;
    justify-content: stretch;
  }

  .tem-footer__cancelBtn,
  .tem-footer__previewBtn,
  .tem-footer__saveBtn {
    flex: 1;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .tem-sidebar__dimItem {
    padding: 10px;
  }

  .tem-sidebar__dimName {
    font-size: 12px;
  }

  .tem-panel__header {
    padding: 16px;
  }

  .tem-panel__iconBox {
    width: 36px;
    height: 36px;
  }

  .tem-panel__title {
    font-size: 14px;
  }

  .tem-panel__nav {
    width: 100%;
    justify-content: center;
    order: 1;
  }

  .tem-questions__header {
    flex-wrap: wrap;
    gap: 10px;
  }

  .tem-questions__headerRight {
    width: 100%;
    justify-content: space-between;
  }

  .tem-questions__addBtn {
    flex: 1;
    justify-content: center;
  }

  .tem-qItem__header {
    flex-wrap: wrap;
  }

  .tem-footer__cancelBtn,
  .tem-footer__previewBtn,
  .tem-footer__saveBtn {
    padding: 10px 16px;
    font-size: 13px;
  }
}

/* Inline confirm dialog styles */
.tem-confirmOverlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  z-index: 1200;
}
.tem-confirmBox {
  width: 420px;
  max-width: calc(100% - 32px);
  background: #fff;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 12px 40px rgba(2, 6, 23, 0.35);
  text-align: center;
}
.tem-confirmBox__title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
}
.tem-confirmBox__text {
  font-size: 14px;
  color: #475569;
  margin-bottom: 16px;
}
.tem-confirmBox__actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}
.tem-confirmBox__btn {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-weight: 700;
  cursor: pointer;
}
.tem-confirmBox__btn--primary {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #fff;
  border: none;
}
.tem-confirmBox__btn--danger {
  background: #fff5f5;
  border-color: #fecaca;
  color: #b91c1c;
}
</style>
