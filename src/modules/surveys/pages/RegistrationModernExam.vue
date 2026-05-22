<template>
  <AppLoading v-if="loading" />

  <AppBaseList v-else :title="title" :routes="routes">
    <template #actions>
      <AppButton variant="secondary" outlined @click="goBackToFlow">
        <AppIcon icon="arrow-left" class="me-2" />
        Volver al proceso
      </AppButton>
    </template>

    <template #content>
      <div class="registration-exam-page" :style="{ '--shell-h': shellHeight + 'px' }">
        <AppCard v-if="loadError" class="registration-exam-page__feedbackCard">
          <template #body>
            <div class="registration-exam-page__feedback">
              <div class="registration-exam-page__feedbackIcon registration-exam-page__feedbackIcon--danger">
                <AppIcon icon="exclamation-circle" />
              </div>

              <div>
                <h2>No pudimos cargar el examen</h2>
                <p>{{ loadError }}</p>
              </div>

              <AppButton @click="goBackToFlow">Regresar</AppButton>
            </div>
          </template>
        </AppCard>

        <template v-else-if="examState === 'completed' && !isSummaryMode">
          <AppCard class="registration-exam-page__resultCard">
            <template #body>
              <div class="registration-exam-page__resultBody">
                <div class="registration-exam-page__resultTop">
                  <div class="registration-exam-page__resultIconWrap registration-exam-page__resultIconWrap--success">
                    <AppIcon icon="check-circle" />
                  </div>
                  <div class="registration-exam-page__resultHeading">
                    <h2>¡Examen completado!</h2>
                    <p>Tus respuestas quedaron guardadas. El paso ya aparece como finalizado dentro del flujo de admisión.</p>
                  </div>
                </div>

                <div v-if="examHasScoring" class="registration-exam-page__scoreBoard">
                  <div class="registration-exam-page__scoreMain">
                    <span class="registration-exam-page__scoreValue">{{ examScore }}</span>
                    <span class="registration-exam-page__scoreMax">/ {{ examTotalScore }} pts</span>
                  </div>
                  <div v-if="examScorePercent != null" class="registration-exam-page__scorePct">{{ examScorePercent }}%</div>
                  <div class="registration-exam-page__scoreLabel">Puntaje obtenido</div>
                </div>

                <div class="registration-exam-page__resultStats">
                  <div class="registration-exam-page__resultStat">
                    <strong>{{ answeredCount }}</strong>
                    <span>Respondidas</span>
                  </div>
                  <div class="registration-exam-page__resultStat">
                    <strong>{{ pendingCount }}</strong>
                    <span>Sin responder</span>
                  </div>
                  <div class="registration-exam-page__resultStat">
                    <strong>{{ progressPercentage }}%</strong>
                    <span>Completado</span>
                  </div>
                </div>

                <AppButton @click="goBackToFlow">
                  <AppIcon icon="arrow-left" class="me-2" />
                  Volver al proceso
                </AppButton>
              </div>
            </template>
          </AppCard>
        </template>

        <template v-else>
          <header ref="stickyShellRef" class="registration-exam-page__stickyShell">
            <section class="registration-exam-page__topbar">
              <div class="registration-exam-page__topbarMain">
                <button type="button" class="registration-exam-page__menuButton" @click="showSidebar = true">
                  <AppIcon icon="bars" />
                </button>

                <div class="registration-exam-page__titleBlock">
                  <h1>{{ examTitle }}</h1>
                  <p>
                    {{ examContext?.programName || 'Proceso de admisión' }}
                    <span v-if="examContext?.campusName">· {{ examContext.campusName }}</span>
                  </p>
                </div>
              </div>

              <div class="registration-exam-page__topbarActions">
                <div class="registration-exam-page__timerCard">
                  <template v-if="isSummaryMode">
                    <span>Modo de revisión</span>
                    <strong>Completado</strong>
                    <small>Este intento está disponible solo para consulta.</small>
                  </template>
                  <template v-else>
                    <span>Tiempo restante</span>
                    <strong :class="timerToneClass">{{ formatTime(timeRemaining) }}</strong>
                  </template>
                </div>

                <AppButton v-if="!isSummaryMode" class="registration-exam-page__saveButton" @click="handleManualSave">
                  <AppIcon icon="save" class="me-2" />
                  {{ savedNotification ? 'Guardado' : 'Guardar progreso' }}
                </AppButton>
                <AppButton v-else variant="secondary" outlined @click="goBackToFlow">
                  <AppIcon icon="arrow-left" class="me-2" />
                  Volver al proceso
                </AppButton>
              </div>
            </section>

            <section class="registration-exam-page__progressCard">
              <div class="registration-exam-page__progressHeader">
                <span>{{ isSummaryMode ? 'Resumen del intento' : 'Progreso de la evaluación' }}</span>
                <strong>{{ answeredCount }} / {{ totalAnswerableQuestions }} ({{ progressPercentage }}%)</strong>
              </div>

              <div class="registration-exam-page__progressTrack">
                <div class="registration-exam-page__progressFill" :style="{ width: `${progressPercentage}%` }"></div>
              </div>

              <div class="registration-exam-page__progressMeta">
                <span>{{ pendingCount }} pendientes</span>
                <span>{{ flaggedCount }} marcadas</span>
                <span>{{ sectionCount }} secciones</span>
              </div>
            </section>

            <section v-if="isSummaryMode" class="registration-exam-page__reviewBanner">
              <div class="registration-exam-page__reviewBannerCopy">
                <span class="registration-exam-page__badge registration-exam-page__badge--success">Resumen final</span>
                <h2>Revisa tus respuestas registradas</h2>
                <p>El examen ya fue finalizado. Puedes recorrer cada pregunta en modo solo lectura y validar la información enviada.</p>
              </div>

              <div class="registration-exam-page__reviewBannerStats">
                <div class="registration-exam-page__reviewStat">
                  <span>Respondidas</span>
                  <strong>{{ answeredCount }}</strong>
                </div>
                <div class="registration-exam-page__reviewStat">
                  <span>Pendientes</span>
                  <strong>{{ pendingCount }}</strong>
                </div>
                <div v-if="examHasScoring" class="registration-exam-page__reviewStat registration-exam-page__reviewStat--highlight">
                  <span>Puntaje</span>
                  <strong>{{ examScore }} / {{ examTotalScore }}</strong>
                </div>
                <div v-else class="registration-exam-page__reviewStat">
                  <span>Marcadas</span>
                  <strong>{{ flaggedCount }}</strong>
                </div>
              </div>
            </section>
          </header>

          <div v-if="showSidebar" class="registration-exam-page__overlay" @click="showSidebar = false"></div>

          <div class="registration-exam-page__layout">
            <aside :class="['registration-exam-page__sidebar', { 'is-open': showSidebar }]">
              <div class="registration-exam-page__sidebarHeader">
                <div>
                  <h2>Secciones</h2>
                  <p>{{ answeredCount }} respondidas · {{ pendingCount }} pendientes</p>
                </div>

                <button type="button" class="registration-exam-page__sidebarClose" @click="showSidebar = false">
                  <AppIcon icon="times" />
                </button>
              </div>

              <div class="registration-exam-page__sidebarContent">
                <section v-for="section in visibleSections" :key="section.id" class="registration-exam-page__sidebarSection">
                  <div class="registration-exam-page__sidebarSectionHeader">
                    <div>
                      <strong>{{ section.title }}</strong>
                      <small v-if="section.note">{{ section.note }}</small>
                    </div>
                    <span>{{ section.answered }}/{{ section.total }}</span>
                  </div>

                  <div class="registration-exam-page__questionNav">
                    <button
                      v-for="question in section.questions"
                      :key="question.id"
                      type="button"
                      :class="[
                        'registration-exam-page__questionNavButton',
                        {
                          'is-active': currentQuestion?.id === question.id,
                          'is-answered': question.answered,
                        },
                      ]"
                      @click="goToQuestion(question.id)"
                    >
                      <span>{{ getQuestionNumber(question.id) }}</span>
                      <small>{{ resolveQuestionTypeLabel(question.questionType, question.responseTypeLabel) }}</small>
                      <i v-if="question.flagged" class="registration-exam-page__flagIndicator">!</i>
                    </button>
                  </div>
                </section>

                <section class="registration-exam-page__tipCard">
                  <strong>{{ isSummaryMode ? 'Resumen del intento' : 'Consejos' }}</strong>
                  <ul v-if="isSummaryMode">
                    <li>Usa el mapa para revisar tus respuestas por sección.</li>
                    <li>Las preguntas pendientes te ayudan a identificar lo que faltó completar en el intento.</li>
                    <li>El formulario queda bloqueado porque el examen ya fue finalizado.</li>
                  </ul>
                  <ul v-else>
                    <li>Marca preguntas para revisarlas al final.</li>
                    <li>Usa el mapa para moverte entre secciones.</li>
                    <li>
                      El tiempo disponible para este intento es de
                      {{ durationLabel }}.
                    </li>
                  </ul>
                </section>
              </div>
            </aside>

            <main class="registration-exam-page__main">
              <section class="registration-exam-page__gridCard">
                <div class="registration-exam-page__gridHeader">
                  <h3>Mapa de preguntas</h3>
                  <p>Salta rápidamente a cualquier pregunta visible.</p>
                </div>

                <div class="registration-exam-page__grid">
                  <button
                    v-for="question in visibleQuestions"
                    :key="question.id"
                    type="button"
                    :class="[
                      'registration-exam-page__gridButton',
                      {
                        'is-active': currentQuestion?.id === question.id,
                        'is-answered': question.answered,
                      },
                    ]"
                    @click="goToQuestion(question.id)"
                  >
                    <span>{{ getQuestionNumber(question.id) }}</span>
                    <i v-if="question.flagged" class="registration-exam-page__flagIndicator">!</i>
                  </button>
                </div>
              </section>

              <AppCard ref="questionCardRef" class="registration-exam-page__questionCard">
                <template #body>
                  <div class="registration-exam-page__questionHeader">
                    <div class="registration-exam-page__questionMeta">
                      <span class="registration-exam-page__badge registration-exam-page__badge--primary">
                        Pregunta {{ currentQuestionIndex + 1 }} /
                        {{ totalQuestions }}
                      </span>
                      <!-- <span v-if="currentQuestion?.category" class="registration-exam-page__badge registration-exam-page__badge--neutral">
                        {{ currentQuestion?.category }}
                      </span> -->
                      <!-- <span v-if="currentQuestionResponseLabel" class="registration-exam-page__badge registration-exam-page__badge--info">
                        {{ currentQuestionResponseLabel }}
                      </span> -->
                      <!-- <span v-if="currentQuestion?.code" class="registration-exam-page__badge registration-exam-page__badge--ghost">
                        {{ currentQuestion.code }}
                      </span> -->
                      <span v-if="currentQuestion?.required" class="registration-exam-page__badge registration-exam-page__badge--warning">Obligatoria</span>
                      <span v-if="isCurrentQuestionLocked" class="registration-exam-page__badge registration-exam-page__badge--locked">Solo lectura</span>
                      <span v-if="isSummaryMode && currentQuestion?.answered" class="registration-exam-page__badge registration-exam-page__badge--success">Respuesta guardada</span>
                      <span v-else-if="isSummaryMode" class="registration-exam-page__badge registration-exam-page__badge--warning">Pendiente</span>
                    </div>

                    <button v-if="!isSummaryMode" type="button" class="registration-exam-page__flagButton" @click="toggleFlagCurrentQuestion">
                      <AppIcon :icon="currentQuestion?.flagged ? 'flag' : 'bookmark'" />
                      {{ currentQuestion?.flagged ? 'Marcada' : 'Marcar' }}
                    </button>
                  </div>

                  <div class="registration-exam-page__questionBody">
                    <div class="registration-exam-page__questionTitleRow">
                      <div>
                        <h3>{{ currentQuestion?.question }}</h3>
                        <p v-if="currentQuestion?.description">
                          {{ currentQuestion.description }}
                        </p>
                      </div>

                      <div class="registration-exam-page__questionType">
                        <AppIcon :icon="resolveQuestionTypeMeta(currentQuestion?.questionType).icon" />
                      </div>
                    </div>

                    <section
                      v-if="isSummaryMode && currentQuestionReviewSummary"
                      :class="['registration-exam-page__answerSummary', `registration-exam-page__answerSummary--${currentQuestionReviewSummary.tone}`]"
                    >
                      <span class="registration-exam-page__answerSummaryEyebrow">{{ currentQuestionReviewSummary.label }}</span>
                      <strong>{{ currentQuestionReviewSummary.title }}</strong>
                      <p v-for="line in currentQuestionReviewSummary.lines" :key="line">
                        {{ line }}
                      </p>
                    </section>

                    <AppFormField v-if="currentQuestion?.questionType === 'single_choice'" class="registration-exam-page__field" :label="currentQuestionFieldLabel">
                      <AppAutocomplete
                        input-id="registration-exam-single-choice"
                        :model-value="currentQuestion.selectedOption ?? null"
                        :options="currentQuestionSelectOptions"
                        label="label"
                        :reduce="reduceExamOption"
                        :disabled="isQuestionInteractionLocked"
                        @update:modelValue="handleSingleSelect"
                      />
                    </AppFormField>

                    <AppFormField v-else-if="currentQuestion?.questionType === 'multiple_choice'" class="registration-exam-page__field" :label="currentQuestionFieldLabel">
                      <AppAutocomplete
                        input-id="registration-exam-multiple-choice"
                        :model-value="currentQuestion.selectedOptions ?? []"
                        :options="currentQuestionSelectOptions"
                        label="label"
                        :reduce="reduceExamOption"
                        :multiple="true"
                        :disabled="isQuestionInteractionLocked"
                        @update:modelValue="handleMultipleSelect"
                      />
                    </AppFormField>

                    <AppFormField v-else-if="currentQuestion?.questionType === 'checkbox_group'" class="registration-exam-page__field" :label="currentQuestionFieldLabel">
                      <div class="registration-exam-page__checkboxGroup">
                        <label v-for="option in currentQuestion?.options ?? []" :key="option.id" class="registration-exam-page__checkboxItem">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            :checked="isCheckboxOptionSelected(option.id)"
                            :disabled="isQuestionInteractionLocked"
                            @change="toggleCheckboxOption(option.id)"
                          />

                          <span class="registration-exam-page__checkboxCopy">
                            <strong>{{ option.text }}</strong>
                            <small v-if="option.helperText">{{ option.helperText }}</small>
                          </span>
                        </label>
                      </div>
                    </AppFormField>

                    <AppFormField v-else-if="currentQuestion?.questionType === 'boolean'" class="registration-exam-page__field" :label="currentQuestionFieldLabel">
                      <AppAutocomplete
                        input-id="registration-exam-boolean"
                        :model-value="currentQuestion.selectedOption ?? null"
                        :options="currentQuestionSelectOptions"
                        label="label"
                        :reduce="reduceExamOption"
                        :clearable="false"
                        :disabled="isQuestionInteractionLocked"
                        @update:modelValue="handleBooleanSelect"
                      />
                    </AppFormField>

                    <AppFormField v-else-if="currentQuestion?.questionType === 'signature'" class="registration-exam-page__field" :label="currentQuestionFieldLabel">
                      <RegistrationExamSignaturePad :model-value="currentQuestion?.answerSignature || ''" :disabled="isQuestionInteractionLocked" @update:modelValue="handleSignatureAnswer" />
                    </AppFormField>

                    <div v-else-if="currentQuestion?.questionType === 'file'" class="registration-exam-page__field registration-exam-page__fileField">
                      <div v-if="isQuestionInteractionLocked" class="registration-exam-page__fileReadonly">
                        <div class="registration-exam-page__fileReadonlyIcon">
                          <AppIcon icon="file-alt" />
                        </div>

                        <div class="registration-exam-page__fileReadonlyCopy">
                          <strong>{{ currentQuestion?.answerFileName || 'Sin archivo cargado' }}</strong>
                          <a v-if="currentQuestion?.answerFileUrl" :href="currentQuestion.answerFileUrl" target="_blank" rel="noreferrer">Ver archivo actual</a>
                          <span v-else>Esta pregunta no admite cambios en este intento.</span>
                        </div>
                      </div>

                      <AppAttachmentDropzone
                        v-else
                        :model-value="currentQuestion?.answerFile ?? null"
                        :certificate-url="currentQuestion?.answerFileUrl || ''"
                        :is-title="currentQuestionFieldLabel"
                        :is-helper="currentQuestionHint || 'PDF, JPG, PNG, DOC o DOCX. Máximo 5MB.'"
                        @update:modelValue="handleFileAnswer"
                      />

                      <div v-if="currentQuestion?.answerFileName" class="registration-exam-page__fileMeta">
                        <strong>Archivo seleccionado</strong>
                        <span>{{ currentQuestion.answerFileName }}</span>
                      </div>
                    </div>

                    <AppFormField v-else class="registration-exam-page__field" :label="currentQuestionFieldLabel">
                      <AppVoiceInput
                        v-if="currentQuestion?.questionType === 'long_text'"
                        :model-value="currentQuestion?.answerText || ''"
                        textareaClass="form-control registration-exam-page__textarea"
                        :rows="7"
                        :disabled="isQuestionInteractionLocked"
                        :placeholder="currentQuestion?.placeholder || 'Escribe tu respuesta...'"
                        @update:modelValue="handleTextAnswer"
                      />

                      <input
                        v-else-if="currentQuestion?.questionType === 'datetime'"
                        class="form-control registration-exam-page__input"
                        type="datetime-local"
                        :disabled="isQuestionInteractionLocked"
                        :placeholder="currentQuestion?.placeholder || 'Escribe tu respuesta...'"
                        :value="currentQuestion?.answerText || ''"
                        @input="handleTextInput"
                      />

                      <AppInput
                        v-else
                        :model-value="currentQuestion?.answerText || ''"
                        :disabled="isQuestionInteractionLocked"
                        :type="resolveProjectInputType(currentQuestion?.questionType)"
                        :placeholder="currentQuestion?.placeholder || 'Escribe tu respuesta...'"
                        @update:modelValue="handleTextAnswer"
                      />
                    </AppFormField>

                    <p v-if="currentQuestionHint && currentQuestion?.questionType !== 'file'" class="registration-exam-page__fieldHint">
                      {{ currentQuestionHint }}
                    </p>

                    <section v-if="currentDependentQuestions.length" class="registration-exam-page__dependentQuestions">
                      <article v-for="dependentQuestion in currentDependentQuestions" :key="dependentQuestion.id" class="registration-exam-page__dependentQuestion">
                        <header class="registration-exam-page__dependentHeader">
                          <div class="registration-exam-page__dependentTitle">
                            <span class="registration-exam-page__badge registration-exam-page__badge--info">Dependiente</span>
                            <h4>{{ dependentQuestion.question }}</h4>
                            <p v-if="dependentQuestion.description">
                              {{ dependentQuestion.description }}
                            </p>
                          </div>

                          <button
                            v-if="!isSummaryMode && dependentQuestion.answered && !isQuestionInteractionLockedFor(dependentQuestion)"
                            type="button"
                            class="registration-exam-page__dependentClear"
                            @click="clearQuestionAnswer(dependentQuestion.id)"
                          >
                            <AppIcon icon="times-circle" />
                            Limpiar
                          </button>
                        </header>

                        <section
                          v-if="isSummaryMode && getQuestionReviewSummary(dependentQuestion)"
                          :class="['registration-exam-page__answerSummary', `registration-exam-page__answerSummary--${getQuestionReviewSummary(dependentQuestion)?.tone}`]"
                        >
                          <span class="registration-exam-page__answerSummaryEyebrow">{{ getQuestionReviewSummary(dependentQuestion)?.label }}</span>
                          <strong>{{ getQuestionReviewSummary(dependentQuestion)?.title }}</strong>
                          <p v-for="line in getQuestionReviewSummary(dependentQuestion)?.lines ?? []" :key="line">
                            {{ line }}
                          </p>
                        </section>

                        <AppFormField v-if="dependentQuestion.questionType === 'single_choice'" class="registration-exam-page__field" :label="getQuestionFieldLabel(dependentQuestion)">
                          <AppAutocomplete
                            :input-id="`registration-exam-dependent-single-${dependentQuestion.id}`"
                            :model-value="dependentQuestion.selectedOption ?? null"
                            :options="getQuestionSelectOptions(dependentQuestion)"
                            label="label"
                            :reduce="reduceExamOption"
                            :disabled="isQuestionInteractionLockedFor(dependentQuestion)"
                            @update:modelValue="(value) => handleSingleSelect(value, dependentQuestion.id)"
                          />
                        </AppFormField>

                        <AppFormField v-else-if="dependentQuestion.questionType === 'multiple_choice'" class="registration-exam-page__field" :label="getQuestionFieldLabel(dependentQuestion)">
                          <AppAutocomplete
                            :input-id="`registration-exam-dependent-multiple-${dependentQuestion.id}`"
                            :model-value="dependentQuestion.selectedOptions ?? []"
                            :options="getQuestionSelectOptions(dependentQuestion)"
                            label="label"
                            :reduce="reduceExamOption"
                            :multiple="true"
                            :disabled="isQuestionInteractionLockedFor(dependentQuestion)"
                            @update:modelValue="(value) => handleMultipleSelect(value, dependentQuestion.id)"
                          />
                        </AppFormField>

                        <AppFormField v-else-if="dependentQuestion.questionType === 'checkbox_group'" class="registration-exam-page__field" :label="getQuestionFieldLabel(dependentQuestion)">
                          <div class="registration-exam-page__checkboxGroup">
                            <label v-for="option in dependentQuestion.options ?? []" :key="option.id" class="registration-exam-page__checkboxItem">
                              <input
                                class="form-check-input"
                                type="checkbox"
                                :checked="isCheckboxOptionSelected(option.id, dependentQuestion.id)"
                                :disabled="isQuestionInteractionLockedFor(dependentQuestion)"
                                @change="toggleCheckboxOption(option.id, dependentQuestion.id)"
                              />

                              <span class="registration-exam-page__checkboxCopy">
                                <strong>{{ option.text }}</strong>
                                <small v-if="option.helperText">{{ option.helperText }}</small>
                              </span>
                            </label>
                          </div>
                        </AppFormField>

                        <AppFormField v-else-if="dependentQuestion.questionType === 'boolean'" class="registration-exam-page__field" :label="getQuestionFieldLabel(dependentQuestion)">
                          <AppAutocomplete
                            :input-id="`registration-exam-dependent-boolean-${dependentQuestion.id}`"
                            :model-value="dependentQuestion.selectedOption ?? null"
                            :options="getQuestionSelectOptions(dependentQuestion)"
                            label="label"
                            :reduce="reduceExamOption"
                            :clearable="false"
                            :disabled="isQuestionInteractionLockedFor(dependentQuestion)"
                            @update:modelValue="(value) => handleBooleanSelect(value, dependentQuestion.id)"
                          />
                        </AppFormField>

                        <AppFormField v-else-if="dependentQuestion.questionType === 'signature'" class="registration-exam-page__field" :label="getQuestionFieldLabel(dependentQuestion)">
                          <RegistrationExamSignaturePad
                            :model-value="dependentQuestion.answerSignature || ''"
                            :disabled="isQuestionInteractionLockedFor(dependentQuestion)"
                            @update:modelValue="(value) => handleSignatureAnswer(value, dependentQuestion.id)"
                          />
                        </AppFormField>

                        <div v-else-if="dependentQuestion.questionType === 'file'" class="registration-exam-page__field registration-exam-page__fileField">
                          <div v-if="isQuestionInteractionLockedFor(dependentQuestion)" class="registration-exam-page__fileReadonly">
                            <div class="registration-exam-page__fileReadonlyIcon">
                              <AppIcon icon="file-alt" />
                            </div>

                            <div class="registration-exam-page__fileReadonlyCopy">
                              <strong>{{ dependentQuestion.answerFileName || 'Sin archivo cargado' }}</strong>
                              <a v-if="dependentQuestion.answerFileUrl" :href="dependentQuestion.answerFileUrl" target="_blank" rel="noreferrer">Ver archivo actual</a>
                              <span v-else>Esta pregunta no admite cambios en este intento.</span>
                            </div>
                          </div>

                          <AppAttachmentDropzone
                            v-else
                            :model-value="dependentQuestion.answerFile ?? null"
                            :certificate-url="dependentQuestion.answerFileUrl || ''"
                            :is-title="getQuestionFieldLabel(dependentQuestion)"
                            :is-helper="getQuestionHint(dependentQuestion) || 'PDF, JPG, PNG, DOC o DOCX. Máximo 5MB.'"
                            @update:modelValue="(file) => handleFileAnswer(file, dependentQuestion.id)"
                          />

                          <div v-if="dependentQuestion.answerFileName" class="registration-exam-page__fileMeta">
                            <strong>Archivo seleccionado</strong>
                            <span>{{ dependentQuestion.answerFileName }}</span>
                          </div>
                        </div>

                        <AppFormField v-else class="registration-exam-page__field" :label="getQuestionFieldLabel(dependentQuestion)">
                          <AppVoiceInput
                            v-if="dependentQuestion.questionType === 'long_text'"
                            :model-value="dependentQuestion.answerText || ''"
                            textareaClass="form-control registration-exam-page__textarea"
                            :rows="6"
                            :disabled="isQuestionInteractionLockedFor(dependentQuestion)"
                            :placeholder="dependentQuestion.placeholder || 'Escribe tu respuesta...'"
                            @update:modelValue="(value) => handleTextAnswer(value, dependentQuestion.id)"
                          />

                          <input
                            v-else-if="dependentQuestion.questionType === 'datetime'"
                            class="form-control registration-exam-page__input"
                            type="datetime-local"
                            :disabled="isQuestionInteractionLockedFor(dependentQuestion)"
                            :placeholder="dependentQuestion.placeholder || 'Escribe tu respuesta...'"
                            :value="dependentQuestion.answerText || ''"
                            @input="(event) => handleTextInput(event, dependentQuestion.id)"
                          />

                          <AppInput
                            v-else
                            :model-value="dependentQuestion.answerText || ''"
                            :disabled="isQuestionInteractionLockedFor(dependentQuestion)"
                            :type="resolveProjectInputType(dependentQuestion.questionType)"
                            :placeholder="dependentQuestion.placeholder || 'Escribe tu respuesta...'"
                            @update:modelValue="(value) => handleTextAnswer(value, dependentQuestion.id)"
                          />
                        </AppFormField>

                        <p v-if="getQuestionHint(dependentQuestion) && dependentQuestion.questionType !== 'file'" class="registration-exam-page__fieldHint">
                          {{ getQuestionHint(dependentQuestion) }}
                        </p>
                      </article>
                    </section>
                  </div>

                  <div v-if="!isSummaryMode" class="registration-exam-page__autoSave">
                    <AppIcon icon="sync" />
                    <span>Tu respuesta se guarda al avanzar a la siguiente pregunta.</span>
                  </div>

                  <div class="registration-exam-page__questionActions">
                    <div class="registration-exam-page__questionActionsGroup">
                      <AppButton variant="secondary" outlined :disabled="currentQuestionIndex === 0" @click="goToPreviousQuestion">
                        <AppIcon icon="arrow-left" class="me-2" />
                        Anterior
                      </AppButton>

                      <AppButton v-if="!isSummaryMode && currentQuestion?.answered" variant="secondary" outlined @click="clearCurrentAnswer">
                        <AppIcon icon="times-circle" class="me-2" />
                        Limpiar
                      </AppButton>
                    </div>

                    <div class="registration-exam-page__questionActionsGroup">
                      <AppButton v-if="currentQuestionIndex < totalQuestions - 1" @click="goToNextQuestion">
                        Siguiente
                        <AppIcon icon="arrow-right" class="ms-2" />
                      </AppButton>

                      <AppButton v-else-if="!isSummaryMode" variant="success" @click="showFinishDialog = true">
                        <AppIcon icon="flag-checkered" class="me-2" />
                        Finalizar examen
                      </AppButton>

                      <AppButton v-else variant="secondary" outlined @click="goBackToFlow">
                        <AppIcon icon="arrow-left" class="me-2" />
                        Volver al proceso
                      </AppButton>
                    </div>
                  </div>
                </template>
              </AppCard>
            </main>
          </div>

          <footer class="registration-exam-page__footer">
            <div class="registration-exam-page__footerStats">
              <span><i class="registration-exam-page__legend registration-exam-page__legend--success"></i>{{ answeredCount }} respondidas</span>
              <span><i class="registration-exam-page__legend registration-exam-page__legend--warning"></i>{{ flaggedCount }} marcadas</span>
              <span><i class="registration-exam-page__legend registration-exam-page__legend--neutral"></i>{{ pendingCount }} pendientes</span>
            </div>

            <AppButton v-if="!isSummaryMode" variant="success" @click="showFinishDialog = true"> Finalizar evaluación </AppButton>
            <AppButton v-else variant="secondary" outlined @click="goBackToFlow"> Volver al proceso </AppButton>
          </footer>
        </template>

        <AppModal v-model="showFinishDialog" size="lg">
          <AppConfirmActionModal v-if="showFinishDialog" title="Finalizar examen" @confirmAction="finishExam">
            <template #content>
              <div class="registration-exam-page__confirmContent">
                <div class="registration-exam-page__feedbackIcon registration-exam-page__feedbackIcon--danger">
                  <AppIcon icon="exclamation-circle" />
                </div>

                <div class="registration-exam-page__confirmText">
                  <h4>¿Deseas finalizar el examen?</h4>
                  <p>Has respondido {{ answeredCount }} de {{ totalAnswerableQuestions }} preguntas.</p>
                  <p v-if="pendingCount">Aún quedan {{ pendingCount }} preguntas visibles pendientes.</p>
                  <p v-else>Todas las preguntas visibles ya fueron respondidas.</p>
                </div>
              </div>
            </template>
          </AppConfirmActionModal>
        </AppModal>
      </div>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';
