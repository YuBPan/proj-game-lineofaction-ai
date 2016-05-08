// black  1
// white -1

// @action [1,1,2,2]	// 1,1 move to 2,2


info_id = 0;
counter_id = 0;
board_size = 5;
var matrix;
winner = "";
is_start = false;
is_over = false;

// setting info
black_player_who = "";		// "Human", "AI"
black_player_cutoff_depth = 0;	// "1", "2", "3"
white_player_who = "";
white_player_cutoff_depth = 0;

// statistics info for ai
maxdepth = 0;
totalnodes = 1;
maxeval = 0;
mineval = 0;
maxprun = 0;
minprun = 0;



$(document).ready(function() {
	initial_game();
});

function timerfunc(timecurrent) {
	var time = timecurrent - timebegin;
	percentage = time / 10000 * 100;
	$("#timernum").html((time / 1000).toFixed(2) + "s / 10.00s");
	$('#timerbar').css("padding-left", percentage + "%");
}

function initial_game() {
	timebegin = (new Date()).getTime();
	timerfunc(timebegin);	

	info_id = 0;
	counter_id = 0;

	winner = "";
	is_start = false;
	is_over = false;		
	black_player_who = "";
	black_player_cutoff_depth = 0;
	white_player_who = "";
	white_player_cutoff_depth = 0;
	
	$(".emoji").attr("src", "")

	initial_boardsize5();

	initial_statix_info();

	if ($(".humanbtn1").hasClass("is-checked")) {
		$(".difficultylevel1").css("opacity", 0.1);
	}
	if ($(".humanbtn2").hasClass("is-checked")) {
		$(".difficultylevel2").css("opacity", 0.1);
	}	
	$(".settings input").prop("disabled" ,false);
	$(".settings label").removeClass("is-disabled");	


	if ($("#start").prop("disabled") == true) {
		$("#start").prop("disabled", false);
	}
	$(".navinfo").html("");
	display_monitor_info("Initialized");
}

$(".humanbtn").click(function(){
	if (!is_start) {
		$(this).closest(".row").find(".difficultylevel").css("opacity", 0.1);
	}
});

$(".aibtn").click(function(){
	if (!is_start) {
		$(this).closest(".row").find(".difficultylevel").css("opacity", 1);
	}
});

$(".boardsize5").click(function() {
	if (!is_start) {
		initial_boardsize5();
	}
});
function initial_boardsize5() {
	$(".r5").css("opacity", "0");
	$(".c5").css("opacity", "0");
	board_size = 5;
	initial_matrix();
	initial_board_attr_rc();
	update_board();
	display_matrix();
	$(".boardsize5").addClass("is-checked");
	$(".boardsize6").removeClass("is-checked");
}

$(".boardsize6").click(function() {
	if (!is_start) {
		initial_boardsize6();
	}
});
function initial_boardsize6() {
	$(".r5").css("opacity", "1");
	$(".c5").css("opacity", "1");	
	board_size = 6;
	initial_matrix();
	initial_board_attr_rc();
	update_board();
	display_matrix();	
	$(".boardsize5").removeClass("is-checked");
	$(".boardsize6").addClass("is-checked");	
}

$(".helpicon").click(function(){
	$("#helpinfo").css("display", "initial");
})
$(".helpclose").click(function(){
	$("#helpinfo").css("display", "none");
})

$("#start").click(function(){
	$(".emoji").attr("src", "img/winking.png")

	set_difficulty_level($(".blackplayer").find(".difficultylevel .is-checked").attr("value"), 
						 $(".whiteplayer").find(".difficultylevel .is-checked").attr("value"));

	blackplayerinfo = "";
	black_player_who = $(".blackplayer").find(".who .is-checked").attr("value");
	if (black_player_who == "Human") {
		blackplayerinfo += $(".blackplayer").find(".who .is-checked .mdl-radio__label").text() + ", " +
						   black_player_who;
	} else {
		blackplayerinfo += $(".blackplayer").find(".who .is-checked .mdl-radio__label").text() + "(" + 
						   $(".blackplayer").find(".difficultylevel .is-checked .mdl-radio__label").text() + "), " +
						   black_player_who + ", " + black_player_cutoff_depth;
	}
	
	whiteplayerinfo = "";
	white_player_who = $(".whiteplayer").find(".who .is-checked").attr("value");
	if (white_player_who == "Human") {
		whiteplayerinfo += $(".whiteplayer").find(".who .is-checked .mdl-radio__label").text() + ", " +
						   white_player_who;
	} else {
		whiteplayerinfo += $(".whiteplayer").find(".who .is-checked .mdl-radio__label").text() + "(" + 
						   $(".whiteplayer").find(".difficultylevel .is-checked .mdl-radio__label").text() + "), " +
						   white_player_who + ", " + white_player_cutoff_depth;
	}

	display_monitor_info("&#x2b24;: " + blackplayerinfo);	
	display_monitor_info("&#x25ef;: " + whiteplayerinfo);

	$(".settings input").prop("disabled" ,true);
	$(".settings label").addClass("is-disabled");

	is_start = true;
	$(this).prop("disabled", true);

	if (black_player_who == "AI") {	
		ai_turn(1, black_player_cutoff_depth);
	}
});

