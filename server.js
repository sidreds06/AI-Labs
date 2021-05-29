const express = require('express');

const app = express();

app.use(express.static(__dirname));


app.use(express.urlencoded({extended: true}));
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, function(){
    console.log("Server Starting running on http://localhost:"+PORT);
})


app.get("/home", function(req, res){
    res.sendFile('/Frontend/HTML/homepage.html', {root: __dirname});
    //res.send("Welcome to My Basic Site");  
})

