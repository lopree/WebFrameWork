const CreatedDiv = d3.select('body').append('div')
    .attr('class', 'dyc_SVG');

const  div_nodes_SVG = CreatedDiv.nodes()[0];

let url = "Resources/我的主页.svg";

function loadSVG(xmlAdr) {
    //console.log(div_nodes_SVG);
    return new Promise((resolve) => {
        const importSVG_Home = d3.xml(xmlAdr).then(xml=>{
            div_nodes_SVG.appendChild(xml.documentElement);
            //console.log("load SVG Done!");
        });
        //console.log("Start load SVG");
        resolve(importSVG_Home);
    })
}

async function CreatSVG(SVGAdr) {
    //console.log("Start Script");
    const SVG_Home = await loadSVG(SVGAdr);
    let Get_SVG_Home = d3.select('.icon_home').nodes()[0];
    Get_SVG_Home.style.width = '50';
    Get_SVG_Home.style.height = '50';
    let svg_path = d3.selectAll('path');
    //console.log("Catch SVG");
    // return SVG_Home;
}

