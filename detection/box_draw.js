/*******************************************************************
 *
 * File....: box_draw.js
 * Function: drawing functionality for boxes
 * Author..: Alexander Leipnitz
 * Date....: 10.03.2020
 *
 ********************************************************************/

/*------------------------------------------------------------------
 * finalized_drawn_rect()
 *
 * add the finished drawn bounding box to the global list
 *-----------------------------------------------------------------*/
function finalized_drawn_rect(e) {
  var transparent_canvas = document.getElementById("tmp_canvas");
  var transparent_ctx = transparent_canvas.getContext("2d");
  //transparent_canvas.style.cursor = 'default';
  transparent_ctx.beginPath(); // begin
  transparent_ctx.clearRect(
    0,
    0,
    transparent_canvas.width,
    transparent_canvas.height
  );
  transparent_ctx.stroke(); // draw it!
  transparent_ctx.closePath();

  //setPosition(e);

  //reset_Canvas();
  //draw_Image(current_img);
  //if (pos_start.x >= 0 && pos_start.y >= 0 && pos_start.x < transparent_canvas.width && pos_start.y < transparent_canvas.height
  //   && pos_start.x != pos.x && pos_start.y != pos.y)
  if (pos_start.x != pos.x && pos_start.y != pos.y) {
    //Account for lineWidth 4 and use inner border of boundingRect
    let scale = scale_factor / scale_factor_orig;
    var right_offset = 1;
    var bottom_offset = 1;
    var left_offset = 1;
    var top_offset = 1;
    if (pos_start.x == transparent_canvas.width - 1) {
      right_offset = 0;
    }
    if (pos_start.y == transparent_canvas.height - 1) {
      bottom_offset = 0;
    }
    if (pos.x == 0) {
      left_offset = 0;
    }
    if (pos.y == 0) {
      top_offset = 0;
    }
    let xmin =
      ((pos_start.x + right_offset) / scale) * scale_factor_orig + offset_x;
    let ymin =
      ((pos_start.y + bottom_offset) / scale) * scale_factor_orig + offset_y;
    let xmax = ((pos.x - left_offset) / scale) * scale_factor_orig + offset_x;
    let ymax = ((pos.y - top_offset) / scale) * scale_factor_orig + offset_y;
    if (xmin > xmax) {
      [xmin, xmax] = [xmax, xmin];
    }
    if (ymin > ymax) {
      [ymin, ymax] = [ymax, ymin];
    }
    if (
      !bbox_list.includes([
        xmin,
        ymin,
        xmax,
        ymax,
        detection_classes[current_class_id][0],
      ])
    ) {
      bbox_list.push([
        xmin,
        ymin,
        xmax,
        ymax,
        detection_classes[current_class_id][0],
      ]);
    }

    draw_Annotation(bbox_list, polygon_list);
    pos_start.x = -1;
    pos_start.y = -1;
    pos.x = -1;
    pos.y = -1;
  }
}

/*------------------------------------------------------------------
 * animate_rect_drawing()
 *
 * animate the drawing of a new rectangle on the canvas
 *-----------------------------------------------------------------*/
function animate_rect_drawing(e) {
  var transparent_canvas = document.getElementById("tmp_canvas");
  var transparent_ctx = transparent_canvas.getContext("2d");

  // mouse left button must be pressed
  if (e.buttons !== 1) return;

  transparent_ctx.beginPath(); // begin
  transparent_ctx.clearRect(
    0,
    0,
    transparent_canvas.width,
    transparent_canvas.height
  );

  transparent_ctx.lineWidth = 5;
  transparent_ctx.lineCap = "round";
  transparent_ctx.strokeStyle = "#c0392b";

  setPosition(e);
  transparent_ctx.rect(
    pos_start.x,
    pos_start.y,
    pos.x - pos_start.x,
    pos.y - pos_start.y
  );
  transparent_ctx.stroke(); // draw it!
  transparent_ctx.closePath();
}
