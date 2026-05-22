import { ref } from 'vue';
import type { Certificate, CertificateListParams, CertificateListResponse } from '../dtos/certificate.dto';
import { certificateTemplates } from '../mocks/certificateTemplates';
import imgPreviewMock from '../mocks/certificado-preview-mock.png';

// Datos de ejemplo para desarrollo
const mockCertificates: Certificate[] = [
  {
    id: 1,
    name: certificateTemplates[0].name,
    description: certificateTemplates[0].description,
    imageUrl: imgPreviewMock,
    imagePreview: imgPreviewMock,
    createdAt: '2024-11-15T10:30:00Z',
    updatedAt: '2024-11-15T10:30:00Z',
    status: 'published',
    template: {
      id: parseInt(certificateTemplates[0].template.id),
      name: certificateTemplates[0].template.name,
      width: certificateTemplates[0].template.size.width,
      height: certificateTemplates[0].template.size.height,
      backgroundColor: certificateTemplates[0].template.background.value,
      elements: [],
    },
    canvas: certificateTemplates[0].canvas,
    variables: [
      {
        key: 'studentName',
        label: 'Nombre del Estudiante',
        type: 'text',
        required: true,
        description: 'Nombre completo del estudiante',
      },
      {
        key: 'course',
        label: 'Curso',
        type: 'text',
        required: true,
        description: 'Nombre del curso completado',
      },
      {
        key: 'date',
        label: 'Fecha',
        type: 'date',
        required: true,
        description: 'Fecha de emisión del certificado',
      },
    ],
  },
  {
    id: 2,
    name: 'Diploma de Graduación',
    description: 'Certificado oficial de graduación institucional',
    imageUrl: 'https://marketplace.canva.com/EAGMeMTHiWs/2/0/1600w/canva-certificado-de-reconocimiento-moderno-simple-minimalista-azul-zm2RvHqshhA.jpg',
    imagePreview: 'https://via.placeholder.com/200x150/059669/ffffff?text=Preview+2',
    createdAt: '2024-11-10T14:20:00Z',
    updatedAt: '2024-11-12T09:15:00Z',
    status: 'published',
    template: {
      id: 2,
      name: 'Template Graduación',
      width: 800,
      height: 600,
      backgroundColor: '#f8f9fa',
      elements: [],
    },
    variables: [
      {
        key: 'graduateName',
        label: 'Nombre del Graduado',
        type: 'text',
        required: true,
      },
      {
        key: 'degree',
        label: 'Título',
        type: 'text',
        required: true,
      },
      {
        key: 'institution',
        label: 'Institución',
        type: 'text',
        required: true,
      },
    ],
  },
  {
    id: 3,
    name: 'Certificado de Participación',
    description: 'Reconocimiento por participación en eventos académicos',
    imageUrl: 'https://marketplace.canva.com/EAGMeMTHiWs/2/0/1600w/canva-certificado-de-reconocimiento-moderno-simple-minimalista-azul-zm2RvHqshhA.jpg',
    imagePreview: 'https://via.placeholder.com/200x150/dc2626/ffffff?text=Preview+3',
    createdAt: '2024-11-08T16:45:00Z',
    updatedAt: '2024-11-08T16:45:00Z',
    status: 'draft',
    template: {
      id: 3,
      name: 'Template Participación',
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      elements: [],
    },
    variables: [
      {
        key: 'participantName',
        label: 'Nombre del Participante',
        type: 'text',
        required: true,
      },
      {
        key: 'eventName',
        label: 'Nombre del Evento',
        type: 'text',
        required: true,
      },
      {
        key: 'hours',
        label: 'Horas de Participación',
        type: 'number',
        required: false,
      },
    ],
  },
  {
    id: 4,
    name: 'Certificado de Competencias',
    description: 'Certificado que valida competencias específicas adquiridas',
    imageUrl: 'https://marketplace.canva.com/EAGMeMTHiWs/2/0/1600w/canva-certificado-de-reconocimiento-moderno-simple-minimalista-azul-zm2RvHqshhA.jpg',
    imagePreview: 'https://via.placeholder.com/200x150/7c3aed/ffffff?text=Preview+4',
    createdAt: '2024-11-05T11:10:00Z',
    updatedAt: '2024-11-07T13:25:00Z',
    status: 'published',
    template: {
      id: 4,
      name: 'Template Competencias',
      width: 800,
      height: 600,
      backgroundColor: '#fef7ff',
      elements: [],
    },
    variables: [
      {
        key: 'holderName',
        label: 'Nombre del Portador',
        type: 'text',
        required: true,
      },
      {
        key: 'competencies',
        label: 'Competencias',
        type: 'text',
        required: true,
      },
      {
        key: 'validUntil',
        label: 'Válido Hasta',
        type: 'date',
        required: false,
      },
    ],
  },
  {
    id: 5,
    name: 'Reconocimiento Especial',
    description: 'Certificado para reconocimientos especiales y logros destacados',
    imageUrl: 'https://marketplace.canva.com/EAGMeMTHiWs/2/0/1600w/canva-certificado-de-reconocimiento-moderno-simple-minimalista-azul-zm2RvHqshhA.jpg',
    imagePreview: 'https://via.placeholder.com/200x150/ea580c/ffffff?text=Preview+5',
    createdAt: '2024-11-01T08:30:00Z',
    updatedAt: '2024-11-01T08:30:00Z',
    status: 'archived',
    template: {
      id: 5,
      name: 'Template Reconocimiento',
      width: 800,
      height: 600,
      backgroundColor: '#fff7ed',
      elements: [],
    },
    variables: [
      {
        key: 'recipientName',
        label: 'Nombre del Destinatario',
        type: 'text',
        required: true,
      },
      {
        key: 'achievement',
        label: 'Logro',
        type: 'text',
        required: true,
      },
      {
        key: 'recognitionDate',
        label: 'Fecha de Reconocimiento',
        type: 'date',
        required: true,
      },
    ],
  },
];

