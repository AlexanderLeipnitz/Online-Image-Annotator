""" ########################################################################
 ''
 '' File....:	dataset_stats.py
 '' Function:	Calculate global statistics for the current dataset
 '' Author..:	Alexander Leipnitz
 '' Date....:	15.05.2020
 ''
 ######################################################################### """

import os
from xml.etree import ElementTree as xml
from tqdm import tqdm

# Paths to the different parts of the dataset
finished_annotations = "../data/finished/annotations/"
unfinished_annotations = "../data/unfinished/annotations/"
empty_annotations = "../data/empty/annotations/"

output_file = "../stats.csv"  # Location and filename of the result-file (.csv)

classes = ["person", "technic", "animal"]  # Classnames in the data
stats_per_class = []

num_of_finished_annotations = 0
num_of_unfinished_annotations = 0
num_of_empty_annotations = 0

# Initialize each class
for i in range(len(classes)):
    stats_per_class.append(
        {
            "num_of_boxes": 0,
            "min_size_abs": 999999,
            "max_size_abs": 0,
            "summed_size_abs": 0,
        }
    )

dirlist = os.listdir(finished_annotations)
# Loop over all finished_annotations folders (dates)
for i in tqdm(range(len(dirlist))):
    vidlist = os.listdir(os.path.join(finished_annotations, dirlist[i]))
    # Loop over all finished_annotations subfolders (individual videos)
    for j in range(len(vidlist)):
        inputdir = os.path.join(
            finished_annotations, os.path.join(dirlist[i], vidlist[j])
        )
        filelist = os.listdir(inputdir)
        # print('filelist: ', filelist)

        # Loop over all annotations from that date and video
        for file_idx in range(len(filelist)):
            if os.path.splitext(filelist[file_idx])[1] == ".xml":
                xml_file = os.path.join(inputdir, filelist[file_idx])
                num_of_finished_annotations += 1
                tree = xml.parse(xml_file)  # read the xml-file into memory
                root = tree.getroot()
                list_rects = []
                # Loop over all annotated objects
                for xml_object in root.findall("object"):
                    obj_name = xml_object.find("name").text
                    bndbox = xml_object.find("bndbox")
                    xmin = int(float(bndbox.find("xmin").text))
                    ymin = int(float(bndbox.find("ymin").text))
                    xmax = int(float(bndbox.find("xmax").text))
                    ymax = int(float(bndbox.find("ymax").text))
                    box_width = abs(xmax - xmin)
                    box_height = abs(ymax - ymin)
                    box_size_abs = box_width * box_height

                    class_idx = classes.index(obj_name)
                    stats_per_class[class_idx]["num_of_boxes"] += 1
                    # Check for biggest box
                    if box_size_abs > stats_per_class[class_idx]["max_size_abs"]:
                        stats_per_class[class_idx]["max_size_abs"] = box_size_abs
                    # Check for smallest box
                    if box_size_abs < stats_per_class[class_idx]["min_size_abs"]:
                        stats_per_class[class_idx]["min_size_abs"] = box_size_abs

                    stats_per_class[class_idx]["summed_size_abs"] += box_size_abs

# Loop over all unfinished_annotations folders (dates)
dirlist = os.listdir(unfinished_annotations)
for i in tqdm(range(len(dirlist))):
    vidlist = os.listdir(os.path.join(unfinished_annotations, dirlist[i]))
    # Loop over all unfinished_annotations subfolders (individual videos)
    for j in range(len(vidlist)):
        inputdir = os.path.join(
            unfinished_annotations, os.path.join(dirlist[i], vidlist[j])
        )
        filelist = os.listdir(inputdir)
        # print('filelist: ', filelist)

        # Loop over all annotations from that date and video
        for file_idx in range(len(filelist)):
            if os.path.splitext(filelist[file_idx])[1] == ".xml":
                num_of_unfinished_annotations += 1

# Loop over all empty_annotations folders (dates)
dirlist = os.listdir(empty_annotations)
for i in tqdm(range(len(dirlist))):
    vidlist = os.listdir(os.path.join(empty_annotations, dirlist[i]))
    # Loop over all empty_annotations subfolders (individual videos)
    for j in range(len(vidlist)):
        inputdir = os.path.join(empty_annotations, os.path.join(dirlist[i], vidlist[j]))
        filelist = os.listdir(inputdir)
        # print('filelist: ', filelist)

        # Loop over all annotations from that date and video
        for file_idx in range(len(filelist)):
            if os.path.splitext(filelist[file_idx])[1] == ".xml":
                num_of_empty_annotations += 1

# Write all statistics to .csv-file
file = open(output_file, "w")
file.write("num_of_finished_annotations,{}\n".format(num_of_finished_annotations))
file.write("num_of_unfinished_annotations,{}\n".format(num_of_unfinished_annotations))
file.write("num_of_empty_annotations,{}\n".format(num_of_empty_annotations))

for i in range(len(classes)):
    file.write(
        "{}_num_of_boxes,{}\n".format(classes[i], stats_per_class[i]["num_of_boxes"])
    )
    file.write(
        "{}_min_size_abs,{}\n".format(classes[i], stats_per_class[i]["min_size_abs"])
    )
    file.write(
        "{}_max_size_abs,{}\n".format(classes[i], stats_per_class[i]["max_size_abs"])
    )
    file.write(
        "{}_summed_size_abs,{}\n".format(
            classes[i], stats_per_class[i]["summed_size_abs"]
        )
    )

file.close()
