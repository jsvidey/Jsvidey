const SUPABASE_URL='https://yihtsjscgwaaxyfkdlos.supabase.co';
const SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpaHRzanNjZ3dhYXh5ZmtkbG9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NzA4NzgsImV4cCI6MjEwNzE0Njg3OH0.7-sfZ2nwoy7iOzGGdx69cWRj2C_Bdhk39y7_CdNfrlo';
(()=>{
  const $=id=>document.getElementById(id), MAX_BYTES=20*1024*1024;
  let lang='id', selectedFile=null, user=null, db=null, xhr=null;
  try{lang=localStorage.getItem('jsvidey-language')||'id'}catch(_){}
  const copy={
    uploadVideo:['Upload video','Upload video'],uploadNote:['Choose a media file, upload directly to Backblaze, and track progress.','Pilih media, unggah langsung ke Backblaze, dan pantau prosesnya.'],videoTitle:['Video title','Judul video']
  };
  const t=k=>(copy[k]||[k,k])[lang==='en'?0:1];
  document.addEventListener('jsvidey:language-change',e=>{lang=e.detail.lang;document.querySelectorAll('[data-i18n]').forEach(el=>{if(copy[el.dataset.i18n])el.textContent=t(el.dataset.i18n)})});
  document.querySelectorAll('[data-i18n]').forEach(el=>{if(copy[el.dataset.i18n])el.textContent=t(el.dataset.i18n)});
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmtBytes=n=>n<1024*1024?`${(n/1024).toFixed(0)} KB`:`${(n/1024/1024).toFixed(2)} MB`;
  const msg=(text,ok=false)=>{const el=$('uploadMessage');el.textContent=text;el.classList.toggle('success',ok)};
  const showNotice=(kind,title,detail,percent=0,stage='',sizeText='')=>{const box=$('uploadNotice');box.hidden=false;box.classList.remove('is-success','is-error');if(kind==='success')box.classList.add('is-success');if(kind==='error')box.classList.add('is-error');const icon=kind==='success'?'fa-circle-check':kind==='error'?'fa-circle-exclamation':'fa-cloud-arrow-up';$('noticeIcon').innerHTML=`<i class="fa-solid ${icon}"></i>`;$('noticeTitle').textContent=title;$('noticeDetail').textContent=detail;$('uploadPercent').textContent=`${Math.round(percent)}%`;$('progressBar').style.width=`${Math.max(0,Math.min(100,percent))}%`;$('uploadStage').textContent=stage;$('uploadSize').textContent=sizeText};
  const renderSelected=()=>{const box=$('selectedFile');if(!selectedFile){box.hidden=true;box.innerHTML='';return}box.hidden=false;box.innerHTML=`<span class="file-symbol"><i class="fa-solid fa-file-video"></i></span><span class="file-copy"><strong>${esc(selectedFile.name)}</strong><small>${fmtBytes(selectedFile.size)} · ${esc(selectedFile.type||'video file')}</small></span><button type="button" class="remove-file" id="removeSelected" aria-label="Hapus file terpilih"><i class="fa-solid fa-xmark"></i></button>`;$('removeSelected').addEventListener('click',()=>{if(xhr)return;selectedFile=null;$('videoFile').value='';renderSelected();msg('');$('uploadNotice').hidden=true})};
  const selectFile=file=>{if(!file)return;if(!file.type.startsWith('video/')&&!/\.(mp4|webm|mov|m4v|ogv)$/i.test(file.name)){msg('File tidak dikenali sebagai video. Pilih file video seperti MP4, WebM, atau MOV.');return}if(file.size>=MAX_BYTES){selectedFile=null;$('videoFile').value='';renderSelected();showNotice('error','Ukuran file terlalu besar','Pilih file yang ukurannya di bawah 20 MB.',0,'Upload dibatalkan',`${fmtBytes(file.size)} / 20 MB`);msg('Ukuran file harus di bawah 20 MB.');return}selectedFile=file;renderSelected();$('uploadNotice').hidden=true;msg('')};
  const drop=$('dropZone'), picker=$('videoFile');
  picker.addEventListener('change',()=>selectFile(picker.files?.[0]));
  drop.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();picker.click()}});
  ['dragenter','dragover'].forEach(type=>drop.addEventListener(type,e=>{e.preventDefault();drop.classList.add('drag-over')}));
  ['dragleave','drop'].forEach(type=>drop.addEventListener(type,e=>{e.preventDefault();drop.classList.remove('drag-over')}));
  drop.addEventListener('drop',e=>selectFile(e.dataTransfer?.files?.[0]));
  const setBusy=busy=>{const btn=$('uploadButton');btn.disabled=busy;btn.innerHTML=busy?'<i class="fa-solid fa-spinner fa-spin"></i><span>Mengunggah…</span>':'<i class="fa-solid fa-cloud-arrow-up"></i><span>Upload video</span><i class="fa-solid fa-arrow-right button-arrow"></i>';picker.disabled=busy};
  function getSupabaseClient(){
    if(window.jsvideySupabaseClient)return window.jsvideySupabaseClient;
    if(!window.supabase?.createClient)throw new Error('Library Supabase gagal dimuat. Periksa koneksi internet.');
    window.jsvideySupabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{
      auth:{storageKey:'sb-yihtsjscgwaaxyfkdlos-auth-token',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
    });
    return window.jsvideySupabaseClient;
  }
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  async function getUser(){
    try{
      if(!window.supabase?.createClient){msg('Library Supabase gagal dimuat. Periksa koneksi internet lalu muat ulang halaman.');return null}
      db=getSupabaseClient();
      let sessionResult=await db.auth.getSession();
      if(sessionResult.error)throw sessionResult.error;
      // On mobile Safari the SDK may need a moment to restore the persisted session.
      if(!sessionResult.data?.session){await wait(350);sessionResult=await db.auth.getSession();if(sessionResult.error)throw sessionResult.error;}
      if(!sessionResult.data?.session){
        try{localStorage.removeItem('jsvidey-session')}catch(_){}
        location.replace('login.html?next=upload.html');
        return null;
      }
      const {data,error}=await db.auth.getUser();
      if(error){
        // Network or temporary API errors should not destroy a valid persisted session.
        console.error('Jsvidey session validation:',error);
        msg('Sesi ditemukan, tetapi Supabase gagal memverifikasinya: '+(error.message||'error tidak diketahui')+'. Muat ulang halaman; jika berulang, kirim teks error ini.');
        return null;
      }
      if(!data?.user){msg('Sesi login tidak ditemukan. Silakan login kembali.');return null;}
      const u=data.user;
      try{localStorage.setItem('jsvidey-session',JSON.stringify({id:u.id,name:u.user_metadata?.display_name||u.user_metadata?.username||u.email?.split('@')[0]||'Member',username:u.user_metadata?.username||'',email:u.email||'',at:Date.now()}))}catch(_){}
      return u;
    }catch(error){
      console.error('Jsvidey auth check:',error);
      msg('Tidak dapat memeriksa sesi login. Periksa koneksi lalu muat ulang halaman.');
      return null;
    }
  }
  function putFile(url,file,contentType,onProgress){
    return new Promise((resolve,reject)=>{
      const request=new XMLHttpRequest();
      xhr=request;
      let finished=false;
      const finish=callback=>{if(finished)return;finished=true;if(xhr===request)xhr=null;callback()};
      try{
        request.open('PUT',url,true);
        request.timeout=120000;
        request.setRequestHeader('Content-Type',contentType||'application/octet-stream');
        request.upload.onprogress=e=>{if(e.lengthComputable)onProgress(e.loaded,e.total)};
        request.onload=()=>{
          const status=request.status;
          const response=(request.responseText||'').trim();
          if(status>=200&&status<300){finish(resolve);return}
          // Do not print the signed URL: it contains temporary authorization data.
          const detail=response?` — ${response.slice(0,300)}`:'';
          finish(()=>reject(new Error(`Backblaze menolak upload (HTTP ${status})${detail}. Periksa bucket, masa berlaku URL, Content-Type, dan izin B2.`)));
        };
        request.onerror=()=>finish(()=>reject(new Error('Browser tidak dapat membaca respons Backblaze. Ini bisa disebabkan CORS, jaringan, atau URL upload yang tidak valid.')));
        request.ontimeout=()=>finish(()=>reject(new Error('Upload melewati batas waktu 120 detik. Periksa koneksi lalu coba lagi.')));
        request.onabort=()=>finish(()=>reject(new Error('Upload dibatalkan.')));
        request.send(file);
      }catch(error){
        finish(()=>reject(new Error(`Tidak dapat memulai upload: ${error?.message||'kesalahan browser'}`)));
      }
    });
  }
  $('uploadForm').addEventListener('submit',async e=>{
    e.preventDefault();if(!user||!db){msg('Sesi login belum siap. Tunggu sebentar lalu muat ulang halaman; jika perlu, login kembali.');return;}
    const title=$('videoTitle').value.trim();if(!title){msg('Masukkan judul video terlebih dahulu.');$('videoTitle').focus();return}if(!selectedFile){msg('Pilih file video yang ingin diunggah.');return}if(selectedFile.size>=MAX_BYTES){msg('Ukuran file harus di bawah 20 MB.');return}
    const file=selectedFile, contentType=file.type||'video/mp4';setBusy(true);msg('');showNotice('upload','Menyiapkan upload…','Meminta URL upload aman dari server',0,'Persiapan',`0 MB / ${fmtBytes(file.size)}`);
    try{
      const {data:signData,error:signError}=await db.functions.invoke('create-b2-upload-url',{body:{fileName:file.name,fileSize:file.size,contentType}});
      if(signError)throw new Error(`Tidak dapat menyiapkan upload. Pastikan Supabase Edge Function create-b2-upload-url sudah di-deploy. ${signError.message||''}`);
      if(!signData?.uploadUrl||!signData?.storageKey)throw new Error(signData?.error||'Server tidak mengembalikan URL upload yang valid.');
      showNotice('upload','Mengunggah ke Backblaze B2','File dikirim langsung ke penyimpanan',0,'Mengunggah',`0 MB / ${fmtBytes(file.size)}`);
      await putFile(signData.uploadUrl,file,contentType,(loaded,total)=>{const pct=total?loaded/total*100:0;showNotice('upload','Mengunggah ke Backblaze B2',`${fmtBytes(loaded)} dari ${fmtBytes(total)} terkirim`,pct,'Transfer file',`${fmtBytes(loaded)} / ${fmtBytes(total)}`)});
      showNotice('upload','Menyimpan detail video…','Upload file selesai; menyimpan metadata akun',100,'Menyimpan metadata',`${fmtBytes(file.size)} / ${fmtBytes(file.size)}`);
      const {error:dbError}=await db.from('videos').insert({user_id:user.id,title,video_url:null,storage_key:signData.storageKey,file_size_bytes:file.size,mime_type:contentType,status:'draft'});
      if(dbError){showNotice('error','File sudah terunggah, metadata gagal disimpan',dbError.message,100,'Perlu tindakan',`${fmtBytes(file.size)} / ${fmtBytes(file.size)}`);throw new Error('File berhasil dikirim ke Backblaze, tetapi detail database gagal disimpan. Jangan upload ulang dulu; periksa bucket atau simpan metadata secara manual. '+dbError.message)}
      showNotice('success','Upload berhasil!','Video sudah tersimpan di bucket Private Backblaze dan metadata tercatat di akunmu. URL pemutaran aman perlu dibuat saat video ditonton.',100,'Selesai',`${fmtBytes(file.size)} / ${fmtBytes(file.size)}`);msg('Video berhasil diunggah dan metadata tersimpan di database.',true);$('uploadForm').reset();selectedFile=null;renderSelected();
    }catch(err){console.error('Jsvidey upload:',err);if(!$('uploadNotice').classList.contains('is-error'))showNotice('error','Upload gagal',err.message||'Terjadi kesalahan saat mengunggah.',0,'Gagal',selectedFile?`0 MB / ${fmtBytes(selectedFile.size)}`:'');msg(err.message||'Upload gagal. Coba lagi.')}
    finally{setBusy(false)}
  });
  document.addEventListener('jsvidey:logout',async()=>{try{localStorage.removeItem('jsvidey-session')}catch(_){}if(db)await db.auth.signOut();location.href='login.html'});
  getUser().then(u=>{user=u}).catch(err=>{console.error(err);msg('Tidak dapat memeriksa sesi login.')});
})();
