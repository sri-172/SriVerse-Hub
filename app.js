const SUPABASE_URL="https://jixzylyukugyixtodqec.supabase.co";
const SUPABASE_KEY="sb_publishable_rCQZskarlFNj4D5cdne_Rw_QDXX4wcB";
const GITHUB_OWNER="sri-172";
const GITHUB_EXCLUDE=["SriVerse-Hub"];const GITHUB_CATEGORY_TOPICS={"sriverse-ai":"AI","sriverse-education":"Education","sriverse-media":"Media","sriverse-projects":"Projects","sriverse-community":"Community","sriverse-resources":"Resources"};
const iconByCategory={AI:"✦",Education:"◇",Media:"▶",Projects:"⌘",Community:"◎",Resources:"▱"};
const fallbackLinks=[{id:"temple",title:"Veda Maatha Gayatri Devi Temple",description:"Digital temple information and community project.",category:"Community",icon:"ॐ",url:"https://sri-172.github.io/veda-maatha-gayatri-devi-temple/",featured:true,live:true},{id:"youtube",title:"SriVerse Telugu",description:"Telugu podcasts, ideas and conversations.",category:"Media",icon:"▶",url:"#",featured:false,live:false},{id:"github",title:"SriVerse GitHub Projects",description:"Open-source experiments and digital creations.",category:"Projects",icon:"⌘",url:"https://github.com/sri-172",featured:false,live:true},{id:"learn",title:"SriVerse Learn",description:"A future home for education and knowledge resources.",category:"Education",icon:"◇",url:"#",featured:false,live:false}];
const categories=[{title:"SriVerse AI",desc:"Intelligent tools, experiments and AI workspaces.",icon:"✦",key:"AI"},{title:"SriVerse Learn",desc:"Education, UPSC, academic resources and knowledge.",icon:"◇",key:"Education"},{title:"SriVerse Media",desc:"YouTube, podcasts, videos and conversations.",icon:"▶",key:"Media"},{title:"SriVerse Projects",desc:"Websites, software and experimental creations.",icon:"⌘",key:"Projects"},{title:"SriVerse Community",desc:"Temple, village and community initiatives.",icon:"◎",key:"Community"},{title:"SriVerse Resources",desc:"Useful links, documents, tools and references.",icon:"▱",key:"Resources"}];
const categoryGrid=document.querySelector("#categoryGrid"),featuredGrid=document.querySelector("#featuredGrid"),linkGrid=document.querySelector("#linkGrid"),filters=document.querySelector("#filters"),search=document.querySelector("#search"),empty=document.querySelector("#emptyState");let links=[...fallbackLinks];

function classifyGitHubRepo(repo){
  const explicit=(repo.topics||[]).map(x=>x.toLowerCase()).find(x=>GITHUB_CATEGORY_TOPICS[x]);
  if(explicit)return GITHUB_CATEGORY_TOPICS[explicit];
  const text=[repo.name,repo.description||"",...(repo.topics||[])].join(" ").toLowerCase();
  const has=words=>words.some(w=>text.includes(w));
  if(has(["ai","artificial-intelligence","machine-learning","llm","agent","chatbot","deepseek","openai","gemini","rag","neural"]))return"AI";
  if(has(["education","learning","study","academic","upsc","quiz","school","college","course","student","teacher"]))return"Education";
  if(has(["youtube","podcast","telugu","media","video","channel","audio"]))return"Media";
  if(has(["temple","community","village","ngo","foundation","social"]))return"Community";
  if(has(["resource","resources","docs","documentation","reference","tool","tools","utility"]))return"Resources";
  return"Projects";
}

function githubRepoToLink(repo){
  const category=classifyGitHubRepo(repo);
  const topics=repo.topics||[];
  const featured=topics.includes("sriverse-featured");
  return{
    id:"github-"+repo.id,
    slug:repo.name,
    title:repo.name,
    description:repo.description||"SriVerse GitHub project.",
    category,
    icon:iconByCategory[category],
    url:repo.html_url,
    featured,
    live:true,
    source:"github",
    updated_at:repo.updated_at||repo.pushed_at||""
  };
}

async function fetchGitHubRepos(){
  const cacheKey="sriverse-hub-github-repos-v2";
  const cached=(()=>{try{return JSON.parse(localStorage.getItem(cacheKey)||"null")}catch{return null}})();
  const pages=[];
  for(let page=1;page<=10;page++){
    let response=null;
    for(let attempt=0;attempt<3;attempt++){
      try{
        response=await fetch(`https://api.github.com/users/${encodeURIComponent(GITHUB_OWNER)}/repos?per_page=100&page=${page}&sort=updated&type=owner`,{
          headers:{"Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2026-03-10"},
          cache:"no-store"
        });
        if(response.ok)break;
        if(![403,429,500,502,503,504].includes(response.status))break;
      }catch(e){}
      await new Promise(resolve=>setTimeout(resolve,700*(attempt+1)));
    }
    if(!response?.ok)break;
    const batch=await response.json();
    if(!Array.isArray(batch)||!batch.length)break;
    pages.push(...batch);
    if(batch.length<100)break;
  }
  if(pages.length){
    try{localStorage.setItem(cacheKey,JSON.stringify({savedAt:Date.now(),repos:pages}))}catch{}
    return pages;
  }
  return Array.isArray(cached?.repos)?cached.repos:[];
}

