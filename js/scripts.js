(function($, window, document, undefined) {

  $.quiz = function(el, options) {
    var base = this;

    // Access to jQuery version of element
    base.$el = $(el);

    base.$el.data('quiz', base);
    base.options = $.extend($.quiz.defaultOptions, options);
    var tenRandomQuestions = new Set();

    while (tenRandomQuestions.size < 10) {
      tenRandomQuestions.add(base.options.questions[Math.floor(Math.random() * base.options.questions.length)])
    }
      var tenQuestions = Array.from(tenRandomQuestions);
      var numQuestions = tenQuestions.length,
      startScreen = base.options.startScreen,
      startButton = base.options.startButton,
      homeButton = base.options.homeButton,
      resultsScreen = base.options.resultsScreen,
      gameOverScreen = base.options.gameOverScreen,
      nextButtonText = base.options.nextButtonText,
      finishButtonText = base.options.finishButtonText,
      restartButtonText = base.options.restartButtonText,
      currentQuestion = 1,
      score = 0,
      answerLocked = false;

    base.methods = {
      init: function() {
        base.methods.setup();
        var audio = new Audio("img/startsound.wav");
        var audio2 = new Audio("img/yesno.wav");
        var audio3 = new Audio("img/nextsound.wav");
        var audio4 = new Audio("img/fin.wav");
        var audio5 = new Audio("img/replay.wav");
        $(document).on('click touchend', startButton, function(e) {
          e.preventDefault();
          base.methods.start();
          audio.play();
        });

        $(document).on('click touchstart', homeButton, function(e) {
          e.preventDefault();
          base.methods.home();
        });

        $(document).on('click touchstart', '.answers a', function(e) {
          e.preventDefault();
          base.methods.answerQuestion(this);
          audio2.play();
        });

        $(document).on('click touchstart', '#quiz-next-btn', function(e) {
          e.preventDefault();
          base.methods.nextQuestion();
          audio3.play();
        });

        $(document).on('click touchend', '#quiz-finish-btn', function(e) {
          e.preventDefault();
          base.methods.finish();
          audio4.play();
        });

        $(document).on('click touchstart', '#quiz-restart-btn, #quiz-retry-btn', function(e) {
          e.preventDefault();
          window.location.reload();

          audio5.play();
        });
      },
      setup: function() {
        var quizHtml = '';

        if (base.options.counter) {
          quizHtml += '<div id="quiz-counter"></div>';
        }

        quizHtml += '<div id="questions">';
        $.each(tenQuestions, function(i, question) {
          quizHtml += '<div class="question-container">';
          quizHtml += '<h1><span>' + question.t + '</span></h1>';
          quizHtml += question.i;
          quizHtml += '<ul class="answers">';
          $.each(question.options, function(index, answer) {
            quizHtml += '<li id="love"><a href="#" data-index="' + index + '">' + answer + '</a></li>';
          });
          quizHtml += '</ul>';
          quizHtml += '<p class="question">' + question.q + '</p>';
          quizHtml += '<ul class="compositions">'+ question.c +'</ul>';

          quizHtml += '</div>';
        });
        quizHtml += '</div>';

        if ($(resultsScreen).length === 0) {
          
          quizHtml += '<div id="' + resultsScreen.substr(1) + '">';
          quizHtml += '</div>';
        }

        quizHtml += '<div id="quiz-controls">';  
        quizHtml += '<p id="quiz-response"></p>';
        quizHtml += '<div id="quiz-buttons">';
        quizHtml += '<a href="#" id="quiz-next-btn">' + nextButtonText + '</a>';
        quizHtml += '<a href="#" id="quiz-finish-btn">' + finishButtonText + '</a>';
        quizHtml += '<a href="#" id="quiz-restart-btn">' + restartButtonText + '</a>';
        quizHtml += '</div>';
        quizHtml += '</div>';

        base.$el.append(quizHtml).addClass('quiz-container quiz-start-state');

        $('#quiz-counter').hide();
        $('.question-container').hide();
        $(gameOverScreen).hide();
        $(resultsScreen).hide();
        $('#quiz-controls').hide();

        if (typeof base.options.setupCallback === 'function') {
          base.options.setupCallback();
        }
      },
      start: function() {
        base.$el.removeClass('quiz-start-state').addClass('quiz-questions-state');
        $(startScreen).hide();
        $('#quiz-controls').hide();
        $('#quiz-finish-btn').hide();
        $('#quiz-restart-btn').hide();
        $('#questions').show();
        $('#quiz-counter').show();
        $('.question-container:first-child').show().addClass('active-question');
        base.methods.updateCounter();
        $('.answers li:nth-child(1)').on('click touchstart',function(){
          $('.active-question').addClass('rotate');
         }) 
         $('.answers li:nth-child(3)').on('click touchstart',function(){
          $('.active-question').addClass('rotateright');
         })
      },
      
      answerQuestion: function(answerEl) { 

         
        if (answerLocked) {
          return;
        }
       
        answerLocked = true;

        var $answerEl = $(answerEl),
          response = '',
          selected = $answerEl.data('index'),
          currentQuestionIndex = currentQuestion - 1,
          correct = tenQuestions[currentQuestionIndex].correctIndex;
        
        if (selected === correct) {
          $answerEl.addClass('correct');
         
          response = tenQuestions[currentQuestionIndex].correctResponse;
          score++;
        } else {
          $answerEl.addClass('incorrect');
          
          response = tenQuestions[currentQuestionIndex].incorrectResponse;
          if (!base.options.allowIncorrect) {
            base.methods.gameOver(response);
            return;
          }
        }

        // check to see if we are at the last question
        if (currentQuestion++ === numQuestions) {
          $('#quiz-next-btn').hide();
          $('#quiz-finish-btn').show();
        }

        $('#quiz-response').html(response);
        $('#quiz-controls').fadeIn();

        if (typeof base.options.answerCallback === 'function') {
          base.options.answerCallback(currentQuestion, selected, tenQuestions[currentQuestionIndex]);
        }
      },
      nextQuestion: function() {
        answerLocked = false;

        $('.active-question')
          .hide()
          .removeClass('active-question')
          .next('.question-container')
          .show()
          .addClass('active-question');

        $('#quiz-controls').hide();

        base.methods.updateCounter();

        if (typeof base.options.nextCallback === 'function') {
          base.options.nextCallback();
        }
      },

      gameOver: function(response) {
        // if gameover screen not in DOM, add it
        if ($(gameOverScreen).length === 0) {
          var quizHtml = '';
          quizHtml += '<div id="' + gameOverScreen.substr(1) + '">';
          quizHtml += '<p id="quiz-gameover-response"></p>';
          quizHtml += '<p><a href="#" id="quiz-retry-btn">' + restartButtonText + '</a></p>';
          quizHtml += '</div>';
          base.$el.append(quizHtml);
        }
        $('#quiz-gameover-response').html(response);
        $('#quiz-counter').hide();
        $('#questions').hide();
        $('#quiz-finish-btn').hide();
        $(gameOverScreen).show();
      },
      finish: function() {
        base.$el.removeClass('quiz-questions-state').addClass('quiz-results-state');
        $('.active-question').hide().removeClass('active-question');
        $('#quiz-counter').hide();
        $('#quiz-response').hide();
        $('#quiz-finish-btn').hide();
        $('#quiz-next-btn').hide();
        $('#quiz-restart-btn').show();
        $(resultsScreen).show();
        var resultsStr = base.options.resultsFormat.replace('%score', score).replace('%total', numQuestions);
        $('#quiz-results').html(resultsStr);
        if (resultsStr == "0/10" || resultsStr == "1/10" || resultsStr == "2/10" || resultsStr == "3/10" || resultsStr == "4/10") {
          $('#quiz-results-screen').html("<img class='img-response' src='img/refresh.png'><h1><span>Vous avez fait le score:</span></h1><div id='result-bottom'><div class='result-bottom-left'><img class='barrelevel' src='img/barrescore.png'><img class='level level" + score + "' src='img/level.png'></div><div id='score-bottom'><p id='quiz-results'></p><p id='quiz-results-text'>Peut mieux faire... Vos choix ne sont pas totalement en accord avec ceux du Mus&eacute;um. Retentez votre chance !</p></div></div></div>");
        } else if (resultsStr == "5/10" || resultsStr == "6/10" || resultsStr == "7/10" || resultsStr == "8/10" || resultsStr == "9/10") {
          $('#quiz-results-screen').html("<img class='img-response' src='img/refresh.png'><h1><span>Vous avez fait le score:</span></h1><div id='result-bottom'><div class='result-bottom-left'><img class='barrelevel' src='img/barrescore.png'><img class='level level" + score + "' src='img/level.png'></div><div id='score-bottom'><p id='quiz-results'></p><p id='quiz-results-text'>C'est pas mal ! Vos choix sont proches de ceux du Mus&eacute;um, mais vous n'&ecirc;tes pas encore un.e conservateur.trice exp&eacute;riment&eacute;.e.</p></div></div></div>");
        } else if (resultsStr == "10/10") {
          $('#quiz-results-screen').html("<img class='img-response' src='img/trophy.png'><h1><span>Vous avez fait le score:</span></h1><div id='result-bottom'><div class='result-bottom-left'><img class='barrelevel' src='img/barrescore.png'><img class='level level" + score + "' src='img/level.png'></div><div id='score-bottom'><p id='quiz-results'></p><p id='quiz-results-text'>Bravo!<br>Vos choix correspondent &agrave; ceux du Mus&eacute;um.<br>Vous avez gagn&eacute; une boisson au caf&eacute; de la Baleine en pr&eacute;sence d&rsquo;un(e) professionnel(le) du Mus&eacute;um, avec le mot secret suivant: CHIHUAHUA</p></div></div></div>");
        } else {
          $('#quiz-results-text').html("error");
        }
        $('#quiz-results').html(resultsStr);
        if (typeof base.options.finishCallback === 'function') {
          base.options.finishCallback();
        }
      },
   
     
      home: function() {
        base.methods.reset();
        base.$el.addClass('quiz-start-state');
        $(startScreen).show();

        if (typeof base.options.homeCallback === 'function') {
          base.options.homeCallback();
        }
      },
      updateCounter: function() {
        var countStr = base.options.counterFormat.replace('%current', currentQuestion).replace('%total', numQuestions);
        $('#quiz-counter').html(countStr);
      }
    };

    base.methods.init();
  };

  $.quiz.defaultOptions = {
    allowIncorrect: true,
    counter: true,
    counterFormat: '%current/%total',
    startScreen: '#quiz-start-screen',
    startButton: '#quiz-start-btn',
    homeButton: '#quiz-home-btn',
    resultsScreen: '#quiz-results-screen',
    resultsFormat: '%score/%total',
    gameOverScreen: '#quiz-gameover-screen',
    nextButtonText: 'Next',
    finishButtonText: 'Fin',
    restartButtonText: 'Restart'
  };

  $.fn.quiz = function(options) {
    return this.each(function() {
      new $.quiz(this, options);
    });
  };
  
}(jQuery, window, document));



//////////////////////SCREENSAVER////////////////////////////
var mousetimeout;
var screensaver_active = false;
var idletime = 30;

$(document).mousemove(function(){
  clearTimeout(mousetimeout);
  if (screensaver_active) {
    stop_screensaver();
  }
  mousetimeout = setTimeout(show_screensaver, 1000 * idletime);
})

function show_screensaver(){
  $("#screensaver").fadeIn();
  screensaver_active = true;
  screensaver_animation();
}

function stop_screensaver(){
  $("#screensaver").fadeOut();
  screensaver_active = false;
};

////////////////////////REFRESH////////////////////////////
     var time = new Date().getTime();
     $(document.body).bind("mousemove keypress", function(e) {
         time = new Date().getTime();
     });
     function refresh() {
         if(new Date().getTime() - time >= 50000) 
             window.location.reload(true);
         else 
             setTimeout(refresh, 10000);
     }
     setTimeout(refresh, 10000);

