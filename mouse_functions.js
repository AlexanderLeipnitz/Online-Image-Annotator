/*******************************************************************
 *
 * File....: mouse_functions.js
 * Function: Handle mouse interactions
 * Author..: Alexander Leipnitz
 * Date....: 09.03.2020
 *
 ********************************************************************/

/*------------------------------------------------------------------
 * mouse_up()
 *
 * process mouse event in relation to current program mode
 *-----------------------------------------------------------------*/
function mouse_up(e) {
  setPosition(e);
  if (annotation_type == "detection") {
    if (mode == 'drawing') {
      finalized_drawn_rect(e);
    } else if (mode == 'moving') {
      finalize_moved_rect(e, bbox_list, current_bbox);
    } else if (mode == 'resizing') {
      finalize_resized_rect(e, bbox_list, current_bbox);
    }
    tool_mode = 'pencil';
    mode = 'idle';
  } else if (annotation_type == "segmentation") {
    if (mode == 'poly_point') {
      let scale = scale_factor / scale_factor_orig;
      polygon.x_coords.push(pos.x / scale * scale_factor_orig + offset_x);
      polygon.y_coords.push(pos.y / scale * scale_factor_orig + offset_y);
      mode = 'poly_point_done';
    } else if (mode == 'polygon_resizing') {
      finalize_resized_polygon(e, current_point_idx);
      mode = '';
    }
  }
}

/*------------------------------------------------------------------
 * mouse_move()
 *
 * process mouse event in relation to current program mode
 *-----------------------------------------------------------------*/
function mouse_move(e) {
  //console.log( mode);
  var transparent_canvas = document.getElementById('tmp_canvas');
  //var transparent_ctx = transparent_canvas.getContext('2d');
  transparent_canvas.style.cursor = 'default';
  if (annotation_type == "detection") {
    if (mode == 'drawing') {
      animate_rect_drawing(e);
    } else if (mode == 'moving') {
      animate_rect_moving(e, bbox_list, current_bbox);
    } else if (mode == 'resizing') {
      animate_rect_resizing(e, bbox_list, current_bbox);
    } else if (tool_mode == 'pencil') {
      var bbox_resize = check_mouse_on_line(e);
      var bbox_move = mouse_inside_bbox(e, 8, tool_mode);
    } else if (tool_mode == 'eraser') {
      var bbox_move = mouse_inside_bbox(e, 0, tool_mode)
    }
  } else {
    if (mode == 'poly_point_done' || mode == 'polygon_finish') {
      setPosition(e);
      //console.log(pos);
      animate_polygon_drawing(polygon);
    } else if (mode == 'polygon_resizing') {
      animate_polgon_resizing(e, current_point_idx)
    } else if (tool_mode == 'pencil' && mode != 'poly_point') {
      setPosition(e);
      var point_resize = check_mouse_poly_distance(e, tool_mode);
    } else if (tool_mode == 'eraser') {
      setPosition(e);
      var polygon_move = check_mouse_poly_distance(e, tool_mode);
      //var polygon_move = mouse_inside_polygon(e, tool_mode);
      //console.log(polygon_move);
    }
  }
}

/*------------------------------------------------------------------
 * mouse_out()
 *
 * process mouse event when leaving the canvas
 *-----------------------------------------------------------------*/
function mouse_out(e) {
  var main_canvas = document.getElementById('img_canvas');
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
  //console.log(pos.x);
  //console.log(pos.y);
  //console.log("Out of Bounds");
}

/*------------------------------------------------------------------
 * mouse_down()
 *
 * process mouse event in relation to current program mode
 *-----------------------------------------------------------------*/
function mouse_down(e) {
  //console.log(e.target.id);
  //if not pressed on button, these events are handled seperatly
  if (e.target.id == "" || e.target.id == "tmp_canvas" || e.target.id == "page" || e.target.id == "menu" || e.target.id == "segmentation" || e.target.id == "detection") {
    if (annotation_type == "detection") {
      if (tool_mode == 'pencil') {
        current_bbox = -1;
        var bbox_move = mouse_inside_bbox(e, 8, tool_mode);
        var bbox_resize = check_mouse_on_line(e);
        if (setPosition_start(e) == true) {
          if (bbox_move > -1) {
            mode = "moving";
          } else if (bbox_resize[1] > -1) {
            mode = 'resizing';
          } else {
            mode = 'drawing';
          }
          //console.log(mode);
        }
      } else if (tool_mode == 'eraser') //erase existing box
      {
        var bbox = mouse_inside_bbox(e, 0, tool_mode);
        if (bbox > -1) {
          //bbox_list.splice(bbox, 1);
          bbox_list = bbox_list.filter(function(item) {
            return item !== bbox_list[bbox]
          })
          reset_Canvas();
          draw_Image(current_img, offset_x, offset_y);
          draw_Annotation(bbox_list, polygon_list);
          polygon = { x_coords: [], y_coords: [], class: "" };
        }
      }
    } else if (annotation_type == "segmentation") {
      if (tool_mode == 'pencil') {
        if (mode == 'polygon_finish') {
          finalized_drawn_polygon(e);
          mode = '';
        } else if (current_polygon_idx > -1 && current_point_idx > -1 && setPosition_start(e) == true) {
          //console.log(mode);
          modified_polygon = polygon_list[current_polygon_idx];
          mode = 'polygon_resizing';
        } else if (mode == 'poly_point_done' || setPosition_start(e) == true) {
          //console.log("mouse_down");
          mode = 'poly_point';
        }
      } else if (tool_mode == 'eraser') {
        //var polygon_idx = mouse_inside_polygon(e, tool_mode);
        var polygon_delete = check_mouse_poly_distance(e, tool_mode);
        console.log(polygon_delete);
        if (polygon_delete[0] > -1) {
          var transparent_canvas = document.getElementById('tmp_canvas');
          var transparent_ctx = transparent_canvas.getContext('2d');

          transparent_ctx.beginPath(); // begin
          transparent_ctx.clearRect(0, 0, transparent_canvas.width, transparent_canvas.height);
          transparent_ctx.stroke(); // draw it!
          transparent_ctx.closePath();
          //bbox_list.splice(bbox, 1);
          polygon_list = polygon_list.filter(function(item) {
            return item !== polygon_list[polygon_delete[0]]
          })
          reset_Canvas();
          draw_Image(current_img, offset_x, offset_y);
          draw_Annotation(bbox_list, polygon_list);
          polygon = { x_coords: [], y_coords: [], class: "" };
        }
      }
    }
  } else if (e.target.id != "zoom_in" && e.target.id != "zoom_out") {
    mode = '';
    var transparent_canvas = document.getElementById('tmp_canvas');
    var transparent_ctx = transparent_canvas.getContext('2d');

    // mouse left button must be pressed
    //if (e.buttons !== 1) return;

    transparent_ctx.beginPath(); // begin
    transparent_ctx.clearRect(0, 0, transparent_canvas.width, transparent_canvas.height);
    transparent_ctx.stroke(); // draw it!
    transparent_ctx.closePath();
  }
}