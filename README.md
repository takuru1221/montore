# モントレ

モントレは、筋トレ・食事・睡眠の記録でモンスターを育成するWebアプリです。

## 公開URL

https://takuru1221.github.io/montore/

## アプリ概要

日々の行動を記録すると、相棒モンスターの能力値が上がり、レベルアップや進化、バトルを楽しめます。  
トレーニングの継続をゲーム感覚で楽しくすることを目的に作成しました。

## 主な機能

- 5体の中から相棒モンスターを選択
- 筋トレ、プロテイン、睡眠の記録
- レベルアップと進化
- オフラインバトル
- 背景解放
- 実績システム
- 体重管理
- 最大重量記録
- 目標体重、目標日設定
- 初回チュートリアル
- データリセット機能
- localStorageによるデータ保存
- GitHub Pagesで公開

## 使用技術

- HTML
- CSS
- JavaScript
- GitHub Pages

## フォルダ構成

```text
montore/
├─ index.html
├─ style.css
├─ script.js
├─ README.md
└─ images/
   ├─ mokopina.png
   ├─ rioruhu.png
   ├─ foremin.png
   ├─ darun.png
   ├─ zaldo.png
   ├─ enemy_slime.png
   ├─ enemy_goblin.png
   └─ ...
```

## 作成目的

筋トレの継続をサポートするために、自分の興味であるトレーニングとゲーム要素を組み合わせて作成しました。  
日々の努力がモンスターの成長として見えることで、モチベーションを保ちやすくすることを目指しています。

## 注意点

このアプリはログイン機能やサーバー保存機能はありません。  
データは使用している端末・ブラウザのlocalStorageに保存されます。

## 開発メモ

開発用メニューは `script.js` の `DEBUG_MODE` で表示を切り替えます。  
公開版では `false` のままにします。
