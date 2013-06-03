#!/bin/bash

qsub -cwd -V -N CVT1 'python MergeTracks.py /data/galton2/plasmodium/PfPopGenWeb/data/stats Coverage MAL1 450000 460000'
