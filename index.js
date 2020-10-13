/*******************************************************************
 *
 * File....: index.js
 * Function: main javascript file with basic functionality
 * Author..: Alexander Leipnitz
 * Date....: 28.11.2019
 *
 ********************************************************************/
var current_img_idx = 0;
var current_vid_idx = 0;
var current_dir_idx = 0;

var current_img = ''; //current image filename
var current_xml = ''; //current xml filename
var current_dir = ''; //current folder name (e.g. recording day)
var current_vid = ''; //current subfolder name (e.g. video from a specific day)

//Object detection classes:
var detection_classes = [
  ["person", "rgb(255,   0, 255)"],
  ["technic", "rgb( 50,  45, 230)"],
  ["animal", "rgb( 65, 130,  45)"]
];
/* new classification Agri-13 */
var segmentation_classes = [
  ["void", "rgb(  0,   0,   0)"],
  ["branches", "rgb(254, 234, 187)"],
  ["harvested", "rgb(231, 208, 183)"],
  ["blankField", "rgb(207, 171, 122)"],
  ["grainField", "rgb(255, 204,   0)"],
  ["colzaBloom", "rgb(253, 240,  30)"],
  ["meadow", "rgb(213, 234, 180)"],
  ["maizeField", "rgb(183, 238,   8)"],
  ["greenField", "rgb(102, 208,  60)"],
  ["treeBush", "rgb(  0, 110,   0)"],
  ["building", "rgb(208, 208, 208)"],
  ["pavedArea", "rgb(179, 170, 142)"],
  ["road", "rgb( 68,  60,  58)"],
  ["technique", "rgb(255, 100, 255)"]
];

var annotation_type = "detection";

var current_class_id = 0;
var scale_factor_orig = 4.0;
var scale_factor = 4.0;
var offset_x = 0;
var offset_y = 0;

var bbox_list = [];
var polygon_list = [];
var polygon = { x_coords: [], y_coords: [], class: "" };
var modified_polygon = { x_coords: [], y_coords: [], class: "" };

var current_bbox = -1;
var current_point_idx = -1;
var current_polygon_idx = -1;

var mouse_on_line = -1;

var modified_bbox = { xmin: -1, ymin: -1, xmax: -1, ymax: -1 }
var pos = { x: -1, y: -1 }; // last known position
var pos_start = { x: -1, y: -1 };

var width_orig = 3840;
var height_orig = 2160;

var zoom_stride = 400;

var default_tool_mode = "pencil";

/*------------------------------------------------------------------
 * init()
 *
 * entry point to program
 *-----------------------------------------------------------------*/
function init() {
  document.getElementById("defaultType").click(); //set detection mode as default

  document.getElementById("seg_images").checked = false;

  load_stats_ajax(); //load dataset statistics

  if (document.getElementById("state").checked) { load_filelist_ajax("finished"); } //Load Imagefile-List
  else { load_filelist_ajax("unfinished"); }

  //Add Event Listeners to enable all buttons
  document.getElementById("zoom_in").addEventListener("click", function() { zoom_img(2); });
  document.getElementById("zoom_out").addEventListener("click", function() { zoom_img(-2); });

  document.getElementById("zoom_status").innerText = "Zoom Factor: " + scale_factor / scale_factor_orig;
  document.onkeydown = checkKey;

  init_drawing();
  document.getElementById("state").addEventListener("change", function() {
    document.getElementById("prev_dir").removeEventListener("click", prev_dir_click, false);
    document.getElementById("next_dir").removeEventListener("click", next_dir_click, false);
    document.getElementById("prev_vid").removeEventListener("click", prev_vid_click, false);
    document.getElementById("next_vid").removeEventListener("click", next_vid_click, false);
    document.getElementById("prev_img").removeEventListener("click", prev_img_click, false);
    document.getElementById("next_img").removeEventListener("click", next_img_click, false);
    document.getElementById("prev_img_10").removeEventListener("click", prev_img_click_10, false);
    document.getElementById("next_img_10").removeEventListener("click", next_img_click_10, false);
    if (document.getElementById("state").checked) { load_filelist_ajax("finished"); } //Load Imagefile-List
    else { load_filelist_ajax("unfinished"); }
  });

  document.getElementById("seg_images").addEventListener("change", function() {
    document.getElementById("prev_dir").removeEventListener("click", prev_dir_click, false);
    document.getElementById("next_dir").removeEventListener("click", next_dir_click, false);
    document.getElementById("prev_vid").removeEventListener("click", prev_vid_click, false);
    document.getElementById("next_vid").removeEventListener("click", next_vid_click, false);
    document.getElementById("prev_img").removeEventListener("click", prev_img_click, false);
    document.getElementById("next_img").removeEventListener("click", next_img_click, false);
    document.getElementById("prev_img_10").removeEventListener("click", prev_img_click_10, false);
    document.getElementById("next_img_10").removeEventListener("click", next_img_click_10, false);
    if (document.getElementById("seg_images").checked) { load_filelist_ajax("segmentation"); } //Load Imagefile-List
    else { load_filelist_ajax("finished"); }
  });
}

