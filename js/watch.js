const SUPABASE_URL='https://yihtsjscgwaaxyfkdlos.supabase.co';
const SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpaHRzanNjZ3dhYXh5ZmtkbG9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NzA4NzgsImV4cCI6MjEwNzE0Njg3OH0.7-sfZ2nwoy7iOzGGdx69cWRj2C_Bdhk39y7_CdNfrlo';
(async()=>{
 const $=id=>document.getElementById(id),videoId=new URLSearchParams(location.search).get('id');
 const state=$('state'),player=$('player'),frame=$('embedFrame'),iframe=$('embedPlayer'),download=$('downloadButton');
 let db=null,user=null;
 function fail(message){state.hidden=false;state.classList.add('error');state.textContent=message;$('statusText').textContent=message;download.disabled=true}
 function classify(raw){
   let u;try{u=new URL(raw)}catch(_){throw new Error('Link media tidak valid.')}
   if(u.protocol!=='https:')throw new Error('Link media tidak aman. Hanya HTTPS yang didukung.');
   const host=u.hostname.toLowerCase().replace(/^www\./,'');const path=u.pathname;let id,provider='Media eksternal',embed=u.href;
   if(host==='youtu.be'||host==='youtube.com'||host==='m.youtube.com'||host==='youtube-nocookie.com'){
     if(host==='youtu.be')id=path.split('/').filter(Boolean)[0];else if(path==='/watch')id=u.searchParams.get('v');else id=(path.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)||[])[1];
     if(!id)throw new Error('Link YouTube tidak dikenali.');provider='YouTube';embed='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id);
   }else if(host==='drive.google.com'){
     id=(path.match(/\/file\/d\/([^/]+)/)||[])[1]||u.searchParams.get('id');
     if(!id)throw new Error('Link Google Drive tidak dikenali.');provider='Google Drive';embed='https://drive.google.com/file/d/'+encodeURIComponent(id)+'/preview';
   }else if(host==='videy.co'||host.endsWith('.videy.co')||host==='videy.net'||host.endsWith('.videy.net')){provider='Videy';}
   else if(host==='vimeo.com'||host==='player.vimeo.com'){
     id=host==='player.vimeo.com'?(path.match(/\/video\/([0-9]+)/)||[])[1]:path.split('/').filter(Boolean)[0];
     if(!id||!/^\d+$/.test(id))throw new Error('Link Vimeo tidak dikenali.');provider='Vimeo';embed='https://player.vimeo.com/video/'+id;
   }
   const direct=/\.(mp4|webm|mov|m4v|ogv|ogg|m3u8)(?:$)/i.test(path);
   return {embed,provider,direct};
 }
 function showEmbed(url){
   window.__sourceVideoUrl=url;
   const m=classify(url);$('videoTitle').textContent=window.__videoTitle||'Video Jsvidey';
   if(m.direct){player.src=m.embed;player.hidden=false;frame.hidden=true;}
   else{iframe.src=m.embed;frame.hidden=false;player.hidden=true;}
   state.hidden=true;$('statusText').textContent='Media: '+m.provider+'. Jika tidak tampil, penyedia mungkin membatasi embed atau meminta akses/login.';
 }
 if(!videoId){fail('ID video tidak ditemukan di alamat halaman.');return}
 if(!window.supabase?.createClient){fail('Library Supabase gagal dimuat.');return}
 db=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{auth:{storageKey:'sb-yihtsjscgwaaxyfkdlos-auth-token',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 try{
   const {data,error}=await db.rpc('get_public_embed_video',{p_video_id:videoId});
   if(error){
     console.error('get_public_embed_video failed:',error);
     fail('Gagal membaca data video dari Supabase. Pastikan SQL get_public_embed_video.sql sudah dijalankan dan fungsi memberi akses kepada anon.');
     return;
   }
   const record=Array.isArray(data)?data[0]:data;
   if(!record?.video_url||record.status!=='published'){
     fail('Video tidak ditemukan atau belum dipublikasikan.');
     return;
   }
   window.__videoTitle=record.title||'Video Jsvidey';
   showEmbed(record.video_url);
   download.hidden=true;
 }catch(e){
   console.error('Embed lookup failed:',e);
   fail('Tidak dapat menghubungi Supabase. Periksa koneksi internet lalu muat ulang halaman.');
   return;
 }

})();
