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
    

   
