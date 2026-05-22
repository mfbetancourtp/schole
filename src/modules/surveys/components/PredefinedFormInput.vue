<template>
    <div v-if="loading"></div>
    <div
        v-else
        v-for="field, index in fields" 
        class="mb-3 tw-flex-1"
        :key="index"
    >
        <MunicipalitiesSearchEngine
            v-if="field.typeField == 'Ciudades'"  
            :default-label-municipality="field.defaultLabel"
            :field-key="'question_' + field.id"
            :municipalityId="v$.form['question_' + field.id].$model"
            @selected-municipality="selectedMunicipality"
        ></MunicipalitiesSearchEngine>

        <AppFormField
            v-else
            :form-control="v$.form['question_' + field.id]" 
            :label="field.defaultLabel"
            :class="field.typeField == 'falso_verdadero' ? 'form-check form-switch' : ''"
        >
            <input
                v-if="typeFieldInput.includes(field.typeField)"
                v-model="v$.form['question_' + field.id].$model"
                class="form-control"
                :type="typeData[field.typeField]"
            >
            <AppVoiceInput  v-if="field.typeField == 'texto_largo'"
                v-model="v$.form['question_' + field.id].$model"
                :cols="30" :rows="2" textareaClass="form-control"  />
            <input 
                v-model="v$.form['question_' + field.id].$model"
                v-if="field.typeField == 'falso_verdadero'" 
                class="form-check-input" 
                type="checkbox"
            >

            <AppAutocomplete
                v-if="typeFieldSelect.includes(field.typeField)"
                v-bind:class="{ disabledSelect: !saveThisForm}"
                v-model="v$.form['question_' + field.id].$model"
                :options="getDataSelect[field.typeField]"
            ></AppAutocomplete>
        </AppFormField>

        <ParentsForEnrollees
            v-if="v$.form['question_' + field.id].$model == true && field.name == 'parents'"
            :parents="parents"
            @updateParents="updateParents"
        ></ParentsForEnrollees>
    </div>

    <div class="d-flex justify-content-end gap-1">
        <AppButton
            :disabled="stepIndex == 1"
            @click="manageStep(0)"
            variant="primary"
            :label="'Atrás'"
            outlined
        ></AppButton>

        <AppButton
            @click="manageStep(1)"
            :label="'Siguiente'"
            variant="primary"
        ></AppButton>
    </div>
</template>

<script lang="ts">
import {useRoute} from "vue-router";
import {defineComponent, onMounted, PropType, reactive, ref} from "vue";

import {useVuelidate} from '@vuelidate/core';

import ParentsForEnrollees from './ParentsForEnrollees.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import MunicipalitiesSearchEngine from './MunicipalitiesSearchEngine.vue';
import AppFormField from '../../../shared/components/Forms/AppFormField.vue';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';

import {FieldDto} from '../dtos/stepTypeFormulario.dto';

import {GetGendersService} from "../services/getGenders.service";
import {GetConvocationsGroupsService} from "../services/getConvocationsGroups.service";
import {GetIdentificationTypesService} from "../services/getIdentificationTypes.service";
import {GetConvocationsDegreesService} from "../services/getConvocationsDegrees.service";
import {SaveAnswersPredefinedFormService} from "../services/saveAnswersPredefinedForm.service";
import AppVoiceInput from "../../../shared/components/VoiceInput/AppVoiceInput.vue";

const saveAnswersPredefinedFormService = new SaveAnswersPredefinedFormService();
const getAnswersPredefinedFormService = new SaveAnswersPredefinedFormService();
const getIdentificationTypesService = new GetIdentificationTypesService();
const getConvocationsDegreesService = new GetConvocationsDegreesService();
const getConvocationsGroupsService = new GetConvocationsGroupsService();
const getGendersService = new GetGendersService();


