/* depends on timbre.js */

(function(global){
    function ensureNoteList(_){
        if(typeof _ === "string"){
            return Notes.fromString(_);
        } else {
            if(_.every(Note.isNote)) return _;
            throw new Error("Score voices must be either strings containing notes or a list of Note objects.");
        }
    };    
    function Score(voices,keySig,tempo){
        this.tempo = tempo || 120;
        this.keySig = keySig || {};
        this.voices = voices.map(ensureNoteList);
    };
    Score.prototype.play = function(readyCallback){
        var keySig = this.keySig;
        scores = this.voices.map(function(noteList){
            return noteList.map(function(note){
                return note.inKeySignature(keySig);
            });
        });
        readyCallback = typeof readyCallback === "undefined" ?
            function(){} : readyCallback;
        var tempoBPM = this.tempo;
        var env   = T("adsr", {d:3000, s:0, r:600});
        var synth = T("SynthDef", {mul:0.45, poly:8});
        
        synth.def = function(opts) {
            var op1 = T("sin", {freq:opts.freq*6, fb:0.25, mul:0.4});
            var op2 = T("sin", {freq:opts.freq, phase:op1, mul:opts.velocity/128});
            return env.clone().append(op2).on("ended", opts.doneAction).bang();
        };
        
        var master = synth;
        var mod    = T("sin", {freq:2, add:3200, mul:800, kr:1});
        master = T("eq", {params:{lf:[800, 0.5, -2], mf:[6400, 0.5, 4]}}, master);
        master = T("phaser", {freq:mod, Q:2, steps:4}, master);
        master = T("delay", {time:"BPM__tempo__ L16".replace("__tempo__",tempoBPM), fb:0.65, mix:0.25}, master);
        
        var voiceDescriptions = [
            "t__tempo__ v6 o4",
            "t__tempo__ v14 o5"
        ].map(function(voice){
            return voice.replace("__tempo__",tempoBPM);
        });
        
        var scores = this.voices.map(function(fragment,i){
            fragment = Notes.toMML(fragment) + "r1 r1 r1 r1";
            return voiceDescriptions[i%voiceDescriptions.length]+" "+fragment;
        });
        
        readyCallback(T("mml", {mml:scores}, synth).on("ended", function() {
            this.stop();
        }).set({buddies:master}).start());
    };
    Score.play = function(){
        var s = new Score(Array.prototype.slice.call(arguments,0,arguments.length));
        s.play();
        return s;
    };    
    global.Score = Score;
})(typeof window==="undefined" ? global : window);
