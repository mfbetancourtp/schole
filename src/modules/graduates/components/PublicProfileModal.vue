<template>
  <AppFormModal title="Perfil Público">
    <template #content>
      <div class="public-hero">
        <div class="public-avatar">
          <img v-if="profile.photoUrl" :src="profile.photoUrl" alt="Foto" class="public-avatar-img" />
          <span v-else class="public-avatar-initials">{{ initials }}</span>
        </div>
        <div class="public-hero-info">
          <h2 class="public-name">{{ profile.fullName }}</h2>
          <p class="public-program">{{ profile.program }}</p>
          <div class="public-meta">
            <span><AppIcon icon="graduation-cap" class="pub-meta-icon" /> Graduado {{ profile.graduationYear }}</span>
            <span><AppIcon icon="map-marker-alt" class="pub-meta-icon" /> {{ profile.city }}, {{ profile.country }}</span>
          </div>
        </div>
      </div>

      <div class="public-body">
        <section class="pub-section">
          <h3 class="pub-section-title">ACERCA DE</h3>
          <p class="pub-summary">{{ profile.professionalSummary }}</p>
        </section>

        <hr class="pub-divider" />

        <section class="pub-section">
          <h3 class="pub-section-title">ENLACES</h3>
          <div class="pub-links">
            <a v-if="profile.email" :href="`mailto:${profile.email}`" class="pub-link pub-link--email"> <AppIcon icon="envelope" class="pub-meta-icon" /> Email </a>
            <a v-if="profile.linkedin" :href="toExternalUrl(profile.linkedin)" target="_blank" rel="noopener noreferrer" class="pub-link pub-link--linkedin">
              <AppIcon icon="external-link-alt" class="pub-meta-icon" />
              LinkedIn
            </a>
            <a v-if="profile.portfolio" :href="toExternalUrl(profile.portfolio)" target="_blank" rel="noopener noreferrer" class="pub-link pub-link--portfolio">
              <AppIcon icon="globe" class="pub-meta-icon" /> Portafolio
            </a>
          </div>
        </section>

        <template v-if="workExperiences.length">
          <hr class="pub-divider" />
          <section class="pub-section">
            <h3 class="pub-section-title">EXPERIENCIA LABORAL</h3>
            <div class="pub-items-list">
              <div v-for="exp in workExperiences" :key="exp.id" class="pub-item">
                <div class="pub-item-icon pub-item-icon--blue">
                  <AppIcon icon="briefcase" />
                </div>
                <div class="pub-item-body">
                  <p class="pub-item-title">{{ exp.jobTitle }}</p>
                  <p class="pub-item-sub">{{ exp.company }}</p>
                  <p class="pub-item-date">
                    {{ exp.startDate }} –
                    {{ exp.currentlyWorksThere ? 'Presente' : exp.endDate || '—' }}
                  </p>
                  <p class="pub-item-desc">{{ exp.functionsDescription }}</p>
                </div>
              </div>
            </div>
          </section>
        </template>

        <template v-if="educations.length">
          <hr class="pub-divider" />
          <section class="pub-section">
            <h3 class="pub-section-title">EDUCACIÓN ADICIONAL</h3>
            <div class="pub-items-list">
              <div v-for="edu in educations" :key="edu.id" class="pub-item">
                <div class="pub-item-icon pub-item-icon--purple">
                  <AppIcon icon="certificate" />
                </div>
                <div class="pub-item-body">
                  <p class="pub-item-title">{{ edu.title }}</p>
                  <p class="pub-item-sub">{{ edu.institution }}</p>
                  <p class="pub-item-date">
                    {{ edu.startDate }} –
                    {{ edu.currentlyStudyThere ? 'Presente' : edu.endDate || '—' }}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </template>

        <template v-if="skills.length">
          <hr class="pub-divider" />
          <section class="pub-section">
            <h3 class="pub-section-title">HABILIDADES</h3>
            <div class="pub-skills-grid">
              <div v-for="skill in skills.slice(0, 8)" :key="skill.id" class="pub-skill-item">
                <p class="pub-skill-name">{{ skill.name }}</p>
                <div class="pub-stars">
                  <AppIcon v-for="s in 5" :key="s" icon="star" :class="s <= skillStars(skill.level) ? 'star-filled' : 'star-empty'" />
                </div>
              </div>
            </div>
          </section>
        </template>

        <template v-if="languages.length">
          <hr class="pub-divider" />
          <section class="pub-section">
            <h3 class="pub-section-title">IDIOMAS</h3>
            <div class="pub-languages">
              <div v-for="lang in languages" :key="lang.id" class="pub-lang-item">
                <span class="pub-lang-code">{{ lang.code }}</span>
                <div>
                  <p class="pub-lang-name">{{ lang.language }}</p>
                  <p class="pub-lang-level">{{ lang.conversationLevel }}</p>
                </div>
              </div>
            </div>
          </section>
        </template>
      </div>
    </template>

    <template #actions>
      <span></span>
    </template>
  </AppFormModal>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import AppFormModal from '../../../shared/components/Modal/AppFormModal.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import { AdditionalEducation, GraduateProfileDto, WorkExperience } from '../dtos/graduateProfile.dto';
