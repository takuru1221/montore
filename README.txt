モンスタートレーニング（モントレ） README

■ アプリ概要
モントレは、筋トレ・食事・睡眠などの日々の行動を記録しながら、相棒モンスターを育成していくWebアプリです。
現実の努力がモンスターの成長やバトルに反映されるため、トレーニングのモチベーションを上げることを目的としています。

■ 使用技術
・HTML
・CSS
・JavaScript
・localStorage

■ 基本機能
・5体の中から相棒モンスターを1体選択
・選んだモンスター情報をlocalStorageに保存
・ホーム、育成、バトル、その他の4画面構成
・筋トレ、プロテイン、睡眠の記録
・経験値、レベル、能力値の上昇
・Lv5、Lv15、Lv30で進化
・敵モンスターとのオフラインバトル
・背景解放
・実績機能
・体重記録、体重グラフ、目標体重、目標日管理
・最大重量記録
・効果音ON/OFF
・開発用メニューの表示切り替え

■ フォルダ構成
montore/
├─ index.html
├─ style.css
├─ script.js
├─ README.txt
├─ images/
│  ├─ mokopina.png
│  ├─ mokopina_evo1.png
│  ├─ mokopina_evo2.png
│  ├─ mokopina_evo3.png
│  ├─ rioruhu.png
│  ├─ rioruhu_evo1.png
│  ├─ rioruhu_evo2.png
│  ├─ rioruhu_evo3.png
│  ├─ foremin.png
│  ├─ foremin_evo1.png
│  ├─ foremin_evo2.png
│  ├─ foremin_evo3.png
│  ├─ darun.png
│  ├─ darun_evo1.png
│  ├─ darun_evo2.png
│  ├─ darun_evo3.png
│  ├─ zaldo.png
│  ├─ zaldo_evo1.png
│  ├─ zaldo_evo2.png
│  ├─ zaldo_evo3.png
│  ├─ enemy_slime.png
│  ├─ enemy_goblin.png
│  ├─ enemy_golem.png
│  ├─ enemy_volcano.png
│  ├─ enemy_sky.png
│  └─ enemy_dark.png
└─ sounds/
   ├─ training.mp3
   ├─ protein.mp3
   ├─ sleep.mp3
   ├─ battle.mp3
   ├─ level.mp3
   └─ background.mp3

■ 画像ファイルについて
画像ファイルは、必ず images フォルダの中に入れてください。
コードでは「images/ファイル名.png」の形で読み込んでいます。
ファイル名が少しでも違うと画像が表示されないため注意してください。

例：
OK  ：images/mokopina.png
NG  ：image/mokopina.png
NG  ：images/mokopina_fixed.png
NG  ：images/Mokopina.png

■ 音声ファイルについて
効果音は sounds フォルダの中に入れてください。
音声ファイルがなくてもアプリ自体は動きますが、効果音は再生されません。

■ モンスター進化
相棒モンスターはレベルによって進化します。

Lv1〜4   ：通常形態
Lv5〜14  ：第1進化
Lv15〜29 ：第2進化
Lv30以上 ：最終進化

第2進化以降の表示名：
mokopina → モコリエル
rioruhu  → リオルガ
foremin  → フォレスティア
darun    → ダルバーン
zaldo    → ザルヴェイル

■ バトル仕様
バトルは1日2回まで挑戦できます。
敵を倒すと次の敵に進み、背景が解放されます。

総合力が勝利目安に届いている場合でも、少ししか上回っていないとまれに敗北することがあります。
逆に、総合力が少し足りない場合でも、確率で勝利できることがあります。

・総合力が1〜2足りない場合：30%で勝利
・総合力が3〜5足りない場合：10%で勝利
・総合力が1〜5上回っている場合：10%で敗北

■ 開発用メニュー
script.js の上部にある DEBUG_MODE を切り替えることで、開発用メニューを表示できます。

開発用メニューを非表示：
const DEBUG_MODE = false;

開発用メニューを表示：
const DEBUG_MODE = true;

開発用メニューでは、レベル変更、経験値追加、今日の上限リセット、バトル回数リセットなどができます。
完成版として使う場合は false にしてください。

■ localStorageについて
このアプリは、ブラウザのlocalStorageにデータを保存します。
そのため、同じブラウザで開くと前回の続きから遊べます。
ブラウザのデータを削除したり、アプリ内のデータリセットを押すと保存データは消えます。

■ 起動方法
1. montore フォルダを用意する
2. index.html、style.css、script.js を同じ階層に置く
3. images フォルダに画像を入れる
4. sounds フォルダに音声を入れる
5. index.html をブラウザで開く

■ 注意点
・画像が表示されない場合は、imagesフォルダの場所とファイル名を確認してください。
・進化画像が表示されない場合は、ファイル名が「モンスターID_evo番号.png」になっているか確認してください。
・音が鳴らない場合は、soundsフォルダとファイル名を確認してください。
・開発用メニューが表示されない場合は、DEBUG_MODE が true になっているか確認してください。

■ 今後追加できそうな機能
・フレンド機能
・フレンドバトル
・オンラインバトル
・ガチトレーニー版
・新モンスター追加
・新しい進化形態追加
・ログインボーナス
・HPや攻撃力を使った本格バトル
・背景画像の追加
・スマホアプリ化

■ 作成メモ
このアプリは、まず初心者向けの簡単なWebアプリ版として作成しています。
今後は機能を少しずつ追加しながら、筋トレを継続しやすい育成ゲームとして発展させていく予定です。
