const dataIndex = localStorage.getItem("index");
let wordList = JSON.parse(localStorage.getItem(dataIndex * 1)).wrong;
const container = document.getElementById('container');

async function addElement(){
    container.innerHTML = "";
    for(let i = 0; i < wordList.length; i++){
        const data = eval(await getData(wordList[i]));
        const div = document.createElement('div');
        div.id = 'word-' + i;
        const num = document.createElement('p');
        num.innerHTML = data[0][0];
        num.className = 'num';
        const en = document.createElement('p');
        en.innerHTML = data[0][1];
        en.className = 'en';
        const ja = document.createElement('p');
        ja.innerHTML = data[0][2];
        ja.className = 'ja';
        container.appendChild(div);
        div.appendChild(num);
        div.appendChild(en);
        div.appendChild(ja);

        en.addEventListener("mouseenter", () => {
            en.style.opacity = '1';
        });
        en.addEventListener("mouseleave", () => {
            if(document.getElementById('enCheckBox').checked === false) en.style.opacity = '0';
        });

        ja.addEventListener("mouseenter", () => {
            ja.style.opacity = '1';
        });
        ja.addEventListener("mouseleave", () => {
            if(document.getElementById('jaCheckBox').checked === false) ja.style.opacity = '0';
        });
    }

}

async function getData(s){
    const url = `http://127.0.0.1:5000/searchNum/${s}/${s}/0`;
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


function sortNumber(){
    console.log(wordList);
    let newArray = wordList;
    let Temp = 0;
    for(let i = 0; i < wordList.length; i++){
        for(let j = i; j < wordList.length; j++){
            if(newArray[j]*1 < newArray[i]*1){
                Temp = newArray[i];
                newArray[i] = newArray[j];
                newArray[j] = Temp;
            }
        }
    }
    console.log(newArray);
    wordList = newArray;
    addElement().then(r => r);
}

sortNumber();

document.getElementById('enCheckBox').addEventListener("change", () => {
    const en = document.getElementsByClassName('en');
    for(let i = 0; i < en.length; i++){
        en[i].style.opacity = en[i].style.opacity === '0' ? '1' : '0';
    }
});

document.getElementById('jaCheckBox').addEventListener("change", () => {
    const ja = document.getElementsByClassName('ja');
    for(let i = 0; i < ja.length; i++){
        ja[i].style.opacity = ja[i].style.opacity === '0' ? '1' : '0';
    }
});