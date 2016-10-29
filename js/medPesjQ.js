/**
 * To add events:
 * Put images in "img/events/" folder, name them "eventtypexx", where xx is turn number, i.e. "farm03" is the farm event for turn 3. Add the event to the right position in the relevant list (so farm03 would go in var farmEve spot 3), and add numbers: the first number is the number of answers and the second number is which answer leads to death. If no answer leads to death the second number should be set to 4. Make sure the file is PNG format!
 */


var x, y, currentEvent; // Coordinates, current event number and number of answers given.
var turnNum = 0; // Turn number.
var counter = 0; // Countes used to track intro sequence and number of events done this turn.
var sumPage = 0;
var playing = false; // Set to true while game is running.
var gameOver = false;
var eventUp = false; // Indicates whether an event is on screen.
var infoUp = false; // Indicates whether an info window is on screen.
var townDone = false; // Is the town event done this turn?
var farmDone = false; // Is the farm event done this turn?
var houseDone = false; // Is the house event done this turn?
var lessOptions; // Boolean flag indicating if an event has 2 or 3 options.
var intros = ['introImg00', 'introImg01', 'introImg02']; // Intro uses three images.
var yearlyBg = ['1347', '1348', '1349', '1350', '1351', '1352'];
var farmEve = [
    ['farm00', 3, 4],
    ['farm01', 3, 4],
    ['farm02', 3, 2],
    ['farm03', 3, 4],
]; // Farm events.
var townEve = [
    ['town00', 2, 4],
    ['town01', 3, 4],
    ['town02', 2, 1],
    ['town03', 2, 2],
]; // Town events.
var houseEve = [
    ['house00', 3, 4],
    ['house01', 2, 1],
    ['house02', 2, 4],
    ['house03', 2, 1],
]; // House events.
var answers = [];

$(function() {

    $('.info').hide();
    $('#endTurnImg').hide();

    /**
     * Start button, starts the game.
     */
    $("#startButton").click(function() {
        playClickSFX();
        if (!playing && !gameOver) {
            startGame();
        } else {
            window.location.reload();
            startGame();
        }
    });

    /**
     * Listener for where within the game area user clicks, brings up events when
     * right area is clicked. Only works if no event is up and playing is true.
     */
    $("#gameBg").click(function(e) {
        if (!eventUp && playing) {
            var parentOffset = $(this).parent().offset();
            x = e.pageX - parentOffset.left;
            y = e.pageY - parentOffset.top;
            window.console && console.log('Clicked X ' + x + ' and Y ' + y);
            if (x < 599 && x > 339 && y < 329 && y > 179 && !townDone) {
                currentEvent = townEve;
                townDone = true;
                pickEvent();
            } else if (x < 336 && x > 0 && y < 693 && y > 157 && !farmDone) {
                currentEvent = farmEve
                farmDone = true;
                pickEvent();
            } else if (x < 1280 && x > 882 && y < 662 && y > 64 && !houseDone) {
                currentEvent = houseEve;
                houseDone = true;
                pickEvent();
            }
        }
    });

    /**
     * Listener for clicks to select options in events.
     */
    $("#eventImg").click(function(e) {
        var parentOffset = $(this).parent().offset();
        x = e.pageX - parentOffset.left;
        y = e.pageY - parentOffset.top;
        if (x > 679 && x < 1041 && y > 280 && y < 340) {
            answer(1);
        } else if (x > 679 && x < 1041 && y > 347 && y < 407) {
            answer(2);
        } else if (x > 679 && x < 1041 && y > 413 && y < 473 && !lessOptions) {
            answer(3);
        }
    });

    // $(".info").click(function() {
    //     $(".info").hide();
    //     $('#gameBg').show();
    // });

    $('#introImg').click(function() {
        playClickSFX();
        counter++;
        if (counter < intros.length) {
            $("#introImg").attr('src', 'img/info/' +
                intros[counter] + '.png');
        } else {
            counter = 0;
            $('#introImg').hide();
            $('#gameBg').show();
            infoUp = false;
        }
    });

    $('#endTurnImg').click(function() {
        playClickSFX();
        $("#endTurnImg").hide();
        summarizeTurn();
    });

    $("#summary").click(function() {
        playClickSFX();
        if (answers[sumPage][1] == answers[sumPage][2]) {
            endGame("lose");
        } else {
            sumPage++;
            if (sumPage < answers.length) {
                $("#summary").attr('src', 'img/events/' + answers[sumPage][0] +
                    answers[sumPage][1] + ".png");
            } else {
                sumPage = 0;
                answers.length = 0;
                turnNum++;
                $('#gameBg').attr('src', 'img/' + yearlyBg[turnNum] + '.png');
                $("#summary").hide();
                $("#gameBg").show();
                infoUp = false;
                if (turnNum > (farmEve.length - 1)) {
                    endGame("win");
                }
            }
        }
    });

    /**
     * Listener for number key presses. If no event is up, pressing 1 brings up the
     * farm event, 2 brings town and 3 brings house. If an event is up the numbers
     * select answers.
     */
    $(function() {
        $(window).keypress(function(e) {
            if (playing) {
                var key = e.which;
                if (key == 49 && eventUp && !infoUp) {
                    answer(1);
                } else if (key == 49 && !eventUp && !farmDone && !infoUp) {
                    currentEvent = farmEve;
                    farmDone = true;
                    pickEvent();
                } else if (key == 50 && eventUp && !infoUp) {
                    answer(2);
                } else if (key == 50 && !eventUp && !townDone && !infoUp) {
                    currentEvent = townEve;
                    townDone = true;
                    pickEvent();
                } else if (key == 51 && eventUp && !lessOptions && !infoUp) {
                    answer(3);
                } else if (key == 51 && !eventUp && !houseDone && !infoUp) {
                    currentEvent = houseEve;
                    houseDone = true;
                    pickEvent();
                }
            }
        });
    });
})

