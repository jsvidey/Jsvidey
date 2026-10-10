(() => {
  const SUPABASE_URL = "https://yihtsjscgwaaxyfkdlos.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpaHRzanNjZ3dhYXh5ZmtkbG9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NzA4NzgsImV4cCI6MjEwNzE0Njg3OH0.7-sfZ2nwoy7iOzGGdx69cWRj2C_Bdhk39y7_CdNfrlo";
  const $ = id => document.getElementById(id);
  const translations = {
    welcome:['Welcome,','Selamat datang,'],joined:['Joined','Bergabung'],uploadVideo:['Upload video','Unggah video'],videos:['Videos','Video'],viewers:['Viewers','Penonton'],earned:['Earned','Penghasilan'],overview:['Overview','Ringkasan'],loading:['Loading data','Memuat data'],online:['Online','Online'],onlineNote:['Currently watching your videos','Sedang menonton video kamu'],views:['Views','Penayangan'],allTime:['All time','Sepanjang waktu'],avgCpm:['Avg. CPM','Rata-rata CPM'],perThousand:['Per 1,000 monetized views','Per 1.000 tayangan termonetisasi'],revenue:['Revenue','Pendapatan'],totalRevenue:['Total recorded earnings','Total penghasilan tercatat'],performance:['Performance','Performa'],thisWeek:['This Week','Minggu Ini'],lastWeek:['Last Week','Minggu Lalu'],balance:['Balance','Saldo'],availableBalance:['Available balance','Saldo tersedia'],manageBalance:['Manage balance','Kelola saldo'],dailyRank:['Daily Rank','Peringkat Harian'],rankSubtitle:['Your position among creators','Posisi kamu di antara kreator'],leaderboard:['Leaderboard','Papan Peringkat'],rank:['Rank','Peringkat'],viewLeaderboard:['View Leaderboard','Lihat Papan Peringkat'],statistics:['Statistics','Statistik'],statsSubtitle:['Your channel at a glance','Ringkasan channel kamu'],earning:['EARNING','PENGHASILAN'],viewersCaps:['VIEWERS','PENONTON'],noStats:['Statistics will appear when view and earning records are available.','Statistik akan muncul ketika data penayangan dan penghasilan tersedia.'],topVideos:['Top Videos','Video Teratas'],topVideosSubtitle:['Your most viewed videos','Video kamu dengan penayangan terbanyak'],loadingVideos:['Loading videos…','Memuat video…'],uploadNote:['Save video details to your account database.','Simpan detail video ke database akunmu.'],videoTitle:['Video title','Judul video'],videoUrl:['Video URL (optional)','URL video (opsional)'],saveVideo:['Save video details','Simpan detail video'],storageNote:['This saves metadata only; actual video file storage is not connected yet.','Ini hanya menyimpan metadata; penyimpanan file video belum terhubung.'],search:['Search','Cari'],searchSubtitle:['Find a video in your library','Temukan video di koleksi kamu'],account:['Account','Akun'],username:['Username','Nama pengguna'],settings:['Settings','Pengaturan'],profileSettings:['Profile settings','Pengaturan profil'],logOut:['Log out','Keluar'],loadingLeaderboard:['Loading leaderboard…','Memuat papan peringkat…'],settingsNote:['Account and payout settings will be expanded in a later step.','Pengaturan akun dan pembayaran akan dikembangkan pada tahap berikutnya.'],noVideos:['No videos yet','Belum ada video'],saveSuccess:['Video details saved to database.','Detail video berhasil disimpan ke database.'],saveFailed:['Could not save video: ','Gagal menyimpan video: '],loadFailed:['Some dashboard data could not be loaded. Check the SQL migration and Supabase permissions.','Sebagian data dashboard gagal dimuat. Periksa migrasi SQL dan izin Supabase.'],viewsCount:['views','penayangan'],noLeaderboard:['No leaderboard data yet.','Belum ada data papan peringkat.'],profileMissing:['Profile not found. Run the Jsvidey SQL migration.','Profil tidak ditemukan. Jalankan migrasi SQL Jsvidey.'],notConfigured:['Supabase configuration is missing.','Konfigurasi Supabase belum tersedia.'],noTitle:['Please enter a video title.','Masukkan judul video.']
  };
  let lang = 'en';
  try { lang = localStorage.getItem('jsvidey-language') || 'id'; } catch (_) {}
  const t = key => (translations[key] || [key,key])[lang === 'en' ? 0 : 1];
  function applyTranslations() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => { const key=el.dataset.i18n; if(translations[key]) el.textContent=t(key); });
    const search=$('videoSearch'); if(search) search.placeholder=lang==='en'?'Search your videos…':'Cari video kamu…';
    const title=$('videoTitle'); if(title) title.placeholder=lang==='en'?'Enter video title':'Masukkan judul video';
    const url=$('videoUrl'); if(url) url.placeholder='https://…';
  }
  applyTranslations();
  document.addEventListener('jsvidey:language-change',e=>{lang=e.detail.lang;applyTranslations();});
  if (!window.supabase) {
    const status=$('dataStatus'); if(status){status.classList.add('error');status.innerHTML='<i class="fa-solid fa-circle-exclamation"></i><span>Supabase config</span>';}
    return;
  }
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const formatNum = n => new Intl.NumberFormat(lang==='en'?'en-US':'id-ID',{maximumFractionDigits:0}).format(Number(n)||0);
  const money = n => 'Rp' + formatNum(n);
  const dateFmt = value => value ? new Intl.DateTimeFormat(lang==='en'?'en-GB':'id-ID',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(value)) : '—';
  const escapeHtml = value => String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  let user = null, videos = [], earnings = [], viewRows = [];
  const statusText = (text,error=false) => {const el=$('dataStatus'); if(el){el.classList.toggle('error',error);el.innerHTML=`<i class="fa-solid fa-circle"></i><span>${escapeHtml(text)}</span>`;}};
  async function init() {
    const {data:{user:authUser},error:authError}=await client.auth.getUser();
    if(authError || !authUser){try{localStorage.removeItem('jsvidey-session')}catch(_){} location.replace('login.html');return;}
    user=authUser;
    const {data:profile,error:profileError}=await client.from('profiles').select('username,display_name,created_at,plan').eq('id',user.id).maybeSingle();
    if(profileError) console.warn('profile',profileError);
    if(!profile){statusText(t('profileMissing'),true);}
    const name=profile?.display_name || profile?.username || user.user_metadata?.username || user.email?.split('@')[0] || 'Creator';
    $('welcomeName').textContent=name;
    $('profileName').textContent=profile?.username || name;
    $('profileEmail').textContent=user.email || '—';
    $('joinedDate').textContent=dateFmt(profile?.created_at || user.created_at);
    $('planBadge').textContent=profile?.plan || 'Basic';
    try{localStorage.setItem('jsvidey-session',JSON.stringify({id:user.id,name,username:profile?.username||name,email:user.email,at:Date.now()}));document.body.classList.add('jsvidey-logged-in');}catch(_){}
    const results=await Promise.all([
      client.from('videos').select('id,title,video_url,status,created_at').eq('user_id',user.id).order('created_at',{ascending:false}),
      client.from('creator_earnings').select('amount_idr,views, cpm_idr,created_at').eq('user_id',user.id).order('created_at',{ascending:false}),
      client.from('creator_wallets').select('available_balance_idr').eq('user_id',user.id).maybeSingle(),
      client.from('creator_video_views').select('video_id,viewed_at,views').eq('creator_id',user.id)
    ]);
    const [videoRes,earningRes,walletRes,viewRes]=results;
    const firstError=results.find(r=>r.error)?.error;
    if(firstError){console.error(firstError);statusText(t('loadFailed'),true);}
    videos=videoRes.data||[]; earnings=earningRes.data||[]; viewRows=viewRes.data||[];
    const totalViews=viewRows.reduce((sum,row)=>sum+Number(row.views||1),0);
    const totalEarned=earnings.reduce((sum,row)=>sum+Number(row.amount_idr||0),0);
    const totalEarningViews=earnings.reduce((sum,row)=>sum+Number(row.views||0),0);
    const avgCpm=totalEarningViews ? totalEarned/totalEarningViews*1000 : earnings.reduce((sum,row)=>sum+Number(row.cpm_idr||0),0)/(earnings.length||1);
    $('statVideos').textContent=formatNum(videos.length);$('statViews').textContent=formatNum(totalViews);$('statEarned').textContent=money(totalEarned);
    $('overviewViews').textContent=formatNum(totalViews);$('overviewRevenue').textContent=money(totalEarned);$('avgCpm').textContent=money(avgCpm);
    $('walletBalance').textContent=money(walletRes.data?.available_balance_idr||0);
    const now=new Date(), startThis=new Date(now);startThis.setDate(now.getDate()-((now.getDay()+6)%7));startThis.setHours(0,0,0,0);
    const startLast=new Date(startThis);startLast.setDate(startThis.getDate()-7);
    const revenueThis=earnings.filter(e=>new Date(e.created_at)>=startThis);
    const revenueLast=earnings.filter(e=>new Date(e.created_at)>=startLast && new Date(e.created_at)<startThis);
    $('thisWeekRevenue').textContent=money(revenueThis.reduce((s,e)=>s+Number(e.amount_idr||0),0));
    $('thisWeekViews').textContent=formatNum(revenueThis.reduce((s,e)=>s+Number(e.views||0),0))+' '+t('viewsCount');
    $('lastWeekRevenue').textContent=money(revenueLast.reduce((s,e)=>s+Number(e.amount_idr||0),0));
    $('lastWeekViews').textContent=formatNum(revenueLast.reduce((s,e)=>s+Number(e.views||0),0))+' '+t('viewsCount');
    const fiveMinAgo=Date.now()-5*60*1000;
    $('statOnline').textContent=formatNum(viewRows.filter(v=>new Date(v.viewed_at)>=fiveMinAgo).reduce((s,v)=>s+Number(v.views||1),0));
    renderVideos(); renderChart('earnings'); await loadLeaderboard();
    if(!firstError) statusText(lang==='en'?'Database connected':'Database terhubung');
  }
  function renderVideos(filter=''){
    const list=$('videoList');const rows=videos.filter(v=>(v.title||'').toLowerCase().includes(filter.toLowerCase()));
    if(!rows.length){list.innerHTML=`<div class="empty-state"><i class="fa-solid fa-photo-film"></i><strong>${t('noVideos')}</strong></div>`;return;}
    list.innerHTML=rows.slice(0,8).map(v=>{const views=viewRows.filter(r=>r.video_id===v.id).reduce((s,r)=>s+Number(r.views||1),0);return `<div class="video-item"><span class="video-thumb"><i class="fa-solid fa-file-video"></i></span><div><strong>${escapeHtml(v.title)}</strong><small>${escapeHtml(v.status||'published')} · ${escapeHtml(dateFmt(v.created_at))}</small></div><span class="video-views"><i class="fa-solid fa-eye"></i> ${formatNum(views)}</span></div>`;}).join('');
  }
  function renderChart(mode){
    const chart=$('statsChart');let rows=[];
    const start=new Date();start.setHours(0,0,0,0);start.setDate(start.getDate()-6);
    for(let i=0;i<7;i++){const day=new Date(start);day.setDate(start.getDate()+i);const next=new Date(day);next.setDate(day.getDate()+1);
      const dayRows=(mode==='earnings'?earnings:viewRows).filter(r=>{const d=new Date(r.created_at||r.viewed_at);return d>=day&&d<next;});
      rows.push(mode==='earnings'?dayRows.reduce((s,r)=>s+Number(r.amount_idr||0),0):dayRows.reduce((s,r)=>s+Number(r.views||1),0));}
    const max=Math.max(...rows,0);if(!max){chart.innerHTML=`<div class="chart-empty">${t('noStats')}</div>`;return;}
    chart.innerHTML=rows.map((n,i)=>`<div class="chart-bar" title="${escapeHtml(dateFmt(new Date(start.getTime()+i*86400000)))}: ${formatNum(n)}" style="height:${Math.max(8,n/max*100)}%"></div>`).join('');
  }
  async function loadLeaderboard(){
    const box=$('leaderboardList');
    const {data,error}=await client.from('creator_leaderboard').select('user_id,username,display_name,total_views,total_earned_idr').order('total_views',{ascending:false}).limit(10);
    if(error){console.warn('leaderboard',error);box.innerHTML=`<p class="muted">${t('noLeaderboard')}</p>`;$('dailyRank').textContent='-';$('rankLabel').textContent='-';return;}
    if(!data?.length){box.innerHTML=`<p class="muted">${t('noLeaderboard')}</p>`;return;}
    const myIndex=data.findIndex(row=>row.user_id===user.id);if(myIndex>=0){$('dailyRank').textContent='#'+(myIndex+1);$('rankLabel').textContent='#'+(myIndex+1);}
    box.innerHTML=data.map((row,i)=>`<div class="leaderboard-row"><span class="rank">#${i+1}</span><div><strong>${escapeHtml(row.display_name||row.username||'Creator')}</strong><small>${formatNum(row.total_views)} ${t('viewsCount')}</small></div><span class="score">${money(row.total_earned_idr)}</span></div>`).join('');
  }
  $('uploadForm')?.addEventListener('submit',async e=>{
    e.preventDefault();const title=$('videoTitle').value.trim(),url=$('videoUrl').value.trim(),msg=$('uploadMessage');
    if(!title){msg.textContent=t('noTitle');return;}
    const button=e.currentTarget.querySelector('button[type=submit]');button.disabled=true;
    const {data,error}=await client.from('videos').insert({user_id:user.id,title,video_url:url||null,status:'draft'}).select('id,title,video_url,status,created_at').single();
    button.disabled=false;
    if(error){msg.className='form-message';msg.textContent=(lang==='en'?'Could not save video: ':'Gagal menyimpan video: ')+error.message;return;}
    videos.unshift(data);renderVideos($('videoSearch').value||'');$('statVideos').textContent=formatNum(videos.length);msg.className='form-message success';msg.textContent=t('saveSuccess');e.currentTarget.reset();
  });
  $('videoSearch')?.addEventListener('input',e=>renderVideos(e.target.value));
  document.querySelectorAll('[data-chart]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-chart]').forEach(b=>b.classList.toggle('active',b===button));renderChart(button.dataset.chart);}));
  async function logout(){await client.auth.signOut();try{localStorage.removeItem('jsvidey-session')}catch(_){}location.href='index.html';}
  $('logoutButton')?.addEventListener('click',logout);
  document.addEventListener('jsvidey:logout',logout);
  init().catch(err=>{console.error(err);statusText(t('loadFailed'),true);});
})();