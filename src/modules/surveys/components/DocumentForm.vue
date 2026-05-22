<template>
  <form @submit.prevent="save">
    <AppBaseList :title="title" :routes="routes">
      <template #actions>
        <AppButtonBack :to="{ name: 'surveys.documentsList' }"></AppButtonBack>
        <AppButton style="color: white;">{{ t('core.save') }}</AppButton>
      </template>

      <template #content>
        <AppCard>
          <template #body>
            <!-- Form part 1 -->
            <section>
              <AppFormField :form-control="v$.form.title" :label="'classroom.activitiesTeacher.form.name'">
                <input
                  id="title"
                  type="text"
                  class="form-control"
                  v-model="v$.form.title.$model"
                  pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                  title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
                />
              </AppFormField>

              <AppFormField :form-control="v$.form.description" :label="'classroom.activitiesTeacher.form.description'">
                <AppVoiceInput v-model="v$.form.description.$model"
                class="form-control" id="description" textareaClass="form-control"  />
              </AppFormField>

              <hr />

              <div class="d-flex justify-content-between align-items-end">
                <h4 class="m-0">Numeración</h4>

                <div class="d-flex flex-column align-items-end">
                  <span style="font-size: 0.8rem; color: #777">Ejemplo</span>
                  <div>
                    <span v-if="prefix" class="h5 m-0">{{ prefix }}</span>
                    <span v-else class="h5 m-0" style="color: #bbb">CONT</span>

                    <span class="h5 m-0">-{{ numberStar }}</span>
                  </div>
                </div>
              </div>

              <div class="form-row">
                <AppFormField :label="'Prefijo'" :form-control="v$.form.prefix">
                  <input
                    type="text"
                    class="form-control"
                    v-model="v$.form.prefix.$model"
                    pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-,_;.@()]+$"
                    title="Ingresa un valor válido. Se permiten tildes, -, _, comas, (, ), ., :, ; y @"
                  />
                </AppFormField>

                <AppFormField :label="'Tamaño'" :form-control="v$.form.sizeConsecutive">
                  <input type="number" class="form-control" v-model="v$.form.sizeConsecutive.$model" />
                </AppFormField>

                <AppFormField :label="'Ultimo código generado'" :form-control="v$.form.lastNumber">
                  <input disabled type="number" class="form-control" v-model="v$.form.lastNumber.$model" />
                </AppFormField>
              </div>

              <div class="form-row">
                <AppFormField :label="'Inicia en'" :form-control="v$.form.numberStar">
                  <input type="number" class="form-control" v-model="v$.form.numberStar.$model" />
                </AppFormField>

                <AppFormField :label="'Termina en'" :form-control="v$.form.numberEnd">
                  <input type="number" class="form-control" v-model="v$.form.numberEnd.$model" />
                </AppFormField>
              </div>
            </section>

            <hr />

            <!-- Menu keys -->
            <section>
              <div class="d-flex justify-content-end align-items-center gap-2 mb-2">
                <div class="d-flex flex-column align-items-end responsive-buttons">
                  <AppButton :disabled="!dataPage.value?.id" class=" buttons" variant="primary" label="Usar formularios" @click="showModalForm"></AppButton>

                  <span class="form-text" v-if="!dataPage.value?.id"> Para usar esta opción, debes guardar el documento </span>
                </div>

                <AppFormField v-if="dataPage.value && dataPage.value.forms.length" :label="'Campos predefinidos'">
                  <select class="form-control" v-model="currentField">
                    <optgroup :label="form.sectionForm" v-for="form in dataPage.value.forms" :key="form.id">
                      <option v-for="field in form.fields" :key="field.keyField" :value="{ field, form }">
                        {{ field.label }}
                      </option>
                    </optgroup>
                  </select>

                  <span class="form-text"> Al seleccionar un campo, este se agregara en el contenido. </span>
                </AppFormField>
              </div>

              <div class="d-flex justify-content-end align-items-center gap-2">
                <div class="d-flex flex-column align-items-end responsive-buttons">
                  <AppButton :disabled="!dataPage.value?.id" class=" buttons" variant="primary" label="Usar Conceptos" @click="showModalUseConceptsForm"></AppButton>

                  <span class="form-text" v-if="!data?.id"> Para usar esta opción, debes guardar el documento </span>
                </div>

                <AppFormField v-if="dataPage.value && dataPage.value.concepts.length" :label="'Campos predefinidos'">
                  <select class="form-control" v-model="currentFieldConcept">
                    <optgroup :label="`${concept.name} (${concept.type})`" v-for="(concept, index) in dataPage.value.concepts" :key="index">
                      <option :value="concept.keyNumberValue.keyField">
                        {{ concept.keyNumberValue.label }}
                      </option>

                      <option :value="concept.keyLettersValue.keyField">
                        {{ concept.keyLettersValue.label }}
                      </option>
                    </optgroup>
                  </select>

                  <span class="form-text"> Al seleccionar un campo, este se agregara en el contenido. </span>
                </AppFormField>
              </div>

              <div class="d-flex align-items-center justify-content-end gap-2 responsive-buttons">
                <AppFormField v-if="dataPage.value && dataPage.value.defualtFields.length" :label="'Otras variables'">
                  <AppAutocomplete v-model="currentFieldDefualtFields" :options="dataPage.value.defualtFields" :label="'label'" :reduce="(d: any) => d.keyField"></AppAutocomplete>

                  <span class="form-text"> Al seleccionar un campo, este se agregara en el contenido. </span>
                </AppFormField>

                <AppButton :disabled="!dataPage.value?.id" class=" buttons" variant="primary" label="Ver lista de variables" @click="showModalAllFields"></AppButton>
              </div>
            </section>

            <hr />

            <!-- Formulas -->
            <section>
              <div class="d-flex justify-content-between flex-column">
                <div class="d-flex align-items-end responsive-buttons">
                  <h4 class="m-0" v-if="dataPage.value && dataPage.value.formulas.length">Lista de formulas</h4>
                </div>

                <div class="d-flex flex-column align-items-end responsive-buttons">
                  <AppButton :disabled="!data?.id" class=" buttons" variant="primary" label="Agregar formula" @click="openModalDocumentFormulasForm"> </AppButton>

                  <span class="form-text" v-if="!data?.id"> Para usar esta opción, debes guardar el documento </span>
                </div>
              </div>

              <div v-if="dataPage.value && dataPage.value.formulas.length">
                <div class="items mt-2">
                  <AppCard v-for="(formula, index) in dataPage.value.formulas" :key="index">
                    <template #title>
                      <AppCardTitle :title="formula.name"></AppCardTitle>
                    </template>

                    <template #body>
                      <p>Formula: {{ loadFormula(formula.formula) }}</p>
                    </template>

                    <template #footer>
                      <div class="d-flex justify-content-end responsive-buttons">
                        <AppButtonGroup>
                          <AppButtonDelete @click="showModalDeleteFormula(formula)"></AppButtonDelete>
                          <AppButtonEdit @click="openModalDocumentFormulasForm(formula)"></AppButtonEdit>
                        </AppButtonGroup>
                      </div>
                    </template>
                  </AppCard>
                </div>
              </div>
            </section>

            <hr />

            <!-- Form part 2 -->
            <section>
              <AppLoading v-if="loadingDoc"></AppLoading>

              <div v-else class="d-flex align-items-center gap-1">
                <div class="form-check form-switch">
                  <input :disabled="!dataPage.value?.id" class="form-check-input" type="checkbox" role="switch" id="useWordTemplate" v-model="useWordTemplate" />
                  <label class="form-check-label" for="useWordTemplate">Usar plantilla de word,</label>
                </div>

                <span
                  >Crea tu propio diseño en un archivo de word y subelo aquí:
                  <input type="file" id="inputFile" style="display: none" accept=".ods, .docx" @change="selectFile($event)" />
                  <AppButton :disabled="!useWordTemplate" @click="clickInputFile()" :label="'core.upload'" variant="primary" class="me-1 "></AppButton>

                  <a v-if="typeof v$.form.urlTemplate.$model == 'string'" :href="v$.form.urlTemplate.$model" target="_blank" class="route-file">Ver archivo adjunto</a>
                </span>
              </div>

              <AppFormField v-if="!useWordTemplate" :form-control="v$.form.documentBody" :label="'Contenido'">
                <AppEditorDocument v-model="v$.form.documentBody.$model" @editorRef="getEditorRef"></AppEditorDocument>
              </AppFormField>
            </section>

            <!-- Signers -->
            <section>
              <div class="d-flex justify-content-between">
                <div class="d-flex align-items-end">
                  <h4 class="m-0" v-if="dataPage.value && dataPage.value.signers.length">Lista de firmantes</h4>
                </div>

                <div class="d-flex flex-column align-items-end">
                  <AppButton :disabled="!dataPage.value?.id" class=" responsive-buttons" variant="primary" label="Agregar Firmantes" @click="showModalSigners"> </AppButton>

                  <span class="form-text" v-if="!dataPage.value?.id"> Para usar esta opción, debes guardar el documento </span>
                </div>
              </div>

              <AppLoading v-if="loadingSigners" />

              <template v-else>
                <div v-if="signers.value.length">
                  <div class="items mt-2">
                    <AppCard class="card-hover" v-for="(signer, index) in signers.value" :key="index">
                      <template #title>
                        <AppCardTitle :title="signer.code"></AppCardTitle>
                      </template>

                      <template #body>
                        <h6 class="m-0">Agregar campo al documento:</h6>

                        <AppAutocomplete v-model="currentFieldSigner" :options="signer.additionalFields" :label="'label'" :reduce="(d: any) => d.name"></AppAutocomplete>
                      </template>

                      <template #footer>
                        <div class="d-flex flex-column align-items-end">
                          <AppButtonDelete @click="showModalDeleteSigner(signer)"></AppButtonDelete>
                        </div>
                      </template>
                    </AppCard>
                  </div>
                </div>
              </template>
            </section>
          </template>
        </AppCard>

        <AppModal v-model="documentFormulasForm" v-if="dataPage.value?.id" :size="'xl'">
          <DocumentFormulasForm v-if="documentFormulasForm" :data="currentFormula" :documentId="dataPage.value.id" :keys="formulaKeys" @close="closeModalDocumentFormulasForm"></DocumentFormulasForm>
        </AppModal>

        <AppModal v-model="modalForm">
          <FormsDocument v-if="modalForm" :document="dataPage.value" :forms="forms" @close="closeModalForm"></FormsDocument>
        </AppModal>

        <AppModal v-model="modalUseConceptsForm">
          <UseConceptsForm v-if="modalUseConceptsForm" :document="dataPage.value" :conceptsAndDiscounts="conceptsAndDiscounts" @close="closeModalUseConceptsForm"></UseConceptsForm>
        </AppModal>

        <AppModal v-model="modalAllFields" :size="'lg'">
          <AllFields v-if="modalAllFields" :allFields="dataPage.value?.allFields" @close="closeModalAllFields"></AllFields>
        </AppModal>

        <AppModal v-model="modalSigners" :size="'lg'">
          <SignersDocument v-if="modalSigners" :document="dataPage.value" @close="closeModalSigners"></SignersDocument>
        </AppModal>

        <AppModal v-model="modalDeleteSigner">
          <AppConfirmDeleteModal v-if="modalDeleteSigner" entity="Firmante" @confirmDelete="deleteSigner" @close="modalDeleteSigner = false"></AppConfirmDeleteModal>
        </AppModal>

        <AppModal v-model="modalDeleteFormula">
          <AppConfirmDeleteModal v-if="modalDeleteFormula" entity="Formula" @confirmDelete="deleteFormula" @close="modalDeleteFormula = false"></AppConfirmDeleteModal>
        </AppModal>
      </template>
    </AppBaseList>
  </form>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, PropType, reactive, Ref, ref, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { useRouter } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import { required } from '../../../shared/plugins/vuelidate.plugin';

