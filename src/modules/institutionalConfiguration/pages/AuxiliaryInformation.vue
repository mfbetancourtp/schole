<template>
  <AppBaseList :title="title">
    <template #content>
      <AppLoading v-if="loading"></AppLoading>

      <div v-else class="grid-cards">
        <!-- Jornadas -->
        <AppCard>
          <template #title>
            <div class="d-flex justify-content-between align-items-center h-100 fs-5">
              <span>{{ t(`${entities.journey.name}.plural`) }}</span>

              <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.create">
                <AppButton variant="primary" outlined icon="plus" size="sm" @click="openFormModal(entities.journey)"> </AppButton>
              </AppCheckPermission>
            </div>
          </template>

          <template #body>
            <AppEmptyResponse v-if="!journeys.length" :show-image="false"></AppEmptyResponse>

            <ul class="list-group list-group-flush" v-if="journeys.length">
              <li class="list-group-item d-flex justify-content-between align-items-center" v-for="journey in journeys" :key="journey.id">
                <span>{{ journey.name }}</span>

                <AppButtonGroup size="sm">
                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.edit">
                    <AppButtonEdit @click="openFormModal(entities.journey, journey)"></AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.delete">
                    <AppButtonDelete @click="openConfirmDelete(entities.journey, journey)"></AppButtonDelete>
                  </AppCheckPermission>
                </AppButtonGroup>
              </li>
            </ul>
          </template>
        </AppCard>
        <!-- Recesos-->
        <AppCard>
          <template #title>
            <div class="d-flex justify-content-between align-items-center h-100 fs-5">
              <span>{{ t(`${entities.playTime.name}.plural`) }}</span>

              <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.create">
                <AppButton variant="primary" outlined icon="plus" size="sm" @click="openFormModal(entities.playTime)"> </AppButton>
              </AppCheckPermission>
            </div>
          </template>

          <template #body>
            <AppEmptyResponse v-if="!playTimes.length" :show-image="false"></AppEmptyResponse>

            <ul class="list-group list-group-flush">
              <li class="list-group-item d-flex justify-content-between align-items-center" v-for="item in playTimes" :key="item.id">
                <span>{{ item.name + ' - ' + item.journeyName }}</span>

                <AppButtonGroup size="sm">
                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.edit">
                    <AppButtonEdit @click="openFormModal(entities.playTime, item)"></AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.delete">
                    <AppButtonDelete @click="openConfirmDelete(entities.playTime, item)"></AppButtonDelete>
                  </AppCheckPermission>
                </AppButtonGroup>
              </li>
            </ul>
          </template>
        </AppCard>
        <!-- Grupos -->
        <AppCard>
          <template #title>
            <div class="d-flex justify-content-between align-items-center h-100 fs-5">
              <span>{{ t(`${entities.group.name}.plural`) }}</span>

              <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.create">
                <AppButton variant="primary" outlined icon="plus" size="sm" @click="openFormModal(entities.group)"> </AppButton>
              </AppCheckPermission>
            </div>
          </template>

          <template #body>
            <AppEmptyResponse v-if="!groups.length" :show-image="false"></AppEmptyResponse>

            <ul class="list-group list-group-flush" v-if="groups.length">
              <li class="list-group-item d-flex justify-content-between align-items-center" v-for="group in groups" :key="group.id">
                <span>{{ group.name }}</span>

                <AppButtonGroup size="sm">
                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.edit">
                    <AppButtonEdit @click="openFormModal(entities.group, group)"></AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.delete">
                    <AppButtonDelete @click="openConfirmDelete(entities.group, group)"></AppButtonDelete>
                  </AppCheckPermission>
                </AppButtonGroup>
              </li>
            </ul>
          </template>
        </AppCard>
        <!-- Calendarios -->
        <AppCard>
          <template #title>
            <div class="d-flex justify-content-between align-items-center h-100 fs-5">
              <span>{{ t(`${entities.calendar.name}.plural`) }}</span>

              <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.create">
                <AppButton variant="primary" outlined icon="plus" size="sm" @click="openFormModal(entities.calendar)"> </AppButton>
              </AppCheckPermission>
            </div>
          </template>

          <template #body>
            <AppEmptyResponse v-if="!calendarTypes.length" :show-image="false"></AppEmptyResponse>

            <ul class="list-group list-group-flush" v-if="calendarTypes.length">
              <li class="list-group-item d-flex justify-content-between align-items-center" v-for="calendar in calendarTypes" :key="calendar.id">
                <span>{{ calendar.name }}</span>

                <AppButtonGroup size="sm">
                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.edit">
                    <AppButtonEdit @click="openFormModal(entities.calendar, calendar)"></AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.delete">
                    <AppButtonDelete @click="openConfirmDelete(entities.calendar, calendar)"></AppButtonDelete>
                  </AppCheckPermission>
                </AppButtonGroup>
              </li>
            </ul>
          </template>
        </AppCard>
        <!-- Clasificación de asignaturas -->
        <AppCard>
          <template #title>
            <div class="d-flex justify-content-between align-items-center h-100 fs-5">
              <span>{{ t(`${entities.subjectClassification.name}.plural`) }}</span>

              <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.create">
                <AppButton variant="primary" outlined icon="plus" size="sm" @click="openFormModal(entities.subjectClassification)"></AppButton>
              </AppCheckPermission>
            </div>
          </template>

          <template #body>
            <AppEmptyResponse v-if="!subjectsCategory.length" :show-image="false"></AppEmptyResponse>

            <ul class="list-group list-group-flush" v-if="subjectsCategory.length">
              <li class="list-group-item d-flex justify-content-between align-items-center" v-for="subjectCategory in subjectsCategory" :key="subjectCategory.id">
                <span>{{ subjectCategory.name }}</span>

                <AppButtonGroup size="sm">
                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.edit">
                    <AppButtonEdit @click="openFormModal(entities.subjectClassification, subjectCategory)"> </AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.delete">
                    <AppButtonDelete @click="openConfirmDelete(entities.subjectClassification, subjectCategory)"> </AppButtonDelete>
                  </AppCheckPermission>
                </AppButtonGroup>
              </li>
            </ul>
          </template>
        </AppCard>
        <!-- Géneros -->
        <AppCard>
          <template #title>
            <div class="d-flex justify-content-between align-items-center h-100 fs-5">
              <span>{{ t(`${entities.gender.name}.plural`) }}</span>

              <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.create">
                <AppButton variant="primary" outlined icon="plus" size="sm" @click="openFormModal(entities.gender)"> </AppButton>
              </AppCheckPermission>
            </div>
          </template>

          <template #body>
            <AppEmptyResponse v-if="!genders.length" :show-image="false"></AppEmptyResponse>

            <ul class="list-group list-group-flush" v-else>
              <li class="list-group-item d-flex justify-content-between align-items-center" v-for="gender in genders" :key="gender.id">
                <span>{{ gender.name }}</span>

                <AppButtonGroup size="sm">
                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.edit">
                    <AppButtonEdit @click="openFormModal(entities.gender, gender)"></AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.delete">
                    <AppButtonDelete @click="openConfirmDelete(entities.gender, gender)"></AppButtonDelete>
                  </AppCheckPermission>
                </AppButtonGroup>
              </li>
            </ul>
          </template>
        </AppCard>
        <!-- Tipos de identificación -->
        <AppCard>
          <template #title>
            <div class="d-flex justify-content-between align-items-center h-100 fs-5">
              <span>{{ t(`${entities.identificationType.name}.plural`) }}</span>

              <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.create">
                <AppButton variant="primary" outlined icon="plus" size="sm" @click="openFormModal(entities.identificationType)"></AppButton>
              </AppCheckPermission>
            </div>
          </template>

          <template #body>
            <AppEmptyResponse v-if="!identificationTypes.length" :show-image="false"></AppEmptyResponse>

            <ul class="list-group list-group-flush" v-else>
              <li class="list-group-item d-flex justify-content-between align-items-center" v-for="identificationType in identificationTypes" :key="identificationType.id">
                <span>{{ identificationType.name }}</span>

                <AppButtonGroup size="sm">
                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.edit">
                    <AppButtonEdit @click="openFormModal(entities.identificationType, identificationType)"> </AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.delete">
                    <AppButtonDelete @click="openConfirmDelete(entities.identificationType, identificationType)"> </AppButtonDelete>
                  </AppCheckPermission>
                </AppButtonGroup>
              </li>
            </ul>
          </template>
        </AppCard>
        <!-- Clasificación de estudiantes -->
        <AppCard>
          <template #title>
            <div class="d-flex justify-content-between align-items-center h-100 fs-5">
              <span>{{ t(`${entities.studentClassification.name}.plural`) }}</span>

              <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.create">
                <AppButton variant="primary" outlined icon="plus" size="sm" @click="openFormModal(entities.studentClassification)"></AppButton>
              </AppCheckPermission>
            </div>
          </template>

          <template #body>
            <AppEmptyResponse v-if="!studentCategories.length" :show-image="false"></AppEmptyResponse>

            <ul class="list-group list-group-flush" v-else>
              <li class="list-group-item d-flex justify-content-between align-items-center" v-for="studentCategory in studentCategories" :key="studentCategory.id">
                <span>{{ studentCategory.name }}</span>

                <AppButtonGroup size="sm">
                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.edit">
                    <AppButtonEdit @click="openFormModal(entities.studentClassification, studentCategory)"> </AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.delete">
                    <AppButtonDelete @click="openConfirmDelete(entities.studentClassification, studentCategory)"> </AppButtonDelete>
                  </AppCheckPermission>
                </AppButtonGroup>
              </li>
            </ul>
          </template>
        </AppCard>
        <!-- Niveles de Competencia -->
        <AppCard>
          <template #title>
            <div class="d-flex justify-content-between align-items-center h-100 fs-5">
              <span>{{ t(`${entities.competencyLevel.name}.plural`) }}</span>

              <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.create">
                <AppButton variant="primary" outlined icon="plus" size="sm" @click="openFormModal(entities.competencyLevel)"></AppButton>
              </AppCheckPermission>
            </div>
          </template>

          <template #body>
            <AppEmptyResponse v-if="!competenceLevels.length" :show-image="false"></AppEmptyResponse>

            <ul class="list-group list-group-flush" v-else>
              <li class="list-group-item d-flex justify-content-between align-items-center" v-for="competenceLevel in competenceLevels" :key="competenceLevel.id">
                <span>{{ competenceLevel.name }}</span>

                <AppButtonGroup size="sm">
                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.edit">
                    <AppButtonEdit @click="openFormModal(entities.competencyLevel, competenceLevel)"></AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.delete">
                    <AppButtonDelete @click="openConfirmDelete(entities.competencyLevel, competenceLevel)"> </AppButtonDelete>
                  </AppCheckPermission>
                </AppButtonGroup>
              </li>
            </ul>
          </template>
        </AppCard>
        <!-- Tipos de Competencia -->
        <AppCard>
          <template #title>
            <div class="d-flex justify-content-between align-items-center h-100 fs-5">
              <span>{{ t(`${entities.competencyType.name}.plural`) }}</span>

              <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.create">
                <AppButton variant="primary" outlined icon="plus" size="sm" @click="openFormModal(entities.competencyType)"></AppButton>
              </AppCheckPermission>
            </div>
          </template>

          <template #body>
            <AppEmptyResponse v-if="!competencyTypes.length" :show-image="false"></AppEmptyResponse>

            <ul class="list-group list-group-flush" v-else>
              <li class="list-group-item d-flex justify-content-between align-items-center" v-for="competencyType in competencyTypes" :key="competencyType.id">
                <span>{{ competencyType.name }}</span>

                <AppButtonGroup size="sm">
                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.edit">
                    <AppButtonEdit @click="openFormModal(entities.competencyType, competencyType)"></AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.delete">
                    <AppButtonDelete @click="openConfirmDelete(entities.competencyType, competencyType)"> </AppButtonDelete>
                  </AppCheckPermission>
                </AppButtonGroup>
              </li>
            </ul>
          </template>
        </AppCard>

        <!--Seguro Escolar -->
        <AppCard>
          <template #title>
            <div class="d-flex justify-content-between align-items-center h-100 fs-5">
              <span>{{ t(`${entities.insurance.name}.plural`) }} </span>

              <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.create">
                <AppButton variant="primary" outlined icon="plus" size="sm" @click="openFormModal(entities.insurance)"> </AppButton>
              </AppCheckPermission>
            </div>
          </template>

          <template #body>
            <AppEmptyResponse v-if="!schoolInsurance.length" :show-image="false"></AppEmptyResponse>

            <ul class="list-group list-group-flush" v-else>
              <li class="list-group-item d-flex justify-content-between align-items-center" v-for="itemInsurance in schoolInsurance" :key="itemInsurance.id">
                <span>{{ itemInsurance.name }}</span>

                <AppButtonGroup size="sm">
                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.edit">
                    <AppButtonEdit @click="openFormModal(entities.insurance, itemInsurance)"></AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.delete">
                    <AppButtonDelete @click="openConfirmDelete(entities.insurance, itemInsurance)"></AppButtonDelete>
                  </AppCheckPermission>
                </AppButtonGroup>
              </li>
            </ul>
          </template>
        </AppCard>

        <!-- Vicepresidencia -->
        <AppCard>
          <template #title>
            <div class="d-flex justify-content-between align-items-center h-100 fs-5">
              <span>{{ t(`${entities.companyArea.name}.plural`) }} </span>
              <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.create">
                <AppButton variant="primary" outlined icon="plus" size="sm" @click="openFormModal(entities.companyArea)"> </AppButton>
              </AppCheckPermission>
            </div>
          </template>

          <template #body>
            <AppEmptyResponse v-if="!Company.length" :show-image="false"></AppEmptyResponse>

            <ul class="list-group list-group-flush" v-else>
              <li class="list-group-item d-flex justify-content-between align-items-center" v-for="itemCompanyArea in Company" :key="itemCompanyArea.id">
                <span>{{ itemCompanyArea.name }}</span>

                <AppButtonGroup size="sm">
                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.edit">
                    <AppButtonEdit @click="openFormModal(entities.companyArea, itemCompanyArea)"></AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.delete">
                    <AppButtonDelete @click="openConfirmDelete(entities.companyArea, itemCompanyArea)"></AppButtonDelete>
                  </AppCheckPermission>
                </AppButtonGroup>
              </li>
            </ul>
          </template>
        </AppCard>
        <!-- Nivel de ofensa -->
        <AppCard>
          <template #title>
            <AppCardTitle>
              <div class="d-flex justify-content-between align-items-center h-100 fs-5">
                <span>{{ t(`${entities.observationLevel.name}.plural`) }}</span>

                <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.create">
                  <AppButton variant="light" outlined icon="plus" size="sm" @click="openFormModal(entities.observationLevel)"></AppButton>
                </AppCheckPermission>
              </div>
            </AppCardTitle>
          </template>

          <template #body>
            <AppEmptyResponse v-if="!levelOffenses.length" :show-image="false"></AppEmptyResponse>

            <ul class="list-group list-group-flush" v-else>
              <li class="list-group-item d-flex justify-content-between align-items-center" v-for="levelOffense in levelOffenses" :key="levelOffense.id">
                <span>
                  {{ levelOffense.name }} -
                  {{ dataAuxiliary?.levelOffensesSystem?.find((item: any) => item.id === levelOffense.levelOffenseSystemId)?.name }}
                </span>

                <AppButtonGroup size="sm">
                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.edit">
                    <AppButtonEdit @click="openFormModal(entities.observationLevel, levelOffense)"></AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.delete">
                    <AppButtonDelete @click="openConfirmDelete(entities.observationLevel, levelOffense)"> </AppButtonDelete>
                  </AppCheckPermission>
                </AppButtonGroup>
              </li>
            </ul>
          </template>
        </AppCard>

        <!-- Áreas apoyo Psicosocial -->
        <AppCard>
          <template #title>
            <AppCardTitle>
              <div class="d-flex justify-content-between align-items-center h-100 fs-5">
                <span>{{ t(`${entities.wellnessAreas.name}.plural`) }}</span>

                <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.create">
                  <AppButton variant="light" outlined icon="plus" size="sm" @click="openFormModal(entities.wellnessAreas)"></AppButton>
                </AppCheckPermission>
              </div>
            </AppCardTitle>
          </template>

          <template #body>
            <AppEmptyResponse v-if="!wellnessAreas.length" :show-image="false"></AppEmptyResponse>

            <ul class="list-group list-group-flush" v-else>
              <li class="list-group-item d-flex justify-content-between align-items-center" v-for="wellness in wellnessAreas" :key="wellness.id">
                <span>{{ wellness.name }}</span>

                <AppButtonGroup size="sm">
                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.edit">
                    <AppButtonEdit @click="openFormModal(entities.wellnessAreas, wellness)"></AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.delete">
                    <AppButtonDelete @click="openConfirmDelete(entities.wellnessAreas, wellness)"> </AppButtonDelete>
                  </AppCheckPermission>
                </AppButtonGroup>
              </li>
            </ul>
          </template>
        </AppCard>

        <!-- Tipos de Inasistencia -->
        <AppCard>
          <template #title>
            <AppCardTitle>
              <div class="d-flex justify-content-between align-items-center h-100 fs-5">
                <span>{{ t(`${entities.absenceTypes.name}.plural`) }}</span>

                <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.create">
                  <AppButton variant="light" outlined icon="plus" size="sm" @click="openFormModal(entities.absenceTypes)"></AppButton>
                </AppCheckPermission>
              </div>
            </AppCardTitle>
          </template>

          <template #body>
            <AppEmptyResponse v-if="!absenceTypes.length" :show-image="false"></AppEmptyResponse>

            <ul class="list-group list-group-flush" v-else>
              <li class="list-group-item d-flex justify-content-between align-items-center" v-for="absenceType in absenceTypes" :key="absenceType.id">
                <span>{{ absenceType.name }}</span>

                <AppButtonGroup size="sm">
                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.edit">
                    <AppButtonEdit @click="openFormModal(entities.absenceTypes, absenceType)"></AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.delete">
                    <AppButtonDelete @click="openConfirmDelete(entities.absenceTypes, absenceType)"> </AppButtonDelete>
                  </AppCheckPermission>
                </AppButtonGroup>
              </li>
            </ul>
          </template>
        </AppCard>
        <!-- estados de seguimiento -->

        <AppCard>
          <template #title>
            <div class="d-flex justify-content-between align-items-center h-100 fs-5">
              <span>{{ t(`${entities.createMonitoringStatus.name}.plural`) }}</span>

              <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.create">
                <AppButton variant="primary" outlined icon="plus" size="sm" @click="openFormModal(entities.createMonitoringStatus)"> </AppButton>
              </AppCheckPermission>
            </div>
          </template>

          <template #body>
            <AppEmptyResponse v-if="!monitoringStatuses.length" :show-image="false"></AppEmptyResponse>

            <ul class="list-group list-group-flush">
              <li class="list-group-item d-flex justify-content-between align-items-center" v-for="item in monitoringStatuses" :key="item.id">
                <span>{{ item.name }}</span>

                <AppButtonGroup size="sm">
                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.edit">
                    <AppButtonEdit @click="openFormModal(entities.createMonitoringStatus, item)"></AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.delete">
                    <AppButtonDelete @click="openConfirmDelete(entities.createMonitoringStatus, item)"></AppButtonDelete>
                  </AppCheckPermission>
                </AppButtonGroup>
              </li>
            </ul>
          </template>
        </AppCard>
        <!-- Periodos Academicos-->
        <AppCard>
          <template #title>
            <div class="d-flex justify-content-between align-items-center">
              <span>{{ t(`${entities.periodTypes.name}.plural`) }}</span>

              <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.create">
                <AppButton variant="primary" outlined icon="plus" size="sm" @click="openFormModal(entities.periodTypes)"> </AppButton>
              </AppCheckPermission>
            </div>
          </template>

          <template #body>
            <AppEmptyResponse v-if="!periodTypes.length" :show-image="false"></AppEmptyResponse>

            <ul class="list-group list-group-flush">
              <li class="list-group-item d-flex justify-content-between align-items-center" v-for="item in periodTypes" :key="item.id">
                <span>{{ item.name }}</span>

                <AppButtonGroup size="sm">
                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.edit">
                    <AppButtonEdit @click="openFormModal(entities.periodTypes, item)"></AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.delete">
                    <AppButtonDelete @click="openConfirmDelete(entities.periodTypes, item)"> </AppButtonDelete>
                  </AppCheckPermission>
                </AppButtonGroup>
              </li>
            </ul>
          </template>
        </AppCard>

        <!-- Modalidades-->
        <AppCard>
          <template #title>
            <div class="d-flex justify-content-between align-items-center">
              <span>{{ t(`${entities.modalityTypes.name}.plural`) }}</span>

              <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.create">
                <AppButton variant="primary" outlined icon="plus" size="sm" @click="openFormModal(entities.modalityTypes)"> </AppButton>
              </AppCheckPermission>
            </div>
          </template>

          <template #body>
            <AppEmptyResponse v-if="!modalityTypes.length" :show-image="false"></AppEmptyResponse>

            <ul class="list-group list-group-flush">
              <li class="list-group-item d-flex justify-content-between align-items-center" v-for="item in modalityTypes" :key="item.id">
                <span>{{ item.name }}</span>

                <AppButtonGroup size="sm">
                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.edit">
                    <AppButtonEdit @click="openFormModal(entities.modalityTypes, item)"></AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.delete">
                    <AppButtonDelete @click="openConfirmDelete(entities.modalityTypes, item)"> </AppButtonDelete>
                  </AppCheckPermission>
                </AppButtonGroup>
              </li>
            </ul>
          </template>
        </AppCard>

        <!-- Tipos de Organizaciones-->
        <AppCard>
          <template #title>
            <div class="d-flex justify-content-between align-items-center">
              <span>{{ t(`${entities.organizationTypes.name}.plural`) }}</span>

              <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.create">
                <AppButton variant="primary" outlined icon="plus" size="sm" @click="openFormModal(entities.organizationTypes)"> </AppButton>
              </AppCheckPermission>
            </div>
          </template>

          <template #body>
            <AppEmptyResponse v-if="!organizationTypes.length" :show-image="false"></AppEmptyResponse>

            <ul class="list-group list-group-flush">
              <li class="list-group-item d-flex justify-content-between align-items-center" v-for="item in organizationTypes" :key="item.id">
                <span>{{ item.name }}</span>

                <AppButtonGroup size="sm">
                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.edit">
                    <AppButtonEdit @click="openFormModal(entities.organizationTypes, item)"></AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.delete">
                    <AppButtonDelete @click="openConfirmDelete(entities.organizationTypes, item)"> </AppButtonDelete>
                  </AppCheckPermission>
                </AppButtonGroup>
              </li>
            </ul>
          </template>
        </AppCard>

        <!-- Tipo de niveles de educacion -->
        <AppCard>
          <template #title>
            <div class="d-flex justify-content-between align-items-center">
              <span>{{ entities.educationCategory.label }}</span>

              <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.create">
                <AppButton variant="primary" outlined icon="plus" size="sm" @click="openFormModal(entities.educationCategory)"> </AppButton>
              </AppCheckPermission>
            </div>
          </template>

          <template #body>
            <AppEmptyResponse v-if="!educationCategories.length" :show-image="false"></AppEmptyResponse>

            <ul class="list-group list-group-flush">
              <li class="list-group-item d-flex justify-content-between align-items-center" v-for="item in educationCategories" :key="item.id">
                <span>{{ item.name }}</span>

                <AppButtonGroup size="sm">
                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.edit">
                    <AppButtonEdit @click="openFormModal(entities.educationCategory, item)"></AppButtonEdit>
                  </AppCheckPermission>

                  <AppCheckPermission permission="institutionalConfiguration.auxiliaryInformation.delete">
                    <AppButtonDelete @click="openConfirmDelete(entities.educationCategory, item)"> </AppButtonDelete>
                  </AppCheckPermission>
                </AppButtonGroup>
              </li>
            </ul>
          </template>
        </AppCard>
      </div>

      <AppModal v-model="openModal">
        <AuxiliaryInformationForm v-if="openModal" :data="currentData" :current-entity="currentEntity" :dataAuxiliary="dataAuxiliary" @close="closeModalForm"></AuxiliaryInformationForm>
      </AppModal>

      <AppModal v-model="modalDelete">
        <AppConfirmDeleteModal v-if="modalDelete" :entity="currentEntity.label || `${currentEntity.name}.singular`" @confirmDelete="confirmDelete"></AppConfirmDeleteModal>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonGroup from '../../../shared/components/AppButtonGroup.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AuxiliaryInformationForm from '../components/AuxiliaryInformationForm.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppConfirmDeleteModal from '../../../shared/components/Modal/AppConfirmDeleteModal.vue';

