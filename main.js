var default_settings = {
  "img": "assets/rainier.png",
  "width": 3,
  "height": 3,
  "gap": 1.5,
  "tile resolution": 100,
  "missing corner": 4,
  "randomize amount": 2, // this amount × how many tiles there are
  "tickspeed": 100
}
var settings = {};
var live_settings = {};


var pz_width = 0;
var pz_height = 0;

var tile_coords = {};
var prev_tile_coords = {};
var tile_home = {};
var tile_history = [];
var puzzle = document.querySelector("#puzzle");
var resetting = false;
var game_started = false;
var game_ended = true;
var board_template = document.querySelector("#puzzle .board").cloneNode(true)
var puzzle_tick = 0;


function get_tile(x, y) {
  var return_id = false;
  for (i in tile_coords) {
    if (tile_coords[i]["x"] == x && tile_coords[i]["y"] == y) {
      return_id = i;
    }
  }
  return return_id
}

function get_random(arr) {
  return arr[(Math.floor(Math.random() * arr.length))]
}

function build_puzzle() {
  console.log("building puzzle with settings:", {...settings}); // call whenever build puzzle
  puzzle = document.querySelector("#puzzle");
  tile_coords = {};
  prev_tile_coords = {};
  tile_home = {};
  tile_history = [];
  resetting = false;
  game_started = false;
  game_ended = true;
  var pz_width = ( settings["width"] * settings["tile resolution"] ) + ( settings["gap"] * ( settings["width"] - 1 ) ) + (settings["gap"] * 2);
  var pz_height = ( settings["height"] * settings["tile resolution"] ) + ( settings["gap"] * ( settings["height"] - 1 ) ) + (settings["gap"] * 2);
  console.log("calculated width & height:", pz_width, pz_height);
  
  // reset board
  puzzle.innerHTML = "";
  puzzle.appendChild(board_template.cloneNode(true));
  puzzle.classList.add("noanim");

  puzzle.setAttribute("viewBox", `0 0 ${pz_width} ${pz_height}`);

  // remove everything from puzzle except things with the class 'keep'
  /*var children = puzzle.querySelector(".board").children
  for (i in children) {
    if (children[i].nodeType) {
      if (children[i].classList.contains("keep") != true) {
        children[i].remove();
      }
    }
  }*/

  puzzle.querySelector(".board").setAttribute("style", `transform: translate(${settings["gap"]}px, ${settings["gap"]}px);`);

  var tile_id = 0;

  for (let x = 0; x < settings["width"]; x++){

    for (let y = 0; y < settings["height"]; y++){
      // creating a new tile
      var x_coord = ( (x) * settings["tile resolution"]) + ( x * settings["gap"] );
      var y_coord = ( (y) * settings["tile resolution"]) + ( y * settings["gap"] );
      var tile = puzzle.querySelector(".tile.template").cloneNode(true);
      tile.classList.remove("template");
      tile.classList.remove("keep");
      tile.querySelector("image").setAttribute("href", settings["img"]);
      tile.querySelector("image").setAttribute("width", pz_width);
      tile.querySelector("image").setAttribute("height", pz_height);
      tile.querySelector("image").setAttribute("style", `transform: translate(${-1 * x_coord}px, ${-1 * y_coord}px);`);
      tile.querySelector("image").setAttribute("mask", `url(#mask_${tile_id})`);
      tile.setAttribute("id", `tile_${tile_id}`);
      tile.querySelector("rect").setAttribute("width", settings["tile resolution"]);
      tile.querySelector("rect").setAttribute("height", settings["tile resolution"]);
      tile.querySelector("rect").setAttribute("onmousedown", `move_tile(${tile_id})`);
      puzzle.querySelector(".board").appendChild(tile);

      var mask = puzzle.querySelector(".mask.template").cloneNode(true);
      mask.classList.remove("template");
      mask.classList.remove("keep");
      mask.setAttribute("id", `mask_${tile_id}`);
      mask.querySelector(".bg").setAttribute("width", pz_width);
      mask.querySelector(".bg").setAttribute("height", pz_height);
      mask.querySelector(".fg").setAttribute("width", settings["tile resolution"]);
      mask.querySelector(".fg").setAttribute("height", settings["tile resolution"]);
      mask.querySelector(".fg").setAttribute("x", x_coord);
      mask.querySelector(".fg").setAttribute("y", y_coord);
      puzzle.querySelector("#masks").appendChild(mask);

      tile_coords[tile_id] = {"x": x, "y": y};

      tile_id += 1;
    }
    game_ended = false;
  }

  // remove missing corner
  var corner_id = 0;
  var space_coords = [0, 0]
  if (settings["missing corner"] == 1) {
    corner_id = 0
    space_coords = [0, 0];
  } else if (settings["missing corner"] == 2) {
    corner_id = get_tile(settings["width"] - 1, 0);
    space_coords = [settings["width"] - 1, 0];
  } else if (settings["missing corner"] == 3) {
    corner_id = get_tile(0, settings["height"] - 1);
    space_coords = [0, settings["height"] - 1];
  } else if (settings["missing corner"] == 4) {
    corner_id = get_tile(settings["width"] - 1, settings["height"] - 1);
    space_coords = [settings["width"] - 1, settings["height"] - 1];
  }

  console.log(corner_id);
  puzzle.querySelector(`#tile_${corner_id}`).remove();
  puzzle.querySelector(`#mask_${corner_id}`).remove();
  delete tile_coords[corner_id]
  tile_coords[-1] = {"x": space_coords[0], "y": space_coords[1]};

  tile_home = { ...tile_coords};

}

