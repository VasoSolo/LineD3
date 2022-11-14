import React, { useEffect, createRef } from "react";
import { styled, CategoricalColorNamespace } from "@superset-ui/core";
import { LineChartProps, LineChartStylesProps } from "./types";
import * as d3 from "d3";

// The following Styles component is a <div> element, which has been styled using Emotion
// For docs, visit https://emotion.sh/docs/styled

// Theming variables are provided for your use via a ThemeProvider
// imported from @superset-ui/core. For variables available, please visit
// https://github.com/apache-superset/superset-ui/blob/master/packages/superset-ui-core/src/style/index.ts

const Styles = styled.div<LineChartStylesProps>`
  //background-color: ${({ theme }) => theme.colors.secondary.light2};
  //padding: ${({ theme }) => theme.gridUnit * 4}px;
  border-radius: ${({ theme }) => theme.gridUnit * 2}px;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;

  h3 {
    /* You can use your props to control CSS! */
    margin-top: 0;
    margin-bottom: ${({ theme }) => theme.gridUnit * 3}px;
    font-size: ${({ theme, headerFontSize }) =>
      theme.typography.sizes[headerFontSize]}px;
    font-weight: ${({ theme, boldText }) =>
      theme.typography.weights[boldText ? "bold" : "normal"]};
  }

  pre {
    height: ${({ theme, headerFontSize, height }) =>
      height - theme.gridUnit * 12 - theme.typography.sizes[headerFontSize]}px;
  }
`;

