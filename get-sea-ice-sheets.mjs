import { readdirSync, readFileSync, writeFileSync} from 'fs';
import { csvFormat, csvParse } from 'd3-dsv';
import * as ftp from 'basic-ftp';
import fetch from 'node-fetch';

/* fetch and process the monthly sea ice volume data */

const volumeSourceURL = "http://psc.apl.uw.edu/wordpress/wp-content/uploads/schweiger/ice_volume/PIOMAS.monthly.Current.v2.1.csv"
const volumeSourceFile = "source/volume-north/PIOMAS.monthly.Current.v2.1.csv"
const now = new Date();
const isoDate = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

const volumeResponse = await fetch(volumeSourceURL);
const retrievedVolumeData = await volumeResponse.text();
writeFileSync(volumeSourceFile, retrievedVolumeData);

const data = csvParse(readFileSync(volumeSourceFile, 'utf-8'));
const monthlyVolumeData = [];
const months = "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(',');
data.forEach(row=>{
  months.forEach((month,monthIndex)=>{
    monthlyVolumeData.push({
      date:`${Math.floor(row.year)}-${monthIndex+1}`,
      "volume km^3":row[month] <= 0 ? undefined: (Number(row[month])*1000).toFixed(2)
    })
  })
});

writeFileSync(`processed/north-volume.csv`,csvFormat(monthlyVolumeData));
// fetch the sea ice extent data

async function getFTPData(){
  const ftpClient = new ftp.Client();
  try{
    await ftpClient.access({
      secure: false,
      host: "sidads.colorado.edu"});

    await ftpClient.downloadToDir('source/extent-north', "DATASETS/NOAA/G02135/north/monthly/data");
    await ftpClient.downloadToDir('source/extent-south', "DATASETS/NOAA/G02135/south/monthly/data");
  }catch(err){
    console.log(err);
  }
  ftpClient.close();
  processSeaIceExtent();
}

function processSeaIceExtent(){
  // process sea ice extent data
  ['north','south'].forEach((pole)=>{
    const extentFiles = readdirSync(`source/extent-${pole}`);
    const monthlyExtentData = []
    extentFiles.forEach((f)=>{
      const extentData = csvParse(readFileSync(`source/extent-${pole}/${f}`,'utf-8'));
      extentData.forEach(row => {
        monthlyExtentData.push({
          date:`${row.year.trim()}-${row[' mo'].trim()}`,
          extent:row[' extent'].trim(),
          area:row['   area'].trim(),
          'data-type':row['    data-type'].trim(),
          region:row[' region'].trim()
        });
      })
    });
  
    writeFileSync(`processed/${pole}-extent.csv`, csvFormat(monthlyExtentData));
  });
}

getFTPData();

