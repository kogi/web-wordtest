let book = "target1900";

let wordData;
let bookLength;

let doingAnimationTop = false;
let doingAnimationBottom = false;

let topAnimationPending = null;
let bottomAnimationPending = null;

let currentWordIndex = [1, 2];

let slideTime = 500;

document.getElementById("target1900Img").classList.add("selected");

const sinput = document.getElementById("sinput");
const einput = document.getElementById("einput");

document.getElementById("bookSelect").addEventListener("click", function (e) {
	const book1 = document.getElementById("target1900Img");
	const book2 = document.getElementById("corpus4500Img");
	if (e.target.tagName !== "IMG") return;
	book = e.target.alt;
	if (e.target.classList.contains("selected")) {
		return;
	} else {
		sinput.disabled = true;
		einput.disabled = true;
		if (e.target === book1) {
			book2.classList.remove("selected");
			book1.classList.add("selected");
		} else if (e.target === book2) {
			book1.classList.remove("selected");
			book2.classList.add("selected");
		}
	}
	const topCards = Array.from(document.querySelectorAll(`.top-card-block .card`));
	const bottomCards = Array.from(document.querySelectorAll(`.bottom-card-block .card`));

	topCards[2].setAttribute("data-blur", "true");
	bottomCards[2].setAttribute("data-blur", "true");

	//reload data
	fetchBookLength(book)
		.then((len) => {
			bookLength = len;
			fetchWordData(1, bookLength)
				.then(async (data) => {
					wordData = data;
					sinput.disabled = false;
					einput.disabled = false;
					await initPutText("top");
					await initPutText("bottom");
					topCards[2].setAttribute("data-blur", "false");
					bottomCards[2].setAttribute("data-blur", "false");
					currentWordIndex = [1, 2];
					sinput.dispatchEvent(new Event("keyup"));
					einput.dispatchEvent(new Event("keyup"));
				})
				.catch((error) => {
					console.error(error);
				});
		})
		.catch((error) => {
			console.error(error);
		});
});

const topCardBlock = document.querySelector(".top-card-block");
const bottomCardBlock = document.querySelector(".bottom-card-block");

//合併したほうがコードが簡潔
async function slideCards(position, direction, wordIndex) {
	let cardBlock;
	if (direction !== "plus" && direction !== "minus") {
		console.error("Invalid direction");
		topAnimationPending = [null, null];
		bottomAnimationPending = [null, null];
		return;
	}
	switch (position) {
		case "top":
			cardBlock = topCardBlock;
			if (doingAnimationTop) {
				topAnimationPending = [direction, wordIndex];
				return;
			} else {
				doingAnimationTop = true;
				topAnimationPending = [null, null];
			}
			break;
		case "bottom":
			cardBlock = bottomCardBlock;
			if (doingAnimationBottom) {
				bottomAnimationPending = [direction, wordIndex];
				return;
			} else {
				doingAnimationBottom = true;
				bottomAnimationPending = [null, null];
			}
			break;
		default:
			console.error("Invalid position");
			topAnimationPending = [null, null];
			bottomAnimationPending = [null, null];
			return;
	}

	const cards = Array.from(document.querySelectorAll(`.${position}-card-block .card`));
	await changeCard(position, direction === "plus" ? 3 : 1, wordIndex); //単語内容を変更してスライド
	updateBlurStates(cards, direction);

	// カードをアニメーションで移動（左へスライド）
	cards.forEach((card) => {
		// 現在のleft値を取得
		const currentLeftPx = parseFloat(getComputedStyle(card).left);
		const currentLeftVw = (currentLeftPx / window.innerWidth) * 100; //pxをvwに変換
		// 新しいleft値を設定（一つ右に移動）
		card.style.left = currentLeftVw + (direction === "plus" ? -25 : 25) + "vw";
	});

	setTimeout(() => {
		if (direction === "plus") {
			const firstCard = cards[0];
			cardBlock.removeChild(firstCard);
			cardBlock.insertBefore(firstCard, cardBlock.lastChild);
		} else {
			const lastCard = cards[cards.length - 1];
			cardBlock.removeChild(lastCard);
			cardBlock.insertBefore(lastCard, cardBlock.firstChild);
		}

		// 位置をリセット（CSSが自動適用される）
		cards.forEach((card) => {
			card.style.left = "";
		});

		if (position === "top") {
			if (topAnimationPending[0]) {
				switch (topAnimationPending[0]) {
					case "plus":
						doingAnimationTop = false;
						slideCards("top", "plus", topAnimationPending[1]);
						break;
					case "minus":
						doingAnimationTop = false;
						slideCards("top", "minus", topAnimationPending[1]);
						break;
					default:
						break;
				}
				topAnimationPending = [null, null];
			} else {
				doingAnimationTop = false;
			}
		} else {
			if (bottomAnimationPending[0]) {
				switch (bottomAnimationPending[0]) {
					case "plus":
						doingAnimationBottom = false;
						slideCards("bottom", "plus", bottomAnimationPending[1]);
						break;
					case "minus":
						doingAnimationBottom = false;
						slideCards("bottom", "minus", bottomAnimationPending[1]);
						break;
					default:
						break;
				}
			} else {
				doingAnimationBottom = false;
			}
		}
	}, slideTime); // アニメーションの時間と同じにする
}

