#!/bin/bash

scp pvaut@foxtrot:/data/plasmodium/pfalciparum/pf-crosses/data/genome/sanger/version3/September_2012/Pf3D7_v3.uniqueness_to500.txt.gz .
rm Uniqueness.txt
gunzip Pf3D7_v3.uniqueness_to500.txt.gz
mv Pf3D7_v3.uniqueness_to500.txt Uniqueness.txt

python ../SplitByChromosome.py Uniqueness

python /srv/src/alpha-sandbox/dqx_server30/_CreateFilterBankData.py . Summ01

#scp pvaut@foxtrot:/data/plasmodium/pfalciparum/pf-crosses/data/genome/sanger/version3/September_2012/Pf3D7_v3.fa Sequence
#scp pvaut@foxtrot:/data/plasmodium/pfalciparum/pf-crosses/data/genome/sanger/version3/September_2012/Pf3D7_v3.trf.txt.gz TandemRepeats
