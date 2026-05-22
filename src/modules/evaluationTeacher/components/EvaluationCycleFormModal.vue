<template>
  <AppModal :modelValue="isVisible" size="lg" @update:modelValue="close">
    <div
      class="ecfm-modal"
      style="
        margin: 0 auto;
        width: 100%;
        max-width: 780px;
        max-height: 92vh;
        background: #fff;
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 30px 70px rgba(0, 0, 0, 0.3);
      "
      role="dialog"
      aria-modal="true"
    >
      <!-- HEAD (con stepper) -->
      <div class="modal__head">
        <div class="modal__headText">
          <h2 class="modal__title">Configurar Evaluación Docente</h2>

          <p class="modal__subtitle">Asistente por pasos</p>
        </div>

        <button type="button" class="modal__close" @click="close" aria-label="Cerrar">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- Stepper -->
      <div class="ecfm-stepper">
        <div
          v-for="(s, idx) in steps"
          :key="s.key"
          class="ecfm-step"
          :class="{
            'ecfm-step--active': currentStep === idx + 1,
            'ecfm-step--done': currentStep > idx + 1,
          }"
        >
          <div class="ecfm-step__circle">
            <span v-if="currentStep > idx + 1">✓</span>
            <span v-else>{{ idx + 1 }}</span>
          </div>
          <div class="ecfm-step__info">
            <div class="ecfm-step__title">{{ s.title }}</div>
          </div>
        </div>
      </div>

      <!-- BODY -->
      <div class="modal__body">
        <!-- Contenido por paso -->
        <div v-if="currentStep === 1">
          <div class="stepHeader">
            <h3>el Tipo de Evaluación</h3>
            <p class="stepSub">Elige el grado de evaluación que incluirá más evaluadores y perspectivas</p>
          </div>

          <div class="typeGrid typeGrid--wizard">
            <div v-for="(et, idx) in evalTypes" :key="et.value" class="typeCard typeCard--wizard" :class="{ 'typeCard--sel': form.evalType === et.value }" @click="form.evalType = et.value">
              <div class="typeCard__badge">{{ idx + 1 }}/4</div>
              <span v-if="form.evalType === et.value" class="typeCard__check">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <div class="typeCard__iconBox" :style="{ background: et.iconBg }">
                <span class="typeCard__iconInner" v-html="et.icon"></span>
              </div>
              <p class="typeCard__name" :class="{ 'typeCard__name--sel': form.evalType === et.value }">
                {{ et.label }}
              </p>
              <p class="typeCard__desc">{{ et.desc }}</p>
            </div>
          </div>
        </div>

        <div v-if="currentStep === 2">
          <div class="stepHeader">
            <h3>Configurar Evaluadores</h3>
            <p class="stepSub">Define quiénes participarán en la evaluación</p>
          </div>

          <div class="evalCards">
            <div class="evalCard">
              <div class="evalCard__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                  <circle cx="12" cy="8" r="3"></circle>
                  <path d="M5.5 20 a6.5 6.5 0 0 1 13 0"></path>
                </svg>
              </div>
              <div style="flex: 1">
                <h4 class="evalCard__title">Evaluador: Estudiantes</h4>
                <p class="evalCard__desc">Los estudiantes evaluarán según los programas seleccionados</p>
                <div class="subCard__title" style="margin-top: 12px; margin-bottom: 8px">Tipo de docente a evaluar <span class="req">*</span></div>
                <div class="radioList">
                  <label
                    class="radioItem"
                    :class="{
                      'radioItem--sel': form.teacherType === opt.value,
                    }"
                    v-for="opt in activeTeacherTypes"
                    :key="opt.value"
                  >
                    <input type="radio" v-model="form.teacherType" :value="opt.value" class="radioInput" />
                    <div>
                      <p
                        class="radioItem__name"
                        :class="{
                          'radioItem__name--sel': form.teacherType === opt.value,
                        }"
                      >
                        {{ opt.label }}
                      </p>
                      <p class="radioItem__desc">{{ opt.desc }}</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div v-if="!form.evalType.includes('90')" class="evalCard">
              <div class="evalCard__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div style="flex: 1">
                <h4 class="evalCard__title">Evaluador: Superior</h4>
                <p class="evalCard__desc">Evaluación jerárquica descendente</p>
                <div class="subCard__title" style="margin-top: 12px; margin-bottom: 8px">Rol evaluador <span class="req">*</span></div>
                <select v-model="form.superiorRole" class="fieldSelect">
                  <option v-for="r in roles" :key="r.id" :value="String(r.id)">
                    {{ r.name }}
                  </option>
                </select>
              </div>
            </div>

            <div v-if="form.evalType.includes('270') || form.evalType.includes('360')" class="evalCard evalCard--notice">
              <div class="evalCard__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </div>
              <div>
                <h4 class="evalCard__title">Evaluación: Auxiliares → Principales</h4>
                <p class="evalCard__desc">Los docentes auxiliares evaluarán a los docentes principales con los que compartan asignatura en el período seleccionado.</p>
                <div style="margin-top: 8px; padding: 8px 12px; background: #f0f0ff; border-radius: 8px; font-size: 12px; color: #7c3aed">
                  <strong>Nota:</strong> Si una asignatura no tiene docente auxiliar asociado, el sistema lo validará en el siguiente paso.
                </div>
              </div>
            </div>

            <div v-if="form.evalType.includes('360')" class="evalCard evalCard--selfeval">
              <div class="evalCard__icon" style="background: #d1fae5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  <polyline points="9 12 12 15 15 12" />
                </svg>
              </div>
              <div style="flex: 1">
                <h4 class="evalCard__title">Autoevaluación</h4>
                <span class="selfeval__badge">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Activada automáticamente
                </span>
                <p class="evalCard__desc" style="margin-top: 8px">En evaluación 360° los docentes se autoevaluarán automáticamente.</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="currentStep === 3">
          <div class="stepHeader">
            <h3>Definir Alcance</h3>
            <p class="stepSub">Establece el período y programas académicos</p>
          </div>

          <div class="fieldBox">
            <label class="fieldLabel">Nombre de la Evaluación <span class="req">*</span></label>
            <input v-model="form.name" type="text" class="fieldInput" placeholder="Ej: Evaluación Docente - Semestre 2026-1" />
          </div>

          <div class="fieldBox">
            <label class="fieldLabel">Descripción (Opcional)</label>
            <textarea v-model="form.description" class="fieldInput" rows="4" placeholder="Descripción breve de la evaluación..."></textarea>
          </div>

          <div class="fieldBox">
            <label class="fieldLabel"
              ><svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                style="display: inline-block; vertical-align: middle; margin-right: 6px"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" /></svg
              >Período Académico <span class="req">*</span></label
            >
            <select v-model="form.academicPeriod" class="fieldSelect">
              <option v-for="p in academicPeriods" :key="p.id" :value="String(p.id)">
                {{ p.name }}
              </option>
            </select>
          </div>

          <div class="fieldBox">
            <label class="fieldLabel"
              ><svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                style="display: inline-block; vertical-align: middle; margin-right: 6px"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" /></svg
              >Plantilla de Evaluación <span class="req">*</span></label
            >
            <div style="display: flex; gap: 8px; align-items: center">
              <select v-model="form.templateId" class="fieldSelect">
                <option value="">Selecciona una plantilla</option>
                <option v-for="t in templates" :key="t.id" :value="t.id">
                  {{ t.name }}
                </option>
              </select>
              <button type="button" class="btn btn--outline" @click="showPreview = !showPreview" :disabled="!form.templateId">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Vista previa
              </button>
            </div>

            <div v-if="showPreview && templatePreview" class="fieldBox template-compact-preview" style="margin-top: 12px">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px">
                <div style="flex: 1">
                  <div style="display: flex; gap: 12px; align-items: flex-start">
                    <div style="flex: 1">
                      <h4 style="margin: 0 0 8px 0">
                        {{ templatePreview.name }}
                      </h4>
                      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
                        <span class="chip chip--sm">Pregrado</span>
                        <span class="chip chip--sm chip--success">Activa</span>
                      </div>
                    </div>
                    <button type="button" class="btn btn--ghost" @click="showPreview = false" style="height: 32px">✕</button>
                  </div>

                  <div style="margin-top: 14px">
                    <div class="fieldLabel" style="font-size: 12px; margin-bottom: 6px">NÚMERO DE PREGUNTAS</div>
                    <div style="font-weight: 700; font-size: 20px">
                      {{ templateQuestionsCount }}
                    </div>
                  </div>

                  <div style="margin-top: 14px">
                    <div class="fieldLabel" style="font-size: 12px; margin-bottom: 8px">DIMENSIONES EVALUADAS</div>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap">
                      <span v-for="(s, idx) in templatePreview.sections || []" :key="idx" class="chip chip--dim">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {{ s.name }}
                      </span>
                    </div>
                  </div>

                  <div style="margin-top: 14px; padding: 10px 14px; background: #eff6ff; border-radius: 8px; display: flex; align-items: center; gap: 8px; font-size: 13px; color: #1e40af">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    Esta plantilla se aplicará a todos los evaluadores configurados en el paso anterior.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="fieldBox">
            <label class="fieldLabel">Programas Académicos <span class="req">*</span></label>
            <p class="fieldDesc">Selecciona los programas cuyos estudiantes participarán en la evaluación</p>
            <div>
              <input v-model="programsSearch" type="text" class="fieldInput" placeholder="Buscar programas..." />
              <div v-if="loadingPrograms" style="font-size: 13px; color: #64748b; margin-top: 6px">Buscando programas...</div>
              <div v-if="form.selectedPrograms && form.selectedPrograms.length" style="background: #e6f0ff; border-radius: 10px; padding: 10px; margin-top: 8px">
                <div style="display: flex; gap: 8px; flex-wrap: wrap">
                  <button v-for="id in form.selectedPrograms" :key="id" type="button" class="chip chip--sm" @click="toggleProgram(id)">
                    {{ getProgramName(id) }}
                    <span style="margin-left: 8px; font-weight: 700">✕</span>
                  </button>
                </div>
              </div>

              <div class="program-list" style="margin-top: 10px; border: 1px solid #e6edf8; border-radius: 8px; max-height: 220px; overflow: auto">
                <ul style="list-style: none; padding: 8px; margin: 0">
                  <li
                    v-for="p in programsResults"
                    :key="p.id"
                    class="program-item"
                    :class="{
                      'is-selected': form.selectedPrograms.includes(p.id),
                    }"
                    style="display: flex; align-items: center; gap: 12px; padding: 8px; border-radius: 6px; margin-bottom: 6px"
                  >
                    <input type="checkbox" :checked="form.selectedPrograms.includes(p.id)" @change="toggleProgram(p.id)" />
                    <div style="flex: 1">{{ p.name }}</div>
                  </li>
                </ul>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px">
                <div style="font-size: 13px; color: #64748b">{{ form.selectedPrograms.length }} programa(s) seleccionado(s)</div>
                <div style="display: flex; gap: 8px; align-items: center">
                  <button type="button" class="btn btn--sm" :disabled="programsPage <= 1" @click="loadPrograms(programsPage - 1, programsSearch)">Anterior</button>
                  <div style="font-size: 13px; color: #64748b">Página {{ programsPage }} / {{ programsTotalPages }}</div>
                  <button type="button" class="btn btn--sm" :disabled="programsPage >= programsTotalPages" @click="loadPrograms(programsPage + 1, programsSearch)">Siguiente</button>
                </div>
              </div>
            </div>
            <p class="fieldNote">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#64748b"
                stroke-width="2"
                style="display: inline-block; vertical-align: middle; margin-right: 4px"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" /></svg
              >Solo se evaluarán docentes relacionados con asignaturas activas del período seleccionado.
            </p>
          </div>
        </div>

        <div v-if="currentStep === 4">
          <div class="stepHeader">
            <h3>Configuración Avanzada</h3>
            <p class="stepSub">Validaciones y ajustes finales</p>
          </div>

          <div class="warningBox" v-if="form.evalType.includes('270') || form.evalType.includes('360')">
            <div v-if="mainTeachers.some((t) => !(selectedAuxiliaries[t.offeringSubjectId] || []).length)" class="warningBox__header">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <strong>Docentes sin Auxiliares</strong>
            </div>
            <p v-if="mainTeachers.some((t) => !(selectedAuxiliaries[t.offeringSubjectId] || []).length)" class="warningBox__desc">
              Se encontraron docentes principales sin auxiliares asignados en este período. Revisa el estado de cada uno.
            </p>

            <div v-if="loadingMainTeachers" style="padding: 16px; font-size: 13px; color: #64748b; text-align: center">Cargando docentes...</div>

            <div
              v-else-if="mainTeachers.length === 0"
              style="padding: 16px; font-size: 13px; color: #64748b; text-align: center; display: flex; align-items: center; justify-content: center; gap: 6px"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Todos los docentes principales tienen auxiliar asignado en este período.
            </div>

            <div v-else class="warningTable">
              <div class="warnHeader">
                <div class="warnCol">DOCENTE PRINCIPAL</div>
                <div class="warnCol">ASIGNATURA</div>
                <div class="warnCol warnCol--wide">AUXILIARES</div>
              </div>
              <div
                v-for="teacher in mainTeachers"
                :key="teacher.offeringSubjectId"
                class="warnRow warnRow--aux"
                :class="{
                  'warnRow--active': activeRowId === teacher.offeringSubjectId,
                }"
              >
                <div class="warnCol">{{ teacher.teacherName }}</div>
                <div class="warnCol">{{ teacher.subjectName }}</div>
                <div class="warnCol warnCol--wide">
                  <div class="auxCell">
                    <span v-for="aux in selectedAuxiliaries[teacher.offeringSubjectId] || []" :key="aux.id" class="auxChip">
                      {{ aux.name }}
                      <button type="button" class="auxChip__remove" @click.stop="removeAuxiliary(teacher.offeringSubjectId, aux.id)">✕</button>
                    </span>
                    <button
                      type="button"
                      class="auxAddBtn"
                      @click.stop="openAuxiliarySearch(teacher.offeringSubjectId)"
                      :class="{
                        'auxAddBtn--active': activeRowId === teacher.offeringSubjectId,
                      }"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Auxiliar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Panel de búsqueda de auxiliares (fuera de la tabla, sin overflow) -->
            <div v-if="activeRowId !== null" class="auxSearchPanel">
              <div class="auxSearchPanel__header">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span
                  >Agregar auxiliar a: <strong>{{ mainTeachers.find((t) => t.offeringSubjectId === activeRowId)?.teacherName }}</strong></span
                >
                <button type="button" class="auxSearchPanel__close" @click="closeAuxiliarySearch()">✕</button>
              </div>
              <div class="auxSearchPanel__input">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" style="flex-shrink: 0">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  :value="auxiliarySearch"
                  @input="(e) => { auxiliarySearch = (e.target as HTMLInputElement).value; onAuxiliarySearchInput((e.target as HTMLInputElement).value); }"
                  type="text"
                  class="auxSearchPanel__field"
                  placeholder="Buscar por nombre..."
                  autofocus
                />
                <span v-if="loadingAuxiliaries" class="auxSearchPanel__spinner"></span>
              </div>
              <div class="auxSearchPanel__results">
                <div v-if="loadingAuxiliaries" class="auxSearchPanel__empty">Buscando docentes...</div>
                <div v-else-if="auxiliaryResults.length === 0" class="auxSearchPanel__empty">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  Sin resultados para "{{ auxiliarySearch }}"
                </div>
                <button
                  v-else
                  v-for="aux in auxiliaryResults"
                  :key="aux.id"
                  type="button"
                  class="auxSearchPanel__item"
                  :class="{ 'auxSearchPanel__item--selected': (selectedAuxiliaries[activeRowId!] || []).some(a => a.id === aux.id) }"
                  @click="
                    addAuxiliary(activeRowId!, aux);
                    closeAuxiliarySearch();
                  "
                >
                  <span class="auxSearchPanel__avatar">{{ aux.name.charAt(0).toUpperCase() }}</span>
                  <span class="auxSearchPanel__name">{{ aux.name }}</span>
                  <svg v-if="(selectedAuxiliaries[activeRowId!] || []).some(a => a.id === aux.id)" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div class="fieldBox">
            <label class="fieldLabel"
              ><svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                style="display: inline-block; vertical-align: middle; margin-right: 6px"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" /></svg
              >Fechas del Ciclo</label
            >
            <div class="dateRow">
              <div class="dateField">
                <label class="dateLabel">Fecha de Inicio <span class="req">*</span></label>
                <div style="display: flex; gap: 8px; align-items: center">
                  <AppDateInput ref="startDateRef" v-model="form.startDate" />
                </div>
              </div>
              <div class="dateField">
                <label class="dateLabel">Fecha de Cierre <span class="req">*</span></label>
                <div style="display: flex; gap: 8px; align-items: center">
                  <AppDateInput ref="endDateRef" v-model="form.endDate" />
                </div>
              </div>
            </div>
          </div>

          <div class="fieldBox">
            <label class="fieldLabel">Configuración General</label>
            <label class="mandRow" :class="{ 'mandRow--active': form.mandatory }">
              <input type="checkbox" v-model="form.mandatory" class="checkInput" />
              <div>
                <p class="mandRow__title">Evaluación obligatoria</p>
                <p class="mandRow__desc">Los participantes deben completar la evaluación de forma obligatoria</p>
              </div>
            </label>

            <label class="mandRow" :class="{ 'mandRow--active': form.autoNotify }" style="margin-top: 10px">
              <input type="checkbox" v-model="form.autoNotify" class="checkInput" />
              <div>
                <p class="mandRow__title">Enviar notificación automática</p>
                <p class="mandRow__desc">Notificar a todos los participantes cuando se publique la evaluación</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- Errores de validación -->
      <div v-if="stepErrors.length" style="margin: 0 24px 16px; padding: 10px 14px; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px">
        <p v-for="err in stepErrors" :key="err" style="margin: 0; font-size: 13px; color: #b91c1c">
          {{ err }}
        </p>
      </div>

      <!-- FOOTER -->
      <div class="modal__footer">
        <div style="display: flex; gap: 8px; align-items: center">
          <AppButton variant="ghost" @click="close">Cancelar</AppButton>
          <AppButton v-if="currentStep > 1" variant="primary" :outlined="true" @click="prevStep">Anterior</AppButton>
        </div>

        <div class="footer__btnGroup">
          <AppButton v-if="currentStep < 4" variant="primary" :outlined="false" @click="nextStep">Siguiente</AppButton>
          <template v-else>
            <AppButton variant="primary" :outlined="true" @click="saveDraft">Guardar borrador</AppButton>
            <AppButton variant="primary" :outlined="false" :disabled="!canPublish" @click="publish">Publicar</AppButton>
          </template>
        </div>
      </div>
    </div>
    <!-- /ecfm-modal -->
  </AppModal>
