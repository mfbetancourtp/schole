<template>
  <div class="cvWrap">
    <!-- Print Button (solo pantalla) -->
    <div class="cvActions printHidden"></div>

    <!-- Loading -->
    <AppPulseLoading v-if="loading" />

    <!-- Documento -->
    <div v-else class="cvDoc">
      <!-- PAGE 1 -->
      <div class="cvPage">
        <!-- Header -->
        <header class="cvHeader">
          <div class="cvHeaderTop">
            <div class="cvBrand">
              <div class="cvLogoWrap">
                <img v-if="cvView.institution.logoInstitutional" :src="cvView.institution.logoInstitutional" :alt="cvView.institution.name || 'Institución'" class="cvLogoImg" />
                <div v-else class="cvLogoFallback">
                  {{ institutionInitials }}
                </div>
              </div>

              <div class="cvBrandText">
                <p class="cvBrandLine1">
                  {{ cvView.institution.name || 'Institución Educativa' }}
                </p>
                <p class="cvBrandLine2">Hoja de Vida Docente</p>
              </div>
            </div>

            <div class="cvDate">
              <p class="cvDateLabel">Fecha de generación:</p>
              <p class="cvDateValue">{{ currentDate }}</p>
            </div>
          </div>

          <h1 class="cvDocTitle">Hoja de Vida Docente</h1>
        </header>

        <!-- Personal -->
        <section class="cvSection">
          <div class="cvPersonal">
            <div class="cvPhotoWrap">
              <img :src="cvView.personal.photo" alt="Foto del docente" class="cvPhoto" />
            </div>

            <div class="cvPersonalInfo">
              <h2 class="cvName">{{ cvView.personal.fullName }}</h2>

              <div class="cvGrid2">
                <div class="cvInfoRow">
                  <AppIcon icon="id-card" class="cvInfoIcon" />
                  <span>{{ cvView.personal.documentId }}</span>
                </div>

                <div class="cvInfoRow">
                  <AppIcon icon="envelope" class="cvInfoIcon" />
                  <span>{{ cvView.personal.email }}</span>
                </div>

                <div class="cvInfoRow">
                  <AppIcon icon="phone" class="cvInfoIcon" />
                  <span>{{ cvView.personal.phone }}</span>
                </div>

                <div class="cvInfoRow">
                  <AppIcon icon="map-marker-alt" class="cvInfoIcon" />
                  <span>
                    {{ cvView.personal.city }},
                    {{ cvView.personal.country }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Perfil -->
        <section class="cvSection">
          <h3 class="cvSectionTitle">Perfil Profesional</h3>
          <div class="cvText cvTextProfile" v-html="cvView.profile"></div>
        </section>

        <!-- Formación Académica -->
        <section class="cvSection">
          <h3 class="cvSectionTitle">Formación Académica (Educación Formal)</h3>

          <div class="cvTimeline">
            <div v-for="(item, i) in cvView.academic" :key="i" class="cvTimelineItem">
              <p class="cvBold">{{ item.level }}</p>
              <p class="cvTextStrong">{{ item.title }}</p>
              <p class="cvMuted">{{ item.institution }} • {{ item.country }}</p>
              <p class="cvMuted">{{ item.startYear }} - {{ item.endYear }}</p>
            </div>
          </div>
        </section>

        <!-- Complementaria -->
        <section class="cvSection">
          <h3 class="cvSectionTitle">Formación Complementaria</h3>

          <div class="cvList">
            <div v-for="(item, i) in cvView.complementary" :key="i" class="cvBulletRow">
              <span class="cvBullet">•</span>
              <div>
                <p class="cvTextStrong">
                  <span class="cvBold">{{ item.type }}:</span> {{ item.name }}
                </p>
                <p class="cvMuted">{{ item.institution }} • {{ item.duration }} • {{ item.year }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Experiencia Laboral -->
        <section class="cvSection">
          <h3 class="cvSectionTitle">Experiencia Laboral</h3>

          <div class="cvBlocks">
            <div v-for="(item, i) in cvView.experience" :key="i" class="cvBlock">
              <div class="cvBlockHead">
                <div>
                  <p class="cvBold">{{ item.position }}</p>
                  <p class="cvTextStrong">{{ item.company }}</p>
                </div>
                <p class="cvMuted cvNowrap">{{ item.startDate }} - {{ item.endDate }}</p>
              </div>
              <p class="cvText">{{ item.description }}</p>
            </div>
          </div>
        </section>

        <!-- Footer -->
        <footer class="cvFooter">
          <span>Sistema de Gestión Académica (SGA)</span>
          <span>Página 1 de 2</span>
          <span>Documento generado automáticamente</span>
        </footer>
      </div>

      <!-- PAGE 2 -->
      <div class="cvPage">
        <div class="cvContinueHead">
          <p class="cvMuted">{{ cvView.personal.fullName }}</p>
          <p class="cvMuted">Continuación</p>
        </div>

        <!-- Experiencia Docente -->
        <section class="cvSection">
          <h3 class="cvSectionTitle">Experiencia Docente</h3>

          <div class="cvTimeline gray">
            <div v-for="(item, i) in cvView.teaching" :key="i" class="cvTimelineItem gray">
              <p class="cvBold">{{ item.institution }}</p>
              <p class="cvTextStrong">{{ item.program }}</p>
              <p class="cvMuted"><span class="cvBold">Asignaturas:</span> {{ item.subjects }}</p>
              <p class="cvMuted">{{ item.level }} • {{ item.period }}</p>
            </div>
          </div>
        </section>

        <!-- Producción -->
        <section class="cvSection">
          <h3 class="cvSectionTitle">Producción Intelectual</h3>

          <div class="cvList">
            <div v-for="(item, i) in cvView.publications" :key="i" class="cvPub">
              <span class="cvIndex">[{{ i }}]</span>
              <div>
                <p class="cvTextStrong">
                  <span class="cvBold">{{ item.title }}</span>
                </p>
                <p class="cvMuted">{{ item.type }} • {{ item.medium }} • {{ item.year }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Eventos -->
        <section class="cvSection">
          <h3 class="cvSectionTitle">Eventos Académicos</h3>

          <div class="cvList">
            <div v-for="(item, i) in cvView.events" :key="i" class="cvEvent">
              <p class="cvTextStrong">
                <span class="cvBold">{{ item.name }}</span>
              </p>
              <p class="cvMuted">{{ item.type }} • {{ item.role }} • {{ item.year }}</p>
            </div>
          </div>
        </section>

        <!-- Premios -->
        <section class="cvSection">
          <h3 class="cvSectionTitle">Premios y Reconocimientos</h3>

          <div class="cvTimeline gold">
            <div v-for="(item, i) in cvView.awards" :key="i" class="cvTimelineItem gold">
              <p class="cvBold">{{ item.name }}</p>
              <p class="cvTextStrong">{{ item.entity }}</p>
              <p class="cvText">{{ item.description }}</p>
              <p class="cvMuted">Año: {{ item.year }}</p>
            </div>
          </div>
        </section>

        <!-- Dirección -->
        <section class="cvSection">
          <h3 class="cvSectionTitle">Dirección y Participación Académica</h3>

          <div class="cvList">
            <div v-for="(item, i) in cvView.direction" :key="i" class="cvEvent">
              <p class="cvTextStrong">
                <span class="cvBold">{{ item.activity }}</span>
              </p>
              <p class="cvMuted">{{ item.institution }} • {{ item.year }}</p>
            </div>
          </div>
        </section>

        <footer class="cvFooter">
          <span>Sistema de Gestión Académica (SGA)</span>
          <span>Página 2 de 2</span>
          <span>Documento generado automáticamente</span>
        </footer>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, reactive, ref } from 'vue';

import AppIcon from '../../../../shared/components/AppIcon.vue';
import AppPulseLoading from '../../../../shared/components/AppPulseLoading.vue';

// ✅ Services (según tu ZIP)
import { GetAcademicBackgroundWithPaginationService } from '../../services/getAcademicBackgroundWithPagination.service';
import { GetSupplementaryTrainingsWithPaginationService } from '../../services/getSupplementaryTrainingsWithPagination.service';
import { GetWorkExperiencesWithPaginationService } from '../../services/getWorkExperiencesWithPagination.service';
import { GetTeachingExperiencesWithPaginationService } from '../../services/getTeachingExperiencesWithPagination.service';
import { GetIntellectualProductionsWithPaginationService } from '../../services/getIntellectualProductionsWithPagination.service';
import { GetAcademicEventsWithPaginationService } from '../../services/getAcademicEventsWithPagination.service';
import { GetRecognitionsWithPaginationService } from '../../services/getRecognitionsWithPagination.service';
import { GetProfessionalProfilesNotPaginationService } from '../../services/getProfessionalProfilesWithPagination.service';

export default defineComponent({
  name: 'CvTemplateStep',
  components: { AppIcon, AppPulseLoading },
  setup() {
    const loading = ref(true);
    const peopleId = ref<number | null>(null);

    // instances
    const getAcademicBackgroundWithPaginationService = new GetAcademicBackgroundWithPaginationService();

    const getSupplementaryTrainingsWithPaginationService = new GetSupplementaryTrainingsWithPaginationService();

    const getWorkExperiencesWithPaginationService = new GetWorkExperiencesWithPaginationService();

    const getTeachingExperiencesWithPaginationService = new GetTeachingExperiencesWithPaginationService();

    const getIntellectualProductionsWithPaginationService = new GetIntellectualProductionsWithPaginationService();

    const getAcademicEventsWithPaginationService = new GetAcademicEventsWithPaginationService();

    const getRecognitionsWithPaginationService = new GetRecognitionsWithPaginationService();

    const getProfessionalProfilesWithPaginationService = new GetProfessionalProfilesNotPaginationService();

    const currentDate = computed(() => {
      const d = new Date();
      return d.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
      });
    });

    // helpers response
    const extractItems = (response: any): any[] => {
      // muchos servicios ya devuelven response.data (según ZIP)
      if (Array.isArray(response)) return response;
      if (Array.isArray(response?.data)) return response.data;
      if (Array.isArray(response?.items)) return response.items;
      if (Array.isArray(response?.data?.items)) return response.data.items;
      if (Array.isArray(response?.results)) return response.results;
      return [];
    };

    const normalizeDate = (d?: any) => (d ? String(d).slice(0, 10) : '');

    const joinSubjects = (s?: string) =>
      (s || '')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
        .join(', ');

    const yearRangeFrom = (start?: string, end?: string | null, isCurrent?: boolean) => {
      const s = normalizeDate(start);
      const e = isCurrent ? 'Actual' : normalizeDate(end);
      return `${s || '—'} - ${e || '—'}`;
    };

    const decodeHtmlEntities = (html?: string) => {
      const value = String(html || '');
      if (!value) return '';
      if (typeof document === 'undefined') return value;

      const textarea = document.createElement('textarea');
      textarea.innerHTML = value;
      return textarea.value;
    };

    // view model
    const cvView = reactive<any>({
      institution: {
        name: '',
        logoInstitutional: '',
      },
      personal: {
        photo: '',
        fullName: '',
        documentId: '',
        email: '',
        phone: '',
        city: '',
        country: '',
      },
      profile: '',
      academic: [],
      complementary: [],
      experience: [],
      teaching: [],
      publications: [],
      events: [],
      awards: [],
      direction: [],
    });
    const institutionInitials = computed(() => {
      const name = cvView.institution.name || '';
      if (!name) return 'IE';

      return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word: string) => word.charAt(0).toUpperCase())
        .join('');
    });
    // ✅ Igual que PersonalInfoStep: u.people ?? u
    const mapPersonalFromLocalStorage = (rawUser: any) => {
      const u = rawUser?.people ?? rawUser ?? {};

      const firstName = u?.names || u?.firstName || '';
      const lastNames = u?.lastNames || `${u?.firstLastName || ''} ${u?.secondLastName || ''}`.trim();

      cvView.personal.photo = u?.photoUrl || u?.avatar || u?.avatarResume || '';

      cvView.personal.fullName = u?.fullName || `${firstName} ${lastNames}`.trim() || '';

      cvView.personal.documentId = u?.documentId || u?.documentNumber || u?.identification || '';

      cvView.personal.email = u?.email || '';
      cvView.personal.phone = u?.mobile || u?.cellphone || u?.phone || '';
      cvView.personal.city = u?.city || u?.homeMunicipality || '';
      cvView.personal.country = u?.nationality || u?.country || 'Colombia';
    };

    // mappers (según estructuras que vi en tus steps)
    const mapProfile = (response: any) => {
      const items = extractItems(response);
      const first = items?.[0] ?? response?.data ?? response ?? null;
      const html = first?.description ?? first?.profile ?? first?.html ?? '';

      cvView.profile = decodeHtmlEntities(html);
    };
    const mapAcademic = (items: any[]) => {
      cvView.academic = (items || []).map((x: any) => ({
        level: x?.academicLevel?.name || '—',
        title: x?.degreeObtained || '—',
        institution: x?.institution || '—',
        country: x?.country?.name || '—',
        startYear: x?.startDate ? String(x.startDate).slice(0, 4) : '—',
        endYear: x?.status === 'Finalizado' ? (x?.endDate ? String(x.endDate).slice(0, 4) : '—') : 'Actual',
      }));
    };

    const mapComplementary = (items: any[]) => {
      cvView.complementary = (items || []).map((x: any) => ({
        type: x?.educationLevel?.name || '—',
        name: x?.courseName || '—',
        institution: x?.institution || '—',
        duration: x?.hourlyIntensity ? `${x.hourlyIntensity} horas` : '—',
        year: x?.dateCompletion ? String(x.dateCompletion).slice(0, 4) : '—',
      }));
    };

    const mapExperience = (items: any[]) => {
      cvView.experience = (items || []).map((x: any) => ({
        position: x?.role || '—',
        company: x?.companyName || '—',
        startDate: normalizeDate(x?.startDate) || '—',
        endDate: !x?.endDate ? 'Actual' : normalizeDate(x?.endDate) || '—',
        description: x?.functions || '',
      }));
    };
    const mapInstitutionFromLocalStorage = () => {
      try {
        const raw = localStorage.getItem('institutions');
        if (!raw) return;

        const parsed = JSON.parse(raw);

        // puede venir como array o como objeto
        const institution = Array.isArray(parsed) ? parsed[0] : parsed;

        cvView.institution.name = institution?.name || institution?.institutionName || institution?.institution?.name || '';

        cvView.institution.logoInstitutional = institution?.logoInstitutional || institution?.logo || institution?.institution?.logoInstitutional || '';
      } catch (error) {
        console.log('Error leyendo institutions del localStorage:', error);
      }
    };
    const mapTeaching = (items: any[]) => {
      cvView.teaching = (items || []).map((x: any) => ({
        institution: x?.institutionName || '—',
        program: x?.academicProgram || '—',
        subjects: joinSubjects(x?.courseName || ''),
        level: x?.educationType?.name || '—',
        period: yearRangeFrom(x?.startDate, x?.endDate, !x?.endDate),
      }));
    };

    const mapPublications = (items: any[]) => {
      cvView.publications = (items || []).map((x: any) => ({
        title: x?.title || '—',
        type: x?.typeProduction?.name || '—',
        medium: x?.publicationMedium || '—',
        year: x?.year || '—',
      }));
    };

    const mapEvents = (items: any[]) => {
      cvView.events = (items || []).map((x: any) => ({
        name: x?.eventName || '—',
        type: x?.eventType?.name || '—',
        role: x?.role?.name || '—',
        year: x?.year || '—',
      }));
    };

    const mapAwards = (items: any[]) => {
      cvView.awards = (items || []).map((x: any) => ({
        name: x?.recognitionName || '—',
        entity: x?.awardingEntity || '—',
        description: x?.description || '',
        year: x?.year || '—',
      }));
    };

    const loadAll = async () => {
      loading.value = true;

      try {
        mapInstitutionFromLocalStorage();

        const raw = localStorage.getItem('user');
        if (raw) {
          const userParsed = JSON.parse(raw);
          peopleId.value = userParsed?.people?.id ?? null;
          mapPersonalFromLocalStorage(userParsed);
        }

        const pid = peopleId.value;

        const [profileResp, academicResp, complementaryResp, experienceResp, teachingResp, publicationsResp, eventsResp, awardsResp] = await Promise.all([
          getProfessionalProfilesWithPaginationService.run({
            noPag: true,
            peopleId: pid,
          }),

          getAcademicBackgroundWithPaginationService.run({ noPag: true }),
          getSupplementaryTrainingsWithPaginationService.run({ noPag: true }),
          getWorkExperiencesWithPaginationService.run({ noPag: true }),
          getTeachingExperiencesWithPaginationService.run({ noPag: true }),
          getIntellectualProductionsWithPaginationService.run({ noPag: true }),
          getAcademicEventsWithPaginationService.run({ noPag: true }),
          getRecognitionsWithPaginationService.run({ noPag: true }),
        ]);

        mapProfile(profileResp);
        mapAcademic(extractItems(academicResp));
        mapComplementary(extractItems(complementaryResp));
        mapExperience(extractItems(experienceResp));
        mapTeaching(extractItems(teachingResp));
        mapPublications(extractItems(publicationsResp));
        mapEvents(extractItems(eventsResp));
        mapAwards(extractItems(awardsResp));

        cvView.direction = [];
      } catch (e) {
        console.log('Error cargando CV:', e);
      } finally {
        loading.value = false;
      }
    };

    onMounted(loadAll);

    const printPdf = () => window.print();

    return {
      loading,
      currentDate,
      cvView,
      printPdf,
      institutionInitials,
    };
  },
});
</script>

