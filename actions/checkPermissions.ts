import fs from "fs";
import path from "path";

const ROUTER_DIR = path.join(__dirname, "../src/routers");
const IGNORED_FILES = new Set(["auth.ts", "socket.ts", "api.ts"]);

function checkFile(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8");
  const routeRegex = /router\.(get|post|put|delete|patch)\(([\s\S]*?)\);/g;
  let match;
  const missing: string[] = [];
  while ((match = routeRegex.exec(content)) !== null) {
    if (!match[2].includes("hasPermission")) {
      missing.push(match[0].trim());
    }
  }
  if (missing.length > 0) {
    console.log(`Missing hasPermission in ${filePath}:`);
    missing.forEach((r) => console.log(`  ${r}`));
  }
}

function walkDir(dir: string) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith(".ts") && !IGNORED_FILES.has(file)) {
      checkFile(filePath);
    }
  });
}

walkDir(ROUTER_DIR);
