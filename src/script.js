/**
 * TextAlive MagicalMirai2020
 * https://github.com/happydemon-github/MagicalMirai2020
 */
import { Player, Ease } from "textalive-app-api"; // >npm install textalive-app-api@latest
import anime from 'animejs';
import Typewriter from 'typewriter-effect/dist/core';
import randomColor from 'randomcolor';

/*************************
     TextAlive
*************************/
const playBtns = document.querySelectorAll(".play");
const jumpBtn = document.querySelector("#jump");
const pauseBtn = document.querySelector("#pause");
const rewindBtn = document.querySelector("#rewind");
const textContainer = document.querySelector("#text");
const lyricsContainer = document.querySelector("#lyrics");
const canvas3D = document.querySelector(".canvas3D");

const baseFontSize = 1; // 歌詞の基本フォントサイズ
let isInstOld = false; // 前回間奏だったか？
let instCount = 0; // 間奏セグメントの回数
let segmentNow = -1; // 現在のセグメント(-1:間奏 0:サビ 1:メロ１...)
let segmentOld = -1; // 前回のセグメント
let isSegmentChanged = false; // 前回とセグメントが変わったか？
let isLyricSegment = false; // 現在のセグメントには歌詞がついているか？
let chordNow; // 現在のコード

// TextAlive Song Analyze System
let loadMes = document.getElementById('loadMes');
let songData = document.getElementById('songData');
let endMes = document.getElementById('endMes');
let dataSeg = document.getElementById('dataSeg');
let dataChord = document.getElementById('dataChord');
let dataPos = document.getElementById('dataPos');
let twLoadMes = new Typewriter(loadMes, { delay: 1 });
let twSongData = new Typewriter(songData, { delay: 1 });
let twEndMes = new Typewriter(endMes, { delay: 1 });

// プレイヤーの初期化
const player = new Player({
  app: {
    appAuthor: "HappyDemon",
    appName: "TextAlive MagicalMirai2020",
  },
  mediaElement: document.querySelector("#media"),
  vocalAmplitudeEnabled: true,
  //  valenceArousalEnabled: true
  // オプション一覧
  // https://developer.textalive.jp/packages/textalive-app-api/interfaces/playeroptions.html
});

// TextAlive Player のイベントリスナを登録する
player.addListener({
  // App のライフサイクル
  // https://developer.textalive.jp/app/life-cycle/

  // https://developer.textalive.jp/packages/textalive-app-api/interfaces/playerapplistener.html
  onAppReady, // TextAlive ホストとの接続時に呼ばれる
  //  onAppMediaChange, // TextAlive アプリの再生すべき楽曲URLが変更されたときに呼ばれる
  //  onAppParameterUpdate, // TextAlive アプリのパラメタが更新されたときに呼ばれる

  // https://developer.textalive.jp/packages/textalive-app-api/interfaces/playereventlistener.html
  //  onVideoLoad, // 動画データが読み込まれたときに呼ばれる
  onVideoReady, // 動画オブジェクトの準備が整ったときに呼ばれる
  onTimerReady, // 動画を再生するための Timer の準備が整ったときに呼ばれる
  onTimeUpdate, // 動画の再生位置が変更されたときに呼ばれる
  // onThrottledTimeUpdate, // 動画の再生位置が変更されたときに呼ばれる（あまりに頻繁な発火を防ぐため一定間隔に間引かれる）
  onPlay, // 再生が始まったときに呼ばれる
  //  onPause, // 再生が一時停止されたときに呼ばれる
  onStop, // 再生が停止されたときに呼ばれる
  //  onSeek, // 楽曲の再生位置がユーザ操作によって変更されたときに呼ばれる
  //  onVideoSeek, // 動画のシーク操作が行われたときに呼ばれる
  //  onVideoSeekStart, // 動画のシーク操作が始まったときに呼ばれる
  //  onVideoSeekEnd, // 動画のシーク操作が終わったときに呼ばれる
  //  onMediaSeek, // 楽曲の再生位置が変更されたときに呼ばれる
  //  onVolumeUpdate, // 音量が変更されたときに呼ばれる
  //  onResize, // ステージのサイズが変更されたときに呼ばれる
  //  onMediaElementSet, // 音源メディアの配置先となるDOM要素が変更されたときに呼ばれる
  //  onDispose, // プレイヤーが破棄されるときに呼ばれる

  // https://developer.textalive.jp/packages/textalive-app-api/interfaces/songloaderlistener.html
  // onSongLoad, // 楽曲の基本情報が読み込まれたときに呼ばれる
  // onSongMapLoad, // 楽曲地図が読み込まれたときに呼ばれる
  onSongInfoLoad, // 楽曲の詳細情報が読み込まれたときに呼ばれる
  //  onValenceArousalLoad, // V/A空間の情報が読み込まれたときに呼ばれる
  //  onVocalAmplitudeLoad, // 声量の情報が読み込まれたときに呼ばれる

  // https://developer.textalive.jp/packages/textalive-app-api/interfaces/textloaderlistener.html
  //  onLyricsLoad, // 歌詞テキストの発声タイミング情報が読み込まれたときに呼ばれる
  //  onTextLoad, // 歌詞テキストが読み込まれたときに呼ばれる

  // https://developer.textalive.jp/packages/textalive-app-api/interfaces/fontloaderlistener.html
  //  onFontsLoad, // フォントが読み込まれたときに呼ばれる
});

