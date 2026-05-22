export class GetStatusInstitutionsService {
    async run() {
        return [
            {
                id: 'isQuote',
                name: 'Cotización',
            },
            {
                id: 'isPending',
                name: 'Pendiente',
            },
            {
                id: 'isPaid',
                name: 'Pagada',
            },
            {
                id: 'isCanceled',
                name: 'Anulada',
            },
        ];
    }
}