$("#restart").click(function(){
	initial_game();
});


// play game
$(".grid").click(function(){
	if (is_start) {
		$(".grid").removeClass("fadeout");
		if ($(".board").hasClass("move1")) {
			// now move to green or undo move1
			$(".board").removeClass("move1");
			$move1piece = $(".blue");
			if ($(this).hasClass("green")) {
				// move to green
				perform_action([$move1piece.attr("r"), $move1piece.attr("c"), $(this).attr("r"), $(this).attr("c")]);			
			}
			$move1piece.removeClass("blue");
			$move1piece.addClass("grey");		
			$valid_pieces = $(".green");
			$valid_pieces.removeClass("green");
			$valid_pieces.addClass("grey");
		} else {
			// now move1
			if ((counter_id % 2 == 0 && $(this).find(".piece").hasClass("white")) || 
				(counter_id % 2 == 1 && $(this).find(".piece").hasClass("black")) || 
				(!$(this).find(".piece").hasClass("white") && !$(this).find(".piece").hasClass("black")) ||
				is_over) {
				// invalid click
				invalid_click($(this));
			} else {
				$(".board").addClass("move1");
				$(this).removeClass("grey");
				$(this).addClass("blue");
				display_valid_actions(return_valid_actions(matrix, matrix[$(this).attr("r")][$(this).attr("c")]), $(this).attr("r"), $(this).attr("c"));
			}
		}
	} else {
		invalid_click($(this));
	}
});



function set_difficulty_level(black_level, white_level) {
	if (black_level == "l1") {
		black_player_cutoff_depth = 1;
	} else if (black_level == "l2") {
		black_player_cutoff_depth = 5;
	} else if (black_level == "l3") {
		black_player_cutoff_depth = 9;
	}
	if (white_level == "l1") {
		white_player_cutoff_depth = 1;
	} else if (white_level == "l2") {
		white_player_cutoff_depth = 5;
	} else if (white_level == "l3") {
		white_player_cutoff_depth = 9;
	}
}

function initial_matrix() {
	matrix = new Array(board_size);
	for (r = 0; r < board_size; r++) {
		matrix[r] = new Array(board_size);
		for (c = 0; c < board_size; c++) {
			if ((r == 0 || r == board_size - 1) && (c != 0 && c != board_size - 1)) {
				matrix[r][c] = 1;
			} else if ((c == 0 || c == board_size - 1) && (r != 0 && r != board_size - 1)) {
				matrix[r][c] = -1;
			} else {
				matrix[r][c] = 0;
			}
		}
	}
}

// initial board grid with r, c value
function initial_board_attr_rc() {
	for (r = 0; r < board_size; r++) {
		for (c = 0; c < board_size; c++) {
			$grid = $("#r" + r + "c" + c);
			$grid.attr("r", r);
			$grid.attr("c", c);
		}
	}	
}

// initial statistics info
function initial_statix_info() {
	maxdepth = 0;
	totalnodes = 1;
	maxeval = 0;
	mineval = 0;
	maxprun = 0;
	minprun = 0;
	display_statix_info();
}

// update board ui according to matrix
function update_board() {
	for (r = 0; r < board_size; r++) {
		for (c = 0; c < board_size; c++) {
			$grid = $("#r" + r + "c" + c);
			if (matrix[r][c] == 1) {
				if ($grid.find(".piece").hasClass("white")) {
					$grid.find(".piece").removeClass("white");
				}
				$grid.find(".piece").addClass("black");
			} else if (matrix[r][c] == -1) {
				if ($grid.find(".piece").hasClass("black")) {
					$grid.find(".piece").removeClass("black");
				}				
				$grid.find(".piece").addClass("white");
			} else {
				if ($grid.find(".piece").hasClass("white")) {
					$grid.find(".piece").removeClass("white");
				}
				if ($grid.find(".piece").hasClass("black")) {
					$grid.find(".piece").removeClass("black");
				}				
			}
		}
	}	
}

