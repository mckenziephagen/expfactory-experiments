/* ************************************ */
/* Define helper functions */
/* ************************************ */
function addID() {
  jsPsych.data.addDataToLastTrial({exp_id: 'stop_signal_with_cued_task_switching'})
}

function evalAttentionChecks() {
  var check_percent = 1
  if (run_attention_checks) {
    var attention_check_trials = jsPsych.data.getTrialsOfType('attention-check')
    var checks_passed = 0
    for (var i = 0; i < attention_check_trials.length; i++) {
      if (attention_check_trials[i].correct === true) {
        checks_passed += 1
      }
    }
    check_percent = checks_passed / attention_check_trials.length
  }
  jsPsych.data.addDataToLastTrial({"att_check_percent": check_percent})
  return check_percent
}

function assessPerformance() {
	/* Function to calculate the "credit_var", which is a boolean used to
	credit individual experiments in expfactory. 
	 */
	var experiment_data = jsPsych.data.getTrialsOfType('stop-signal')
	var missed_count = 0
	var trial_count = 0
	var rt_array = []
	var rt = 0
	var correct = 0
	var all_trials = 0

		//record choices participants made
	var choice_counts = {}
	choice_counts[-1] = 0
	choice_counts[77] = 0
	choice_counts[90] = 0
  
	for (var i = 0; i < experiment_data.length; i++) {
		if (experiment_data[i].trial_id == 'test_trial') {
			all_trials += 1
			key = experiment_data[i].key_press
			choice_counts[key] += 1
			if (experiment_data[i].stop_signal_condition == 'go'){
				trial_count += 1
			}
			
			if ((experiment_data[i].stop_signal_condition == 'go') && (experiment_data[i].rt != -1)){
				rt = experiment_data[i].rt
				rt_array.push(rt)
				if (experiment_data[i].key_press == experiment_data[i].correct_response){
					correct += 1
				}
			} else if ((experiment_data[i].stop_signal_condition == 'stop') && (experiment_data[i].rt != -1)){
				rt = experiment_data[i].rt
				rt_array.push(rt)
			} else if ((experiment_data[i].stop_signal_condition == 'go') && (experiment_data[i].rt == -1)){
				missed_count += 1
			}
		}
	}
	
		
	//calculate average rt
  var avg_rt = -1
  if (rt_array.length !== 0) {
    avg_rt = math.median(rt_array)
  } 
		//calculate whether response distribution is okay
	var responses_ok = true
	Object.keys(choice_counts).forEach(function(key, index) {
		if (choice_counts[key] > all_trials * 0.85) {
			responses_ok = false
		}
	})
	var accuracy = correct / trial_count
	var missed_percent = missed_count/trial_count
	credit_var = (missed_percent < 0.25 && avg_rt > 200 && responses_ok && accuracy > 0.60)
	jsPsych.data.addDataToLastTrial({final_credit_var: credit_var,
									 final_missed_percent: missed_percent,
									 final_avg_rt: avg_rt,
									 final_responses_ok: responses_ok,
									 final_accuracy: accuracy})
}

var randomDraw = function(lst) {
  var index = Math.floor(Math.random() * (lst.length))
  return lst[index]
}

var getInstructFeedback = function() {
  return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text +
    '</p></div>'
}


var getCategorizeFeedback = function(){
	curr_trial = jsPsych.progress().current_trial_global - 1
	trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id
	if ((trial_id == 'practice_trial') && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition != 'stop')){
		if (jsPsych.data.getDataByTrialIndex(curr_trial).key_press == jsPsych.data.getDataByTrialIndex(curr_trial).correct_response){
			
			
			return '<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>' 
		} else if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press != jsPsych.data.getDataByTrialIndex(curr_trial).correct_response) && (jsPsych.data.getDataByTrialIndex(curr_trial).key_press != -1)){
			
			
			return '<div class = fb_box><div class = center-text><font size = 20>Incorrect</font></div></div>' 
	
		} else if (jsPsych.data.getDataByTrialIndex(curr_trial).key_press == -1){
			
			
			return '<div class = fb_box><div class = center-text><font size = 20>Respond Faster!</font></div></div>'
	
		}
	} else if ((trial_id == 'practice_trial') && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition == 'stop')){
		if (jsPsych.data.getDataByTrialIndex(curr_trial).rt == -1){
			return '<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>' 
		} else if (jsPsych.data.getDataByTrialIndex(curr_trial).rt != -1){
			return '<div class = fb_box><div class = center-text><font size = 20>There was a star.</font></div></div>'
		}
	}
}