import { useMeta } from 'vue-meta';
import { useRoute, useRouter } from 'vue-router';

import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppConfirmActionModal from '../../../shared/components/Modal/AppConfirmActionModal.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppAttachmentDropzone from '../../../shared/components/Forms/AppAttachmentDropzone.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppInput from '../../../shared/components/Forms/AppInput.vue';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';
import { ToastService } from '../../../shared/services/toast.service';
import RegistrationExamSignaturePad from '../components/RegistrationExamSignaturePad.vue';
import type { StepDto } from '../dtos/convocationWithSteps.dto';
import type { ChecklistDiligenciadoDto, ResponderChecklistDiligenciadoPayload } from '../dtos/checklistDiligenciado.dto';
import { GetResponseTypesService } from '../services/checklist/getResponseTypes.service';
import { GetRegistrationExamService } from '../services/getRegistrationExam.service';
import { GetConvocationWithStepsService } from '../services/getConvocationWithSteps.service';
import { CreateChecklistDiligenciadoService } from '../services/createChecklistDiligenciado.service';
import { GetChecklistDiligenciadoService } from '../services/getChecklistDiligenciado.service';
import { StartChecklistDiligenciadoService } from '../services/startChecklistDiligenciado.service';
import { UpdateChecklistDiligenciadoEstadoService } from '../services/updateChecklistDiligenciadoEstado.service';
import { RespondChecklistDiligenciadoService } from '../services/respondChecklistDiligenciado.service';
import { UploadChecklistDiligenciadoArchivoService } from '../services/uploadChecklistDiligenciadoArchivo.service';
import type { RegistrationExamQuestion, RegistrationExamState } from '../utils/registrationExam.utils';
import {
  REGISTRATION_EXAM_DURATION_SECONDS,
  calculateRegistrationExamRemainingSeconds,
  formatRegistrationExamDuration,
  hasRegistrationExamAnswer,
  loadRegistrationExamProgress,
  mapRegistrationExamBackendStatusToState,
  normalizeRegistrationExamBackendStatus,
  parseRegistrationExamDurationSeconds,
  saveRegistrationExamProgress,
} from '../utils/registrationExam.utils';
import type { RegistrationExamDefinition, RegistrationExamSection } from '../utils/registrationExam.mapper';
import { normalizeRegistrationExamDefinition } from '../utils/registrationExam.mapper';
import { MODERN_REGISTRATION_ROUTE_NAME, buildModernRegistrationQuery } from '../utils/registrationFlow.utils';

