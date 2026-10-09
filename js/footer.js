(() => {
  const mount = document.getElementById("footerMount");
  if (!mount) return;
  const year = new Date().getFullYear();
  mount.innerHTML = `<footer class="site-footer"><div class="footer-inner">
    <a class="brand footer-brand" href="index.html"><span class="brand-mark"><i class="fa-solid fa-play"></i></span><span>Jsvidey</span></a>
    <div class="footer-links"><a href="index.html#features">Features</a><a href="index.html#how">How it works</a><a href="mailto:support@jsvidey.com">Contact</a></div>
    <span class="footer-copy">© ${year} Jsvidey. All rights reserved.</span>
    <span class="footer-tagline">Upload, Share, Earn, Withdraw.</span>
  </div></footer>`;
})();