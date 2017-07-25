function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function hello(){
    var playButton = document.createElement("button");
    playButton.id = "playButton";
    playButton.innerHTML = "Play";
    var scoreField = document.createElement("input");
    scoreField.id = "scoreField";
    scoreField.type = "text";
    scoreField.value = "A4 E4 C#1 A1 D2 E2 F#1 G#1 A>4";
    scoreField.size = 65;
    document.body.appendChild(scoreField);
    document.body.appendChild(playButton);

    playButton.addEventListener("click",function(){
        new Score([scoreField.value]).play();
    });
    
}

function random16ths(){
    function generateScore(n){
        var notes = "C D E F G A B".split(" ");
        var score = [];
        var randomIndex;
        for(var i = 0; i < n; i++){
            randomIndex = Math.floor(Math.random()*notes.length);
            score.push(notes[randomIndex]+"1");
        }
        return score.join(" ");
    }
    hello();
    var n = getParameterByName("n")||10;

    document.querySelector("#scoreField").value = generateScore(n);

    var regenButton = document.createElement("button");
    regenButton.innerHTML = "New Score";
    regenButton.addEventListener("click",function(){
        document.querySelector("#scoreField").value = generateScore(n);
    });
    document.body.appendChild(regenButton);
}

function randomNotes(){
    function generateScore(n){
        var notes = "C D E F G A B".split(" ");
        var lens = [1, 4, 8, 16];
        var score = [];
        var randomNoteIndex;
        var randomRhythmIndex;
        for(var i = 0; i < n; i++){
            randomNoteIndex = Math.floor(Math.random()*notes.length);
            randomRhythmIndex = Math.floor(Math.random()*lens.length);
            score.push(notes[randomNoteIndex]+lens[randomRhythmIndex]);
        }
        return score.join(" ");
    }
    hello();
    var n = getParameterByName("n")||10;

    document.querySelector("#scoreField").value = generateScore(n);

    var regenButton = document.createElement("button");
    regenButton.innerHTML = "New Score";
    regenButton.addEventListener("click",function(){
        document.querySelector("#scoreField").value = generateScore(n);
    });
    document.body.appendChild(regenButton);
}

function combinations(){
    var arrays = Array.prototype.slice.call(arguments,0,arguments.length);
    if(arrays.length === 0) return [];
    var out = [[]];
    var newOut = [];
    while(arrays.length>0){
        arrays[0].forEach(function(element){
            out.forEach(function(prefix){
                newOut.push(prefix.concat([element]));
            });
        });
        out = newOut;
        newOut = [];
        arrays = arrays.slice(1);
    }
    return out;
    
    function wrap(x){
        return [x];
    };
}

function shuffle(a){
    var decorated = a.map(function(el){
        return [Math.random(),el];
    });
    var sorted = decorated.sort(function(el1,el2){
        if(el1[0]<el2[0]) return -1;
        if(el1[0]>el2[0]) return 1;
        return 0;
    });
    return sorted.map(function(el){
        return el[1];
    });
}

function indexCyclical(a,i){
    var len = a.length;
    return a[i%len];
}

function randomElement(a){
    return a[Math.floor(Math.random()*a.length)];
}

function randomElementsWithReplacement(a,n){
    var out = [];
    for(var i = 0; i < n; i++){
        out.push(randomElement(a));
    }
    return out;
};

function arrayOf(element,len){
    var out = [];
    for(var i = 0; i < len; i++){
        out.push(element);
    }
    return out;
}

function StateMachine(lookback,states,strategy){
    this.strategy = strategy || "withoutReplacement";
    this.states = typeof states === "string" ? states.split(" ") : states;
    this.keys = combinations.apply(this,arrayOf(this.states,lookback)).map(function(k){
        return k.join(",");
    });
    this.machine = {};
    this.init();
    this.lookback = lookback;
  
};

function selectOneRandomly(a){
    return a[Math.floor(Math.random()*a.length)];
}

