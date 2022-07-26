const prompt = require('prompt');
const fs = require('fs');
const extract = require('extract-zip');
const { resolve } = require('path');
const { readdir } = require('fs').promises;
const ext = __dirname+"\\extract\\";
const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gm



// https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
// qwtel | answered Jul 16, 2017 at 16:42
async function* getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else {
      yield res;
    }
  }
}

// nx2#9999
(async()=>{
    if(fs.existsSync(ext)) fs.rmSync(ext, { recursive: true });
    fs.mkdirSync(ext);

    const { path } = await prompt.get(["path"])    
    await extract(path.replace(/\"/gmi,""), { dir: ext });

    if(fs.existsSync(ext+"META-INF")) fs.rmSync(ext+"META-INF\\", { recursive: true });
    console.log("Looking for URLs in "+path)
    for await (const f of getFiles(ext)) {
       let content = fs.readFileSync(f);
       let matches = content.toString().match(regex);
       if(!matches) continue;
       console.log("\n\nFound in `"+f.replace(ext,"")+"`:")
       for(let o of matches) console.log("`"+o+"`")
    }
})();