function onAppReady(app) {
  // TextAlive ホストと接続されていなければ再生コントロールを表示する
  if (!app.managed) {
    document.querySelector("#control").style.display = "block";
  }
  // TextAlive ホストと接続されていなければ曲選択
  //  if (!app.managed) {
  if (!app.songUrl) {
    // グリーンライツ・セレナーデ / Omoi feat. 初音ミク
    // - 初音ミク「マジカルミライ 2018」テーマソング
    // - 楽曲: http://www.youtube.com/watch?v=XSLhsjepelI
    // - 歌詞: https://piapro.jp/t/61Y2
    // player.createFromSongUrl("http://www.youtube.com/watch?v=XSLhsjepelI");

    // ブレス・ユア・ブレス / 和田たけあき feat. 初音ミク
    // - 初音ミク「マジカルミライ 2019」テーマソング
    // - 楽曲: http://www.youtube.com/watch?v=a-Nf3QUFkOU
    // - 歌詞: https://piapro.jp/t/Ytwu
    // player.createFromSongUrl("http://www.youtube.com/watch?v=a-Nf3QUFkOU");

    // 愛されなくても君がいる / ピノキオピー feat. 初音ミク
    // - 初音ミク「マジカルミライ 2020」テーマソング
    // - 楽曲: http://www.youtube.com/watch?v=ygY2qObZv24
    // - 歌詞: https://piapro.jp/t/PLR7
    player.createFromSongUrl("http://www.youtube.com/watch?v=ygY2qObZv24");
}

// TSNS
loadMes.style.display = "block";
twLoadMes
  .typeString(
    "STARTING TEXTALIVE SONG ANALYZE SYSTEM..."
    + "<br>LOADING SONG DATA..."
  )
}

function onSongInfoLoad(songInfo) {
  // TSAS
  twLoadMes
    .typeString("DONE"
      + "<br>"
      + "<br>10 SONG ID: " + songInfo.info.songId
      + "<br>10 SONG: " + songInfo.info.name
      + "<br>10 LENGTH: " + songInfo.info.length
      + "<br>10 RMS AMPLITUDE: " + songInfo.info.rmsAmplitude
      + "<br>20 BEATS: " + songInfo.analysis.beats[0].length
      + "<br>20 CHORDS: " + songInfo.analysis.chords.length
      + "<br>"
      + "<br>LOADING VIDEO DATA..."
    ).start();
}

function onVideoReady(v) {
  // TSNS
  twLoadMes
    .typeString("DONE"
      + "<br>"
      + "<br>30 ARTIST: " + player.data.song.artist.name
      + "<br>30 CREATED AT: " + player.data.song.created_at
      + "<br>30 PERMALINK: " + player.data.song.permalink
    ).start();
}

