async function saveConfig(){
  let response = await fetch('/ui/config', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      port: document.getElementById('port').value,
      downloadPath: document.getElementById('downloadPath').value,
    })
  })
  if(response.ok){
    alert('セーブしました。')
  }else{
    alert('セーブに失敗しました。')
  }
}