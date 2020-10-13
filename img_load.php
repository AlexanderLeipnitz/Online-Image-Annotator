<?php
####################################################################
#
# File....: img_load.php
# Function: Load, preprocess and send the image (or image section) to the browser
# Author..: Alexander Leipnitz
# Date....: 28.12.2019
#
######################################################################
function imageResize($url, $offset_x, $offset_y, $canvas_w, $canvas_h, $scale_factor)
{
  $default_scale = 4;
  $image_p = imagecreatetruecolor($canvas_w, $canvas_h);
  $image = imagecreatefromjpeg($url);

  $width_orig = imagesx($image);
  $height_orig = imagesy($image);

  $scale = $scale_factor / $default_scale;
  $width_new = $width_orig / $scale;
  $height_new = $height_orig / $scale;

  if ($offset_x > 0 || $offset_y > 0) {
    $image = imagecrop($image, ['x' => $offset_x, 'y' => $offset_y, 'width' => $width_new, 'height' => $height_new]);
  }
  // This resizes the image
  //imagecopyresampled( $image_p, $image, 0, 0, 0, 0, $canvas_w, $canvas_h, $width_new, $height_new);
  imagecopyresized($image_p, $image, 0, 0, 0, 0, $canvas_w, $canvas_h, $width_new, $height_new);

  // create the final image
  imagejpeg($image_p, null);
  //imageinterlace( $image_p, true); //Activate progressive mode of jpg
  imagedestroy($image);
  imagedestroy($image_p);
}

header("Content-type: image/jpeg");
header("Cache-Control: public");
header("Content-Description: File Transfer");
header("Content-Disposition: attachment; filename=" . $_GET["img_name"] . "");
#header("Content-Transfer-Encoding: binary");
#header("Content-Type: binary/octet-stream");
if ($_GET['scale_factor'] > 4) {
  imageResize($_GET["img_name"], $_GET['offset_x'], $_GET['offset_y'], $_GET['canvas_w'], $_GET['canvas_h'], $_GET['scale_factor']);
} else {
  $url = str_replace("imgs", "imgs_small", $_GET["img_name"]);
  $image = imagecreatefromjpeg($url);
  imagejpeg($image, null);
  imagedestroy($image);
}
