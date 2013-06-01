#!/bin/bash

#3d7_hb3  7g8_gb4  hb3_dd2

#scp pvaut@foxtrot:/data/plasmodium/pfalciparum/pf-crosses/meta/20121206/3d7_hb3.runs.qcpass.txt .
#scp pvaut@foxtrot:/data/plasmodium/pfalciparum/pf-crosses/meta/20121206/7g8_gb4.runs.qcpass.txt .
#scp pvaut@foxtrot:/data/plasmodium/pfalciparum/pf-crosses/meta/20121206/hb3_dd2.runs.qcpass.txt .

#scp -r pvaut@foxtrot:/home/pvaut/PfCrossesWebAppImport/results .
#mv results/Coverage .
#mv resuls/MapQuality .

cp Coverage_Summ01.cnf Coverage/3d7_hb3/Summ01.cnf
cp Coverage_Summ01.cnf Coverage/7g8_gb4/Summ01.cnf
cp Coverage_Summ01.cnf Coverage/hb3_dd2/Summ01.cnf

cp MapQuality_Summ01.cnf MapQuality/3d7_hb3/Summ01.cnf
cp MapQuality_Summ01.cnf MapQuality/7g8_gb4/Summ01.cnf
cp MapQuality_Summ01.cnf MapQuality/hb3_dd2/Summ01.cnf

#cd /mnt/storage/webapps/Tracks-Cross/Coverage/3d7_hb3
#python /srv/src/alpha-sandbox/dqx_server30/_CreateFilterBankData.py . Summ01
cd /mnt/storage/webapps/Tracks-Cross/Coverage/7g8_gb4
python /srv/src/alpha-sandbox/dqx_server30/_CreateFilterBankData.py . Summ01
cd /mnt/storage/webapps/Tracks-Cross/Coverage/hb3_dd2
python /srv/src/alpha-sandbox/dqx_server30/_CreateFilterBankData.py . Summ01



cd /mnt/storage/webapps/Tracks-Cross/MapQuality/3d7_hb3
python /srv/src/alpha-sandbox/dqx_server30/_CreateFilterBankData.py . Summ01
cd /mnt/storage/webapps/Tracks-Cross/MapQuality/7g8_gb4
python /srv/src/alpha-sandbox/dqx_server30/_CreateFilterBankData.py . Summ01
cd /mnt/storage/webapps/Tracks-Cross/MapQuality/hb3_dd2
python /srv/src/alpha-sandbox/dqx_server30/_CreateFilterBankData.py . Summ01
