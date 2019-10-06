const svg_process = require('./svg-process');
const fbx_export = require('./fbx-export');

async function main() {
    console.log('Processing work files...');
    let processed = svg_process.processSvgFiles(require('path').join(__dirname, '../work'));
    console.log(`Done. Processed ${processed.length} file(s) successfully.`);
    console.log('Exporting to FBX...');
    fbx_export.exportFbxFiles(require('path').join(__dirname, '../export'), processed);
    console.log('Done.');
}

main();