import AllFields from './AllFields.vue';
import FormsDocument from './FormsDocument.vue';
import SignersDocument from './SignersDocument.vue';
import UseConceptsForm from './UseConceptsForm.vue';
import DocumentFormulasForm from './DocumentFormulasForm.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppCardTitle from '../../../shared/components/Card/AppCardTitle.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppEditorDocument from '../../../shared/components/Editor/AppEditorDocument.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { DocumentDto } from '../dtos/document.dto';
import { PredefinedFormDto } from '../dtos/predefinedForm.dto';
import { ConceptsAndDiscountsDto } from '../dtos/conceptsAndDiscounts.dto';

import { GetDocumentByIdService } from '../services/getDocumentById.service';
import { GetFormsByDocumentIdService } from '../services/getFormsByDocumentId.service';
import { DeleteSignerDocumentService } from '../services/deleteSignerDocument.service';
import { CreateOrUpdateDocumentService } from '../services/createOrUpdateDocument.service';
import { GetDocumentConceptsAndDiscountsService } from '../services/getDocumentConceptsAndDiscounts.service';
import { DeleteDocumentFormulaByIdService } from '../services/deleteDocumentFormulaById.service';
import { useHeaderStore } from '../../../stores/header.store';
import AppVoiceInput from '../../../shared/components/VoiceInput/AppVoiceInput.vue';