// Task Specific Functions
var getKeys = function(obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }
  return keys
}

var genStims = function(n) {
  stims = []
  for (var i = 0; i < n; i++) {
    var number = randomDraw('12346789')
    var color = 'white'
    var stim = {
      number: parseInt(number),
      color: color
    }
    stims.push(stim)
  }
  return stims
}

//Sets the cue-target-interval for the cue block
var setCTI = function() {
  return CTI //randomDraw([100, 900])
}

var getCTI = function() {
  return CTI
}

var getFeedback = function() {
	return '<div class = bigbox><div class = picture_box><p class = block-text><font color="white">' + feedback_text + '</font></p></div></div>'
}

/* Index into task_switches using the global var current_trial. Using the task_switch and cue_switch
change the task. If "stay", keep the same task but change the cue based on "cue switch". 
If "switch new", switch to the task that wasn't the current or last task, choosing a random cue. 
If "switch old", switch to the last task and randomly choose a cue.
*/
var setStims = function() {
  var tmp;
  switch (task_switches[current_trial].task_switch){
  	case "na":
      tmp = curr_task
      curr_task = randomDraw(getKeys(tasks))
      cue_i = randomDraw([0, 1])
      break
    case "stay":
      if (curr_task == "na") {
        tmp = curr_task
        curr_task = randomDraw(getKeys(tasks))
      }
      if (task_switches[current_trial].cue_switch == "switch") {
        cue_i = 1 - cue_i
      }
      break
    case "switch":
      task_switches[current_trial].cue_switch = "switch"
      cue_i = randomDraw([0, 1])
      if (last_task == "na") {
        tmp = curr_task
        curr_task = randomDraw(getKeys(tasks).filter(function(x) {
          return (x != curr_task)
        }))
        last_task = tmp
      } else {
        tmp = curr_task
        curr_task = getKeys(tasks).filter(function(x) {
          return (x != curr_task)
        })[0]
        last_task = tmp
      }
      break
    case "switch_old":
      cue_i = randomDraw([0, 1])
      task_switches[current_trial].cue_switch = "switch"
      if (last_task == "na") {
        tmp = curr_task
        curr_task = randomDraw(getKeys(tasks).filter(function(x) {
          return (x != curr_task)
        }))
        last_task = tmp
      } else {
        tmp = curr_task
        curr_task = last_task
        last_task = tmp
      }
      break

  }
  curr_cue = tasks[curr_task].cues[cue_i]
  curr_stim = stims[current_trial]
  stop_signal_condition = task_switches[current_trial].stop_type
  current_trial = current_trial + 1
  CTI = setCTI()
}

var getCue = function() {
  var cue_html = '<div class = upperbox><div class = center-text>' + curr_cue + '</div></div>'+
  				 '<div class = lowerbox><div class = fixation>+</div></div>'
  return cue_html
}

var getStim = function() {
	var stim_html = '<div class = upperbox><div class = center-text>' + curr_cue + '</div></div>'+
				    '<div class = lowerbox><div class = gng_number><div class = cue-text>'+ preFileType + curr_stim.number + fileTypePNG + '</div></div></div>'
	return stim_html
}

var getSSType = function(){
	return stop_signal_condition
}

var getStopStim = function(){
	return stop_boards[0] + 
		   	preFileTypeStar + 'stop' + fileTypePNG + 
		   stop_boards[1] 
}

function getSSD(){
	var trial_num = current_trial - 1 //current_trial has already been updated with setStims, so subtract one to record data
    var task_switch = task_switches[trial_num]
	if (task_switch.task_switch == 'switch'){
		return SSD_switch
	} else if (task_switch.task_switch == 'stay'){
		return SSD_stay
	}
}

//Returns the key corresponding to the correct response for the current
// task and stim
var getResponse = function() {
  switch (curr_task) {
    case 'color':
      if (curr_stim.color == 'orange') {
      	correct_response = response_keys.key[0]
      	if(stop_signal_condition == "stop"){
			correct_response = -1
		}
        return correct_response
      } else {
      	correct_response = response_keys.key[1]
      	if(stop_signal_condition == "stop"){
			correct_response = -1
		}
        return correct_response
      }
      break;
    case 'magnitude':
      if (curr_stim.number > 5) {
      	correct_response = response_keys.key[0]
      	if(stop_signal_condition == "stop"){
			correct_response = -1
		}
        return correct_response
      } else {
      	correct_response = response_keys.key[1]
      	if(stop_signal_condition == "stop"){
			correct_response = -1
		}
        return correct_response
      }
      break;
    case 'parity':
      if (curr_stim.number % 2 === 0) {
      	correct_response = response_keys.key[0]
      	if(stop_signal_condition == "stop"){
			correct_response = -1
		}
        return correct_response
      } else {
      	correct_response = response_keys.key[1]
      	if(stop_signal_condition == "stop"){
			correct_response = -1
		}
        return correct_response
      }
  }
}


