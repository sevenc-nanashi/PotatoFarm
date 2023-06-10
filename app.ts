import express from "express"
import { Request, Response } from "express"
import { promises as fs } from "fs"
import { fromSus } from "sonolus-pjsekai-engine-extended"
import { gzipSync } from "zlib"
import { glob } from "glob"
import "@colors/colors"
import ejs from "ejs"
import * as fssync from "fs"
import * as os from "os"
import axios from "axios"
import lastModified from "recursive-last-modified"
import { EngineItem, ServerInfo } from "sonolus-core"
import path from "path"
import { version } from "./package.json"

const app = express()
let engine: EngineItem = {} as EngineItem

const HOME = process.env.USERPROFILE || process.env.HOME

app.use(express.json())

// -- Config -------------------------------------------

const defaultConfig: Record<string, unknown> = {
  port: 5010,
  downloadPath: "%USERPROFILE%/Downloads",
}

async function getConfig(key: string | undefined = undefined): Promise<any> {
  if (!(await fs.stat(HOME + "/PotatoFarm.json").catch(() => false))) {
    await fs.writeFile(HOME + "/PotatoFarm.json", JSON.stringify(defaultConfig))
  }
  const text = await fs.readFile(HOME + "/PotatoFarm.json", "utf8")
  const json = JSON.parse(text)
  if (key === undefined) return json
  const ret = json[key] ?? defaultConfig[key]
  if (!ret) {
    throw new Error(`Config key ${key} not found.`)
  }
  return ret
}

async function setConfig(data: any) {
  const text = await fs.readFile(HOME + "/PotatoFarm.json", "utf8")
  const json = JSON.parse(text)
  return await fs.writeFile(
    HOME + "/PotatoFarm.json",
    JSON.stringify({
      ...defaultConfig,
      ...json,
      ...data,
    })
  )
}

// -- Functions ----------------------------------------

function replaceSlash(path: string) {
  return path.replace(/\\/g, "/")
}

function parseEnv(str: string) {
  return str.replace(/%([a-zA-Z0-9]+)%/g, (_match, name) => {
    return process.env[name] || ""
  })
}

function streamMove(src: string, dest: string) {
  return new Promise((resolve, reject) => {
    fssync
      .createReadStream(src)
      .pipe(fssync.createWriteStream(dest))
      .on("finish", async () => {
        await fs.unlink(src)
        resolve(null)
      })
      .on("error", reject)
  })
}

async function getLevels() {
  let levels: Level[] = []
  let levelFs = (
    await fs.readdir("./levels", {
      withFileTypes: true,
    })
  ).filter((dirent: fssync.Dirent) => {
    // シンボリックリンクもディレクトリとしたいのでstatを使う
    const stat = fssync.statSync("./levels/" + dirent.name)
    return stat.isDirectory()
  })
  for (let levelDir of levelFs) {
    if (
      (
        await Promise.all(
          ["data.sus", "bgm.*", "jacket.*"].map(async (file) => {
            if ((await glob(`./levels/${levelDir.name}/${file}`)).length > 0) {
              return true
            } else {
              printWarn(
                `./levels/${levelDir.name}/${file} が見つかりませんでした。`
              )
              return false
            }
          })
        )
      ).every((e) => e)
    ) {
      printInfo(
        `./levels/${levelDir.name} が有効なディレクトリとして認識されました。`
      )
      let level_data = await fs.readFile(
        `./levels/${levelDir.name}/data.sus`,
        "utf8"
      )
      levels.push(
        new Level(levelDir.name, {
          title: level_data.match(/#TITLE\s+"(.*)"/)![1],
        })
      )
    }
  }
  return levels.sort(
    (a, b) =>
      lastModified(`./levels/${b.id}`) - lastModified(`./levels/${a.id}`)
  )
}

function printSection(section: string, color: string) {
  console.log(
    // @ts-ignore
    "\n-- "[color] +
      // @ts-ignore
      section.trim()[color] +
      " " +
      "-".repeat(Math.max(50 - section.length, 0)).grey
  )
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
      artists: "-",
      author: "-",
      bgm: {
        type: "LevelBgm",
        url: `/local/${this.id}/bgm`,
        hash: "",
      },
      cover: {
        type: "LevelCover",
        url: `/local/${this.id}/jacket`,
        hash: "",
      },
      data: {
        type: "LevelData",
        url: `/local/${this.id}/data`,
        hash: "",
      },
      engine,
      name: "ptfm-" + this.id,
      rating: 0,
      title: this.data.title || this.id,
      useBackground: {
        useDefault: true,
      },
      useEffect: {
        useDefault: true,
      },
      useParticle: {
        useDefault: true,
      },
      useSkin: {
        useDefault: true,
      },
      version: 1,
    }
  }
}

