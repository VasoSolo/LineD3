// export default function createChartLine(element, props, dates) {
//   if (element.select(".MyChart")) {
//     element.select(".MyChart").remove();
//   }

//   let svg = element
//     .append("svg")
//     .attr("class", "MyChart")
//     .attr("width", width)
//     .attr("height", height);

//   /////////////////////////////////////////////////////////////////////////////scales

//   const x = d3
//     .scaleTime()
//     .domain(
//       d3.extent(data, function (d) {
//         return d.__timestamp;
//       })
//     )
//     .range([0, widthWithPadding - 10]);

//   // const x = d3
//   //   .scaleTime()
//   //   .domain(d3.extent(X))
//   //   .range([0, widthWithPadding - 10]);

//   const y = d3
//     .scaleLinear()
//     .domain([0, d3.max(Y)])
//     .range([height, padding.bottom + padding.top]);

//   const color = CategoricalColorNamespace.getScale(colorScheme);

//   let currentSelection: any[] = [x.invert(0), x.invert(widthWithPadding - 10)];
//   ////////////////////////////////////////////////////////////////////////////////////////paint
//   let xAxisSetting = d3.axisBottom(x).tickPadding(10);
//   if (tickVertical) {
//     xAxisSetting.tickSizeInner(-heightWithPadding);
//   }
//   let yAxisSetting = d3.axisLeft(y).tickPadding(10);
//   if (tickHorizontal) {
//     yAxisSetting.tickSizeInner(-widthWithPadding);
//   }

//   let xAxis = svg
//     .append("g")
//     .attr("transform", `translate(${padding.left}, ${height - padding.bottom})`)
//     .call(xAxisSetting);

//   let yAxis = svg
//     .append("g")
//     .attr("transform", `translate(${padding.left}, ${-padding.bottom})`)
//     .call(yAxisSetting);

//   renderTick();

//   // добавляем clipPath: всё что вне его - не рисуется
//   svg
//     .append("svg:clipPath")
//     .attr("id", "clip")
//     .append("svg:rect")
//     .attr("width", widthWithPadding)
//     .attr("height", height)
//     // .attr("height", "100%")
//     .attr("x", padding.left)
//     .attr("y", 0);

//   // Создаём переменную lines: где находятся как линии, так и кисть
//   const lines = svg.append("g").attr("clip-path", "url(#clip)");

//   lines.on("pointerenter", createToolTip);
//   lines.on("pointermove", moveToolTip);
//   lines.on("pointerleave", hideToolTip);
//   //////////////////////////////////////////////////////////////////////////////////////////////////
//   //////////////////////////////////////////////////////////////////////////////////////////////////
//   //////////////////////////////////////////////////////////////////////////////////////////////////
//   ///////////////////////////////////////////////////////////////////////////////////////////LEGEND

//   if (legendEnabled) {
//     const legendContainer = svg
//       .append("g")
//       .attr("class", "legendTable")
//       .attr("transform", function (d, i) {
//         return `translate(${
//           (width * legendHorizontPosition) / 100
//         },${(height * legendVerticalPosition) / 100})`;
//       });

//     const legendItem = legendContainer
//       .selectAll("legend-item")
//       .data(dataGrouped.keys())
//       .enter()
//       .append("g");

//     if (legendOrientation === "legendVertical") {
//       legendItem.attr("transform", function (d, i) {
//         return `translate(0,${i * (legendItemPadding + 16)})`;
//       });
//     } else {
//       legendItem.attr("transform", function (d, i) {
//         return `translate(${i * (legendItemPadding + 100)},0)`;
//       });
//     }
//     legendItem
//       .append("rect")
//       .attr("x", 1)
//       .attr("y", 0)
//       .attr("height", 16)
//       .attr("width", 16)
//       .attr("class", "legend-rect-color")
//       .attr("style", "cursor: pointer;")
//       .attr("fill", (d) => color(d))
//       .on("click", clickLegend);
//     //        .on("mouseover", hoverPath);
//     legendItem
//       .append("text")
//       .attr("x", 20)
//       .attr("y", 8)
//       .attr("class", "legend-text")
//       .attr("style", "cursor: pointer")
//       .text((d) => {
//         const text = d === undefined ? metrica : d.split(",")[1];
//         return text;
//       })
//       // .text("ldchdjvdsjvln lndf f kenflkdn lkdnfdf dfk dlfk ndlkf")
//       .attr("font-size", legendFontSize)
//       .attr("alignment-baseline", "middle")
//       .on("click", clickLegend);