StateMachine.prototype.init = function(){
    var states = shuffle(this.states);
    var machine = this.machine;
    var strategy = this.strategy;
    this.keys.forEach(function(key,i){
        switch (strategy){
        case "withoutReplacement":
            machine[key] = indexCyclical(states,i);
            if(i%states.length===0) states = shuffle(states);        
            break;
        case "withReplacement":
            machine[key] = selectOneRandomly(states);
            break;
        default:
            throw new Error("Only with and without replacement strategies are supported.");
        }

    });
    return this;
};

StateMachine.prototype.generateNext = function(history){
    var key = history.slice(history.length-this.lookback).join(",");
    return this.machine[key];
};

StateMachine.prototype.generateInit = function(){
    return randomElementsWithReplacement(this.states,this.lookback);
};

StateMachine.prototype.generateSequence = function(n,initial){
    initial = initial || this.generateInit();
    initial = initial.slice(0,initial.length);
    while(initial.length<n){
        initial.push(this.generateNext(initial));
    };
    return initial;
};

function stateMachine0(){
    var n = 4*(getParameterByName("n")||32);
    hello();

    var sm = new StateMachine(3,'C D E F G A B C> r r r r'.split(" "),"withReplacement");
    document.querySelector("#scoreField").value = sm.generateSequence(n).join(" ");

    var regenButton = document.createElement("button");
    regenButton.innerHTML = "New Score";
    regenButton.addEventListener("click",function(){
        document.querySelector("#scoreField").value = sm.generateSequence(n).join(" ");
    });
    document.body.appendChild(regenButton);
}


function stateMachine1(){
    var n = 4*(getParameterByName("n")||32);
    hello();

    var sm = new StateMachine(3,'C D E F G A B C> r r r r'.split(" "));
    document.querySelector("#scoreField").value = sm.generateSequence(n).join(" ");

    var regenButton = document.createElement("button");
    regenButton.innerHTML = "New Score";
    regenButton.addEventListener("click",function(){
        document.querySelector("#scoreField").value = sm.generateSequence(n).join(" ");
    });
    document.body.appendChild(regenButton);
}

function stateMachine2(){
    var n = 4*(getParameterByName("n")||32);
    hello();

    var sm = new StateMachine(4,'C D E F G A B C> r r r r'.split(" "));
    var rsm = new StateMachine(4,'1 2 4'.split(" "));

    function generateRhytmic(n){
        var notes = sm.generateSequence(n);
        var lens = rsm.generateSequence(n);
        return notes.map(function(note,i){
            return note+lens[i];
        }).join(" ");
    }
    
    document.querySelector("#scoreField").value = generateRhytmic(n);

    var regenButton = document.createElement("button");
    regenButton.innerHTML = "New Score";
    regenButton.addEventListener("click",function(){
        document.querySelector("#scoreField").value = generateRhytmic(n);
    });
    document.body.appendChild(regenButton);
}

function ToneGenerator(scale, steps, start){
    this.scale = scale;
    this.steps = steps;
    this.current = start || 0;
    this.i = 0;
}

ToneGenerator.prototype.generate = function(n){
    var notes = [];
    for(var i = 0; i < n; i++){        
        notes.push(this.scale[this.current%this.scale.length]);
        this.advance();
    }
    return notes;
};

ToneGenerator.prototype.advance = function(){
    var step = this.steps[this.i%this.steps.length];
    this.current = this.current + step;
    this.i = this.i + 1;
    return this;
};

var maxRhythm = parseInt("7777777777777777",8);
function RhythmGenerator(initial,steps,base){
    this.base = base || 3;
    this.state = parseInt(initial,this.base);
    this.steps = steps;
    this.i = 0;
    this.max = Math.pow(this.base,16)-1;
}

function padLeft(s,n,pad){
    var shortfall = n-s.length;
    var acc = [s];
    while(shortfall>0){
        acc.push(pad);
        shortfall--;
    }
    return acc.reverse().join("");
}

function parseRhythm(n,base){
    var s = typeof n === "number" ? n.toString(base || 4) : n;
    s = padLeft(s,16,"1");
    var lengths = [];
    var c = s[0];
    var len = 1;
    s = s.slice(1);
    while(s.length>0){
        if(s[0]===c) {
            len++;
        } else {
            lengths.push(len);
            c = s[0];
            len = 1;
        }
        s = s.slice(1);        
    }
    lengths.push(len);
    return lengths;
}

