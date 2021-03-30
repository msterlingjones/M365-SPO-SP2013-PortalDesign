$('.dropdown-menu input, .dropdown-menu label').click(function(e) {
    e.stopPropagation();
});

//Equal Height JS - Trio Boxes on the Homepage
equalheight = function(container){

var currentTallest = 0,
     currentRowStart = 0,
     rowDivs = new Array(),
     $el,
     topPosition = 0;
 $(container).each(function() {

   $el = $(this);
   $($el).height('auto')
   topPostion = $el.position().top;

   if (currentRowStart != topPostion) {
     for (currentDiv = 0 ; currentDiv < rowDivs.length ; currentDiv++) {
       rowDivs[currentDiv].height(currentTallest);
     }
     rowDivs.length = 0; // empty the array
     currentRowStart = topPostion;
     currentTallest = $el.height();
     rowDivs.push($el);
   } else {
     rowDivs.push($el);
     currentTallest = (currentTallest < $el.height()) ? ($el.height()) : (currentTallest);
  }
   for (currentDiv = 0 ; currentDiv < rowDivs.length ; currentDiv++) {
     rowDivs[currentDiv].height(currentTallest);
   }
 });
}

$(window).load(function() {
  //$("#sticker").sticky({ topSpacing: 0, center:true});

  equalheight('.eh-wrap');
  equalheight('.article');
  equalheight('label.radio-top');
  equalheight('.checkbox-list > li');
});

$(window).resize(function(){
  equalheight('.eh-wrap');
  equalheight('.article');
  equalheight('label.radio-top');
  equalheight('.checkbox-list > li')
});

$(".dial-large").knob({
    'min': 0,
    'max': 100,
    'width': 225,
    'height': 225,
    'readOnly': true,
    'fgColor':"#F9B718", 
    'bgColor':"#bbbdbf",
    'thickness': .2
});
    

