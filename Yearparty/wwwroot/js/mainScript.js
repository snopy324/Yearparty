
let rewardList = [
    { id: 1, name: '第五獎 1000元禮卷', amount: 10, numberToSendOut: 0, method: '' },
    // { name: '第四獎 3000元禮卷', amount: 0, numberToSendOut: 0, method: '' },
    // { name: '第三獎 5000元禮卷', amount: 0, numberToSendOut: 0, method: '' },
    // { name: '第二獎 10000元禮卷', amount: 0, numberToSendOut: 0, method: 'animateDraw' },
    // { name: '特獎 20000元', amount: 1, numberToSendOut: 0, method: 'animateDraw' },
];

let winnerList = [];
let DataBase = [];
let Doras = [
    { empid: 00000, empname: "多拉b夢", },
    { empid: 00000, empname: "多拉e夢", },
    { empid: 00000, empname: "多拉a夢", },
    { empid: 00000, empname: "多拉d夢", },
    { empid: 00000, empname: "多拉c夢", },
];
let RamdomList = [];
let empList = [];
let audioList = [];
let audioIndex = 0;
const filePath = 'photos';
const fontSize = 100;
const fps = 50;
let drawFinshed = true;
let soFarID = 0;

var stepPX = [
    90, 90, 90, 90,
    85, 85, 85, 85,
    80, 80, 80, 80,
    75, 75, 70, 70,
    65, 65, 60, 60,
    55, 55,
    50, 50, 50, 50,
    45, 45,
    40, 40, 35, 35,
    30, 30, 25, 25,
    20, 20, 20, 20,
    20, 20, 20, 20,
    15, 15, 15, 15,
    10, 10, 5, 5
    // end with +70
    - 5, -5, -10, -10,
    -15, -15, -15, -15
    - 10, -10, -5, -5,
    // end with -50
    5, 10, 10, 15,
    15, 10, 10, 5,
    //end with +30
    -2, -3, -5, -10, -5, -3, -2
];

let BasicRowStep = 20; //need to define random range 40~60?
let lastPic = 0;
let indexSum = -1;
let drawInRowTime = 0;
let photoEle = $('#empphoto');
let empsEle = $('#empid');
let rewardListEle = $('#rewardList');
let machine = $($('.machine')[0]);
let player = document.getElementById('audioplayer');
let bgmplayer = document.getElementById('bgm');
let rewardInDraw = rewardList[0];
let isBGMPlaying = false;
let snapShotFlag = false;
const bgmVolumn = 0.05;
const reducer = (accumlator, currentValue) => accumlator + currentValue;
player.addEventListener('ended', endAudio);
player.addEventListener('error', errAudio);

let testingFlag = false;



//========================================================

$(function () {
    urlParams = new URLSearchParams(window.location.search);
    testingFlag = urlParams.has('test');
    if (testingFlag) {
        setTimeout(() => {
            $('container:hidden').fadeIn(1000);
            $('#frame').fadeOut(1000, () => { $('#frame').remove() });
        }, 2000);
        TestingNextDraw();

        function TestingNextDraw() {
            setTimeout(() => {
                $('#arm').trigger('click');
            }, 5000);
        }
    }
})


//========================================================

if (myName) {
    logIn();
} else {
    alert('請先登入');
}

$('#frame').on('load', function () {
    $(this).contents().find("body").keyup(
        ($event) => {
            if ($event.code == "Enter") {
                setTimeout(() => {
                    window.postMessage(true)
                }, 1000)
            }
        }
    );
});

window.addEventListener('message', ($event) => {
    if (!isBGMPlaying) {
        $('#bgm').attr('src', './bgm.mp3');
        bgmplayer.play();
        bgmplayer.volume = bgmVolumn;
        isBGMPlaying = !isBGMPlaying;
        $('container:hidden').fadeIn(1000);
        $('#frame').fadeOut(1000, () => { $('#frame').remove() });

        window.addEventListener('keyup', function ($event) {
            console.log($event)
            if ($event.altKey && $event.key == "g") {
                $('#arm').trigger('click');
            } else if ($event.altKey && $event.key == "n") {
                $('#Bottomlogo').trigger('click');
            } else if ($event.altKey && $event.key == "p") {
                //try to Pause
                drawInRowTime = 0;
                testingFlag = false;
            }
        })

    }
})


function loadData() {
    $.ajax({
        url: `${window.origin}/api/winning`,
        method: 'GET',
        success: (data) => {
            DataBase = data;
            createRamdonData();
            addData(100);
            empList = empsEle.children().toArray().map(e => e.innerText.substring(0, 5));
            photoEle.css('background-image', `url('${filePath}/${empList[2]}.png')`);
        }
    })
}