</template>

<script lang="ts">
import { defineComponent, reactive, watch, computed, ref, nextTick } from 'vue';
import { GetEvaluationRelatedDataService } from '../services/getEvaluationRelatedData.service';
import { GetEvaluationTemplateByIdService } from '../services/getEvaluationTemplateById.service';
import AppDateInput from '../../../shared/components/Forms/AppDateInput.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import { GetAttendanceFilterOptionsService } from '../../../shared/services/reports/getAttendanceFilterOptions.service';
import { GetEvaluationTemplatesService } from '../services/getEvaluationTemplates.service';
import { GetProgramsService } from '../../institutionalConfiguration/services/getPrograms.service';
import { CreateEvaluationService } from '../services/createEvaluation.service';
import { GetMainTeachersService, type MainTeacherResponseItem } from '../services/getMainTeachers.service';
import { GetUsersAndMatriculatesWithPaginationService } from '../../access/services/getUsersAndMatriculatesWithPagination.service';

const TEACHER_TYPES = [
  {
    value: 'principal',
    label: 'Solo Docentes Principales',
    desc: 'Docentes titulares y de tiempo completo',
  },
  {
    value: 'secondary',
    label: 'Solo Docentes Auxiliares',
    desc: 'Docentes de cátedra y auxiliares',
  },
  {
    value: 'all',
    label: 'Todos los Docentes',
    desc: 'Incluye principales y axiliares',
  },
];

