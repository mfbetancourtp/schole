import {reactive, readonly} from 'vue';
import {InstitutionDto} from '../dto/institution.dto';

interface IState {
    institutions: InstitutionDto[];
    selectedInstitution: InstitutionDto | null;
}

const state: IState = reactive({
    institutions: [],
    selectedInstitution: null,
});

const methods = {
    setInstitutions(institutions: InstitutionDto[]) {
        state.institutions = institutions;
    },
    setSelectedInstitution(institution: InstitutionDto) {
        state.selectedInstitution = institution;
    },
};

export default {
    state: readonly(state),
    methods,
};