export default defineComponent({
    name: "PredefinedFormInput",
    components: {
        MunicipalitiesSearchEngine, 
        ParentsForEnrollees,
        AppAutocomplete, 
        AppFormField, 
        AppButton,
        AppVoiceInput,
    },

    emits: ['updateStep'],
    props: {
        fields: {
            type: Array as PropType<FieldDto[]>,
            required: true,
        },
        sectionKey: {
            type: String,
            required: true,
        },
        saveProcedure: {
            type: String,
            required: true,
        },
        getProcedure: {
            type: String,
            required: true,
        },
        objectForm: {
            type: Object,
            required: true,
        },
        stepIndex: {
            type: Number,
            required: true,
        },
        responseObject: {
            type: Object,
            required: true,
        },
    },

    setup(props, {emit}) {
        const responseObject = props.responseObject;
        const saveProcedure = props.saveProcedure;
        const getProcedure = props.getProcedure;
        const dataForm = props.objectForm.form;
        const sectionKey = props.sectionKey;
        const dataV = props.objectForm.v$;

        const convocationEnrolId = ref();
        const saveThisForm = ref(true);
        const convocationId = ref();
        const route = useRoute();
        const loading = ref(true);
        const parents = ref([]);
        const stepId = ref();

        const form: any = reactive({...dataForm});
        const v$: any = useVuelidate({
            form: {
                ...dataV,
            },
        }, {form});

        const typeFieldSelect = ['tipo_identificacion', 'genero', 'grados_convocatoria', 'curso_grupos_convocatoria'];
        const typeFieldInput = ['texto_corto', 'correo', 'fecha', 'fecha_hora', 'numerico', 'password'];
        const typeData: any = {
            fecha_hora: 'datetime-local',
            password: 'password',
            texto_corto: 'text',
            numerico: 'number', 
            correo: 'email', 
            fecha: 'date', 
        };

        let getDataSelect: any = reactive({
            curso_grupos_convocatoria: [],
            tipo_identificacion: [],
            grados_convocatoria: [],
            genero: [],
        });

        onMounted(async () => {
            loading.value = true;

            try {
                convocationEnrolId.value = parseInt(route.params.convocationEnrollId.toString(), 10);
                convocationId.value = parseInt(route.params.convocationId.toString(), 10);
                stepId.value = parseInt(route.params.stepId.toString(), 10);

                let res: any = await getAnswersPredefinedFormService.run(
                    {
                        sectionId: sectionKey.split('_')[1],
                        procedure: getProcedure,
                        convocationEnrolId: convocationEnrolId.value,
                    }, {}
                );

                props.fields.forEach((field: FieldDto) => {
                    let formKey = 'question_' + field.id;

                    if (field.name == 'parents') {
                        parents.value = res[field.name];

                        form[formKey] = parents.value ? true : false;
                    } else {
                        if (field.typeField == 'falso_verdadero') {
                            form[formKey] = res[field.name] ? true : false;
                        } else {
                            if (saveProcedure == 'saveMatriculate' && res[field.name]) {
                                saveThisForm.value = false;
                            }
                            form[formKey] = res[field.name];
                        }
                    }
                });

                getGenders();
                getConvocationsGroups();
                getIdentificationTypes();
                getConvocationsDegrees();
            } catch (e) {}

            loading.value = false;
        });

        const getGenders = async () => {
            getDataSelect.genero = await getGendersService.run();
        };
        const getIdentificationTypes = async () => {
            getDataSelect.tipo_identificacion = await getIdentificationTypesService.run();
        };
        const getConvocationsDegrees = async () => {
            getDataSelect.grados_convocatoria = await getConvocationsDegreesService.run(convocationId.value);
        };
        const getConvocationsGroups = async () => {
            getDataSelect.curso_grupos_convocatoria = await getConvocationsGroupsService.run(convocationId.value, convocationEnrolId.value);

            getDataSelect.curso_grupos_convocatoria.forEach((group: any) => {
                group['name'] = group.GroupName + ' - ' + group.degreeName;
            });
        };

        const updateParents = async (update: boolean) => {
            if (update) {
                let res: any = await getAnswersPredefinedFormService.run(
                    {
                        sectionId: sectionKey.split('_')[1],
                        procedure: getProcedure,
                        convocationEnrolId: convocationEnrolId.value,
                    }, {}
                );
    
                props.fields.forEach((field: FieldDto) => {
                    let formKey = 'question_' + field.id;
    
                    if (field.name == 'parents') {
                        parents.value = res[field.name];
    
                        form[formKey] = parents.value ? true : false;
                    }
                });
            }
        };

        const manageStep = (stepIndex: number) => {
            if (stepIndex < 1) {
                emit('updateStep', false);
            } else {
                save();
            }
        };

        const selectedMunicipality = (value: any) => {
            form[value.key] = value.value;
        };

        const loadAnswers = () => {
            let keyForm: any = '';

            props.fields.forEach((field: FieldDto) => {
                if (field.name != 'parents') {
                    keyForm = 'question_' + field.id;
                    let key = field.name;
    
                    responseObject[key] = form[keyForm];
                }
            });
        };

        const save = async () => {
            const formIsValid = await v$.value.$validate();
            if (!formIsValid) return;

            try {
                if (saveThisForm.value) {
                    await loadAnswers();
    
                    let sectionId = sectionKey.split('_')[1];
                    let params = {
                        sectionId: sectionId,
                        procedure: saveProcedure,
                        convocationEnrolId: convocationEnrolId.value,
                    }
    
                    await saveAnswersPredefinedFormService.run(params, responseObject);
                }

                emit('updateStep', true);
            } catch (e) {console.log(e)}
        };

        return {
            v$,

            typeFieldSelect,
            typeFieldInput,
            getDataSelect,
            saveThisForm,
            typeData,
            loading,
            parents,

            selectedMunicipality,
            updateParents,
            manageStep,
        };
    },
});
</script>

<style scoped>
.disabledSelect {
    pointer-events:none;
    color: #bfcbd9;
    cursor: not-allowed;
    background-image: none;
    background-color: #eef1f6!important;
    border-color: #d1dbe5;
}
</style>