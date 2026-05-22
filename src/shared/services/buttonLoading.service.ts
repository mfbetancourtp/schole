import ButtonLoadingStore from '../stores/buttonLoading.store';

export class ButtonLoadingService {
    isSaving(state: boolean): void {
        ButtonLoadingStore.methods.isSaving(state);
    }
}