function onTimerReady(t) {
  // TSMS
  twLoadMes
    .typeString("<br><br>OK"
      + "<br>GET READY")
    .start();

  // オーバーレイ再生ボタン
  let pB = document.querySelector("#overlay").children[0];
  pB.addEventListener("mouseover", function (event) { event.target.style.backgroundColor = "#EEE"; }, false);
  pB.addEventListener("mouseout", function (event) { event.target.style.backgroundColor = "#CCC"; }, false);
  pB.style.backgroundColor = "#CCC";
  pB.style.borderColor = "#CCC";
  pB.innerText = "GET READY!"

  // 再生ボタン / Start music playback
  playBtns.forEach((playBtn) =>
    playBtn.addEventListener("click", () => {
      player.video && player.requestPlay();
    })
  );

  // 歌詞頭出しボタン / Seek to the first character in lyrics text
  jumpBtn.addEventListener(
    "click",
    () => player.video && player.requestMediaSeek(player.video.firstChar.startTime)
  );

  // 一時停止ボタン / Pause music playback
  pauseBtn.addEventListener(
    "click",
    () => player.video && player.requestPause()
  );

  // 巻き戻しボタン / Rewind music playback
  rewindBtn.addEventListener(
    "click",
    () => player.video && player.requestMediaSeek(0)
  );

  // ボタン有効化
  document
    .querySelectorAll("button")
    .forEach((btn) => (btn.disabled = false));
}

function onTimeUpdate(position) {
  // 再生位置を表示する
  // Update current position
  // TSNS
  dataPos.innerText = String(Math.floor(position));
  //dataPos.innerText = String(Math.floor(player.timer.position));

  // さらに精確な情報が必要な場合は `player.timer.position` でいつでも取得できます
  // More precise timing information can be retrieved by `player.timer.position` at any time

  // 現在のコードを表示する
  dataChord.innerText = chordNow;

  // 現在のセグメントを表示する
  // TSNS
  switch (segmentNow) {
    case -1:
      dataSeg.innerText = "INSTRUMENT";
      break;
    case 0:
      dataSeg.innerText = "CHORUS";
      break;
    default:
      dataSeg.innerText = "MELODY " + segmentNow;
      break;
  }

  // セグメントが変わったら背景色を変える
  if (isSegmentChanged) {
    handleStagger(Math.floor(totalGrid / 2));
  }

  // 現在の歌詞フレーズ表示
  textContainer.textContent = player.video.findPhrase(position);

  // 現在のビート情報取得
  let beat = player.findBeat(position);
  // サビの時はビートに合わせてランダムに背景グリッド色を変更
  if (segmentNow == 0 && beat.progress(position) > 0.5) { // ビートにあわせる
    handleStagger(Math.floor(Math.random() * Math.floor(totalGrid)));
  }
  // 声量
  //console.log(player.getVocalAmplitude(position));
  //console.log(player.getMaxVocalAmplitude());
  // V/A
  //console.log(player.getValenceArousal(position));
  //console.log(player.getMedianValenceArousal());
  // コード進行
  chordNow = player.findChord(position).name;
  // サビ情報
  //console.log(player.findChorus(position));
  let isChorus = (player.findChorus(position)) ? true : false;
  // ビートに合わせてフォントを大小
  let addSize = (beat.progress(position) > 0.5) ? 1 : 0.9;
  // サビのとき、かつ、声量が曲中の最大値の50%を越えたとき、その歌詞フレーズはフォントを大きくする
  let isBigVoice = (player.getVocalAmplitude(position) / player.getMaxVocalAmplitude() > 0.5) ? true : false;
  let moreAddSize = (isChorus && isBigVoice) ? 1 : 0;
  requestAnimationFrame(() => {
    anime({
      targets: lyricsContainer,
      fontSize: [baseFontSize + addSize + "em", baseFontSize + addSize + moreAddSize + "em"],
      easing: 'easeInOutSine'
    });
  })

  // 曲構成
  let isInst = true; // 間奏中？
  let ln1 = player.data.songMap.segments.length;
  segment_loop:
  for (let i = 0; i < ln1; i++) { // iの数だけメロの種類がある（インスト含む）
    let ln2 = player.data.songMap.segments[i].segments.length;
    for (let j = 0; j < ln2; j++) {
      if (player.data.songMap.segments[i].segments[j].startTime < position && position < player.data.songMap.segments[i].segments[j].endTime) {
        let k = j + 1;
        segmentNow = i;
        if (segmentNow != segmentOld) { // セグメント変化チェック
          isSegmentChanged = true;
          segmentOld = segmentNow;
        } else {
          isSegmentChanged = false;
        }
        isInst = isInstOld = false; // 現在は間奏中ではない(メロ)
        // 現在のセグメントに歌詞がついているかチェック
        if (player.video.findPhrase(position) != null) {
          isLyricSegment = true;
        } else {
          isLyricSegment = false;
        }
        break segment_loop;
      }
    }
  }
  if (isInst) { // ループでどこにもひっかからなかったので間奏中
    if (isInstOld != isInst) {   // 前回がfauseで今回がtrueなら 間奏になったということ 回数++
      instCount++;
      isInstOld = isInst;
      isSegmentChanged = true;
    } else {
      isSegmentChanged = false;
    }
    segmentNow = -1;
  }
}

