function Maze(mazeWidth, mazeHeight) {
  //setup stack and maze arrays
  let stack = [];
  let maze = [];
  //create 2d array of cells according to width and heigh arguments
  for (let x = 0; x < mazeWidth; x++) {
    maze[x] = [];
    for (let y = 0; y < mazeHeight; y++) {
      maze[x][y] = new Cell();
      maze[x][y].setPosition(x, y);
    }
  }

  //set position of currently selected cell
  let xPos = 0,
    yPos = 0;

  let srandom = new Math.seedrandom("fasoijfioasfj");
  do {
    maze[xPos][yPos].visit();

    let unvisitedNeighbors = [];

    //Check above
    if (yPos - 1 !== -1) {
      if (!maze[xPos][yPos - 1].visited()) {
        unvisitedNeighbors.push(maze[xPos][yPos - 1]);
      }
    }

    //Check below
    if (yPos + 1 !== mazeHeight) {
      if (!maze[xPos][yPos + 1].visited()) {
        unvisitedNeighbors.push(maze[xPos][yPos + 1]);
      }
    }

    //Check left
    if (xPos - 1 !== -1) {
      if (!maze[xPos - 1][yPos].visited()) {
        unvisitedNeighbors.push(maze[xPos - 1][yPos]);
      }
    }

    //Check right
    if (xPos + 1 !== mazeWidth) {
      if (!maze[xPos + 1][yPos].visited()) {
        unvisitedNeighbors.push(maze[xPos + 1][yPos]);
      }
    }

    //Check if going to a previous cell is necessary
    if (unvisitedNeighbors.length === 0) {
      let newPosition = stack[stack.length - 1].getPosition();
      stack.pop();
      xPos = newPosition[0];
      yPos = newPosition[1];
    } else {
      //push currents cell onto stack
      stack.push(maze[xPos][yPos]);

      //open entrances ways and change position
      let newPosition = unvisitedNeighbors[
        Math.floor(Math.random() * unvisitedNeighbors.length)
      ].getPosition();

      maze[xPos][yPos].openEntrance(newPosition[0], newPosition[1]);
      maze[newPosition[0]][newPosition[1]].openEntrance(xPos, yPos);

      xPos = newPosition[0];
      yPos = newPosition[1];
    }
  } while (stack.length !== 0);

  let randX = 0;
  let randY = 0;

  while (true) {
    randX = Math.floor(Math.random() * maze.length);
    randY = Math.floor(Math.random() * maze[0].length);
    if (randX < maze.length - 2 || randY < maze[0].length - 2) continue;

    let cell = maze[randX][randY];
    cell.makeSolution();
    break;
  }

  return maze;
}

function Cell() {
  let visited = false;
  let position = [];
  let solution = false;

  let entranceOpen = {
    up: false,
    down: false,
    left: false,
    right: false
  };

  return {
    visited: () => visited,
    visit: () => {
      visited = true;
    },
    setPosition: (x, y) => (position = [x, y]),
    getPosition: () => position,
    openEntrance: (x, y) => {
      if (position[0] > x) {
        entranceOpen.left = true;
      } else if (position[0] < x) {
        entranceOpen.right = true;
      } else if (position[1] > y) {
        entranceOpen.up = true;
      } else {
        entranceOpen.down = true;
      }
    },
    entranceOpen: entrance => entranceOpen[entrance],
    makeSolution: () => (solution = true),
    solution: () => solution,
    getTotalOpen: () => {
      let num = 0;

      if (entranceOpen.up) {
        num++;
      }

      if (entranceOpen.down) {
        num++;
      }

      if (entranceOpen.left) {
        num++;
      }

      if (entranceOpen.right) {
        num++;
      }

      return num;
    },
    hasParallel: () => {
      if (entranceOpen.up && entranceOpen.down) {
        return true;
      } else if (entranceOpen.left && entranceOpen.right) {
        return true;
      } else {
        return false;
      }
    }
  };
}
