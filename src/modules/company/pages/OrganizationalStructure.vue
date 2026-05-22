<template>
  <AppBaseList :title="title" :routes="routes">
    <template v-slot:actions>
      <AppButton style="color: white;" :to="{ name: 'company.organizationalStructureTemplate' }" label="Cargar plantilla" outlined></AppButton>

      <AppButton @click="openOrganizationalJobsFormModal" label="Empezar de cero"></AppButton>
    </template>

    <template v-slot:content>
      <AppLoading v-if="loading"></AppLoading>

      <template v-else>
        <div class="mb-1">
          <span
            class="text-white rounded-pill ps-2 pe-2 pointer me-1"
            :style="`background-color: ${item.unitColor};`"
            v-for="(item, index) in orgaUnits"
            :key="index"
            @click="openOrganizationalUnitsFormModal(item.id)"
          >
            {{ item.name }}
          </span>

          <span @click="openOrganizationalUnitsFormModal()" class="rounded-pill pointer ps-2 pe-2 ms-1 bg-white">
            <AppIcon class="icon-size-8 text-muted" icon="plus"></AppIcon>
          </span>
        </div>

        <AppCard>
          <template #body>
            <div class="scroll-container pb-5">
              <div class="organigrama" style="width: 150rem" @click="openOrganizationChartFormModal">
                <ul>
                  <li>
                    <a href="#" style="margin-bottom: 1rem" :id="`navbarDropdown-${organizationalJob.id}`" data-bs-toggle="dropdown" aria-expanded="false" role="button">
                      {{ organizationalJob.name }}
                      <!-- <span :style="`display: block; font-size: 0.7rem; color: #777;border-top: 2px solid ${organizationalJob.organizationalUnitColor ?? '#FF0000'};`">
                        {{ organizationalJob.organizationalUnitName ?? '' }}
                      </span> -->
                    </a>

                    <section class="dropdown-menu" :aria-labelledby="`navbarDropdown-${organizationalJob.id}`" style="width: max-content; padding: 0.5rem 0">
                      <!-- <span class="d-block opc-organigrama" style="cursor: pointer; padding: 0 0.5rem" :data-action="`edit-${organizationalJob.id}`">Editar cargo</span> -->
                      <span class="d-block opc-organigrama" style="cursor: pointer; padding: 0 0.5rem" :data-action="`addChild-${organizationalJob.id}`">Agregar cargo bajo este nivel</span>
                    </section>

                    <template v-if="organizationalJob.childrens">
                      <div v-html="loadHTMLStructureV2(organizationalJob.childrens).innerHTML"></div>
                    </template>
                  </li>
                </ul>
              </div>
            </div>
          </template>
        </AppCard>
      </template>

      <AppModal v-model="organizationalJobsFormModal" :size="'lg'">
        <OrganizationalJobsForm v-if="organizationalJobsFormModal" @close="closeOrganizationalJobsFormModal"></OrganizationalJobsForm>
      </AppModal>

      <AppModal v-model="organizationalUnitsFormModal" :size="'lg'">
        <OrganizationalUnitForm v-if="organizationalUnitsFormModal" :orga-unit="currentOrgaUnit" @close="closeOrganizationalUnitsFormModal"></OrganizationalUnitForm>
      </AppModal>

      <AppModal v-model="organizationChartFormModal" :size="'lg'">
        <OrganizationChartForm
          v-if="organizationChartFormModal"
          :organizational-job-id="currentOrgaJobId"
          :organizational-units="orgaUnits"
          :level-key="currentLevelKey"
          @close="closeOrganizationChartFormModal"
        ></OrganizationChartForm>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import AppIcon from '../../../shared/components/AppIcon.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import OrganizationChartForm from '../components/OrganizationChartForm.vue';
import OrganizationalJobsForm from '../components/OrganizationalJobsForm.vue';
import OrganizationalUnitForm from '../components/OrganizationalUnitForm.vue';

import { GetOrganizationalJobsService } from '../services/getOrganizationalJobs.service';
import { GetOrganizationalUnitsService } from '../services/getOrganizationalUnits.service';
import { GetOrganizationalUnitByorgaUnitIdService } from '../services/getOrganizationalUnitByorgaUnitId.service';
import { useHeaderStore } from '../../../stores/header.store';

const getOrganizationalUnitByorgaUnitIdService = new GetOrganizationalUnitByorgaUnitIdService();
const getOrganizationalUnitsService = new GetOrganizationalUnitsService();
const getOrganizationalJobsService = new GetOrganizationalJobsService();