const getConvocationWithStepsService = new GetConvocationWithStepsService();
const getRegistrationExamService = new GetRegistrationExamService();
const getResponseTypesService = new GetResponseTypesService();
const createChecklistDiligenciadoService = new CreateChecklistDiligenciadoService();
const getChecklistDiligenciadoService = new GetChecklistDiligenciadoService();
const startChecklistDiligenciadoService = new StartChecklistDiligenciadoService();
const updateChecklistDiligenciadoEstadoService = new UpdateChecklistDiligenciadoEstadoService();
const respondChecklistDiligenciadoService = new RespondChecklistDiligenciadoService();
const uploadChecklistDiligenciadoArchivoService = new UploadChecklistDiligenciadoArchivoService();
const toastService = new ToastService();

const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

interface ExamStepContext {
  curriculumOfferingId: number;
  checklistId: number;
  checklistTitle: string;
  programName: string;
  campusName: string;
  rowId?: number | string | null;
}

interface RegistrationExamReviewSummary {
  label: string;
  title: string;
  lines: string[];
  tone: 'success' | 'warning' | 'neutral';
}

const questionTypeMetaMap = {
  single_choice: {
    label: 'Selección única',
    icon: 'check-circle',
  },
  multiple_choice: {
    label: 'Selección múltiple',
    icon: 'tasks',
  },
  checkbox_group: {
    label: 'Checkbox',
    icon: 'tasks',
  },
  boolean: {
    label: 'Sí / No',
    icon: 'adjust',
  },
  short_text: {
    label: 'Texto corto',
    icon: 'edit',
    inputType: 'text',
  },
  long_text: {
    label: 'Texto abierto',
    icon: 'align-left',
  },
  number: {
    label: 'Numérica',
    icon: 'hashtag',
    inputType: 'number',
  },
  email: {
    label: 'Correo',
    icon: 'envelope',
    inputType: 'email',
  },
  date: {
    label: 'Fecha',
    icon: 'calendar',
    inputType: 'date',
  },
  datetime: {
    label: 'Fecha y hora',
    icon: 'clock',
    inputType: 'datetime-local',
  },
  file: {
    label: 'Archivo',
    icon: 'file-alt',
  },
  signature: {
    label: 'Firma',
    icon: 'file-signature',
  },
} as const;

