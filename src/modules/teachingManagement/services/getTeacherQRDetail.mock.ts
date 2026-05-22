import { TeacherQRDetailDto } from '../dtos/teacherQRDetail.dto';

export class GetTeacherQRDetailMockService {
  async getQRDetail(): Promise<TeacherQRDetailDto> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          teacher: {
            fullName: 'Carvajal Niño Martha Carolina',
            role: 'Profesor Principal',
            email: 'carvajal.nino@universidad.edu',
            code: 'DOC-2026-01',
            faculty: 'Ciencias e Ingeniería',
            avatarInitials: 'CC',
            avatarUrl: 'https://academia-user-serverless-deployment.s3.amazonaws.com/files/test/75/2026/avatar/1773093501468.jpg',
          },
          qr: {
            imageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=DOC-2024-001',
            status: 'Activo',
            creationDate: '11/01/2026',
            expirationDate: '31/12/2026',
            lastScan: '17/02/2026 08:15',
            remainingDays: 22,
          },
          importantNotes: [
            'Una vez expirado, debe ser regenerado para su uso.',
            'El formato PDF incluye un carné institucional completo.',
            'Al regenerar el código, el anterior quedará invalidado automáticamente.',
          ],
        });
      }, 300);
    });
  }
}
