<?php
####################################################################
#
# File....: xml_store.php
# Function: Receive and save the updated XML-Annotation
# Author..: Alexander Leipnitz
# Date....: 13.12.2019
#
######################################################################
$segmentation_classes = array(
  0 => "void",
  1 => "branches",
  2 => "harvested",
  3 => "blankField",
  4 => "grainField",
  5 => "colzaBloom",
  6 => "meadow",
  7 => "maizeField",
  8 => "greenField",
  9 => "treeBush",
  10 => "building",
  11 => "pavedArea",
  12 => "road",
  13 => "technique"
); //The index of the class will represent its colour 
//when an image of the polygons is exported

$max_boxes = 100; //limit number of annotations per file
$max_polygons = 100; //limit number of annotations per file
$max_points = 200; //limit number of polygon-points per file

$xml_file = $_POST["xml_name"]; //Look for specific POST-Request
$boxes = $_POST["boxes"]; //Look for specific POST-Request
$polygons = $_POST["polygons"];  //Look for specific POST-Request
$export = $_POST["export"];  //Look for specific POST-Request
$empty = $_POST["empty"];  //Look for specific POST-Request
$bbox_list = json_decode($boxes); //decode bbox-list
$polygon_list = json_decode($polygons);

if (file_exists($xml_file)) {
  //Creates XML string and XML document using the DOM 
  //$xml = new DomDocument('1.0', 'UTF-8');
  $xml = new DomDocument();
  $xml->preserveWhiteSpace = false;
  $xml->formatOutput = true;

  $xml->load($xml_file); //Load XML-File from disk
  //$root = $xml->firstChild;
  $root = $xml->documentElement;

  $widthNode = $root->getElementsByTagName("width");
  foreach ($widthNode as $node) {$img_width = $node->nodeValue;}
  $heightNode = $root->getElementsByTagName("height");
  foreach ($widthNode as $node) {$img_height = $node->nodeValue;}

  // Remove old box information
  $i = 0;
  while (is_object($removeNode = $root->getElementsByTagName("object")[$i])) {
    $root->removeChild($removeNode);
  }

  if ($empty == 0) {
    // Add new box information
    for ($i = 0; $i < min(count($bbox_list), $max_boxes); $i++) {
      if ($bbox_list[$i][0] >= 0 && $bbox_list[$i][0] < $img_width &&
          $bbox_list[$i][1] >= 0 && $bbox_list[$i][1] < $img_height &&
          $bbox_list[$i][2] >= 0 && $bbox_list[$i][2] < $img_width &&
          $bbox_list[$i][3] >= 0 && $bbox_list[$i][3] < $img_height) {
        // Create a child
        $objectElement = $xml->createElement("object", "");
        $nameElement = $xml->createElement("name", $bbox_list[$i][4]);
        $objectElement->appendChild($nameElement);
        $difficultElement = $xml->createElement("difficult", "0");
        $objectElement->appendChild($difficultElement);

        $bndboxElement = $xml->createElement("bndbox", "");
        // Ensure correct x-coords-order
        if ((float) $bbox_list[$i][0] < (float) $bbox_list[$i][2]) {
          $xminElement = $xml->createElement("xmin", $bbox_list[$i][0]);
          $xmaxElement = $xml->createElement("xmax", $bbox_list[$i][2]);
        }
        else {
          $xminElement = $xml->createElement("xmin", $bbox_list[$i][2]);
          $xmaxElement = $xml->createElement("xmax", $bbox_list[$i][0]);
        }
        $bndboxElement->appendChild($xminElement);
        $bndboxElement->appendChild($xmaxElement);

        // Ensure correct y-coords-order
        if ((float) $bbox_list[$i][1] < (float) $bbox_list[$i][3]) {
          $yminElement = $xml->createElement("ymin", $bbox_list[$i][1]);
          $ymaxElement = $xml->createElement("ymax", $bbox_list[$i][3]);
        }
        else {
          $yminElement = $xml->createElement("ymin", $bbox_list[$i][3]);
          $ymaxElement = $xml->createElement("ymax", $bbox_list[$i][1]);
        }
        $bndboxElement->appendChild($yminElement);
        $bndboxElement->appendChild($ymaxElement);
        // Add the child
        $objectElement->appendChild($bndboxElement);
        $root->appendChild($objectElement);
      }
    }
  }

  if ($export == "1") {
    $im = imagecreatetruecolor($img_width, $img_height);
    $background = imagecolorallocate($im, 0, 0, 0);
  }

  //Remove old contour information
  $i = 0;
  while (is_object($removeNode = $root->getElementsByTagName("polygon")[$i])) {
    $root->removeChild($removeNode);
  }

  //Add new contour information
  for ($i = 0; $i < min(count($polygon_list), $max_polygons); $i++) {
    // Create a child in the first topic node
    $objectElement = $xml->createElement("polygon", "");
    $nameElement = $xml->createElement("name", $polygon_list[$i]->class);
    $objectElement->appendChild($nameElement);
    $difficultElement = $xml->createElement("difficult", "0");
    $objectElement->appendChild($difficultElement);

    $polygonElement = $xml->createElement("coordinates", "");
    //create points-array
    if ($export == "1") {
      $points = [];
    }
    //Add each coordinate-pair
    for ($j = 0; $j < min(count($polygon_list[$i]->x_coords), $max_points); $j++) {
      if ($polygon_list[$i]->x_coords[$j] < 0) {$polygon_list[$i]->x_coords[$j] = 0;}
      if ($polygon_list[$i]->x_coords[$j] >= $img_width) {$polygon_list[$i]->x_coords[$j] = $img_width - 1;}
      if ($polygon_list[$i]->y_coords[$j] < 0) {$polygon_list[$i]->y_coords[$j] = 0;}
      if ($polygon_list[$i]->y_coords[$j] >= $img_height) {$polygon_list[$i]->y_coords[$j] = $img_height -1;}
      $xElement = $xml->createElement("x" . $j, $polygon_list[$i]->x_coords[$j]);
      $polygonElement->appendChild($xElement);
      $yElement = $xml->createElement("y" . $j, $polygon_list[$i]->y_coords[$j]);
      $polygonElement->appendChild($yElement);
      //fill points-array
      if ($export == "1") {
        $points[] = $polygon_list[$i]->x_coords[$j];
        $points[] = $polygon_list[$i]->y_coords[$j];
      }
    }
    //Draw the polygon
    if ($export == "1") {
      $colour = array_search($polygon_list[$i]->class, $segmentation_classes); //get Class-Index as colour
      echo $colour;
      imagefilledpolygon($im, $points, count($polygon_list[$i]->x_coords), imagecolorallocate($im, $colour, $colour, $colour));
    }

    $objectElement->appendChild($polygonElement);
    $root->appendChild($objectElement);
  }
  if ($export == "1") {
    $png_name = str_replace("xml", "png", $xml_file);
    imagepng($im, $png_name); //save png
    imagedestroy($im);
  }

  //Remove old status information
  $removeNode = $xml->getElementsByTagName("status");
  foreach ($removeNode as $node) {
    $node->parentNode->removeChild($node);
  }

  //Add new status information
  if ($empty == 0) {
    $statusElement = $xml->createElement("status", "finished");
    $root->appendChild($statusElement);
  }
  else {
    $statusElement = $xml->createElement("status", "empty");
    $root->appendChild($statusElement);
  }

  // Store new XML
  $xml->save($xml_file);
}