import { GenderDto } from '../dtos/gender.dto';
import { JourneyDto } from '../dtos/journey.dto';
import { PlayTimeDto } from '../dtos/playTime.dto';
import { GroupDto } from '../../../shared/dto/group.dto';
import { CalendarTypesDto } from '../dtos/calendarTypes.dto';
import { CompetencyTypeDto } from '../dtos/competencyType.dto';
import { ScholInsuranceDto } from '../dtos/schoolnsurance.dto';
import { CompanyAreaDto } from '../dtos/companyArea.dto';

import { CompetencyLevelDto } from '../dtos/competencyLevel.dto';
import { IdentificationTypeDto } from '../dtos/identificationType.dto';
import { StudentCategoryDto } from '../../../shared/dto/studentCategory.dto';
import { SubjectsCategoryDto } from '../../../shared/dto/subjectsCategory.dto';
import { PeriodTypesDto } from '../dtos/periodTypes.dto';
import { ModalityTypesDto } from '../dtos/modalityTypes.dto';
import { OrganizationTypesDto } from '../dtos/organizationTypes.dto';
import { EducationCategoryDto } from '../dtos/educationCategory.dto';

import { DeleteGroupService } from '../services/deleteGroup.service';
import { DeleteGenderService } from '../services/deleteGender.service';
import { DeleteJourneyService } from '../services/deleteJourney.service';
import { DeletePlayTimesService } from '../services/deletePlayTimes.service';
import { DeleteCalendarTypeService } from '../services/deleteCalendarType.service';
import { DeleteCompetencyTypeService } from '../services/deleteCompetencyType.service';
import { DeleteStudentCategoryService } from '../services/deleteStudentCategory.service';
import { DeleteCompetencyLevelService } from '../services/deleteCompetencyLevel.service';
import { DeleteInsurance } from '../services/deleteInsurance.service';
import { DeleteCompanyArea } from '../services/deleteCompanyArea.service';
import { DeleteWellnessAreasService } from '../services/deleteWellnessAreas.service';
import { DeleteSubjectCategoryService } from '../services/deleteSubjectCategory.service';
import { DeleteIdentificationTypesService } from '../services/deleteIdentificationTypes.service';
import { DeleteLevelOffensesService } from '../services/deleteLevelOffenses.service';
import { DeleteAbseceTypesService } from '../services/deleteAbseceTypes.service';
import { DeletePeriodTypesService } from '../services/deletePeriodTypes.service';
import { DeleteModalityTypesService } from '../services/deleteModalityTypes.service';
import { DeleteOrganizationTypesService } from '../services/deleteOrganizationTypes.service';
import { DeleteEducationCategoryService } from '../services/deleteEducationCategory.service';