// -- Sonolus endpoints --------------------------------

app.get("/sonolus/info", async (req: Request, res: Response) => {
  printSection("Sonolus: /info", "green")
  const levels = await getLevels()
  res.json({
    title: "PotatoFarm",
    banner: {
      type: "ServerBanner",
      hash: "",
      url: "",
    },
    levels: {
      items: levels.slice(0, 5).map((level) => level.json()),
      search: { options: [] },
    },
    skins: { items: [], search: { options: [] } },
    backgrounds: { items: [], search: { options: [] } },
    particles: { items: [], search: { options: [] } },
    effects: { items: [], search: { options: [] } },
    engines: { items: [], search: { options: [] } },
  } as ServerInfo)
})

app.get("/sonolus/levels/list", async (req: Request, res: Response) => {
  printSection("Sonolus: /levels/list", "green")
  const levels = await getLevels()
  res.json({
    items: levels.map((level) => level.json()),
    pageCount: 1,
  })
})

app.get("/sonolus/levels/:id", async (req: Request, res: Response) => {
  const levelName = req.params.id.replace(/^ptfm-/, "")
  printSection(`Sonolus: /levels/${levelName}`, "yellow")
  let levelData = await fs.readFile(`./levels/${levelName}/data.sus`, "utf8")
  let title = levelData.match(/#TITLE\s+"(.*)"/)![1]
  printInfo(`./levels/${levelName} - ${title} を読み込んでいます。`)
  res.json({
    item: new Level(levelName, {
      title,
    }).json(),
    description: "",
    recommended: [],
  })
})

app.get("/local/:id/bgm", async (req: Request, res: Response) => {
  const levelName = req.params.id.replace(/^ptfm-/, "")
  printSection(`Sonolus: /local/${levelName}/bgm`, "yellow")
  printInfo(`./levels/${levelName}/bgm.* を読み込んでいます。`)
  res.sendFile(path.resolve((await glob(`./levels/${levelName}/bgm.*`))[0]))
})

app.get("/local/:id/jacket", async (req: Request, res: Response) => {
  const levelName = req.params.id.replace(/^ptfm-/, "")
  printSection(`Sonolus: /local/${levelName}/jacket`, "yellow")
  let jacketPath: string | undefined = (
    await glob(`./levels/${levelName}/jacket.*`)
  )[0]
  if (jacketPath) {
    printInfo(`${jacketPath} が見つかりました。`)
    res.sendFile(path.resolve(jacketPath))
  } else {
    printWarn(`${jacketPath} が見つかりませんでした。`)
    res.send(await fs.readFile(`public/empty.png`))
  }
})

app.get("/local/:id/data", async (req: Request, res: Response) => {
  const levelName = req.params.id.replace(/^ptfm-/, "")
  printSection(`Sonolus: /local/${levelName}/data`, "yellow")
  printInfo(`./levels/${levelName}/data.sus を変換中です。`)
  let data = await fs.readFile(`./levels/${levelName}/data.sus`, "utf8")
  res.send(gzipSync(JSON.stringify(fromSus(data))))
})

// -- Download mover -----------------------------------

async function queryDownload() {
  for (let g of await glob(
    parseEnv(await getConfig("downloadPath")) + "/*.sus"
  )) {
    if (Date.now() - (await fs.stat(g)).ctime.getTime() < 1500) {
      printSection(`Downloads`, "blue")
      printInfo(`${g} を読み込んでいます。`)
      let susData = await fs.readFile(g, "utf8")
      let designer = susData.match(/#DESIGNER\s+"(.*)"/)![1]
      if (designer.length <= 0) {
        printWarn("譜面作者が設定されていません。")
        printWarn("譜面作者を動かす先のディレクトリの名前に変更して下さい。")
      } else {
        try {
          await fs.access(`./levels/${designer}`)
          printInfo(
            `${designer} が見つかりました。./levels/${designer}/data.sus に移動します。`
          )
          await streamMove(g, `./levels/${designer}/data.sus`)
          printInfo(`移動しました。`)
        } catch (e: any) {
          if (e.code === "ENOENT") {
            printWarn(`./levels/${designer} が見つかりませんでした。`)
            printWarn("譜面作者にスペルミスがないか確認して下さい。")
          } else {
            throw e
          }
        }
      }
    }
  }
}

// -- UI -----------------------------------------------

app.use(express.static("public"))

app.get("/", async (_req: Request, res: Response) => {
  printSection("UI: /", "magenta")
  let levels: LevelData[] = []
  printInfo("譜面を取得しています。")
  for (let level of await getLevels()) {
    // printInfo(`./levels/${level.name} が有効なディレクトリとして認識されました。`)
    let data: LevelData = {
      name: level.id,
      title: undefined,
      size: undefined,
      editor: undefined,
    }

    let levelData = await fs.readFile(`./levels/${level.id}/data.sus`, "utf8")
    data.title = levelData.match(/#TITLE\s+"(.*)"/)?.[1] || "?"
    data.size = levelData.length
    if (levelData.match(/^This file was generated by (.*)\./)) {
      data.editor = levelData.match(/^This file was generated by (.*)\./)![1]
    } else {
      data.editor = "?"
    }

    levels.push(data)
  }
  const indexEjs = await fs.readFile("./views/index.ejs")

  res.header("Content-Type", "text/html")
  res.send(
    ejs.render(indexEjs.toString(), {
      levels,
      defaultConfig,
      file: replaceSlash(process.env.USERPROFILE + "/PotatoFarm.json"),
      config: await getConfig(),
    })
  )
})

app.post("/ui/config", async (req: Request, res: Response) => {
  printSection("UI: /ui/config", "magenta")
  printInfo("設定を更新しています。")
  await setConfig(req.body)
  printInfo("設定を更新しました。")
  res.json({ status: "ok" })
})

// -- Main ---------------------------------------------

function tryListen(port: number, tries: number) {
  return new Promise((resolve, reject) => {
    app
      .listen(port, "0.0.0.0", async () => {
        resolve(null)
        const ip = Object.values(os.networkInterfaces())
          .flat()
          .filter(
            ({
              // @ts-ignore
              family,
              // @ts-ignore
              internal,
            }) => family === "IPv4" && !internal
          )[0]
        printSection("System: Hello!", "red")
        printInfo(`PotatoFarm v${version}へようこそ！`)
        printInfo(``)
        printInfo(`Sonolusを開き、サーバーのURLに以下を入力して下さい：`)
        // @ts-ignore
        printInfo("  " + `http://${ip.address}:${port}`.underline)
        printInfo(
          `メニューにアクセスするにはブラウザで以下のURLを開いてください：`
        )
        // @ts-ignore
        printInfo("  " + `http://localhost:${port}`.underline)
        if (tries !== 0) {
          printWarn("")
          printWarn(
            `ポート ${
              port - tries
            } が使用中のため、${port} が使用されています。`
          )
          printWarn(
            `ポート ${
              port - tries
            } を開放するか、メニューでポート番号を変更して下さい。`
          )
          printWarn("")
        }
        printInfo(``)
        printInfo(`Ctrl+Cで終了します。`)
        printInfo(``)
        printInfo(`Created by ` + `名無し｡(@sevenc-nanashi)`.blue)
        printInfo(``)

        try {
          await fs.access(`./levels`)
        } catch {
          await fs.mkdir(`./levels`)
          printInfo(`levelsディレクトリを作成しました。`)
        }
      })
      .on("error", reject)
  })
}

async function setEngine() {
  engine = JSON.parse(
    JSON.stringify(
      (
        await axios.get(
          "https://cc.sevenc7c.com/sonolus/engines/chcy-pjsekai-extended"
        )
      ).data.item
    ).replace(/"\//g, '"https://cc.sevenc7c.com/')
  )
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
