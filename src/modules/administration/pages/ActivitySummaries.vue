<template>
  <AppBaseList :title="title" :routes="routes" :subtitle="subtitle">
    <template v-slot:actions>
      <AppButtonBack :to="routes[routes.length - 2].url"></AppButtonBack>
    </template>

    <template v-slot:content>
      <TabsTeacher></TabsTeacher>
      <AppLoading v-if="loading"></AppLoading>
      <template v-else>
        <TableDashboard :cardsDataProp="cardsData"></TableDashboard>
        <div
          class="container-tables"
          :class="{ 'fullscreen-table': isFullScreen }"
        >
          <div class="buttons">
            <div v-if="tableOne">
              <AppCheckPermission permission="classroom.activitiesTeacher.edit">
                <div class="content-button" v-if="!selectButton">
                  <AppButton
                    @click="dataSelectButton()"
                    :disabled="
                      !scoreUpload &&
                      !isExtraordinaryWindow &&
                      profileIdLocalStorage != 1 &&
                      profileIdLocalStorage != 6
                    "
                  >
                    <AppIcon icon="clipboard-check"></AppIcon>
                    {{ t('classroom.activitiesTeacher.qualifyActivities') }}
                  </AppButton>
                </div>
              </AppCheckPermission>

              <AppButton
                :disabled="
                  !scoreUpload &&
                  !isExtraordinaryWindow &&
                  profileIdLocalStorage != 1 &&
                  profileIdLocalStorage != 6
                "
                v-if="selectButton"
                label="core.save"
                @click="saveQualifications()"
              ></AppButton>
            </div>

            <AppCheckPermission permission="classroom.activitiesTeacher.create">
              <AppButton
                label="Libro de Calificaciones"
                @click="syncLMS()"
              ></AppButton>
            </AppCheckPermission>

            <AppCheckPermission permission="classroom.activitiesTeacher.create">
              <AppButton
                :disabled="
                  !scoreUpload &&
                  !isExtraordinaryWindow &&
                  profileIdLocalStorage != 1 &&
                  profileIdLocalStorage != 6
                "
                label="core.newFemaleActivities"
                @click="toggleDrawerCreate"
              ></AppButton>
              <CreateActivitiesTeacherDrawer
                v-model:isVisible="showDrawerCreate"
                @reload-data="reloadData"
              />
            </AppCheckPermission>

            <div class="content-buttons-views d-flex gap-3">
              <div class="tw-flex tw-justify-end">
                <div class="tw-w-full" style="width: 12rem">
                  <!-- <label>{{ t('academicPlanning.periods.name') }}</label> -->
                  <AppAutocomplete
                    v-model="periodId"
                    :options="periods"
                    :label="'name'"
                    :clearable="false"
                    class="bg-white"
                    :reduce="(o: any) => o.id"
                  >
                  </AppAutocomplete>
                </div>
              </div>
              <AppCheckPermission
                permission="classroom.activitiesTeacher.create"
              >
                <div class="buttons-views">
                  <AppButton
                    class="icon-view"
                    icon="list"
                    v-tooltip="'Listar actividades'"
                    @click="list()"
                  ></AppButton>
                  <AppButton
                    class="icon-view"
                    icon="th"
                    v-tooltip="'Tarjetas de actividades'"
                    @click="viewCardActivities()"
                  ></AppButton>
                </div>
              </AppCheckPermission>
            </div>

            <AppButton
              icon="expand"
              v-if="!isFullScreen"
              v-tooltip="'Expandir tabla'"
              @click="toggleFullScreen"
            ></AppButton>

            <AppButton
              icon="compress"
              v-if="isFullScreen"
              v-tooltip="'Salir pantalla completa'"
              @click="toggleFullScreen"
            ></AppButton>
          </div>

          <AppLoading v-if="loadingTable"></AppLoading>

          <div v-if="tableOne">
            <div v-if="averageWithBag">
              <div class="table-container" v-sticky-hscroll>
                <table
                  class="table-fixed responsive-table table-striped table-bordered"
                  style="border-collapse: collapse"
                >
                  <thead class="sticky-top">
                    <tr class="sticky-header" style="background-color: #e4e4e4">
                      <th
                        rowspan="2"
                        class="text-center border-end border-bottom border-left border-right sticky-column-thead"
                        style="
                          width: 200px;
                          white-space: nowrap;
                          word-wrap: break-word;
                          text-align: center;
                          border-right: 1px solid #ccc;
                        "
                      >
                        Estudiante
                      </th>
                      <template
                        v-for="(
                          activityCategory, categoryIndex
                        ) in activityCategories"
                        :key="categoryIndex"
                      >
                        <th
                          :colspan="activityCategory.activities.length"
                          class="text-center align-items-center border-end border-bottom"
                          :style="{
                            borderLeft: '1px solid #ccc',
                            borderRight: '1px solid #ccc',
                            minWidth: '160px',
                          }"
                        >
                          {{ activityCategory.nameActivityCategoryId }} ({{
                            activityCategory.categoryPercentActivityCategory
                          }}%)
                        </th>
                      </template>
                      <th
                        rowspan="2"
                        class="text-center border-end border-bottom border-left border-right sticky-column-thead-finish"
                        style="
                          width: 200px;
                          white-space: nowrap;
                          word-wrap: break-word;
                          text-align: center;
                          border-right: 1px solid #ccc;
                        "
                      >
                        Nota final
                      </th>
                    </tr>
                    <tr class="sticky-header" style="top: 33px">
                      <template
                        v-for="(
                          activityCategory, categoryIndex
                        ) in activityCategories"
                        :key="categoryIndex"
                      >
                        <template
                          v-for="(
                            activity, activityIndex
                          ) in activityCategory.activities"
                          :key="activityIndex"
                        >
                          <th
                            class="text-center border-end border-bottom"
                            :style="{
                              borderLeft: '1px solid #ccc',
                              borderRight: '1px solid #ccc',
                              minWidth: '160px',
                            }"
                          >
                            {{ activity.name }}

                            <div
                              class="buttons-activities"
                              style="white-space: nowrap"
                            >
                              <AppCheckPermission
                                permission="classroom.activitiesTeacher.edit"
                              >
                                <AppButtonEdit
                                  :disabled="
                                    !scoreUpload &&
                                    !isExtraordinaryWindow &&
                                    profileIdLocalStorage != 1 &&
                                    profileIdLocalStorage != 6
                                  "
                                  @click="
                                    toggleDrawerEdit(
                                      courseId,
                                      activity.activityId
                                    )
                                  "
                                ></AppButtonEdit>
                              </AppCheckPermission>
                              <AppCheckPermission
                                permission="classroom.activitiesTeacher.delete"
                              >
                                <AppButtonDelete
                                  :disabled="
                                    !scoreUpload &&
                                    !isExtraordinaryWindow &&
                                    profileIdLocalStorage != 1 &&
                                    profileIdLocalStorage != 6
                                  "
                                  @click="
                                    openConfirmDelete(activity.activityId)
                                  "
                                ></AppButtonDelete>
                              </AppCheckPermission>

                              <AppCheckPermission
                                permission="classroom.activitiesTeacher.edit"
                              >
                                <AppButton
                                  v-tooltip="
                                    'classroom.activitiesTeacher.qualify'
                                  "
                                  icon="search"
                                  :disabled="
                                    !scoreUpload &&
                                    !isExtraordinaryWindow &&
                                    profileIdLocalStorage != 1 &&
                                    profileIdLocalStorage != 6
                                  "
                                  outlined
                                  :to="{
                                    name: !isCourseExecution
                                      ? 'administration.homeTeacher.activities.qualifyActivity'
                                      : 'training.executionOfCoursesActivitiesQualify',
                                    params: {
                                      courseId: courseId,
                                      activityId: activity.activityId,
                                    },
                                  }"
                                ></AppButton>
                              </AppCheckPermission>
                            </div>
                          </th>
                        </template>
                      </template>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(studentData, studentIndex) in consolidate"
                      :key="studentIndex"
                      class="fila-intermedia"
                    >
                      <td
                        class="sticky-column-tbody"
                        style="
                          width: 200px;
                          white-space: nowrap;
                          word-wrap: break-word;
                          text-align: center;
                          border-right: 1px solid #ccc;
                        "
                      >
                        {{ studentData[0] }}
                      </td>
                      <template
                        v-for="(
                          activityCategory, categoryIndex
                        ) in activityCategories"
                        :key="categoryIndex"
                      >
                        <template
                          v-for="(
                            activity, activityIndex
                          ) in activityCategory.activities"
                          :key="activityIndex"
                        >
                          <td
                            v-if="selectButton && isQualitativeGradingId === 0"
                            class="text-center border-end mx-auto"
                          >
                            <input
                              v-if="selectButton"
                              type="number"
                              class="text-center mx-auto w-50 form-control"
                              :value="
                                getActivityScore(
                                  activity.activityId,
                                  studentData[1],
                                  activity.activityCategoryId
                                )
                              "
                              @change="
                                getActivityScoreEdit(
                                  activity.activityId,
                                  studentData[1],
                                  activity.activityCategoryId,
                                  $event
                                )
                              "
                            />
                          </td>
                          <td
                            v-else-if="isQualitativeGradingId === 0"
                            class="text-center border-end"
                          >
                            {{
                              getActivityScore(
                                activity.activityId,
                                studentData[1],
                                activity.activityCategoryId
                              )
                            }}
                          </td>
                          <td
                            v-if="selectButton && isQualitativeGradingId === 1"
                            class="text-center"
                          >
                            <div
                              class="d-flex justify-content-center align-items-center"
                            >
                              <AppAutocomplete
                                v-model="activity.deliveries[studentData[1]]"
                                class="app-autocomplete-fixed"
                                :options="ratingScalesList"
                                :reduce="(ratingScale: any) => ratingScale.maximumValue"
                                :value="
                                  getActivityScore(
                                    activity.activityId,
                                    studentData[1],
                                    activity.activityCategoryId
                                  )
                                "
                                @change="
                                  getActivityScoreEdit(
                                    activity.activityId,
                                    studentData[1],
                                    activity.activityCategoryId,
                                    $event
                                  )
                                "
                                label="description"
                              />
                            </div>
                          </td>

                          <td
                            v-else-if="isQualitativeGradingId === 1"
                            class="text-center border-end"
                          >
                            {{
                              getActivityScoreQualitativeGrading(
                                activity.activityId,
                                studentData[1],
                                activity.activityCategoryId
                              )
                            }}
                          </td>
                        </template>
                      </template>
                      <td
                        v-if="isQualitativeGradingId === 1"
                        class="text-center border-end sticky-column-tbody-finish"
                        style="
                          white-space: 'nowrap';
                          border-right: 1px solid #ccc;
                        "
                      >
                        {{
                          ratingScalesList.find(
                            (item: any) =>
                              studentData[2] >= item.minimumValue &&
                              studentData[2] <= item.maximumValue
                          )?.description || '-'
                        }}
                      </td>

                      <td
                        v-else
                        class="text-center border-end sticky-column-tbody-finish"
                        style="border-right: 1px solid #ccc"
                        :style="{
                          backgroundColor:
                            studentData[3] === 1 ? '#ffffaa' : '',
                          whiteSpace: 'nowrap',
                        }"
                      >
                        {{ studentData[2] || '-' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-else-if="averageWithoutBag">
              <div class="table-container" v-sticky-hscroll>
                <table
                  class="table-fixed responsive-table table-striped table-bordered"
                  style="border-collapse: collapse"
                >
                  <colgroup>
                    <col style="width: 160px" />
                    <col
                      v-for="(
                        activityCategory, categoryIndex
                      ) in activityCategories"
                      :key="categoryIndex"
                      :style="{
                        width: `${activityCategory.activities.length * 160}px`,
                      }"
                    />
                    <col style="width: 160px" />
                  </colgroup>
                  <thead class="sticky-top">
                    <tr class="sticky-header" style="background-color: #e4e4e4">
                      <th
                        rowspan="2"
                        class="text-center border-end border-bottom border-left border-right sticky-column-thead"
                        style="
                          width: 160px;
                          white-space: nowrap;
                          word-wrap: break-word;
                          text-align: center;
                        "
                      >
                        Estudiante
                      </th>
                      <template
                        v-for="(
                          activityCategory, categoryIndex
                        ) in activityCategories"
                        :key="categoryIndex"
                      >
                        <template
                          v-for="(
                            activity, activityIndex
                          ) in activityCategory.activities"
                          :key="activityIndex"
                        >
                          <th
                            class="text-center align-items-center border-end border-bottom"
                            :style="{
                              borderLeft: '1px solid #ccc',
                              borderRight: '1px solid #ccc',
                              minWidth: '160px',
                              maxWidth: '160px',
                            }"
                          >
                            {{ activity.name }}
                            <div
                              class="buttons-activities"
                              style="white-space: nowrap"
                            >
                              <AppCheckPermission
                                permission="classroom.activitiesTeacher.edit"
                              >
                                <AppButtonEdit
                                  :disabled="
                                    !scoreUpload &&
                                    !isExtraordinaryWindow &&
                                    profileIdLocalStorage != 1 &&
                                    profileIdLocalStorage != 6
                                  "
                                  @click="
                                    toggleDrawerEdit(
                                      courseId,
                                      activity.activityId
                                    )
                                  "
                                >
                                </AppButtonEdit>
                              </AppCheckPermission>
                              <AppCheckPermission
                                permission="classroom.activitiesTeacher.delete"
                              >
                                <AppButtonDelete
                                  :disabled="
                                    !scoreUpload &&
                                    !isExtraordinaryWindow &&
                                    profileIdLocalStorage != 1 &&
                                    profileIdLocalStorage != 6
                                  "
                                  @click="
                                    openConfirmDelete(activity.activityId)
                                  "
                                ></AppButtonDelete>
                              </AppCheckPermission>
                              <AppCheckPermission
                                permission="classroom.activitiesTeacher.edit"
                              >
                                <AppButton
                                  v-tooltip="
                                    'classroom.activitiesTeacher.qualify'
                                  "
                                  icon="search"
                                  :disabled="
                                    !scoreUpload &&
                                    !isExtraordinaryWindow &&
                                    profileIdLocalStorage != 1 &&
                                    profileIdLocalStorage != 6
                                  "
                                  outlined
                                  :to="{
                                    name: !isCourseExecution
                                      ? 'administration.homeTeacher.activities.qualifyActivity'
                                      : 'training.executionOfCoursesActivitiesQualify',
                                    params: {
                                      courseId: courseId,
                                      activityId: activity.activityId,
                                    },
                                  }"
                                ></AppButton>
                              </AppCheckPermission>
                            </div>
                          </th>
                        </template>
                      </template>
                      <th
                        rowspan="2"
                        class="text-center border-end border-bottom border-left border-right sticky-column-thead-finish"
                        style="
                          width: 200px;
                          white-space: nowrap;
                          word-wrap: break-word;
                          text-align: center;
                          border-right: 1px solid #ccc;
                        "
                      >
                        Nota final
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(studentData, studentIndex) in consolidate"
                      :key="studentIndex"
                      class="fila-intermedia"
                    >
                      <td
                        class="sticky-column-tbody"
                        style="
                          width: 200px;
                          white-space: nowrap;
                          word-wrap: break-word;
                          text-align: center;
                          border-left: 1px solid #ccc;
                          border-right: 1px solid #ccc;
                        "
                      >
                        {{ studentData[0] }}
                      </td>
                      <template
                        v-for="(
                          activityCategory, categoryIndex
                        ) in activityCategories"
                        :key="categoryIndex"
                      >
                        <template
                          v-for="(
                            activity, activityIndex
                          ) in activityCategory.activities"
                          :key="activityIndex"
                        >
                          <td
                            v-if="selectButton && isQualitativeGradingId === 0"
                            class="text-center border-end mx-auto"
                          >
                            <input
                              v-if="selectButton"
                              type="number"
                              class="text-center mx-auto w-50 form-control"
                              :value="
                                getActivityScore(
                                  activity.activityId,
                                  studentData[1],
                                  activity.activityCategoryId
                                )
                              "
                              @change="
                                getActivityScoreEdit(
                                  activity.activityId,
                                  studentData[1],
                                  activity.activityCategoryId,
                                  $event
                                )
                              "
                            />
                          </td>
                          <td
                            v-else-if="isQualitativeGradingId === 0"
                            class="text-center border-end"
                          >
                            {{
                              getActivityScore(
                                activity.activityId,
                                studentData[1],
                                activity.activityCategoryId
                              )
                            }}
                          </td>

                          <td
                            v-if="selectButton && isQualitativeGradingId === 1"
                            class="text-center"
                          >
                            <div
                              class="d-flex justify-content-center align-items-center"
                            >
                              <AppAutocomplete
                                v-model="activity.deliveries[studentData[1]]"
                                class="app-autocomplete-fixed"
                                :options="ratingScalesList"
                                :reduce="(ratingScale: any) => ratingScale.maximumValue"
                                :value="
                                  getActivityScore(
                                    activity.activityId,
                                    studentData[1],
                                    activity.activityCategoryId
                                  )
                                "
                                @change="
                                  getActivityScoreEdit(
                                    activity.activityId,
                                    studentData[1],
                                    activity.activityCategoryId,
                                    $event
                                  )
                                "
                                label="description"
                              />
                            </div>
                          </td>

                          <td
                            v-else-if="isQualitativeGradingId === 1"
                            class="text-center border-end"
                          >
                            {{
                              getActivityScoreQualitativeGrading(
                                activity.activityId,
                                studentData[1],
                                activity.activityCategoryId
                              )
                            }}
                          </td>
                        </template>
                      </template>
                      <td
                        v-if="isQualitativeGradingId === 1"
                        class="text-center border-end sticky-column-tbody-finish"
                        style="
                          border-right: 1px solid #ccc;
                          white-space: 'nowrap';
                        "
                      >
                        {{
                          ratingScalesList.find(
                            (item: any) => item.maximumValue === studentData[2]
                          )?.description || '-'
                        }}
                      </td>
                      <td
                        v-else
                        class="text-center border-end sticky-column-tbody-finish"
                        style="border-right: 1px solid #ccc"
                        :style="{
                          backgroundColor:
                            studentData[3] === 1 ? '#ffffaa' : '',
                          whiteSpace: 'nowrap',
                        }"
                      >
                        {{ studentData[2] || '-' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-else-if="competences">
              <div class="table-container" v-sticky-hscroll>
                <table
                  class="table-fixed responsive-table table-striped table-bordered"
                  style="border-collapse: collapse"
                >
                  <thead class="sticky-top">
                    <tr class="sticky-header" style="background-color: #e4e4e4">
                      <th
                        rowspan="2"
                        class="text-center border-end border-bottom border-left border-right sticky-column-thead"
                        style="
                          width: 200px;
                          white-space: nowrap;
                          word-wrap: break-word;
                          text-align: center;
                          border-right: 1px solid #ccc;
                        "
                      >
                        Estudiante
                      </th>
                      <template
                        v-for="(
                          competency, competencyIndex
                        ) in uniqueCompetencies"
                        :key="competencyIndex"
                      >
                        <th
                          :colspan="competency.activities.length"
                          class="text-center border-end border-bottom"
                          :style="{
                            border: '1px solid #ccc',
                            minWidth: '160px',
                          }"
                        >
                          {{ competency.nameCompetencyId }} ({{
                            competency.categoryPercentCompetency
                          }}%)
                        </th>
                      </template>
                      <th
                        rowspan="2"
                        class="text-center border-end border-bottom border-left border-right sticky-column-thead-finish"
                        style="
                          width: 200px;
                          white-space: nowrap;
                          word-wrap: break-word;
                          text-align: center;
                          border-right: 1px solid #ccc;
                        "
                      >
                        Nota final
                      </th>
                    </tr>
                    <tr class="sticky-header">
                      <template
                        v-for="(
                          competency, competencyIndex
                        ) in uniqueCompetencies"
                        :key="competencyIndex"
                      >
                        <template
                          v-for="(
                            activity, activityIndex
                          ) in competency.activities"
                          :key="activityIndex"
                        >
                          <th
                            class="text-center border-end border-bottom"
                            :style="{
                              border: '1px solid #ccc',
                              minWidth: '160px',
                            }"
                          >
                            {{ activity.name }}
                            <div
                              class="buttons-activities"
                              style="white-space: nowrap"
                            >
                              <AppCheckPermission
                                permission="classroom.activitiesTeacher.edit"
                              >
                                <AppButtonEdit
                                  :disabled="
                                    !scoreUpload &&
                                    !isExtraordinaryWindow &&
                                    profileIdLocalStorage != 1 &&
                                    profileIdLocalStorage != 6
                                  "
                                  @click="
                                    toggleDrawerEdit(
                                      courseId,
                                      activity.activityId
                                    )
                                  "
                                >
                                </AppButtonEdit>
                              </AppCheckPermission>
                              <AppCheckPermission
                                permission="classroom.activitiesTeacher.delete"
                              >
                                <AppButtonDelete
                                  :disabled="
                                    !scoreUpload &&
                                    !isExtraordinaryWindow &&
                                    profileIdLocalStorage != 1 &&
                                    profileIdLocalStorage != 6
                                  "
                                  @click="
                                    openConfirmDelete(activity.activityId)
                                  "
                                ></AppButtonDelete>
                              </AppCheckPermission>
                              <AppCheckPermission
                                permission="classroom.activitiesTeacher.edit"
                              >
                                <AppButton
                                  v-tooltip="
                                    'classroom.activitiesTeacher.qualify'
                                  "
                                  icon="search"
                                  :disabled="
                                    !scoreUpload &&
                                    !isExtraordinaryWindow &&
                                    profileIdLocalStorage != 1 &&
                                    profileIdLocalStorage != 6
                                  "
                                  outlined
                                  :to="{
                                    name: !isCourseExecution
                                      ? 'administration.homeTeacher.activities.qualifyActivity'
                                      : 'training.executionOfCoursesActivitiesQualify',
                                    params: {
                                      courseId: courseId,
                                      activityId: activity.activityId,
                                    },
                                  }"
                                ></AppButton>
                              </AppCheckPermission>
                            </div>
                          </th>
                        </template>
                      </template>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(studentData, studentIndex) in consolidate"
                      :key="studentIndex"
                      class="fila-intermedia"
                    >
                      <td
                        class="sticky-column-tbody"
                        style="
                          width: 200px;
                          white-space: nowrap;
                          word-wrap: break-word;
                          text-align: center;
                          border-right: 1px solid #ccc;
                        "
                      >
                        {{ studentData[0] }}
                      </td>
                      <template
                        v-for="(
                          competency, competencyIndex
                        ) in uniqueCompetencies"
                        :key="competencyIndex"
                      >
                        <template
                          v-for="(
                            activity, activityIndex
                          ) in competency.activities"
                          :key="activityIndex"
                        >
                          <td
                            v-if="selectButton && isQualitativeGradingId === 0"
                            class="text-center border-end mx-auto"
                          >
                            <input
                              v-if="selectButton"
                              type="number"
                              class="text-center mx-auto w-50 form-control"
                              :value="
                                getActivityScore(
                                  activity.activityId,
                                  studentData[1],
                                  activity.activityCategoryId
                                )
                              "
                              @change="
                                getActivityScoreEdit(
                                  activity.activityId,
                                  studentData[1],
                                  activity.activityCategoryId,
                                  $event
                                )
                              "
                            />
                          </td>
                          <td
                            v-else-if="isQualitativeGradingId === 0"
                            class="text-center border-end"
                          >
                            {{
                              getActivityScoreCompetencies(
                                activity.activityId,
                                studentData[1],
                                competency.competencyId
                              ) || '-'
                            }}
                          </td>
                          <td
                            v-if="selectButton && isQualitativeGradingId === 1"
                            class="text-center"
                          >
                            <div
                              class="d-flex justify-content-center align-items-center"
                            >
                              <AppAutocomplete
                                v-model="activity.deliveries[studentData[1]]"
                                class="app-autocomplete-fixed"
                                :options="ratingScalesList"
                                :reduce="(ratingScale: any) => ratingScale.maximumValue"
                                :value="
                                  getActivityScore(
                                    activity.activityId,
                                    studentData[1],
                                    activity.activityCategoryId
                                  )
                                "
                                @change="
                                  getActivityScoreEdit(
                                    activity.activityId,
                                    studentData[1],
                                    activity.activityCategoryId,
                                    $event
                                  )
                                "
                                label="description"
                              />
                            </div>
                          </td>

                          <td
                            v-else-if="isQualitativeGradingId === 1"
                            class="text-center border-end"
                          >
                            {{
                              getActivityScoreQualitativeGrading(
                                activity.activityId,
                                studentData[1],
                                activity.activityCategoryId
                              )
                            }}
                          </td>
                        </template>
                      </template>
                      <td
                        v-if="isQualitativeGradingId === 1"
                        class="text-center border-end sticky-column-tbody-finish"
                        style="
                          border-right: 1px solid #ccc;
                          white-space: 'nowrap';
                        "
                      >
                        {{
                          ratingScalesList.find(
                            (item: any) => item.maximumValue === studentData[2]
                          )?.description || '-'
                        }}
                      </td>
                      <td
                        v-else
                        class="text-center border-end sticky-column-tbody-finish"
                        style="border-right: 1px solid #ccc"
                        :style="{
                          backgroundColor:
                            studentData[3] === 1 ? '#ffffaa' : '',
                          whiteSpace: 'nowrap',
                        }"
                      >
                        {{ studentData[2] || '-' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-else-if="indicators">
              <div class="table-container" v-sticky-hscroll>
                <table
                  class="table-fixed responsive-table table-striped table-bordered"
                  style="border-collapse: collapse"
                >
                  <thead class="sticky-top">
                    <tr class="sticky-header" style="background-color: #e4e4e4">
                      <th
                        rowspan="3"
                        class="text-center border-end border-bottom border-left border-right sticky-column-thead"
                        style="
                          width: 200px;
                          white-space: nowrap;
                          word-wrap: break-word;
                          text-align: center;
                          border-right: 1px solid #ccc;
                        "
                      >
                        Estudiante
                      </th>
                      <template
                        v-for="(
                          competency, competencyIndex
                        ) in uniqueIndicatorsByCompetency"
                        :key="competencyIndex"
                      >
                        <template
                          v-for="(
                            indicator, indicatorIndex
                          ) in competency.indicators"
                          :key="indicatorIndex"
                        >
                          <th
                            :colspan="indicator.activities.length + 2"
                            class="text-center border-end border-bottom"
                            :style="{
                              // border: '1px solid #ccc',
                              minWidth: '160px',
                            }"
                          >
                            {{ indicator.nameLearningOutcomeId }} ({{
                              indicator.categoryPercentLearningOutcome
                            }}%)
                          </th>
                        </template>
                      </template>
                      <th
                        rowspan="3"
                        class="text-center border-end border-bottom border-left border-right sticky-column-thead-finish"
                        style="
                          width: 200px;
                          white-space: nowrap;
                          word-wrap: break-word;
                          text-align: center;
                          border-right: 1px solid #ccc;
                        "
                      >
                        Nota final
                      </th>
                    </tr>
                    <tr class="sticky-header">
                      <template
                        v-for="(
                          competency, competencyIndex
                        ) in uniqueIndicatorsByCompetency"
                        :key="competencyIndex"
                      >
                        <template
                          v-for="(
                            indicator, indicatorIndex
                          ) in competency.indicators"
                          :key="indicatorIndex"
                        >
                          <template
                            v-for="(
                              activity, activityIndex
                            ) in indicator.activities"
                            :key="activityIndex"
                          >
                            <th
                              class="text-center border-end border-bottom"
                              :style="{
                                border: '1px solid #ccc',
                                minWidth: '160px',
                              }"
                            >
                              {{ activity.name }}
                              <div
                                class="buttons-activities"
                                style="white-space: nowrap"
                              >
                                <AppCheckPermission
                                  permission="classroom.activitiesTeacher.edit"
                                >
                                  <AppButtonEdit
                                    :disabled="
                                      !scoreUpload &&
                                      !isExtraordinaryWindow &&
                                      profileIdLocalStorage != 1 &&
                                      profileIdLocalStorage != 6
                                    "
                                    @click="
                                      toggleDrawerEdit(
                                        courseId,
                                        activity.activityId
                                      )
                                    "
                                  >
                                  </AppButtonEdit>
                                </AppCheckPermission>
                                <AppCheckPermission
                                  permission="classroom.activitiesTeacher.delete"
                                >
                                  <AppButtonDelete
                                    :disabled="
                                      !scoreUpload &&
                                      !isExtraordinaryWindow &&
                                      profileIdLocalStorage != 1 &&
                                      profileIdLocalStorage != 6
                                    "
                                    @click="
                                      openConfirmDelete(activity.activityId)
                                    "
                                  ></AppButtonDelete>
                                </AppCheckPermission>
                                <AppCheckPermission
                                  permission="classroom.activitiesTeacher.edit"
                                >
                                  <AppButton
                                    v-tooltip="
                                      'classroom.activitiesTeacher.qualify'
                                    "
                                    icon="search"
                                    :disabled="
                                      !scoreUpload &&
                                      !isExtraordinaryWindow &&
                                      profileIdLocalStorage != 1 &&
                                      profileIdLocalStorage != 6
                                    "
                                    outlined
                                    :to="{
                                      name: !isCourseExecution
                                        ? 'administration.homeTeacher.activities.qualifyActivity'
                                        : 'training.executionOfCoursesActivitiesQualify',
                                      params: {
                                        courseId: courseId,
                                        activityId: activity.activityId,
                                      },
                                    }"
                                  ></AppButton>
                                </AppCheckPermission>
                              </div>
                            </th>
                          </template>
                          <template
                            v-for="(score, scoreIndex) in indicator.scores"
                            :key="scoreIndex"
                          >
                            <th
                              class="text-center border-end border-bottom"
                              :class="{
                                // 'diagonal-split': score.name === 'Nivelación',
                              }"
                              :style="{
                                border: '1px solid #ccc',
                                minWidth: '160px',
                                /* Para la celda diagonal dejamos el fondo definido en la clase */
                                backgroundColor:
                                  score.name === 'Nivelación'
                                    ? 'rgb(228, 228, 228)'
                                    : 'rgb(228, 228, 228)',
                                position:
                                  score.name === 'Nivelación'
                                    ? 'relative'
                                    : 'static',
                              }"
                            >
                              <template v-if="score.name === 'Nivelación'">
                                <span class="top-text">Nivelación</span>
                                <!-- <span class="bottom-text">Mejoramiento de nota</span> -->
                              </template>
                              <template v-else>
                                {{
                                  score.name === 'Promedio'
                                    ? 'Nivel Alcanzado'
                                    : ''
                                }}
                              </template>
                            </th>
                          </template>
                        </template>
                      </template>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(studentData, studentIndex) in consolidate"
                      :key="studentIndex"
                      class="fila-intermedia"
                    >
                      <td
                        class="sticky-column-tbody"
                        style="
                          width: 200px;
                          white-space: nowrap;
                          word-wrap: break-word;
                          text-align: center;
                          border-right: 1px solid #ccc;
                        "
                      >
                        {{ studentData[0] }}
                      </td>
                      <template
                        v-for="(
                          competency, competencyIndex
                        ) in uniqueIndicatorsByCompetency"
                        :key="competencyIndex"
                      >
                        <template
                          v-for="(
                            indicator, indicatorIndex
                          ) in competency.indicators"
                          :key="indicatorIndex"
                        >
                          <template
                            v-for="(
                              activity, activityIndex
                            ) in indicator.activities"
                            :key="activityIndex"
                          >
                            <td
                              v-if="
                                selectButton && isQualitativeGradingId === 0
                              "
                              class="text-center border-end mx-auto"
                            >
                              <input
                                v-if="selectButton"
                                type="number"
                                class="text-center mx-auto w-50 form-control"
                                :value="
                                  getActivityScore(
                                    activity.activityId,
                                    studentData[1],
                                    activity.activityCategoryId
                                  )
                                "
                                @change="
                                  getActivityScoreEdit(
                                    activity.activityId,
                                    studentData[1],
                                    activity.activityCategoryId,
                                    $event
                                  )
                                "
                              />
                            </td>
                            <td
                              v-else-if="isQualitativeGradingId === 0"
                              class="text-center border-end"
                            >
                              {{
                                getActivityIndicatorScore(
                                  activity.activityId,
                                  studentData[1],
                                  indicator.learningOutcomeId
                                ) || '-'
                              }}
                            </td>
                            <td
                              v-if="
                                selectButton && isQualitativeGradingId === 1
                              "
                              class="text-center"
                            >
                              <div
                                class="d-flex justify-content-center align-items-center"
                              >
                                <AppAutocomplete
                                  v-model="activity.deliveries[studentData[1]]"
                                  class="app-autocomplete-fixed"
                                  :options="ratingScalesList"
                                  :reduce="(ratingScale: any) => ratingScale.maximumValue"
                                  :value="
                                    getActivityScore(
                                      activity.activityId,
                                      studentData[1],
                                      activity.activityCategoryId
                                    )
                                  "
                                  @change="
                                    getActivityScoreEdit(
                                      activity.activityId,
                                      studentData[1],
                                      activity.activityCategoryId,
                                      $event
                                    )
                                  "
                                  label="description"
                                />
                              </div>
                            </td>

                            <td
                              v-else-if="isQualitativeGradingId === 1"
                              class="text-center border-end"
                            >
                              {{
                                getActivityScoreQualitativeGrading(
                                  activity.activityId,
                                  studentData[1],
                                  activity.activityCategoryId
                                )
                              }}
                            </td>
                          </template>

                          <!-- Celda para la nueva columna -->
                          <template
                            v-for="(itemScore, scoreIndex) in indicator.scores"
                            :key="scoreIndex"
                          >
                            <td
                              v-if="
                                selectButton &&
                                isQualitativeGradingId === 0 &&
                                !(itemScore.name === 'Nivelación')
                              "
                              class="text-center border-end mx-auto"
                            >
                              <input
                                v-if="selectButton"
                                type="number"
                                class="text-center mx-auto w-50 form-control"
                                :value="
                                  getLearningOutcomeActivities(
                                    itemScore.learningOutcomeId,
                                    studentData[1],
                                    itemScore.name
                                  )
                                "
                                @change="
                                  getLearningOutcomeActivitiesInput(
                                    itemScore.learningOutcomeId,
                                    studentData[1],
                                    itemScore.name,
                                    $event
                                  )
                                "
                              />
                            </td>
                            <td
                              v-else-if="isQualitativeGradingId === 0"
                              class="text-center border-end"
                            >
                              <div class="buttons-activities">
                                <div style="padding: var(--padding-button)">
                                  {{
                                    getLearningOutcomeScore(
                                      itemScore.learningOutcomeId,
                                      studentData[1],
                                      itemScore.name
                                    )
                                  }}
                                </div>
                                <AppCheckPermission
                                  permission="classroom.activitiesTeacher.edit"
                                >
                                  <AppButtonEdit
                                    v-if="
                                      itemScore.name === 'Nivelación' &&
                                      !retrievalLock
                                    "
                                    @click="
                                      toggleRecoveryDrawerEdit(
                                        getLearningOutcomeScore(
                                          itemScore.learningOutcomeId,
                                          studentData[1],
                                          itemScore.name
                                        ),
                                        studentData[0],
                                        isQualitativeGradingId,
                                        itemScore.learningOutcomeId,
                                        studentData[1]
                                      )
                                    "
                                  />
                                </AppCheckPermission>
                                <AppCheckPermission
                                  permission="classroom.activitiesTeacher.delete"
                                >
                                  <AppButtonDelete
                                    v-if="
                                      itemScore.name === 'Nivelación' &&
                                      !retrievalLock &&
                                      getLearningOutcomeScore(
                                        itemScore.learningOutcomeId,
                                        studentData[1],
                                        itemScore.name
                                      )
                                    "
                                    @click="
                                      toggleRecoveryDrawerDelete(
                                        getLearningOutcomeScore(
                                          itemScore.learningOutcomeId,
                                          studentData[1],
                                          itemScore.name
                                        ),
                                        studentData[0],
                                        isQualitativeGradingId,
                                        itemScore.learningOutcomeId,
                                        studentData[1]
                                      )
                                    "
                                  />
                                </AppCheckPermission>
                              </div>
                            </td>

                            <td
                              v-if="
                                selectButton &&
                                isQualitativeGradingId === 1 &&
                                !(itemScore.name === 'Nivelación')
                              "
                              class="text-center"
                            >
                              <div
                                class="d-flex justify-content-center align-items-center"
                              >
                                <AppAutocomplete
                                  v-model="itemScore.score[studentData[1]]"
                                  class="app-autocomplete-fixed"
                                  :options="ratingScalesList"
                                  :reduce="(ratingScale: any) => ratingScale.maximumValue"
                                  :value="
                                    getLearningOutcomeActivities(
                                      itemScore.learningOutcomeId,
                                      studentData[1],
                                      itemScore.name
                                    )
                                  "
                                  @update:modelValue="
                                    getLearningOutcomeActivitiesInputAutoComplete(
                                      itemScore.learningOutcomeId,
                                      studentData[1],
                                      itemScore.name,
                                      $event
                                    )
                                  "
                                  label="description"
                                />
                              </div>
                            </td>
                            <td
                              v-else-if="isQualitativeGradingId === 1"
                              class="text-center border-end"
                            >
                              <div
                                class="buttons-activities"
                                style="white-space: nowrap"
                              >
                                <div
                                  v-if="!(itemScore.name === 'Nivelación')"
                                  style="padding: var(--padding-button)"
                                  :style="
                                    getModified(
                                      itemScore.learningOutcomeId,
                                      studentData[1]
                                    )
                                  "
                                >
                                  {{
                                    getLearningOutcomeActivitiesQualitative(
                                      itemScore.learningOutcomeId,
                                      studentData[1],
                                      itemScore.name
                                    )
                                  }}
                                </div>

                                <div
                                  v-else
                                  style="padding: var(--padding-button)"
                                >
                                  {{
                                    getLearningOutcomeActivitiesQualitative(
                                      itemScore.learningOutcomeId,
                                      studentData[1],
                                      itemScore.name
                                    )
                                  }}
                                </div>

                                <AppCheckPermission
                                  permission="classroom.activitiesTeacher.edit"
                                >
                                  <AppButtonEdit
                                    v-if="
                                      itemScore.name === 'Nivelación' &&
                                      !retrievalLock
                                    "
                                    @click="
                                      toggleRecoveryDrawerEdit(
                                        getLearningOutcomeActivitiesQualitative(
                                          itemScore.learningOutcomeId,
                                          studentData[1],
                                          itemScore.name
                                        ),
                                        studentData[0],
                                        isQualitativeGradingId,
                                        itemScore.learningOutcomeId,
                                        studentData[1]
                                      )
                                    "
                                  />
                                </AppCheckPermission>
                                <AppCheckPermission
                                  permission="classroom.activitiesTeacher.delete"
                                >
                                  <AppButtonDelete
                                    v-if="
                                      itemScore.name === 'Nivelación' &&
                                      !retrievalLock &&
                                      getLearningOutcomeActivitiesQualitative(
                                        itemScore.learningOutcomeId,
                                        studentData[1],
                                        itemScore.name
                                      ) != '-'
                                    "
                                    @click="
                                      toggleRecoveryDrawerDelete(
                                        getLearningOutcomeActivitiesQualitative(
                                          itemScore.learningOutcomeId,
                                          studentData[1],
                                          itemScore.name
                                        ),
                                        studentData[0],
                                        isQualitativeGradingId,
                                        itemScore.learningOutcomeId,
                                        studentData[1]
                                      )
                                    "
                                  />
                                </AppCheckPermission>
                              </div>
                            </td>
                          </template>
                        </template>
                      </template>
                      <td
                        v-if="isQualitativeGradingId === 1"
                        class="text-center border-end sticky-column-tbody-finish"
                        style="border-right: 1px solid #ccc"
                        :style="{
                          backgroundColor:
                            studentData[3] === 1 ? '#ffffaa' : '',
                          whiteSpace: 'nowrap',
                        }"
                      >
                        {{
                          ratingScalesList.find(
                            (item: any) =>
                              studentData[2] >= item.minimumValue &&
                              studentData[2] <= item.maximumValue
                          )?.description || '-'
                        }}

                        <!-- const score = ratingScalesList.value.find((item: any) => scoreData >= item.minimumValue && scoreData <= item.maximumValue); -->
                      </td>
                      <td
                        v-else
                        class="text-center border-end sticky-column-tbody-finish"
                        style="border-right: 1px solid #ccc"
                        :style="{
                          backgroundColor:
                            studentData[3] === 1 ? '#ffffaa' : '',
                          whiteSpace: 'nowrap',
                        }"
                      >
                        {{ studentData[2] || '-' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-else-if="competenciesAndIndicators">
              <div class="table-container" v-sticky-hscroll>
                <table
                  class="table-fixed responsive-table table-striped table-bordered"
                  style="border-collapse: collapse"
                >
                  <thead class="sticky-top">
                    <tr class="sticky-header" style="background-color: #e4e4e4">
                      <th
                        rowspan="3"
                        class="text-center border-end border-bottom border-left border-right sticky-column-thead"
                        style="
                          width: 200px;
                          white-space: nowrap;
                          word-wrap: break-word;
                          text-align: center;
                          border-right: 1px solid #ccc;
                        "
                      >
                        Estudiante
                      </th>
                      <template
                        v-for="(
                          competency, competencyIndex
                        ) in uniqueCompetencies"
                        :key="competencyIndex"
                      >
                        <th
                          :colspan="competency.activities.length"
                          class="text-center border-end border-bottom"
                          :style="{
                            border: '1px solid #ccc',
                            minWidth: '160px',
                          }"
                        >
                          {{ competency.nameCompetencyId }} ({{
                            competency.categoryPercentCompetency
                          }}%)
                        </th>
                      </template>
                      <th
                        rowspan="3"
                        class="text-center border-end border-bottom border-left border-right sticky-column-thead-finish"
                        style="
                          width: 200px;
                          white-space: nowrap;
                          word-wrap: break-word;
                          text-align: center;
                          border-right: 1px solid #ccc;
                        "
                      >
                        Nota final
                      </th>
                    </tr>
                    <tr class="sticky-header">
                      <template
                        v-for="(
                          competency, competencyIndex
                        ) in uniqueIndicatorsByCompetency"
                        :key="competencyIndex"
                      >
                        <template
                          v-for="(
                            indicator, indicatorIndex
                          ) in competency.indicators"
                          :key="indicatorIndex"
                        >
                          <th
                            :colspan="indicator.activities.length || 2"
                            class="text-center border-end border-bottom"
                            :style="{
                              border: '1px solid #ccc',
                              minWidth: '160px',
                            }"
                          >
                            {{ indicator.nameLearningOutcomeId }} ({{
                              indicator.categoryPercentLearningOutcome
                            }}%)
                          </th>
                        </template>
                      </template>
                    </tr>
                    <tr class="sticky-header">
                      <template
                        v-for="(
                          competency, competencyIndex
                        ) in uniqueIndicatorsByCompetency"
                        :key="competencyIndex"
                      >
                        <template
                          v-for="(
                            indicator, indicatorIndex
                          ) in competency.indicators"
                          :key="indicatorIndex"
                        >
                          <template
                            v-for="(
                              activity, activityIndex
                            ) in indicator.activities"
                            :key="activityIndex"
                          >
                            <th
                              class="text-center border-end border-bottom"
                              :style="{
                                border: '1px solid #ccc',
                                minWidth: '160px',
                              }"
                            >
                              {{ activity.name }}
                              <div
                                class="buttons-activities"
                                style="white-space: nowrap"
                              >
                                <AppCheckPermission
                                  permission="classroom.activitiesTeacher.edit"
                                >
                                  <AppButtonEdit
                                    :disabled="
                                      !scoreUpload &&
                                      !isExtraordinaryWindow &&
                                      profileIdLocalStorage != 1 &&
                                      profileIdLocalStorage != 6
                                    "
                                    @click="
                                      toggleDrawerEdit(
                                        courseId,
                                        activity.activityId
                                      )
                                    "
                                  >
                                  </AppButtonEdit>
                                </AppCheckPermission>
                                <AppCheckPermission
                                  permission="classroom.activitiesTeacher.delete"
                                >
                                  <AppButtonDelete
                                    :disabled="
                                      !scoreUpload &&
                                      !isExtraordinaryWindow &&
                                      profileIdLocalStorage != 1 &&
                                      profileIdLocalStorage != 6
                                    "
                                    @click="
                                      openConfirmDelete(activity.activityId)
                                    "
                                  ></AppButtonDelete>
                                </AppCheckPermission>
                                <AppCheckPermission
                                  permission="classroom.activitiesTeacher.edit"
                                >
                                  <AppButton
                                    v-tooltip="
                                      'classroom.activitiesTeacher.qualify'
                                    "
                                    icon="search"
                                    :disabled="
                                      !scoreUpload &&
                                      !isExtraordinaryWindow &&
                                      profileIdLocalStorage != 1 &&
                                      profileIdLocalStorage != 6
                                    "
                                    outlined
                                    :to="{
                                      name: !isCourseExecution
                                        ? 'administration.homeTeacher.activities.qualifyActivity'
                                        : 'training.executionOfCoursesActivitiesQualify',
                                      params: {
                                        courseId: courseId,
                                        activityId: activity.activityId,
                                      },
                                    }"
                                  ></AppButton>
                                </AppCheckPermission>
                              </div>
                            </th>
                          </template>
                        </template>
                      </template>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(studentData, studentIndex) in consolidate"
                      :key="studentIndex"
                      class="fila-intermedia"
                    >
                      <td
                        class="sticky-column-tbody"
                        style="
                          width: 200px;
                          white-space: nowrap;
                          word-wrap: break-word;
                          text-align: center;
                          border-right: 1px solid #ccc;
                        "
                      >
                        {{ studentData[0] }}
                      </td>
                      <template
                        v-for="(
                          competency, competencyIndex
                        ) in uniqueIndicatorsByCompetency"
                        :key="competencyIndex"
                      >
                        <template
                          v-for="(
                            indicator, indicatorIndex
                          ) in competency.indicators"
                          :key="indicatorIndex"
                        >
                          <template
                            v-for="(
                              activity, activityIndex
                            ) in indicator.activities"
                            :key="activityIndex"
                          >
                            <td
                              v-if="
                                selectButton && isQualitativeGradingId === 0
                              "
                              class="text-center border-end mx-auto"
                            >
                              <input
                                v-if="selectButton"
                                type="number"
                                class="text-center mx-auto w-50 form-control"
                                :value="
                                  getActivityScore(
                                    activity.activityId,
                                    studentData[1],
                                    activity.activityCategoryId
                                  )
                                "
                                @change="
                                  getActivityScoreEdit(
                                    activity.activityId,
                                    studentData[1],
                                    activity.activityCategoryId,
                                    $event
                                  )
                                "
                              />
                            </td>
                            <td
                              v-else-if="isQualitativeGradingId === 0"
                              class="text-center border-end"
                            >
                              {{
                                getActivityIndicatorScore(
                                  activity.activityId,
                                  studentData[1],
                                  indicator.learningOutcomeId
                                ) || '-'
                              }}
                            </td>
                            <td
                              v-if="
                                selectButton && isQualitativeGradingId === 1
                              "
                              class="text-center"
                            >
                              <div
                                class="d-flex justify-content-center align-items-center"
                              >
                                <AppAutocomplete
                                  v-model="activity.deliveries[studentData[1]]"
                                  class="app-autocomplete-fixed"
                                  :options="ratingScalesList"
                                  :reduce="(ratingScale: any) => ratingScale.maximumValue"
                                  :value="
                                    getActivityScore(
                                      activity.activityId,
                                      studentData[1],
                                      activity.activityCategoryId
                                    )
                                  "
                                  @change="
                                    getActivityScoreEdit(
                                      activity.activityId,
                                      studentData[1],
                                      activity.activityCategoryId,
                                      $event
                                    )
                                  "
                                  label="description"
                                />
                              </div>
                            </td>

                            <td
                              v-else-if="isQualitativeGradingId === 1"
                              class="text-center border-end"
                            >
                              {{
                                getActivityScoreQualitativeGrading(
                                  activity.activityId,
                                  studentData[1],
                                  activity.activityCategoryId
                                )
                              }}
                            </td>
                          </template>
                        </template>
                      </template>
                      <td
                        v-if="isQualitativeGradingId === 1"
                        class="text-center border-end sticky-column-tbody-finish"
                        style="
                          border-right: 1px solid #ccc;
                          white-space: 'nowrap';
                        "
                      >
                        {{
                          ratingScalesList.find(
                            (item: any) => item.maximumValue === studentData[2]
                          )?.description || '-'
                        }}
                      </td>
                      <td
                        v-else
                        class="text-center sticky-column-tbody-finish"
                        style="
                          position: sticky;
                          background-color: white;
                          border-right: 1px solid #ccc;
                          width: 160px;
                        "
                        :style="{
                          backgroundColor:
                            studentData[3] === 1 ? '#ffffaa' : '',
                          whiteSpace: 'nowrap',
                        }"
                      >
                        {{ studentData[2] || '-' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-else-if="indicatorsAndBag">
              <div class="table-container" v-sticky-hscroll>
                <table
                  class="table-fixed responsive-table table-striped table-bordered"
                  style="border-collapse: collapse"
                >
                  <thead class="sticky-top">
                    <tr class="sticky-header" style="background-color: #e4e4e4">
                      <th
                        rowspan="3"
                        class="text-center border-end border-bottom border-left border-right sticky-column-thead"
                        style="
                          width: 200px;
                          white-space: nowrap;
                          word-wrap: break-word;
                          text-align: center;
                          border-right: 1px solid #ccc;
                        "
                      >
                        Estudiante
                      </th>
                      <template
                        v-for="(
                          competency, competencyIndex
                        ) in uniqueCompetencies"
                        :key="competencyIndex"
                      >
                        <th
                          :colspan="competency.activities.length"
                          class="text-center border-end border-bottom"
                          :style="{
                            border: '1px solid #ccc',
                            minWidth: '160px',
                          }"
                        >
                          {{ competency.nameCompetencyId }}
                        </th>
                      </template>
                      <th
                        rowspan="3"
                        class="text-center border-end border-bottom border-left border-right sticky-column-thead-finish"
                        style="
                          width: 200px;
                          white-space: nowrap;
                          word-wrap: break-word;
                          text-align: center;
                          border-right: 1px solid #ccc;
                        "
                      >
                        Nota final
                      </th>
                    </tr>
                    <tr class="sticky-header">
                      <template
                        v-for="(
                          competency, competencyIndex
                        ) in uniqueIndicatorsByCompetency"
                        :key="competencyIndex"
                      >
                        <template
                          v-for="(
                            indicator, indicatorIndex
                          ) in competency.indicators"
                          :key="indicatorIndex"
                        >
                          <th
                            :colspan="indicator.activities.length || 2"
                            class="text-center border-end border-bottom"
                            :style="{
                              border: '1px solid #ccc',
                              minWidth: '160px',
                            }"
                          >
                            {{ indicator.nameLearningOutcomeId }} ({{
                              indicator.categoryPercentLearningOutcome
                            }}%)
                          </th>
                        </template>
                      </template>
                    </tr>
                    <tr class="sticky-header">
                      <template
                        v-for="(
                          competency, competencyIndex
                        ) in uniqueIndicatorsByCompetency"
                        :key="competencyIndex"
                      >
                        <template
                          v-for="(
                            indicator, indicatorIndex
                          ) in competency.indicators"
                          :key="indicatorIndex"
                        >
                          <template
                            v-for="(
                              activityCategory, activityIndex
                            ) in indicator.activities"
                            :key="activityIndex"
                          >
                            <th
                              :colspan="activityCategory.length"
                              class="text-center border-end border-bottom"
                              :style="{
                                borderLeft: '1px solid #ccc',
                                borderRight: '1px solid #ccc',
                                minWidth: '160px',
                              }"
                            >
                              {{ activityCategory.nameActivityCategoryId }}
                              ({{
                                activityCategory.categoryPercentActivityCategory
                              }}%)
                            </th>
                          </template>
                        </template>
                      </template>
                    </tr>
                    <tr class="sticky-header">
                      <th
                        style="
                          /* position: sticky; */
                          /* left: 0; */
                          /* background-color: white; */
                          width: 200px;
                          white-space: nowrap;
                          word-wrap: break-word;
                          text-align: center;
                          border-right: 1px solid #ccc;
                        "
                      ></th>
                      <template
                        v-for="(
                          competency, competencyIndex
                        ) in uniqueIndicatorsByCompetency"
                        :key="competencyIndex"
                      >
                        <template
                          v-for="(
                            indicator, indicatorIndex
                          ) in competency.indicators"
                          :key="indicatorIndex"
                        >
                          <template
                            v-for="(
                              activity, activityIndex
                            ) in indicator.activities"
                            :key="activityIndex"
                          >
                            <th
                              class="text-center border-end border-bottom"
                              :style="{
                                border: '1px solid #ccc',
                                minWidth: '160px',
                              }"
                            >
                              {{ activity.name }}
                              <div
                                class="buttons-activities"
                                style="white-space: nowrap"
                              >
                                <AppCheckPermission
                                  permission="classroom.activitiesTeacher.edit"
                                >
                                  <AppButtonEdit
                                    :disabled="
                                      !scoreUpload &&
                                      !isExtraordinaryWindow &&
                                      profileIdLocalStorage != 1 &&
                                      profileIdLocalStorage != 6
                                    "
                                    @click="
                                      toggleDrawerEdit(
                                        courseId,
                                        activity.activityId
                                      )
                                    "
                                  >
                                  </AppButtonEdit>
                                </AppCheckPermission>
                                <AppCheckPermission
                                  permission="classroom.activitiesTeacher.delete"
                                >
                                  <AppButtonDelete
                                    :disabled="
                                      !scoreUpload &&
                                      !isExtraordinaryWindow &&
                                      profileIdLocalStorage != 1 &&
                                      profileIdLocalStorage != 6
                                    "
                                    @click="
                                      openConfirmDelete(activity.activityId)
                                    "
                                  ></AppButtonDelete>
                                </AppCheckPermission>
                                <AppCheckPermission
                                  permission="classroom.activitiesTeacher.edit"
                                >
                                  <AppButton
                                    v-tooltip="
                                      'classroom.activitiesTeacher.qualify'
                                    "
                                    icon="search"
                                    :disabled="
                                      !scoreUpload &&
                                      !isExtraordinaryWindow &&
                                      profileIdLocalStorage != 1 &&
                                      profileIdLocalStorage != 6
                                    "
                                    outlined
                                    :to="{
                                      name: !isCourseExecution
                                        ? 'administration.homeTeacher.activities.qualifyActivity'
                                        : 'training.executionOfCoursesActivitiesQualify',
                                      params: {
                                        courseId: courseId,
                                        activityId: activity.activityId,
                                      },
                                    }"
                                  ></AppButton>
                                </AppCheckPermission>
                              </div>
                            </th>
                          </template>
                        </template>
                      </template>
                      <th
                        class="text-center"
                        style="
                          position: sticky;
                          background-color: white;
                          border-end: 1px solid #ccc;
                          width: 160px;
                        "
                      ></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(studentData, studentIndex) in consolidate"
                      :key="studentIndex"
                      class="fila-intermedia"
                    >
                      <td
                        class="sticky-column-tbody"
                        style="
                          width: 200px;
                          white-space: nowrap;
                          word-wrap: break-word;
                          text-align: center;
                          border-right: 1px solid #ccc;
                        "
                      >
                        {{ studentData[0] }}
                      </td>
                      <template
                        v-for="(
                          competency, competencyIndex
                        ) in uniqueIndicatorsByCompetency"
                        :key="competencyIndex"
                      >
                        <template
                          v-for="(
                            indicator, indicatorIndex
                          ) in competency.indicators"
                          :key="indicatorIndex"
                        >
                          <template
                            v-for="(
                              activity, categoryIndex
                            ) in indicator.activities"
                            :key="categoryIndex"
                          >
                            <td
                              v-if="
                                selectButton && isQualitativeGradingId === 0
                              "
                              class="text-center border-end mx-auto"
                            >
                              <input
                                v-if="selectButton"
                                type="number"
                                class="text-center mx-auto w-50 form-control"
                                :value="
                                  getActivityScore(
                                    activity.activityId,
                                    studentData[1],
                                    activity.activityCategoryId
                                  )
                                "
                                @change="
                                  getActivityScoreEdit(
                                    activity.activityId,
                                    studentData[1],
                                    activity.activityCategoryId,
                                    $event
                                  )
                                "
                              />
                            </td>
                            <td
                              v-else-if="isQualitativeGradingId === 0"
                              class="text-center border-end"
                            >
                              {{
                                getActivityIndicatorScore(
                                  activity.activityId,
                                  studentData[1],
                                  indicator.learningOutcomeId
                                ) || '-'
                              }}
                            </td>
                            <td
                              v-if="
                                selectButton && isQualitativeGradingId === 1
                              "
                              class="text-center"
                            >
                              <div
                                class="d-flex justify-content-center align-items-center"
                              >
                                <AppAutocomplete
                                  v-model="activity.deliveries[studentData[1]]"
                                  class="app-autocomplete-fixed"
                                  :options="ratingScalesList"
                                  :reduce="(ratingScale: any) => ratingScale.maximumValue"
                                  :value="
                                    getActivityScore(
                                      activity.activityId,
                                      studentData[1],
                                      activity.activityCategoryId
                                    )
                                  "
                                  @change="
                                    getActivityScoreEdit(
                                      activity.activityId,
                                      studentData[1],
                                      activity.activityCategoryId,
                                      $event
                                    )
                                  "
                                  label="description"
                                />
                              </div>
                            </td>

                            <td
                              v-else-if="isQualitativeGradingId === 1"
                              class="text-center border-end"
                            >
                              {{
                                getActivityScoreQualitativeGrading(
                                  activity.activityId,
                                  studentData[1],
                                  activity.activityCategoryId
                                )
                              }}
                            </td>
                          </template>
                        </template>
                      </template>
                      <td
                        v-if="isQualitativeGradingId === 1"
                        class="text-center border-end sticky-column-tbody-finish"
                        style="
                          border-right: 1px solid #ccc;
                          white-space: 'nowrap';
                        "
                      >
                        {{
                          ratingScalesList.find(
                            (item: any) => item.maximumValue === studentData[2]
                          )?.description || '-'
                        }}
                      </td>
                      <td
                        v-else
                        class="text-center border-end sticky-column-tbody-finish"
                        style="border-right: 1px solid #ccc"
                        :style="{
                          backgroundColor:
                            studentData[3] === 1 ? '#ffffaa' : '',
                          whiteSpace: 'nowrap',
                        }"
                      >
                        {{ studentData[2] }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <AppEmptyResponse v-else :subtitle="false" :showImage="true" />
          </div>
          <!-- View table activities -->
          <div v-if="table">
            <AppDatatable
              name="activities"
              :service="servicePagination"
              :params="params"
            >
              <!--   <template #filters>
            </template> -->

              <AppDatatableColumn
                v-slot="{ row }"
                label="Actividad"
                field="name"
                :sortable="true"
              >
                {{ row.name }}
              </AppDatatableColumn>

              <AppDatatableColumn
                v-slot="{ row }"
                label="Inicio"
                field="dateSince"
                :sortable="true"
              >
                {{ row.dateSince }}
              </AppDatatableColumn>

              <AppDatatableColumn
                v-slot="{ row }"
                label="Cierre"
                field="dateUntil"
                :sortable="true"
              >
                {{ row.dateUntil }}
              </AppDatatableColumn>

              <AppDatatableColumn
                v-slot="{ row }"
                label="Descripción"
                field="description"
                :sortable="true"
              >
                {{ row.description }}
              </AppDatatableColumn>

              <AppDatatableColumn
                v-slot="{ row }"
                label="Competencias evaluadas"
                field="nameCompetence"
                :sortable="true"
              >
                {{ row.nameCompetence }}
              </AppDatatableColumn>

              <AppDatatableColumn
                v-slot="{ row }"
                label="Indicadores de desempeño evaluados"
                field="earningOutcomes.description"
                :sortable="true"
              >
                <span
                  v-for="(learningOutcomes, index) in row.learningOutcomes"
                  :key="index"
                >
                  {{ learningOutcomes.description
                  }}<span v-if="index !== row.learningOutcomes.length - 1">
                    -
                  </span>
                </span>
              </AppDatatableColumn>

              <AppDatatableColumn
                v-slot="{ row }"
                label="Temas evaluados"
                field="topics.description"
                :sortable="true"
              >
                <span v-for="(topics, index) in row.topics" :key="index">
                  {{ topics.description
                  }}<span v-if="index !== row.topics.length - 1"> - </span>
                </span>
              </AppDatatableColumn>

              <AppDatatableColumn
                v-slot="{ row }"
                label="Categoría"
                field="categoryName"
                :sortable="true"
              >
                {{ row.categoryName }}
              </AppDatatableColumn>

              <AppDatatableColumn label="Opciones" v-slot="{ row }">
                <div class="d-flex justify-content-between gap-1 mt-2">
                  <div class="d-flex">
                    <AppCheckPermission
                      permission="classroom.activitiesTeacher.edit"
                    >
                      <AppButtonEdit
                        @click="toggleDrawerEdit(row.courseId, row.id)"
                      ></AppButtonEdit>
                    </AppCheckPermission>

                    <AppCheckPermission
                      permission="classroom.activitiesTeacher.delete"
                    >
                      <AppButtonDelete
                        @click="openConfirmDelete(row)"
                      ></AppButtonDelete>
                    </AppCheckPermission>
                  </div>
                </div>
              </AppDatatableColumn>
            </AppDatatable>
          </div>

          <!-- View Cards activities -->
          <div v-if="cardsActivities">
            <AppEmptyResponse
              v-if="!cardsActivitiesData.length"
              :show-image="true"
            ></AppEmptyResponse>

            <div v-else class="grid-cards mt-3">
              <AppCard
                v-for="(item, index) in cardsActivitiesData"
                :key="index"
              >
                <template #body>
                  <div
                    class="d-flex align-items-center justify-content-between"
                  >
                    <div>
                      <span
                        v-if="item.activityCategory.id"
                        class="rounded-pill bg-primary bg-opacity-25 text-secondary ps-2 pe-2"
                      >
                        {{ item.activityCategory.name }}
                        {{
                          item.activityCategory.percent
                            ? ' (' + item.activityCategory.percent + '%)'
                            : ''
                        }}
                      </span>
                    </div>

                    <template
                      v-if="
                        !item.notQualityDeliveries && item.qualityDeliveries
                      "
                    >
                      <AppIcon
                        class="icon-size-8 m-1"
                        style="color: #198754"
                        icon="check-circle"
                      ></AppIcon>
                    </template>
                  </div>

                  <div class="pt-3">
                    <h6 class="card-title m-0">{{ item.name }}</h6>
                    <span style="color: #6478b1">{{
                      t('classroom.activitiesTeacher.deliverySummary')
                    }}</span>

                    <hr />

                    <div class="d-flex align-items-center gap-1">
                      <AppIcon style="color: #555" icon="clock"></AppIcon>
                      <div class="d-flex flex-column">
                        <span v-if="item.dateSince">{{
                          dayjs(item.dateSince).format('YYYY-MM-DD h:mm A')
                        }}</span>

                        <span v-if="item.dateUntil">{{
                          dayjs(item.dateUntil).format('YYYY-MM-DD h:mm A')
                        }}</span>
                      </div>
                    </div>

                    <div class="ms-1 mt-3">
                      <span>{{
                        t('classroom.activitiesTeacher.qualityDeliveries')
                      }}</span>
                      <span
                        class="badge rounded-pill text-bg-primary bg-primary ms-1"
                        >{{ item.qualityDeliveries ?? 0 }}</span
                      >
                    </div>

                    <div class="ms-1">
                      <span>{{
                        t('classroom.activitiesTeacher.notQualityDeliveries')
                      }}</span>
                      <span
                        class="badge rounded-pill text-bg-primary bg-primary ms-1"
                        >{{ item.notQualityDeliveries ?? 0 }}</span
                      >
                    </div>

                    <div class="ms-1">
                      <span>{{
                        t('classroom.activitiesTeacher.notDeliveries')
                      }}</span>
                      <span
                        class="badge rounded-pill text-bg-primary bg-primary ms-1"
                        >{{ item.notQualityDeliveries ?? 0 }}</span
                      >
                    </div>
                  </div>
                </template>

                <template #footer>
                  <div class="d-flex justify-content-between">
                    <AppCheckPermission
                      permission="classroom.activitiesTeacher.edit"
                    >
                      <AppButton
                        v-tooltip="'classroom.activitiesTeacher.qualify'"
                        icon="clipboard-check"
                        outlined
                        :to="{
                          name: !isCourseExecution
                            ? 'administration.homeTeacher.activities.qualifyActivity'
                            : 'training.executionOfCoursesActivitiesQualify',
                          params: { courseId: courseId, activityId: item.id },
                        }"
                      ></AppButton>
                    </AppCheckPermission>

                    <AppButtonGroup>
                      <AppCheckPermission
                        permission="classroom.activitiesTeacher.edit"
                      >
                        <AppButtonEdit
                          @click="toggleDrawerEdit(courseId, item.id)"
                        ></AppButtonEdit>
                      </AppCheckPermission>

                      <AppCheckPermission
                        permission="classroom.activitiesTeacher.delete"
                      >
                        <AppButtonDelete
                          @click="openConfirmDelete(item)"
                        ></AppButtonDelete>
                      </AppCheckPermission>
                    </AppButtonGroup>
                  </div>
                </template>
              </AppCard>
            </div>
          </div>
          <!-- Barra fija solo en fullscreen -->
          <GlobalHScroll
            v-if="isFullScreen"
            fixed
            :bottom-offset="12"
            style="width: 94%"
          />
        </div>
      </template>

      <EditActivitiesTeacherDrawer
        :isMounted="isMounted"
        v-model:isVisible="showDrawerEdit"
        @reload-data="reloadData"
        :courseId="courseIdDrawerEdit!"
        :activityId="activityIdDrawerEdit!"
      />
      <RecoveryScoreDrawerForm
        v-if="recoveryScoreModal"
        v-model:isVisible="recoveryScoreModal"
        @reload-data="getActivitySummaryByPeriod"
        :recovery="recoveryScoreData"
        :nameStudentId="nameStudentId"
        :recoveryType="recoveryType"
        :learningOutcomeId="recoveryLearningOutcomeId"
        :userId="recoveryUserId"
        :couseId="courseId"
        :ratingScalesList="ratingScalesList"
        :periodId="periodId"
      ></RecoveryScoreDrawerForm>
      <RecoveryScoreDrawerDeleteForm
        v-if="recoveryScoreDeleteModal"
        v-model:isVisible="recoveryScoreDeleteModal"
        @reload-data="getActivitySummaryByPeriod"
        :recovery="recoveryScoreData"
        :nameStudentId="nameStudentId"
        :recoveryType="recoveryType"
        :learningOutcomeId="recoveryLearningOutcomeId"
        :userId="recoveryUserId"
        :couseId="courseId"
        :ratingScalesList="ratingScalesList"
        :periodId="periodId"
      ></RecoveryScoreDrawerDeleteForm>
      <AppModal v-model="modalDelete">
        <template v-if="modalDelete && currentActivity">
          <AppConfirmModal
            :textButton="'Eliminar'"
            :textContent="'Al eliminar esta actividad, también se borrarán todas las calificaciones relacionadas. ¿Estás seguro de que deseas continuar?'"
            :entity="currentActivity.name ?? 'Actividad'"
            @confirmDelete="confirmDelete"
          ></AppConfirmModal>
        </template>
      </AppModal>
    </template>
  </AppBaseList>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  Ref,
  ref,
  watch,
  computed,
  ComputedRef,
} from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';

