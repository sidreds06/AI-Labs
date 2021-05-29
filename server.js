const express = require('express');

const app = express();

app.use(express.static(__dirname));

app.get("/", function(req, res){
    res.sendFile('/Frontend/HTML/homepage.html', {root: __dirname});
    //res.send("Welcome to My Basic Site");  
})
const PORT = 5000;

// Start the server
app.listen(PORT, function(){
    console.log("Server Starting running on http://localhost:"+PORT);
})

app.use(express.urlencoded({extended: true}));
app.use(express.json());

