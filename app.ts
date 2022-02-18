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

const app = express()
const version = JSON.parse(fssync.readFileSync("package.json", 'utf8'))["version"]

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
      "engine": {
        "author": "Burrito",
        "background": {
          "author": "Sonolus",
          "configuration": {
            "hash": "d4367d5b719299e702ca26a2923ce5ef3235c1c7",
            "type": "BackgroundConfiguration",
            "url": "https://servers.purplepalette.net/repository/BackgroundConfiguration/d4367d5b719299e702ca26a2923ce5ef3235c1c7"
          },
          "data": {
            "hash": "5e32e7fc235b0952da1b7aa0a03e7745e1a7b3d2",
            "type": "BackgroundData",
            "url": "https://servers.purplepalette.net/repository/BackgroundData/5e32e7fc235b0952da1b7aa0a03e7745e1a7b3d2"
          },
          "image": {
            "hash": "8dd5a1d679ffdd22d109fca9ccef37272a4fc5db",
            "type": "BackgroundImage",
            "url": "https://servers.purplepalette.net/repository/BackgroundImage/8dd5a1d679ffdd22d109fca9ccef37272a4fc5db"
          },
          "name": "pjsekai.live",
          "subtitle": "Project Sekai: Colorful Stage!",
          "thumbnail": {
            "hash": "bc97c960f8cb509ed17ebfe7f15bf2a089a98b90",
            "type": "BackgroundThumbnail",
            "url": "https://servers.purplepalette.net/repository/BackgroundThumbnail/bc97c960f8cb509ed17ebfe7f15bf2a089a98b90"
          },
          "title": "Project Sekai",
          "version": 2
        },
        "configuration": {
          "hash": "55ada0ef19553e6a6742cffbb66f7dce9f85a7ee",
          "type": "EngineConfiguration",
          "url": "https://servers.purplepalette.net/repository/EngineConfiguration/55ada0ef19553e6a6742cffbb66f7dce9f85a7ee"
        },
        "data": {
          "hash": "86773c786f00b8b6cd2f6f99be11f62281385133",
          "type": "EngineData",
          "url": "https://servers.purplepalette.net/repository/EngineData/86773c786f00b8b6cd2f6f99be11f62281385133"
        },
        "effect": {
          "author": "Sonolus",
          "data": {
            "hash": "b98f36f0370dd5b4cdaa67d594c203f07bbed055",
            "type": "EffectData",
            "url": "https://servers.purplepalette.net/repository/EffectData/b98f36f0370dd5b4cdaa67d594c203f07bbed055"
          },
          "name": "pjsekai.classic",
          "subtitle": "プロジェクトセカイ カラフルステージ!",
          "thumbnail": {
            "hash": "e5f439916eac9bbd316276e20aed999993653560",
            "type": "EffectThumbnail",
            "url": "https://servers.purplepalette.net/repository/EffectThumbnail/e5f439916eac9bbd316276e20aed999993653560"
          },
          "title": "プロセカ",
          "version": 2
        },
        "name": "pjsekai",
        "particle": {
          "author": "Sonolus",
          "data": {
            "hash": "f84c5dead70ad62a00217589a73a07e7421818a8",
            "type": "ParticleData",
            "url": "https://servers.purplepalette.net/repository/ParticleData/f84c5dead70ad62a00217589a73a07e7421818a8"
          },
          "name": "pjsekai.classic",
          "subtitle": "Project Sekai: Colorful Stage!",
          "texture": {
            "hash": "4850a8f335204108c439def535bcf693c7f8d050",
            "type": "ParticleTexture",
            "url": "https://servers.purplepalette.net/repository/ParticleTexture/4850a8f335204108c439def535bcf693c7f8d050"
          },
          "thumbnail": {
            "hash": "e5f439916eac9bbd316276e20aed999993653560",
            "type": "ParticleThumbnail",
            "url": "https://servers.purplepalette.net/repository/ParticleThumbnail/e5f439916eac9bbd316276e20aed999993653560"
          },
          "title": "Project Sekai",
          "version": 1
        },
        "skin": {
          "author": "Sonolus",
          "data": {
            "hash": "ad8a6ffa2ef4f742fee5ec3b917933cc3d2654af",
            "type": "SkinData",
            "url": "https://servers.purplepalette.net/repository/SkinData/ad8a6ffa2ef4f742fee5ec3b917933cc3d2654af"
          },
          "name": "pjsekai.classic",
          "subtitle": "Project Sekai: Colorful Stage!",
          "texture": {
            "hash": "2ed3b0d09918f89e167df8b2f17ad8601162c33c",
            "type": "SkinTexture",
            "url": "https://servers.purplepalette.net/repository/SkinTexture/2ed3b0d09918f89e167df8b2f17ad8601162c33c"
          },
          "thumbnail": {
            "hash": "24faf30cc2e0d0f51aeca3815ef523306b627289",
            "type": "SkinThumbnail",
            "url": "https://servers.purplepalette.net/repository/SkinThumbnail/24faf30cc2e0d0f51aeca3815ef523306b627289"
          },
          "title": "Project Sekai",
          "version": 2
        },
        "subtitle": "プロジェクトセカイ カラフルステージ!",
        "thumbnail": {
          "hash": "e5f439916eac9bbd316276e20aed999993653560",
          "type": "EngineThumbnail",
          "url": "https://servers.purplepalette.net/repository/EngineThumbnail/e5f439916eac9bbd316276e20aed999993653560"
        },
        "title": "プロセカ",
        "version": 4
      },
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
        printWarn(`./levels/${level.name}/${file} が見つかりませんでした。`)
        return false
      }
    }))).every(e => e)) {

      printInfo(`./levels/${level.name} が有効なディレクトリとして認識されました。`)
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
        printWarn(`./levels/${level.name}/${file} が見つかりませんでした。`)
        return false
      }
    }))).every(e => e)) {

      printInfo(`./levels/${level.name} が有効なディレクトリとして認識されました。`)
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
  printInfo(`./levels/${req.params.id} - ${title} を読み込んでいます。`)
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
    printInfo(`${path} が見つかりました。`)
    res.send(await fs.readFile(path))
  } else {
    printWarn(`${path} が見つかりませんでした。`)
    res.send(await fs.readFile(`public/empty.png`))
  }
})