var puzzle_update;

function start_puzzle_update() {
  clearInterval(puzzle_update);
  puzzle_tick = 0;
  puzzle_update = setInterval(() => {
    if (puzzle_tick == 1) {
      puzzle.classList.remove("noanim");
    }
    for (i in tile_coords) {
      if (i >= 0) {
        if (JSON.stringify(tile_coords[i]) != JSON.stringify(prev_tile_coords[i])) {
          //console.log("updating:", i)
          var x_coord = ( tile_coords[i]["x"] * settings["tile resolution"]) + ( tile_coords[i]["x"] * settings["gap"] );
          var y_coord = ( tile_coords[i]["y"] * settings["tile resolution"]) + ( tile_coords[i]["y"] * settings["gap"] );
          puzzle.querySelector(`#tile_${i}`).style = `transform: translate(${x_coord}px, ${y_coord}px);`;
        }
      }
    }
    if (JSON.stringify(tile_coords) == JSON.stringify(tile_home)) {
      if (game_started == true && game_ended == false && resetting == false) {
        game_ended = true;
        setTimeout( () => {
          alert("celebration!!");
        }, 250);
      }
    }
    prev_tile_coords = {... tile_coords};
    puzzle_tick += 1;
  }, settings["tickspeed"]);
}



function move_tile(tile_id) {
  if (tile_id >= 0) {
    tile_history.push(tile_id);
    console.log("moving tile:", tile_id);
    var coords = {...tile_coords[tile_id]};
    if (get_tile(coords["x"], coords["y"] - 1) == -1) {
      // above
      console.log("above");
      tile_coords[-1] = {...tile_coords[tile_id]};
      tile_coords[tile_id] = {"x": coords["x"], "y": coords["y"] - 1};
    } else if (get_tile(coords["x"] + 1, coords["y"]) == -1) {
      // right
      console.log("right");
      tile_coords[-1] = {...tile_coords[tile_id]};
      tile_coords[tile_id] = {"x": coords["x"] + 1, "y": coords["y"]};
    } else if (get_tile(coords["x"], coords["y"] + 1) == -1) {
      // below
      console.log("below");
      tile_coords[-1] = {...tile_coords[tile_id]};
      tile_coords[tile_id] = {"x": coords["x"], "y": coords["y"] + 1};
    } else if (get_tile(coords["x"] - 1, coords["y"]) == -1) {
      // left
      console.log("left");
      tile_coords[-1] = {...tile_coords[tile_id]};
      tile_coords[tile_id] = {"x": coords["x"] - 1, "y": coords["y"]};
    } else {
      // none
      console.log("none");
      puzzle.querySelector(`#tile_${tile_id} .nuance`).classList.add("shakey");
      setTimeout( () => {
        puzzle.querySelector(`#tile_${tile_id} .nuance`).classList.remove("shakey");
      }, 200, tile_id);
    }
    
    setTimeout( () => {
      game_started = true;
    }, 500);  
  }
}

