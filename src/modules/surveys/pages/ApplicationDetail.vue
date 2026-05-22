<template>
  <AppBaseList :title="title" :routes="routes">
    <template #actions>
      <AppButton style="color: white" type="button" class="btnSecondary" @click="backToApplications">
        <AppIcon icon="arrow-left" class="me-2" />
        Volver a Postulaciones
      </AppButton>
    </template>

    <template #content>
      <AppLoading v-if="loading" />
      <div v-else-if="application" class="applicationDetailPage">
        <div class="applicationDetailPage__header">
          <div class="applicationDetailPage__headerInner">
            <div class="applicationDetailPage__profile">
              <div class="applicationDetailPage__profileMain">
                <div class="applicationDetailPage__avatar">
                  {{ getInitials(`${application.people?.names ?? ''} ${application.people?.lastnames ?? ''}`.trim() || application.people?.firstName || '—') }}
                </div>

                <div class="applicationDetailPage__profileInfo">
                  <h2>
                    {{ `${application.people?.names ?? ''} ${application.people?.lastnames ?? ''}`.trim() || '—' }}
                  </h2>
                  <div class="applicationDetailPage__profileMeta">
                    <!-- <span class="applicationDetailPage__id">ID: {{ application.id }}</span> -->
                    <span>{{ application.offering?.program?.name || '—' }}</span>
                  </div>

                  <div class="applicationDetailPage__badges">
                    <AppBadge :label="application.isPrevius ? 'Estudiante Antiguo' : 'Estudiante Nuevo'" :variant="application.isPrevius ? 'primary' : 'success'" />
                    <AppBadge :label="application.statusLabel || application.status || '—'" :variant="getStatusVariant(application.status)" />
                    <AppBadge :label="application.offering?.program?.code || '—'" variant="secondary" />
                  </div>
                </div>
              </div>
            </div>

            <div class="applicationDetailPage__progressPanel">
              <div class="applicationDetailPage__progressHead">
                <div>
                  <strong>Progreso del Proceso</strong>
                  <span>{{ application.progressInfo?.completedSteps ?? 0 }} de {{ application.progressInfo?.totalSteps ?? 0 }} pasos completados</span>
                </div>
                <b>{{ application.progressInfo?.currentProgress ?? application.progress ?? 0 }}%</b>
              </div>

              <div class="applicationDetailPage__progressTrack">
                <div
                  class="applicationDetailPage__progressFill"
                  :class="getProgressClass(application.progressInfo?.currentProgress ?? application.progress ?? 0)"
                  :style="{
                    width: `${application.progressInfo?.currentProgress ?? application.progress ?? 0}%`,
                  }"
                ></div>
              </div>

              <div class="applicationDetailPage__progressMeta">
                <span>
                  <AppIcon icon="clock" />
                  Última actividad:
                  {{ formatDate(application.updatedAt || application.createdAt) }}
                </span>
                <span>
                  <AppIcon icon="calendar-alt" />
                  Registrado: {{ formatDate(application.createdAt) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="applicationDetailPage__tabsWrap">
          <div class="applicationDetailPage__tabs">
            <button
              v-for="tab in detailTabs"
              :key="tab.id"
              type="button"
              class="applicationDetailPage__tab"
              :class="{
                'applicationDetailPage__tab--active': activeDetailTab === tab.id,
              }"
              @click="selectDetailTab(tab.id)"
            >
              <AppIcon :icon="tab.icon" />
              {{ tab.label }}
            </button>
          </div>
        </div>

        <div class="applicationDetailPage__content">
          <main class="applicationDetailPage__main">
            <section v-if="activeDetailTab === 'informacion'" class="applicationDetailPage__sectionStack">
              <div class="applicationDetailPage__card">
                <div class="applicationDetailPage__cardHead">
                  <AppIcon icon="user" />
                  <h3>Información Personal</h3>
                </div>

                <div class="applicationDetailPage__infoGrid">
                  <div class="applicationDetailPage__infoItem">
                    <span>Nombre Completo</span>
                    <strong>{{ `${application.people?.names ?? ''} ${application.people?.lastnames ?? ''}`.trim() || '—' }}</strong>
                  </div>
                  <div class="applicationDetailPage__infoItem">
                    <span>Documento de Identidad</span>
                    <strong class="applicationDetailPage__mono">{{ application.people?.identification || '—' }}</strong>
                  </div>
                  <div class="applicationDetailPage__infoItem">
                    <span>Correo Electrónico</span>
                    <strong>{{ application.people?.email || '—' }}</strong>
                  </div>
                  <div class="applicationDetailPage__infoItem">
                    <span>Teléfono</span>
                    <strong>{{ application.people?.mobile || application.people?.homePhone || application.people?.workPhone || '—' }}</strong>
                  </div>
                  <div class="applicationDetailPage__infoItem">
                    <span>Fecha de Nacimiento</span>
                    <strong>{{ formatDate(application.people?.birthDate) }}</strong>
                  </div>
                  <div class="applicationDetailPage__infoItem">
                    <span>Dirección</span>
                    <strong>{{ application.people?.direction || '—' }}</strong>
                  </div>
                </div>
              </div>
            </section>

            <section v-else-if="activeDetailTab === 'progreso'" class="applicationDetailPage__workflowList">
              <AppLoading v-if="progressLoading || !progressDetailsLoaded" />

              <div v-else-if="progressDetailsError" class="applicationDetailPage__workflowEmpty">
                <AppIcon icon="exclamation-circle" />
                <strong>No se pudo cargar el progreso</strong>
                <span>Intenta cargar nuevamente el detalle de progreso del postulante.</span>
                <AppButton type="button" outlined @click="retryLoadProgressDetails">
                  <AppIcon icon="sync" class="me-2" />
                  Reintentar
                </AppButton>
              </div>

              <div v-else-if="!progressWorkflowSteps.length" class="applicationDetailPage__workflowEmpty">
                <AppIcon icon="tasks" />
                <strong>No hay pasos configurados</strong>
                <span>Este postulante aún no tiene detalle de progreso disponible.</span>
              </div>

              <template v-else>
                <div v-for="step in progressWorkflowSteps" :key="step.id" class="applicationDetailPage__workflowCard" :class="getWorkflowStateClass(getProgressStepStatus(step))">
                  <div class="applicationDetailPage__workflowCardHeader">
                    <div class="applicationDetailPage__workflowCardHeaderMain">
                      <div class="applicationDetailPage__workflowStatusIcon" :class="getWorkflowStateClass(getProgressStepStatus(step))">
                        <AppIcon :icon="getWorkflowStatusIcon(getProgressStepStatus(step))" />
                      </div>

                      <div class="applicationDetailPage__workflowTitle">
                        <h3>{{ step.title }}</h3>
                        <div class="applicationDetailPage__workflowChips">
                          <span class="applicationDetailPage__workflowTypeChip" :class="getWorkflowTypeClass(getProgressStepType(step))">
                            <AppIcon :icon="getWorkflowTypeIcon(getProgressStepType(step))" />
                            {{ step.stepType?.name || '—' }}
                          </span>
                          <span class="applicationDetailPage__workflowStateChip" :class="getWorkflowStateClass(getProgressStepStatus(step))">
                            <AppIcon :icon="getWorkflowStatusIcon(getProgressStepStatus(step))" />
                            {{ getWorkflowStatusLabel(getProgressStepStatus(step)) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="applicationDetailPage__workflowDetail">
                    <div class="applicationDetailPage__workflowDetailIcon" :class="getWorkflowTypeClass(getProgressStepType(step))">
                      <AppIcon :icon="getWorkflowTypeIcon(getProgressStepType(step))" />
                    </div>

                    <div class="applicationDetailPage__workflowDetailBody">
                      <div v-if="getProgressStepType(step).toLowerCase().includes('adjunto')" class="applicationDetailPage__attachmentsBlock">
                        <div class="applicationDetailPage__attachmentsHead">
                          <div>
                            <h4>Documentos Adjuntos</h4>
                            <span>{{ step.details?.length || 0 }} documento(s) cargado(s)</span>
                          </div>
                        </div>

                        <div v-if="!step.details?.length" class="applicationDetailPage__attachmentEmpty">
                          <AppIcon icon="paperclip" />
                          <span>No hay documentos adjuntos cargados.</span>
                        </div>

                        <div v-else class="applicationDetailPage__attachmentList">
                          <div
                            v-for="attachment in step.details"
                            :key="attachment.id"
                            class="applicationDetailPage__attachmentItem"
                            :class="{
                              'applicationDetailPage__attachmentItem--accepted': attachment.isAccept === 1,
                              'applicationDetailPage__attachmentItem--rejected': attachment.isAccept === 0,
                              'applicationDetailPage__attachmentItem--pending': attachment.isAccept === null || attachment.isAccept === undefined,
                            }"
                          >
                            <div class="applicationDetailPage__attachmentIcon">
                              <AppIcon icon="file-alt" />
                            </div>

                            <div class="applicationDetailPage__attachmentInfo">
                              <strong>{{ attachment.requirement?.title || 'Documento adjunto' }}</strong>
                              <span>
                                <AppIcon icon="calendar-alt" />
                                {{ formatDate(attachment.updatedAt || attachment.createdAt) }}
                              </span>
                            </div>

                            <span
                              class="applicationDetailPage__attachmentStatus"
                              :class="{
                                'applicationDetailPage__attachmentStatus--accepted': attachment.isAccept === 1,
                                'applicationDetailPage__attachmentStatus--rejected': attachment.isAccept === 0,
                                'applicationDetailPage__attachmentStatus--pending': attachment.isAccept === null || attachment.isAccept === undefined,
                              }"
                            >
                              <AppIcon :icon="attachment.isAccept === 1 ? 'check-circle' : attachment.isAccept === 0 ? 'times-circle' : 'exclamation-circle'" />
                              {{ attachment.isAccept === 1 ? 'Aprobado' : attachment.isAccept === 0 ? 'Rechazado' : 'Pendiente' }}
                            </span>

                            <AppButton v-if="attachment.urlAttachment" :href="attachment.urlAttachment" target="_blank" outlined class="applicationDetailPage__attachmentAction">
                              <AppIcon icon="eye" class="me-2" />
                              Ver documento
                            </AppButton>
                          </div>
                        </div>
                      </div>

                      <div v-else-if="step.stepType?.name?.toLowerCase().includes('cobro')" class="applicationDetailPage__chargeDetailsBlock">
                        <div class="applicationDetailPage__attachmentsHead">
                          <div>
                            <h4>{{ step.title || 'Cobro' }}</h4>
                            <span>{{ step.details?.length || 0 }} factura(s) registrada(s)</span>
                          </div>
                        </div>

                        <div v-if="!step.details?.length" class="applicationDetailPage__attachmentEmpty">
                          <AppIcon icon="credit-card" />
                          <span>No hay información de cobro registrada.</span>
                        </div>

                        <div v-else class="applicationDetailPage__chargeDetailsList">
                          <div v-for="paymentDetail in step.details" :key="paymentDetail.invoice?.id || paymentDetail.id" class="applicationDetailPage__chargeDetailItem">
                            <div class="applicationDetailPage__chargeHeader">
                              <div class="applicationDetailPage__chargeIcon">
                                <AppIcon icon="credit-card" />
                              </div>

                              <div>
                                <strong>Factura {{ paymentDetail.invoice?.id || '—' }}</strong>
                                <span>{{ paymentDetail.invoice?.createDate || formatDate(paymentDetail.invoice?.createdAt) }}</span>
                              </div>

                              <span
                                class="applicationDetailPage__chargeStatus"
                                :class="{
                                  'applicationDetailPage__chargeStatus--paid': paymentDetail.invoice?.totalPaid >= paymentDetail.invoice?.totalPurchase && paymentDetail.invoice?.isCancel !== 1,
                                  'applicationDetailPage__chargeStatus--pending': paymentDetail.invoice?.totalPaid < paymentDetail.invoice?.totalPurchase && paymentDetail.invoice?.isCancel !== 1,
                                  'applicationDetailPage__chargeStatus--cancelled': paymentDetail.invoice?.isCancel === 1,
                                }"
                              >
                                <AppIcon
                                  :icon="paymentDetail.invoice?.isCancel === 1 ? 'times-circle' : paymentDetail.invoice?.totalPaid >= paymentDetail.invoice?.totalPurchase ? 'check-circle' : 'clock'"
                                />
                                {{ paymentDetail.invoice?.isCancel === 1 ? 'Anulada' : paymentDetail.invoice?.totalPaid >= paymentDetail.invoice?.totalPurchase ? 'Pagada' : 'Pendiente' }}
                              </span>
                            </div>

                            <div class="applicationDetailPage__chargeTotals">
                              <div>
                                <span>Valor total</span>
                                <strong>{{ formatCurrency(paymentDetail.invoice?.totalValue) }}</strong>
                              </div>
                              <div>
                                <span>Descuento</span>
                                <strong>{{ formatCurrency(paymentDetail.invoice?.totalDiscount) }}</strong>
                              </div>
                              <div>
                                <span>Total compra</span>
                                <strong>{{ formatCurrency(paymentDetail.invoice?.totalPurchase) }}</strong>
                              </div>
                              <div>
                                <span>Total pagado</span>
                                <strong>{{ formatCurrency(paymentDetail.invoice?.totalPaid) }}</strong>
                              </div>
                            </div>

                            <div class="applicationDetailPage__chargeSection">
                              <strong>Productos</strong>
                              <div v-if="!paymentDetail.invoice?.details?.length" class="applicationDetailPage__chargeEmptyRow">Sin productos registrados.</div>
                              <div v-else class="applicationDetailPage__chargeProductList">
                                <div v-for="invoiceDetail in paymentDetail.invoice.details" :key="invoiceDetail.id" class="applicationDetailPage__chargeProductItem">
                                  <div>
                                    <strong>{{ invoiceDetail.product?.title || invoiceDetail.description || 'Producto' }}</strong>
                                    <span>{{ invoiceDetail.product?.code || invoiceDetail.product?.slug || '—' }}</span>
                                  </div>
                                  <span>{{ invoiceDetail.quantity ?? '—' }} x {{ formatCurrency(invoiceDetail.unitValue) }}</span>
                                  <strong>{{ formatCurrency(invoiceDetail.totalValue) }}</strong>
                                </div>
                              </div>
                            </div>

                            <div class="applicationDetailPage__chargeSection">
                              <strong>Descuentos disponibles</strong>
                              <div v-if="!paymentDetail.discounts?.length" class="applicationDetailPage__chargeEmptyRow">Sin descuentos registrados.</div>
                              <div v-else class="applicationDetailPage__discountList">
                                <div v-for="discount in paymentDetail.discounts" :key="discount.id" class="applicationDetailPage__discountItem">
                                  <div>
                                    <strong>{{ discount.title || 'Descuento' }}</strong>
                                    <span>{{ discount.description || '—' }}</span>
                                  </div>
                                  <b>{{ discount.isPercent ? `${discount.value}%` : formatCurrency(discount.value) }}</b>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        v-else-if="step.stepType?.name?.toLowerCase().includes('matricula') || step.stepType?.name?.toLowerCase().includes('matrícula')"
                        class="applicationDetailPage__enrolledSubjectsBlock"
                      >
                        <div class="applicationDetailPage__attachmentsHead">
                          <div>
                            <h4>Matrícula de Asignaturas</h4>
                            <span>{{ step.details?.length || 0 }} asignatura(s) registrada(s)</span>
                          </div>
                        </div>

                        <div v-if="!step.details?.length" class="applicationDetailPage__attachmentEmpty">
                          <AppIcon icon="book" />
                          <span>No hay asignaturas registradas.</span>
                        </div>

                        <div v-else class="applicationDetailPage__enrolledSubjectsList">
                          <div v-for="subjectDetail in step.details" :key="subjectDetail.id" class="applicationDetailPage__enrolledSubjectItem">
                            <div class="applicationDetailPage__enrolledSubjectIcon">
                              <AppIcon icon="book" />
                            </div>

                            <div class="applicationDetailPage__enrolledSubjectInfo">
                              <strong>{{ subjectDetail.periodSubject?.subject?.name || 'Asignatura' }}</strong>
                              <span>
                                {{ subjectDetail.periodSubject?.subject?.code || '—' }}
                                -
                                {{ subjectDetail.periodSubject?.subject?.credits ?? '—' }}
                                crédito(s)
                              </span>
                            </div>

                            <div class="applicationDetailPage__enrolledSubjectMeta">
                              <span>Docente</span>
                              <strong>{{ `${subjectDetail.teacher?.names ?? ''} ${subjectDetail.teacher?.lastnames ?? ''}`.trim() || '—' }}</strong>
                            </div>

                            <div class="applicationDetailPage__enrolledSubjectMeta">
                              <span>Grupo</span>
                              <strong>{{ subjectDetail.offeringSection?.code || '—' }}</strong>
                            </div>

                            <span
                              class="applicationDetailPage__enrolledSubjectStatus"
                              :class="{
                                'applicationDetailPage__enrolledSubjectStatus--approved': subjectDetail.matriculateSubject?.isApproved === 1,
                                'applicationDetailPage__enrolledSubjectStatus--pending': subjectDetail.matriculateSubject?.isApproved !== 1,
                              }"
                            >
                              <AppIcon :icon="subjectDetail.matriculateSubject?.isApproved === 1 ? 'check-circle' : 'clock'" />
                              {{ subjectDetail.matriculateSubject?.isApproved === 1 ? 'Aprobada' : 'Pendiente' }}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div v-else-if="step.stepType?.name?.toLowerCase().includes('examen')" class="applicationDetailPage__examDetailsBlock">
                        <div class="applicationDetailPage__attachmentsHead">
                          <div>
                            <h4>{{ step.title || 'Examen de evaluación' }}</h4>
                            <span>{{ step.details?.length || 0 }} resultado(s) registrado(s)</span>
                          </div>
                        </div>

                        <div v-if="!step.details?.length" class="applicationDetailPage__attachmentEmpty">
                          <AppIcon icon="award" />
                          <span>No hay resultados de examen registrados.</span>
                        </div>

                        <div v-else class="applicationDetailPage__examDetailsList">
                          <div v-for="examDetail in step.details" :key="examDetail.id" class="applicationDetailPage__examDetailItem">
                            <div class="applicationDetailPage__examDetailHeader">
                              <div class="applicationDetailPage__examDetailIcon">
                                <AppIcon icon="award" />
                              </div>
                              <span class="applicationDetailPage__examDetailStatus">
                                <AppIcon icon="check-circle" />
                                {{ examDetail.estado || '—' }}
                              </span>
                            </div>

                            <div class="applicationDetailPage__examDetailGrid">
                              <div>
                                <span>Puntaje obtenido</span>
                                <strong>{{ examDetail.puntajeObtenido ?? '—' }} / {{ examDetail.puntajeTotal ?? '—' }}</strong>
                              </div>
                              <div>
                                <span>Porcentaje</span>
                                <strong>{{ examDetail.porcentajePuntaje ?? '—' }}%</strong>
                              </div>
                              <div>
                                <span>Obligatorios sin hacer</span>
                                <strong>{{ examDetail.obligatoriosSinHacer ?? '—' }}</strong>
                              </div>
                              <div>
                                <span>Duración</span>
                                <strong>{{ examDetail.checklist?.duracion || '—' }}</strong>
                              </div>
                              <div>
                                <span>Fecha de inicio</span>
                                <strong>{{ formatDate(examDetail.fechaInicio) }}</strong>
                              </div>
                              <div>
                                <span>Fecha de finalización</span>
                                <strong>{{ formatDate(examDetail.fechaFin) }}</strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <template v-else>
                        <h4>
                          {{ step.details?.[0]?.requirement?.title || step.details?.[0]?.survey?.title || getWorkflowDetailTitle(getProgressStepType(step)) }}
                        </h4>
                        <div class="applicationDetailPage__workflowDetailDate">
                          <AppIcon icon="calendar-alt" />
                          <span>{{ formatDate(step.enrolStep?.updatedAt || step.enrolStep?.createdAt) }}</span>
                        </div>

                        <div class="applicationDetailPage__workflowMessage" :class="getWorkflowStateClass(getProgressStepStatus(step))">
                          <AppIcon :icon="getWorkflowStatusIcon(getProgressStepStatus(step))" />
                          <span>{{ getProgressStepMessage(step) }}</span>
                        </div>

                        <AppButton
                          v-if="getProgressStepType(step).toLowerCase().includes('formulario') && step.enrolStep?.id"
                          type="button"
                          outlined
                          class="applicationDetailPage__workflowAction"
                          @click="openInscritoDetailsModal(step)"
                        >
                          <AppIcon icon="eye" class="me-2" />
                          Ver detalle
                        </AppButton>

                        <AppButton
                          v-if="step.stepType?.name?.toLowerCase().includes('documento') && step.details?.[0]?.urlSignedDocument"
                          :href="step.details[0].urlSignedDocument"
                          target="_blank"
                          outlined
                          class="applicationDetailPage__workflowAction"
                        >
                          <AppIcon icon="eye" class="me-2" />
                          Ver documento
                        </AppButton>
                      </template>
                    </div>
                  </div>
                </div>
              </template>
            </section>

            <section v-else-if="activeDetailTab === 'formularios'" class="applicationDetailPage__sectionStack">
              <AppLoading v-if="formStepsLoading || !formStepsLoaded" />

              <div v-else-if="formStepsError" class="applicationDetailPage__workflowEmpty">
                <AppIcon icon="exclamation-circle" />
                <strong>No se pudo cargar la información de formularios</strong>
                <span>Intenta cargar nuevamente la información del postulante.</span>
                <AppButton type="button" outlined @click="retryLoadFormSteps">
                  <AppIcon icon="sync" class="me-2" />
                  Reintentar
                </AppButton>
              </div>

              <div v-else-if="!formWorkflowSteps.length" class="applicationDetailPage__workflowEmpty">
                <AppIcon icon="file-alt" />
                <strong>No hay formularios disponibles</strong>
                <span>Este postulante aún no tiene formularios registrados.</span>
              </div>

              <template v-else>
                <div v-for="formStep in formWorkflowSteps" :key="formStep.id" class="applicationDetailPage__formStepCard">
                  <div class="applicationDetailPage__formStepMedia">
                    <img v-if="formStep.details?.[0]?.survey?.urlImgHeader" :src="formStep.details[0].survey.urlImgHeader" :alt="formStep.details?.[0]?.survey?.title || formStep.title" />
                    <div v-else>
                      <AppIcon icon="file-alt" />
                    </div>
                  </div>

                  <div class="applicationDetailPage__formStepBody">
                    <div class="applicationDetailPage__formStepHead">
                      <div>
                        <span>{{ formStep.stepType?.name || 'Formulario' }}</span>
                        <h3>
                          {{ formStep.details?.[0]?.survey?.title || formStep.title || 'Formulario' }}
                        </h3>
                      </div>

                      <span
                        class="applicationDetailPage__formStepStatus"
                        :class="{
                          'applicationDetailPage__formStepStatus--approved': formStep.enrolStep?.isApproved === 1,
                          'applicationDetailPage__formStepStatus--rejected': formStep.enrolStep?.isApproved === 0,
                          'applicationDetailPage__formStepStatus--registered': formStep.enrolStep && formStep.enrolStep?.isApproved === null,
                          'applicationDetailPage__formStepStatus--pending': !formStep.enrolStep,
                        }"
                      >
                        <AppIcon :icon="formStep.enrolStep?.isApproved === 1 ? 'check-circle' : formStep.enrolStep?.isApproved === 0 ? 'times-circle' : formStep.enrolStep ? 'file-alt' : 'clock'" />
                        {{ formStep.enrolStep?.isApproved === 1 ? 'Aprobado' : formStep.enrolStep?.isApproved === 0 ? 'Rechazado' : formStep.enrolStep ? 'Registrado' : 'Pendiente' }}
                      </span>
                    </div>

                    <p>
                      {{ formStep.details?.[0]?.survey?.description || formStep.description || '—' }}
                    </p>

                    <div class="applicationDetailPage__formStepMeta">
                      <span>
                        <AppIcon icon="calendar-alt" />
                        Creado:
                        {{ formatDate(formStep.enrolStep?.createdAt || formStep.details?.[0]?.createdAt || formStep.createdAt) }}
                      </span>
                      <span>
                        <AppIcon icon="clock" />
                        Actualizado:
                        {{ formatDate(formStep.enrolStep?.updatedAt || formStep.details?.[0]?.updatedAt || formStep.updatedAt) }}
                      </span>
                      <span>
                        <AppIcon icon="hashtag" />
                        Intento: {{ formStep.details?.[0]?.numberTry || '—' }}
                      </span>
                    </div>

                    <div class="applicationDetailPage__formStepFooter">
                      <AppButton :disabled="!formStep.enrolStep?.id" type="button" outlined class="applicationDetailPage__formStepAction" @click="openInscritoDetailsModal(formStep)">
                        <AppIcon icon="eye" class="me-2" />
                        Ver detalle
                      </AppButton>

                      <div class="applicationDetailPage__formStepApprovalActions">
                        <AppButton
                          icon="thumbs-up"
                          v-tooltip="'Aprobar Inscripción'"
                          :disabled="!formStep.requiresApproval || !formStep.enrolStep?.id"
                          @click="approveOrReject(1, formStep.enrolStep?.id, formStep.enrolStep?.rejectedObservations)"
                        />

                        <AppButton
                          icon="thumbs-down"
                          v-tooltip="'Rechazar Inscripción'"
                          :disabled="!formStep.requiresApproval || !formStep.enrolStep?.id"
                          @click="approveOrReject(0, formStep.enrolStep?.id, formStep.enrolStep?.rejectedObservations)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </section>

            <section v-else-if="activeDetailTab === 'pagos'" class="applicationDetailPage__sectionStack">
              <AppLoading v-if="paymentInvoicesLoading || !paymentInvoicesLoaded" />

              <div v-else-if="paymentInvoicesError" class="applicationDetailPage__workflowEmpty">
                <AppIcon icon="exclamation-circle" />
                <strong>No se pudo cargar la información de pagos</strong>
                <span>Intenta cargar nuevamente la información del postulante.</span>
                <AppButton type="button" outlined @click="retryLoadPaymentInvoices">
                  <AppIcon icon="sync" class="me-2" />
                  Reintentar
                </AppButton>
              </div>

              <div v-else-if="!paymentInvoices.length" class="applicationDetailPage__workflowEmpty">
                <AppIcon icon="credit-card" />
                <strong>No hay pagos disponibles</strong>
                <span>Este postulante aún no tiene facturas registradas.</span>
              </div>

              <template v-else>
                <div
                  v-for="paymentInvoice in paymentInvoices"
                  :key="paymentInvoice.id"
                  class="applicationDetailPage__paymentConceptCard"
                  :class="{
                    'applicationDetailPage__paymentConceptCard--paid': paymentInvoice.totalPaid >= paymentInvoice.totalPurchase && paymentInvoice.isCancel !== 1,
                    'applicationDetailPage__paymentConceptCard--pending': paymentInvoice.totalPaid < paymentInvoice.totalPurchase && paymentInvoice.isCancel !== 1,
                    'applicationDetailPage__paymentConceptCard--cancelled': paymentInvoice.isCancel === 1,
                  }"
                >
                  <div class="applicationDetailPage__paymentConceptHead">
                    <div class="applicationDetailPage__paymentConceptTitle">
                      <div class="applicationDetailPage__paymentConceptIcon">
                        <AppIcon icon="dollar-sign" />
                      </div>
                      <div>
                        <h3>
                          {{ paymentInvoice.details?.[0]?.product?.title || `Factura ${paymentInvoice.id}` }}
                        </h3>
                        <span>{{ paymentInvoice.details?.[0]?.product?.description || paymentInvoice.observations || '—' }}</span>
                      </div>
                    </div>

                    <span
                      class="applicationDetailPage__paymentConceptStatus"
                      :class="{
                        'applicationDetailPage__paymentConceptStatus--paid': paymentInvoice.totalPaid >= paymentInvoice.totalPurchase && paymentInvoice.isCancel !== 1,
                        'applicationDetailPage__paymentConceptStatus--pending': paymentInvoice.totalPaid < paymentInvoice.totalPurchase && paymentInvoice.isCancel !== 1,
                        'applicationDetailPage__paymentConceptStatus--cancelled': paymentInvoice.isCancel === 1,
                      }"
                    >
                      <AppIcon :icon="paymentInvoice.isCancel === 1 ? 'times-circle' : paymentInvoice.totalPaid >= paymentInvoice.totalPurchase ? 'check' : 'clock'" />
                      {{ paymentInvoice.isCancel === 1 ? 'Anulada' : paymentInvoice.totalPaid >= paymentInvoice.totalPurchase ? 'Pagado' : 'Pendiente' }}
                    </span>
                  </div>

                  <div class="applicationDetailPage__paymentConceptBody">
                    <div class="applicationDetailPage__paymentConceptMain">
                      <div class="applicationDetailPage__paymentAmountPanel">
                        <div class="applicationDetailPage__paymentSectionTitle">
                          <AppIcon icon="dollar-sign" />
                          <strong>Información del Monto</strong>
                        </div>

                        <div class="applicationDetailPage__paymentAmountGrid">
                          <div>
                            <span>Monto original</span>
                            <strong>{{ formatCurrency(paymentInvoice.totalValue) }}</strong>
                          </div>
                          <div>
                            <span>Monto a pagar</span>
                            <strong>{{ formatCurrency(paymentInvoice.totalPurchase) }}</strong>
                            <small v-if="paymentInvoice.totalDiscount">Ahorro: {{ formatCurrency(paymentInvoice.totalDiscount) }}</small>
                          </div>
                          <div>
                            <span>Total pagado</span>
                            <strong>{{ formatCurrency(paymentInvoice.totalPaid) }}</strong>
                          </div>
                        </div>
                      </div>

                      <div class="applicationDetailPage__paymentDiscountPanel">
                        <div class="applicationDetailPage__paymentSectionTitle applicationDetailPage__paymentSectionTitle--warning">
                          <AppIcon icon="tag" />
                          <strong>Descuentos Aplicados</strong>
                        </div>

                        <div v-if="!paymentInvoice.discounts?.length" class="applicationDetailPage__paymentDiscountEmpty">
                          <AppIcon icon="tag" />
                          <strong>No hay descuentos aplicados a este concepto</strong>
                          <span>Este recibo no registra descuentos en el servicio.</span>
                        </div>

                        <div v-else class="applicationDetailPage__paymentDiscountList">
                          <div v-for="discount in paymentInvoice.discounts" :key="discount.id" class="applicationDetailPage__paymentDiscountItem">
                            <div class="applicationDetailPage__paymentDiscountBadge">
                              {{ discount.isPercent ? `${discount.value}%` : formatCurrency(discount.value) }}
                            </div>
                            <div>
                              <strong>{{ discount.title || 'Descuento' }}</strong>
                              <span>{{ discount.description || '—' }}</span>
                              <small v-if="discount.requireAttachment">Requiere adjunto: {{ discount.descriptionAttachment || '—' }}</small>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="applicationDetailPage__paymentHistoryPanel">
                        <div class="applicationDetailPage__paymentSectionTitle">
                          <AppIcon icon="history" />
                          <strong>Historial de Pago</strong>
                        </div>

                        <div class="applicationDetailPage__paymentHistoryItem">
                          <div class="applicationDetailPage__paymentHistoryIcon">
                            <AppIcon :icon="paymentInvoice.totalPaid >= paymentInvoice.totalPurchase ? 'check-circle' : 'clock'" />
                          </div>
                          <div>
                            <strong>{{ paymentInvoice.totalPaid >= paymentInvoice.totalPurchase ? 'Pago registrado' : 'Pago pendiente' }}</strong>
                            <span>Monto: {{ formatCurrency(paymentInvoice.totalPaid) }}</span>
                            <small>Fecha: {{ paymentInvoice.createDate || formatDate(paymentInvoice.createdAt) }}</small>
                          </div>
                        </div>
                      </div>
                    </div>

                    <aside class="applicationDetailPage__paymentActionsPanel">
                      <h4>Acciones</h4>

                      <div
                        class="applicationDetailPage__paymentCompletedBox"
                        :class="{
                          'applicationDetailPage__paymentCompletedBox--paid': paymentInvoice.totalPaid >= paymentInvoice.totalPurchase && paymentInvoice.isCancel !== 1,
                          'applicationDetailPage__paymentCompletedBox--pending': paymentInvoice.totalPaid < paymentInvoice.totalPurchase && paymentInvoice.isCancel !== 1,
                          'applicationDetailPage__paymentCompletedBox--cancelled': paymentInvoice.isCancel === 1,
                        }"
                      >
                        <AppIcon :icon="paymentInvoice.isCancel === 1 ? 'times-circle' : paymentInvoice.totalPaid >= paymentInvoice.totalPurchase ? 'check-circle' : 'clock'" />
                        <strong>{{ paymentInvoice.isCancel === 1 ? 'Pago anulado' : paymentInvoice.totalPaid >= paymentInvoice.totalPurchase ? 'Pago Completado' : 'Pago Pendiente' }}</strong>
                      </div>

                      <div class="applicationDetailPage__paymentApprovalActions">
                        <AppButton
                          :disabled="!paymentInvoice.enrolStep?.id"
                          v-tooltip="'Ver Recibo'"
                          @click="openInscritoCobroDetailsModal(paymentInvoice.enrolStep?.id, paymentInvoice.id, paymentInvoice)"
                          icon="file-invoice-dollar"
                          variant="primary"
                          outlined
                        >
                        </AppButton>

                        <AppButton
                          :disabled="!paymentInvoice.enrolStep?.id || !paymentInvoice.urlProofOfPayment"
                          v-tooltip="'Ver Comprobante'"
                          icon="eye"
                          :size="'sm'"
                          outlined
                          :href="paymentInvoice.urlProofOfPayment || undefined"
                          class="tw-line-clamp-3"
                          target="_blank"
                        ></AppButton>

                        <AppButton
                          :disabled="(!paymentInvoice.requiresApproval && paymentInvoice.requiresApproval !== undefined) || !paymentInvoice.enrolStep?.id"
                          v-tooltip="'Aprobar Inscripción'"
                          @click="approveOrReject(1, paymentInvoice.enrolStep?.id, paymentInvoice.enrolStep?.rejectedObservations)"
                          variant="primary"
                          icon="thumbs-up"
                          outlined
                        >
                        </AppButton>

                        <AppButton
                          :disabled="(!paymentInvoice.requiresApproval && paymentInvoice.requiresApproval !== undefined) || !paymentInvoice.enrolStep?.id"
                          v-tooltip="'Rechazar Inscripción'"
                          @click="approveOrReject(0, paymentInvoice.enrolStep?.id, paymentInvoice.enrolStep?.rejectedObservations)"
                          variant="primary"
                          icon="thumbs-down"
                          outlined
                        >
                        </AppButton>
                      </div>

                      <div class="applicationDetailPage__paymentActionsSummary">
                        <div>
                          <span>Monto base:</span>
                          <strong>{{ formatCurrency(paymentInvoice.totalValue) }}</strong>
                        </div>
                        <div>
                          <span>Total a pagar:</span>
                          <strong>{{ formatCurrency(paymentInvoice.totalPurchase) }}</strong>
                        </div>
                        <div>
                          <span>Total pagado:</span>
                          <strong>{{ formatCurrency(paymentInvoice.totalPaid) }}</strong>
                        </div>
                      </div>
                    </aside>
                  </div>
                </div>
              </template>
            </section>

            <section v-else-if="activeDetailTab === 'documentos'" class="applicationDetailPage__sectionStack">
              <AppLoading v-if="documentDetailsLoading || !documentDetailsLoaded" />

              <div v-else-if="documentDetailsError" class="applicationDetailPage__workflowEmpty">
                <AppIcon icon="exclamation-circle" />
                <strong>No se pudo cargar la información de documentos</strong>
                <span>Intenta cargar nuevamente los documentos del postulante.</span>
                <AppButton type="button" outlined @click="retryLoadDocumentDetails">
                  <AppIcon icon="sync" class="me-2" />
                  Reintentar
                </AppButton>
              </div>

              <div v-else-if="!documentDetails.length" class="applicationDetailPage__workflowEmpty">
                <AppIcon icon="paperclip" />
                <strong>No hay documentos disponibles</strong>
                <span>Este postulante aún no tiene documentos registrados.</span>
              </div>

              <div v-else class="applicationDetailPage__documentDetailsPanel">
                <div class="applicationDetailPage__documentDetailsHead">
                  <AppIcon icon="paperclip" />
                  <div>
                    <h3>Documentos y Adjuntos</h3>
                    <span>Gestión y validación de documentos cargados</span>
                  </div>
                </div>

                <div class="applicationDetailPage__documentDetailsBody">
                  <div class="applicationDetailPage__documentDetailsSummary">
                    <strong>Documentos de Identidad y Académicos</strong>
                    <span>{{ documentDetails.length }} documento(s) cargado(s)</span>
                  </div>

                  <div class="applicationDetailPage__documentDetailsList">
                    <div
                      v-for="documentDetail in documentDetails"
                      :key="documentDetail.id"
                      class="applicationDetailPage__documentDetailsItem"
                      :class="{
                        'applicationDetailPage__documentDetailsItem--accepted': documentDetail.isAccept === 1,
                        'applicationDetailPage__documentDetailsItem--rejected': documentDetail.isAccept === 0,
                        'applicationDetailPage__documentDetailsItem--pending': documentDetail.isAccept === null || documentDetail.isAccept === undefined,
                      }"
                    >
                      <div class="applicationDetailPage__documentDetailsIcon">
                        <AppIcon icon="file-alt" />
                      </div>

                      <div class="applicationDetailPage__documentDetailsInfo">
                        <strong>{{ documentDetail.document?.title || 'Documento' }}</strong>
                        <span>
                          <AppIcon icon="calendar-alt" />
                          {{ formatDate(documentDetail.updatedAt || documentDetail.createdAt) }}
                        </span>
                      </div>

                      <span
                        class="applicationDetailPage__documentDetailsStatus"
                        :class="{
                          'applicationDetailPage__documentDetailsStatus--accepted': documentDetail.isAccept === 1,
                          'applicationDetailPage__documentDetailsStatus--rejected': documentDetail.isAccept === 0,
                          'applicationDetailPage__documentDetailsStatus--pending': documentDetail.isAccept === null || documentDetail.isAccept === undefined,
                        }"
                      >
                        <AppIcon :icon="documentDetail.isAccept === 1 ? 'check-circle' : documentDetail.isAccept === 0 ? 'times-circle' : 'exclamation-circle'" />
                        {{ documentDetail.isAccept === 1 ? 'Aprobado' : documentDetail.isAccept === 0 ? 'Rechazado' : 'Pendiente' }}
                      </span>

                      <div class="applicationDetailPage__documentDetailsActions">
                        <AppButton
                          v-tooltip="'Ver Documento'"
                          :disabled="!(documentDetail.urlSignedDocument || documentDetail.urlDocumentWithSigners || documentDetail.urlDocument || documentDetail.document?.urlTemplate)"
                          :href="documentDetail.urlSignedDocument || documentDetail.urlDocumentWithSigners || documentDetail.urlDocument || documentDetail.document?.urlTemplate || undefined"
                          target="_blank"
                          icon="eye"
                          outlined
                        />

                        <AppButton
                          :disabled="
                            (documentDetail.requiresApproval !== undefined && !documentDetail.requiresApproval) ||
                            (documentDetail.enrolStep?.requiresApproval !== undefined && !documentDetail.enrolStep?.requiresApproval) ||
                            !documentDetail.enrolStep?.id
                          "
                          v-tooltip="'Aprobar Inscripción'"
                          @click="approveOrReject(1, documentDetail.enrolStep?.id, documentDetail.enrolStep?.rejectedObservations)"
                          variant="primary"
                          icon="thumbs-up"
                          outlined
                        />

                        <AppButton
                          :disabled="
                            (documentDetail.requiresApproval !== undefined && !documentDetail.requiresApproval) ||
                            (documentDetail.enrolStep?.requiresApproval !== undefined && !documentDetail.enrolStep?.requiresApproval) ||
                            !documentDetail.enrolStep?.id
                          "
                          v-tooltip="'Rechazar Inscripción'"
                          @click="approveOrReject(0, documentDetail.enrolStep?.id, documentDetail.enrolStep?.rejectedObservations)"
                          variant="primary"
                          icon="thumbs-down"
                          outlined
                        />
                      </div>

                      <div v-if="documentDetail.isAccept === 0 && documentDetail.enrolStep?.rejectedObservations" class="applicationDetailPage__documentDetailsRejectedReason">
                        <strong>
                          <AppIcon icon="exclamation-circle" />
                          Motivo del rechazo:
                        </strong>
                        <span>{{ documentDetail.enrolStep.rejectedObservations }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section v-else-if="activeDetailTab === 'adjuntos'" class="applicationDetailPage__sectionStack">
              <AppLoading v-if="attachmentDetailsLoading || !attachmentDetailsLoaded" />

              <div v-else-if="attachmentDetailsError" class="applicationDetailPage__workflowEmpty">
                <AppIcon icon="exclamation-circle" />
                <strong>No se pudo cargar la información de adjuntos</strong>
                <span>Intenta cargar nuevamente los adjuntos del postulante.</span>
                <AppButton type="button" outlined @click="retryLoadAttachmentDetails">
                  <AppIcon icon="sync" class="me-2" />
                  Reintentar
                </AppButton>
              </div>

              <div v-else-if="!attachmentDetails.length" class="applicationDetailPage__workflowEmpty">
                <AppIcon icon="paperclip" />
                <strong>No hay adjuntos disponibles</strong>
                <span>Este postulante aún no tiene adjuntos registrados.</span>
              </div>

              <div v-else class="applicationDetailPage__documentDetailsPanel">
                <div class="applicationDetailPage__documentDetailsHead">
                  <AppIcon icon="paperclip" />
                  <div>
                    <h3>Adjuntos</h3>
                    <span>Gestión y validación de archivos adjuntos cargados</span>
                  </div>
                </div>

                <div class="applicationDetailPage__documentDetailsBody">
                  <div class="applicationDetailPage__documentDetailsSummary">
                    <strong>Archivos Adjuntos</strong>
                    <span>{{ attachmentDetails.length }} adjunto(s) cargado(s)</span>
                  </div>

                  <div class="applicationDetailPage__documentDetailsList">
                    <div
                      v-for="attachmentDetail in attachmentDetails"
                      :key="attachmentDetail.id"
                      class="applicationDetailPage__documentDetailsItem"
                      :class="{
                        'applicationDetailPage__documentDetailsItem--accepted': attachmentDetail.isAccept === 1,
                        'applicationDetailPage__documentDetailsItem--rejected': attachmentDetail.isAccept === 0,
                        'applicationDetailPage__documentDetailsItem--pending': attachmentDetail.isAccept === null || attachmentDetail.isAccept === undefined,
                      }"
                    >
                      <div class="applicationDetailPage__documentDetailsIcon">
                        <AppIcon icon="paperclip" />
                      </div>

                      <div class="applicationDetailPage__documentDetailsInfo">
                        <strong>{{ attachmentDetail.requirement?.title || 'Adjunto' }}</strong>
                        <span>
                          <AppIcon icon="calendar-alt" />
                          {{ formatDate(attachmentDetail.updatedAt || attachmentDetail.createdAt) }}
                        </span>
                        <span v-if="attachmentDetail.requirement?.description">
                          {{ attachmentDetail.requirement.description }}
                        </span>
                      </div>

                      <span
                        class="applicationDetailPage__documentDetailsStatus"
                        :class="{
                          'applicationDetailPage__documentDetailsStatus--accepted': attachmentDetail.isAccept === 1,
                          'applicationDetailPage__documentDetailsStatus--rejected': attachmentDetail.isAccept === 0,
                          'applicationDetailPage__documentDetailsStatus--pending': attachmentDetail.isAccept === null || attachmentDetail.isAccept === undefined,
                        }"
                      >
                        <AppIcon :icon="attachmentDetail.isAccept === 1 ? 'check-circle' : attachmentDetail.isAccept === 0 ? 'times-circle' : 'exclamation-circle'" />
                        {{ attachmentDetail.isAccept === 1 ? 'Aprobado' : attachmentDetail.isAccept === 0 ? 'Rechazado' : 'Pendiente' }}
                      </span>

                      <div class="applicationDetailPage__documentDetailsActions">
                        <AppButton v-tooltip="'Ver Adjunto'" :disabled="!attachmentDetail.urlAttachment" :href="attachmentDetail.urlAttachment || undefined" target="_blank" icon="eye" outlined />

                        <AppButton
                          :disabled="isAttachmentApprovalDisabled(attachmentDetail)"
                          v-tooltip="'Aprobar Inscripción'"
                          @click="approveOrReject(1, getAttachmentEnrolStepId(attachmentDetail), attachmentDetail.enrolStep?.rejectedObservations)"
                          variant="primary"
                          icon="thumbs-up"
                          outlined
                        />

                        <AppButton
                          :disabled="isAttachmentApprovalDisabled(attachmentDetail)"
                          v-tooltip="'Rechazar Inscripción'"
                          @click="approveOrReject(0, getAttachmentEnrolStepId(attachmentDetail), attachmentDetail.enrolStep?.rejectedObservations)"
                          variant="primary"
                          icon="thumbs-down"
                          outlined
                        />
                      </div>

                      <div v-if="attachmentDetail.isAccept === 0 && attachmentDetail.enrolStep?.rejectedObservations" class="applicationDetailPage__documentDetailsRejectedReason">
                        <strong>
                          <AppIcon icon="exclamation-circle" />
                          Motivo del rechazo:
                        </strong>
                        <span>{{ attachmentDetail.enrolStep.rejectedObservations }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section v-else-if="activeDetailTab === 'examenes'" class="applicationDetailPage__sectionStack">
              <AppLoading v-if="examSurveysLoading || !examSurveysLoaded" />

              <div v-else-if="examSurveysError" class="applicationDetailPage__workflowEmpty">
                <AppIcon icon="exclamation-circle" />
                <strong>No se pudo cargar la información de exámenes</strong>
                <span>Intenta cargar nuevamente la información del postulante.</span>
                <AppButton type="button" outlined @click="retryLoadExamSurveys">
                  <AppIcon icon="sync" class="me-2" />
                  Reintentar
                </AppButton>
              </div>

              <div v-else-if="!examSurveys.length" class="applicationDetailPage__workflowEmpty">
                <AppIcon icon="award" />
                <strong>No hay exámenes disponibles</strong>
                <span>Este postulante aún no tiene información disponible para esta vista.</span>
              </div>

              <template v-else>
                <div class="applicationDetailPage__admissionExamPanel">
                  <div class="applicationDetailPage__admissionExamHead">
                    <AppIcon icon="award" />
                    <div>
                      <h3>Examen de Admisión</h3>
                      <span>Resultados y detalles del examen de admisión</span>
                    </div>
                  </div>

                  <div class="applicationDetailPage__admissionExamList">
                    <div
                      v-for="examSurvey in examSurveys"
                      :key="examSurvey.id"
                      class="applicationDetailPage__admissionExamCard"
                      :class="{
                        'applicationDetailPage__admissionExamCard--approved': getAdmissionExamState(examSurvey) === 'approved',
                        'applicationDetailPage__admissionExamCard--rejected': getAdmissionExamState(examSurvey) === 'rejected',
                        'applicationDetailPage__admissionExamCard--pending': getAdmissionExamState(examSurvey) === 'pending',
                      }"
                    >
                      <div class="applicationDetailPage__admissionExamContent">
                        <h4>
                          {{ examSurvey.checklist?.titulo || 'Examen de Admisión' }}
                        </h4>

                        <div class="applicationDetailPage__admissionExamMeta">
                          <span
                            class="applicationDetailPage__admissionExamChip"
                            :class="{
                              'applicationDetailPage__admissionExamChip--approved': getAdmissionExamState(examSurvey) === 'approved',
                              'applicationDetailPage__admissionExamChip--rejected': getAdmissionExamState(examSurvey) === 'rejected',
                              'applicationDetailPage__admissionExamChip--pending': getAdmissionExamState(examSurvey) === 'pending',
                            }"
                          >
                            <AppIcon :icon="getAdmissionExamIcon(examSurvey)" />
                            {{ getAdmissionExamStatusLabel(examSurvey) }}
                          </span>
                          <span>
                            <AppIcon icon="calendar-alt" />
                            {{
                              formatDateTime(
                                examSurvey.fechaFin || examSurvey.fechaInicio || examSurvey.enrolStep?.updatedAt || examSurvey.enrolStep?.createdAt || examSurvey.updatedAt || examSurvey.createdAt
                              )
                            }}
                          </span>
                        </div>

                        <div class="applicationDetailPage__admissionExamScore">
                          <span>Puntaje Obtenido</span>
                          <div class="applicationDetailPage__admissionExamScoreValue">
                            <strong>{{ getAdmissionExamScoreObtained(examSurvey) }}</strong>
                            <small>/ {{ getAdmissionExamScoreTotal(examSurvey) }}</small>
                          </div>
                          <div class="applicationDetailPage__admissionExamScoreTrack">
                            <span
                              :style="{
                                width: `${getAdmissionExamScorePercentage(examSurvey)}%`,
                              }"
                            ></span>
                          </div>
                        </div>
                      </div>

                      <div class="applicationDetailPage__admissionExamResult">
                        <strong>
                          <AppIcon :icon="getAdmissionExamIcon(examSurvey)" />
                          {{ getAdmissionExamResultLabel(examSurvey) }}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </section>

            <section v-else-if="activeDetailTab === 'matricula'" class="applicationDetailPage__sectionStack">
              <AppLoading v-if="subjectDetailsLoading || !subjectDetailsLoaded" />

              <div v-else-if="subjectDetailsError" class="applicationDetailPage__workflowEmpty">
                <AppIcon icon="exclamation-circle" />
                <strong>No se pudo cargar la matrícula</strong>
                <span>Intenta cargar nuevamente las asignaturas matriculadas.</span>
                <AppButton type="button" outlined @click="retryLoadSubjectDetails">
                  <AppIcon icon="sync" class="me-2" />
                  Reintentar
                </AppButton>
              </div>

              <div v-else-if="!subjectDetails.length" class="applicationDetailPage__workflowEmpty">
                <AppIcon icon="book" />
                <strong>No hay asignaturas disponibles</strong>
                <span>Este postulante aún no tiene asignaturas matriculadas.</span>
              </div>

              <div v-else class="applicationDetailPage__documentDetailsPanel">
                <div class="applicationDetailPage__documentDetailsHead">
                  <AppIcon icon="book" />
                  <div>
                    <h3>Matrícula de Asignaturas</h3>
                    <span>Consulta las asignaturas, grupos y docentes registrados para la matrícula</span>
                  </div>
                </div>

                <div class="applicationDetailPage__documentDetailsBody">
                  <div
                    class="applicationDetailPage__matriculaState"
                    :class="{
                      'applicationDetailPage__matriculaState--done': Boolean(application.matriculateId || subjectDetails.length),
                    }"
                  >
                    <AppIcon :icon="application.matriculateId || subjectDetails.length ? 'check-circle' : 'clock'" />
                    <div>
                      <strong>{{ application.matriculateId || subjectDetails.length ? 'Matrícula registrada' : 'Sin matrícula registrada' }}</strong>
                      <span>{{ subjectDetails.length }} asignatura(s) registrada(s)</span>
                    </div>
                  </div>

                  <div class="applicationDetailPage__enrolledSubjectsList">
                    <div v-for="subjectDetail in subjectDetails" :key="subjectDetail.id" class="applicationDetailPage__enrolledSubjectItem">
                      <div class="applicationDetailPage__enrolledSubjectIcon">
                        <AppIcon icon="book" />
                      </div>

                      <div class="applicationDetailPage__enrolledSubjectInfo">
                        <strong>{{ subjectDetail.periodSubject?.subject?.name || 'Asignatura' }}</strong>
                        <span>
                          {{ subjectDetail.periodSubject?.subject?.code || '—' }}
                          -
                          {{ subjectDetail.periodSubject?.subject?.credits ?? '—' }}
                          crédito(s)
                        </span>
                      </div>

                      <div class="applicationDetailPage__enrolledSubjectMeta">
                        <span>Docente</span>
                        <strong>{{ `${subjectDetail.teacher?.names ?? ''} ${subjectDetail.teacher?.lastnames ?? ''}`.trim() || '—' }}</strong>
                      </div>

                      <div class="applicationDetailPage__enrolledSubjectMeta">
                        <span>Grupo</span>
                        <strong>{{ subjectDetail.offeringSection?.code || '—' }}</strong>
                      </div>

                      <span
                        class="applicationDetailPage__enrolledSubjectStatus"
                        :class="{
                          'applicationDetailPage__enrolledSubjectStatus--approved': subjectDetail.matriculateSubject?.isApproved === 1,
                          'applicationDetailPage__enrolledSubjectStatus--pending': subjectDetail.matriculateSubject?.isApproved !== 1,
                        }"
                      >
                        <AppIcon :icon="subjectDetail.matriculateSubject?.isApproved === 1 ? 'check-circle' : 'clock'" />
                        {{ subjectDetail.matriculateSubject?.isApproved === 1 ? 'Aprobada' : 'Pendiente' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>

          <aside class="applicationDetailPage__side">
            <div class="applicationDetailPage__sideCard">
              <h3>Resumen</h3>
              <div class="applicationDetailPage__summaryRow">
                <span>Programa</span>
                <strong>{{ application.offering?.program?.name || '—' }}</strong>
              </div>
              <div class="applicationDetailPage__summaryRow">
                <span>Estado</span>
                <AppBadge :label="application.statusLabel || application.status || '—'" :variant="getStatusVariant(application.status)" />
              </div>
              <div class="applicationDetailPage__summaryRow">
                <span>Tipo</span>
                <strong>{{ application.isPrevius ? 'Estudiante Antiguo' : 'Estudiante Nuevo' }}</strong>
              </div>
              <div class="applicationDetailPage__summaryRow">
                <span>Progreso</span>
                <strong>{{ application.progressInfo?.currentProgress ?? application.progress ?? 0 }}%</strong>
              </div>
            </div>

            <div class="applicationDetailPage__sideCard">
              <h3>Actividad Reciente</h3>
              <div v-if="!application.timeline?.length" class="applicationDetailPage__workflowEmpty">
                <AppIcon icon="clock" />
                <strong>No hay actividad reciente</strong>
                <span>El servicio no retorna registros de actividad para esta postulación.</span>
              </div>
              <template v-else>
                <div v-for="activity in application.timeline" :key="activity.id" class="applicationDetailPage__activityItem">
                  <div class="applicationDetailPage__activityDot applicationDetailPage__activityDot--workflow"></div>
                  <div>
                    <strong>{{ activity.title }}</strong>
                    <span>{{ activity.date ? 'Actividad registrada dentro del proceso de admisión.' : 'Actividad pendiente dentro del proceso de admisión.' }}</span>
                    <small>{{ formatDate(activity.date) }}</small>
                  </div>
                </div>
              </template>
            </div>
          </aside>
        </div>
      </div>
      <div v-else class="applicationDetailPage">
        <div class="applicationDetailPage__content">
          <div class="applicationDetailPage__workflowEmpty">
            <AppIcon icon="exclamation-circle" />
            <strong>No se pudo cargar el detalle</strong>
            <span>Intenta volver a abrir la postulación.</span>
          </div>
        </div>
      </div>
    </template>
  </AppBaseList>

  <AppModal v-model="inscritoDetailsModal" :size="'lg'">
    <InscritoDetails v-if="inscritoDetailsModal" :name="userName" :convocationEnrolStepId="currentConvocationEnrolStepId" />
  </AppModal>

  <AppModal v-model="inscritoCobroDetailsModal" :size="'lg'">
    <InscritoDetailsCobro
      v-if="inscritoCobroDetailsModal"
      :name="paymentInvoiceId"
      :convocationEnrolStepId="currentPaymentConvocationEnrolStepId"
      :payment-method="methodsPaymentsProps"
      @close="closeInscritoCobroDetailsModal"
    />
  </AppModal>

  <AppModal v-model="rejectedObservationsModal">
    <RejectedObservations v-if="rejectedObservationsModal" :data="currentData" @close="closeApproveOrRejectModal" />
  </AppModal>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMeta } from 'vue-meta';

import AppBadge from '../../../shared/components/AppBadge.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import { useHeaderStore } from '../../../stores/header.store';
import type { ApplicationWorkflowStepStatus } from '../dtos/application.dto';
import type { VariantsConstant } from '../../../shared/constant/variants.constant';
import InscritoDetails from '../components/InscritoDetails.vue';
import InscritoDetailsCobro from '../components/InscritoDetailsCobro.vue';
import RejectedObservations from '../components/RejectedObservations.vue';
import { UpdateApprovedByInscritoService } from '../services/updateApprovedByInscrito.service';
import { GetConvocationEnrollService } from '../services/getConvocationEnroll.service';
import { GetConvocationEnrollDocumentDetailsService } from '../services/getConvocationEnrollDocumentDetails.service';
import { GetConvocationEnrollInvoiceDetailsService } from '../services/getConvocationEnrollInvoiceDetails.service';
import { GetConvocationEnrollProgressDetailsService } from '../services/getConvocationEnrollProgressDetails.service';
import { GetConvocationEnrollChecklistDetailsService } from '../services/getConvocationEnrollChecklistDetails.service';
import { GetConvocationEnrollAttachmentDetailsService } from '../services/getConvocationEnrollAttachmentDetails.service';
import { GetConvocationEnrollSubjectDetailsService } from '../services/getConvocationEnrollSubjectDetails.service';

const getConvocationEnrollService = new GetConvocationEnrollService();
const getConvocationEnrollDocumentDetailsService = new GetConvocationEnrollDocumentDetailsService();
const updateApprovedByInscritoService = new UpdateApprovedByInscritoService();
const getConvocationEnrollInvoiceDetailsService = new GetConvocationEnrollInvoiceDetailsService();
const getConvocationEnrollProgressDetailsService = new GetConvocationEnrollProgressDetailsService();
const getConvocationEnrollChecklistDetailsService = new GetConvocationEnrollChecklistDetailsService();
const getConvocationEnrollAttachmentDetailsService = new GetConvocationEnrollAttachmentDetailsService();
const getConvocationEnrollSubjectDetailsService = new GetConvocationEnrollSubjectDetailsService();

type RouteValue = string | string[] | null | undefined;

const getRouteValue = (value: RouteValue, fallback: string): string => {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
};

type ApplicationDetailTab = 'informacion' | 'progreso' | 'formularios' | 'pagos' | 'documentos' | 'adjuntos' | 'examenes' | 'matricula';
type AdmissionExamState = 'approved' | 'rejected' | 'pending';

const statusVariantMap: Record<string, VariantsConstant> = {
  interesado: 'secondary',
  postulante: 'warning',
  ingresante: 'primary',
  matriculado: 'success',
  in_process: 'warning',
  en_proceso: 'warning',
  admitted: 'success',
  admitido: 'success',
  applicant: 'primary',
  waiting: 'secondary',
  en_espera: 'secondary',
  rejected: 'danger',
  rechazado: 'danger',
};

const detailTabs: { id: ApplicationDetailTab; label: string; icon: string }[] = [
  { id: 'informacion', label: 'Información', icon: 'user' },
  { id: 'progreso', label: 'Progreso', icon: 'tasks' },
  { id: 'formularios', label: 'Formularios', icon: 'file-alt' },
  { id: 'pagos', label: 'Pagos', icon: 'credit-card' },
  { id: 'documentos', label: 'Documentos', icon: 'paperclip' },
  { id: 'adjuntos', label: 'Adjuntos', icon: 'paperclip' },
  { id: 'examenes', label: 'Exámenes', icon: 'award' },
  { id: 'matricula', label: 'Matrícula', icon: 'book' },
];

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function formatCurrency(value?: number) {
  if (value === null || value === undefined) return '—';

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

export default defineComponent({
  name: 'ApplicationDetail',
  components: {
    AppBadge,
    AppBaseList,
    AppButton,
    AppIcon,
    AppLoading,
    AppModal,
    InscritoDetails,
    InscritoDetailsCobro,
    RejectedObservations,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const headerStorage = useHeaderStore();
    const title = 'Detalle de Postulación';
    const routes = [{ name: 'Postulaciones' }, { name: title }];

    useMeta({ title });

    const applicationId = computed(() => getRouteValue(route.params.applicationId, '0'));
    const loading = ref(false);
    const progressLoading = ref(false);
    const progressDetailsLoaded = ref(false);
    const progressDetailsError = ref(false);
    const progressWorkflowSteps = ref<any[]>([]);
    const formStepsLoading = ref(false);
    const formStepsLoaded = ref(false);
    const formStepsError = ref(false);
    const formWorkflowSteps = ref<any[]>([]);
    const paymentInvoicesLoading = ref(false);
    const paymentInvoicesLoaded = ref(false);
    const paymentInvoicesError = ref(false);
    const paymentInvoices = ref<any[]>([]);
    const documentDetailsLoading = ref(false);
    const documentDetailsLoaded = ref(false);
    const documentDetailsError = ref(false);
    const documentDetails = ref<any[]>([]);
    const attachmentDetailsLoading = ref(false);
    const attachmentDetailsLoaded = ref(false);
    const attachmentDetailsError = ref(false);
    const attachmentDetails = ref<any[]>([]);
    const examSurveysLoading = ref(false);
    const examSurveysLoaded = ref(false);
    const examSurveysError = ref(false);
    const examSurveys = ref<any[]>([]);
    const subjectDetailsLoading = ref(false);
    const subjectDetailsLoaded = ref(false);
    const subjectDetailsError = ref(false);
    const subjectDetails = ref<any[]>([]);
    const application = ref<any>(null);
    const activeDetailTab = ref<ApplicationDetailTab>('informacion');
    const currentConvocationEnrolStepId = ref();
    const currentPaymentConvocationEnrolStepId = ref();
    const inscritoDetailsModal = ref(false);
    const inscritoCobroDetailsModal = ref(false);
    const rejectedObservationsModal = ref(false);
    const currentData = ref();
    const paymentInvoiceId = ref();
    const methodsPaymentsProps = ref<any>();
    const userName = ref();

    const loadApplication = async () => {
      loading.value = true;

      try {
        const enroll = await getConvocationEnrollService.run(applicationId.value);
        application.value = enroll;
      } catch (error) {
        console.error('Error cargando detalle de postulación:', error);
        application.value = null;
      } finally {
        loading.value = false;
      }
    };

    const loadProgressDetails = async () => {
      if (progressLoading.value || progressDetailsLoaded.value) return;

      progressLoading.value = true;
      progressDetailsError.value = false;

      try {
        const progressDetails = await getConvocationEnrollProgressDetailsService.run(applicationId.value);
        progressWorkflowSteps.value = progressDetails;
        progressDetailsLoaded.value = true;
      } catch (error) {
        console.error('Error cargando progreso de postulación:', error);
        progressWorkflowSteps.value = [];
        progressDetailsError.value = true;
        progressDetailsLoaded.value = true;
      } finally {
        progressLoading.value = false;
      }
    };

    const retryLoadProgressDetails = () => {
      progressDetailsLoaded.value = false;
      progressDetailsError.value = false;
      void loadProgressDetails();
    };

    const loadFormSteps = async () => {
      if (formStepsLoading.value || formStepsLoaded.value) return;

      formStepsLoading.value = true;
      formStepsError.value = false;

      try {
        const progressDetails = await getConvocationEnrollProgressDetailsService.run(applicationId.value);
        formWorkflowSteps.value = progressDetails.filter((step: any) => step.stepType?.name === 'Formulario');
        formStepsLoaded.value = true;
      } catch (error) {
        console.error('Error cargando formularios de postulación:', error);
        formWorkflowSteps.value = [];
        formStepsError.value = true;
        formStepsLoaded.value = true;
      } finally {
        formStepsLoading.value = false;
      }
    };

    const retryLoadFormSteps = () => {
      formStepsLoaded.value = false;
      formStepsError.value = false;
      void loadFormSteps();
    };

    const loadPaymentInvoices = async () => {
      if (paymentInvoicesLoading.value || paymentInvoicesLoaded.value) return;

      paymentInvoicesLoading.value = true;
      paymentInvoicesError.value = false;

      try {
        const invoiceDetails = await getConvocationEnrollInvoiceDetailsService.run(applicationId.value);
        paymentInvoices.value = invoiceDetails;
        paymentInvoicesLoaded.value = true;
      } catch (error) {
        console.error('Error cargando pagos de postulación:', error);
        paymentInvoices.value = [];
        paymentInvoicesError.value = true;
        paymentInvoicesLoaded.value = true;
      } finally {
        paymentInvoicesLoading.value = false;
      }
    };

    const retryLoadPaymentInvoices = () => {
      paymentInvoicesLoaded.value = false;
      paymentInvoicesError.value = false;
      void loadPaymentInvoices();
    };

    const loadDocumentDetails = async () => {
      if (documentDetailsLoading.value || documentDetailsLoaded.value) return;

      documentDetailsLoading.value = true;
      documentDetailsError.value = false;

      try {
        const documents = await getConvocationEnrollDocumentDetailsService.run(applicationId.value);
        documentDetails.value = documents;
        documentDetailsLoaded.value = true;
      } catch (error) {
        console.error('Error cargando documentos de postulación:', error);
        documentDetails.value = [];
        documentDetailsError.value = true;
        documentDetailsLoaded.value = true;
      } finally {
        documentDetailsLoading.value = false;
      }
    };

    const retryLoadDocumentDetails = () => {
      documentDetailsLoaded.value = false;
      documentDetailsError.value = false;
      void loadDocumentDetails();
    };

    const loadAttachmentDetails = async () => {
      if (attachmentDetailsLoading.value || attachmentDetailsLoaded.value) return;

      attachmentDetailsLoading.value = true;
      attachmentDetailsError.value = false;

      try {
        const attachments = await getConvocationEnrollAttachmentDetailsService.run(applicationId.value);
        attachmentDetails.value = attachments;
        attachmentDetailsLoaded.value = true;
      } catch (error) {
        console.error('Error cargando adjuntos de postulación:', error);
        attachmentDetails.value = [];
        attachmentDetailsError.value = true;
        attachmentDetailsLoaded.value = true;
      } finally {
        attachmentDetailsLoading.value = false;
      }
    };

    const retryLoadAttachmentDetails = () => {
      attachmentDetailsLoaded.value = false;
      attachmentDetailsError.value = false;
      void loadAttachmentDetails();
    };

    const loadExamSurveys = async () => {
      if (examSurveysLoading.value || examSurveysLoaded.value) return;

      examSurveysLoading.value = true;
      examSurveysError.value = false;

      try {
        const checklistDetails = await getConvocationEnrollChecklistDetailsService.run(applicationId.value);
        examSurveys.value = checklistDetails;
        examSurveysLoaded.value = true;
      } catch (error) {
        console.error('Error cargando exámenes de postulación:', error);
        examSurveys.value = [];
        examSurveysError.value = true;
        examSurveysLoaded.value = true;
      } finally {
        examSurveysLoading.value = false;
      }
    };

    const retryLoadExamSurveys = () => {
      examSurveysLoaded.value = false;
      examSurveysError.value = false;
      void loadExamSurveys();
    };

    const loadSubjectDetails = async () => {
      if (subjectDetailsLoading.value || subjectDetailsLoaded.value) return;

      subjectDetailsLoading.value = true;
      subjectDetailsError.value = false;

      try {
        const subjects = await getConvocationEnrollSubjectDetailsService.run(applicationId.value);
        subjectDetails.value = subjects;
        subjectDetailsLoaded.value = true;
      } catch (error) {
        console.error('Error cargando matrícula de postulación:', error);
        subjectDetails.value = [];
        subjectDetailsError.value = true;
        subjectDetailsLoaded.value = true;
      } finally {
        subjectDetailsLoading.value = false;
      }
    };

    const retryLoadSubjectDetails = () => {
      subjectDetailsLoaded.value = false;
      subjectDetailsError.value = false;
      void loadSubjectDetails();
    };

    const selectDetailTab = (tabId: ApplicationDetailTab) => {
      activeDetailTab.value = tabId;

      if (tabId === 'progreso') {
        progressDetailsLoaded.value = false;
        progressDetailsError.value = false;
        void loadProgressDetails();
      }

      if (tabId === 'formularios') {
        formStepsLoaded.value = false;
        formStepsError.value = false;
        void loadFormSteps();
      }

      if (tabId === 'pagos') {
        paymentInvoicesLoaded.value = false;
        paymentInvoicesError.value = false;
        void loadPaymentInvoices();
      }

      if (tabId === 'documentos') {
        documentDetailsLoaded.value = false;
        documentDetailsError.value = false;
        void loadDocumentDetails();
      }

      if (tabId === 'adjuntos') {
        attachmentDetailsLoaded.value = false;
        attachmentDetailsError.value = false;
        void loadAttachmentDetails();
      }

      if (tabId === 'examenes') {
        examSurveysLoaded.value = false;
        examSurveysError.value = false;
        void loadExamSurveys();
      }

      if (tabId === 'matricula') {
        subjectDetailsLoaded.value = false;
        subjectDetailsError.value = false;
        void loadSubjectDetails();
      }
    };

    const openInscritoDetailsModal = (step: any) => {
      currentConvocationEnrolStepId.value = step.enrolStep?.id;
      userName.value = `${application.value?.people?.names ?? ''} ${application.value?.people?.lastnames ?? ''}`.trim();
      inscritoDetailsModal.value = true;
    };

    const getTypePayment = (row: any) => {
      if (row && (row.paymentType === null || row.paymentType === undefined)) {
        methodsPaymentsProps.value = 0;
      } else if (row && row.paymentType === 'WebCheckout') {
        methodsPaymentsProps.value = 1;
      } else if (row && row.paymentType === 'Efectivo') {
        methodsPaymentsProps.value = 2;
      }
    };

    const openInscritoCobroDetailsModal = (convocationEnrolStepId: number, name: string | number, row: any) => {
      currentPaymentConvocationEnrolStepId.value = convocationEnrolStepId;
      paymentInvoiceId.value = name;
      inscritoCobroDetailsModal.value = true;
      getTypePayment(row);
    };

    const closeInscritoCobroDetailsModal = () => {
      inscritoCobroDetailsModal.value = false;
    };

    const approveOrReject = async (isApproved: number, id: number, rejectedObservations: string) => {
      const data = {
        id: id,
        isApproved: isApproved,
        rejectedObservations: rejectedObservations,
      };

      if (isApproved) {
        try {
          await updateApprovedByInscritoService.run(data);
          if (activeDetailTab.value === 'formularios') {
            formStepsLoaded.value = false;
            void loadFormSteps();
          }
          if (activeDetailTab.value === 'pagos') {
            paymentInvoicesLoaded.value = false;
            void loadPaymentInvoices();
          }
          if (activeDetailTab.value === 'documentos') {
            documentDetailsLoaded.value = false;
            void loadDocumentDetails();
          }
          if (activeDetailTab.value === 'adjuntos') {
            attachmentDetailsLoaded.value = false;
            void loadAttachmentDetails();
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        currentData.value = data;
        rejectedObservationsModal.value = true;
      }
    };

    const closeApproveOrRejectModal = async () => {
      rejectedObservationsModal.value = false;
      if (activeDetailTab.value === 'formularios') {
        formStepsLoaded.value = false;
        void loadFormSteps();
      }
      if (activeDetailTab.value === 'pagos') {
        paymentInvoicesLoaded.value = false;
        void loadPaymentInvoices();
      }
      if (activeDetailTab.value === 'documentos') {
        documentDetailsLoaded.value = false;
        void loadDocumentDetails();
      }
      if (activeDetailTab.value === 'adjuntos') {
        attachmentDetailsLoaded.value = false;
        void loadAttachmentDetails();
      }
    };

    watch(
      () => application.value?.id,
      () => {
        activeDetailTab.value = 'informacion';
      }
    );

    watch(
      applicationId,
      () => {
        progressDetailsLoaded.value = false;
        progressDetailsError.value = false;
        progressWorkflowSteps.value = [];
        formStepsLoaded.value = false;
        formStepsError.value = false;
        formWorkflowSteps.value = [];
        paymentInvoicesLoaded.value = false;
        paymentInvoicesError.value = false;
        paymentInvoices.value = [];
        documentDetailsLoaded.value = false;
        documentDetailsError.value = false;
        documentDetails.value = [];
        attachmentDetailsLoaded.value = false;
        attachmentDetailsError.value = false;
        attachmentDetails.value = [];
        examSurveysLoaded.value = false;
        examSurveysError.value = false;
        examSurveys.value = [];
        subjectDetailsLoaded.value = false;
        subjectDetailsError.value = false;
        subjectDetails.value = [];
        void loadApplication();
      },
      { immediate: true }
    );

    watch(
      application,
      (currentApplication) => {
        headerStorage.module = { name: 'Admisión y Registro', url: '' };
        headerStorage.moduleItem = { name: 'Postulaciones', url: '' };
        headerStorage.moduleSubItem = {
          name: `${currentApplication?.people?.names ?? ''} ${currentApplication?.people?.lastnames ?? ''}`.trim() || 'Detalle de Postulación',
          url: '',
        };
      },
      { immediate: true }
    );

    const getInitials = (name: string) =>
      name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const getStatusVariant = (status?: string): VariantsConstant => statusVariantMap[status ?? ''] ?? 'secondary';

    const getProgressClass = (progress: number) => {
      if (progress >= 85) return 'applicationDetailPage__progressFill--success';
      if (progress >= 45) return 'applicationDetailPage__progressFill--warning';
      return 'applicationDetailPage__progressFill--danger';
    };

    const getProgressStepStatus = (step: any): ApplicationWorkflowStepStatus => {
      if (!step?.enrolStep) return 'pendiente';
      if (step.enrolStep.isApproved === 1) return 'completado';

      return 'pendiente';
    };

    const getProgressStepType = (step: any): string => step?.stepType?.name ?? step?.title ?? '';

    const getProgressStepMessage = (step: any): string => {
      const detail = step?.details?.[0];
      const scoreMessage =
        detail?.puntajeObtenido !== undefined && detail?.puntajeObtenido !== null && detail?.puntajeTotal !== undefined && detail?.puntajeTotal !== null
          ? ` Puntaje obtenido: ${detail.puntajeObtenido}/${detail.puntajeTotal}.`
          : '';

      if (step?.enrolStep?.rejectedObservations) return step.enrolStep.rejectedObservations;
      if (step?.description?.trim()) return `${step.description}${scoreMessage}`.trim();
      if (detail?.survey?.description) return `${detail.survey.description}${scoreMessage}`.trim();
      if (detail?.checklist?.titulo) return `${detail.checklist.titulo}.${scoreMessage}`.trim();
      if (getProgressStepStatus(step) === 'completado') return 'Paso completado correctamente.';
      if (getProgressStepStatus(step) === 'en_curso') return 'Este paso se encuentra en curso.';

      return 'Este paso está pendiente dentro del proceso de admisión.';
    };

    const getWorkflowStatusLabel = (status: ApplicationWorkflowStepStatus) => {
      if (status === 'completado') return 'Completado';
      if (status === 'en_curso') return 'En curso';
      return 'Pendiente';
    };

    const getWorkflowStatusVariant = (status: ApplicationWorkflowStepStatus): VariantsConstant => {
      if (status === 'completado') return 'success';
      if (status === 'en_curso') return 'primary';
      return 'secondary';
    };

    const getWorkflowStatusIcon = (status: ApplicationWorkflowStepStatus) => {
      if (status === 'completado') return 'check-circle';
      if (status === 'en_curso') return 'clock';
      return 'circle';
    };

    const getWorkflowStateClass = (status: ApplicationWorkflowStepStatus) => `applicationDetailPage__workflowState--${status}`;

    const getWorkflowNormalizedType = (type: string) => {
      const normalizedType = type.toLowerCase();
      if (normalizedType.includes('cobro')) return 'cobro';
      if (normalizedType.includes('adjunto') || normalizedType.includes('documento')) return 'adjunto';
      if (normalizedType.includes('examen')) return 'examen';
      if (normalizedType.includes('matricula') || normalizedType.includes('matrícula')) return 'matricula';
      return 'formulario';
    };

    const getWorkflowTypeClass = (type: string) => `applicationDetailPage__workflowType--${getWorkflowNormalizedType(type)}`;

    const getWorkflowTypeIcon = (type: string) => {
      const normalizedType = getWorkflowNormalizedType(type);
      if (normalizedType === 'cobro') return 'credit-card';
      if (normalizedType === 'adjunto') return 'paperclip';
      if (normalizedType === 'examen') return 'award';
      if (normalizedType === 'matricula') return 'book';
      return 'file-alt';
    };

    const getWorkflowDetailTitle = (type: string) => {
      const normalizedType = getWorkflowNormalizedType(type);
      if (normalizedType === 'cobro') return 'Información de pago';
      if (normalizedType === 'adjunto') return 'Documentos adjuntos';
      if (normalizedType === 'examen') return 'Resultado del examen';
      if (normalizedType === 'matricula') return 'Matrícula de asignaturas';
      return 'Estado del formulario';
    };

    const getAttachmentEnrolStepId = (attachmentDetail: any) => attachmentDetail?.enrolStep?.id ?? attachmentDetail?.convocationEnrolStepId ?? null;

    const isAttachmentApprovalDisabled = (attachmentDetail: any) => {
      if (!getAttachmentEnrolStepId(attachmentDetail)) return true;
      if (attachmentDetail?.requiresApproval === false || attachmentDetail?.enrolStep?.requiresApproval === false) return true;
      return false;
    };

    const normalizeExamStatus = (value?: string | null) =>
      String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

    const isAdmissionExamDelivered = (exam: any) => ['entregado', 'completado', 'completed', 'finalizado'].includes(normalizeExamStatus(exam?.estado));

    const getAdmissionExamState = (exam: any): AdmissionExamState => {
      if (exam?.enrolStep?.isApproved === 0) return 'rejected';
      if (exam?.enrolStep?.isApproved === 1 || isAdmissionExamDelivered(exam)) return 'approved';
      return 'pending';
    };

    const getAdmissionExamIcon = (exam: any) => {
      const state = getAdmissionExamState(exam);
      if (state === 'approved') return 'check-circle';
      if (state === 'rejected') return 'times-circle';
      return 'clock';
    };

    const getAdmissionExamStatusLabel = (exam: any) => {
      const state = getAdmissionExamState(exam);
      if (state === 'rejected') return 'Rechazado';
      if (isAdmissionExamDelivered(exam) || state === 'approved') return 'Completado';
      return exam?.estado || 'Pendiente';
    };

    const getAdmissionExamResultLabel = (exam: any) => {
      const state = getAdmissionExamState(exam);
      if (state === 'approved') return 'APROBADO';
      if (state === 'rejected') return 'RECHAZADO';
      return 'PENDIENTE';
    };

    const getAdmissionExamScoreObtained = (exam: any) => {
      const score = Number(exam?.puntajeObtenido);
      return Number.isFinite(score) ? score : 0;
    };

    const getAdmissionExamScoreTotal = (exam: any) => {
      const total = Number(exam?.puntajeTotal);
      return Number.isFinite(total) && total > 0 ? total : 100;
    };

    const getAdmissionExamScorePercentage = (exam: any) => {
      const percentage = Number(exam?.porcentajePuntaje);
      if (Number.isFinite(percentage)) return Math.min(100, Math.max(0, percentage));

      const score = getAdmissionExamScoreObtained(exam);
      const total = getAdmissionExamScoreTotal(exam);
      return total > 0 ? Math.min(100, Math.max(0, Math.round((score / total) * 100))) : 0;
    };

    const backToApplications = () => {
      router.push({ name: 'surveys.applicationsList' });
    };

    return {
      title,
      routes,
      loading,
      progressLoading,
      progressDetailsLoaded,
      progressDetailsError,
      formStepsLoading,
      formStepsLoaded,
      formStepsError,
      paymentInvoicesLoading,
      paymentInvoicesLoaded,
      paymentInvoicesError,
      documentDetailsLoading,
      documentDetailsLoaded,
      documentDetailsError,
      attachmentDetailsLoading,
      attachmentDetailsLoaded,
      attachmentDetailsError,
      examSurveysLoading,
      examSurveysLoaded,
      examSurveysError,
      subjectDetailsLoading,
      subjectDetailsLoaded,
      subjectDetailsError,
      application,
      progressWorkflowSteps,
      formWorkflowSteps,
      paymentInvoices,
      documentDetails,
      attachmentDetails,
      examSurveys,
      subjectDetails,
      activeDetailTab,
      currentConvocationEnrolStepId,
      currentPaymentConvocationEnrolStepId,
      currentData,
      detailTabs,
      inscritoDetailsModal,
      inscritoCobroDetailsModal,
      rejectedObservationsModal,
      paymentInvoiceId,
      methodsPaymentsProps,
      selectDetailTab,
      retryLoadProgressDetails,
      retryLoadFormSteps,
      retryLoadPaymentInvoices,
      retryLoadDocumentDetails,
      retryLoadAttachmentDetails,
      retryLoadExamSurveys,
      retryLoadSubjectDetails,
      userName,
      getInitials,
      getStatusVariant,
      getProgressClass,
      formatDate,
      formatDateTime,
      formatCurrency,
      getProgressStepStatus,
      getProgressStepType,
      getProgressStepMessage,
      getWorkflowStatusLabel,
      getWorkflowStatusVariant,
      getWorkflowStatusIcon,
      getWorkflowStateClass,
      getWorkflowTypeClass,
      getWorkflowTypeIcon,
      getWorkflowDetailTitle,
      getAttachmentEnrolStepId,
      isAttachmentApprovalDisabled,
      getAdmissionExamState,
      getAdmissionExamIcon,
      getAdmissionExamStatusLabel,
      getAdmissionExamResultLabel,
      getAdmissionExamScoreObtained,
      getAdmissionExamScoreTotal,
      getAdmissionExamScorePercentage,
      openInscritoDetailsModal,
      openInscritoCobroDetailsModal,
      closeInscritoCobroDetailsModal,
      approveOrReject,
      closeApproveOrRejectModal,
      backToApplications,
    };
  },
});
</script>

<style scoped>
.applicationDetailPage {
  margin: -1rem;
  background: #f8fafc;
  min-height: calc(100vh - 140px);
}

.applicationDetailPage__header,
.applicationDetailPage__tabsWrap {
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
}

.applicationDetailPage__headerInner,
.applicationDetailPage__tabs,
.applicationDetailPage__content {
  width: min(100%, 1320px);
  margin: 0 auto;
}

.applicationDetailPage__headerInner {
  padding: 1.5rem;
}

.applicationDetailPage__profile {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.applicationDetailPage__profileMain {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  min-width: 0;
}

.applicationDetailPage__avatar {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: #fff;
  font-size: 1.75rem;
  font-weight: 900;
  flex-shrink: 0;
  box-shadow: 0 14px 30px rgba(37, 99, 235, 0.2);
}

.applicationDetailPage__profileInfo {
  min-width: 0;
}

.applicationDetailPage__profileInfo h2 {
  margin: 0 0 0.65rem;
  color: #0f172a;
  font-size: 1.85rem;
  font-weight: 900;
  overflow-wrap: anywhere;
}

.applicationDetailPage__profileMeta,
.applicationDetailPage__badges,
.applicationDetailPage__progressMeta,
.applicationDetailPage__actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.applicationDetailPage__profileMeta {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 0.8rem;
}

.applicationDetailPage__id {
  background: #f1f5f9;
  color: #334155;
  font-family: 'Roboto Mono', monospace;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

.applicationDetailPage__progressPanel {
  padding: 1.15rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}

.applicationDetailPage__progressHead {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.applicationDetailPage__progressHead div {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.applicationDetailPage__progressHead strong {
  color: #0f172a;
}

.applicationDetailPage__progressHead span,
.applicationDetailPage__progressMeta {
  color: #64748b;
  font-size: 0.85rem;
}

.applicationDetailPage__progressHead b {
  color: #2563eb;
  font-size: 1.65rem;
}

.applicationDetailPage__progressTrack {
  height: 0.75rem;
  border-radius: 999px;
  background: #e2e8f0;
  overflow: hidden;
}

.applicationDetailPage__progressFill {
  height: 100%;
  border-radius: inherit;
  transition: width 0.25s ease;
}

.applicationDetailPage__progressFill--success {
  background: linear-gradient(90deg, #22c55e, #16a34a);
}

.applicationDetailPage__progressFill--warning {
  background: linear-gradient(90deg, #f59e0b, #f97316);
}

.applicationDetailPage__progressFill--danger {
  background: linear-gradient(90deg, #fb7185, #ef4444);
}

.applicationDetailPage__progressMeta {
  justify-content: space-between;
  margin-top: 0.75rem;
}

.applicationDetailPage__tabsWrap {
  position: sticky;
  top: 0;
  z-index: 5;
}

.applicationDetailPage__tabs {
  display: flex;
  gap: 0.25rem;
  overflow-x: auto;
  padding: 0 1.5rem;
  scrollbar-width: thin;
}

.applicationDetailPage__tab {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 0;
  border-bottom: 3px solid transparent;
  background: transparent;
  color: #64748b;
  font-weight: 800;
  padding: 1rem 0.9rem;
  white-space: nowrap;
}

.applicationDetailPage__tab:hover,
.applicationDetailPage__tab--active {
  color: #2563eb;
  background: #eff6ff;
}

.applicationDetailPage__tab--active {
  border-bottom-color: #2563eb;
}

.applicationDetailPage__content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: 1.5rem;
  padding: 1.5rem;
}

.applicationDetailPage__main,
.applicationDetailPage__sectionStack,
.applicationDetailPage__side {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.applicationDetailPage__card,
.applicationDetailPage__workflowCard,
.applicationDetailPage__paymentCard,
.applicationDetailPage__examCard,
.applicationDetailPage__sideCard {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

.applicationDetailPage__cardHead {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 1rem 1.15rem;
  border-bottom: 1px solid #e2e8f0;
  color: #475569;
}

.applicationDetailPage__cardHead h3,
.applicationDetailPage__paymentHead h3,
.applicationDetailPage__workflowHead h3,
.applicationDetailPage__sideCard h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 900;
}

.applicationDetailPage__cardHead--between,
.applicationDetailPage__paymentHead,
.applicationDetailPage__workflowHead {
  justify-content: space-between;
}

.applicationDetailPage__cardHead--between > div,
.applicationDetailPage__paymentHead {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.applicationDetailPage__infoGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
  padding: 1.15rem;
}

.applicationDetailPage__infoItem {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}

.applicationDetailPage__infoItem span,
.applicationDetailPage__workflowHead span,
.applicationDetailPage__muted,
.applicationDetailPage__paymentBody p,
.applicationDetailPage__documentRow span,
.applicationDetailPage__summaryRow span,
.applicationDetailPage__activityItem span,
.applicationDetailPage__activityItem small {
  color: #64748b;
  font-size: 0.85rem;
}

.applicationDetailPage__infoItem strong,
.applicationDetailPage__documentRow strong,
.applicationDetailPage__summaryRow strong,
.applicationDetailPage__activityItem strong {
  color: #0f172a;
  font-size: 0.95rem;
}

.applicationDetailPage__mono {
  font-family: 'Roboto Mono', monospace;
}

.applicationDetailPage__workflowList {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.applicationDetailPage__workflowEmpty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 15rem;
  gap: 0.55rem;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  background: #fff;
  color: #64748b;
  text-align: center;
}

.applicationDetailPage__workflowEmpty :deep(svg) {
  color: #94a3b8;
  font-size: 1.8rem;
}

.applicationDetailPage__workflowEmpty strong {
  color: #0f172a;
}

.applicationDetailPage__workflowCard {
  overflow: hidden;
  border-left: 5px solid #cbd5e1;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.applicationDetailPage__workflowCard:hover {
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.applicationDetailPage__workflowCard.applicationDetailPage__workflowState--completado {
  border-left-color: #10b981;
}

.applicationDetailPage__workflowCard.applicationDetailPage__workflowState--en_curso {
  border-left-color: #3b82f6;
}

.applicationDetailPage__workflowCardHeader {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.applicationDetailPage__workflowCardHeaderMain {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.applicationDetailPage__workflowStatusIcon {
  width: 3rem;
  height: 3rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid #cbd5e1;
  border-radius: 12px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 1.35rem;
}

.applicationDetailPage__workflowStatusIcon.applicationDetailPage__workflowState--completado {
  border-color: #10b981;
  background: #ecfdf5;
  color: #059669;
}

.applicationDetailPage__workflowStatusIcon.applicationDetailPage__workflowState--en_curso {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #2563eb;
}

.applicationDetailPage__workflowTitle {
  min-width: 0;
  flex: 1;
}

.applicationDetailPage__workflowTitle h3 {
  margin: 0 0 0.65rem;
  color: #0f172a;
  font-size: 1.08rem;
  font-weight: 900;
}

.applicationDetailPage__workflowChips {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.applicationDetailPage__workflowTypeChip,
.applicationDetailPage__workflowStateChip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.32rem 0.7rem;
  border-radius: 8px;
  font-size: 0.76rem;
  font-weight: 900;
  line-height: 1;
}

.applicationDetailPage__workflowType--formulario {
  background: #f3e8ff;
  color: #7e22ce;
}

.applicationDetailPage__workflowType--cobro {
  background: #dcfce7;
  color: #15803d;
}

.applicationDetailPage__workflowType--adjunto {
  background: #dbeafe;
  color: #1d4ed8;
}

.applicationDetailPage__workflowType--examen {
  background: #ffedd5;
  color: #c2410c;
}

.applicationDetailPage__workflowType--matricula {
  background: #e0e7ff;
  color: #4338ca;
}

.applicationDetailPage__workflowStateChip.applicationDetailPage__workflowState--completado {
  background: #d1fae5;
  color: #047857;
}

.applicationDetailPage__workflowStateChip.applicationDetailPage__workflowState--en_curso {
  background: #dbeafe;
  color: #1d4ed8;
}

.applicationDetailPage__workflowStateChip.applicationDetailPage__workflowState--pendiente {
  background: #f1f5f9;
  color: #475569;
}

.applicationDetailPage__workflowDetail {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
}

.applicationDetailPage__workflowDetailIcon {
  width: 3.5rem;
  height: 3.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 12px;
  font-size: 1.45rem;
}

.applicationDetailPage__workflowDetailBody {
  min-width: 0;
  flex: 1;
}

.applicationDetailPage__workflowDetailBody h4 {
  margin: 0 0 0.85rem;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 900;
}

.applicationDetailPage__workflowDetailDate,
.applicationDetailPage__formFooter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.85rem;
}

.applicationDetailPage__workflowMessage {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  margin-top: 1rem;
  padding: 1rem;
  border-left: 4px solid #cbd5e1;
  border-radius: 10px;
  background: #f8fafc;
  color: #475569;
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.45;
}

.applicationDetailPage__workflowMessage.applicationDetailPage__workflowState--completado {
  border-left-color: #10b981;
  background: #ecfdf5;
  color: #065f46;
}

.applicationDetailPage__workflowMessage.applicationDetailPage__workflowState--en_curso {
  border-left-color: #3b82f6;
  background: #eff6ff;
  color: #1e40af;
}

.applicationDetailPage__workflowAction {
  margin-top: 1rem;
}

.applicationDetailPage__formStepCard {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  overflow: hidden;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

.applicationDetailPage__formStepMedia {
  min-height: 100%;
  background: #eff6ff;
}

.applicationDetailPage__formStepMedia img {
  width: 100%;
  height: 100%;
  min-height: 220px;
  display: block;
  object-fit: cover;
}

.applicationDetailPage__formStepMedia > div {
  height: 100%;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
  font-size: 3rem;
}

.applicationDetailPage__formStepBody {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
  padding: 1.25rem;
}

.applicationDetailPage__formStepHead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.applicationDetailPage__formStepHead span:first-child,
.applicationDetailPage__formStepMeta span,
.applicationDetailPage__formStepFooter span {
  color: #64748b;
  font-size: 0.82rem;
}

.applicationDetailPage__formStepHead h3 {
  margin: 0.25rem 0 0;
  color: #0f172a;
  font-size: 1.15rem;
  font-weight: 900;
  overflow-wrap: anywhere;
}

.applicationDetailPage__formStepStatus {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  gap: 0.45rem;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 900;
  white-space: nowrap;
}

.applicationDetailPage__formStepStatus--approved {
  background: #d1fae5;
  color: #047857;
}

.applicationDetailPage__formStepStatus--rejected {
  background: #fee2e2;
  color: #b91c1c;
}

.applicationDetailPage__formStepStatus--registered {
  background: #dbeafe;
  color: #1d4ed8;
}

.applicationDetailPage__formStepStatus--pending {
  background: #fef3c7;
  color: #b45309;
}

.applicationDetailPage__formStepBody p {
  margin: 0;
  color: #475569;
  font-size: 0.92rem;
  line-height: 1.45;
}

.applicationDetailPage__formStepMeta {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.applicationDetailPage__formStepMeta span {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.applicationDetailPage__formStepFooter {
  display: grid;
  grid-template-columns: minmax(150px, auto) minmax(96px, max-content);
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.applicationDetailPage__formStepFooter > div {
  display: flex;
  gap: 0.25rem;
}

.applicationDetailPage__formStepFooter strong {
  color: #0f172a;
  font-weight: 900;
}

.applicationDetailPage__formStepAction {
  justify-self: flex-end;
  white-space: nowrap;
}

.applicationDetailPage__formStepApprovalActions {
  display: grid;
  grid-template-columns: repeat(2, 44px);
  align-items: center;
  gap: 0.5rem;
  justify-content: end;
}

.applicationDetailPage__formStepApprovalActions :deep(button) {
  width: 44px;
  min-width: 44px;
  height: 38px;
  justify-content: center;
}

.applicationDetailPage__attachmentsBlock,
.applicationDetailPage__attachmentList {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.applicationDetailPage__attachmentsHead {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.applicationDetailPage__attachmentsHead h4 {
  margin: 0 0 0.25rem;
}

.applicationDetailPage__attachmentsHead span,
.applicationDetailPage__attachmentInfo span,
.applicationDetailPage__attachmentEmpty {
  color: #64748b;
  font-size: 0.9rem;
}

.applicationDetailPage__attachmentEmpty {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 1rem;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  background: #f8fafc;
}

.applicationDetailPage__attachmentItem {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #fde68a;
  border-radius: 12px;
  background: #fff;
}

.applicationDetailPage__attachmentItem--accepted {
  border-color: #a7f3d0;
}

.applicationDetailPage__attachmentItem--rejected {
  border-color: #fecaca;
}

.applicationDetailPage__attachmentIcon {
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #fef3c7;
  color: #d97706;
  font-size: 1.25rem;
}

.applicationDetailPage__attachmentItem--accepted .applicationDetailPage__attachmentIcon {
  background: #d1fae5;
  color: #059669;
}

.applicationDetailPage__attachmentItem--rejected .applicationDetailPage__attachmentIcon {
  background: #fee2e2;
  color: #dc2626;
}

.applicationDetailPage__attachmentInfo {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}

.applicationDetailPage__attachmentInfo strong {
  color: #0f172a;
  font-size: 1rem;
  font-weight: 900;
  overflow-wrap: anywhere;
}

.applicationDetailPage__attachmentInfo span,
.applicationDetailPage__attachmentStatus {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.applicationDetailPage__attachmentStatus {
  justify-self: flex-start;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 900;
  white-space: nowrap;
}

.applicationDetailPage__attachmentStatus--accepted {
  background: #d1fae5;
  color: #047857;
}

.applicationDetailPage__attachmentStatus--pending {
  background: #fef3c7;
  color: #b45309;
}

.applicationDetailPage__attachmentStatus--rejected {
  background: #fee2e2;
  color: #b91c1c;
}

.applicationDetailPage__attachmentAction {
  white-space: nowrap;
}

.applicationDetailPage__chargeDetailsBlock,
.applicationDetailPage__chargeDetailsList,
.applicationDetailPage__chargeDetailItem,
.applicationDetailPage__chargeSection,
.applicationDetailPage__chargeProductList,
.applicationDetailPage__discountList {
  display: flex;
  flex-direction: column;
}

.applicationDetailPage__chargeDetailsBlock,
.applicationDetailPage__chargeDetailsList,
.applicationDetailPage__chargeDetailItem {
  gap: 1rem;
}

.applicationDetailPage__chargeDetailItem {
  padding: 1rem;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  background: #fff;
}

.applicationDetailPage__chargeHeader {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  align-items: center;
  gap: 1rem;
}

.applicationDetailPage__chargeIcon {
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #dcfce7;
  color: #15803d;
  font-size: 1.15rem;
}

.applicationDetailPage__chargeHeader > div:nth-child(2),
.applicationDetailPage__chargeProductItem > div,
.applicationDetailPage__discountItem > div {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
}

.applicationDetailPage__chargeHeader strong,
.applicationDetailPage__chargeTotals strong,
.applicationDetailPage__chargeSection > strong,
.applicationDetailPage__chargeProductItem strong,
.applicationDetailPage__discountItem strong {
  color: #0f172a;
  font-weight: 900;
  overflow-wrap: anywhere;
}

.applicationDetailPage__chargeHeader span,
.applicationDetailPage__chargeTotals span,
.applicationDetailPage__chargeProductItem span,
.applicationDetailPage__discountItem span,
.applicationDetailPage__chargeEmptyRow {
  color: #64748b;
  font-size: 0.82rem;
}

.applicationDetailPage__chargeStatus {
  display: inline-flex;
  align-items: center;
  justify-self: flex-start;
  gap: 0.45rem;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 900;
  white-space: nowrap;
}

.applicationDetailPage__chargeStatus--paid {
  background: #d1fae5;
  color: #047857;
}

.applicationDetailPage__chargeStatus--pending {
  background: #fef3c7;
  color: #b45309;
}

.applicationDetailPage__chargeStatus--cancelled {
  background: #fee2e2;
  color: #b91c1c;
}

.applicationDetailPage__chargeTotals {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.applicationDetailPage__chargeTotals div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.85rem;
  border-radius: 10px;
  background: #f8fafc;
}

.applicationDetailPage__chargeSection {
  gap: 0.75rem;
}

.applicationDetailPage__chargeProductList,
.applicationDetailPage__discountList {
  gap: 0.65rem;
}

.applicationDetailPage__chargeProductItem,
.applicationDetailPage__discountItem {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
}

.applicationDetailPage__discountItem {
  grid-template-columns: minmax(0, 1fr) auto;
  background: #fffbeb;
  border-color: #fde68a;
}

.applicationDetailPage__discountItem b {
  color: #b45309;
  font-size: 0.95rem;
  white-space: nowrap;
}

.applicationDetailPage__chargeEmptyRow {
  padding: 0.85rem;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  background: #f8fafc;
}

.applicationDetailPage__enrolledSubjectsBlock,
.applicationDetailPage__enrolledSubjectsList {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.applicationDetailPage__enrolledSubjectItem {
  display: grid;
  grid-template-columns: 48px minmax(0, 1.15fr) minmax(0, 0.85fr) minmax(0, 0.5fr);
  align-items: center;
  gap: 1rem;
  width: 100%;
  box-sizing: border-box;
  padding: 1rem;
  border: 1px solid #c7d2fe;
  border-radius: 12px;
  background: #fff;
}

.applicationDetailPage__enrolledSubjectIcon {
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #e0e7ff;
  color: #4338ca;
  font-size: 1.15rem;
}

.applicationDetailPage__enrolledSubjectInfo,
.applicationDetailPage__enrolledSubjectMeta {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
}

.applicationDetailPage__enrolledSubjectInfo strong,
.applicationDetailPage__enrolledSubjectMeta strong {
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 900;
  overflow-wrap: anywhere;
}

.applicationDetailPage__enrolledSubjectInfo span,
.applicationDetailPage__enrolledSubjectMeta span {
  color: #64748b;
  font-size: 0.82rem;
}

.applicationDetailPage__enrolledSubjectStatus {
  display: inline-flex;
  align-items: center;
  grid-column: 2 / -1;
  justify-self: flex-end;
  gap: 0.45rem;
  max-width: 100%;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 900;
  white-space: nowrap;
}

.applicationDetailPage__enrolledSubjectStatus--approved {
  background: #d1fae5;
  color: #047857;
}

.applicationDetailPage__enrolledSubjectStatus--pending {
  background: #f1f5f9;
  color: #475569;
}

.applicationDetailPage__examDetailsBlock,
.applicationDetailPage__examDetailsList {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.applicationDetailPage__examDetailItem {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #fed7aa;
  border-radius: 12px;
  background: #fff;
}

.applicationDetailPage__examDetailHeader {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  align-items: center;
  gap: 1rem;
}

.applicationDetailPage__examDetailIcon {
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #ffedd5;
  color: #c2410c;
  font-size: 1.15rem;
}

.applicationDetailPage__examDetailHeader > div:nth-child(2) {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
}

.applicationDetailPage__examDetailHeader strong,
.applicationDetailPage__examDetailGrid strong {
  color: #0f172a;
  font-weight: 900;
  overflow-wrap: anywhere;
}

.applicationDetailPage__examDetailHeader span,
.applicationDetailPage__examDetailGrid span {
  color: #64748b;
  font-size: 0.82rem;
}

.applicationDetailPage__examDetailStatus {
  display: inline-flex;
  align-items: center;
  justify-self: flex-start;
  gap: 0.45rem;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  background: #dcfce7;
  color: #15803d !important;
  font-size: 0.82rem !important;
  font-weight: 900;
  white-space: nowrap;
}

.applicationDetailPage__examDetailGrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.applicationDetailPage__examDetailGrid div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.85rem;
  border-radius: 10px;
  background: #f8fafc;
}

.applicationDetailPage__admissionExamPanel {
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

.applicationDetailPage__admissionExamHead {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  padding: 1.35rem;
  border-bottom: 1px solid #e2e8f0;
}

.applicationDetailPage__admissionExamHead :deep(svg) {
  color: #f97316;
  font-size: 1.25rem;
  margin-top: 0.15rem;
}

.applicationDetailPage__admissionExamHead h3 {
  margin: 0 0 0.4rem;
  color: #0f172a;
  font-size: 1.25rem;
  font-weight: 900;
}

.applicationDetailPage__admissionExamHead span {
  color: #475569;
  font-size: 0.95rem;
}

.applicationDetailPage__admissionExamList {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
}

.applicationDetailPage__admissionExamCard {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, auto);
  align-items: center;
  gap: 2rem;
  padding: 2.35rem;
  border: 2px solid #bfdbfe;
  border-radius: 22px;
  background: #eff6ff;
}

.applicationDetailPage__admissionExamCard--approved {
  border-color: #6ee7b7;
  background: #e8fff3;
}

.applicationDetailPage__admissionExamCard--rejected {
  border-color: #fecaca;
  background: #fff1f2;
}

.applicationDetailPage__admissionExamCard--pending {
  border-color: #fde68a;
  background: #fffbeb;
}

.applicationDetailPage__admissionExamContent {
  min-width: 0;
}

.applicationDetailPage__admissionExamContent h4 {
  margin: 0 0 0.85rem;
  color: #0f172a;
  font-size: 1.55rem;
  font-weight: 900;
  overflow-wrap: anywhere;
}

.applicationDetailPage__admissionExamMeta {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.applicationDetailPage__admissionExamMeta > span,
.applicationDetailPage__admissionExamChip,
.applicationDetailPage__admissionExamResult strong {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.applicationDetailPage__admissionExamMeta > span {
  color: #475569;
  font-size: 0.9rem;
}

.applicationDetailPage__admissionExamChip {
  padding: 0.4rem 0.95rem;
  border-radius: 999px;
  font-size: 0.92rem;
  font-weight: 900;
}

.applicationDetailPage__admissionExamChip--approved {
  background: #d1fae5;
  color: #047857;
}

.applicationDetailPage__admissionExamChip--rejected {
  background: #fee2e2;
  color: #b91c1c;
}

.applicationDetailPage__admissionExamChip--pending {
  background: #fef3c7;
  color: #b45309;
}

.applicationDetailPage__admissionExamScore {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.55rem;
  width: min(100%, 390px);
  margin-top: 1.6rem;
}

.applicationDetailPage__admissionExamScore > span {
  color: #475569;
  font-size: 1rem;
  font-weight: 900;
}

.applicationDetailPage__admissionExamScoreValue {
  display: flex;
  align-items: baseline;
  gap: 0.7rem;
}

.applicationDetailPage__admissionExamScoreValue strong {
  color: #059669;
  font-size: clamp(3rem, 7vw, 4.8rem);
  font-weight: 950;
  line-height: 0.95;
}

.applicationDetailPage__admissionExamCard--rejected .applicationDetailPage__admissionExamScoreValue strong {
  color: #dc2626;
}

.applicationDetailPage__admissionExamCard--pending .applicationDetailPage__admissionExamScoreValue strong {
  color: #d97706;
}

.applicationDetailPage__admissionExamScoreValue small {
  color: #64748b;
  font-size: clamp(1.6rem, 3vw, 2.45rem);
  font-weight: 900;
}

.applicationDetailPage__admissionExamScoreTrack {
  width: 100%;
  height: 0.9rem;
  overflow: hidden;
  border-radius: 999px;
  background: #dbe4f0;
}

.applicationDetailPage__admissionExamScoreTrack span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #10b981;
}

.applicationDetailPage__admissionExamCard--rejected .applicationDetailPage__admissionExamScoreTrack span {
  background: #ef4444;
}

.applicationDetailPage__admissionExamCard--pending .applicationDetailPage__admissionExamScoreTrack span {
  background: #f59e0b;
}

.applicationDetailPage__admissionExamResult {
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  gap: 1.1rem;
}

.applicationDetailPage__admissionExamResult strong {
  justify-content: center;
  min-width: 240px;
  padding: 1.25rem 1.55rem;
  border-radius: 16px;
  background: #2563eb;
  color: #fff;
  font-size: 1.35rem;
  font-weight: 900;
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.18);
}

.applicationDetailPage__admissionExamCard--approved .applicationDetailPage__admissionExamResult strong {
  background: #10b981;
  box-shadow: 0 12px 24px rgba(16, 185, 129, 0.18);
}

.applicationDetailPage__admissionExamCard--rejected .applicationDetailPage__admissionExamResult strong {
  background: #ef4444;
  box-shadow: 0 12px 24px rgba(239, 68, 68, 0.18);
}

.applicationDetailPage__admissionExamCard--pending .applicationDetailPage__admissionExamResult strong {
  background: #f59e0b;
  box-shadow: 0 12px 24px rgba(245, 158, 11, 0.18);
}

.applicationDetailPage__admissionExamAction {
  background: #fff;
}

.applicationDetailPage__paymentConceptCard {
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

.applicationDetailPage__paymentConceptHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.35rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.applicationDetailPage__paymentConceptTitle {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  min-width: 0;
}

.applicationDetailPage__paymentConceptIcon {
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 12px;
  background: #d1fae5;
  color: #059669;
  font-size: 1.2rem;
}

.applicationDetailPage__paymentConceptTitle h3 {
  margin: 0 0 0.35rem;
  color: #0f172a;
  font-size: 1.08rem;
  font-weight: 900;
  overflow-wrap: anywhere;
}

.applicationDetailPage__paymentConceptTitle span {
  display: -webkit-box;
  overflow: hidden;
  color: #475569;
  font-size: 0.86rem;
  line-height: 1.4;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.applicationDetailPage__paymentConceptStatus {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  gap: 0.45rem;
  padding: 0.55rem 0.9rem;
  border-radius: 10px;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 900;
  white-space: nowrap;
}

.applicationDetailPage__paymentConceptStatus--paid {
  background: #10b981;
}

.applicationDetailPage__paymentConceptStatus--pending {
  background: #f59e0b;
}

.applicationDetailPage__paymentConceptStatus--cancelled {
  background: #ef4444;
}

.applicationDetailPage__paymentConceptBody {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 250px;
  gap: 1.25rem;
  padding: 1.35rem;
}

.applicationDetailPage__paymentConceptMain,
.applicationDetailPage__paymentAmountPanel,
.applicationDetailPage__paymentDiscountPanel,
.applicationDetailPage__paymentHistoryPanel,
.applicationDetailPage__paymentActionsPanel,
.applicationDetailPage__paymentDiscountList,
.applicationDetailPage__paymentActionsSummary {
  display: flex;
  flex-direction: column;
}

.applicationDetailPage__paymentConceptMain {
  gap: 1.25rem;
  min-width: 0;
}

.applicationDetailPage__paymentAmountPanel,
.applicationDetailPage__paymentHistoryPanel {
  gap: 1rem;
  padding: 1.15rem;
  border-radius: 12px;
  background: #f8fafc;
}

.applicationDetailPage__paymentDiscountPanel {
  gap: 1rem;
  padding: 1.15rem;
  border: 2px solid #fbbf24;
  border-radius: 12px;
  background: #fffbeb;
}

.applicationDetailPage__paymentSectionTitle {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: #0f172a;
}

.applicationDetailPage__paymentSectionTitle--warning {
  color: #92400e;
}

.applicationDetailPage__paymentAmountGrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
}

.applicationDetailPage__paymentAmountGrid div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.applicationDetailPage__paymentAmountGrid span,
.applicationDetailPage__paymentAmountGrid small,
.applicationDetailPage__paymentDiscountItem span,
.applicationDetailPage__paymentDiscountItem small,
.applicationDetailPage__paymentHistoryItem span,
.applicationDetailPage__paymentHistoryItem small,
.applicationDetailPage__paymentActionsSummary span {
  color: #475569;
  font-size: 0.82rem;
}

.applicationDetailPage__paymentAmountGrid strong {
  color: #0f172a;
  font-size: 1.25rem;
  font-weight: 900;
  overflow-wrap: anywhere;
}

.applicationDetailPage__paymentDiscountEmpty {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  gap: 0.35rem;
  min-height: 8rem;
  padding: 1rem;
  border: 1px dashed #fbbf24;
  border-radius: 10px;
  color: #475569;
  text-align: center;
}

.applicationDetailPage__paymentDiscountEmpty :deep(svg) {
  color: #f59e0b;
  font-size: 2rem;
}

.applicationDetailPage__paymentDiscountEmpty strong {
  color: #475569;
}

.applicationDetailPage__paymentDiscountList {
  gap: 0.75rem;
}

.applicationDetailPage__paymentDiscountItem {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.85rem;
  padding: 1rem;
  border: 1px solid #fcd34d;
  border-radius: 10px;
  background: #fff;
}

.applicationDetailPage__paymentDiscountBadge {
  min-width: 54px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
  padding: 0.7rem;
  border-radius: 10px;
  background: #f97316;
  color: #fff;
  font-weight: 900;
}

.applicationDetailPage__paymentDiscountItem > div:last-child,
.applicationDetailPage__paymentHistoryItem > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.applicationDetailPage__paymentDiscountItem strong,
.applicationDetailPage__paymentHistoryItem strong,
.applicationDetailPage__paymentActionsPanel h4,
.applicationDetailPage__paymentActionsSummary strong {
  color: #0f172a;
  font-weight: 900;
  overflow-wrap: anywhere;
}

.applicationDetailPage__paymentHistoryItem {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 0.85rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
}

.applicationDetailPage__paymentHistoryIcon {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #d1fae5;
  color: #059669;
  font-size: 1.1rem;
}

.applicationDetailPage__paymentActionsPanel {
  gap: 1rem;
  padding: 1.15rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}

.applicationDetailPage__paymentActionsPanel h4 {
  margin: 0;
}

.applicationDetailPage__paymentCompletedBox {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  gap: 0.55rem;
  min-height: 6.5rem;
  padding: 1rem;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  background: #eff6ff;
  color: #1d4ed8;
  text-align: center;
}

.applicationDetailPage__paymentCompletedBox :deep(svg) {
  font-size: 1.8rem;
}

.applicationDetailPage__paymentCompletedBox--paid {
  border-color: #86efac;
  background: #dcfce7;
  color: #047857;
}

.applicationDetailPage__paymentCompletedBox--pending {
  border-color: #fcd34d;
  background: #fef3c7;
  color: #b45309;
}

.applicationDetailPage__paymentCompletedBox--cancelled {
  border-color: #fecaca;
  background: #fee2e2;
  color: #b91c1c;
}

.applicationDetailPage__paymentApprovalActions {
  display: grid;
  grid-template-columns: repeat(4, minmax(42px, 1fr));
  gap: 0.5rem;
}

.applicationDetailPage__paymentApprovalActions :deep(.o-btn) {
  width: 100%;
  min-width: 0;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid #cbd5e1;
  border-radius: 10px !important;
  background: #fff !important;
  color: #334155 !important;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

.applicationDetailPage__paymentApprovalActions :deep(.o-btn:hover:not(:disabled)) {
  border-color: #2563eb;
  background: #eff6ff !important;
  color: #1d4ed8 !important;
}

.applicationDetailPage__paymentApprovalActions :deep(.o-btn:disabled) {
  border-color: #e2e8f0;
  background: #f8fafc !important;
  color: #94a3b8 !important;
  cursor: not-allowed;
  opacity: 1;
}

.applicationDetailPage__paymentApprovalActions :deep(svg) {
  margin: 0;
  font-size: 0.95rem;
}

.applicationDetailPage__paymentActionsSummary {
  gap: 0.65rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.applicationDetailPage__paymentActionsSummary div {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
}

.applicationDetailPage__paymentBody {
  padding: 1.15rem;
}

.applicationDetailPage__muted {
  padding: 1rem 1.15rem 0;
  margin: 0;
}

.applicationDetailPage__formFooter {
  justify-content: space-between;
  padding: 1rem 1.15rem;
}

.applicationDetailPage__paymentCard {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr);
  overflow: hidden;
}

.applicationDetailPage__paymentIcon,
.applicationDetailPage__examIcon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #16a34a;
  background: #dcfce7;
  font-size: 1.4rem;
}

.applicationDetailPage__paymentHead {
  align-items: flex-start;
  margin-bottom: 1rem;
}

.applicationDetailPage__paymentHead > div {
  display: block;
}

.applicationDetailPage__amountRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem;
  border-radius: 10px;
  background: #f8fafc;
  color: #64748b;
}

.applicationDetailPage__amountRow strong {
  color: #0f172a;
  font-size: 1.2rem;
}

.applicationDetailPage__discountBox {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  margin-top: 0.85rem;
  padding: 0.9rem;
  border: 1px solid #fde68a;
  border-radius: 10px;
  background: #fffbeb;
  color: #b45309;
}

.applicationDetailPage__discountBox div {
  display: flex;
  flex-direction: column;
}

.applicationDetailPage__documents {
  display: flex;
  flex-direction: column;
}

.applicationDetailPage__documentRow {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.15rem;
  border-bottom: 1px solid #f1f5f9;
}

.applicationDetailPage__documentRow:last-child {
  border-bottom: 0;
}

.applicationDetailPage__documentRow > div:nth-child(2) {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.applicationDetailPage__documentIcon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fef3c7;
  color: #d97706;
}

.applicationDetailPage__documentIcon--aprobado {
  background: #dcfce7;
  color: #16a34a;
}

.applicationDetailPage__documentIcon--rechazado {
  background: #fee2e2;
  color: #dc2626;
}

.applicationDetailPage__documentDetailsPanel {
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

.applicationDetailPage__documentDetailsHead {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  color: #2563eb;
}

.applicationDetailPage__documentDetailsHead h3 {
  margin: 0 0 0.35rem;
  color: #0f172a;
  font-size: 1.05rem;
  font-weight: 900;
}

.applicationDetailPage__documentDetailsHead span,
.applicationDetailPage__documentDetailsSummary span,
.applicationDetailPage__documentDetailsInfo span {
  color: #475569;
  font-size: 0.9rem;
}

.applicationDetailPage__documentDetailsBody {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1.5rem;
}

.applicationDetailPage__documentDetailsSummary {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1rem;
  border: 1px solid #dbeafe;
  border-radius: 10px;
  background: #f8fafc;
}

.applicationDetailPage__documentDetailsSummary strong {
  color: #0f172a;
  font-size: 0.98rem;
  font-weight: 900;
}

.applicationDetailPage__documentDetailsList {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.applicationDetailPage__documentDetailsItem {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 0.9rem;
  padding: 1rem;
  border: 2px solid #fcd34d;
  border-radius: 12px;
  background: #fff;
}

.applicationDetailPage__documentDetailsItem--accepted {
  border-color: #86efac;
}

.applicationDetailPage__documentDetailsItem--rejected {
  border-color: #fecaca;
}

.applicationDetailPage__documentDetailsIcon {
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #fef3c7;
  color: #d97706;
  font-size: 1.2rem;
}

.applicationDetailPage__documentDetailsItem--accepted .applicationDetailPage__documentDetailsIcon {
  background: #d1fae5;
  color: #059669;
}

.applicationDetailPage__documentDetailsItem--rejected .applicationDetailPage__documentDetailsIcon {
  background: #fee2e2;
  color: #dc2626;
}

.applicationDetailPage__documentDetailsInfo {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}

.applicationDetailPage__documentDetailsInfo strong {
  color: #0f172a;
  font-size: 1rem;
  font-weight: 900;
  overflow-wrap: anywhere;
}

.applicationDetailPage__documentDetailsInfo span,
.applicationDetailPage__documentDetailsStatus,
.applicationDetailPage__documentDetailsRejectedReason strong {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.applicationDetailPage__documentDetailsStatus {
  justify-self: flex-start;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 900;
  white-space: nowrap;
}

.applicationDetailPage__documentDetailsStatus--accepted {
  background: #d1fae5;
  color: #047857;
}

.applicationDetailPage__documentDetailsStatus--pending {
  background: #fef3c7;
  color: #b45309;
}

.applicationDetailPage__documentDetailsStatus--rejected {
  background: #fee2e2;
  color: #b91c1c;
}

.applicationDetailPage__documentDetailsActions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.applicationDetailPage__documentDetailsActions :deep(.o-btn) {
  min-width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.applicationDetailPage__documentDetailsActions :deep(.o-btn--icon) {
  width: 38px;
}

.applicationDetailPage__documentDetailsActions :deep(svg) {
  margin: 0;
}

.applicationDetailPage__documentDetailsValidate {
  min-width: 86px;
  height: 38px;
  font-weight: 900;
}

.applicationDetailPage__documentDetailsRejectedReason {
  grid-column: 2 / -1;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  background: #fef2f2;
  color: #dc2626;
  font-size: 0.85rem;
}

.applicationDetailPage__documentDetailsRejectedReason strong {
  font-weight: 900;
}

.applicationDetailPage__examCard {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.35rem;
  background: linear-gradient(135deg, #eff6ff, #fff);
}

.applicationDetailPage__examCard p,
.applicationDetailPage__examCard h3 {
  margin: 0;
}

.applicationDetailPage__examCard h3 {
  color: #2563eb;
  font-size: 2.25rem;
  font-weight: 900;
}

.applicationDetailPage__examCard span {
  color: #475569;
}

.applicationDetailPage__examIcon {
  width: 70px;
  height: 70px;
  border-radius: 16px;
  color: #2563eb;
  background: #dbeafe;
}

.applicationDetailPage__matriculaState {
  display: flex;
  gap: 1rem;
  margin: 1.15rem;
  padding: 1rem;
  border-radius: 12px;
  background: #f8fafc;
  color: #64748b;
}

.applicationDetailPage__matriculaState--done {
  background: #ecfdf5;
  color: #16a34a;
}

.applicationDetailPage__matriculaState div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.applicationDetailPage__matriculaState strong {
  color: #0f172a;
}

.applicationDetailPage__subjects {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  padding: 0 1.15rem 1.15rem;
}

.applicationDetailPage__subjects div {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.9rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
}

.applicationDetailPage__subjects span,
.applicationDetailPage__subjects small {
  color: #64748b;
  font-size: 0.8rem;
}

.applicationDetailPage__subjects strong {
  color: #0f172a;
}

.applicationDetailPage__sideCard {
  padding: 1rem;
}

.applicationDetailPage__sideCard h3 {
  margin-bottom: 1rem;
}

.applicationDetailPage__summaryRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.applicationDetailPage__summaryRow strong {
  min-width: 0;
  text-align: right;
  overflow-wrap: anywhere;
}

.applicationDetailPage__summaryRow:last-child {
  border-bottom: 0;
}

.applicationDetailPage__activityItem {
  display: grid;
  grid-template-columns: 12px minmax(0, 1fr);
  gap: 0.75rem;
  padding: 0.8rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.applicationDetailPage__activityItem:last-child {
  border-bottom: 0;
}

.applicationDetailPage__activityItem > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.applicationDetailPage__activityDot {
  width: 10px;
  height: 10px;
  margin-top: 0.35rem;
  border-radius: 50%;
  background: #2563eb;
}

.applicationDetailPage__activityDot--pago {
  background: #16a34a;
}

.applicationDetailPage__activityDot--resultado {
  background: #f59e0b;
}

@media (max-width: 1180px) {
  .applicationDetailPage__content {
    grid-template-columns: 1fr;
  }

  .applicationDetailPage__side {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }

  .applicationDetailPage__profile {
    flex-direction: column;
  }

  .applicationDetailPage__actions {
    width: 100%;
    justify-content: flex-start;
  }

  .applicationDetailPage__chargeTotals {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .applicationDetailPage__enrolledSubjectItem {
    grid-template-columns: 48px minmax(0, 1fr);
  }

  .applicationDetailPage__enrolledSubjectMeta {
    grid-column: 2;
  }

  .applicationDetailPage__enrolledSubjectStatus {
    grid-column: 2 / -1;
    grid-row: auto;
  }

  .applicationDetailPage__examDetailGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .applicationDetailPage__admissionExamCard {
    grid-template-columns: 1fr;
  }

  .applicationDetailPage__admissionExamResult {
    align-items: flex-start;
  }

  .applicationDetailPage__paymentConceptBody {
    grid-template-columns: 1fr;
  }

  .applicationDetailPage__paymentActionsPanel {
    max-width: none;
  }

  .applicationDetailPage__formStepCard {
    grid-template-columns: 200px minmax(0, 1fr);
  }
}

@media (max-width: 768px) {
  .applicationDetailPage {
    margin: -0.75rem;
  }

  .applicationDetailPage__headerInner,
  .applicationDetailPage__content {
    padding: 1rem;
  }

  .applicationDetailPage__profile,
  .applicationDetailPage__actions,
  .applicationDetailPage__progressMeta,
  .applicationDetailPage__formFooter,
  .applicationDetailPage__paymentHead {
    align-items: stretch;
    flex-direction: column;
  }

  .applicationDetailPage__actions :deep(button),
  .applicationDetailPage__actions :deep(a) {
    width: 100%;
    justify-content: center;
  }

  .applicationDetailPage__profileMain {
    flex-direction: column;
  }

  .applicationDetailPage__avatar {
    width: 64px;
    height: 64px;
    font-size: 1.35rem;
  }

  .applicationDetailPage__progressHead,
  .applicationDetailPage__attachmentsHead,
  .applicationDetailPage__amountRow,
  .applicationDetailPage__summaryRow {
    align-items: flex-start;
    flex-direction: column;
  }

  .applicationDetailPage__summaryRow strong {
    text-align: left;
  }

  .applicationDetailPage__progressMeta {
    gap: 0.35rem;
  }

  .applicationDetailPage__workflowCardHeader,
  .applicationDetailPage__workflowDetail {
    padding: 1rem;
  }

  .applicationDetailPage__workflowCardHeaderMain,
  .applicationDetailPage__workflowDetail {
    flex-direction: column;
  }

  .applicationDetailPage__profileInfo h2 {
    font-size: 1.45rem;
  }

  .applicationDetailPage__tabs {
    padding: 0 1rem;
  }

  .applicationDetailPage__tab {
    padding: 0.85rem 0.75rem;
    font-size: 0.85rem;
  }

  .applicationDetailPage__content {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .applicationDetailPage__infoGrid,
  .applicationDetailPage__subjects {
    grid-template-columns: 1fr;
  }

  .applicationDetailPage__side {
    display: flex;
  }

  .applicationDetailPage__workflowEmpty {
    min-height: 12rem;
    padding: 1rem;
  }

  .applicationDetailPage__documentRow {
    grid-template-columns: 44px minmax(0, 1fr);
  }

  .applicationDetailPage__documentDetailsHead,
  .applicationDetailPage__documentDetailsBody {
    padding: 1rem;
  }

  .applicationDetailPage__documentDetailsItem {
    grid-template-columns: 48px minmax(0, 1fr);
  }

  .applicationDetailPage__documentDetailsStatus,
  .applicationDetailPage__documentDetailsActions,
  .applicationDetailPage__documentDetailsRejectedReason {
    grid-column: 2 / -1;
    justify-self: flex-start;
  }

  .applicationDetailPage__documentDetailsActions {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .applicationDetailPage__attachmentItem {
    grid-template-columns: 48px minmax(0, 1fr);
  }

  .applicationDetailPage__attachmentStatus,
  .applicationDetailPage__attachmentAction {
    grid-column: 2;
    justify-self: flex-start;
  }

  .applicationDetailPage__chargeHeader {
    grid-template-columns: 48px minmax(0, 1fr);
  }

  .applicationDetailPage__chargeStatus {
    grid-column: 2;
    justify-self: flex-start;
  }

  .applicationDetailPage__chargeProductItem,
  .applicationDetailPage__discountItem {
    grid-template-columns: 1fr;
  }

  .applicationDetailPage__chargeProductItem > span,
  .applicationDetailPage__chargeProductItem > strong,
  .applicationDetailPage__discountItem b {
    grid-column: 1;
    justify-self: flex-start;
  }

  .applicationDetailPage__chargeTotals {
    grid-template-columns: 1fr;
  }

  .applicationDetailPage__enrolledSubjectItem {
    grid-template-columns: 48px minmax(0, 1fr);
  }

  .applicationDetailPage__enrolledSubjectMeta,
  .applicationDetailPage__enrolledSubjectStatus {
    grid-column: 2 / -1;
    justify-self: flex-start;
  }

  .applicationDetailPage__enrolledSubjectStatus {
    grid-row: auto;
  }

  .applicationDetailPage__examDetailHeader {
    grid-template-columns: 48px minmax(0, 1fr);
  }

  .applicationDetailPage__examDetailStatus {
    grid-column: 2;
    justify-self: flex-start;
  }

  .applicationDetailPage__examDetailGrid {
    grid-template-columns: 1fr;
  }

  .applicationDetailPage__admissionExamHead,
  .applicationDetailPage__admissionExamList {
    padding: 1rem;
  }

  .applicationDetailPage__admissionExamCard {
    padding: 1rem;
  }

  .applicationDetailPage__admissionExamResult strong,
  .applicationDetailPage__admissionExamAction {
    width: 100%;
  }

  .applicationDetailPage__paymentConceptHead {
    align-items: flex-start;
    flex-direction: column;
  }

  .applicationDetailPage__paymentConceptBody,
  .applicationDetailPage__paymentConceptHead,
  .applicationDetailPage__paymentAmountPanel,
  .applicationDetailPage__paymentDiscountPanel,
  .applicationDetailPage__paymentHistoryPanel,
  .applicationDetailPage__paymentActionsPanel {
    padding: 1rem;
  }

  .applicationDetailPage__paymentAmountGrid {
    grid-template-columns: 1fr;
  }

  .applicationDetailPage__paymentActionsSummary div {
    align-items: flex-start;
    flex-direction: column;
  }

  .applicationDetailPage__paymentApprovalActions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .applicationDetailPage__formStepCard {
    grid-template-columns: 1fr;
  }

  .applicationDetailPage__formStepMedia img,
  .applicationDetailPage__formStepMedia > div {
    min-height: 180px;
  }

  .applicationDetailPage__formStepHead {
    align-items: flex-start;
    flex-direction: column;
  }

  .applicationDetailPage__formStepFooter {
    align-items: stretch;
    grid-template-columns: 1fr;
    justify-content: stretch;
  }

  .applicationDetailPage__formStepAction {
    width: 100%;
    justify-self: stretch;
  }

  .applicationDetailPage__formStepApprovalActions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    justify-content: stretch;
  }

  .applicationDetailPage__formStepApprovalActions :deep(button) {
    width: 100%;
    min-width: 0;
    justify-content: center;
  }

  .applicationDetailPage__documentRow :deep(.badge),
  .applicationDetailPage__documentRow > :last-child {
    grid-column: 2;
    justify-self: flex-start;
  }
}

@media (max-width: 480px) {
  .applicationDetailPage {
    margin: -0.5rem;
  }

  .applicationDetailPage__headerInner,
  .applicationDetailPage__content {
    padding: 0.75rem;
  }

  .applicationDetailPage__profileInfo h2 {
    font-size: 1.25rem;
  }

  .applicationDetailPage__progressPanel,
  .applicationDetailPage__card,
  .applicationDetailPage__workflowCard,
  .applicationDetailPage__formStepCard,
  .applicationDetailPage__paymentCard,
  .applicationDetailPage__examCard,
  .applicationDetailPage__sideCard {
    border-radius: 10px;
  }

  .applicationDetailPage__progressHead b {
    font-size: 1.35rem;
  }

  .applicationDetailPage__workflowCardHeaderMain {
    gap: 0.75rem;
  }

  .applicationDetailPage__workflowStatusIcon {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.05rem;
  }

  .applicationDetailPage__workflowDetailIcon {
    width: 3rem;
    height: 3rem;
    font-size: 1.2rem;
  }

  .applicationDetailPage__attachmentItem,
  .applicationDetailPage__chargeDetailItem,
  .applicationDetailPage__enrolledSubjectItem,
  .applicationDetailPage__examDetailItem,
  .applicationDetailPage__admissionExamCard {
    gap: 0.75rem;
    padding: 0.75rem;
  }

  .applicationDetailPage__attachmentIcon,
  .applicationDetailPage__documentDetailsIcon,
  .applicationDetailPage__chargeIcon,
  .applicationDetailPage__enrolledSubjectIcon,
  .applicationDetailPage__examDetailIcon {
    width: 42px;
    height: 42px;
  }

  .applicationDetailPage__attachmentItem,
  .applicationDetailPage__documentDetailsItem,
  .applicationDetailPage__chargeHeader,
  .applicationDetailPage__enrolledSubjectItem,
  .applicationDetailPage__examDetailHeader {
    grid-template-columns: 42px minmax(0, 1fr);
  }

  .applicationDetailPage__documentDetailsActions :deep(.o-btn),
  .applicationDetailPage__documentDetailsActions :deep(.o-btn--icon) {
    width: 40px;
    min-width: 40px;
    height: 40px;
  }

  .applicationDetailPage__documentDetailsValidate {
    width: auto;
    min-width: 84px;
  }

  .applicationDetailPage__chargeTotals div,
  .applicationDetailPage__examDetailGrid div,
  .applicationDetailPage__chargeProductItem,
  .applicationDetailPage__discountItem,
  .applicationDetailPage__paymentHistoryItem,
  .applicationDetailPage__paymentDiscountItem {
    padding: 0.75rem;
  }

  .applicationDetailPage__workflowTypeChip,
  .applicationDetailPage__workflowStateChip,
  .applicationDetailPage__admissionExamChip {
    max-width: 100%;
    white-space: normal;
    line-height: 1.2;
  }

  .applicationDetailPage__admissionExamContent h4 {
    font-size: 1.1rem;
  }

  .applicationDetailPage__admissionExamResult strong {
    min-width: 0;
    padding: 0.85rem 1rem;
  }

  .applicationDetailPage__paymentConceptTitle {
    gap: 0.75rem;
  }

  .applicationDetailPage__paymentConceptIcon {
    width: 42px;
    height: 42px;
  }

  .applicationDetailPage__paymentConceptTitle h3 {
    font-size: 1rem;
  }

  .applicationDetailPage__paymentDiscountItem {
    grid-template-columns: 1fr;
  }

  .applicationDetailPage__paymentDiscountBadge {
    justify-content: flex-start;
    width: max-content;
  }

  .applicationDetailPage__paymentApprovalActions {
    gap: 0.5rem;
  }

  .applicationDetailPage__paymentApprovalActions :deep(button),
  .applicationDetailPage__paymentApprovalActions :deep(a) {
    height: 40px;
    border-radius: 9px;
  }

  .applicationDetailPage__formStepBody {
    padding: 1rem;
  }

  .applicationDetailPage__formStepMedia img,
  .applicationDetailPage__formStepMedia > div {
    min-height: 150px;
  }

  .applicationDetailPage__formStepMeta {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
