/*
 * snake.js  - by Afshin Mokhtari
 *
 */

$(function() {

    // Displays the game.  The 'View' of this app; tied to implementation via JQuery.
    var displayer = function() {
        var $playarea = $('#playarea');         // Cache access to game play area                             
        var $score = $('#score');
        var $rowCache = [];
        var cellSize = 15;                      //  How big each cell is; smallest: 10, mid:15, largest: 20
        var snakeCells = [];
        var foodCell = [];

        var init = function( size ) {
            var rowMarker;

            $playarea.css( 'width', ( size * cellSize )  );             // Make the container a fixed size based on parameter
            $playarea.css( 'height', ( size * cellSize ) );

            for ( var i = 0; i < size; i++ ) {                          // Add all the spans that will hold each row of divs; used for caching divs to speed up selection
                $playarea.append( '<span id="row' + i  + '">' );
            }
            
            for ( i = 0; i < size; i++ ) {                              
                $rowCache[i] = $( '#row' + i );                         // cache references to rows created above

                for ( var j = 0; j < size; j++ ) {                      // Create column contents: 
                    $rowCache[i].append( '<div id="' + j + '-' + i + '" class="cell" style="top:' + i * cellSize +'px; left:' + j * cellSize + 'px;" ></div>' ); 
                }
            }

            $('.cell').css( 'width', cellSize );
            $('.cell').css( 'height', cellSize );
        };


        var reset = function() {
            eraseSnake();
        };

        var showStats = function( score, speed ) {                           // Put up game stats
            $score.text( 'Score: ' + score + ' -- Speed: ' + speed );
        };


        // showSnake kept a list of what cells the snake occupies, eraseSnake() will go through the list and empty them out
        var eraseSnake = function() {
            for ( var i = 0; i < snakeCells.length; i += 1 ) {
                snakeCells[i][2].removeClass( 'cell-snake' );               // stored JQuery selector of this piece
                snakeCells.splice(i, 1);                                    // take this element out of the array
            }            
        };


        // Uses caching scheme to that searching for a div is a matter of seraching less than 40 instead of less than 1600!
        // Return a cached JQuery selection of the specified cell.
        var accessHandleTo = function ( x, y ) {            
            var s = '#' + x + '-' + y;
            // console.log( 'accessHandleTo: ' + $rowCache[y].attr('id') + ' trying to find ' + s + ' yields ' + $rowCache[y].find(s).attr('id') );
            return $rowCache[y].find( s );
        };


        var showSnake = function( snake ) {
            var x,y;
            var $elt;

            eraseSnake();                                       // First erase last rounds display of the snake

            for ( var i = 0; i < snake.length; i += 1 ) {           
                x = snake[i][0];        y = snake[i][1];
                // console.log( 'showSnake() -' + i + ', spot:' + '#' + x + '-' + y );
                $elt = accessHandleTo( x, y );                  // instead of simply getting at div via $(s), accessHandleTo() uses cache system 
                snakeCells.push( [x, y, $elt] );                // $elt is saved so that it can quickly be accessed when erasing snake
                $elt.addClass( "cell-snake" );
            }
        };


        var eatFood = function() {
            foodCell[2].removeClass( 'cell-food' ); 
        };


        var showFoodAt = function( x, y ) {
            var $elt = accessHandleTo( x, y );
            foodCell = [ x, y, $elt ];
            $elt.addClass( 'cell-food' );
        };


        return {
            init : init,
            reset : reset,
            showStats : showStats,
            showSnake : showSnake,
            showFoodAt : showFoodAt,
            eatFood : eatFood
        };
    }();


    // Get input from keyboard
    var input = function() {
        var lastKeyPress = 0;

        var callUponKeypress = function( callback ) {
            $( document ).keydown( function( event ) {
                lastKeyPress = event.which;
                callback( lastKeyPress );
            });
        };

        return {
            lastkey : lastKeyPress,
            captureKeyStroke : callUponKeypress
        };
    }();



    /*
     * The main game object
     */

    var snake = function() {
        // Game Constants
        var gameDimensions = 40;    // Number of rows and columns that make up the game grid
        var initialSpeed = 250;     // Starting spped of game  (higher numbers are slower)
        var maxSpeed = 20;          // Fastest game can go
        var foodValue = 10;         // How much to increase score by each time food is eaten

        // Private Vars
        var coords = [];            // Snake data structure is an array of coordinates
        var snakeSize = 0;          // How long the snake is.
        var boardSize = 0;          // The snake also handles dealing with the board... to keep things simple.
        var direction;              // 0 = center (not moving), 
        var bStarted;               // Whether the game has started
        var score;
        var speed;
        var foodAvailable;          // True when a food has been put on the board
        var foodX, foodY;           // Location of where food is currently at
        var timeoutID;              // for setTimeout()


        // Called by keyPress(); Parse what key was pressed; change directions of snake if appropriate.
        var handleKeyStroke = function( key ) {
            // up:38, down: 40, right:39, left: 37,    32: space,  27:esc
            if ( key !== direction ) {              // if arrow key pressed was not in same direction as we are already going
                switch ( key ) {
                    case 27:
                        window.clearTimeout( timeoutID );       // game kill switch
                        return;
                    case 38:
                        break;
                    case 39:
                        break;
                    case 40:
                        break;
                    case 37:
                        break;
                    case 32:
                        console.log('space');
                        break;     
                    case 13:                        // return key
                        if ( ! bStarted ) { 
                            start(); 
                            console.log('game started.'); 
                        }
                        return;                                                                           
                    default:
                        // all non-direction keys should leave direction as what it was
                        return;
                }

                // Unless the new direction is the exact opposition of current direction, set current direction to the new one.
                if ( ( ! ( direction === 38 && key === 40 ) ) &&    // up down
                     ( ! ( direction === 40 && key === 38 ) ) &&
                     ( ! ( direction === 39 && key === 37 ) ) &&    // left right
                     ( ! ( direction === 37 && key === 39 ) ) 
                    ) {                     
                    direction = key;
                }
            }   
        };


        var init = function( size ) {
            displayer.init( size );
            boardSize = size;
            reset();
            input.captureKeyStroke( handleKeyStroke );
        };


        var reset = function() {
            snakeSize = 1;
            coords[0] = [ Math.round( boardSize / 2 ), Math.round( boardSize / 2 ) ];
            direction = 0;                      // Not moving yet.
            bStarted = false;
            score = 0;
            speed = initialSpeed;                        // Initial starting speed of game
            foodAvailable = false;
            displayer.showStats( score, speed );
        };

        var start = function() {
            timeoutID = window.setTimeout( takeTurn, speed );
            bStarted = true;
            direction = 39;         // default direction to the right when game starts
        };


        var nextCellToGoTo = function( allowWrapAround ) {    // Returns where the head of the snake would go given current direction
            var x = coords[0][0];
            var y = coords[0][1];

            switch ( direction ) {
                case 38:
                    y -= 1;     // console.log('up');
                    break;
                case 39:
                    x += 1;     // console.log('right');
                    break;
                case 40:
                    y += 1;     // console.log('down');
                    break;
                case 37:
                    x -= 1;     // console.log('left');
                    break;
                case 32:
                    console.log('space');   // TODO: pause game
                    break;                                                                             
                default:
                    // all non-direction keys should leave direction as what it was
                    console.log( "funky number in nextCellToGoTo :" + direction );               
            }

            if ( allowWrapAround ) {
                if ( x > ( boardSize - 1 ) ) { x = 0; }
                else if ( x < 0 ) { x = ( boardSize - 1 ); }
                else if ( y < 0 ) { y = ( boardSize - 1 ); }
                else if ( y > ( boardSize - 1 ) ) { y = 0; }
            }

            return [ x, y ];
        };


        var getRandomInt = function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };


        var takeTurn = function() {
            //  console.log('takeTurn() called at this speed: ' + speed );
            var foundASpotForFood = false;
            var tailX, tailY;
            var nextCell = [];

            if ( ! foodAvailable ) {                // If no food on the board, pick a random place to put it
                while ( ! foundASpotForFood ) {
                    foodX = getRandomInt( 0, boardSize - 1 );
                    foodY = getRandomInt( 0, boardSize - 1 );

                    foundASpotForFood = true;
                    for ( var i = 0; i < coords.length; i++ ) {
                        if ( coords[i][0] === foodX && coords[i][1] === foodY ) { foundASpotForFood = false; }
                    }
                } 

                foodAvailable = true;
                displayer.showFoodAt( foodX, foodY );
            }

            // tailX = coords[ coords.length - 1 ][ 0 ];  tailY = coords[ coords.length - 1 ][ 1 ];
            nextCell = nextCellToGoTo( true );
            coords.unshift( nextCell );            

            // Check snake-head and food collision (to eat the food) 
            if ( nextCell[ 0 ] === foodX && nextCell[ 1 ] === foodY ) {  
                score += foodValue;
                speed = ( speed > maxSpeed ) ? Math.floor( speed * 0.95 ) : maxSpeed;
                displayer.eatFood();
                displayer.showStats( score, speed );
                foodAvailable = false;                                  // so that new food is generated next call to takeTurn()
            }
            else {
                coords.pop();                   // No food eaten, last entry is the tail which needs to disapper to simulate movement
            }

            displayer.showSnake( coords );

            timeoutID = window.setTimeout( takeTurn, speed );
        };


        init( gameDimensions );

        return {
            init : init,
            reset : reset
        };
    }();

});
