DROP TABLE IF EXISTS `samples`;
CREATE TABLE `samples` (
`project_code` varchar(64) NULL default NULL,
`sample_id` varchar(64) NULL default NULL,
`ox_code` varchar(64) NULL default NULL,
`source_code` varchar(64) NULL default NULL,
`sra_accession` varchar(64) NULL default NULL,
`crossName` varchar(64) NULL default NULL,
`Run` varchar(64) NULL default NULL,
`Instrument_Model` varchar(64) NULL default NULL,
`Library_Name` varchar(64) NULL default NULL,
`Run_Read_Count` varchar(64) NULL default NULL,
`Run_Base_Count` varchar(64) NULL default NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;