function invalid_click(invalid_grid) {	
	$(invalid_grid).removeClass("grey");
	$(invalid_grid).addClass("red");
	setTimeout(function() {
		$(invalid_grid).addClass("fadeout");
		$(invalid_grid).removeClass("red");
		$(invalid_grid).addClass("grey");
	}, 500);
}

// return valid actions for the player
// 	[[r_move_from, c_move_from, r_move_to, c_move_to], ... ]
function return_valid_actions(state, player) {
	valid_actions = [];
	if (player == 1) {
		opponent = -1;
	} else {
		opponent = 1;
	}

	// ←→↑↓↖↘↗↙
	for (r = 0; r < board_size; r++) {
		for (c = 0; c < board_size; c++) {
			if (state[r][c] == player) {
				// ←→
				count = 0;
				for (col = 0; col < board_size; col++) {
					if (state[r][col] == 1 || state[r][col] == -1) {
						count++;
					}
				}
				right_grid = parseInt(c) - parseInt(count);
				if (right_grid >= 0) {
					is_valid = true;
					for (col = right_grid + 1; col < c; col++) {
						if (state[r][col] == opponent) {
							is_valid = false;
						}
					}
					// console.log(r + "," + c + " ←: " + is_valid);
					if (is_valid && state[r][right_grid] != player) {
						valid_actions.push(new Array(r, c, r, right_grid));
					}
				}	
				right_grid = parseInt(c) + parseInt(count);
				if (right_grid < board_size) {
					is_valid = true;
					for (col = c + 1; col < right_grid; col++) {
						if (state[r][col] == opponent) {
							is_valid = false;
						}
					}
					// console.log(r + "," + c + " →: " + is_valid);
					if (is_valid && state[r][right_grid] != player) {
						valid_actions.push(new Array(r, c, r, right_grid));
					}
				}
				// ↑↓
				count = 0;
				for (row = 0; row < board_size; row++) {
					if (state[row][c] == 1 || state[row][c] == -1) {
						count++;
					}
				}
				right_grid = parseInt(r) - parseInt(count);
				if (right_grid >= 0) {
					is_valid = true;
					for (row = right_grid + 1; row < r; row++) {
						if (state[row][c] == opponent) {
							is_valid = false;
						}
					}
					// console.log(r + "," + c + " ↑: " + is_valid);
					if (is_valid && state[right_grid][c] != player) {
						valid_actions.push(new Array(r, c, right_grid, c));
					}
				}	
				right_grid = parseInt(r) + parseInt(count);
				if (right_grid < board_size) {
					is_valid = true;
					for (row = r + 1; row < right_grid; row++) {
						if (state[row][c] == opponent) {
							is_valid = false;
						}
					}
					// console.log(r + "," + c + " ↓: " + is_valid);
					if (is_valid && state[right_grid][c] != player) {
						valid_actions.push(new Array(r, c, right_grid, c));
					}
				}
				// ↖↘
				count = 1;
				distance = 1;
				while (r - distance >= 0 && c - distance >= 0) {
					if (state[r - distance][c - distance] == 1 || state[r - distance][c - distance] == -1) {
						count++;
					}
					distance++;
				}			
				distance = 1;
				while (r + distance < board_size && c + distance < board_size) {
					if (state[r + distance][c + distance] == 1 || state[r + distance][c + distance] == -1) {
						count++;
					}
					distance++;
				}
				right_row = parseInt(r) - parseInt(count);
				right_col = parseInt(c) - parseInt(count);
				if (right_row  >= 0 && right_col >= 0) {
					is_valid = true;
					for (distance = 1; distance < count; distance++) {
						if (state[r - distance][c - distance] == opponent) {
							is_valid = false;
						}
					}
					// console.log(r + "," + c + " ↖: " + is_valid);
					if (is_valid && state[right_row][right_col] != player) {
						valid_actions.push(new Array(r, c, right_row, right_col));
					}
				}
				right_row = parseInt(r) + parseInt(count);
				right_col = parseInt(c) + parseInt(count);
				if (right_row < board_size && right_col < board_size) {
					is_valid = true;
					for (distance = 1; distance < count; distance++) {
						if (state[r + distance][c + distance] == opponent) {
							is_valid = false;
						}
					}
					// console.log(r + "," + c + " ↘: " + is_valid);
					if (is_valid && state[right_row][right_col] != player) {
						valid_actions.push(new Array(r, c, right_row, right_col));
					}
				}
				// ↗↙
				count = 1;
				distance = 1;
				while (r - distance >= 0 && c + distance < board_size) {
					if (state[r - distance][c + distance] == 1 || state[r - distance][c + distance] == -1) {
						count++;
					}
					distance++;
				}			
				distance = 1;
				while (r + distance < board_size && c - distance >= 0) {
					if (state[r + distance][c - distance] == 1 || state[r + distance][c - distance] == -1) {
						count++;
					}
					distance++;
				}
				right_row = parseInt(r) - parseInt(count);
				right_col = parseInt(c) + parseInt(count);
				if (right_row  >= 0 && right_col < board_size) {
					is_valid = true;
					for (distance = 1; distance < count; distance++) {
						if (state[r - distance][c + distance] == opponent) {
							is_valid = false;
						}
					}
					// console.log(r + "," + c + " ↗: " + is_valid);
					if (is_valid && state[right_row][right_col] != player) {
						valid_actions.push(new Array(r, c, right_row, right_col));
					}
				}
				right_row = parseInt(r) + parseInt(count);
				right_col = parseInt(c) - parseInt(count);
				if (right_row < board_size && right_col >= 0) {
					is_valid = true;
					for (distance = 1; distance < count; distance++) {
						if (state[r + distance][c - distance] == opponent) {
							is_valid = false;
						}
					}
					// console.log(r + "," + c + " ↙: " + is_valid);
					if (is_valid && state[right_row][right_col] != player) {
						valid_actions.push(new Array(r, c, right_row, right_col));
					}
				}
			}
		}
	}
	// console.log("valid_actions for " + player + " : ");
	// console.log(valid_actions);
	return valid_actions;
}

