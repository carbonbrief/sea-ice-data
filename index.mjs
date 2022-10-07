import {writeFileSync, readFileSync} from 'fs';
import { csvFormat, csvParse } from 'd3-dsv';
const data = csvParse(readFileSync('source/PIOMAS.monthly.Current.v2.1.csv','utf-8'));
const monthlyData = [];
const months = "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(',');
data.forEach(row=>{
  months.forEach((month,monthIndex)=>{
    monthlyData.push({
      date:`${Math.floor(row.year)}-${monthIndex+1}`,
      "volume km^3":row[month] <= 0 ? undefined: (Number(row[month])*1000).toFixed(2)
    })
  })
});

const now = new Date();
const isoDate = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
writeFileSync(`processed/piomas-monthly-${isoDate}.csv`,csvFormat(monthlyData));