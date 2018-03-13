/**
 * jspsych-survey-likert
 * a jspsych plugin for measuring items on a likert scale
 *
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 */

jsPsych.plugins['survey-likert'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'survey-likert',
    description: '',
    parameters: {
      questions: {
        type: [jsPsych.plugins.parameterType.STRING],
        array: true,
        default: undefined,
        no_function: false,
        description: ''
      },
      labels: {
        type: [jsPsych.plugins.parameterType.STRING],
        array: true,
        default: undefined,
        no_function: false,
        description: ''
      },
      required: {
        type: [jsPsych.plugins.parameterType.BOOL],
        array: true,
        default: false,
        no_function: false,
        description: ''
      },
      button_label: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: 'Submit Answers',
        no_function: false,
        description: ''
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    // default parameters for the trial
    trial.preamble = typeof trial.preamble === 'undefined' ? "" : trial.preamble;
    trial.required = typeof trial.required === 'undefined' ? false : trial.required;
    trial.button_label = typeof trial.button_label === 'undefined' ? 'Submit Answers' : trial.button_label;

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    var html = "";
    // inject CSS for trial
    html += '<style id="jspsych-survey-likert-css">';
    html += ".jspsych-survey-likert-statement { display:block; font-size: 24px; padding-top: 40px; margin-bottom:10px; }"+
      ".jspsych-survey-likert-opts { list-style:none; width:100%; margin:0; padding:0 0 35px; display:block; font-size: 18px; line-height:1.1em; }"+
      ".jspsych-survey-likert-opt-label { line-height: 1.1em; color: #C0C0C0; }"+ //Spacing of text below radio buttons
      ".jspsych-survey-likert-opts:before { content: ''; position:relative; top:11px; /*left:9.5%;*/ display:block; background-color:#efefef; height:6px; width:100%; }"+ //bar that runs across radio buttons
      ".jspsych-survey-likert-opts:last-of-type { border-bottom: 0; }"+
      ".jspsych-survey-likert-opts li { display:inline-block; /*width:38%;*/ text-align:center; vertical-align: top; }"+ //originally 19% width
      ".jspsych-survey-likert-opts li input[type=radio] { display:block; position:relative; top:0; left:50%; margin-left:-6px; }"
    html += '</style>';

    // show preamble text
    html += '<div id="jspsych-survey-likert-preamble" class="jspsych-survey-likert-preamble">'+trial.preamble+'</div>';

    html += '<form id="jspsych-survey-likert-form">';

    // add likert scale questions
    for (var i = 0; i < trial.questions.length; i++) {
      // add question
      html += '<label class="jspsych-survey-likert-statement">' + trial.questions[i] + '</label>';
      // add options
      var width = 100 / trial.labels[i].length;
      var options_string = '<ul class="jspsych-survey-likert-opts" data-radio-group="Q' + i + '">';
      for (var j = 0; j < trial.labels[i].length; j++) {
        options_string += '<li style="width:' + width + '%"><input type="radio" name="Q' + i + '" value="' + j + '"';
        if(trial.required){
          options_string += ' required';
        }
        options_string += '><label class="jspsych-survey-likert-opt-label">' + trial.labels[i][j] + '</label></li>';
      }
      options_string += '</ul>';
      html += options_string;
    }

    // add submit button
    html += '<input type="submit" id="jspsych-survey-likert-next" class="jspsych-survey-likert jspsych-btn" value="'+trial.button_label+'"></input>';

    html += '</form>'

    display_element.innerHTML = html;

    display_element.querySelector('#jspsych-survey-likert-form').addEventListener('submit', function(e){
      e.preventDefault();
      // measure response time
      var endTime = (new Date()).getTime();
      var response_time = endTime - startTime;

      // create object to hold responses
      var question_data = {};
      var matches = display_element.querySelectorAll('#jspsych-survey-likert-form .jspsych-survey-likert-opts');
      for(var index = 0; index < matches.length; index++){
        var id = matches[index].dataset['radioGroup'];
        var el = display_element.querySelector('input[name="' + id + '"]:checked');
        if (el === null) {
          var response = "";
        } else {
          var response = parseInt(el.value);
        }
        var obje = {};
        obje[id] = response;
        Object.assign(question_data, obje);
      }

      // save data
      var trial_data = {
        "rt": response_time,
        "responses": JSON.stringify(question_data)
      };

      display_element.innerHTML = '';

      // next trial
      jsPsych.finishTrial(trial_data);
    });

    var startTime = (new Date()).getTime();
  };

  return plugin;
})();