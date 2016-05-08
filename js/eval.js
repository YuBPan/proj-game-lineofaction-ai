function eval(state) {
	var weight1 = 0.90;		// why large? it means close to win
	var weight2 = 0.10;		// why small? cannot say it's close to win certainly
	return weight1 * feature_1(state) + 
		   weight2 * feature_2(state);
}

// difference of number of white(-1) and black(1) connected islands
// range(board_size = 5) [-6, 6] --> [-99, 99]
// range(board_size = 6) [-8, 8] --> [-99, 99]
function feature_1(state) {
	var nums = [0, 0];
	nums = compute_islands(state);	
	return Math.floor((nums[1] - nums[0]) / (board_size * 2 - 4) * 99);
}


// compute centre of mass: average row, col
// distance between centre of mass
// difference between distance and (ideal)min_distance
function feature_2(state) {
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
