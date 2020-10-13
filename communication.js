/*******************************************************************
 *
 * File....: communication.js
 * Function: communication with the server through ajax
 * Author..: Alexander Leipnitz
 * Date....: 28.11.2019
 *
 ********************************************************************/

/*------------------------------------------------------------------
 * load_filelist_ajax()
 *
 * Load dir- and filelist from server with Ajax Request
 *-----------------------------------------------------------------*/
function load_filelist_ajax(state) {
  var xhr = new XMLHttpRequest();
  var url = "filelist.php?load&state=" + state;
  xhr.open("GET", url);
  xhr.send(null);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      try {
        var obj = new Object();
        obj = JSON.parse(xhr.responseText);
        switch_dir(0, obj);

        document.getElementById("prev_dir").addEventListener("click", prev_dir_click = function() { switch_dir(-1, obj); }, false);
        document.getElementById("next_dir").addEventListener("click", next_dir_click = function() { switch_dir(1, obj); }, false);
        document.getElementById("prev_vid").addEventListener("click", prev_vid_click = function() { switch_vid(-1, obj); }, false);
        document.getElementById("next_vid").addEventListener("click", next_vid_click = function() { switch_vid(1, obj); }, false);
        document.getElementById("prev_img").addEventListener("click", prev_img_click = function() { switch_img(-1, obj); }, false);
        document.getElementById("next_img").addEventListener("click", next_img_click = function() { switch_img(1, obj); }, false);
        document.getElementById("prev_img_10").addEventListener("click", prev_img_click_10 = function() { switch_img(-10, obj); }, false);
        document.getElementById("next_img_10").addEventListener("click", next_img_click_10 = function() { switch_img(10, obj); }, false);
      } catch (err) {
        console.log(state + "-folder not found!");
      }

    }
  }
}

/*------------------------------------------------------------------
 * load_stats_ajax()
 *
 * Load dataset statistics from server with Ajax Request
 *-----------------------------------------------------------------*/
function load_stats_ajax() {
  var xhr = new XMLHttpRequest();
  var url = "stats.php?load";
  xhr.open("GET", url);
  xhr.send(null);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      try {
        var obj = new Object();
        obj = JSON.parse(xhr.responseText);

        //Display stats:
        if (obj.num_of_finished_annotations) { document.getElementById("num_finished").innerHTML = obj.num_of_finished_annotations; } else { document.getElementById("num_finished").innerHTML = "Not Set" }
        if (obj.num_of_unfinished_annotations) { document.getElementById("num_unfinished").innerHTML = obj.num_of_unfinished_annotations; } else { document.getElementById("num_unfinished").innerHTML = "Not Set" }
        if (obj.num_of_empty_annotations) { document.getElementById("num_empty").innerHTML = obj.num_of_empty_annotations; } else { document.getElementById("num_empty").innerHTML = "Not Set" }
        if (obj.person_num_of_boxes > 0) { document.getElementById("num_person").innerHTML = obj.person_num_of_boxes; } else { document.getElementById("num_person").innerHTML = "Not Set" }
        if (obj.person_min_size_abs < 999999) { document.getElementById("min_person").innerHTML = obj.person_min_size_abs; } else { document.getElementById("min_person").innerHTML = "Not Set" }
        if (obj.person_max_size_abs > 0) { document.getElementById("max_person").innerHTML = obj.person_max_size_abs; } else { document.getElementById("max_person").innerHTML = "Not Set" }
        if (obj.person_summed_size_abs > 0) { document.getElementById("mean_person").innerHTML = (Number(obj.person_summed_size_abs) / Number(obj.person_num_of_boxes)).toFixed(1); } else { document.getElementById("mean_person").innerHTML = "Not Set" }
        if (obj.technic_num_of_boxes > 0) { document.getElementById("num_technic").innerHTML = obj.technic_num_of_boxes; } else { document.getElementById("num_technic").innerHTML = "Not Set" }
        if (obj.technic_min_size_abs < 999999) { document.getElementById("min_technic").innerHTML = obj.technic_min_size_abs; } else { document.getElementById("min_technic").innerHTML = "Not Set" }
        if (obj.technic_max_size_abs > 0) { document.getElementById("max_technic").innerHTML = obj.technic_max_size_abs; } else { document.getElementById("max_technic").innerHTML = "Not Set" }
        if (obj.technic_summed_size_abs > 0) { document.getElementById("mean_technic").innerHTML = (Number(obj.technic_summed_size_abs) / Number(obj.technic_num_of_boxes)).toFixed(1); } else { document.getElementById("mean_technic").innerHTML = "Not Set" }
        if (obj.animal_num_of_boxes > 0) { document.getElementById("num_animal").innerHTML = obj.animal_num_of_boxes; } else { document.getElementById("num_animal").innerHTML = "Not Set" }
        if (obj.animal_min_size_abs < 999999) { document.getElementById("min_animal").innerHTML = obj.animal_min_size_abs; } else { document.getElementById("min_animal").innerHTML = "Not Set" }
        if (obj.animal_max_size_abs > 0) { document.getElementById("max_animal").innerHTML = obj.animal_max_size_abs; } else { document.getElementById("max_animal").innerHTML = "Not Set" }
        if (obj.animal_summed_size_abs > 0) { document.getElementById("mean_animal").innerHTML = (Number(obj.animal_summed_size_abs) / Number(obj.animal_num_of_boxes)).toFixed(1); } else { document.getElementById("mean_animal").innerHTML = "Not Set" }
      } catch (err) {
        console.log("statistics file not found or empty!");
      }
    }
  }
}

