let book = "target1900";

let wordData;
let bookLength;

let doingAnimationTop = false;
let doingAnimationBottom = false;

let topAnimationPending = null;
let bottomAnimationPending = null;

let currentWordIndex = [1, 2];

let slideTime = 800;

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

	//reload data
	fetchBookLength(book)
		.then((len) => {
			bookLength = len;
			fetchWordData(1, bookLength)
				.then((data) => {
					wordData = data;
					sinput.disabled = false;
					einput.disabled = false;
					initPutText("top");
					initPutText("bottom");
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

function slideCardsMinus(position, wordIndex) {
	let cardBlock;
	switch (position) {
		case "top":
			if (doingAnimationTop) {
				topAnimationPending = ["minus", wordIndex];
				return;
			} else {
				doingAnimationTop = true;
				topAnimationPending = [null, null];
			}
			cardBlock = topCardBlock;
			break;
		case "bottom":
			if (doingAnimationBottom) {
				bottomAnimationPending = ["minus", wordIndex];
				return;
			} else {
				doingAnimationBottom = true;
				bottomAnimationPending = [null, null];
			}
			cardBlock = bottomCardBlock;
			break;
		default:
			console.error("Invalid position");
			return;
	}

	if (wordIndex > bookLength) {
		wordIndex = bookLength;
	}
	if (wordIndex < 1) {
		wordIndex = 1;
	}

	const cards = Array.from(document.querySelectorAll(`.${position}-card-block .card`));

	updateBlurStates(cards, "minus");

	changeCard(position, 1, wordIndex);

	// カードをアニメーションで移動（右へスライド）
	cards.forEach((card) => {
		// 現在のleft値を取得
		const currentLeftPx = parseFloat(getComputedStyle(card).left);
		const currentLeftVw = (currentLeftPx / window.innerWidth) * 100;
		// 新しいleft値を設定（一つ右に移動）
		card.style.left = currentLeftVw + 25 + "vw";
	});

	// アニメーション終了後に最後のカードを先頭に移動
	setTimeout(() => {
		// 最後のカードを取得
		const lastCard = cards[cards.length - 1];
		// 最後のカードを親要素から削除
		cardBlock.removeChild(lastCard);
		// 最後のカードを先頭に挿入
		cardBlock.insertBefore(lastCard, cardBlock.firstChild);

		// 位置をリセット（CSSが自動適用される）
		//　カード削除後に順番が変わり、CSSのによるぼやけが0.5sでなくなり、
		//　スライドアニメションと同時にぼやけを変化せるために先にカードを消して、
		//　スライド完了後に位置を初期化する
		cards.forEach((card) => {
			card.style.left = "";
		});

		if (position === "top") {
			if (topAnimationPending[0]) {
				console.log(1);
				switch (topAnimationPending[0]) {
					case "plus":
						doingAnimationTop = false;
						slideCardsPlus("top", topAnimationPending[1]);
						break;
					case "minus":
						doingAnimationTop = false;
						slideCardsMinus("top", topAnimationPending[1]);
						break;
					default:
						break;
				}
			} else {
				doingAnimationTop = false;
			}
		} else {
			if (bottomAnimationPending[0]) {
				switch (bottomAnimationPending[0]) {
					case "plus":
						doingAnimationBottom = false;
						slideCardsPlus("bottom", bottomAnimationPending[1]);
						break;
					case "minus":
						doingAnimationBottom = false;
						slideCardsMinus("bottom", bottomAnimationPending[1]);
						break;
					default:
						break;
				}
			} else {
				doingAnimationBottom = false;
			}
		}
	}, slideTime); // (アニメーションの時間-ぼやけtransition)と同じにする

	// 同様に下段のカード処理も実装
}

function slideCardsPlus(position, wordIndex) {
	let cardBlock;
	if (wordIndex > bookLength) {
		wordIndex = bookLength;
	}
	if (wordIndex < 1) {
		wordIndex = 1;
	}
	switch (position) {
		case "top":
			cardBlock = topCardBlock;
			if (doingAnimationTop) {
				topAnimationPending = ["plus", wordIndex];
				return;
			} else {
				doingAnimationTop = true;
				topAnimationPending = [null, null];
			}
			break;
		case "bottom":
			cardBlock = bottomCardBlock;
			if (doingAnimationBottom) {
				bottomAnimationPending = ["plus", wordIndex];
				return;
			} else {
				doingAnimationBottom = true;
				bottomAnimationPending = [null, null];
			}
			break;
		default:
			console.error("Invalid position");
			return;
	}

	const cards = Array.from(document.querySelectorAll(`.${position}-card-block .card`));

	updateBlurStates(cards, "plus");

	changeCard(position, 3, wordIndex);

	// カードをアニメーションで移動（左へスライド）
	cards.forEach((card) => {
		// 現在のleft値を取得
		const currentLeftPx = parseFloat(getComputedStyle(card).left);
		const currentLeftVw = (currentLeftPx / window.innerWidth) * 100;
		// 新しいleft値を設定（一つ右に移動）
		card.style.left = currentLeftVw - 25 + "vw";
	});

	// アニメーション終了後に先頭のカードを最後に移動
	setTimeout(() => {
		// 先頭のカードを取得
		const firstCard = cards[0];
		// 先頭のカードを親要素から削除
		cardBlock.removeChild(firstCard);
		// 先頭のカードを最後に挿入
		cardBlock.insertBefore(firstCard, cardBlock.lastChild);

		// 位置をリセット（CSSが自動適用される）
		cards.forEach((card) => {
			card.style.left = "";
		});

		if (position === "top") {
			if (topAnimationPending[0]) {
				switch (topAnimationPending[0]) {
					case "plus":
						doingAnimationTop = false;
						slideCardsPlus("top", topAnimationPending[1]);
						break;
					case "minus":
						doingAnimationTop = false;
						slideCardsMinus("top", topAnimationPending[1]);
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
						slideCardsPlus("bottom", bottomAnimationPending[1]);
						break;
					case "minus":
						doingAnimationBottom = false;
						slideCardsMinus("bottom", bottomAnimationPending[1]);
						break;
					default:
						break;
				}
			} else {
				doingAnimationBottom = false;
			}
		}
	}, slideTime); // アニメーションの時間と同じにする
	// 同様に下段のカード処理も実装
}

//合併したほうがコードが簡潔
function slideCards(position, direction, wordIndex) {
	let cardBlock;
	if (wordIndex > bookLength) {
		wordIndex = bookLength;
	}
	if (wordIndex < 1) {
		wordIndex = 1;
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
			return;
	}

	const cards = Array.from(document.querySelectorAll(`.${position}-card-block .card`));

	updateBlurStates(cards, "plus");
	changeCard(position, direction === "plus" ? 3 : 1, wordIndex);

	// カードをアニメーションで移動（左へスライド）
	cards.forEach((card) => {
		// 現在のleft値を取得
		const currentLeftPx = parseFloat(getComputedStyle(card).left);
		const currentLeftVw = (currentLeftPx / window.innerWidth) * 100;
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
						slideCardsPlus("top", topAnimationPending[1]);
						break;
					case "minus":
						doingAnimationTop = false;
						slideCardsMinus("top", topAnimationPending[1]);
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
						slideCardsPlus("bottom", bottomAnimationPending[1]);
						break;
					case "minus":
						doingAnimationBottom = false;
						slideCardsMinus("bottom", bottomAnimationPending[1]);
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
		const url = `https://wordtest.iceonce.com/api/v2/searchNum?book=${book}&start=${s}&end=${e}`;
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
		const url = `https://wordtest.iceonce.com/api/v2/len?book=${book}`;
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

function createWordElement(word, mean) {
	const wordElement = document.createElement("p");
	const meanElement = document.createElement("p");
	wordElement.textContent = word;
	meanElement.textContent = mean;
	wordElement.classList.add("word");
	meanElement.classList.add("mean");

	return [wordElement, meanElement];
}

function initPutText(position) {
	const topCards = document.getElementById("topCardBlock").getElementsByTagName("div");
	const bottomCards = document.getElementById("bottomCardBlock").getElementsByTagName("div");
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
			topCards[i].appendChild(createWordElement(wordData[currentIndex].word, wordData[currentIndex].mean)[0]);
			topCards[i].appendChild(createWordElement(wordData[currentIndex].word, wordData[currentIndex].mean)[1]);
		} else if (position === "bottom") {
			bottomCards[i].innerHTML = "";
			bottomCards[i].appendChild(createWordElement(wordData[currentIndex].word, wordData[currentIndex].mean)[0]);
			bottomCards[i].appendChild(createWordElement(wordData[currentIndex].word, wordData[currentIndex].mean)[1]);
		}
	}
}

function changeCard(position, index, wordIndex) {
	const topCards = document.getElementById("topCardBlock").getElementsByTagName("div");
	const bottomCards = document.getElementById("bottomCardBlock").getElementsByTagName("div");
	let elements = createWordElement(wordIndex, wordData[wordIndex].mean);
	// let elements = createWordElement(wordData[wordIndex].word, wordData[wordIndex].mean);

	if (position === "top") {
		topCards[index].innerHTML = "";
		topCards[index].appendChild(elements[0]);
		topCards[index].appendChild(elements[1]);

		currentWordIndex[0] = wordIndex;
	} else if (position === "bottom") {
		bottomCards[index].innerHTML = "";
		bottomCards[index].appendChild(elements[0]);
		bottomCards[index].appendChild(elements[1]);

		currentWordIndex[1] = wordIndex;
	}
}

sinput.addEventListener("keyup", function (e) {
	const index = parseInt(sinput.value);
	if (index === currentWordIndex[0] || toString(index) !== toString(sinput.value)) return;
	console.log(2);
	if (index) {
		if (index > currentWordIndex[0]) {
			slideCards("top", "plus", index);
		} else {
			slideCards("top", "minus", index);
		}
	} else if (currentWordIndex[0] !== 1) {
		slideCards("top", minus, 1);
	}
});

einput.addEventListener("keyup", function (e) {
	const index = parseInt(einput.value);
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
	console.log(bookLength);
});
