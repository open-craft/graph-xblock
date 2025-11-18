/* Javascript for GraphXBlock. */
function GraphXBlock(runtime, element, data) {

  let graphBlock = $(element).find('#graphxblock_block');
  let graphCalculator = Desmos.GraphingCalculator(graphBlock);
  let default_expression = data?.default_expression;
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

  /* Create button on the go, it checks if the save state option is enabled
   * and only if the option is enabled we create the button and add it to the div.
   * */
  let parentButton = $(element).find('#parentButton');
  if (saveState) {
    let saveButton = $("<button id='stateButton' class='favorite styled'> Save State</button>");
    saveButton.on('click', () => {
      let currentState = graphCalculator.getState();
      $.ajax({
        type: 'POST',
        url: saveStateUrl,
        data: JSON.stringify(currentState),
        dataType: 'json',
        success: () => { alert('State saved!') },
      })
    })
    parentButton.append(saveButton)
  }

}
