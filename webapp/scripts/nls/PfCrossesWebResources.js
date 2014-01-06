define({

  root: {
     variant_filters: "<b>Variant Filters</b>",
	 variantTypeOptions: "Variant type",
	 genomeSearchOptions: "Genome region",
	 genomeSearchChromosome: 'Chromosome',
	 genomeSearchStart: 'Start',
	 genomeSearchEnd: 'Stop',
	 genomeSearchClear: 'Clear',
     genomeSearch: 'Search',
	 filtersSetAll: 'Apply all',
	 filtersSetNone: 'Apply none',
	 variantCallSet: 'Variant call set',
	 variantsHelp: "The variant catalogues display basic properties of SNPs and indels discovered in the crosses. There are several catalogues for each cross, for variants discovered by different methods.",
     genotypesHelp: 'Use this page to browse genotype calls for individual samples. The colours show genotype inheritance:<br><div class="ColorInfoBlock" style="background-color:rgb(0,0,255)"/> Allele from parent 1 (e.g., 3D7)<br><div class="ColorInfoBlock" style="background-color:rgb(255,0,0)"/> Allele from parent 2 (e.g., HB3)<br><div class="ColorInfoBlock" style="background-color:rgb(255,255,255)"/> Missing call<br><div class="ColorInfoBlock" style="background-color:rgb(160,160,160)"/> Filtered call<br><div class="ColorInfoBlock" style="background-color:rgb(0,0,0)"/> Non-parental allele (Mendel error)<br><div class="ColorInfoBlock" style="background-color:rgb(255,128,0)"/> REF allele where parents are both REF<br><div class="ColorInfoBlock" style="background-color:rgb(0,192,0)"/> ALT allele where parents are both ALT.',
	 variantsDescrip: "Variants",
	 x3d7_hb3: "3D7 x HB3",
	 xhb3_dd2: "HB3 x DD2",
	 x7g8_gb4: "7G8 x GB4",
	 samplesHelp: "This page displays metadata about the samples that have been sequenced, with some summary statistics and links to the European Nucleotide Archive where the sequence data are held.",
	 samplePanelHeader: "Sample set",
	 appName: "<i>P. falciparum</i> genetic crosses data release 2014 - ",
	 samplesPageHeader: "Sample Metadata",
	 variantsPageHeader: "Variant Call Sets",
	 genotypePageHeader: "Genotype Calls",
	 genomePageHeader: "Genome Accessibility",
	 lookseqPageHeader: "Sequence Alignments",
	 downloadsPageHeader: "Downloads",
	 introPageHeader: "Introduction",
	 samplesButton: "View samples and download sequence data",
	 variantsButton: "Find SNPs &amp; indels discovered in the crosses",
	 genotypeButton: "Browse genotypes &amp; recombination patterns of samples",
	 genomeButton: "Explore the accessibility of different genome regions",
	 lookseqButton: "Browse sequence alignments for individual samples",
	 downloadsButton: "Download VCF and other data files",
	 downloadsText: "<h3>Sequence reads</h3>" +
	 		"<p>To download sequence reads for an individual sample, go to the <a href=\"#samples\">sample metadata</a> page " +
	 		"and click on the Run accession for a sample, which will take you to the European Nucleotide Archive page for that sequencing run." +
	 		"<h3>Variant call files</h3>" +
	 		"The files below are VCF files containing details of SNPs and indels discovered and genotyped in the crosses.",
	 downloadsGenomeText: "<h3>Genome region classification</h3>" +
	 		"<p>The file below is a BED file containing the classification of genome regions into Core, SubtelomericHypervariable, InternalHypervariable, SubtelomericRepeat and Centromere</p>",
     select_cross: "<center><em>Please select a sample set from the left</em></center>",
     select_call_set: "<center><em>Please select a call set from the left</em></center>",
     navButtonIntro: "Intro<br>page",
     navButtonPrevious: "Previous<br>view",
     navButtonFindGene: "Find<br><b>Gene</b>"



}
});