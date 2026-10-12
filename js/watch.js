const SUPABASE_URL='https://yihtsjscgwaaxyfkdlos.supabase.co';
const SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpaHRzanNjZ3dhYXh5ZmtkbG9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NzA4NzgsImV4cCI6MjEwNzE0Njg3OH0.7-sfZ2nwoy7iOzGGdx69cWRj2C_Bdhk39y7_CdNfrlo';
(async()=>{
 const $=id=>document.getElementById(id);
 const videoId=new URLSearchParams(location.search).get('id');
 const state=$('state'),player=$('player'),frame=$('embedFrame'),iframe=$('embedPlayer');
 const download=$('downloadButton'); // Optional legacy element; the visible download action is downloadPageButton;
 const ratioTools=$('ratioTools');
 const ratioButtons=ratioTools?Array.from(ratioTools.querySelectorAll('[data-ratio]')):[];
 function setRatio(mode){if(frame){frame.classList.toggle('landscape',mode==='landscape');}ratioButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.ratio===mode)));}
 ratioButtons.forEach(b=>b.addEventListener('click',()=>setRatio(b.dataset.ratio)));
 function fail(message){
   if(state){state.hidden=false;state.classList.add('error');state.textContent=message;}
   const status=$('statusText');if(status)status.textContent=message;
   if(download){download.disabled=true;download.hidden=true;}
 }
 function classify(raw){
   let u;try{u=new URL(String(raw||'').trim())}catch(_){throw new Error('Link media tidak valid.')}
   if(u.protocol!=='https:')throw new Error('Link media tidak aman. Hanya HTTPS yang didukung.');
   const host=u.hostname.toLowerCase().replace(/^www\./,'');const path=u.pathname;let id,provider='Media eksternal',embed=u.href;
   if(host==='youtu.be'||host==='youtube.com'||host==='m.youtube.com'||host==='youtube-nocookie.com'){
     if(host==='youtu.be')id=path.split('/').filter(Boolean)[0];
     else if(path==='/watch')id=u.searchParams.get('v');
     else id=(path.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)||[])[1];
     if(!id)throw new Error('Link YouTube tidak dikenali.');
     provider='YouTube';embed='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id);
   }else if(host==='drive.google.com'){
     id=(path.match(/\/file\/d\/([^/]+)/)||[])[1]||u.searchParams.get('id');
     if(!id)throw new Error('Link Google Drive tidak dikenali.');
     provider='Google Drive';embed='https://drive.google.com/file/d/'+encodeURIComponent(id)+'/preview';
   }else if(host==='videy.co'||host.endsWith('.videy.co')||host==='videy.net'||host.endsWith('.videy.net')){
     provider='Videy';
   }else if(host==='vimeo.com'||host==='player.vimeo.com'){
     id=host==='player.vimeo.com'?(path.match(/\/video\/([0-9]+)/)||[])[1]:path.split('/').filter(Boolean)[0];
     if(!id||!/^\d+$/.test(id))throw new Error('Link Vimeo tidak dikenali.');
     provider='Vimeo';embed='https://player.vimeo.com/video/'+id;
   }
   const direct=/\.(mp4|webm|mov|m4v|ogv|ogg|m3u8)(?:$)/i.test(path);
   return {embed,provider,direct};
 }
 function showEmbed(url,title){
   const m=classify(url);
   window.__sourceVideoUrl=url;
   const titleEl=$('videoTitle');if(titleEl)titleEl.textContent=title||'Video Jsvidey';
   if(m.direct){if(ratioTools)ratioTools.hidden=true;iframe.removeAttribute('src');frame.hidden=true;player.src=m.embed;player.hidden=false;player.onloadedmetadata=()=>{if(player.videoWidth&&player.videoHeight){player.style.aspectRatio=player.videoWidth+'/'+player.videoHeight;}};}
   else{player.pause();player.removeAttribute('src');player.load();player.hidden=true;iframe.src=m.embed;frame.hidden=false;const isDrive=m.provider==='Google Drive';if(ratioTools)ratioTools.hidden=!isDrive;setRatio(isDrive?'portrait':'landscape');}
   if(state)state.hidden=true;
   const status=$('statusText');
   if(status)status.textContent='Media: '+m.provider+'. Tombol Download tersedia di bagian bawah video jika penyedia mendukungnya.';
   const downloadPageButton=$('downloadPageButton');if(downloadPageButton)downloadPageButton.href='download.html?id='+encodeURIComponent(videoId);
   if(download)download.hidden=true;
 }
 if(!videoId){fail('ID video tidak ditemukan di alamat halaman.');return;}
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(videoId)){
   fail('ID video tidak valid.');return;
 }
 try{
   // Baca data publik langsung dari tabel Supabase REST. Tidak memanggil Edge Function
   // Backblaze/B2 atau RPC get_public_embed_video.
   const endpoint=SUPABASE_URL+'/rest/v1/videos?id=eq.'+encodeURIComponent(videoId)+
     '&status=eq.published&select=id,title,video_url,status&limit=1';
   const controller=new AbortController();
   const timeout=setTimeout(()=>controller.abort(),12000);
   let response,payload;
   try{
     response=await fetch(endpoint,{
       method:'GET',
       headers:{'apikey':SUPABASE_ANON_KEY,'Authorization':'Bearer '+SUPABASE_ANON_KEY},
       signal:controller.signal,cache:'no-store'
     });
     payload=await response.json().catch(()=>null);
   }finally{clearTimeout(timeout);}
   if(!response.ok){
     console.error('Supabase REST error:',response.status,payload);
     const detail=payload?.message||payload?.hint||('HTTP '+response.status);
     if(response.status===401||response.status===403){
       fail('Supabase menolak akses baca video. Aktifkan izin SELECT publik hanya untuk video berstatus published, atau gunakan RPC publik yang sudah disiapkan.');
     }else{
       fail('Gagal mengambil data video dari Supabase ('+detail+').');
     }
     return;
   }
   const record=Array.isArray(payload)?payload[0]:null;
   if(!record?.video_url||record.status!=='published'){
     fail('Video tidak ditemukan, belum dipublikasikan, atau link belum tersimpan.');return;
   }
   showEmbed(record.video_url,record.title);
 }catch(e){
   console.error('Embed lookup failed:',e);
   const detail=e?.name==='AbortError'?'Permintaan ke Supabase melewati batas waktu 12 detik.':(e?.message||String(e));
   fail('Gagal memuat link embed: '+detail+' Coba muat ulang halaman.');
 }
})();
