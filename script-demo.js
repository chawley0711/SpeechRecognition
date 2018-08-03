try {
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
  var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent
}
catch(e) {
  console.error(e);
  $('.no-browser-support').show();
  $('.app').hide();
}
var theCanvas = document.getElementById('theCanvas');
var ctx = theCanvas.getContext("2d");
var btnMove = document.getElementById('btnMove');
var btnColor = document.getElementById('btnColor');
var btnBoring = document.getElementById('btnBoring');
var command1 = document.getElementById('command1');
var command2 = document.getElementById('command2');
var command3 = document.getElementById('command3');

var commandList = [];

var cr = new SpeechRecognition();
var mr = new SpeechRecognition();

var square = {
  "height": 30,
  "width": 30,
  "x": 100,
  "y": 100,
  "color": "black"
}

function setup(){
  cr.continuous = false;
  cr.lang = 'en-US';
  cr.interimResults = false;
  cr.maxAlternatives = 1;

  mr.continuous = false;
  mr.lang = 'en-US';
  mr.interimResults = false;
  mr.maxAlternatives = 1;
  
  ctx.rect(square.x, square.y, square.width, square.height);
  ctx.fillStyle = square.color;
  ctx.fill();
}
setup();
