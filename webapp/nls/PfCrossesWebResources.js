define({

  root: {
     variant_filters: "Variant Filters (check to exclude)",
	 variantTypeOptionsContainer: "Variant type",
	 genomeSearchOptionsContainer: "Genome region",
	 genomeSearchChromosome: 'Chromosome',
	 genomeSearchStart: 'Start',
	 genomeSearchEnd: 'Stop',
	 genomeSearchClear: 'Clear',
	 filtersSetAll: 'apply all',
	 filtersSetNone: 'apply none',
	 variantCallSet: 'Variant call set',
	 variantsHelp: "The variant catalogues display basic properties of SNPs and indels discovered in the crosses. There are several catalogues for each cross, for variants discovered by different methods.",
	 variantsDescrip: "SNPs and indels",
	 x3d7_hb3: "3D7 x HB3",
	 xhb3_dd2: "HB3 x DD2",
	 x7g8_gb4: "7G8 x GB4",
	 samplesHelp: "This page displays metadata about the samples that have been sequenced, with some summary statistics and links to the European Nucleotide Archive where the sequence data are held.",
	 samplePanelHeader: "Sample set",
	 appName: "<i>P. falciparum</i> genetic crosses data release 2013 - ",
	 samplesPageHeader: "Sample Metadata",
	 variantsPageHeader: "Variant Call Sets",
	 genotypePageHeader: "Genotype Calls",
	 genomePageHeader: "Genome Accessibility",
	 lookseqPageHeader: "Sequence Alignments",
	 downloadsPageHeader: "Downloads",
	 introPageHeader: "Introduction",
	 introTitle: "<h2>Welcome to Pf Crosses 2013</h2>",
	 introText: "This web application provides access to data released by the <a href='http://www.malariagen.net/projects/parasite/pf-crosses'>MalariaGEN P.falciparum Genetic Crosses Project</a> which is working to establish a shared resource of data on genetic variation in the three <i>P. falciparum</i> crosses 3D7 x HB3, HB3 x Dd2 and 7G8 x GB4." +
	 		"<p>If you use these data, please cite the following publication: <b>High density analysis of recombination in P. falciparum using deep sequencing</b> (in preparation)</p>" +
	 		"To begin, please choose one of the options below:",
	 samplesButton: " - view samples and download sequence data",
	 variantsButton: " - find SNPs &amp; indels discovered in the crosses",
	 genotypeButton: " - browse genotypes &amp; recombination patterns for individual samples",
	 genomeButton: " - explore the accessibility of different genome regions",
	 lookseqButton: " - browse sequence alignments for individual samples",
	 downloadsButton: " - download VCF and other data files",
	 downloadsText: "<h3>Sequence reads</h3>" +
	 		"<p>To download sequence reads for an individual sample, go to the <a href=\"#samples\">sample metadata</a> page " +
	 		"and click on the Run accession for a sample, which will take you to the European Nucleotide Archive page for that sequencing run." +
	 		"<h3>Variant call files</h3>" +
	 		"The files below are VCF files containing details of SNPs and indels discovered and genotyped in the crosses.",
	 downloadsGenomeText: "<h3>Genome region classification</h3>" +
	 		"<p>The file below is a BED file containing the classification of genome regions into Core, SubtelomericHypervariable, InternalHypervariable, SubtelomericRepeat and Centromere</p>" +
	 		"<ul><li><a href=\"\">Genome region classification</a></li></ul>",
      select_cross: "<center><em>Please select a sample set from the left</em></center>",
      select_call_set: "<center><em>Please select a call set from the left</em></center>"


  }
});