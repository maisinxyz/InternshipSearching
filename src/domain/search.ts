import type { Job, UserJobState } from './job';
import type { Filters } from './workspace';
export function distanceKm(a:{latitude:number;longitude:number},b:{latitude:number;longitude:number}) {
 const rad=(x:number)=>x*Math.PI/180; const dlat=rad(b.latitude-a.latitude),dlon=rad(b.longitude-a.longitude);
 const h=Math.sin(dlat/2)**2+Math.cos(rad(a.latitude))*Math.cos(rad(b.latitude))*Math.sin(dlon/2)**2;
 return 6371.0088*2*Math.atan2(Math.sqrt(h),Math.sqrt(Math.max(0,1-h)));
}
export function matches(job:Job,f:Filters,state:Pick<UserJobState,'saved'|'hidden'|'applied_at'>|undefined,watermark:string|null) {
 const includes=(values:string[],actual:string[])=>!values.length||values.some(v=>actual.some(a=>a.toLowerCase()===v.toLowerCase()));
 const body=[job.title,job.company.name,...job.technologies,...job.snapshots.map(s=>s.original_text)].join(' ').toLowerCase();
 const words=f.keywords.toLowerCase().trim().split(/\s+/).filter(Boolean);
 if(words.length && !(f.keywordMode==='phrase'?body.includes(f.keywords.toLowerCase().trim()):f.keywordMode==='any'?words.some(w=>body.includes(w)):words.every(w=>body.includes(w))))return false;
 if(f.exclude.toLowerCase().split(',').map(s=>s.trim()).filter(Boolean).some(w=>body.includes(w)))return false;
 if(!includes(f.disciplines,job.disciplines)||!includes(f.technologies,job.technologies)||!includes(f.arrangements,[job.work_arrangement])||!includes(f.companies,[job.company.name])||!includes(f.sources,job.sources.map(s=>s.label))||!includes(f.types,[job.employment_type]))return false;
 const locationFilter=f.countries.length||f.provinces.length||f.cities.length;
 if(locationFilter && !job.locations.some(l=>includes(f.countries,[l.country||''])&&includes(f.provinces,[l.province||''])&&includes(f.cities,[l.city||'']))){if(!f.includeUnknownLocation||job.locations.some(l=>l.country||l.city||l.province))return false;}
 if(f.canadaRemote && (job.work_arrangement!=='remote'||job.remote_open_to_canada!==true))return false;
 if(!job.term&&!f.includeUnknownTerm)return false;
 if(f.terms.length&&job.term&&!includes(f.terms,[job.term.label]))return false;
 if(f.minimumMonths!==null&&(!job.duration||job.duration.months<f.minimumMonths))return false;
 if(f.maximumMonths!==null&&(!job.duration||job.duration.months>f.maximumMonths))return false;
 if(!job.salary&&!f.includeUnknownPay)return false;
 if(f.minimumPay!==null&&job.salary&&(job.salary.currency!==f.currency||job.salary.interval!==f.payInterval||job.salary.minimum<f.minimumPay))return false;
 if(f.radius&&!job.locations.some(l=>l.coordinates&&(l.precision==='exact-address'||f.radius!.approximate&&l.precision!=='unknown')&&distanceKm(f.radius!,l.coordinates)<=f.radius!.km))return false;
 if(f.saved&&!state?.saved||f.applied==='yes'&&!state?.applied_at||f.applied==='no'&&state?.applied_at||f.hidden==='exclude'&&state?.hidden||f.hidden==='only'&&!state?.hidden)return false;
 if(f.newOnly&&(!watermark||job.first_seen_at<=watermark))return false;
 return true;
}