/*------------------------------------------------------------------
 * load_Annotation()
 *
 * Main Annotation Loader and Displaying Function
 *-----------------------------------------------------------------*/
function load_Annotation(img_name) {
  bbox_list = []; //reset bbox_list
  current_xml = img_name.replace('jpg', 'xml').replace('imgs', 'annotations');
  load_XML_ajax("xml_load.php?xml_name=" + current_xml).then(function(result) {
    //Display all additional information from the xml file
    document.getElementById("progress").checked = false;
    document.getElementById("empty_image").checked = false;
    document.getElementById("img_width").innerHTML = result.img.width;
    document.getElementById("img_height").innerHTML = result.img.height;
    document.getElementById("img_depth").innerHTML = result.img.depth;
    document.getElementById("cam_iso").innerHTML = result.cam.iso;
    document.getElementById("cam_shutter").innerHTML = result.cam.shutter;
    document.getElementById("cam_ev").innerHTML = result.cam.ev;
    document.getElementById("cam_fnum").innerHTML = result.cam.fnum;

    if (result.status) { document.getElementById("annot_status").innerHTML = result.status } else { document.getElementById("annot_status").innerHTML = "Not Set" }

    if (result.cam.ct) { document.getElementById("cam_ct").innerHTML = result.cam.ct; } else { document.getElementById("cam_ct").innerHTML = "Not Set" }

    if (result.cam.color_md) { document.getElementById("cam_color_md").innerHTML = result.cam.color_md; } else { document.getElementById("cam_color_md").innerHTML = "Not Set" }

    if (result.cam.focal_len) { document.getElementById("cam_focal_len").innerHTML = result.cam.focal_len; } else { document.getElementById("cam_focal_len").innerHTML = "Not Set" }

    if (result.gps.longitude) { document.getElementById("gps_longitude").innerHTML = result.gps.longitude; } else { document.getElementById("gps_longitude").innerHTML = "Not Set" }

    if (result.gps.latitude) { document.getElementById("gps_latitude").innerHTML = result.gps.latitude; } else { document.getElementById("gps_latitude").innerHTML = "Not Set" }

    if (result.gps.altitude) { document.getElementById("gps_altitude").innerHTML = result.gps.altitude; } else { document.getElementById("gps_altitude").innerHTML = "Not Set" }

    if (result.gps.barometer) { document.getElementById("gps_barometer").innerHTML = result.gps.barometer; } else { document.getElementById("gps_barometer").innerHTML = "Not Set" }

    if (result.gps.flight_altitude) { document.getElementById("gps_flight_altitude").innerHTML = result.gps.flight_altitude; } else { document.getElementById("gps_flight_altitude").innerHTML = "Not Set" }

    if (result.drone.yaw) { document.getElementById("drone_yaw").innerHTML = result.drone.yaw; } else { document.getElementById("drone_yaw").innerHTML = "Not Set" }

    if (result.drone.pitch) { document.getElementById("drone_pitch").innerHTML = result.drone.pitch; } else { document.getElementById("drone_pitch").innerHTML = "Not Set" }

    if (result.drone.roll) { document.getElementById("drone_roll").innerHTML = result.drone.roll; } else { document.getElementById("drone_roll").innerHTML = "Not Set" }

    //console.log(result);
    //Draw the bouding boxes from the xml file
    for (var i in result.boxes) {
      let box = result.boxes[i];
      bbox_list.push([Number(box.xmin), Number(box.ymin), Number(box.xmax), Number(box.ymax), box.name]);
    }

    //Draw the polygons from the xml file
    for (var i in result.polygons) {
      let current_polygon = { x_coords: [], y_coords: [], class: "" };
      current_polygon.class = result.polygons[i].name;
      for (var j in result.polygons[i].x) {
        current_polygon.x_coords.push(result.polygons[i].x[j]);
        current_polygon.y_coords.push(result.polygons[i].y[j]);
      }
      polygon_list.push(current_polygon);

    }
    //console.log(polygon_list);
    draw_Annotation(bbox_list, polygon_list);
    //polygon = {x_coords: [], y_coords: [], class: ""};
  });
}