<style scoped>
/* =========================
   TOKENS
========================= */
.cvWrap {
  --cv-primary: var(--color-primary, #1b2e83);
  --cv-primary-soft: rgba(27, 46, 131, 0.08);
  --cv-text: #344054;
  --cv-title: #101828;
  --cv-muted: #667085;
  --cv-border: #d0d5dd;
  --cv-border-soft: #eaecf0;
  --cv-surface: #ffffff;
  --cv-surface-soft: #f8fafc;
  --cv-shadow: 0 18px 42px rgba(15, 23, 42, 0.16);

  width: 100%;
}

/* =========================
   ACTIONS
========================= */
.cvActions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 18px;
}

.btnExport {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 12px;
  font-weight: 700;
}

/* =========================
   DOCUMENT
========================= */
.cvDoc {
  background: var(--cv-surface);
  box-shadow: var(--cv-shadow);
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(16, 24, 40, 0.06);
}

.cvPage {
  padding: 30px 36px;
  min-height: 1122px;
  position: relative;
  background: linear-gradient(180deg, #ffffff 0%, #fcfcfd 100%);
  break-after: page;
  page-break-after: always;
}

/* =========================
   HEADER
========================= */
.cvHeader {
  position: relative;
  border-bottom: 1px solid var(--cv-border);
  padding-bottom: 20px;
  margin-bottom: 26px;
}

.cvHeaderTop {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 14px;
}

.cvBrand {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.cvLogoWrap {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid var(--cv-border-soft);
  box-shadow: 0 8px 20px rgba(16, 24, 40, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex: 0 0 auto;
}

.cvLogoImg {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #fff;
}

.cvLogoFallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--cv-primary), #3147b0);
  color: #fff;
  font-weight: 800;
  font-size: 20px;
  letter-spacing: 0.6px;
}

.cvBrandText {
  min-width: 0;
}

.cvBrandLine1 {
  margin: 0;
  color: var(--cv-title);
  font-size: 16px;
  font-weight: 800;
  line-height: 1.2;
}

.cvBrandLine2 {
  margin: 4px 0 0 0;
  color: var(--cv-muted);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.cvDate {
  text-align: right;
  background: var(--cv-surface-soft);
  border: 1px solid var(--cv-border-soft);
  border-radius: 14px;
  padding: 10px 12px;
  min-width: 180px;
}

.cvDateLabel {
  margin: 0 0 4px 0;
  font-size: 11px;
  color: #98a2b3;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.cvDateValue {
  margin: 0;
  font-size: 13px;
  color: var(--cv-text);
  font-weight: 700;
}

.cvDocTitle {
  margin: 10px 0 0 0;
  text-align: center;
  font-size: 24px;
  font-weight: 900;
  color: var(--cv-title);
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* =========================
   PERSONAL
========================= */
.cvPersonal {
  display: grid;
  grid-template-columns: 128px 1fr;
  gap: 20px;
  align-items: start;
}

.cvPhotoWrap {
  display: flex;
  justify-content: center;
}

.cvPhoto {
  width: 128px;
  height: 128px;
  border-radius: 18px;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 10px 24px rgba(16, 24, 40, 0.12);
  background: #f2f4f7;
}

.cvPersonalInfo {
  background: var(--cv-surface-soft);
  border: 1px solid var(--cv-border-soft);
  border-radius: 18px;
  padding: 16px 18px;
}

.cvName {
  margin: 0 0 14px 0;
  font-size: 22px;
  font-weight: 900;
  color: var(--cv-title);
  line-height: 1.2;
}

.cvGrid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 18px;
}

.cvInfoRow {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  font-size: 13px;
  color: #475467;
}

.cvInfoIcon {
  font-size: 14px;
  color: var(--cv-primary);
  flex: 0 0 auto;
}

/* =========================
   SECTIONS
========================= */
.cvSection {
  margin-bottom: 22px;
}

.cvSectionTitle {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 900;
  color: var(--cv-title);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 10px 14px;
  border-left: 4px solid var(--cv-primary);
  background: linear-gradient(90deg, var(--cv-primary-soft), transparent);
  border-radius: 0 12px 12px 0;
}

/* =========================
   TEXT
========================= */
.cvText {
  margin: 0;
  font-size: 13px;
  line-height: 1.75;
  color: var(--cv-text);
  text-align: justify;
}

.cvTextProfile {
  font-size: 13px;
  line-height: 1.75;
  color: var(--cv-text);
  text-align: justify;
}

.cvTextProfile :deep(p) {
  margin: 0 0 12px;
  font-size: 13px;
  line-height: 1.75;
  color: var(--cv-text);
  text-align: justify;
}

.cvTextProfile :deep(strong),
.cvTextProfile :deep(b) {
  font-weight: 900 !important;
  color: var(--cv-title);
}

.cvTextProfile :deep(ol),
.cvTextProfile :deep(ul) {
  margin: 0 0 12px 22px;
  padding-left: 18px;
  color: var(--cv-text);
  line-height: 1.75;
  text-align: left;
}

.cvTextProfile :deep(ol) {
  list-style-type: decimal;
}

.cvTextProfile :deep(ul) {
  list-style-type: disc;
}

.cvTextProfile :deep(li) {
  margin: 2px 0;
  padding-left: 2px;
  font-size: 13px;
}

.cvTextProfile :deep(figure.table),
.cvTextProfile :deep(figure) {
  margin: 12px 0;
  overflow-x: auto;
}

.cvTextProfile :deep(table) {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  color: var(--cv-text);
  font-size: 13px;
  line-height: 1.45;
  text-align: left;
}

.cvTextProfile :deep(th),
.cvTextProfile :deep(td) {
  border: 1px solid #b7bcc7;
  padding: 6px 8px;
  vertical-align: top;
}

.cvTextProfile :deep(th) {
  font-weight: 800;
  color: var(--cv-title);
  background: #f8fafc;
}

.cvTextProfile :deep(a) {
  color: var(--cv-primary);
  text-decoration: underline;
}

.cvTextProfile :deep(blockquote) {
  margin: 0 0 12px 18px;
  padding-left: 12px;
  border-left: 3px solid var(--cv-border);
  color: var(--cv-muted);
}

.cvTextStrong {
  margin: 0;
  font-size: 13px;
  color: #1d2939;
  line-height: 1.5;
}

.cvBold {
  font-weight: 800;
}

.cvMuted {
  margin: 3px 0 0 0;
  font-size: 12px;
  color: var(--cv-muted);
  line-height: 1.5;
}

.cvNowrap {
  white-space: nowrap;
}

/* =========================
   TIMELINE / LISTS
========================= */
.cvTimeline {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cvTimelineItem {
  border-left: 3px solid var(--cv-primary);
  background: #fff;
  border-radius: 0 14px 14px 0;
  border-top: 1px solid var(--cv-border-soft);
  border-right: 1px solid var(--cv-border-soft);
  border-bottom: 1px solid var(--cv-border-soft);
  padding: 12px 14px 12px 16px;
}

.cvTimeline.gray .cvTimelineItem.gray {
  border-left-color: #98a2b3;
}

.cvTimeline.gold .cvTimelineItem.gold {
  border-left-color: #c48a00;
  background: linear-gradient(90deg, rgba(196, 138, 0, 0.06), #fff 18%);
}

.cvList {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cvBulletRow,
.cvEvent,
.cvPub {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  background: #fff;
  border: 1px solid var(--cv-border-soft);
  border-radius: 14px;
  padding: 12px 14px;
}

.cvBullet {
  color: var(--cv-primary);
  font-weight: 900;
  line-height: 1.4;
  flex: 0 0 auto;
}

.cvIndex {
  font-size: 12px;
  color: var(--cv-primary);
  font-weight: 900;
  flex: 0 0 auto;
  min-width: 26px;
}

/* =========================
   EXPERIENCE BLOCKS
========================= */
.cvBlocks {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cvBlock {
  background: #fff;
  border: 1px solid var(--cv-border-soft);
  border-radius: 16px;
  padding: 14px 16px;
}

.cvBlockHead {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 8px;
}

/* =========================
   PAGE 2 HEADER
========================= */
.cvContinueHead {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--cv-border);
}

/* =========================
   FOOTER
========================= */
.cvFooter {
  position: absolute;
  left: 36px;
  right: 36px;
  bottom: 18px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 11px;
  color: #98a2b3;
  border-top: 1px solid var(--cv-border-soft);
  padding-top: 10px;
}

/* =========================
   RESPONSIVE
========================= */
@media (max-width: 900px) {
  .cvHeaderTop {
    flex-direction: column;
    align-items: stretch;
  }

  .cvDate {
    text-align: left;
    min-width: auto;
  }

  .cvPersonal {
    grid-template-columns: 1fr;
  }

  .cvPhotoWrap {
    justify-content: flex-start;
  }

  .cvGrid2 {
    grid-template-columns: 1fr;
  }

  .cvBlockHead {
    flex-direction: column;
  }
}

/* =========================
   PRINT
========================= */
@media print {
  .printHidden {
    display: none !important;
  }

  .cvDoc {
    box-shadow: none !important;
    border-radius: 0 !important;
    border: none !important;
  }

  .cvPage {
    min-height: auto !important;
    padding: 16mm 14mm !important;
    background: #fff !important;
  }

  .cvPersonalInfo,
  .cvTimelineItem,
  .cvBulletRow,
  .cvEvent,
  .cvPub,
  .cvBlock {
    box-shadow: none !important;
    background: #fff !important;
  }

  @page {
    size: A4;
    margin: 10mm;
  }
}
</style>
