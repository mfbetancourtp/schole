<template>
  <div class="qr-pdf-exporter">
    <AppButton
      icon="file-pdf"
      label="Descargar todos (PDF)"
      variant="secondary"
      :disabled="loadingAll || loadingSelected"
      @click="downloadAll"
    />
    <AppButton
      v-if="selectedRows.length"
      icon="file-pdf"
      :label="`Descargar seleccionados (${selectedRows.length})`"
      variant="primary"
      :disabled="loadingAll || loadingSelected"
      @click="downloadSelected"
    />
    <span v-if="loadingAll || loadingSelected" class="qr-pdf-exporter__spinner">Generando PDF...</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import { GetAllQrsService } from '../services/getAllQrsService';

const getAllQrsService = new GetAllQrsService();

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 14;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const QR_SIZE = 28;
const ROW_HEIGHT = 38;
const HEADER_HEIGHT = 20;

function formatDate(val: string | null | undefined): string {
  if (!val || val === 'Qr no generado') return 'QR no generado';
  try {
    return new Date(val).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return val;
  }
}

async function buildPdf(records: any[], title: string): Promise<jsPDF> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const today = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  let y = MARGIN;

  const addHeader = () => {
    pdf.setFillColor(26, 54, 112);
    pdf.rect(0, 0, PAGE_WIDTH, HEADER_HEIGHT, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Akademia University', MARGIN, 9);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(title, MARGIN, 15);
    pdf.text(`Generado: ${today}`, PAGE_WIDTH - MARGIN, 15, { align: 'right' });
    pdf.setTextColor(0, 0, 0);
    y = HEADER_HEIGHT + 6;
  };

  const addFooter = (pageNum: number, totalPages: number) => {
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      `Página ${pageNum} de ${totalPages}`,
      PAGE_WIDTH / 2,
      PAGE_HEIGHT - 6,
      { align: 'center' }
    );
    pdf.setTextColor(0, 0, 0);
  };

  addHeader();

  for (let i = 0; i < records.length; i++) {
    const row = records[i];

    if (y + ROW_HEIGHT > PAGE_HEIGHT - 14) {
      pdf.addPage();
      addHeader();
    }

    // Card background
    pdf.setFillColor(248, 249, 252);
    pdf.roundedRect(MARGIN, y, CONTENT_WIDTH, ROW_HEIGHT, 2, 2, 'F');

    // Left: record info
    const textX = MARGIN + 3;
    let textY = y + 7;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(26, 54, 112);
    pdf.text(row.name ?? '—', textX, textY);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(80, 80, 80);
    textY += 5;

    const campus = row.campus?.name ?? row.campus ?? '—';
    const edificio = row.building?.name ?? row.edificio ?? '—';
    pdf.text(`Campus: ${campus}   Edificio: ${edificio}`, textX, textY);
    textY += 5;

    const desc = row.description ? String(row.description).slice(0, 55) : '—';
    pdf.text(`Descripción: ${desc}`, textX, textY);
    textY += 5;

    pdf.setTextColor(120, 120, 120);
    pdf.text(`Fecha QR: ${formatDate(row.createdAt)}`, textX, textY);

    // Right: QR code
    const qrX = MARGIN + CONTENT_WIDTH - QR_SIZE - 3;
    const qrY = y + (ROW_HEIGHT - QR_SIZE) / 2;

    try {
      const payload = JSON.stringify({ id: row.id, name: row.name });
      const qrDataUrl = await QRCode.toDataURL(payload, {
        width: 80,
        margin: 0,
        errorCorrectionLevel: 'L',
      });
      pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, QR_SIZE, QR_SIZE);
    } catch {
      pdf.setFontSize(7);
      pdf.setTextColor(180, 180, 180);
      pdf.text('QR', qrX + QR_SIZE / 2, qrY + QR_SIZE / 2, { align: 'center' });
    }

    pdf.setTextColor(0, 0, 0);
    y += ROW_HEIGHT + 4;
  }

  // Inject footers on all pages
  const totalPages = pdf.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    addFooter(p, totalPages);
  }

  return pdf;
}

export default defineComponent({
  name: 'QrPdfExporter',
  components: { AppButton },

  props: {
    params: {
      type: Object,
      default: () => ({}),
    },
    selectedRows: {
      type: Array,
      default: () => [],
    },
  },

  setup(props, { expose }) {
    const loadingAll = ref(false);
    const loadingSelected = ref(false);

    const downloadAll = async () => {
      loadingAll.value = true;
      try {
        const response = await getAllQrsService.run(props.params);
        const records: any[] = Array.isArray(response)
          ? response
          : response?.data ?? [];

        if (!records.length) {
          alert('No hay registros para exportar.');
          return;
        }

        const pdf = await buildPdf(records, 'Reporte de QRs — Todos los registros');
        pdf.save('reporte-qrs.pdf');
      } finally {
        loadingAll.value = false;
      }
    };

    const downloadOne = async (row: any) => {
      try {
        const pdf = await buildPdf([row], `Reporte de QR — ${row.name ?? row.id}`);
        pdf.save(`qr-${row.id ?? row.name ?? 'registro'}.pdf`);
      } catch (e) {
        console.error('Error generando PDF individual:', e);
      }
    };

    const downloadSelected = async () => {
      if (!props.selectedRows.length) return;
      loadingSelected.value = true;
      try {
        const pdf = await buildPdf(props.selectedRows as any[], 'Reporte de QRs — Seleccionados');
        pdf.save('reporte-qrs-seleccionados.pdf');
      } finally {
        loadingSelected.value = false;
      }
    };

    expose({ downloadOne });

    return { loadingAll, loadingSelected, downloadAll, downloadSelected };
  },
});
</script>

<style scoped>
.qr-pdf-exporter {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.qr-pdf-exporter__spinner {
  font-size: 0.85rem;
  color: #6b7280;
}
</style>