/*------------------------------------------------------------------
 * load_XML_ajax()
 *
 * Load XML Annotation from server with Ajax Request
 *-----------------------------------------------------------------*/
function load_XML_ajax(url) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        resolve(JSON.parse(this.responseText));
      }
    }
    xhr.onerror = reject;
    xhr.open('GET', url);
    xhr.send();
  });
}

/*------------------------------------------------------------------
 * send_annotation_ajax()
 *
 * Send current Annotation to server with Ajax Request
 *-----------------------------------------------------------------*/
function send_annotation_ajax(xml_name) {
  var http = new XMLHttpRequest();
  var formData = new FormData();
  var url = 'xml_store.php';
  var png = 0;
  var empty = 0;
  if (document.getElementById("export_png").checked) { png = 1; }
  if (document.getElementById("empty_image").checked) { empty = 1; }
  var params = 'xml_name=' + xml_name + '&boxes=' + JSON.stringify(bbox_list) + '&polygons=' + JSON.stringify(polygon_list) + '&export=' + JSON.stringify(png) + '&empty=' + JSON.stringify(empty);
  http.open('POST', url, true);

  //Send the proper header information along with the request
  http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

  http.onreadystatechange = function() { //Call a function when the state changes.
    if (http.readyState == 4 && http.status == 200) {
      //alert(http.responseText);
    }
  }
  http.send(params);
}

/*------------------------------------------------------------------
 * send_img_ajax()
 *
 * Load Image from server with Ajax Request
 *-----------------------------------------------------------------*/
function load_img_ajax(url) {
  'use strict';
  // Create new promise with the Promise() constructor;
  // This has as its argument a function with two parameters, resolve and reject
  return new Promise(function(resolve, reject) {
    // Standard XHR to load an image
    var request = new XMLHttpRequest();
    request.open('GET', url);
    request.responseType = 'blob';

    // When the request loads, check whether it was successful
    request.onload = function() {
      if (request.status === 200) {
        // If successful, resolve the promise by passing back the request response
        resolve(request.response);
      } else {
        // If it fails, reject the promise with a error message
        reject(new Error('Image didn\'t load successfully; error code:' + request.statusText));
      }
    };

    request.onerror = function() {
      // Also deal with the case when the entire request fails to begin with
      // This is probably a network error, so reject the promise with an appropriate message
      reject(new Error('There was a network error.'));
    };

    // Send the request
    request.send();
  });
}