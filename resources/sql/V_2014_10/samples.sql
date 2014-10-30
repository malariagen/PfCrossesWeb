drop table if exists `samples`;

CREATE TABLE `samples` (
  `ExpName` varchar(10) DEFAULT NULL,
  `clone` varchar(7) DEFAULT NULL,
  `sample` varchar(9) DEFAULT NULL,
  `run` varchar(9) DEFAULT NULL,
  `instrument` varchar(27) DEFAULT NULL,
  `coverage` float DEFAULT NULL,
  `sort_order` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=99 DEFAULT CHARSET=latin1;

LOAD DATA LOCAL INFILE '/Users/pvaut/Documents/Genome/SnpCrossData3/V_2014_10/samples.txt' into table samples
        FIELDS TERMINATED BY '\t'
        LINES TERMINATED BY '\n'
        IGNORE 1 LINES
        (
      		`ExpName`,`clone`,`sample`,`run`,`instrument`,`coverage`
        )
;


SET @rownr=0;
UPDATE samples SET sort_order=@rownr:=@rownr+1 ORDER BY sample;