// display valid actions in board ui accoring to valid_actions
function display_valid_actions(valid_actions, r, c) {
	if (valid_actions != null && valid_actions.length > 0) {
		for (i = 0; i < valid_actions.length; i++) {
			if (valid_actions[i][0] == r && valid_actions[i][1] == c) {
				$valid_grid = $("#r" + valid_actions[i][2] + "c" + valid_actions[i][3]);
				$valid_grid.removeClass("grey");
				$valid_grid.addClass("green");
			}
		}
	}
}

// perform action in matrix and display matrix info, update board ui
function perform_action (action) {
	counter_id++;
	matrix[action[2]][action[3]] = matrix[action[0]][action[1]];
	matrix[action[0]][action[1]] = 0;
	display_matrix();
	if (counter_id % 2 == 1) {
		display_monitor_info("&#x2b24; " + action[0] + "," + action[1] + " -> " + action[2] + "," + action[3]);
	} else if (counter_id % 2 == 0) {
		display_monitor_info("&#x25ef; " + action[0] + "," + action[1] + " -> " + action[2] + "," + action[3]);
	}
	if (terminal_test(matrix)) {
		is_over = true;
		if ((winner == "&#x2b24;" && black_player_who == "AI") ||
		   (winner == "&#x25ef;" && white_player_who == "AI")) {
			$(".emoji").attr("src", "img/smiling.png");
			winner += "AI ";
		} else {
			$(".emoji").attr("src", "img/frowning.png");
			winner += "Human ";
		}		
		display_monitor_info(winner + '<span class="win"> WIN</span>');
		$(".navinfo").html(winner + '<span class="win"> WIN</span>');
	}	
	update_board();
	if (!is_over) {
		if (counter_id % 2 == 0) {
			if (black_player_who == "AI") {
				ai_turn(1, black_player_cutoff_depth);
			}				
		} else if (counter_id % 2 == 1) {
			if (white_player_who == "AI") {
				ai_turn(-1, white_player_cutoff_depth);
			}				
		}
	}	
}

function ai_turn(player, player_level) {
	timebegin = (new Date()).getTime();
	console.log("ai_begin >> " + timebegin);
	timerfunc(timebegin);	
	$(".emoji").attr("src", "img/thinking.png");

	setTimeout(function() {
	// important! this enables display other's move first, before ai_turn perform its action		
		alpha_beta_action = alpha_beta_search(matrix, player, player_level);
		perform_action(alpha_beta_action);

		display_statix_info();

		console.log("ai_end -- " + (new Date()).getTime());
		timerfunc((new Date()).getTime());
		$(".emoji").attr("src", "img/winking.png");
	}, 1);		
}