const normalizeText = (value?: string | null) =>
  String(value ?? '')
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const cloneQuestion = (question: RegistrationExamQuestion): RegistrationExamQuestion => ({
  ...question,
  options: question.options?.map((option) => ({ ...option })),
  selectedOptions: [...(question.selectedOptions ?? [])],
  requiredOptionIds: [...(question.requiredOptionIds ?? [])],
  dependsOnOptionIds: [...(question.dependsOnOptionIds ?? [])],
  answerSignature: question.answerSignature ?? '',
  answerFile: question.answerFile ?? null,
  answerFileName: question.answerFileName ?? '',
  answerFileUrl: question.answerFileUrl ?? '',
  answerFileMimeType: question.answerFileMimeType ?? '',
});

const resolveExamContext = (detail?: StepDto['detail']): ExamStepContext | null => {
  if (Array.isArray(detail)) {
    return (detail[0] as ExamStepContext | undefined) ?? null;
  }

  return (detail as ExamStepContext | null | undefined) ?? null;
};

const reduceExamOption = (option: { id: string }) => option.id;
const getQuestionOptionText = (question: RegistrationExamQuestion, optionId?: string | null) =>
  question.options?.find((option) => option.id === String(optionId ?? ''))?.text || String(optionId ?? '');

export default defineComponent({
  name: 'RegistrationModernExamPage',
  components: {
    AppAutocomplete,
    AppAttachmentDropzone,
    AppBaseList,
    AppButton,
    AppCard,
    AppConfirmActionModal,
    AppFormField,
    AppIcon,
    AppInput,
    AppLoading,
    AppModal,
    AppVoiceInput,
    RegistrationExamSignaturePad,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    useMeta({ title: 'Examen de evaluación' });

    const loading = ref(true);
    const loadError = ref('');
    const title = ref('Examen de evaluación');
    const routes = ref<any[]>([{ name: title.value }]);

    const showSidebar = ref(false);
    const showGrid = ref(false);
    const showFinishDialog = ref(false);
    const savedNotification = ref(false);

    const stickyShellRef = ref<HTMLElement | null>(null);
    const questionCardRef = ref<{ $el: HTMLElement } | null>(null);
    const shellHeight = ref(0);
    let shellObserver: ResizeObserver | null = null;

    const examState = ref<RegistrationExamState>('initial');
    const timeRemaining = ref(REGISTRATION_EXAM_DURATION_SECONDS);
    const examDurationSeconds = ref(REGISTRATION_EXAM_DURATION_SECONDS);
    const currentQuestionId = ref<number | null>(null);
    const allQuestions = ref<RegistrationExamQuestion[]>([]);
    const timerId = ref<number | null>(null);

    const examDefinition: Ref<RegistrationExamDefinition | null> = ref(null);
    const examStep: Ref<StepDto | null> = ref(null);
    const examContext = ref<ExamStepContext | null>(null);
    const checklistAttempt = ref<ChecklistDiligenciadoDto | null>(null);

    const parseRouteId = (param: unknown) => Number.parseInt(String(param ?? 0), 10) || 0;
    const parseNullableId = (value: unknown) => {
      const normalizedValue = Array.isArray(value) ? value[0] : value;
      const parsedValue = Number.parseInt(String(normalizedValue ?? ''), 10);

      return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
    };
    const resolveAuthenticatedUserId = () => {
      try {
        const rawUser = localStorage.getItem('user');
        const user = rawUser ? JSON.parse(rawUser) : null;

        return parseNullableId(user?.id ?? user?.people?.userId ?? user?.people?.user?.id);
      } catch {
        return 0;
      }
    };

    const institutionId = computed(() => parseRouteId(route.params.institutionId ?? route.query.institutionId));
    const convocationId = computed(() => parseRouteId(route.params.convocationId ?? route.query.convocationId));
    const convocationEnrolId = computed(() => parseRouteId(route.params.convocationEnrollId ?? route.query.convocationEnrollId));
    const stepId = computed(() => parseRouteId(route.params.stepId ?? route.query.stepId));
    const isSummaryMode = computed(() => examState.value === 'completed' && normalizeText(String(route.query.mode ?? '')) === 'summary');
    const durationLabel = computed(() => formatRegistrationExamDuration(examDurationSeconds.value));

    const examTitle = computed(() => examDefinition.value?.title || examContext.value?.checklistTitle || examStep.value?.title || 'Examen de evaluación');
    const timerToneClass = computed(() => {
      if (timeRemaining.value <= 300) return 'is-danger';
      if (timeRemaining.value <= 900) return 'is-warning';

      return '';
    });

    const questionMap = computed<Record<number, RegistrationExamQuestion>>(() =>
      allQuestions.value.reduce(
        (accumulator, question) => ({
          ...accumulator,
          [question.id]: question,
        }),
        {}
      )
    );

    const isQuestionVisible = (question: RegistrationExamQuestion) => {
      if (!question.parentQuestionId || !(question.dependsOnOptionIds ?? []).length) return true;

      const parentQuestion = questionMap.value[question.parentQuestionId];
      if (!parentQuestion) return false;

      if (parentQuestion.questionType === 'multiple_choice' || parentQuestion.questionType === 'checkbox_group') {
        return (question.dependsOnOptionIds ?? []).some((optionId) => (parentQuestion.selectedOptions ?? []).includes(optionId));
      }

      return (question.dependsOnOptionIds ?? []).includes(String(parentQuestion.selectedOption ?? ''));
    };

    const visibleAnswerableQuestions = computed(() => allQuestions.value.filter((question) => isQuestionVisible(question)));
    const visibleQuestions = computed(() => visibleAnswerableQuestions.value.filter((question) => !question.parentQuestionId));
    const totalQuestions = computed(() => visibleQuestions.value.length);
    const totalAnswerableQuestions = computed(() => visibleAnswerableQuestions.value.length);
    const answeredCount = computed(() => visibleAnswerableQuestions.value.filter((question) => question.answered).length);
    const pendingCount = computed(() => totalAnswerableQuestions.value - answeredCount.value);
    const flaggedCount = computed(() => visibleAnswerableQuestions.value.filter((question) => question.flagged).length);
    const progressPercentage = computed(() => (totalAnswerableQuestions.value ? Math.round((answeredCount.value / totalAnswerableQuestions.value) * 100) : 0));
    const sectionCount = computed(() => visibleSections.value.length);

    const examScore = computed(() => {
      let total = 0;
      for (const question of visibleAnswerableQuestions.value) {
        if (!question.answered || !question.options?.length) continue;
        switch (question.questionType) {
          case 'single_choice':
          case 'boolean': {
            const opt = question.options.find((o) => o.id === String(question.selectedOption ?? ''));
            if (opt?.score != null) total += opt.score;
            break;
          }
          case 'multiple_choice':
          case 'checkbox_group': {
            const selected = new Set(question.selectedOptions ?? []);
            for (const opt of question.options) {
              if (selected.has(opt.id) && opt.score != null) total += opt.score;
            }
            break;
          }
        }
      }
      return Math.round(total * 100) / 100;
    });

    const examTotalScore = computed(() => examDefinition.value?.totalMaxScore ?? 0);
    const examHasScoring = computed(() => Boolean(examDefinition.value?.hasScoring) && examTotalScore.value > 0);
    const examScorePercent = computed(() => (examHasScoring.value ? Math.round((examScore.value / examTotalScore.value) * 100) : null));

    const currentQuestion = computed(() => visibleQuestions.value.find((question) => question.id === currentQuestionId.value) ?? visibleQuestions.value[0] ?? null);
    const currentQuestionIndex = computed(() => visibleQuestions.value.findIndex((question) => question.id === currentQuestion.value?.id));
    const currentDependentQuestions = computed(() => (currentQuestion.value ? visibleAnswerableQuestions.value.filter((question) => question.parentQuestionId === currentQuestion.value?.id) : []));
    const getQuestionSelectOptions = (question?: RegistrationExamQuestion | null) =>
      (question?.options ?? []).map((option, index) => ({
        ...option,
        label: `${alphabet[index] ?? index + 1}. ${option.text}`,
      }));
    const currentQuestionSelectOptions = computed(() => getQuestionSelectOptions(currentQuestion.value));
    const currentQuestionResponseLabel = computed(() => {
      if (!currentQuestion.value) return '';

      return currentQuestion.value.responseTypeLabel || resolveQuestionTypeMeta(currentQuestion.value.questionType).label;
    });
    const isQuestionLocked = (question?: RegistrationExamQuestion | null) => Boolean(question?.readonly || question?.editable === false);
    const isQuestionInteractionLockedFor = (question?: RegistrationExamQuestion | null) => isSummaryMode.value || isQuestionLocked(question);
    const isCurrentQuestionLocked = computed(() => isQuestionLocked(currentQuestion.value));
    const isQuestionInteractionLocked = computed(() => isQuestionInteractionLockedFor(currentQuestion.value));
    const getQuestionFieldLabel = (question?: RegistrationExamQuestion | null) => {
      switch (question?.questionType) {
        case 'single_choice':
        case 'boolean':
          return 'Selecciona una opción';
        case 'multiple_choice':
        case 'checkbox_group':
          return 'Selecciona una o varias opciones';
        case 'signature':
          return 'Firma en el recuadro';
        case 'file':
          return 'Adjunta tu archivo';
        default:
          return 'Tu respuesta';
      }
    };
    const getQuestionHint = (question?: RegistrationExamQuestion | null) => {
      if (!question) return '';

      const hints: string[] = [];

      if (question.minLength || question.maxLength) {
        const pieces = [question.minLength ? `mínimo ${question.minLength} caracteres` : '', question.maxLength ? `máximo ${question.maxLength} caracteres` : ''].filter(Boolean);

        if (pieces.length) hints.push(`Ten en cuenta: ${pieces.join(' y ')}.`);
      }

      if (question.questionType === 'signature') {
        hints.push('Dibuja tu firma dentro del recuadro y usa "Limpiar firma" si necesitas repetirla.');
      }

      if (question.questionType === 'file') {
        hints.push('Adjunta un archivo del dispositivo. El intento lo conservará de forma local mientras conectamos el guardado con backend.');
      }

      if (question.readonly || question.editable === false) {
        hints.push('Esta pregunta está configurada como solo lectura.');
      }

      return hints[0] ?? '';
    };
    const currentQuestionFieldLabel = computed(() => getQuestionFieldLabel(currentQuestion.value));
    const currentQuestionHint = computed(() => getQuestionHint(currentQuestion.value));
    const getQuestionReviewSummary = (question?: RegistrationExamQuestion | null): RegistrationExamReviewSummary | null => {
      if (!question) return null;

      if (!question.answered) {
        return {
          label: 'Pregunta pendiente',
          title: 'No se registró respuesta en este intento.',
          lines: ['Puedes usar este resumen para identificar qué preguntas quedaron sin contestar antes del cierre.'],
          tone: 'warning',
        };
      }

      switch (question.questionType) {
        case 'single_choice':
        case 'boolean':
          return {
            label: 'Respuesta registrada',
            title: 'Opción seleccionada',
            lines: [getQuestionOptionText(question, question.selectedOption)],
            tone: 'success',
          };
        case 'multiple_choice':
        case 'checkbox_group':
          return {
            label: 'Respuesta registrada',
            title: 'Opciones seleccionadas',
            lines: (question.selectedOptions ?? []).map((optionId) => getQuestionOptionText(question, optionId)).filter(Boolean),
            tone: 'success',
          };
        case 'file':
          return {
            label: 'Respuesta registrada',
            title: 'Archivo adjunto',
            lines: [question.answerFileName || 'Se registró un archivo en esta respuesta.'],
            tone: 'success',
          };
        case 'signature':
          return {
            label: 'Respuesta registrada',
            title: 'Firma guardada',
            lines: ['Se capturó una firma para esta pregunta.'],
            tone: 'success',
          };
        default: {
          const answerText = String(question.answerText ?? '').trim();

          return {
            label: 'Respuesta registrada',
            title: question.questionType === 'date' || question.questionType === 'datetime' ? 'Fecha registrada' : 'Texto registrado',
            lines: answerText ? [answerText] : ['Se registró una respuesta en esta pregunta.'],
            tone: 'success',
          };
        }
      }
    };
    const currentQuestionReviewSummary = computed<RegistrationExamReviewSummary | null>(() => getQuestionReviewSummary(currentQuestion.value));

    const visibleSections = computed(
      () =>
        (examDefinition.value?.sections ?? [])
          .map((section) => {
            const sectionQuestions = visibleQuestions.value.filter((question) => question.categoryId === section.id);

            if (!sectionQuestions.length) return null;

            return {
              ...(section as RegistrationExamSection),
              questions: sectionQuestions,
              total: sectionQuestions.length,
              answered: sectionQuestions.filter((question) => question.answered).length,
            };
          })
          .filter(Boolean) as Array<
          RegistrationExamSection & {
            questions: RegistrationExamQuestion[];
            total: number;
            answered: number;
          }
        >
    );

    const backRoute = computed(() => {
      const queryWithoutMode = Object.fromEntries(Object.entries(route.query).filter(([key]) => key !== 'mode'));

      return {
        name: MODERN_REGISTRATION_ROUTE_NAME,
        params: {
          institutionId: institutionId.value,
          convocationId: convocationId.value,
          convocationEnrollId: convocationEnrolId.value,
        },
        query: {
          ...queryWithoutMode,
          ...buildModernRegistrationQuery(),
          stepId: String(stepId.value),
        },
      };
    });

    const resolveQuestionTypeMeta = (questionType?: RegistrationExamQuestion['questionType']) => {
      if (!questionType) return questionTypeMetaMap.single_choice;

      return questionTypeMetaMap[questionType];
    };

    const resolveProjectInputType = (questionType?: RegistrationExamQuestion['questionType']) => {
      switch (questionType) {
        case 'email':
          return 'email';
        case 'number':
          return 'number';
        case 'date':
          return 'date';
        default:
          return 'text';
      }
    };

    const resolveQuestionTypeLabel = (questionType?: RegistrationExamQuestion['questionType'], responseTypeLabel?: string) => responseTypeLabel || resolveQuestionTypeMeta(questionType).label;

    const getQuestionNumber = (questionId: number) => {
      const index = visibleQuestions.value.findIndex((question) => question.id === questionId);
      return index >= 0 ? index + 1 : '-';
    };

    const createEmptyAnswerState = () => ({
      selectedOption: null,
      selectedOptions: [] as string[],
      answerText: '',
      answerBoolean: null,
      answerSignature: '',
      answerFile: null as File | null,
      answerFileName: '',
      answerFileUrl: '',
      answerFileMimeType: '',
    });

    const readFileAsDataUrl = (file: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ''));
        reader.onerror = () => reject(reader.error ?? new Error('No fue posible leer el archivo seleccionado.'));
        reader.readAsDataURL(file);
      });

    const saveProgress = () => {
      if (!convocationEnrolId.value || !stepId.value) return;

      saveRegistrationExamProgress(convocationEnrolId.value, stepId.value, {
        examState: examState.value,
        questions: allQuestions.value.map((question) => ({
          ...cloneQuestion(question),
          answered: hasRegistrationExamAnswer(question),
        })),
        currentQuestionIndex: Math.max(currentQuestionIndex.value, 0),
        currentQuestionId: currentQuestion.value?.id ?? null,
        timeRemaining: timeRemaining.value,
      });
    };

    const resolveAttemptId = () => [checklistAttempt.value?.id, route.query.checklistDiligenciadoId, examContext.value?.rowId].map((value) => parseNullableId(value)).find((value) => value > 0) ?? 0;
    const normalizeOptionId = (optionId?: string | number | null) => {
      const parsedOptionId = Number.parseInt(String(optionId ?? ''), 10);

      return Number.isFinite(parsedOptionId) && parsedOptionId > 0 ? parsedOptionId : null;
    };
    const normalizeOptionIds = (optionIds: Array<string | number> = []) => optionIds.map((optionId) => normalizeOptionId(optionId)).filter((optionId): optionId is number => optionId !== null);
    const isFileAnswerQuestion = (question: RegistrationExamQuestion) => question.responseTypeId === 9 || question.questionType === 'file';
    const isMultipleAnswerQuestion = (question: RegistrationExamQuestion) =>
      question.responseTypeId === 3 || question.responseTypeId === 5 || question.questionType === 'multiple_choice' || question.questionType === 'checkbox_group';
    const isSingleOptionAnswerQuestion = (question: RegistrationExamQuestion) => question.responseTypeId === 4 || question.questionType === 'single_choice' || question.questionType === 'boolean';
    const buildChecklistAnswerPayload = (question: RegistrationExamQuestion): ResponderChecklistDiligenciadoPayload | null => {
      if (isFileAnswerQuestion(question)) return null;

      const payload: ResponderChecklistDiligenciadoPayload = {
        preguntaId: question.id,
      };

      if (isMultipleAnswerQuestion(question)) {
        const selectedOptions = normalizeOptionIds(question.selectedOptions ?? []);
        const selectedOptionId = normalizeOptionId(question.selectedOption);
        payload.opcionesIds = selectedOptions.length ? selectedOptions : selectedOptionId ? [selectedOptionId] : [];
        return payload;
      }

      if (isSingleOptionAnswerQuestion(question)) {
        payload.opcionRespuestaId = normalizeOptionId(question.selectedOption);
        return payload;
      }

      if (question.questionType === 'signature') {
        payload.valor = String(question.answerSignature ?? '');
        return payload;
      }

      payload.valor = String(question.answerText ?? '');

      return payload;
    };
    const persistChecklistAnswer = async (question: RegistrationExamQuestion) => {
      const attemptId = resolveAttemptId();
      if (isSummaryMode.value || question.readonly || question.editable === false) return;

      if (!attemptId) {
        console.warn('No se pudo guardar la respuesta porque no hay checklistDiligenciadoId disponible.', {
          preguntaId: question.id,
          rowId: examContext.value?.rowId,
          queryChecklistDiligenciadoId: route.query.checklistDiligenciadoId,
        });
        return;
      }

      try {
        if (isFileAnswerQuestion(question)) {
          if (!question.answerFile) return;

          const response = await uploadChecklistDiligenciadoArchivoService.run(attemptId, question.answerFile);
          checklistAttempt.value = {
            ...(checklistAttempt.value ?? ({} as ChecklistDiligenciadoDto)),
            ...(response ?? ({} as ChecklistDiligenciadoDto)),
            id: attemptId,
          };
          return;
        }

        const payload = buildChecklistAnswerPayload(question);
        if (!payload) return;

        const response = await respondChecklistDiligenciadoService.run(attemptId, payload);
        checklistAttempt.value = {
          ...(checklistAttempt.value ?? ({} as ChecklistDiligenciadoDto)),
          ...(response ?? ({} as ChecklistDiligenciadoDto)),
          id: attemptId,
        };
      } catch (error) {
        console.error('No fue posible guardar la respuesta del examen.', error);
        toastService.show('No fue posible guardar la respuesta en el servidor.', 'error');
      }
    };
    const persistCurrentQuestionAnswer = async () => {
      await nextTick();
      if (!currentQuestion.value) return;

      const questionsToPersist = [currentQuestion.value, ...currentDependentQuestions.value];

      for (const question of questionsToPersist) {
        await persistChecklistAnswer(question);
      }
    };

    const updateQuestion = (questionId: number, updater: (question: RegistrationExamQuestion) => RegistrationExamQuestion) => {
      let persistedQuestion: RegistrationExamQuestion | null = null;

      allQuestions.value = allQuestions.value.map((question) => {
        if (question.id !== questionId) return question;

        const updatedQuestion = updater(cloneQuestion(question));
        const normalizedQuestion = {
          ...updatedQuestion,
          answered: hasRegistrationExamAnswer(updatedQuestion),
        };
        persistedQuestion = normalizedQuestion;

        return normalizedQuestion;
      });

      return persistedQuestion;
    };

    const getTargetQuestion = (questionId?: number | null) => {
      const targetQuestionId = questionId ?? currentQuestion.value?.id;

      return allQuestions.value.find((question) => question.id === targetQuestionId) ?? null;
    };

    const handleSingleSelect = (optionId: string | null, questionId?: number) => {
      const targetQuestion = getTargetQuestion(questionId);
      if (!targetQuestion) return;

      updateQuestion(targetQuestion.id, (question) => ({
        ...question,
        ...createEmptyAnswerState(),
        selectedOption: optionId ?? null,
      }));
    };

    const handleMultipleSelect = (optionIds: string[] | null, questionId?: number) => {
      const targetQuestion = getTargetQuestion(questionId);
      if (!targetQuestion) return;

      updateQuestion(targetQuestion.id, (question) => ({
        ...question,
        ...createEmptyAnswerState(),
        selectedOptions: Array.isArray(optionIds) ? optionIds.map((item) => String(item)) : [],
      }));
    };

    const handleBooleanSelect = (optionId: string | null, questionId?: number) => {
      const targetQuestion = getTargetQuestion(questionId);
      if (!targetQuestion) return;

      const currentLabel = targetQuestion.options?.find((option) => option.id === optionId)?.text ?? '';

      updateQuestion(targetQuestion.id, (question) => ({
        ...question,
        ...createEmptyAnswerState(),
        selectedOption: optionId ?? null,
        answerBoolean: optionId ? !['no', 'falso', 'false'].includes(normalizeText(currentLabel)) : null,
      }));
    };

    const isCheckboxOptionSelected = (optionId: string, questionId?: number) => Boolean(getTargetQuestion(questionId)?.selectedOptions?.includes(optionId));

    const toggleCheckboxOption = (optionId: string, questionId?: number) => {
      const targetQuestion = getTargetQuestion(questionId);
      if (!targetQuestion || isQuestionInteractionLockedFor(targetQuestion)) return;

      updateQuestion(targetQuestion.id, (question) => {
        const currentOptions = new Set(question.selectedOptions ?? []);

        if (currentOptions.has(optionId)) {
          currentOptions.delete(optionId);
        } else {
          currentOptions.add(optionId);
        }

        return {
          ...question,
          ...createEmptyAnswerState(),
          selectedOptions: [...currentOptions],
        };
      });
    };

    const handleTextAnswer = (value: string | number | null, questionId?: number) => {
      const targetQuestion = getTargetQuestion(questionId);
      if (!targetQuestion) return;

      updateQuestion(targetQuestion.id, (question) => ({
        ...question,
        ...createEmptyAnswerState(),
        answerText: String(value ?? ''),
      }));
    };

    const handleTextInput = (event: Event, questionId?: number) => {
      handleTextAnswer(String((event.target as HTMLInputElement | HTMLTextAreaElement).value ?? ''), questionId);
    };

    const handleSignatureAnswer = (value: string | null, questionId?: number) => {
      const targetQuestion = getTargetQuestion(questionId);
      if (!targetQuestion) return;

      updateQuestion(targetQuestion.id, (question) => ({
        ...question,
        ...createEmptyAnswerState(),
        answerSignature: String(value ?? ''),
      }));
    };

    const handleFileAnswer = async (file: File | null, questionId?: number) => {
      const targetQuestion = getTargetQuestion(questionId);
      if (!targetQuestion) return;

      if (!file) {
        clearQuestionAnswer(targetQuestion.id);
        return;
      }

      try {
        const fileUrl = await readFileAsDataUrl(file);

        updateQuestion(targetQuestion.id, (question) => ({
          ...question,
          ...createEmptyAnswerState(),
          answerFile: file,
          answerFileName: file.name,
          answerFileUrl: fileUrl,
          answerFileMimeType: file.type,
        }));
      } catch (error) {
        console.error(error);
        toastService.show('No fue posible procesar el archivo seleccionado.', 'error');
      }
    };

    const clearQuestionAnswer = (questionId?: number | null) => {
      const targetQuestion = getTargetQuestion(questionId);
      if (!targetQuestion) return;

      updateQuestion(targetQuestion.id, (question) => ({
        ...question,
        ...createEmptyAnswerState(),
        answered: false,
      }));
    };
    const clearCurrentAnswer = () => clearQuestionAnswer(currentQuestion.value?.id);

    const toggleFlagCurrentQuestion = () => {
      if (!currentQuestion.value) return;

      updateQuestion(currentQuestion.value.id, (question) => ({
        ...question,
        flagged: !question.flagged,
      }));
    };

    const scrollToQuestion = () => {
      nextTick(() => {
        const el = (questionCardRef.value as any)?.$el as HTMLElement | null;
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    };

    const goToQuestion = async (questionId: number) => {
      if (questionId !== currentQuestion.value?.id) {
        await persistCurrentQuestionAnswer();
      }

      currentQuestionId.value = questionId;
      showSidebar.value = false;
      showGrid.value = false;
      scrollToQuestion();
    };

    const goToNextQuestion = async () => {
      await persistCurrentQuestionAnswer();

      const nextQuestion = visibleQuestions.value[currentQuestionIndex.value + 1];
      if (nextQuestion) {
        currentQuestionId.value = nextQuestion.id;
        scrollToQuestion();
      }
    };

    const goToPreviousQuestion = async () => {
      await persistCurrentQuestionAnswer();

      const previousQuestion = visibleQuestions.value[currentQuestionIndex.value - 1];
      if (previousQuestion) {
        currentQuestionId.value = previousQuestion.id;
        scrollToQuestion();
      }
    };

    const stopTimer = () => {
      if (timerId.value) {
        window.clearInterval(timerId.value);
        timerId.value = null;
      }
    };

    const handleManualSave = async () => {
      await persistCurrentQuestionAnswer();
      saveProgress();
      savedNotification.value = true;
      window.setTimeout(() => {
        savedNotification.value = false;
      }, 1800);
    };

    const goBackToFlow = async () => {
      saveProgress();
      await router.push(backRoute.value);
    };

    const finishExam = async (toastMessage = 'Examen finalizado correctamente', autoNavigate = false) => {
      await persistCurrentQuestionAnswer();
      examState.value = 'completed';
      showFinishDialog.value = false;
      saveProgress();
      stopTimer();
      const attemptId = resolveAttemptId();

      if (attemptId) {
        try {
          checklistAttempt.value = await updateChecklistDiligenciadoEstadoService.run(attemptId, {
            estado: 'Entregado',
          });
        } catch (error) {
          console.error('No fue posible actualizar el estado del examen diligenciado.', error);
        }
      }

      toastService.show(toastMessage, 'success');
      if (autoNavigate) {
        await router.push(backRoute.value);
      }
    };

    const handleTimeFinished = async () => {
      await finishExam('El tiempo del examen ha finalizado. Se guardó tu intento.', true);
    };

    const formatTime = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const ensureChecklistAttempt = async (currentStep: StepDto, context: ExamStepContext) => {
      const routeAttemptId = parseNullableId(route.query.checklistDiligenciadoId);
      const rowId = routeAttemptId || parseNullableId(context.rowId);

      if (rowId) {
        const response = await getChecklistDiligenciadoService.run(rowId);
        checklistAttempt.value = {
          ...response,
          id: parseNullableId(response?.id) || rowId,
        };
        examContext.value = {
          ...context,
          rowId: checklistAttempt.value.id,
        };
        return;
      }

      const usuarioId = resolveAuthenticatedUserId();

      if (!usuarioId) {
        throw new Error('No se pudo identificar el usuario autenticado para iniciar el examen.');
      }

      const response = await createChecklistDiligenciadoService.run({
        checklistId: context.checklistId,
        usuarioId,
        institutionId: institutionId.value,
        convocationEnrolId: convocationEnrolId.value,
        convocationStepId: currentStep.id,
        activo: 1,
      });
      checklistAttempt.value = {
        ...response,
        id: parseNullableId(response?.id),
      };
    };

    const startChecklistAttemptIfNeeded = async () => {
      const attemptId = resolveAttemptId();

      if (!attemptId || normalizeRegistrationExamBackendStatus(checklistAttempt.value?.estado) !== 'No iniciado') return;

      const response = await startChecklistDiligenciadoService.run(attemptId);
      checklistAttempt.value = {
        ...(checklistAttempt.value ?? ({} as ChecklistDiligenciadoDto)),
        ...(response ?? ({} as ChecklistDiligenciadoDto)),
        id: response?.id ?? attemptId,
      };
    };

    const loadExam = async () => {
      const response = await getConvocationWithStepsService.run(convocationId.value, {
        convocationEnrolId: convocationEnrolId.value,
        isAdmin: localStorage.getItem('administratorAsStudent') ? 1 : 0,
      });

      const currentStep = response.steps.find((item: StepDto) => item.id === stepId.value) ?? null;

      if (!currentStep) {
        throw new Error('No encontramos el paso asociado al examen.');
      }

      const context = resolveExamContext(currentStep.detail);
      if (!context?.checklistId) {
        throw new Error('El step del examen no tiene checklist configurado todavía.');
      }

      examStep.value = currentStep;
      examContext.value = context;
      await ensureChecklistAttempt(currentStep, context);
      await startChecklistAttemptIfNeeded();

      const [definitionResponse, responseTypes] = await Promise.all([
        getRegistrationExamService.run(context.checklistId),
        getResponseTypesService.run().catch((error) => {
          console.error('No fue posible cargar el catálogo de tipos de respuesta del checklist.', error);
          return [];
        }),
      ]);

      examDurationSeconds.value = parseRegistrationExamDurationSeconds(definitionResponse.duracion);
      examDefinition.value = normalizeRegistrationExamDefinition(definitionResponse, responseTypes);

      if (!examDefinition.value.questions.length) {
        throw new Error('El checklist aún no tiene preguntas publicadas.');
      }

      const progress = loadRegistrationExamProgress(convocationEnrolId.value, stepId.value, examDefinition.value.questions);

      allQuestions.value = progress.questions;
      const backendExamState = checklistAttempt.value ? mapRegistrationExamBackendStatusToState(checklistAttempt.value.estado) : progress.examState;
      examState.value = checklistAttempt.value ? (backendExamState === 'completed' ? 'completed' : 'active') : progress.examState === 'completed' ? 'completed' : 'active';
      timeRemaining.value = checklistAttempt.value?.fechaInicio
        ? calculateRegistrationExamRemainingSeconds(checklistAttempt.value.fechaInicio, examDurationSeconds.value)
        : Math.min(progress.timeRemaining || examDurationSeconds.value, examDurationSeconds.value);
      currentQuestionId.value = progress.currentQuestionId ?? progress.questions[progress.currentQuestionIndex]?.id ?? progress.questions[0]?.id ?? null;

      routes.value = [
        {
          name: examDefinition.value.title,
        },
      ];
    };

    watch(
      [examState, allQuestions, currentQuestionId, timeRemaining],
      () => {
        if (!allQuestions.value.length) return;
        saveProgress();
      },
      { deep: true }
    );

    watch(
      examState,
      (state) => {
        stopTimer();

        if (state !== 'active') return;

        timerId.value = window.setInterval(async () => {
          if (timeRemaining.value <= 1) {
            timeRemaining.value = 0;
            stopTimer();
            await handleTimeFinished();
            return;
          }

          timeRemaining.value -= 1;
        }, 1000);
      },
      { immediate: true }
    );

    watch(
      visibleQuestions,
      (questions) => {
        if (!questions.length) {
          currentQuestionId.value = null;
          return;
        }

        if (!questions.some((question) => question.id === currentQuestionId.value)) {
          currentQuestionId.value = questions[0].id;
        }
      },
      { immediate: true }
    );

    onMounted(async () => {
      try {
        await loadExam();
      } catch (error: any) {
        console.error(error);
        loadError.value = error?.message ?? 'Ocurrió un error cargando el examen.';
      } finally {
        loading.value = false;
      }

      nextTick(() => {
        if (stickyShellRef.value) {
          shellObserver = new ResizeObserver(() => {
            shellHeight.value = stickyShellRef.value?.offsetHeight ?? 0;
          });
          shellObserver.observe(stickyShellRef.value);
          shellHeight.value = stickyShellRef.value.offsetHeight;
        }
      });
    });

    onBeforeUnmount(() => {
      stopTimer();
      shellObserver?.disconnect();
    });

    return {
      alphabet,
      answeredCount,
      clearQuestionAnswer,
      currentQuestion,
      currentDependentQuestions,
      currentQuestionFieldLabel,
      currentQuestionIndex,
      currentQuestionHint,
      currentQuestionReviewSummary,
      currentQuestionResponseLabel,
      currentQuestionSelectOptions,
      durationLabel,
      examContext,
      examState,
      examTitle,
      finishExam,
      flaggedCount,
      formatTime,
      getQuestionNumber,
      getQuestionFieldLabel,
      getQuestionHint,
      getQuestionReviewSummary,
      getQuestionSelectOptions,
      goBackToFlow,
      goToNextQuestion,
      goToPreviousQuestion,
      goToQuestion,
      handleFileAnswer,
      handleManualSave,
      handleSignatureAnswer,
      handleTextInput,
      loadError,
      loading,
      isCheckboxOptionSelected,
      isCurrentQuestionLocked,
      isQuestionInteractionLocked,
      isQuestionInteractionLockedFor,
      isSummaryMode,
      pendingCount,
      progressPercentage,
      reduceExamOption,
      resolveProjectInputType,
      questionTypeMetaMap,
      resolveQuestionTypeLabel,
      resolveQuestionTypeMeta,
      savedNotification,
      sectionCount,
      handleBooleanSelect,
      handleMultipleSelect,
      handleSingleSelect,
      handleTextAnswer,
      showFinishDialog,
      showGrid,
      showSidebar,
      timeRemaining,
      timerToneClass,
      title,
      toggleCheckboxOption,
      toggleFlagCurrentQuestion,
      totalAnswerableQuestions,
      totalQuestions,
      routes,
      visibleQuestions,
      visibleSections,
      clearCurrentAnswer,
      stickyShellRef,
      questionCardRef,
      shellHeight,
      examScore,
      examTotalScore,
      examHasScoring,
      examScorePercent,
    };
  },
});
</script>

