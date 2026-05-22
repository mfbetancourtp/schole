import ErrorAlertStore from '../stores/errorAlert.store';

export class ErrorAlertService {
    show(message: string, errors: any = []): void {
        ErrorAlertStore.methods.setMessage(message, errors);
    }

    hide() {
        ErrorAlertStore.methods.setMessage('', []);
    }
}