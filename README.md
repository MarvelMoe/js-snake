## Yet another implementation of the game Snake

#### An Odin Project challenge to flex some JS, JQuery, ...

![alt text](./img/screenshot.jpg "JS- screen shot")

- Idea from <a href="http://www.theodinproject.com/javascript-and-jquery/jquery-and-the-dom" target="_blank">this Odin Project challenge.</a>

- Live preview [here](http://htmlpreview.github.io/?https://github.com/afshinator/js-snake/blob/master/index.html)

**Details:**

"Basically, it's a snake that you have to move around the board and which grows longer with each piece of food it eats. You lose if it gets so big it hits itself or if it goes off the board."...

The challenge calls for :

- A grid of 40 by 40.  

- Using multiple div html element for the grid play area.

	To get by ineffeciencies such as searching through a possible 1600 divs for the correct one, I implement a cache systems that cuts that number down to at most a search of 40.



TODO:


- Add graphic images to snake body & food

	At first simple images, then animated 

- Don't let snake go over itself

- Implement button to make 'Deadly Edges'





