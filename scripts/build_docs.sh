#!/bin/bash

TAGS=$(<hikogui_versions.txt)

for TAG in ${TAGS}
do
  echo "Checking out version: $TAG"

  (cd hikogui; git checkout -q "${TAG}")

  if [[ $TAG == v* ]];
  then
    VER="${TAG:1}"
  else
    VER=$TAG
  fi

  echo "Environment variables used by Doxygen config:"
  export HIKOGUI_TAG="${TAG}"
  export HIKOGUI_VERSION="${VER}"
  echo "HIKOGUI_TAG     -> $HIKOGUI_TAG"
  echo "HIKOGUI_VERSION -> $HIKOGUI_VERSION"

  mkdir -p "docs/hikogui/${HIKOGUI_VERSION}"

  echo " - [${HIKOGUI_VERSION}](hikogui/${HIKOGUI_VERSION})" >> scripts/docs_readme.md

  echo "Current working dir: $PWD"

  doxygen scripts/Doxyfile

done