import { useRoute } from 'vue-router';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppBaseList from '../../../shared/components/AppBaseList.vue';
import AppButtonBack from '../../../shared/components/Buttons/AppButtonBack.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppCard from '../../../shared/components/Card/AppCard.vue';
import AppCheckPermission from '../../../shared/components/AppCheckPermission.vue';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';


import { BreadCrumbsType } from '../../../shared/types/breadCrumbs.type';
import { CourseDto } from '../dtos/course.dto';
import { TeacherActivityDto } from '../dtos/teacherActivity.dto';
import { GetActivitiesSummaryService } from '../services/getActivitiesSummary.service';
import { SyncActivitiesLmsService } from '../services/syncActivitiesLms.service';
import { GetActivitiesSummaryByPeriodIdService } from '../services/getActivitiesSummaryByPeriodId.service';
//import { GetActivitiesSummaryNewTable } from '../services/getActivitiesSummaryNewTable.service';
import { UpdateActivitiesQualifyService } from '../services/updateActivitiesQualify.service';
import { GetActivitiesDashboardService } from '../services/getActivitiesDashboard.service';
import { GetTeacherActivitiesFilterPeriodsService } from '../services/getTeacherActivitiesFilterPeriods.service';
import { DeleteActivityByIdService } from '../services/deleteActivityById.service';
//import { GetTeacherActivitiesService } from '../services/getTeacherActivities.service';
import { GetActivitiesSummaryNewTableWithPaginationService } from '../services/getActivitiesSummaryNewTableWithPagination.service';
import { GetExtraordinaryGradeperiodsService } from '../services/getExtraordinaryGradePeriods.service';
import { useHeaderStore } from '../../../stores/header.store';
import TabsTeacher from '../components/TabsTeacher.vue';
import AppButton from '../../../shared/components/Buttons/AppButton.vue';
import AppButtonEdit from '../../../shared/components/Buttons/AppButtonEdit.vue';
import AppIcon from '../../../shared/components/AppIcon.vue';
import TableDashboard from '../components/TableDashboard.vue';
import CreateActivitiesTeacherDrawer from '../components/CreateActivitiesTeacherDrawer.vue';
import EditActivitiesTeacherDrawer from '../components/EditActivitiesTeacherDrawer.vue';
import AppButtonDelete from '../../../shared/components/Buttons/AppButtonDelete.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppConfirmModal from '../../../shared/components/Modal/AppConfirmModal.vue';
import AppDatatable from '../../../shared/components/Datatable/AppDatatable.vue';
import AppDatatableColumn from '../../../shared/components/Datatable/AppDatatableColumn.vue';
import { UpdateDatatableService } from '../../../shared/services/updateDatatable.service';
import { SyncActivitiesLmsNewService } from '../services/syncActivitiesLmsNew.service';
import { GetCourseByIdService } from '../services/getCourseById.service';
import AppAutocomplete from '../../../shared/components/Forms/AppAutocomplete.vue';
import { UpdateLearningOutcomesService } from '../services/updateLearningOutcomes.service';
import RecoveryScoreDrawerForm from '../components/RecoveryScoreDrawerForm.vue';
import RecoveryScoreDrawerDeleteForm from '../components/RecoveryScoreDrawerDeleteForm.vue';
import { useSidebarStore } from '../../../stores/sidebar.store';
import GlobalHScroll from '../../../shared/components/GlobalHScroll.vue';

