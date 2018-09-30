let date = [3,14,6];
const CreatedDiv = d3.select('body').append('div')
    .attr('class', 'dyc_SVG')
    ;

CreatedDiv.append('svg')
    .attr("width",window.innerWidth)
    .attr("height",window.innerHeight)
    .append('rect')
    .attr('width',100)
    .attr('height',200)
    .attr('x',500)
    .attr('y',200);
