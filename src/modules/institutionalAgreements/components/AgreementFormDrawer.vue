<template>
  <AppDrawer :isVisible="isVisible" @update:isVisible="updateVisibility" size="xl">
    <!-- HEAD -->
    <template #head>
      <div class="drawerHead">
        <div class="drawerHead__icon">
          <AppIcon icon="handshake" />
        </div>
        <div class="drawerHead__info">
          <span class="drawerHead__title">
            {{ isEdit ? 'Editar Convenio Institucional' : 'Crear Convenio Institucional' }}
          </span>
          <span class="drawerHead__subtitle">
            {{ isEdit ? 'Modifique la información del convenio institucional.' : 'Complete la información del convenio que ofrecerá la institución.' }}
          </span>
        </div>
      </div>
    </template>

    <!-- BODY -->
    <template #body>
      <div class="drawerBody">
        <div v-if="loadingSelects" class="d-flex justify-content-center py-4">
          <span class="small text-muted">Cargando opciones...</span>
        </div>
        <AppAccordion v-else styleType="rounded" v-slot="{ accordionId }">
          <!-- SECCIÓN 1 — Tipo de convenio -->
          <AppAccordionItem :accordionId="accordionId" :initOpen="true" class="sectionItem">
            <template #head>
              <div class="sectionHead">
                <div class="sectionHead__icon sectionHead__icon--blue">
                  <AppIcon icon="handshake" />
                </div>
                <div class="sectionHead__text">
                  <span class="sectionHead__title">Tipo de convenio</span>
                  <span class="sectionHead__subtitle">Seleccione el tipo de convenio que desea crear</span>
                </div>
              </div>
            </template>
            <template #content>
              <div class="sectionContent">
                <div class="row g-3">
                  <div class="col-12">
                    <AppFormField :form-control="v$.form.agreementsTypesId" label="Tipo de convenio">
                      <select class="form-select" v-model.number="v$.form.agreementsTypesId.$model">
                        <option :value="undefined">Seleccione un tipo...</option>
                        <option v-for="tipo in agreementTypes" :key="tipo.id" :value="tipo.id">
                          {{ tipo.name }}
                        </option>
                      </select>
                    </AppFormField>
                  </div>
                  <div class="col-12">
                    <AppFormField label="Tipos de beneficiarios">
                      <AppAutocomplete input-id="roleIds" :options="beneficiaryTypes" label="name" :reduce="(b: any) => b.id" :multiple="true" v-model="form.roleIds" />
                    </AppFormField>
                  </div>
                </div>
              </div>
            </template>
          </AppAccordionItem>

          <!-- SECCIÓN 2 — Información general -->
          <AppAccordionItem :accordionId="accordionId" :initOpen="true" class="sectionItem">
            <template #head>
              <div class="sectionHead">
                <div class="sectionHead__icon sectionHead__icon--green">
                  <AppIcon icon="info-circle" />
                </div>
                <div class="sectionHead__text">
                  <span class="sectionHead__title">Información General</span>
                  <span class="sectionHead__subtitle">Datos básicos del convenio institucional</span>
                </div>
              </div>
            </template>
            <template #content>
              <div class="sectionContent">
                <!-- Hint: select agreement type first -->
                <div v-if="!form.agreementsTypesId" class="typeHint">
                  <AppIcon icon="info-circle" class="typeHint__icon" />
                  <span>Seleccione primero un tipo de convenio para ver los campos disponibles.</span>
                </div>

                <!-- Loading type config -->
                <div v-else-if="loadingTypeConfig" class="typeHint">
                  <span class="small text-muted">Cargando configuración del tipo...</span>
                </div>

                <div v-else class="row g-3">
                  <!-- Código (siempre visible) -->
                  <div class="col-md-6">
                    <AppFormField :form-control="v$.form.code" label="Código del convenio *">
                      <input class="form-control" v-model="v$.form.code.$model" placeholder="AG001" />
                    </AppFormField>
                  </div>
                  <!-- Nombre (siempre visible) -->
                  <div class="col-md-6">
                    <AppFormField :form-control="v$.form.name" label="Nombre del convenio *">
                      <input class="form-control" v-model="v$.form.name.$model" placeholder="Ej: Acuerdo de intercambio" />
                    </AppFormField>
                  </div>
                  <!-- Institución aliada -->
                  <div class="col-md-6" v-show="showField('Institución aliada')">
                    <AppFormField :form-control="v$.form.institutionPartner" :label="'Institución aliada' + (isFieldRequired('Institución aliada') ? ' *' : '')">
                      <input class="form-control" v-model="v$.form.institutionPartner.$model" placeholder="Universidad XYZ" />
                    </AppFormField>
                  </div>
                  <!-- País -->
                  <div class="col-md-6" v-show="showField('País')">
                    <AppFormField :form-control="v$.form.countryId" :label="'País' + (isFieldRequired('País') ? ' *' : '')">
                      <AppAutocomplete input-id="countryId" :options="countries" label="name" :reduce="(c: any) => c.id" v-model="v$.form.countryId.$model" @update:model-value="onCountryChange" />
                    </AppFormField>
                  </div>
                  <!-- Ciudad: Región + Municipio -->
                  <div class="col-md-6" v-show="showField('Ciudad')">
                    <AppFormField label="Departamento / Región">
                      <AppAutocomplete
                        input-id="regionId"
                        :options="regions"
                        label="name"
                        :reduce="(r: any) => r.id"
                        v-model="selectedRegionId"
                        :disabled="!form.countryId || loadingRegions"
                        @update:model-value="onRegionChange"
                      />
                    </AppFormField>
                  </div>
                  <div class="col-md-6" v-show="showField('Ciudad')">
                    <AppFormField :form-control="v$.form.municipalityId" :label="'Municipio' + (isFieldRequired('Ciudad') ? ' *' : '')">
                      <AppAutocomplete
                        input-id="municipalityId"
                        :options="municipalities"
                        label="name"
                        :reduce="(m: any) => m.id"
                        v-model="form.municipalityId"
                        :disabled="!selectedRegionId || loadingMunicipalities"
                      />
                    </AppFormField>
                  </div>
                  <!-- Alcance -->
                  <div class="col-md-6" v-show="showField('Alcance')">
                    <AppFormField :form-control="v$.form.scope" :label="'Alcance' + (isFieldRequired('Alcance') ? ' *' : '')">
                      <input class="form-control" v-model="v$.form.scope.$model" placeholder="Ej: Nacional, Internacional" />
                    </AppFormField>
                  </div>
                  <!-- Descripción pública -->
                  <div class="col-12" v-show="showField('Descripción pública')">
                    <AppFormField :form-control="v$.form.descriptionPublic" :label="'Descripción pública' + (isFieldRequired('Descripción pública') ? ' *' : '')">
                      <textarea class="form-control" v-model="v$.form.descriptionPublic.$model" rows="3" placeholder="Descripción pública del convenio" />
                    </AppFormField>
                  </div>
                  <!-- Observaciones -->
                  <div class="col-12" v-show="showField('Observaciones')">
                    <AppFormField :form-control="v$.form.comments" :label="'Observaciones' + (isFieldRequired('Observaciones') ? ' *' : '')">
                      <textarea class="form-control" v-model="v$.form.comments.$model" rows="2" placeholder="Notas del convenio..." />
                    </AppFormField>
                  </div>
                </div>
              </div>
            </template>
          </AppAccordionItem>

          <!-- SECCIÓN 3 — Alcance Académico -->
          <AppAccordionItem
            v-show="hasSectionFields('Facultades habilitadas', 'Programas habilitados', 'Semestre mínimo', 'Promedio mínimo')"
            :accordionId="accordionId"
            :initOpen="false"
            class="sectionItem"
          >
            <template #head>
              <div class="sectionHead">
                <div class="sectionHead__icon sectionHead__icon--purple">
                  <AppIcon icon="graduation-cap" />
                </div>
                <div class="sectionHead__text">
                  <span class="sectionHead__title">Alcance Académico</span>
                  <span class="sectionHead__subtitle">Facultad, programa y requisitos académicos</span>
                </div>
              </div>
            </template>
            <template #content>
              <div class="sectionContent">
                <div class="row g-3">
                  <!-- Facultades habilitadas -->
                  <div class="col-12" v-show="showField('Facultades habilitadas') || showField('Programas habilitados')">
                    <AppFormField :label="'Facultad(es)' + (isFieldRequired('Facultades habilitadas') ? ' *' : '')">
                      <AppAutocomplete input-id="facultyIds" :options="faculties" label="name" :reduce="(f: any) => f.id" :multiple="true" v-model="form.facultyIds" />
                      <small v-if="facultyError" class="text-danger d-block mt-1" style="font-size: 0.78rem">Este campo es requerido</small>
                    </AppFormField>
                  </div>
                  <!-- Programas habilitados -->
                  <div class="col-12" v-show="showField('Programas habilitados')">
                    <AppFormField :label="'Programa(s) académico(s)' + (isFieldRequired('Programas habilitados') ? ' *' : '')">
                      <AppAutocomplete
                        input-id="programIds"
                        :options="programs"
                        label="name"
                        :reduce="(p: any) => p.id"
                        :multiple="true"
                        v-model="form.programIds"
                        :disabled="!form.facultyIds.length || isLoadingPrograms"
                      />
                      <small v-if="!form.facultyIds.length && showField('Programas habilitados')" class="text-muted d-block mt-1" style="font-size: 0.78rem">Seleccione primero una facultad</small>
                      <small v-else-if="isLoadingPrograms" class="text-muted d-block mt-1" style="font-size: 0.78rem">Cargando programas...</small>
                      <small v-else-if="programError" class="text-danger d-block mt-1" style="font-size: 0.78rem">Este campo es requerido</small>
                    </AppFormField>
                  </div>
                  <!-- Semestre mínimo -->
                  <div class="col-md-6" v-show="showField('Semestre mínimo')">
                    <AppFormField :form-control="v$.form.minimumSemester" :label="'Semestre mínimo' + (isFieldRequired('Semestre mínimo') ? ' *' : '')">
                      <select class="form-select" v-model.number="v$.form.minimumSemester.$model">
                        <option :value="undefined">Seleccione...</option>
                        <option v-for="n in 10" :key="n" :value="n">{{ n }}° semestre</option>
                      </select>
                    </AppFormField>
                  </div>
                  <!-- Promedio mínimo -->
                  <div class="col-md-6" v-show="showField('Promedio mínimo')">
                    <AppFormField :form-control="v$.form.maximumAverage" :label="'Promedio mínimo requerido' + (isFieldRequired('Promedio mínimo') ? ' *' : '')">
                      <input type="number" class="form-control" v-model.number="v$.form.maximumAverage.$model" placeholder="4.5" step="0.1" min="0" max="5" />
                    </AppFormField>
                  </div>
                </div>
              </div>
            </template>
          </AppAccordionItem>

          <!-- SECCIÓN 4 — Vigencia y Cupos -->
          <AppAccordionItem
            v-show="hasSectionFields('Fecha inicio', 'Fecha fin', 'Cupos máximos', 'Responsable interno', 'Versión del convenio')"
            :accordionId="accordionId"
            :initOpen="false"
            class="sectionItem"
          >
            <template #head>
              <div class="sectionHead">
                <div class="sectionHead__icon sectionHead__icon--orange">
                  <AppIcon icon="calendar-alt" />
                </div>
                <div class="sectionHead__text">
                  <span class="sectionHead__title">Vigencia y Cupos</span>
                  <span class="sectionHead__subtitle">Fechas de vigencia y capacidad del convenio</span>
                </div>
              </div>
            </template>
            <template #content>
              <div class="sectionContent">
                <div class="row g-3">
                  <!-- Fecha inicio -->
                  <div class="col-md-6" v-show="showField('Fecha inicio')">
                    <AppFormField :form-control="v$.form.starDay" :label="'Fecha de inicio' + (isFieldRequired('Fecha inicio') ? ' *' : '')">
                      <input type="date" class="form-control" v-model="v$.form.starDay.$model" />
                    </AppFormField>
                  </div>
                  <!-- Fecha fin -->
                  <div class="col-md-6" v-show="showField('Fecha fin')">
                    <AppFormField :form-control="v$.form.endDate" :label="'Fecha de fin' + (isFieldRequired('Fecha fin') ? ' *' : '')">
                      <input type="date" class="form-control" v-model="v$.form.endDate.$model" />
                    </AppFormField>
                  </div>
                  <!-- Cupos máximos -->
                  <div class="col-md-6" v-show="showField('Cupos máximos')">
                    <AppFormField :form-control="v$.form.maximumCapacity" :label="'Capacidad máxima' + (isFieldRequired('Cupos máximos') ? ' *' : '')">
                      <input type="number" class="form-control" v-model.number="v$.form.maximumCapacity.$model" placeholder="50" min="0" />
                    </AppFormField>
                  </div>
                  <!-- Responsable interno -->
                  <div class="col-md-6" v-show="showField('Responsable interno')">
                    <AppFormField :form-control="v$.form.internalResponsible" :label="'Responsable interno' + (isFieldRequired('Responsable interno') ? ' *' : '')">
                      <input class="form-control" v-model="v$.form.internalResponsible.$model" placeholder="Nombre del responsable" />
                    </AppFormField>
                  </div>
                  <!-- Versión del convenio -->
                  <div class="col-md-6" v-show="showField('Versión del convenio')">
                    <AppFormField :form-control="v$.form.agreementVersion" :label="'Versión del convenio' + (isFieldRequired('Versión del convenio') ? ' *' : '')">
                      <input class="form-control" v-model="v$.form.agreementVersion.$model" placeholder="Ej: v1.0" />
                    </AppFormField>
                  </div>
                </div>
              </div>
            </template>
          </AppAccordionItem>

          <!-- SECCIÓN 5 — Requisitos y Documentos -->
          <AppAccordionItem
            v-show="hasSectionFields('Sección de requisitos', 'Documento principal', 'Documentos anexos', 'Observaciones internas')"
            :accordionId="accordionId"
            :initOpen="false"
            class="sectionItem"
          >
            <template #head>
              <div class="sectionHead">
                <div class="sectionHead__icon sectionHead__icon--teal">
                  <AppIcon icon="file-alt" />
                </div>
                <div class="sectionHead__text">
                  <span class="sectionHead__title">Requisitos y Documentos</span>
                  <span class="sectionHead__subtitle">Condiciones y documentos requeridos para la postulación</span>
                </div>
              </div>
            </template>
            <template #content>
              <div class="sectionContent">
                <!-- Condiciones adicionales -->
                <div v-show="showField('Sección de requisitos')" class="mb-3">
                  <label class="fieldLabel mb-2">Condiciones adicionales{{ isFieldRequired('Sección de requisitos') ? ' *' : '' }}</label>
                  <div class="conditionsList">
                    <div class="conditionItem">
                      <div class="form-check form-switch mb-0">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          role="switch"
                          :checked="form.requiresEnrollment === 1"
                          @change="form.requiresEnrollment = ($event.target as HTMLInputElement).checked ? 1 : 0"
                        />
                      </div>
                      <span class="conditionItem__label">Debe estar matriculado en el periodo actual</span>
                    </div>
                    <div class="conditionItem">
                      <div class="form-check form-switch mb-0">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          role="switch"
                          :checked="form.requiresNoBlocks === 1"
                          @change="form.requiresNoBlocks = ($event.target as HTMLInputElement).checked ? 1 : 0"
                        />
                      </div>
                      <span class="conditionItem__label">No tener bloqueos administrativos</span>
                    </div>
                  </div>
                  <small v-if="requirementsError" class="text-danger d-block mt-1">Debe activar al menos una condición obligatoria</small>
                </div>

                <!-- Documentos requeridos -->
                <div v-show="showField('Documento principal') || showField('Documentos anexos')">
                  <div v-if="loadingDocuments" class="docEmpty">
                    <span class="small text-muted">Cargando documentos...</span>
                  </div>
                  <template v-else>
                    <div class="docList" v-if="documents.length > 0">
                      <div v-for="(doc, idx) in documents" :key="doc.id ?? idx" class="docRow">
                        <template v-if="editingDocIdx !== idx">
                          <div class="docRow__icon">
                            <AppIcon icon="file-alt" />
                          </div>
                          <span class="docRow__name">{{ doc.name }}</span>
                          <span class="docRow__badge" :class="doc.required === 1 || doc.required === true ? 'docRow__badge--required' : 'docRow__badge--optional'">
                            {{ doc.required === 1 || doc.required === true ? 'Obligatorio' : 'Opcional' }}
                          </span>
                          <div class="docRow__actions">
                            <AppButton outlined icon="pencil-alt" v-tooltip="'Editar'" @click="startEditDocument(idx)" />
                            <AppButton outlined icon="trash" class="btnDoc--danger" v-tooltip="'Eliminar'" @click="removeDocument(idx)" />
                          </div>
                        </template>
                        <template v-else>
                          <div class="docRow__editForm">
                            <AppInput v-model="editingDocName" placeholder="Nombre del documento" class="docRow__editInput" />
                            <div class="docRow__editRequired">
                              <span class="docRow__editRequiredLabel">Obligatorio</span>
                              <div class="form-check form-switch mb-0">
                                <input
                                  class="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  :checked="doc.required === 1 || doc.required === true"
                                  @change="onDocumentRequiredChange(idx, ($event.target as HTMLInputElement).checked ? 1 : 0)"
                                />
                              </div>
                            </div>
                            <div class="docRow__editActions">
                              <AppButton variant="primary" icon="check" v-tooltip="'Guardar'" @click="saveEditDocument(idx)" />
                              <AppButton outlined icon="times" v-tooltip="'Cancelar'" @click="cancelEditDocument" />
                            </div>
                          </div>
                        </template>
                      </div>
                    </div>
                    <div v-else class="docEmpty">
                      <div class="docEmpty__icon">
                        <AppIcon icon="paperclip" />
                      </div>
                      <span class="docEmpty__text">No hay documentos configurados para este tipo de convenio</span>
                    </div>
                  </template>
                </div>

                <!-- Documento principal -->
                <div v-show="showField('Documento principal')" class="mt-3">
                  <label class="fieldLabel mb-1"> Documento principal{{ isFieldRequired('Documento principal') ? ' *' : '' }} </label>
                  <div v-if="documentMainExisting && !documentMainFile" class="fileExisting mb-1">
                    <AppIcon icon="file-pdf" class="fileExisting__icon" />
                    <a :href="documentMainExisting" target="_blank" rel="noopener noreferrer" class="fileExisting__name">
                      {{ documentMainExisting.split('/').pop() || documentMainExisting }}
                    </a>
                  </div>
                  <input type="file" class="form-control" accept=".pdf,.doc,.docx" @change="onDocumentMainChange" />
                </div>

                <!-- Documentos anexos -->
                <div v-show="showField('Documentos anexos')" class="mt-3">
                  <label class="fieldLabel mb-1"> Documento anexo{{ isFieldRequired('Documentos anexos') ? ' *' : '' }} </label>
                  <div v-if="documentAnexedExisting && !documentAnexedFile" class="fileExisting mb-1">
                    <AppIcon icon="file-pdf" class="fileExisting__icon" />
                    <a :href="documentAnexedExisting" target="_blank" rel="noopener noreferrer" class="fileExisting__name">
                      {{ documentAnexedExisting.split('/').pop() || documentAnexedExisting }}
                    </a>
                  </div>
                  <input type="file" class="form-control" accept=".pdf,.doc,.docx" @change="onDocumentAnexedChange" />
                </div>
              </div>
            </template>
          </AppAccordionItem>
        </AppAccordion>
      </div>
    </template>

    <!-- FOOTER -->
    <template #footer>
      <div class="drawerFooter">
        <AppButton outlined @click="updateVisibility(false)"> Cancelar </AppButton>
        <div v-if="!isEdit" class="d-flex gap-2">
          <AppButton outlined :loading-general="false" @click="saveAsDraft">
            <AppIcon icon="save" />
            Guardar Borrador
          </AppButton>
          <AppButton variant="primary" :loading-general="false" @click="publish">
            <AppIcon icon="check-circle" />
            Publicar Convenio
          </AppButton>
        </div>
        <div v-else class="d-flex gap-2">
          <AppButton outlined :loading-general="false" @click="saveChanges">
            <AppIcon icon="save" />
            Guardar Cambios
          </AppButton>
          <AppButton v-if="agreementData?.agreementStatus === 'Borrador'" variant="primary" :loading-general="false" @click="publishChanges">
            <AppIcon icon="check-circle" />
            Publicar Convenio
          </AppButton>
        </div>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, PropType, reactive, ref, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, requiredIf } from '../../../shared/plugins/vuelidate.plugin';
