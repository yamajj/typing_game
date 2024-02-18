const RANDOM_SENTENCE_URL_API = "https:api.quotable.io/random"
const typeDisplay = document.getElementById("typeDisplay");
const typeInput = document.getElementById("typeInput");
const timer = document.getElementById("timer");
const typeTranslate = document.getElementById("typeTranslate");
//const typeTranslate = document.querySelector("typeTranslate");
const btn = document.querySelector(".btn");

const typeSound = new Audio("./audio/typing-sound.mp3");
const wrongSound = new Audio("./audio/wrong.mp3");
const correctSound = new Audio("./audio/correct.mp3");

/* sleepもどき*/
const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let sentence;
let originTime;

/* inputテキスト入力。合致しているかどうかの判定*/
typeInput.addEventListener("input",() => {
    /* タイプ音をつける */
    typeSound.play();
    typeSound.currentTime = 0;

    const sentenceArray = typeDisplay.querySelectorAll("span");
    //console.log(sentenceArray);
    const arrayValue = typeInput.value.split("");
    //console.log(arrayValue);
    let correct = true;
    sentenceArray.forEach((charactorSpan, index) => {
        if((arrayValue[index] == null) ){
            charactorSpan.classList.remove("correct");
            charactorSpan.classList.remove("incorrect");
            correct = false;
        } else if(charactorSpan.innerText == arrayValue[index]){
            charactorSpan.classList.add("correct");
            charactorSpan.classList.remove("incorrect");
        } else {
            charactorSpan.classList.add("incorrect");
            charactorSpan.classList.remove("correct");

            wrongSound.volume = 0.2;
            wrongSound.play();
            wrongSound.currentTime = 0;

            correct = false;
        }
    });

    if(correct == true){
        correctSound.play();
        correctSound.currentTime = 0;
        StartSleep(sentence, originTime);
    }
});

/* 非同期でランダムな文章を取得する*/
function GetRandomSentence() {
    return fetch(RANDOM_SENTENCE_URL_API)
        .then((response) => response.json())
        .then((data) => data.content);
}

/* 翻訳機能の追加*/
function TranslatedSentence(sentence){
    return fetch(`https://api.mymemory.translated.net/get?q=${sentence}&langpair=en-US|ja-JP`)
    .then((res) => res.json())
    .then((data) => data.responseData.translatedText);
}

/* ランダムな文章を取得して表示する*/
async function RenderNextSentence(){
    sentence = await GetRandomSentence();
    console.log(sentence);
    typeDisplay.innerText = "";

    /* 文章を一文字ずつ分解してspanタグを生成する*/
    let oneText = sentence.split("");
    /* 文字数の取得*/
    originTime = oneText.length;

    oneText.forEach((charactor) => {
        const charactorSpan = document.createElement("span");
        charactorSpan.innerText = charactor;
        //console.log(charactorSpan);
        typeDisplay.appendChild(charactorSpan);
        //charactorSpan.classList.add("correct");

    });

    /* テキストボックスの中身を消す */
    typeInput.value = "";

    StartTimer();
}

let startTime;
let originTime_k;
let timeId;
let k = 0.5 //難易度係数
function StartTimer(){
    originTime_k = Math.floor(originTime * k);
    timer.innerText = originTime_k;
    startTime = new Date();
    //console.log(startTime);
    timeId = setInterval(() =>{
        timer.innerText = originTime_k - getTimerTime();
        if(timer.innerText == 0) {
            StartSleep(sentence, originTime);
        }
    }, 1000)
    
}

function getTimerTime() {
    return Math.floor((new Date() - startTime) / 1000);
}

function TimeUp() {
    RenderNextSentence();
}

/* 翻訳後の待機秒数計算*/
function wait(originTime){
    let j = 0.5;//係数
    let seconds = Math.floor(originTime* j);
    let wait_time;
    if (seconds <= 10){
        wait_time = 10;
    } else {
        wait_time = seconds;
    }
    console.log(wait_time);
    return wait_time;
}

/* 翻訳させてから秒後に再スタート*/
async function StartSleep(sentence, originTime){
    let waitTime = wait(originTime);
    timer.innerText = "翻訳が表示されてから"+ waitTime +"秒後に再スタートします"
    clearInterval(timeId);
    /* 2秒停止*/
    await _sleep(2000);
    const trans = await TranslatedSentence(sentence);
    console.log(trans);
    /* 無料翻訳サイトを使用しているので翻訳回数に上限がある*/
    let regexp = RegExp('MYMEMORY');
    let result = regexp.test(trans);
    if (result){
        typeTranslate.innerText = "翻訳回数の上限を超えたため、本日の翻訳機能は終了しました。";
    } else {
        typeTranslate.innerText = trans;
    }
    /* 一時停止させて学習*/
    await _sleep(waitTime * 1000);
    /* テキストボックスの中身を消す */
    typeTranslate.innerText = "";
    RenderNextSentence();
}

RenderNextSentence();