function onPlay() {
  // 再生が始まったら #overlay を非表示
  document.querySelector("#overlay").style.display = "none";

  // TSAS ローディングメッセージ消去
  loadMes.style.display = "none";
  endMes.style.display = "none";
  twLoadMes = new Typewriter(loadMes, { delay: 1 });
  twEndMes = new Typewriter(endMes, { delay: 1 });
  // TSAS ソングデータ表示
  if (songData.style.display == "none") {
    songData.style.display = "block";
    twSongData
      .typeString("TEXTALIVE SONG ANALYZE SYSTEM"
        + "<br>ARTIST: " + player.data.song.artist.name
        + "<br>SONG: " + player.data.song.name
        + "<br>VIDEO: " + player.data.song.permalink
        + "<br>SEGMENT: "
        + "<br>CHORD: "
        + "<br>POSITION[ms]: "
      ).start().changeCursor(' ').callFunction(() => {
        dataSeg.style.display = "block";
        dataChord.style.display = "block";
        dataPos.style.display = "block";
      });
  }
}

function onStop() {
  // TSAS ソングデータ消去
  songData.style.display = "none";
  twSongData = new Typewriter(loadMes, { delay: 1 });
  dataSeg.style.display = "none";
  dataChord.style.display = "none";
  dataPos.style.display = "none";
  // TSAS シャットダウン
  if (endMes.style.display == "none") {
    endMes.style.display = "block";
    twEndMes
      .typeString("TEXTALIVE SONG ANALYZE SYSTEM"
        + "<br>SHUTDOWN..."
      ).start();
  }
}

/*************************
     レスポンシブグリッド
*************************/
document.addEventListener("DOMContentLoaded", initGrid, false);
window.addEventListener("resize", initGrid, false);
const rootDiv = document.querySelector("#root");
let columsGrid;
let rowsGrid;
let totalGrid;

function initGrid() {

  // 3D Line
  initGrid3D();

  // rootのgridResなchildのみを削除
  let els = rootDiv.querySelectorAll("#gridRes");
  for (let j = 0; j < els.length; j++) {
    rootDiv.removeChild(els[j]);
  }
  columsGrid = Math.floor(window.innerWidth / 50);
  rowsGrid = Math.floor(window.innerHeight / 50);
  totalGrid = rowsGrid * columsGrid;
  let elGrid = null;
  elGrid = document.createElement("div");
  elGrid.id = "gridRes";
  for (let i = 0; i < totalGrid; i++) {
    let elGridItem = document.createElement("span");
    elGridItem.className = "grid-itemRes";
    elGridItem.id = i;
    elGridItem.onclick = function () {
      handleStagger(elGridItem.id);
    };
    elGrid.appendChild(elGridItem);
    rootDiv.appendChild(elGrid);
  }
}

