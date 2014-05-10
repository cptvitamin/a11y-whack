window.addEventListener("load", function() {
  // initialize the canvas and the context
  var cnv = document.querySelector("#game");
  var ctx = cnv.getContext("2d");
  var canvas = {
    "width": cnv.width,
    "height": cnv.height
  };
  // horizontal offset for positioning the game grid below status area
  var yoffset = 50;
  // focus gets returned here whenever a new character appears on the grid
  var status = document.getElementById('status');
  var score = 0;                                    // initialize the score
  var creeperCount = 0;                             // initialize creeper count
  var scoreText = document.getElementById("score"); //for updating the score
  // color grid for creeper
  var creeper = [
    ["#7D9C79", "#008000", "#348828", "#789776", "#9E9E9C", "#62A853", "#599A4C", "#366B36"],
    ["#599A4C", "#7D9C79", "#62A853", "#008000", "#93939C", "#366B36", "#348828", "#789776"],
    ["#008000", "#292929", "#2B2B2B", "#789776", "#9E9E9C", "#2D2D2D", "#2B2B2B", "#366B36"],
    ["#348828", "#2D2D2D", "#000000", "#7D9C79", "#008000", "#000000", "#2B2B2B", "#93939C"],
    ["#348828", "#789776", "#7D9C79", "#343434", "#343434", "#599A4C", "#62A853", "#366B36"],
    ["#348828", "#366B36", "#343434", "#2A2A2A", "#2A2A2A", "#343434", "#62A853", "#008000"],
    ["#7D9C79", "#008000", "#383838", "#383838", "#383838", "#383838", "#789776", "#9E9E9C"],
    ["#789776", "#7D9C79", "#4A4A4A", "#599A4C", "#366B36", "#4A4A4A", "#93939C", "#62A853"],
    ];
  // color grid for steve
  var steve = [
    ["#231607", "#1F160A", "#1F160A", "#231607", "#2A1D0C", "#231607", "#231607", "#1F160A"],
    ["#1F160A", "#3D280E", "#231607", "#3D280E", "#1F160A", "#1F160A", "#2A1D0C", "#2A1D0C"],
    ["#3D280E", "#98765A", "#AB7E65", "#BC8E78", "#AB7E65", "#AE725F", "#BC8E78", "#2A1D0C"],
    ["#AB7E65", "#AB7E65", "#BC8E78", "#BC8E78", "#BC8E78", "#AE725F", "#98765A", "#BC8E78"],
    ["#98765A", "#FFFFFF", "#4A397D", "#BC8E78", "#98765A", "#4A397D", "#FFFFFF", "#98765A"],
    ["#BC8E78", "#BC8E78", "#AB7E65", "#6E4935", "#6E4935", "#AE725F", "#98765A", "#AE725F"],
    ["#855440", "#8C5938", "#401E0C", "#864737", "#864737", "#401E0C", "#855440", "#7F5036"],
    ["#59462E", "#59462E", "#401E0C", "#401E0C", "#401E0C", "#401E0C", "#7F5036", "#855440"],
    ];
  // initialize an empty grid
  //clearGrid();
  updateText( status, "Start" );
  // draw the "Start" and associate it with proper fallback element
  drawButton("status", "Start");
  // primary game loop. gets random grid coordinates, gets random character
  // draws the character, draws the transparent hit region, updates the text
  // value of the node.  Runs until 10 scoring options are encountered.
  function updateGrid () {
     setTimeout(function () {
     updateText( status, "Wait" );
     drawButton( "status", "Play!");
      var c = coord();
      var x = c.x;
      var y = c.y;
      if( isCreeper() ){
        who = creeper;
        whos = "creeper";
        creeperCount++;
      } else {
        who = steve;
        whos = "steve";
      }
      draw( who, x, y );
      drawHitRegion( whos, x, y );
      updateText( status, "Go" );
      setTimeout( clearGrid , 4000 ); // how long character stays on board
      if ( creeperCount < 10 ) {
         updateGrid();
      }
    }, 4000 ); // pause before game start and between each new character
  }
  // draws either creeper or steve
  function draw(who, x, y){
    xx = pixel(x) + 5;
    yy = pixel(y) + 5 + yoffset;
    for (var i = 0; i <=7; i++){
      for (var e = 0; e <=7; e++){
        var color = who[i][e];
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.rect(xx, yy, 5, 5);
        ctx.fill();
        xx = xx + 5;
      }
      xx = pixel(x) + 5;
      yy = yy + 5;
    }
  }
  // manages generic grid Hit Regions
  function drawHitRegion( who, x, y ){
    var g = cell(x,y);
    // transparent region that covers the character
    ctx.beginPath();
    ctx.fillStyle = "rgba(255,255,255,0.0)";
    ctx.rect( pixel(x), pixel(y) + yoffset, 50, 50 );
    ctx.fill();
    // make the fallback element focusable so that it receives focus with the
    // next tab press
    makeFocusable(cell(x,y));
    // add the character name to the fallback element so that screen reader
    // users can be informed what character has focus
    var addText = document.getElementById(g);
    addText.textContent = who;
    // map the Hit Region to the fallback element
    ctx.addHitRegion({id: g, control: document.getElementById(g)});
    // return focus to the reset location
    status.focus();
  }
  // clears the grid, makes all grids notfocusable,
  // returns focus to reset element, updates the score
  function clearGrid() {
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.rect( 0, 0, canvas.width, canvas.height);
    ctx.fill();
    // make all grids not focusable
    for (var f = 0; f <= 2; f++) {
      for (var n = 0; n <= 2; n++) {
        makeNotFocusable(cell(f,n));
      }
    }
    updateText( scoreText, score );
    updateText( status, "Wait" );
    drawButton( "status", "Play!");
    status.focus();
  }
  // Event Listeners
  cnv.addEventListener("keypress", function(evt){
    evt = evt || window.event;
    if ( evt.keyCode == 9 ) {
      processTab( evt );
    } else {
      processClick( evt.originalTarget.id );
    }
  });
  cnv.addEventListener("click", function(evt){
    processClick( evt.region );
  });
  // proccess TAB press
  function processTab(evt){
    var elem = document.activeElement; // get the element that has focus
    drawFocus(elem);                   // draw a focus ring around that element
  }
  // process the event
  function processClick(region){
    var e = "";
    if ( region !== null ){
      var elem = document.getElementById(region);
      // the nodeValue determines if it was a creeper or a steve
      e = elem.firstChild.nodeValue;
      drawFocus(elem);     // draw a focus ring around the element
    }
    switch (e) {
    case "Start":          // starts the game
      updateGrid();
      break;
    case "creeper":        // whac a creeper plus 10 points
      score = score + 10;
      break;
    case "steve":          // whac a steve minus 10 points
      score = score - 10;
      break;
    case "":               // whac an empty space minus 10 points
      score = score - 10;
      break;
    default:
      console.log(e);
      break;
    }
  }

// Utility Functions

  // adds a tabIndex of zero to a grid associated fallback element
  function makeFocusable(g) {
    var elem = document.getElementById(g);
    elem.tabIndex = 0;
  }
  // adds a tabIndex of -1 to a grid associated fallback so that it is
  // no longer focasable and removes any text in that node.
  function makeNotFocusable(g) {
    var elem = document.getElementById(g);
    elem.tabIndex = -1;
    elem.textContent = "";
  }
  // random function to determine character
  function isCreeper() {
    if( Math.random() >= 0.5 )
      return true;
    else
      return false;
  }
  // returns random x, y coordinates
  function coord() {
    return {
      x: Math.floor( Math.random() * 3 ),
      y: Math.floor( Math.random() * 3 )
    };
  }
  // returns the ID of the fallback element grid as string
  function cell( x, y ) {
    return "" + x + y;
  }
  // returns the pixel value of a coordinate
  function pixel(p) {
    return p * 50;
  }
  // draws focus around the element that currently has focus
  function drawFocus( elem ){
    elem.focus();
    ctx.drawFocusIfNeeded( elem );
  }
  // updates a text node given an id
  function updateText( id, text ) {
    id.textContent = text;
  }
  // returns the width of a text node
  function getTextWidth( id ) {
    text = document.getElementById( id );
    return text.width;
  }
  // draw the start button and assign a Hit Region to it
  function drawButton( id, text ) {
    ctx.beginPath();
    ctx.fillStyle = "green";
    ctx.rect( (cnv.width/2)-50, 5, 100, 30 );
    ctx.fill();
    ctx.addHitRegion({id: id, control: document.getElementById(id) });
    ctx.font = '22px Verdana';
    ctx.fillStyle = "white";
    var t = ctx.measureText( text );
    ctx.fillText( text, ( cnv.width / 2 ) - t.width / 2 , 28);
  }
});
