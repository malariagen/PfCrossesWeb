#!/bin/bash

#scp pvaut@foxtrot:/data/plasmodium/pfalciparum/pf-crosses/data/genome/sanger/version3/September_2012/Pf3D7_v3.trf.txt.gz .
#gunzip Pf3D7_v3.trf.txt.gz

scp pvaut@foxtrot:/data/plasmodium/pfalciparum/pf-crosses/data/genome/sanger/version3/September_2012/Pf3D7_v3.fa.2.7.7.80.10.50.500.dat .

python ../ConvertTandemRepeats.py Pf3D7_v3.fa.2.7.7.80.10.50.500.dat tandem.txt

mysql -u root -p pfx < ImportTandemRepeats.sql