// ぼかし状態を更新する関数
function updateBlurStates(cards, direction) {
	if (direction === "plus") {
		// 左方向へスライドする場合のぼかし更新
		// 例: 2番目のカードが中央に、4番目のカードが中央に移動する
		for (let i = 0; i < cards.length; i++) {
			if (i === 3) {
				cards[i].setAttribute("data-blur", "false");
			} else {
				cards[i].setAttribute("data-blur", "true");
			}
		}
	} else {
		// 右方向へスライドする場合のぼかし更新
		// ロジックを逆にする
		for (let i = 0; i < cards.length; i++) {
			if (i === 1) {
				cards[i].setAttribute("data-blur", "false");
			} else {
				cards[i].setAttribute("data-blur", "true");
			}
		}
	}
}

function setSlideTime(time) {
	slideTime = time;
	document.getElementById("hoge").style.setProperty("--var-slide-time", `${time}ms`);
}

async function fetchWordData(s, e) {
	// データの取得
	try {
		const url = `https://wordtest.iceonce.com/api/v3/searchNum?book=${book}&start=${s}&end=${e}`;
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`status: ${response.status}`);
		}

		const json = await response.json();
		return json.data;
	} catch (error) {
		console.error(error.message);
		return false;
	}
}

async function fetchBookLength(book) {
	try {
		const url = `https://wordtest.iceonce.com/api/v3/len?book=${book}`;
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`status: ${response.status}`);
		}
		const json = await response.json();
		return json.len;
	} catch (error) {
		console.error(error.message);
		return 0;
	}
}

function createWordElement(index, list) {
	if (!list) {
		list = wordData;
	}
	const word = list[index].word;
	const mean = list[index].mean;
	const wordInfo = document.createElement("div");
	wordInfo.classList.add("word-info");
	const wordNumber = document.createElement("p");
	const iscorrect = document.createElement("img");
	const wordElement = document.createElement("p");
	const meanElement = document.createElement("p");
	wordNumber.textContent = "No." + String(index);
	iscorrect.src = "/img/blank.svg";
	wordElement.textContent = word;
	meanElement.textContent = mean;
	if (word.length > 30) {
		wordElement.style.fontSize = "0.7rem";
	}
	if (mean.length > 30) {
		meanElement.style.fontSize = "0.7rem";
	}

	wordInfo.appendChild(wordNumber);
	wordInfo.appendChild(iscorrect);
	wordElement.classList.add("word");
	meanElement.classList.add("mean");

	return [wordInfo, wordElement, meanElement];
}

