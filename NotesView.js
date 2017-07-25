(function(global){

    function NotesView(canvas,notes,tempo){
        this.notes = notes;
        this.canvas = canvas;
        this.scoreCanvas = document.createElement("canvas");
        setHiDPICanvas(this.scoreCanvas, this.canvas.width, this.canvas.height);
        this.tempo = tempo;
        var lowestFreq = Infinity;
        var highestFreq = -Infinity;
        this.totalSixteenths = notes[0].reduce(addDurations,0);
        console.log("total sixteenths:", this.totalSixteenths);
        this.totalBeats = 4*this.totalSixteenths/16;
        console.log("Total Beats:",this.totalBeats);
        console.log("Length of Composition, Minutes: ", this.totalBeats/tempo);
        this.totalDurationMillis = (this.totalBeats/tempo)*60*1000;
        this.lowestFreqency = lowestFreq-10;
        this.highestFrequency = highestFreq+10;
        this.drawScore();
        this.drawCanvas();
        console.log("Canvas Width",canvas.width,PIXEL_RATIO);

        this.startTime = undefined;
        this.currentTime = undefined;
        var that = this;

        requestAnimationFrame(loop);

        function addDurations(a,b){
            var f = noteToFrequency(b.getLatinName());
            if(f<lowestFreq) lowestFreq=f;
            if(f>highestFreq) highestFreq=f;
            return a+b.lengthInSixteenthNotes();
        };
        function loop(){
            that.drawCanvas();
            requestAnimationFrame(loop);
        }
    }

    NotesView.prototype.start = function(){
        this.startTime = Date.now();
    };

    NotesView.prototype.drawCanvas = function(){
        var ctx = this.canvas.getContext('2d');
        ctx.save();
        ctx.setTransform(1,0,0,1,0,0);
        ctx.fillStyle = "white";
        ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
        ctx.drawImage(this.scoreCanvas, 0, 0);
        ctx.restore();
        if(this.startTime){
            var endured = Date.now()-this.startTime;
            var x = (endured/this.totalDurationMillis)*(this.canvas.width/PIXEL_RATIO);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "rgba(0,0,0,0.4)";
            ctx.beginPath();            
            ctx.moveTo(x,0);
            ctx.lineTo(x,this.canvas.height);
            ctx.stroke();        
        }
    };

    NotesView.prototype.drawScore = function(){
        var ctx = this.scoreCanvas.getContext('2d');
        var w = this.canvas.width/PIXEL_RATIO;
        var h = this.canvas.height/PIXEL_RATIO;
        ctx.fillStyle = "white";
        ctx.fillRect(0,0,w,h);
        var fl = this.lowestFreqency;
        var fh = this.highestFrequency;
        var pixelsPerSixteenth = w/(this.totalSixteenths);
        var x = 0;
        ctx.lineWidth = 10;
        var strokeStyles = "lightpink lightseagreen lightskyblue".split(" ");
        
        this.notes.forEach(drawNotes);

        function drawNotes(notes,i){
            x = 0;
            ctx.strokeStyle = strokeStyles[i%strokeStyles.length];
            notes.forEach(drawNote);
        }

        function drawNote(note){
            var x0 = x;
            x = x + note.lengthInSixteenthNotes()*pixelsPerSixteenth;
            if(note.isRest()) return;
            var f = noteToFrequency(note.getLatinName());
            var y = h*((f-fl)/(fh-fl));
            var nw = note.lengthInSixteenthNotes()*pixelsPerSixteenth*3;
            ctx.beginPath();
            ctx.moveTo(x0,y);
            ctx.lineTo(x0+nw,y);
            ctx.stroke();            
        };
    };

    global.NotesView = NotesView;
    
})(window);
