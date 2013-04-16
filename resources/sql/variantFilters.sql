DROP TABLE IF EXISTS `pfx_variant_filter`;
CREATE TABLE `pfx_variant_filter` (
  `filter` varchar(64)  DEFAULT NULL,
  `record_id` varchar(64)  DEFAULT NULL,
  `cross_name` varchar(15)  DEFAULT NULL,
  `method` varchar(15)  DEFAULT NULL,
  `chrom` varchar(64)  DEFAULT NULL,
  `pos` bigint(20) DEFAULT NULL,
  `snp` tinyint(1) DEFAULT NULL,
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `version` bigint(20) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_pfx_variant_filter_1` (`record_id`,`cross_name`,`method`,`chrom`,`pos`,`snp`),
  CONSTRAINT `fk_pfx_variant_filter_1` FOREIGN KEY (`record_id`,`cross_name`, `method`, `chrom`, `pos`, `snp`) REFERENCES `pfx_variants` (`record_id`,`cross_name`, `method`, `chrom`, `pos`, `snp`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
