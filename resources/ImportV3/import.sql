source create.sql;

alter table variants3 add column chrom_pos varchar(30);
ALTER TABLE variants3 ADD id INT PRIMARY KEY AUTO_INCREMENT;

source 3d7_hb3_cortex_dump.sql;
source 3d7_hb3_gatk_dump.sql;
source 7g8_gb4_cortex_dump.sql;
source 7g8_gb4_gatk_dump.sql;
source hb3_dd2_cortex_dump.sql;
source hb3_dd2_gatk_dump.sql;

update variants3 set chrom_pos = concat(chrom, ':', pos);
create index varid on variants3(chrom_pos);

create index chrom_pos on variants3(chrom,pos);
create index exp_meth_chrom_pos on variants3(ExpName,Method,chrom,pos);
create index exp_meth on variants3(ExpName,Method);


alter table variants3 add column indel int(1);
update variants3 set indel = (length(REF)>1) or (length(ALT)>1);