import { GetCompetencyLevelsService } from '../services/getCompetencyLevels.service';
import { GetInsuranceService } from '../services/getInsurance.service';
import { GetCompanyAreaService } from '../../../shared/services/getCompanyArea.service';
import { GetAuxiliaryInformationService } from '../services/getAuxiliaryInformation.service';
import { GetWellnessAreasService } from '../services/getWellnessAreas.service';
import { GetLevelOffensesService } from '../services/getLevelOffenses.service';
import { GetAbseceTypesService } from '../services/getAbseceTypes.service';
import { GetPeriodTypesService } from '../services/getPeriodTypes.service';
import { GetModalityTypesService } from '../services/getModalityTypes.service';
import { GetOrganizationTypesService } from '../services/getOrganizationTypes.service';
import { GetEducationCategoriesService } from '../services/getEducationCategories.service';

import { CreateOrUpdateGroupService } from '../services/createOrUpdateGroup.service';
import { CreateOrUpdateGenderService } from '../services/createOrUpdateGender.service';
import { CreateOrUpdateJourneyService } from '../services/createOrUpdateJourney.service';
import { CreateOrUpdatePlayTimesService } from '../services/createOrUpdatePlayTimes.service';
import { CreateOrUpdateCalendarTypeService } from '../services/createOrUpdateCalendarType.service';
import { CreateOrUpdatelevelOffenseService } from '../services/createOrUpdatelevelOffense.service';
import { CreateOrUpdateCompetencyTypeService } from '../services/createOrUpdateCompetencyType.service';
import { CreateOrUpdateInsuranceService } from '../services/createOrUpdateInsurance.service';
import { CreateOrUpdateCompaniAreaService } from '../services/createOrUpdateCompanyArea.service';
import { CreateOrUpdateCompetencyLevelService } from '../services/createOrUpdateCompetencyLevel.service';
import { CreateOrUpdateSubjectCategoryService } from '../services/createOrUpdateSubjectCategory.service';
import { CreateOrUpdateStudentCategoryService } from '../services/createOrUpdateStudentCategory.service';
import { CreateOrUpdateIdentificationTypesService } from '../services/createOrUpdateIdentificationTypes.service';
import { CreateOrUpdateWellnessAreasService } from '../services/createOrUpdateWellnessAreas.service';
import { CreateOrUpdateAbseceTypesService } from '../services/createOrUpdateAbseceTypes.service';
import { CreateOrUpdatePeriodTypesService } from '../services/createOrUpdatePeriodTypes.service';
import { CreateOrUpdateModalityTypesService } from '../services/createOrUpdateModalityTypes.service';
import { CreateOrUpdateOrganizationTypesService } from '../services/createOrUpdateOrganizationTypes.service';
import { CreateOrUpdateEducationCategoryService } from '../services/createOrUpdateEducationCategory.service';

