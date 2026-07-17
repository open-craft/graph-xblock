/* Javascript for GraphXBlock. */
function GraphXBlock(runtime, element, data) {

  // Don't change this to jquery find format because the render and find
  // doesn't play with Desmos.
  let graphBlock = $('#graphxblock_block', element).get(0);
  let statusBanner = $(element).find('#statusBanner');
  let closeBannerButton = $(element).find('#closeBannerButton');
  let statusMessage = $(element).find('#statusMessage');
  let desmosCdnUrl = data?.desmos_cdn_url;
  const successBannerColor = '#0b5c33';
  const errorBannerColor = '#b00020';

  const showStatusMessage = (message, isError = false) => {
    statusMessage.text(message);
    statusBanner.attr({
      'aria-hidden': 'false',
      'role': isError ? 'alert' : 'status',
      'aria-live': isError ? 'assertive' : 'polite',
    });
    statusBanner.css({
      display: 'flex',
      backgroundColor: isError ? errorBannerColor : successBannerColor,
    });
    statusBanner.trigger('focus');
  };

  const resetStatusMessage = () => {
    statusMessage.text('');
    statusBanner.attr({
      'aria-hidden': 'true',
      'role': 'status',
      'aria-live': 'polite',
    });
    statusBanner.css({
      display: 'none',
      backgroundColor: successBannerColor,
    });
  };

  // Function to close the status banner.
  closeBannerButton.on('click', resetStatusMessage);

  // Everything that touches the Desmos API must wait until the Desmos CDN
  // script has actually loaded, so it lives in this function.
  const initCalculator = () => {
    let graphCalculator = Desmos.GraphingCalculator(graphBlock);
    let default_expression = data?.default_expression;
    const lineStyle = {
      'Desmos.Styles.SOLID': Desmos.Styles.SOLID,
      'Desmos.Styles.DASHED': Desmos.Styles.DASHED,
      'Desmos.Styles.DOTTED': Desmos.Styles.DOTTED,
    }[data?.line_style] || Desmos.Styles.SOLID;
    let xAxisLabel = data?.x_axis_lable;
    let yAxisLabel = data?.y_axis_lable;
    let hideExpression = data?.hide_expression;
    let saveState = data?.save_state_allowed;
    let state = data?.state;
    let saveStateUrl = runtime.handlerUrl(element, 'save_state');
    if (default_expression !== "") {
      graphCalculator.setExpression({
        latex: default_expression,
        lineStyle,
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
          success: () => {
            showStatusMessage('Your graph is successfully saved!');
          },
          error: (xhr, textStatus, errorThrown) => {
            let message = `The request failed with status code: ${xhr.status} and message: ${textStatus}`;
            showStatusMessage(message, true);
          }
        })
      })
      parentButton.append(saveButton)
    }
  };

  const showLoadError = () => {
    if (graphBlock) {
      graphBlock.textContent = 'Failed to load the Desmos calculator. Please reload the page.';
    }
  };

  let initialized = false;
  let desmosPoll = null;
  const initOnce = () => {
    if (desmosPoll !== null) {
      clearInterval(desmosPoll);
      desmosPoll = null;
    }
    if (!initialized && window.Desmos) {
      initialized = true;
      // Clear any stale "Failed to load" message if the script arrived
      // after the poll below had already timed out.
      if (graphBlock) {
        graphBlock.textContent = '';
      }
      initCalculator();
    }
  };

  if (window.Desmos) {
    initOnce();
    return;
  }

  /* A <script src=...> tag embedded in the fragment HTML does not execute
   * when the runtime inserts the fragment with innerHTML (e.g. the Studio
   * author preview), so load the Desmos script programmatically instead.
   * Blocks can be configured with different API keys (different CDN URLs),
   * so only reuse a tag another Graph block injected when its URL matches;
   * otherwise inject a second tag (last one loaded wins window.Desmos, the
   * same as the old per-block <script> tag behavior). The state attribute
   * lets late blocks fail fast on a script that already errored, since its
   * load/error events will never fire again.
   * */
  const findDesmosScript = (url) => {
    let match = null;
    document.querySelectorAll('script[data-graphxblock-desmos]').forEach((script) => {
      if (!url || script.getAttribute('data-graphxblock-desmos') === url) {
        match = script;
      }
    });
    return match;
  };
  let desmosScript = findDesmosScript(desmosCdnUrl);
  if (!desmosScript) {
    if (!desmosCdnUrl) {
      showLoadError();
      return;
    }
    desmosScript = document.createElement('script');
    desmosScript.src = desmosCdnUrl;
    desmosScript.setAttribute('data-graphxblock-desmos', desmosCdnUrl);
    desmosScript.setAttribute('data-graphxblock-desmos-state', 'loading');
    desmosScript.addEventListener('load', () => {
      desmosScript.setAttribute('data-graphxblock-desmos-state', 'loaded');
    });
    desmosScript.addEventListener('error', () => {
      desmosScript.setAttribute('data-graphxblock-desmos-state', 'error');
    });
    document.head.appendChild(desmosScript);
  } else if (desmosScript.getAttribute('data-graphxblock-desmos-state') === 'error') {
    showLoadError();
    return;
  }
  desmosScript.addEventListener('load', initOnce);
  desmosScript.addEventListener('error', () => {
    if (desmosPoll !== null) {
      clearInterval(desmosPoll);
      desmosPoll = null;
    }
    showLoadError();
  });

  /* Bounded fallback poll, in case the script finished loading before the
   * listener above was attached (e.g. it was injected by another block).
   * */
  const pollStart = Date.now();
  const pollTimeoutMs = 15000;
  desmosPoll = setInterval(() => {
    if (window.Desmos) {
      initOnce();
    } else if (Date.now() - pollStart > pollTimeoutMs) {
      clearInterval(desmosPoll);
      desmosPoll = null;
      if (!initialized) {
        showLoadError();
      }
    }
  }, 250);

}
