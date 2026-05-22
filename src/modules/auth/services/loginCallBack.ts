export class LoginCallBackService {
  async run(data: {
    SAMLResponse: string;
    RelayState: string;
    callbackUrl: string;
  }): Promise<void> {
    const { callbackUrl, SAMLResponse, RelayState } = data;
    if (!callbackUrl) throw new Error('callbackUrl no encontrado');

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = callbackUrl;

    const inputSaml = document.createElement('input');
    inputSaml.type = 'hidden';
    inputSaml.name = 'SAMLResponse';
    inputSaml.value = SAMLResponse;

    const inputRelay = document.createElement('input');
    inputRelay.type = 'hidden';
    inputRelay.name = 'RelayState';
    inputRelay.value = RelayState;

    form.appendChild(inputSaml);
    form.appendChild(inputRelay);

    document.body.appendChild(form);
    form.submit();
  }
}
