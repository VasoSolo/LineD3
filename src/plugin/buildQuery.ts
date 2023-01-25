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
// import { buildQueryContext, QueryFormData } from "@superset-ui/core";

import {
  buildQueryContext,
  ensureIsArray,
  normalizeOrderBy,
  PostProcessingPivot,
  QueryFormData,
  getXAxisColumn,
  isXAxisSet,
} from "@superset-ui/core";

import {
  rollingWindowOperator,
  timeCompareOperator,
  isTimeComparison,
  pivotOperator,
  resampleOperator,
  renameOperator,
  contributionOperator,
  prophetOperator,
  timeComparePivotOperator,
  flattenOperator,
} from "@superset-ui/chart-controls";

/**
 * The buildQuery function is used to create an instance of QueryContext that's
 * sent to the chart data endpoint. In addition to containing information of which
 * datasource to use, it specifies the type (e.g. full payload, samples, query) and
 * format (e.g. CSV or JSON) of the result and whether or not to force refresh the data from
 * the datasource as opposed to using a cached copy of the data, if available.
 *
 * More importantly though, QueryContext contains a property `queries`, which is an array of
 * QueryObjects specifying individual data requests to be made. A QueryObject specifies which
 * columns, metrics and filters, among others, to use during the query. Usually it will be enough
 * to specify just one query based on the baseQueryObject, but for some more advanced use cases
 * it is possible to define post processing operations in the QueryObject, or multiple queries
 * if a viz needs multiple different result sets.
 */

// export default function buildQuery(formData: QueryFormData) {
//   const { cols: groupby } = formData;
//   return buildQueryContext(formData, (baseQueryObject) => [
//     {
//       ...baseQueryObject,
//       groupby,
//       is_timeseries: true,
//     },
//   ]);
// }

export default function buildQuery(formData: QueryFormData) {
  const { groupby } = formData;
  // console.log("formData in buildQuery", formData);
  return buildQueryContext(formData, (baseQueryObject) => {
    /* the `pivotOperatorInRuntime` determines how to pivot the dataframe returned from the raw query.
       1. If it's a time compared query, there will return a pivoted dataframe that append time compared metrics. for instance:

                            MAX(value) MAX(value)__1 year ago MIN(value) MIN(value)__1 year ago
          city               LA                     LA         LA                     LA
          __timestamp
          2015-01-01      568.0                  671.0        5.0                    6.0
          2015-02-01      407.0                  649.0        4.0                    3.0
          2015-03-01      318.0                  465.0        0.0                    3.0

       2. If it's a normal query, there will return a pivoted dataframe.

                     MAX(value)  MIN(value)
          city               LA          LA
          __timestamp
          2015-01-01      568.0         5.0
          2015-02-01      407.0         4.0
          2015-03-01      318.0         0.0

     */
    const pivotOperatorInRuntime: PostProcessingPivot = isTimeComparison(
      formData,
      baseQueryObject
    )
      ? timeComparePivotOperator(formData, baseQueryObject)
      : pivotOperator(formData, baseQueryObject);

    return [
      {
        ...baseQueryObject,
        columns: [
          ...(isXAxisSet(formData)
            ? ensureIsArray(getXAxisColumn(formData))
            : []),
          ...ensureIsArray(groupby),
        ],
        series_columns: groupby,
        ...(isXAxisSet(formData) ? {} : { is_timeseries: true }),
        // todo: move `normalizeOrderBy to extractQueryFields`
        orderby: normalizeOrderBy(baseQueryObject).orderby,
        time_offsets: isTimeComparison(formData, baseQueryObject)
          ? formData.time_compare
          : [],
        /* Note that:
          1. The resample, rolling, cum, timeCompare operators should be after pivot.
          2. the flatOperator makes multiIndex Dataframe into flat Dataframe
        */
        post_processing: [
          pivotOperatorInRuntime,
          rollingWindowOperator(formData, baseQueryObject),
          timeCompareOperator(formData, baseQueryObject),
          resampleOperator(formData, baseQueryObject),
          renameOperator(formData, baseQueryObject),
          contributionOperator(formData, baseQueryObject),
          flattenOperator(formData, baseQueryObject),
          // todo: move prophet before flatten
          prophetOperator(formData, baseQueryObject),
        ],
      },
    ];
  });
}