app.get("/local/:id/data", async (req: Request, res: Response) => {
  printSection(`Sonolus: /local/${req.params.id}/data`, "yellow")
  printInfo(`./levels/${req.params.id}/data.sus を変換中です。`)
  let data = await fs.readFile(`./levels/${req.params.id}/data.sus`, 'utf8')
  res.send(gzipSync(JSON.stringify(fromSus(data))))
})

// -- Download mover -----------------------------------

async function queryDownload() {
  for (let g of await glob(parseEnv(await getConfig("downloadPath")) + "/*.sus")) {
    if (Date.now() - (await fs.stat(g)).ctime.getTime() < 1500) {
      printSection(`Downloads`, "blue")
      printInfo(`${g} を読み込んでいます。`)
      let susData = await fs.readFile(g, 'utf8')
      let designer = susData.match(/#DESIGNER\s+"(.*)"/)![1]
      if (designer.length <= 0) {
        printWarn("譜面作者が設定されていません。")
        printWarn("譜面作者を動かす先のディレクトリの名前に変更して下さい。")
      } else {
        try {
          await fs.access(`./levels/${designer}`)
          printInfo(`${designer} が見つかりました。./levels/${designer}/data.sus に移動します。`)
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

app.use(express.static('public'));

app.get("/", async (_req: Request, res: Response) => {
  printSection("UI: /", "magenta")
  let levels = []
  let levelFs = (await fs.readdir('./levels', {
    withFileTypes: true
  })).filter(dirent => dirent.isDirectory())
  printInfo("譜面を取得しています。")
  for (let level of levelFs) {
    let existFiles = (await Promise.all(["data.sus", "bgm.*", "jacket.*"].map(async file => {
      if ((await glob(`./levels/${level.name}/${file}`)).length > 0) {
        return true
      } else {
        printWarn(`./levels/${level.name}/${file} が見つかりませんでした。`)
        return false
      }
    })))

    // printInfo(`./levels/${level.name} が有効なディレクトリとして認識されました。`)
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
  printInfo("設定を更新しています。")
  await setConfig(req.body)
  printInfo("設定を更新しました。")
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
      printInfo(`PotatoFarm v${version}へようこそ！`)
      printInfo(``)
      printInfo(`Sonolusを開き、サーバーのURLに以下を入力して下さい：`)
      // @ts-ignore
      printInfo("  " + `http://${ip.address}:${port}`.underline)
      printInfo(`メニューにアクセスするにはブラウザで以下のURLを開いてください：`)
      // @ts-ignore
      printInfo("  " + `http://localhost:${port}`.underline)
      if (tries !== 0) {
        printWarn("")
        printWarn(`ポート ${port - tries} が使用中のため、${port} が使用されています。`)
        printWarn(`ポート ${port - tries} を開放するか、メニューでポート番号を変更して下さい。`)
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
    }).on("error", reject)
  })
}

async function main() {
  setInterval(queryDownload, 1000)
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
