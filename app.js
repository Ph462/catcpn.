const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const input=$('#searchInput'), results=$('#resultsGrid');
let activeType='all', debounce;
$('#year').textContent=new Date().getFullYear();
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400)}
$('#menu').onclick=()=>$('#nav').classList.toggle('open');
$$('.nav a').forEach(a=>a.onclick=()=>$('#nav').classList.remove('open'));
$('#clearSearch').onclick=()=>{input.value='';input.focus()};
$$('.tab').forEach(b=>b.onclick=()=>{$$('.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');activeType=b.dataset.type;if(input.value.trim())search()});
$('#searchButton').onclick=search;
input.addEventListener('keydown',e=>{if(e.key==='Enter')search()});
input.addEventListener('input',()=>{clearTimeout(debounce);if(input.value.trim().length>2)debounce=setTimeout(search,650)});

function card(item){const img=item.image?`<img src="${esc(item.image)}" alt="" loading="lazy" onerror="this.remove()">`:`<span class="image-fallback">${item.kind==='MUSIC'?'♫':'▶'}</span>`;
const action=item.download?`<a href="${esc(item.download)}" target="_blank" rel="noopener noreferrer">DOWNLOAD ↗</a>`:`<a href="${esc(item.link)}" target="_blank" rel="noopener noreferrer">OPEN ↗</a>`;
return `<article class="media-card"><div class="media-image">${img}</div><div class="media-content"><span class="type-label">${esc(item.kind)}</span><h3 title="${esc(item.name)}">${esc(item.name)}</h3><p>${esc(item.detail||'')}</p><div class="card-links"><a href="${esc(item.link)}" target="_blank" rel="noopener noreferrer">DETAILS ↗</a>${action}</div></div></article>`}
function fill(id,items){$(id).innerHTML=items.length?items.map(card).join(''):'<div class="loading-card">No titles available right now. Try the search bar.</div>'}
function showError(id){$(id).innerHTML='<div class="loading-card">Could not load this collection. Use search or check your connection.</div>'}

async function tvSearch(q){const r=await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`);if(!r.ok)throw Error('TV search');const j=await r.json();return j.map(x=>({kind:'SERIES',name:x.show.name,detail:[x.show.premiered?.slice(0,4),x.show.genres?.slice(0,2).join(' • '),x.show.network?.name||x.show.webChannel?.name].filter(Boolean).join(' • '),image:x.show.image?.original||x.show.image?.medium,link:x.show.url}))}
async function archiveSearch(q,sortLatest=false){let url=`https://archive.org/advancedsearch.php?q=${encodeURIComponent(`(${q}) AND mediatype:movies`)}&fl[]=identifier,title,year&rows=10&page=1&output=json`;if(sortLatest)url+='&sort[]=publicdate+desc';const r=await fetch(url);if(!r.ok)throw Error('Archive search');const j=await r.json();return(j.response?.docs||[]).map(x=>({kind:'MOVIE',name:x.title||x.identifier,detail:`Internet Archive${x.year?' • '+x.year:''}`,image:`https://archive.org/services/img/${encodeURIComponent(x.identifier)}`,link:`https://archive.org/details/${encodeURIComponent(x.identifier)}`,download:`https://archive.org/download/${encodeURIComponent(x.identifier)}/`}))}
async function musicSearch(q,entity='album'){const r=await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=${entity}&limit=10`);if(!r.ok)throw Error('Music search');const j=await r.json();return(j.results||[]).map(x=>({kind:'MUSIC',name:x.collectionName||x.trackName,detail:[x.artistName,x.primaryGenreName].filter(Boolean).join(' • '),image:(x.artworkUrl100||'').replace('100x100','300x300'),link:x.collectionViewUrl||x.trackViewUrl,download:null}))}
async function loadCollections(){
 try{const q=await Promise.all(['squid game','the last of us','stranger things','breaking bad'].map(tvSearch));fill('#trendingCards',q.flat().slice(0,8))}catch(e){showError('#trendingCards')}
 try{fill('#latestCards',await archiveSearch('public domain',true))}catch(e){showError('#latestCards')}
 try{const q=await Promise.all(['Crash Landing on You','Goblin Korean drama','Extraordinary Attorney Woo','Vincenzo Korean drama'].map(tvSearch));const unique=[...new Map(q.flat().map(x=>[x.name,x])).values()];fill('#kdramaCards',unique.slice(0,10))}catch(e){showError('#kdramaCards')}
 try{const q=await Promise.all(['action adventure','warrior','superhero'].map(tvSearch));fill('#actionCards',q.flat().slice(0,8))}catch(e){showError('#actionCards')}
 try{fill('#musicCards',await musicSearch('global hits','album'))}catch(e){showError('#musicCards')}
}
async function search(){const q=input.value.trim();if(!q){toast('Type a title, artist or song to search.');return}$('#searchResultsSection').scrollIntoView({behavior:'smooth',block:'start'});$('#resultsHeading').textContent=`Results for “${q}”`;$('#resultCount').textContent='SEARCHING';results.innerHTML='<div class="loading-card">Searching movie, TV and music catalogues…</div>';
try{const jobs=[];if(activeType==='all'||activeType==='movies')jobs.push(archiveSearch(q));if(activeType==='all'||activeType==='shows')jobs.push(tvSearch(q));if(activeType==='all'||activeType==='music')jobs.push(musicSearch(q,'song'));const groups=await Promise.all(jobs);const all=groups.flat();results.innerHTML=all.length?all.slice(0,25).map(card).join(''):'<div class="empty-state"><span>⌕</span><h3>No matching titles found</h3><p>Try another spelling or search term.</p></div>';$('#resultCount').textContent=`${all.length} RESULTS`}catch(e){results.innerHTML='<div class="empty-state"><h3>Search could not be completed</h3><p>Check your internet connection and try again.</p></div>';$('#resultCount').textContent='ERROR'}}
loadCollections();
