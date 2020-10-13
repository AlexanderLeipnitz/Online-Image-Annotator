/*******************************************************************
 *
 * File....: box_resize.js
 * Function: resizing functionality of bboxes on the canvas
 * Author..: Alexander Leipnitz
 * Date....: 17.12.2019
 *
 ********************************************************************/

/*------------------------------------------------------------------
 * animate_rect_resizing()
 *
 * animate the resizing of a rectangle on the canvas
 *-----------------------------------------------------------------*/
function animate_rect_resizing(e, bbox_list, current_bbox) {
  var transparent_canvas = document.getElementById('tmp_canvas');
  var transparent_ctx = transparent_canvas.getContext('2d');
  var scale = scale_factor / scale_factor_orig;

  // mouse left button must be pressed
  if (e.buttons !== 1) return;

  transparent_ctx.beginPath(); // begin
  transparent_ctx.clearRect(0, 0, transparent_canvas.width, transparent_canvas.height);

  transparent_ctx.lineWidth = 5;
  transparent_ctx.lineCap = 'round';
  transparent_ctx.strokeStyle = '#c0392b';

  setPosition(e);

  if (bbox_list.length > 0) {
    var xdiff = pos.x - pos_start.x;
    var ydiff = pos.y - pos_start.y;
    var xmin = (((bbox_list[current_bbox][0] - offset_x) / scale_factor_orig)) * scale;
    var ymin = (((bbox_list[current_bbox][1] - offset_y) / scale_factor_orig)) * scale;
    var xmax = (((bbox_list[current_bbox][2] - offset_x) / scale_factor_orig)) * scale;
    var ymax = (((bbox_list[current_bbox][3] - offset_y) / scale_factor_orig)) * scale;
    var xmin_new = xmin;
    var ymin_new = ymin;
    var xmax_new = xmax;
    var ymax_new = ymax;

    if (mouse_on_line == 0) {
      //Only top line
      //console.log( 'Moving Top');
      ymin_new = ymin + ydiff;
    }

    if (mouse_on_line == 1) {
      //Only botton line
      //console.log( 'Moving Bottom');
      ymax_new = ymax + ydiff;
    }

    if (mouse_on_line == 2) {
      //Only left line
      //console.log( 'Moving Left');
      xmin_new = xmin + xdiff;
    }

    if (mouse_on_line == 3) {
      //Only right line
      //console.log( 'Moving Right');
      xmax_new = xmax + xdiff;
    }

    if (mouse_on_line == 4) {
      //Right top corner
      //console.log( 'Moving Top-Right');
      xmax_new = xmax + xdiff;
      ymin_new = ymin + ydiff;
    }

    if (mouse_on_line == 5) {
      //Right bottom corner
      //console.log( 'Moving Bottom-Right');
      xmax_new = xmax + xdiff;
      ymax_new = ymax + ydiff;
    }

    if (mouse_on_line == 6) {
      //Left top corner
      //console.log( 'Moving Top-Left');
      xmin_new = xmin + xdiff;
      ymin_new = ymin + ydiff;
    }

    if (mouse_on_line == 7) {
      //Left bottom corner
      //console.log( 'Moving Bottom-Left');
      xmin_new = xmin + xdiff;
      ymax_new = ymax + ydiff;
    }

    var width_new = xmax_new - xmin_new;
    var height_new = ymax_new - ymin_new;
    transparent_ctx.rect(xmin_new, ymin_new, width_new, height_new);
    transparent_ctx.stroke(); // draw it!
    transparent_ctx.closePath();
    //console.log( 'xmin: ' + xmin);
    //console.log( 'xmin_new: ' + xmin_new);

    modified_bbox.xmin = xmin_new / scale * scale_factor_orig + offset_x;
    modified_bbox.ymin = ymin_new / scale * scale_factor_orig + offset_y;
    modified_bbox.xmax = xmax_new / scale * scale_factor_orig + offset_x;
    modified_bbox.ymax = ymax_new / scale * scale_factor_orig + offset_y;
  }
}

/*------------------------------------------------------------------
 * finalize_resized_rect()
 *
 * edit the finished resized bbox
 *-----------------------------------------------------------------*/
function finalize_resized_rect(e, bbox_list, current_bbox) {
  var transparent_canvas = document.getElementById('tmp_canvas');
  var transparent_ctx = transparent_canvas.getContext('2d');
  //transparent_canvas.style.cursor = 'default';
  transparent_ctx.beginPath(); // begin
  transparent_ctx.clearRect(0, 0, transparent_canvas.width, transparent_canvas.height);
  transparent_ctx.stroke(); // draw it!
  transparent_ctx.closePath();

  bbox_list[current_bbox][0] = modified_bbox.xmin;
  bbox_list[current_bbox][1] = modified_bbox.ymin;
  bbox_list[current_bbox][2] = modified_bbox.xmax;
  bbox_list[current_bbox][3] = modified_bbox.ymax;

  reset_Canvas();
  //draw_Image(current_img);
  draw_Annotation(bbox_list, polygon_list);
  pos_start.x = -1;
  pos_start.y = -1;
  pos.x = -1;
  pos.y = -1;

}