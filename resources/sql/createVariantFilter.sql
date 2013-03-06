
DROP TABLE IF EXISTS `variant_filter`;
CREATE TABLE `variant_filter` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `version` bigint(20) NOT NULL DEFAULT 0,
  `variant_id` bigint(20) DEFAULT NULL,
  `filter` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_variant_filter_1` (`variant_id`),
  KEY `ifilt` (`filter`),
  CONSTRAINT `fk_variant_filter_1` FOREIGN KEY (`variant_id`) REFERENCES `pfx_variants` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB;

INSERT INTO variant_filter (variant_id, filter) SELECT pv.id, pf.filter FROM pfx_variants pv
    JOIN pfx_variant_filter pf ON 
        (pv.record_id = pf.record_id AND pv.cross_name = pf.cross_name AND
pv.method = pf.method AND
pv.chrom = pf.chrom AND
pv.snp = pf.snp AND
pv.pos = pf.pos)
    WHERE pv.record_id IS NOT NULL;

INSERT INTO variant_filter (variant_id, filter)
SELECT pv.id, pf.filter FROM pfx_variants pv
    JOIN pfx_variant_filter pf ON 
        pv.cross_name = pf.cross_name AND
pv.method = pf.method AND
pv.chrom = pf.chrom AND
pv.snp = pf.snp AND
pv.pos = pf.pos
WHERE (pv.record_id IS NULL);