async function loadGitHubProjects(){
  try{
    const repos=await fetchGitHubRepos();
    const existingUrls=new Set(links.map(x=>x.url).filter(Boolean));
    const existingSlugs=new Set(links.map(x=>String(x.slug||"").toLowerCase()).filter(Boolean));
    const auto=repos
      .filter(repo=>repo&&repo.visibility==="public"&&!repo.fork&&!repo.archived&&!repo.disabled&&!GITHUB_EXCLUDE.includes(repo.name)&&!(repo.topics||[]).includes("sriverse-hidden"))
      .map(githubRepoToLink)
      .filter(repo=>!existingUrls.has(repo.url)&&!existingSlugs.has(repo.slug.toLowerCase()));
    links=[...links,...auto];
    window.__sriverseGithubSync={count:auto.length,total:repos.length,at:new Date().toISOString(),ok:true};
  }catch(error){
    console.warn("SriVerse Hub GitHub synchronization unavailable.",error);
    window.__sriverseGithubSync={count:0,total:0,at:new Date().toISOString(),ok:false};
  }
}


async function loadLinks(){
  try{
    const {createClient}=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
    const db=createClient(SUPABASE_URL,SUPABASE_KEY);
    const {data,error}=await db.from("destinations").select("*").eq("live",true).order("sort_order",{ascending:true}).order("created_at",{ascending:true});
    if(!error&&Array.isArray(data)&&data.length)links=data;
  }catch(error){console.warn("SriVerse Hub CMS unavailable; using fallback data.",error)}
  await loadGitHubProjects();
  renderCategories();renderFeatured();renderFilters();renderLinks();
}

function renderCategories(){categoryGrid.innerHTML=categories.map(c=>`<a class="category" href="${c.key.toLowerCase()==="education"?"education":c.key.toLowerCase()}/"><span class="icon">${c.icon}</span><h3>${c.title}</h3><p>${c.desc}</p><span class="arrow">↗</span></a>`).join("")}

function projectHref(x){return x.source==="github"?x.url:"projects/"+(x.slug||x.id)+"/"}

function renderFeatured(){
  const curated=links.filter(x=>x.featured&&x.live);
  const auto=links.filter(x=>x.source==="github"&&x.featured);
  const f=[...curated,...auto];
  featuredGrid.innerHTML=f.map((x,i)=>`<article class="project ${i===0?"large":""}"><div class="topline"><span>${x.icon||iconByCategory[x.category]||"✦"} &nbsp; ${x.source==="github"?"GITHUB PROJECT":"FEATURED PROJECT"}</span><span>0${i+1}</span></div><h3>${x.title}</h3><p>${x.description}</p><a class="launch" href="${projectHref(x)}" target="_self" rel="${x.source==="github"?"noopener":""}">${x.source==="github"?"Open GitHub ↗":"View project ↗"}</a><span class="orb"></span></article>`).join("");
}

function renderFilters(){
  const cats=["All",...new Set(links.map(x=>x.category))];
  filters.innerHTML=cats.map((c,i)=>`<button class="filter ${i===0?"active":""}" data-filter="${c}">${c}</button>`).join("");
  filters.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{filters.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderLinks(b.dataset.filter,search.value)})
}

function renderLinks(category="All",query=""){
  const q=query.trim().toLowerCase();
  const list=links.filter(x=>(category==="All"||x.category===category)&&(!q||[x.title,x.description,x.category].join(" ").toLowerCase().includes(q)));
  linkGrid.innerHTML=list.map(x=>`<a class="link-card" href="${projectHref(x)}" target="_self" rel="${x.source==="github"?"noopener":""}"><span class="link-icon">${x.icon||iconByCategory[x.category]||"✦"}</span><span class="link-copy"><span class="card-category">${x.category}${x.source==="github"?" · GitHub":""}</span><h3>${x.title}</h3><p>${x.description}</p></span><span class="go">↗</span></a>`).join("");
  empty.hidden=list.length>0;
}

search.addEventListener("input",()=>renderLinks(document.querySelector(".filter.active")?.dataset.filter||"All",search.value));
document.querySelector("#year").textContent=new Date().getFullYear();
loadLinks();
const refreshGitHubSync=async()=>{await loadGitHubProjects();renderCategories();renderFeatured();renderFilters();renderLinks(document.querySelector(".filter.active")?.dataset.filter||"All",search.value)};
setInterval(refreshGitHubSync,5*60*1000);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")refreshGitHubSync()});