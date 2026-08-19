
const http = require('http');
const s = http.createServer((req,res)=>{res.writeHead(200,{'Content-Type':'text/html'});res.end('<html><body style="background:#7c5cff;color:#fff;font-size:40px;padding:40px;">FROM SAVED ASSIGNMENT SOURCE</body></html>');});
s.listen(0, ()=>{ const p=s.address().port; console.log('Local: http://localhost:'+p+'/'); });
