/* Javascript for GraphXBlock. */
function GraphXBlock(runtime, element, data) {

  // Don't change this to jquery find format because the render and find
  // doesn't play with Desmos.
  let graphBlock = $('#graphxblock_block', element).get(0);
  let statusBanner = $(element).find('#statusBanner');
  let closeBannerButton = $(element).find('#closeBannerButton');
  let statusMessage = $(element).find('#statusMessage');
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

  // Function to close the status banner.
  closeBannerButton.on('click', () => {
    statusMessage.text('');
    statusBanner.css('display', 'none');
  })

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
        success: () => {
          statusMessage.text('Your graph is succuessfully saved!');
          statusBanner.css('display', 'flex');
        },
        error: (xhr, textStatus, errorThrown) => {
          let message = `The request failed with status code: ${xhr.status} and message: ${textStatus}`;
          statusMessage.text(message);
          statusBanner.css('background-color', '#f44336');
          statusBanner.css('display', 'flex');
        }
      })
    })
    parentButton.append(saveButton)
  }

}
