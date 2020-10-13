/*******************************************************************
 *
 * File....: polygon_resize.js
 * Function: resizing functionality for polygons
 * Author..: Alexander Leipnitz
 * Date....: 11.03.2020
 *
 ********************************************************************/

/*------------------------------------------------------------------
 * check_mouse_poly_distance()
 *
 * check if mouse is inside bounding box
 *-----------------------------------------------------------------*/

function check_mouse_poly_distance(e, tool_mode) {
  var transparent_canvas = document.getElementById('tmp_canvas');
  var transparent_ctx = transparent_canvas.getContext('2d');
  var scale = scale_factor / scale_factor_orig;

  transparent_ctx.beginPath(); // begin
  transparent_ctx.clearRect(0, 0, transparent_canvas.width, transparent_canvas.height);
  transparent_ctx.stroke(); // draw it!
  transparent_ctx.closePath();

  polygon_idx = -1;
  point_idx = -1;
  circle_radius = 7;
  var min_dist_highlight = 1000; //minimal distance to highlight the point
  var min_dist_inside;
  if (tool_mode == 'pencil') {
    min_dist_inside = circle_radius * circle_radius + 10; //criteria for being inside a point
  } else {
    min_dist_inside = min_dist_highlight;
  }

  var highlight = false;
  var inside = false;
  //loop over all polygons
  for (var i = 0; i < polygon_list.length; i++) {
    var current_polygon = polygon_list[i];

    for (var j = 0; j < current_polygon.x_coords.length; j++) {
      let x = (((Number(current_polygon.x_coords[j]) - offset_x) / scale_factor_orig)) * scale;
      let y = (((Number(current_polygon.y_coords[j]) - offset_y) / scale_factor_orig)) * scale;
      let dist = Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2);
      if (dist < min_dist_inside) {
        min_dist_inside = dist;
        highlight = true;
        inside = true;
        polygon_idx = i;
        point_idx = j;
        //break;
      }
      if (dist < min_dist_highlight) {
        min_dist_highlight = dist;
        highlight = true;
        polygon_idx = i;
        point_idx = j;
        //break;
      }
    }
  }

  if (highlight && polygon_idx > -1 && point_idx > -1) {
    if (inside) {
      transparent_ctx.lineWidth = circle_radius * 2;
    } else {
      transparent_ctx.lineWidth = 4;
    }
    transparent_ctx.strokeStyle = '#c0392b';
    if (tool_mode == 'pencil') {
      var start_idx = point_idx;
      var end_idx = point_idx;
    } else {
      transparent_canvas.style.cursor = 'url(img/delete.png), auto';
      var start_idx = 0;
      var end_idx = polygon_list[polygon_idx].x_coords.length - 1;
    }
    for (var idx = start_idx; idx <= end_idx; idx++) {
      let x = (((polygon_list[polygon_idx].x_coords[idx] - offset_x) / scale_factor_orig)) * scale;
      let y = (((polygon_list[polygon_idx].y_coords[idx] - offset_y) / scale_factor_orig)) * scale;
      transparent_ctx.beginPath(); // begin
      transparent_ctx.arc(x, y, circle_radius, 0, 2 * Math.PI); //draw the circle at the polygon-point
      transparent_ctx.stroke(); // draw it!
      transparent_ctx.closePath();
    }
  }

  if (inside) {
    current_point_idx = point_idx;
    current_polygon_idx = polygon_idx;
    return [polygon_idx, point_idx];
  } else {
    current_point_idx = -1;
    current_polygon_idx = -1;
    return [-1, -1];
  }

}


/*------------------------------------------------------------------
 * animate_polygon_resizing()
 *
 * animate the resizing of a polygon on the canvas
 *-----------------------------------------------------------------*/
