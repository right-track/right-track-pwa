'use strict';

const fs = require('fs');
const path = require('path');

const ASSET_LINKS_PATH = 'assetlinks.json';
const STATIC_DIR = './static';

if ( fs.existsSync(ASSET_LINKS_PATH) ) {
    console.log("--> CREATING ASSET LINKS...")
    try {
        let asset_links = JSON.parse(fs.readFileSync(ASSET_LINKS_PATH, 'utf8'));
        for ( let i = 0; i < asset_links.length; i++ ) {
            let directory = path.resolve(__dirname, STATIC_DIR, asset_links[i].directory);
            let content = asset_links[i].content;

            console.log("    ... writing assetlinks.json to " + directory);
            fs.mkdirSync(directory, {recursive: true});
            fs.writeFileSync(
                path.resolve(directory, "assetlinks.json"),
                JSON.stringify(content, null, 2)
            );
        }
    }
    catch (err) {
        console.log(err);
    }
}