import { useToast } from 'vue-toast-notification';

import AppDrawer from '../../../shared/components/AppDrawer.vue';
import AppAccordion from '../../../shared/components/Accordion/AppAccordion.vue';
import AppAccordionItem from '../../../shared/components/Accordion/AppAccordionItem.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import AppInput from '../../../shared/components/Forms/AppInput.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import { InstitutionalAgreementDto, CreateOrUpdateInstitutionalAgreementDto, UpdateInstitutionalAgreementDetailDto } from '../dtos/institutionalAgreement.dto';
import { GetAgreementTypesService } from '../services/getAgreementTypes.service';
import { GetAgreementTypeByIdService } from '../services/getAgreementTypeById.service';
import { CreateOrUpdateInstitutionalAgreementService } from '../services/createOrUpdateInstitutionalAgreement.service';
import { UpdateInstitutionalAgreementDetailService } from '../services/updateInstitutionalAgreementDetail.service';
import { FindAllCountriesForSelectService } from '../../../shared/services/findAllCountriesForSelect.service';
import { FindAllRegionsForSelectService } from '../../../shared/services/findAllRegionsForSelect.service';
import { FindAllMunicipalitiesForSelectService } from '../../../shared/services/findAllMunicipalitiesForSelect.service';
import { GetProgramsService } from '../../institutionalConfiguration/services/getPrograms.service';
import { GetRoleRelatedDataFormService } from '../../access/services/getRoleRelateDataForm.service';
import { GetAgreementsInstitutionalDocumentsService } from '../services/getAgreementsInstitutionalDocuments.service';
import { CreateOrUpdateAgreementInstitutionalDocumentService } from '../services/createOrUpdateAgreementInstitutionalDocument.service';
import { DeleteAgreementInstitutionalDocumentService } from '../services/deleteAgreementInstitutionalDocument.service';
import { UploadAgreementDocumentsService } from '../services/uploadAgreementDocuments.service';
import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

