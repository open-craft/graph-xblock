/* Javascript for GraphXBlock. */
function GraphXBlock(runtime, element, data) {

  let graphBlock = $('#graphxblock_block', element).get(0);
  let graphCalculator = Desmos.GraphingCalculator(graphBlock);
  let default_expression = data?.default_expression;
  let lineStyle = data?.line_style;
  let xAxisLabel = data?.x_axis_lable;
  let yAxisLabel = data?.y_axis_lable;
  let hideExpression = data?.hide_expression;
  if (default_expression !== "") {
    graphCalculator.setExpression({
      latex: default_expression,
      lineStyle: eval(lineStyle),
      secret: hideExpression,
    });
  }
  if (xAxisLabel !== "") {
    graphCalculator.updateSettings({ xAxisLabel: xAxisLabel });
  }
  if (yAxisLabel !== "") {
    graphCalculator.updateSettings({ yAxisLabel: yAxisLabel });
  }

}