/* ==========================================================================
   alpha-beta pruning algorithm
*  ========================================================================== */

function alpha_beta_search(state, player, player_level) {
	console.log(counter_id + ". alpha_beta_search >> ");

	initial_statix_info();

	var actions_depth0 = {};

	var valid_actions = return_valid_actions(state, player);
	for (var i in valid_actions) {
		actions_depth0[valid_actions[i]] = "";
	}
	console.log("valid_actions: ");
	console.log(valid_actions);

	if (player == 1) {
		var v = max_value(state, -100, +100, 0);
	} else if (player == -1) {
		var v = min_value(state, -100, +100, 0);
	}	
	
	console.log("v: " + v);
	console.log("actions_depth0: ");
	console.log(actions_depth0);
	for (var i in valid_actions) {
		// console.log(actions_depth0[valid_actions[i]]);
		if (actions_depth0[valid_actions[i]] == v) {
			console.log(valid_actions[i]);
			console.log(counter_id + ". alpha_beta_search -- ");
			return valid_actions[i];
		}
	}
	console.log(counter_id + ". alpha_beta_search ---------- ");
	return valid_actions[i];

	function max_value(state, a, b, depth) {
		maxdepth = Math.max(maxdepth, depth);

		// console.log(new Date().getTime() - timebegin);
		// console.log("max - d: " + depth);
		if (terminal_test(state)) {
			return utility_value(state);
		}
		if (cutoff_test(state, depth)) {
			maxeval++;
			return eval_func(state);
		}
		var v = -999;
		var valid_actions = return_valid_actions(state, 1);
		totalnodes += valid_actions.length;
		for (var i in valid_actions) {
			// console.log("max - i: " + i);
			v = Math.max(v, min_value(result(state, valid_actions[i]) , a, b, depth + 1));

			if (depth == 0 && player == 1) {
				actions_depth0[valid_actions[i]] = v;
			}

			if (v >= b) {
				maxprun++;
				return v;
			}
			a = Math.max(a, v);
		}
		return v;
	}

	function min_value(state, a, b, depth) {
		maxdepth = Math.max(maxdepth, depth);

		// console.log("min - d: " + depth);
		if (terminal_test(state)) {
			return utility_value(state);
		}
		if (cutoff_test(state, depth)) {
			mineval++;
			return eval_func(state);
		}
		var v = +999;
		var valid_actions = return_valid_actions(state, -1);
		totalnodes += valid_actions.length;
		for (var i in valid_actions) {
			// console.log("min - i: " + i);
			v = Math.min(v, max_value(result(state, valid_actions[i]) , a, b, depth + 1));

			if (depth == 0 && player == -1) {
				actions_depth0[valid_actions[i]] = v;
			}

			if (v <= a) {
				minprun++;
				return v;
			}
			b = Math.min(b, v);
		}
		return v;
	}	

	function result(givenstate, action) {
		var state = new Array(board_size);
		for (r = 0; r < board_size; r++) {
			state[r] = new Array(board_size);
			for (c = 0; c < board_size; c++) {
				state[r][c] = givenstate[r][c];
			}
		}
		// console.log(action);
		// console.log(state);
		state[action[2]][action[3]] = state[action[0]][action[1]];
		state[action[0]][action[1]] = 0;
		return state;
	}	

	function utility_value(state) {		
		terminal_test(state);
		if (winner == "&#x2b24;") {
			return 100;
		} else if (winner == "&#x25ef;") {
			return -100;
		}
	}

	function cutoff_test(state, givendepth) {
		if (givendepth == player_level) {
			return true;
		} else if (new Date().getTime() - timebegin >= 10000){
			return true;
		} else {
			return false;
		}
	}

	function eval_func(state) {	
		var eval_value = eval(state);
		if (eval_value >= 100 || eval_value <= -100) {
			alert(eval_value);
		}
		return eval_value;
	}
}



/* ==========================================================================
   terminal test
*  ========================================================================== */
// test if now is a terminal state, if is, update winner 
function terminal_test(state) {
	var nums = [0, 0];
	nums = compute_islands(state);

	winner = "";
	if (nums[0] == 1 && nums[1] == 1) {
		if (counter_id % 2 == 0) {
			winner = "&#x25ef;";
		} else if (counter_id % 2 == 1) {
			winner = "&#x2b24;";
		}
	} else if (nums[0] == 1) {
		winner = "&#x2b24;";
	} else if (nums[1] == 1) {
		winner = "&#x25ef;";
	}

	return (nums[0] == 1 || nums[1] == 1);
}