const getDocumentConceptsAndDiscountsService = new GetDocumentConceptsAndDiscountsService();
const deleteDocumentFormulaByIdService = new DeleteDocumentFormulaByIdService();
const createOrUpdateDocumentService = new CreateOrUpdateDocumentService();
const deleteSignerDocumentService = new DeleteSignerDocumentService();
const getFormsByDocumentIdService = new GetFormsByDocumentIdService();
const getDocumentByIdService = new GetDocumentByIdService();

export default defineComponent({
  name: 'DocumentForm',
  components: {
    AppConfirmDeleteModal,
    DocumentFormulasForm,
    AppEditorDocument,
    AppAutocomplete,
    AppButtonDelete,
    SignersDocument,
    UseConceptsForm,
    AppButtonGroup,
    FormsDocument,
    AppButtonEdit,
    AppButtonBack,
    AppFormField,
    AppCardTitle,
    AppBaseList,
    AppLoading,
    AppButton,
    AllFields,
    AppModal,
    AppCard,
    AppVoiceInput,
  },

  props: {
    title: {
      type: String,
      required: true,
    },
    routes: {
      type: Array,
      required: true,
    },
    data: {
      type: Object as PropType<DocumentDto | null>,
      default: null,
    },
  },

  setup(props) {
    useMeta({ title: props.title });
    const { t } = useI18n();

    let intervalSave: any = null;
    const router = useRouter();

    const conceptsAndDiscounts: Ref<ConceptsAndDiscountsDto | undefined> = ref();
    const conceptsAndDiscountsForSelect: Ref<any[]> = ref([]);
    const forms: Ref<PredefinedFormDto[]> = ref([]);
    const formulaKeys: Ref<any[]> = ref([]);

    const documentFormulasForm = ref(false);
    const modalUseConceptsForm = ref(false);
    const modalDeleteFormula = ref(false);
    const modalDeleteSigner = ref(false);
    const useWordTemplate = ref(false);
    const modalAllFields = ref(false);
    const loadingSigners = ref(false);
    const modalSigners = ref(false);
    const loadingDoc = ref(false);
    const modalForm = ref(false);

    const currentFieldDefualtFields = ref(null);
    const currentFieldConcept = ref(null);
    const currentFormula: any = ref(null);
    const currentFieldSigner = ref(null);
    const currentSigner: any = ref(null);
    const editorRef: any = ref(null);
    const currentField = ref(null);
    const dataDocument: any = ref(null);

    const dataPage: { value: DocumentDto | null } = reactive({
      value: props.data,
    });
    const signers: { value: any[] } = reactive({
      value: [],
    });

    const form = reactive({
      title: dataPage.value?.title,
      description: dataPage.value?.description || '',
      prefix: dataPage.value?.prefix || null,
      sizeConsecutive: dataPage.value?.sizeConsecutive || 1,
      numberStar: dataPage.value?.numberStar || 0,
      numberEnd: dataPage.value?.numberEnd || 0,
      lastNumber: dataPage.value?.lastNumber || 0,
      documentBody: dataPage.value?.documentBody || '',
      urlTemplate: dataPage.value?.urlTemplate || null,
    });
    const v$ = useVuelidate(
      {
        form: {
          title: { required },
          description: {},
          prefix: {},
          sizeConsecutive: { required },
          numberStar: { required },
          numberEnd: { required },
          lastNumber: { required },
          documentBody: {},
          urlTemplate: {},
        },
      },
      { form }
    );

    const prefix = computed(() => {
      return form.prefix;
    });
    const numberStar = computed(() => {
      return `${form.numberStar}`.padStart(form.sizeConsecutive, '0');
    });

    onMounted(async () => {
      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Configuración de procesos', url: '' };
      headerStorage.moduleItem = { name: 'Documentos' , url: '' };
      headerStorage.moduleSubItem = { name: props.title, url: '' };
      if (dataPage.value?.id) {
        await getForms(dataPage.value.id);
        await loadSelectSigners();
        await loadFormulaKeys();
        await getDocumentConceptsAndDiscounts(dataPage.value.id);
        await getData();

        useWordTemplate.value = dataPage.value.urlTemplate ? true : false;

        intervalSave = setInterval(async () => {
          await save();
        }, 60000);
      }
    });

    watch(currentField, (value: any) => {
      if (value) {
        editorRef.value.model.change((writer: any) => {
          const insertPosition = editorRef.value.model.document.selection.getFirstPosition();
          writer.insertText(`{${value.field.keyField}}`, insertPosition);
        });

        setTimeout(() => {
          currentField.value = null;
        }, 800);
      }
    });
    watch(currentFieldConcept, (value: any) => {
      if (value) {
        editorRef.value.model.change((writer: any) => {
          const insertPosition = editorRef.value.model.document.selection.getFirstPosition();
          writer.insertText(`{${value}}`, insertPosition);
        });

        setTimeout(() => {
          currentFieldConcept.value = null;
        }, 800);
      }
    });
    watch(currentFieldDefualtFields, (value: any) => {
      if (value) {
        editorRef.value.model.change((writer: any) => {
          const insertPosition = editorRef.value.model.document.selection.getFirstPosition();
          writer.insertText(`{${value}}`, insertPosition);
        });

        setTimeout(() => {
          currentFieldDefualtFields.value = null;
        }, 800);
      }
    });
    watch(currentFieldSigner, (value: any) => {
      if (value) {
        editorRef.value.model.change((writer: any) => {
          const insertPosition = editorRef.value.model.document.selection.getFirstPosition();
          writer.insertText(`{${value}}`, insertPosition);
        });

        setTimeout(() => {
          currentFieldSigner.value = null;
        }, 800);
      }
    });

    const loadFormula = (formula: string) => {
      const concepts: any[] = dataPage.value?.concepts ?? [];
      const formulaArr: string[] = formula.split(' ');
      let variable1: string = formulaArr[0];
      let variable2: string = formulaArr[2];
      const keys: string[] = [];

      if (formulaArr[0].search('{') >= 0) {
        variable1 = formulaArr[0];
        keys.push(variable1);
      }

      if (formulaArr[2].search('{') >= 0) {
        variable2 = formulaArr[2];
        keys.push(variable2);
      }

      if (concepts.length) {
        keys.forEach((key) => {
          formulaKeys.value.forEach((formulaKey) => {
            if (formulaKey.id == key) {
              if (variable1 == key) variable1 = formulaKey.name;
              if (variable2 == key) variable2 = formulaKey.name;
            }
          });
        });
      }

      return `${variable1} ${formulaArr[1] == '*' ? 'x' : formulaArr[1]} ${variable2}`;
    };

    const clickInputFile = () => {
      let inputFile = document.getElementById('inputFile');
      if (inputFile != null) {
        inputFile.click();
      }
    };
    const selectFile = async (event: any) => {
      const files = event.target.files;
      if (!files.length) {
        return;
      }

      console.log(files[0]);

      form.urlTemplate = files[0];
    };

    const getDocumentConceptsAndDiscounts = async (documentId: any) => {
      try {
        conceptsAndDiscounts.value = await getDocumentConceptsAndDiscountsService.run(documentId);
      } catch (e) {
        console.log(e);
      }
    };

    const getData = async (documentId: any = null) => {
      if (!documentId && dataPage.value) {
        documentId = dataPage.value.id;
      }

      try {
        dataPage.value = await getDocumentByIdService.run(documentId);
        await getForms(documentId);
        await getDocumentConceptsAndDiscounts(documentId);
        await loadFormulaKeys();

        useWordTemplate.value = dataPage.value.urlTemplate ? true : false;

        form.urlTemplate = dataPage.value.urlTemplate ? dataPage.value.urlTemplate : null;
      } catch (e) {
        console.log(e);
      }
    };

    const loadFormulaKeys = () => {
      formulaKeys.value = [];

      if (dataPage.value?.concepts) {
        const concepts: any[] = dataPage.value.concepts;

        concepts.forEach((concept) => {
          if (concept.type == 'Concepto') {
            formulaKeys.value.push({
              id: `{${concept.keyNumberValue.keyField}}`,
              name: concept.name,
            });
          }
        });
      }

      if (dataPage.value?.allFields) {
        const allFieldsFormula: any[] = dataPage.value.allFields;

        allFieldsFormula.forEach((fieldFormula) => {
          if (fieldFormula.title == 'Formulas') {
            const fields: any[] = fieldFormula.fields;

            fields.forEach((field) => {
              if (field.keyField.search('nv') >= 0) {
                formulaKeys.value.push({
                  id: `${field.keyField}`,
                  name: field.label,
                });
              }
            });
          }
        });
      }
    };

    const getForms = async (documentId: number) => {
      forms.value = await getFormsByDocumentIdService.run(documentId);
    };

    const getEditorRef = (editor: any) => {
      editorRef.value = editor;
    };

    const showModalForm = () => {
      modalForm.value = true;
    };

    const showModalUseConceptsForm = () => {
      modalUseConceptsForm.value = true;
    };

    const closeModalUseConceptsForm = async () => {
      modalUseConceptsForm.value = false;
      await getData();
    };

    const showModalAllFields = () => {
      modalAllFields.value = true;
    };
    const closeModalAllFields = async () => {
      modalAllFields.value = false;
    };

    const closeModalForm = async () => {
      modalForm.value = false;
      await getData();
    };

    const openModalDocumentFormulasForm = async (formula: any = null) => {
      currentFormula.value = formula;
      documentFormulasForm.value = true;
    };
    const closeModalDocumentFormulasForm = async () => {
      documentFormulasForm.value = false;
      await getData();
      console.log('se cierra');
    };

    const save = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;

      loadingDoc.value = true;

      try {
        createOrUpdateDocumentService.isFormData = true;

        const dataSend: any = {
          ...form,
        };

        if (useWordTemplate.value) {
          dataSend.documentBody = null;
        } else {
          dataSend.urlTemplate = null;
        }

        const response = await createOrUpdateDocumentService.run(dataSend, dataPage.value?.id);

        if (!dataPage.value?.id) {
          await router.push({
            name: 'surveys.documentsEdit',
            params: {
              documentId: response.data.id,
            },
          });
        } else {
          await getData();
        }
      } catch (e) {
        console.log(e);
      }

      loadingDoc.value = false;
    };

    const showModalSigners = () => {
      modalSigners.value = true;
    };
    const closeModalSigners = async () => {
      modalSigners.value = false;
      await loadSelectSigners();
    };

    const loadSelectSigners = async () => {
      loadingSigners.value = true;

      if (dataPage.value && dataPage.value.id) {
        const dataAux = await getDocumentByIdService.run(dataPage.value.id);
        signers.value = await dataAux.signers;

        if (signers.value.length) {
          signers.value.forEach((signer: any) => {
            let code = signer.code;

            signer.additionalFields.forEach((additionalField: any) => {
              let key = additionalField.name;

              additionalField.name = `d.${code}.${key}`;
            });
          });
        }
      }

      loadingSigners.value = false;
    };

    onUnmounted(() => {
      if (intervalSave) {
        clearInterval(intervalSave);
      }
    });

    const showModalDeleteSigner = (signer: any) => {
      modalDeleteSigner.value = true;
      currentSigner.value = signer;
    };

    const deleteSigner = async () => {
      try {
        await deleteSignerDocumentService.run(currentSigner.value?.id as number);
        modalDeleteSigner.value = false;
        await loadSelectSigners();
      } catch (e) {
        console.log(e);
      }
    };

    const showModalDeleteFormula = (formula: any) => {
      modalDeleteFormula.value = true;
      currentFormula.value = formula;
    };

    const deleteFormula = async () => {
      try {
        await deleteDocumentFormulaByIdService.run(currentFormula.value?.id as number);

        modalDeleteFormula.value = false;

        await getData();
      } catch (e) {
        console.log(e);
      }
    };

    return {
      t,
      v$,
      modalForm,
      forms,
      currentField,
      modalSigners,
      modalDeleteSigner,
      save,
      getEditorRef,
      showModalForm,
      goToEdit: getData,
      closeModalForm,
      showModalSigners,
      closeModalSigners,
      conceptsAndDiscounts,
      showModalDeleteSigner,
      deleteSigner,
      loadingDoc,
      conceptsAndDiscountsForSelect,
      currentFieldSigner,
      currentFieldConcept,
      currentFieldDefualtFields,
      documentFormulasForm,
      formulaKeys,
      signers,

      numberStar,
      prefix,

      showModalUseConceptsForm,
      modalUseConceptsForm,
      closeModalUseConceptsForm,
      useWordTemplate,

      closeModalDocumentFormulasForm,
      openModalDocumentFormulasForm,
      modalDeleteFormula,
      showModalDeleteFormula,
      deleteFormula,
      currentFormula,

      loadFormula,
      selectFile,
      clickInputFile,
      closeModalAllFields,
      modalAllFields,
      showModalAllFields,
      loadingSigners,
      dataPage,
    };
  },
});
</script>

<style scoped>
.items {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
}
@media (max-width: 500px) {
  .responsive-buttons {
    flex-direction: column;
    width: 100%;
  }
  .buttons {
    width: 100%;
  }
}
</style>