export default defineComponent({
  name: 'OrganizationalStructure',
  components: {
    OrganizationalUnitForm,
    OrganizationalJobsForm,
    OrganizationChartForm,
    AppBaseList,
    AppLoading,
    AppButton,
    AppModal,
    AppCard,
    AppIcon,
  },
  setup() {
    const { t } = useI18n();
    const title = 'Estructura organizacional';

    useMeta({ title: t(title) });
    const routes = [{ name: title }];

    const organizationalJob: Ref<any> = ref(null);
    const currentOrgaUnit: Ref<any> = ref(null);
    const orgaUnits: Ref<any[]> = ref([]);

    const currentLevelKey: Ref<'brother' | 'child' | 'edit'> = ref('edit');
    const currentOrgaJobId = ref();

    const organizationalUnitsFormModal = ref(false);
    const organizationalJobsFormModal = ref(false);
    const organizationChartFormModal = ref(false);
    const loading = ref(true);

    onMounted(async () => {
      try {
        await getOrganizationalUnits();
        await getOrganizationalJobs();
      } catch (e) {
        console.log(e);
      }

      const headerStorage = useHeaderStore();
      headerStorage.module = { name: 'Empresa', url: '' };
      headerStorage.moduleItem = { name: title, url: '' };
      headerStorage.moduleSubItem = { name: '', url: '' };

      loading.value = false;
    });

    const getOrganizationalUnits = async () => {
      try {
        const res = await getOrganizationalUnitsService.run();
        orgaUnits.value = res.data;
      } catch (e) {
        console.log(e);
      }
    };

    const getOrganizationalJobs = async () => {
      try {
        organizationalJob.value = await getOrganizationalJobsService.run();

        for (let i = 0; i < organizationalJob.value.childrens.length; i++) {
          orgaUnits.value.forEach((item2) => {
            if (organizationalJob.value.childrens[i].organizationalUnitId == item2.id) {
              organizationalJob.value.childrens[i].organizationalUnitName = item2.name;
              organizationalJob.value.childrens[i].organizationalUnitColor = item2.unitColor;

              if (organizationalJob.value.childrens[i].childrens) {
                organizationalJob.value.childrens[i].childrens = loadOrganizationalUnit(organizationalJob.value.childrens[i].childrens);
              }
            }
          });
        }
      } catch (e) {
        console.log(e);
      }
    };

    const loadOrganizationalUnit = (childrens: any[]) => {
      for (let i = 0; i < childrens.length; i++) {
        orgaUnits.value.forEach((item2) => {
          if (childrens[i].organizationalUnitId == item2.id) {
            childrens[i].organizationalUnitName = item2.name;
            childrens[i].organizationalUnitColor = item2.unitColor;
          }

          if (childrens[i].childrens) {
            childrens[i].childrens = loadOrganizationalUnit(childrens[i].childrens);
          }
        });
      }

      return childrens;
    };

    const loadHTMLStructureV2: any = (childrens: any[]) => {
      const ulElement = document.createElement('ul');

      for (let i = 0; i < childrens.length; i++) {
        const liElement = document.createElement('li');

        const aElement = document.createElement('a');

        const spanElement = document.createElement('span');
        spanElement.setAttribute('style', `display: block;font-size: 0.7rem;color: #777;border-top: 2px solid ${childrens[i].organizationalUnitColor ?? '#ccc'};`);
        spanElement.textContent = childrens[i].organizationalUnitName ?? 'null';

        aElement.setAttribute('href', '#');
        aElement.setAttribute('id', `navbarDropdown-${childrens[i].id}`);
        aElement.setAttribute('data-bs-toggle', 'dropdown');
        aElement.setAttribute('aria-expanded', 'false');
        aElement.setAttribute('role', 'button');

        // menu desplegable
        const sectionElement = document.createElement('section');
        sectionElement.setAttribute('class', 'dropdown-menu');
        sectionElement.setAttribute('style', 'width: max-content; padding: 0.5rem 0;');
        sectionElement.setAttribute('aria-labelledby', `navbarDropdown-${childrens[i].id}`);

        // opc menu desplegable
        const spanOpc1Element = document.createElement('span');
        const spanOpc2Element = document.createElement('span');
        const spanOpc3Element = document.createElement('span');

        spanOpc1Element.setAttribute('class', 'd-block');
        spanOpc1Element.classList.add('opc-organigrama');
        spanOpc1Element.setAttribute(`style`, 'cursor: pointer; padding: 0 0.5rem;');
        spanOpc1Element.setAttribute(`data-action`, `edit-${childrens[i].id}`);

        spanOpc2Element.setAttribute('class', 'd-block');
        spanOpc2Element.classList.add('opc-organigrama');
        spanOpc2Element.setAttribute(`style`, 'cursor: pointer; padding: 0 0.5rem;');
        spanOpc2Element.setAttribute(`data-action`, `addBrother-${childrens[i].id}`);

        spanOpc3Element.setAttribute('class', 'd-block');
        spanOpc3Element.classList.add('opc-organigrama');
        spanOpc3Element.setAttribute(`style`, 'cursor: pointer; padding: 0 0.5rem;');
        spanOpc3Element.setAttribute(`data-action`, `addChild-${childrens[i].id}`);

        spanOpc1Element.textContent = 'Editar cargo';
        spanOpc2Element.textContent = 'Agregar cargo en este nivel';
        spanOpc3Element.textContent = 'Agregar cargo bajo este nivel';

        sectionElement.appendChild(spanOpc1Element);
        sectionElement.appendChild(spanOpc2Element);
        sectionElement.appendChild(spanOpc3Element);

        aElement.textContent = childrens[i].name;
        aElement.appendChild(spanElement);

        liElement.appendChild(aElement);
        liElement.appendChild(sectionElement);

        if (childrens[i].childrens) {
          liElement.appendChild(loadHTMLStructureV2(childrens[i].childrens));
        }

        ulElement.appendChild(liElement);
      }

      return ulElement;
    };

    const openOrganizationalJobsFormModal = () => {
      organizationalJobsFormModal.value = true;
    };
    const closeOrganizationalJobsFormModal = async () => {
      organizationalJobsFormModal.value = false;

      await getOrganizationalJobs();
    };

    const openOrganizationChartFormModal = async (e: any) => {
      if ('action' in e.target.dataset) {
        const dataset: any[] = String(e.target.dataset.action).split('-');

        currentOrgaJobId.value = dataset[1] as number;

        if (dataset[0] == 'addBrother') currentLevelKey.value = 'brother';
        if (dataset[0] == 'addChild') currentLevelKey.value = 'child';
        if (dataset[0] == 'edit') currentLevelKey.value = 'edit';

        organizationChartFormModal.value = true;
      }
    };
    const closeOrganizationChartFormModal = async () => {
      organizationChartFormModal.value = false;

      await getOrganizationalJobs();
    };

    const openOrganizationalUnitsFormModal = async (orgaUnitId: number | null = null) => {
      try {
        if (orgaUnitId) {
          currentOrgaUnit.value = await getOrganizationalUnitByorgaUnitIdService.run(orgaUnitId);
        }
        organizationalUnitsFormModal.value = true;
      } catch (e) {
        console.log(e);
      }
    };
    const closeOrganizationalUnitsFormModal = async () => {
      currentOrgaUnit.value = null;

      organizationalUnitsFormModal.value = false;

      await getOrganizationalUnits();
      await getOrganizationalJobs();
    };

    return {
      loading,
      routes,
      title,
      t,

      organizationalUnitsFormModal,
      organizationalJobsFormModal,
      organizationChartFormModal,
      currentOrgaJobId,
      currentLevelKey,
      currentOrgaUnit,
      orgaUnits,

      organizationalJob,

      closeOrganizationalUnitsFormModal,
      closeOrganizationalJobsFormModal,
      openOrganizationalUnitsFormModal,
      openOrganizationalJobsFormModal,
      closeOrganizationChartFormModal,
      openOrganizationChartFormModal,
      loadHTMLStructureV2,
    };
  },
});
</script>