<style scoped>
.registration-exam-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  color: #0f172a;
}

.registration-exam-page__stickyShell {
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.registration-exam-page__topbar,
.registration-exam-page__progressCard,
.registration-exam-page__sidebar,
.registration-exam-page__gridCard,
.registration-exam-page__footer,
.registration-exam-page__feedbackCard :deep(.content),
.registration-exam-page__questionCard :deep(.content) {
  border: 1px solid #dbe1ea;
  border-radius: 20px;
  background: #ffffff;
}

.registration-exam-page__sidebar {
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%) !important;
}

.registration-exam-page__questionCard {
  scroll-margin-top: calc(var(--shell-h, 10.5rem) + 1rem);
}

.registration-exam-page__questionCard :deep(.o-card-body),
.registration-exam-page__feedbackCard :deep(.o-card-body) {
  padding: 1.5rem;
}

.registration-exam-page__topbar,
.registration-exam-page__progressCard,
.registration-exam-page__footer {
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
}

.registration-exam-page__topbar {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  padding: 1rem 1.25rem;
  background: linear-gradient(160deg, #f0f7ff 0%, #ffffff 60%) !important;
}

.registration-exam-page__topbarMain,
.registration-exam-page__topbarActions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.registration-exam-page__menuButton,
.registration-exam-page__sidebarClose,
.registration-exam-page__flagButton {
  border: 0;
  background: #f8fafc;
  color: #334155;
  border-radius: 14px;
  padding: 0.8rem 0.95rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  cursor: pointer;
}

.registration-exam-page__menuButton {
  display: none;
}

.registration-exam-page__titleBlock h1 {
  margin: 0;
  font-weight: 700;
  font-size: 1rem;
}

.registration-exam-page__feedback h2,
.registration-exam-page__sidebarHeader h2 {
  margin: 0;
  font-weight: 700;
  font-size: 0.95rem;
}

.registration-exam-page__questionTitleRow h3,
.registration-exam-page__gridHeader h3 {
  margin: 0;
  font-weight: 700;
  font-size: 0.93rem;
}

.registration-exam-page__titleBlock p,
.registration-exam-page__feedback p,
.registration-exam-page__questionTitleRow p,
.registration-exam-page__gridHeader p,
.registration-exam-page__sidebarHeader p,
.registration-exam-page__tipCard li {
  margin: 0;
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.6;
}

.registration-exam-page__timerCard {
  min-width: 10.5rem;
  border-radius: 16px;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #f0f4ff 0%, #f8fafc 100%);
  border: 1px solid #dbeafe;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.registration-exam-page__timerCard span {
  color: #64748b;
  font-size: 0.85rem;
}

.registration-exam-page__timerCard strong {
  font-size: 1.25rem;
  letter-spacing: 0.04em;
}

.registration-exam-page__timerCard strong.is-warning {
  color: #b45309;
}

.registration-exam-page__timerCard strong.is-danger {
  color: #b91c1c;
}

.registration-exam-page__timerCard small {
  color: #64748b;
  font-size: 0.78rem;
}

.registration-exam-page__progressCard {
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.registration-exam-page__progressHeader,
.registration-exam-page__progressMeta,
.registration-exam-page__questionHeader,
.registration-exam-page__questionActions,
.registration-exam-page__footer {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
}

.registration-exam-page__progressTrack {
  width: 100%;
  height: 0.8rem;
  border-radius: 999px;
  background: #e2e8f0;
  overflow: hidden;
}

.registration-exam-page__progressFill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #1d4ed8 0%, #06b6d4 55%, #10b981 100%);
  transition: width 0.35s ease;
  position: relative;
  overflow: hidden;
}

.registration-exam-page__progressFill::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.22) 50%, transparent 100%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(200%);
  }
}