/*------------------------------------------------------------------
 * switch_img()
 *
 * switch the current image to the next or previous one
 *-----------------------------------------------------------------*/
function switch_img(direction, obj) {
  if (document.getElementById("progress").checked) {
    send_annotation_ajax(current_xml);
  }

  var len_filelist = obj[current_dir][current_vid].length;
  if (direction == 0 || current_img_idx + direction >= len_filelist) {
    current_img_idx = 0;
  } else if (current_img_idx + direction >= 0 && current_img_idx + direction < len_filelist) {
    current_img_idx += direction;
  } else if (current_img_idx + direction < 0) {
    current_img_idx = len_filelist - 1;
  }
  current_img = obj[current_dir][current_vid][current_img_idx].names;

  bbox_list = []; //reset bbox_list
  polygon_list = []; //reset polygon_list
  polygon = { x_coords: [], y_coords: [], class: "" };
  mode = '';

  reset_Canvas();
  load_Annotation(current_img);

  //Reset zooming config from previous image
  //offset_x = 0;
  //offset_y = 0;
  //scale_factor = 4;

  draw_Image(current_img, offset_x, offset_y, true);

  //Reset tool_mode
  if (annotation_type == "detection") {
    document.getElementById("select_det_mode").value = default_tool_mode;
  } else {
    document.getElementById("select_seg_mode").value = default_tool_mode;
  }

  tool_mode = default_tool_mode;

  document.getElementById("zoom_status").innerText = "Zoom Factor: " + scale_factor / scale_factor_orig;
  document.getElementById("img_number").innerText = "Image: " + current_img.split('\\').pop().split('/').pop() +
    " [" + (current_img_idx + 1) + "/" + len_filelist + "]";
}

/*------------------------------------------------------------------
 * switch_vid()
 *
 * switch the current video to the next or previous one
 *-----------------------------------------------------------------*/
function switch_vid(direction, obj) {
  var current_vid_list = Object.keys(obj[current_dir]);
  var len_vidlist = current_vid_list.length; //obj[current_dir_idx].length;
  current_img_idx = 0;
  if (direction == 0 || current_vid_idx + direction >= len_vidlist) {
    current_vid_idx = 0;
  } else if (current_vid_idx + direction >= 0 && current_vid_idx + direction < len_vidlist) {
    current_vid_idx += direction;
  } else if (current_vid_idx + direction < 0) {
    current_vid_idx = len_vidlist - 1;
  }
  current_vid = current_vid_list[current_vid_idx];
  switch_img(0, obj);

  //Reset tool_mode
  document.getElementById("select_det_mode").value = default_tool_mode;
  tool_mode = default_tool_mode;

  document.getElementById("vid_number").innerText = "Video: " + current_vid +
    " [" + (current_vid_idx + 1) + "/" + len_vidlist + "]";
}

/*------------------------------------------------------------------
 * switch_dir()
 *
 * switch the current directory to the next or previous one
 *-----------------------------------------------------------------*/
function switch_dir(direction, obj) {
  var current_dir_list = Object.keys(obj);
  var len_dirlist = current_dir_list.length;
  current_vid_idx = 0;
  current_img_idx = 0;
  if (direction == 0 || current_dir_idx + direction >= len_dirlist) {
    current_dir_idx = 0;
  } else if (current_dir_idx + direction >= 0 && current_dir_idx + direction < len_dirlist) {
    current_dir_idx += direction;
  } else if (current_dir_idx + direction < 0) {
    current_dir_idx = len_dirlist - 1;
  }
  current_dir = current_dir_list[current_dir_idx];
  switch_vid(0, obj);

  //Reset tool_mode
  document.getElementById("select_det_mode").value = default_tool_mode;
  tool_mode = default_tool_mode;

  document.getElementById("dir_number").innerText = "Folder: " + current_dir +
    " [" + (current_dir_idx + 1) + "/" + len_dirlist + "]";
}

/*------------------------------------------------------------------
 * switch_detection_class()
 *
 * switch the default class for a new rectangle
 *-----------------------------------------------------------------*/
