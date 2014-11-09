// function handleOrientation(event) {
//     console.log(event);
// }

// window.addEventListener('deviceorientation', handleOrientation);

var aeolian = [0,3,6,8,10,12,15,18,20,22,24,27,32,34,36];

var notes = [0,0,0,0];
var note = 60;
var frequency = 440 * 2^((note-69)/12);

window.onload = function(){
  window.ctx = new AudioContext();
  window.slider = document.getElementById('slider');

  window.lastLoudness = 0;
  window.env = 0;

  window.osc = new Tone.Oscillator(440, "sine");
  osc.toMaster();
  osc.start();
  osc.setVolume(-1000);

  var updatePitch = function(){
    var total = 0;
    for(var j = 0; j < notes.length; j++){
      if(notes[j]==1){
        total += Math.pow(2,j);
      }
    }
    note = 80 + total;
    frequency = 440 * Math.pow(2,((note-69)/12));
    osc.setFrequency(frequency);
  }
  updatePitch();

  var circles = document.getElementsByClassName('circle');

  for(var i = 0; i < circles.length; i++){
    circles[i].ontouchstart = function(){
      notes[this.dataset.noteindex] = 1;
      updatePitch();
    }

    circles[i].ontouchend = function(){
      notes[this.dataset.noteindex] = 0;
      updatePitch();
    }
  }

  // callback for mic position
  window.gotStream = function(stream) {
    console.log("gotStream");
    // polyfill
    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    var mediaStreamSource = ctx.createMediaStreamSource( stream );

    var meyda = new Meyda(ctx,mediaStreamSource,512);
    setTimeout(function(){
      setInterval(function(){
        var loudness = meyda.get(["rms"]).rms;;
        env = (loudness + lastLoudness);
        lastLoudness = loudness;
        osc.setVolume(12*Math.log10(env));
      },40);
    },1000);
  }
  // Polyfill for browser prefixes
  navigator.getUserMedia = navigator.getUserMedia || (navigator.mozGetUserMedia || navigator.webkitGetUserMedia);
  // Ask for mic permission
  navigator.getUserMedia( {audio:true}, gotStream, function(){
    console.log("error: getUserMedia Failed");
  });
}

var helperMethod = function(){
  slider.style.height = (20 + (1000 * env))+'px';
  window.requestAnimationFrame(helperMethod);
}

window.requestAnimationFrame(helperMethod);