const updateActivitiesQualifyService = new UpdateActivitiesQualifyService();
const updateLearningOutcomesService = new UpdateLearningOutcomesService();
const getActivitiesDashboardService = new GetActivitiesDashboardService();
const getActivitiesSummaryByPeriodIdService =
  new GetActivitiesSummaryByPeriodIdService();
const getActivitiesSummaryService = new GetActivitiesSummaryService();
const getExtraordinaryGradeperiodsService =
  new GetExtraordinaryGradeperiodsService();
const syncActivitiesLmsService = new SyncActivitiesLmsService();
const syncActivitiesLmsNewService = new SyncActivitiesLmsNewService();
const getCourseByIdService = new GetCourseByIdService();

//const getActivitiesSummaryNewTable = new GetActivitiesSummaryNewTable();
const getTeacherActivitiesFilterPeriodsService =
  new GetTeacherActivitiesFilterPeriodsService();
const deleteActivityByIdService = new DeleteActivityByIdService();
//const getTeacherActivitiesWithPaginationService = new GetTeacherActivitiesWithPaginationService();
//const getTeacherActivitiesService = new GetTeacherActivitiesService();
const updateDatatableService = new UpdateDatatableService();
dayjs.extend(customParseFormat);

export default defineComponent({
  name: 'ActivitySummary',
  components: {
    AppAutocomplete,
    AppButtonBack,
    AppBaseList,
    AppLoading,
    AppEmptyResponse,
    AppCheckPermission,
    TabsTeacher,
    AppButton,
    AppButtonEdit,
    AppIcon,
    TableDashboard,
    CreateActivitiesTeacherDrawer,
    EditActivitiesTeacherDrawer,
    AppCard,
    AppButtonDelete,
    AppModal,
    AppConfirmModal,
    AppDatatable,
    AppDatatableColumn,
    RecoveryScoreDrawerForm,
    RecoveryScoreDrawerDeleteForm,
    GlobalHScroll,
  },

  setup() {
    //const router = useRouter();
    const { t } = useI18n();
    const route = useRoute();
    const title = t('classroom.activitiesTeacher.title');

    const isCourseExecution = route.path.search('execution-of-courses') >= 0;

    useMeta({ title: t(title) });
    const routes: BreadCrumbsType[] = [
      {
        name: !isCourseExecution
          ? `classroom.homeTeacher.title`
          : 'Ejecución de cursos',
        url: {
          name: !isCourseExecution
            ? 'administration.homeTeacher'
            : 'training.executionOfCourses',
        },
      },
      {
        name: title,
      },
    ];

    const servicePagination =
      new GetActivitiesSummaryNewTableWithPaginationService();
    const isFullScreen = ref(false);
    const course: Ref<CourseDto | null> = ref(null);
    const consolidate: Ref<any[]> = ref([]);
    const activities: Ref<any[]> = ref([]);
    //const activitiesNew: Ref<any[]> = ref([]);
    const cardsActivitiesData: Ref<any[]> = ref([]);
    const qualification: Ref<any[]> = ref([]);
    const subtitle: Ref<string> = ref('');
    const periods: Ref<any[]> = ref([]);
    const syncLmsNew = ref();
    //const periodos: Ref<any[]> = ref([]);
    const competencies: Ref<any[]> = ref([]);
    const activityCategories2: Ref<any[]> = ref([]);
    const topics: Ref<any[]> = ref([]);
    const selectedScores = ref();
    const extaordinaryData: Ref<any[]> = ref([]);

    const learningOutcomes: Ref<any[]> = ref([]);
    const learningOutcomeActivities: Ref<any[]> = ref([]);
    const periodId = ref();
    const retrievalLock = ref(false);
    const scoreUpload = ref(false);
    const table = ref(false);
    const tableOne = ref(true);
    const cardsActivities = ref(false);
    const averageWithoutBag = ref(false);
    const averageWithBag = ref(false);
    const competences = ref(false);
    const indicators = ref(false);
    const competenciesAndIndicators = ref(false);
    const indicatorsAndBag = ref(false);
    const activityId = ref();
    const courseData = ref(null);
    const courseId = ref(parseInt(route.params.courseId.toString(), 10));
    const subjectAssignmentId = ref();
    const dataDasboard = ref();
    const cardsData = ref([{}]);
    const selectButton = ref(false);
    const loadingCategories = ref(false);
    const isMounted = ref(false);
    const recoveryScoreData = ref();
    const nameStudentId = ref();
    const recoveryType = ref();
    const recoveryUserId = ref();
    const recoveryLearningOutcomeId = ref();

    const recoveryScoreModal = ref(false);
    const recoveryScoreDeleteModal = ref(false);

    const modalDelete = ref(false);
    const currentActivity: Ref<TeacherActivityDto | null> = ref(null);
    const profileIdLocalStorage = ref(
      Number(localStorage.getItem('profileId'))
    );

    const showDrawerCreate = ref(false);
    const toggleDrawerCreate = () => {
      showDrawerCreate.value = !showDrawerCreate.value; // Cambia el estado de visibilidad
    };
    const courseIdDrawerEdit = ref<number | null>(null);
    const activityIdDrawerEdit = ref<number | null>(null);

    const showDrawerEdit = ref(false);
    const ratingScalesList: Ref<any[]> = ref([]);
    const isQualitativeGradingId = ref();

    const toggleDrawerEdit = (courseId: number, activityId: number) => {
      courseIdDrawerEdit.value = courseId;
      activityIdDrawerEdit.value = activityId;
      isMounted.value = !isMounted.value;
      showDrawerEdit.value = !showDrawerEdit.value; // Cambia el estado de visibilidad
    };

    const toggleRecoveryDrawerEdit = async (
      data: any | null = null,
      nameStudent: string,
      isQualitativeGradingId: number,
      learningOutcomeId: any,
      userId: any
    ) => {
      loading.value = true;
      recoveryLearningOutcomeId.value = learningOutcomeId;
      recoveryUserId.value = userId;
      recoveryScoreData.value = data;
      nameStudentId.value = nameStudent;
      recoveryType.value = isQualitativeGradingId;
      loading.value = false;
      recoveryScoreModal.value = true;
    };

    const toggleFullScreen = () => {
      isFullScreen.value = !isFullScreen.value;
    };
    const toggleRecoveryDrawerDelete = async (
      data: any | null = null,
      nameStudent: string,
      isQualitativeGradingId: number,
      learningOutcomeId: any,
      userId: any
    ) => {
      loading.value = true;
      recoveryLearningOutcomeId.value = learningOutcomeId;
      recoveryUserId.value = userId;
      recoveryScoreData.value = data;
      nameStudentId.value = nameStudent;
      recoveryType.value = isQualitativeGradingId;
      loading.value = false;
      recoveryScoreDeleteModal.value = true;
    };

    const loadingTable = ref(false);
    const loading = ref(true);
    const sidebarStorage = useSidebarStore();

    const service = new GetActivitiesDashboardService();
    //const serviceTable = new GetActivitiesSummaryNewTable();

    const params = computed(() => ({
      courseId: courseId.value,
      periodId: periodId.value,
    }));

    onMounted(async () => {
      const sidebar = true;
      (sidebarStorage.sidebarClose = sidebar), (sidebarStorage.active = null);
      console.log('sidebarStorage.sidebarClose', sidebarStorage.sidebarClose);
      try {
        courseId.value = parseInt(route.params.courseId.toString(), 10);
        const courses = await getCourseByIdService.run(courseId.value);
        subjectAssignmentId.value = courses.subjectAssignmentId;
        isQualitativeGradingId.value = courses?.level.isQualitativeGrading;
        ratingScalesList.value = courses?.ratingScales;

        routes.unshift(
          {
            name: `${t('core.start')} (${t(
              'core.generalTerms.academic.teacher.plural'
            )})`,
            url: { name: 'administration.homeTeacher' },
          },
          {
            name: `${t('core.menu.studentActivities')} (${t(
              'core.generalTerms.academic.teacher.plural'
            )})`,
            url: {
              name: 'administration.homeTeacher.activities',
              params: { courseId: courseId.value },
            },
          }
        );

        await getRelatedDataActivitiesSummary();
        await getExtraordinaryPeriods();

        subtitle.value = `${course.value?.name}`;

        const headerStorage = useHeaderStore();
        headerStorage.module = { name: 'Salón de clases', url: '' };
        headerStorage.moduleItem = { name: 'Inicio Profesor', url: '' };
        headerStorage.moduleSubItem = {
          name: title + ' ' + subtitle.value,
          url: '',
        };

        await getActivitySummaryByPeriod();
        await getDataDashboard();
      } catch (e) {
        console.log(e);
      }

      loading.value = false;
    });

    watch(periodId, async () => {
      reloadData();
      await modifyActivities(periodId.value);
      /* await getActivitySummaryByPeriod();
      updateDatatableService.run();*/
    });
    const modifyActivities = async (period: any) => {
      try {
        const periodSelected = Number(period) ?? null;
        const dataPeriodActuality = periods.value.find(
          (item: any) => item.id === periodSelected
        );

        if (!dataPeriodActuality) {
          console.error('❌ Periodo no encontrado');
          return;
        }

        const dateActual = dayjs(); // Fecha actual en formato Day.js

        // Si la fecha actual está dentro del rango, será TRUE, si no, FALSE
        retrievalLock.value =
          dateActual.isAfter(
            dayjs(dataPeriodActuality.startDateRetrievalLock)
          ) &&
          dateActual.isBefore(dayjs(dataPeriodActuality.endDateRetrievalLock));
        scoreUpload.value =
          dateActual.isAfter(dayjs(dataPeriodActuality.startDateScoreUpload)) &&
          dateActual.isBefore(dayjs(dataPeriodActuality.endDateScoreUpload));
      } catch (e) {
        console.error('❌ Error en modifyActivities:', e);
      }
    };

    const getRelatedDataActivitiesSummary = async () => {
      try {
        let params = {
          unassigned: 1,
        };
        courseId.value = parseInt(route.params.courseId.toString(), 10);
        let response = await getActivitiesSummaryService.run(
          courseId.value,
          params
        );
        syncLmsNew.value = response.courseData.syncLmsNew;
        course.value = response.courseData;

        // Manipular los datos
        periods.value = response.periods
          // 1) filtrar sólo los activos
          .filter((period: any) => period.active === 1)
          // 2) transformar nombre según tu lógica
          .map((period: any) => ({
            ...period,
            name:
              syncLmsNew.value === 1 && period.periodLmsName
                ? period.periodLmsName
                : period.name,
          }));
        const periodIdSelect = periodId.value
          ? periodId.value
          : periods.value[0]?.id;

        periodId.value = periodIdSelect;
      } catch (e) {
        console.log('error', e);
      }
    };
    const getExtraordinaryPeriods = async () => {
      try {
        let params = {
          periodId: periodId.value,
        };
        courseId.value = parseInt(route.params.courseId.toString(), 10);
        let response = await getExtraordinaryGradeperiodsService.run(
          courseId.value,
          params
        );
        extaordinaryData.value = response;
      } catch (e) {
        console.log('error', e);
      }
    };
    const isExtraordinaryWindow = computed(() => {
      const now = dayjs();
      return extaordinaryData.value.some(
        ({ extendedStartDateTime, extendedEndDateTime }) => {
          const start = dayjs(extendedStartDateTime, 'YYYY-MM-DD HH:mm:ss');
          const end = dayjs(extendedEndDateTime, 'YYYY-MM-DD HH:mm:ss');
          return now.isAfter(start) && now.isBefore(end);
        }
      );
    });
    const getDataDashboard = async () => {
      loadingTable.value = true;
      try {
        dataDasboard.value = await getActivitiesDashboardService.run(
          courseId.value,
          periodId.value
        );

        cardsData.value = [
          {
            icon: 'activities',
            fillColor: '#91deaa',
            title: 'Total Actividades',
            data: dataDasboard.value.totalActivities,
            border: 'border-right: 1px solid #9ea1a5;',
          },
          {
            icon: 'notEvaluatedActivities',
            fillColor: '#ffe399',
            title: 'Actividades Calificadas',
            data: dataDasboard.value.evaluatedActivities,
            border: 'border-right: 1px solid #9ea1a5;',
          },
          {
            icon: 'evaluatedActivities',
            fillColor: '#efb3f9',
            title: 'Actividades sin Calificar',
            data: dataDasboard.value.notEvaluatedActivities,
            border: 'border-right: 1px solid #9ea1a5;',
          },
          {
            icon: 'activitiesWithOutPeriod',
            fillColor: '#efb3f9',
            title: 'Actividades sin Periodo',
            data: dataDasboard.value.activitiesWithOutPeriod,
            border: 'border-right: 1px solid #9ea1a5;',
          },
        ];
        if (course?.value?.level?.useLearningOutcomes) {
          cardsData.value.push({
            icon: 'learningOutcomes',
            fillColor: '#59cae0',
            title: 'Desempeños Asociados',
            data:
              dataDasboard.value.associatedLearningOutcomes +
              '/' +
              dataDasboard.value.learningOutcomes,
            border: 'border-right: 1px solid #9ea1a5;',
          });
        }
        // Agregar la tarjeta de "Temas Vistos" solo si se cumple la condición
        if (course?.value?.level?.useTopics) {
          cardsData.value.push({
            icon: 'topics',
            fillColor: '#fd8686',
            title: 'Temas Vistos',
            data: `${dataDasboard.value.associatedTopics}/${dataDasboard.value.topics}`,
          });
        }
      } catch (e) {
        console.log('error', e);
      }
      loadingTable.value = false;
    };

    const getActivitySummaryByPeriod = async () => {
      loadingTable.value = true;

      try {
        const response = await getActivitiesSummaryByPeriodIdService.run(
          courseId.value,
          periodId.value
        );
        //const service = await getActivitiesSummaryNewTable.run(courseId.value, periodId.value!);

        const res = await getTeacherActivitiesFilterPeriodsService.run(
          courseId.value,
          periodId.value
        );

        cardsActivitiesData.value = res?.teacherActivities;

        //activitiesNew.value = service?.activitiesSummary?.data;

        activities.value = response?.activitiesSummary?.activities || [];
        consolidate.value = response?.activitiesSummary?.consolidate || [];
        qualification.value = response?.activitiesSummary?.qualification || [];
        learningOutcomeActivities.value =
          response?.activitiesSummary?.learningOutcomeActivities || [];
        averageWithoutBag.value =
          response?.activitiesSummary?.qualification?.averageWithoutBag ||
          false;
        averageWithBag.value =
          response?.activitiesSummary?.qualification?.averageWithBag || false;
        competences.value =
          response?.activitiesSummary?.qualification?.competences || false;
        indicators.value =
          response?.activitiesSummary?.qualification?.indicators || false;
        activityId.value =
          response?.activitiesSummary?.activities?.activityId || null;
        competenciesAndIndicators.value =
          response?.activitiesSummary?.qualification
            ?.competenciesAndIndicators || false;
        indicatorsAndBag.value =
          response?.activitiesSummary?.qualification?.indicatorsAndBag || false;
      } catch (error) {
        console.error(error);
      }
      loadingTable.value = false;
      getDataDashboard();
      getExtraordinaryPeriods();
    };

    const getActivityScore = (
      activityId: any,
      studentId: any,
      activityCategoryId: any
    ) => {
      const activity = activities.value.find(
        (a) => a.activityId === activityId
      );
      if (activity && activityCategoryId === activity.activityCategoryId) {
        const score = activity.deliveries[studentId];
        return score !== undefined
          ? score === null
            ? '-'
            : score === 0
            ? '0'
            : score
          : '-';
      }
      return '-';
    };
    const getActivityScoreQualitativeGrading = (
      activityId: number,
      studentId: number,
      activityCategoryId: number
    ): string => {
      const activity = activities.value.find(
        (a) => a.activityId === activityId
      );

      if (activity && activityCategoryId === activity.activityCategoryId) {
        const scoreData = activity.deliveries[studentId];

        // Verificar que scoreData no sea undefined o null
        if (scoreData === undefined || scoreData === null) {
          return '-';
        }

        // Buscar en ratingScalesList si scoreData está dentro del rango de algún ítem
        const score = ratingScalesList.value.find(
          (item: any) =>
            scoreData >= item.minimumValue && scoreData <= item.maximumValue
        );

        selectedScores.value = score ? score.maximumValue : null;

        return score ? score.description : '-';
      }

      return '-';
    };

    const getActivityScoreEdit = (
      activityId: any,
      studentId: any,
      activityCategoryId: any,
      event: any
    ) => {
      const activity = activities.value.find(
        (a) => a.activityId === activityId
      );
      if (activity && activityCategoryId === activity.activityCategoryId) {
        const value = event?.target.value;
        activity.deliveries[studentId] =
          value !== undefined && value !== '' ? Number(value) : null;
        return value !== undefined && value !== ''
          ? value === '0'
            ? '0'
            : value
          : '-';
      }
      return '-';
    };

    const getActivityScoreCompetencies = (
      activityId: any,
      studentId: any,
      competencyId: any
    ) => {
      const activity = activities.value.find(
        (a) => a.activityId === activityId
      );
      if (activity && competencyId === activity.competencyId) {
        const score = activity.deliveries[studentId];
        return score !== undefined
          ? score === null
            ? '-'
            : score === 0
            ? '0'
            : score
          : '-';
      }
      return '-';
    };

    const getActivityIndicatorScore = (
      activityId: any,
      studentId: any,
      learningOutcomeId: any
    ) => {
      const activity = activities.value.find(
        (a) =>
          a.activityId === activityId &&
          a.learningOutcomeId === learningOutcomeId
      );

      if (activity) {
        const score = activity.deliveries[studentId];
        return score !== undefined
          ? score === null
            ? '-'
            : score === 0
            ? '0'
            : score
          : '-';
      }
      return '-';
    };

    const getLearningOutcomeScore = (
      learningOutcomeId: any,
      studentId: any,
      learningOutcomeName: string
    ) => {
      const nameIndicator =
        learningOutcomeName === 'Promedio'
          ? 'Promedio final'
          : 'Nota recuperación';

      const learningOutcome = learningOutcomeActivities.value.find(
        (a) => a.learningOutcomeId === learningOutcomeId
      );
      const learningOutcomeData = learningOutcome.scores.find(
        (a: any) => a.name === nameIndicator
      );

      if (learningOutcomeData) {
        const score = learningOutcomeData.grades[studentId];
        return score !== undefined
          ? score === null
            ? '-'
            : score === 0
            ? '0'
            : score
          : '-';
      }
      return '-';
    };

    const getLearningOutcomeActivities = (
      learningOutcomeId: any,
      studentId: any,
      learningOutcomeName: string
    ): string => {
      const nameIndicator =
        learningOutcomeName === 'Promedio'
          ? 'Promedio final'
          : 'Nota recuperación';
      const learningOutcome = learningOutcomeActivities.value.find(
        (a) => a.learningOutcomeId === learningOutcomeId
      );
      const learningOutcomeData = learningOutcome.scores.find(
        (a: any) => a.name === nameIndicator
      );
      if (learningOutcomeData) {
        const score = learningOutcomeData?.grades[studentId];
        return score !== undefined
          ? score === null
            ? '-'
            : score === 0
            ? '0'
            : score
          : '-';
      }
      return '-';
    };

    const getLearningOutcomeActivitiesInput = (
      learningOutcomeId: any,
      studentId: any,
      learningOutcomeName: string,
      event: any
    ) => {
      const nameIndicator =
        learningOutcomeName === 'Promedio'
          ? 'Promedio final'
          : 'Nota recuperación';

      const learningOutcome = learningOutcomeActivities.value.find(
        (a) => a.learningOutcomeId === learningOutcomeId
      );
      const learningOutcomeData = learningOutcome.scores.find(
        (a: any) => a.name === nameIndicator
      );

      if (learningOutcomeData) {
        const value = event?.target.value;
        learningOutcomeData.grades[studentId] =
          value !== undefined && value !== '' ? Number(value) : null;

        return value !== undefined && value !== ''
          ? value === '0'
            ? '0'
            : value
          : '-';
      }
      return '-';
    };
    const getLearningOutcomeActivitiesInputAutoComplete = (
      learningOutcomeId: any,
      studentId: any,
      learningOutcomeName: string,
      event: any
    ) => {
      const nameIndicator =
        learningOutcomeName === 'Promedio'
          ? 'Promedio final'
          : 'Nota recuperación';

      const learningOutcome = learningOutcomeActivities.value.find(
        (a) => a.learningOutcomeId === learningOutcomeId
      );
      const learningOutcomeData = learningOutcome.scores.find(
        (a: any) => a.name === nameIndicator
      );

      if (learningOutcomeData) {
        const value = event;
        learningOutcomeData.grades[studentId] =
          value !== undefined && value !== '' ? Number(value) : null;
        return value !== undefined && value !== ''
          ? value === '0'
            ? '0'
            : value
          : '-';
      }
      return '-';
    };
    const getLearningOutcomeActivitiesQualitative = (
      learningOutcomeId: any,
      studentId: any,
      learningOutcomeName: string
    ): string => {
      const nameIndicator =
        learningOutcomeName === 'Promedio'
          ? 'Promedio final'
          : 'Nota recuperación';

      const learningOutcome = learningOutcomeActivities.value.find(
        (a) => a.learningOutcomeId === learningOutcomeId
      );
      const learningOutcomeData = learningOutcome.scores.find(
        (a: any) => a.name === nameIndicator
      );

      if (learningOutcomeData) {
        const scoreData = learningOutcomeData.grades[studentId];
        const score = ratingScalesList.value.find(
          (item: any) =>
            scoreData !== null &&
            scoreData >= item.minimumValue &&
            scoreData <= item.maximumValue
        );
        selectedScores.value = score ? score.maximumValue : null;

        return score ? score.description : '-';
      }

      return '-';
    };
    const getModified = (learningOutcomeId: any, studentId: any) => {
      const learningOutcome = learningOutcomeActivities.value.find(
        (a) => a.learningOutcomeId === learningOutcomeId
      );
      if (!learningOutcome) return {};

      const learningOutcomeData = learningOutcome.scores.find(
        (a) => a.name === 'ModifiedManual'
      );
      if (!learningOutcomeData) return {};

      const scoreData = learningOutcomeData.grades[studentId];

      // Si el score es 1 se retorna un estilo con background amarillo, de lo contrario, retorna un objeto vacío
      return scoreData === 1 ? { backgroundColor: '#ffffaa' } : {};
    };

    const activityCategories: ComputedRef<any[]> = computed(() => {
      const categoriesMap = activities.value.reduce((map, activity) => {
        const categoryId = activity.activityCategoryId;
        if (!map.has(categoryId)) {
          map.set(categoryId, {
            activityCategoryId: categoryId,
            nameActivityCategoryId: activity.nameActivityCategoryId,
            categoryPercentActivityCategory:
              activity.categoryPercentActivityCategory,
            activities: [],
          });
        }
        map.get(categoryId).activities.push(activity);
        return map;
      }, new Map());

      return Array.from(categoriesMap.values());
    });

    const uniqueCompetencies = computed(() => {
      const competenciesMap = activities.value.reduce((map, activity) => {
        const competencyId = activity.competencyId;
        if (!map.has(competencyId)) {
          map.set(competencyId, {
            competencyId: competencyId,
            nameCompetencyId: activity.nameCompetencyId,
            categoryPercentCompetency: activity.categoryPercentCompetency,
            activities: [],
          });
        }
        map.get(competencyId).activities.push(activity);
        return map;
      }, new Map());

      return Array.from(competenciesMap.values());
    });

    const uniqueIndicatorsByCompetency = computed(() => {
      const indicatorsByCompetencyMap = activities.value.reduce(
        (map, activity) => {
          const {
            competencyId,
            learningOutcomeId,
            activityId,
            nameCompetencyId,
            categoryPercentCompetency,
            nameLearningOutcomeId,
            categoryPercentLearningOutcome,
          } = activity;

          if (!map.has(competencyId)) {
            map.set(competencyId, {
              competencyId,
              nameCompetencyId,
              categoryPercentCompetency,
              indicators: [],
            });
          }

          const competency = map.get(competencyId);
          let indicator = competency.indicators.find(
            (ind: any) => ind.learningOutcomeId === learningOutcomeId
          );

          if (!indicator) {
            competency.indicators.push({
              learningOutcomeId,
              nameLearningOutcomeId,
              categoryPercentLearningOutcome,
              activities: [],
              // Se inicializan con los nombres que se mostrarán en la UI
              scores: [
                { learningOutcomeId, name: 'Promedio', score: {} },
                { learningOutcomeId, name: 'Nivelación', score: {} },
              ],
            });
            indicator = competency.indicators.find(
              (ind: any) => ind.learningOutcomeId === learningOutcomeId
            );
          }

          // Agregar la actividad si aún no existe
          if (
            !indicator.activities.some(
              (act: any) => act.activityId === activityId
            )
          ) {
            indicator.activities.push(activity);
          }

          // Buscar los datos de calificaciones en learningOutcomeActivities
          const scoreEntry = learningOutcomeActivities.value.find(
            (score) => score.learningOutcomeId === learningOutcomeId
          );

          if (scoreEntry) {
            // Buscamos los score con los nombres "Promedio final" y "Nota recuperación"
            const promedioScore = scoreEntry.scores.find(
              (s) => s.name.trim() === 'Promedio final'
            );
            const nivelacionScore = scoreEntry.scores.find(
              (s) => s.name.trim() === 'Nota recuperación'
            );

            // Función auxiliar para determinar si todas las calificaciones son null
            const isAllNull = (grades: any) =>
              Object.values(grades).every((val) => val === null);

            // Actualizar score de Promedio: si no hay datos o todos son null, se asigna {}
            if (
              promedioScore &&
              promedioScore.grades &&
              Object.keys(promedioScore.grades).length > 0
            ) {
              indicator.scores[0].score = isAllNull(promedioScore.grades)
                ? {}
                : { ...promedioScore.grades };
            } else {
              indicator.scores[0].score = {};
            }

            // Actualizar score de Nivelación de manera similar
            if (
              nivelacionScore &&
              nivelacionScore.grades &&
              Object.keys(nivelacionScore.grades).length > 0
            ) {
              indicator.scores[1].score = isAllNull(nivelacionScore.grades)
                ? {}
                : { ...nivelacionScore.grades };
            } else {
              indicator.scores[1].score = {};
            }
          }

          return map;
        },
        new Map()
      );

      return Array.from(indicatorsByCompetencyMap.values());
    });

    const dataSelectButton = () => {
      selectButton.value = !selectButton.value;
    };

    const saveQualifications = async () => {
      selectButton.value = !selectButton.value;

      let dataSendLearningOutcomes = {
        courseId: courseId.value,
        scores: learningOutcomeActivities.value.flatMap((outcome) =>
          Object.keys(outcome.scores[0].grades).map((userId) => ({
            learningOutcomeId: outcome.learningOutcomeId,
            userId: Number(userId),
            score:
              outcome.scores.find(
                (score: any) => score.name === 'Promedio final'
              )?.grades[userId] || null,
            recoveryScore:
              outcome.scores.find(
                (score: any) => score.name === 'Nota recuperación'
              )?.grades[userId] || null,
          }))
        ),
        periodId: periodId.value,
      };
      let dataSend = activityCategories.value.flatMap((category) => {
        return category.activities.map((activity: any) => ({
          activityId: activity.activityId,
          deliveries: activity.deliveries,
        }));
      });

      try {
        await updateActivitiesQualifyService.run(courseId.value, dataSend);
        await updateLearningOutcomesService.run(dataSendLearningOutcomes);
        await getActivitySummaryByPeriod();
      } catch (e) {
        console.error('Error', e);
      }
    };
    const syncLMS = async () => {
      tableOne.value = true;
      table.value = false;
      cardsActivities.value = false;

      await getRelatedDataActivitiesSummary();
      await getExtraordinaryPeriods();

      try {
        if (syncLmsNew.value) {
          await syncActivitiesLmsNewService.run(courseId.value);
        } else {
          await syncActivitiesLmsService.run(courseId.value);
        }
        await getActivitySummaryByPeriod();
      } catch (e) {
        console.log(e);
      }
    };

    const list = async () => {
      table.value = true;
      tableOne.value = false;
      cardsActivities.value = false;
    };

    const viewCardActivities = async () => {
      cardsActivities.value = true;
      table.value = false;
      tableOne.value = false;
      await getActivitySummaryByPeriod();
    };

    const openConfirmDelete = async (data: TeacherActivityDto) => {
      currentActivity.value = data;

      modalDelete.value = true;
    };
    const confirmDelete = async () => {
      if (currentActivity.value) {
        await deleteActivityByIdService.run(
          currentActivity.value.id ?? currentActivity.value
        );

        currentActivity.value = null;
      }

      await reloadData();

      modalDelete.value = false;
    };

    const reloadData = async () => {
      try {
        /* if (table.value) {
          updateDatatableService.run();
        } else if (cardsActivities.value) {
          await getActivitySummaryByPeriod();
        } else if (tableOne.value) {
          await syncLMS(); 
        }*/

        if (table.value) {
          updateDatatableService.run();
        }
        await getActivitySummaryByPeriod();
      } catch (error) {
        console.error('Error reloading data:', error);
      }
    };

    return {
      service,
      params,
      subtitle,
      loading,
      routes,
      title,
      t,
      isCourseExecution,
      isMounted,
      isFullScreen,
      toggleFullScreen,
      loadingCategories,
      loadingTable,
      consolidate,
      activities,
      //activitiesNew,
      qualification,
      averageWithoutBag,
      averageWithBag,
      competences,
      indicatorsAndBag,
      competenciesAndIndicators,
      uniqueCompetencies,
      getActivityScoreCompetencies,
      getActivityIndicatorScore,
      indicators,
      uniqueIndicatorsByCompetency,
      activityCategories,
      activityCategories2,
      getActivityScore,
      periodId,
      table,
      tableOne,
      topics,
      periods,
      competencies,
      courseData,
      courseId,
      syncLMS,
      list,
      dataSelectButton,
      selectButton,
      saveQualifications,
      getActivityScoreEdit,
      cardsData,
      learningOutcomes,
      showDrawerCreate,
      toggleDrawerCreate,
      showDrawerEdit,
      toggleDrawerEdit,
      courseIdDrawerEdit,
      activityIdDrawerEdit,
      reloadData,
      dayjs,

      viewCardActivities,
      cardsActivities,
      cardsActivitiesData,

      currentActivity,
      modalDelete,
      openConfirmDelete,
      confirmDelete,
      //serviceTable,
      ratingScalesList,
      isQualitativeGradingId,
      servicePagination,

      getActivityScoreQualitativeGrading,
      getLearningOutcomeActivities,
      getLearningOutcomeScore,
      getLearningOutcomeActivitiesInput,
      getLearningOutcomeActivitiesInputAutoComplete,
      getLearningOutcomeActivitiesQualitative,

      selectedScores,
      toggleRecoveryDrawerEdit,
      toggleRecoveryDrawerDelete,
      recoveryScoreData,
      nameStudentId,
      recoveryType,
      recoveryScoreModal,
      recoveryScoreDeleteModal,
      recoveryUserId,
      recoveryLearningOutcomeId,
      getActivitySummaryByPeriod,
      scoreUpload,
      retrievalLock,
      getModified,
      profileIdLocalStorage,
      isExtraordinaryWindow,
      subjectAssignmentId,
    };
  },
});
</script>

