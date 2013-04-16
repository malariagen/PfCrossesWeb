mysqldump --skip-add-locks --skip-lock-tables -u root pfx variants_filtered chrom gene pfx_samples variants_filtered variant_filter | gzip > pfx.sql.gz
