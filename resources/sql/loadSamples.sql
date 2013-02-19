LOAD DATA LOCAL INFILE '/data/malariagen2/plasmodium/pf-crosses/meta/20121206/samples.txt' into table samples

        FIELDS TERMINATED BY '\t' ENCLOSED BY '"' ESCAPED BY '"'

        LINES TERMINATED BY '\n'

        IGNORE 1 LINES 

        (

      		`project_code`,`sample_id`,`ox_code`,`source_code`,`sra_accession`,`crossName`,`Run`,`Instrument_Model`,`Library_Name`,`Run_Read_Count`,`Run_Base_Count`

        )

        ;
