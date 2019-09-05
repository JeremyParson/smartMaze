function neg(num) {
  return Math.abs(num) + num === 0 ? true : false;
}

function MazeRunner(lifespan, moveset) {
  let genes = [];
  let position = [0, 0];
  let stop = false;
  let stopStep = 0;
  let incorrectMoves = 0;
  let incorrectMovesArr = [];

  for (let i = 0; i < lifespan; i++) {
    genes[i] = moveset[Math.floor(Math.random() * moveset.length)];
  }

  this.mutate = (mutationRate, incorrectMoves) => {
    for (let i = 0; i < genes.length; i++) {
      if (!incorrectMoves[i]) {
        genes[i] =
          Math.random() < mutationRate
            ? moveset[Math.floor(Math.random() * moveset.length)]
            : genes[i];
      } else {
        genes[i] = moveset[Math.floor(Math.random() * moveset.length)];
      }
    }
  };

  this.update = (step, maze) => {
    incorrectMovesArr[step] = false;
    if (!stop) {
      let [x, y] = position;
      if (genes[step] === moveset[0]) {
        if (y - 1 !== -1) {
          if (maze[x][y - 1].entranceOpen("down")) {
            y -= 1;
          } else {
            incorrectMovesArr[step] = true;
            incorrectMoves++;
          }
        }
      } else if (genes[step] === moveset[1]) {
        if (y + 1 !== maze[0].length) {
          if (maze[x][y + 1].entranceOpen("up")) {
            y += 1;
          } else {
            incorrectMovesArr[step] = true;
            incorrectMoves++;
          }
        }
      } else if (genes[step] === moveset[2]) {
        if (x - 1 !== -1) {
          if (maze[x - 1][y].entranceOpen("right")) {
            x -= 1;
          } else {
            incorrectMovesArr[step] = true;
            incorrectMoves++;
          }
        }
      } else {
        if (x + 1 !== maze.length) {
          if (maze[x + 1][y].entranceOpen("left")) {
            x += 1;
          } else {
            incorrectMovesArr[step] = true;
            incorrectMoves++;
          }
        }
      }

      position = [x, y];
      stopStep = step;
      if (maze[x][y].solution()) {
        stop = true;
      }
    }
  };

  this.crossover = parent => {
    let crossSection = Math.floor(Math.random() * genes.length);
    let parentA = parent.getGenes();
    let parentB = genes;

    let childGenes = [];

    for (let i = 0; i < genes.length; i++) {
      childGenes[i] = i < crossSection ? parentA[i] : parentB[i];
    }

    let child = new MazeRunner(lifespan, moveset);

    child.setGenes(childGenes);

    return child;
  };

  this.fitness = (fitnessMap, nodeMap, maze) => {
    /*
    Fitness factors:
      How many steps you used
        - If you reached the goal then the amount of movement points taken
          is decreased by 50%
      Your positional fitness based off of fitness map (how far are you from finish)
    */
    let [x, y] = position;
    let positionalFitness = fitnessMap[x][y];
    while (positionalFitness === null) {
      if (maze[x][y].entranceOpen("down")) {
        y++;
      } else if (maze[x][y].entranceOpen("right")) {
        x++;
      } else if (maze[x][y].entranceOpen("up")) {
        y--;
      } else if (maze[x][y].entranceOpen("left")) {
        x--;
      }
      positionalFitness = fitnessMap[x][y];
    }
    let stopStepMax = fitnessMap[0][0] * fitnessMap[0][0];

    let stopStepRatio = fitnessMap[0][0] * positionalFitness;

    let stopStepPointDeduction = map(stopStepRatio, 0, stopStepMax, 0, 50);

    let stopStepPoints = Math.floor(50 - stopStepPointDeduction);

    let fitness = fitnessMap[0][0] - positionalFitness;
    fitness += stopStepPoints;
    fitness = neg(fitness) ? 1 : fitness;
    if (stop) {
      fitness = fitness + 50;
    }
    return fitness;
  };

  this.render = () => {
    let [x, y] = position;
    x = x * 3 + 1;
    y = y * 3 + 1;
    point(x, y);
  };

  this.setGenes = newgenes => (genes = newgenes);

  this.getGenes = () => genes;

  this.setPosition = (x, y) => (position = [x, y]);

  this.getIncorrenctMoves = () => incorrectMoves;

  this.incorrectMoves = () => incorrectMovesArr;
}
