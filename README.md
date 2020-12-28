# Online-Image-Annotator
## Features
- Annotation of images with bounding boxes for object detection 
- Annotation of images with polygons for object segmentation
- Browser-based (javascript)
- Annotations are saved on a webserver
- Annotations are saved as XML file in PASCAL VOC format
- 3 predefined object detection classes
- 14 predefined object segmentation classes
- Zooming functionality
- Fast loading due to lower resolution image when not zoomed in
- Optimized for high-resolution drone images (4K: 3840x2160 Pixel)
 
## Setup
- Install any webserver (e.g. Apache) and configure it to run PHP 7. Recommended:
  - Linux: LAMP
  - Windows: XAMPP
- Clone the repository 
  `git clone https://github.com/AlexanderLeipnitz/Online-Image-Annotator`
- Modify `DocumentRoot` and `Directory` in the `httpd.conf` file of the Apache Module to the path of the downloaded repository
- Run `python maintenance_scripts/dataset_stats.py` periodically if you want to display up-to-date dataset statistics
- Folder structure: 
  ```
  -- data/
     |-- finished/                  (images that are already annotated)
     |   |-- annotations/
     |   |   |-- subfolder1/        (e.g. shooting date)
     |   |       |-- subfolder11/   (e.g. individual video)
     |   |           -- *.xml       (list of annotation files)
     |   |-- imgs/
     |   |   |-- subfolder1/        (e.g. shooting date)
     |   |       |-- subfolder11/   (e.g. individual video)
     |   |           -- *.jpg       (list of images)
     |   |-- imgs_small/
     |       |-- subfolder1/        (e.g. shooting date)
     |           |-- subfolder11/   (e.g. individual video)
     |               -- *.jpg       (list of downsampled images)
     |-- unfinished/                (images that are not annotated yet)
     |   |-- annotations/
     |   |   |-- subfolder2/        (e.g. shooting date)
     |   |       |-- subfolder22/   (e.g. individual video)
     |   |           -- *.xml       (list of annotation files)
     |   |-- imgs/
     |   |   |-- subfolder2/        (e.g. shooting date)
     |   |        |-- subfolder22/  (e.g. individual video)
     |   |            -- *.jpg      (list of images)
     |   |-- imgs_small/
     |       |-- subfolder2/        (e.g. shooting date)
     |           |-- subfolder22/   (e.g. individual video)
     |               -- *.jpg       (list of downsampled images) 
     |-- empty/                     (images with no objects in them (neg. examples))
     |    |-- annotations/
     |    |   |-- subfolder3/       (e.g. individual video)
     |    |       |-- subfolder33/  (e.g. individual video)
     |    |           -- *.xml      (list of annotation files)
     |    |-- imgs/
     |        |-- subfolder3/       (e.g. individual video)
     |            |-- subfolder33/  (e.g. individual video)
     |                -- *.jpg      (list of images)
     |
     |-- segmentation/              (optional segmentation images)
         |-- annotations/
         |   |-- subfolder4/        (e.g. individual video)
         |       |-- subfolder44/   (e.g. individual video)
         |           -- *.xml       (list of annotation files)
         |-- imgs/
             |-- subfolder4/        (e.g. individual video)
                 |-- subfolder44/   (e.g. individual video)
                     -- *.jpg       (list of images)
  ```

## Usage
- `Show Annotation Type` switches between the finished and unfinished folder and displays only the images from them
- The current client-side annotation-information will only be send to the server and saved when a different image is selected
- `Finished Annotation?` marks the current unfinished image and its annotation file as `finished` in the XML-Tag: `status`
- All marked as `finished` annotations within the `unfinished` folder can be moved to the `finished` folder by:
  - `python maintenance_scripts/move_finished_annotations.py`
### Object detection:
- `Image empty?`: When no classes are visible in the image, this switch should be activated
- `Image empty?` marks the current unfinished image and its annotation file as `empty` in the XML-Tag: `status`
- All images marked as `empty` in the annotation within the `unfinished` folder can be moved to the `empty` folder by:
  - `python maintenance_scripts/move_empty_annotations.py`
### Object segmentation:
- `Segmentation Images Only` loads images from a optional fourth `segmentation` folder
- `Save Polygon to png` creates an additional annotation-image with filled polygons in the `annotations` folder
## Own Dataset
- Insert your own images (.jpg) in `data/unfinished/imgs/*/*/` (* ... arbitrary folder names)
- Insert downscaled images (1/4 horizontal and vertical resolution) in `data/unfinished/imgs_small/*/*/`
- Insert empty annotation-files (.xml) in `data/unfinished/annotations/*/*/` 
- Empty XML-Files must have following structure: 
```
<?xml version="1.0"?>
<annotation>
  <dataset>EXAMPLE</dataset>
  <filename>img2.jpg</filename>
  <size>
    <height>2160</height>
    <width>3840</width>
    <depth>3</depth>
  </size>
  <cam>
    <iso>100</iso>
    <shutter>500</shutter>
    <ev>0</ev>
    <fnum>2.2</fnum>
  </cam>
  <gps>
    <longitude>0.0000</longitude>
    <latitude>0.0000</latitude>
    <barometer>0.0</barometer>
  </gps>
  <status>unfinished</status>
</annotation>
```
- The `<cam></cam>` and `<gps></gps>` tags and its subtags are optional

### Change classes
- The classes for object detection and object segmentation are defined and/or referenced in:
  - `index.html`
  - `index.js`
  - `communication.js`
  - `xml_store.php`
- To use your own classes all of the above listed files have to be adjusted
#### ToDo
- Live-Update of dataset statistics (remove dataset_stats.py)
- Statistics for object segmentation
