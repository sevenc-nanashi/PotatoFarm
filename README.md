# PotatoFarm
TODO: しっかりした説明を書く
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
[PaletteWorks](https://paletteworks.mkpo.li)で`level_name`の部分を譜面作者に設定するとダウンロード時に自動で移動します。

## PaletteWorksの自動移動
```yml
levels:
  tottemohayai:
    bgm.mp3
    jacket.png
    data.sus
```
のようにファイルが配置されているときに、![image](https://user-images.githubusercontent.com/59691627/152070495-c9c691e7-5a86-4da7-a62f-3a6f67066000.png)
このように`譜面作者`欄に`tottemohayai`（フォルダ名）を入れるとダウンロード時に自動で移動されます。
