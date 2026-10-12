const SUPABASE_URL='https://yihtsjscgwaaxyfkdlos.supabase.co';
const SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpaHRzanNjZ3dhYWF4eWZrZGxvcyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzkxNTcwODc4LCJleHAiOjIxMDcxNDY4Nzh9.7-sfZ2nwoy7iOzGGdx69cWRj2C_Bdhk39y7_CdNfrlo';
(()=>{
 const $=id=>document.getElementById(id),videoId=new URLSearchParams(location.search).get('id');
 const notice=msg=>{const el=$('socialNotice');if(el)el.textContent=msg};
 if(!videoId||!window.supabase?.createClient){notice('ID video atau koneksi database tidak tersedia.');return}
 const db=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);$('downloadPageButton').href='download.html?id='+encodeURIComponent(videoId);
 let visitorId;
 try{visitorId=localStorage.getItem('jsvidey-visitor-id');if(!visitorId){visitorId=crypto.randomUUID();localStorage.setItem('jsvidey-visitor-id',visitorId)}}catch(_){visitorId=crypto.randomUUID()}
 let liked=false,likeCount=0;
 const renderLikes=()=>{$('likeCount').textContent=String(likeCount);$('likeVideoButton').classList.toggle('liked',liked)};
 async function loadLikes(){
   const [countRes,mineRes]=await Promise.all([
    db.from('video_likes').select('id',{count:'exact',head:true}).eq('video_id',videoId),
    db.from('video_likes').select('id').eq('video_id',videoId).eq('visitor_id',visitorId).maybeSingle()
   ]);
   if(countRes.error||mineRes.error)throw countRes.error||mineRes.error;
   likeCount=countRes.count||0;liked=!!mineRes.data;renderLikes();
 }
 async function loadComments(){
   const {data,error}=await db.from('video_comments').select('id,display_name,body,created_at').eq('video_id',videoId).order('created_at',{ascending:false}).limit(100);
   if(error)throw error;
   $('commentCount').textContent=String(data.length);
   const list=$('commentList');list.replaceChildren();
   if(!data.length){list.innerHTML='<p class="empty-comments"><i class="fa-regular fa-comment-dots"></i> Belum ada komentar. Jadilah yang pertama!</p>';return}
   for(const c of data){const article=document.createElement('article');article.className='comment-item';const meta=document.createElement('div');meta.className='comment-meta';meta.textContent=(c.display_name||'Pengunjung')+' • '+new Date(c.created_at).toLocaleString('id-ID');const p=document.createElement('p');p.textContent=c.body;article.append(meta,p);list.append(article)}
 }
 $('likeVideoButton').addEventListener('click',async()=>{
  $('likeVideoButton').disabled=true;
  try{
   if(liked){const {error}=await db.from('video_likes').delete().eq('video_id',videoId).eq('visitor_id',visitorId);if(error)throw error;liked=false;likeCount=Math.max(0,likeCount-1)}
   else{const {error}=await db.from('video_likes').insert({video_id:videoId,visitor_id:visitorId});if(error&&error.code!=='23505')throw error;if(!error)likeCount++;liked=true}
   renderLikes();notice(liked?'Video disukai.':'Like dibatalkan.');
  }catch(e){notice('Like gagal disimpan. Jalankan SQL database sosial di Supabase.');console.error(e)}finally{$('likeVideoButton').disabled=false}
 });
 $('commentJumpButton').addEventListener('click',()=>{$('commentsSection').scrollIntoView({behavior:'smooth'});$('commentInput').focus()});
 $('shareVideoButton').addEventListener('click',async()=>{try{if(navigator.share)await navigator.share({title:document.title,url:location.href});else{await navigator.clipboard.writeText(location.href);notice('Link berhasil disalin.')}}catch(e){if(e.name!=='AbortError')notice('Tidak dapat membagikan link.')}});
 $('commentForm').addEventListener('submit',async e=>{e.preventDefault();const body=$('commentInput').value.trim(),display_name=$('commentName').value.trim()||'Pengunjung';if(!body)return;const btn=e.submitter; if(btn)btn.disabled=true;try{const {error}=await db.from('video_comments').insert({video_id:videoId,visitor_id:visitorId,display_name,body});if(error)throw error;$('commentInput').value='';notice('Komentar tersimpan di database.');await loadComments()}catch(err){notice('Komentar gagal disimpan. Pastikan SQL database sosial sudah dijalankan.');console.error(err)}finally{if(btn)btn.disabled=false}});
 Promise.all([loadLikes(),loadComments()]).catch(e=>{notice('Database interaksi belum aktif. Jalankan sql/jsvidey-social-database.sql di Supabase.');console.error(e)});
})();
