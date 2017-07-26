Let's Generate Some Music With JS!
==================================

This lecture is meant to help Javascript beginners learn to use
Javascript _creatively_ instead of _productively_. Specifically, we're
going to try to generate a little music!

But first: why would we want to do this?

Programming as an Artistic Tool
===============================

For most of us programming is a practical skill, usually meant to get
us a job. But it can also be a an artistic tool, meant to help us
express certain ideas or explore aesthetic territory.

Here is a little gif of Voyager's approach to Jupiter.

![Jupiter](https://vincenttoups.github.io/ux-iron-yard/jupiter-approach.gif)

I think, even if we separate these images from the pretty shocking
reality of a planet with storm systems that will still be going on
long after we are all dead, I think we can all see there is something
aesthetically fascinating about Jupiter's weather. And yet despite all
its complexity, in principle the weather patterns of the planet all
derive from simple, local rules, applied repeatedly over time. 

Computers let us experiment with that kind of system! Here is an
example from a previous lecture I've given at the iron yard:

[Nothing We Haven't Seen Before](https://vincenttoups.github.io/ux-iron-yard/)

Practical Reality
-----------------

I hate being practical, but generative art, especially in Javascript,
is a _great portfolio piece_. Its easy for employers to see and makes
an impression both about your technical skills _and_ your creative
skills. It can help you get a job. 

AND! It is a non-boring way to practice!


Today's Challenge: Can We Apply These Ideas to Music?
-----------------------------------------------------
(with minimal knowledge of music theory).

### Getting Set Up

    git clone https://github.com/VincentToups/GenerativeMusicLectureV2
    
Or clone via the technique of your choice. 

Then, 

    cd GenerativeMusicLectureV2 
    <open up index.html>
    
Then open up your developer's tools and type this into the console:

    Score.play("A4 E4 C#1 A1 D2 E2 F#1 G#1 A>4");
    
What the heck! We're playing music!

Quick Note on Notation!
-----------------------

For various historical reasons, we talk about notes starting with the
note C:

    Score.play("C D E F G A B C");
    
This is a C scale. Almost. That last C needs to be in the next octave,
we indicate that like so:

    Score.play("C D E F G A B C<");
    
Rests
-----

We can use an `R` to indicate a rest:

    Score.play("C D R F G");
    
Durations
---------

That rest is a little too short to hear:

   Score.play("C D R4 F G");
   
Each note is, by default, a 16th note (at default of 100 beats per
minute).

Some Minimal Setup
==================

Just a tiny bit of bookkeeping first. We are going to use url
parameters so we can quickly experiment with different approaches.

I stole this code from stack overflow:

    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

If our URL looks like this:

    ../generative-music-lecture-2/index.html?do=twoVoicesWithRests
    
And we say:

    getParameterByName("do") 
    
we get
    
    "twoVoicesWithRests"
    
With this code we can write some tasks:

    function task1(){
        console.log("Hello World");
    }
    
    var tasks = {
        task1:task1
    }
    
    document.addEventListener("DOMContentLoaded",function(){
        tasks[getParameterByName["do"]]();
    }
    
And then open our page like this:

    ../generative-music-lecture-2/index.html?do=task1
    
In the file `index.js` we can see all the different tasks and the code
to load them looks just like this.

Here is our first example:

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

Let's Generate Some Music
=========================

What we'll find is that generating any art with a computer is always
about a balance between too much and too little randomness.

For instance:

    function random16ths(){
        hello();
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

        var n = getParameterByName("n")||10;

        document.querySelector("#scoreField").value = generateScore(n);

        var regenButton = document.createElement("button");
        regenButton.innerHTML = "New Score";
        regenButton.addEventListener("click",function(){
            document.querySelector("#scoreField").value = generateScore(n);
        });
        document.body.appendChild(regenButton);
    }

Not all that interesting, right? Here is a lesson I understood
intuitively, but never explicitly until I read Terrence Deacon's
"Incomplete Nature:" most of what we experience as meaningful derives
its meaning from what it _doesn't do_ as opposed to what it does
do. The problem with music this random is that it will do pretty much
anything: any two notes can appear next to one another. 

Plus, all the notes have the same length. This is boring. Let's fix
that at least:

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

This is still pretty boring! But at least its less monotonous. 

Lesson 1 for the Generative Artist
----------------------------------

If your work is boring, add more temporal structure.

So. Presently we just transition from one note to the next randomly. A
straightforward generalization of that idea is to make it state
dependent.

Suppose we have a song that looks like this:

    .. C D A G 
    
And we want to know what to generate next. We could take some finite
number of steps backward, say two:

    .. C D A G 
           ---
           
Then all we need is a table which lists every pair of notes and tells
us what note to transition to.

    {
      "A,A": "G",
      "A,B": "E",
      "A,C": "C",
      "A,D": "B",
      "A,E": "G",
      "A,F": "D",
      "A,G": "A",
      "B,A": "F",
      "B,B": "A",
      ...
    }
    
For two notes this table has 49 entries. Its tedious to write down
these all by hand, but luckily we have a programming language:

    /** given a bunch of arrays, generate all combinations of elements from each */
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

This is actually a bit of a mouthfull for new developers, but let's
try to trace out how it work just for fun. If you don't get it, don't
sweat it - the code is right there in the git repository for you to
use, if you want.

Let's experiment:

    combinations('A B C'.split(' '),'X Y Z'.split(' '))
    
    -> [["A","X"],["A","Y"],["A","Z"],["B","X"],["B","Y"],["B","Z"],["C","X"],["C","Y"],["C","Z"]]
    
    combinations('A B C'.split(' '),'X Y Z'.split(' '),'Q R S'.split(' '))
    
    -> [["A","X","Q"],["B","X","Q"],["C","X","Q"],["A","Y","Q"],["B","Y","Q"],["C","Y","Q"],["A","Z","Q"],["B","Z","Q"],["C","Z","Q"],["A","X","R"],["B","X","R"],["C","X","R"],["A","Y","R"],["B","Y","R"],["C","Y","R"],["A","Z","R"],["B","Z","R"],["C","Z","R"],["A","X","S"],["B","X","S"],["C","X","S"],["A","Y","S"],["B","Y","S"],["C","Y","S"],["A","Z","S"],["B","Z","S"],["C","Z","S"]]
    
Now that we have a feel for it, how does it work? 

Well, first of all, edge cases: if we have no arguments, there aren't
any combinations, so we return the empty list. 

Otherwise, our strategy is to build up the combinations, starting with
the empty combination, and then creating all possible new combinations
from the previous set. 
    
So this generates all the combinations of the elements. If we want to
build a generator that maps every pair of notes to a new note, we just
need to do something like this:

    var notes = 'A B C D E F G'.split(' ');
    var combs = combinations(notes,notes);
    var map = {};
    function selectRandomly(a){
        return a[Math.floor(Math.random()*a.length)];
    }
    combs.forEach(function(combination,i){
        map[combination.join(",")] = selectRandomly(notes);
    });

This strategy means that not every note appears as a target, in
general, and some notes might appear more than once. We could also do
something like this:

    var notes = 'A B C D E F G'.split(' ');
    var combs = combinations(notes,notes);
    var map = {};
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
    combs.forEach(function(combination,i){
        map[combination.join(",")] = notes[i%notes.length];
        if(notes%i===0) notes = shuffle(notes);
    });

(Note that [0 1 2 3 4 5 6 7] % 3 -> [0 1 2 0 1 2 0 1])

This strategy ensures that each note in the scale occurs equally often
and that none are left out.

I've implemented a general helper object called a state machine that
lets us experiment with this kind of generate strategy.

    var stateMachine = new StateMachine(2,'A B C D E F G'.split(' '),"withReplacement")

Will create a state machine. If we pass it a history, like this:

    stateMachine.generateNext(['B','C']) 
    -> 'A'

It will generate the next token in the sequence. The state machine is
initialized either using replacement or not, depending on an optional
third argument. The default value is "withoutReplacement".

We can also generate a sequence of notes of arbitrary length:

    stateMachine.generateSequence(10,['A','B'])
    -> ["A", "B", "G", "B", "G", "B", "G", "B", "G", "B"]
    
Let's try a few tasks:

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

Both of these examples don't really do anything too interesting with
Rhythm. We can use _two_ state machines to generate pitches and
rhythms and combine them:

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

This isn't entirely unmusical!

Even Less Randomness!
---------------------

Personally, I like something a little more structured. So here is the
plan. We want a way to generate sequences of notes and sequences of
rhythms or durations and we want to combine them. The scheme here will
be even simpler than the state machine, which didn't give us much
control.

Consider the sequence of numbers

    1 3 3 2
    
And the notes:
    
    C D E F G A B C> D> E> F> G> A> B>
    ^ ^     ^     ^     ^  ^        ^
        ^   ^ ^ 

These generate a note sequence like 
   
   C D G C> E> F> B> E G A ...
    
Now, durations are a little harder. One thing about music is that it
happens in measures. A measure is a set that adds up to 16 16th notes
(at least for our purposes.) We'd like to generate rhythms one measure
at a time.

Consider a string made of us 16 characters:

    1100111122330011
    
We can think of this as representing a rhytm like this

    8th 8th 4th 8th 8th 8th 8th
    
Any such number with 16 digits will serve as a template for a rhythm. 

Fun fact: we can always convert string like this to a base 10 number by saying:
    
    parseInt("1100111122330011",4)
    
Which treats it as base 4 number. 

(Why do we want to use base 3? Because otherwise we'd get numbers
like: "1234567812345678", which is all 16th notes. By using a smaller
base, we can make longer notes more likely.)

Once we have the number in base ten, we can add stuff to it, convert
it back to base 4, and treat that as a new rhythm. Just like our note
generator, we can select from a list of advancements to slowly evolve
our rhythm.

We don't have time to go line by line on the code, but I can show you
what these two generators look like.

Here is a final task which uses them to generate music:

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

I've also thrown in a visualization (implemented in the repo) just for
kicks. If we have time, we can go through it.

Conclusion
==========

I hope I've demonstrated that Javascript can be a useful environment
for generative art of all kinds. What we've covered here is just the
beginning - modern browsers give us access to opengl style rendering
(even calculation on the GPU!). This lets us do all sorts of
interesting stuff.

The lesson here should be: you've picked up all these skills at the
Iron Yard: don't be afraid to apply them to weird, purely aesthetic,
projects. If you do more with these tools than just practical work,
you'll find that there is a lot more to programming than just getting
a job (or getting a job done!).


