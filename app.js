const express = require('express')
const app = express()
const os = require('os')
const fs = require('fs').promises
const fssync = require('fs')
const {
  fromSus
} = require('sonolus-pjsekai-engine')
const {
  gzipSync
} = require('zlib')
const glob_m = require('glob')
require("colors")

// -- Functions ----------------------------------------

function glob(pattern) {
  return new Promise((resolve, reject) => {
    glob_m(pattern, (error, result) => {
      if (error) reject(error)
      else resolve(result)
    })
  })
}
const port = 5010
let win = null

function streamMove(src, dest) {
  return new Promise((resolve, reject) => {
    fssync.createReadStream(src).pipe(fssync.createWriteStream(dest)).on('finish', async (data) => {
      await fs.unlink(src)
      resolve(data)
    }).on('error', reject)
  })
}

function printSection(section, color) {
  console.log("\n-- " [color] + section.trim()[color] + " " + "-".repeat(50 - section.length).grey)
}

function printWarn(content) {
  console.log("!) ".yellow + content.trim())
}

function printInfo(content) {
  console.log("i) ".blue + content.trim())
}
class Level {
  constructor(id, data) {
    this.id = id
    this.data = data
  }
  json() {
    return {
      "artists": "-",
      "author": "-",
      "bgm": {
        "type": "LevelBgm",
        "url": `/local/${this.id}/bgm.mp3`
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

app.get('/info', async (req, res) => {
  printSection("Sonolus: /info", "green")
  let levels = []
  let levelFs = (await fs.readdir('./levels', {
    withFileTypes: true
  })).filter(dirent => dirent.isDirectory())
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
        title: level_data.match(/#TITLE\s+"(.+)"/)[1],
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

app.get("/levels/:id", async (req, res) => {
  printSection(`Sonolus: /levels/${req.params.id}`, "yellow")
  let level_data = await fs.readFile(`./levels/${req.params.id}/data.sus`, 'utf8')
  let title = level_data.match(/#TITLE\s+"(.+)"/)[1]
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

app.get("/local/:id/bgm", async (req, res) => {
  printSection(`Sonolus: /local/${req.params.id}/bgm`, "yellow")
  res.send(await fs.readFile(await glob(`./levels/${req.params.id}/bgm.*`)[0]))
})

app.get("/local/:id/jacket", async (req, res) => {
  printSection(`Sonolus: /local/${req.params.id}/jacket`, "yellow")
  path = (await glob(`./levels/${req.params.id}/jacket.*`))[0]
  if (path) {
    printInfo(`${path} が見つかりました。`)
    res.send(await fs.readFile(path))
  } else {
    printWarn(`${path} が見つかりませんでした。`)
    res.send(await fs.readFile(`./public/empty.png`))
  }
})

app.get("/local/:id/data", async (req, res) => {
  printSection(`Sonolus: /local/${req.params.id}/data`, "yellow")
  printInfo(`./levels/${req.params.id}/data.sus を変換中です。`)
  let data = await fs.readFile(`./levels/${req.params.id}/data.sus`, 'utf8')
  res.send(gzipSync(JSON.stringify(fromSus(data))))
})

// -- Download mover -----------------------------------

async function queryDownload() {
  for (g of await glob(process.env.USERPROFILE + "/Downloads/*-*T*Z*.sus")) {
    filename = g.split("/").pop().replace(/\.sus$/, "").replace(/^.*?-/, "").replace(/ /, ":").replace(/T(\d+)-/, "T$1:")

    if (Date.now() - Date.parse(filename) < 1500) {
      printSection(`Downloads`, "blue")
      printInfo(`${g} を読み込んでいます。`)
      let susData = await fs.readFile(g, 'utf8')
      let designer = susData.match(/#DESIGNER\s+"(.*)"/)[1]
      if (designer.length <= 0) {
        printWarn("譜面作者が設定されていません。")
        printWarn("譜面作者を動かす先のディレクトリの名前に変更して下さい。")
      } else {
        try {
          await fs.access(`./levels/${designer}`)
          printInfo(`${designer} が見つかりました。./levels/${designer}/data.sus に移動します。`)
          await streamMove(g, `./levels/${designer}/data.sus`)
          printInfo(`移動しました。`)
        } catch (e) {
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

app.get("/", async (req, res) => {
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
    data = {
      name: level.name
    }

    if (existFiles[0]) {
      let levelData = await fs.readFile(`./levels/${level.name}/data.sus`, 'utf8')
      data.title = levelData.match(/#TITLE\s+"(.+)"/)[1]
      data.size = levelData.length
      if (levelData.match(/^This file was generated by (.*)\./)) {
        data.editor = levelData.match(/^This file was generated by (.*)\./)[1]
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
  res.render("./index.ejs", {
    levels
  });
})

// -- Main ---------------------------------------------

if (require.main === module) {
  setInterval(queryDownload, 1000)
  app.listen(5010, "0.0.0.0", async () => {
    const ip = Object.values(os.networkInterfaces()).flat().filter(({
      family,
      internal
    }) => family === "IPv4" && !internal)[0]
    printSection("System: Hello!", "red")
    printInfo(`PotatoFarmへようこそ！`)
    printInfo(``)
    printInfo(`Sonolusを開き、サーバーのURLに以下を入力して下さい：`)
    printInfo(`  http://${ip.address}:5010`.underline)
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
}