function loadRewardedData() {
    $.ajax({
        url: `${window.origin}/api/winning/GetRewardedData`,
        method: 'GET',
        success: (data) => {
            rewardList = [];
            data.forEach(element => {
                rewardList.push(element);
            });
            changeRewardInDraw();

        }
    })
}


function createRamdonData() {
    RamdomList = DataBase
        .map((a) => ({
            sort: Math.random(),
            value: a
        }))
        .sort((a, b) => a.sort - b.sort)
        .map(a => a.value).concat(RamdomList);
}


function addData(count = 1, isAppend = true) {

    for (let i = 1; i <= count; i++) {
        if (!RamdomList.length) {
            createRamdonData();
        }
        let emp = RamdomList.pop();
        let idEle = $('<div></div>').text(emp.empid.toString().padStart(5, '0')).addClass('idEle');
        let nameEle = $('<div></div>').text(emp.empname.substring(0, 5)).addClass('nameEle');
        var newEle = $('<div></div>').offset({
            top: (i + indexSum) * fontSize,
        }).attr('id', soFarID.toString())
            .css('zIndex', -10)
            .width('100%')
            .css('font-size', `${fontSize - 30}px`).append(idEle, nameEle);
        if (isAppend) {
            empsEle.append(newEle);
        }
        else {
            empsEle.prepend(newEle);
        }
        soFarID += 1;
    }

    indexSum += count;

}


function sendWinningData(emp) {
    $.ajax({
        url: `${window.origin}/api/winning`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(emp),
        success: (result) => {
            if (!result) {
                // alert('Error');
                console.error(emp);
            }
            //TODO


            rewardInDraw.numberToSendOut += 1;
            winnerList.push(emp);

            if ((rewardInDraw.numberToSendOut > 0 && rewardInDraw.numberToSendOut % 10 === 0) || rewardInDraw.numberToSendOut === rewardInDraw.amount) {
                snapShotFlag = true;
                // snapShot();
            }

        }
    })
}


function draw() {

    if (!rewardInDraw.method === 'animateDraw') {
        BasicRowStep = Math.floor(Math.random() * 21) + 30;
    } else {
        BasicRowStep = 20;
    }


    changeRewardInDrawCount(rewardInDraw.numberToSendOut + 1);
    rowStep = BasicRowStep;
    moveStep = BasicRowStep;
    empList = empsEle.children().toArray().map(e => e.innerText.substring(0, 5));
    addData(100 - empList.length);
    lastPic = 0;

    var featureWinner = Number($(empsEle.children().toArray()[moveStep + 2]).text().substring(0, 5));
    if (winnerList.filter(e => e.empid === featureWinner).length) {
        removeWinnerEmpEles(featureWinner);
        draw();
        return;
    }

    var arm = $('#arm').addClass('clicked');
    delay = setTimeout(function () { arm.removeClass('clicked') }, 500);

    if (rewardInDraw.method === 'animateDraw') {
        rowStep = rowStep + stepPX.length;
        moveStep = BasicRowStep + stepPX.reduce(reducer) / fontSize;
    }

    for (let t = 0; t <= rowStep - 1; t++) {
        setTimeout(() => {
            let px = t >= BasicRowStep ? stepPX[t - BasicRowStep] : fontSize;
            empsEle.animate({
                top: `-=${px}`,
            }, fps, "linear", function () {
                if (Math.floor(empsEle.position().top / fontSize) !== lastPic) {
                    if (Math.floor(empsEle.position().top / fontSize) < lastPic) {
                        lastPic = Math.floor(empsEle.position().top / fontSize);
                        photoEle.css('background-image', '');
                        photoEle.css('background-image', `url('${filePath}/${empList[-lastPic + 2 - 1]}.png')`);
                        addData(1);
                    }
                }
                if (t + 1 === rowStep) {
                    var WinnerId = $(empsEle.children().toArray()[moveStep + 2]);
                    photoEle.css('background-image', '');
                    photoEle.css('background-image', `url('${filePath}/${WinnerId.text().substring(0, 5)}.png')`);
                    setTimeout(() => {
                        finishedDraw(WinnerId);
                    }, fps / 2);
                }
            });
        }, fps * t)
    }

}


