/*******************************************************************
 *
 * File....: drawing.js
 * Function: drawing functionality on the canvas
 * Author..: Alexander Leipnitz
 * Date....: 28.11.2019
 *
 ********************************************************************/

var tool_mode = "pencil";
var mode = "idle";

/*------------------------------------------------------------------
 * draw_Annotation()
 *
 * draw the current annotation-list on the main canvas
 *-----------------------------------------------------------------*/
function draw_Annotation(bboxes, polygons) {
  var main_canvas = document.getElementById("box_canvas");
  var main_ctx = main_canvas.getContext("2d");

  if (annotation_type == "detection") {
    var nums = Array(detection_classes.length).fill(0);
    //loop over all boxes
    for (var i = 0; i < bboxes.length; i++) {
      main_ctx.beginPath();
      var box = bboxes[i];
      var scale = scale_factor / scale_factor_orig;
      var xmin = ((Number(box[0]) - offset_x) / scale_factor_orig) * scale;
      var ymin = ((Number(box[1]) - offset_y) / scale_factor_orig) * scale;
      var xmax = ((Number(box[2]) - offset_x) / scale_factor_orig) * scale;
      var ymax = ((Number(box[3]) - offset_y) / scale_factor_orig) * scale;
      var width = xmax - xmin;
      var height = ymax - ymin;

      main_ctx.lineWidth = 4;
      //select object related colour
      for (var j = 0; j < detection_classes.length; j++) {
        if (box[4] == detection_classes[j][0]) {
          nums[j]++;
          main_ctx.strokeStyle = detection_classes[j][1];
          break;
        }
      }
      //if (xmin >= 0 && ymin >= 0 && width < main_canvas.width && height < main_canvas.height)
      //{
      main_ctx.rect(xmin, ymin, width, height); //draw the rectangle
      main_ctx.stroke(); //show it
      main_ctx.closePath();
      //}
    }
    for (var i = 0; i < detection_classes.length; i++) {
      document.getElementById(
        "".concat(detection_classes[i][0], "_num")
      ).innerHTML = nums[i];
    }
  } else if (annotation_type == "segmentation") {
    var nums = Array(segmentation_classes.length).fill(0);
    var scale = scale_factor / scale_factor_orig;
    //loop over all polygons
    for (var i = 0; i < polygons.length; i++) {
      main_ctx.beginPath();
      var current_polygon = polygons[i];
      //console.log(polygon);
      main_ctx.lineCap = "round";
      for (var k = 0; k < 2; k++) {
        if (k == 0) {
          main_ctx.lineWidth = 5;
          for (var j = 0; j < segmentation_classes.length; j++) {
            if (current_polygon.class == segmentation_classes[j][0]) {
              let rgbC = segmentation_classes[j][1].match(/\d+/g);
              //console.log(rgbC);
              let brightness =
                Number(rgbC[0]) + Number(rgbC[1]) + Number(rgbC[2]);
              if (brightness > 384) {
                main_ctx.strokeStyle = "rgb( 0, 0, 0)";
              } else {
                main_ctx.strokeStyle = "rgb( 255, 255, 255)";
              }
              break;
            }
          }
          //main_ctx.strokeStyle = "rgb(255,255,255)";
        } else {
          main_ctx.lineWidth = 3;
          //select object related colour
          for (var j = 0; j < segmentation_classes.length; j++) {
            if (current_polygon.class == segmentation_classes[j][0]) {
              nums[j]++;
              main_ctx.strokeStyle = segmentation_classes[j][1];
              break;
            }
          }
        }

        for (var j = 0; j < current_polygon.x_coords.length; j++) {
          main_ctx.beginPath(); // begin
          let x_start =
            ((Number(current_polygon.x_coords[j]) - offset_x) /
              scale_factor_orig) *
            scale;
          let y_start =
            ((Number(current_polygon.y_coords[j]) - offset_y) /
              scale_factor_orig) *
            scale;
          main_ctx.moveTo(x_start, y_start);
          var x_end =
            ((Number(current_polygon.x_coords[j + 1]) - offset_x) /
              scale_factor_orig) *
            scale;
          var y_end =
            ((Number(current_polygon.y_coords[j + 1]) - offset_y) /
              scale_factor_orig) *
            scale;
          if (j + 1 >= current_polygon.x_coords.length) {
            x_end =
              ((Number(current_polygon.x_coords[0]) - offset_x) /
                scale_factor_orig) *
              scale;
            y_end =
              ((Number(current_polygon.y_coords[0]) - offset_y) /
                scale_factor_orig) *
              scale;
          }
          main_ctx.lineTo(x_end, y_end);
          main_ctx.stroke(); // draw it!
          main_ctx.closePath();
        }
      }
    }
    //polygon = {x_coords: [], y_coords: [], class: ""};
    //console.log(nums);
    for (var i = 0; i < segmentation_classes.length; i++) {
      document.getElementById(
        "".concat(segmentation_classes[i][0], "_num")
      ).innerHTML = nums[i];
    }
  }
}

/*------------------------------------------------------------------
 * draw_Image()
 *
 * draw the image that has to be annotated on the canvas
 *-----------------------------------------------------------------*/
