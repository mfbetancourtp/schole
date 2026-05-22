export interface TeacherQRDetailDto {
  teacher: {
    fullName: string;
    role: string;
    email: string;
    code: string;
    faculty: string;
    avatarInitials: string;
  };
  qr: {
    imageUrl: string;
    status: 'Activo' | 'Inactivo' | 'Expirado';
    creationDate: string;
    expirationDate: string;
    lastScan: string;
    remainingDays: number;
  };
  importantNotes: string[];
}
