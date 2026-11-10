const input=document.getElementById('searchInput');
const results=document.getElementById('results');
const title=document.getElementById('resultsTitle');
const count=document.getElementById('resultCount');
const filters=[...document.querySelectorAll('.filter')];
let activeType='all', timer;
document.getElementById('year').textContent=new Date().getFullYear();

filters.forEach(btn=>btn.addEventListener('click',()=>{filters.forEach(x=>x.classList.remove('active'));btn.classList.add('active');activeType=btn.dataset.type;if(input.value.trim())search();}));
document.getElementById('searchBtn').addEventListener('click',search);
input.addEventListener('keydown',e=>{if(e.key==='Enter')search();});
input.addEventListener('input',()=>{clearTimeout(timer);if(input.value.trim().length>2)timer=setTimeout(search,650);});

function toast(message){const el=document.getElementById('toast');el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2600);}
function escapeHTML(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function card(item){const image=item.image?`<img src="${escapeHTML(item.image)}" alt="" loading="lazy" onerror="this.remove()">`:`<span class="fallback">${item.kind==='MOVIE'?'▶':'♫'}</span>`;
return `<article class="card"><div class="cover">${image}</div><div class="card-body"><span class="card-type">${item.kind}</span><h3 title="${escapeHTML(item.name)}">${escapeHTML(item.name)}</h3><p title="${escapeHTML(item.detail)}">${escapeHTML(item.detail)}</p><div class="card-actions"><a href="${escapeHTML(item.link)}" target="_blank" rel="noopener noreferrer">DETAILS ↗</a>${item.download?`<a class="download" href="${escapeHTML(item.download)}" target="_blank" rel="noopener noreferrer">DOWNLOAD ↓</a>`:`<a class="download" href="${escapeHTML(item.link)}" target="_blank" rel="noopener noreferrer">LISTEN ↗</a>`}</div></div></article>`;}
function show(items){if(!items.length){results.innerHTML='<article class="empty-card"><div class="empty-icon">⌕</div><h3>No results found</h3><p>Try another title or artist name.</p></article>';count.textContent='0 RESULTS';return;}results.innerHTML=items.map(card).join('');count.textContent=`${items.length} RESULTS`;}
async function search(){
 const q=input.value.trim();if(!q){toast('Type a movie, artist or song first.');return;}
 title.textContent=`Results for “${q}”`;results.innerHTML='<article class="empty-card"><div class="empty-icon">◌</div><h3>Searching the web...</h3><p>Finding matching media.</p></article>';count.textContent='SEARCHING';
 const jobs=[];
 if(activeType==='all'||activeType==='movies')jobs.push(searchMovies(q));
 if(activeType==='all'||activeType==='music')jobs.push(searchMusic(q));
 try{const groups=await Promise.all(jobs);show(groups.flat().slice(0,24));}catch(e){results.innerHTML='<article class="empty-card"><h3>Search temporarily unavailable</h3><p>Check your connection and try again.</p></article>';count.textContent='ERROR';}
}
async function searchMovies(q){
 // Internet Archive advanced search surfaces items in its public collection.
 const url=`https://archive.org/advancedsearch.php?q=${encodeURIComponent(`(${q}) AND mediatype:movies`)}&fl[]=identifier,title,description,year&rows=12&page=1&output=json`;
 const r=await fetch(url);if(!r.ok)throw Error('Archive search failed');const data=await r.json();
 return (data.response?.docs||[]).map(x=>({kind:'MOVIE',name:x.title||x.identifier,detail:`Internet Archive${x.year?' • '+x.year:''}`,image:`https://archive.org/services/img/${encodeURIComponent(x.identifier)}`,link:`https://archive.org/details/${encodeURIComponent(x.identifier)}`,download:`https://archive.org/download/${encodeURIComponent(x.identifier)}/`}));
}
async function searchMusic(q){
 const url=`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=12`;
 const r=await fetch(url);if(!r.ok)throw Error('Music search failed');const data=await r.json();
 return (data.results||[]).map(x=>({kind:'MUSIC',name:x.trackName||x.collectionName,detail:`${x.artistName||'Unknown artist'} • ${x.collectionName||'Single'}`,image:(x.artworkUrl100||'').replace('100x100','300x300'),link:x.trackViewUrl||x.collectionViewUrl,download:null}));
}