function parseRhythmWithRests(n,base){
    var s = typeof n === "number" ? n.toString(base || 4) : n;
    s = padLeft(s,16,"1");
    var lengths = [];
    var c = s[0];
    var len = 1;
    s = s.slice(1);
    while(s.length>0){
        if(s[0]===c) {
            len++;
        } else {
            lengths.push({duration:len, rest:(c==="0")});
            c = s[0];
            len = 1;
        }
        s = s.slice(1);        
    }
    lengths.push({duration:len, rest:(c==="0")});
    return lengths;
}


RhythmGenerator.prototype.generate = function(n){
    var rhythms = [];
    for(var i = 0; i < n; i++){
        rhythms.push.apply(rhythms,parseRhythm(this.state,this.base));
        this.state = (this.state+this.steps[this.i%this.steps.length])%this.max;
        this.i = this.i + 1;
    }
    return rhythms;
};

RhythmGenerator.prototype.generateWithRests = function(n){
    var rhythms = [];
    for(var i = 0; i < n; i++){
        rhythms.push.apply(rhythms,parseRhythmWithRests(this.state,this.base));
        this.state = (this.state+this.steps[this.i%this.steps.length])%this.max;
        this.i = this.i + 1;
    }
    return rhythms;
};


function evenLessRandom(){
    hello();
    var n = getParameterByName("n") || 16;
    var tg = new ToneGenerator('C D E F G A B C> D> E> F> G> A> B>'.split(' '),[3,5,3,5,3,5,1]);
    var rg = new RhythmGenerator('1111000011110000',[2,7,2,17]);

    function generate(n){
        var measures = Math.round(n/4)+1;
        var nMeasures = 10;
        var rhythms = rg.generate(measures);
        var notes = tg.generate(rhythms.length);

        return rhythms.map(function(r,i){
            return notes[i]+r;
        }).slice(0,n).join(" ");
    }

    document.querySelector("#scoreField").value = generate(n);

    var regenButton = document.createElement("button");
    regenButton.innerHTML = "New Score";
    regenButton.addEventListener("click",function(){
        document.querySelector("#scoreField").value = generate(n);
    });
    document.body.appendChild(regenButton);

    
    
}

function VoiceGenerator(scale,scaleSkips,initialRhythm,rhythmSkips){
    var tg = new ToneGenerator(scale,scaleSkips);
    var rg = new RhythmGenerator(initialRhythm,rhythmSkips);
    this.toneGen = tg;
    this.rhythmGen = rg;    
};

function defaultVoiceGenerator(){
    return new VoiceGenerator('C D E F G A B C> D> E> F> G> A> B>'.split(' '),[3,5,3,5,3,5,1],
                          '1111000011110000',[2,7,2,17]);
}

VoiceGenerator.prototype.generate = function(nMeasures){
    var tg = this.toneGen;
    var rg = this.rhythmGen;
    var allMeasures = [];
    var tones = undefined;
    var rhythm = undefined;
    var measure = undefined;
    for(var i = 0; i<nMeasures; i++){
        rhythm = rg.generate(1);
        tones = tg.generate(16);
        measure = [];
        rhythm.forEach(function(duration){
            measure.push(tones[0]+duration);
            tones = tones.slice(duration);
        });
        allMeasures.push(measure);
    };
    return [].concat.apply([],allMeasures).join(" ");        
};

VoiceGenerator.prototype.generateWithRests = function(nMeasures){
    var tg = this.toneGen;
    var rg = this.rhythmGen;
    var allMeasures = [];
    var tones = undefined;
    var rhythm = undefined;
    var measure = undefined;
    for(var i = 0; i<nMeasures; i++){
        rhythm = rg.generateWithRests(1);
        tones = tg.generate(16);
        measure = [];
        rhythm.forEach(function(rhythmObj){
            measure.push((rhythmObj.rest ? "R" : tones[0])+rhythmObj.duration);
            tones = tones.slice(rhythmObj.duration);
        });
        allMeasures.push(measure);
    };
    return [].concat.apply([],allMeasures).join(" ");        
};


