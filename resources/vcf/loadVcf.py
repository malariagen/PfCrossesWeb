import vcf
import config
import MySQLdb

def insertToDatabase(c, insertValues):
    c.executemany(
      """INSERT INTO pfx_variants (crossName, method, chrom, pos, ref, alt0, alt1, alt2, filter, qual, qd, mq)
      VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",insertValues)


db=MySQLdb.connect(host=config.DBSRV, user=config.DBUSER, passwd=config.DBPASS, db=config.DB, charset='utf8')
c=db.cursor()


def loadFile(vcfFile, crossName, method):
  insertValues = []
  vcf_reader = vcf.Reader(filename=vcfFile)
  for record in vcf_reader:
	t = crossName,method,record.CHROM,record.POS,record.REF.strip(),record.ALT[0],record.ALT[1] if len(record.ALT) > 1  else '',record.ALT[2] if len(record.ALT) > 2  else '',','.join(record.FILTER), record.QUAL,record.INFO['QD'],record.INFO['MQ']
	insertValues.append(t)
	if (len(insertValues) == 500):
           insertToDatabase(c, insertValues)
           insertValues = []
           db.commit()
           

  if (len(insertValues) > 0):
    insertToDatabase(c, insertValues)

  db.commit()


loadFile('/data/malariagen2/plasmodium/pf-crosses/data/release/1.0.GATK.RC1/3d7_hb3.gatk.both.release.vcf.gz', '3d7_hb3', 'gatk')
loadFile('/data/malariagen2/plasmodium/pf-crosses/data/release/1.0.GATK.RC1/hb3_dd2.gatk.both.release.vcf.gz', 'hb3_dd2', 'gatk')
loadFile('/data/malariagen2/plasmodium/pf-crosses/data/release/1.0.GATK.RC1/7g8_gb4.gatk.both.release.vcf.gz', '7g8_gb4', 'gatk')


