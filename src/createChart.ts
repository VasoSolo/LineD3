import * as d3 from "d3";
import { CategoricalColorNamespace } from "@superset-ui/core";
import { legend, clickLegend } from "./legend";
export default function createChartWithForecast(element, myProps) {
  //   console.log("createChartWithForecast");
  console.log("myProps", myProps);
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
    lineEnable,
    dataGrouped,
    metrica,
  } = myProps;
  //костыль, чтобы не появлялись скроллы
  height -= 10;
  width -= 10;

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

  const y = d3
    .scaleLinear()
    .domain([+d3.min(Y) < 0 ? +d3.min(Y) : 0, +d3.max(Y)])
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
    .attr("transform", `translate(${padding.left}, ${height - padding.bottom})`)
    .call(xAxisSetting);
  // .select(".domain")
  // .attr("opacity", 0);
  // .selectAll("text")
  // .attr("transform", "translate(-10,10)rotate(-45)")
  // .style("text-anchor", "end")
  // .style("font-size", 20);

  let yAxis = svg
    .append("g")
    .attr("transform", `translate(${padding.left}, ${-padding.bottom})`)
    .call(yAxisSetting);
  // .select(".domain")
  // .attr("opacity", 0.8);

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

  //   lines.on("pointerenter", createToolTip);
  //   lines.on("pointermove", moveToolTip);
  //   lines.on("pointerleave", hideToolTip);
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
      //   drawLines();
    });
    svg.selectAll(`.${legendClasses.textClass}`).on("click", () => {
      clickLegend(event, lineEnable);
      //   drawLines();
    });
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////toolTip
}