/* Append gap and current trial to data and then recalculate for next trial*/
var appendData = function() {
  var curr_trial = jsPsych.progress().current_trial_global
  var trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id
  var trial_num = current_trial - 1 //current_trial has already been updated with setStims, so subtract one to record data
  var task_switch = task_switches[trial_num]
  if (trial_id == "practice_trial"){
		currBlock = practiceCount
  } else if (trial_id == "test_trial"){
		currBlock = testCount
  }
  jsPsych.data.addDataToLastTrial({
    cue: curr_cue,
    stim_color: curr_stim.color,
    stim_number: curr_stim.number,
    task: curr_task,
    task_condition: task_switch.task_switch,
    cue_condition: task_switch.cue_switch,
    stop_signal_condition: stop_signal_condition,
    current_trial: current_trial,
    current_block: currBlock,
    CTI: CTI,
    SSD_stay: SSD_stay,
    SSD_switch: SSD_switch
  })
  
	if ((trial_id == 'test_trial') || (trial_id == 'practice_trial')){
		jsPsych.data.addDataToLastTrial({correct_response: correct_response})
		if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press == -1) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition == 'stop') && (SSD_stay < maxSSD) && (jsPsych.data.getDataByTrialIndex(curr_trial).task_condition == 'stay')){
			jsPsych.data.addDataToLastTrial({stop_acc: 1})
			SSD_stay+=50
		} else if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press != -1) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition == 'stop') && (SSD_stay > minSSD) && (jsPsych.data.getDataByTrialIndex(curr_trial).task_condition == 'stay')){
			jsPsych.data.addDataToLastTrial({stop_acc: 0})
			SSD_stay-=50
		}
		
		if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press == -1) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition == 'stop') && (SSD_switch < maxSSD) && (jsPsych.data.getDataByTrialIndex(curr_trial).task_condition == 'switch')){
			jsPsych.data.addDataToLastTrial({stop_acc: 1})
			SSD_switch+=50
		} else if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press != -1) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition == 'stop') && (SSD_switch > minSSD) && (jsPsych.data.getDataByTrialIndex(curr_trial).task_condition == 'switch')){
			jsPsych.data.addDataToLastTrial({stop_acc: 0})
			SSD_switch-=50
		}
		
		if (jsPsych.data.getDataByTrialIndex(curr_trial).key_press == correct_response){
			jsPsych.data.addDataToLastTrial({
				correct_trial: 1,
			})
	
		} else if (jsPsych.data.getDataByTrialIndex(curr_trial).key_press != correct_response){
			jsPsych.data.addDataToLastTrial({
				correct_trial: 0,
			})
		}
		
	}   
}

/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var run_attention_checks = true
var attention_check_thresh = 0.45
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds
var credit_var = 0

var fileTypePNG = '.png"></img>'
var preFileType = '<img class = center src="/static/experiments/stop_signal_with_cued_task_switching/images/'
var preFileTypeStar = '<img class = star src="/static/experiments/stop_signal_with_cued_task_switching/images/'

var stop_boards = ['<div class = bigbox><div class = centerbox><div class = starbox>','</div></div></div>']	 

var accuracy_thresh = 0.75
var rt_thresh = 1000
var missed_thresh = 0.10

var maxStopCorrect = 0.70
var minStopCorrect = 0.30

var maxStopCorrectPractice = 1
var minStopCorrectPractice = 0

var practice_thresh = 3 // 3 blocks of 12 
var CTI = 150

// task specific variables
var response_keys = {key: [77,90], key_name: ["M","Z"]}
var choices = response_keys.key
var practice_length = 24
var exp_len = 240
var numTrialsPerBlock = 48 //48 must be divisible by 12
var numTestBlocks = exp_len / numTrialsPerBlock

var SSD_stay = 350
var SSD_switch = 350
var maxSSD = 1000
var minSSD = 0 

//set up block stim. correct_responses indexed by [block][stim][type]
var tasks = {
  parity: {
    task: 'parity',
    cues: ['Parity', 'Odd-Even']
  },
  magnitude: {
    task: 'magnitude',
    cues: ['Magnitude', 'High-Low']
  }
}
/*
color: {
    task: 'color',
    cues: ['Color', 'Orange-Blue']
  },
*/

