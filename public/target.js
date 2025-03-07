let wordData = [];
let wordRange = [0,0];
let testData = [];
let wordIndex = 0;
let score = 0;
let wrong = [];
let book = "target1900";

let isAnswering = false;

function getWordData(s,e){
    const url = `https://target.ices.jp/api/v2/searchNum/${s}/${e}/0`;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'text';
    xhr.send();
    xhr.onload = function(){
        console.log(xhr.response);
        return xhr.response;
    }
}

async function getDataFetch(s, e, r){
    const url = `https://wordtest.iceonce.com/api/v2/${book}/searchNum/${s}/${e}/${r}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`レスポンスステータス: ${response.status}`);
        }

        const json = await response.json();
        return json.data;
    } catch (error) {
        console.error(error.message);
    }
}

function tester(){
    if(wordIndex >= testData.length){
        storeData();
        changePage(2);
        showResult();
        return;
    }
    const testWord = document.getElementById('testWord');
    testWord.innerHTML = testData[wordIndex][2];
}

function storeData(){
    const dataIndex = localStorage.getItem("index")
    if(dataIndex === null){
        //localStorage をすべて削除
        localStorage.clear();
        localStorage.setItem("index", 0);
        localStorage.setItem(dataIndex * 1 + 1, JSON.stringify({timestamp: new Date() , score: score, wrong: wrong}));
        localStorage.setItem("index", dataIndex * 1 + 1);
    }else {
        localStorage.setItem(dataIndex * 1 + 1, JSON.stringify({timestamp: new Date() , score: score, wrong: wrong}));
        localStorage.setItem("index", dataIndex * 1 + 1);
    }
}

function checkAnswer(){
    const userAnswer = document.getElementById('ansInput');
    console.log(wordIndex);
    if(userAnswer.value === testData[wordIndex][1]){
        document.getElementById('ansInput').value = "";
        score++;
        wordIndex++;
        tester();
    }else{
        isAnswering = true;
        document.getElementById('correct').innerHTML = testData[wordIndex][1];
        wrong.push(testData[wordIndex][0]);
    }
}

function showResult(){
    const result = document.getElementById('score');
    result.innerHTML = `${score} / ${testData.length}`;
    result.classList.toggle('show');
    if(score === testData.length){
        // showPerfectResult();
        document.getElementById("score").classList.toggle('perfect');
        document.getElementById("retryButton").style.display = 'none';
        document.getElementById("perfectImg").style.display = 'block';
        document.getElementById("perfectImg").classList.toggle('show');
    }
}

function showPerfectResult(){
    const perfectResult = document.getElementById('perfectResult');
    const index = localStorage.getItem("index");
    for(let i = 1; i <= index; i++){
        const data = JSON.parse(localStorage.getItem(i));
        const div = document.createElement('div');
        div.innerHTML = `${data.timestamp} : ${data.score} / ${testData.length}`;
        perfectResult.appendChild(div);
    }
}

async function start(){
    wordRange = [sInput.value*1, eInput.value*1];
    testData = eval(await getDataFetch(wordRange[0], wordRange[1], 1));
    tester();
    changePage(1);
}



// event listeners
document.getElementById('startButton').addEventListener('click', async function(e){
    if(checkInput(1,0,0, "") === false) return;
    e.target.disabled = true;
    await start();
});

window.addEventListener("load", async function(){
    wordData = eval(await getDataFetch(1,1900, 0));
});

const answerInput = document.getElementById('ansInput');
window.addEventListener('keydown', function(e){
    if(pageStatus === 1){
        const ratz = /[a-z]/
        if(ratz.test(e.key) && e.key.length === 1){
            answerInput.value += e.key;
        }else if(e.key === "Backspace") {
            answerInput.value = answerInput.value.slice(0, -1);
        }else{
            // checkAnswer();
        }
    }
});

window.addEventListener('keyup', function(e){
    if(e.key === "Enter") {
        if (isAnswering) {
            console.log('isAnswering');
            isAnswering = false;
            document.getElementById('correct').innerHTML = "";
            document.getElementById('ansInput').value = "";
            wordIndex++;
            tester();
            return;
        }
    }
});


// event listeners

const wordCardS = document.getElementById('word1');
const wordCardE = document.getElementById('word2');
const sInput = document.getElementById('SWNInput');
const eInput = document.getElementById('EWNInput');

sInput.addEventListener('keydown', async function(e){
    if(checkInput(0,1,0, e.key, '') === false) {
        if(e.key === "Backspace"){
            if(sInput.value.length === 1) {
                wordCardS.innerHTML = "- - -";
                return;
            }
            sInput.dispatchEvent(new KeyboardEvent('keydown', {key: ""}));
            return;
        }
        else if(e.key.length > 1 || e.ctrlKey || e.altKey || e.metaKey){
            return false;
        }
        e.preventDefault();
        return false;
    }
    if(wordData[(sInput.value + e.key) * 1 - 1] === "") {
        wordCardS.innerHTML = "- - -";
        return;
    }
    wordCardS.innerHTML = wordData[(sInput.value + e.key) * 1 - 1][1];
});

sInput.addEventListener('keyup', function(e){
    if(e.key === 'Enter'){
        if(checkInput(1,0,0, "", "") === false) return;
        document.getElementById('startButton').click();
    }
});

eInput.addEventListener('keydown', async function(e){
    if(checkInput(0,0,1, '',e.key) === false) {
        if(e.key === "Backspace"){
            if(eInput.value.length === 1) {
                wordCardE.innerHTML = "- - -";
                return;
            }
            eInput.dispatchEvent(new KeyboardEvent('keydown', {key: ""}));
            return;
        }
        else if(e.key.length > 1 || e.ctrlKey || e.altKey || e.metaKey){
            return false;
        }
        e.preventDefault();
        return false;
    }
    console.log(e.key)
    wordCardE.innerHTML = wordData[(eInput.value + e.key) * 1 - 1][1];
});

eInput.addEventListener('keyup', function(e){
    if(e.key === 'Enter'){
        if(checkInput(1,0,0, "", "") === false) return;
        document.getElementById('startButton').click();
    }
});

function checkInput(a, s, e, skey, ekey){
    const r0t9 = /[0-9]/
    const sValue = sInput.value + skey;
    const eValue = eInput.value + ekey;
    console.log(sValue, eValue);
    console.log(!(r0t9.test(skey*1) || r0t9.test(ekey*1)));
    if(a === 1 && (sValue.length === 0 || eValue.length === 0 || sValue > eValue || sValue > 1900 || eValue > 1900 || sValue === "" || eValue === "")) {
        console.error('error code 1');
        return false;
    }
    if(!(skey*1 > -1 || skey === "") || !(ekey*1 > -1 || ekey === "") || skey === " " || ekey === " ") {
        console.error('error code 4');
        return false;
    }
    if(!(r0t9.test(skey*1) || r0t9.test(ekey*1)) && (s === 1 || e === 1)) return false;
    if(s === 1 && (sValue.length === 0 || sValue > 1900 || sValue === "")) {
        console.error('error code 2');
        return false;
    }
    if (e === 1 && (eValue.length === 0 || eValue > 1900 || eValue === "")) {
        console.error('error code 3');
        return false;
    }
    return true;
}

async function changebook(){
    if(book === "target1900") {
        book = "corpus4500";
    }else{
        book = "target1900";
    }

    wordData = eval(await getDataFetch(1,1900, 0));
}

document.getElementById('retryButton').addEventListener('click', function(){
    location.href = '/retry';
});