function mix_puzzle() {
  var tile_amount = 0;
  for (i in tile_coords) {
    tile_amount += 1;
  }
  var iterate = tile_amount * settings["randomize amount"];
  var randomize_interval;
  var possible_tiles = [];
  var empty = tile_coords[-1]; // set empty for the first time
  var prev_tile;
  randomize_interval = setInterval( () => {
    if (iterate > 0) {

      possible_tiles = [];
      
      // not done
      if (get_tile(empty["x"], empty["y"] - 1) != false) {
        // above
        var tile = get_tile(empty["x"], empty["y"] - 1);
        console.log(tile);
        possible_tiles.push(tile);
      }
      if (get_tile(empty["x"] + 1, empty["y"]) != false) {
        // right
        var tile = get_tile(empty["x"] + 1, empty["y"]);
        console.log(tile);
        possible_tiles.push(tile);
      }
      if (get_tile(empty["x"], empty["y"] + 1) != false) {
        // below
        var tile = get_tile(empty["x"], empty["y"] + 1);
        console.log(tile);
        possible_tiles.push(tile);
      }
      if (get_tile(empty["x"] - 1, empty["y"]) != false) {
        // left
        var tile = get_tile(empty["x"] - 1, empty["y"]);
        console.log(tile);
        possible_tiles.push(tile);
      }
      for (i in possible_tiles) {
        if (JSON.stringify(tile_coords[possible_tiles[i]]) == JSON.stringify(prev_tile)) {
          possible_tiles.splice(i, 1); // remove the coordinate that the tile was just at so that way the same tile wont get moved back and forthh
        }
      }
      var random_tile = get_random(possible_tiles);
      prev_tile = {...tile_coords[-1]};
      move_tile(random_tile);
      empty = {...tile_coords[-1]};
      iterate -= 1;
      console.log(possible_tiles);
    } else {  // done
      clearInterval(randomize_interval);
    }
  }, parseInt(settings["tickspeed"] / 2), iterate, randomize_interval, possible_tiles, empty, tile_amount);
}



function reset_puzzle() {

  game_started = false;
  resetting = true;
  var rhistory = [ ...tile_history ];
  rhistory.reverse();
  var hinterval;
  hinterval = setInterval( () => {
    
    if (rhistory.length <= 0) {
      clearInterval(hinterval);
      game_started = false;
      resetting = false;
      tile_history = [];
    } else {
      move_tile(rhistory[0]);
      rhistory.splice(0, 1);
    }
  }, parseInt(settings["tickspeed"] / 2) );


  
  //tile_coords = {...tile_home};
  
}

function toggle_options() {
  if (document.querySelector(".options-wrapper").classList.contains("show") == true) {
    document.querySelector(".options-wrapper").classList.remove("show");
  } else {
    document.querySelector(".options-wrapper").classList.add("show");
  }
}

function update_puzzle() {
  clearInterval(puzzle_update);
  settings = { ...live_settings };
  build_puzzle();
  start_puzzle_update();
}




function input_stuff() {
  var input_list = document.querySelectorAll(".input");
  
  for (i in input_list) {
    if (input_list[i].nodeType) {
      if (input_list[i].hasAttribute("option")) {
        var option = input_list[i].getAttribute("option");
        var type = input_list[i].getAttribute("type");
        var value = input_list[i].innerHTML;
        //console.log(value);
        
        
        if (value.replaceAll(" ", "").replaceAll("&nbsp;", "") == "") { // empty
          input_list[i].innerHTML = "";
          live_settings[option] = default_settings[option];
        } else {
          if (type == "txt") {
            live_settings[option] = value;
          } else if (type == "flt") {
            var final_num = parseFloat(value.replace(/([^0-9.])+/g, ""));
            if (input_list[i].hasAttribute("min")) {
              if (final_num < parseFloat(input_list[i].getAttribute("min"))) {
                // if its less than minimum
                live_settings[option] = parseFloat(input_list[i].getAttribute("min"));
              }
            }
            if (input_list[i].hasAttribute("max")) {
              if (final_num > parseFloat(input_list[i].getAttribute("max"))) {
                // if its more than maximum
                live_settings[option] = parseFloat(input_list[i].getAttribute("max"));
              }
            }
            // yay
            if ( value.replace(/([^0-9.])+/g, "") == value) {
              // if its good number
              live_settings[option] = final_num;
            } else {
              live_settings[option] = default_settings[option];
              input_list[i].innerHTML = value.replace(/([^0-9.])+/g, "");
            }
          } else if (type == "int") {
            var final_num = parseInt(value.replace(/([^0-9])+/g, ""));
            
            if (input_list[i].hasAttribute("min")) {
              if (final_num < parseInt(input_list[i].getAttribute("min"))) {
                // if its less than minimum
                live_settings[option] = parseInt(input_list[i].getAttribute("min"));
                input_list[i].innerHTML = parseInt(input_list[i].getAttribute("min"));
              }
            }
            if (input_list[i].hasAttribute("max")) {
              if (final_num > parseInt(input_list[i].getAttribute("max"))) {
                // if its more than maximum
                live_settings[option] = parseInt(input_list[i].getAttribute("max"));
                input_list[i].innerHTML = parseInt(input_list[i].getAttribute("max"));
              }
            }
            // yay
            if ( value.replace(/([^0-9])+/g, "") == value) {
              // if its good number
              live_settings[option] = final_num;
            } else {
              live_settings[option] = default_settings[option];
              input_list[i].innerHTML = value.replace(/([^0-9])+/g, "");
            }

          }
        }
      }
    }
  }
}

setInterval( input_stuff, 100);


input_stuff();
update_puzzle();