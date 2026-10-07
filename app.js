const SUPABASE_URL="https://jixzylyukugyixtodqec.supabase.co";
const SUPABASE_KEY="sb_publishable_rCQZskarlFNj4D5cdne_Rw_QDXX4wcB";
const iconByCategory={AI:"✦",Education:"◇",Media:"▶",Projects:"⌘",Community:"◎",Resources:"▱"};
const fallbackLinks=[];
const categories=[
  {title:"SriVerse AI",desc:"Intelligent tools, experiments and AI workspaces.",icon:"✦",key:"AI"},
  {title:"SriVerse Learn",desc:"Education, UPSC, academic resources and knowledge.",icon:"◇",key:"Education"},
  {title:"SriVerse Media",desc:"YouTube, podcasts, videos and conversations.",icon:"▶",key:"Media"},
  {title:"SriVerse Projects",desc:"Websites, software and experimental creations.",icon:"⌘",key:"Projects"},
  {title:"SriVerse Community",desc:"Temple, village and community initiatives.",icon:"◎",key:"Community"},
  {title:"SriVerse Resources",desc:"Useful links, documents, tools and references.",icon:"▱",key:"Resources"}
];
const categoryGrid=document.querySelector("#categoryGrid"),featuredGrid=document.querySelector("#featuredGrid"),linkGrid=document.querySelector("#linkGrid"),filters=document.querySelector("#filters"),search=document.querySelector("#search"),empty=document.querySelector("#emptyState");
let links=[];
async function loadLinks(){
  try{
    const {createClient}=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
    const db=createClient(SUPABASE_URL,SUPABASE_KEY);
    const {data,error}=await db.from("destinations").select("*").eq("live",true).order("sort_order",{ascending:true}).order("created_at",{ascending:true});
    if(error) throw error;
    links=(Array.isArray(data)?data:[]).filter(x=>!["sriverse-github-projects","rega_village_quiz_competition_custom_subjects"].includes(x.slug));
  }catch(error){console.warn("SriVerse Hub CMS unavailable.",error);links=[]}
  renderCategories();renderFeatured();renderFilters();renderLinks();
}
function renderCategories(){categoryGrid.innerHTML=categories.map(c=>`<a class="category" href="${c.key.toLowerCase()}/"><span class="icon">${c.icon}</span><h3>${c.title}</h3><p>${c.desc}</p><span class="arrow">↗</span></a>`).join("")}
function projectHref(x){return x.url&&x.url!="#"?x.url:"projects/"+(x.slug||x.id)+"/"}
function renderFeatured(){const f=links.filter(x=>x.featured&&x.live);featuredGrid.innerHTML=f.map((x,i)=>`<article class="project ${i===0?"large":""}"><div class="topline"><span>${x.icon||iconByCategory[x.category]||"✦"} &nbsp; FEATURED PROJECT</span><span>0${i+1}</span></div><h3>${x.title}</h3><p>${x.description||""}</p><a class="launch" href="${projectHref(x)}" target="_self" rel="noopener">View project ↗</a><span class="orb"></span></article>`).join("")}
function renderFilters(){const cats=["All",...new Set(links.map(x=>x.category).filter(Boolean))];filters.innerHTML=cats.map((c,i)=>`<button class="filter ${i===0?"active":""}" data-filter="${c}">${c}</button>`).join("");filters.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{filters.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderLinks(b.dataset.filter,search.value)})}
function renderLinks(category="All",query=""){const q=query.trim().toLowerCase();const list=links.filter(x=>(category==="All"||x.category===category)&&(!q||[x.title,x.description,x.category].join(" ").toLowerCase().includes(q)));linkGrid.innerHTML=list.map(x=>`<a class="link-card" href="${projectHref(x)}" target="_self" rel="noopener"><span class="link-icon">${x.icon||iconByCategory[x.category]||"✦"}</span><span class="link-copy"><span class="card-category">${x.category}</span><h3>${x.title}</h3><p>${x.description||""}</p></span><span class="go">↗</span></a>`).join("");empty.hidden=list.length>0}
search.addEventListener("input",()=>renderLinks(document.querySelector(".filter.active")?.dataset.filter||"All",search.value));
document.querySelector("#year").textContent=new Date().getFullYear();
loadLinks();