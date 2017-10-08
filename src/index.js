
// import myNetwork from './my-network';
// import mySankey from './my-sankey';
// myNetwork();
// mySankey();

// import Chart from './constructors/chart';
import Chart from './widgets/chart';
import Network from './widgets/network.canvas';
import Sankey from './widgets/sankey';

const dataNetwork = require('json-loader!./data-network.json');
const dataSankey = require('json-loader!./data-sankey.json');
const dataChart = [
    [new Date(2016, 0, 1), 10],
    [new Date(2016, 1, 1), 70],
    [new Date(2016, 2, 1), 30],
    [new Date(2016, 3, 1), 10],
    [new Date(2016, 4, 1), 40],
];

let chart = new Chart({
    element: document.querySelector('.chart-container'),
    data: dataChart,
});
// console.log(chart);

let network = new Network({
    element: document.getElementById('canvas'),
    data: dataNetwork,
});

let a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
let src = a[Math.floor(a.length * Math.random())];
let dst = a[Math.floor(a.length * Math.random())];
network.add(src, dst);

setInterval(fire, 1000);

// console.log(network);

let sankey = new Sankey({
    element: document.querySelector('.sankey-container'),
    data: dataSankey,
});
// console.log(sankey);
