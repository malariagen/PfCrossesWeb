DROP TABLE IF EXISTS tandemrepeats;
CREATE TABLE tandemrepeats (
    chromid varchar(15),
    fid varchar(20),
    fstart INT,
    fstop INT,
    psize INT,
    nrcopies FLOAT,
    sizeconsens INT,
    percentmatches FLOAT,
    percentindels FLOAT,
    alignscore FLOAT,
    compa FLOAT,
    compc FLOAT,
    compg FLOAT,
    compt FLOAT,
    entropy FLOAT,
    pattern varchar(2000)
);

LOAD DATA INFILE '/mnt/storage/webapps/Tracks-Cross/TandemRepeats/tandem.txt'
    INTO TABLE tandemrepeats
    FIELDS TERMINATED BY ' '
    LINES TERMINATED BY '\n'
    ;
    
ALTER TABLE tandemrepeats ADD COLUMN fname varchar(30);
ALTER TABLE tandemrepeats ADD COLUMN ftype varchar(30);
ALTER TABLE tandemrepeats ADD COLUMN fparentid varchar(30);

SET SQL_SAFE_UPDATES=0;
UPDATE tandemrepeats SET ftype='repeat';
UPDATE tandemrepeats SET fname='';
UPDATE tandemrepeats SET fparentid='';


CREATE INDEX td_chrom on tandemrepeats (chromid);
CREATE INDEX td_pos1 on tandemrepeats (fstart);
CREATE INDEX td_pos2 on tandemrepeats (fstop);
CREATE INDEX td_id on tandemrepeats (fid);
CREATE INDEX td_type on tandemrepeats (ftype);
