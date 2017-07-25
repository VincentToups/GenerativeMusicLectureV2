(function(global){

    function method(name,maxArgs){
        return function(instance){
            return instance[name].apply(instance,
                                        Array.prototype.slice.call(arguments,1,typeof maxArgs === "undefined" ? arguments.length : maxArgs));
        };
    };

    var Notes ={};

    function isValidDuration(d){
        return d>=1 && d <=16 && d === Math.round(d);
    }

    var validNoteNames = "A B C D E F G".split(" ");
    function isValidNoteName(n){
        return validNoteNames.indexOf(n.toUpperCase())!==-1;
    }

    function looksLikeSharpFlat(s){
        return s==="#" || s==="b" || s === "B";
    }

    function looksLikeExplicitModifier(s){
        return looksLikeSharpFlat(s) || s==="p" || s==="P";
    }

    function parsesAsOctave(s){
        var parsed = +s;
        return !isNaN(+s) && Math.round(parsed) === parsed;
    }

    function parseTone(tone){
        var noteName = tone[0];
        var modifier = "";
        if(!isValidNoteName(noteName)) throw new Error("Invalid note name in "+tone);
        tone = tone.slice(1);
        if(looksLikeExplicitModifier(tone[0])){
            modifier = tone[0];
            tone = tone.slice(1);
        }
        if(tone===""){
            return {
                name:noteName,
                modifier:modifier,
                octave:0
            };
        }
        if(!parsesAsOctave(tone)) throw new Error("Can't parse octave from "+tone);
        return {
            name:noteName,
            modifier:modifier.toLowerCase(),
            octave:+tone
        };        
    };

    function Note(duration, rest, tone){
        rest = typeof rest === "undefined" ? false : rest;
        // Duration is in 16th Notes
        this.duration = undefined;
        this.rest = rest;
        this.tone = tone;
        this.setDuration(duration);
        this.setTone(tone);
    }

    Note.prototype.setDuration = function(duration){
        if(!isValidDuration(duration)) throw new Error("Notes can only have durations in integral sixteenth notes: "+duration+" .");
        this.duration = duration;
        return this;
    };

    Note.prototype.getDuration = function(){
        return this.duration;
    };

    Note.prototype.setTone = function(tone){
        // We will let notes persist without a tone
        // As this will be make generating music a little easier.
        if(!tone) return;
        if(typeof tone === "string")
            this.tone = parseTone(tone);
        else
            this.tone = tone;
    };

    Note.prototype.isExplicitlyModified = function(){
        if(this.rest === true) return false;
        return !(this.tone.modifier==="");
    };

    Note.prototype.setModifier = function(modifier){
        if(looksLikeExplicitModifier(modifier)){
            this.tone.modifier = modifier.toLowerCase();
        } else {
            throw new Error("Trying to set modifier but "+modifier+" isn't a valid modifier.");
        }
        return this;
    };

    Note.prototype.getRawNoteName = function(){
        if(this.rest === true) return "r";
        return this.tone.name;
    };

    Note.prototype.isRest = function(){
        return this.rest;
    };

    // A utility which replicates a string N
    // times, inserting del between each replication.
    function strrep(s,n,del){
        del = typeof del === "undefined" ? "" : del;
        if(n===0) return "";
        if(n===1) return s;
        var out = s;
        n--;
        while(n>0){
            out = out+del+s;
            n--;
        };
        return out;
    };

    // We need to write some code to convert our notes to
    // Music Macro Language
    // This goes way back.
    // Luckily, we don't really need to understand that much about it
    // > goes up an octave, < goes down an octave
    // and we use & to indicate ties.
    // Since we are thinking purely in 16th Notes, we'll use ties
    // for everything. We'll just build up each note by raising to the right
    // octave, tying together enough 16th notes to add up to our duration
    // and then dropping back down
    Note.prototype.toMML = function(){
        if(this.rest){
            return strrep("r16",this.getDuration());
        }
        var octMod = this.tone.octave === 0 ? "" :
                this.tone.octave > 0 ? ">" :
                this.tone.octave < 0 ? "<" : "";
        // The operator to undo octave modifications.
        var octDeMod = this.tone.octave === 0 ? "" :
                this.tone.octave > 0 ? "<" :
                this.tone.octave < 0 ? ">" : "";        
        var nOctaves = Math.abs(this.tone.octave);
        // in MML + means sharp, - means flat
        var modifier = this.tone.modifier === "" ? "" :
                this.tone.modifier === "#" ? "+" :
                this.tone.modifier === "b" ? "-" : "";
        
        return (strrep(octMod,nOctaves)+
                strrep(this.tone.name.toLowerCase()+modifier+"16",this.getDuration(),"&")+
                strrep(octDeMod,nOctaves));
    };

    Note.prototype.getLatinName = function(){
        if(!this.tone) return undefined;
        return this.tone.name+(this.tone.octave.toString(10));
    };

    Note.prototype.lengthInSixteenthNotes = function(){
        return this.duration;
    };

    Note.oneFromString = function(s){
        s = s.toUpperCase();
        s = s.trim();
        var base = s[0];
        s = s.slice(1);
        var maybeMod = s[0];
        var mod = "";
        if(maybeMod==="#"||maybeMod==="B"||maybeMod==="P"){
            s = s.slice(1);            
            mod = maybeMod;
        } else {
            mod = "";
        }
        var octave = 0;
        while(s.length > 0 && (s[0]===">"||s[0]==="<")){
            octave = octave + (s[0]===">" ? 1 : -1);
            s=s.slice(1);
        }
        var duration = s.length>0 ? parseInt(s,10) : 1;
        var rest = false;
        if(base === "r" || base === "R"){
            rest = true;
        };
        return new Note(duration,rest,rest?undefined:(base+mod+octave.toString(10)));
    };

    Note.prototype.getTone = function(){
        return this.rest ? {
            name:"r",
            modifier:"",
            octave:0
        } :
        {
            name:this.tone.name,
            modifier:this.tone.modifier,
            octave:this.tone.octave
        };
    };
    
    Note.prototype.copy = function(){
        return new Note(this.duration, this.rest,
                        this.rest ? {
                            name:"r",
                            modifier:"",
                            octave:0
                        } :
                        {
                            name:this.tone.name,
                            modifier:this.tone.modifier,
                            octave:this.tone.octave
                        });
    };

    Note.prototype.inKeySignature = function(keySig){
        var cp = this.copy();
        if(!cp.isExplicitlyModified() && keySig[cp.getRawNoteName()])
            cp.setModifier(keySig[cp.getRawNoteName()]);
        return cp;
    };

    Notes.fromString = function(s,keySig){
        keySig = keySig ||{};
        return s.split(/[ ,]+/).map(function(s){
            var note = Note.oneFromString(s);
            if(!note.isExplicitlyModified() &&
               keySig[note.getRawNoteName()]){
                note.setModifier(keySig[note.getRawNoteName()]);
            }
            return note;
        });
    };

    Notes.toString = function(noteArray){
        return noteArray.map(function(n){
            return n.toString();
        }).join(" ");
    };

    Note.prototype.getModifier = function(){
        return this.tone.modifier;
    };

    Note.prototype.getOctave = function(){
        return this.tone.octave;
    };

    Note.prototype.toString = function(){
        var s = undefined;
        if(this.rest){
            s = "r";
        } else {
            s = this.getRawNoteName();
            if(this.isExplicitlyModified()) s += this.getModifier();
            var octaveCount = Math.abs(this.getOctave());
            var octaveSign = Math.sign(this.getOctave());
            var sym = octaveSign === 1 ? ">" : "<";
            while(octaveCount>0){
                octaveCount--;
                s += sym;
            }
        }
        s += this.duration.toString(10);
        return s;        
    };

    Notes.toMML = function(notes){
        return notes.map(function(note){
            return note.toMML();
        }).join(" ");
    };

    Notes.reverse = function(s){
        return Notes.toString(Notes.fromString(s).reverse());
    };

    Notes.rotate = function(s,by){
        by = typeof by === "undefined" ? 1 : by;
        var notes = Notes.fromString(s);
        while(by<0){
            by=by+notes.length;
        }
        var tones = notes.map(method("getTone"));
        notes.map(function(note,i){
            note.setTone(tones[(i+by)%notes.length]);
        });
        return Notes.toString(notes);
    };

    Note.isNote = function(o){
        return (o instanceof Note);
    };

    // Put Note in the global namespace;
    global.Note = Note;
    global.Notes = Notes;
    
})(typeof window === "undefined" ? global : window);
