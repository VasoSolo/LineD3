/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { t, validateNonEmpty } from '@superset-ui/core';
import { ControlPanelConfig, sections, sharedControls } from '@superset-ui/chart-controls';
const markerEnabled = true
const legendEnabled = true
const markerSize = 30
const config: ControlPanelConfig = {
  /**
   * The control panel is split into two tabs: "Query" and
   * "Chart Options". The controls that define the inputs to
   * the chart data request, such as columns and metrics, usually
   * reside within "Query", while controls that affect the visual
   * appearance or functionality of the chart are under the
   * "Chart Options" section.
   *
   * There are several predefined controls that can be used.
   * Some examples:
   * - groupby: columns to group by (tranlated to GROUP BY statement)
   * - series: same as groupby, but single selection.
   * - metrics: multiple metrics (translated to aggregate expression)
   * - metric: sane as metrics, but single selection
   * - adhoc_filters: filters (translated to WHERE or HAVING
   *   depending on filter type)
   * - row_limit: maximum number of rows (translated to LIMIT statement)
   *
   * If a control panel has both a `series` and `groupby` control, and
   * the user has chosen `col1` as the value for the `series` control,
   * and `col2` and `col3` as values for the `groupby` control,
   * the resulting query will contain three `groupby` columns. This is because
   * we considered `series` control a `groupby` query field and its value
   * will automatically append the `groupby` field when the query is generated.
   *
   * It is also possible to define custom controls by importing the
   * necessary dependencies and overriding the default parameters, which
   * can then be placed in the `controlSetRows` section
   * of the `Query` section instead of a predefined control.
   *
   * import { validateNonEmpty } from '@superset-ui/core';
   * import {
   *   sharedControls,
   *   ControlConfig,
   *   ControlPanelConfig,
   * } from '@superset-ui/chart-controls';
   *
   * const myControl: ControlConfig<'SelectControl'> = {
   *   name: 'secondary_entity',
   *   config: {
   *     ...sharedControls.entity,
   *     type: 'SelectControl',
   *     label: t('Secondary Entity'),
   *     mapStateToProps: state => ({
   *       sharedControls.columnChoices(state.datasource)
   *       .columns.filter(c => c.groupby)
   *     })
   *     validators: [validateNonEmpty],
   *   },
   * }
   *
   * In addition to the basic drop down control, there are several predefined
   * control types (can be set via the `type` property) that can be used. Some
   * commonly used examples:
   * - SelectControl: Dropdown to select single or multiple values,
       usually columns
   * - MetricsControl: Dropdown to select metrics, triggering a modal
       to define Metric details
   * - AdhocFilterControl: Control to choose filters
   * - CheckboxControl: A checkbox for choosing true/false values
   * - SliderControl: A slider with min/max values
   * - TextControl: Control for text data
   *
   * For more control input types, check out the `incubator-superset` repo
   * and open this file: superset-frontend/src/explore/components/controls/index.js
   *
   * To ensure all controls have been filled out correctly, the following
   * validators are provided
   * by the `@superset-ui/core/lib/validator`:
   * - validateNonEmpty: must have at least one value
   * - validateInteger: must be an integer value
   * - validateNumber: must be an intger or decimal value
   */

  // For control input types, see: superset-frontend/src/explore/components/controls/index.js
  
  controlPanelSections: [
    sections.legacyTimeseriesTime,
    {
      label: t('Запрос'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'groupby',
            config: {
              ...sharedControls.groupby,
              label: t('Сгруппировать'),
              description: t('Один или несколько столбцов, по которым данные будут сгруппированы'),
            },
          },
        ],
        [
          {
            name: 'metrics',
            config: {
              ...sharedControls.metrics,
              label: t('Метрики'),
              // it's possible to add validators to controls if
              // certain selections/types need to be enforced
              validators: [validateNonEmpty],
            },
          },
        ],
        [
          {
            name: 'adhoc_filters',
            config: {
              ...sharedControls.adhoc_filters,
              label: t('Фильтры'),
              // it's possible to add validators to controls if
              // certain selections/types need to be enforced
              // validators: [validateNonEmpty],
            },
          },
        ],
        //['adhoc_filters'],
        [
          {
            name: 'row_limit',
            config: {...sharedControls.row_limit,
              label: t('Ограничение для количества строк'),}
          },
        ],
      ],
    },
    {
      label: t('Визуальные настройки графика'),
      expanded: true,
      controlSetRows: [
        // ['getColorFormatters'],
        [
          {
            name: 'color_scheme',
            config: {...sharedControls.color_scheme,
              label: t('Цветовые схемы'),
            },
          },
          {
            name: 'lineWidth',
            config: {
              type: 'SliderControl',
              label: t('Толщина линий'),
              renderTrigger: true,
              min: 1,
              max: 10,
              default: 2,
            },
          },
        ],
        [
          {
            name: 'tickVertical',
            config: {
              type: 'CheckboxControl',
              label: t('Вертикальная сетка'),
              default: true,
              renderTrigger: true,          
            },
          },
          {
            name: 'tickHorizontal',
            config: {
              type: 'CheckboxControl',
              label: t('Горизонтальная сетка'),
              default: true,
              renderTrigger: true,          
            },
          },
        ],
        [
          {
            name: 'areaMode',
            config: {
              type: 'CheckboxControl',
              label: t('Закрасить площадь'),
              renderTrigger: true,          
            },
          },
        ],
        [
          {
            name: 'gradientArea',
            config: {
              type: 'CheckboxControl',
              label: t('Градиент'),
              renderTrigger: true,
              visibility: ({ controls }) =>
                Boolean(controls?.areaMode?.value),          
            },
          },
          {
            name: 'areaOpacity',
            config: {
              type: 'SliderControl',
              label: t('Прозрачность'),
              renderTrigger: true,
              min: 0,
              max: 100,
              default: 50,
              visibility: ({ controls }) =>
                Boolean(controls?.areaMode?.value),
            },
          },
        ],
      ],
    },
    {
      label: t('Отступы'),
      expanded: true,
      controlSetRows: [[
        
        {
          name: 'marginLeft',
          config: {
            type: 'SliderControl',
            default: 10,
            renderTrigger: true,
            label: t('Cлева'),
            description: t('%'),
          },
        },
        {
          name: 'marginRight',
          config: {
            type: 'SliderControl',
            default: 2,
            renderTrigger: true,
            label: t('Cправа'),
            description: t('%'),
          },
        },
        {
          name: 'marginTop',
          config: {
            type: 'SliderControl',
            default: 1,
            renderTrigger: true,
            label: t('Cверху'),
            description: t('%'),
          },
        },
        {
          name: 'marginBottom',
          config: {
            type: 'SliderControl',
            default: 10,
            renderTrigger: true,
            label: t('Cнизу'),
            description: t('%'),
          },
        },
      ],]
    },
    {
      label: t('Маркеры'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'markerEnabled',
            config: {
              type: 'CheckboxControl',
              label: t('Отображать маркеры'),
              renderTrigger: true,
              default: markerEnabled,              
            },
          },
        ],
        [
          {
            name: 'markerType',
            config: {
              type: 'SelectControl',
              label: t('Вид маркера'),
              //default: 'В конце',
              choices: [
                // [value, label]
                ["symbolCircle", 'Круг'],
                ["symbolTriangle", 'Треугольник'],
                ["symbolSquare", 'Квадрат'],
              ],
              default: "symbolCircle",
              renderTrigger: true,
              visibility: ({ controls }) =>
                Boolean(controls?.markerEnabled?.value),
            },
          },
          {
            name: 'markerSize',
            config: {
              type: 'SliderControl',
              label: t('Размер маркера'),
              renderTrigger: true,
              min: 0,
              max: 100,
              default: markerSize,
              visibility: ({ controls }) =>
                Boolean(controls?.markerEnabled?.value),
            },
          },
        ],
      ],
    },{
      label: t('Легенда'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'legendEnabled',
            config: {
              type: 'CheckboxControl',
              label: t('Отображать легенду'),
              renderTrigger: true,
              default: legendEnabled,
              
            },
          },
        ],
        [
          {
            name: 'legendOrientation',
            config: {
              type: 'SelectControl',
              label: t('Вид легенды'),
              //default: 'В конце',
              choices: [
                // [value, label]
                ["legendVertical", 'Вертикальная'],
                ["legendHorizontal", 'Горизонтальная'],
              ],
              renderTrigger: true,
              visibility: ({ controls }) =>
                Boolean(controls?.legendEnabled?.value),
            },
          },
        ],[
          {
            name: 'legendHorizontPosition',
            config: {
              type: 'SliderControl',
              label: t('Позиция по горизонтали'),
              renderTrigger: true,
              min: 1,
              max: 100,
              default: 20,
              description: t('%'),
              visibility: ({ controls }) =>
                Boolean(controls?.legendEnabled?.value),
            },
          },{
            name: 'legendVertialPosition',
            config: {
              type: 'SliderControl',
              label: t('Позиция по вертикали'),
              renderTrigger: true,
              min: 1,
              max: 100,
              default: 20,
              description: t('%'),
              visibility: ({ controls }) =>
                Boolean(controls?.legendEnabled?.value),
            },
          },
        ],
        [
          {
            name: 'legendFontSize',
            config: {
              type: 'TextControl',
              default: 12,
              renderTrigger: true,
              // ^ this makes it apply instantaneously, without triggering a "run query" button
              label: t('Шрифт'),
              visibility: ({ controls }) =>
                Boolean(controls?.legendEnabled?.value),
            },
          },{
            name: 'legendItemPadding',
            config: {
              type: 'SliderControl',
              label: t('Отступы между элементами'),
              renderTrigger: true,
              min: 1,
              max: 150,
              default: 1,
              visibility: ({ controls }) =>
                Boolean(controls?.legendEnabled?.value),
            },
          }
        ],
      ],
    },
  ],
};

export default config;
