<template>
    <table class="table">
        <thead>
            <tr>
                <th>{{ t("core.generalTerms.academic.journey.singular") }}</th>
                <th>{{ t("core.generalTerms.academic.degree.singular") }}</th>
                <th>{{ t("core.generalTerms.academic.group.singular") }}</th>
                <th class="col-1">
                    {{ t("academicAdministration.matriculates.form.quota") }}
                </th>
                <th>Director</th>
                <th>{{ t("classroom.homeTeacher.options") }}</th>
            </tr>
        </thead>
        <tbody>
            <template v-if="loading">
                <tr>
                    <td colspan="6">
                        <AppLoading v-if="loading"></AppLoading>
                    </td>
                </tr>
            </template>
            <template v-else>
                <tr v-for="dat, index in data" :key="index">
                    <td>
                        <AppAutocomplete
                            v-model="dat.journeyId"
                            :options="journeys"
                        ></AppAutocomplete>
                    </td>

                    <td>
                        <AppAutocomplete
                            v-model="dat.degreeId"
                            :options="degrees"
                        ></AppAutocomplete>
                    </td>

                    <td>
                        <AppAutocomplete
                            v-model="dat.groupId"
                            :options="groups"
                        ></AppAutocomplete>
                    </td>

                    <td>
                        <input v-model="dat.quota" class="form-control" type="number" />
                    </td>

                    <td>
                        <SelectSearchTeacher 
                            :data="dat"
                            :keyName="'director'"
                            :keyVModel="'directorPeopleId'"
                        ></SelectSearchTeacher>
                    </td>

                    <td>
                        <AppButtonGroup size="sm">
                            <AppButton
                                v-tooltip="'Agregar'"
                                variant="primary"
                                @click="newRow()"
                                icon="plus"
                                outlined
                            ></AppButton>

                            <AppButtonDelete 
                                @click="removeRow(index)"
                            ></AppButtonDelete>
                        </AppButtonGroup>
                    </td>
                </tr>
            </template>
        </tbody>
    </table>
</template>

<script lang="ts">
import { useI18n } from "vue-i18n";
import { defineComponent, onMounted, PropType, Ref, ref } from 'vue';

import AppLoading from "../../../shared/components/AppLoading.vue";
import SelectSearchTeacher from "../components/SelectSearchTeacher.vue";
import AppButton from "../../../shared/components/Buttons/AppButton.vue";
import AppButtonGroup from "../../../shared/components/AppButtonGroup.vue";
import AppAutocomplete from "../../../shared/components/Forms/AppAutocomplete.vue";
import AppButtonDelete from "../../../shared/components/Buttons/AppButtonDelete.vue";

import { DegreeDto } from "../dtos/degree.dto";
import { CopyAcademicOfferDto } from "../dtos/copyAcademicOffer.dto";
import { JourneyDto } from "../../institutionalConfiguration/dtos/journey.dto";
import { GroupDto } from "../../../shared/dto/group.dto";

import { GetDataRelatedCopyAcademicOfferService } from "../services/getDataRelatedCopyAcademicOffer.service";

const getDataRelatedCopyAcademicOfferService = new GetDataRelatedCopyAcademicOfferService();

export default defineComponent({
    name: 'TableCopyAcademicOffer',
    components: {
        SelectSearchTeacher,
        AppAutocomplete,
        AppButtonDelete,
        AppButtonGroup,
        AppLoading,
        AppButton,
    },

    props: {
        data: {
            type: Array as PropType<CopyAcademicOfferDto[]>,
            required: true,
        },
    },

    setup(props) {
        const loading = ref(true);
        const { t } = useI18n();

        const journeys: Ref<JourneyDto[]> = ref([]);
        const degrees: Ref<DegreeDto[]> = ref([]);
        const groups: Ref<GroupDto[]> = ref([]);

        onMounted(async () => {
            loading.value = true;

            await getRelatedData();

            loading.value = false;
        });

        const getRelatedData = async () => {
            try {
                let res: any = await getDataRelatedCopyAcademicOfferService.run();
                journeys.value = res.journeys;
                degrees.value = res.degrees;
                groups.value = res.groups;
            } catch (e) {}
        };

        const removeRow =  async (index: number) => {
            loading.value = true;

            props.data.splice(index, 1);
            await getRelatedData();

            loading.value = false;
        };

        const newRow = () => {
            props.data.push({
                id: null,
                institutionId: null,
                academicPeriodId: null,
                degreeId: null,
                journeyId: null,
                campusId: null,
                groupId: null,
                directorPeopleId: null,
                quota: null,
                degreeName: null,
                groupName: null,
                journeyName: null,
                director: null,
                userIdDirector: null,
            });
        };

        return {
            t,

            journeys,
            degrees,
            loading,
            groups,

            removeRow,
            newRow,
        };
    },
});
</script>

<style scoped>
</style>