var task_switch_types = ["stay", "switch"]
var cue_switch_types = ["stay", "switch"]
var stop_types = ["go","go","stop"]
var task_switches_arr = []
for (var t = 0; t < task_switch_types.length; t++) {
  for (var c = 0; c < cue_switch_types.length; c++) {
  	for (var s = 0; s < stop_types.length; s++){
  	
		task_switches_arr.push({
		  task_switch: task_switch_types[t],
		  cue_switch: cue_switch_types[c],
		  stop_type: stop_types[s]
		})
	}
  }
}
var task_switches = jsPsych.randomization.repeat(task_switches_arr, practice_length / 12)
task_switches.unshift({task_switch: 'na', cue_switch: 'na', stop_type: jsPsych.randomization.repeat(["go","go","stop"],1).pop()})
var practiceStims = genStims(practice_length + 1)
var testStims = genStims(numTrialsPerBlock + 1)
var stims = practiceStims
var curr_task = randomDraw(getKeys(tasks))
var last_task = 'na' //object that holds the last task, set by setStims()
var curr_cue = 'na' //object that holds the current cue, set by setStims()
var cue_i = randomDraw([0, 1]) //index for one of two cues of the current task
var curr_stim = 'na' //object that holds the current stim, set by setStims()
var current_trial = 0
var currBlock = 0
var exp_stage = 'practice' // defines the exp_stage, switched by start_test_block

var task_list = '<ul style = "font-size: 23px">'+
					   	'<li><i>Odd-Even</i> or <i>Parity</i>: ' + response_keys.key_name[1] + ' if odd and ' + response_keys.key_name[0] + ' if even.</li>'+
					   	'<li><i>High-Low</i> or <i>Magnitude</i>: ' + response_keys.key_name[1] + ' if <5 and ' + response_keys.key_name[0] + ' if >5.</li>'+
					   '</ul>'

var prompt_task_list = '<ul style = "text-align:left; font-size: 23px">'+
					   	'<li><i>Odd-Even</i> or <i>Parity</i>: ' + response_keys.key_name[1] + ' if odd and ' + response_keys.key_name[0] + ' if even.</li>'+
					   	'<li><i>High-Low</i> or <i>Magnitude</i>: ' + response_keys.key_name[1] + ' if <5 and ' + response_keys.key_name[0] + ' if >5.</li>'+
					   	'<li>Do not respond if there is a star!</li>'+
					   '</ul>'

//PRE LOAD IMAGES HERE
var pathSource = "/static/experiments/stop_signal_with_cued_task_switching/images/"
var numbersPreload = ['1','2','3','4','6','7','8','9']
var images = []
for(i=0;i<numbersPreload.length;i++){
	images.push(pathSource + numbersPreload[i] + '.png')
}

images.push(pathSource + 'stop.png')
jsPsych.pluginAPI.preloadImages(images);
/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */
// Set up attention check node
var attention_check_block = {
  type: 'attention-check',
  data: {
    trial_id: "attention_check"
  },
  timing_response: 180000,
  response_ends_trial: true,
  timing_post_trial: 200
}

var attention_node = {
  timeline: [attention_check_block],
  conditional_function: function() {
    return run_attention_checks
  }
}

//Set up post task questionnaire
var post_task_block = {
   type: 'survey-text',
   data: {
       exp_id: "stop_signal_with_cued_task_switching",
       trial_id: "post task questions"
   },
   questions: ['<p class = center-block-text style = "font-size: 20px">Please summarize what you were asked to do in this task.</p>',
              '<p class = center-block-text style = "font-size: 20px">Do you have any comments about this task?</p>'],
   rows: [15, 15],
   timing_response: 360000,
   columns: [60,60]
};

/* define static blocks */
var feedback_instruct_text =
  'Welcome to the experiment. This experiment will take around 15 minutes. Press <i>enter</i> to begin.'
