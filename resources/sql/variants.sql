DROP TABLE IF EXISTS `variant_filter`;
DROP TABLE IF EXISTS `pfx_variant_filter`;
DROP TABLE IF EXISTS `pfx_variants`;
CREATE TABLE `pfx_variants` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `record_id` varchar(64) COLLATE utf8_bin DEFAULT NULL,
  `cross_name` varchar(15) COLLATE utf8_bin DEFAULT NULL,
  `method` varchar(15) COLLATE utf8_bin DEFAULT NULL,
  `chrom` varchar(64) COLLATE utf8_bin DEFAULT NULL,
  `pos` bigint(20) DEFAULT NULL,
  `ref` varchar(512) COLLATE utf8_bin DEFAULT NULL,
  `alt0` varchar(512) COLLATE utf8_bin DEFAULT NULL,
  `alt1` varchar(64) COLLATE utf8_bin DEFAULT NULL,
  `alt2` varchar(64) COLLATE utf8_bin DEFAULT NULL,
  `qual` decimal(9,2) DEFAULT NULL,
  `filter` varchar(128) COLLATE utf8_bin DEFAULT NULL,
  `qd` decimal(5,2) DEFAULT NULL,
  `mq` decimal(5,2) DEFAULT NULL,
  `vqslod` decimal(9,4) DEFAULT NULL,
  `site_conf` varchar(64) COLLATE utf8_bin DEFAULT NULL,
  `gene` varchar(64) COLLATE utf8_bin DEFAULT NULL,
  `snp` tinyint(1) DEFAULT NULL,
  `indel` tinyint(1) DEFAULT NULL,
  `version` bigint(20) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `ipos` (`pos`),
  KEY `ichrom` (`chrom`),
  KEY `icross` (`cross_name`),
  KEY `imethod` (`method`),
  KEY `vkey` (`record_id`,`cross_name`,`method`,`chrom`,`pos`,`snp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
