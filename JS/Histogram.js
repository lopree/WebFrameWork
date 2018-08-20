//1.绘制静态直方图图表
const Width = 800, Height = 400;
const TWidth = 400, THeight = 400;
//在index.html中次脚本的引用晚于MyD3JS.js,因此可以获取到那个脚本中创建的div
const TableCanvas = d3.select(document.body).select("div")
    .append("svg").attr("id", "Table01").attr("class", "TableSVG")
    .attr("width", Width).attr("height", Height);

//获得对应CSS文件中的class中的属性---并且该属性可修改（可读可写）
const table01 = document.getElementById("Table01");
//返回字符串,转换成float
const readPadding = getComputedStyle(table01, null).padding;
const Table_padding = parseFloat(readPadding);

//定义X轴和Y轴
const xAxisWidth = TWidth - 2 * Table_padding;
const yAxisWidth = THeight - 2 * Table_padding;

//console.log(readPadding);//20px
//console.log(xAxisWidth);//360
//上一个直方图的左边距离下一个直方图左边的距离
const rectStep = 35;
//直方图宽度,即两个直方图之间的间隔为5
const rectWidth = 30;
//绘制坐标轴容器
const GXAxis = TableCanvas.append('g')
    .attr("transform", "translate(" + (Table_padding) + "," + (THeight - Table_padding) + ")");
const GYAxis = TableCanvas.append('g')
    .attr('id', 'yaxis')
    .attr("transform", "translate(" + (Table_padding) + "," + (THeight - Table_padding - yAxisWidth) + ")");

//生成比例尺
//domain()坐标刻度数量，对应后面的像素点，即0-->8px,10-->378px,刻度间距为(378-8)/10
const xScale = d3.scaleBand().domain(pDATAArray.map((d, i) => i + 1)).range([0, xAxisWidth]).padding(0.1);
const yScale = d3.scaleLinear().domain([0, d3.max(pDATAArray)]).rangeRound([yAxisWidth, 0]);


//生成坐标轴,以及改变里面元素的属性
const xAxis = d3.axisBottom(xScale);
const yAxis = d3.axisLeft(yScale);
GXAxis.call(xAxis);
GYAxis.call(yAxis).selectAll('text').attr('class', 'yAxisText');

const RectStyle = obj => {
    obj.attr("fill", "steelblue")
        .attr('id','table')
        .attr('class','TableRect')
        .attr("x", (d, i) => {
            return Table_padding + xScale(i + 1)
        })
        .attr("y", (d) => {
            return THeight - Table_padding - (yScale(0) - yScale(d))
        })
        .attr("width", xScale.bandwidth())
        .attr("height", (d) => {
            return yScale(0) - yScale(d)
        });
};
const TextStyle = obj => {
    obj.attr("class", "DataText")
        .attr("x", (d, i) => {
            return Table_padding + xScale(i + 1)
        })
        .attr("y", (d) => {
            return THeight - Table_padding - (yScale(0) - yScale(d))
        })
        .text((d) => {
            return d
        })
        .attr("dx", xScale.bandwidth() / 2)
        .attr("dy", "1em");
};

//初始化生成函数
function init_Table(dataSource) {
    RectStyle(TableCanvas.selectAll(".TableRect").data(dataSource).enter().append("rect"));

    TextStyle(TableCanvas.selectAll(".DataText").data(dataSource).enter().append("text"));
}
//更新方法
function update_Table(newDataSource) {
    const dataArray = TableCanvas.selectAll(".TableRect").nodes();
    const newTable = TableCanvas.selectAll(".TableRect").data(newDataSource);

    TextStyle(TableCanvas.selectAll(".DataText").data(newDataSource));
    //当新的数据长度小于原来数据长度，则删除多余的直方；新数据长度多余元数据时，将新的数据添加进去
    if (newDataSource.length <= dataArray.length) {
        RectStyle(newTable);
        newTable.exit().remove();
    } else {
        RectStyle(newTable.enter().append('rect'));
        TextStyle(newTable.enter().append("text"));
    }

}