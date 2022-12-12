import data from './tokens.json' assert { type: 'json' };
var href = window.location.href.split("/")[2];

document.getElementById("botao").addEventListener("click", ()=>{
    window.location.replace("https://accounts.spotify.com/authorize?" +
    new URLSearchParams({
      response_type: 'token',
      client_id: data["client_id"],
      scope: data["scope"],
      redirect_uri: "http://localhost:5500/home.html"    
    }).toString())
})