const TEACHER_TYPES_90 = [
  { value: 'TEACHER_PRINCIPAL', label: 'Principales', desc: '' },
  { value: 'TEACHER_SECONDARY', label: 'Auxiliares', desc: '' },
  { value: 'TEACHER_ALL', label: 'Ambos', desc: '' },
];

const ICON_90 = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><polyline points="9 14 12 17 15 14"/></svg>`;
const ICON_180 = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
const ICON_270 = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`;
const ICON_360 = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`;

const EVAL_TYPES = [
  {
    value: '90',
    label: '90° Estudiantes',
    desc: 'Evaluación ascendente por estudiantes',
    iconBg: '#2563eb',
    icon: ICON_90,
  },
  {
    value: '180',
    label: '180° Superior',
    desc: 'Evaluación jerárquica descendente',
    iconBg: '#7c3aed',
    icon: ICON_180,
  },
  {
    value: '270',
    label: '270° Monitores/Auxiliares',
    desc: 'Evaluación de pares y colaboradores',
    iconBg: '#4f46e5',
    icon: ICON_270,
  },
  {
    value: '360',
    label: '360° Autoevaluación',
    desc: 'Reflexión y evaluación personal',
    iconBg: '#059669',
    icon: ICON_360,
  },
];

type FormState = {
  name: string;
  description?: string;
  templateId: string | number;
  startDate: string;
  endDate: string;
  evalType: string;
  selectedPrograms: string[];
  teacherType: string;
  mandatory: boolean;
  superiorRole?: string;
  academicPeriod?: string;
  autoNotify?: boolean;
};

function createEmptyForm(): FormState {
  return {
    name: '',
    description: '',
    templateId: '',
    startDate: '',
    endDate: '',
    evalType: '',
    selectedPrograms: [],
    teacherType: '',
    mandatory: false,
    superiorRole: '',
    academicPeriod: '',
    autoNotify: false,
  };
}

export default defineComponent({
  name: 'EvaluationCycleFormModal',
  components: {
    AppDateInput,
    AppModal,
    AppButton,
  },
  props: {
    isVisible: { type: Boolean, default: false },
    evaluation: { type: Object as () => any, default: null },
  },
  emits: ['update:isVisible', 'saved'],
  setup(props, { emit }) {
    const form = reactive<FormState>(createEmptyForm());
    const currentStep = ref(1);
    const steps = [
      { key: 'tipo', title: 'Tipo' },
      { key: 'evaluadores', title: 'Evaluadores' },
      { key: 'alcance', title: 'Alcance' },
      { key: 'config', title: 'Configuración' },
    ];

    const isEditing = computed(() => !!props.evaluation?.id);

    const _skipEvalTypeReset = ref(false);

    watch(
      () => props.evaluation,
      (val) => {
        _skipEvalTypeReset.value = true;
        Object.assign(form, createEmptyForm());
        if (!val) {
          nextTick(() => {
            _skipEvalTypeReset.value = false;
          });
          return;
        }
        form.name = val.name ?? val.title ?? '';
        form.description = val.description ?? '';
        form.templateId = val.templateId ?? '';
        // Handle dates: backend may return ISO strings or formatted strings
        form.startDate = val.startDate ? val.startDate.split('T')[0] : '';
        form.endDate = val.endDate ? val.endDate.split('T')[0] : '';
        // Backend uses evaluationType, modal uses evalType
        form.evalType = val.evaluationType ?? val.evalType ?? '';
        // Backend uses programs array, modal uses selectedPrograms (array of ids)
        if (val.programs && Array.isArray(val.programs)) {
          form.selectedPrograms = val.programs.map((p: any) => String(p.programId ?? p.id ?? p));
          // Also get teacherType from first program if available
          if (val.programs.length > 0 && val.programs[0].teacherType) {
            form.teacherType = val.programs[0].teacherType;
          }
        } else if (val.selectedPrograms) {
          form.selectedPrograms = [...val.selectedPrograms];
        }
        form.teacherType = form.teacherType || (val.teacherType ?? '');
        // Backend uses roles array, extract superiorRole
        if (val.roles && Array.isArray(val.roles) && val.roles.length > 0) {
          form.superiorRole = String(val.roles[0].roleId ?? val.roles[0].id ?? '');
        } else {
          form.superiorRole = val.superiorRole ?? '';
        }
        // Backend uses isRequired, modal uses mandatory
        form.mandatory = val.isRequired ?? val.mandatory ?? false;
        // academicPeriodId
        form.academicPeriod = val.academicPeriodId ? String(val.academicPeriodId) : val.academicPeriod ?? '';
        // autoNotify / sendNotification
        form.autoNotify = val.sendNotification ?? val.autoNotify ?? false;
        // Pre-populate auxiliary assignments for 270/360
        selectedAuxiliaries.value = {};
        teacherUserIdMap.value = {};
        if (Array.isArray(val.teacherAssignments)) {
          val.teacherAssignments.forEach((a: any) => {
            if (a.offeringSubjectId && a.userEvaluatorAssignmentId) {
              selectedAuxiliaries.value[a.offeringSubjectId] = [
                {
                  id: a.userEvaluatorAssignmentId,
                  name: a.evaluatorName ?? a.teacherName ?? String(a.userEvaluatorAssignmentId),
                },
              ];
              teacherUserIdMap.value[a.offeringSubjectId] = a.teacherUserId;
            }
          });
        }
        nextTick(() => {
          _skipEvalTypeReset.value = false;
        });
      },
      { immediate: true }
    );

    watch(
      () => props.isVisible,
      (val) => {
        if (!val) {
          Object.assign(form, createEmptyForm());
          currentStep.value = 1;
          mainTeachers.value = [];
          selectedAuxiliaries.value = {};
          teacherUserIdMap.value = {};
          activeRowId.value = null;
        } else {
          fetchEvalTypes();
          loadPrograms(1, '');
          if (isEditing.value) loadMainTeachers();
        }
      }
    );

    const evalTypes = ref<any[]>(EVAL_TYPES);
    const teacherTypes = ref<any[]>(TEACHER_TYPES);
    const activeTeacherTypes = computed(() => (form.evalType.includes('90') ? TEACHER_TYPES_90 : teacherTypes.value));
    const roles = ref<any[]>([]);
    const academicPeriods = ref<any[]>([]);
    const templates = ref<any[]>([]);
    const templatePreview = ref<any>(null);
    const showPreview = ref(false);
    const startDateRef = ref<any>(null);
    const endDateRef = ref<any>(null);

    function openDatePicker(inpRef: any) {
      const inst = inpRef?.value;
      if (!inst) return;
      // If the ref is a component exposing openPicker, call it
      if (typeof inst.openPicker === 'function') {
        try {
          inst.openPicker();
          return;
        } catch (e) {
          /* ignore */
        }
      }
      // If the ref is a DOM input (or a component with $el), try showPicker/focus
      const el = (inst.$el || inst) as HTMLInputElement | any;
      if (!el) return;
      if (typeof el.showPicker === 'function') {
        try {
          el.showPicker();
          return;
        } catch (e) {
          /* ignore */
        }
      }
      if (typeof el.focus === 'function') el.focus();
    }
    const programsSearch = ref('');
    const programsResults = ref<any[]>([]);
    const loadingPrograms = ref(false);
    const programsPage = ref(1);
    const programsTotalPages = ref(1);
    const programsPerPage = 8;
    const programsCache = ref<Record<string, string>>({});
    const getProgramsService = new GetProgramsService();
    let searchTimer: any = null;

    async function loadPrograms(page = 1, name = '') {
      loadingPrograms.value = true;
      try {
        const res: any = await getProgramsService.run({
          page,
          perPage: programsPerPage,
          name,
        });
        const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        programsResults.value = items.map((p: any) => ({
          id: String(p.id),
          name: p.name || p.title || p.acronym || p.code,
        }));
        // cache names
        items.forEach((p: any) => {
          if (p && p.id) programsCache.value[String(p.id)] = p.name || p.title || p.acronym || p.code || String(p.id);
        });

        programsTotalPages.value = res?.pagination?.pageCount || 1;
        programsPage.value = page;
      } catch (err) {
        programsResults.value = [];
        programsTotalPages.value = 1;
        programsPage.value = 1;
      } finally {
        loadingPrograms.value = false;
      }
    }

    async function searchPrograms(name: string, page = 1) {
      if (!name) {
        await loadPrograms(1, '');
        return;
      }
      await loadPrograms(page, name);
    }

    watch(
      () => programsSearch.value,
      (val) => {
        if (searchTimer) clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
          const q = String(val || '').trim();
          if (q.length >= 2) searchPrograms(q, 1);
          else loadPrograms(1, '');
        }, 300);
      }
    );
    const getTemplateByIdService = new GetEvaluationTemplateByIdService();
    const createEvaluationService = new CreateEvaluationService();

    const templateQuestionsCount = computed(() => {
      const secs = templatePreview.value?.sections || [];
      return secs.reduce((s: number, x: any) => s + (x.count || 0), 0);
    });

    const getRelatedDataService = new GetEvaluationRelatedDataService();
    const getMainTeachersService = new GetMainTeachersService();
    const mainTeachers = ref<MainTeacherResponseItem[]>([]);
    const loadingMainTeachers = ref(false);
    // Persists offeringSubjectId → teacherUserId even when mainTeachers is empty (edit mode)
    const teacherUserIdMap = ref<Record<number, number>>({});

    async function loadMainTeachers() {
      const periodId = form.academicPeriod ? Number(form.academicPeriod) : null;
      if (!periodId) return;
      loadingMainTeachers.value = true;
      try {
        const res = await getMainTeachersService.run({
          academicPeriodId: periodId,
          programIds: form.selectedPrograms.map(String),
          evaluationId: props.evaluation?.id ?? null,
        });
        mainTeachers.value = res?.data ?? [];

        mainTeachers.value.forEach((t) => {
          teacherUserIdMap.value[t.offeringSubjectId] = t.teacherUserId;
          if (t.userEvaluatorId != null) {
            selectedAuxiliaries.value[t.offeringSubjectId] = [
              {
                id: t.userEvaluatorId,
                name: t.userEvaluatorName ?? `Auxiliar #${t.userEvaluatorId}`,
              },
            ];
          }
        });
      } catch {
        mainTeachers.value = [];
      } finally {
        loadingMainTeachers.value = false;
      }
    }

    // ── Auxiliary teachers search ──────────────────────────────────────────
    const getUsersService = new GetUsersAndMatriculatesWithPaginationService();
    const selectedAuxiliaries = ref<Record<number, { id: number; name: string }[]>>({});
    const auxiliarySearch = ref('');
    const auxiliaryResults = ref<{ id: number; name: string }[]>([]);
    const loadingAuxiliaries = ref(false);
    const activeRowId = ref<number | null>(null);
    let auxiliaryTimer: any = null;

    function getAuxiliaryFullName(user: any): string {
      if (user.fullName) return user.fullName;
      if (user.people) return `${user.people.names ?? ''} ${user.people.lastnames ?? ''}`.trim();
      return String(user.id);
    }

    async function searchAuxiliaries(search: string) {
      loadingAuxiliaries.value = true;
      try {
        const res: any = await getUsersService.run({
          perPage: 10,
          page: 1,
          order: 'asc',
          search,
          profile: 'teacher',
        } as any);
        const items: any[] = res?.data ?? res ?? [];
        auxiliaryResults.value = items.map((u: any) => ({
          id: u.id,
          name: getAuxiliaryFullName(u),
        }));
      } catch {
        auxiliaryResults.value = [];
      } finally {
        loadingAuxiliaries.value = false;
      }
    }

    function openAuxiliarySearch(rowId: number) {
      activeRowId.value = rowId;
      auxiliarySearch.value = '';
      auxiliaryResults.value = [];
      searchAuxiliaries('');
    }

    function closeAuxiliarySearch() {
      activeRowId.value = null;
      auxiliarySearch.value = '';
      auxiliaryResults.value = [];
    }

    function onAuxiliarySearchInput(val: string) {
      if (auxiliaryTimer) clearTimeout(auxiliaryTimer);
      auxiliaryTimer = setTimeout(() => searchAuxiliaries(val.trim()), 300);
    }

    function addAuxiliary(rowId: number, teacher: { id: number; name: string }) {
      selectedAuxiliaries.value[rowId] = [teacher];
    }

    function removeAuxiliary(rowId: number, teacherId: number) {
      if (!selectedAuxiliaries.value[rowId]) return;
      selectedAuxiliaries.value[rowId] = selectedAuxiliaries.value[rowId].filter((t) => t.id !== teacherId);
    }
    // ────────────────────────────────────────────────────────────────────────

    async function fetchEvalTypes() {
      try {
        const res: any = await getRelatedDataService.run();

        // La respuesta esperada tiene shape: { data: { evaluationTypes: [...], teacherTypes: [...] } }
        const items = res && res.data && res.data.evaluationTypes ? res.data.evaluationTypes : [];
        const tItems = res && res.data && res.data.teacherTypes ? res.data.teacherTypes : [];
        const rItems = res && res.data && res.data.roles ? res.data.roles : [];
        // Traemos también los academicPeriods desde el servicio de reports (attendance)
        try {
          const attendanceService = new GetAttendanceFilterOptionsService();
          const attRes: any = await attendanceService.run();
          const periods = attRes && attRes.academicPeriods ? attRes.academicPeriods : [];
          // Filtrar solo activos (active === 1)
          academicPeriods.value = periods
            .filter((p: any) => Number(p.active) === 1)
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              startDate: p.startDate,
              endDate: p.endDate,
            }));

          if (!form.academicPeriod) {
            form.academicPeriod = academicPeriods.value[0]?.id ? String(academicPeriods.value[0].id) : academicPeriods.value[0]?.name || '';
          }
        } catch (err) {
          // ignore attendance fetch errors
        }

        if (items && items.length) {
          console.log('Eval types raw from API:', items);
          evalTypes.value = items.map((it: any) => {
            const key = it.key || it.value || '';
            const label = it.label || it.name || '';
            const desc = it.description || it.desc || '';
            const iconBg = it.color || it.iconBg || '#2563eb';

            let icon = '';
            if (/90/.test(key)) icon = ICON_90;
            else if (/180/.test(key)) icon = ICON_180;
            else if (/270/.test(key)) icon = ICON_270;
            else if (/360/.test(key)) icon = ICON_360;

            return {
              value: key,
              label,
              desc,
              iconBg,
              icon,
            };
          });
        }

        if (tItems && tItems.length) {
          teacherTypes.value = tItems.map((tt: any) => ({
            value: tt.key,
            label: tt.label || tt.name || '',
            desc: tt.description || '',
          }));
          if (!form.teacherType) form.teacherType = teacherTypes.value[0]?.value || '';
        }

        if (rItems && rItems.length) {
          roles.value = rItems.map((r: any) => ({
            id: r.id,
            name: r.name,
            desc: r.description,
          }));
          if (!form.superiorRole) form.superiorRole = roles.value[0]?.id ? String(roles.value[0].id) : roles.value[0]?.name || '';
        }

        // Cargar plantillas publicadas
        try {
          const getTemplatesService = new GetEvaluationTemplatesService();
          const tplRes: any = await getTemplatesService.run({
            noPag: 'true',
            status: 'published',
            perPage: 100,
          });
          const tplItems = tplRes && (tplRes.data || tplRes) ? tplRes.data || tplRes : [];
          if (Array.isArray(tplItems) && tplItems.length) {
            templates.value = tplItems.map((t: any) => ({
              id: t.id,
              name: t.name || t.title || `Plantilla ${t.id}`,
            }));
            if (!form.templateId) form.templateId = templates.value[0]?.id || '';
          }
        } catch (e) {
          // templates stays empty if API fails
        }

        // Cargar preview de la plantilla seleccionada si hay una
        if (form.templateId) {
          await loadTemplatePreview(String(form.templateId));
        }
      } catch (e) {
        // fallback: dejamos valores estáticos
      }
    }

    async function loadTemplatePreview(id: string) {
      try {
        const res: any = await getTemplateByIdService.run(Number(id));
        const tpl = res && (res.data || res) ? res.data || res : res;

        // Map to preview shape
        const name = tpl.name || tpl.title || '';
        const description = tpl.description || tpl.desc || '';
        // scale type may be in tpl.scale or tpl.evaluationScale
        let sections: any[] = [];
        if (Array.isArray(tpl.dimensions) && tpl.dimensions.length) {
          sections = tpl.dimensions.map((d: any) => ({
            name: d.name || d.title || 'Sección',
            count: d.questions ? d.questions.length : d.questionCount || 0,
          }));
        } else if (Array.isArray(tpl.sections) && tpl.sections.length) {
          sections = tpl.sections.map((s: any) => ({
            name: s.name || 'Sección',
            count: s.count || 0,
          }));
        }

        templatePreview.value = { name, description, sections };
      } catch (err) {
        templatePreview.value = null;
      }
    }

    // Watch templateId changes to load preview
    watch(
      () => form.templateId,
      (val) => {
        if (val) loadTemplatePreview(String(val));
        else templatePreview.value = null;
      }
    );

    watch(
      () => form.evalType,
      (val) => {
        if (_skipEvalTypeReset.value) return;
        if (val.includes('90')) {
          form.teacherType = 'TEACHER_PRINCIPAL';
        } else {
          form.teacherType = teacherTypes.value[0]?.value || '';
        }
      }
    );

    function close() {
      emit('update:isVisible', false);
    }

    function buildServerPayload(publish: boolean) {
      // The HTML date input returns YYYY-MM-DD format directly, use it as-is
      const startDateStr = form.startDate && typeof form.startDate === 'string' && form.startDate.trim() ? form.startDate.trim() : null;
      const endDateStr = form.endDate && typeof form.endDate === 'string' && form.endDate.trim() ? form.endDate.trim() : null;

      const payload: any = {
        name: form.name,
        description: form.description ?? '',
        evaluationType: form.evalType,
        isRequired: !!form.mandatory,
        startDate: startDateStr,
        endDate: endDateStr,
        templateId: form.templateId ? Number(form.templateId) : undefined,
        academicPeriodId: form.academicPeriod ? Number(form.academicPeriod) : undefined,
        status: publish ? 'published' : 'draft',
        programs: (form.selectedPrograms || []).map((pId: string) => ({
          programId: Number(pId),
          teacherType: form.teacherType || undefined,
        })),
        roles: [],
        sendNotification: Boolean(form.autoNotify),
        teacherAssignments: [] as any[],
      };

      if (form.superiorRole) {
        const roleId = Number(form.superiorRole);
        if (!Number.isNaN(roleId)) {
          const found = roles.value.find((r: any) => Number(r.id) === roleId) as any;
          let mappedRoleType = found?.roleType || found?.type || found?.name || '';
          const et = String(form.evalType || '').trim();
          if (et.includes('360')) mappedRoleType = 'SELF_EVALUATION';
          else mappedRoleType = 'EVALUATOR';

          payload.roles.push({ roleId, roleType: String(mappedRoleType) });
        }
      }

      const isAuxEvalType = form.evalType.includes('270') || form.evalType.includes('360');
      if (isAuxEvalType) {
        payload.teacherAssignments = Object.entries(selectedAuxiliaries.value)
          .filter(([, auxList]) => auxList.length > 0)
          .map(([offeringSubjectIdStr, auxList]) => {
            const offeringSubjectId = Number(offeringSubjectIdStr);
            return {
              offeringSubjectId,
              teacherUserId: teacherUserIdMap.value[offeringSubjectId],
              userEvaluatorAssignmentId: auxList[0].id,
              roleType: 'TEACHER_SECONDARY',
            };
          });
      }

      return payload;
    }

    function toggleProgram(id: string) {
      const idx = form.selectedPrograms.indexOf(id);
      if (idx === -1) form.selectedPrograms.push(id);
      else form.selectedPrograms.splice(idx, 1);
    }

    function getProgramName(id: string) {
      if (programsCache.value[String(id)]) return programsCache.value[String(id)];
      const fromResults = programsResults.value.find((p) => String(p.id) === String(id));
      if (fromResults) return fromResults.name;
      return String(id);
    }

    const stepErrors = ref<string[]>([]);

    function validateStep(step: number): boolean {
      const errors: string[] = [];

      if (step === 1) {
        if (!form.evalType) errors.push('Debes seleccionar un tipo de evaluación.');
      }

      if (step === 2) {
        if (!form.teacherType) errors.push('Debes seleccionar el tipo de docente a evaluar.');
        if (!form.evalType.includes('90') && !form.superiorRole) errors.push('Debes seleccionar el rol evaluador del superior.');
      }

      if (step === 3) {
        if (!form.name.trim()) errors.push('El nombre de la evaluación es obligatorio.');
        if (!form.academicPeriod) errors.push('Debes seleccionar un período académico.');
        if (!form.templateId) errors.push('Debes seleccionar una plantilla de evaluación.');
        if (!form.selectedPrograms.length) errors.push('Debes seleccionar al menos un programa académico.');
      }

      if (step === 4) {
        if (!form.startDate) errors.push('La fecha de inicio es obligatoria.');
        if (!form.endDate) errors.push('La fecha de cierre es obligatoria.');
      }

      stepErrors.value = errors;
      return errors.length === 0;
    }

    function nextStep() {
      if (!validateStep(currentStep.value)) return;
      stepErrors.value = [];
      if (currentStep.value < steps.length) {
        currentStep.value++;
        if (currentStep.value === 4) {
          loadMainTeachers();
        }
      }
    }

    function prevStep() {
      stepErrors.value = [];
      if (currentStep.value > 1) currentStep.value--;
    }

    async function saveDraft() {
      if (!validateStep(4)) return;
      const payload = buildServerPayload(false);
      try {
        const id = isEditing.value ? Number(props.evaluation?.id) : undefined;
        const resp = await createEvaluationService.run(payload, id as any);
        emit('saved', resp);
        close();
      } catch (err) {
        // error handling is done by axios interceptors
      }
    }

    async function publish() {
      if (!validateStep(4)) return;
      const payload = buildServerPayload(true);
      try {
        const id = isEditing.value ? Number(props.evaluation?.id) : undefined;
        const resp = await createEvaluationService.run(payload, id as any);
        emit('saved', resp);
        close();
      } catch (err) {
        // error handling is done by axios interceptors
      }
    }

    const canPublish = computed(() => {
      return !!(form.name && form.templateId && form.startDate && form.endDate);
    });

    return {
      form,
      isEditing,
      stepErrors,
      evalTypes,
      teacherTypes,
      activeTeacherTypes,
      roles,
      academicPeriods,
      templates,
      templatePreview,
      templateQuestionsCount,
      showPreview,
      programsSearch,
      programsResults,
      loadingPrograms,
      searchPrograms,
      loadPrograms,
      programsPage,
      programsTotalPages,
      startDateRef,
      endDateRef,
      openDatePicker,
      close,
      currentStep,
      steps,
      toggleProgram,
      getProgramName,
      nextStep,
      prevStep,
      saveDraft,
      publish,
      canPublish,
      mainTeachers,
      loadingMainTeachers,
      selectedAuxiliaries,
      auxiliarySearch,
      auxiliaryResults,
      loadingAuxiliaries,
      activeRowId,
      openAuxiliarySearch,
      closeAuxiliarySearch,
      onAuxiliarySearchInput,
      addAuxiliary,
      removeAuxiliary,
    };
  },
});
</script>