function evenLessRandom2(){
    hello();
    var n = getParameterByName("n") || 16;
    var tg = new ToneGenerator('C R D R E R F R G R A R B R C> R D> R E> R F> R G> R A> R B>'.split(' '),[3,5,3,5,3,5,1]);
    var rg = new RhythmGenerator('1111000011110000',[2,7,2,17]);

    function generate(n){
        var measures = Math.round(n/4)+1;
        var nMeasures = 10;
        var allMeasures = [];
        var tones = undefined;
        var rhythm = undefined;
        var measure = undefined;
        for(var i = 0; i<nMeasures; i++){
            rhythm = rg.generate(1);
            tones = tg.generate(16);
            measure = [];
            rhythm.forEach(function(duration){
                measure.push(tones[0]+duration);
                tones = tones.slice(duration);
            });
            allMeasures.push(measure);
        };
        return [].concat.apply([],allMeasures).join(" ");        
    }

    document.querySelector("#scoreField").value = generate(n);

    var regenButton = document.createElement("button");
    regenButton.innerHTML = "New Score";
    regenButton.addEventListener("click",function(){
        document.querySelector("#scoreField").value = generate(n);
    });
    document.body.appendChild(regenButton);      
}

function twoVoices(){
    var html = `
<div> Voice 1 : <input size=65 id="v1" type="text"></input></div>
<div> Voice 2 : <input size=65 id="v2" type="text"></input></div>
<button id="play">play</button>
<button id="regenerate">regenerate</button>
    `;
    document.body.innerHTML = html;
    var voice1 = new VoiceGenerator('C D E F G A B C> D> E> F> G> A> B>'.split(' '),[3,5,3,5,3,5,1],
                                    '1111000011110000',[2,7,2,17]);
    var voice2 = new VoiceGenerator('C D E F G A B C> D> E> F> G> A> B>'.split(' '),[3,5,3,5,3,5,1].reverse(),
                                    '1011000010110000',[2,7,2,17]);
    var v1input = document.getElementById("v1");
    var v2input = document.getElementById("v2");
    var playButton = document.getElementById("play");
    var regenerateButton = document.getElementById("regenerate");

    v1input.value = voice1.generate(8);
    v2input.value = voice2.generate(8);

    playButton.addEventListener("click",function(){
        var voice1txt = v1input.value;
        var voice2txt = v2input.value;
        new Score([voice1txt, voice2txt]).play();
    });

    regenerateButton.addEventListener("click",function(){
        v1input.value = voice1.generate(8);
        v2input.value = voice2.generate(8);        
    });
}

function twoVoicesWithRests(){
    var html = `
<div> Voice 1 : <input size=65 id="v1" type="text"></input></div>
<div> Voice 2 : <input size=65 id="v2" type="text"></input></div>
<button id="play">play</button>
<button id="regenerate">regenerate</button>
    `;
    document.body.innerHTML = html;
    var voice1 = new VoiceGenerator('C R D R E R F R G R A R B R C> R D> R E> R F> R G> R A> R B>'.split(' '),[3,5,3,5,3,5,1],
                                    '1111000011110000',[2,7,2,17]);
    var voice2 = new VoiceGenerator('C R D R E R F R G R A R B R C> R D> R E> R F> R G> R A> R B>'.split(' '),[3,5,3,5,3,5,1].reverse(),
                                    '1011000010110000',[2,7,2,17].reverse());
    var v1input = document.getElementById("v1");
    var v2input = document.getElementById("v2");
    var playButton = document.getElementById("play");
    var regenerateButton = document.getElementById("regenerate");

    v1input.value = voice1.generate(8);
    v2input.value = voice2.generate(8);

    playButton.addEventListener("click",function(){
        var voice1txt = v1input.value;
        var voice2txt = v2input.value;
        new Score([voice1txt, voice2txt]).play();
    });

    regenerateButton.addEventListener("click",function(){
        v1input.value = voice1.generate(8);
        v2input.value = voice2.generate(8);        
    });
}

