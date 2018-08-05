/*
  Speech Recognition is part of bigger API called Web Speech (it's sibling would be Speech Synthesis [text to speech])
  Web Speech is part of HTML5, though only fully supported by Chrome and Firefox
*/

// Check for speech recognizer
try {
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  // var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
  var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent
}
catch(e) {
  console.error(e);
  $('.no-browser-support').show();
  $('.app').hide();
}

// Grabbing the elements, nothing exciting here
var theCanvas = document.getElementById('theCanvas');
var ctx = theCanvas.getContext("2d");
var btnMove = document.getElementById('btnMove');
var btnColor = document.getElementById('btnColor');
var btnBoring = document.getElementById('btnBoring');
var btnStop = document.getElementById('btnStop');
var command1 = document.getElementById('command1');
var command2 = document.getElementById('command2');
var command3 = document.getElementById('command3');

// This will hold the commands which will be used to populate the 'Last 3 Commands' section
var commandList = [];

/* 
  When using a Speech Recognizer that is set to listen continously you have to manually stop it with a button,
  this will keep track of which one is being used so we can stop it.
*/
var currentRecognizer;

/*
  Initializing the Speech Recognition objects
  cr - Color recognizer
  mr - Movement recognizer
  br - Boring recognizer
*/
var cr = new SpeechRecognition();
var mr = new SpeechRecognition();
var br = new SpeechRecognition();

/*
  GRAMMARS ARE NOT SUPPORTED BY CHROME (surprisingly) AND MAYBE NOT EVEN FIREFOX??? I wouldn't recommend using these until an update is made
  -- I found this out after realizing the grammar list was useless in my program, but I figured I include it for the sake of showing it--
  If you want to recognize specific words, you can set a recognizers 'grammars' property to contain a list of specific commands.
  The syntax for the grammar object below is a little wonky... the first part of the string designates the version, as far as I know this is the only version.
    After that is grammar _____ where the line would be the name of the list you to make into grammar (we want the colors list above it to be the usable grammar)
    You'll notice the list being joined by |'s, the grammar declaration could be done with one line but since the list is huge and I copy/pasted it, it was split - 
        '#JSGF V1.0; grammar colors; public <color> = red | blue | orange | ... ;'
        
  var colors = [ 'aqua' , 'azure' , 'beige', 'bisque', 'black', 'blue', 'brown', 'chocolate', 'coral', 'crimson', 'cyan', 'fuchsia', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'indigo', 'ivory', 'khaki', 'lavender', 'lime', 'linen', 'magenta', 'maroon', 'moccasin', 'navy', 'olive', 'orange', 'orchid', 'peru', 'pink', 'plum', 'purple', 'red', 'salmon', 'sienna', 'silver', 'snow', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'white', 'yellow'];
  var grammar = '#JSGF V1.0; grammar colors; public <color> = ' + colors.join(' | ') + ' ;'
*/

// This square represents the square drawn on the canvas
var square = {
  "height": 30,
  "width": 30,
  "x": 100,
  "y": 100,
  "color": "black"
}

/*
  The continuous property allows the recognizer to listen even after you speak
    When set to false the recognizer will stop listening when you finish speaking and will call the .onresult, then .onspeechend event
    If set to true, the recognizer won't fire it's .onspeechend event on it's own, but will continue to fire the .onresult event
  .lang is obviously the language the recognizer should recognize
  .interimResults is a little tricky, if it's set to true it will request a callback for words that aren't final. If you said 'psycho' it would request 'psycho',
    but also words it COULD be - like 'cycle'. You'd leave this property false for most projects to avoid unnecessary calls
  .maxAlternatives is the number of words it would return. Like the 'psycho' example, if you wanted to prompt the user with the alternative 'cycle' for an
    auto-correct sort of thing, this would be the property you'd want to mess with
*/
function setup(){
  cr.continuous = true;
  cr.lang = 'en-US';
  cr.interimResults = false;
  cr.maxAlternatives = 1;

  /*
    This is how you would set up the grammars for a recognizer, but I did my project in chrome and didn't want to redo a chunk of it in firefox

    SpeechGrammarList.addFromString(grammar, 1)
    cr.grammars = SpeechGrammarList;
  */

  mr.continuous = true;
  mr.lang = 'en-US';
  mr.interimResults = false;
  mr.maxAlternatives = 1;

  // Since this is only recognizer not set to continous, I'll use this one to demonstrate .onspeechend later
  br.continuous = false;
  br.lang = 'en-US';
  br.interimResults = false;
  br.maxAlternatives = 1;
  
  // Drawing the first
  ctx.rect(square.x, square.y, square.width, square.height);
  ctx.fillStyle = square.color;
  ctx.fill();
}
setup();