function finishedDraw(WinnerId) {
    var px = rewardInDraw.method === 'animateDraw' ? BasicRowStep + stepPX.reduce(reducer) / fontSize : BasicRowStep;
    removeUsedEmpEles(px);
    let emp = DataBase.filter(e => e.empid === Number(WinnerId.text().substring(0, 5)))[0];
    emp.rewardid = rewardInDraw.id;
    emp.reward = rewardInDraw.name;


    removeWinnerEmpEles(emp.empid, WinnerId.attr('id'));
    //Remove Rewarded emp from three array

    sortEles();
    sendWinningData(emp);
    if (rewardListEle.children().toArray().length === 10 && rewardInDraw.numberToSendOut < rewardInDraw.amount) {
        moveRewardList();
    }
    addToRewardList(emp);

    wordsloops = rewardInDraw.method === 'animateDraw' ? 3 : 1;
    loops = rewardInDraw.method === 'animateDraw' ? 19 : 0;

    wordsZoneIn();
    removeAddClass();

    function wordsZoneIn() {
        WinnerId.animate({
            top: "-=35px",
            fontSize: "+=40px"
        }, 250, function () {
            WinnerId.animate({
                top: "+=35px",
                fontSize: "-=40px"
            }, 250)
        });
        if (--wordsloops > 0)
            setTimeout(wordsZoneIn, 550);
    }
    function removeAddClass() {
        if (--loops > 0) {
            machine.toggleClass('win');
            setTimeout(removeAddClass, 100);
        }
    }
    // winnerBack.css('background-color', 'yellow');

    initAudioList(WinnerId.text());
    if (RamdomList.length < 200) {
        createRamdonData();
    }
}

function removeWinnerEmpEles(empid, Eleid = '-1') {
    $(empsEle.children().toArray().filter(e => Number($(e).text().substring(0, 5)) == empid && $(e).attr('id') !== Eleid)).remove();
    RamdomList = RamdomList.filter(e => e.empid !== empid);
    DataBase = DataBase.filter(e => e.empid !== empid);
}

function removeUsedEmpEles(count) {
    indexSum -= count;
    $(empsEle.children().toArray().slice(0, count)).remove();
}

function sortEles() {

    empsEle.css('top', '0px');

    empsEle.children().toArray().forEach((element, index) => {
        $(element).css('top', `${index * fontSize}px`)
    });

}


function addToRewardList(emp) {

    var docFrag = $('<div></div>').addClass('rewardListItem').on("click", removeRewarded);
    var divID = $('<div></div>').addClass('idEle').text(emp.empid.toString().padStart(5, '0'));
    var divDept = $('<div></div>').addClass('deptEle').text(deptNameTrans(emp));
    var divName = $('<div></div>').addClass('nameEle').text(emp.empname);
    docFrag.append(divID, divDept, divName);
    rewardListEle.append(docFrag);

}


function startDrawToEndofReward(count) {
    drawInRowTime = count || rewardInDraw.amount - rewardInDraw.numberToSendOut;
    draw();
}


function initAudioList(texttospeech) {

    if (audioIndex != 0) {
        return;
    }

    audioList = [];
    audioIndex = 0;

    Array.from(texttospeech.slice(0, 5)).forEach(c => {
        audioList.push(c);
    });
    audioList.push(texttospeech);
    endAudio();
}


function endAudio($event) {
    if (audioIndex <= audioList.length - 1) {
        let fileName = `/audios/${audioList[audioIndex]}.mp3`;
        $('#audioplayer').removeAttr('src');
        $('#audioplayer').attr('src', fileName);
        player.playbackRate = 2;
    } else {
        audioList = [];
        audioIndex = 0;
        errAudioTime = 0;
        $('#audioplayer').removeAttr('src');
        if (snapShotFlag &&
            (rewardInDraw.numberToSendOut > 0 && rewardInDraw.numberToSendOut % 10 === 0)
            || rewardInDraw.numberToSendOut === rewardInDraw.amount) snapShot();
        ifDrawContinue();
        return;
    }
    audioIndex += 1;
}

let errAudioTime = 0;
function errAudio($event) {
    errAudioTime++;

    console.warn($event);
    var temp = $event.srcElement.currentSrc;
    $('#audioplayer').removeAttr('src');
    if (errAudioTime < 3) {
        $('#audioplayer').attr('src', temp);
    } else {
        audioList = [];
        audioIndex = 0;
        $('#audioplayer').removeAttr('src');
        ifDrawContinue();
    }
}


function ifDrawContinue() {

    if (drawInRowTime > 1) {
        timeBetweenDraw = 500;
        setTimeout(() => {
            // draw();
            spin();
        }, timeBetweenDraw);
        drawInRowTime -= 1;
    } else {

        drawFinshed = true;
        //========================================================
        if (testingFlag) {
            if (rewardInDraw.amount != rewardInDraw.numberToSendOut || changeRewardInDraw()) {
                TestingNextDraw();
            } else {
                setTimeout(() => {
                    $.ajax({
                        url: `${window.origin}/api/winning/ResetData`,
                        method: 'GET',
                        contentType: 'application/json',
                        success: () => {
                            window.location.reload();
                        }
                    })
                }, 5000);
            }
        }
        //========================================================
    }

}


function clearRewardList() {
    rewardListEle.html('');
}

function moveRewardList() {
    rewardListEle.animate({ top: `-=${720 * 2 * 0.08}px` }, 250, () => {
        rewardListEle.children().slice(0, 2).remove();
        rewardListEle.css('top', 0)
    });
}