export class CertificateService {
  private certificates = ref(mockCertificates);

  async getCertificates(params: CertificateListParams): Promise<CertificateListResponse> {
    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 300));

    let filteredCertificates = [...this.certificates.value];

    // Aplicar filtros
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredCertificates = filteredCertificates.filter((cert) => cert.name.toLowerCase().includes(searchLower) || cert.description?.toLowerCase().includes(searchLower));
    }

    if (params.status) {
      filteredCertificates = filteredCertificates.filter((cert) => cert.status === params.status);
    }

    // Aplicar ordenamiento
    if (params.sortBy) {
      filteredCertificates.sort((a, b) => {
        const aValue = String(a[params.sortBy as keyof Certificate] || '');
        const bValue = String(b[params.sortBy as keyof Certificate] || '');

        if (params.sortOrder === 'desc') {
          return bValue.localeCompare(aValue);
        }
        return aValue.localeCompare(bValue);
      });
    }

    // Calcular paginación
    const total = filteredCertificates.length;
    const totalPages = Math.ceil(total / params.perPage);
    const startIndex = (params.page - 1) * params.perPage;
    const endIndex = startIndex + params.perPage;
    const data = filteredCertificates.slice(startIndex, endIndex);

    return {
      data,
      total,
      currentPage: params.page,
      perPage: params.perPage,
      totalPages,
    };
  }

  async getCertificateById(id: number): Promise<Certificate | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return this.certificates.value.find((cert) => cert.id === id) || null;
  }

  async deleteCertificate(id: number): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = this.certificates.value.findIndex((cert) => cert.id === id);
    if (index !== -1) {
      this.certificates.value.splice(index, 1);
      return true;
    }
    return false;
  }

  async duplicateCertificate(id: number): Promise<Certificate | null> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const original = this.certificates.value.find((cert) => cert.id === id);
    if (!original) return null;

    const newCertificate: Certificate = {
      ...original,
      id: Math.max(...this.certificates.value.map((c) => c.id)) + 1,
      name: `${original.name} (Copia)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.certificates.value.unshift(newCertificate);
    return newCertificate;
  }
}

export const certificateService = new CertificateService();
