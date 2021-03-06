import express = require("express")
import { Express, Request, Response } from 'express'
import { promises as fs } from 'fs'
import { fromSus } from 'sonolus-pjsekai-engine'
import { gzipSync } from 'zlib'
import syncGlob = require("glob")
import "colors"
import "ejs"
import fssync = require("fs")
import os = require("os")
import axios from 'axios'
import { createHash } from "crypto"

const app = express()
const version = JSON.parse(fssync.readFileSync("package.json", 'utf8'))["version"]
let engine = null

app.use(express.json())

// -- Config -------------------------------------------

const defaultConfig = {
  port: 5010,
  downloadPath: "%USERPROFILE%/Downloads"
}

async function getConfig(key: string = undefined): Promise<any> {
  if (!(await fs.stat(process.env.USERPROFILE + '/PotatoFarm.json').catch(() => false))) {
    await fs.writeFile(process.env.USERPROFILE + '/PotatoFarm.json', JSON.stringify(defaultConfig))
  }
  const text = await fs.readFile(process.env.USERPROFILE + '/PotatoFarm.json', 'utf8');
  const json = JSON.parse(text);
  if (key === undefined) return json
  return json[key] || defaultConfig[key]
}

async function setConfig(data: any) {
  const text = await fs.readFile(process.env.USERPROFILE + '/PotatoFarm.json', 'utf8');
  const json = JSON.parse(text);
  return await fs.writeFile(process.env.USERPROFILE + '/PotatoFarm.json',
    JSON.stringify({
      ...defaultConfig, ...json, ...data
    }))
}

// -- Functions ----------------------------------------

function replaceSlash(path: string) {
  return path.replace(/\\/g, '/')
}

function parseEnv(str: string) {
  return str.replace(/%([a-zA-Z0-9]+)%/g, function (_match, name) { return process.env[name]; });
}

function glob(pattern: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    syncGlob(pattern, (error: Error | null, result: string[]) => {
      if (error) reject(error)
      else resolve(result)
    })
  })
}

function streamMove(src: string, dest: string) {
  return new Promise((resolve, reject) => {
    fssync.createReadStream(src).pipe(fssync.createWriteStream(dest)).on('finish', async () => {
      await fs.unlink(src)
      resolve(null)
    }).on('error', reject)
  })
}

function printSection(section: string, color: string) {
  // @ts-ignore
  console.log("\n-- "[color] + section.trim()[color] + " " + "-".repeat(50 - section.length).grey)
}

function printWarn(content: string) {
  console.log("!) ".yellow + content)
}

function printInfo(content: string) {
  console.log("i) ".blue + content)
}
class Level {
  data: any
  id: string
  constructor(id: string, data: { title: string }) {
    this.id = id
    this.data = data
  }
  json() {
    return {
      "artists": "-",
      "author": "-",
      "bgm": {
        "type": "LevelBgm",
        "url": `/local/${this.id}/bgm`
      },
      "cover": {
        "type": "LevelCover",
        "url": `/local/${this.id}/jacket`
      },
      "data": {
        "type": "LevelData",
        "url": `/local/${this.id}/data`
      },
      "engine": engine,
      "name": this.id,
      "rating": 0,
      "title": this.data.title,
      "useBackground": {
        "useDefault": true
      },
      "useEffect": {
        "useDefault": true
      },
      "useParticle": {
        "useDefault": true
      },
      "useSkin": {
        "useDefault": true
      },
      "version": 1
    }
  }
}

// -- Sonolus endpoints --------------------------------