function draw_Image(img_name, offset_x, offset_y, update_preview) {
  var main_canvas = document.getElementById("img_canvas");
  var main_ctx = main_canvas.getContext("2d");
  var img = new Image();
  var zoomed_in;

  img.onload = function () {
    main_ctx.beginPath();
    main_ctx.drawImage(img, 0, 0, main_canvas.width, main_canvas.height);
    main_ctx.stroke();
    main_ctx.closePath();

    if (scale_factor != 4) {
      zoomed_in = true;
    } else {
      zoomed_in = false;
    }
    if (update_preview == true) {
      draw_Preview(img_name, img, zoomed_in);
    }
  };
  //img.src = img_name;
  //console.log(img_name);
  //load image section with ajax request
  load_img_ajax(
    "img_load.php?img_name=" +
      img_name +
      "&offset_x=" +
      offset_x +
      "&offset_y=" +
      offset_y +
      "&canvas_w=" +
      main_canvas.width +
      "&canvas_h=" +
      main_canvas.height +
      "&scale_factor=" +
      scale_factor
  ).then(
    function (response) {
      var imageURL = window.URL.createObjectURL(response);
      img.src = imageURL; //update image on canvas
    },
    function (Error) {
      console.log(Error);
    }
  );
  highlight_viewport_in_preview(scale_factor, offset_x, offset_y);
}

/*------------------------------------------------------------------
 * reset_Canvas()
 *
 * Erase everything on the main canvas
 *-----------------------------------------------------------------*/
function reset_Canvas() {
  var main_canvas = document.getElementById("box_canvas");
  var main_ctx = main_canvas.getContext("2d");
  main_ctx.beginPath();
  main_ctx.clearRect(0, 0, main_canvas.width, main_canvas.height);
  main_ctx.stroke();
  main_ctx.closePath();
}

/*------------------------------------------------------------------
 * init_drawing()
 *
 * initialize mouse listener to draw on the canvas
 *-----------------------------------------------------------------*/
function init_drawing() {
  //var main_canvas = document.getElementById('main_canvas');
  var transparent_canvas = document.getElementById("tmp_canvas");
  document.addEventListener("mousemove", mouse_move);
  document.addEventListener("mousedown", mouse_down);
  document.addEventListener("mouseup", mouse_up);
  //transparent_canvas.addEventListener('mouseup', mouse_up);
  //transparent_canvas.addEventListener('mousemove', mouse_move);
  //transparent_canvas.addEventListener('mousedown', mouse_down);
  //transparent_canvas.addEventListener('mouseup', mouse_up);

  transparent_canvas.addEventListener("mouseout", mouse_out);
  //document.getElementById('page').addEventListener('mouseup', mouse_up);
}

/*------------------------------------------------------------------
 * zoom_img()
 *
 * Zoom the image in or out
 *-----------------------------------------------------------------*/
function zoom_img(zoom_diff) {
  //workaround for wierd javascript floating point arithmetic
  var scale_factor_new = (scale_factor * 10 + zoom_diff * 10) / 10;
  if (scale_factor_new >= 4 && scale_factor_new <= 128) {
    let scale = scale_factor_new / scale_factor_orig;
    let width_new = width_orig / scale;
    let height_new = height_orig / scale;
    //if (offset_x != 0.5 * (width_orig - width_new)) { offset_x = 0.5 * (width_orig - width_new); }
    //if (offset_y != 0.5 * (height_orig - height_new)) { offset_y = 0.5 * (height_orig - height_new); }
    if (offset_x + width_new > width_orig) {
      offset_x = width_orig - width_new;
    }
    if (offset_y + height_new > height_orig) {
      offset_y = height_orig - height_new;
    }
    if (scale_factor_new == 4) {
      offset_x = 0;
    }
    if (scale_factor_new == 4) {
      offset_y = 0;
    }

    scale_factor = scale_factor_new;

    document.getElementById("zoom_status").innerText = "Zoom Factor: " + scale;
    reset_Canvas();
    draw_Image(current_img, offset_x, offset_y, false); //load zoomed image
    draw_Annotation(bbox_list, polygon_list);
    if (mode == "poly_point_done" || mode == "polygon_finish") {
      animate_polygon_drawing(polygon);
    }
  }
}

/*------------------------------------------------------------------
 * move_img()
 *
 * Move the current viewport
 *-----------------------------------------------------------------*/
function move_img(direction) {
  if (scale_factor > 4) {
    var scale = scale_factor / scale_factor_orig;
    if (direction == "87") {
      offset_y -= zoom_stride / scale;
    } // w
    else if (direction == "65") {
      offset_x -= zoom_stride / scale;
    } // a
    else if (direction == "83") {
      offset_y += zoom_stride / scale;
    } // s
    else if (direction == "68") {
      offset_x += zoom_stride / scale;
    } // d

    if (offset_x < 0) {
      offset_x = 0;
    }
    if (offset_y < 0) {
      offset_y = 0;
    }
    if (offset_x + width_orig / scale > width_orig) {
      offset_x = width_orig - width_orig / scale;
    }
    if (offset_y + height_orig / scale > height_orig) {
      offset_y = height_orig - height_orig / scale;
    }

    reset_Canvas();
    draw_Image(current_img, offset_x, offset_y, false); //load zoomed image
    draw_Annotation(bbox_list, polygon_list);
    if (mode == "poly_point_done" || mode == "polygon_finish") {
      animate_polygon_drawing(polygon);
    }
  }
}