var feedback_instruct_block = {
  type: 'poldrack-text',
  data: {
    trial_id: "instruction"
  },
  cont_key: [13],
  text: getInstructFeedback,
  timing_post_trial: 0,
  timing_response: 180000
};
/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instructions_block = {
  type: 'poldrack-instructions',
  data: {
    trial_id: "instruction"
  },
  pages: [
    '<div class = centerbox>'+
    	'<p class = block-text>In this experiment you will have to respond to a sequence of numbers by pressing the "M" and "Z" keys. How you respond to the numbers will depend on the current task, which can change every trial.</p><p class = block-text>On some trials you will have to indicate whether the number is odd or even, and on other trials you will indicate whether the number is higher or lower than 5. Each trial will start with a cue telling you which task to do on that trial.</p>'+
    '</div>',
    
    '<div class = centerbox>'+
    	'<p class = block-text>The cue before the number will be a word indicating the task. There will be four different cues indicating two different tasks. The cues and tasks are described below:</p>' +
    	task_list +
    '</div>',
    
    '<div class = centerbox>' + 
  		'<p class = block-text>On some trials, a star will appear around the number.  The star will appear with, or shortly after the number appears.</p>'+
  		
  		'<p class = block-text>If you see a star appear, please try your best to make no response on that trial.</p>'+
  	
  		'<p class = block-text>If the star appears on a trial, and you try your best to withhold your response, you will find that you will be able to stop sometimes but not always.</p>'+

      '<p class = block-text>Please do not slow down your responses in order to wait for the star.  Continue to respond as quickly and accurately as possible.</p>'+
		'</div>',
    
    '<div class = centerbox>' + 					
  		'<p class = block-text>We will start practice when you finish instructions. Please make sure you understand the instructions before moving on. You will be given a reminder of the rules for practice. <i>This will be removed for test!</i></p>'+

      '<p class = block-text>To avoid technical issues, please keep the experiment tab (on Chrome or Firefox) <i>active and in full-screen mode</i> for the whole duration of each task.</p>'+
	'</div>'
  ],
  allow_keys: false,
  show_clickable_nav: true,
  timing_post_trial: 1000
};

var instruction_node = {
  timeline: [feedback_instruct_block, instructions_block],
  /* This function defines stopping criteria */
  loop_function: function(data) {
    for (i = 0; i < data.length; i++) {
      if ((data[i].trial_type == 'poldrack-instructions') && (data[i].rt != -1)) {
        rt = data[i].rt
        sumInstructTime = sumInstructTime + rt
      }
    }
    if (sumInstructTime <= instructTimeThresh * 1000) {
      feedback_instruct_text =
        'Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <i>enter</i> to continue.'
      return true
    } else if (sumInstructTime > instructTimeThresh * 1000) {
      feedback_instruct_text =
        'Done with instructions. Press <i>enter</i> to continue.'
      return false
    }
  }
}
var end_block = {
  type: 'poldrack-text',
  data: {
    trial_id: "end",
  },
  text: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <i>enter</i> to continue.</p></div>',
  cont_key: [13],
  timing_response: 180000,
  on_finish: function(){
  	assessPerformance()
  	evalAttentionChecks()
  }
};

var start_practice_block = {
  type: 'poldrack-text',
  timing_response: 180000,
  data: {
    trial_id: "practice_intro"
  },
  text: '<div class = centerbox><p class = center-block-text>Starting with some practice. </p><p class = center-block-text>Press <i>enter</i> to continue.</p></div>',
  cont_key: [13]
};


var start_test_block = {
  type: 'poldrack-text',
  timing_response: 180000,
  data: {
    trial_id: "test_intro"
  },
  text: '<div class = centerbox>'+
  			'<p class = block-text>Practice completed. Starting test.</p>'+
  			'<p class = block-text>The cue before the number will be a word indicating the task. There will be four different cues indicating 2 different tasks. The cues and tasks are described below:</p>' +
    		task_list +
    		'<p class = block-text>Do not make a response if a star appears.</p>'+
  			'<p class = block-text>Press <i>enter</i> to begin.</p>'+
  		'</div>',
  on_finish: function() {
    current_trial = 0
    stims = testStims
    task_switches = jsPsych.randomization.repeat(task_switches_arr, numTrialsPerBlock / 12)
    task_switches.unshift({task_switch: 'na', cue_switch: 'na', stop_type: jsPsych.randomization.repeat(["go","go","stop"],1).pop()})
    feedback_text = 'Starting a test block.'
  },
  timing_post_trial: 1000
}

/* define practice and test blocks */
var setStims_block = {
  type: 'call-function',
  data: {
    trial_id: "set_stims"
  },
  func: setStims,
  timing_post_trial: 0
}

var fixation_block = {
  type: 'poldrack-single-stim',
  stimulus: '<div class = upperbox><div class = fixation>+</div></div><div class = lowerbox><div class = fixation>+</div></div>',
  is_html: true,
  choices: 'none',
  data: {
    trial_id: "fixation"
  },
  timing_post_trial: 0,
  timing_stim: 500,
  timing_response: 500,
  prompt: '<div class = promptbox>' + prompt_task_list + '</div>',
  on_finish: function() {
    jsPsych.data.addDataToLastTrial({
      exp_stage: exp_stage
    })
  }
}

