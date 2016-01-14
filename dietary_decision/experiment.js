
/* ************************************ */
/* Define helper functions */
/* ************************************ */

var randomDraw = function(lst) {
    var index = Math.floor(Math.random()*(lst.length))
    return lst[index]
}

var getHealthStim = function() {
  curr_stim = health_stims.shift()
  var stim = base_path + curr_stim
  return '<div class = dd_stimBox><img class = dd_Stim src = ' + stim + ' </img></div>' + health_response_area
}

var getTasteStim = function() {
  curr_stim = taste_stims.shift()
  var stim = base_path + curr_stim
  return '<div class = dd_stimBox><img class = dd_Stim src = ' + stim + ' </img></div>' + taste_response_area
}

var getDecisionStim = function() {
  curr_stim = decision_stims.shift()
  var stim = base_path + curr_stim
  return '<div class = dd_stimBox><img class = dd_Stim src = ' + stim + ' </img></div>' + decision_response_area
}

var getDecisionText = function() {
  return '<div class = centerbox><p class = "white-text block-text">In the next block of trials you should choose whether you would rather eat the food shown on each trial OR the food shown below. You will select response from "Strong No", "No", "Neutral", "Yes" and "Strong Yes". "No" means that you would rather eat the food below, while "Yes" means you would rather eat the food displayed on that trial.</p></div><div class = dd_referenceBox><img class = dd_Stim src = ' + base_path + reference_stim + ' </img></div>'
}

var setUpTest = function() {
  // Calculate avg scores
  var random_stims = jsPsych.randomization.shuffle(stims)
  var neutral_stim_chosen = false
  var alternative_stim_chosen = false
  for (var i = 0; i < stims.length; i++) {
    var key = random_stims[i]
    if (stim_ratings[key]['health'] == 0 && stim_ratings[key]['taste'] == 0 && neutral_stim_chosen == false) {
      reference_stim = key
      neutral_stim_chosen = true
    } else if (stim_ratings[key]['health'] == 1 && stim_ratings[key]['taste'] == 0 && alternative_stim_chosen == false ) {
      var alternative_stim = key
      alternative_stim_chosen = true
    } else {
      decision_stims.push(key)
    }
  }
  /* If no neural stim exists (the subject did not rate any item 0, 0), set the reference stim to the alternative stim
  */
  if (reference_stim == '') {
    reference_stim = alternative_stim
  } else {
    decision_stims.push(alternative_stim)
  }
}

/* ************************************ */
/* Define experimental variables */
/* ************************************ */
var practice_len = 36
var exp_len = 180
var curr_trial = 0
var choices = [74,75,76]
var health_response_area = '<div class = dd_response_div>' +
                '<button class = dd_response_button id = -2>Very Unhealthy</button>' +
                '<button class = dd_response_button id = -1>Unhealthy</button>' +
                '<button class = dd_response_button id = 0>Neutral</button>' +
                '<button class = dd_response_button id = 1>Healthy</button>' +
                '<button class = dd_response_button id = 2>Very Healthy</button></div>'

var taste_response_area = '<div class = dd_response_div>' +
                '<button class = dd_response_button id = -2>Very Bad</button>' +
                '<button class = dd_response_button id = -1>Bad</button>' +
                '<button class = dd_response_button id = 0>Neutral</button>' +
                '<button class = dd_response_button id = 1>Good</button>' +
                '<button class = dd_response_button id = 2>Very Good</button></div>'

// Higher value indicates choosing the food item over the neutral food item.
var decision_response_area = '<div class = dd_response_div>' +
                '<button class = dd_response_button id = -2>Strong No</button>' +
                '<button class = dd_response_button id = -1>No</button>' +
                '<button class = dd_response_button id = 0>Neutral</button>' +
                '<button class = dd_response_button id = 1>Yes</button>' +
                '<button class = dd_response_button id = 2>Strong Yes</button></div>'

var base_path = 'static/experiments/dietary_decision/images/'
var stims = ['100Grand.bmp', 'banana.bmp', 'blueberryyogart.bmp', 'brocollincauliflower.bmp',
            'butterfinger.bmp', 'carrots.bmp', 'cellery.bmp', 'cherryicecream.bmp',
            'ChipsAhoy.bmp', 'cookiencream.bmp', 'cookies.bmp', 'cranberries.bmp',
            'Doritosranch.bmp', 'FamousAmos.bmp', 'ffraspsorbet.bmp', 'FlamingCheetos.bmp',
            'frozenyogart.bmp', 'Ghiradelli.bmp', 'grannysmith.bmp', 'HoHo.bmp',
            'icecreamsandwich.bmp', 'keeblerfudgestripes.bmp', 'keeblerrainbow.bmp', 'KitKat.bmp',
            'laysclassic.bmp', 'Lindt.bmp', 'mixedyogart.bmp', 'MrsFields.bmp', 'orange.bmp',
            'orangejello.bmp', 'Oreos.bmp', 'raisins.bmp', 'reddelicious.bmp',
            'redgrapes.bmp', 'Reeses.bmp', 'RiceKrispyTreat.bmp', 'ruffles.bmp',
            'sbcrackers.bmp', 'sbdietbar.bmp', 'slimfastC.bmp', 'slimfastV.bmp', 'specialKbar.bmp',
            'strawberries.bmp', 'strussel.bmp', 'uToberlorone.bmp', 'uTwix.bmp', 'wheatcrisps.bmp',
            'whitegrapes.bmp', 'wwbrownie.bmp', 'wwmuffin.bmp']

