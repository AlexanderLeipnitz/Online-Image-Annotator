/*******************************************************************
 *
 * File....: polygon_draw.js
 * Function: drawing functionality for polygons
 * Author..: Alexander Leipnitz
 * Date....: 10.03.2020
 *
 ********************************************************************/

/*------------------------------------------------------------------
 * animate_polygon_drawing()
 *
 * animate the drawing of a new rectangle on the canvas
 *-----------------------------------------------------------------*/
function animate_polygon_drawing(polygon) {
  var transparent_canvas = document.getElementById('tmp_canvas');
  var transparent_ctx = transparent_canvas.getContext('2d');

  // mouse left button must be pressed
  //if (e.buttons !== 1) return;

  transparent_ctx.beginPath(); // begin
  transparent_ctx.clearRect(0, 0, transparent_canvas.width, transparent_canvas.height);
  transparent_ctx.stroke(); // draw it!
  transparent_ctx.closePath();

  transparent_ctx.lineCap = 'round';

  for (var k = 0; k < 2; k++) {
    if (k == 0) {
      transparent_ctx.lineWidth = 5;
      let rgbC = segmentation_classes[current_class_id][1].match(/\d+/g);
      //console.log(rgbC); 
      let brightness = Number(rgbC[0]) + Number(rgbC[1]) + Number(rgbC[2]);
      if (brightness > 384) {
        transparent_ctx.strokeStyle = "rgb( 0, 0, 0)";
      } else {
        transparent_ctx.strokeStyle = "rgb( 255, 255, 255)";
      }
    } else {
      transparent_ctx.lineWidth = 3;
      //select object related colour
      transparent_ctx.strokeStyle = segmentation_classes[current_class_id][1];
    }

    //console.log(coord_list);
    //console.log(mode);
    //console.log(polygon);
    var scale = scale_factor / scale_factor_orig;

    for (var i = 1; i < polygon.x_coords.length; i++) {
      transparent_ctx.beginPath(); // begin
      var scale = scale_factor / scale_factor_orig;
      let x_start = (((polygon.x_coords[i - 1] - offset_x) / scale_factor_orig)) * scale;
      let y_start = (((polygon.y_coords[i - 1] - offset_y) / scale_factor_orig)) * scale;
      let x_end = (((polygon.x_coords[i] - offset_x) / scale_factor_orig)) * scale;
      let y_end = (((polygon.y_coords[i] - offset_y) / scale_factor_orig)) * scale;
      console.log(x_start);
      //let x_start = polygon.x_coords[i-1]/scale + offset_x;
      //let y_start = polygon.y_coords[i-1]/scale + offset_y;
      //let x_end = polygon.x_coords[i]/scale + offset_x;
      //let y_end = polygon.y_coords[i]/scale + offset_y;
      transparent_ctx.moveTo(x_start, y_start);
      transparent_ctx.lineTo(x_end, y_end);
      transparent_ctx.stroke(); // draw it!
      transparent_ctx.closePath();
    }
  }

  transparent_ctx.beginPath(); // begin

  var end = { x: pos.x, y: pos.y };
  transparent_ctx.strokeStyle = '#c0392b';
  if (polygon.x_coords.length > 2) {
    var x_start = (((polygon.x_coords[0] - offset_x) / scale_factor_orig)) * scale;
    var y_start = (((polygon.y_coords[0] - offset_y) / scale_factor_orig)) * scale;
    var dist = Math.pow(pos.x - x_start, 2) + Math.pow(pos.y - y_start, 2);
    //console.log(dist);
    if (dist < 3000) {
      transparent_ctx.arc(x_start, y_start, 7, 0, 2 * Math.PI);
    }
    if (dist <= 49) {
      end.x = x_start;
      end.y = y_start;
      mode = 'polygon_finish';
    } else {
      mode = 'poly_point_done';
    }
  }
  console.log(end.x);
  let x_prev = (((polygon.x_coords[polygon.x_coords.length - 1] - offset_x) / scale_factor_orig)) * scale;
  let y_prev = (((polygon.y_coords[polygon.y_coords.length - 1] - offset_y) / scale_factor_orig)) * scale;
  transparent_ctx.moveTo(x_prev, y_prev);
  transparent_ctx.lineTo(end.x, end.y);
  transparent_ctx.stroke(); // draw it!
  transparent_ctx.closePath()
}

/*------------------------------------------------------------------
 * finalized_drawn_rect()
 *
 * add the finished drawn bounding box to the global list
 *-----------------------------------------------------------------*/
function finalized_drawn_polygon(e) {
  var transparent_canvas = document.getElementById('tmp_canvas');
  var transparent_ctx = transparent_canvas.getContext('2d');

  // mouse left button must be pressed
  //if (e.buttons !== 1) return;

  transparent_ctx.beginPath(); // begin
  transparent_ctx.clearRect(0, 0, transparent_canvas.width, transparent_canvas.height);
  transparent_ctx.stroke(); // draw it!
  transparent_ctx.closePath();

  polygon.class = segmentation_classes[current_class_id][0];
  //let scale = scale_factor/scale_factor_orig;
  //for (var j = 0; j < polygon.x_coords.length; j++)
  //{
  //polygon.x_coords[j] = polygon.x_coords[j]/scale * scale_factor_orig + offset_x;
  //polygon.y_coords[j] = polygon.y_coords[j]/scale * scale_factor_orig + offset_y;
  //}

  polygon_list.push(polygon);
  draw_Annotation(bbox_list, polygon_list);
  //pos_start.x = -1;
  //pos_start.y = -1;
  //pos.x = -1;
  //pos.y = -1;
  polygon = { x_coords: [], y_coords: [], class: "" };
}