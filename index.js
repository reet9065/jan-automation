const puppeteer = require('puppeteer-core');

const AddactivityTimes = process.argv[2];

if(!AddactivityTimes || isNaN(AddactivityTimes)){
    console.error('After the script file name Please enter a numaric value, how many activity you want to add');
    process.exit(1);
}



const TotalActivityLength = 74;
var PrevDoneActivity = []



function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

function getrandom(min, max) {
    var randIndex = Math.floor(Math.random() * (max - min + 1)) + min;
    return randIndex;
}



(async () => {
    const browser = await puppeteer.launch({
        "headless": false,
        defaultViewport: false,
        executablePath: 'C:/Program Files/Google/Chrome/Application/Chrome.exe'
    });
    const page = await browser.newPage();


    await page.goto('https://poshanabhiyaan.gov.in/login', {
        waitUntil: "domcontentloaded",
    })
        .catch((err) => console.log("error loading url", err));



    await delay(2000);

    await page.type('input[name = username]', 'mow&cd-1022912')
    await page.type('input[name = password]', 'mow&cd-1022912')

    await Promise.all([
        page.waitForNavigation(),
        page.click('button[type = "submit"]')
    ])
    ////////////////////////////Functions Starts/////////////////////////////////////////////////////////////

    // key presser
    async function keypresser(key, times) {
        for (let i = 1; i <= times; i++) {
            await page.keyboard.press(key);
        }
    }

    // Evaluat length of the dropdown
    async function evelDropdown(selecter){
        var selecterlist = await page.$$eval(`${selecter}>option`, options => {
            return options.map(option => option.value);
        });
        selecterlist.shift();
        return selecterlist.length;
    };

    // Select Random Theam

    async function selectRandomTheme(){
        var teamLength = await evelDropdown('select[name = SelectTheme]')
        var selet = await page.$('select[name = SelectTheme]')
        await selet.click();
        await keypresser('ArrowUp', teamLength)
        var keypestimes = await getrandom(1, teamLength);
        await keypresser('ArrowDown', keypestimes);
        await page.keyboard.press('Enter');
        await delay(2000);
        return keypestimes;
    }



    // exact select from dropdown
    async function selecExact(selecter, indexno) {
        var selet = await page.$(selecter)
        await selet.click();
        await keypresser('ArrowDown', indexno)
        await page.keyboard.press('Enter');
    }


    // Random select from dropdown
    async function selectrandomActivity() {

        var Genarr;

        do {

            var themeSelected = await selectRandomTheme();
            var Alength = await evelDropdown('select[name = SelectActivity]');
            var ChooseA = getrandom(1, Alength);
            Genarr = new Array(themeSelected, ChooseA);
            
        } while (PrevDoneActivity.find((ar)=> JSON.stringify(ar) === JSON.stringify(Genarr))); // line no. 4

        PrevDoneActivity.push(Genarr);

        await selecExact('select[name = SelectActivity]', Genarr[1]);
        
    }



    /// click on element position 
    async function clickOnElement(elem, x = null, y = null) {
        const rect = await page.evaluate(el => {
            const { top, left, width, height } = el.getBoundingClientRect();
            return { top, left, width, height };
        }, elem);

        // Use given position or default to center
        const _x = x !== null ? x : rect.width - 15;
        const _y = y !== null ? y : rect.height / 2;

        await page.mouse.click(rect.left + _x, rect.top + _y);
    }


    // scroll to the element 
    async function scrollTotheElement(xpath) {
        var ele = await page.waitForXPath(xpath)
        await page.evaluate((pageitem) => pageitem.scrollIntoView(), ele)
    }


    ////////////////////////////Functions END/////////////////////////////////////////////////////////////      




    /// Add activity 

    async function addActivity() {
        await delay(2000);
        //selecting level input
        await selecExact('select[name = SelectLevel]', 2);

        // push the code for one second to load the  awc center input
        await delay(1000);

        // after loding awc center selection the AWC input
        await selecExact('select[name = awc_center]', 44);

        // Select Random activity
        await selectrandomActivity();

        // Piciking the defulte fromdate and to date by click mouse on position of x,y 
        var fromDateref = await page.$('input[name = SelectDateFrom]')
        await clickOnElement(fromDateref);
        //await page.keyboard.press('ArrowLeft');
        await page.keyboard.press('Enter');
        await delay(500)
        var toDateref = await page.$('input[name = SelectDateTo]')
        await clickOnElement(toDateref);
        //await page.keyboard.press('ArrowLeft');
        await page.keyboard.press('Enter');

        
        // scrolling
        await scrollTotheElement('//*[@id="root"]/div/div[2]/div/div/div/div/form/div[1]/div/div[6]/div/div/select')
        await delay(1000)
        /////////////////////////////////////////////////////////////////////////////////////    
        // filling the Participation Details 

        // type in feild 
        async function typeinfeild(elm, text) {
            var feild = await page.$(elm)
            await feild.click({ clickCount: 2 })
            await page.keyboard.type(text)

        }
        //A randmno. genarator 
        var rndomno = () => {
            return Math.floor(Math.random() * (5 - 1 + 1)) + 1;
        }


        // Feild Adult Male 
        await typeinfeild('input[name = CountAdultMale]', `${rndomno()}`);
        // Feild Adult Female
        await typeinfeild('input[name = CountAdultFemale]', `${rndomno()}`);
        // Feild child
        await typeinfeild('input[name = CountChildMale]', `${rndomno()}`);
        await typeinfeild('input[name = CountChildFemale]', `${rndomno()}`);
        ///////////////////////////////////////////////////////////////////////////////////

        await scrollTotheElement('//*[@id="root"]/div/div[2]/div/div/div/div/form/div[2]/div/div/div/div/table/tbody/tr[2]/th[2]/input')
        await delay(1000)

        //submit

        var submitbtn = await page.$('button[type=submit]');
        await submitbtn.click();

        await page.waitForSelector('.form-submitted-row>.row>.col-sm-12>.form-submitted-section>p', { timeout: 20000 })
        var massageIs = await page.$eval('.form-submitted-row>.row>.col-sm-12>.form-submitted-section>p' , el => el.innerText);

        await delay(500)
        
        return massageIs;

    }


    async function restartTask(){
        var Reset = await page.$('button[type=reset]');
        await Reset.click();
        await scrollTotheElement('//*[@id="root"]/div/div[2]/div/div/div/div/div/div')
        var Taskreturn = await addActivity();
        return Taskreturn;
    }
    

    async function runTask(times){

        let ActivityAddedTimes = 0;
        let attemt = 1;

        do{

            if(attemt==1){
                attemt++
                var Taskreturn = await addActivity()
                if(Taskreturn != 'This activity participation data already exists on this interval!'){
                    ActivityAddedTimes++;
                    console.log(`activity added ${ActivityAddedTimes}` )
                }
            }else{
                attemt++
                var Taskreturn = await restartTask()
                if(Taskreturn != 'This activity participation data already exists on this interval!'){
                    ActivityAddedTimes++;
                    console.log(`activity added ${ActivityAddedTimes}` )
                }
            }
        } while (ActivityAddedTimes < times);

        console.log("In case you have to add more activity today copy the array given below and paste into line no. 5 variable called >>PrevDoneActivity<<");
        console.log(PrevDoneActivity)
        console.log("Don't forget to remove the array after adding second time")
        console.log('Task Done !!!!!!!!!')
        await delay(500);
        await browser.close();
    }runTask(AddactivityTimes)








    // 
    //mow&cd-1022912
    //mow&cd-1022912
})();