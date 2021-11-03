/*******************************************************************
 *
 * File....: overlay.js
 * Function: overlay with usage explenation
 * Author..: Alexander Leipnitz
 * Date....: 04.06.2020
 *
 ********************************************************************/

function overlay_on() {
  //document.getElementById("overlay").innerHTML = '<div id="text">Overlay Text</div>';
  document.getElementById("overlay").innerHTML =
    "<div class =overlay_text>" +
    "Controls: <br>" +
    "e: zoom in <br>" +
    "q: zoom out <br>" +
    "w, a, s, d: move image left up, left, down, right <br>" +
    "f: mark image as finished <br>" +
    "1, 2, 3: select detection class 1, 2 or 3<br>" +
    "r: mark image empty<br>" +
    "(click anywhere to close)" +
    "</div>";
  document.getElementById("overlay").style.display = "block";
}

function overlay_off() {
  document.getElementById("overlay").innerHTML = "";
  document.getElementById("overlay").style.display = "none";
}