var cue_block = {
  type: 'poldrack-single-stim',
  stimulus: getCue,
  is_html: true,
  choices: 'none',
  data: {
    trial_id: 'cue'
  },
  timing_response: getCTI,
  timing_stim: getCTI,
  timing_post_trial: 0,
  prompt: '<div class = promptbox>' + prompt_task_list + '</div>',
  on_finish: function() {
    jsPsych.data.addDataToLastTrial({exp_stage: exp_stage})
    appendData()
  }
};


var feedback_text = 
'Welcome to the experiment. This experiment will take around 15 minutes. Press <i>enter</i> to begin.'
var feedback_block = {
	type: 'poldrack-single-stim',
	data: {
		trial_id: "practice-stop-feedback"
	},
	choices: [13],
	stimulus: getFeedback,
	timing_post_trial: 0,
	is_html: true,
	timing_response: 180000,
	response_ends_trial: true, 

};

var practice_block = {
	type: 'stop-signal',
	stimulus: getStim,
	SS_stimulus: getStopStim,
	SS_trial_type: getSSType, 
	data: {
		"trial_id": "practice_trial"
	},
	is_html: true,
	choices: choices,
	timing_stim: 1000, //1000
	timing_response: 2000, //2000
	response_ends_trial: false,
	SSD: getSSD,
	timing_SS: 500, //500
	timing_post_trial: 0,
	prompt: '<div class = promptbox>' + prompt_task_list + '</div>',
	on_finish: function(){
				getResponse()
				appendData()
	}
};

var categorize_block = {
	type: 'poldrack-single-stim',
	data: {
		trial_id: "practice-stop-feedback"
	},
	choices: 'none',
	stimulus: getCategorizeFeedback,
	timing_post_trial: 0,
	is_html: true,
	timing_stim: 500, //500
 	prompt: '<div class = promptbox>' + prompt_task_list + '</div>',
	timing_response: 500, //500
	response_ends_trial: false, 
};

var test_block = {
  type: 'stop-signal',
  stimulus: getStim,
  SS_stimulus: getStopStim,
  SS_trial_type: getSSType, 
  is_html: true,
  choices: choices,
  data: {
    trial_id: 'test_trial',
    exp_stage: 'test'
  },
  SSD: getSSD,
  timing_SS: 500, //500
  timing_post_trial: 0,
  timing_response: 2000, //2000
  timing_stim: 1000, //1000
  on_finish: function(data) {
    appendData()
    correct_response = getResponse()
    correct = false
    if (data.key_press === correct_response) {
      correct = true
    }
    jsPsych.data.addDataToLastTrial({
      'correct_response': correct_response,
      'correct': correct
    })
  }
}


var practiceTrials = []
practiceTrials.push(feedback_block)
practiceTrials.push(instructions_block)
for (var i = 0; i < practice_length + 1; i++) {
  var practice_fixation_block = {
	  type: 'poldrack-single-stim',
	  stimulus: '<div class = upperbox><div class = fixation>+</div></div><div class = lowerbox><div class = fixation>+</div></div>',
	  is_html: true,
	  choices: 'none',
	  data: {
		trial_id: "fixation"
	  },
	  timing_post_trial: 0,
	  timing_stim: 500, //500
	  timing_response: 500, //500
	  prompt: '<div class = promptbox>' + prompt_task_list + '</div>',
	  on_finish: function() {
		jsPsych.data.addDataToLastTrial({
		  exp_stage: exp_stage
		})
	  }
	}

	var practice_cue_block = {
	  type: 'poldrack-single-stim',
	  stimulus: getCue,
	  is_html: true,
	  choices: 'none',
	  data: {
		trial_id: 'cue'
	  },
	  timing_response: getCTI, //getCTI
	  timing_stim: getCTI, //getCTI
	  timing_post_trial: 0,
	  prompt: '<div class = promptbox>' + prompt_task_list + '</div>',
	  on_finish: function() {
		jsPsych.data.addDataToLastTrial({exp_stage: exp_stage})
		appendData()
	  }
	};
	
  practiceTrials.push(setStims_block)
  practiceTrials.push(practice_fixation_block)
  practiceTrials.push(practice_cue_block); //magnitide/high-low or parity/odd-even
  practiceTrials.push(practice_block); //where the number stim for that trial appears (and getStopStim)
  practiceTrials.push(categorize_block);
}