import { useHeaderStore } from '../../../stores/header.store';
import { CreateOrUpdateMonitoringStatusesService } from '../services/createOrUpdateMonitoringStatuses.service';
import { DeleteMonitoringStatusesService } from '../services/deleteMonitoringStatuses.service';
import { GetMonitoringStatusesService } from '../../../shared/services/getMonitoringStatuses.service';

const getAuxiliaryInformationService = new GetAuxiliaryInformationService();
const getCompetencyLevelsService = new GetCompetencyLevelsService();
const getInsuranceService = new GetInsuranceService();
const getCompanyAreaService = new GetCompanyAreaService();
const getLevelOffensesService = new GetLevelOffensesService();
const getWellnessAreasService = new GetWellnessAreasService();
const getAbseceTypeService = new GetAbseceTypesService();
const getMonitoringStatusesService = new GetMonitoringStatusesService();
const getPeriodTypesService = new GetPeriodTypesService();
const getModalityTypesService = new GetModalityTypesService();
const getOrganizationTypesService = new GetOrganizationTypesService();
const getEducationCategoriesService = new GetEducationCategoriesService();

export default defineComponent({
  name: 'AuxiliaryInformation',
  components: {
    AuxiliaryInformationForm,
    AppConfirmDeleteModal,
    AppCheckPermission,
    AppEmptyResponse,
    AppButtonDelete,
    AppButtonGroup,
    AppButtonEdit,
    AppBaseList,
    AppLoading,
    AppButton,
    AppModal,
    AppCard,
  },

  setup() {
    const { t } = useI18n();

    const title = 'core.menu.auxiliaryInformation';
    const routes = [{ name: title }];
    useMeta({ title: t(title) });

    const currentEntity = ref<any>(null);
    const modalDelete = ref(false);
    const openModal = ref(false);
    const loading = ref(true);
    const dataAuxiliary = ref<any>([]);

    const identificationTypes = ref<IdentificationTypeDto[]>([]);
    const studentCategories = ref<StudentCategoryDto[]>([]);
    const subjectsCategory = ref<SubjectsCategoryDto[]>([]);
    const competenceLevels = ref<CompetencyLevelDto[]>([]);
    const competencyTypes = ref<CompetencyTypeDto[]>([]);
    const schoolInsurance = ref<ScholInsuranceDto[]>([]);
    const Company = ref<CompanyAreaDto[]>([]);
    const calendarTypes = ref<CalendarTypesDto[]>([]);
    const journeys = ref<JourneyDto[]>([]);
    const playTimes = ref<PlayTimeDto[]>([]);
    const genders = ref<GenderDto[]>([]);
    const groups = ref<GroupDto[]>([]);
    const currentData = ref<any>(null);
    const levelOffenses = ref<any[]>([]);
    const wellnessAreas = ref<any[]>([]);
    const absenceTypes = ref<any[]>([]);
    const monitoringStatuses = ref<any[]>([]);
    const periodTypes = ref<PeriodTypesDto[]>([]);
    const modalityTypes = ref<ModalityTypesDto[]>([]);
    const organizationTypes = ref<OrganizationTypesDto[]>([]);
    const educationCategories = ref<EducationCategoryDto[]>([]);

    const entities = {
      journey: {
        name: 'core.generalTerms.academic.journey',
        serviceCreateOrUpdate: new CreateOrUpdateJourneyService(),
        serviceDelete: new DeleteJourneyService(),
        useAbbreviation: true,
        useId: false,
        timeSince: true,
        timeUntil: true,
        journeyId: false,
        color: false,
        levelOffenseSystemId: false,
      },
      playTime: {
        name: 'core.generalTerms.academic.playTimes',
        serviceCreateOrUpdate: new CreateOrUpdatePlayTimesService(),
        serviceDelete: new DeletePlayTimesService(),
        useAbbreviation: false,
        useId: false,
        timeSince: true,
        timeUntil: true,
        journeyId: true,
        color: true,
        levelOffenseSystemId: false,
      },
      group: {
        name: 'core.generalTerms.academic.group',
        serviceCreateOrUpdate: new CreateOrUpdateGroupService(),
        serviceDelete: new DeleteGroupService(),
        useAbbreviation: true,
        useId: false,
        timeSince: false,
        timeUntil: false,
        journeyId: false,
        color: false,
        levelOffenseSystemId: false,
      },
      calendar: {
        name: 'core.generalTerms.academic.calendar',
        serviceCreateOrUpdate: new CreateOrUpdateCalendarTypeService(),
        serviceDelete: new DeleteCalendarTypeService(),
        useAbbreviation: true,
        useId: false,
        timeSince: false,
        timeUntil: false,
        journeyId: false,
        color: false,
        levelOffenseSystemId: false,
      },
      subjectClassification: {
        name: 'core.generalTerms.academic.subjectClassification',
        serviceCreateOrUpdate: new CreateOrUpdateSubjectCategoryService(),
        serviceDelete: new DeleteSubjectCategoryService(),
        useAbbreviation: true,
        useId: false,
        timeSince: false,
        timeUntil: false,
        journeyId: false,
        color: false,
        levelOffenseSystemId: false,
      },
      gender: {
        name: 'core.generalTerms.academic.gender',
        serviceCreateOrUpdate: new CreateOrUpdateGenderService(),
        serviceDelete: new DeleteGenderService(),
        useAbbreviation: true,
        useId: false,
        timeSince: false,
        timeUntil: false,
        journeyId: false,
        color: false,
        levelOffenseSystemId: false,
      },
      identificationType: {
        name: 'core.generalTerms.academic.identificationType',
        serviceCreateOrUpdate: new CreateOrUpdateIdentificationTypesService(),
        serviceDelete: new DeleteIdentificationTypesService(),
        useAbbreviation: true,
        useId: false,
        timeSince: false,
        timeUntil: false,
        journeyId: false,
        color: false,
        levelOffenseSystemId: false,
      },
      studentClassification: {
        name: 'core.generalTerms.academic.studentClassification',
        serviceCreateOrUpdate: new CreateOrUpdateStudentCategoryService(),
        serviceDelete: new DeleteStudentCategoryService(),
        useAbbreviation: true,
        useId: false,
        timeSince: false,
        timeUntil: false,
        journeyId: false,
        color: false,
        levelOffenseSystemId: false,
      },
      competencyLevel: {
        name: 'core.generalTerms.academic.competencyLevel',
        serviceCreateOrUpdate: new CreateOrUpdateCompetencyLevelService(),
        serviceDelete: new DeleteCompetencyLevelService(),
        useAbbreviation: false,
        useId: false,
        timeSince: false,
        timeUntil: false,
        journeyId: false,
        color: false,
        levelOffenseSystemId: false,
      },
      competencyType: {
        name: 'core.generalTerms.academic.competencyType',
        serviceCreateOrUpdate: new CreateOrUpdateCompetencyTypeService(),
        serviceDelete: new DeleteCompetencyTypeService(),
        useAbbreviation: false,
        useId: false,
        timeSince: false,
        timeUntil: false,
        journeyId: false,
        color: false,
        levelOffenseSystemId: false,
      },
      insurance: {
        name: 'core.generalTerms.academic.insurance',
        serviceCreateOrUpdate: new CreateOrUpdateInsuranceService(),
        serviceDelete: new DeleteInsurance(),
        useAbbreviation: true,
        useId: true,
        timeSince: false,
        timeUntil: false,
        journeyId: false,
        color: false,
        levelOffenseSystemId: false,
      },
      companyArea: {
        name: 'core.generalTerms.academic.companyArea',
        serviceCreateOrUpdate: new CreateOrUpdateCompaniAreaService(),
        serviceDelete: new DeleteCompanyArea(),
        useAbbreviation: true,
        useId: true,
        timeSince: false,
        timeUntil: false,
        journeyId: false,
        color: false,
        levelOffenseSystemId: false,
      },
      observationLevel: {
        name: 'core.generalTerms.academic.observationLevel',
        serviceCreateOrUpdate: new CreateOrUpdatelevelOffenseService(),
        serviceDelete: new DeleteLevelOffensesService(),
        useAbbreviation: false,
        useId: true,
        timeSince: false,
        timeUntil: false,
        journeyId: false,
        color: true,
        levelOffenseSystemId: true,
      },
      wellnessAreas: {
        name: 'core.generalTerms.academic.wellnessAreas',
        serviceCreateOrUpdate: new CreateOrUpdateWellnessAreasService(),
        serviceDelete: new DeleteWellnessAreasService(),
        useAbbreviation: false,
        useId: false,
        timeSince: false,
        timeUntil: false,
        journeyId: false,
        color: false,
        levelOffenseSystemId: false,
      },
      absenceTypes: {
        name: 'core.generalTerms.academic.abseceTypes',
        serviceCreateOrUpdate: new CreateOrUpdateAbseceTypesService(),
        serviceDelete: new DeleteAbseceTypesService(),
        useAbbreviation: false,
        useId: false,
        timeSince: false,
        timeUntil: false,
        journeyId: false,
        color: false,
        levelOffenseSystemId: false,
      },
      createMonitoringStatus: {
        name: 'core.generalTerms.academic.createMonitoringStatus',
        serviceCreateOrUpdate: new CreateOrUpdateMonitoringStatusesService(),
        serviceDelete: new DeleteMonitoringStatusesService(),
        useAbbreviation: true,
        useId: false,
        timeSince: false,
        timeUntil: false,
        journeyId: false,
        color: true,
        levelOffenseSystemId: false,
      },
      periodTypes: {
        name: 'core.generalTerms.academic.periodTypes',
        serviceCreateOrUpdate: new CreateOrUpdatePeriodTypesService(),
        serviceDelete: new DeletePeriodTypesService(),
        useAbbreviation: false,
        useCode: true,
        useDescription: true,
        useDuration: true,
        useId: false,
        timeSince: false,
        timeUntil: false,
        journeyId: false,
        color: false,
        levelOffenseSystemId: false,
      },
      modalityTypes: {
        name: 'core.generalTerms.academic.modalityTypes',
        serviceCreateOrUpdate: new CreateOrUpdateModalityTypesService(),
        serviceDelete: new DeleteModalityTypesService(),
        useAbbreviation: false,
        useCode: true,
        useDescription: true,
        useDuration: false,
        useId: false,
        timeSince: false,
        timeUntil: false,
        journeyId: false,
        color: false,
        levelOffenseSystemId: false,
      },
      organizationTypes: {
        name: 'core.generalTerms.academic.organizationTypes',
        serviceCreateOrUpdate: new CreateOrUpdateOrganizationTypesService(),
        serviceDelete: new DeleteOrganizationTypesService(),
        useAbbreviation: false,
        useCode: true,
        useDescription: true,
        useDuration: false,
        useId: false,
        timeSince: false,
        timeUntil: false,
        journeyId: false,
        color: false,
        levelOffenseSystemId: false,
      },
      educationCategory: {
        name: 'educationCategory',
        label: 'Tipo de niveles de educación',
        serviceCreateOrUpdate: new CreateOrUpdateEducationCategoryService(),
        serviceDelete: new DeleteEducationCategoryService(),
        useAbbreviation: false,
        useCode: true,
        useDescription: false,
        useDuration: false,
        useId: false,
        timeSince: false,
        timeUntil: false,
        journeyId: false,
        color: false,
        levelOffenseSystemId: false,
      },
    };
    onMounted(async () => {
      try {
        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Configuración institucional', url: '' };
        headerStorage.moduleItem = { name: title, url: '' };
        headerStorage.moduleSubItem = { name: '', url: '' };

        await getData();
        await getCompetenceLevels();
        await getSchoolInsurance();
        await getCompanyArea();
        await getLevelOffenses();
        await getWellnessAreas();
        await getAbseceTypes();
        await getMonitoring();
        await getPeriodTypes();
        await getModalityTypes();
        await getOrganizationTypes();
        await getEducationCategories();
      } catch (e) {
        console.log('error', e);
      }

      loading.value = false;
    });
    const getWellnessAreas = async () => {
      try {
        wellnessAreas.value = await getWellnessAreasService.run();
      } catch (error) {
        console.error('Error al obtener áreas de bienestar:', error);
        wellnessAreas.value = [];
      }
    };
    const getAbseceTypes = async () => {
      try {
        absenceTypes.value = await getAbseceTypeService.run();
      } catch (error) {
        console.error('Error al obtener tipos de inasistencia:', error);
        absenceTypes.value = [];
      }
    };
    const getLevelOffenses = async () => {
      try {
        levelOffenses.value = await getLevelOffensesService.run();
      } catch (error) {
        console.error('Error al obtener niveles de ofensa:', error);
        levelOffenses.value = [];
      }
    };

    const getCompetenceLevels = async () => {
      try {
        competenceLevels.value = await getCompetencyLevelsService.run();
      } catch (error) {
        console.error('Error al obtener niveles de competencia:', error);
        competenceLevels.value = [];
      }
    };

    const getSchoolInsurance = async () => {
      try {
        schoolInsurance.value = await getInsuranceService.run();
      } catch (error) {
        console.error('Error al obtener seguros escolares:', error);
        schoolInsurance.value = [];
      }
    };
    const getCompanyArea = async () => {
      try {
        Company.value = await getCompanyAreaService.run();
      } catch (error) {
        console.error('Error al obtener áreas de compañía:', error);
        Company.value = [];
      }
    };

    const getMonitoring = async () => {
      try {
        monitoringStatuses.value = await getMonitoringStatusesService.run();
      } catch (error) {
        console.error('Error al obtener estados de seguimiento:', error);
        monitoringStatuses.value = [];
      }
    };

    const getPeriodTypes = async () => {
      try {
        periodTypes.value = await getPeriodTypesService.run({ noPag: true });
      } catch (error) {
        console.error('Error al obtener tipos de periodo:', error);
        periodTypes.value = [];
      }
    };

    const getModalityTypes = async () => {
      try {
        modalityTypes.value = await getModalityTypesService.run({
          noPag: true,
        });
      } catch (error) {
        console.error('Error al obtener tipos de modalidad:', error);
        modalityTypes.value = [];
      }
    };

    const getOrganizationTypes = async () => {
      try {
        organizationTypes.value = await getOrganizationTypesService.run({
          noPag: true,
        });
      } catch (error) {
        console.error('Error al obtener tipos de organización:', error);
        organizationTypes.value = [];
      }
    };

    const getEducationCategories = async () => {
      try {
        educationCategories.value = await getEducationCategoriesService.run({
          noPag: true,
        });
      } catch (error) {
        console.error('Error al obtener categorías de educación:', error);
        educationCategories.value = [];
      }
    };

    const getData = async () => {
      try {
        const resp = await getAuxiliaryInformationService.run();
        dataAuxiliary.value = resp;

        identificationTypes.value = resp.identificationTypes ?? [];
        studentCategories.value = resp.studentCategories ?? [];
        subjectsCategory.value = resp.subjectCategories ?? [];
        competencyTypes.value = resp.competencyTypes ?? [];
        calendarTypes.value = resp.calendarTypes ?? [];
        journeys.value = resp.journeys ?? [];
        playTimes.value = resp.playTimes ?? [];
        genders.value = resp.genders ?? [];
        groups.value = resp.groups ?? [];
      } catch (error) {
        console.error('Error al obtener información auxiliar:', error);
        // Mantener arrays vacíos en caso de error
        dataAuxiliary.value = {};
        identificationTypes.value = [];
        studentCategories.value = [];
        subjectsCategory.value = [];
        competencyTypes.value = [];
        calendarTypes.value = [];
        journeys.value = [];
        playTimes.value = [];
        genders.value = [];
        groups.value = [];
      }
    };

    const openFormModal = async (entity: any, data?: any) => {
      currentEntity.value = entity;
      currentData.value = data;
      openModal.value = true;
    };

    const closeModalForm = async () => {
      openModal.value = false;
      await getData();
      await getCompetenceLevels();
      await getSchoolInsurance();
      await getCompanyArea();
      await getLevelOffenses();
      await getWellnessAreas();
      await getAbseceTypes();
      await getMonitoring();
      await getPeriodTypes();
      await getModalityTypes();
      await getOrganizationTypes();
      await getEducationCategories();
    };

    const openConfirmDelete = async (entity: any, data: any) => {
      currentEntity.value = entity;
      currentData.value = data;

      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      await currentEntity.value.serviceDelete.run(currentData.value.id);

      modalDelete.value = false;
      await getData();
      await getCompetenceLevels();
      await getSchoolInsurance();
      await getCompanyArea();
      await getLevelOffenses();
      await getWellnessAreas();
      await getAbseceTypes();
      await getMonitoring();
      await getPeriodTypes();
      await getModalityTypes();
      await getOrganizationTypes();
      await getEducationCategories();
    };

    return {
      t,
      loading,
      routes,
      title,
      entities,

      currentEntity,
      currentData,
      modalDelete,
      openModal,

      identificationTypes,
      studentCategories,
      subjectsCategory,
      competenceLevels,
      competencyTypes,
      schoolInsurance,
      Company,
      calendarTypes,
      journeys,
      playTimes,
      genders,
      groups,
      monitoringStatuses,
      periodTypes,
      modalityTypes,
      organizationTypes,
      educationCategories,

      openConfirmDelete,
      closeModalForm,
      openFormModal,
      confirmDelete,
      levelOffenses,
      wellnessAreas,
      absenceTypes,

      dataAuxiliary,
    };
  },
});
</script>

<style scoped>
.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 19rem), 1fr));
}

/* .o-btn--icon.o-btn--outlined-light {
  color: var(--color-light);
}
.o-btn--icon.o-btn--outlined-light:hover {
  color: var(--color-primary);
  background: rgba(var(--color-light-rgb), var(--opacity-color-80));
} */
</style>
