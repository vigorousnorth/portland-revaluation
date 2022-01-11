var fs = require('fs');
// var NodeGeocoder = require('node-geocoder');


// const options = {
//   provider: 'virtualearth',
 
//   // Optional depending on the providers
//   fetch: customFetchImplementation,
//   apiKey: 'YOUR_API_KEY', // for Mapquest, OpenCage, Google Premier
//   formatter: null // 'gpx', 'string', ...
// };
 
// const geocoder = NodeGeocoder(options);

let dollars = d => Number(d.replace(/[^0-9.-]+/g,""));

fs.readFile('geodata.json', function(err, data) {
	
	let d = JSON.parse(data);
	let p = Object.keys(d), n = p.length, arr = [];


	//header
	arr[0] =  'parcelID,land21,building21,total21,stdExemption21,otherExemption21,taxableValue21,'+
	'land20,building20,total20,stdExemption20,otherExemption20,taxableValue20,'+
	'address,landUse,zone,acreage,owner'

	
	for (var i = p.length - 1; i >= 0; i--) {
	// for (var i = 100; i >= 0; i--) {

		let id = p[i];

		// console.log(id);
		// console.log(d[id]);

		let parcel = '';
		parcel.id = id;
		
		let value21 = d[id].assessments[0].map(dollars);

		parcel += '"'+id+'"'+','+value21[1]+','+value21[2]+','+value21[3]+','+value21[4]+','+value21[5]+','+value21[6]+',';

		let value20 = d[id].assessments[1] ? d[id].assessments[1].map(dollars) : null;
		
		if (value20) { 
			parcel += value20[1]+','+value20[2]+','+value20[3]+','+value20[4]+','+value20[5]+','+value20[6]+',';
		} else parcel += ",,,,,,"; 
		
		parcel += '"'+d[id].parcelData.PropertyLocation+'"'+','+'"'+d[id].parcelData.LandUseCode+'"'+','+'"'+d[id].parcelData.Zoning+'"'+','
			+d[id].parcelData['LandArea(acreage)']+','+'"'+d[id].ownerData.Owner+'"';

		arr.push(parcel);
	}

let writeData = arr.join('\n')
fs.writeFileSync('assessmentdata.csv', writeData);

});