function twoVoicesWithRestsAlt(){
    var html = `
<div> Voice 1 : <input size=65 id="v1" type="text"></input></div>
<div> Voice 2 : <input size=65 id="v2" type="text"></input></div>
<button id="play">play</button>
<button id="regenerate">regenerate</button>
    `;
    document.body.innerHTML = html;
    var voice1 = new VoiceGenerator('C D E F G A B C> D> E> F> G> A> B>'.split(' '),[3,5,3,5,3,5,1],
                                    '1111220011110022',[2,7,2,17]);
    var voice2 = new VoiceGenerator('C D E F G A B C> D> E> F> G> A> B>'.split(' '),[3,5,3,5,3,5,1].reverse(),
                                    '1211020012110200',[2,7,2,17].reverse());
    var v1input = document.getElementById("v1");
    var v2input = document.getElementById("v2");
    var playButton = document.getElementById("play");
    var regenerateButton = document.getElementById("regenerate");

    v1input.value = voice1.generateWithRests(8);
    v2input.value = voice2.generateWithRests(8);

    playButton.addEventListener("click",function(){
        var voice1txt = v1input.value;
        var voice2txt = v2input.value;
        new Score([voice1txt, voice2txt]).play();
    });

    regenerateButton.addEventListener("click",function(){
        v1input.value = voice1.generateWithRests(8);
        v2input.value = voice2.generateWithRests(8);        
    });
}

function twoVoicesWithRestsAltWithVis(){
    var html = `
<div> Voice 1 : <input size=65 id="v1" type="text"></input></div>
<div> Voice 2 : <input size=65 id="v2" type="text"></input></div>
<div><button id="play">play</button>
<button id="regenerate">regenerate</button></div>
<canvas id="vis"></canvas> 
    `;
    document.body.innerHTML = html;
    var voice1 = new VoiceGenerator('C D E F G A B C> D> E> F> G> A> B>'.split(' '),[3,5,3,5,3,5,1],
                                    '1111220011110022',[2,7,2,17]);
    var voice2 = new VoiceGenerator('C D E F G A B C> D> E> F> G> A> B>'.split(' '),[3,5,3,5,3,5,1].reverse(),
                                    '1211020012110200',[2,7,2,17].reverse());
    var v1input = document.getElementById("v1");
    var v2input = document.getElementById("v2");
    var playButton = document.getElementById("play");
    var regenerateButton = document.getElementById("regenerate");

    var visEl = document.getElementById("vis");
    visEl.width = 800;
    visEl.height = 400;

    v1input.value = voice1.generateWithRests(16);
    v2input.value = voice2.generateWithRests(16);

    var vis = new NotesView(visEl, [v1input.value, v2input.value],80);

    playButton.addEventListener("click",function(){
        var voice1txt = v1input.value;
        var voice2txt = v2input.value;
        new Score([voice1txt, voice2txt]).play();
        vis.start();
    });

    regenerateButton.addEventListener("click",function(){
        v1input.value = voice1.generateWithRests(16);
        v2input.value = voice2.generateWithRests(16);
        vis.reset([v1input.value,v2input.value]);
    });
}

// Here we define all our tasks.

var dos = {
    hello:hello,
    random16ths:random16ths,
    randomNotes:randomNotes,
    stateMachine0:stateMachine0,
    stateMachine1:stateMachine1,
    stateMachine2:stateMachine2,
    evenLessRandom:evenLessRandom,
    evenLessRandom2:evenLessRandom2,
    twoVoices:twoVoices,
    twoVoicesWithRests:twoVoicesWithRests,
    twoVoicesWithRestsAlt:twoVoicesWithRestsAlt,
    twoVoicesWithRestsAltWithVis:twoVoicesWithRestsAltWithVis
};

// And here we execute them, after the dom is done loading.

document.addEventListener("DOMContentLoaded",main);
function main(){
    var doWhat = getParameterByName("do");
    (dos[doWhat]||hello)();    
}


