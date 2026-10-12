(function(){var st=document.createElement('style');
st.textContent='.bb-submit{display:inline-flex;position:relative;border-radius:80px;background:#AE9AE4;border:1px solid #212121;overflow:hidden;cursor:pointer;align-self:flex-start}.form-button-wrapper{height:auto!important}'+
'.bb-submit .form-button{background:transparent!important;border:0!important;border-radius:80px;height:48px!important;min-height:0!important;line-height:48px;padding:0 32px!important;font-size:16px!important;font-weight:600;text-transform:uppercase;color:#212121;cursor:pointer}';
document.head.appendChild(st);
function wrap(){document.querySelectorAll('form input[type=submit].form-button').forEach(function(i){if(i.parentNode.classList.contains('bb-submit'))return;
var s=document.createElement('span');s.className='bb-submit';s.setAttribute('data-squiggle','');s.setAttribute('data-elastic-pulse-btn','');i.parentNode.insertBefore(s,i);s.appendChild(i);});}
wrap();(function b(){if(!window.barba||!barba.hooks)return setTimeout(b,100);barba.hooks.after(wrap);})();})();
