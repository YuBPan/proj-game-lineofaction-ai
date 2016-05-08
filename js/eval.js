function eval(state) {
	var weight1 = 0.40;		// why big? it means close to win
	var weight2 = 0.60;		// why big? it means close to win
	var weight3 = 0.10;		// why small? cannot say it's close to win certainly
	return (weight1 * feature_1(state) + 
		    weight2 * feature_2(state) +
		    weight3 * feature_3(state)).toFixed(2);
}



// difference of number of white(-1) and black(1) connected islands
// range(board_size = 5) [-6, 6] --> [-99, 99]
// range(board_size = 6) [-8, 8] --> [-99, 99]
function feature_1(state) {
	var nums = [0, 0];
	nums = compute_islands(state);	
	return Math.floor((nums[1] - nums[0]) / (board_size * 2 - 4) * 99);
}



// difference of blocked pieces
function feature_2(state) {
	return Math.floor(return_blocked_pieces(state, -1) - return_blocked_pieces(state, 1) / (board_size * 2 - 4) * 99);
}



// compute center of mass: average row, col
// distance between centre of mass
// difference between distance and (ideal)min_distance
function feature_3(state) {
	var nums = [0, 0];
	var row_b = 0;
	var col_b = 0;
	var count_b = 0;
	var distance_b = 0;
	var row_w = 0;
	var col_w = 0;
	var count_w = 0;	
	var distance_w = 0;

	// ideal sum of min distances
	//  1      2       3       4       5       6       7       8
	// [0.000, 1.0000, 1.9621, 2.8284, 4.2390, 5.4721, 6.8236, 8.2963]
	var min_distance = [0.000, 1.0000, 1.9621, 2.8284, 4.2390, 5.4721, 6.8236, 8.2963];
	// ideal sum of max distances for board size 5 and 6
	//                  5        6
	var max_distance = [17.8062, 21.8798];

	for (r = 0; r < board_size; r++) {
		for (c = 0; c < board_size; c++) {
			if (state[r][c] == "1") {
				row_b += r;
				col_b += c;
				count_b++;
			}
			if (state[r][c] == "-1") {
				row_w+= r;
				col_w += c;
				count_w++;
			}			
		}
	}

	row_b = row_b / count_b;
	col_b = col_b / count_b;
	row_w = row_w / count_w;
	col_w = col_w / count_w;

	for (r = 0; r < board_size; r++) {
		for (c = 0; c < board_size; c++) {
			if (state[r][c] == "1") {
				distance_b += Math.sqrt((r - row_b) * (r - row_b) + 
										(c - col_b) * (c - col_b));
			}
			if (state[r][c] == "-1") {
				distance_w += Math.sqrt((r - row_w) * (r - row_w) + 
										(c - col_w) * (c - col_w));
			}			
		}
	}

	return Math.floor((distance_w - min_distance[count_w - 1]) - (distance_b - min_distance[count_b - 1]) / 
		   (max_distance[(board_size % 5)]) * 99);
}

// copy from funtion return_valid_actions
function return_blocked_pieces(state, player) {
	var blocked_pieces = 0;
	var valid_actions = [];
	if (player == 1) {
		var opponent = -1;
	} else {
		var opponent = 1;
	}

	// ←→↑↓↖↘↗↙
	for (r = 0; r < board_size; r++) {
		for (c = 0; c < board_size; c++) {
			if (state[r][c] == player) {
				is_blocked = true;
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
					if (is_valid) {
						is_blocked = false;
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
					if (is_valid) {
						is_blocked = false;
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
					if (is_valid) {
						is_blocked = false;
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
					if (is_valid) {
						is_blocked = false;
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
					if (is_valid) {
						is_blocked = false;
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
					if (is_valid) {
						is_blocked = false;
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
					if (is_valid) {
						is_blocked = false;
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
					if (is_valid) {
						is_blocked = false;
					}					
				}

				if (is_blocked) {
					blocked_pieces++;
				}
			}
		}
	}
	// console.log("valid_actions for " + player + " : ");
	// console.log(valid_actions);
	return blocked_pieces;
}
