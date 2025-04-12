function showResult() {
	for (let i = 0; i < testBlock.getElementsByClassName("card").length; i++) {
		testBlock.getElementsByClassName("card")[i].style.left = 40 + "vw";
	}
	setTimeout(() => {
		document.getElementsByTagName("body")[0].style.opacity = "0";
		setTimeout(() => {
			memoryCard();
			document.getElementById("bottomCardBlock").innerHTML = "";
			document.getElementsByTagName("body")[0].style.opacity = "1";
			document.getElementById("scoreText").style.transform = "scale(3)";
			document.getElementById("scoreText").innerHTML = String((score / testWords.length) * 100) + "%";
			const div = document.createElement("div");
			div.className = "analyze-button-content";
			const button = document.createElement("button");
			// div.appendChild(button);
			button.innerHTML = "分析を見る";
			button.className = "analyze-button";
			// document.getElementById("bottomCardBlock").appendChild(div);
			button.addEventListener("click", () => {
				analyzeResult();
			});
		}, 300);
	}, 500);
}

let analyzeResult = async () => {
	console.log(localStorage.getItem(storageIndex));
	try {
		const url = "http://" + location.host + "/api/v1/analyze";
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ prompt: localStorage.getItem(parseInt(storageIndex) + 1) }),
		});
		const json = await response.json();
		console.log(json.data);
		const p = document.createElement("pre");
		p.innerHTML = json.data;
		p.className = "advise";
		testBlock.innerHTML = "";
		testBlock.appendChild(p);
	} catch (error) {
		console.error(error);
	}
	analyzeResult = () => {};
};

function memoryCard() {
	for (let j = 0; j < incorrectWords.length; j++) {
		for (let i = j; i < incorrectWords.length; i++) {
			if (parseInt(incorrectWords[i]) < parseInt(incorrectWords[j])) {
				let temp = incorrectWords[i];
				incorrectWords[i] = incorrectWords[j];
				incorrectWords[j] = temp;
				console.log(incorrectWords);
			}
		}
	}

	testBlock.innerHTML = "";
	const memorylength = incorrectWords.length > 7 ? 7 : incorrectWords.length;
	for (let i = 0; i < memorylength; i++) {
		testBlock.appendChild(createMemoryCard(incorrectWords[i], i));
	}

	setTimeout(() => {
		for (let i = 0; i < testBlock.getElementsByClassName("memory-card").length; i++) {
			testBlock.children[i].style.left = 40 + 25 * i + "vw";
		}
		memoryCardScroll();
	}, 300);
}

function createMemoryCard(wordIndex, index) {
	const card = createCard(wordIndex, 40, wordData);
	card.getElementsByTagName("img")[0].src = "/new/img/incorrect.svg";
	card.className = "memory-card";
	card.classList.add("incorrect");
	card.getElementsByClassName("word-info")[0].children[0].innerHTML = "No." + wordIndex;
	card.getElementsByClassName("word")[0].innerHTML = wordData[wordIndex].word;
	card.dataset.index = index;
	card.style.left = "40vw";
	card.getElementsByClassName("word")[0].style.filter = "blur(0px)";
	card.getElementsByClassName("mean")[0].style.filter = "blur(0px)";
	return card;
}

function memoryCardScroll() {
	let lastScroll = 0;

	testBlock.addEventListener("wheel", (e) => {
		e.preventDefault();
		const lastCardIndex = parseInt(Array.from(testBlock.children).slice(-1)[0].dataset.index);
		if (e.timeStamp - lastScroll < 300) {
			return;
		}

		lastScroll = e.timeStamp;
		let scroolLen = 25;
		if (Math.sqrt(Math.pow(e.deltaX, 2) + Math.pow(e.deltaY, 2)) > 100) {
			scroolLen = 50;
		} else if (Math.sqrt(Math.pow(e.deltaX, 2) + Math.pow(e.deltaY, 2)) < 5) {
			return;
		}
		console.log(Math.sqrt(Math.pow(e.deltaX, 2) + Math.pow(e.deltaY, 2)));
		if (e.deltaY > 0 || e.deltaX > 0) {
			if (lastCardIndex === incorrectWords.length - 1 && parseInt(Array.from(testBlock.children).slice(-1)[0].style.left) === 40) {
				return;
			} else if (lastCardIndex !== incorrectWords.length - 1 && parseInt(Array.from(testBlock.children).slice(-1)[0].style.left) === 40 + 3 * 25) {
				testBlock.children[0].remove();
				let card = createMemoryCard(incorrectWords[lastCardIndex + 1], lastCardIndex + 1);
				card.style.left = 40 + 25 * 4 + "vw";
				testBlock.appendChild(card);
			}
			for (let i = 0; i < testBlock.getElementsByClassName("memory-card").length; i++) {
				testBlock.children[i].style.left = parseInt(testBlock.children[i].style.left) - 25 + "vw";
			}
		} else if (e.deltaY < 0 || e.deltaX < 0) {
			if (testBlock.children[0].dataset.index === "0" && parseInt(testBlock.children[0].style.left) === 40) {
				return;
			} else {
				if (testBlock.children[0].dataset.index !== "0" && parseInt(testBlock.children[0].style.left) === 40 - 25 * 3) {
					Array.from(testBlock.children).slice(-1)[0].remove();
					let card = createMemoryCard(incorrectWords[parseInt(testBlock.children[0].dataset.index) - 1], parseInt(testBlock.children[0].dataset.index) - 1);
					card.style.left = 40 - 25 * 4 + "vw";
					testBlock.prepend(card);
				}
			}
			for (let i = 0; i < testBlock.getElementsByClassName("memory-card").length; i++) {
				testBlock.children[i].style.left = parseInt(testBlock.children[i].style.left) + 25 + "vw";
			}
		}
	});
}