const getAgreementTypesService = new GetAgreementTypesService();
const getAgreementTypeByIdService = new GetAgreementTypeByIdService();
const createOrUpdateInstitutionalAgreementService = new CreateOrUpdateInstitutionalAgreementService();
const updateInstitutionalAgreementDetailService = new UpdateInstitutionalAgreementDetailService();
const findAllCountriesForSelectService = new FindAllCountriesForSelectService();
const findAllRegionsForSelectService = new FindAllRegionsForSelectService();
const findAllMunicipalitiesForSelectService = new FindAllMunicipalitiesForSelectService();
const getProgramsService = new GetProgramsService();
const getRoleRelatedDataFormService = new GetRoleRelatedDataFormService();
const getAgreementsInstitutionalDocumentsService = new GetAgreementsInstitutionalDocumentsService();
const createOrUpdateAgreementInstitutionalDocumentService = new CreateOrUpdateAgreementInstitutionalDocumentService();
const deleteAgreementInstitutionalDocumentService = new DeleteAgreementInstitutionalDocumentService();
const uploadAgreementDocumentsService = new UploadAgreementDocumentsService();

interface SelectOption {
  id: number;
  name: string;
}

interface DocumentItem {
  id?: number;
  name: string;
  required: number | boolean;
}

const buildEmptyForm = () => ({
  agreementsTypesId: undefined as number | undefined,
  code: '',
  name: '',
  institutionPartner: '',
  scope: '',
  countryId: undefined as number | undefined,
  municipalityId: undefined as number | undefined,
  starDay: '',
  endDate: '',
  facultyIds: [] as number[],
  programIds: [] as number[],
  roleIds: [] as number[],
  maximumAverage: undefined as number | undefined,
  minimumSemester: undefined as number | undefined,
  maximumSemester: undefined as number | undefined,
  requiresEnrollment: 0 as number,
  requiresNoDisciplinary: 0 as number,
  requiresNoBlocks: 0 as number,
  descriptionPublic: '',
  comments: '',
  maximumCapacity: undefined as number | undefined,
  internalResponsible: '',
  agreementVersion: '',
});