//     function clickLegend(ev) {
//       lineEnable[ev.path[0]["__data__"]] = !lineEnable[ev.path[0]["__data__"]];

//       let opacityValue = "0.1";
//       let isnotSelect = true;
//       if (d3.select(ev.path[1]).attr("class") === "select") {
//         opacityValue = "1";
//         isnotSelect = false;
//       }
//       // console.log("brush");
//       d3.select(ev.path[1])
//         .classed("select", isnotSelect)
//         .select(".legend-rect-color")
//         .attr("opacity", opacityValue);
//       drawLines();
//     }
//   }
//   //function hoverPath(ev) {
//   // console.log("ev.path", ev.path);
//   // }
//   //////////////////////////////////////////////////////////////////////////////////////////////////
//   //////////////////////////////////////////////////////////////////////////////////////////////////
//   //////////////////////////////////////////////////////////////////////////////////////////////////
//   //////////////////////////////////////////////////////////////////////////////////////////////////toolTip

//   const toolTipLine = lines
//     .append("line")
//     .attr("x1", 100)
//     .attr("y1", 0)
//     .attr("x2", 100)
//     .attr("y2", heightWithPadding)
//     .attr("stroke-dasharray", "2")
//     .attr("stroke-width", 1)
//     .attr("stroke", "black")
//     .attr("opacity", "0")
//     .attr("class", "toolTipLine")
//     .attr("id", "toolTipLine")
//     .attr("transform", `translate(0,${padding.top})`);

//   // createToolTip();

//   function createToolTip() {
//     // console.log("createToolTip");
//     const toolTipBlock = lines.append("g").attr("class", "toolTipBlock");

//     const path = toolTipBlock
//       .selectAll("path")
//       .data([, ,])
//       .join("path")
//       .attr("fill", "Snow")
//       .attr("stroke", "DimGray")
//       .attr("class", "toolTipPath");

//     toolTipBlock
//       .append("text")
//       .attr("style", "font-weight: bold;")
//       .attr("transform", "translate(5,25)")
//       .attr("class", "toolTipHeader");
//   }

//   const formatYear = d3.timeFormat("%Y");
//   const formatMonth = d3.timeFormat("%B");
//   const formatDay = d3.timeFormat("%a %d");
//   const formatDayMonthYear = d3.timeFormat("%d %B %Y");
//   // console.log("1");

//   function moveToolTip(ev) {
//     const i = d3.bisectCenter(X, x.invert(d3.pointer(ev)[0] - padding.left));
//     //console.log(d3.pointer(ev));
//     // console.log(`${d3.pointer(ev)} / ${width}`);

//     // console.log("X[i]", X[i]);
//     // console.log("dataGrouped[i]", dataGrouped[X[i]]);
//     // console.log("data", data);
//     arrayForToolTip = getArrayForToolTip(X[i]);

//     // console.log(arrayForToolTip);
//     // console.log(arrayForToolTip.length === 0);

//     if (arrayForToolTip.length > 0) {
//       d3.select(".toolTipLine")
//         .attr("x1", x(X[i]) + padding.left)
//         .attr("x2", x(X[i]) + padding.left)
//         .attr("opacity", "0.6");
//       // console.log("X[i]", formatYear(X[i]));

//       d3.select(".toolTipBlock")
//         .selectAll(".toolTip")
//         .data(arrayForToolTip)
//         .join("text")
//         .attr("class", "toolTip")
//         .attr("style", "fill: grey;")
//         .attr("transform", (d, i) => `translate(5,${45 + i * 20})`)
//         .text((d) => `${d[0]} - ${d[1]}`);

//       const headerText = formatDayMonthYear(X[i]);
//       d3.select(".toolTipHeader").text(headerText);

//       const maxLengthInToolTip = getMaxLengthOfToolTipText();

//       const widthToolTip = d3.max([
//         d3.select(".toolTipHeader").node().getBBox().width,
//         maxLengthInToolTip,
//       ]);
//       const heightToolTipText = d3
//         .select(".toolTipHeader")
//         .node()
//         .getBBox().height;

