#!/bin/bash

scp pvaut@foxtrot:/data/plasmodium/pfalciparum/pf-crosses/data/genome/sanger/version3/September_2012/Pf3D7_v3.fa .

python ../Fasta2FilterBankInput.py Pf3D7_v3.fa

python /srv/src/alpha-sandbox/dqx_server30/_CreateFilterBankData.py . Summ01

#scp pvaut@foxtrot:/data/plasmodium/pfalciparum/pf-crosses/data/genome/sanger/version3/September_2012/Pf3D7_v3.trf.txt.gz TandemRepeats