<style scoped>
/* Overlay y modal — posicionamiento via inline style, aquí solo estilos internos */

/* ===== Header ===== */
.modal__head {
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
  padding: 20px 24px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-shrink: 0;
}

.modal__title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  line-height: 1.2;
}

.modal__subtitle {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  margin: 4px 0 0;
}

.modal__close {
  border: 0;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s ease;
}

.modal__close:hover {
  background: rgba(255, 255, 255, 0.28);
}

/* ===== Body ===== */
.modal__body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: #f8fafc;
}

/* ===== Field boxes ===== */
.fieldBox {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.iconRow {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fieldLabel {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  display: block;
  line-height: 1.4;
}

.req {
  color: #ef4444;
}

.fieldInput {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  color: #0f172a;
  background: #f8fafc;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  transition: all 0.15s ease;
}

.fieldInput:focus {
  border-color: #2563eb;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.fieldSelect {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  color: #0f172a;
  background: #f8fafc;
  outline: none;
  width: 100%;
  cursor: pointer;
  transition: all 0.15s ease;
}

.fieldSelect:focus {
  border-color: #2563eb;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

/* ===== Date row ===== */
.dateRow {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.dateField {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dateLabel {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 2px;
}

/* ===== Section title ===== */
.sectionTitle {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 14px;
}

/* ===== Type cards ===== */
.typeGrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

@media (max-width: 520px) {
  .typeGrid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.typeCard {
  position: relative;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
  transition: all 0.15s ease;
  background: #fff;
  user-select: none;
  min-height: 140px;
  justify-content: center;
}

.typeCard:hover {
  border-color: #bfdbfe;
  background: #f8fafc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
}

.typeCard--sel {
  border-color: #2563eb;
  background: #eff6ff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.typeCard__check {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 22px;
  height: 22px;
  background: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.typeCard__iconBox {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.typeCard__iconInner {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}

.typeCard__name {
  font-size: 13px;
  font-weight: 700;
  color: #334155;
  margin: 0;
  line-height: 1.4;
}

.typeCard__name--sel {
  color: #1d4ed8;
}

.typeCard__desc {
  font-size: 12px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

/* ===== Config 270° ===== */
.configBox {
  background: #f0f7ff;
  border: 1px solid #bfdbfe;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.configBox__head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.configBox__iconBox {
  width: 40px;
  height: 40px;
  background: #2563eb;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.configBox__title {
  font-size: 14px;
  font-weight: 700;
  color: #1e3a8a;
  margin: 0;
}

.configBox__subtitle {
  font-size: 12px;
  color: #3b82f6;
  margin: 3px 0 0;
}

/* ===== Sub cards ===== */
.subCard {
  background: #fff;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  padding: 14px;
}

.subCard__title {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px;
}

.subCard__desc {
  font-size: 12px;
  color: #64748b;
  margin: 0 0 12px;
}

/* ===== Programs grid ===== */
.programsGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.checkItem {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  background: #f8fafc;
  transition: all 0.12s ease;
}

.checkItem:hover {
  background: #f0f7ff;
  border-color: #bfdbfe;
}

.checkInput {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  accent-color: #2563eb;
  cursor: pointer;
  margin-top: 2px;
}

.checkItem__label {
  font-size: 12px;
  color: #334155;
  font-weight: 500;
  cursor: pointer;
}

/* ===== Radio list ===== */
.radioList {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.radioItem {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  background: #fff;
  transition: all 0.15s ease;
}

.radioItem:hover {
  border-color: #bfdbfe;
  background: #f8fafc;
}

.radioItem--sel {
  border-color: #2563eb;
  background: #eff6ff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
}

.radioInput {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  accent-color: #2563eb;
  cursor: pointer;
  margin-top: 2px;
}

.radioItem__name {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  margin: 0;
}

.radioItem__name--sel {
  color: #1d4ed8;
}

.radioItem__desc {
  font-size: 13px;
  color: #64748b;
  margin: 4px 0 0;
  line-height: 1.5;
}

/* ===== Mandatory row ===== */
.mandRow {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  background: #fff;
  transition: all 0.15s ease;
}

.mandRow:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.mandRow--active {
  border-color: #2563eb;
  background: #eff6ff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
}

.mandRow__title {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  margin: 0;
}

.mandRow__desc {
  font-size: 13px;
  color: #64748b;
  margin: 4px 0 0;
  line-height: 1.5;
}

/* ===== Footer ===== */
.modal__footer {
  border-top: 1px solid #e2e8f0;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  background: #fff;
}

.footer__btnGroup {
  display: flex;
  gap: 10px;
}

/* ===== Buttons ===== */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  white-space: nowrap;
  transition: all 0.15s ease;
  line-height: 1;
}

.btn--outline {
  background: #fff;
  color: #475569;
  border-color: #cbd5e1;
}

.btn--outline:hover {
  background: #f8fafc;
  border-color: #94a3b8;
}

.btn--sm {
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
}

/* ===== Stepper (top) ===== */
.ecfm-stepper {
  display: flex;
  gap: 0;
  padding: 16px 20px;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  position: relative;
}
.ecfm-step {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #94a3b8;
  position: relative;
  flex: 1;
}
.ecfm-step:not(:last-child)::after {
  content: '';
  position: absolute;
  left: calc(50% + 50px);
  right: calc(-50% + 50px);
  top: 18px;
  height: 2px;
  background: #e2e8f0;
  z-index: 0;
}
.ecfm-step--active::after,
.ecfm-step--done::after {
  background: #2563eb;
}
.ecfm-step--active .ecfm-step__circle {
  border-color: #2563eb;
  background: #2563eb;
  color: #fff;
}
.ecfm-step--active .ecfm-step__title {
  color: #2563eb;
}
.ecfm-step--done .ecfm-step__circle {
  border-color: #10b981;
  background: #10b981;
  color: #fff;
}
.ecfm-step--done .ecfm-step__title {
  color: #10b981;
}
.ecfm-step__circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #cbd5e1;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  position: relative;
  z-index: 1;
}
.ecfm-step__info {
  z-index: 1;
}
.ecfm-step__title {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

/* Wizard specific styles */
.typeGrid--wizard .typeCard {
  padding: 20px 14px;
  min-height: 160px;
}
.typeCard--wizard {
  position: relative;
}
.typeCard__badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #f1f5f9;
  color: #64748b;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

/* Eval cards */
.evalCards {
  display: flex;
  gap: 14px;
  flex-direction: column;
}
.evalCard {
  display: flex;
  gap: 14px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
}
.evalCard__icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 10px;
  flex-shrink: 0;
}
.evalCard--notice {
  background: #faf5ff;
  border-color: #e9d5ff;
}
.evalCard--selfeval {
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.selfeval__badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #059669;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  margin-top: 6px;
}
.evalCard__title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px;
}
.evalCard__desc {
  font-size: 13px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}
.muted {
  color: #64748b;
  font-size: 13px;
}
.subBlock {
  margin-top: 8px;
}

/* Template Preview */
.templatePreview {
  margin-top: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  padding: 14px;
}
.templatePreview__header {
  margin-bottom: 12px;
}
.templateBadge {
  margin-top: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #7c3aed;
  background: #f3e8ff;
  padding: 4px 10px;
  border-radius: 6px;
  display: inline-block;
}
.templateBadge span {
  color: #7c3aed;
}
.templateSections {
  margin-top: 12px;
}
.templateSection__header {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}
.templateSection__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}
.templateSection__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 13px;
}
.templateSection__item svg {
  flex-shrink: 0;
}
.templateSection__item span:nth-child(2) {
  flex: 1;
  color: #334155;
  font-weight: 500;
}
.templateSection__count {
  font-weight: 700;
  color: #2563eb;
  background: #eff6ff;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 12px;
}
.templateActions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* Chips */
.chipsRow {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}
.chip {
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid #cbd5e1;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s;
}
.chip:hover {
  background: #f8fafc;
  border-color: #94a3b8;
}
.chip--sel {
  background: #eff6ff;
  border-color: #2563eb;
  color: #1d4ed8;
  font-weight: 600;
}
.chip--sm {
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  background: #2563eb;
  color: #fff;
  border: none;
}
.chip--success {
  background: #22c55e;
  color: #fff;
  border: none;
}
.chip--dim {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  font-size: 13px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #334155;
}

/* Warning Box */
.warningBox {
  background: #fffbeb;
  border: 1px solid #fde68a;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
}
.warningBox__header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.warningBox__header strong {
  font-size: 14px;
  color: #92400e;
}
.warningBox__desc {
  font-size: 13px;
  color: #78350f;
  margin: 0 0 12px;
  line-height: 1.5;
}
.warningTable {
  background: #fff;
  border: 1px solid #fde68a;
  border-radius: 8px;
  overflow: hidden;
}
.warnHeader {
  display: grid;
  grid-template-columns: 1.2fr 1fr 2fr;
  gap: 10px;
  padding: 10px 12px;
  background: #fef3c7;
  font-size: 11px;
  font-weight: 700;
  color: #78350f;
  letter-spacing: 0.3px;
}
.warnRow {
  display: grid;
  grid-template-columns: 1.2fr 1fr 2fr;
  gap: 10px;
  align-items: flex-start;
  padding: 12px;
  border-top: 1px solid #fef3c7;
}
.warnRow--aux {
  align-items: flex-start;
}
.warnRow:first-child {
  border-top: none;
}
.warnCol {
  font-size: 13px;
  color: #334155;
}
.warnCol--wide {
  min-width: 0;
}
.warnRow--active {
  background: #eff6ff;
}

/* Auxiliary cell */
.auxCell {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}
.auxChip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #e0e7ff;
  color: #3730a3;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 999px;
}
.auxChip__remove {
  background: none;
  border: none;
  cursor: pointer;
  color: #6366f1;
  font-size: 12px;
  line-height: 1;
  padding: 0;
  opacity: 0.7;
  transition: opacity 0.15s;
}
.auxChip__remove:hover {
  opacity: 1;
}
.auxAddBtn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border: 1.5px dashed #93c5fd;
  border-radius: 999px;
  background: transparent;
  color: #2563eb;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.auxAddBtn:hover,
.auxAddBtn--active {
  background: #eff6ff;
  border-color: #2563eb;
}

/* Auxiliary search panel */
.auxSearchPanel {
  margin-top: 12px;
  border: 1.5px solid #bfdbfe;
  border-radius: 10px;
  background: #fff;
  overflow: hidden;
}
.auxSearchPanel__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #eff6ff;
  font-size: 12px;
  color: #1e40af;
  border-bottom: 1px solid #bfdbfe;
}
.auxSearchPanel__header strong {
  color: #1d4ed8;
}
.auxSearchPanel__close {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  font-size: 14px;
  line-height: 1;
  padding: 0;
  transition: color 0.15s;
}
.auxSearchPanel__close:hover {
  color: #1e293b;
}
.auxSearchPanel__input {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid #e2e8f0;
}
.auxSearchPanel__field {
  flex: 1;
  border: none;
  outline: none;
  font-size: 13px;
  color: #1e293b;
  background: transparent;
}
.auxSearchPanel__field::placeholder {
  color: #94a3b8;
}
.auxSearchPanel__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #bfdbfe;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  flex-shrink: 0;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.auxSearchPanel__results {
  max-height: 180px;
  overflow-y: auto;
}
.auxSearchPanel__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px;
  font-size: 12px;
  color: #94a3b8;
}
.auxSearchPanel__item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 14px;
  background: none;
  border: none;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s;
}
.auxSearchPanel__item:last-child {
  border-bottom: none;
}
.auxSearchPanel__item:hover {
  background: #f8faff;
}
.auxSearchPanel__item--selected {
  background: #f0fdf4;
}
.auxSearchPanel__avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.auxSearchPanel__name {
  flex: 1;
  font-size: 13px;
  color: #1e293b;
}

/* Field extras */
.fieldDesc {
  font-size: 13px;
  color: #64748b;
  margin: 6px 0 10px;
}
.fieldNote {
  font-size: 12px;
  color: #64748b;
  margin: 10px 0 0;
  display: flex;
  align-items: flex-start;
  gap: 4px;
  line-height: 1.6;
}
.fieldNote svg {
  flex-shrink: 0;
  margin-top: 2px;
}

/* Button small */
.btn--sm {
  padding: 7px 12px;
  font-size: 12px;
}

/* Step header */
.stepHeader h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}
.stepSub {
  margin: 6px 0 16px;
  color: #64748b;
  font-size: 14px;
}
</style>