<style scoped>
.container-tables {
  background-color: white;
  padding: 23px 22px;
  box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
}

.buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  align-items: center;
}
.content-buttons-views {
  margin-left: auto;
}
.buttons-views {
  display: flex;
  gap: 3px;
}
.buttons-activities {
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: center;
}

tr.fila-intermedia:nth-child(2n) {
  background-color: #e4e4e4;
}

table thead tr th {
  color: #3c4248;
  font-size: 12px;
  padding: 0.5rem;
}

table tbody tr td {
  font-size: 13px;
  /* padding: 0.5rem; */
  border-bottom: 1px solid #eedd;
}

.note-cell {
  max-width: 160px;
  min-width: 160px;
  text-align: center;
  border: 1px solid #ccc;
}

body {
  overflow-x: hidden;
}

.message {
  text-align: center;
  font-weight: bold;
  margin-top: 200px;
}

.border-end {
  border-right: 1px solid #c7c7c7 !important;
}

.vs--searchable .vs__dropdown-toggle {
  padding: 40px !important;
  margin: 19%;
}

.grid-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
}

tbody tr:nth-child(odd) .sticky-column-tbody {
  position: sticky;
  left: 0;
  z-index: 2;
  background-color: #ffffff; /* Fondo blanco para filas impares */
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

tbody tr:nth-child(even) .sticky-column-tbody {
  position: sticky;
  left: 0;
  z-index: 2;
  background-color: rgb(228, 228, 228); /* Fondo gris claro para filas pares */
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

tbody tr:nth-child(odd) .sticky-column-tbody-finish {
  position: sticky;
  right: 0;
  z-index: 2;
  background-color: #ffffff; /* Fondo blanco para filas impares */
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  border-left: 1px solid rgb(204, 204, 204);
}

tbody tr:nth-child(even) .sticky-column-tbody-finish {
  border-left: 1px solid rgb(204, 204, 204);
  z-index: 2;

  position: sticky;
  right: 0;
  background-color: rgb(228, 228, 228); /* Fondo gris claro para filas pares */
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}
/* Contenedor de la tabla con altura fija para que la barra horizontal quede siempre visible en la parte inferior */
.table-container {
  overflow-y: auto; /* Activa el scroll vertical si el contenido excede la altura */
  overflow-x: auto; /* Activa el scroll horizontal si la tabla es ancha */
  max-height: 850px;
  scrollbar-gutter: stable; /* Reserva espacio para la scrollbar */
}
/* Columnas fijas: ya las tienes definidas, pero es posible que necesites ajustar z-index para la intersección */
.sticky-column-thead {
  background-color: rgb(
    228,
    228,
    228
  ); /* Fondo blanco para evitar superposición visual */
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1); /* Añade una sombra para resaltar */
  position: sticky;
  left: 1px;
  z-index: 11; /* Superior a los encabezados para que en la esquina se vea */
  background-color: #e4e4e4;
}

.sticky-column-thead-finish {
  position: sticky;
  right: 0;
  z-index: 11;
  background-color: rgb(
    228,
    228,
    228
  ); /* Fondo blanco para evitar superposición visual */
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1); /* Añade una sombra para resaltar */
  border-left: 1px solid rgb(204, 204, 204);
}

