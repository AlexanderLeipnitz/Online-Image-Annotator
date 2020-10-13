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
- Install any webserver (e.g. Apache) and configure it to run PHP. Recommended:
  - Linux: LAMP
  - Windows: XAMPP
- Clone the repository into the document root directory of the webserver 
  `git clone https://github.com/AlexanderLeipnitz/BoundingBox-web-Annotator`
- Run `maintenance_scripts/dataset_stats.py` periodically if you want display up-to-date dataset statistics
## Usage
- `Show Annotation Type` switches between the finished and unfinished folder and displays only the images from them
- `Finished Annotation?` moves the current unfinished image and its annotation file to the `finished` folder when the next image is selected
### Object detection:
- `Image empty?` moves the current image and its annotation file to the `empty` folder when the next image is selected
### Object segmentation:
- `Segmentation Images Only` loads images from a optional fourth `segmentation` folder
- `Save Polygon to png` creates an additional annotation-image with filled polygons in the `annotations` folder
- Folder structure: 
  ```
  -- data/
     |-- finished/
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
     |-- unfinished/
     |   |-- annotations/
     |   |   |-- subfolder2/        (e.g. shooting date)
     |   |       |-- subfolder22/   (e.g. individual video)
     |   |           -- *.xml       (list of annotation files)
     |   |-- imgs/
     |   |   |-- subfolder2/        (e.g. shooting date)
     |   |        |-- subfolder22/   (e.g. individual video)
     |   |            -- *.jpg       (list of images)
     |   |-- imgs_small/
     |       |-- subfolder2/        (e.g. shooting date)
     |           |-- subfolder22/   (e.g. individual video)
     |               -- *.jpg       (list of downsampled images) 
     |-- empty/
     |    |-- annotations/
     |    |   |-- subfolder3/        (e.g. individual video)
     |    |       |-- subfolder33/   (e.g. individual video)
     |    |           -- *.xml       (list of annotation files)
     |    |-- imgs/
     |        |-- subfolder3/        (e.g. individual video)
     |            |-- subfolder33/   (e.g. individual video)
     |                -- *.jpg       (list of images)
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