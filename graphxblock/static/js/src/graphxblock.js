/* Javascript for GraphXBlock. */
function GraphXBlock(runtime, element, data) {

  let graphBlock = $('#graphxblock_block', element).get(0);
  let graphCalculator = Desmos.GraphingCalculator(graphBlock);
  let default_expression = data?.default_expression;
  debugger;
  let lineStyle = data?.line_style === "" ? Desmos.Styles.SOLIID : data?.line_style;
  let xAxisLabel = data?.x_axis_lable;
  let yAxisLabel = data?.y_axis_lable;
  let hideExpression = data?.hide_expression;
  let saveState = data?.save_state_allowed;
  let state = data?.state;
  let saveStateUrl = runtime.handlerUrl(element, 'save_state');
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

  if ((state !== undefined && state !== "") && saveState) {
    graphCalculator.setState(state);
  }

  let stateButton = $('#stateButton', element).get(0);
  if (saveState) {
    stateButton.style.visibility = 'visible';
  } else {
    stateButton.style.visibility = 'hidden';
  }

  stateButton.addEventListener('click', () => {
    let currentState = graphCalculator.getState();
    $.ajax({
      type: 'POST',
      url: saveStateUrl,
      data: JSON.stringify(currentState),
      dataType: 'json',
      success: () => { alert('State saved!') },
    })

  })

}
