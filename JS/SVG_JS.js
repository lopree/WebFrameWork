let date = [3,14,6];
const CreatedDiv = d3.select('body').append('div')
    .attr('class', 'dyc_SVG');

CreatedDiv.append('svg')
    .attr("width",window.innerWidth)
    .attr("height",window.innerHeight)
    .append('rect')
    .attr('width',50)
    .attr('height',50)
    .attr('x',10)
    .attr('y',10);