//       const heightToolTipBox =
//         (arrayForToolTip.length + 1) * (heightToolTipText + 3) + 10;
//       d3.select(".toolTipPath").attr(
//         "d",
//         // `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`
//         `M 0 5 h ${+widthToolTip + 20} v ${heightToolTipBox} h -${
//           +widthToolTip + 20
//         } Z`
//       );

//       const { height: heightToolTip } = d3
//         .select(".toolTipBlock")
//         .node()
//         .getBBox();

//       let toolTipHorizontalPosition: number;
//       let toolVertikalPosition: number;
//       if (d3.pointer(ev)[0] > width / 2) {
//         toolTipHorizontalPosition = -widthToolTip - 30;
//       } else {
//         toolTipHorizontalPosition = 10;
//       }
//       if (d3.pointer(ev)[1] > height / 2) {
//         toolVertikalPosition = -heightToolTip - 15;
//       } else {
//         toolVertikalPosition = 10;
//       }
//       d3.select(".toolTipBlock")
//         .attr("opacity", "1")
//         .attr(
//           "transform",
//           `translate(${d3.pointer(ev)[0] + toolTipHorizontalPosition},${
//             d3.pointer(ev)[1] + toolVertikalPosition
//           })`
//         );
//     }
//   }

//   //скрыть тултип
//   function hideToolTip(ev) {
//     svg.select(".toolTipBlock").remove();

//     d3.select(".toolTipLine").attr("opacity", "0");
//   }

//   //определить самый длинный элемент в тултипе
//   function getMaxLengthOfToolTipText() {
//     const toolTipText = d3.selectAll(".toolTip").nodes();
//     const maxLenght = d3.max(toolTipText, (d) => d.getBBox().width);
//     return maxLenght;
//   }

//   //сбор множества отметок для тултипа
//   function getArrayForToolTip(point) {
//     const array = [];
//     // console.log("dataTime.get(point)", dataTime.get(point));
//     // console.log("lineEnable", lineEnable);
//     dataTime.get(point)?.forEach((el) => {
//       namesGroup.forEach((nameGroup) => {
//         if (dataTime.get(point)[0][nameGroup] && lineEnable[nameGroup]) {
//           // console.log(nameGroup, lineEnable[nameGroup]);
//           // console.log("lineEnable[nameGroup]", lineEnable[nameGroup]);
//           array.push([
//             nameGroup.split(",")[1],
//             dataTime.get(point)[0][nameGroup],
//           ]);
//           // console.log("array", array);
//         }
//       });
//     });
//     console.log("array", array);
//     return array;
//   }

//   //////////////////////////////////////////////////////////////////////////paint data
//   //возвращает максимум на выделенном интервале
//   function getMaximumInInterval(
//     data: any[],
//     start: any | undefined = undefined,
//     end: any | undefined = undefined
//   ) {
//     // console.log("data in getMaximumInInterval", data);
//     // console.log("start in getMaximumInInterval", start);
//     // console.log("end in getMaximumInInterval", end);
//     let maxY: number;

//     if (start && end) {
//       // console.log("if in getMaximumInInterval");
//       maxY = d3.max(data, (d) =>
//         start <= d["__timestamp"] && d["__timestamp"] <= end
//           ? d["maxInTime"]
//           : NaN
//       );
//     } else {
//       maxY = d3.max(data, (d) => d["maxInTime"]);
//     }
//     // console.log("maxY in getMaximumInInterval", maxY);
//     return maxY;
//   }

//   //возвращает массив - для каждой временной точки соответсвующее максимальное значение из отображаемых
//   function getArrayOfValueEnableLines() {
//     let arrayOfEnableValues = [];

//     data.forEach((item) => {
//       let arrayOfTime = [];
//       namesGroup.forEach((nameGroup) => {
//         if (item[nameGroup] && lineEnable[nameGroup]) {
//           arrayOfTime.push(item[nameGroup]);
//         }
//       });
//       arrayOfEnableValues.push({
//         __timestamp: item["__timestamp"],
//         maxInTime: d3.max(arrayOfTime),
//       });
//     });
//     return arrayOfEnableValues;
//   }

//   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   drawLines();

//   function drawLines() {
//     // enableddataGrouped = renderEnableArray();
//     console.log("drawLines");
//     let arrayOfEnableValues = [];
//     enableddataGrouped = Array.from(dataGrouped).filter(
//       (item) => lineEnable[String(item[0])]
//     );

