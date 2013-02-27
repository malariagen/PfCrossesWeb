DROP TABLE IF EXISTS `pfx_variants`;
CREATE TABLE `pfx_variants` (
 id bigint(20) auto_increment,
 cross_name varchar(15),
 method varchar(15),
 chrom varchar(64) NULL default NULL,
 pos bigint(20) NULL default NULL,
 ref varchar(512) NULL default NULL,
 alt0 varchar(512) NULL default NULL,
 alt1 varchar(64) NULL default NULL,
 alt2 varchar(64) NULL default NULL,
 qual  decimal(9,2) NULL default NULL,
 filter varchar(128) NULL default NULL,
 qd  decimal(5,2) NULL default NULL,
 mq  decimal(5,2) NULL default NULL,
 PRIMARY KEY(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
