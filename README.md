# PotatoFarm
譜面作成の効率を上げるSonolus+[sonolus-pjsekai-engine](https://github.com/NonSpicyBurrito/sonolus-pjsekai-engine)のテストプレイサーバー。

## 機能

- SUSファイルのローカルの変換
- ホットリロード

## 使用方法

```yml
app.exe:
levels:
  level_name:
    bgm.mp3
    jacket.png
    data.sus
  level_name_another:
    bgm.mp3
    jacket.png
    data.sus
```
のようにフォルダを配置すると動きます。
`bgm.mp3`の拡張子は自由に変更できます。`jacket.png`も同様に変更できます。

## PaletteWorksの自動移動

```yml
levels:
  tottemohayai:
    bgm.mp3
    jacket.png
    data.sus
```
のようにファイルが配置されているときに、  
![image](https://user-images.githubusercontent.com/59691627/152070495-c9c691e7-5a86-4da7-a62f-3a6f67066000.png)   
このように`譜面作者`欄に`tottemohayai`（フォルダ名）を入れるとダウンロード時に自動で移動されます。

## 設定

`localhost:5010`をブラウザで開くと設定画面にアクセスできます。

## ライセンス

MIT Licenseで公開しています。