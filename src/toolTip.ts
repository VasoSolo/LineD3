import * as d3 from "d3";

export function createToolTip(canvas) {
  const toolTipBlock = canvas.append("g").attr("class", "toolTipBlock");
  toolTipBlock
    .selectAll("path")
    .data([, ,])
    .join("path")
    .attr("fill", "Snow")
    .attr("stroke", "DimGray")
    .attr("class", "toolTipPath");
  toolTipBlock
    .append("text")
    .attr("style", "font-weight: bold;")
    .attr("transform", "translate(5,25)")
    .attr("class", "toolTipHeader");
}

export function moveToolTip(
  ev,
  arrayForToolTip,
  padding,
  formatDayMonthYear,
  X,
  x,
  width,
  height,
  dataTime,
  lineEnable,
  namesGroup
) {
  //получаем ближайшее значение на временной шкале к положению мыши
  const i = d3.bisectCenter(X, x.invert(d3.pointer(ev)[0] - padding.left));

  //собираем массив отображаемых в тултип данных
  arrayForToolTip = getArrayForToolTip(X[i], dataTime, namesGroup, lineEnable);

  //если есть, что отображать в тултипе
  if (arrayForToolTip.length > 0) {
    //положение линии тултипа
    d3.select(".toolTipLine")
      .attr("x1", x(X[i]) + padding.left)
      .attr("x2", x(X[i]) + padding.left)
      .attr("opacity", "0.6");

    //положение тултипа
    d3.select(".toolTipBlock")
      .selectAll(".toolTip")
      .data(arrayForToolTip)
      .join("text")
      .attr("class", "toolTip")
      .attr("style", "fill: grey;")
      .attr("transform", (d, i) => `translate(5,${45 + i * 20})`)
      .text((d) => `${d[0]} - ${d[1]}`);

    //заголовок тултипа в соотвествии с форматом отображения даты
    const headerText = formatDayMonthYear(X[i]);
    d3.select(".toolTipHeader").text(headerText);

    //находим самый длмнный элемент в тултипе
    const maxLengthInToolTip = getMaxLengthOfToolTipText();
    //высчитываем ширину тултипа
    const widthToolTip = d3.max([
      d3.select(".toolTipHeader").node().getBBox().width,
      maxLengthInToolTip,
    ]);

    //высота строки с текстом в тултипе
    const heightToolTipText = d3
      .select(".toolTipHeader")
      .node()
      .getBBox().height;

    //высота тултипа
    const heightToolTipBox =
      (arrayForToolTip.length + 1) * (heightToolTipText + 3) + 10;
    d3.select(".toolTipPath").attr(
      "d",
      `M 0 5 h ${+widthToolTip + 20} v ${heightToolTipBox} h -${
        +widthToolTip + 20
      } Z`
    );

    //получаем высоту тултипа
    const { height: heightToolTip } = d3
      .select(".toolTipBlock")
      .node()
      .getBBox();

    //двигаем тултип относительно мышки в зависимости от положения
    //чтобы он не выходил за пределы чарта
    let toolTipHorizontalPosition: number;
    let toolVertikalPosition: number;
    if (d3.pointer(ev)[0] > width / 2) {
      toolTipHorizontalPosition = -widthToolTip - 30;
    } else {
      toolTipHorizontalPosition = 10;
    }
    if (d3.pointer(ev)[1] > height / 2) {
      toolVertikalPosition = -heightToolTip - 15;
    } else {
      toolVertikalPosition = 10;
    }
    d3.select(".toolTipBlock")
      .attr("opacity", "1")
      .attr(
        "transform",
        `translate(${d3.pointer(ev)[0] + toolTipHorizontalPosition},${
          d3.pointer(ev)[1] + toolVertikalPosition
        })`
      );
  }
}

function getMaxLengthOfToolTipText() {
  const toolTipText = d3.selectAll(".toolTip").nodes();
  const maxLenght = d3.max(toolTipText, (d) => d.getBBox().width);
  return maxLenght;
}

//сбор множества отметок для тултипа
function getArrayForToolTip(point, dataTime, namesGroup, lineEnable) {
  const array = [];
  dataTime.get(point)?.forEach((el) => {
    namesGroup.forEach((nameGroup) => {
      if (dataTime.get(point)[0][nameGroup] && lineEnable[nameGroup]) {
        array.push([
          nameGroup.split(",")[1],
          dataTime.get(point)[0][nameGroup],
        ]);
      }
    });
  });
  return array;
}

export function hideToolTip(ev) {
  d3.select(".toolTipBlock").remove();
  d3.select(".toolTipLine").attr("opacity", "0");
}