function switch_detection_class(new_class) {
  document.getElementById(detection_classes[current_class_id][0]).style.border = "";
  //get id of new class
  for (var i = 0; i < detection_classes.length; i++) {
    document.getElementById(detection_classes[i][0]).style.border = "4px solid #212529";
    if (new_class == detection_classes[i][0]) {
      current_class_id = i;
      //break;
    }
  }

  document.getElementById(detection_classes[current_class_id][0]).style.border = "4px solid #dee2e6";
  if (current_class_id > 0) {
    document.getElementById(detection_classes[current_class_id - 1][0]).style.borderBottom = "4px solid #dee2e6";
  }
}


/*------------------------------------------------------------------
 * switch_detection_class()
 *
 * switch the default class for a new rectangle
 *-----------------------------------------------------------------*/
function switch_segmentation_class(new_class) {
  document.getElementById(segmentation_classes[current_class_id][0]).style.border = "";
  //get id of new class
  for (var i = 0; i < segmentation_classes.length; i++) {
    document.getElementById(segmentation_classes[i][0]).style.border = "4px solid #212529";
    if (new_class == segmentation_classes[i][0]) {
      current_class_id = i;
      //break;
    }
  }

  document.getElementById(segmentation_classes[current_class_id][0]).style.border = "4px solid #dee2e6";
  if (current_class_id > 0) {
    document.getElementById(segmentation_classes[current_class_id - 1][0]).style.borderBottom = "4px solid #dee2e6";
  }
}

/*------------------------------------------------------------------
 * switch_annotation_type()
 *
 * switch the annotation type
 *-----------------------------------------------------------------*/
function switch_annotation_type(evt, type) {
  annotation_type = type;

  if (annotation_type == "detection") {
    var sel = document.getElementById('select_det_mode');
    tool_mode = sel.options[sel.selectedIndex].value;

    document.getElementById("select_det_mode").addEventListener("change", (event) => {
      tool_mode = event.target.value;
      /*console.log( tool_mode);*/
      /*console.log( bbox_list);*/
    });
    for (var i = 0; i < detection_classes.length; i++) {
      //add event listeners for both fields (colour and text)                                                      
      document.getElementById("".concat(detection_classes[i][0], "1")).addEventListener("click", function() {
        switch_detection_class(event.currentTarget.id.slice(0, -1)); //remove last character "1" from id to get class name
      });
      document.getElementById("".concat(detection_classes[i][0], "2")).addEventListener("click", function() {
        switch_detection_class(event.currentTarget.id.slice(0, -1)); //remove last character "1" from id to get class name
      });
    }
    for (var i = 0; i < segmentation_classes.length; i++) {
      document.getElementById(segmentation_classes[i][0]).style.border = "";
    }
    //document.getElementById(segmentation_classes[current_class_id][0]).style.border = "";
    current_class_id = 0;
    document.getElementById(detection_classes[current_class_id][0]).style.border = "4px solid #dee2e6";
  } else if (annotation_type == "segmentation") {
    var sel = document.getElementById('select_seg_mode');
    tool_mode = sel.options[sel.selectedIndex].value;

    document.getElementById("select_seg_mode").addEventListener("change", (event) => {
      tool_mode = event.target.value;
      /*console.log( tool_mode);*/
      /*console.log( bbox_list);*/
    });
    for (var i = 0; i < segmentation_classes.length; i++) {
      //add event listeners for both fields (colour and text)                                                      
      document.getElementById("".concat(segmentation_classes[i][0], "1")).addEventListener("click", function() { /*console.log( event.currentTarget.id);*/
        switch_segmentation_class(event.currentTarget.id.slice(0, -1)); //remove last character "1" from id to get class name
      });
      document.getElementById("".concat(segmentation_classes[i][0], "2")).addEventListener("click", function() {
        switch_segmentation_class(event.currentTarget.id.slice(0, -1)); //remove last character "1" from id to get class name
      });
    }
    for (var i = 0; i < detection_classes.length; i++) {
      document.getElementById(detection_classes[i][0]).style.border = "";
    }
    //document.getElementById(detection_classes[current_class_id][0]).style.border = "";
    current_class_id = 0;
    document.getElementById(segmentation_classes[current_class_id][0]).style.border = "4px solid #dee2e6";
  }

  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(type).style.display = "block";
  evt.currentTarget.className += " active";

  reset_Canvas();
  //draw_Image(current_img);
  draw_Annotation(bbox_list, polygon_list);
  polygon = { x_coords: [], y_coords: [], class: "" };
}