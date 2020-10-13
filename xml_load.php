<?php
####################################################################
#
# File....: xml_load.php
# Function: Load and send the current XML-Annotation
# Author..: Alexander Leipnitz
# Date....: 13.12.2019
#
######################################################################
$xml_file = $_GET["xml_name"]; //Look for specific GET-Request

$annotation = new \stdClass();

if (file_exists($xml_file)) {
  $xml = simplexml_load_file($xml_file); //Load XML-File from disk

  //Read Annotation status
  $annotation->status = (string) $xml->status;

  //Read Image information
  $annotation->img = new \stdClass();
  $annotation->img->name = (string) $xml->filename;
  $annotation->img->height = (string) $xml->size->height;
  $annotation->img->width = (string) $xml->size->width;
  $annotation->img->depth = (string) $xml->size->depth;

  //Read Camera information
  $annotation->cam = new \stdClass();
  $annotation->cam->iso = (string) $xml->cam->iso;
  $annotation->cam->shutter = (string) $xml->cam->shutter;
  $annotation->cam->ev = (string) $xml->cam->ev;
  $annotation->cam->fnum = (string) $xml->cam->fnum;
  $annotation->cam->ct = (string) $xml->cam->ct;
  $annotation->cam->color_md = (string) $xml->cam->color_md;
  $annotation->cam->focal_len = (string) $xml->cam->focal_len;

  //Read GPS information
  $annotation->gps = new \stdClass();
  $annotation->gps->longitude = (string) $xml->gps->longitude;
  $annotation->gps->latitude = (string) $xml->gps->latitude;
  $annotation->gps->altitude = (string) $xml->gps->altitude;
  $annotation->gps->barometer = (string) $xml->gps->barometer;
  $annotation->gps->flight_altitude = (string) $xml->gps->flight_altitude;

  //Read Drone information
  $annotation->drone = new \stdClass();
  $annotation->drone->yaw = (string) $xml->drone->yaw;
  $annotation->drone->pitch = (string) $xml->drone->pitch;
  $annotation->drone->roll = (string) $xml->drone->roll;

  $annotation->boxes = array();
  foreach ($xml->object as $xml_box) {
    //Read each box
    $box = new \stdClass();
    $box->name = (string) $xml_box->name;
    $box->difficult = (string) $xml_box->difficult;
    $box->xmin = (string) $xml_box->bndbox->xmin;
    $box->ymin = (string) $xml_box->bndbox->ymin;
    $box->xmax = (string) $xml_box->bndbox->xmax;
    $box->ymax = (string) $xml_box->bndbox->ymax;
    $annotation->boxes[] = $box; //append current box to box-array
  }

  $annotation->polygons = array();
  foreach ($xml->polygon as $xml_polygon) {
    //Read each contour
    $polygon = new \stdClass();
    $polygon->name = (string) $xml_polygon->name;
    $polygon->difficult = (string) $xml_polygon->difficult;
    $polygon->x = array(); //array of x-coordinates
    $polygon->y = array(); //array of y-coordinates
    foreach ($xml_polygon->coordinates->children() as $xml_coordinates) {
      //Read each element
      //check if child is x-coordinate or y-coordinate
      if ($xml_coordinates->getName()[0] == "x") {
        $polygon->x[] = (string) $xml_coordinates;
      }
      if ($xml_coordinates->getName()[0] == "y") {
        $polygon->y[] = (string) $xml_coordinates;
      }
    }
    $annotation->polygons[] = $polygon; //append current contour to contour-array
  }
} else {
  $annotation->error = "Failed to load xml file";
}

echo json_encode($annotation); //encode as JSON and send to client