var practiceCount = 0
var practiceNode = {
	timeline: practiceTrials,
	loop_function: function(data) {
		practiceCount += 1
		task_switches = jsPsych.randomization.repeat(task_switches_arr, practice_length / 12)
		task_switches.unshift({task_switch: 'na', cue_switch: 'na', stop_type: jsPsych.randomization.repeat(["go","go","stop"],1).pop()})
		practiceStims = genStims(practice_length + 1)
		current_trial = 0
	
		var total_trials = 0
		var sum_responses = 0
		var total_sum_rt = 0
		
		var go_trials = 0
		var go_correct = 0
		var go_rt = 0
		var sum_go_responses = 0
		
		var stop_trials = 0
		var stop_correct = 0
		var stop_rt = 0
		var sum_stop_responses = 0
		
	
		for (var i = 0; i < data.length; i++){
			if (data[i].trial_id == "practice_trial"){
				total_trials+=1
				if (data[i].stop_signal_condition == 'go'){
					go_trials+=1
					if (data[i].rt != -1){
						total_sum_rt += data[i].rt
						go_rt += data[i].rt
						sum_go_responses += 1
						if (data[i].key_press == data[i].correct_response){
							go_correct += 1
		
						}
					}
		
				} else if (data[i].stop_signal_condition == 'stop'){
					stop_trials+=1
					if (data[i].rt != -1){
						total_sum_rt += data[i].rt
						stop_rt += data[i].rt
						sum_stop_responses += 1
					}
					if (data[i].rt == -1){
						stop_correct += 1
	
					}
				}
			}
		}
	
		var accuracy = go_correct / go_trials
		var missed_responses = (go_trials - sum_go_responses) / go_trials
		var ave_rt = go_rt / sum_go_responses
		var stop_acc = stop_correct / stop_trials
		
		console.log('stop_acc = ' + stop_acc)
		console.log('stop_correct = ' + stop_correct)
		console.log('stop_trials = ' + stop_trials)
			
		feedback_text = "<br>Please take this time to read your feedback and to take a short break! Press enter to continue"

		if ((accuracy > accuracy_thresh) && (stop_acc < maxStopCorrectPractice) && (stop_acc > minStopCorrectPractice)){
			feedback_text +=
					'</p><p class = block-text>Done with this practice. Press Enter to continue.' 
			testStims = genStims(numTrialsPerBlock + 1)
			task_switches = jsPsych.randomization.repeat(task_switches_arr, numTrialsPerBlock / 12)
			task_switches.unshift({task_switch: 'na', cue_switch: 'na', stop_type: jsPsych.randomization.repeat(["go","go","stop"],1).pop()})
			return false
	
		} else {
			if (accuracy < accuracy_thresh){
			feedback_text +=
					'</p><p class = block-text>We are going to try practice again to see if you can achieve higher accuracy.  Remember: <br>' + prompt_task_list 
			}
			if (missed_responses > missed_thresh){
				feedback_text +=
						'</p><p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.'
			}

      if (ave_rt > rt_thresh) {
        feedback_text += 
            '</p><p class = block-text>You have been responding too slowly.'
      }
			
			if (stop_acc === maxStopCorrectPractice){
				feedback_text +=
				'</p><p class = block-text>You have been responding too slowly.  Please respond as quickly and accurately to each stimulus that requires a response.'
			
			}
			
			if (stop_acc === minStopCorrectPractice){
				feedback_text +=
				'</p><p class = block-text>You have not been stopping your response when stars are present.  Please try your best to stop your response if you see a star.'
			
			}
		
			if (practiceCount == practice_thresh){
				feedback_text +=
					'</p><p class = block-text>Done with this practice.' 
					testStims = genStims(numTrialsPerBlock + 1)
					task_switches = jsPsych.randomization.repeat(task_switches_arr, numTrialsPerBlock / 12)
					task_switches.unshift({task_switch: 'na', cue_switch: 'na', stop_type: jsPsych.randomization.repeat(["go","go","stop"],1).pop()})
					return false
			}
			
			feedback_text +=
				'</p><p class = block-text>Redoing this practice. Press Enter to continue.' 
			
			return true
		
		}
		
	}
}

