import * as d3 from "d3";
import { CategoricalColorNamespace } from "@superset-ui/core";
import { legend, clickLegend } from "./legend";
import { createToolTip, moveToolTip, hideToolTip } from "./toolTip";
import { getMaximumInInterval, getArrayOfValueEnableLines } from "./function";
import { namespace } from "d3";

export function createChartWithForecast(element, myProps) {
  console.log("createChartWithForecast. MyProps", myProps);
  // console.log("myProps", myProps);
  let {
    data,
    height,
    width,
    groupby,
    metrics,
    colorScheme,
    markerType,
    markerEnabled,
    markerSize,
    legendVerticalPosition,
    legendHorizontPosition,
    legendOrientation,
    legendEnabled,
    legendFontSize,
    legendItemPadding,
    areaMode,
    lineWidth,
    tickVertical,
    tickHorizontal,
    gradientArea,
    areaOpacity,
    marginBottom,
    marginTop,
    marginLeft,
    marginRight,
    forecastEnabled,
    forecastInterval,
    forecastPeriods,
    forecastSeasonalityDaily,
    forecastSeasonalityWeekly,
    forecastSeasonalityYearly,
    widthWithPadding,
    heightWithPadding,
    padding,
    Y,
    X,
    enableddataGrouped,
    // lineEnable,
    // dataGrouped,
    metrica,
    // arrayForToolTip,
    formatDayMonthYear,
    dataTime,
    // namesGroup,
  } = myProps;
  //костыль, чтобы не появлялись скроллы
  height -= 10;
  width -= 10;

  const namesGroupWithYhat = Object.keys(data[0]).slice(1);
  const namesGroup = namesGroupWithYhat.filter(
    (name) =>
      name.indexOf("__yhat_lower") < 0 &&
      name.indexOf("__yhat_upper") < 0 &&
      name.indexOf("__yhat") < 0
  );

  const dataGrouped = namesGroup.map((nameGroup) => {
    const itemDataGroupedArray = data.reduce((acc, item) => {
      acc.push({
        value: item[`${nameGroup}`],
        __yhat: item[`${nameGroup}__yhat`],
        __yhat_lower: item[`${nameGroup}__yhat_lower`],
        __yhat_upper: item[`${nameGroup}__yhat_upper`],
        __timestamp: item["__timestamp"],
      });
      return acc;
    }, []);

    // const dataGroupWithAllYhat = d3.groups(data, (d) => {
    //   // console.log("d in dataGroupedArray = namesGroup.map", d);
    //   return nameGroup;
    // });
    // console.log("dataGroupWithAllYhat[0][1]", dataGroupWithAllYhat[0][1]);

    // const dataGroupByCategory = dataGroupWithAllYhat.reduce((acc, item) => {
    //   acc.push({
    //     value: item[1][`${nameGroup}`],
    //     __timestamp: item[1]["__timestamp"],
    //     __yhat: item[1][`${nameGroup}__yhat`],
    //     __yhat_lower: item[1][`${nameGroup}__yhat_lower`],
    //     __yhat_upper: item[1][`${nameGroup}__yhat_upper`],
    //   });
    //   return acc;
    // }, [[]);]
    return { nameGroup: nameGroup, array: itemDataGroupedArray };
  });

  // const dataGroupedArray = Object.values(dataGroupedObject);
  console.log("dataGrouped", dataGrouped);

  let lineEnable: { [index: string]: boolean } = {};
  dataGrouped.forEach((item) => {
    lineEnable[String(item.nameGroup)] = true;
  });
  console.log("lineEnable", lineEnable);

  // Object.keys(dataGroupedArray).forEach((element) => {
  //   console.log("element in dataGroupedArray", element);
  // });

  // console.log(
  //   "Object.values(dataGroupedObject)",
  //   Object.values(dataGroupedObject)
  // );
  // console.log("Object.keys(dataGroupedObject)", Object.keys(dataGroupedObject));

  // console.log("lineEnable", lineEnable);

  if (element.select(".MyChart")) {
    element.select(".MyChart").remove();
  }

  let svg = element
    .append("svg")
    .attr("class", "MyChart")
    .attr("width", width)
    .attr("height", height);

  /////////////////////////////////////////////////////////////////////////////scales
  const x = d3
    .scaleTime()
    .domain(
      d3.extent(data, function (d) {
        return d.__timestamp;
      })
    )
    .range([0, widthWithPadding - 10]);

  // console.log("d3.extent(Y)", d3.extent(Y));
  const y = d3
    .scaleLinear()
    .domain([d3.min(Y) < 0 ? d3.min(Y) - 1 : 0, d3.max(Y)])
    // .domain([d3.min(Y) < 0 ? d3.min(Y) : 0, +d3.max(Y)])
    .range([height, padding.bottom + padding.top]);

  const color = CategoricalColorNamespace.getScale(colorScheme);

  let currentSelection: any[] = [x.invert(0), x.invert(widthWithPadding - 10)];

  ////////////////////////////////////////////////////////////////////////////////////////рисуем оси, определяем границы холста

  let xAxisSetting = d3.axisBottom(x).tickPadding(10);
  if (tickVertical) {
    xAxisSetting.tickSizeInner(-heightWithPadding);
  }
  let yAxisSetting = d3.axisLeft(y).tickPadding(10);
  if (tickHorizontal) {
    yAxisSetting.tickSizeInner(-widthWithPadding);
  }

  let xAxis = svg
    .append("g")
    .attr("class", "xAxis")
    .attr("transform", `translate(${padding.left}, ${height - padding.bottom})`)
    .call(xAxisSetting);

  xAxis.select(".domain").attr("opacity", 0);
  // .selectAll("text")
  // .attr("transform", "translate(-10,10)rotate(-45)")
  // .style("text-anchor", "end")
  // .style("font-size", 20);

  let yAxis = svg
    .append("g")
    .attr("transform", `translate(${padding.left}, ${-padding.bottom})`)
    .call(yAxisSetting);

  renderTick();

  function renderTick() {
    d3.selectAll(".tick").attr(
      "style",
      "stroke-opacity: 0.3; stroke-dasharray: 1, 2;stroke-width: 1;"
    );
  }

  // добавляем clipPath: всё что вне его - не рисуется

  svg
    .append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("width", widthWithPadding)
    .attr("height", height)
    // .attr("height", "100%")
    .attr("x", padding.left)
    .attr("y", 0);

  // Создаём переменную lines: где находятся как линии, так и кисть
  const lines = svg.append("g").attr("clip-path", "url(#clip)");
  if (lines) {
    console.log("lines ok!", lines);
  } else {
    console.log("lines not ok", lines);
  }

  //   lines.on("pointerenter", createToolTip);
  //   lines.on("pointermove", moveToolTip);
  //   lines.on("pointerleave", hideToolTip);
  lines.on("pointerenter", () => createToolTip(lines));
  lines.on("pointermove", () =>
    moveToolTip(
      event,
      // arrayForToolTip,
      padding,
      formatDayMonthYear,
      X,
      x,
      width,
      height,
      dataTime,
      lineEnable,
      namesGroup,
      true // yHatMode
    )
  );
  lines.on("pointerleave", hideToolTip);
  //////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////LEGEND

  if (legendEnabled) {
    const legendProps = {
      svg,
      dataGrouped,
      legendOrientation,
      legendItemPadding,
      color,
      legendFontSize,
      metrica,
      width,
      height,
      legendHorizontPosition,
      legendVerticalPosition,
    };

    const legendClasses = legend(legendProps);

    svg.selectAll(`.${legendClasses.rectClass}`).on("click", () => {
      clickLegend(event, lineEnable);
      drawLines();
    });
    svg.selectAll(`.${legendClasses.textClass}`).on("click", () => {
      clickLegend(event, lineEnable);
      drawLines();
    });
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////toolTip
  //создаём линию тултипа
  lines
    .append("line")
    .attr("x1", 100)
    .attr("y1", 0)
    .attr("x2", 100)
    .attr("y2", heightWithPadding)
    .attr("stroke-dasharray", "2")
    .attr("stroke-width", 1)
    .attr("stroke", "black")
    .attr("opacity", "0")
    .attr("class", "toolTipLine")
    .attr("id", "toolTipLine")
    .attr("transform", `translate(0,${padding.top})`);
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////paint data

  drawLines();
  function drawLines() {
    // enableddataGrouped = renderEnableArray();
    console.log("drawLines");
    let arrayOfEnableValues = [];
    enableddataGrouped = dataGrouped.filter(
      (item) => lineEnable[String(item.nameGroup)]
    );

    // enableddataGrouped = dataGroupedArray.filter((item) => item.enable);

    arrayOfEnableValues = getArrayOfValueEnableLines(
      data,
      namesGroup,
      lineEnable
    );
    console.log("enableddataGrouped in drawLines", enableddataGrouped);
    // console.log("currentSelection", currentSelection);
    // console.log("arrayOfEnableValues in drawLines", arrayOfEnableValues);

    const minMaxY = getMaximumInInterval(
      arrayOfEnableValues,
      currentSelection[0],
      currentSelection[1]
    );
    // y.domain([minMaxY[0] < 0 ? minMaxY[0] : 0, minMaxY[1]]);
    // y.domain([minMaxY[0], minMaxY[1]]);

    yAxis.transition().duration(1000).call(yAxisSetting);
    renderTick();

    // const valueEnableLines = d3.group(enableddataGrouped, d => d)

    // console.log("minMaxY", minMaxY);

    svg.selectAll(".area").remove();
    svg.selectAll(".line").remove();
    svg.selectAll(".marker").remove();
    svg.selectAll(".corridor").remove();
    // let arrayLinesId: string[] = [];

    enableddataGrouped.forEach((item) => {
      lines
        .append("path")
        .datum(item.array)
        .attr("fill", color(item.nameGroup))
        .attr("stroke", "none")
        .attr("class", "corridor")
        .attr("opacity", 0.3)
        .attr(
          "d",
          d3
            .area()
            .x(function (d) {
              return x(d["__timestamp"]);
            })
            .y0(function (d) {
              return y(d[`__yhat_lower`]);
            })
            .y1(function (d) {
              return y(d[`__yhat_upper`]);
            })
        );

      // lines
      //   .append("g")
      //   .attr("id", `g-${lineId}`)
      //   .append("path")
      //   .datum(item.array)
      //   .attr("class", "line")
      //   .attr("fill", "none")
      //   .attr("id", `line-${lineId}`)
      //   .attr("transform", `translate(${padding.left}, ${-padding.bottom})`)
      //   .attr("stroke", color(lineId))
      //   .attr("stroke-width", lineWidth)
      //   .attr(
      //     "d",
      //     d3
      //       .line()
      //       .x(function (d) {
      //         return x(d["__timestamp"]);
      //       })
      //       .y(function (d) {
      //         // console.log("d in lines", lineId, d);
      //         return y(d["value"]);
      //       })
      //   );
    });

    // namesGroup.forEach((nameGroup) => {
    //   lines
    //     .append("path")
    //     .datum(data)
    //     .attr("fill", color(nameGroup))
    //     .attr("stroke", "none")
    //     .attr("opacity", 0.3)
    //     .attr(
    //       "d",
    //       d3
    //         .area()
    //         .x(function (d) {
    //           return x(d["__timestamp"]);
    //         })
    //         .y0(function (d) {
    //           return y(d[`${nameGroup}__yhat_lower`]);
    //         })
    //         .y1(function (d) {
    //           return y(d[`${nameGroup}__yhat_upper`]);
    //         })
    //     );
    // });

    //закрашиваем площади
    // if (areaMode) {
    //   console.log("areaMode");
    //   enableddataGrouped.forEach((data, key) => {
    //     console.log("data in areaMode", data);
    //     const lineId = String(data[0]);
    //     console.log("lineId in areaMode", lineId);
    //     // arrayLinesId.push(lineId);
    //     const lineData = data[1];
    //     const area = lines
    //       .append("path")
    //       .datum(lineData)
    //       .attr("class", "area")
    //       .attr("fill", "none")
    //       .attr("id", `area-${lineId}`)
    //       .attr("transform", `translate(${padding.left}, ${-padding.bottom})`)
    //       .attr("stroke-width", 0)
    //       .attr(
    //         "d",
    //         d3
    //           .area()
    //           .x(function (d) {
    //             return x(d["__timestamp"]);
    //           })
    //           .y0(height)
    //           .y1(function (d) {
    //             return y(d["value"]);
    //           })
    //       );

    //fill area
    // const gradId = lineId.replace(/\s|\(|\)|,/gm, "");

    // console.log("gradId", gradId);
    // var lg = lines
    //   .append("defs")
    //   .append("linearGradient")
    //   .attr("id", `mygrad_${gradId}`) //id of the gradient
    //   .attr("x1", "0%")
    //   .attr("x2", "0%")
    //   .attr("y1", "0%")
    //   .attr("y2", "100%"); //since its a vertical linear gradient
    // lg.append("stop")
    //   .attr("offset", "0%")
    //   .style("stop-color", color(lineId))
    //   // .style("stop-color", "green")
    //   .style("stop-opacity", 1);

    // lg.append("stop").attr("offset", "100%").style("stop-color", "white");
    // // .style("stop-opacity", areaOpacity / 100);

    // if (gradientArea) {
    //   area.attr("fill", `url(#mygrad_${gradId})`);
    // } else {
    //   area
    //     .attr("fill", color(lineId))
    //     .attr("fill-opacity", areaOpacity / 100);
    // }
    // });
    // }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //рисуем линии
    // enableddataGrouped.forEach((data, key) => {
    //   // console.log("data in drawLines", data);
    //   const lineId = String(data[0]);
    //   const lineData = data[1];
    //   const line = lines
    //     .append("g")
    //     .attr("id", `g-${lineId}`)
    //     .append("path")
    //     .datum(lineData)
    //     .attr("class", "line")
    //     .attr("fill", "none")
    //     .attr("id", `line-${lineId}`)
    //     .attr("transform", `translate(${padding.left}, ${-padding.bottom})`)
    //     .attr("stroke", color(lineId))
    //     .attr("stroke-width", lineWidth)
    //     .attr(
    //       "d",
    //       d3
    //         .line()
    //         .x(function (d) {
    //           return x(d["__timestamp"]);
    //         })
    //         .y(function (d) {
    //           // console.log("d in lines", lineId, d);
    //           return y(d["value"]);
    //         })
    //     );

    //   if (markerEnabled) {
    //     lines
    //       .selectAll(".marker-group")
    //       .data(lineData)
    //       .join("path")
    //       .attr("class", "marker")
    //       .attr("d", d3.symbol().size(markerSize).type(d3[markerType]))
    //       .attr(
    //         "transform",
    //         (d) =>
    //           `translate(${x(d["__timestamp"]) + padding.left}, ${
    //             y(d["value"]) - padding.bottom
    //           })`
    //       )
    //       .attr("fill", color(lineId));
    //   }
    // });

    function lineRender() {
      console.log("lineOrAreaRender");
      lines
        .selectAll(".area")
        .transition()
        .duration(1000)
        .attr(
          "d",
          d3
            .area()
            .x(function (d) {
              return x(d["__timestamp"]);
            })
            .y0(height)
            .y1(function (d) {
              return y(d["value"]);
            })
        );

      // const area = lines
      //   .append("path")
      //   .datum(lineData)
      //   .attr("class", "area")
      //   .attr("fill", "none")
      //   .attr("id", `area-${lineId}`)
      //   .attr("transform", `translate(${padding.left}, ${-padding.bottom})`)
      //   .attr("stroke-width", 0)
      //   .attr(
      //     "d",
      //     d3
      //       .area()
      //       .x(function (d) {
      //         return x(d["__timestamp"]);
      //       })
      //       .y0(height)
      //       .y1(function (d) {
      //         return y(d["value"]);
      //       })
      //   );
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////ZOOM

    // Add brushing
    const brush = d3
      .brushX() // Add the brush feature using the d3.brush function
      .extent([
        [0, 0],
        [widthWithPadding, height - padding.bottom],
      ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
      .on("end", brushedChart); // Each time the brush selection changes, trigger the 'updateChart' function

    // Add the brushing
    lines
      .append("g")
      .attr("class", "brush")
      .attr("id", "brush")
      .attr("transform", `translate(${padding.left},0)`)
      .call(brush);

    // A function that set idleTimeOut to null
    let idleTimeout;
    function idled() {
      idleTimeout = null;
    }

    function brushedChart(event, d) {
      console.log("brushedChart");
      // What are the selected boundaries?

      // let extent = event.selection;
      if (event.selection) {
        currentSelection = [
          x.invert(event.selection[0]),
          x.invert(event.selection[1]),
        ];

        //currentSelection[0] =  x.invert(event.selection[0])
      }

      if (!event.selection) {
        if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350)); // This allows to wait a little bit
      } else {
        //получаем множество всех отображаемых значений
        const arrayOfValueEnableLines = getArrayOfValueEnableLines(
          data,
          namesGroup,
          lineEnable
        );
        //находим максимальное значение на отображаемом интервале
        const minMaxY = getMaximumInInterval(
          arrayOfValueEnableLines,
          currentSelection[0],
          currentSelection[1]
        );
        x.domain([currentSelection[0], currentSelection[1]]);
        y.domain([0, minMaxY[1]]);
        lines.select(".brush").call(brush.move, null); // This remove the grey brush area as soon as the selection has been done
      }
      // Update axis and line position
      xAxis.transition().duration(1000).call(xAxisSetting);
      yAxis.transition().duration(1000).call(yAxisSetting);
      renderTick();
      lineRender();
      lines
        .selectAll(".marker")
        .transition()
        .duration(1000)
        .attr(
          "transform",
          (d) =>
            `translate(${x(d["__timestamp"]) + padding.left}, ${
              y(d["value"]) - padding.bottom
            })`
        );
    }

    svg.on("dblclick", function () {
      //получаем множество всех отображаемых значений
      const arrayOfValueEnableLines = getArrayOfValueEnableLines(
        data,
        namesGroup,
        lineEnable
      );
      //находим максимальное значение на отображаемом интервале
      currentSelection = [0, widthWithPadding - 10];
      const minMaxY = getMaximumInInterval(arrayOfValueEnableLines);
      x.domain(
        d3.extent(data, function (d) {
          return d.__timestamp;
        })
      );
      y.domain([0, minMaxY[1]]);
      xAxis.transition().duration(1000).call(xAxisSetting);
      yAxis.transition().duration(1000).call(yAxisSetting);

      renderTick();

      lineRender();

      lines
        .selectAll(".marker")
        .transition()
        .duration(1000)
        .attr(
          "transform",
          (d) =>
            `translate(${x(d["__timestamp"]) + padding.left}, ${
              y(d["value"]) - padding.bottom
            })`
        );
    });
  }
}
