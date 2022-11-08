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
    ////////////////////////////////////////////////////////////////////////////////////////canvases
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
      .call(d3.axisBottom(x).tickSize(-height));

    let yAxis = svg
      .append("g")
      .attr("transform", `translate(${padding.left}, ${-padding.bottom})`)
      .call(
        d3.axisLeft(y).tickSize(-width)
        // .tickPadding(-15 - width)
      );

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
    // const legendContainer = d3.select(".legend");
    const legendContainer = svg
      .append("div.legend")
      .attr("class", "legendTable")
      .attr("transform", function (d, i) {
        return `translate(200,200)`;
      })
      .attr("width", 200)
      .attr("height", 50)
      .attr("stroke", "black")
      .attr("fill", "none")
      .attr("z-index", "100");

    const legends = legendContainer
      .selectAll("legend-cell")
      .data(dataGrouped.keys())
      .enter()
      .append("g")
      .attr("class", "legend-cell")
      .append("rect")
      .attr("x", 1)
      .attr("y", 1)
      .attr("height", 10)
      .attr("width", 10)
      .attr("fill", (d) => color(d))
      .attr("transform", function (d, i) {
        return `translate(0,${i * 15})`;
      })
      .on("click", clickLegendHandler);

    function clickLegendHandler(ev) {
      lineEnable[ev.path[0]["__data__"]] = !lineEnable[ev.path[0]["__data__"]];
      drawLines();
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
      svg.selectAll(".line").remove();
      svg.selectAll(".marker").remove();
      enableddataGrouped.forEach((data, key) => {
        const lineId = String(data[0]);
        const lineData = data[1];
        lineData.sort(function (a, b) {
          return +a.__timestamp - +b.__timestamp;
        });

        const line = lines
          .append("path")
          .datum(lineData)
          .attr("class", "line") // I add the class line to be able to modify this line later on.
          .attr("fill", "none")
          .attr("id", `line-${lineId}`)
          .attr("transform", `translate(${padding.left}, ${-padding.bottom})`)
          .attr("stroke", color(lineId))
          .attr("stroke-width", "2px")
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
            .attr(
              "d",
              d3
                .symbol()
                .size(+markerSize)
                .type(d3[markerType])
            )
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
        x.domain([x.invert(extent[0]), x.invert(extent[1])]);
        lines.select(".brush").call(brush.move, null); // This remove the grey brush area as soon as the selection has been done
      }

      // Update axis and line position
      xAxis.transition().call(d3.axisBottom(x).tickSize(-height));

      renderTick();
      lines
        .selectAll(".line")
        .transition()
        .attr(
          "d",
          d3
            .line()
            .x((d) => x(d["__timestamp"]))
            .y(function (d) {
              return y(d[metrica]);
            })
        );
      lines
        .selectAll(".marker")
        .transition()
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
      xAxis
        .transition()
        .duration(1000)
        .call(d3.axisBottom(x).tickSize(-height));

      renderTick();
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
