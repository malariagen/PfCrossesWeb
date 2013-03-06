import vcf
import config
import MySQLdb

def insertToDatabase(c, insertValues):
    c.executemany(
      """INSERT INTO pfx_variants (record_id, cross_name, method, chrom, pos, ref, alt0, alt1, alt2, filter, qual, qd, mq, vqslod, site_conf, gene, snp, indel)
      VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",insertValues)

def insertFilters(c, filterValues):
    c.executemany(
      """INSERT INTO pfx_variant_filter (filter, record_id, cross_name, method, chrom, pos, snp)
      VALUES (%s, %s, %s, %s, %s, %s, %s)""",filterValues)

db=MySQLdb.connect(host=config.DBSRV, user=config.DBUSER, passwd=config.DBPASS, db=config.DB, charset='utf8')
c=db.cursor()


def loadFile(vcfFile, crossName, method):
  insertValues = []
  filterValues = []
  vcf_reader = vcf.Reader(filename=vcfFile)
  for record in vcf_reader:
	snp = 1
	indel = 0
	if (len(record.REF) > 1) :
		snp = 0
		indel = 1
	if (len(record.ALT[0]) > 1) :
		snp = 0
		indel = 1
	if (len(record.ALT) > 1 and len(record.ALT[1]) > 1) :
		snp = 0
		indel = 1
	if (len(record.ALT) > 2 and len(record.ALT[2]) > 1) :
		snp = 0
		indel = 1
	gene = None
	if ('GeneAnnotationID' in record.INFO) :
		gene = record.INFO['GeneAnnotationID']
	if (method == 'gatk'):
	  t = record.ID,crossName,method,record.CHROM,record.POS,record.REF.strip(),record.ALT[0],record.ALT[1] if len(record.ALT) > 1  else '',record.ALT[2] if len(record.ALT) > 2  else '',','.join(record.FILTER), record.QUAL,record.INFO['QD'],record.INFO['MQ'],record.INFO['VQSLOD'],None, gene, snp, indel
	if (method == 'cortex'):
	  t = record.ID,crossName,method,record.CHROM,record.POS,record.REF.strip(),record.ALT[0],record.ALT[1] if len(record.ALT) > 1  else '',record.ALT[2] if len(record.ALT) > 2  else '',','.join(record.FILTER), record.QUAL,None,None,None,None, gene, snp, indel
	for filt in record.FILTER:
	  f = filt,record.ID,crossName,method,record.CHROM,record.POS,snp
	  filterValues.append(f)

	insertValues.append(t)
	if (len(insertValues) == 500):
           insertToDatabase(c, insertValues)
           insertValues = []
	   insertFilters(c, filterValues)
	   filterValues = []
           db.commit()
           

  if (len(insertValues) > 0):
    insertToDatabase(c, insertValues)
    insertFilters(c, filterValues)

  db.commit()


loadFile('/data/malariagen2/plasmodium/pf-crosses/data/release/1.0.cortex.RC1/3d7_hb3.cortex.final.vcf.gz', '3d7_hb3', 'cortex')
loadFile('/data/malariagen2/plasmodium/pf-crosses/data/release/1.0.cortex.RC1/7g8_gb4.cortex.final.vcf.gz', '7g8_gb4', 'cortex')
loadFile('/data/malariagen2/plasmodium/pf-crosses/data/release/1.0.cortex.RC1/hb3_dd2.cortex.final.vcf.gz', 'hb3_dd2', 'cortex')

loadFile('/data/malariagen2/plasmodium/pf-crosses/data/release/1.0.GATK.RC6/3d7_hb3.gatk.both.release.vcf.gz', '3d7_hb3', 'gatk')
loadFile('/data/malariagen2/plasmodium/pf-crosses/data/release/1.0.GATK.RC6/hb3_dd2.gatk.both.release.vcf.gz', 'hb3_dd2', 'gatk')
loadFile('/data/malariagen2/plasmodium/pf-crosses/data/release/1.0.GATK.RC6/7g8_gb4.gatk.both.release.vcf.gz', '7g8_gb4', 'gatk')

