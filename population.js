const map = (value, x1, y1, x2, y2) =>
  ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;

function Population(
  popMax,
  muationRate,
  lifeSpan,
  maze,
  fitnessMap,
  nodeMap,
  moveset
) {
  let population = [];
  let matingPool = [];
  let step = 0;
  let generation = 0;

  for (let i = 0; i < popMax; i++) {
    population[i] = new MazeRunner(lifeSpan, moveset);
  }

  this.run = () => {
    for (let i = 0; i < population.length; i++) {
      stroke(255, 0, 0, 150);
      population[i].update(step, maze);
      population[i].render();
    }
    step++;
  };

  this.selection = () => {
    matingPool = [];
    let maxFitness = 0;
    let bestRunner = null;
    for (let i = 0; i < population.length; i++) {
      bestRunner =
        population[i].fitness(fitnessMap, nodeMap, maze) > maxFitness
          ? population[i]
          : bestRunner;
      maxFitness =
        population[i].fitness(fitnessMap, nodeMap, maze) > maxFitness
          ? population[i].fitness(fitnessMap, nodeMap, maze)
          : maxFitness;
    }

    console.log(maxFitness, "Max fitness", bestRunner.incorrectMoves());

    for (let i = 0; i < population.length; i++) {
      let fitness = map(
        population[i].fitness(fitnessMap, nodeMap, maze),
        0,
        maxFitness,
        0,
        1
      );

      let n = Math.floor(Math.pow(3, fitness * 10));
      for (let j = 0; j < n; j++) {
        matingPool.push(population[i]);
      }
    }

    config.data.labels.push(`${generation}`);
    config.data.datasets["0"].data.push(maxFitness);
    config.data.datasets["1"].data.push(this.getAverageFitness());
    myLine.update();
  };

  this.generate = () => {
    population = [];
    for (let i = 0; i < popMax; i++) {
      let parentA = matingPool[Math.floor(Math.random() * matingPool.length)];
      let parentB = matingPool[Math.floor(Math.random() * matingPool.length)];

      let child = parentA.crossover(parentB);
      child.mutate(muationRate, parentA.getIncorrenctMoves());
      population[i] = child;
    }
    generation++;
  };

  this.stepAgain = () => step < lifeSpan;

  this.resetStep = () => (step = 0);

  this.getAverageFitness = () => {
    let averageFitness = 0;
    for (let i = 0; i < population.length; i++) {
      averageFitness += population[i].fitness(fitnessMap, nodeMap, maze);
    }
    return averageFitness / population.length;
  };

  this.population = () => population;
}

//Generate a map of fitness values based off of solving patterns
function FitnessMap(nodeMap) {
  let fitnessMap = [];
  for (let x = 0; x < nodeMap.length; x++) {
    fitnessMap[x] = [];
    for (let y = 0; y < nodeMap[x].length; y++) {
      if (nodeMap[x][y] !== null) {
        fitnessMap[x][y] = DepthFirstSearch([x, y], nodeMap).length - 1;
        resetNodeMap(nodeMap);
      } else {
        fitnessMap[x][y] = null;
      }
    }
  }

  let visualFitnessMap = [];

  for (let x = 0; x < fitnessMap.length; x++) {
    visualFitnessMap[x] = [];
    for (let y = 0; y < fitnessMap[x].length; y++) {
      visualFitnessMap[x][y] = fitnessMap[y][x];
    }
  }

  console.log(visualFitnessMap);

  return fitnessMap;
}

//Resets all nodes in nodemap to unvisited state
function resetNodeMap(nodeMap) {
  for (let x = 0; x < nodeMap.length; x++) {
    for (let y = 0; y < nodeMap[x].length; y++) {
      if (nodeMap[x][y] !== null) {
        nodeMap[x][y].reset();
      }
    }
  }
}

