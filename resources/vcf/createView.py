import re
import vcf
import config
import MySQLdb

def convert(name):
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

db=MySQLdb.connect(host=config.DBSRV, user=config.DBUSER, passwd=config.DBPASS, db=config.DB, charset='utf8')
c=db.cursor()

fupdates = []
fQuery = "UPDATE pfx_variant_filter "
c.execute("""SELECT DISTINCT filter from variant_filter""")

fields='''SELECT pv.*,CONCAT_WS(',',pv.alt0,pv.alt1,pv.alt2) as alt,COALESCE(pv1.vqslod,999999) as vqslod_snp,COALESCE(pv2.vqslod,999999) as vqslod_indel, TRIM(leading '0' FROM substr(substr(pv.chrom,7),1,2)) as chrom_num, CONCAT(TRIM(leading '0' FROM substr(substr(pv.chrom,7),1,2)),':',pv.pos) as chrom_pos,'''
fromTab=''' FROM pfx_variants pv\n'''
joins=''' LEFT JOIN pfx_variants pv1 ON pv1.id = pv.id AND pv1.snp = 1
 LEFT JOIN pfx_variants pv2 ON pv2.id = pv.id AND pv2.indel = 1
'''
for row in c.fetchall() :
	colname = row[0].replace(",","__")
	joins += " LEFT JOIN variant_filter "+colname+" ON "
	joins += "("+colname+".variant_id = pv.id ) AND "
	joins += colname+".filter = '"+colname+"'\n";
	fields += "IF("+colname+".filter IS NOT NULL,1,0) AS "+convert(colname)+","
	fQuery1 = fQuery + " SET filter = '"+convert(colname)+ "' WHERE filter = '"+ colname + "'"
	fupdates.append(fQuery1)

viewQuery="CREATE OR REPLACE VIEW `v_variants_filtered` as "+fields.rstrip(",")+ fromTab+ joins+";"
print viewQuery;
c.execute(viewQuery);

for upd in fupdates:
	c.execute(upd)

db.commit()
