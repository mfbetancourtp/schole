import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetValidationsService {
  async run() {
    return {
      relateData: [
        {
          id: 1,
          name: 'Mario',
          lastNames: 'Gonzales',
          jobName: 'Director',
          totalCompetencies: 5,
          competenciesCompleted: 5,
          endDate: '1 Dic 2022',
        },
        {
          id: 2,
          name: 'Rosa Maria',
          lastNames: 'Cuervo',
          jobName: 'Aseo General',
          totalCompetencies: 5,
          competenciesCompleted: 3,
          endDate: '20 Ene 2023',
        },
        {
          id: 3,
          name: 'Juan',
          lastNames: 'Hernandez',
          jobName: 'Logistica',
          totalCompetencies: 6,
          competenciesCompleted: 4,
          endDate: '08 Feb 2023',
        },
      ],
    };
  }
}
