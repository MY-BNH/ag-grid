#!/usr/bin/env bash

if [ "$#" -lt 2 ]
  then
    echo "You must supply the parent dir and at least one module to build"
    exit 1
fi


## for all the modules
declare -a modules=${@:2}

for module in "${modules[@]}"
do
    cd "$1/$2"

    case $1 in
        "ag-grid-enterprise"|"ag-grid")
            gulp release
            ;;
        "ag-grid-ng2")
            npm run release
            ;;
        "ag-grid-react")
            gulp
            ;;
         "ag-grid-aurelia")
            npm i aurelia-framework
            npm run build
            ;;
    esac

    cd ../../
done