var health_stims = jsPsych.randomization.shuffle(stims)
var taste_stims = jsPsych.randomization.shuffle(stims)
var decision_stims = []
var reference_stim = ''
var curr_stim = ''
var stim_ratings = {}
for (var s = 0; s < stims.length; s++) {
  stim_ratings[stims[s]] = {}
}
/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */
/* define static blocks */
var welcome_block = {
  type: 'text',
  text: '<div class = centerbox><p class = center-block-text>Welcome to the dietary decision experiment. Press <strong>enter</strong> to begin.</p></div>',
  cont_key: [13],
  timing_post_trial: 0,
  on_finish: function() {
    $('body').css('background','black')
  }
};

var end_block = {
  type: 'text',
  text: '<div class = centerbox><p class = "white-text center-block-text">Thanks for completing this task!</p><p class = "white-text center-block-text">Press <strong>enter</strong> to continue.</p></div>',
  cont_key: [13],
  timing_post_trial: 0,
  on_finish: function() {
    $('body').css('background','white')
  }
};

var instructions_block = {
  type: 'instructions',
  pages: ["<div class = centerbox><p class = 'white-text block-text'>In this task you will be rating different food items based on their tastiness and healthiness. You have to respond within 4 seconds of the food item being presented, which should be plenty of time. The whole task should not take more than 10 minutes.</p></div>"],
  allow_keys: false,
  show_clickable_nav: true,
  //timing_post_trial: 1000
};

var start_health_block = {
  type: 'text',
  text: '<div class = centerbox><p class = "white-text center-block-text">In the next block of trials, rate the healthiness of each food item without regard for its taste. Press <strong>enter</strong> to begin.</p></div>',
  cont_key: [13],
  timing_post_trial: 500
};

var start_taste_block = {
  type: 'text',
  text: '<div class = centerbox><p class = "white-text center-block-text">In the next block of trials, rate the taste of each food item without regard for its healthiness. Press <strong>enter</strong> to begin.</p></div>',
  cont_key: [13],
  timing_post_trial: 500
};

var setup_block = {
  type: 'call-function',
  func: setUpTest,
  timing_post_trial: 0
}

var start_decision_block = {
  type: 'text',
  text: getDecisionText,
  cont_key: [13],
  timing_post_trial: 500
};


var fixation_block = {
  type: 'single-stim',
  // stimuli: '<div class = centerbox><div class = "white-text center-text">+</div></div>',
  stimulus: '<div class = centerbox><div class = "white-text center-text">+</div></div>',
  is_html: true,
  timing_stim: 300,
  timing_response: 300,
  data: {exp_id: 'dietary_decision', trial_id: 'fixation'},
  choices: 'none',
  response_ends_trial: true,
  timing_post_trial: 1000
}

var health_block = {
  type: 'single-stim-button',
  // stimuli: getHealthStim,
  stimulus: getHealthStim,
  button_class: 'dd_response_button',
  data: {exp_id: 'dietary_decision', trial_id: 'health_rating'},
  timing_stim: 4000,
  timing_response: 4000,
  response_ends_trial: true,
  timing_post_trial: 500,
  on_finish: function(data) {
    jsPsych.data.addDataToLastTrial({'stim': curr_stim.slice(0,-4)})
    stim_ratings[curr_stim]['health'] = Number(data.mouse_click)
  }
}

var taste_block = {
  type: 'single-stim-button',
  // stimuli: getTasteStim,
  stimulus: getTasteStim,
  button_class: 'dd_response_button',
  data: {exp_id: 'dietary_decision', trial_id: 'taste_rating'},
  timing_stim: 4000,
  timing_response: 4000,
  response_ends_trial: true,
  timing_post_trial: 500,
  on_finish: function(data) {
    jsPsych.data.addDataToLastTrial({'stim': curr_stim.slice(0,-4)})
    stim_ratings[curr_stim]['taste'] = Number(data.mouse_click)
  }
}

var decision_block = {
  type: 'single-stim-button',
  // stimuli: getDecisionStim,
  stimulus: getDecisionStim,
  button_class: 'dd_response_button',
  data: {exp_id: 'dietary_decision', trial_id: 'decision'},
  timing_stim: 4000,
  timing_response: 4000,
  response_ends_trial: true,
  timing_post_trial: 500,
  on_finish: function(data) {
    var reference_rating = JSON.stringify(stim_ratings[reference_stim])
    var stim_rating = JSON.stringify(stim_ratings[curr_stim])
    jsPsych.data.addDataToLastTrial({'stim': curr_stim.slice(0,-4), 
                      'reference': reference_stim.slice(0,-4),
                      'stim_rating': stim_rating,
                      'reference_rating': reference_rating})
  }
}


/* create experiment definition array */
var dietary_decision_experiment = [];
dietary_decision_experiment.push(welcome_block);
dietary_decision_experiment.push(instructions_block);
if (Math.random() < .5) {
  dietary_decision_experiment.push(start_health_block);
  for (var i = 0; i < stims.length; i++) {
    dietary_decision_experiment.push(health_block);
  }
  dietary_decision_experiment.push(start_taste_block);
  for (var i = 0; i < stims.length; i++) {
    dietary_decision_experiment.push(taste_block);
  }
} else {
  dietary_decision_experiment.push(start_taste_block);
  for (var i = 0; i < stims.length; i++) {
    dietary_decision_experiment.push(taste_block);
  }
  dietary_decision_experiment.push(start_health_block);
  for (var i = 0; i < stims.length; i++) {
    dietary_decision_experiment.push(health_block);
  }
}
dietary_decision_experiment.push(setup_block);
dietary_decision_experiment.push(start_decision_block);
for (var i = 0; i < stims.length-1; i++) {
  dietary_decision_experiment.push(decision_block);
}
dietary_decision_experiment.push(end_block);