.registration-exam-page__progressMeta {
  font-size: 0.92rem;
  color: #64748b;
}

.registration-exam-page__reviewBanner {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(260px, 1fr);
  gap: 1rem;
  padding: 1.15rem 1.25rem;
  border: 1px solid #dbeafe;
  border-radius: 20px;
  background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
}

.registration-exam-page__reviewBannerCopy {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.registration-exam-page__reviewBannerCopy h2 {
  margin: 0;
  font-size: 0.97rem;
  font-weight: 700;
}

.registration-exam-page__reviewBannerCopy p {
  margin: 0;
  color: #475569;
  font-size: 0.82rem;
  line-height: 1.6;
}

.registration-exam-page__reviewBannerStats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.registration-exam-page__reviewStat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.9rem 1rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #dbe1ea;
}

.registration-exam-page__reviewStat span {
  color: #64748b;
  font-size: 0.82rem;
}

.registration-exam-page__reviewStat strong {
  color: #0f172a;
  font-size: 0.97rem;
}

.registration-exam-page__layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
}

.registration-exam-page__sidebar {
  position: sticky;
  top: calc(var(--shell-h, 10.5rem) + 1rem);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: calc(100vh - var(--shell-h, 10.5rem) - 3rem);
  overflow: hidden;
}

.registration-exam-page__sidebarHeader {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.registration-exam-page__sidebarClose {
  display: none;
}

.registration-exam-page__sidebarContent {
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.registration-exam-page__sidebarSection {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.registration-exam-page__sidebarSectionHeader {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: flex-start;
}

.registration-exam-page__sidebarSectionHeader strong {
  display: block;
}

.registration-exam-page__sidebarSectionHeader small {
  color: #64748b;
}

.registration-exam-page__sidebarSectionHeader span {
  background: #f8fafc;
  color: #334155;
  border-radius: 999px;
  padding: 0.25rem 0.55rem;
  font-size: 0.82rem;
}

.registration-exam-page__questionNav,
.registration-exam-page__grid {
  display: grid;
  gap: 0.6rem;
}

.registration-exam-page__questionNavButton,
.registration-exam-page__gridButton,
.registration-exam-page__optionButton,
.registration-exam-page__booleanCard {
  border: 1px solid #dbe1ea;
  background: #ffffff;
  border-radius: 16px;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease;
}

.registration-exam-page__questionNavButton:hover,
.registration-exam-page__gridButton:hover,
.registration-exam-page__optionButton:hover,
.registration-exam-page__booleanCard:hover {
  transform: translateY(-1px);
  border-color: #2563eb;
}

.registration-exam-page__questionNavButton {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.7rem;
  align-items: center;
  padding: 0.75rem;
  text-align: left;
}

.registration-exam-page__questionNavButton span,
.registration-exam-page__gridButton span {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #e2e8f0;
  color: #334155;
  font-weight: 700;
}

.registration-exam-page__questionNavButton small {
  color: #475569;
}

.registration-exam-page__questionNavButton.is-active,
.registration-exam-page__gridButton.is-active {
  background: #1d4ed8;
  border-color: #1d4ed8;
}

.registration-exam-page__questionNavButton.is-active span,
.registration-exam-page__gridButton.is-active span {
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
}

.registration-exam-page__questionNavButton.is-active small {
  color: rgba(255, 255, 255, 0.92);
}

.registration-exam-page__questionNavButton.is-answered:not(.is-active),
.registration-exam-page__gridButton.is-answered:not(.is-active) {
  background: #f0fdf4;
  border-color: #86efac;
}

.registration-exam-page__questionNavButton.is-answered:not(.is-active) span,
.registration-exam-page__gridButton.is-answered:not(.is-active) span {
  background: #16a34a;
  color: #ffffff;
}

.registration-exam-page__flagIndicator {
  position: absolute;
  top: 0.4rem;
  right: 0.6rem;
  font-style: normal;
  font-weight: 700;
  color: #f59e0b;
}

.registration-exam-page__tipCard {
  border-radius: 16px;
  background: #f8fafc;
  padding: 1rem;
}

.registration-exam-page__tipCard strong {
  display: block;
  margin-bottom: 0.6rem;
}

.registration-exam-page__tipCard ul {
  margin: 0;
  padding-left: 1rem;
}

.registration-exam-page__main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.registration-exam-page__questionMeta,
.registration-exam-page__questionActionsGroup,
.registration-exam-page__footerStats {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.registration-exam-page__badge {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
}

.registration-exam-page__badge--primary {
  background: #dbeafe;
  color: #1d4ed8;
}

.registration-exam-page__badge--neutral {
  background: #f1f5f9;
  color: #334155;
}

.registration-exam-page__badge--warning {
  background: #fef3c7;
  color: #b45309;
}

.registration-exam-page__badge--success {
  background: #dcfce7;
  color: #15803d;
}

.registration-exam-page__badge--info {
  background: #ede9fe;
  color: #6d28d9;
}

.registration-exam-page__badge--ghost {
  background: #ecfeff;
  color: #0f766e;
}

.registration-exam-page__badge--locked {
  background: #fee2e2;
  color: #b91c1c;
}

.registration-exam-page__questionBody {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.registration-exam-page__dependentQuestions {
  display: grid;
  gap: 1rem;
  padding-left: 1rem;
  border-left: 3px solid #bfdbfe;
}

.registration-exam-page__dependentQuestion {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #dbe1ea;
  border-radius: 18px;
  background: #f8fafc;
}

.registration-exam-page__dependentHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.registration-exam-page__dependentTitle {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.registration-exam-page__dependentTitle h4 {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  line-height: 1.45;
}

.registration-exam-page__dependentTitle p {
  margin: 0;
  color: #64748b;
  line-height: 1.55;
}

.registration-exam-page__dependentClear {
  border: 0;
  background: transparent;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0;
  font-weight: 600;
  white-space: nowrap;
}

.registration-exam-page__dependentClear:hover {
  color: #b91c1c;
}

.registration-exam-page__answerSummary {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding: 1rem 1.1rem;
  border-radius: 16px;
  border: 1px solid #dbe1ea;
  background: #f8fafc;
}

.registration-exam-page__answerSummaryEyebrow {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.registration-exam-page__answerSummary strong {
  font-size: 1rem;
  color: #0f172a;
}

.registration-exam-page__answerSummary p {
  margin: 0;
  color: #475569;
  line-height: 1.6;
}

.registration-exam-page__answerSummary--success {
  border-color: #86efac;
  background: #f0fdf4;
}

.registration-exam-page__answerSummary--success .registration-exam-page__answerSummaryEyebrow {
  color: #15803d;
}

.registration-exam-page__answerSummary--warning {
  border-color: #fcd34d;
  background: #fffbeb;
}

.registration-exam-page__answerSummary--warning .registration-exam-page__answerSummaryEyebrow {
  color: #b45309;
}

.registration-exam-page__answerSummary--neutral {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.registration-exam-page__answerSummary--neutral .registration-exam-page__answerSummaryEyebrow {
  color: #475569;
}

.registration-exam-page__questionTitleRow {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.registration-exam-page__questionType,
.registration-exam-page__feedbackIcon {
  width: 4rem;
  height: 4rem;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 1.35rem;
  flex-shrink: 0;
}

.registration-exam-page__feedbackIcon--success {
  background: #dcfce7;
  color: #15803d;
}

.registration-exam-page__feedbackIcon--danger {
  background: #fee2e2;
  color: #b91c1c;
}

.registration-exam-page__options,
.registration-exam-page__booleanGrid {
  display: grid;
  gap: 0.85rem;
}

.registration-exam-page__optionButton {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.9rem;
  align-items: center;
  padding: 1rem;
  text-align: left;
}

.registration-exam-page__optionButton.is-selected,
.registration-exam-page__booleanCard.is-selected {
  border-color: #1d4ed8;
  background: #eff6ff;
}

.registration-exam-page__optionLetter {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 999px;
  background: #e2e8f0;
  color: #334155;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.registration-exam-page__optionButton.is-selected .registration-exam-page__optionLetter {
  background: #1d4ed8;
  color: #ffffff;
}

.registration-exam-page__booleanGrid {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.registration-exam-page__booleanCard {
  padding: 1rem;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.registration-exam-page__booleanCard strong {
  font-size: 1rem;
}

.registration-exam-page__booleanCard small {
  color: #64748b;
}

.registration-exam-page__checkboxGroup {
  display: grid;
  gap: 0.85rem;
}

.registration-exam-page__checkboxItem {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.85rem;
  align-items: flex-start;
  padding: 0.95rem 1rem;
  border-radius: 16px;
  border: 1px solid #dbe1ea;
  background: #ffffff;
}

.registration-exam-page__checkboxItem .form-check-input {
  margin-top: 0.2rem;
}

.registration-exam-page__checkboxCopy {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.registration-exam-page__checkboxCopy strong {
  color: #0f172a;
  font-size: 0.98rem;
}

.registration-exam-page__checkboxCopy small {
  color: #64748b;
}

.registration-exam-page__inputGroup {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.registration-exam-page__inputGroup label {
  font-weight: 600;
}

.registration-exam-page__input,
.registration-exam-page__textarea {
  border-radius: 16px;
  border: 1px solid #cbd5e1;
  padding: 0.95rem 1rem;
  box-shadow: none;
}

.registration-exam-page__fieldHint {
  margin: -0.4rem 0 0;
  color: #64748b;
  line-height: 1.6;
}

.registration-exam-page__fileField {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.registration-exam-page__fileField :deep(.attach) {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.registration-exam-page__fileMeta,
.registration-exam-page__fileReadonly {
  border-radius: 16px;
  border: 1px solid #dbe1ea;
  background: #f8fafc;
  padding: 0.95rem 1rem;
}

.registration-exam-page__fileMeta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.registration-exam-page__fileMeta strong,
.registration-exam-page__fileReadonlyCopy strong {
  color: #0f172a;
}

.registration-exam-page__fileMeta span,
.registration-exam-page__fileReadonlyCopy span,
.registration-exam-page__fileReadonlyCopy a {
  color: #64748b;
  line-height: 1.6;
}

.registration-exam-page__fileReadonly {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.85rem;
  align-items: flex-start;
}

.registration-exam-page__fileReadonlyIcon {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 12px;
  background: #dbeafe;
  color: #1d4ed8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.registration-exam-page__fileReadonlyCopy {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.registration-exam-page__autoSave {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.75rem 0.95rem;
  border-radius: 14px;
  background: #f8fafc;
  color: #475569;
}

.registration-exam-page__gridCard {
  padding: 0.875rem 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%) !important;
}

.registration-exam-page__gridHeader {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.registration-exam-page__grid {
  grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
}

.registration-exam-page__gridButton {
  position: relative;
  aspect-ratio: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.registration-exam-page__gridButton span {
  width: 1.5rem;
  height: 1.5rem;
  font-size: 0.75rem;
}

.registration-exam-page__footer {
  padding: 1rem 1.25rem;
}

.registration-exam-page__footerStats {
  color: #475569;
}

.registration-exam-page__legend {
  width: 0.85rem;
  height: 0.85rem;
  border-radius: 999px;
  display: inline-flex;
  margin-right: 0.4rem;
}

.registration-exam-page__legend--success {
  background: #16a34a;
}

.registration-exam-page__legend--warning {
  background: #f59e0b;
}

.registration-exam-page__legend--neutral {
  background: #cbd5e1;
}

.registration-exam-page__feedback {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
}

.registration-exam-page__confirmContent {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.registration-exam-page__confirmText {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.registration-exam-page__confirmText h4 {
  margin: 0;
  font-size: 0.97rem;
  font-weight: 700;
  color: #0f172a;
}

.registration-exam-page__confirmText p {
  margin: 0;
  color: #64748b;
  line-height: 1.6;
}

.registration-exam-page__overlay {
  display: none;
}

/* ── Result card (score screen after completion) ── */
.registration-exam-page__resultCard :deep(.o-card-body) {
  padding: 2.5rem 2rem;
}

.registration-exam-page__resultBody {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  text-align: center;
  max-width: 520px;
  margin: 0 auto;
}

.registration-exam-page__resultTop {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.registration-exam-page__resultIconWrap {
  width: 5rem;
  height: 5rem;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  flex-shrink: 0;
}

.registration-exam-page__resultIconWrap--success {
  background: #dcfce7;
  color: #15803d;
}

.registration-exam-page__resultHeading h2 {
  margin: 0 0 0.4rem;
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
}

.registration-exam-page__resultHeading p {
  margin: 0;
  color: #64748b;
  line-height: 1.6;
  font-size: 0.95rem;
}

.registration-exam-page__scoreBoard {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 3rem;
  border-radius: 20px;
  background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
  border: 1px solid #bfdbfe;
}

.registration-exam-page__scoreMain {
  display: flex;
  align-items: baseline;
  gap: 0.45rem;
}

.registration-exam-page__scoreValue {
  font-size: 3.5rem;
  font-weight: 900;
  color: #1d4ed8;
  line-height: 1;
}

.registration-exam-page__scoreMax {
  font-size: 1.1rem;
  color: #64748b;
  font-weight: 600;
}

.registration-exam-page__scorePct {
  font-size: 1.15rem;
  font-weight: 700;
  color: #15803d;
}

.registration-exam-page__scoreLabel {
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.registration-exam-page__resultStats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  width: 100%;
}

.registration-exam-page__resultStat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 1rem 0.75rem;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.registration-exam-page__resultStat strong {
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f172a;
}

.registration-exam-page__resultStat span {
  font-size: 0.76rem;
  color: #64748b;
  font-weight: 500;
}

.registration-exam-page__reviewStat--highlight {
  background: linear-gradient(135deg, #eff6ff, #f0fdf4) !important;
  border-color: #bfdbfe !important;
}

.registration-exam-page__reviewStat--highlight strong {
  color: #1d4ed8 !important;
  font-size: 1.35rem;
}

@media (max-width: 1080px) {
  .registration-exam-page__reviewBanner {
    grid-template-columns: 1fr;
  }

  .registration-exam-page__layout {
    grid-template-columns: 1fr;
  }

  .registration-exam-page__menuButton,
  .registration-exam-page__sidebarClose,
  .registration-exam-page__overlay {
    display: inline-flex;
  }

  .registration-exam-page__overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.45);
    z-index: 29;
  }

  .registration-exam-page__sidebar {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 30;
    width: min(90vw, 360px);
    height: 100vh;
    max-height: none;
    transform: translateX(-105%);
    transition: transform 0.2s ease;
  }

  .registration-exam-page__sidebar.is-open {
    transform: translateX(0);
  }
}

@media (max-width: 720px) {
  .registration-exam-page__topbar,
  .registration-exam-page__footer,
  .registration-exam-page__progressCard {
    padding: 0.95rem;
  }

  .registration-exam-page__topbar,
  .registration-exam-page__progressHeader,
  .registration-exam-page__progressMeta,
  .registration-exam-page__reviewBannerStats,
  .registration-exam-page__questionHeader,
  .registration-exam-page__questionActions,
  .registration-exam-page__footer {
    flex-direction: column;
    align-items: stretch;
  }

  .registration-exam-page__reviewBannerStats {
    display: grid;
    grid-template-columns: 1fr;
  }

  .registration-exam-page__topbarActions,
  .registration-exam-page__questionActionsGroup {
    width: 100%;
  }

  .registration-exam-page__timerCard {
    min-width: 0;
  }

  .registration-exam-page__questionCard :deep(.o-card-body),
  .registration-exam-page__feedbackCard :deep(.o-card-body),
  .registration-exam-page__gridCard {
    padding: 1rem;
  }

  .registration-exam-page__questionTitleRow {
    flex-direction: column;
  }

  .registration-exam-page__confirmContent {
    flex-direction: column;
  }
}
</style>