//Pathfinding algorithm
function DepthFirstSearch(position, nodeMap) {
  let [x, y] = position;

  let stack = [];

  do {
    let node = nodeMap[x][y];
    let neighbors = [];
    if (!node.visited()) {
      stack.push(node);
    }
    node.visit();

    if (node.solution()) break;

    let tempX = x;
    let tempY = y - 1;

    if (node.connection("up")) {
      while (nodeMap[tempX][tempY] == null) {
        tempY--;
      }

      if (!nodeMap[tempX][tempY].visited()) {
        neighbors.push(nodeMap[tempX][tempY]);
      }
    }
    if (node.connection("down")) {
      tempX = x;
      tempY = y + 1;
      while (nodeMap[tempX][tempY] == null) {
        tempY++;
      }

      if (!nodeMap[tempX][tempY].visited()) {
        neighbors.push(nodeMap[tempX][tempY]);
      }
    }
    if (node.connection("left")) {
      tempX = x - 1;
      tempY = y;
      while (nodeMap[tempX][tempY] == null) {
        tempX--;
      }

      if (!nodeMap[tempX][tempY].visited()) {
        neighbors.push(nodeMap[tempX][tempY]);
      }
    }
    if (node.connection("right")) {
      tempX = x + 1;
      tempY = y;
      while (nodeMap[tempX][tempY] == null) {
        tempX++;
      }

      if (!nodeMap[tempX][tempY].visited()) {
        neighbors.push(nodeMap[tempX][tempY]);
      }
    }

    if (neighbors.length !== 0) {
      let nextNode = neighbors[Math.floor(Math.random() * neighbors.length)];

      x = nextNode.position()[0];
      y = nextNode.position()[1];
    } else if (stack.length !== 0) {
      stack.pop();
      let nextNode = stack[stack.length - 1];
      x = nextNode.position()[0];
      y = nextNode.position()[1];
    } else {
      console.log("No solution found :(");
      if (node.connection("up")) {
        console.log(nodeMap[x][y - 1].visited());
      }

      if (node.connection("down")) {
        console.log(nodeMap[x][y + 1].visited());
      }

      if (node.connection("left")) {
        console.log(nodeMap[x - 1][y].visited());
      }

      if (node.connection("right")) {
        console.log(nodeMap[x + 1][y].visited());
      }
      break;
    }
  } while (true);

  return stack;
}

// Generate a map of key decision points to increase processing speeds
function NodeMap(maze) {
  //Create nodemap that will be used for the Depth First Search algorithm
  let nodeMap = [];
  for (let x = 0; x < maze.length; x++) {
    nodeMap[x] = [];
    for (let y = 0; y < maze[x].length; y++) {
      nodeMap[x][y] = null;
    }
  }

  //Loop through maze and decide if a cell needs a node
  for (let x = 0; x < maze.length; x++) {
    for (let y = 0; y < maze[x].length; y++) {
      let cell = maze[x][y]; //Get node from map
      let cellDecisions = cell.getTotalOpen(); //This is a list of all possible decisions that can be made from this node.

      // //Check if this is starting cell
      // if (cell.getPosition() === [0, 0]) {
      //   nodeMap[x][y] = new NNode(false, [x, y]);
      // }

      // //Check if cell is a "junction" (has 3 or more decisions)
      // if (cellDecisions >= 3) {
      //   nodeMap[x][y] = new NNode(false, [x, y]);
      // }

      // //Check that corridor has 2 perpendicular possible decisions
      // if (cellDecisions == 2 && !cell.hasParallel()) {
      //   //Check if cell is the start of a corridor
      //   if (x - 1 !== -1) {
      //     if (!maze[x - 1][y].entranceOpen("right")) {
      //       nodeMap[x][y] = new NNode(false, [x, y]);
      //     }
      //   } else {
      //     nodeMap[x][y] = new NNode(false, [x, y]);
      //   }

      //   //Check if cell is the end of a corridor
      //   if (x + 1 !== maze.length || x + 1 === undefined) {
      //     if (!maze[x + 1][y].entranceOpen("left")) {
      //       nodeMap[x][y] = new NNode(false, [x, y]);
      //     }
      //   } else {
      //     nodeMap[x][y] = new NNode(false, [x, y]);
      //   }
      // }

      // //Check if cell is a dead end (1 possible decision)
      // if (cellDecisions == 1) {
      //   nodeMap[x][y] = new NNode(false, [x, y]);
      // }

      nodeMap[x][y] = new NNode(false, [x, y]);

      //Check if this is ending cell
      if (cell.solution()) {
        nodeMap[x][y] = new NNode(true, [x, y]);
      }
    }
  }

  //Connect nodes
  for (let x = 0; x < nodeMap.length; x++) {
    for (let y = 0; y < nodeMap[x].length; y++) {
      if (nodeMap[x][y] !== null) {
        let cell = maze[x][y];

        if (cell.entranceOpen("up")) {
          nodeMap[x][y].openConnection("up");
        }

        if (cell.entranceOpen("down")) {
          nodeMap[x][y].openConnection("down");
        }

        if (cell.entranceOpen("left")) {
          nodeMap[x][y].openConnection("left");
        }

        if (cell.entranceOpen("right")) {
          nodeMap[x][y].openConnection("right");
        }
      }
    }
  }
  let visualNodeMap = [];

  for (let x = 0; x < nodeMap.length; x++) {
    visualNodeMap[x] = [];
    for (let y = 0; y < nodeMap[x].length; y++) {
      visualNodeMap[x][y] = nodeMap[y][x];
    }
  }

  // console.log(visualNodeMap);
  return nodeMap;
}

//A node inside the nodemap
function NNode(solution, position) {
  let visited = false;
  let connections = {
    left: false,
    right: false,
    up: false,
    down: false
  };

  return {
    position: () => position,
    openConnection: connection => (connections[connection] = true),
    solution: () => solution,
    visit: () => (visited = true),
    visited: () => visited,
    connection: connection => connections[connection],
    reset: () => (visited = false)
  };
}