export default defineComponent({
  name: 'AgreementFormDrawer',
  components: {
    AppDrawer,
    AppAccordion,
    AppAccordionItem,
    AppButton,
    AppIcon,
    AppInput,
    AppFormField,
    AppAutocomplete,
  },
  props: {
    isVisible: { type: Boolean, required: true },
    agreementData: {
      type: Object as PropType<InstitutionalAgreementDto | null>,
      default: null,
    },
  },
  emits: ['update:isVisible', 'save'],
  setup(props, { emit }) {
    const $toast = useToast();
    const form = reactive(buildEmptyForm());
    const documents = ref<DocumentItem[]>([]);
    const loadingDocuments = ref(false);
    const editingDocIdx = ref<number | null>(null);
    const editingDocName = ref('');
    const isPopulating = ref(false);

    const documentMainFile = ref<File | null>(null);
    const documentAnexedFile = ref<File | null>(null);
    const documentMainExisting = ref<string | null>(null);
    const documentAnexedExisting = ref<string | null>(null);

    // Select lists
    const loadingSelects = ref(false);
    const selectsLoaded = ref(false);
    const agreementTypes = ref<SelectOption[]>([]);
    const countries = ref<SelectOption[]>([]);
    const faculties = ref<SelectOption[]>([]);
    const programOptions = ref<SelectOption[]>([]);
    const isLoadingPrograms = ref(false);
    const beneficiaryTypes = ref<SelectOption[]>([]);
    let _programLoadToken = 0;

    const programs = computed(() => programOptions.value);

    const loadProgramsForFaculties = async (facultyIds: number[]) => {
      const token = ++_programLoadToken;
      isLoadingPrograms.value = true;
      try {
        if (!facultyIds.length) {
          programOptions.value = [];
          form.programIds = [];
          return;
        }
        const results = await Promise.all(facultyIds.map((id) => getProgramsService.run({ facultyId: id, page: 1, perPage: 200 })));
        if (token !== _programLoadToken) return;
        const merged = new Map<number, SelectOption>();
        results.forEach((res) => {
          const list: any[] = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
          list.forEach((p: any) => merged.set(p.id, { id: p.id, name: p.name }));
        });
        programOptions.value = Array.from(merged.values());
        if (form.programIds.length) {
          const validIds = new Set(programOptions.value.map((p) => p.id));
          form.programIds = form.programIds.filter((id) => validIds.has(id));
        }
      } catch {
        if (token === _programLoadToken) programOptions.value = [];
      } finally {
        if (token === _programLoadToken) isLoadingPrograms.value = false;
      }
    };

    // Geographic cascade state
    const selectedRegionId = ref<number | undefined>(undefined);
    const regions = ref<SelectOption[]>([]);
    const municipalities = ref<SelectOption[]>([]);
    const loadingRegions = ref(false);
    const loadingMunicipalities = ref(false);

    const isEdit = computed(() => props.agreementData !== null);

    // ── Agreement type field configuration ───────────────────────────────
    const typeConfig = ref<any>(null);
    const loadingTypeConfig = ref(false);

    // Map of fieldName (lowercase) -> { visible, required } built from the loaded type config
    const fieldConfigMap = computed(() => {
      const map = new Map<string, { visible: boolean; required: boolean }>();
      if (typeConfig.value?.sections && Array.isArray(typeConfig.value.sections)) {
        for (const section of typeConfig.value.sections) {
          if (section.fields && Array.isArray(section.fields)) {
            for (const field of section.fields) {
              if (field.name) {
                const key = field.name.toLowerCase().trim();
                const isVisible = field.visible === 1 || field.visible === true;
                const isRequired = field.required === 1 || field.required === true;
                const existing = map.get(key);
                // Si hay duplicados, conservar el que tiene visible=true
                if (!existing || isVisible) {
                  map.set(key, { visible: isVisible, required: isRequired });
                }
              }
            }
          }
        }
      }
      return map;
    });

    /** Returns true when the field is configured as visible for the selected type (matched by name) */
    const showField = (fieldName: string): boolean => {
      if (!fieldConfigMap.value || fieldConfigMap.value.size === 0) return false;
      const config = fieldConfigMap.value.get(fieldName.toLowerCase().trim());
      return config?.visible ?? false;
    };

    /** Returns true when at least one of the given field names is visible */
    const hasSectionFields = (...fieldNames: string[]): boolean => {
      if (!fieldConfigMap.value || fieldConfigMap.value.size === 0) return false;
      return fieldNames.some((n) => showField(n));
    };

    const isFieldRequired = (fieldName: string): boolean => {
      const config = fieldConfigMap.value.get(fieldName.toLowerCase().trim());
      return config?.required ?? false;
    };

    const rules = computed(() => {
      // Evaluar aquí (no en lambdas) para que Vue rastree fieldConfigMap como dependencia
      // y recalcule las reglas cuando cargue el typeConfig
      const reqInstitutionPartner = isFieldRequired('Institución aliada');
      const reqScope = isFieldRequired('Alcance');
      const reqCountry = isFieldRequired('País');
      const reqCity = isFieldRequired('Ciudad');
      const reqStartDay = isFieldRequired('Fecha inicio');
      const reqEndDate = isFieldRequired('Fecha fin');
      const reqCapacity = isFieldRequired('Cupos máximos');
      const reqResponsible = isFieldRequired('Responsable interno');
      const reqVersion = isFieldRequired('Versión del convenio');
      const reqDescription = isFieldRequired('Descripción pública');
      const reqComments = isFieldRequired('Observaciones');
      const reqMinSemester = isFieldRequired('Semestre mínimo');
      const reqMinAverage = isFieldRequired('Promedio mínimo');

      return {
        form: {
          agreementsTypesId: { required },
          code: { required },
          name: { required },
          institutionPartner: { requiredIf: requiredIf(reqInstitutionPartner) },
          scope: { requiredIf: requiredIf(reqScope) },
          countryId: { requiredIf: requiredIf(reqCountry) },
          municipalityId: { requiredIf: requiredIf(reqCity) },
          starDay: { requiredIf: requiredIf(reqStartDay) },
          endDate: { requiredIf: requiredIf(reqEndDate) },
          maximumCapacity: { requiredIf: requiredIf(reqCapacity) },
          internalResponsible: { requiredIf: requiredIf(reqResponsible) },
          agreementVersion: { requiredIf: requiredIf(reqVersion) },
          descriptionPublic: { requiredIf: requiredIf(reqDescription) },
          comments: { requiredIf: requiredIf(reqComments) },
          minimumSemester: { requiredIf: requiredIf(reqMinSemester) },
          maximumAverage: { requiredIf: requiredIf(reqMinAverage) },
        },
      };
    });
    const v$ = useVuelidate(rules, { form });

    const requirementsError = ref(false);
    const facultyError = ref(false);
    const programError = ref(false);

    watch(
      () => [form.requiresEnrollment, form.requiresNoDisciplinary, form.requiresNoBlocks],
      () => {
        requirementsError.value = false;
      }
    );
    watch(
      () => form.facultyIds,
      () => {
        facultyError.value = false;
      },
      { deep: true }
    );
    watch(
      () => form.programIds,
      () => {
        programError.value = false;
      },
      { deep: true }
    );

    const validateBeforeSave = async (): Promise<boolean> => {
      const valid = await v$.value.$validate();

      facultyError.value = showField('Facultades habilitadas') && isFieldRequired('Facultades habilitadas') && form.facultyIds.length === 0;
      programError.value = showField('Programas habilitados') && isFieldRequired('Programas habilitados') && form.programIds.length === 0;

      if (showField('Sección de requisitos') && isFieldRequired('Sección de requisitos')) {
        requirementsError.value = form.requiresEnrollment === 0 && form.requiresNoDisciplinary === 0 && form.requiresNoBlocks === 0;
      } else {
        requirementsError.value = false;
      }
      return valid && !facultyError.value && !programError.value && !requirementsError.value;
    };

    const loadSelectOptions = async () => {
      if (selectsLoaded.value || loadingSelects.value) return;
      loadingSelects.value = true;

      const [typesResult, countriesResult, facultiesResult, rolesResult] = await Promise.allSettled([
        getAgreementTypesService.run({ perPage: 100, isActive: 1 }),
        findAllCountriesForSelectService.run({ perPage: 300 }),
        axios
          .get(`${services.structure}/faculties`, {
            params: { perPage: 200, order: 'ASC', noPag: 'true' },
          })
          .then((r) => r.data),
        getRoleRelatedDataFormService.run(),
      ]);

      if (typesResult.status === 'fulfilled') {
        agreementTypes.value = (typesResult.value.data || []).map((t: any) => ({
          id: t.id,
          name: t.name,
        }));
      }

      if (countriesResult.status === 'fulfilled') {
        const data = countriesResult.value.data || countriesResult.value;
        countries.value = Array.isArray(data)
          ? data.map((c: any) => {
              try {
                const t = typeof c.translations === 'string' ? JSON.parse(c.translations) : c.translations;
                return { id: c.id, name: t?.es || c.name };
              } catch {
                return { id: c.id, name: c.name };
              }
            })
          : [];
      }

      if (facultiesResult.status === 'fulfilled') {
        const data = facultiesResult.value?.data || facultiesResult.value;
        faculties.value = Array.isArray(data) ? data.map((f: any) => ({ id: f.id, name: f.name })) : [];
      }

      if (rolesResult.status === 'fulfilled') {
        const profiles = rolesResult.value?.profiles || [];
        beneficiaryTypes.value = profiles.map((p: any) => ({
          id: p.id,
          name: p.name,
        }));
      }

      loadingSelects.value = false;
      selectsLoaded.value = true;
    };

    // Track the resetForm timeout so we can cancel it if the drawer reopens before it fires
    let resetFormTimer: ReturnType<typeof setTimeout> | null = null;

    const loadRegions = async (countryId: number) => {
      loadingRegions.value = true;
      try {
        const response = await findAllRegionsForSelectService.run({
          countryId,
          perPage: 300,
        });
        const data = response.data || response;
        regions.value = Array.isArray(data) ? data.map((r: any) => ({ id: r.id, name: r.name })) : [];
      } finally {
        loadingRegions.value = false;
      }
    };

    const loadMunicipalities = async (regionId: number) => {
      loadingMunicipalities.value = true;
      try {
        const response = await findAllMunicipalitiesForSelectService.run({
          regionId,
          perPage: 300,
        });
        const data = response.data || response;
        municipalities.value = Array.isArray(data) ? data.map((m: any) => ({ id: m.id, name: m.name })) : [];
      } finally {
        loadingMunicipalities.value = false;
      }
    };

    const onCountryChange = async () => {
      selectedRegionId.value = undefined;
      regions.value = [];
      municipalities.value = [];
      form.municipalityId = undefined;
      if (!form.countryId) return;
      await loadRegions(form.countryId);
    };

    const onRegionChange = async () => {
      municipalities.value = [];
      form.municipalityId = undefined;
      if (!selectedRegionId.value) return;
      await loadMunicipalities(selectedRegionId.value);
    };

    // Used when editing: restores region + municipality dropdowns without resetting form values
    const restoreGeography = async (countryId: number, municipalityId: number) => {
      await loadRegions(countryId);
      // Find which region this municipality belongs to
      try {
        const res = await findAllMunicipalitiesForSelectService.run({
          municipalityId,
          perPage: 1,
        });
        const items = res.data || res;
        const mun = Array.isArray(items) ? items[0] : null;
        if (mun?.regionId) {
          selectedRegionId.value = mun.regionId;
          await loadMunicipalities(mun.regionId);
          form.municipalityId = municipalityId;
        }
      } catch {
        // Geography could not be fully restored; country is still set
      }
    };

    // Extrae YYYY-MM-DD del string del servidor sin conversión de timezone
    const formatDateForInput = (dateStr: string | undefined): string => {
      if (!dateStr) return '';
      return dateStr.substring(0, 10);
    };

    // El input type="date" ya entrega YYYY-MM-DD, se envía tal cual
    const formatDateForServer = (dateStr: string | undefined): string => {
      return dateStr || '';
    };

    watch(
      () => form.facultyIds,
      async (newFaculties) => {
        if (isPopulating.value) return;
        await loadProgramsForFaculties(newFaculties);
      },
      { deep: true }
    );

    watch(
      () => form.agreementsTypesId,
      async (typeId) => {
        // Skip reload during edit population — typeConfig is preloaded in that path
        if (isPopulating.value) return;
        typeConfig.value = null;
        documents.value = [];
        v$.value.$reset();
        if (!typeId) return;
        loadingTypeConfig.value = true;
        try {
          const config = await getAgreementTypeByIdService.run(typeId);
          if (config && !Array.isArray(config.sections)) config.sections = [];
          typeConfig.value = config;
          if (!isEdit.value && config?.attachments?.length) {
            documents.value = config.attachments.filter((a: any) => Boolean(a.isActive)).map((a: any) => ({ name: a.name, required: a.required }));
          }
        } catch (error) {
          console.error('Error loading agreement type configuration:', error);
          typeConfig.value = { sections: [], attachments: [] };
        } finally {
          loadingTypeConfig.value = false;
        }
      }
    );

    watch(
      () => props.isVisible,
      (visible) => {
        if (visible) loadSelectOptions();
      }
    );

    watch(
      () => props.agreementData,
      async (data) => {
        if (!data) return;

        // Cancel immediately before any await to prevent resetForm racing against population
        if (resetFormTimer !== null) {
          clearTimeout(resetFormTimer);
          resetFormTimer = null;
        }

        await loadSelectOptions();

        // Resolve flat or nested API response fields
        const resolvedTypesId = data.agreementsType?.id ?? data.agreementsTypesId;
        const resolvedCountryId = data.country?.id ?? data.countryId;
        const resolvedMunicipalityId = data.municipality?.id ?? data.municipalityId;
        const resolvedFacultyIds: number[] = data.facultyIds?.length
          ? data.facultyIds
          : data.facultyId
          ? [data.facultyId]
          : (data.faculties?.map((f) => f.faculty?.id).filter(Boolean) as number[]) ?? [];
        const resolvedProgramIds: number[] = data.programIds?.length
          ? data.programIds
          : data.programId
          ? [data.programId]
          : (data.programs?.map((p) => p.program?.id).filter(Boolean) as number[]) ?? [];
        const resolvedRoleIds: number[] = data.roleIds?.length
          ? data.roleIds
          : data.beneficiaries?.length
          ? (data.beneficiaries.map((b) => b.role?.id).filter(Boolean) as number[])
          : data.beneficiariesTypesId
          ? [data.beneficiariesTypesId]
          : [];

        // Preload typeConfig so fields are visible immediately when form values are set
        if (resolvedTypesId) {
          loadingTypeConfig.value = true;
          try {
            const config = await getAgreementTypeByIdService.run(resolvedTypesId);
            if (config && !Array.isArray(config.sections)) config.sections = [];
            typeConfig.value = config;
          } catch {
            typeConfig.value = { sections: [], attachments: [] };
          } finally {
            loadingTypeConfig.value = false;
          }
        }

        // Guard cascade watchers (facultyId → clears programId)
        isPopulating.value = true;

        form.agreementsTypesId = resolvedTypesId;
        form.code = data.code;
        form.name = data.name;
        form.institutionPartner = data.institutionPartner ?? '';
        form.countryId = resolvedCountryId;
        form.municipalityId = resolvedMunicipalityId;
        form.starDay = formatDateForInput(data.starDay ?? undefined);
        form.endDate = formatDateForInput(data.endDate ?? undefined);
        form.facultyIds = resolvedFacultyIds;
        form.programIds = resolvedProgramIds;
        form.roleIds = resolvedRoleIds;
        form.maximumAverage = data.maximumAverage;
        form.minimumSemester = data.minimumSemester;
        form.maximumSemester = data.maximumSemester;
        form.requiresEnrollment = data.requiresEnrollment ?? 0;
        form.requiresNoDisciplinary = data.requiresNoDisciplinary ?? 0;
        form.requiresNoBlocks = data.requiresNoBlocks ?? 0;
        form.descriptionPublic = data.descriptionPublic ?? '';
        form.comments = data.comments ?? '';
        form.maximumCapacity = data.maximumCapacity;
        form.scope = data.scope ?? '';
        form.internalResponsible = data.internalResponsible ?? '';
        form.agreementVersion = data.agreementVersion ?? '';
        documentMainExisting.value = data.documentMain ?? null;
        documentAnexedExisting.value = data.documentAnexed ?? null;

        await nextTick();
        isPopulating.value = false;

        if (resolvedFacultyIds.length) {
          loadProgramsForFaculties(resolvedFacultyIds).then(() => {
            const validIds = new Set(programOptions.value.map((p) => p.id));
            form.programIds = resolvedProgramIds.filter((id) => validIds.has(id));
          });
        }

        // Cargar documentos del convenio desde la API (modo editar)
        documents.value = [];
        loadingDocuments.value = true;
        getAgreementsInstitutionalDocumentsService
          .run({ agreementsInstitutionalId: data.id, perPage: 100 })
          .then((res) => {
            documents.value = (res.data || []).map((d) => ({
              id: d.id,
              name: d.name,
              required: d.required,
            }));
          })
          .finally(() => {
            loadingDocuments.value = false;
          });

        // Restore geography cascade after selects are loaded
        if (resolvedCountryId && resolvedMunicipalityId) {
          restoreGeography(resolvedCountryId, resolvedMunicipalityId);
        } else if (resolvedCountryId) {
          loadRegions(resolvedCountryId);
        }
      }
    );

    const resetForm = () => {
      resetFormTimer = null;
      Object.assign(form, buildEmptyForm());
      v$.value.$reset();
      typeConfig.value = null;
      selectedRegionId.value = undefined;
      regions.value = [];
      municipalities.value = [];
      documents.value = [];
      loadingDocuments.value = false;
      editingDocIdx.value = null;
      editingDocName.value = '';
      documentMainFile.value = null;
      documentAnexedFile.value = null;
      documentMainExisting.value = null;
      documentAnexedExisting.value = null;
    };

    const updateVisibility = (value: boolean) => {
      emit('update:isVisible', value);
      if (!value) {
        resetFormTimer = setTimeout(resetForm, 300);
      }
    };

    const startEditDocument = (idx: number) => {
      editingDocIdx.value = idx;
      editingDocName.value = documents.value[idx].name;
    };

    const cancelEditDocument = () => {
      editingDocIdx.value = null;
      editingDocName.value = '';
    };

    const saveEditDocument = async (idx: number) => {
      const name = editingDocName.value.trim();
      if (!name) return;
      const doc = documents.value[idx];
      doc.name = name;
      const agreementId = props.agreementData?.id;
      if (doc.id && agreementId) {
        try {
          await createOrUpdateAgreementInstitutionalDocumentService.run(
            {
              agreementsInstitutionalId: agreementId,
              name,
              required: typeof doc.required === 'boolean' ? (doc.required ? 1 : 0) : doc.required,
            },
            doc.id
          );
        } catch {
          // local change already applied
        }
      }
      cancelEditDocument();
    };

    const removeDocument = async (idx: number) => {
      const doc = documents.value[idx];
      if (doc.id && props.agreementData?.id) {
        // Edit mode: delete via API
        try {
          await deleteAgreementInstitutionalDocumentService.run(doc.id);
        } catch {
          // If API fails, still remove locally
        }
      }
      documents.value.splice(idx, 1);
    };

    const onDocumentRequiredChange = async (idx: number, value: number) => {
      const doc = documents.value[idx];
      doc.required = value;
      const agreementId = props.agreementData?.id;
      if (doc.id && agreementId) {
        try {
          await createOrUpdateAgreementInstitutionalDocumentService.run(
            {
              agreementsInstitutionalId: agreementId,
              name: doc.name,
              required: value,
            },
            doc.id
          );
        } catch {
          // keep local change even if API fails
        }
      }
    };

    const buildPayload = (agreementStatus: 'Activo' | 'Borrador'): CreateOrUpdateInstitutionalAgreementDto => {
      const payload: any = {
        agreementsTypesId: form.agreementsTypesId != null ? form.agreementsTypesId : undefined,
        code: form.code,
        name: form.name,
        institutionPartner: form.institutionPartner || undefined,
        scope: form.scope || undefined,
        countryId: form.countryId != null ? form.countryId : undefined,
        starDay: showField('Fecha inicio') && form.starDay ? formatDateForServer(form.starDay) : undefined,
        endDate: showField('Fecha fin') && form.endDate ? formatDateForServer(form.endDate) : undefined,
        facultyIds: form.facultyIds.length > 0 ? form.facultyIds : undefined,
        programIds: form.programIds.length > 0 ? form.programIds : undefined,
        roleIds: form.roleIds.length > 0 ? form.roleIds : undefined,
        maximumAverage: form.maximumAverage != null ? form.maximumAverage : undefined,
        minimumSemester: form.minimumSemester != null ? form.minimumSemester : undefined,
        maximumSemester: form.maximumSemester != null ? form.maximumSemester : undefined,
        requiresEnrollment: form.requiresEnrollment,
        requiresNoDisciplinary: form.requiresNoDisciplinary,
        requiresNoBlocks: form.requiresNoBlocks,
        municipalityId: form.municipalityId != null ? form.municipalityId : undefined,
        descriptionPublic: form.descriptionPublic || undefined,
        comments: form.comments || undefined,
        maximumCapacity: form.maximumCapacity != null ? form.maximumCapacity : undefined,
        internalResponsible: form.internalResponsible || undefined,
        agreementVersion: form.agreementVersion || undefined,
        agreementStatus,
      };

      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) delete payload[key];
      });

      return payload;
    };

    const buildDetailPayload = (agreementStatus: 'Activo' | 'Borrador'): UpdateInstitutionalAgreementDetailDto => ({
      ...buildPayload(agreementStatus),
      documents: documents.value
        .filter((d) => d.id != null)
        .map((d) => ({
          id: d.id as number,
          name: d.name,
          required: typeof d.required === 'boolean' ? (d.required ? 1 : 0) : d.required,
        })),
    });

    const uploadFiles = async (agreementId: number) => {
      if (!documentMainFile.value && !documentAnexedFile.value) return;
      try {
        await uploadAgreementDocumentsService.run(agreementId, documentMainFile.value, documentAnexedFile.value);
      } catch {
        // upload error is non-blocking; axios interceptor shows toast
      }
    };

    const postLocalDocuments = async (agreementId: number) => {
      if (!documents.value.length) return;
      await Promise.allSettled(
        documents.value.map((doc) =>
          createOrUpdateAgreementInstitutionalDocumentService.run({
            agreementsInstitutionalId: agreementId,
            name: doc.name,
            required: typeof doc.required === 'boolean' ? (doc.required ? 1 : 0) : doc.required,
          })
        )
      );
    };

    const saveAsDraft = async () => {
      if (!(await validateBeforeSave())) {
        $toast.error('Por favor completa todos los campos requeridos antes de guardar.');
        return;
      }
      try {
        const res = await createOrUpdateInstitutionalAgreementService.run(buildPayload('Borrador'));
        const agreementId = res?.data?.id ?? res?.id;
        if (agreementId) {
          await postLocalDocuments(agreementId);
          await uploadFiles(agreementId);
        }
        emit('save');
        updateVisibility(false);
      } catch {
        // El interceptor de axios ya muestra el toast de error del servidor
      }
    };

    const publish = async () => {
      if (!(await validateBeforeSave())) {
        $toast.error('Por favor completa todos los campos requeridos antes de publicar.');
        return;
      }
      try {
        const res = await createOrUpdateInstitutionalAgreementService.run(buildPayload('Activo'));
        const agreementId = res?.data?.id ?? res?.id;
        if (agreementId) {
          await postLocalDocuments(agreementId);
          await uploadFiles(agreementId);
        }
        emit('save');
        updateVisibility(false);
      } catch {
        // El interceptor de axios ya muestra el toast de error del servidor
      }
    };

    const saveChanges = async () => {
      if (!(await validateBeforeSave())) {
        $toast.error('Por favor completa todos los campos requeridos antes de guardar.');
        return;
      }
      try {
        const id = props.agreementData?.id;
        const currentStatus = props.agreementData?.agreementStatus === 'Borrador' ? 'Borrador' : 'Activo';
        if (id) {
          await createOrUpdateInstitutionalAgreementService.run(buildPayload(currentStatus), id);
          await updateInstitutionalAgreementDetailService.run(id, buildDetailPayload(currentStatus));
          await uploadFiles(id);
        } else {
          const res = await createOrUpdateInstitutionalAgreementService.run(buildPayload(currentStatus));
          const newId = res?.data?.id ?? res?.id;
          if (newId) await uploadFiles(newId);
        }
        emit('save');
        updateVisibility(false);
      } catch {
        // El interceptor de axios ya muestra el toast de error del servidor
      }
    };

    const publishChanges = async () => {
      if (!(await validateBeforeSave())) {
        $toast.error('Por favor completa todos los campos requeridos antes de publicar.');
        return;
      }
      try {
        const id = props.agreementData?.id;
        if (id) {
          await createOrUpdateInstitutionalAgreementService.run(buildPayload('Activo'), id);
          await updateInstitutionalAgreementDetailService.run(id, buildDetailPayload('Activo'));
          await uploadFiles(id);
        } else {
          const res = await createOrUpdateInstitutionalAgreementService.run(buildPayload('Activo'));
          const newId = res?.data?.id ?? res?.id;
          if (newId) await uploadFiles(newId);
        }
        emit('save');
        updateVisibility(false);
      } catch {
        // El interceptor de axios ya muestra el toast de error del servidor
      }
    };

    const onDocumentMainChange = (e: Event) => {
      documentMainFile.value = (e.target as HTMLInputElement).files?.[0] ?? null;
    };

    const onDocumentAnexedChange = (e: Event) => {
      documentAnexedFile.value = (e.target as HTMLInputElement).files?.[0] ?? null;
    };

    return {
      form,
      documents,
      editingDocIdx,
      editingDocName,
      isEdit,
      v$,
      loadingSelects,
      loadingTypeConfig,
      loadingDocuments,
      agreementTypes,
      countries,
      faculties,
      programs,
      beneficiaryTypes,
      selectedRegionId,
      regions,
      municipalities,
      loadingRegions,
      loadingMunicipalities,
      onCountryChange,
      onRegionChange,
      showField,
      hasSectionFields,
      isFieldRequired,
      requirementsError,
      facultyError,
      programError,
      updateVisibility,
      startEditDocument,
      cancelEditDocument,
      saveEditDocument,
      onDocumentRequiredChange,
      removeDocument,
      saveAsDraft,
      publish,
      saveChanges,
      publishChanges,
      documentMainFile,
      documentAnexedFile,
      documentMainExisting,
      documentAnexedExisting,
      onDocumentMainChange,
      onDocumentAnexedChange,
    };
  },
});
</script>