<style>
.scroll-container {
  max-width: 100rem;
  overflow-x: scroll;
}

.pointer {
  cursor: pointer;
  width: 10rem;
}

.organigrama * {
  margin: 0px;
}

.organigrama .opc-organigrama:hover {
  background-color: rgba(0, 0, 0, 0.1) !important;
}

.organigrama ul {
  padding-top: 20px;
  position: relative;
}

.organigrama li {
  float: left;
  text-align: center;
  list-style-type: none;
  padding: 20px 5px 0px 5px;
  position: relative;
}

.organigrama li::before,
.organigrama li::after {
  content: '';
  position: absolute;
  top: 0px;
  right: 50%;
  border-top: 2px solid #ccc;
  width: 50%;
  height: 20px;
}

.organigrama li::after {
  right: auto;
  left: 50%;
  border-left: 2px solid #ccc;
}

.organigrama li:only-child::before,
.organigrama li:only-child::after {
  display: none;
}

.organigrama li:only-child {
  padding-top: 0;
}

.organigrama li:first-child::before,
.organigrama li:last-child::after {
  border: 0 none;
}

.organigrama li:last-child::before {
  border-right: 2px solid #ccc;
  -webkit-border-radius: 0 5px 0 0;
  -moz-border-radius: 0 5px 0 0;
  border-radius: 0 5px 0 0;
}

.organigrama li:first-child::after {
  border-radius: 5px 0 0 0;
  -webkit-border-radius: 5px 0 0 0;
  -moz-border-radius: 5px 0 0 0;
}

.organigrama ul ul::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  border-left: 2px solid #ccc;
  width: 0;
  height: 20px;
}
/* .organigrama ul div::before {
  content: '';
  position: absolute;
  top: 26%;
  left: 50%;
  border-left: 2px solid #ccc;
  width: 0;
  height: 17px;
} */

.organigrama li a {
  box-shadow: 0px 1px 2px 1px rgba(0, 0, 0, 0.2);
  padding: 0.3em 0.3em;
  text-decoration: none;
  color: #444;
  font-family: arial, verdana, tahoma;
  font-size: 0.8em;
  display: inline-block;
  border-radius: 5px;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  -webkit-transition: all 500ms;
  -moz-transition: all 500ms;
  transition: all 500ms;
}

/* .organigrama li a:hover {
	border: 1px solid #fff;
	color: #ddd;
  background-color: rgba(255,128,0,0.7);
	display: inline-block;
} */

.organigrama > ul > li > a {
  font-size: 1em;
  font-weight: bold;
}

.organigrama > ul > li > ul > li > a {
  width: 8em;
}
</style>
