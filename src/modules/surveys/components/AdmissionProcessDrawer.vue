<template>
  <AppDrawer :isVisible="isVisible" size="xl" :showCloseButton="true" @update:isVisible="handleVisibilityChange">
    <template #head>
      <AppDrawerHeader
        :variant="isEditing ? 'edit' : 'create'"
        icon="project-diagram"
        :title="isEditing ? 'Editar proceso de admisión' : 'Crear proceso de admisión'"
        :subtitle="`Paso ${currentStep} de 4: ${currentStepTitle}`"
      >
        <template #meta>
          <span class="admissionProcessDrawer__metaPill">
            {{ currentPeriodName }}
          </span>
          <span class="admissionProcessDrawer__metaPill admissionProcessDrawer__metaPill--soft">
            {{ currentStatusLabel }}
          </span>
        </template>
      </AppDrawerHeader>
    </template>

    <template #body>
      <form id="admission-process-form" class="admissionProcessDrawer" @submit.prevent="saveProcess">
        <AppWizardStepper v-model="currentStep" :steps="wizardSteps" class="admissionProcessDrawer__stepper" />

        <section v-if="currentStep === 1" class="admissionProcessDrawer__section">
          <div class="admissionProcessDrawer__sectionHeader">
            <div class="admissionProcessDrawer__sectionBadge">1</div>
            <div>
              <h4 class="admissionProcessDrawer__sectionTitle">Información del proceso</h4>
              <p class="admissionProcessDrawer__sectionSubtitle">Define el nombre, periodo, vigencia y estado inicial del proceso de admisión.</p>
            </div>
          </div>

          <div class="admissionProcessDrawer__contentBlock">
            <AppFormField :formControl="v$.form.title" label="Nombre del proceso">
              <AppInput v-model="form.title" type="text" placeholder="Ej: Proceso de Admisión Regular 2026-1" />
            </AppFormField>

            <AppFormField :formControl="v$.form.academicPeriodId" label="Periodo académico">
              <AppAutocomplete
                v-model="form.academicPeriodId"
                :options="academicPeriodOptions"
                label="name"
                :reduce="reduceOption"
                :clearable="false"
                @update:modelValue="handleAcademicPeriodChange"
              />
            </AppFormField>

            <AppFormField :formControl="v$.form.status" label="Estado">
              <AppAutocomplete v-model="form.status" :options="drawerStatusOptions" label="label" :reduce="(option: any) => option.key" />
            </AppFormField>

            <div class="admissionProcessDrawer__grid admissionProcessDrawer__grid--two">
              <AppFormField :formControl="v$.form.startDate" label="Fecha de inicio">
                <AppInput v-model="form.startDate" type="date" />
              </AppFormField>

              <AppFormField :formControl="v$.form.endDate" label="Fecha de cierre">
                <AppInput v-model="form.endDate" type="date" />
              </AppFormField>
            </div>

            <div class="admissionProcessDrawer__sequenceOptions admissionProcessDrawer__sequenceOptions--single">
              <AppSelectableCard class="admissionProcessDrawer__selectableCard" :selected="form.requiredOrder" @toggle="form.requiredOrder = !form.requiredOrder">
                <div class="admissionProcessDrawer__selectableCardContent">
                  <span class="admissionProcessDrawer__choiceIcon admissionProcessDrawer__choiceIcon--indigo">
                    <AppIcon icon="tasks" />
                  </span>

                  <span class="admissionProcessDrawer__choiceContent">
                    <strong class="admissionProcessDrawer__choiceTitle">Requiere orden</strong>
                    <small class="admissionProcessDrawer__choiceSubtitle">Obliga a completar los pasos del proceso en secuencia.</small>
                  </span>
                </div>
              </AppSelectableCard>
            </div>

            <div class="admissionProcessDrawer__infoBox">
              <div class="admissionProcessDrawer__infoIcon">
                <AppIcon icon="info-circle" />
              </div>
              <div>
                <strong class="d-block text-dark mb-1">Periodo seleccionado: {{ currentPeriodName }}</strong>
                <small class="text-muted">Al cambiar el periodo, se cargan automáticamente los programas y el rango de fechas base.</small>
              </div>
            </div>
          </div>

          <div class="admissionProcessDrawer__sectionHeader admissionProcessDrawer__sectionHeader--small">
            <div class="admissionProcessDrawer__sectionBadge">2</div>
            <div>
              <h4 class="admissionProcessDrawer__sectionTitle">Imagen del proceso</h4>
              <p class="admissionProcessDrawer__sectionSubtitle">Esta imagen puede utilizarse como apoyo visual del proceso de admisión.</p>
            </div>
          </div>

          <div class="admissionProcessDrawer__contentBlock admissionProcessDrawer__contentBlock--compact">
            <AppAttachmentDropzone
              v-model="imageFile"
              v-model:certificateUrl="form.thumbnail"
              isTitle="Imagen principal"
              isHelper="PNG, JPG, JPEG, WEBP (max. 10MB)"
              isAccept=".png,.jpg,.jpeg,.webp"
              :isMaxSizeMB="10"
              @delete="handleImageDelete"
            />
          </div>
        </section>

        <section v-else-if="currentStep === 2" class="admissionProcessDrawer__section">
          <div class="admissionProcessDrawer__sectionHeader">
            <div class="admissionProcessDrawer__sectionBadge">2</div>
            <div>
              <h4 class="admissionProcessDrawer__sectionTitle">Programas del periodo</h4>
              <p class="admissionProcessDrawer__sectionSubtitle">Revisa los programas habilitados y la capacidad disponible para este proceso.</p>
            </div>
          </div>

          <div class="admissionProcessDrawer__statsGrid">
            <AppStatCard v-for="card in programStatsCards" :key="card.label" :label="card.label" :value="card.value" :caption="card.caption" :icon="card.icon" :variant="card.variant" />
          </div>

          <div class="admissionProcessDrawer__tableShell">
            <div class="table-responsive">
              <table class="admissionProcessDrawer__table">
                <thead>
                  <tr>
                    <th>Programa</th>
                    <th>Cupos</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!form.programs.length">
                    <td colspan="5" class="text-center text-muted py-4">No hay programas asociados al periodo seleccionado.</td>
                  </tr>

                  <tr v-for="program in form.programs" :key="program.id">
                    <td class="fw-semibold text-dark">
                      {{ program.programName }}
                    </td>

                    <td>{{ program.maxCapacity }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section v-else-if="currentStep === 3" class="admissionProcessDrawer__section">
          <div class="admissionProcessDrawer__sectionHeader">
            <div class="admissionProcessDrawer__sectionBadge">3</div>
            <div>
              <h4 class="admissionProcessDrawer__sectionTitle">Workflow del proceso</h4>
              <p class="admissionProcessDrawer__sectionSubtitle">Construye el flujo de pasos que deben completar los aspirantes. Puedes arrastrarlos para reordenar.</p>
            </div>
          </div>

          <div class="admissionProcessDrawer__workflowHero">
            <div>
              <strong class="d-block text-dark mb-1">{{ form.steps.length }} pasos configurados</strong>
              <small class="text-muted">Todos los pasos del workflow son obligatorios.</small>
            </div>

            <AppButton variant="primary" @click="openNewStepForm">
              <AppIcon icon="plus" class="me-2" />
              Agregar paso
            </AppButton>
          </div>

          <div v-if="showStepForm" ref="stepFormRef" class="admissionProcessDrawer__editorSurface">
            <div class="admissionProcessDrawer__inlineHeader">
              <div>
                <h5 class="mb-1">
                  {{ editingStepId ? 'Editar paso' : 'Nuevo paso' }}
                </h5>
                <small class="text-muted">Define el tipo, el elemento asociado y a quién aplica este paso.</small>
              </div>
            </div>

            <div class="admissionProcessDrawer__composer">
              <div class="admissionProcessDrawer__choiceSection">
                <label class="admissionProcessDrawer__choiceLabel">Tipo de paso</label>

                <div class="admissionProcessDrawer__choiceGrid admissionProcessDrawer__choiceGrid--stepTypes">
                  <template v-if="workflowReferenceStepCards.length">
                    <button
                      v-for="option in workflowReferenceStepCards"
                      :key="option.id"
                      type="button"
                      class="admissionProcessDrawer__choiceCard"
                      :class="{
                        'admissionProcessDrawer__choiceCard--active': stepDraft.referenceStepId === option.id,
                      }"
                      @click="selectWorkflowReferenceStep(option)"
                    >
                      <span class="admissionProcessDrawer__choiceIcon" :class="`admissionProcessDrawer__choiceIcon--${option.tone}`">
                        <AppIcon :icon="option.icon" />
                      </span>

                      <span class="admissionProcessDrawer__choiceContent">
                        <strong class="admissionProcessDrawer__choiceTitle">{{ option.title }}</strong>
                        <small class="admissionProcessDrawer__choiceSubtitle">{{ option.stepTypeName }} · {{ option.solveAdmin ? 'Administrador' : getAppliesToSummary(option.appliesTo) }}</small>
                      </span>

                      <AppIcon v-if="stepDraft.referenceStepId === option.id" icon="check-circle" class="admissionProcessDrawer__choiceCheck" />
                    </button>
                  </template>

                  <template v-else>
                    <button
                      v-for="option in drawerStepTypeOptions"
                      :key="option.id"
                      type="button"
                      class="admissionProcessDrawer__choiceCard"
                      :class="{
                        'admissionProcessDrawer__choiceCard--active': stepDraft.referenceStepId === null && stepDraft.type === option.id,
                      }"
                      @click="handleStepTypeChange(option.id)"
                    >
                      <span class="admissionProcessDrawer__choiceIcon" :class="`admissionProcessDrawer__choiceIcon--${option.tone}`">
                        <AppIcon :icon="option.icon" />
                      </span>

                      <span class="admissionProcessDrawer__choiceContent">
                        <strong class="admissionProcessDrawer__choiceTitle">{{ option.name }}</strong>
                        <small class="admissionProcessDrawer__choiceSubtitle">
                          {{ getStepTypeDescription(option.id) }}
                        </small>
                      </span>

                      <AppIcon v-if="stepDraft.referenceStepId === null && stepDraft.type === option.id" icon="check-circle" class="admissionProcessDrawer__choiceCheck" />
                    </button>
                  </template>
                </div>
              </div>

              <AppFormField label="Nombre">
                <AppInput v-model="stepDraft.title" type="text" placeholder="Nombre del paso" />
              </AppFormField>
              <AppFormField label="URL del video">
                <AppInput v-model="stepDraft.videoUrl" type="text" placeholder="https://www.youtube.com/watch?v=..." />
              </AppFormField>
              <AppFormField v-if="stepDraft.type === 'documento'" label="Elemento">
                <AppAutocomplete v-model="stepDraft.documentIds" :options="documents" label="title" :multiple="true" :reduce="(d: any) => d.id" placeholder="Selecciona documentos" />
              </AppFormField>

              <AppFormField v-else-if="stepDraft.type === 'adjunto'" label="Elemento">
                <AppAutocomplete v-model="stepDraft.requirementIds" :options="attachments" label="title" :multiple="true" :reduce="(a: any) => a.id" placeholder="Selecciona adjuntos" />
              </AppFormField>

              <template v-else-if="stepDraft.type === 'examen de evaluación'">
                <div class="admissionProcessDrawer__examBox">
                  <label class="admissionProcessDrawer__choiceLabel">Checklist por oferta curricular</label>

                  <div v-if="examOfferingsLoading" class="text-muted py-2">Cargando ofertas curriculares...</div>

                  <div v-else-if="stepDraft.convocationChecklists.length" class="admissionProcessDrawer__examList">
                    <div class="admissionProcessDrawer__examListHeader">
                      <span>Programa</span>
                      <span>Checklist</span>
                    </div>

                    <div v-for="(item, index) in stepDraft.convocationChecklists" :key="item.curriculumOfferingId" class="admissionProcessDrawer__examRow">
                      <span class="admissionProcessDrawer__examProgramName">{{ getOfferingName(item.curriculumOfferingId) }}</span>
                      <div class="admissionProcessDrawer__examSelector">
                        <AppAutocomplete
                          v-model="stepDraft.convocationChecklists[index].checklistId"
                          :options="checklists"
                          label="titulo"
                          :reduce="(c: any) => c.id"
                          :disabled="checklistsLoading"
                          placeholder="Selecciona checklist"
                        />
                      </div>
                    </div>
                  </div>

                  <p v-else class="text-muted py-2">No hay ofertas curriculares para el periodo seleccionado.</p>
                </div>
              </template>

              <AppFormField v-else-if="stepDraft.type !== 'matriculas de asignaturas' && stepDraft.type !== 'cobro'" label="Elemento">
                <AppAutocomplete
                  v-model="stepDraft.elementId"
                  :options="currentStepElementOptions"
                  label="name"
                  :reduce="reduceOption"
                  :clearable="false"
                  :disabled="elementOptionsLoading"
                  placeholder="Selecciona un elemento"
                  @update:modelValue="handleStepElementChange"
                  @search="searchStepElements"
                />

                <small v-if="stepElementHelperText" class="admissionProcessDrawer__helperText">{{ stepElementHelperText }}</small>
              </AppFormField>

              <AppFormField label="Descripción">
                <textarea v-model="stepDraft.description" class="form-control" rows="3" placeholder="Descripción funcional del paso dentro del flujo de admisión..."></textarea>
              </AppFormField>

              <div class="admissionProcessDrawer__sequenceBox">
                <label class="admissionProcessDrawer__choiceLabel">Aplica para</label>

                <div class="admissionProcessDrawer__sequenceOptions">
                  <AppSelectableCard
                    v-for="option in drawerAppliesToOptions"
                    :key="option.id"
                    class="admissionProcessDrawer__selectableCard"
                    :selected="isAppliesToSelected(option.id)"
                    @toggle="toggleAppliesTo(option.id)"
                  >
                    <div class="admissionProcessDrawer__selectableCardContent">
                      <span class="admissionProcessDrawer__choiceIcon" :class="`admissionProcessDrawer__choiceIcon--${option.tone}`">
                        <AppIcon :icon="option.icon" />
                      </span>

                      <span class="admissionProcessDrawer__choiceContent">
                        <strong class="admissionProcessDrawer__choiceTitle">{{ option.name }}</strong>
                        <small class="admissionProcessDrawer__choiceSubtitle">{{ getAppliesToDescription(option.id) }}</small>
                      </span>
                    </div>
                  </AppSelectableCard>
                </div>

                <div class="admissionProcessDrawer__sequenceOptions admissionProcessDrawer__sequenceOptions--single">
                  <AppSelectableCard class="admissionProcessDrawer__selectableCard" :selected="stepDraft.requiresApproval" @toggle="stepDraft.requiresApproval = !stepDraft.requiresApproval">
                    <div class="admissionProcessDrawer__selectableCardContent">
                      <span class="admissionProcessDrawer__choiceIcon admissionProcessDrawer__choiceIcon--amber">
                        <AppIcon icon="check-circle" />
                      </span>

                      <span class="admissionProcessDrawer__choiceContent">
                        <strong class="admissionProcessDrawer__choiceTitle">Requiere aprobación</strong>
                        <small class="admissionProcessDrawer__choiceSubtitle">Solicita revisión antes de completar este paso.</small>
                      </span>
                    </div>
                  </AppSelectableCard>
                </div>

                <div class="admissionProcessDrawer__sequenceOptions admissionProcessDrawer__sequenceOptions--single">
                  <AppSelectableCard class="admissionProcessDrawer__selectableCard" :selected="stepDraft.solveAdmin" @toggle="handleSolveAdminChange(!stepDraft.solveAdmin)">
                    <div class="admissionProcessDrawer__selectableCardContent">
                      <span class="admissionProcessDrawer__choiceIcon admissionProcessDrawer__choiceIcon--gray">
                        <AppIcon icon="cogs" />
                      </span>

                      <span class="admissionProcessDrawer__choiceContent">
                        <strong class="admissionProcessDrawer__choiceTitle">Resolver desde el administrador</strong>
                        <small class="admissionProcessDrawer__choiceSubtitle">Permite gestionar este paso directamente desde administración.</small>
                      </span>
                    </div>
                  </AppSelectableCard>
                </div>
              </div>

              <div v-if="stepDraft.type === 'cobro'" class="admissionProcessDrawer__paymentBox">
                <label class="admissionProcessDrawer__choiceLabel">Configuración de cobro</label>

                <label class="admissionProcessDrawer__choiceLabel">Productos o conceptos a cobrar*</label>

                <div class="table-responsive">
                  <table class="admissionProcessDrawer__paymentTable">
                    <thead>
                      <tr>
                        <th>Concepto *</th>
                        <th>Valor *</th>
                        <th>Obligatorio *</th>
                        <th></th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr v-if="!stepDraft.paymentItems.length">
                        <td colspan="4" class="text-center text-muted py-3">Agrega al menos un concepto de cobro.</td>
                      </tr>

                      <tr v-for="(item, index) in stepDraft.paymentItems" :key="item.id">
                        <td>
                          <AppAutocomplete
                            v-model="stepDraft.paymentItems[index].product"
                            :options="chargeProductSearchOptions"
                            :reduce="(option: any) => option"
                            label="title"
                            @search="searchChargeProducts"
                          />
                        </td>

                        <td>
                          <span
                            >{{
                              Number(item.product?.defaultUnitValue ?? 0).toLocaleString('es-CO', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            }}
                            COP</span
                          >
                        </td>

                        <td>
                          <div class="form-check form-switch">
                            <input
                              :checked="!stepDraft.paymentItems[index].isOptional"
                              class="form-check-input"
                              type="checkbox"
                              @change="stepDraft.paymentItems[index].isOptional = !($event.target as HTMLInputElement).checked"
                            />
                          </div>
                        </td>

                        <td>
                          <AppButtonDelete @click="removePaymentItem(index)" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="admissionProcessDrawer__paymentAdd">
                  <AppButtonNewContainer text="core.new" @click="addPaymentItem" />
                </div>

                <p class="admissionProcessDrawer__paymentTotal">
                  {{
                    paymentItemsTotal.toLocaleString('es-CO', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  }}
                  COP
                </p>

                <AppFormField label="Agregar descuentos aplicables al cobro">
                  <AppAutocomplete v-model="stepDraft.discountIds" :options="discounts" label="title" :multiple="true" :disabled="discountsLoading" />
                </AppFormField>

                <label class="admissionProcessDrawer__checkbox">
                  <input v-model="stepDraft.allowQuotes" type="checkbox" class="form-check-input mt-0" />
                  <span>Permitir cuotas</span>
                </label>

                <AppFormField label="Máximo de cuotas">
                  <AppInput v-model="stepDraft.maxQuotes" type="number" placeholder="Ej: 3" :disabled="!stepDraft.allowQuotes" />
                </AppFormField>
                <AppFormField label="Medio de pago">
                  <AppAutocomplete
                    v-model="stepDraft.paymentMethodIds"
                    :options="paymentMethodOptions"
                    label="name"
                    :multiple="true"
                    :reduce="reduceOption"
                    placeholder="Selecciona uno o varios métodos de pago"
                  />
                </AppFormField>
              </div>
            </div>

            <div class="admissionProcessDrawer__inlineActions">
              <AppButton variant="ghost" @click="closeStepForm">Cancelar</AppButton>
              <AppButton variant="primary" @click="saveStep">
                {{ editingStepId ? 'Actualizar paso' : 'Agregar paso' }}
              </AppButton>
            </div>
          </div>

          <div class="admissionProcessDrawer__workflowList">
            <div v-if="!form.steps.length" class="admissionProcessDrawer__emptyState">
              <AppIcon icon="sitemap" />
              <p class="mb-1">Aún no has configurado pasos para este proceso.</p>
              <small>Agrega el primer paso para construir el workflow de admisión.</small>
            </div>

            <draggable
              v-else
              tag="div"
              :list="form.steps"
              item-key="id"
              handle=".appReorderableItem__handle"
              ghost-class="admissionProcessDrawer__workflowCard--ghost"
              @change="normalizeStepOrder"
              style="display: inherit; flex-direction: inherit; gap: inherit"
            >
              <template #item="{ element, index }">
                <AppReorderableItem
                  :order="index + 1"
                  :order-tone="getStepTypeConfig(element.type).tone"
                  :title="element.title"
                  :subtitle="element.elementName"
                  :description="element.description || 'Sin descripción adicional.'"
                  handle-label="Mover paso del workflow"
                >
                  <template #badges>
                    <div class="admissionProcessDrawer__workflowBadges">
                      <span class="admissionProcessDrawer__pill" :class="`admissionProcessDrawer__pill--${getStepTypeConfig(element.type).tone}`">
                        <AppIcon :icon="getStepTypeConfig(element.type).icon" class="me-1" />
                        {{ getStepTypeConfig(element.type).name }}
                      </span>

                      <span
                        v-for="audience in selectedAppliesToConfigs(element.appliesTo)"
                        :key="`${element.id}-${audience.id}`"
                        class="admissionProcessDrawer__pill admissionProcessDrawer__pill--soft"
                        :class="`admissionProcessDrawer__pill--${audience.tone}`"
                      >
                        <AppIcon :icon="audience.icon" class="me-1" />
                        {{ audience.name }}
                      </span>

                      <span v-if="element.type === 'cobro' && element.paymentMethodIds?.length" class="admissionProcessDrawer__pill admissionProcessDrawer__pill--gray">
                        <AppIcon icon="credit-card" class="me-1" />
                        {{ currentPaymentMethodsLabel(element.paymentMethodIds) }}
                      </span>

                      <span v-if="element.requiresApproval" class="admissionProcessDrawer__pill admissionProcessDrawer__pill--amber">Requiere aprobación</span>
                      <span v-if="element.solveAdmin" class="admissionProcessDrawer__pill admissionProcessDrawer__pill--gray">Administra</span>
                    </div>
                  </template>

                  <template #actions>
                    <AppButtonEdit @click="editStep(element)" />
                    <AppButtonDelete @click="removeStep(element.id)" />
                  </template>
                </AppReorderableItem>
              </template>
            </draggable>
          </div>
        </section>

        <section v-else class="admissionProcessDrawer__section">
          <div class="admissionProcessDrawer__sectionHeader">
            <div class="admissionProcessDrawer__sectionBadge">4</div>
            <div>
              <h4 class="admissionProcessDrawer__sectionTitle">Revisión final</h4>
              <p class="admissionProcessDrawer__sectionSubtitle">Confirma la información principal antes de guardar el proceso de admisión.</p>
            </div>
          </div>

          <div class="admissionProcessDrawer__reviewHero">
            <div class="admissionProcessDrawer__reviewHeroContent">
              <span class="admissionProcessDrawer__reviewEyebrow"> Confirmación final </span>
              <h5 class="admissionProcessDrawer__reviewHeroTitle">
                {{ form.title || 'Proceso de admisión sin nombre' }}
              </h5>
              <p class="admissionProcessDrawer__reviewHeroSubtitle">Verifica la configuración general, la cobertura y el workflow antes de guardar el proceso.</p>

              <div class="admissionProcessDrawer__reviewMeta">
                <span class="admissionProcessDrawer__pill admissionProcessDrawer__pill--blue">
                  <AppIcon icon="calendar" class="me-1" />
                  {{ currentPeriodName }}
                </span>

                <span class="admissionProcessDrawer__pill admissionProcessDrawer__pill--gray">
                  <AppIcon icon="flag" class="me-1" />
                  {{ currentStatusLabel }}
                </span>

                <span class="admissionProcessDrawer__pill admissionProcessDrawer__pill--indigo">
                  <AppIcon icon="clock" class="me-1" />
                  {{ reviewDateRangeLabel }}
                </span>
              </div>
            </div>

            <div v-if="form.thumbnail" class="admissionProcessDrawer__reviewMedia">
              <img :src="form.thumbnail" alt="Imagen principal del proceso de admisión" class="admissionProcessDrawer__reviewMediaImage" />
            </div>
          </div>

          <div class="admissionProcessDrawer__reviewStatsGrid">
            <AppStatCard v-for="card in reviewStatsCards" :key="card.label" :label="card.label" :value="card.value" :caption="card.caption" :icon="card.icon" :variant="card.variant" />
          </div>

          <div class="admissionProcessDrawer__reviewGrid">
            <div class="admissionProcessDrawer__reviewPanel">
              <h5 class="admissionProcessDrawer__reviewTitle">Información general</h5>
              <ul class="admissionProcessDrawer__reviewList">
                <li>
                  <span>Nombre del proceso</span>
                  <strong>{{ form.title || 'Sin nombre' }}</strong>
                </li>
                <li>
                  <span>Periodo académico</span>
                  <strong>{{ currentPeriodName }}</strong>
                </li>
                <li>
                  <span>Estado actual</span>
                  <strong>{{ currentStatusLabel }}</strong>
                </li>
                <li>
                  <span>Fechas de vigencia</span>
                  <strong>{{ reviewDateRangeLabel }}</strong>
                </li>
              </ul>
            </div>

            <div class="admissionProcessDrawer__reviewPanel">
              <h5 class="admissionProcessDrawer__reviewTitle">Estado del workflow</h5>
              <ul class="admissionProcessDrawer__reviewList">
                <li>
                  <span>Pasos configurados</span>
                  <strong>{{ form.steps.length }}</strong>
                </li>
                <li>
                  <span>Requieren aprobación</span>
                  <strong>{{ stepsRequiringApproval }}</strong>
                </li>
                <li>
                  <span>Gestionados por administración</span>
                  <strong>{{ adminManagedSteps }}</strong>
                </li>
                <li>
                  <span>Imagen principal</span>
                  <strong>{{ form.thumbnail ? 'Adjunta' : 'Sin imagen' }}</strong>
                </li>
              </ul>
            </div>
          </div>

          <div class="admissionProcessDrawer__reviewSection">
            <div class="admissionProcessDrawer__inlineHeader">
              <div>
                <h5 class="mb-1">Programas asociados</h5>
                <small class="text-muted">Programas tomados desde el periodo académico seleccionado.</small>
              </div>
            </div>

            <div class="admissionProcessDrawer__reviewProgramGrid">
              <div v-for="program in form.programs" :key="program.id" class="admissionProcessDrawer__reviewProgramCard">
                <strong class="admissionProcessDrawer__reviewProgramName">
                  {{ program.programName }}
                </strong>
                <small class="text-muted">{{ program.modalityName }}</small>

                <div class="admissionProcessDrawer__reviewProgramMeta">
                  <span>{{ program.maxCapacity }} cupos</span>
                </div>
              </div>
            </div>
          </div>

          <div class="admissionProcessDrawer__reviewSection">
            <div class="admissionProcessDrawer__inlineHeader">
              <div>
                <h5 class="mb-1">Workflow configurado</h5>
                <small class="text-muted">Estos serán los pasos visibles para la gestión del proceso.</small>
              </div>
            </div>

            <div class="admissionProcessDrawer__reviewSteps">
              <AppReorderableItem
                v-for="step in orderedSteps"
                :key="step.id"
                :order="step.order"
                :order-tone="getStepTypeConfig(step.type).tone"
                :title="step.title"
                :subtitle="`${getStepTypeConfig(step.type).name} · ${step.elementName}`"
                :description="step.description || 'Sin descripción adicional.'"
                :show-handle="false"
              >
                <template #badges>
                  <div class="admissionProcessDrawer__workflowBadges">
                    <span class="admissionProcessDrawer__pill" :class="`admissionProcessDrawer__pill--${getStepTypeConfig(step.type).tone}`">
                      <AppIcon :icon="getStepTypeConfig(step.type).icon" class="me-1" />
                      {{ getStepTypeConfig(step.type).name }}
                    </span>

                    <span
                      v-for="audience in selectedAppliesToConfigs(step.appliesTo)"
                      :key="`${step.id}-${audience.id}`"
                      class="admissionProcessDrawer__pill admissionProcessDrawer__pill--soft"
                      :class="`admissionProcessDrawer__pill--${audience.tone}`"
                    >
                      <AppIcon :icon="audience.icon" class="me-1" />
                      {{ audience.name }}
                    </span>

                    <span v-if="step.type === 'cobro' && step.paymentMethodIds?.length" class="admissionProcessDrawer__pill admissionProcessDrawer__pill--gray">
                      <AppIcon icon="credit-card" class="me-1" />
                      {{ currentPaymentMethodsLabel(step.paymentMethodIds) }}
                    </span>

                    <span v-if="step.requiresApproval" class="admissionProcessDrawer__pill admissionProcessDrawer__pill--amber"> Requiere aprobación </span>

                    <span v-if="step.solveAdmin" class="admissionProcessDrawer__pill admissionProcessDrawer__pill--gray"> Administra </span>
                  </div>
                </template>
              </AppReorderableItem>
            </div>
          </div>
        </section>
      </form>
    </template>

    <template #footer>
      <div class="admissionProcessDrawer__footer">
        <div class="admissionProcessDrawer__footerActions">
          <AppButton variant="ghost" :disabled="isSaving" @click="closeDrawer">Cancelar</AppButton>
        </div>

        <div class="admissionProcessDrawer__footerActions">
          <AppButton v-if="currentStep > 1" variant="primary" outlined :disabled="isSaving" @click="goPrevious">Anterior</AppButton>
          <AppButton v-if="currentStep < wizardSteps.length" variant="primary" :disabled="isSaving || !canGoNext" @click="goNext">Continuar</AppButton>
          <AppButton v-else variant="primary" :disabled="isSaving || !isReadyToSave" @click="saveProcess">
            {{ isEditing ? 'Guardar cambios' : 'Crear proceso' }}
          </AppButton>
        </div>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onBeforeUnmount, PropType, reactive, ref, watch } from 'vue';
import draggable from 'vuedraggable';
import { useVuelidate } from '@vuelidate/core';
import { debounce } from 'ts-debounce';
import { useI18n } from 'vue-i18n';

import { required } from '../../../shared/plugins/vuelidate.plugin';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonNewContainer from '../../../shared/components/Buttons/AppButtonContainerNew.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppDrawerHeader from '../../../shared/components/AppDrawerHeader.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppStatCard from '../../../shared/components/Card/AppStatCard.vue';
import AppReorderableItem from '../../../shared/components/Card/AppReorderableItem.vue';
import AppSelectableCard from '../../../shared/components/Card/AppSelectableCard.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppAttachmentDropzone from '../../../shared/components/Forms/AppAttachmentDropzone.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppInput from '../../../shared/components/Forms/AppInput.vue';
import AppWizardStepper from '../../../shared/components/Stepper/AppWizardStepper.vue';

import type {
  AdmissionElementOption,
  AdmissionProcessAppliesTo,
  AdmissionProcessAppliesToOption,
  AdmissionProcessStatus,
  AdmissionProcessStepType,
  AdmissionProcessStepTypeOption,
  AdmissionSelectOption,
  AdmissionWorkflowStep,
} from '../dtos/admissionProcess.dto';
import type { CurriculumOfferingDto } from '../dtos/curriculumOffering.dto';
import type { DiscountDto } from '../dtos/discount.dto';
import type { ChecklistDto } from '../dtos/checklist.dto';
import type { ConvocationStepForConfigureStepsDto } from '../dtos/convocationStep.dto';
import type { AcademicLoadPeriod } from '../../academicPlanning/dtos/academicLoadManagement.dto';
import { admissionDiscountOptionsMock, getAdmissionStatusLabel } from '../mocks/admissionProcesses';
import { CreateOrUpdateConvocationService } from '../services/createOrUpdateConvocation.service';
import { CreateOrUpdateConvocationStepService } from '../services/createOrUpdateConvocationStep.service';
import { DeleteConvocationStepService } from '../services/deleteConvocationStep.service';
import { GetConvocationStepsService } from '../services/getConvocationSteps.service';
import { UpdateOrderConvocationStepsService } from '../services/updateOrderConvocationSteps.service';
import { UpdateConfigureStepSequenceService } from '../services/updateConfigureStepSequence.service';
import { GetAdmissionProcessStepElementsService } from '../services/getAdmissionProcessStepElements.service';
import { GetDiscountsService } from '../services/getDiscounts.service';
import { GetPaymentMethodsService } from '../services/getPaymentMethods.service';
import { SearchConceptsService } from '../services/searchConcepts.service';
import { GetCurriculumOfferingsService } from '../services/getCurriculumOfferings.service';
import { GetAcademicPeriodDetailsService } from '../services/getAcademicPeriodDetails.service';
import { GetActiveDocumentsService } from '../services/getActiveDocuments.service';
import { GetAttachmentsService } from '../services/getAttachments.service';
import { GetChecklistsService } from '../services/checklist/getChecklists.service';

const createOrUpdateConvocationService = new CreateOrUpdateConvocationService();
const createOrUpdateConvocationStepService = new CreateOrUpdateConvocationStepService();
const deleteConvocationStepService = new DeleteConvocationStepService();
const getConvocationStepsService = new GetConvocationStepsService();
const updateOrderConvocationStepsService = new UpdateOrderConvocationStepsService();
const updateConfigureStepSequenceService = new UpdateConfigureStepSequenceService();
const getAdmissionProcessStepElementsService = new GetAdmissionProcessStepElementsService();
const getDiscountsService = new GetDiscountsService();
const getPaymentMethodsService = new GetPaymentMethodsService();
const searchConceptsService = new SearchConceptsService();
const getCurriculumOfferingsService = new GetCurriculumOfferingsService();
const getAcademicPeriodDetailsService = new GetAcademicPeriodDetailsService();
const getActiveDocumentsService = new GetActiveDocumentsService();
const getAttachmentsService = new GetAttachmentsService();
const getChecklistsService = new GetChecklistsService();

interface AdmissionProcessFormModel {
  title: string;
  academicPeriodId: string;
  status: any;
  programs: CurriculumOfferingDto[];
  startDate: string;
  endDate: string;
  requiredOrder: boolean;
  steps: AdmissionWorkflowStep[];
  thumbnail: string;
}

interface StepDraftModel {
  referenceStepId: number | null;
  title: string;
  type: AdmissionProcessStepType;
  elementId: string;
  elementName: string;
  appliesTo: AdmissionProcessAppliesTo[];
  requiresApproval: boolean;
  solveAdmin: boolean;
  videoUrl: string;
  paymentMethodIds: string[];
  allowQuotes: boolean;
  maxQuotes: number | null;
  minInitialQuoteValue: number | null;
  paymentItems: StepDraftPaymentItem[];
  discountIds: number[];
  documentIds: number[];
  requirementIds: number[];
  isProfile: boolean;
  checklistId: number | null;
  convocationChecklists: {
    curriculumOfferingId: number;
    checklistId: number | null;
  }[];
  description: string;
}

interface ChargeProductOption {
  id: string | number;
  code?: string;
  title?: string;
  name?: string;
  defaultUnitValue?: number;
}

interface StepDraftPaymentItem {
  id: string;
  product: ChargeProductOption | null;
  isOptional: boolean;
}

const stepTypeDescriptions: Partial<Record<string, string>> = {
  formulario: 'Solicita información estructurada al aspirante.',
  cobro: 'Registra conceptos económicos del proceso.',
  documento: 'Genera o vincula documentos del flujo.',
  adjunto: 'Permite cargar soportes o enlaces requeridos.',
};

const appliesToDescriptions: Record<any, string> = {
  nuevos: 'Aplica solo para nuevos aspirantes.',
};

const buildStepDraft = (): StepDraftModel => ({
  referenceStepId: null,
  title: '',
  type: 'formulario',
  elementId: '',
  elementName: '',
  appliesTo: ['nuevos'],
  requiresApproval: true,
  solveAdmin: false,
  videoUrl: '',
  paymentMethodIds: [],
  allowQuotes: false,
  maxQuotes: null,
  minInitialQuoteValue: null,
  paymentItems: [],
  discountIds: [],
  documentIds: [],
  requirementIds: [],
  isProfile: false,
  checklistId: null,
  convocationChecklists: [],
  description: '',
});

interface WorkflowReferenceStepCard {
  id: number;
  title: string;
  stepType: AdmissionProcessStepType;
  stepTypeName: string;
  description: string;
  videoUrl: string;
  appliesTo: AdmissionProcessAppliesTo[];
  requiresApproval: boolean;
  solveAdmin: boolean;
  icon: string;
  tone: AdmissionProcessStepTypeOption['tone'];
}

const normalizeWorkflowStepType = (value?: string | null): AdmissionProcessStepType | null => {
  const normalizedValue = value?.trim().toLowerCase();
  return normalizedValue || null;
};

const resolveAppliesToFromStep = (step: ConvocationStepForConfigureStepsDto): AdmissionProcessAppliesTo[] => {
  const applyOnlyNew = !!step.applyOnlyNew;
  const applyOnlyOlds = !!step.applyOnlyOlds;

  if (applyOnlyNew && !applyOnlyOlds) return ['nuevos'];

  return ['nuevos'];
};

const buildPaymentItemId = () => `payment-item-${Math.random().toString(36).slice(2, 8)}-${Date.now()}`;

export default defineComponent({
  name: 'AdmissionProcessDrawer',
  components: {
    draggable,
    AppButton,
    AppButtonNewContainer,
    AppButtonDelete,
    AppButtonEdit,
    AppDrawer,
    AppDrawerHeader,
    AppIcon,
    AppStatCard,
    AppReorderableItem,
    AppSelectableCard,
    AppAutocomplete,
    AppAttachmentDropzone,
    AppFormField,
    AppInput,
    AppWizardStepper,
  },
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
    process: {
      type: Object as PropType<any | null>,
      default: null,
    },
    academicPeriods: {
      type: Array as PropType<AcademicLoadPeriod[]>,
      default: () => [],
    },
    statusOptions: {
      type: Array as PropType<AdmissionSelectOption<AdmissionProcessStatus>[]>,
      default: () => [],
    },
    appliesToOptions: {
      type: Array as PropType<AdmissionProcessAppliesToOption[]>,
      default: () => [],
    },
    elementsByType: {
      type: Object as PropType<Record<AdmissionProcessStepType, AdmissionSelectOption<string>[]>>,
      default: () => ({
        formulario: [],
        cobro: [],
        documento: [],
        adjunto: [],
      }),
    },
    workflowReferenceSteps: {
      type: Array as PropType<ConvocationStepForConfigureStepsDto[]>,
      default: () => [],
    },
  },
  emits: ['update:isVisible', 'saved'],
  setup(props, { emit }) {
    console.log('props data stat', props.statusOptions);

    const { t } = useI18n();
    const wizardSteps = [
      { number: 1, title: 'Información', icon: 'info-circle' },
      { number: 2, title: 'Programas', icon: 'graduation-cap' },
      { number: 3, title: 'Workflow', icon: 'sitemap', iconSource: 'bank' },
      { number: 4, title: 'Revisión', icon: 'check-circle' },
    ];
    const paymentMethodOptions = ref<AdmissionSelectOption<string>[]>([]);

    const buildStepTypeOptions = (stepTypes: Array<{ id: number; name: string }>): AdmissionProcessStepTypeOption[] => {
      const visualMap: Record<string, Pick<AdmissionProcessStepTypeOption, 'icon' | 'tone'>> = {
        formulario: { icon: 'file-alt', tone: 'blue' },
        cobro: { icon: 'dollar-sign', tone: 'green' },
        documento: { icon: 'file-alt', tone: 'indigo' },
        adjunto: { icon: 'paperclip', tone: 'purple' },
      };
      return stepTypes.map((stepType) => {
        const normalizedId = stepType.name.trim().toLowerCase();
        const visual = visualMap[normalizedId] ?? {
          icon: 'file-alt',
          tone: 'gray' as AdmissionProcessStepTypeOption['tone'],
        };
        return {
          id: normalizedId,
          name: stepType.name,
          sourceId: stepType.id,
          ...visual,
        };
      });
    };

    const stepTypeOptions = ref<AdmissionProcessStepTypeOption[]>([]);

    const currentStep = ref(1);
    const convocationId = ref<number | null>(null);
    const convocationDescription = ref('');
    const imageFile = ref<File | null>(null);
    const workflowLoading = ref(false);
    const reviewImagePreviewUrl = ref('');
    const showStepForm = ref(false);
    const stepFormRef = ref<HTMLElement | null>(null);
    const editingStepId = ref<string | null>(null);
    const isSaving = ref(false);
    const elementOptions = ref<AdmissionElementOption[]>([]);
    const elementOptionsLoading = ref(false);
    const chargeProductOptions = ref<ChargeProductOption[]>([]);
    const discounts = ref<DiscountDto[]>([]);
    const discountsLoading = ref(false);
    const documents = ref<{ id: number; title: string }[]>([]);
    const attachments = ref<{ id?: number; title: string }[]>([]);
    const examOfferings = ref<CurriculumOfferingDto[]>([]);
    const examOfferingsLoading = ref(false);
    const checklists = ref<ChecklistDto[]>([]);
    const checklistsLoading = ref(false);

    const form = reactive<AdmissionProcessFormModel>({
      title: '',
      academicPeriodId: '',
      status: '',
      programs: [],
      startDate: '',
      endDate: '',
      requiredOrder: false,
      steps: [],
      thumbnail: '',
    });
    const stepDraft = reactive<StepDraftModel>(buildStepDraft());

    const rules = computed(() => ({
      form: {
        title: { required },
        academicPeriodId: { required },
        status: { required },
        startDate: { required },
        endDate: { required },
      },
    }));

    const v$ = useVuelidate(rules, { form });

    const periodDetailsStats = ref<{
      totalPrograms: number;
      totalCapacity: number;
    } | null>(null);
    const loadingPrograms = ref(false);

    const isEditing = computed(() => !!convocationId.value);
    const academicPeriodOptions = computed(() =>
      props.academicPeriods.map((period) => ({
        id: String(period.id),
        name: period.name,
      }))
    );
    const drawerStatusOptions = computed(() => props.statusOptions);
    const drawerStepTypeOptions = stepTypeOptions;
    const drawerAppliesToOptions = computed(() => props.appliesToOptions);
    const workflowReferenceStepCards = computed<WorkflowReferenceStepCard[]>(() =>
      props.workflowReferenceSteps
        .map((step) => {
          const normalizedType = normalizeWorkflowStepType(step.ConvocationStepType?.name);
          if (!normalizedType) return null;

          const stepTypeConfig =
            stepTypeOptions.value.find((option) => option.id === normalizedType) ??
            ({
              icon: 'file-alt',
              tone: 'blue',
            } as Pick<AdmissionProcessStepTypeOption, 'icon' | 'tone'>);

          return {
            id: step.id,
            title: step.title,
            stepType: normalizedType,
            stepTypeName: step.ConvocationStepType?.name ?? 'Paso',
            description: step.description ?? '',
            videoUrl: step.urlVideoConvocationStep ?? '',
            appliesTo: resolveAppliesToFromStep(step),
            requiresApproval: !!step.requiresApproval,
            solveAdmin: !!step.solveAdmin,
            icon: stepTypeConfig.icon,
            tone: stepTypeConfig.tone,
          };
        })
        .filter((step): step is WorkflowReferenceStepCard => !!step)
    );
    const orderedSteps = computed(() => [...form.steps].sort((left, right) => left.order - right.order));
    const currentAcademicPeriod = computed(() => props.academicPeriods.find((period) => String(period.id) === String(form.academicPeriodId)) ?? null);
    const currentPeriodName = computed(() => currentAcademicPeriod.value?.name ?? 'Sin periodo');
    const currentStatusLabel = computed(() => getAdmissionStatusLabel(form.status));
    const currentStepTitle = computed(() => wizardSteps.find((step) => step.number === currentStep.value)?.title ?? '');
    const currentPaymentMethodsLabel = (ids: string[]) => (ids.length ? ids.map((id) => paymentMethodOptions.value.find((o) => o.id === id)?.name ?? id).join(', ') : 'Sin método');

    const stepsRequiringApproval = computed(() => form.steps.filter((step) => step.requiresApproval).length);
    const adminManagedSteps = computed(() => form.steps.filter((step) => step.solveAdmin).length);
    const programStatsCards = computed(() => [
      {
        label: 'Total programas',
        value: periodDetailsStats.value?.totalPrograms ?? form.programs.length,
        icon: 'graduation-cap',
        variant: 'blue' as const,
      },
      {
        label: 'Cupos totales',
        value: periodDetailsStats.value?.totalCapacity ?? 0,
        icon: 'users',
        variant: 'yellow' as const,
      },
    ]);
    const reviewStatsCards = computed(() => [
      ...programStatsCards.value,
      {
        label: 'Pasos configurados',
        value: form.steps.length,
        caption: 'Pasos listos dentro del workflow.',
        icon: 'sitemap',
        variant: 'gray' as const,
      },
    ]);
    const formatDateLabel = (value: string) => {
      if (!value) return 'Sin fecha';

      const date = new Date(`${value}T00:00:00`);

      if (Number.isNaN(date.getTime())) return value;

      return new Intl.DateTimeFormat('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(date);
    };
    const reviewDateRangeLabel = computed(() => `${formatDateLabel(form.startDate)} - ${formatDateLabel(form.endDate)}`);
    const fallbackCurrentStepElementOptions = computed(() => props.elementsByType[stepDraft.type] ?? []);
    const currentStepElementOptions = computed(() => {
      const selectedOption =
        stepDraft.elementId && stepDraft.elementName
          ? [
              {
                id: stepDraft.elementId,
                name: stepDraft.elementName,
              },
            ]
          : [];

      const baseOptions = elementOptions.value.length ? elementOptions.value : fallbackCurrentStepElementOptions.value;

      return [...selectedOption, ...baseOptions].filter((option, index, source) => {
        const optionKey = option.name?.trim().toLowerCase() || option.id;
        return source.findIndex((currentOption) => (currentOption.name?.trim().toLowerCase() || currentOption.id) === optionKey) === index;
      });
    });
    const stepElementHelperText = computed(() => {
      if (elementOptionsLoading.value) {
        return 'Cargando elementos disponibles...';
      }

      if (stepDraft.type === 'cobro' && !currentStepElementOptions.value.length) {
        return 'Escribe al menos 2 caracteres para buscar conceptos o productos.';
      }

      if (!currentStepElementOptions.value.length) {
        return 'No hay elementos configurados para este tipo en la convocatoria de referencia.';
      }

      return '';
    });
    const chargeProductSearchOptions = computed(() => {
      const selectedProducts = stepDraft.paymentItems.map((item) => item.product).filter((product): product is ChargeProductOption => !!product);

      return [...selectedProducts, ...chargeProductOptions.value].filter((option, index, source) => source.findIndex((currentOption) => String(currentOption.id) === String(option.id)) === index);
    });
    const paymentItemsTotal = computed(() => stepDraft.paymentItems.reduce((total, item) => total + Number(item.product?.defaultUnitValue ?? 0), 0));
    const selectedAppliesToConfigs = (appliesTo: AdmissionProcessAppliesTo[]) => drawerAppliesToOptions.value.filter((option) => appliesTo.includes(option.id));
    const getAppliesToSummary = (appliesTo: AdmissionProcessAppliesTo[]) =>
      selectedAppliesToConfigs(appliesTo)
        .map((option) => option.name)
        .join(', ') || 'Sin audiencia';
    const canGoNext = computed(() => {
      if (currentStep.value === 1) {
        return !!form.title.trim() && !!form.academicPeriodId && !!form.startDate && !!form.endDate;
      }

      if (currentStep.value === 3) {
        return form.steps.length > 0;
      }

      return true;
    });

    const isReadyToSave = computed(() => !!form.title.trim() && !!form.academicPeriodId && !!form.startDate && !!form.endDate && form.steps.length > 0);

    const reduceOption = (option: AdmissionSelectOption<string>) => option.id;

    const mapConvocationStepToWorkflowStep = (step: ConvocationStepForConfigureStepsDto, index: number): AdmissionWorkflowStep => {
      const normalizedType = normalizeWorkflowStepType(step.ConvocationStepType?.name) ?? 'formulario';
      const details = step.details ?? [];

      // Build element options from details (all types except cobro/matriculas)
      const preloadedElementOptions: AdmissionElementOption[] = details.filter((d) => d.id != null && d.title).map((d) => ({ id: String(d.id), name: d.title }));

      // Resolve elementoId / elementoNombre from details or surveyId
      let elementoId = '';
      let elementoNombre = '';

      if (normalizedType === 'formulario') {
        elementoId = step.surveyId ? String(step.surveyId) : preloadedElementOptions[0]?.id ?? '';
        elementoNombre = preloadedElementOptions[0]?.name ?? step.title;
      } else if (normalizedType !== 'cobro' && normalizedType !== 'matriculas de asignaturas') {
        elementoId = preloadedElementOptions[0]?.id ?? '';
        elementoNombre = preloadedElementOptions[0]?.name ?? '';
      }

      // Build paymentItems from details for cobro type
      const paymentItems: AdmissionWorkflowStep['paymentItems'] =
        normalizedType === 'cobro'
          ? details
              .filter((d) => d.title)
              .map((d) => ({
                id: `payment-item-${d.id}`,
                conceptId: String(d.productId ?? d.id),
                code: d.code ?? undefined,
                title: d.title,
                defaultUnitValue: d.defaultUnitValue ?? 0,
                isOptional: !!d.isOptional,
              }))
          : [];

      return {
        id: `workflow-step-${step.id}`,
        convocationStepId: step.id,
        referenceStepId: null,
        preloadedElementOptions,
        order: step.order ?? index + 1,
        title: step.title,
        type: normalizedType,
        elementId: elementoId,
        elementName: elementoNombre,
        appliesTo: resolveAppliesToFromStep(step),
        requiresApproval: !!step.requiresApproval,
        solveAdmin: !!step.solveAdmin,
        videoUrl: step.urlVideoConvocationStep ?? '',
        paymentMethodIds: step.paymentMethodIds?.length ? step.paymentMethodIds.map(String) : step.paymentMethodId ? [String(step.paymentMethodId)] : [],
        allowQuotes: !!step.allowQuotes,
        maxQuotes: step.maxQuotes ?? null,
        minInitialQuoteValue: step.minInitialQuoteValue ?? null,
        paymentItems,
        discountIds: step.discountIds ?? [],
        documentIds: normalizedType === 'documento' ? details.map((d) => d.id) : [],
        requirementIds: normalizedType === 'adjunto' ? details.map((d) => d.id) : [],
        electronicSignature: false,
        isProfile: !!step.isProfile,
        checklistId: step.checklistId ?? null,
        convocationChecklists:
          normalizedType === 'examen de evaluación'
            ? details
                .filter((d) => d.curriculumOfferingId != null)
                .map((d) => ({
                  curriculumOfferingId: d.curriculumOfferingId!,
                  checklistId: d.checklistId ?? null,
                }))
            : [],
        description: step.description ?? '',
        required: true,
      };
    };

    const loadProgramsAndStats = async () => {
      const periodId = Number(form.academicPeriodId);
      if (!periodId) return;

      loadingPrograms.value = true;
      try {
        const [offerings, details] = await Promise.all([getCurriculumOfferingsService.run(periodId), getAcademicPeriodDetailsService.run(periodId)]);
        form.programs = offerings;

        periodDetailsStats.value = details?.data?.stats;
      } catch (e) {
        console.log(e);
      } finally {
        loadingPrograms.value = false;
      }
    };

    const loadWorkflowSteps = async () => {
      if (!convocationId.value) return;
      workflowLoading.value = true;
      try {
        const response = await getConvocationStepsService.run(convocationId.value);
        console.log('responsee', response);

        form.steps = response.convocation.steps.map((step, index) => mapConvocationStepToWorkflowStep(step, index));
        if (Array.isArray(response.stepTypes) && response.stepTypes.length) {
          stepTypeOptions.value = buildStepTypeOptions(response.stepTypes);
        }
      } catch (e) {
        console.log(e);
      } finally {
        workflowLoading.value = false;
      }
    };

    const revokeReviewImagePreview = () => {
      if (reviewImagePreviewUrl.value.startsWith('blob:')) {
        URL.revokeObjectURL(reviewImagePreviewUrl.value);
      }

      reviewImagePreviewUrl.value = '';
    };

    const resetStepDraft = () => {
      Object.assign(stepDraft, buildStepDraft(), {
        type: stepTypeOptions.value[0]?.id ?? 'formulario',
      });
      elementOptions.value = [];
      chargeProductOptions.value = [];
    };

    const loadStepElementOptions = async (stepType: AdmissionProcessStepType, search = '') => {
      elementOptionsLoading.value = true;

      try {
        const serviceOptions = await getAdmissionProcessStepElementsService.run(stepType, search);
        elementOptions.value = serviceOptions;
      } catch (error) {
        elementOptions.value = [];
        console.log(error);
      } finally {
        elementOptionsLoading.value = false;
      }
    };

    const loadDiscountOptions = async () => {
      if (discountsLoading.value) return;

      discountsLoading.value = true;

      try {
        const response = await getDiscountsService.run();
        discounts.value = Array.isArray(response) && response.length ? response : admissionDiscountOptionsMock.map((discount) => ({ ...discount }));
      } catch (error) {
        discounts.value = admissionDiscountOptionsMock.map((discount) => ({
          ...discount,
        }));
        console.log(error);
      } finally {
        discountsLoading.value = false;
      }
    };

    const loadPaymentMethods = async () => {
      if (paymentMethodOptions.value.length) return;

      try {
        const response = await getPaymentMethodsService.run();
        paymentMethodOptions.value = response.map((method) => ({
          id: String(method.id),
          name: method.title,
        }));
      } catch (error) {
        console.log(error);
      }
    };

    const loadConceptOptions = async () => {
      try {
        const response = await searchConceptsService.run({ perPage: 20 });
        const products = Array.isArray(response?.data) ? response.data : [];
        chargeProductOptions.value = products;
      } catch (error) {
        console.log(error);
      }
    };

    const loadCobroOptions = () => {
      void loadDiscountOptions();
      void loadPaymentMethods();
      void loadConceptOptions();
    };

    const loadDocumentOptions = async () => {
      if (documents.value.length) return;
      try {
        documents.value = await getActiveDocumentsService.run();
      } catch (e) {
        console.log(e);
      }
    };

    const loadAttachmentOptions = async () => {
      if (attachments.value.length) return;
      try {
        attachments.value = await getAttachmentsService.run();
      } catch (e) {
        console.log(e);
      }
    };

    const loadChecklistOptions = async () => {
      if (checklists.value.length) return;
      checklistsLoading.value = true;
      try {
        checklists.value = await getChecklistsService.run();
      } catch (e) {
        console.log(e);
      } finally {
        checklistsLoading.value = false;
      }
    };

    const loadExamOfferings = async () => {
      const periodId = Number(form.academicPeriodId);
      if (!periodId) return;
      examOfferingsLoading.value = true;
      try {
        examOfferings.value = await getCurriculumOfferingsService.run(periodId);
        stepDraft.convocationChecklists = examOfferings.value.map((offering) => {
          const existing = stepDraft.convocationChecklists.find((c) => c.curriculumOfferingId === offering.id);
          return (
            existing ?? {
              curriculumOfferingId: offering.id,
              checklistId: null,
            }
          );
        });
      } catch (e) {
        console.log(e);
      } finally {
        examOfferingsLoading.value = false;
      }
    };

    const loadExamOptions = () => {
      void loadChecklistOptions();
      void loadExamOfferings();
    };

    const closeStepForm = () => {
      showStepForm.value = false;
      editingStepId.value = null;
      resetStepDraft();
    };

    const normalizeStepOrder = async () => {
      form.steps = form.steps.map((step, index) => ({
        ...step,
        order: index + 1,
      }));

      if (!convocationId.value) return;

      try {
        const convocationSteps = form.steps
          .filter((step) => step.convocationStepId)
          .map((step) => ({
            id: step.convocationStepId as number,
            order: step.order,
          }));

        if (convocationSteps.length) {
          await updateOrderConvocationStepsService.run({ convocationSteps });
        }
      } catch (e) {
        console.log(e);
      }
    };

    const hydrateFromProcess = (process: any | null) => {
      const fallbackPeriod = props.academicPeriods.find((period) => Number(period.id) === process?.academicPeriodId) ?? props.academicPeriods[0] ?? null;

      if (process) {
        console.log('[AdmissionProcessDrawer] Hydrating from process:', process);
        console.log('[AdmissionProcessDrawer] Status recibido:', process.status);
        console.log('[AdmissionProcessDrawer] StatusOptions disponibles:', props.statusOptions);
        convocationId.value = process.id;
        convocationDescription.value = process.description ?? '';
        Object.assign(form, {
          title: process.title,
          academicPeriodId: String(process.academicPeriodId),
          status: process.status,
          programs: [],
          startDate: process.startDate,
          endDate: process.endDate,
          requiredOrder: !!process.requiredOrder,
          steps: [],
          thumbnail: process.thumbnail ?? '',
        });
      } else {
        convocationId.value = null;
        convocationDescription.value = '';
        Object.assign(form, {
          title: '',
          academicPeriodId: fallbackPeriod ? String(fallbackPeriod.id) : '',
          status: 'borrador',
          programs: [],
          startDate: fallbackPeriod?.startDate ?? '',
          endDate: fallbackPeriod?.endDate ?? '',
          requiredOrder: false,
          steps: [],
          thumbnail: '',
        });
      }

      imageFile.value = null;
      currentStep.value = 1;
      closeStepForm();
      v$.value.$reset();
    };

    const handleAcademicPeriodChange = (periodId: string) => {
      const period = props.academicPeriods.find((p) => String(p.id) === String(periodId));
      if (!period) return;

      form.academicPeriodId = String(period.id);
      form.programs = [];
      form.startDate = period.startDate;
      form.endDate = period.endDate;
    };

    const handleStepTypeChange = (stepType: AdmissionProcessStepType) => {
      stepDraft.referenceStepId = null;
      stepDraft.title = '';
      stepDraft.type = stepType;
      stepDraft.elementId = '';
      stepDraft.elementName = '';
      stepDraft.appliesTo = ['nuevos'];
      stepDraft.requiresApproval = true;
      stepDraft.solveAdmin = false;
      stepDraft.videoUrl = '';
      stepDraft.paymentMethodIds = [];
      stepDraft.allowQuotes = false;
      stepDraft.maxQuotes = null;
      stepDraft.minInitialQuoteValue = null;
      stepDraft.paymentItems = [];
      stepDraft.discountIds = [];
      elementOptions.value = [];
      chargeProductOptions.value = [];

      if (stepType === 'cobro') {
        addPaymentItem();
        loadCobroOptions();
      } else if (stepType === 'documento') {
        void loadDocumentOptions();
      } else if (stepType === 'adjunto') {
        void loadAttachmentOptions();
      } else if (stepType === 'examen de evaluación') {
        loadExamOptions();
      } else {
        void loadStepElementOptions(stepType);
      }
    };

    const selectWorkflowReferenceStep = (referenceStep: WorkflowReferenceStepCard) => {
      stepDraft.referenceStepId = referenceStep.id;
      stepDraft.title = referenceStep.title;
      stepDraft.type = referenceStep.stepType;
      stepDraft.elementId = '';
      stepDraft.elementName = '';
      stepDraft.appliesTo = [...referenceStep.appliesTo];
      stepDraft.requiresApproval = referenceStep.requiresApproval;
      stepDraft.solveAdmin = referenceStep.solveAdmin;
      stepDraft.videoUrl = referenceStep.videoUrl;
      stepDraft.paymentMethodIds = [];
      stepDraft.allowQuotes = false;
      stepDraft.maxQuotes = null;
      stepDraft.minInitialQuoteValue = null;
      stepDraft.paymentItems = [];
      stepDraft.discountIds = [];
      stepDraft.description = referenceStep.description;
      elementOptions.value = [];
      chargeProductOptions.value = [];

      if (referenceStep.stepType === 'cobro') {
        addPaymentItem();
        loadCobroOptions();
      } else if (referenceStep.stepType === 'documento') {
        void loadDocumentOptions();
      } else if (referenceStep.stepType === 'adjunto') {
        void loadAttachmentOptions();
      } else if (referenceStep.stepType === 'examen de evaluación') {
        loadExamOptions();
      } else {
        void loadStepElementOptions(referenceStep.stepType);
      }
    };

    const addPaymentItem = () => {
      stepDraft.paymentItems.push({
        id: buildPaymentItemId(),
        product: null,
        isOptional: false,
      });
    };

    const removePaymentItem = (index: number) => {
      stepDraft.paymentItems.splice(index, 1);
    };

    const searchChargeProducts = debounce(async (search: string) => {
      if (stepDraft.type !== 'cobro') return;

      if (search.trim().length < 2) {
        chargeProductOptions.value = stepDraft.paymentItems.map((item) => item.product).filter((product): product is ChargeProductOption => !!product);
        return;
      }

      const response = await searchConceptsService.run({
        search,
        perPage: 20,
      });

      const products = Array.isArray(response?.data) ? response.data : [];
      chargeProductOptions.value = products;
    }, 500);

    const toggleAppliesTo = (optionId: AdmissionProcessAppliesTo) => {
      const currentIndex = stepDraft.appliesTo.indexOf(optionId);

      if (currentIndex >= 0) {
        if (stepDraft.appliesTo.length === 1 && !stepDraft.solveAdmin) {
          stepDraft.appliesTo = stepDraft.appliesTo[0] === 'nuevos' ? ['nuevos'] : [];
          return;
        }

        stepDraft.appliesTo = stepDraft.appliesTo.filter((item) => item !== optionId);
        return;
      }

      stepDraft.appliesTo = [...stepDraft.appliesTo, optionId];
      stepDraft.solveAdmin = false;
    };

    const isAppliesToSelected = (optionId: AdmissionProcessAppliesTo) => stepDraft.appliesTo.includes(optionId);

    const handleSolveAdminChange = (checked: boolean) => {
      stepDraft.solveAdmin = checked;

      if (checked) {
        stepDraft.appliesTo = [];
      } else if (!stepDraft.appliesTo.length) {
        stepDraft.appliesTo = ['nuevos'];
      }
    };

    const handleStepElementChange = (elementId: string) => {
      const currentElement = currentStepElementOptions.value.find((option) => option.id === elementId);
      stepDraft.elementId = elementId;
      stepDraft.elementName = currentElement?.name ?? '';
    };

    const scrollToStepForm = () => {
      nextTick(() =>
        stepFormRef.value?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      );
    };

    const openNewStepForm = () => {
      editingStepId.value = null;
      resetStepDraft();
      showStepForm.value = true;
      scrollToStepForm();

      if (workflowReferenceStepCards.value.length) {
        selectWorkflowReferenceStep(workflowReferenceStepCards.value[0]);
      } else if (stepDraft.type !== 'cobro') {
        void loadStepElementOptions(stepDraft.type);
      }
    };

    const editStep = (step: AdmissionWorkflowStep) => {
      const matchedReferenceStep = workflowReferenceStepCards.value.find((referenceStep) => referenceStep.id === step.referenceStepId) ?? null;

      editingStepId.value = step.id;
      Object.assign(stepDraft, {
        title: step.title,
        referenceStepId: matchedReferenceStep?.id ?? null,
        type: step.type,
        elementId: step.elementId,
        elementName: step.elementName,
        appliesTo: [...step.appliesTo],
        requiresApproval: step.requiresApproval,
        solveAdmin: step.solveAdmin,
        videoUrl: step.videoUrl,
        paymentMethodIds: [...(step.paymentMethodIds ?? [])],
        allowQuotes: step.allowQuotes,
        maxQuotes: step.maxQuotes,
        minInitialQuoteValue: step.minInitialQuoteValue,
        paymentItems: (step.paymentItems ?? []).map((item) => ({
          id: item.id,
          product: {
            id: item.conceptId,
            code: item.code,
            title: item.title,
            defaultUnitValue: item.defaultUnitValue,
          },
          isOptional: item.isOptional,
        })),
        discountIds: [...(step.discountIds ?? [])],
        documentIds: [...(step.documentIds ?? [])],
        requirementIds: [...(step.requirementIds ?? [])],
        isProfile: step.isProfile ?? false,
        checklistId: step.checklistId ?? null,
        convocationChecklists: (step.convocationChecklists ?? []).map((c) => ({
          ...c,
        })),
        description: step.description,
      });
      showStepForm.value = true;
      scrollToStepForm();

      chargeProductOptions.value = (step.paymentItems ?? []).map((item) => ({
        id: item.conceptId,
        code: item.code,
        title: item.title,
        defaultUnitValue: item.defaultUnitValue,
      }));

      // Use preloaded element options from details if available, otherwise fetch from service
      if (step.type === 'cobro') {
        loadCobroOptions();
      } else if (step.type === 'documento') {
        void loadDocumentOptions();
      } else if (step.type === 'adjunto') {
        void loadAttachmentOptions();
      } else if (step.type === 'examen de evaluación') {
        loadExamOptions();
      } else if (step.preloadedElementOptions?.length) {
        elementOptions.value = step.preloadedElementOptions;
      } else if (step.type !== 'matriculas de asignaturas') {
        void loadStepElementOptions(step.type);
      }
    };

    const searchStepElements = debounce(async (search: string) => {
      if (stepDraft.type !== 'cobro') return;

      if (search.trim().length < 2) {
        elementOptions.value = [];
        return;
      }

      await loadStepElementOptions(stepDraft.type, search);
    }, 500);

    const saveStep = async () => {
      const editingStep = editingStepId.value ? form.steps.find((s) => s.id === editingStepId.value) : null;
      const stepTypeSourceId = stepTypeOptions.value.find((o) => o.id === stepDraft.type)?.sourceId;

      const payload: any = {
        convocationId: convocationId.value,
        title: stepDraft.title.trim(),
        convocationStepTypeId: stepTypeSourceId,
        order: editingStep?.order ?? form.steps.length + 1,
        requiresApproval: stepDraft.requiresApproval ? 1 : 0,
        applyOnlyNew: stepDraft.appliesTo.includes('nuevos') ? 1 : 0,
        solveAdmin: stepDraft.solveAdmin ? 1 : 0,
        description: stepDraft.description,
        urlVideoConvocationStep: stepDraft.videoUrl.trim(),
      };

      if (stepDraft.type === 'formulario') {
        payload.surveyId = stepDraft.elementId ? Number(stepDraft.elementId) : null;
      }

      if (stepDraft.type === 'documento') {
        payload.documentIds = stepDraft.documentIds;
      }

      if (stepDraft.type === 'adjunto') {
        payload.requirementIds = stepDraft.requirementIds;
      }

      if (stepDraft.type === 'examen de evaluación') {
        payload.checklistId = stepDraft.checklistId;
        payload.isProfile = stepDraft.isProfile ? 1 : 0;
        payload.convocationChecklists = stepDraft.convocationChecklists
          .filter((item) => item.checklistId !== null)
          .map((item) => ({
            curriculumOfferingId: item.curriculumOfferingId,
            checklistId: item.checklistId,
          }));
      }

      if (stepDraft.type === 'cobro') {
        payload.paymentMethodIds = stepDraft.paymentMethodIds.map(Number);
        payload.convocationProducts = stepDraft.paymentItems
          .filter((item) => item.product?.id)
          .map((item) => {
            const numericId = Number(item.id.replace('payment-item-', ''));
            return {
              id: !isNaN(numericId) && Number.isInteger(numericId) ? numericId : null,
              productId: Number(item.product!.id),
              isOptional: item.isOptional ? 1 : 0,
            };
          });
        payload.allowQuotes = stepDraft.allowQuotes;
        payload.maxQuotes = stepDraft.allowQuotes ? stepDraft.maxQuotes : null;
        payload.minInitialQuoteValue = stepDraft.allowQuotes ? stepDraft.minInitialQuoteValue : null;
        payload.discountsIds = stepDraft.discountIds;
      }

      isSaving.value = true;
      try {
        const response = await createOrUpdateConvocationStepService.run(payload, editingStep?.convocationStepId ?? undefined);
        const savedStepId: number = response?.id ?? editingStep?.convocationStepId;

        if (savedStepId) {
          await updateConfigureStepSequenceService.run({
            convocationStepId: savedStepId,
            requiresApproval: stepDraft.requiresApproval,
            applyOnlyOlds: true,
            applyOnlyNew: stepDraft.appliesTo.includes('nuevos'),
            solveAdmin: stepDraft.solveAdmin,
          });
        }

        await loadWorkflowSteps();
        closeStepForm();
      } catch (e) {
        console.log(e);
      } finally {
        isSaving.value = false;
      }
    };

    const removeStep = async (stepId: string) => {
      const step = form.steps.find((s) => s.id === stepId);
      if (step?.convocationStepId) {
        try {
          await deleteConvocationStepService.run(step.convocationStepId);
        } catch (e) {
          console.log(e);
          return;
        }
      }
      form.steps = form.steps.filter((s) => s.id !== stepId);
      normalizeStepOrder();
      if (editingStepId.value === stepId) closeStepForm();
    };

    const getStepTypeConfig = (stepType: AdmissionProcessStepType) =>
      stepTypeOptions.value.find((option) => option.id === stepType) ?? {
        id: 'formulario' as AdmissionProcessStepType,
        name: 'Formulario',
        icon: 'file-alt',
        tone: 'blue' as const,
      };

    const getAppliesToConfig = (appliesTo: AdmissionProcessAppliesTo) =>
      props.appliesToOptions.find((option) => option.id === appliesTo) ?? {
        id: 'nuevos' as AdmissionProcessAppliesTo,
        name: 'Nuevos',
        icon: 'user-plus',
        tone: 'green' as const,
      };

    const getStepTypeDescription = (stepType: AdmissionProcessStepType) => stepTypeDescriptions[stepType] ?? '';
    const getAppliesToDescription = (appliesTo: AdmissionProcessAppliesTo) => appliesToDescriptions[appliesTo];
    const getOfferingName = (offeringId: number) => examOfferings.value.find((o) => o.id === offeringId)?.programName ?? String(offeringId);

    const goPrevious = () => {
      if (currentStep.value > 1) {
        currentStep.value -= 1;
      }
    };

    const goNext = async () => {
      if (currentStep.value === 1) {
        const isValid = await v$.value.$validate();
        if (!isValid) return;

        isSaving.value = true;
        try {
          const payload: any = {
            title: form.title.trim(),
            description: convocationDescription.value,
            academicPeriodId: Number(form.academicPeriodId),
            startDate: form.startDate,
            endDate: form.endDate,
            requiredOrder: form.requiredOrder ? 1 : 0,
            status: form.status,
            active: 1,
          };
          if (imageFile.value) payload.thumbnail = imageFile.value;

          const response = await createOrUpdateConvocationService.run(payload, convocationId.value ?? undefined);
          if (!convocationId.value && response?.id) {
            convocationId.value = response.id;
          }
        } catch (e) {
          console.log(e);
          isSaving.value = false;
          return;
        } finally {
          isSaving.value = false;
        }
      }

      if (!canGoNext.value) return;
      if (currentStep.value < wizardSteps.length) {
        currentStep.value += 1;
      }

      if (currentStep.value === 2) {
        void loadProgramsAndStats();
      }

      if (currentStep.value === 3) {
        void loadWorkflowSteps();
      }
    };

    const saveProcess = async () => {
      if (!isReadyToSave.value) return;
      emit('saved');
      emit('update:isVisible', false);
    };

    const closeDrawer = () => {
      if (convocationId.value) emit('saved');
      emit('update:isVisible', false);
    };

    const handleVisibilityChange = (visible: boolean) => {
      if (!visible && convocationId.value) emit('saved');
      emit('update:isVisible', visible);
    };

    const handleImageDelete = () => {
      imageFile.value = null;
      form.thumbnail = '';
    };

    watch(
      imageFile,
      (file) => {
        revokeReviewImagePreview();

        if (file) {
          reviewImagePreviewUrl.value = URL.createObjectURL(file);
        }
      },
      { immediate: true }
    );

    onBeforeUnmount(() => {
      revokeReviewImagePreview();
    });

    watch(
      () => [props.isVisible, props.process, props.academicPeriods.length] as const,
      ([visible]) => {
        if (visible) {
          hydrateFromProcess(props.process);
        }
      },
      { immediate: true, deep: true }
    );

    watch(
      stepTypeOptions,
      (newStepTypeOptions) => {
        if (!newStepTypeOptions.length) return;

        const hasCurrentType = newStepTypeOptions.some((option) => option.id === stepDraft.type);
        if (!hasCurrentType) {
          handleStepTypeChange(newStepTypeOptions[0].id);
        }
      },
      { deep: true }
    );

    watch(currentStepElementOptions, (elementOptions) => {
      if (!stepDraft.elementId) return;

      const hasCurrentElement = elementOptions.some((option) => option.id === stepDraft.elementId);
      if (!hasCurrentElement) {
        stepDraft.elementId = '';
        stepDraft.elementName = '';
      }
    });

    return {
      wizardSteps,
      currentStep,
      form,
      v$,
      imageFile,
      isEditing,
      isSaving,
      workflowLoading,
      showStepForm,
      stepFormRef,
      editingStepId,
      stepDraft,
      academicPeriodOptions,
      drawerStatusOptions,
      drawerStepTypeOptions,
      drawerAppliesToOptions,
      currentStepTitle,
      currentPeriodName,
      currentStatusLabel,
      programStatsCards,
      reviewStatsCards,
      reviewDateRangeLabel,
      stepsRequiringApproval,
      adminManagedSteps,
      workflowReferenceStepCards,
      elementOptionsLoading,
      currentStepElementOptions,
      stepElementHelperText,
      chargeProductSearchOptions,
      paymentItemsTotal,
      paymentMethodOptions,
      discounts,
      discountsLoading,
      documents,
      attachments,
      examOfferings,
      examOfferingsLoading,
      checklists,
      checklistsLoading,
      selectedAppliesToConfigs,
      getAppliesToSummary,
      currentPaymentMethodsLabel,
      canGoNext,
      isReadyToSave,
      orderedSteps,
      reduceOption,
      handleVisibilityChange,
      handleAcademicPeriodChange,
      handleImageDelete,
      handleStepTypeChange,
      selectWorkflowReferenceStep,
      handleStepElementChange,
      isAppliesToSelected,
      toggleAppliesTo,
      handleSolveAdminChange,
      addPaymentItem,
      removePaymentItem,
      searchStepElements,
      searchChargeProducts,
      openNewStepForm,
      closeStepForm,
      editStep,
      saveStep,
      removeStep,
      normalizeStepOrder,
      getStepTypeConfig,
      getStepTypeDescription,
      getAppliesToConfig,
      getAppliesToDescription,
      getOfferingName,
      t,
      goPrevious,
      goNext,
      saveProcess,
      closeDrawer,
    };
  },
});
</script>

<style scoped>
.admissionProcessDrawer {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.admissionProcessDrawer__metaPill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 600;
}

.admissionProcessDrawer__metaPill--soft {
  background: rgba(255, 255, 255, 0.1);
}

.admissionProcessDrawer__section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.admissionProcessDrawer__sectionHeader {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.admissionProcessDrawer__sectionHeader--small {
  margin-top: 0.25rem;
}

.admissionProcessDrawer__sectionBadge {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: #dbeafe;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.admissionProcessDrawer__sectionTitle {
  margin: 0 0 0.2rem;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.admissionProcessDrawer__sectionSubtitle {
  margin: 0;
  color: #64748b;
  font-size: 0.92rem;
}

.admissionProcessDrawer__contentBlock {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.admissionProcessDrawer__contentBlock--compact {
  gap: 0.75rem;
}

.admissionProcessDrawer__tableShell {
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
}

.admissionProcessDrawer__editorSurface {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 1.25rem;
  border-top: 1px solid #e2e8f0;
}

.admissionProcessDrawer__grid {
  display: grid;
  gap: 1rem;
}

.admissionProcessDrawer__grid--two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.admissionProcessDrawer__grid--three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.admissionProcessDrawer__infoBox {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 0.95rem 1rem;
  border-radius: 14px;
  background: linear-gradient(135deg, #eff6ff, #eef2ff);
  border: 1px solid #c7d2fe;
}

.admissionProcessDrawer__infoIcon {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: #ffffff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.admissionProcessDrawer__statsGrid {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.admissionProcessDrawer__table {
  width: 100%;
  border-collapse: collapse;
}

.admissionProcessDrawer__table th,
.admissionProcessDrawer__table td {
  padding: 0.95rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
}

.admissionProcessDrawer__table th {
  background: #f8fafc;
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
}

.admissionProcessDrawer__available {
  color: #059669;
  font-weight: 700;
}

.admissionProcessDrawer__workflowHero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border-radius: 18px;
  border: 1px solid #ddd6fe;
  background: linear-gradient(135deg, #f5f3ff, #eef2ff);
}

.admissionProcessDrawer__inlineHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.admissionProcessDrawer__composer {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.admissionProcessDrawer__choiceSection {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.admissionProcessDrawer__choiceLabel {
  font-size: 0.92rem;
  font-weight: 600;
  color: #0f172a;
}

.admissionProcessDrawer__choiceGrid {
  display: grid;
  gap: 0.85rem;
}

.admissionProcessDrawer__choiceGrid--stepTypes {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.admissionProcessDrawer__choiceGrid--appliesTo {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.admissionProcessDrawer__choiceCard {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 0.95rem 1rem;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  text-align: left;
  position: relative;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.admissionProcessDrawer__choiceCard:hover {
  border-color: #93c5fd;
  transform: translateY(-1px);
}

.admissionProcessDrawer__choiceCard--compact {
  align-items: center;
}

.admissionProcessDrawer__choiceCard--active {
  border-color: #2563eb;
  box-shadow: 0 18px 34px -28px rgba(37, 99, 235, 0.52);
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.admissionProcessDrawer__choiceIcon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1rem;
}

.admissionProcessDrawer__choiceIcon--blue {
  background: #dbeafe;
  color: #1d4ed8;
}

.admissionProcessDrawer__choiceIcon--green {
  background: #dcfce7;
  color: #15803d;
}

.admissionProcessDrawer__choiceIcon--purple {
  background: #f3e8ff;
  color: #7e22ce;
}

.admissionProcessDrawer__choiceIcon--amber {
  background: #fef3c7;
  color: #b45309;
}

.admissionProcessDrawer__choiceIcon--indigo {
  background: #e0e7ff;
  color: #4338ca;
}

.admissionProcessDrawer__choiceIcon--gray {
  background: #e2e8f0;
  color: #475569;
}

.admissionProcessDrawer__choiceContent {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.admissionProcessDrawer__choiceTitle {
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 700;
}

.admissionProcessDrawer__choiceSubtitle {
  color: #64748b;
  font-size: 0.8rem;
  line-height: 1.35;
}

.admissionProcessDrawer__choiceCheck {
  position: absolute;
  top: 0.9rem;
  right: 0.9rem;
  color: #2563eb;
  font-size: 0.95rem;
}

.admissionProcessDrawer__helperText {
  display: inline-block;
  margin-top: 0.45rem;
  color: #64748b;
  font-size: 0.82rem;
}

.admissionProcessDrawer__sequenceBox,
.admissionProcessDrawer__paymentBox,
.admissionProcessDrawer__examBox {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1rem;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.admissionProcessDrawer__examList {
  display: flex;
  flex-direction: column;
}

.admissionProcessDrawer__examListHeader,
.admissionProcessDrawer__examRow {
  display: grid;
  grid-template-columns: 1fr 383px;
  align-items: center;
  gap: 1rem;
  padding: 0.6rem 0.5rem;
}

.admissionProcessDrawer__examListHeader {
  font-size: 0.78rem;
  font-weight: 700;
  color: #475569;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

.admissionProcessDrawer__examRow {
  border-bottom: 1px solid #f1f5f9;
}

.admissionProcessDrawer__examRow:last-child {
  border-bottom: none;
}

.admissionProcessDrawer__examProgramName {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admissionProcessDrawer__paymentTable {
  width: 100%;
  border-collapse: collapse;
}

.admissionProcessDrawer__paymentTable th,
.admissionProcessDrawer__paymentTable td {
  padding: 0.8rem 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
}

.admissionProcessDrawer__paymentTable th {
  font-size: 0.78rem;
  font-weight: 700;
  color: #475569;
  background: #ffffff;
}

.admissionProcessDrawer__paymentAdd {
  width: 100%;
  min-height: 52px;
}

.admissionProcessDrawer__paymentTotal {
  margin: 0;
  text-align: right;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.admissionProcessDrawer__sequenceOptions--single {
  grid-template-columns: minmax(0, 1fr);
}

.admissionProcessDrawer__selectableCard {
  height: 100%;
}

.admissionProcessDrawer__selectableCardContent {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  min-width: 0;
}

.admissionProcessDrawer__checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  font-weight: 500;
  color: #0f172a;
}

.admissionProcessDrawer__inlineActions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}

.admissionProcessDrawer__workflowList {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.admissionProcessDrawer__emptyState {
  border: 1px dashed #cbd5e1;
  border-radius: 18px;
  background: #f8fafc;
  padding: 2rem 1.25rem;
  text-align: center;
  color: #64748b;
}

.admissionProcessDrawer__emptyState svg {
  font-size: 1.5rem;
  margin-bottom: 0.65rem;
}

.admissionProcessDrawer__workflowCard--ghost {
  opacity: 0.6;
}

.admissionProcessDrawer__workflowBadges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.55rem;
}

.admissionProcessDrawer__pill {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 700;
}

.admissionProcessDrawer__pill--soft {
  background: #f8fafc;
}

.admissionProcessDrawer__pill--danger {
  background: #fee2e2;
  color: #b91c1c;
}

.admissionProcessDrawer__pill--blue {
  background: #dbeafe;
  color: #1d4ed8;
}

.admissionProcessDrawer__pill--green {
  background: #dcfce7;
  color: #15803d;
}

.admissionProcessDrawer__pill--purple {
  background: #f3e8ff;
  color: #7e22ce;
}

.admissionProcessDrawer__pill--amber {
  background: #fef3c7;
  color: #b45309;
}

.admissionProcessDrawer__pill--indigo {
  background: #e0e7ff;
  color: #4338ca;
}

.admissionProcessDrawer__pill--gray {
  background: #e2e8f0;
  color: #475569;
}

.admissionProcessDrawer__reviewHero {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(240px, 320px);
  gap: 1.25rem;
  padding: 1.15rem;
  border-radius: 20px;
  border: 1px solid #dbe3ef;
  background: linear-gradient(135deg, #f8fbff, #f8fafc);
}

.admissionProcessDrawer__reviewHeroContent {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.admissionProcessDrawer__reviewEyebrow {
  display: inline-flex;
  align-self: flex-start;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.admissionProcessDrawer__reviewHeroTitle {
  margin: 0;
  color: #0f172a;
  font-size: 1.25rem;
  font-weight: 700;
}

.admissionProcessDrawer__reviewHeroSubtitle {
  margin: 0;
  color: #64748b;
  line-height: 1.55;
}

.admissionProcessDrawer__reviewMeta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.admissionProcessDrawer__reviewMedia {
  min-height: 180px;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid #dbe3ef;
  background: #ffffff;
}

.admissionProcessDrawer__reviewMediaImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.admissionProcessDrawer__reviewStatsGrid {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.admissionProcessDrawer__reviewGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.admissionProcessDrawer__reviewPanel,
.admissionProcessDrawer__reviewSection {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
}

.admissionProcessDrawer__reviewTitle {
  margin: 0;
  font-size: 0.98rem;
  font-weight: 700;
  color: #0f172a;
}

.admissionProcessDrawer__reviewList {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.admissionProcessDrawer__reviewList li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  font-size: 0.92rem;
}

.admissionProcessDrawer__reviewList span {
  color: #64748b;
}

.admissionProcessDrawer__reviewList strong {
  color: #0f172a;
  text-align: right;
}

.admissionProcessDrawer__reviewProgramGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.85rem;
}

.admissionProcessDrawer__reviewProgramCard {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.9rem 1rem;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.admissionProcessDrawer__reviewProgramName {
  color: #0f172a;
  font-weight: 700;
}

.admissionProcessDrawer__reviewProgramMeta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 0.25rem;
}

.admissionProcessDrawer__reviewProgramMeta span {
  display: inline-flex;
  align-items: center;
  padding: 0.32rem 0.65rem;
  border-radius: 999px;
  background: #ffffff;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 600;
  border: 1px solid #e2e8f0;
}

.admissionProcessDrawer__reviewSteps {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.admissionProcessDrawer__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
}

.admissionProcessDrawer__footerActions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

@media (max-width: 992px) {
  .admissionProcessDrawer__grid--two,
  .admissionProcessDrawer__grid--three,
  .admissionProcessDrawer__choiceGrid--appliesTo,
  .admissionProcessDrawer__sequenceOptions,
  .admissionProcessDrawer__statsGrid,
  .admissionProcessDrawer__reviewStatsGrid,
  .admissionProcessDrawer__reviewGrid {
    grid-template-columns: 1fr;
  }

  .admissionProcessDrawer__reviewHero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .admissionProcessDrawer {
    padding: 1rem;
  }

  .admissionProcessDrawer__choiceGrid--stepTypes,
  .admissionProcessDrawer__choiceGrid--appliesTo {
    grid-template-columns: 1fr;
  }

  .admissionProcessDrawer__workflowHero,
  .admissionProcessDrawer__footer,
  .admissionProcessDrawer__inlineActions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
