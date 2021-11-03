/*******************************************************************
 *
 * File....: helper_functions.js
 * Function: additional functions
 * Author..: Alexander Leipnitz
 * Date....: 28.11.2019
 *
 ********************************************************************/

/*------------------------------------------------------------------
 * setPosition()
 *
 * new position from mouse event
 *-----------------------------------------------------------------*/
function setPosition(e) {
  var main_canvas = document.getElementById("img_canvas");
  //var main_ctx = main_canvas.getContext('2d');
  //pos.x = e.clientX - main_ctx.canvas.offsetLeft;
  //pos.y = e.clientY - main_ctx.canvas.offsetTop;
  var rect = main_canvas.getBoundingClientRect();
  pos.x = e.clientX - rect.left;
  pos.y = e.clientY - rect.top;
  if (pos.x < 0) pos.x = 0;
  if (pos.x >= main_canvas.width) pos.x = main_canvas.width - 1;
  if (pos.y < 0) pos.y = 0;
  if (pos.y >= main_canvas.height) pos.y = main_canvas.height - 1;
  //console.log(pos.y);
}

/*------------------------------------------------------------------
 * setPosition_start()
 *
 * start position from mouse event
 *-----------------------------------------------------------------*/
function setPosition_start(e) {
  var main_canvas = document.getElementById("img_canvas");
  //var main_ctx = main_canvas.getContext('2d');
  var rect = main_canvas.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;
  if (x >= 0 && y >= 0 && x < main_canvas.width && y < main_canvas.height) {
    //main_canvas.style.cursor= 'default';
    pos_start.x = x;
    pos_start.y = y;
    return true;
  } else {
    return false;
  }
}

/*------------------------------------------------------------------
 * mouse_inside_bbox()
 *
 * check if mouse is inside bounding box
 *-----------------------------------------------------------------*/
function mouse_inside_bbox(e, margin, tool_mode) {
  var transparent_canvas = document.getElementById("tmp_canvas");
  //var transparent_ctx = transparent_canvas.getContext('2d');
  var rect = transparent_canvas.getBoundingClientRect();
  var x = e.clientX - rect.left;
  var y = e.clientY - rect.top;

  for (var i = 0; i < bbox_list.length; i++) {
    var object = bbox_list[i];

    //var xmin = Number(object[0]) / scale_factor;
    //var ymin = Number(object[1]) / scale_factor;
    //var xmax = Number(object[2]) / scale_factor;
    //var ymax = Number(object[3]) / scale_factor;
    var scale = scale_factor / scale_factor_orig;
    var xmin = ((Number(object[0]) - offset_x) / scale_factor_orig) * scale;
    var ymin = ((Number(object[1]) - offset_y) / scale_factor_orig) * scale;
    var xmax = ((Number(object[2]) - offset_x) / scale_factor_orig) * scale;
    var ymax = ((Number(object[3]) - offset_y) / scale_factor_orig) * scale;
    if (
      x >= xmin + margin &&
      x <= xmax - margin &&
      y >= ymin + margin &&
      y <= ymax - margin
    ) {
      current_bbox = i;
      //if (tool_mode == 'modifier')
      if (tool_mode == "pencil") {
        transparent_canvas.style.cursor = "move";
      } else {
        transparent_canvas.style.cursor = "url(img/delete.png), auto";
      }

      return i;
    }
  }
  return -1;
}

/*------------------------------------------------------------------
 * check_mouse_on_line()
 *
 * check if mouse is inside bounding box
 *-----------------------------------------------------------------*/
