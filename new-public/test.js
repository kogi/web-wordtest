const start = document.getElementById("start");
const topCard = document.getElementById("topCardBlock").getElementsByTagName("div");
const testBlock = document.getElementById("middleBlock");
let testWords = [];
let currentIndex = 0;
let sliding = false;
let score = 0;
let incorrectWords = [];

if (localStorage.getItem("index") === null) {
	localStorage.setItem("index", 0);
}

const storageIndex = parseInt(localStorage.getItem("index"));
localStorage.setItem("index", storageIndex + 1);

function createCard(wordIndex, left, list) {
	if(!list) {
		list = testWords;
	}
	const card = document.createElement("div");
	card.className = "card";
	card.style.left = left ? left : 40 + "vw";
	let p = createWordElement(wordIndex, list);
	p[0].getElementsByTagName("p")[0].innerHTML = "No." + String(list[wordIndex].index);
	p[2].style.filter = "blur(5px)";
	p[1].innerHTML = "　";
	p[1].classList.add("test-word");
	card.appendChild(p[0]);
	card.appendChild(p[1]);
	card.appendChild(p[3]);
	card.appendChild(p[2]);
	return card;
}

function startTest() {
	//入力された範囲の単語を配列に単独に追加
	for (let i = 0; i < parseInt(einput.value) - parseInt(sinput.value) + 1; i++) {
		testWords.push(wordData[parseInt(sinput.value) + i]);
		testWords[testWords.length - 1].index = parseInt(sinput.value) + i;
	}
	//配列をシャッフル
	for (let i = 0; i < testWords.length; i++) {
		const rand = Math.floor(Math.random() * testWords.length);
		const temp = testWords[i];
		testWords[i] = testWords[rand];
		testWords[rand] = temp;
	}
	document.getElementsByTagName("body")[0].style.opacity = "0";
	setTimeout(() => {
		document.getElementsByClassName("range-input")[0].outerHTML = "";
		document.getElementById("bottomCardBlock").innerHTML = "";
		document.getElementById("bottomCardBlock").className = "progress-block";
		document.getElementById("topCardBlock").className = "score-block";
		document.getElementById("topCardBlock").innerHTML = "";
		document.getElementById("middleBlock").className = "test-card-block";
		document.getElementsByClassName("word-card")[0].className = "test-block";

		const scoreText = document.createElement("p");
		scoreText.innerHTML = "0";
		scoreText.id = "scoreText";
		document.getElementById("topCardBlock").appendChild(scoreText);
		const progressBar = document.createElement("div");
		const progressInner = document.createElement("div");
		const progressTextBlock = document.createElement("div");
		const progressText = document.createElement("p");
		progressText.id = "progressText";
		const progressText2 = document.createElement("p");
		progressBar.className = "progress-bar";
		progressInner.id = "progressInner";
		progressTextBlock.className = "progress-text-block";
		document.getElementById("bottomCardBlock").style.flexDirection = "column";

		document.getElementById("bottomCardBlock").appendChild(progressTextBlock);
		progressTextBlock.appendChild(progressText);
		progressTextBlock.appendChild(progressText2);
		progressText.innerHTML = "0";
		progressText2.innerHTML = testWords.length;

		document.getElementById("bottomCardBlock").appendChild(progressBar);
		progressBar.appendChild(progressInner);

		//add card
		for (let i = 0; i < (parseInt(einput.value) - parseInt(sinput.value) + 1 > 7 ? 7 : parseInt(einput.value) - parseInt(sinput.value) + 1); i++) {
			console.log(parseInt(einput.value) - parseInt(sinput.value) + 1 > 7 ? 7 : parseInt(einput.value) - parseInt(sinput.value) + 1);
			const card = createCard(i);
			testBlock.appendChild(card);
			if (i === 0) {
				card.getElementsByClassName("mean")[0].style.filter = "blur(0px)";
			}
		}

		setTimeout(() => {
			document.getElementsByTagName("body")[0].style.opacity = "1";
			setTimeout(() => {
				for (let i = 0; i < testBlock.getElementsByClassName("card").length; i++) {
					testBlock.children[i].style.left = 40 + 25 * i + "vw";
				}
				setTimeout(() => {
					test();
				}, slideTime);
			}, 300);
		}, 500);
	}, 400);
}

start.addEventListener("click", startTest);