function initPutText(position) {
	return new Promise((resolve, reject) => {
		const topCards = document.getElementById("topCardBlock").getElementsByClassName("card");
		const bottomCards = document.getElementById("bottomCardBlock").getElementsByClassName("card");
		if (position === "top") {
			wordIndex = 1;
		} else {
			wordIndex = 2;
		}
		for (let i = 0; i < 5; i++) {
			let currentIndex;
			if (wordIndex + i - 2 < 1) {
				currentIndex = 1;
			} else if (wordIndex + i - 2 > bookLength) {
				currentIndex = bookLength;
			} else {
				currentIndex = wordIndex + i - 2;
			}
			if (position === "top") {
				topCards[i].innerHTML = "";
				topCards[i].appendChild(createWordElement(currentIndex)[0]);
				topCards[i].appendChild(createWordElement(currentIndex)[1]);
				topCards[i].appendChild(createWordElement(currentIndex)[2]);
			} else if (position === "bottom") {
				bottomCards[i].innerHTML = "";
				bottomCards[i].appendChild(createWordElement(currentIndex)[0]);
				bottomCards[i].appendChild(createWordElement(currentIndex)[1]);
				bottomCards[i].appendChild(createWordElement(currentIndex)[2]);
			}
		}
		requestAnimationFrame(() => {
			resolve(true);
		});
	});
}

function changeCard(position, index, wordIndex) {
	return new Promise((resolve, reject) => {
		const topCards = document.getElementById("topCardBlock").getElementsByClassName("card");
		const bottomCards = document.getElementById("bottomCardBlock").getElementsByClassName("card");
		// let elements = createWordElement(wordIndex, wordData[wordIndex].mean);
		let elements = createWordElement(wordIndex);

		if (position === "top") {
			topCards[index].innerHTML = "";
			topCards[index].appendChild(elements[0]);
			topCards[index].appendChild(elements[1]);
			topCards[index].appendChild(elements[2]);

			currentWordIndex[0] = wordIndex;
		} else if (position === "bottom") {
			bottomCards[index].innerHTML = "";
			bottomCards[index].appendChild(elements[0]);
			bottomCards[index].appendChild(elements[1]);
			bottomCards[index].appendChild(elements[2]);

			currentWordIndex[1] = wordIndex;
		}
		// DOM更新が反映されるのを待つための小さな遅延
		// requestAnimationFrameを2回使用することで、レンダリングサイクルを確実に待つ
		requestAnimationFrame(() => {
			resolve(true); // DOM更新が反映された後に解決
		});
	});
}

sinput.addEventListener("keyup", function (e) {
	let index = parseInt(sinput.value);
	if (index > bookLength) {
		sinput.value = bookLength;
		index = bookLength;
	}
	if (index < 1) {
		// sinput.value = 1;
		index = 1;
	}
	if (index === currentWordIndex[0] || toString(index) !== toString(sinput.value)) return;
	console.log(2);
	if (index) {
		if (index > currentWordIndex[0]) {
			slideCards("top", "plus", index);
		} else {
			slideCards("top", "minus", index);
		}
	} else if (currentWordIndex[0] !== 1) {
		slideCards("top", "minus", 1);
	}
});

einput.addEventListener("keyup", function (e) {
	let index = parseInt(einput.value);
	if (index > bookLength) {
		einput.value = bookLength;
		index = bookLength;
	}
	if (index < 1) {
		// sinput.value = 1;
		index = 1;
	}
	if (index === currentWordIndex[1] || toString(index) !== toString(einput.value)) return;
	if (index) {
		if (index > currentWordIndex[1]) {
			slideCards("bottom", "plus", index);
		} else {
			slideCards("bottom", "minus", index);
		}
	} else if (currentWordIndex[1] !== 2) {
		slideCards("bottom", "minus", currentWordIndex[0] + 1);
		currentWordIndex[1] = currentWordIndex[0] + 1;
	}
});

window.addEventListener("load", async function () {
	bookLength = parseInt(await fetchBookLength(book));
	wordData = await fetchWordData(1, bookLength);
	initPutText("top", 1);
	initPutText("bottom", 2);
	sinput.disabled = false;
	einput.disabled = false;
});