import { SkillDto, SkillLevel, SKILL_LEVEL_STARS } from '../dtos/skill.dto';
import { LanguageDto } from '../dtos/language.dto';

export default defineComponent({
  name: 'PublicProfileModal',
  components: { AppFormModal, AppIcon },
  props: {
    profile: { type: Object as PropType<GraduateProfileDto>, required: true },
    workExperiences: {
      type: Array as PropType<WorkExperience[]>,
      default: () => [],
    },
    educations: {
      type: Array as PropType<AdditionalEducation[]>,
      default: () => [],
    },
    skills: { type: Array as PropType<SkillDto[]>, default: () => [] },
    languages: { type: Array as PropType<LanguageDto[]>, default: () => [] },
  },
  setup(props) {
    const initials = computed(() =>
      props.profile.fullName
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
    );
    const skillStars = (level: SkillLevel) => SKILL_LEVEL_STARS[level] ?? 1;
    const toExternalUrl = (url: string) => (url && !/^https?:\/\//i.test(url) ? `https://${url}` : url);
    return { initials, skillStars, toExternalUrl };
  },
});
</script>

<style scoped>
/* Hero */
.public-hero {
  background: linear-gradient(135deg, #1e40af, #3b82f6);
  border-radius: 8px 8px 0 0;
  margin: -1.5rem -1.5rem 0;
  padding: 1.75rem 1.5rem 1.25rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  color: white;
}
.public-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.2);
  border: 3px solid rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.public-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.public-avatar-initials {
  font-size: 1.75rem;
  font-weight: 700;
}
.public-hero-info {
  flex: 1;
  min-width: 0;
}
.public-name {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}
.public-program {
  font-size: 0.875rem;
  opacity: 0.85;
  margin: 0.2rem 0;
}
.public-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.875rem;
  margin-top: 0.4rem;
  font-size: 0.8125rem;
  opacity: 0.85;
  align-items: center;
}
.pub-meta-icon {
  margin-right: 3px;
}

/* Body */
.public-body {
  padding: 0.25rem 0;
}
.pub-section {
  padding: 0.875rem 0;
}
.pub-section-title {
  font-size: 0.6875rem;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.06em;
  margin-bottom: 0.625rem;
}
.pub-divider {
  margin: 0;
  border-color: #f1f5f9;
}
.pub-summary {
  font-size: 0.875rem;
  color: #374151;
  margin: 0;
  line-height: 1.6;
}

/* Links */
.pub-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.pub-link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: 500;
  text-decoration: none;
  border: 1px solid;
}
.pub-link--email {
  color: #374151;
  border-color: #d1d5db;
  background: #f9fafb;
}
.pub-link--linkedin {
  color: #0077b5;
  border-color: #bfdbfe;
  background: #eff6ff;
}
.pub-link--portfolio {
  color: #7c3aed;
  border-color: #ddd6fe;
  background: #f5f3ff;
}

/* Items list */
.pub-items-list {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}
.pub-item {
  display: flex;
  gap: 0.75rem;
}
.pub-item-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.pub-item-icon--blue {
  background: #dbeafe;
  color: #3b82f6;
}
.pub-item-icon--purple {
  background: #ede9fe;
  color: #7c3aed;
}
.pub-item-body {
  flex: 1;
  min-width: 0;
}
.pub-item-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}
.pub-item-sub {
  font-size: 0.8125rem;
  color: #64748b;
  margin: 0.1rem 0 0;
}
.pub-item-date {
  font-size: 0.75rem;
  color: #3b82f6;
  margin: 0.2rem 0 0.35rem;
}
.pub-item-desc {
  font-size: 0.8125rem;
  color: #4b5563;
  margin: 0;
  line-height: 1.5;
}

/* Skills */
.pub-skills-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.pub-skill-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
  margin: 0 0 0.25rem;
}
.pub-stars {
  display: flex;
  gap: 2px;
}
.star-filled {
  color: #f59e0b;
  font-size: 0.8rem;
}
.star-empty {
  color: #d1d5db;
  font-size: 0.8rem;
}

/* Languages */
.pub-languages {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.pub-lang-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.pub-lang-code {
  min-width: 34px;
  height: 34px;
  padding: 0 6px;
  border-radius: 6px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 700;
  color: #475569;
}
.pub-lang-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
  margin: 0;
}
.pub-lang-level {
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 0;
}
</style>
