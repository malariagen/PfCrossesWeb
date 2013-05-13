mysql -u root pfx < ../sql/variants.sql 
mysql -u root pfx < ../sql/variantFilters.sql 
mysql -u root pfx < ../sql/createVariantFilterDescrip.sql
date;python loadVcf.py ; date
mysql -u root pfx < ../sql/createVariantFilter.sql
python createView.py
mysql -u root pfx < ../sql/createKeys.sql
