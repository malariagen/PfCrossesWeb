#!/bin/bash

scp pvaut@foxtrot:/data/plasmodium/pfalciparum/pf-crosses/data/genome/sanger/version3/September_2012/Pf3D7_v3.gc.300.txt.gz .
rm GC300.txt
gunzip Pf3D7_v3.gc.300.txt.gz
mv Pf3D7_v3.gc.300.txt GC300.txt

python ../SplitByChromosome.py GC300

python /srv/src/alpha-sandbox/dqx_server30/_CreateFilterBankData.py . Summ01

#scp pvaut@foxtrot:/data/plasmodium/pfalciparum/pf-crosses/data/genome/sanger/version3/September_2012/Pf3D7_v3.fa Sequence
#scp pvaut@foxtrot:/data/plasmodium/pfalciparum/pf-crosses/data/genome/sanger/version3/September_2012/Pf3D7_v3.uniqueness_to500.txt.gz Uniqueness
#scp pvaut@foxtrot:/data/plasmodium/pfalciparum/pf-crosses/data/genome/sanger/version3/September_2012/Pf3D7_v3.trf.txt.gz TandemRepeats
