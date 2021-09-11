require("source-map-support").install({
    environment: "node",
    hookRequire: true,
    handleUncaughtExceptions: true
});

const path = require("path");
const fs = require("fs");
const webpack = require("webpack");

function bundle(name, entry, dest) {
    return new Promise((resolve, reject) => {
        const opts = {
            entry,
            target: "node",
            output: {
                library: name,
                libraryTarget: "umd",
                filename: `${name}.min.js`,
                path: dest
            },
            resolve: { symlinks: false }
        };

        webpack(opts).run((err, stats) => {
            if (err || stats.hasErrors()) {
                if (err) console.log(err);
                else {
                    if ((((stats || {}).compilation || {}).errors || []).length)
                        stats.compilation.errors.forEach((err) => {
                            console.log(err);
                        });
                    else console.log("Unknown bundling error for module: " + name);
                }
                reject(false);
                return;
            }
            resolve(true);
        });
    });
}

function startBuild() {
    const modules = [
        {
            name: "ytdl-core",
            dist: "lib",
            file: "index.js"
        },
        {
            name: "youtube-sr",
            dist: "build",
            file: "main.js"
        }
    ];

    for (const mod of modules) {
        const dest = path.join(__dirname, "dist", `${mod.name}.min.js`);
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        const entry = path.join(__dirname, "node_modules", mod.name, mod.dist, mod.file);

        bundle(mod.name, entry, path.join(__dirname, "dist"))
            .then((resp) => {
                if (resp) {
                    console.log(`[OK] Bundled ${mod.name} successfully!`);
                } else {
                    console.log(`[ERROR] Could not bundle ${mod.name}!`);
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }
}

startBuild();