function nextQuestion() {
	// カードの幅は20vw、間は5vw
	sliding = true;
	const onevw = window.innerWidth / 100;
	console.log(currentIndex, testWords.length);
	if (currentIndex >= testWords.length) {
		currentIndex = -1;
		showResult();
		console.log("終了");
		return;
	}
	for (let i = 0; i < testBlock.children.length; i++) {
		testBlock.children[i].style.left = parseFloat(getComputedStyle(testBlock.children[i]).left) - onevw * 25 + "px";
	}
	if (currentIndex < 4) {
		testBlock.children[currentIndex].getElementsByClassName("mean")[0].style.filter = "blur(0px)";
	} else if (currentIndex + 3 < testWords.length) {
		testBlock.removeChild(testBlock.children[0]);
		testBlock.appendChild(createCard(currentIndex + 3, 40 + 25 * 3 + "vw"));
		testBlock.children[6].style.left = 40 + 25 * 3 + "vw";
		testBlock.children[3].getElementsByClassName("mean")[0].style.filter = "blur(0px)";
	} else {
		testBlock.removeChild(testBlock.children[0]);
		testBlock.children[3].getElementsByClassName("mean")[0].style.filter = "blur(0px)";
	}
	setTimeout(() => {
		sliding = false;
	}, slideTime);
}

function progress(percent) {
	const progressInner = document.getElementById("progressInner");
	progressInner.style.width = percent + "%";
	document.getElementById("progressText").innerHTML = currentIndex;
	document.getElementById("scoreText").innerHTML = score;
	document.getElementById("scoreText").classList.toggle("change-score");
	setTimeout(() => {
		document.getElementById("scoreText").classList.remove("change-score");
	}, 500);
}

function test() {
	document.addEventListener("keyup", (e) => {
		let index;
		if (currentIndex < 4) {
			index = currentIndex;
		} else {
			index = 3;
		}
		if (e.key === "Enter") {
			if (currentIndex === -1) {
				return;
			}
			if (sliding) {
				return;
			}
			if (testBlock.children.length === 0) {
				return;
			}

			//単語の正誤判定
			if (testBlock.children[index].getElementsByClassName("word")[0].innerHTML.toLowerCase() === testWords[currentIndex].word.toLowerCase()) {
				testBlock.children[index].classList.add("correct");
				testBlock.children[index].getElementsByTagName("img")[0].src = "/img/correct.svg";
				score++;
			} else {
				testBlock.children[index].classList.add("incorrect");
				incorrectWords.push(testWords[currentIndex].index);
				testBlock.children[index].getElementsByClassName("word")[0].innerHTML = "<s>" + testBlock.children[index].getElementsByClassName("word")[0].innerHTML + "</s>";
				//　下に正解を表示する, 誤回答のフォントサイズを小さくする
				testBlock.children[index].getElementsByClassName("correct-word")[0].style.color = "green";
				testBlock.children[index].getElementsByClassName("word")[0].style = "font-size: 1rem;"

				testBlock.children[index].getElementsByTagName("img")[0].src = "/img/incorrect.svg";
				localStorage.setItem(
					storageIndex + 1,
					(localStorage.getItem(storageIndex + 1) ? localStorage.getItem(storageIndex + 1) + "," : "") +
						"[" +
						testWords[currentIndex].word +
						":" +
						(testBlock.children[index].getElementsByClassName("word")[0].innerHTML.replace("<s>", "").replace("</s>", "") === "　"
							? "未入力"
							: testBlock.children[index].getElementsByClassName("word")[0].innerHTML.replace("<s>", "").replace("</s>", "")) +
						"]"
				);
			}
			currentIndex++;
			progress((currentIndex / testWords.length) * 100);

			nextQuestion();
		} else if (e.key.length === 1 && e.key.match(/^[a-zA-Z]+$/)) {
			if (testBlock.children[index].getElementsByClassName("word")[0].innerHTML === "　") {
				testBlock.children[index].getElementsByClassName("word")[0].innerHTML = e.key;
			} else {
				//　文字数制限 20文字
				if (testBlock.children[index].getElementsByClassName("word")[0].innerHTML.length > 20) {
					return;
					// 10文字と15文字のときフォントサイズを小さくする、見た目を良くするため
				}else if(testBlock.children[index].getElementsByClassName("word")[0].innerHTML.length > 15){
					testBlock.children[index].getElementsByClassName("word")[0].style = "font-size: 1rem;";
				}else if(testBlock.children[index].getElementsByClassName("word")[0].innerHTML.length > 10){
					testBlock.children[index].getElementsByClassName("word")[0].style = "font-size: 1.3rem;";
				}
				testBlock.children[index].getElementsByClassName("word")[0].innerHTML += e.key;
			}
		}
	});

	document.addEventListener("keydown", (e) => {
		let index;
		if (currentIndex < 4) {
			index = currentIndex;
		} else {
			index = 3;
		}
		if (e.key === "Backspace") {
			if (testBlock.children[index].getElementsByClassName("word")[0].innerHTML.length > 1) {
				testBlock.children[index].getElementsByClassName("word")[0].innerHTML = testBlock.children[index].getElementsByClassName("word")[0].innerHTML.slice(0, -1);
				if(testBlock.children[index].getElementsByClassName("word")[0].innerHTML.length <= 15){
					// 15文字以下なったら元に戻す
					testBlock.children[index].getElementsByClassName("word")[0].style = "font-size: 1.5rem;";
				}
			} else {
				testBlock.children[index].getElementsByClassName("word")[0].innerHTML = "　";
			}
		}
	});
}
