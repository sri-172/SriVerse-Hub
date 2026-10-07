const links=[
{id:"ai",title:"SriVerse Master AI",description:"The flagship SriVerse intelligent workspace.",category:"AI",icon:"✦",url:"#",featured:true},
{id:"temple",title:"Veda Maatha Gayatri Devi Temple",description:"Digital temple information and community project.",category:"Community",icon:"ॐ",url:"https://sri-172.github.io/veda-maatha-gayatri-devi-temple/",featured:true},
{id:"youtube",title:"SriVerse Telugu",description:"Telugu podcasts, ideas and conversations.",category:"Media",icon:"▶",url:"#",featured:false},
{id:"github",title:"SriVerse GitHub Projects",description:"Open-source experiments and digital creations.",category:"Projects",icon:"⌘",url:"https://github.com/sri-172",featured:false},
{id:"learn",title:"SriVerse Learn",description:"A future home for education and knowledge resources.",category:"Education",icon:"◇",url:"#",featured:false}
];
const categories=[
{title:"SriVerse AI",desc:"Intelligent tools, experiments and the flagship AI workspace.",icon:"✦",key:"AI"},
{title:"SriVerse Learn",desc:"Education, UPSC, academic resources and knowledge.",icon:"◇",key:"Education"},
{title:"SriVerse Media",desc:"YouTube, podcasts, videos and conversations.",icon:"▶",key:"Media"},
{title:"SriVerse Projects",desc:"Websites, software and experimental creations.",icon:"⌘",key:"Projects"},
{title:"SriVerse Community",desc:"Temple, village and community initiatives.",icon:"◎",key:"Community"},
{title:"SriVerse Resources",desc:"Useful links, documents, tools and references.",icon:"▱",key:"Resources"}
];
const categoryGrid=document.querySelector("#categoryGrid"),featuredGrid=document.querySelector("#featuredGrid"),linkGrid=document.querySelector("#linkGrid"),filters=document.querySelector("#filters"),search=document.querySelector("#search"),empty=document.querySelector("#emptyState");
function renderCategories(){categoryGrid.innerHTML=categories.map(c=>`<button class="category" data-cat="${c.key}"><span class="icon">${c.icon}</span><h3>${c.title}</h3><p>${c.desc}</p><span class="arrow">↗</span></button>`).join("");categoryGrid.querySelectorAll(".category").forEach(b=>b.onclick=()=>{location.hash="links";document.querySelector(".filter[data-filter='"+b.dataset.cat+"']")?.click()})}
function renderFeatured(){const f=links.filter(x=>x.featured);featuredGrid.innerHTML=f.map((x,i)=>`<article class="project ${i===0?"large":""}"><div class="topline"><span>${x.icon} &nbsp; FEATURED PROJECT</span><span>0${i+1}</span></div><h3>${x.title}</h3><p>${x.description}</p><a class="launch" href="${x.url}" target="${x.url==="#"?"_self":"_blank"}" rel="noopener">Open destination ↗</a><span class="orb"></span></article>`).join("")}
function renderFilters(){const cats=["All",...new Set(links.map(x=>x.category))];filters.innerHTML=cats.map((c,i)=>`<button class="filter ${i===0?"active":""}" data-filter="${c}">${c}</button>`).join("");filters.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{filters.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderLinks(b.dataset.filter,search.value)})}
function renderLinks(category="All",query=""){const q=query.trim().toLowerCase();const list=links.filter(x=>(category==="All"||x.category===category)&&(!q||[x.title,x.description,x.category].join(" ").toLowerCase().includes(q)));linkGrid.innerHTML=list.map(x=>`<a class="link-card" href="${x.url}" target="${x.url==="#"?"_self":"_blank"}" rel="noopener"><span class="link-icon">${x.icon}</span><span><h3>${x.title}</h3><p>${x.description}</p></span><span class="go">↗</span></a>`).join("");empty.hidden=list.length>0}
search.addEventListener("input",()=>renderLinks(document.querySelector(".filter.active")?.dataset.filter||"All",search.value));
renderCategories();renderFeatured();renderFilters();renderLinks();document.querySelector("#year").textContent=new Date().getFullYear();