/**
 * Game start function.
 * @return {[type]} [description]
 */
function startGame() {
    if (!playing) {
        playing = true;
        infoUp = true;
        $('#gameBg').attr('src', 'img/' + yearlyBg[turnNum] + '.png');
        $('#gameBg').hide();
        $("#introImg").attr('src', 'img/info/' +
            intros[0] + '.png');
        $('#introImg').show();
        $("#startButton").css("background-color", "#AFA");
        $("#startButton").text('Reset');
        $('#music').get(0).play();
    }
}

function playClickSFX() {
    $('#clicksound').get(0).play();
}

function answer(num) {
    playClickSFX();
    $("#eventImg").hide();
    $("#gameBg").show();
    eventUp = false;
    counter++;
    if (counter == 3) {
        endTurn();
    }
    answers.push([currentEvent[turnNum][0], num, currentEvent[turnNum][2]]);
}

/**
 * Picks appropriate event based on turn number, shows image.
 * @return {[type]} [description]
 */
function pickEvent() {
    playClickSFX();
    $("#eventImg").attr('src', 'img/events/' + currentEvent[turnNum][0] + '.png');
    if (currentEvent[turnNum][1] == 2) {
        lessOptions = true;
    } else {
        lessOptions = false;
    }
    $("#gameBg").hide();
    $('.info').hide();
    $("#eventImg").show();
    eventUp = true;
}

/**
 * Ends the current turn, shows end-of-turn image which is currently
 * static. Since the current state of the game only allows one turn
 * this ends the game.
 * @return {[type]} [description]
 */
function endTurn() {
    $("#gameBg").hide();
    $("#endTurnImg").show();
    infoUp = true;
    counter = 0;
    farmDone = false;
    townDone = false;
    houseDone = false;
}

function summarizeTurn() {
    $("#summary").attr('src', 'img/events/' + answers[sumPage][0] + answers[sumPage][1] + ".png");
    $("#summary").show();
}

/**
 * Prints "game over" to console and ends the game.
 * @return {[type]} [description]
 */
function endGame(endState) {
    $(".info").hide();
    $(".event").hide();
    $("#gameBg").hide();
    $("#gameOver").attr('src', 'img/' + endState + '.png');
    playing = false;
    gameOver = true;
}
