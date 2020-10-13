<?php
####################################################################
#
# File....: filelist.php
# Function: Create list of all images and send it to the browser
# Author..: Alexander Leipnitz
# Date....: 13.12.2019
#
######################################################################

$folderlist = array();
if (isset($_GET["load"]) && isset($_GET["state"])) {
  $base_path = "data/" . $_GET["state"] . "/" . "imgs/"; // Image directory
  foreach (array_slice(scanDir($base_path), 2) as $date_folder) //iterate dates
  {
    //$root->folderlist[] = $date_folder;
    $folderlist[$date_folder] = array();
    foreach (array_slice(scanDir($base_path . $date_folder), 2) as $video_folder) //iterate videos
    {
      //$filelist = array();
      $folderlist[$date_folder][$video_folder] = array();
      foreach (array_slice(scanDir($base_path . $date_folder . "/" . $video_folder), 2) as $file) //iterate files
      {
        $path = pathinfo($file);
        //look for valid extensions
        if (in_array($path["extension"], ["png", "jpg", "gif"])) 
        {
          //$filelist[] = ['names'=>$base_path . $date_folder . "/" . $video_folder . "/" . $file];
          $folderlist[$date_folder][$video_folder][] = ['names' => $base_path . $date_folder . "/" . $video_folder . "/" . $file];
        }
      }
      //$root->folderlist[$date_folder][] = $video_folder;

      //$folderlist[$date_folder][$video_folder][] = $filelist;
      //append filelist-object to folderlist-array
      //$folderlist[] = $filelist;
    }
  }

  echo json_encode($folderlist); //encode as JSON and send to client
  exit;
}
