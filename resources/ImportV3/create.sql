drop table if exists variants3;CREATE TABLE variants3 (
   ExpName varchar(7),
   Method varchar(7),
   chrom varchar(11),
   pos int,
   GeneId varchar(24),
   REF varchar(49),
   ALT varchar(53),
   Effect varchar(33),
   AminoAcidChange varchar(180),
   RegionType varchar(25),
   GC float,
   STR float,
   RU varchar(23),
   FILTER varchar(110),
   SITE_CONF float,
   VQSLOD float,
   BaseQRankSum float,
   DP float,
   FS float,
   HaplotypeScore float,
   HRun float,
   KMER float,
   SVLEN float,
   SVTYPE varchar(30),
   MQ float,
   MQ0Fraction float,
   MQRankSum float,
   QD float,
   ReadPosRankSum float,
   UQ float,
   DUP_ALLELE float,
   MAPQ float,
   MISMAPPED_UNPLACEABLE float,
   MULTIALLELIC float,
   OVERLAPPING_SITE float,
   LOW_CONFIDENCE int(1),
   NON_MENDELIAN int(1),
   MISSING_PARENT int(1),
   NON_SEGREGATING int(1),
   DUP_SITE int(1),
   NON_CORE int(1),
   LOW_CONFIDENCE_PARENT int(1),
   CNV int(1),
   PF_FAIL_ERROR int(1),
   PF_FAIL_REPEAT int(1)
);
