''' ########################################################################
 ''
 '' File....:	move_empty_annotations.py
 '' Function:	Move images and annotations with the tag "empty" from the
 ''             "unfinished" folder to the "empty" folder
 '' Author..:	Alexander Leipnitz
 '' Date....:	15.10.2020
 ''
 ######################################################################### '''

from xml.etree import ElementTree as xml
import os

def main():
    # list all subfolders
    base_path_input_xml = '../data/unfinished/annotations/'
    base_path_output_xml = '../data/empty/annotations/'
    base_path_input_img = '../data/unfinished/imgs/'
    base_path_output_img = '../data/empty/imgs/'
    base_path_input_img_small = '../data/unfinished/imgs_small/'
    base_path_output_img_small = '../data/empty/imgs_small/'

    dirlist = os.listdir(base_path_input_xml)
    print('directory list: ', dirlist)

    # Loop over all unfinished_annotations folders (dates)
    for i in range(len(dirlist)):
        vidlist = os.listdir(os.path.join(base_path_input_xml, dirlist[i]))
        # Loop over all unfinished_annotations subfolders (individual videos)
        for j in range(len(vidlist)):
            # Build paths
            inputdir_xml = os.path.join(base_path_input_xml, os.path.join(dirlist[i], vidlist[j]))
            outputdir_xml = os.path.join(base_path_output_xml, os.path.join(dirlist[i], vidlist[j]))
            inputdir_img = os.path.join(base_path_input_img, os.path.join(dirlist[i], vidlist[j]))
            outputdir_img = os.path.join(base_path_output_img, os.path.join(dirlist[i], vidlist[j]))
            inputdir_img_small = os.path.join(base_path_input_img_small, os.path.join(dirlist[i], vidlist[j]))
            outputdir_img_small = os.path.join(base_path_output_img_small, os.path.join(dirlist[i], vidlist[j]))
            
            filelist = os.listdir(inputdir_xml)
            print('filelist: ', filelist)

            # Loop over all annotations from that date and video
            for file_idx in range(len(filelist)):
                if os.path.splitext(filelist[file_idx])[1] == ".xml":
                    # xml_file = base_path_xml + img_name + '.xml'
                    xml_file = os.path.join(inputdir_xml, filelist[file_idx])
                    tree = xml.parse(xml_file) # parse the xml
                    root = tree.getroot()
                    for xml_object in root.findall( 'status'): #check tags
                        if xml_object.text == 'empty':
                            # Create destination-paths if not available
                            if not os.path.exists(outputdir_xml):
                                os.makedirs(outputdir_xml)
                            if not os.path.exists(outputdir_img):
                                os.makedirs(outputdir_img)
                            if not os.path.exists(outputdir_img_small):
                                os.makedirs(outputdir_img_small)
                            #move xml
                            os.rename(xml_file, os.path.join(outputdir_xml, filelist[file_idx]))
                            img_name = filelist[file_idx].replace(".xml", ".jpg")
                            os.rename(os.path.join(inputdir_img, img_name),  os.path.join(outputdir_img, img_name))
                            os.rename(os.path.join(inputdir_img_small, img_name),  os.path.join(outputdir_img_small, img_name))

if __name__ == "__main__":
    main()
