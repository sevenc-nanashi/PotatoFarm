import * as esbuild from "esbuild"
import fs from "fs/promises"

await fs.mkdir("./dist", { recursive: true })
await fs.copyFile("./app.ts", "./dist/app.ts")

let base = await fs.readFile("./app.ts", "utf-8")

base = base.replace(
  "await fs.readFile(`public/empty.png`)",
  "Buffer.from(`" +
    (await fs.readFile("public/empty.png", "base64")) +
    "`, `base64`)"
)

base = base.replace(
  'await fs.readFile("./views/index.ejs")',
  "Buffer.from(`" +
    (await fs.readFile("./views/index.ejs")).toString("base64") +
    "`, `base64`)"
)
base = base.replace('from "./package.json"', 'from "../package.json"')

await fs.writeFile("./dist/app.ts", base)

await esbuild.build({
  entryPoints: ["./dist/app.ts"],
  bundle: true,
  outfile: "dist/app.js",
  platform: "node",
  target: "node18",
})