/* Si deseas que la celda de intersección (p.ej., "Estudiante" en el primer header) tenga aún mayor prioridad, puedes agregar: */
.sticky-column-thead.first-header-row,
.sticky-column-thead-finish.first-header-row {
  z-index: 12;
}
@media (max-width: 450px) {
  .table-container {
    max-height: 400px; /* Ajusta la altura según necesites */
  }
}
@media (max-width: 820px) {
  .sticky-column-thead,
  tbody tr:nth-child(odd) .sticky-column-tbody,
  tbody tr:nth-child(even) .sticky-column-tbody {
    position: static;
    box-shadow: none;
  }
  .sticky-column-thead-finish,
  tbody tr:nth-child(odd) .sticky-column-tbody-finish,
  tbody tr:nth-child(even) .sticky-column-tbody-finish {
    position: static;
    box-shadow: none;
  }

  /* Columnas fijas: ya las tienes definidas, pero es posible que necesites ajustar z-index para la intersección */
  .sticky-column-thead {
    position: static;
    box-shadow: none;
  }

  .sticky-column-thead-finish {
    position: static;
    box-shadow: none;
  }

  /* Si deseas que la celda de intersección (p.ej., "Estudiante" en el primer header) tenga aún mayor prioridad, puedes agregar: */
  .sticky-column-thead.first-header-row,
  .sticky-column-thead-finish.first-header-row {
    position: static;
    box-shadow: none;
  }
}
.table-responsive {
  overflow-x: auto;
}

