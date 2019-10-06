//const js_svg_path = require('js-svg-path');
//const svg_parser = require('svg-parser');
const fs = require('fs');

const window = require('svgdom')
const SVG = require('svg.js')(window)
const document = window.document

function transformPoint(point, viewbox) {
    point.x = point.x - viewbox.width / 2;
    point.y = viewbox.height / 2 - point.y;
    return point;
}

function processSvgPath(path, viewbox) {
    let processed = {
        color: (path.node.style && path.node.style.fill) || '#FFFFFF',
        points: [] 
    };
    let length = path.length();
    let stepCount = 40;
    let step = length / stepCount;
    //console.log(`Length: ${length}`);
    for (let i = 0; i < stepCount; i++) {
        let t = step * i;
        processed.points.push(transformPoint(path.pointAt(t), viewbox));
        //console.log(`PointAt(${t}): ${path.pointAt(t).x}, ${path.pointAt(t).y}`);
    }
    return processed;
}

function processSvg(data) {
    let processed = { paths: [] };
    data.children().forEach(node => {
        if (node.type === 'svg') {
            let viewbox = node.viewbox();
            node.children().forEach(node2 => {
                if (node2.type === 'path') {
                    processed.paths.push(processSvgPath(node2, viewbox));
                }
            });
        }
    });
    return processed;
}

function processSvgFile(filePath) {
    console.log(`Processing file: ${filePath}...`);

    try {
        let data = fs.readFileSync(filePath, 'utf8');
        let element = document.createElement('svg');
        let canvas = SVG(element);
        let parsedData = canvas.svg(data);
        let processed = processSvg(parsedData);
        processed.name = require('path').basename(filePath, '.svg');
        return processed;
    }
    catch(e) {
        console.log(`Error: ${e}`, e.stack);
    }
}

module.exports.processSvgFiles = function(folderPath) {
    let processed = [];
    for (const file of fs.readdirSync(folderPath)) {
        let processedFile = processSvgFile(require('path').join(folderPath, file));
        if (processedFile) {
            processed.push(processedFile);
        }
    }
    return processed;
}
