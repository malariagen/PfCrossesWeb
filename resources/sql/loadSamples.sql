LOAD DATA LOCAL INFILE '/data/malariagen2/plasmodium/pf-crosses/meta/20121206/qcmeta.txt' into table pfx_samples

        FIELDS TERMINATED BY '\t' ENCLOSED BY '"' ESCAPED BY '"'

        LINES TERMINATED BY '\n'

        IGNORE 1 LINES 
        (
      		`project_code`,`id`,`ox_code`,`source_code`,`sra_accession`,`cross`,`run`,`Instrument_Model`,`Library_Name`,`Run_Read_Count`,`Run_Base_Count`,`total`,`percent_mapped`,`percent_properly_paired`,`percent_singletons`,`percent_mate_other_chr`,`percent_duplicates`,`coverage`
        )

        ;
