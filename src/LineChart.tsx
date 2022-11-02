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
  let { data, height, width, groupby, metrics, colorScheme } = props;
  height -= 10;
  width -= 10;
  const padding = {
    left: 40,
    top: 0,
    right: 50,
    bottom: 40,
  };
  const widthWithPadding = width - padding.left - padding.right;
  // data.forEach(
  //   (el) => (el.__timestamp = d3.timeFormat("%Y-%m-%d")(el.__timestamp))
  // );
  console.log("metrics", metrics[0]["label"]);
  const metrica = metrics[0]["label"];
  const dataGrouped = d3.group(data, (d) => d[groupby[0]]);

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
      .attr("height", height)
      .append("g");
    var canvas = svg.append("g").attr("clip-path", "url(#clip)");
    let xAxis = svg
      .append("g")
      .attr(
        "transform",
        `translate(${padding.left}, ${height - padding.bottom})`
      )
      .call(d3.axisBottom(x));
    let yAxis = svg
      .append("g")
      .attr("transform", `translate(${padding.left}, ${-padding.bottom})`)
      .call(d3.axisLeft(y).ticks(10));

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

    // Создаём переменную line: где находятся как линия, так и кисть
    const lines = canvas.append("g").attr("clip-path", "url(#clip)");
    //////////////////////////////////////////////////////////////////////////paint data
    dataGrouped.forEach((data, key) => {
      data.sort(function (a, b) {
        return +a.__timestamp - +b.__timestamp;
      });
      lines
        .append("path")
        .datum(data)
        .attr("class", "line") // I add the class line to be able to modify this line later on.
        .attr("fill", "none")
        .attr("transform", `translate(${padding.left}, ${-padding.bottom})`)
        .attr("stroke", color(key))
        .attr("stroke-width", "4px")
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
    });
    //////////////////////////////////////////////////////////////////////////////////////////////////ZOOM
    // Add brushing
    const brush = d3
      .brushX() // Add the brush feature using the d3.brush function
      .extent([
        [0, 0],
        [widthWithPadding, height - padding.bottom],
      ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
      .on("end", brushedChart); // Each time the brush selection changes, trigger the 'updateChart' function

    //zoom and pan block
    // Set the zoom and Pan features: how much you can zoom, on which part, and what to do when there is a zoom
    let zoom = d3
      .zoom()
      .scaleExtent([0.5, 20]) // This control how much you can unzoom (x0.5) and zoom (x20)
      .translateExtent([
        [0, 0],
        [widthWithPadding, height - padding.bottom],
      ])
      .on("zoom", zoomedChart);

    // This add an invisible rect on top of the chart area. This rect can recover pointer events: necessary to understand when the user zoom
    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .attr("transform", `translate(${padding.left},${padding.top})`)
      .call(zoom);

    // now the user can zoom and it will trigger the function called updateChart

    // Add the brushing
    //lines.append("g").attr("class", "brush").call(brush);

    // A function that set idleTimeOut to null
    let idleTimeout;
    function idled() {
      idleTimeout = null;
    }
    function brushedChart(event, d) {
      // What are the selected boundaries?
      let extent = event.selection;
      console.log("brushedChart");
      // If no selection, back to initial coordinate. Otherwise, update X axis domain
      if (!extent) {
        if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350)); // This allows to wait a little bit
      } else {
        x.domain([x.invert(extent[0]), x.invert(extent[1])]);
        lines.select(".brush").call(brush.move, null); // This remove the grey brush area as soon as the selection has been done
      }

      // Update axis and line position
      xAxis.transition().call(d3.axisBottom(x));
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
    }
    function zoomedChart(event, d) {
      let extent = event.selection;
      console.log("zoomedChart");
      // If no selection, back to initial coordinate. Otherwise, update X axis domain
      if (!extent) {
        //if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350)); // This allows to wait a little bit
      } else {
        x.domain([x.invert(extent[0]), x.invert(extent[1])]);
        lines.select(".brush").call(brush.move, null); // This remove the grey brush area as soon as the selection has been done
      }

      // recover the new scale
      var newX = event.transform.rescaleX(x);
      //var newY = event.transform.rescaleY(y);

      // // update axes with these new boundaries
      // xAxis.call(d3.axisBottom(newX));
      // yAxis.call(d3.axisLeft(newY));

      // Update axis and line position
      xAxis.transition().call(d3.axisBottom(newX));
      //yAxis.transition().call(d3.axisLeft(newY));
      lines
        .selectAll(".line")
        .transition()
        .attr(
          "d",
          d3
            .line()
            .x((d) => newX(d["__timestamp"]))
            .y(function (d) {
              return y(d[metrica]);
            })
        );
    }
    // svg.on("dblclick", function () {
    //   x.domain(
    //     d3.extent(data, function (d) {
    //       return d.__timestamp;
    //     })
    //   );
    //   xAxis.transition().duration(1000).call(d3.axisBottom(x));
    //   lines
    //     .selectAll(".line")
    //     .transition()
    //     .duration(1000)
    //     .attr(
    //       "d",
    //       d3
    //         .line()
    //         .x(function (d) {
    //           return x(d["__timestamp"]);
    //         })
    //         .y(function (d) {
    //           return y(d[metrica]);
    //         })
    //     );
    // });
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
