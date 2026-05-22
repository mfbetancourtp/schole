export interface SpaceRow {
  code: string;
  name: string;
  type: string;
  location: string;
  capacity: number;
  status: string;
}

export interface ResourceRow {
  code: string;
  type: string;
  serial: string;
  status: string;
  assignedSpace: string;
  purchaseDate: string;
}

export const SPACES_DATA: SpaceRow[] = [
  {
    code: 'CAM-001',
    name: 'Campus Central',
    type: 'Campus',
    location: 'Campus Central',
    capacity: 5000,
    status: 'Activo',
  },
  {
    code: 'SED-001',
    name: 'Sede Principal',
    type: 'Sede',
    location: 'Campus Central > Sede Principal',
    capacity: 2000,
    status: 'Activo',
  },
  {
    code: 'EDI-A',
    name: 'Edificio A',
    type: 'Edificio',
    location: 'Campus Central > Sede Principal > Edificio A',
    capacity: 500,
    status: 'Activo',
  },
  {
    code: 'EDI-B',
    name: 'Edificio B',
    type: 'Edificio',
    location: 'Campus Central > Sede Principal > Edificio B',
    capacity: 450,
    status: 'Activo',
  },
  {
    code: 'LAB-301',
    name: 'Laboratorio de Física',
    type: 'Laboratorio',
    location: 'Campus Central > Sede Principal > Edificio A > Piso 3',
    capacity: 30,
    status: 'Activo',
  },
  {
    code: 'LAB-302',
    name: 'Laboratorio de Química',
    type: 'Laboratorio',
    location: 'Campus Central > Sede Principal > Edificio A > Piso 3',
    capacity: 30,
    status: 'Activo',
  },
  {
    code: 'LAB-201',
    name: 'Laboratorio de Computación',
    type: 'Laboratorio',
    location: 'Campus Central > Sede Principal > Edificio B > Piso 2',
    capacity: 35,
    status: 'Activo',
  },
  {
    code: 'AUL-302',
    name: 'Aula 302',
    type: 'Aula',
    location: 'Campus Central > Sede Principal > Edificio A > Piso 3',
    capacity: 40,
    status: 'Activo',
  },
  {
    code: 'AUL-303',
    name: 'Aula 303',
    type: 'Aula',
    location: 'Campus Central > Sede Principal > Edificio A > Piso 3',
    capacity: 40,
    status: 'Inactivo',
  },
  {
    code: 'AUL-201',
    name: 'Aula 201',
    type: 'Aula',
    location: 'Campus Central > Sede Principal > Edificio B > Piso 2',
    capacity: 45,
    status: 'Activo',
  },
  {
    code: 'AUD-001',
    name: 'Auditorio Principal',
    type: 'Auditorio',
    location: 'Campus Central > Sede Principal > Edificio A > Piso 1',
    capacity: 200,
    status: 'Activo',
  },
  {
    code: 'SAL-001',
    name: 'Sala de Conferencias A',
    type: 'Sala de reuniones',
    location: 'Campus Central > Sede Principal > Edificio B > Piso 1',
    capacity: 20,
    status: 'Activo',
  },
  {
    code: 'BIB-001',
    name: 'Biblioteca Central',
    type: 'Biblioteca',
    location: 'Campus Central > Sede Principal > Edificio A > Piso 2',
    capacity: 80,
    status: 'Activo',
  },
  {
    code: 'AUL-101',
    name: 'Aula 101',
    type: 'Aula',
    location: 'Campus Central > Sede Principal > Edificio A > Piso 1',
    capacity: 40,
    status: 'Activo',
  },
  {
    code: 'SED-002',
    name: 'Sede Norte',
    type: 'Sede',
    location: 'Campus Norte > Sede Norte',
    capacity: 1500,
    status: 'Activo',
  },
];

export const RESOURCES_DATA: ResourceRow[] = [
  {
    code: 'PROJ-2024-001',
    type: 'Proyector',
    serial: 'SN123456789',
    status: 'Asignado',
    assignedSpace: 'Aula 101',
    purchaseDate: '14/5/2023',
  },
  {
    code: 'COMP-2024-002',
    type: 'Computador de escritorio',
    serial: 'SN987654321',
    status: 'Asignado',
    assignedSpace: 'Laboratorio 1',
    purchaseDate: '19/11/2022',
  },
  {
    code: 'MICR-2023-015',
    type: 'Microscopio',
    serial: 'SN555555555',
    status: 'Asignado',
    assignedSpace: 'Lab. Biología',
    purchaseDate: '9/8/2021',
  },
  {
    code: 'PROJ-2024-003',
    type: 'Proyector',
    serial: 'SN444444444',
    status: 'Mantenimiento',
    assignedSpace: '',
    purchaseDate: '4/3/2020',
  },
  {
    code: 'COMP-2023-050',
    type: 'Computador de escritorio',
    serial: 'SN333333333',
    status: 'Dañado',
    assignedSpace: '',
    purchaseDate: '29/12/2019',
  },
  {
    code: 'PROJ-2024-005',
    type: 'Proyector',
    serial: 'SN222222222',
    status: 'Disponible',
    assignedSpace: '',
    purchaseDate: '30/6/2023',
  },
  {
    code: 'COMP-2024-010',
    type: 'Computador de escritorio',
    serial: 'SN111111111',
    status: 'Disponible',
    assignedSpace: '',
    purchaseDate: '14/6/2023',
  },
  {
    code: 'PIZR-2024-001',
    type: 'Pizarra digital',
    serial: 'SN000000000',
    status: 'Disponible',
    assignedSpace: '',
    purchaseDate: '24/4/2023',
  },
  {
    code: 'SILL-2024-010',
    type: 'Silla ergonómica',
    serial: 'SN999999999',
    status: 'Asignado',
    assignedSpace: 'Sala de conferencias',
    purchaseDate: '9/9/2022',
  },
  {
    code: 'SILL-2024-011',
    type: 'Silla ergonómica',
    serial: 'SN888888888',
    status: 'Asignado',
    assignedSpace: 'Sala de conferencias',
    purchaseDate: '9/9/2022',
  },
  {
    code: 'MICR-2024-002',
    type: 'Microscopio',
    serial: 'SN777777777',
    status: 'Disponible',
    assignedSpace: '',
    purchaseDate: '15/2/2023',
  },
  {
    code: 'PIZR-2024-002',
    type: 'Pizarra digital',
    serial: 'SN666666666',
    status: 'Asignado',
    assignedSpace: 'Aula 302',
    purchaseDate: '1/3/2023',
  },
];
