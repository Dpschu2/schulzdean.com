let wins = losses = 0;
let wordsPlayed = [];
let game;

function saveGame() {
    window.localStorage.setItem('previousGameHtml', $('.body-container').html());
    window.localStorage.setItem('previousGame', JSON.stringify(game));
}
function unsaveGame() {
    window.localStorage.setItem('previousGameHtml', '');
    window.localStorage.setItem('previousGame', '');
}
function setup() {
    console.log('setup');
    $('.enter-key').removeClass('new-game');
    game = {
        dontCheat: '',
        state: 'playing',
        rowIndex: 0,
        colIndex: 0
    };
    $('.matrix').empty();
    for(var i = 0; i < 6; i++) {
        let str = '';
        for(let j = 0; j < 5; j++) {
            str += (`<div class='box r${i}c${j}' data-state=''><span class='letter'></span></div>`);
        }
        $('.matrix').append(`<div class='matrix-row'>${str}</div>`);
    }
    $('#keyboard button').attr('data-state', '');
    wins = window.localStorage.getItem('wins') ? parseInt(window.localStorage.getItem('wins')) : 0;
    losses = window.localStorage.getItem('losses') ? parseInt(window.localStorage.getItem('losses')) : 0;
    wordsPlayed = window.localStorage.getItem('wordsPlayed') ? JSON.parse(window.localStorage.getItem('wordsPlayed')) : [];
    $('.wins').text(wins);
    $('.losses').text(losses);
    $('.matrix').removeClass('rm-bt-pad');
    $('.game-message').css('max-height', '0px');
    $('.game-message').css('margin', '0px');
    $('.matrix').removeClass('changeHeight').removeClass('changeHeightsm');
    let word = '';
    do {
        word = allowedWords[Math.floor(Math.random()*allowedWords.length)];
    } while (wordsPlayed.indexOf(word) > -1)
    game.dontCheat = word;
    saveGame();
}
function finished(status) {
    game.state = 'finished';
    if(status == 'win') {
        wins += 1
        window.localStorage.setItem('wins', wins);
        $('.wins').text(wins);
    }
    if(status == 'lose') {
        losses += 1
        window.localStorage.setItem('losses', losses);
        $('.losses').text(losses);
    }
    wordsPlayed.push(game.dontCheat);
    window.localStorage.setItem('wordsPlayed', JSON.stringify(wordsPlayed));
    unsaveGame();
}
(function(){
    const previousGameHtml = window.localStorage.getItem('previousGameHtml');
    if(previousGameHtml) {
        $('.body-container').empty().append(previousGameHtml);
        game = JSON.parse(window.localStorage.getItem('previousGame'));
        wins = window.localStorage.getItem('wins') ? parseInt(window.localStorage.getItem('wins')) : 0;
        losses = window.localStorage.getItem('losses') ? parseInt(window.localStorage.getItem('losses')) : 0;
        wordsPlayed = window.localStorage.getItem('wordsPlayed') ? JSON.parse(window.localStorage.getItem('wordsPlayed')) : [];
    }
    else {
        setup();
    } 
    $(document).on('click', '#keyboard button', function(){
        
        const $key = $(this)
        if(game.state === 'finished') {

            if($key.is('.enter-key')) {//start new game
                setup();
            }

        }
        else if(game.state === 'playing') {

            if(!$key.is('.back-key') && !$key.is('.enter-key') && game.colIndex < 5) {//add letter
                $(`.box.r${game.rowIndex}c${game.colIndex} .letter`).text($key.data('key'));
                game.colIndex += 1;
                saveGame();
            }
            else if($key.is('.back-key') && game.colIndex !== 0) {//remove letter
                game.colIndex -= 1;
                $(`.box.r${game.rowIndex}c${game.colIndex} .letter`).text('');
                saveGame();
            }
            else if($key.is('.enter-key') && game.colIndex === 5) {//test word
                let enteredWord = '';
                
                $($(`.matrix .matrix-row`)[game.rowIndex]).find('.box').each(function(){
                    enteredWord += $(this).find('.letter').text();
                    saveGame();
                });

                if(allowedWords.indexOf(enteredWord) > -1) {//valid word

                    $(`button[data-state='present']`).attr('data-state', '');
                    let present = [];
                    let correctLetters = [];
                    for(let ind = 0; ind < 5; ind++) {
                        if(enteredWord.split('')[ind] === game.dontCheat.split('')[ind]) {
                            correctLetters.push(enteredWord.split('')[ind]);
                        }
                    }
                    for(let ind = 0; ind < 5; ind++) {
                        if(game.dontCheat.split('').indexOf(enteredWord.split('')[ind]) > -1 && enteredWord.split('')[ind] !== game.dontCheat.split('')[ind] && correctLetters.indexOf(enteredWord.split('')[ind]) === -1) {
                            present.push(enteredWord.split('')[ind]);
                        }
                    }
                    for(let ind = 0; ind < 5; ind++) {
                        if(enteredWord.split('')[ind] === game.dontCheat.split('')[ind]) {
                            $(`.box.r${game.rowIndex}c${ind}`).attr('data-state', 'correct');
                            $(`#keyboard button[data-key='${enteredWord.split('')[ind].toLowerCase()}']`).attr('data-state', 'correct');
                        }
                        else if(game.dontCheat.split('').indexOf(enteredWord.split('')[ind]) === -1) {
                            $(`.box.r${game.rowIndex}c${ind}`).attr('data-state', 'absent');
                            $(`#keyboard button[data-key='${enteredWord.split('')[ind].toLowerCase()}']`).attr('data-state', 'absent');
                        }
                        else if(present.indexOf(enteredWord.split('')[ind]) > -1) {
                            $(`.box.r${game.rowIndex}c${ind}`).attr('data-state', 'present');
                            $(`#keyboard button[data-key='${enteredWord.split('')[ind].toLowerCase()}']`).attr('data-state', 'present');
                            present = jQuery.grep(present, function(value) {
                                return value != enteredWord.split('')[ind];
                            });
                        }
                    }
                    $(`.matrix-row:nth-child(${game.rowIndex+1})`).addClass('done');
                    if(enteredWord === game.dontCheat) {//WIN
                        party.confetti($('.matrix')[0]);
                        $(`.matrix-row:nth-child(${game.rowIndex+1}) .box`).attr('data-state', 'win');
                        $('.game-message').text("You Win! Press 'Enter' to play again.");
                        $('.game-message').css('color', 'limegreen');
                        $('.game-message').css('max-height', '200px');
                        $('.game-message').css('margin', '0 0 5px');
                        $('.matrix').addClass('changeHeightsm');
                        $('.matrix').addClass('rm-bt-pad');
                        $('.enter-key').addClass('new-game');
                        finished('win');
                    }
                    else {//not right
                        if(game.rowIndex === 5) {//end game
                            $('.game-message').text(`The correct word was ${game.dontCheat.toUpperCase()}. Press 'Enter' to play again.`);
                            $('.game-message').css('color', 'red');
                            $('.game-message').css('max-height', '200px');
                            $('.game-message').css('margin', '0 0 5px');
                            $('.matrix').addClass('changeHeight');
                            $('.matrix').addClass('rm-bt-pad');
                            $('.enter-key').addClass('new-game');
                            finished('lose');
                        }
                        else {//next line
                            game.rowIndex += 1;
                            game.colIndex = 0;
                            saveGame();
                        }
                    }
                    
                }
                else {//not a valid word
                    $('.game-message').text('Not a valid word. Try again.');
                    $('.game-message').css('color', 'white');
                    $('.game-message').css('max-height', '200px');
                    $('.game-message').css('margin', '0 0 5px');
                    $('.matrix').addClass('changeHeightsm');
                    $('.matrix').addClass('rm-bt-pad');
                    setTimeout(function(){
                        $('.game-message').css('max-height', '0px');
                        $('.game-message').css('margin', '0px');
                        $('.matrix').removeClass('changeHeightsm');
                        $('.matrix').removeClass('rm-bt-pad');
                    }, 7000);
                }
                
            }
            
        }
        
    });
})();