export default function LineChart(props: LineChartProps) {
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
    legendVertialPosition,
    legendHorizontPosition,
    legendOrientation,
    legendEnabled,
    legendFontSize,
    legendItemPadding,
    areaMode,
    lineWidth,
    tickVertical,
    tickHorizontal,
  } = props;
  //костыль, чтобы не появлялись скроллы
  height -= 10;
  width -= 10;
  //
  const padding = {
    left: 40,
    top: 10,
    right: 15,
    bottom: 40,
  };

  const widthWithPadding = width - padding.left - padding.right;
  // data.forEach(
  //   (el) => (el.__timestamp = d3.timeFormat("%Y-%m-%d")(el.__timestamp))
  // );
  //  console.log("metrics", metrics[0]["label"]);
  const metrica = metrics[0]["label"];
  const dataGrouped = d3.group(data, (d) => {
    return d[groupby[0]];
  });

  console.log("dataGrouped", dataGrouped);
  console.log("dataGrouped.keys()", dataGrouped.keys());
  console.log("Array.from(dataGrouped)", Array.from(dataGrouped));

  let lineEnable: { [index: string]: boolean } = {};
  Array.from(dataGrouped.keys()).forEach((item) => {
    lineEnable[String(item)] = true;
  });
  console.log("lineEnable", lineEnable);

  const rootElem = createRef<HTMLDivElement>();

  function createChart(element) {
    if (element.select(".MyChart")) {
      element.select(".MyChart").remove();
    }
    /////////////////////////////////////////////////////////////////////////////scales

    const x = d3
      .scaleTime()
      .domain(
        d3.extent(data, function (d) {
          return d.__timestamp;
        })
      )
      .range([0, widthWithPadding]);

    const y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(data, function (d) {
          return d[metrica];
        }),
      ])
      .range([height, padding.bottom + padding.top]);

    const color = CategoricalColorNamespace.getScale(colorScheme);
    const gradientColor = function (color) {
      return;
      //       background: rgb(0,255,85);
      // background: linear-gradient(320deg, rgba(0,255,85,1) 0%, rgba(255,255,255,1) 100%);
    };
    ////////////////////////////////////////////////////////////////////////////////////////canvases
    const xAxisSetting = d3.axisBottom(x);
    if (tickVertical) {
      // xAxisSetting.tickSize(-height).tickSizeOuter(0).tickSizeInner(-100);
      xAxisSetting.tickSizeInner(-height);
    }
    const yAxisSetting = d3.axisLeft(y);
    if (tickHorizontal) {
      yAxisSetting.tickSizeInner(-width);
    }
    let svg = element
      .append("svg")
      .attr("class", "MyChart")
      .attr("width", width)
      .attr("height", height);
    //.append("g");
    //var canvas = svg.append("g").attr("clip-path", "url(#clip)");
    let xAxis = svg
      .append("g")
      .attr(
        "transform",
        `translate(${padding.left}, ${height - padding.bottom})`
      )
      .call(xAxisSetting);

    let yAxis = svg
      .append("g")
      .attr("transform", `translate(${padding.left}, ${-padding.bottom})`)
      .call(yAxisSetting);

    renderTick();

    // Add a clipPath: everything out of this area won't be drawn.
    const clip = svg
      .append("defs")
      .append("svg:clipPath")
      .attr("id", "clip")
      .append("svg:rect")
      .attr("width", widthWithPadding)
      .attr("height", height)
      .attr("x", padding.left)
      .attr("y", 0);

    // Создаём переменную lines: где находятся как линии, так и кисть
    //const lines = svg.append("g").attr("clip-path", "url(#clip)");
    const lines = svg.append("g").attr("clip-path", "url(#clip)");
    ///////////////////////////////////////////////////////////////////////////////////////////LEGEND

    if (legendEnabled) {
      const legendContainer = svg
        .append("g")
        .attr("class", "legendTable")
        .attr("transform", function (d, i) {
          return `translate(${
            (width * legendHorizontPosition) / 100
          },${(height * legendVertialPosition) / 100})`;
        });

      const legendItem = legendContainer
        .selectAll("legend-item")
        .data(dataGrouped.keys())
        .enter()
        .append("g");

      if (legendOrientation === "legendVertical") {
        legendItem.attr("transform", function (d, i) {
          return `translate(0,${i * (legendItemPadding + 16)})`;
        });
      } else {
        legendItem.attr("transform", function (d, i) {
          return `translate(${i * (legendItemPadding + 100)},0)`;
        });
      }
      legendItem
        .append("rect")
        .attr("x", 1)
        .attr("y", 0)
        .attr("height", 16)
        .attr("width", 16)
        .attr("class", "legend-rect-color")
        .attr("style", "cursor: pointer;")
        .attr("fill", (d) => color(d))
        .on("click", clickLegend);
      legendItem
        .append("text")
        .attr("x", 20)
        .attr("y", 8)
        .attr("class", "legend-text")
        .attr("style", "cursor: pointer")
        .text((d) => d)
        // .text("ldchdjvdsjvln lndf f kenflkdn lkdnfdf dfk dlfk ndlkf")
        .attr("font-size", legendFontSize)
        .attr("alignment-baseline", "middle")
        .on("click", clickLegend);

      function clickLegend(ev) {
        lineEnable[ev.path[0]["__data__"]] =
          !lineEnable[ev.path[0]["__data__"]];

        let opacityValue = "0.1";
        let isnotSelect = true;
        if (d3.select(ev.path[1]).attr("class") === "select") {
          opacityValue = "1";
          isnotSelect = false;
        }

        d3.select(ev.path[1])
          .classed("select", isnotSelect)
          .select(".legend-rect-color")
          .attr("opacity", opacityValue);
        drawLines();
      }
    }
    //////////////////////////////////////////////////////////////////////////paint data
    drawLines();
    function drawLines() {
      const enableddataGrouped = Array.from(dataGrouped).filter(
        (item, index) => {
          if (lineEnable[String(item[0])]) {
            return item;
          }
        }
      );
      //console.log("enableddataGrouped", enableddataGrouped);

      svg.selectAll(".area").remove();
      svg.selectAll(".line").remove();
      svg.selectAll(".marker").remove();
      let arrayLinesId: string[] = [];

      //закрашиваем площади
      if (areaMode) {
        enableddataGrouped.forEach((data, key) => {
          const lineId = String(data[0]);
          arrayLinesId.push(lineId);
          const lineData = data[1];
          lineData.sort(function (a, b) {
            return +a.__timestamp - +b.__timestamp;
          });

          const area = lines
            .append("path")
            .datum(lineData)
            .attr("class", "area") // I add the class line to be able to modify this line later on.
            .attr("fill", "none")
            // .attr("fill-opacity", "0.5")
            // .attr("opacity", 0.2)
            .attr("id", `area-${lineId}`)
            .attr("transform", `translate(${padding.left}, ${-padding.bottom})`)
            .attr("stroke-width", 0)
            .attr(
              "d",
              d3
                .area()
                .x(function (d) {
                  return x(d["__timestamp"]);
                })
                .y0(height)
                .y1(function (d) {
                  return y(d[metrica]);
                })
            );

          var lg = lines
            .append("defs")
            .append("linearGradient")
            .attr("id", `mygrad_${lineId}`) //id of the gradient
            .attr("x1", "0%")
            .attr("x2", "0%")
            .attr("y1", "0%")
            .attr("y2", "100%"); //since its a vertical linear gradient
          lg.append("stop")
            .attr("offset", "0%")
            .style("stop-color", color(lineId))
            .style("stop-opacity", 0.9);

          lg.append("stop")
            .attr("offset", "100%")
            .style("stop-color", "white")
            .style("stop-opacity", 0.5);

          // line.attr("fill", color(lineId));
          area.attr("fill", `url(#mygrad_${lineId})`);
        });
      }

      //рисуем линии
      enableddataGrouped.forEach((data, key) => {
        const lineId = String(data[0]);
        arrayLinesId.push(lineId);
        const lineData = data[1];
        lineData.sort(function (a, b) {
          return +a.__timestamp - +b.__timestamp;
        });

        const line = lines
          .append("g")
          .attr("id", `g-${lineId}`)
          .append("path")
          .datum(lineData)
          .attr("class", "line") // I add the class line to be able to modify this line later on.
          //.attr("fill", color(lineId))
          .attr("fill", "none")
          // .attr("fill-opacity", "0.5")
          // .attr("opacity", 0.2)
          .attr("id", `line-${lineId}`)
          .attr("transform", `translate(${padding.left}, ${-padding.bottom})`)
          .attr("stroke", color(lineId))
          .attr("stroke-width", lineWidth)
          .attr(
            "d",
            d3
              .line()
              .x(function (d) {
                return x(d["__timestamp"]);
              })
              .y(function (d) {
                return y(d[metrica]);
              })
          );

        if (markerEnabled) {
          lines
            .selectAll(".marker-group")
            .data(lineData)
            .join("path")
            .attr("class", "marker")
            .attr("d", d3.symbol().size(markerSize).type(d3[markerType]))
            .attr(
              "transform",
              (d) =>
                `translate(${x(d["__timestamp"]) + padding.left}, ${
                  y(d[metrica]) - padding.bottom
                })`
            )
            .attr("fill", color(lineId));
        }
      });
    }

    function lineOrAreaRender() {
      if (areaMode) {
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
                return y(d[metrica]);
              })
          );
      }
      lines
        .selectAll(".line")
        .transition()
        .duration(1000)
        .attr(
          "d",
          d3
            .line()
            .x(function (d) {
              return x(d["__timestamp"]);
            })
            .y(function (d) {
              return y(d[metrica]);
            })
        );
    }
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
    lines.append("g").attr("class", "brush").call(brush);

    // A function that set idleTimeOut to null
    let idleTimeout;
    function idled() {
      idleTimeout = null;
    }
    function brushedChart(event, d) {
      // What are the selected boundaries?
      let extent = event.selection;
      // If no selection, back to initial coordinate. Otherwise, update X axis domain
      if (!extent) {
        if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350)); // This allows to wait a little bit
      } else {
        x.domain([
          x.invert(extent[0] - padding.left),
          x.invert(extent[1] - padding.left),
        ]);
        lines.select(".brush").call(brush.move, null); // This remove the grey brush area as soon as the selection has been done
      }

      // Update axis and line position
      xAxis.transition().duration(1000).call(xAxisSetting);

      renderTick();
      lineOrAreaRender();
      lines
        .selectAll(".marker")
        .transition()
        .duration(1000)
        .attr(
          "transform",
          (d) =>
            `translate(${x(d["__timestamp"]) + padding.left}, ${
              y(d[metrica]) - padding.bottom
            })`
        );
    }

    svg.on("dblclick", function () {
      x.domain(
        d3.extent(data, function (d) {
          return d.__timestamp;
        })
      );
      xAxis.transition().duration(1000).call(xAxisSetting);

      renderTick();

      lineOrAreaRender();

      lines
        .selectAll(".marker")
        .transition()
        .duration(1000)
        .attr(
          "transform",
          (d) =>
            `translate(${x(d["__timestamp"]) + padding.left}, ${
              y(d[metrica]) - padding.bottom
            })`
        );
    });

    function renderTick() {
      d3.selectAll(".tick").attr(
        "style",
        "stroke-opacity: 0.3; stroke-dasharray: 1, 2;stroke-width: 1;"
      );
    }
  }

  // Often, you just want to get a hold of the DOM and go nuts.
  // Here, you can do that with createRef, and the useEffect hook.
  useEffect(() => {
    const root = rootElem.current as HTMLElement;
    const element = d3.select(root);
    createChart(element);
  }, [props]);

  console.log("Plugin props", props);

  return (
    <Styles
      ref={rootElem}
      boldText={props.boldText}
      headerFontSize={props.headerFontSize}
      height={height}
      width={width}
    >
      {/* <h3>Vaso</h3>
      <pre>${JSON.stringify(data, null, 2)}</pre> */}
    </Styles>
  );
}
