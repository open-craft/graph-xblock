/* Javascript for GraphXBlock. */
function GraphXBlock(runtime, element, data) {

  let graphBlock = $('#graphxblock_block', element).get(0);
  let graphCalculator = Desmos.GraphingCalculator(graphBlock);
  let default_expression = data?.default_expression;
  if (default_expression !== "") {
    graphCalculator.setExpression({ latex: default_expression });
  }
}