////////////////////////////////////////////////////////////////////
/*
  You don't need to use a button click to start a recognizer, you could start it anywhere, but for this project we'll use a button
  recognizer.start() does exactly what you'd think it would... it starts listening
*/
btnColor.addEventListener('click', startColor);
function startColor(){
  cr.start();
  currentRecognizer = 'color';
  /* Only one recognizer can be listening at a time (if you start a second one while the first is listening,
     the first will stop) so we'll disable the buttons that let you start the others
  */
  btnStop.disabled = false;
  btnMove.disabled = true;
  btnBoring.disabled = true;
}
/*
  The .onresult event gets called whenever the recognizer is finished listening to you speak a phrase
  If the recognizer is set to continuous then this event will be called everytime you speak until you stop it
*/
cr.onresult = function(event){
  // Take a look at the event, there's a bunch of stuff in it, but the only thing we really care about is the results
  console.log(event);
  // The results are the phrases it hears. Since this one is continuous the list will grow every time you speak
  console.log(event.results);
  /*
    The word/s we care about is the last one in the list, we need the index
    .transcript converts the word it hears from a 'word it heard' (some sort of data form we can't really use) to a transcript.
      A transcript is a string containing all leading and trailing whitespaces. (These whitespaces will be a problem later, though not really a problem here)
      If you look at the event result, you'll see transcript: 'color', then transcript: ' color'... transcript: '  color'. These spaces get added while 
        the recongizer is continuously listening, but stopping and restarting will restart the spacing thing, too
  */
  var colorResultIndex = event.results.length - 1;
  var colorString = event.results[colorResultIndex][0].transcript;
  // Even with the leading spaces, the color will be recognized (idk how but it does)
  square.color = colorString;
  commandList.push(colorString);
  redraw();
}
/////////////////////////////////////////////////////////////////////
btnMove.addEventListener('click', startMove);
function startMove(){
  mr.start();
  currentRecognizer = 'move';
  btnStop.disabled = false;
  btnColor.disabled = true;
  btnBoring.disabled = true;
  console.log('listening for move');
}
/*
  In the color recognizer we didn't check the result, in this one we will... as well as use multiple words in a phrase
*/
mr.onresult = function(event){
  var moveResultIndex = event.results.length - 1;
  var moveString = event.results[moveResultIndex][0].transcript;
  /*  
    This is where the leading spaces will mess you up. Since we are looking for very specific strings, the spaces prevent a match. 
    To fix this a simple .trim() will do
  */
  console.log(moveString);
  moveStringTrimmed = moveString.trim();
  console.log(moveStringTrimmed);
  switch(moveStringTrimmed){
    case 'go up':
      square.y -= 25;
      break;
    case 'go down':
      square.y += 25;
      break;
    case 'go left':
      square.x -= 25;
      break;
    case 'go right':
      square.x += 25;
      break;
    // As long as you enunciate clearly, it can actually recognize the word 'yeet'
    // Bob requested this one
    case 'yeet':
      if(square.x <= (theCanvas.width / 2)){
        square.x = theCanvas.width - square.width;
      }
      else{
        square.x = 0;
      }
      break;
  }
  commandList.push(moveStringTrimmed);
  redraw();
}
/////////////////////////////////////////////////////////////////////
/*
  If you saw my presentation then you were probaly wondering why a button saying 'This is Boring' was there...
  If I didn't choke so hard while presenting I would have gotten here, there woulda been a punchline and at least 1 person would have laughed, it would make sense
  The point of this button was to demonstrate that you can do anything with a voice command, because canvas stuff is boring
*/
btnBoring.addEventListener('click', startBoring);
function startBoring(){
  br.start();
}
br.onresult = function(event){
  var boringResult = event.results.length - 1;
  var boringString = event.results[boringResult][0].transcript;
  switch(boringString){
    case 'show me cats':
      window.open("https://www.google.com/search?q=cat+pictures&safe=off&client=firefox-b-1-ab&source=lnms&tbm=isch&sa=X&ved=0ahUKEwiNv7__qNDcAhVriVQKHcfABPcQ_AUICigB&biw=1451&bih=681&dpr=1.76"); 
      break;
  }
}
/*
  Since this is not a continuous listener, the .onspeechend function needs to exist.
  This is fired when you stop speaking AND after .onresult is dealt with, and should simply stop the listener
*/
br.onspeechend = function(){
  br.stop();
}
/////////////////////////////////////////////////////////////////
/*
  Stops the continuous listeners, reenables some buttons...
  Nothing really interesting
*/
btnStop.addEventListener('click', stopListening);
function stopListening(){
  switch(currentRecognizer){
    case 'move':
      mr.stop();
      btnBoring.disabled = false;
      btnColor.disabled = false;
      break;
    case 'color':
      cr.stop();
      btnBoring.disabled = false;
      btnMove.disabled = false;
      break;
  }
  btnStop.disabled = true;
}
/////////////////////////////////////////////////////////////////
/*
  Update the commands lists, check the size and display the last three indexes of the list
*/
function updateCommands(){
  var endIndex = commandList.length;
  command1.innerHTML = commandList[endIndex - 1];
  if(endIndex == 2){
    command1.innerHTML = commandList[endIndex - 1];
    command2.innerHTML = commandList[endIndex - 2];
  }
  if(endIndex >= 3){
    command1.innerHTML = commandList[endIndex - 1];
    command2.innerHTML = commandList[endIndex - 2];
    command3.innerHTML = commandList[endIndex - 3];
  }
}
//////////////////////////////////////////////////////////////////
/*
  Redraw the canvas after updating the color or position
*/
function redraw(){
  ctx.clearRect(0, 0, theCanvas.width, theCanvas.height);
  ctx.fillStyle = square.color;
  ctx.fillRect(square.x, square.y, square.width, square.height);
  updateCommands();
}