// return number array of black, white islands
function compute_islands(givenstate) {
	var nums = [0, 0];

	var state = new Array(board_size);
	for (r = 0; r < board_size; r++) {
		state[r] = new Array(board_size);
		for (c = 0; c < board_size; c++) {
			state[r][c] = givenstate[r][c];
		}
	}
	var island_black = 0;
	var island_white = 0;
	// console.log(counter_id + ": terminal_test >> island_black: " + island_black + " island_white: " + island_white);
	// initialize visited for black and white
	var visited_black = new Array(board_size);
	var visited_white = new Array(board_size);	
	for (r = 0; r < board_size; r++) {
		visited_black[r] = new Array(board_size);
		visited_white[r] = new Array(board_size);	
		for (c = 0; c < board_size; c++) {
			visited_black[r][c] = false;
			visited_white[r][c] = false;
		}
	}

	for (r = 0; r < board_size; r++) {
		for (c = 0; c < board_size; c++) {
			// console.log("state[r][c]: " + r + "," + c + " > " + state[r][c] + " - " + visited_black[r][c]);
			if (state[r][c] == 1 && !visited_black[r][c]) {
				dfs_state(state, r, c, visited_black, 1);
				island_black++;
				// console.log("after dfs, island_black now: " + island_black);
			}
			if (state[r][c] == -1 && !visited_white[r][c]) {
				dfs_state(state, r, c, visited_white, -1);
				island_white++;
			}	
			// console.log("island_black: " + island_black + ", island_white: " + island_white);		
		}
	}

	// console.log(state);
	// console.log(counter_id + ": terminal_test >>>>>> island_black: " + island_black + " island_white: " + island_white);

	nums[0] = island_black;
	nums[1] = island_white;
	return nums;
}

// check if r, c is valid value
function is_valid_rc(state, r, c, visited, player) {
	return (r >=0 && r < state.length &&
			c >=0 && c < state[0].length &&
			state[r][c] == player && !visited[r][c]);	
}

// dfs search in matrix for connected grids, and mark it as visited
function dfs_state(state, r, c, visited, player) {
	// 8 directions
	rDirection = [ 0, -1, -1, -1, 0, 1, 1,  1];
	cDirection = [-1, -1,  0,  1, 1, 1, 0, -1];

	visited[r][c] = true;
	// console.log(state[r][c] + " = " + r + "," +  c + ": " + "visited");
	// console.log(visited);
	for (var i = 0; i < 8; i++) {
		// console.log(r + "," + c + ">" + i + ": " + (r + rDirection[i]) + "," + (c + cDirection[i]));
		// console.log(i + " - " + visited[r][c]);
		// console.log(visited);
		// console.log((r + rDirection[i]) + "," + (c + cDirection[i]) + " - " + (is_valid_rc(state, r + rDirection[i], c + cDirection[i], visited, player)));
		if (is_valid_rc(state, r + rDirection[i], c + cDirection[i], visited, player)) {
			// console.log(">>");
			dfs_state(state, r + rDirection[i], c + cDirection[i], visited, player);
		}
	}
}



/* ==========================================================================
   display statistics, monitor info
*  ========================================================================== */
// display statistics info
function display_statix_info() {
	$(".maxdepth").text($.number(maxdepth));
	$(".totalnodes").text($.number(totalnodes));
	$(".maxeval").text($.number(maxeval));
	$(".mineval").text($.number(mineval));
	$(".maxprun").text($.number(maxprun));
	$(".minprun").text($.number(minprun));
}

// display monitor info
function display_monitor_info(info) {
	d = new Date();
	$("#monitorinfo").prepend('<div class="infoitem' + (info_id % 2)  + '"><span class="infoid">[' + info_id + ']</span> ' + 
							  '<span class="movecounter">[' + counter_id + ']</span> ' + info + '<span class="time">['  + 
							  d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "." + d.getMilliseconds() + ']</span></div>');
	info_id++;
}

// display matrix info
function display_matrix() {
	matrix_html = "";
	for (r = 0; r < board_size; r++) {
		for (c = 0; c < board_size; c++) {
			matrix_html += matrix[r][c] + ", ";
		}
		matrix_html += "</br>";
	}
	$("#matrixinfo").html(matrix_html);
}