app.get('/info', async (req: Request, res: Response) => {
  printSection("Sonolus: /info", "green")
  let levels = []
  let levelFs = (await fs.readdir('./levels', {
    withFileTypes: true
  })).filter((dirent: fssync.Dirent) => dirent.isDirectory())
  for (let level of levelFs) {
    if ((await Promise.all(["data.sus", "bgm.*", "jacket.*"].map(async file => {
      if ((await glob(`./levels/${level.name}/${file}`)).length > 0) {
        return true
      } else {
        printWarn(`./levels/${level.name}/${file} ????????????????????????????????????`)
        return false
      }
    }))).every(e => e)) {

      printInfo(`./levels/${level.name} ???????????????????????????????????????????????????????????????`)
      let level_data = await fs.readFile(`./levels/${level.name}/data.sus`, 'utf8')
      levels.push(new Level(level.name, {
        title: level_data.match(/#TITLE\s+"(.*)"/)![1],
      }))
    }
  }
  res.send(JSON.stringify({
    levels: {
      items: levels.map(level => level.json()),
      options: [
        {
          name: "#KEYWORDS",
          placeholder: "#KEYWORDS",
          query: "keywords",
          type: "text"
        }
      ]
    },
    skins: [],
    backgrounds: [],
    particles: [],
    effects: [],
    engines: []
  }))
})

app.get('/levels/list', async (req: Request, res: Response) => {
  printSection("Sonolus: /levels/list", "green")
  let levels = []
  let levelFs = (await fs.readdir('./levels', {
    withFileTypes: true
  })).filter((dirent: fssync.Dirent) => dirent.isDirectory())
  for (let level of levelFs) {
    if ((await Promise.all(["data.sus", "bgm.*", "jacket.*"].map(async file => {
      if ((await glob(`./levels/${level.name}/${file}`)).length > 0) {
        return true
      } else {
        printWarn(`./levels/${level.name}/${file} ????????????????????????????????????`)
        return false
      }
    }))).every(e => e)) {

      printInfo(`./levels/${level.name} ???????????????????????????????????????????????????????????????`)
      let level_data = await fs.readFile(`./levels/${level.name}/data.sus`, 'utf8')
      levels.push(new Level(level.name, {
        title: level_data.match(/#TITLE\s+"(.*)"/)![1],
      }))
    }
  }
  res.send(JSON.stringify({
    items: levels.map(level => level.json()),
    pageCount: 1,
  }))
})

app.get("/levels/:id", async (req: Request, res: Response) => {
  printSection(`Sonolus: /levels/${req.params.id}`, "yellow")
  let level_data = await fs.readFile(`./levels/${req.params.id}/data.sus`, 'utf8')
  let title = level_data.match(/#TITLE\s+"(.*)"/)![1]
  printInfo(`./levels/${req.params.id} - ${title} ??????????????????????????????`)
  res.send(
    JSON.stringify({
      item: new Level(req.params.id, {
        title,
      }).json(),
      description: "",
      recommended: []
    }))
})

app.get("/local/:id/bgm", async (req: Request, res: Response) => {
  printSection(`Sonolus: /local/${req.params.id}/bgm`, "yellow")
  res.send(await fs.readFile((await glob(`./levels/${req.params.id}/bgm.*`))[0]))
})

app.get("/local/:id/jacket", async (req: Request, res: Response) => {
  printSection(`Sonolus: /local/${req.params.id}/jacket`, "yellow")
  let path: string | undefined = (await glob(`./levels/${req.params.id}/jacket.*`))[0]
  if (path) {
    printInfo(`${path} ???????????????????????????`)
    res.send(await fs.readFile(path))
  } else {
    printWarn(`${path} ????????????????????????????????????`)
    res.send(await fs.readFile(`public/empty.png`))
  }
})

app.get("/local/:id/data", async (req: Request, res: Response) => {
  printSection(`Sonolus: /local/${req.params.id}/data`, "yellow")
  printInfo(`./levels/${req.params.id}/data.sus ?????????????????????`)
  let data = await fs.readFile(`./levels/${req.params.id}/data.sus`, 'utf8')
  res.send(gzipSync(JSON.stringify(fromSus(data))))
})

// -- Download mover -----------------------------------

async function queryDownload() {
  for (let g of await glob(parseEnv(await getConfig("downloadPath")) + "/*.sus")) {
    if (Date.now() - (await fs.stat(g)).ctime.getTime() < 1500) {
      printSection(`Downloads`, "blue")
      printInfo(`${g} ??????????????????????????????`)
      let susData = await fs.readFile(g, 'utf8')
      let designer = susData.match(/#DESIGNER\s+"(.*)"/)![1]
      if (designer.length <= 0) {
        printWarn("?????????????????????????????????????????????")
        printWarn("????????????????????????????????????????????????????????????????????????????????????")
      } else {
        try {
          await fs.access(`./levels/${designer}`)
          printInfo(`${designer} ???????????????????????????./levels/${designer}/data.sus ?????????????????????`)
          await streamMove(g, `./levels/${designer}/data.sus`)
          printInfo(`?????????????????????`)
        } catch (e: any) {
          if (e.code === "ENOENT") {
            printWarn(`./levels/${designer} ????????????????????????????????????`)
            printWarn("??????????????????????????????????????????????????????????????????")
          } else {
            throw e
          }
        }
      }
    }
  }
}

// -- UI -----------------------------------------------

app.use(express.static('public'));

app.get("/", async (_req: Request, res: Response) => {
  printSection("UI: /", "magenta")
  let levels = []
  let levelFs = (await fs.readdir('./levels', {
    withFileTypes: true
  })).filter(dirent => dirent.isDirectory())
  printInfo("?????????????????????????????????")
  for (let level of levelFs) {
    let existFiles = (await Promise.all(["data.sus", "bgm.*", "jacket.*"].map(async file => {
      if ((await glob(`./levels/${level.name}/${file}`)).length > 0) {
        return true
      } else {
        printWarn(`./levels/${level.name}/${file} ????????????????????????????????????`)
        return false
      }
    })))

    // printInfo(`./levels/${level.name} ???????????????????????????????????????????????????????????????`)
    let data: LevelData = {
      name: level.name,
      title: undefined,
      size: undefined,
      editor: undefined,
    }

    if (existFiles[0]) {
      let levelData = await fs.readFile(`./levels/${level.name}/data.sus`, 'utf8')
      data.title = levelData.match(/#TITLE\s+"(.*)"/)?.[1] || "?"
      data.size = levelData.length
      if (levelData.match(/^This file was generated by (.*)\./)) {
        data.editor = levelData.match(/^This file was generated by (.*)\./)![1]
      } else {
        data.editor = "?"
      }
    } else {
      data.title = "???"
      data.size = "?"
      data.editor = "?"
    }

    levels.push(data)

  }
  res.render("index.ejs", {
    levels,
    defaultConfig,
    file: replaceSlash(process.env.USERPROFILE + '/PotatoFarm.json'),
    config: await getConfig(),
  });
})

app.post("/ui/config", async (req: Request, res: Response) => {
  printSection("UI: /ui/config", "magenta")
  printInfo("?????????????????????????????????")
  await setConfig(req.body)
  printInfo("??????????????????????????????")
  res.send(JSON.stringify({ "status": "ok" }))
})

// -- Main ---------------------------------------------

function tryListen(port: number, tries: number) {
  return new Promise((resolve, reject) => {
    app.listen(port, "0.0.0.0", async () => {
      resolve(null)
      const ip = Object.values(os.networkInterfaces()).flat().filter(({
        // @ts-ignore
        family,
        // @ts-ignore
        internal
      }) => family === "IPv4" && !internal)[0]
      printSection("System: Hello!", "red")
      printInfo(`PotatoFarm v${version}??????????????????`)
      printInfo(``)
      printInfo(`Sonolus???????????????????????????URL????????????????????????????????????`)
      // @ts-ignore
      printInfo("  " + `http://${ip.address}:${port}`.underline)
      printInfo(`???????????????????????????????????????????????????????????????URL???????????????????????????`)
      // @ts-ignore
      printInfo("  " + `http://localhost:${port}`.underline)
      if (tries !== 0) {
        printWarn("")
        printWarn(`????????? ${port - tries} ????????????????????????${port} ??????????????????????????????`)
        printWarn(`????????? ${port - tries} ??????????????????????????????????????????????????????????????????????????????`)
        printWarn("")
      }
      printInfo(``)
      printInfo(`Ctrl+C?????????????????????`)
      printInfo(``)
      printInfo(`Created by ` + `????????????(@sevenc-nanashi)`.blue)
      printInfo(``)

      try {
        await fs.access(`./levels`)
      } catch {
        await fs.mkdir(`./levels`)
        printInfo(`levels??????????????????????????????????????????`)
      }
    }).on("error", reject)
  })
}

async function setEngine() {
  engine = JSON.parse(
    JSON.stringify(
      (await axios.get("https://servers.purplepalette.net/engines/pjsekai")).data
    ).replace(/"\//g, '"https://servers.purplepalette.net/')
  ).item
  engine.effect.data.url = "/se.gz"
  engine.effect.data.hash = createHash("sha1").update(await fs.readFile("./public/se.gz")).digest("hex")
}

async function main() {
  setInterval(queryDownload, 1000)
  setEngine()
  for (let i = 0; i < 10; i++) {
    let port = (await getConfig("port")) + i
    try {
      await tryListen(port, i)
      break
    } catch (e: any) {
      if (e.code === "EADDRINUSE") {
        continue
      } else {
        throw e
      }
    }
  }
}

if (require.main === module) {
  main()
}

// -- Types --------------------------------------------

interface LevelData {
  name: string | undefined
  title: string | undefined
  size: string | number | undefined
  editor: string | undefined
}