.responsive-table {
  min-width: 100%;
  /* Si es necesario, puedes ajustar el table-layout:
     table-layout: fixed;
  */
}
.app-autocomplete-fixed {
  min-width: 140px !important;
}
.diagonal-split {
  position: relative;
  overflow: hidden;
  /* Fondo base */
  background-color: rgb(228, 228, 228);
  /* Dibujamos la línea diagonal:
     - 135deg genera una línea que va de la esquina superior izquierda a la inferior derecha.
     - Los stops usan porcentajes para que se adapte al tamaño del th. */
  background-image: linear-gradient(
    158deg,
    transparent calc(50% - 1px),
    #c7c7c7 calc(50% - 1px),
    #c7c7c7 calc(50% + 1px),
    transparent calc(50% + 1px)
  );
  background-repeat: no-repeat;
}

.diagonal-split .top-text {
  position: absolute;
  top: 10%;
  left: 0;
  right: 50%;
  text-align: center;
  font-weight: bold;
  font-size: 12px;
}

.diagonal-split .bottom-text {
  position: absolute;
  bottom: 10%;
  left: 50%;
  right: 0;
  text-align: center;
  font-weight: bold;
  font-size: 12px;
}
/* Contenedor principal de la tabla (con padding, sombra, etc.) */
.container-tables {
  background-color: white;
  padding: 23px 22px;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
}

