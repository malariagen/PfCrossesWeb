
DROP TABLE IF EXISTS `variant_filter_descrip`;
CREATE TABLE `variant_filter_descrip` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `version` bigint(20) NOT NULL DEFAULT 0,
  `filter` varchar(128) DEFAULT NULL,
  `method` varchar(64) DEFAULT NULL,
  `description` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

