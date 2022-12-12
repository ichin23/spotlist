var access_token;
var userID;
var user;
var expire;
try{
    var url = window.location.href.split('#')
    if(url.length>1){

        console.log(url)
    var params = url[1].split("&")
    console.log(params)
    var list = []
    params.forEach(element=>{
        list.push(element.split("="))
    })
    var access_token = null
    list.forEach(element=>{
        console.log(element)
        if(element[0]=="access_token"){
            access_token=element[1]
            localStorage.setItem("access_token", access_token)
        }else if(element[0]=="expires_in"){
            console.log(element[0])
            expire=parseInt(element[1])
            var date = new Date()
            date.setSeconds(date.getSeconds()+expire)
            
            localStorage.setItem("expire", (date).toISOString())
        }
    })
    window.location.href="/home.html"
}
}catch(e){
    console.log(e);
}
if(access_token==undefined){
    if(localStorage.access_token!=undefined){
        access_token=localStorage.access_token
    }
    if(localStorage.expire!=undefined){
        expire=localStorage.expire
        var expireDate = new Date(expire)
        if(expireDate<Date.now()){
            window.location.href="/login.html"    
        }
    }
    else{
        window.location.href="/login.html"
    }
    
}

console.log(access_token==undefined)


axios.get("https://api.spotify.com/v1/me",{headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer "+access_token
}}).then(function(response) {
    console.log(response)
    return response["data"];
}).then(function(myBlob){
    userID = myBlob["id"]
    user = myBlob
    document.getElementById("name").innerHTML=userID
})

document.getElementById("sair").addEventListener("click", function(){
    localStorage.removeItem("access_token")
    localStorage.removeItem("expire")
    window.location.href="/login.html"
})

document.getElementById('inputFile')
.addEventListener('change', function() {
  if(this.files[0]!=undefined){

  
    var fr=new FileReader();    
   var fileName = this.files[0].name
    fr.onerror=function(event){
        console.log(event)
    }
    fr.onload=function(){
        var fileStr=fr.result
        var list = fr.result.replace(/[\r]+/gm, "").split("\n")
        document.getElementById("labelFile").textContent=fileName
        
        
        console.log(list)
        list.forEach(value=>{
            if(value.toLowerCase().includes("nome:")){
                document.getElementById("nome").value= value.replace("Nome:", "")
                var index = list.indexOf(value);
                console.log(index)
                if (index > -1) {
                    list.splice(index, 1);
                    fileStr.replace(value, "")
                    console.log(fileStr)
                }
            }
        })
        console.log(list)
        var newList=""
        list.forEach(value=>{
           
          if(value.trim()!=""&&value.trim()!="\n"&&value.trim()!="\r"){
                console.log(value)
                if(newList.length>0){
                    newList=newList+"\n"+value
                }else{
                    newList=value
                }
            
        }
        })

        //console.log(newList)
        document.getElementById('textarea')
                .value=newList;
    }
    
    fr.readAsText(this.files[0]);}
})

document.getElementById("sendButton").addEventListener("click", async ()=>{
    var textValue = document.getElementById("textarea").value.split("\n")
    console.log(textValue)
    var searchURLS = []
    var firstMusics = []
    for(var line of textValue){
        console.log(line);
        searchURLS.push("https://api.spotify.com/v1/search?"+new URLSearchParams({"q": line, "type": "track", "limite": "10"}))
        
    }
    var promises = searchURLS.map(url=>axios.get(url, {headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer "+access_token
    }}))

    await Promise.all(promises)
        .then((value)=>{
            value.forEach(function (search){
                console.log(search.data)
                firstMusics.push(search.data.tracks?.items[0]?.uri)
            })
        })
            
    if(firstMusics.length>0){
        axios.post("https://api.spotify.com/v1/users/"+userID+"/playlists",
            {
                "name": document.getElementById("nome").value,
                "description": document.getElementById("nome").value,
                "public": false
            }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer "+access_token
            }
        }).then((val)=>{
            console.log(val)
            axios.post("https://api.spotify.com/v1/playlists/"+val.data.id+"/tracks", {
                "uris": firstMusics 
            }, {
              
                headers:  {
                "Content-Type": "application/json",
                "Authorization": "Bearer "+access_token
            }
            })
        }).then((val)=>{
            console.log("Pronto");
            document.getElementById("nome").value="";
            document.getElementById("textarea").value=""
        })
    }
})

