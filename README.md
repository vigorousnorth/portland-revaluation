# Using the Portland Assessor's data in R

Below is a quick guide to loading Bill Mill's 2021 Portland Assessment data into R and doing some basic analysis. 

The original data was scraped by [Bill Mill and you can find his code here](https://github.com/llimllib/portland-revaluation/). 

His code generated a huge JSON file containing most of the tax assessor's database. To work with it in R, I wrote a Node script (`csvparser.js`) to parse his JSON and re-write it as a CSV file. Both the Node script, Mill's JSON file, and the CSV output are included in this repository. 

## Working with the data

First, load the data and take a look:

	p <- read.csv("assessmentdata.csv")
	str(p)
	nrow(p)

The `nrow(p)` command should return 22796 rows – note that this doesn't quite include every property record in the city, but it's'about 95 percent of the 24,000 records in the city’s database.

The original scrape missed the 2021 valuation numbers for [this CMP property](https://assessors.portlandmaine.gov/datalets/datalet.aspx?mode=assessment_history&sIndex=2&idx=1&LMparent=20) (described as a submarine cable to one of the islands). We'll fill it in by hand here: 

	p[22793,]
	p[22793,]$land21 <- 93917700
	p[22793,]$total21 <- 93917700
	p[22793,]$taxableValue21 <- 93917700

Then, create a new dataframe that doesn't include 225 property records that did not exist in 2020 (new condos, e.g.) to allow apples-to-apples comparisons:

	p1 <- subset(p, is.na(taxableValue20) == FALSE)
	nrow(p) - nrow(p1)


Get land use categories and summarize the total 2021 taxable value of each:

	categories <- levels(p1$landUse)

	for (value in categories) {
 		s <- p1[p1$landUse == value,]
 		print(paste(value,": $",sum(s$taxableValue21)/1000000,"M"))
	}


Add some more columns to the `p1` dataframe to make comparisons easier:

	p1$valChange <- p1$taxableValue21 - p1$taxableValue20
	p1$tax20 <- p1$taxableValue20/1000*23.31
	p1$tax21 <- p1$taxableValue21/1000*12.99
	sum(p1$tax20)
	sum(p1$tax21)
	p1$taxChange <- p1$tax21 - p1$tax20
	p1$taxPctChange <- round(p1$taxChange/p1$tax20*100,2)

Generate some new subsets based on specific land use categories: 

	sfr <- subset(p1, landUse == "11 - SINGLE FAMILY")
	condos <- subset(p1, landUse == "10 - CONDOMINIUMS")
	seasonal <- subset(p1, landUse == "18 - SEASONAL")
	multifamily_small <- subset(p1,landUse %in% c("12 - TWO FAMILY","13 - THREE FAMILY", "14 - FOUR FAMILY"))
	multifamily_all <- subset(p1, landUse %in% c("06 - MULTI-USE RESIDENTIAL", "08 - APARTMENT ROOMS", "09 - ROOMING HOUSES","12 - TWO FAMILY", "13 - THREE FAMILY", "14 - FOUR FAMILY", "15 - 5 TO 10 FAMILY", "16 - 11 TO 20 FAMILY", "17 - 21 PLUS FAMILY"))
	multifamily_large <- subset(p1, landUse %in% c("08 - APARTMENT ROOMS", "09 - ROOMING HOUSES", "15 - 5 TO 10 FAMILY", "16 - 11 TO 20 FAMILY", "17 - 21 PLUS FAMILY"))
	office <- subset(p1, landUse %in% c("22 - OFFICE BUSINESS","20 - COMMERCIAL CONDOS"))
	retail <- subset(p1, landUse == "21 - RETAIL SERVICES")
	industrial <- subset(p1, landUse %in% c('24 - WHOLESALE','31 - MANUFACTURING','32 - WAREHOUSE & STORAGE','36 - MULTI-USE INDUSTRIAL'))
	parking <- subset(p1, landUse == "25 - PARKING LOTS")
	hotels <- subset(p1, landUse %in% c("14 - BED & BREAKFAST","23 - HOTEL & MOTEL"))
	cmp <- subset(p1, owner == "CENTRAL MAINE POWER CO")


A function to generate a two-line summary of taxable values for a subset of parcels:

	totalTaxableValueSummary <- function(data) {
    tot20 <- sum(data$taxableValue20)
    tot21 <- sum(data$taxableValue21)
    netValChange <- tot21 - tot20
    pctValChange <- netValChange/tot20
    
    tax20 <- tot20/1000*23.31   
    tax21 <- tot21/1000*12.99
    netTaxChange <- tax21-tax20
    pctTaxChange <- netTaxChange/tax20
    print("parcels,TotalTaxableValue2020_inK,TotalTaxableValue2021_inK,NetValChange_inK,PctValChange,TotalTax2020,TotalTax2021,NetTaxChange,TaxPctChange")
    
    print(paste(nrow(data),',',round(tot20/1000,0) ,',', round(tot21/1000,0) ,',',  round(netValChange/1000,0) ,',',  round(pctValChange*100, 2) ,',', 
        round(tax20,0) ,',',  round(tax21,0) ,',', round(netTaxChange,0) ,',', round(pctTaxChange*100, 2) ) )
	}

And see some summaries for specific land uses:

	totalTaxableValueSummary(p1)
	totalTaxableValueSummary(office)
	totalTaxableValueSummary(sfr)
	totalTaxableValueSummary(seasonal)
	totalTaxableValueSummary(condos)
	totalTaxableValueSummary(multifamily_all)

## A few interesting things to look at:

All the parcels with a taxable value over $100 million:
	
	p1[p1$taxableValue21>100000000,]

All the parcels with a taxable value over $50 million:

	p1[p1$taxableValue21>50000000,]

How taxable values changed in different residential zoning districts (R3 is suburban off-peninsula; R5 is around Deering Center; R6 is on peninsula:) -->
	taxable_pct_change(sfr[sfr$zone == "R3",])
	taxable_pct_change(sfr[sfr$zone == "R5",])
	taxable_pct_change(sfr[sfr$zone == "R6",])

Some other big taxpayers (or non-taxpayers:)

	totalTaxableValueSummary(p1[p1$owner =="UNUM CORP",])
	totalTaxableValueSummary(p1[p1$owner =="NORTHERN UTILITIES INC",])
	totalTaxableValueSummary(p1[p1$owner =="MAINE TURNPIKE AUTHORITY",])
	totalTaxableValueSummary(p1[p1$owner =="BROWN J B & SONS",])