function handleStagger(id) {
  anime({
    targets: ".grid-itemRes",
    backgroundColor: randomColor(),
    delay: anime.stagger(50, { grid: [columsGrid, rowsGrid], from: id })
  });
}

/*************************
     3Dライン
*************************/
let ctx = canvas3D.getContext("2d");
let squares = [];
let focal = canvas3D.width / 2;
let vpx = canvas3D.width / 2;
let vpy = canvas3D.height / 2;
canvas3D.width = window.innerWidth;
canvas3D.height = window.innerHeight;

function Square(z) {
  this.width = canvas3D.width;
  this.height = canvas3D.height;
  z = z || 0;

  this.points = [
    new Point({ // 画面外左上
      x: (canvas3D.width / 2) - this.width,   // -幅0.5
      y: (canvas3D.height / 2) - this.height, // -高さ0.5
      z: z
    }),
    new Point({ // 画面外右上
      x: (canvas3D.width / 2) + this.width,   // 幅1.5
      y: (canvas3D.height / 2) - this.height, // -高さ0.5
      z: z
    }),
    new Point({ // 画面外右下
      x: (canvas3D.width / 2) + this.width,   // 幅1.5
      y: (canvas3D.height / 2) + this.height, // 高1.5
      z: z
    }),
    new Point({ // 画面外左下
      x: (canvas3D.width / 2) - this.width,   // -幅0.5
      y: (canvas3D.height / 2) + this.height, // 高さ1.5
      z: z
    })];
  this.dist = 0;
}

Square.prototype.update = function () {
  for (var p = 0; p < this.points.length; p++) { //頂点４つ分
    //this.points[p].rotateZ(0.001);
    this.points[p].z -= 3;
    if (this.points[p].z < -300) {
      this.points[p].z = 2700;
    }
    this.points[p].z -= 10; // 四角の速さ 手前エンド:-300、奥スタート：2700
    if (this.points[p].z < -300) {
      this.points[p].z = 2700;
    }
    this.points[p].map2D();
  }
}

Square.prototype.render = function () {
  ctx.beginPath();
  ctx.moveTo(this.points[0].xPos, this.points[0].yPos);
  for (var p = 1; p < this.points.length; p++) { //頂点４つ分
    if (this.points[p].z > -(focal - 50)) {
      ctx.lineTo(this.points[p].xPos, this.points[p].yPos);
    }
  }
  ctx.closePath();
  ctx.stroke();

  this.dist = this.points[this.points.length - 1].z;
};

function Point(pos) {
  this.x = pos.x - canvas3D.width / 2 || 0;
  this.y = pos.y - canvas3D.height / 2 || 0;
  this.z = pos.z || 0;

  this.xPos = 0; // 実際の頂点x座標
  this.yPos = 0; // 実際の頂点y座標
  this.map2D();
}

Point.prototype.map2D = function () {
  var scaleX = focal / (focal + this.z), //zの分、倍率変化 (-300～2700)
    scaleY = focal / (focal + this.z);

  this.xPos = vpx + (this.x) * scaleX;
  this.yPos = vpy + (this.y) * scaleY;
};

function render() { // 自分自身を無限に呼び出す
  ctx.clearRect(0, 0, canvas3D.width, canvas3D.height);

  for (var i = 0, len = squares.length; i < len; i++) {
    squares[i].update();
    squares[i].render();
  }

  requestAnimationFrame(render);
}

setTimeout(function () {
  initGrid3D();
}, 200);

function initGrid3D() {
  squares = [];
  canvas3D.width = window.innerWidth;
  canvas3D.height = window.innerHeight;
  focal = canvas3D.width / 10;
  vpx = canvas3D.width / 2;
  vpy = canvas3D.height / 2;
  for (var i = 0; i < 15; i++) {
    squares.push(new Square(-300 + (i * 200))); // -300から奥に向かって
  }
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  render();
}