function check_mouse_on_line(e) {
  var transparent_canvas = document.getElementById("tmp_canvas");
  //var transparent_ctx = transparent_canvas.getContext('2d');
  var rect = transparent_canvas.getBoundingClientRect();
  var x = e.clientX - rect.left;
  var y = e.clientY - rect.top;

  var top = false;
  var bottom = false;
  var left = false;
  var right = false;
  var margin = 8;

  var mouse_on_line = -1;

  //var bbox = -1;

  for (var i = 0; i < bbox_list.length; i++) {
    var object = bbox_list[i];

    //var xmin = Number(object[0]) / scale_factor;
    //var ymin = Number(object[1]) / scale_factor;
    //var xmax = Number(object[2]) / scale_factor;
    //var ymax = Number(object[3]) / scale_factor;
    var scale = scale_factor / scale_factor_orig;
    var xmin = ((Number(object[0]) - offset_x) / scale_factor_orig) * scale;
    var ymin = ((Number(object[1]) - offset_y) / scale_factor_orig) * scale;
    var xmax = ((Number(object[2]) - offset_x) / scale_factor_orig) * scale;
    var ymax = ((Number(object[3]) - offset_y) / scale_factor_orig) * scale;
    if (
      x >= xmin - margin &&
      x <= xmax + margin &&
      y >= ymin - margin &&
      y <= ymin + margin
    ) {
      //top
      current_bbox = i;
      top = true;
    }
    if (
      x >= xmin - margin &&
      x <= xmin + margin &&
      y >= ymin - margin &&
      y <= ymax + margin
    ) {
      //left
      current_bbox = i;
      left = true;
    }
    if (
      x >= xmax - margin &&
      x <= xmax + margin &&
      y >= ymin - margin &&
      y <= ymax + margin
    ) {
      //right
      current_bbox = i;
      right = true;
    }
    if (
      x >= xmin - margin &&
      x <= xmax + margin &&
      y >= ymax - margin &&
      y <= ymax + margin
    ) {
      //bottom
      current_bbox = i;
      bottom = true;
    }

    if (top && !left && !right) {
      //mouse on top line
      mouse_on_line = 0;
      transparent_canvas.style.cursor = "n-resize";
    }
    if (bottom && !left && !right) {
      //mouse on bottom
      mouse_on_line = 1;
      transparent_canvas.style.cursor = "s-resize";
    }
    if (left && !top && !bottom) {
      //mouse on the left side
      mouse_on_line = 2;
      transparent_canvas.style.cursor = "w-resize";
    }
    if (right && !top && !bottom) {
      //right
      mouse_on_line = 3;
      transparent_canvas.style.cursor = "e-resize";
    }
    if (right && top) {
      //right-top corner
      mouse_on_line = 4;
      transparent_canvas.style.cursor = "ne-resize";
    }
    if (right && bottom) {
      //right-bottom corner
      mouse_on_line = 5;
      transparent_canvas.style.cursor = "se-resize";
    }
    if (left && top) {
      mouse_on_line = 6;
      transparent_canvas.style.cursor = "nw-resize";
    }
    if (left && bottom) {
      mouse_on_line = 7;
      transparent_canvas.style.cursor = "sw-resize";
    }
    if (mouse_on_line >= 0) {
      break;
    }
  }
  //transparent_ctx.stroke(); // draw it!
  //transparent_ctx.closePath();
  return [mouse_on_line, current_bbox];
}

/*------------------------------------------------------------------
 * checkKey()
 *
 * process keyboard input
 *-----------------------------------------------------------------*/
function checkKey(e) {
  e = e || window.event;
  if (e.keyCode == 70) {
    //key: f
    if (document.getElementById("progress").checked) {
      document.getElementById("progress").checked = false;
    } else {
      document.getElementById("progress").checked = true;
    }
  } else if (e.keyCode == 82) {
    //key: r
    if (document.getElementById("empty_image").checked) {
      document.getElementById("empty_image").checked = false;
    } else {
      document.getElementById("empty_image").checked = true;
    }
  } else if (e.keyCode == 69) {
    //key: e
    zoom_img(2);
  } else if (e.keyCode == 81) {
    //key: q
    zoom_img(-2);
  } else if (
    e.keyCode >= 49 &&
    e.keyCode <= 51 &&
    annotation_type == "detection"
  ) {
    //key: 1 to 3
    switch_detection_class(detection_classes[e.keyCode - 49][0]);
  } else {
    //key: w a s d
    move_img(e.keyCode);
  }
}
