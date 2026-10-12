const SUPABASE_URL='https://yihtsjscgwaaxyfkdlos.supabase.co';
const SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpaHRzanNjZ3dhYXh5ZmtkbG9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NzA4NzgsImV4cCI6MjEwNzE0Njg3OH0.7-sfZ2nwoy7iOzGGdx69cWRj2C_Bdhk39y7_CdNfrlo';
(()=>{
  const $=id=>document.getElementById(id);
  let lang='id',user=null,db=null;
  try{lang=localStorage.getItem('jsvidey-language')||'id'}catch(_ ){}
  const msg=(text,ok=false)=>{const el=$('uploadMessage');el.textContent=text;el.classList.toggle('success',ok)};
  function getDb(){
    if(window.jsvideySupabaseClient)return window.jsvideySupabaseClient;
    if(!window.supabase?.createClient)throw new Error('Library Supabase gagal dimuat. Periksa koneksi internet.');
    window.jsvideySupabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{
      auth:{storageKey:'sb-yihtsjscgwaaxyfkdlos-auth-token',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
    });
    return window.jsvideySupabaseClient;
  }
  async function getUser(){
    try{
      db=getDb();
      let result=await db.auth.getSession();
      if(!result.data?.session){await new Promise(r=>setTimeout(r,350));result=await db.auth.getSession()}
      if(!result.data?.session){location.replace('login.html?next=upload.html');return null}
      const {data,error}=await db.auth.getUser();
      if(error)throw error;
      if(!data?.user){location.replace('login.html?next=upload.html');return null}
      user=data.user;
      try{localStorage.setItem('jsvidey-session',JSON.stringify({id:user.id,name:user.user_metadata?.display_name||user.user_metadata?.username||user.email?.split('@')[0]||'Member',username:user.user_metadata?.username||'',email:user.email||'',at:Date.now()}))}catch(_ ){}
      return user;
    }catch(error){console.error('Jsvidey auth check:',error);msg('Tidak dapat memeriksa sesi login. Muat ulang halaman dan coba lagi.');return null}
  }
  function classify(raw){
    let u;try{u=new URL(raw.trim())}catch(_){throw new Error('Masukkan link media yang valid.')}
    if(u.protocol!=='https:')throw new Error('Demi keamanan, link media harus menggunakan HTTPS.');
    const host=u.hostname.toLowerCase().replace(/^www\./,'');
    const path=u.pathname;
    let id,embedUrl,provider='Link media';
    if(host==='youtu.be'||host==='youtube.com'||host==='m.youtube.com'||host==='youtube-nocookie.com'){
      if(host==='youtu.be')id=path.split('/').filter(Boolean)[0];
      else if(path==='/watch')id=u.searchParams.get('v');
      else {const m=path.match(/^\/(?:embed|shorts|live)\/([^/?]+)/);id=m?.[1]}
      if(!id)throw new Error('Link YouTube tidak dikenali. Gunakan link video, Shorts, atau youtu.be.');
      provider='YouTube';embedUrl='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id);
    } else if(host==='drive.google.com'){
      id=(path.match(/\/file\/d\/([^/]+)/)||[])[1]||u.searchParams.get('id');
      if(!id)throw new Error('Link Google Drive tidak dikenali. Atur akses file agar dapat dibuka oleh penonton.');
      provider='Google Drive';embedUrl='https://drive.google.com/file/d/'+encodeURIComponent(id)+'/preview';
    } else if(host==='videy.co'||host.endsWith('.videy.co')||host==='videy.net'||host.endsWith('.videy.net')){
      provider='Videy';embedUrl=u.href;
    } else if(host==='vimeo.com'||host==='player.vimeo.com'){
      id=host==='player.vimeo.com'?(path.match(/\/video\/([0-9]+)/)||[])[1]:path.split('/').filter(Boolean)[0];
      if(!id||!/^\d+$/.test(id))throw new Error('Link Vimeo tidak dikenali.');
      provider='Vimeo';embedUrl='https://player.vimeo.com/video/'+id;
    } else {
      provider='Media eksternal';embedUrl=u.href;
    }
    const isDirect=/\.(mp4|webm|mov|m4v|ogv|ogg|m3u8)(?:$)/i.test(u.pathname)||/cdn\.videy\.co$/i.test(host)&&/\.(mp4|webm)$/i.test(u.pathname);
    return {url:u.href,provider,embedUrl:embedUrl||u.href,isDirect};
  }
  const urlInput=$('mediaUrl');
  function updatePreview(){
    const value=urlInput.value.trim();
    if(!value){$('embedPreview').hidden=true;return}
    try{const info=classify(value);$('previewProvider').textContent=info.provider;$('previewUrl').textContent=info.url;$('embedPreview').hidden=false}
    catch(_){$('embedPreview').hidden=true}
  }
  urlInput.addEventListener('input',updatePreview);
  $('uploadForm').addEventListener('submit',async e=>{
    e.preventDefault();
    if(!user||!db){msg('Sedang memeriksa login. Tunggu sebentar lalu coba lagi.');return}
    const title=$('videoTitle').value.trim();
    if(!title){msg('Masukkan judul video.');$('videoTitle').focus();return}
    let media;try{media=classify(urlInput.value)}catch(err){msg(err.message);urlInput.focus();return}
    const btn=$('uploadButton');btn.disabled=true;btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i><span>Menyimpan link…</span>';
    msg('');
    try{
      const {data,error}=await db.from('videos').insert({user_id:user.id,title,video_url:media.url,status:'published'}).select('id').single();
      if(error)throw error;
      msg('Link media berhasil disimpan! Video sekarang bisa dibagikan melalui halaman Jsvidey.',true);
      $('uploadForm').reset();$('embedPreview').hidden=true;
      const shareUrl=new URL('watch.html',location.href);shareUrl.searchParams.set('id',data.id);
      const share=document.createElement('a');share.href=shareUrl.href;share.textContent='Buka halaman video';share.className='saved-video-link';share.target='_blank';share.rel='noopener';
      $('uploadMessage').appendChild(document.createTextNode(' '));$('uploadMessage').appendChild(share);
    }catch(err){console.error('Jsvidey embed link save:',err);msg('Gagal menyimpan link: '+(err.message||'Periksa koneksi, login, dan kebijakan Supabase.'))}
    finally{btn.disabled=false;btn.innerHTML='<i class="fa-solid fa-link"></i><span>Simpan link media</span><i class="fa-solid fa-arrow-right button-arrow"></i>'}
  });
  document.addEventListener('jsvidey:logout',async()=>{try{localStorage.removeItem('jsvidey-session')}catch(_){}if(db)await db.auth.signOut();location.href='login.html'});
  getUser();
})();