//     arrayOfEnableValues = getArrayOfValueEnableLines();
//     console.log("enableddataGrouped in drawLines", enableddataGrouped);
//     // console.log("currentSelection", currentSelection);
//     // console.log("arrayOfEnableValues in drawLines", arrayOfEnableValues);

//     const maxY = getMaximumInInterval(
//       arrayOfEnableValues,
//       currentSelection[0],
//       currentSelection[1]
//     );
//     // console.log("maxY", maxY);
//     y.domain([0, maxY]);

//     yAxis.transition().duration(1000).call(yAxisSetting);
//     renderTick();
//     //y.copy().domain([0, maxY])

//     // const valueEnableLines = d3.group(enableddataGrouped, d => d)

//     // console.log("maxY", maxY);

//     svg.selectAll(".area").remove();
//     svg.selectAll(".line").remove();
//     svg.selectAll(".marker").remove();
//     // let arrayLinesId: string[] = [];

//     //закрашиваем площади
//     if (areaMode) {
//       console.log("areaMode");
//       enableddataGrouped.forEach((data, key) => {
//         console.log("data in areaMode", data);
//         const lineId = String(data[0]);
//         console.log("lineId in areaMode", lineId);
//         // arrayLinesId.push(lineId);
//         const lineData = data[1];
//         const area = lines
//           .append("path")
//           .datum(lineData)
//           .attr("class", "area")
//           .attr("fill", "none")
//           .attr("id", `area-${lineId}`)
//           .attr("transform", `translate(${padding.left}, ${-padding.bottom})`)
//           .attr("stroke-width", 0)
//           .attr(
//             "d",
//             d3
//               .area()
//               .x(function (d) {
//                 return x(d["__timestamp"]);
//               })
//               .y0(height)
//               .y1(function (d) {
//                 return y(d["value"]);
//               })
//           );

//         //fill area
//         const gradId = lineId.replace(/\s|\(|\)|,/gm, "");

//         console.log("gradId", gradId);
//         var lg = lines
//           .append("defs")
//           .append("linearGradient")
//           .attr("id", `mygrad_${gradId}`) //id of the gradient
//           .attr("x1", "0%")
//           .attr("x2", "0%")
//           .attr("y1", "0%")
//           .attr("y2", "100%"); //since its a vertical linear gradient
//         lg.append("stop")
//           .attr("offset", "0%")
//           .style("stop-color", color(lineId))
//           // .style("stop-color", "green")
//           .style("stop-opacity", 1);

//         lg.append("stop").attr("offset", "100%").style("stop-color", "white");
//         // .style("stop-opacity", areaOpacity / 100);

//         if (gradientArea) {
//           area.attr("fill", `url(#mygrad_${gradId})`);
//         } else {
//           area
//             .attr("fill", color(lineId))
//             .attr("fill-opacity", areaOpacity / 100);
//         }
//       });
//     }
//     ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//     ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//     ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//     ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//     //рисуем линии
//     enableddataGrouped.forEach((data, key) => {
//       // console.log("data in drawLines", data);
//       const lineId = String(data[0]);
//       const lineData = data[1];
//       const line = lines
//         .append("g")
//         .attr("id", `g-${lineId}`)
//         .append("path")
//         .datum(lineData)
//         .attr("class", "line")
//         .attr("fill", "none")
//         .attr("id", `line-${lineId}`)
//         .attr("transform", `translate(${padding.left}, ${-padding.bottom})`)
//         .attr("stroke", color(lineId))
//         .attr("stroke-width", lineWidth)
//         .attr(
//           "d",
//           d3
//             .line()
//             .x(function (d) {
//               return x(d["__timestamp"]);
//             })
//             .y(function (d) {
//               // console.log("d in lines", lineId, d);
//               return y(d["value"]);
//             })
//         );

//       if (markerEnabled) {
//         lines
//           .selectAll(".marker-group")
//           .data(lineData)
//           .join("path")
//           .attr("class", "marker")
//           .attr("d", d3.symbol().size(markerSize).type(d3[markerType]))
//           .attr(
//             "transform",
//             (d) =>
//               `translate(${x(d["__timestamp"]) + padding.left}, ${
//                 y(d["value"]) - padding.bottom
//               })`
//           )
//           .attr("fill", color(lineId));
//       }
//     });
//   }