function changeRewardInDraw() {

    var nextReward = rewardList.filter(r => r.amount > r.numberToSendOut)[0];

    if (!nextReward) {
        if (testingFlag) {
            return false;
        }
        alert('沒有獎項瞜');
    } else if (nextReward === rewardInDraw) {
        return;
    }

    rewardInDraw = nextReward;
    $('#rewardName').text(rewardInDraw.name);
    $('#rewardAmount').text(`共${rewardInDraw.amount}位`)
    $('#RewardNameCount').attr('hidden', false);
    changeRewardInDrawCount(rewardInDraw.numberToSendOut + 1);
    clearRewardList();
    RamdomList = RamdomList.concat(Doras);
    addData(5, false);
    sortEles();
    photoEle.css('background-image', `url('${filePath}/00000.png')`);

    return true;
}


function changeRewardInDrawCount(number) {

    //var str = number.toString().replace(/\S/g, "<span class='letter'>$&</span>");

    // var htmlstr = `
    // <span class="text-wrapper">
    // <span class="letters" >${str}</span>
    // </span>`;

    $('#rewardnumberToSendOut').html(`第${number}位`);
    // addWordsAnimate();

}


function modalReset() {
    $('#addRwName').val('');
    $('#addRwAmount').val('');
}


function addRw() {
    if (!$('#addRwName').val() || !$('#addRwAmount').val()) {
        return;
    }
    var newReward = {
        Rewardname: $('#addRwName').val(),
        Rewardamount: $('#addRwAmount').val(),
        Rewardmethod: null
    };

    $.ajax({
        url: `${window.origin}/api/winning/NewRewardItem`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(newReward),
        success: (data) => {
            rewardList = [];
            data.forEach(element => {
                rewardList.push(element);
            });
            changeRewardInDraw();
            alert(`以新增 ${newReward.Rewardname}  ${newReward.Rewardamount}名`)
            cancelModal();
        }
    })
}


function cancelModal() {
    $('.modal').modal('hide');
}


function mainDraw() {
    if (!drawFinshed || audioList.length !== 0) {
        return;
    }

    if (rewardInDraw.amount <= rewardInDraw.numberToSendOut) {
        alert('獎項抽完搂，請換獎項');
        return;
    }
    drawFinshed = false;

    if (rewardInDraw.method) {
        console.log(rewardInDraw.numberToSendOut - Math.floor(rewardInDraw.numberToSendOut / 5) * 5)
        startDrawToEndofReward(
            5 - (rewardInDraw.numberToSendOut - Math.floor(rewardInDraw.numberToSendOut / 5) * 5)
        );
    } else {
        startDrawToEndofReward();
    }
}


function deptNameTrans(emp) {
    switch (emp.deptname) {
        case '企業暨國際金融資訊部': return '企金';
        case '個人金融資訊部': return '個金';
        case '核心資訊部': return '核心';
        case '系統開發部': return '系開';
        case '資訊策略發展部': return '資策';
        case '資訊架構部': return '架構';
        default: return emp.deptname.substring(0, 2);
    }
}


function snapShot() {
    console.warn(Date.now())
    html2canvas(document.body).then(canvas => {
        $.ajax({
            url: `${window.origin}/api/winning/SnapShotSave`,
            method: 'POST',
            data: JSON.stringify(canvas.toDataURL('image/jpeg', 0.5)),
            contentType: 'application/json',
            success: (result) => {
                snapShotFlag = false;
                console.warn(Date.now())
            }
        })
    });

    empText = rewardListEle.children().toArray().map(e => $(e).text().substring(0, 5));
    $.ajax({
        url: `${window.origin}/api/winning/SnapShotText`,
        method: 'POST',
        data: JSON.stringify(empText),
        contentType: 'application/json',
        success: (result) => {
            console.warn('result')
            console.warn(empText);
        }, error: (err) => {

            console.warn('err')
            console.error(empText)
        }
    })

}


function removeRewarded() {

    if (rewardInDraw.id > 0 && rewardInDraw.id < 3) {
        return;
    }

    let emp = {
        empid: $(this).text().substring(0, 5),
        empname: $(this).text().substring(7),
    }

    if (window.confirm(`確認移除中獎名單    ${emp.empid}    ${emp.empname}?`)) {
        $.ajax({
            url: `${window.origin}/api/winning/RemoveRewarded`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(emp),
            success: (result) => {
                if (result) {
                    changeRewardInDrawCount(rewardInDraw.numberToSendOut);
                    rewardInDraw.numberToSendOut -= 1;
                    $(this).remove();
                    alert('刪除成功!');
                } else {
                    console.error('未中獎的名單，請檢查後端DB');
                }
            },
            error: (err) => {
                console.error(err);
            }
        })
    }
}