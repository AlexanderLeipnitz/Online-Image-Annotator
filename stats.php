<?php
####################################################################
#
# File....: stats.php
# Function: Send dataset statistics to client
# Author..: Alexander Leipnitz
# Date....: 25.05.2020
#
######################################################################

$stats = array();
if (isset($_GET["load"])) {
  // Open the file for reading
  if (($h = fopen("stats.csv", "r")) !== FALSE) {
    // Each line in the file is converted into an individual array that we call $data
    // The items of the array are comma separated
    while (($data = fgetcsv($h, 1000, ",")) !== FALSE) {
      // Each individual array is being pushed into the nested array
      $stats[$data[0]] = $data[1];
    }

    // Close the file
    fclose($h);
  }

  echo json_encode($stats); //encode as JSON and send to client
  exit;
}
