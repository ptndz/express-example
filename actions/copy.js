const shell = require("shelljs");
const fs = require("fs");

const packageJson = JSON.parse(fs.readFileSync("package.json"));
const dependencies = packageJson.dependencies;
const type = packageJson.type;
const version = packageJson.version;

fs.writeFileSync(
	"./build/package.json",
	JSON.stringify({
		main: "./index.js",
		type: version,
		version: "0.0.1",
		scripts: {
			start: "node ./index.js",
		},
		dependencies: dependencies,
	})
);

shell.cp("-R", ["public"], "build/public");
