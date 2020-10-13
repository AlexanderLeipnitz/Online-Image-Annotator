/*******************************************************************
 *
 * File....: preview.js
 * Function: preview canvas functionalities
 * Author..: Alexander Leipnitz
 * Date....: 14.05.2020
 *
 ********************************************************************/

/*------------------------------------------------------------------
 * highlight_viewport_in_preview()
 *
 * draw the current annotation-list on the main canvas
 *-----------------------------------------------------------------*/
function highlight_viewport_in_preview(scale_factor, offset_x, offset_y) {
  var main_canvas = document.getElementById('preview_viewport');
  var main_ctx = main_canvas.getContext('2d');

  var scale = scale_factor / scale_factor_orig;
  var rect_width = Math.round(main_canvas.width / scale);
  var rect_height = Math.round(main_canvas.height / scale);
  var x_start = Math.round(offset_x / 16);
  var y_start = Math.round(offset_y / 16);

  main_ctx.beginPath();
  main_ctx.clearRect(0, 0, main_canvas.width, main_canvas.height);
  main_ctx.fillStyle = 'rgba(180, 0, 0, 0.5)';
  main_ctx.fillRect(x_start, y_start, rect_width, rect_height); //fill the rectangle
  main_ctx.strokeStyle = 'rgb(255, 0, 0)';
  main_ctx.rect(x_start, y_start, rect_width, rect_height); //draw the rectangle
  main_ctx.stroke(); //show it
  main_ctx.closePath();
}

/*------------------------------------------------------------------
 * draw_Preview()
 *
 * draw the no zoomed image in preview window
 *-----------------------------------------------------------------*/
function draw_Preview(img_name, img, zoomed_in) {
  var main_canvas = document.getElementById('preview_img');
  var main_ctx = main_canvas.getContext('2d');

  if (zoomed_in == true) {
    var img = new Image();
    img.onload = function() {
      main_ctx.beginPath();
      main_ctx.drawImage(img, 0, 0, main_canvas.width, main_canvas.height);
      main_ctx.stroke();
      main_ctx.closePath();
    };
    //img.src = img_name;
    //console.log(img_name);
    //load image section with ajax request
    load_img_ajax("img_load.php?img_name=" + img_name + "&offset_x=0&offset_y=0&canvas_w=960&canvas_h=540&scale_factor=4").then(function(response) {
        var imageURL = window.URL.createObjectURL(response);
        img.src = imageURL; //update image on canvas
      },
      function(Error) {
        console.log(Error);
      });
  } else {
    main_ctx.beginPath();
    main_ctx.drawImage(img, 0, 0, main_canvas.width, main_canvas.height);
    main_ctx.stroke();
    main_ctx.closePath();
  }
}