/* Asegúrate de que la tabla ocupe todo el ancho disponible */
.table-fixed {
  width: 100%;
}
/* Estilo para la fila del primer renglón del encabezado */
.first-row {
  position: sticky;
  top: 0; /* Queda pegado al top */
  z-index: 3; /* Asegura que se muestre por encima de otras celdas */
  background-color: #e4e4e4; /* O el color de fondo que desees */
}

/* Estilo para la fila del segundo renglón del encabezado */
.second-row {
  position: sticky;
  top: 51px; /* Ajusta este valor al alto del primer renglón */
  z-index: 2;
  background-color: white;
}

/* Para que el contenedor que envuelve la tabla tenga scroll vertical */
.table-responsive {
  overflow-y: auto;
}

/* Estilos para las filas del thead que se mantendrán fijas */
.sticky-header {
  background-color: white;
}

.first-header-row {
  position: sticky;
  top: 0;
  z-index: 10; /* Mayor para que quede por encima de las celdas normales */
}

.second-header-row {
  position: sticky;
  top: 51px; /* Ajusta este valor según la altura real de la primera fila */
  z-index: 9;
}

.table-bordered > :not(caption) > * {
  border-width: 0px 0;
}
.sticky-top {
  z-index: 4 !important;
}
.fullscreen-table {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 201;
  background: white;
  padding: 2rem;
  overflow: auto;
  padding-bottom: 48px; /* deja sitio para la barra fija */
}
/* Altura de la barra superior de scroll */
.table-container {
  --top-scrollbar-h: 16px;
}

/* La barra que crea la directiva ya tiene estilos inline básicos,
   pero puedes afinar aquí si quieres */
.sticky-hscroll-top {
  background: #fff; /* o #e4e4e4 si prefieres igual al header */
}

/* Empuja el thead sticky debajo de la barra */
/* .table-container thead.sticky-top {
  top: var(--top-scrollbar-h) !important;
} */

/* Si usas filas sticky con clases propias, puedes sumarle el offset */
.table-container .first-header-row {
  top: var(--top-scrollbar-h);
}
.table-container .second-header-row {
  top: calc(var(--top-scrollbar-h) + 51px);
}
</style>