var testTrials = []
testTrials.push(feedback_block)
testTrials.push(attention_node)
for (var i = 0; i < numTrialsPerBlock + 1; i++) {
  var fixation_block = {
	  type: 'poldrack-single-stim',
	  stimulus: '<div class = upperbox><div class = fixation>+</div></div><div class = lowerbox><div class = fixation>+</div></div>',
	  is_html: true,
	  choices: 'none',
	  data: {
		trial_id: "fixation"
	  },
	  timing_post_trial: 0,
	  timing_stim: 500, //500
	  timing_response: 500, //500
	  on_finish: function() {
		  jsPsych.data.addDataToLastTrial({
			  exp_stage: exp_stage
		  })
	  }
  }

  var cue_block = {
	  type: 'poldrack-single-stim',
	  stimulus: getCue,
	  is_html: true,
	  choices: 'none',
	  data: {
		trial_id: 'cue'
	  },
	  timing_response: getCTI, //getCTI
	  timing_stim: getCTI, //getCTI
	  timing_post_trial: 0,
	  on_finish: function() {
		jsPsych.data.addDataToLastTrial({exp_stage: exp_stage})
		appendData()
	  }
	};
	
  testTrials.push(setStims_block)
  testTrials.push(fixation_block)
  testTrials.push(cue_block); //1 of the 4 cues
  testTrials.push(test_block); //a number (1-9) (and getStopStim)
}

var testCount = 0
var testNode = {
	timeline: testTrials,
	loop_function: function(data) {
		testCount += 1
		task_switches = jsPsych.randomization.repeat(task_switches_arr, numTrialsPerBlock / 12)
		task_switches.unshift({task_switch: 'na', cue_switch: 'na', stop_type: jsPsych.randomization.repeat(["go","go","stop"],1).pop()})
		testStims = genStims(numTrialsPerBlock + 1)
		current_trial = 0
	
		var total_trials = 0
		var sum_responses = 0
		var total_sum_rt = 0
		
		var go_trials = 0
		var go_correct = 0
		var go_rt = 0
		var sum_go_responses = 0
		
		var stop_trials = 0
		var stop_correct = 0
		var stop_rt = 0
		var sum_stop_responses = 0
		
	
		for (var i = 0; i < data.length; i++){
			if (data[i].trial_id == "test_trial"){
				total_trials+=1
				if (data[i].stop_signal_condition == 'go'){
					go_trials+=1
					if (data[i].rt != -1){
						total_sum_rt += data[i].rt
						go_rt += data[i].rt
						sum_go_responses += 1
						if (data[i].key_press == data[i].correct_response){
							go_correct += 1
		
						}
					}
		
				} else if (data[i].stop_signal_condition == 'stop'){
					stop_trials+=1
					if (data[i].rt != -1){
						total_sum_rt += data[i].rt
						stop_rt += data[i].rt
						sum_stop_responses += 1
					}
					if (data[i].rt == -1){
						stop_correct += 1
	
					}
				}
			}
		}
	
		var accuracy = go_correct / go_trials
		var missed_responses = (go_trials - sum_go_responses) / go_trials
		var ave_rt = go_rt / sum_go_responses
		var stop_acc = stop_correct / stop_trials
	
		feedback_text = "<br>Please take this time to read your feedback and to take a short break! Press enter to continue"
		feedback_text += "</p><p class = block-text>You have completed: "+testCount+" out of "+numTestBlocks+" blocks of trials."
		
		if (accuracy < accuracy_thresh){
			feedback_text +=
					'</p><p class = block-text>Your accuracy is too low.  Remember: <br>' + prompt_task_list 
		}
		if (missed_responses > missed_thresh){
			feedback_text +=
					'</p><p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.'
		}

    if (ave_rt > rt_thresh) {
      feedback_text += 
          '</p><p class = block-text>You have been responding too slowly.'
    }
		
		if (stop_acc > maxStopCorrect){
			feedback_text +=
			'</p><p class = block-text>You have been responding too slowly.  Please respond as quickly and accurately to each stimulus that requires a response.'
		}
		
		if (stop_acc < minStopCorrect){
			feedback_text +=
			'</p><p class = block-text>You have not been stopping your response when stars are present.  Please try your best to stop your response if you see a star.'
		}
	
		if (testCount == numTestBlocks){
			feedback_text +=
					'</p><p class = block-text>Done with this test. Press Enter to continue.<br> If you have been completing tasks continuously for an hour or more, please take a 15-minute break before starting again.'
			return false
		} else {
			return true
		}
	}
}

/* create experiment definition array */
var stop_signal_with_cued_task_switching_experiment = [];

stop_signal_with_cued_task_switching_experiment.push(practiceNode);
stop_signal_with_cued_task_switching_experiment.push(feedback_block);

stop_signal_with_cued_task_switching_experiment.push(start_test_block)
stop_signal_with_cued_task_switching_experiment.push(testNode);
stop_signal_with_cued_task_switching_experiment.push(feedback_block);

stop_signal_with_cued_task_switching_experiment.push(post_task_block)
stop_signal_with_cued_task_switching_experiment.push(end_block)
