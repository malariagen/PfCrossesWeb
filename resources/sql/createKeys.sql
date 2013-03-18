
DROP TABLE IF EXISTS `variant_chrom`;
DROP TABLE IF EXISTS `variant_gene`;
DROP TABLE IF EXISTS `variants_filtered`;
CREATE TABLE `variants_filtered` SELECT * FROM v_variants_filtered;

ALTER TABLE `variants_filtered` 
  CHANGE COLUMN `id` `id` BIGINT(20) NOT NULL AUTO_INCREMENT, 
  CHANGE COLUMN `alt` `alt` VARCHAR(512) NULL DEFAULT NULL,
  ADD COLUMN `unique_method` INT(1) DEFAULT 0,
  ADD COLUMN `unique_cross` INT(1) DEFAULT 0,
  ADD PRIMARY KEY (`id`),
  ADD INDEX `ipos` (`pos`),
  ADD INDEX `ichrom` (`chrom`),
  ADD INDEX `icross` (`cross_name`),
  ADD INDEX `imethod` (`method`),
  ADD INDEX `vkey` (`record_id`,`cross_name`,`method`,`chrom`,`pos`,`snp`),
  ADD INDEX `icomb` (`chrom`,`pos`,`ref`,`alt`, `cross_name`),
  ADD INDEX `irec` (`record_id`),
  ADD INDEX `isc` (`site_conf`),
  ADD INDEX `ivq` (`vqslod`,`snp`),
ADD INDEX `igene` (`gene` ASC) ;

CREATE TEMPORARY TABLE t_uc AS select this_.id 
from variants_filtered this_ 
 group by chrom, pos, ref, alt, method having count(*) = 1;

ALTER TABLE t_uc
ADD PRIMARY KEY(`id`);

UPDATE variants_filtered SET unique_cross = 1 WHERE id in (select id FROM t_uc);

 DROP TEMPORARY TABLE t_uc;

 CREATE TEMPORARY TABLE t_uc AS select this_.id 
from variants_filtered this_ 
 group by chrom, pos, ref, alt, cross_name having count(*) = 1;

ALTER TABLE t_uc
ADD PRIMARY KEY(`id`);

UPDATE variants_filtered SET unique_method = 1 WHERE id in (select id FROM t_uc);

 DROP TEMPORARY TABLE t_uc;
 
 ALTER TABLE `variants_filtered`
   ADD INDEX `iunique1` (`unique_cross`),
   ADD INDEX `iunique2` (`unique_method`);
 	
DROP TABLE IF EXISTS `chrom`;
CREATE TABLE chrom SELECT DISTINCT(chrom) FROM variants_filtered;

ALTER TABLE `chrom`
 ADD COLUMN `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
 ADD PRIMARY KEY (`id`),
 ADD COLUMN `version` BIGINT(20) NOT NULL DEFAULT 0;


CREATE TABLE variant_chrom 
SELECT vf.id as variants_filtered_id,c.id as chrom_id FROM variants_filtered vf
    JOIN chrom c ON c.chrom = vf.chrom;

ALTER TABLE `variant_chrom` 
  ADD CONSTRAINT `fk_variant_chrom_1`
  FOREIGN KEY (`variants_filtered_id` )
  REFERENCES `variants_filtered` (`id` )
  ON DELETE NO ACTION
  ON UPDATE NO ACTION, 
  ADD CONSTRAINT `fk_variant_chrom_2`
  FOREIGN KEY (`chrom_id` )
  REFERENCES `chrom` (`id` )
  ON DELETE NO ACTION
  ON UPDATE NO ACTION
, ADD INDEX `fk_variant_chrom_1` (`variants_filtered_id` ASC) 
, ADD INDEX `fk_variant_chrom_2` (`chrom_id` ASC) ;


DROP TABLE IF EXISTS `gene`;
CREATE TABLE gene SELECT gene, chrom,MIN(pos) as min_pos, MAX(pos) as max_pos FROM variants_filtered GROUP BY gene, chrom;

ALTER TABLE `gene`
 ADD COLUMN `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
 ADD PRIMARY KEY (`id`),
 ADD COLUMN `version` BIGINT(20) NOT NULL DEFAULT 0;


CREATE TABLE variant_gene 
SELECT vf.id as variants_filtered_id,c.id as gene_id FROM variants_filtered vf
    JOIN gene c ON c.gene = vf.gene and c.chrom = vf.chrom;

ALTER TABLE `variant_gene` 
  ADD CONSTRAINT `fk_variant_gene_1`
  FOREIGN KEY (`variants_filtered_id` )
  REFERENCES `variants_filtered` (`id` )
  ON DELETE NO ACTION
  ON UPDATE NO ACTION, 
  ADD CONSTRAINT `fk_variant_gene_2`
  FOREIGN KEY (`gene_id` )
  REFERENCES `gene` (`id` )
  ON DELETE NO ACTION
  ON UPDATE NO ACTION
, ADD INDEX `fk_variant_gene_1` (`variants_filtered_id` ASC) 
, ADD INDEX `fk_variant_gene_2` (`gene_id` ASC) ;

UPDATE gene SET gene = '' WHERE gene IS NULL;



