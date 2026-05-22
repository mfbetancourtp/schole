import { TeacherDashboardDto } from '../dtos/teacherDashboard.dto';

export class GetTeacherDashboardMockService {
  async getDashboardData(): Promise<TeacherDashboardDto> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          attendance: {
            punctualityPercentage: 85.7,
            unpunctualityPercentage: 14.3,
            attendances: 18,
            delays: 2,
            absences: 1,
            trend: 5.2,
          },
          academicLoad: {
            activeCourses: 3,
            assignedHours: 24,
            taughtHours: 18,
            taughtPercentage: 75,
            semesterProgress: 75,
            nextClass: {
              courseName: 'FUNDAMENTOS',
              courseCode: '',
              time: '14:00 - 16:00',
              location: 'Lab A-301',
              isToday: true,
            },
          },
          monthlyHours: {
            accumulatedHours: 50,
            monthlyGoal: 96,
            goalProgress: 55,
            projectedIncome: 2880,
            expectedIncome: 3840,
            incomeTrend: 12,
            hoursToGoal: 45,
          },
          qr: {
            code: 'DOC-2025-01',
            status: 'Activo',
            expirationDate: '31/12/2026',
            remainingDays: 324,
            qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=DOC-2024-001',
          },
        });
      }, 300); // Simulate API latency
    });
  }
}
