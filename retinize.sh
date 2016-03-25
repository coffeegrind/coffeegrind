#!/bin/bash
# converts all retina images to half size
for file in images/*@2x.png; do
  convert "$file" -resize 50% "${file//@2x/}"
done
