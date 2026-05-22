import ValidationsErrorsStore from '../stores/validationsErrors.store';

export class ValidationsErrorsService {
    setErrors(errors: any) {
        ValidationsErrorsStore.methods.setErrors(errors);
    }

    hide() {
        ValidationsErrorsStore.methods.setErrors({});
    }
}