//   function lineOrAreaRender() {
//     console.log("lineOrAreaRender");
//     if (areaMode) {
//       lines
//         .selectAll(".area")
//         .transition()
//         .duration(1000)
//         .attr(
//           "d",
//           d3
//             .area()
//             .x(function (d) {
//               return x(d["__timestamp"]);
//             })
//             .y0(height)
//             .y1(function (d) {
//               return y(d["value"]);
//             })
//         );
//     }
//     lines
//       .selectAll(".line")
//       .transition()
//       .duration(1000)
//       .attr(
//         "d",
//         d3
//           .line()
//           .x(function (d) {
//             return x(d["__timestamp"]);
//           })
//           .y(function (d) {
//             return y(d["value"]);
//           })
//       );
//   }
//   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   //////////////////////////////////////////////////////////////////////////////////////////////////ZOOM
//   // Add brushing
//   const brush = d3
//     .brushX() // Add the brush feature using the d3.brush function
//     .extent([
//       [0, 0],
//       [widthWithPadding, height - padding.bottom],
//     ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
//     .on("end", brushedChart); // Each time the brush selection changes, trigger the 'updateChart' function

//   // Add the brushing
//   lines
//     .append("g")
//     .attr("class", "brush")
//     .attr("id", "brush")
//     .attr("transform", `translate(${padding.left},0)`)
//     .call(brush);

//   // A function that set idleTimeOut to null
//   let idleTimeout;
//   function idled() {
//     idleTimeout = null;
//   }

//   function brushedChart(event, d) {
//     console.log("brushedChart");
//     // What are the selected boundaries?

//     // let extent = event.selection;
//     if (event.selection) {
//       currentSelection = [
//         x.invert(event.selection[0]),
//         x.invert(event.selection[1]),
//       ];

//       //currentSelection[0] =  x.invert(event.selection[0])
//     }

//     if (!event.selection) {
//       if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350)); // This allows to wait a little bit
//     } else {
//       //получаем множество всех отображаемых значений
//       const arrayOfValueEnableLines = getArrayOfValueEnableLines();
//       //находим максимальное значение на отображаемом интервале
//       const maxY = getMaximumInInterval(
//         arrayOfValueEnableLines,
//         currentSelection[0],
//         currentSelection[1]
//       );
//       x.domain([currentSelection[0], currentSelection[1]]);
//       y.domain([0, maxY]);
//       lines.select(".brush").call(brush.move, null); // This remove the grey brush area as soon as the selection has been done
//     }
//     // Update axis and line position
//     xAxis.transition().duration(1000).call(xAxisSetting);
//     yAxis.transition().duration(1000).call(yAxisSetting);
//     renderTick();
//     lineOrAreaRender();
//     lines
//       .selectAll(".marker")
//       .transition()
//       .duration(1000)
//       .attr(
//         "transform",
//         (d) =>
//           `translate(${x(d["__timestamp"]) + padding.left}, ${
//             y(d["value"]) - padding.bottom
//           })`
//       );
//   }

//   svg.on("dblclick", function () {
//     //получаем множество всех отображаемых значений
//     const arrayOfValueEnableLines = getArrayOfValueEnableLines();
//     //находим максимальное значение на отображаемом интервале
//     currentSelection = [0, widthWithPadding - 10];
//     const maxY = getMaximumInInterval(arrayOfValueEnableLines);
//     x.domain(
//       d3.extent(data, function (d) {
//         return d.__timestamp;
//       })
//     );
//     y.domain([0, maxY]);
//     xAxis.transition().duration(1000).call(xAxisSetting);
//     yAxis.transition().duration(1000).call(yAxisSetting);

//     renderTick();

//     lineOrAreaRender();

//     lines
//       .selectAll(".marker")
//       .transition()
//       .duration(1000)
//       .attr(
//         "transform",
//         (d) =>
//           `translate(${x(d["__timestamp"]) + padding.left}, ${
//             y(d["value"]) - padding.bottom
//           })`
//       );
//   });

//   //перерисовка делений
//   function renderTick() {
//     d3.selectAll(".tick").attr(
//       "style",
//       "stroke-opacity: 0.3; stroke-dasharray: 1, 2;stroke-width: 1;"
//     );
//   }
// }
