/*
 * snake.js  - by Afshin Mokhtari
 *
 */

$(function() {

    // Displays the game.  The 'View' of this app; tied to implementation via JQuery.
    var displayer = function() {
        var $playarea = $('#playarea');         // Cache access to game play area                             
        var $gameinfo = $('#gameinfo');
        var $rowCache = [];
        var cellSize = 10;
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

        var showStats = function( score, speed ) {
            $gameinfo.text( 'Score: ' + score + ' -- Speed: ' + speed );
        };


        var eraseSnake = function() {
            for ( var i = 0; i < snakeCells.length; i += 1 ) {
                snakeCells[i][2].removeClass( 'cell-snake' ); // .addClass( 'cell-empty' );
                console.log('erasing snake part number ' + i);
                snakeCells.splice(i, 1);     // take this element out of the array
            }            

        };


        var accessHandleTo = function ( x, y ) {            // With this, searching for a div is a matter of seraching 40 instead of 1600, :-)
            var s = '#' + x + '-' + y;
            // console.log( 'accessHandleTo: ' + $rowCache[y].attr('id') + ' trying to find ' + s + ' yields ' + $rowCache[y].find(s).attr('id') );
            return $rowCache[y].find( s );
        };


        var showSnake = function( snake ) {
            var x,y;
            var s = '';
            var $elt;

            eraseSnake();
            for ( var i = 0; i < snake.length; i += 1 ) {
                console.log( 'length of snake ' + snake.length );                
                x = snake[i][0];
                y = snake[i][1];
                s = '#' + x + '-' + y;
                console.log( 'showSnake() -' + i + ', spot:' + s );
                $elt = accessHandleTo( x, y );                  // instead of simply getting at div via $(s), accessHandleTo() uses cache system 
                snakeCells.push( [x, y, $elt] );                // $elt is saved so that it can quickly be accessed when erasing snake
                $elt.addClass( "cell-snake" );
            }
        };


        var eatFood = function() {
            foodCell[2].removeClass( 'cell-food' ); // .addClass( 'cell-empty' );
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
                // lastKeyPress = String.fromCharCode( event.which );
                // console.log ( "keyboard: " + event.which + '--' + String.fromCharCode( event.which ) );
                lastKeyPress = event.which;
                callback( lastKeyPress );
            });
        };

        return {
            lastkey : lastKeyPress,
            captureKeyStroke : callUponKeypress
        };
    }();


    var snake = function() {
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


        var handleKeyStroke = function( key ) {
            // up:38, down: 40, right:39, left: 37,    32: space,  27:esc
            if ( key !== direction ) {              // if arrow key pressed was not in same direction as we are already going
                switch ( key ) {
                    case 27:
                        window.clearTimeout( timeoutID );       // game kill switch
                        return;

                    case 38:
                        console.log('up');
                        break;
                    case 39:
                        console.log('right');
                        break;
                    case 40:
                        console.log('down');
                        break;
                    case 37:
                        console.log('left');
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
                        console.log("handleKeyStroke : " + key);
                        return;
                }

                direction = key;
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
            speed = 300;                        // Initial starting speed of game
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
                    y -= 1;     console.log('up');
                    break;
                case 39:
                    x += 1;     console.log('right');
                    break;
                case 40:
                    y += 1;     console.log('down');
                    break;
                case 37:
                    x -= 1;     console.log('left');
                    break;
                case 32:
                    console.log('space');
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
            console.log('takeTurn() called at this speed: ' + speed );
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

            tailX = coords[ coords.length - 1 ][ 0 ];  tailY = coords[ coords.length - 1 ][ 1 ];
            nextCell = nextCellToGoTo( true );
            coords.unshift( nextCell );            

            if ( nextCell[ 0 ] === foodX && nextCell[ 1 ] === foodY ) {  // check to see if snake head is on the food
                score += 10;
                speed = ( speed > 200 ) ? Math.floor( speed * 0.9 ) : 150;
                displayer.eatFood();
                foodAvailable = false;
            }
            else {
                coords.pop();
            }

            displayer.showSnake( coords );
            timeoutID = window.setTimeout( takeTurn, speed );
        };


        init(40);

        return {
            init : init,
            reset : reset
        };
    }();

});
