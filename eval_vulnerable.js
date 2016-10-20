var express=require('express');
var app=express();
app.get('/',function(request,response){
 var resp=eval(request.query.name);
 response.send('Response<br>'+resp);
});

app.listen(8000);