<style scoped>
/* ── Drawer head ── */
.drawerHead {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.drawerHead__icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #fff;
  flex-shrink: 0;
}

.drawerHead__info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.drawerHead__title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}

.drawerHead__subtitle {
  font-size: 0.83rem;
  color: rgba(255, 255, 255, 0.75);
}

/* ── Drawer body ── */
.drawerBody {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* ── Section accordion item spacing ── */
.sectionItem {
  margin-bottom: 0.75rem;
}

/* ── Section head (inside accordion button) ── */
.sectionHead {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  width: 100%;
}

.sectionHead__icon {
  width: 46px;
  height: 46px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.sectionHead__icon--blue {
  background: #eff6ff;
  color: #2563eb;
}
.sectionHead__icon--green {
  background: #f0fdf4;
  color: #15803d;
}
.sectionHead__icon--purple {
  background: #faf5ff;
  color: #7c3aed;
}
.sectionHead__icon--orange {
  background: #fff7ed;
  color: #c2410c;
}
.sectionHead__icon--teal {
  background: #f0fdfa;
  color: #0d9488;
}

.sectionHead__text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  text-align: left;
}

.sectionHead__title {
  font-size: 1.02rem;
  font-weight: 600;
  color: var(--color-dark, #111827);
  line-height: 1.2;
}

.sectionHead__subtitle {
  font-size: 0.87rem;
  color: var(--color-gray-600, #6b7280);
}

/* ── Section content ── */
.sectionContent {
  padding: 0rem 0.25rem 0.5rem;
}

/* ── Field group ── */
.fieldGroup {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.fieldLabel {
  font-size: 0.83rem;
  font-weight: 600;
  color: var(--color-dark, #374151);
}

.fieldRequired {
  color: #dc2626;
  margin-left: 2px;
}

/* ── Conditions list ── */
.conditionsList {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.conditionItem {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.conditionItem__label {
  font-size: 0.85rem;
  color: var(--color-dark, #374151);
}

/* ── Document list ── */
.docList {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.docRow {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: border-color 0.15s ease;
}

.docRow:hover {
  border-color: #d1d5db;
}

.docRow__icon {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  background: #fff;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  color: #6b7280;
  flex-shrink: 0;
}

.docRow__name {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.docRow__badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}

.docRow__badge--required {
  background: #fee2e2;
  color: #dc2626;
}

.docRow__badge--optional {
  background: #f3f4f6;
  color: #6b7280;
}

.docRow__actions {
  display: flex;
  gap: 0.3rem;
  flex-shrink: 0;
}

/* Edit form inside a row */
.docRow__editForm {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  width: 100%;
  flex-wrap: wrap;
}

.docRow__editInput {
  flex: 1;
  min-width: 140px;
}

.docRow__editRequired {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
}

.docRow__editRequiredLabel {
  font-size: 0.78rem;
  color: #6b7280;
}

.docRow__editActions {
  display: flex;
  gap: 0.3rem;
}

/* Empty state */
.docEmpty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 1.5rem 1rem;
  margin-bottom: 1rem;
  background: #f9fafb;
  border: 1.5px dashed #d1d5db;
  border-radius: 10px;
}

.docEmpty__icon {
  font-size: 1.75rem;
  color: #d1d5db;
}

.docEmpty__text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
}

.docEmpty__sub {
  font-size: 0.78rem;
  color: #9ca3af;
}

/* Add document form */
.docAddForm {
  display: flex;
  align-items: flex-end;
  gap: 0.65rem;
  padding: 0.85rem 1rem;
  background: #fff;
  border: 1.5px dashed #cbd5e1;
  border-radius: 8px;
  flex-wrap: wrap;
}

.docAddForm__fields {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 200px;
  flex-wrap: wrap;
}

.docAddForm__input {
  flex: 1;
  min-width: 140px;
}

.docAddForm__required {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
}

.docAddForm__requiredLabel {
  font-size: 0.78rem;
  color: #6b7280;
}

.btnDoc--danger {
  border-color: #fecaca;
  color: #dc2626;
  flex-shrink: 0;
}

/* ── Drawer footer ── */
.drawerFooter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 0.25rem;
  gap: 0.5rem;
}

@media (max-width: 480px) {
  .drawerFooter {
    flex-direction: column;
    align-items: flex-end;
  }
}
/* ── Type hint ── */
.typeHint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #1d4ed8;
}

.typeHint__icon {
  flex-shrink: 0;
}

/* ── File existing indicator ── */
.fileExisting {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.7rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  font-size: 0.82rem;
}

.fileExisting__icon {
  color: #16a34a;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.fileExisting__name {
  color: #166534;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-decoration: underline;
}

.fileExisting__name:hover {
  color: #14532d;
}
</style>