function animate_polgon_resizing(e, point_idx) {
  var transparent_canvas = document.getElementById('tmp_canvas');
  var transparent_ctx = transparent_canvas.getContext('2d');
  var scale = scale_factor / scale_factor_orig;

  // mouse left button must be pressed
  if (e.buttons !== 1) return;

  transparent_ctx.beginPath(); // begin
  transparent_ctx.clearRect(0, 0, transparent_canvas.width, transparent_canvas.height);
  transparent_ctx.stroke(); // draw it!
  transparent_ctx.closePath();

  transparent_ctx.lineWidth = 5;
  transparent_ctx.lineCap = 'round';
  transparent_ctx.strokeStyle = '#c0392b';

  setPosition(e);

  var xdiff = pos.x - pos_start.x;
  var ydiff = pos.y - pos_start.y;
  //var old_x = (((Number(modified_polygon.x_coords[point_idx]) - offset_x) / scale_factor_orig) * scale);
  //var old_y = (((Number(modified_polygon.y_coords[point_idx]) - offset_y) / scale_factor_orig) * scale);
  var old_x = pos_start.x;
  var old_y = pos_start.y;
  var new_x = old_x + xdiff;
  var new_y = old_y + ydiff;

  for (var j = 0; j < modified_polygon.x_coords.length; j++) {
    var x_start, y_start, x_end, y_end;
    //console.log(point_idx)
    if (j == point_idx) {
      x_start = new_x;
      y_start = new_y;
    } else {
      x_start = (((Number(modified_polygon.x_coords[j]) - offset_x) / scale_factor_orig)) * scale;
      y_start = (((Number(modified_polygon.y_coords[j]) - offset_y) / scale_factor_orig)) * scale;
    }

    if (j == 0 && point_idx == 0) {
      x_end = (((Number(modified_polygon.x_coords[modified_polygon.x_coords.length - 1]) - offset_x) / scale_factor_orig)) * scale;
      y_end = (((Number(modified_polygon.y_coords[modified_polygon.x_coords.length - 1]) - offset_y) / scale_factor_orig)) * scale;
    } else if ((j == 1 && point_idx == 0) || j + 1 == point_idx) {
      x_end = new_x;
      y_end = new_y;
    } else if ((j + 1) >= modified_polygon.x_coords.length && point_idx != 0) {
      x_end = (((Number(modified_polygon.x_coords[0]) - offset_x) / scale_factor_orig)) * scale;
      y_end = (((Number(modified_polygon.y_coords[0]) - offset_y) / scale_factor_orig)) * scale;
    } else {
      x_end = (((Number(modified_polygon.x_coords[j + 1]) - offset_x) / scale_factor_orig)) * scale;
      y_end = (((Number(modified_polygon.y_coords[j + 1]) - offset_y) / scale_factor_orig)) * scale;
    }

    transparent_ctx.beginPath(); // begin
    transparent_ctx.moveTo(x_start, y_start);
    transparent_ctx.lineTo(x_end, y_end);
    transparent_ctx.stroke(); // draw it!
    transparent_ctx.closePath();
  }
}

/*------------------------------------------------------------------
 * finalize_resized_polygon()
 *
 * finalize the resizing of a polygon on the canvas
 *-----------------------------------------------------------------*/
function finalize_resized_polygon(e, current_point_idx) {
  var transparent_canvas = document.getElementById('tmp_canvas');
  var transparent_ctx = transparent_canvas.getContext('2d');
  var scale = scale_factor / scale_factor_orig;
  //transparent_canvas.style.cursor = 'default';
  transparent_ctx.beginPath(); // begin
  transparent_ctx.clearRect(0, 0, transparent_canvas.width, transparent_canvas.height);
  transparent_ctx.stroke(); // draw it!
  transparent_ctx.closePath();

  polygon_list[current_polygon_idx].x_coords[current_point_idx] = pos.x / scale * scale_factor_orig + offset_x;
  polygon_list[current_polygon_idx].y_coords[current_point_idx] = pos.y / scale * scale_factor_orig + offset_y;

  reset_Canvas();
  //draw_Image(current_img);
  draw_Annotation(bbox_list, polygon_list);
  modified_bbox = { xmin: -1, ymin: -1, xmax: -1, ymax: -1 }
  current_point_idx = -1;
  pos_start.x = -1;
  pos_start.y = -1;
  pos.x = -1;
  pos.y = -1;

}