# CloudGenerator

CloudGenerator is a javascript library that randomly populates clouds (IMG HTML elements) into a sky (a DIV container) and translates them horizontaly from one edge to another.

It relies on [Mootools 1.4 with More](http://mootools.net) (Element.getDimensions() and Fx.Move()).

It was originally written by Tim Dupree and released in this [blog post](http://tdupree.com/2011/03/03/javascript-clouds-animation-with-mootools/).

A live demo is deployed on [Voltality](http://voltality.com) home page.

A few enhancements have been added :

- random direction
- possibility to use more than one image
- opacity configuration

Things that can be improved :

- add a vertical option
- add a parallax mode
- use CSS3 transition if available
- use requestAnimationFrame