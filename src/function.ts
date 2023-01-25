import * as d3 from "d3";

//возвращает максимум на выделенном интервале
export function getMaximumInInterval(
  data: any[],
  start: any | undefined = undefined,
  end: any | undefined = undefined
) {
  // console.log("data in getMaximumInInterval", data);
  // console.log("start in getMaximumInInterval", start);
  // console.log("end in getMaximumInInterval", end);
  let minMaxY: number[];

  if (start && end) {
    // console.log("if in getMaximumInInterval");
    minMaxY = d3.extent(data, (d) =>
      start <= d["__timestamp"] && d["__timestamp"] <= end
        ? d["maxInTime"]
        : NaN
    );
  } else {
    minMaxY = d3.extent(data, (d) => d["maxInTime"]);
  }
  return minMaxY;
}

//возвращает массив - для каждой временной точки соответсвующее максимальное значение из отображаемых
export function getArrayOfValueEnableLines(data, namesGroup, lineEnable) {
  let arrayOfEnableValues = [];

  data.forEach((item) => {
    let arrayOfTime = [];
    namesGroup.forEach((nameGroup) => {
      if (item[nameGroup] && lineEnable[nameGroup]) {
        arrayOfTime.push(item[nameGroup]);
      }
    });
    arrayOfEnableValues.push({
      __timestamp: item["__timestamp"],
      maxInTime: d3.max(arrayOfTime),
    });
  });
  return arrayOfEnableValues;
}
