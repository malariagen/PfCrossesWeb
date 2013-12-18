


create table genomeregions (chromid varchar(20), fstart int, fstop int, fname varchar(30));


LOAD DATA LOCAL INFILE '/home/pvaut/Documents/Genome/SnpDataCross3/GenomeRegions.bed'     INTO TABLE genomeregions     FIELDS TERMINATED BY ' '     LINES TERMINATED BY '\n';