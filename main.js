let population;
let maze;
let nodeMap;
let fitnessMap;
let solution;
let moveSet = ["up", "down", "left", "right"];

let config = {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Best Fitness",
        backgroundColor: "rgb(255, 99, 132)",
        borderColor: "rgb(255, 99, 132)",
        data: [],
        fill: false
      },
      {
        label: "Average Fitness",
        fill: false,
        backgroundColor: "rgb(54, 162, 235)",
        borderColor: "rgb(54, 162, 235)",
        data: []
      }
    ]
  },
  options: {
    responsive: true,
    title: {
      display: true,
      text: "Chart.js Line Chart"
    },
    tooltips: {
      mode: "index",
      intersect: false
    },
    hover: {
      mode: "nearest",
      intersect: true
    },
    scales: {
      xAxes: [
        {
          display: true,
          scaleLabel: {
            display: true,
            labelString: "Generation"
          }
        }
      ],
      yAxes: [
        {
          display: true,
          scaleLabel: {
            display: true,
            labelString: "Fitness"
          }
        }
      ]
    }
  }
};

let ctx = document.getElementById("myChart").getContext("2d");
window.myLine = new Chart(ctx, config);

function setup() {
  createCanvas(500, 500);
  console.log("Generating Maze...");
  console.time("time");
  maze = new Maze(20, 20);
  console.timeEnd("time");

  console.log("Generating Node Map...");
  console.time("time");
  nodeMap = NodeMap(maze);
  console.timeEnd("time");

  console.log("Generating Fitness Map...");
  console.time("time");
  fitnessMap = FitnessMap(nodeMap);
  console.timeEnd("time");

  console.log("Rendering Maze...");
  console.time("time");
  renderMaze();
  console.timeEnd("time");
  population = new Population(50, 0.1, 300, maze, fitnessMap, nodeMap, moveSet);
}

function draw() {
  renderMaze();
  population.run();
  renderFitnessMap();

  if (!population.stepAgain()) {
    population.selection();
    population.generate();
    population.resetStep();
  }
}

function renderMaze() {
  background(255);
  for (let x = 0; x < maze.length; x++) {
    for (let y = 0; y < maze[x].length; y++) {
      let cell = maze[x][y];

      stroke(100);
      point(x * 3 + 1, y * 3 + 1);
      stroke(0);
      point(x * 3, y * 3);
      point(x * 3 + 2, y * 3);
      point(x * 3, y * 3 + 2);
      point(x * 3 + 2, y * 3 + 2);

      if (!cell.entranceOpen("up")) {
        point(x * 3 + 1, y * 3);
      }

      if (!cell.entranceOpen("down")) {
        point(x * 3 + 1, y * 3 + 2);
      }

      if (!cell.entranceOpen("left")) {
        point(x * 3, y * 3 + 1);
      }

      if (!cell.entranceOpen("right")) {
        point(x * 3 + 2, y * 3 + 1);
      }

      // if (solution.includes(nodeMap[x][y])) {
      //   stroke(0, 0, 255);
      //   point(x * 3 + 1, y * 3 + 1);
      // }

      if (nodeMap[x][y] !== null) {
        stroke(0, 255, 0);
        point(x * 3 + 1, y * 3 + 1);
      }

      if (maze[x][y].solution()) {
        stroke(0, 255, 255);
        point(x * 3 + 1, y * 3 + 1);
      }
    }
  }
}

function renderFitnessMap() {
  for (let x = 0; x < nodeMap.length; x++) {
    for (let y = 0; y < nodeMap[x].length; y++) {
      if (fitnessMap[x][y] !== null) {
        noStroke();
        fill(0, 0, 255);
        textSize(1);
        text(`${fitnessMap[x][y]}`, x * 3 + 1, y * 3 + 2);
      }
    }
  }
}
