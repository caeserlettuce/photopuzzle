 
var settings = {
  "img": "assets/rainier.png",
  "width": 10,
  "height": 10,
  "gap": 1.5,
  "tile resolution": 100,
  "missing corner": 4
}
var pz_width = 0;
var pz_height = 0;

var tile_coords = {};
var tile_home = {};
var puzzle = document.querySelector("#puzzle");
var resetting = false;



function get_tile(x, y) {
  var return_id = false;
  for (i in tile_coords) {
    if (tile_coords[i]["x"] == x && tile_coords[i]["y"] == y) {
      return_id = i;
    }
  }
  return return_id
}

function build_puzzle(st) {
  console.log("building puzzle with settings:", st); // call whenever build puzzle

  var pz_width = ( st["width"] * st["tile resolution"] ) + ( st["gap"] * ( st["width"] - 1 ) ) + (st["gap"] * 2);
  var pz_height = ( st["height"] * st["tile resolution"] ) + ( st["gap"] * ( st["height"] - 1 ) ) + (st["gap"] * 2);
  console.log("calculated width & height:", pz_width, pz_height);

  puzzle.setAttribute("viewBox", `0 0 ${pz_width} ${pz_height}`);

  // remove everything from puzzle except things with the class 'keep'
  var children = puzzle.children
  for (i in children) {
    if (children[i].nodeType) {
      if (children[i].classList.contains("keep") != true) {
        children[i].remove();
      }
    }
  }

  puzzle.querySelector(".board").setAttribute("style", `transform: translate(${st["gap"]}px, ${st["gap"]}px);`);

  var tile_id = 0;

  for (let x = 0; x < st["width"]; x++){

    for (let y = 0; y < st["height"]; y++){
      // creating a new tile
      var x_coord = ( (x) * st["tile resolution"]) + ( x * st["gap"] );
      var y_coord = ( (y) * st["tile resolution"]) + ( y * st["gap"] );
      var tile = puzzle.querySelector(".tile.template").cloneNode(true);
      tile.classList.remove("template");
      tile.classList.remove("keep");
      tile.querySelector("image").setAttribute("href", st["img"]);
      tile.querySelector("image").setAttribute("width", pz_width);
      tile.querySelector("image").setAttribute("height", pz_height);
      tile.querySelector("image").setAttribute("style", `transform: translate(${-1 * x_coord}px, ${-1 * y_coord}px);`);
      tile.querySelector("image").setAttribute("mask", `url(#mask_${tile_id})`);
      tile.setAttribute("id", `tile_${tile_id}`);
      tile.querySelector("rect").setAttribute("width", st["tile resolution"]);
      tile.querySelector("rect").setAttribute("height", st["tile resolution"]);
      tile.querySelector("rect").setAttribute("onclick", `move_tile(${tile_id})`);
      puzzle.querySelector(".board").appendChild(tile);

      var mask = puzzle.querySelector(".mask.template").cloneNode(true);
      mask.classList.remove("template");
      mask.classList.remove("keep");
      mask.setAttribute("id", `mask_${tile_id}`);
      mask.querySelector(".bg").setAttribute("width", pz_width);
      mask.querySelector(".bg").setAttribute("height", pz_height);
      mask.querySelector(".fg").setAttribute("width", st["tile resolution"]);
      mask.querySelector(".fg").setAttribute("height", st["tile resolution"]);
      mask.querySelector(".fg").setAttribute("x", x_coord);
      mask.querySelector(".fg").setAttribute("y", y_coord);
      puzzle.querySelector("#masks").appendChild(mask);

      tile_coords[tile_id] = {"x": x, "y": y};

      tile_id += 1;
    }

  }

  // remove missing corner
  var corner_id = 0;
  var space_coords = [0, 0]
  if (st["missing corner"] == 1) {
    corner_id = 0
    space_coords = [0, 0];
  } else if (st["missing corner"] == 2) {
    corner_id = get_tile(settings["width"] - 1, 0);
    space_coords = [settings["width"] - 1, 0];
  } else if (st["missing corner"] == 3) {
    corner_id = get_tile(0, settings["height"] - 1);
    space_coords = [0, settings["height"] - 1];
  } else if (st["missing corner"] == 4) {
    corner_id = get_tile(settings["width"] - 1, settings["height"] - 1);
    space_coords = [settings["width"] - 1, settings["height"] - 1];
  }

  puzzle.querySelector(`#tile_${corner_id}`).remove();
  puzzle.querySelector(`#mask_${corner_id}`).remove();
  delete tile_coords[corner_id]
  tile_coords[-1] = {"x": space_coords[0], "y": space_coords[1]};

  tile_home = { ...tile_coords};

}

var puzzle_update;

function start_puzzle_update() {
  clearInterval(puzzle_update);
  puzzle_update = setInterval(() => {
    for (i in tile_coords) {
      if (i >= 0) {
        var x_coord = ( tile_coords[i]["x"] * settings["tile resolution"]) + ( tile_coords[i]["x"] * settings["gap"] );
      var y_coord = ( tile_coords[i]["y"] * settings["tile resolution"]) + ( tile_coords[i]["y"] * settings["gap"] );
      puzzle.querySelector(`#tile_${i}`).style = `transform: translate(${x_coord}px, ${y_coord}px);`;
      }
    }
  }, 100);
}



function move_tile(tile_id) {
  if (resetting == false) {
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
  }
}

function reset_puzzle() {
  var reset;
  var reset_index = 0;
  var tiles = []
  resetting = true;
  puzzle.classList.add("deactivated");
  for (i in tile_coords) {
    if (i >= 0) {
      tiles.push(i)
    }
  }
  var reset_speed = Math.ceil( 500 / ( ( settings["width"] / 3) * 15 ) )
  console.log(reset_speed)
  reset = setInterval( () => {
    var id;
    var skip_index = false;
    if (tiles[reset_index]) {
      id = tiles[reset_index];
      if (`${tile_coords[id]}` == `${tile_home[id]}`) {
        var next_tile = false;
        var next_index = 0;
        for (t in tile_coords) {
          if (`${tile_coords[t]}` == `${tile_home[t]}` && next_tile == false) {
            // nothing
            console.log("nothing", t);
            next_index += 1;
          } else {
            console.log("YEAH!", t);
            next_tile = t;
          }
        }

        if (next_tile != false) {
          //tile_coords[next_tile] = { ...tile_home[next_tile]};
          reset_index = next_index;
          skip_index = true;
        } else {
          // nothing left
          reset_index = tiles.length;
        }
        
      }
    }
    if (reset_index > tiles.length - 1) {
      clearInterval(reset);
      tile_coords = {...tile_home};
      resetting = false;
      puzzle.classList.remove("deactivated");
    } else {
      var tile_piece = puzzle.querySelector(`#tile_${id}`)
      tile_piece.parentNode.appendChild(tile_piece)
      tile_coords[id] = { ...tile_home[id]};
    }
    if (skip_index != true) {
      reset_index += 1;
    }
  }, reset_speed, reset, tiles, reset_index, tile_coords, tile_home);
  
}



build_puzzle(settings); // build the default puzzle
start_puzzle_update(); // start the puzzle updating