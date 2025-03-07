const homePage = document.getElementById('home');
const testPage = document.getElementById('testPage');
const resultPage = document.getElementById('resultPage');
const perfectResultRef = document.getElementById('perfectResult');
let pageStatus = 0;

function changePage(p){
    //0: home, 1: testPage, 2: resultPage, 3: perfectResult
    switch (p) {
        case 0:
            removeAllToggles(homePage);
            removeAllToggles(testPage);
            removeAllToggles(resultPage);

            testPage.classList.toggle("out");
            resultPage.classList.toggle("out");
            testPage.style.display = 'none';
            resultPage.style.display = 'none';

            setTimeout(() => {
                homePage.style.display = 'block';
                homePage.classList.toggle("in");
            },1000);

            pageStatus = 0;

            break;
        case 1:
            removeAllToggles(homePage);
            removeAllToggles(testPage);
            removeAllToggles(resultPage);


            homePage.classList.toggle("out");
            resultPage.classList.toggle("out");

            setTimeout(() => {
                homePage.style.display = 'none';
                resultPage.style.display = 'none';
                testPage.style.display = 'block';
                testPage.classList.toggle("in");
            },1000);

            pageStatus = 1;

            break;
        case 2:
            removeAllToggles(homePage);
            removeAllToggles(testPage);
            removeAllToggles(resultPage);


            // keyStatus = 3;
            homePage.classList.toggle("out");
            testPage.classList.toggle("out");

            setTimeout(() => {
                homePage.style.display = 'none';
                testPage.style.display = 'none';
                resultPage.style.display = 'block';
                resultPage.classList.toggle("in");
            },1000);

            pageStatus = 2;
            break;
        case 3:
            homePage.style.display = 'none';
            testPage.style.display = 'none';
            resultPage.style.display = 'none';
            perfectResultRef.style.display = 'block';

            break;
        default:
            break;

    }
}

function removeAllToggles(t){
    const toggles = ['in', 'out'];
    console.log(t)
    for(let i = 0; i < toggles.length; i++){
        t.classList.remove(toggles[i]);
    }
}