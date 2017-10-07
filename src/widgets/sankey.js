import * as d3 from 'd3';

/**
 * @param {object} opts 
 */
export default function Sankey(opts) {
    // load in arguments from config object
    this.data = opts.data;
    this.element = opts.element;
    // create the chart
    // this.draw();
};
