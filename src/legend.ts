import * as d3 from "d3";

export function legend(legendProps) {
  const {
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
  } = legendProps;
  const legendContainer = svg
    .append("g")
    .attr("class", "legendTable")
    .attr("transform", function (d, i) {
      return `translate(${
        (width * legendHorizontPosition) / 100
      },${(height * legendVerticalPosition) / 100})`;
    });

  const legendItem = legendContainer
    .selectAll("legend-item")
    .data(dataGrouped)
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
    .attr("fill", (d) => color(d.nameGroup));
  // .on("click", clickLegend);
  //        .on("mouseover", hoverPath);
  legendItem
    .append("text")
    .attr("x", 20)
    .attr("y", 8)
    .attr("class", "legend-text")
    .attr("style", "cursor: pointer")
    .text((d) => {
      const text =
        d.nameGroup === undefined ? metrica : d.nameGroup.split(",")[1];
      return text;
    })
    // .text("ldchdjvdsjvln lndf f kenflkdn lkdnfdf dfk dlfk ndlkf")
    .attr("font-size", legendFontSize)
    .attr("alignment-baseline", "middle");
  // .on("click", clickLegend);

  return { rectClass: "legend-rect-color", textClass: "legend-text" };
}

export function clickLegend(ev, lineEnable) {
  console.log("nameGroup in clickLegend", ev.path[0]["__data__"].nameGroup);
  console.log(
    "lineEnable[nameGroup]",
    lineEnable[ev.path[0]["__data__"].nameGroup]
  );
  lineEnable[ev.path[0]["__data__"].nameGroup] =
    !lineEnable[ev.path[0]["__data__"].nameGroup];

  let opacityValue = "0.1";
  let isnotSelect = true;
  if (d3.select(ev.path[1]).attr("class") === "select") {
    opacityValue = "1";
    isnotSelect = false;
  }
  // console.log("brush");
  d3.select(ev.path[1])
    .classed("select", isnotSelect)
    .select(".legend-rect-color")
    .attr("opacity", opacityValue);
  // drawLines();
  console.log("lineEnable", lineEnable);
}
