const express = require('express');
const DB = require('../AI-Labs/database/connection')
var router = express.Router()
const upload = require('express-fileupload');
const { render } = require('ejs');

const app = express();

var SqlString = require('sqlstring');

app.use('/', router)

app.use(upload())

app.set('view engine','ejs')

app.use(express.static(__dirname));


app.use(express.urlencoded({extended: true}));
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, function(){
    console.log("Server Starting running on http://localhost:"+PORT);
})


app.get("/home", function(req, res){
    res.render('homepage')
})

app.get("/projects", function(req, res){
    res.render('projects')
})

app.get("/blog", (req, res)=>{
    res.render('index');
})

app.get("/addPost", (req, res) => {
    res.render('addPost');
})

app.get('/myPost', (req, res) => {
    // res.render('myPost');
    DB.query('SELECT * FROM posts', (err, data) => {
        if(err){
            console.log(err);
        }
        else{
            res.render('myPost', {data});
        }
    })
})

app.get("/my-projects", function(req, res){
    DB.query(`SELECT * FROM list`, (err,data) =>{
        if(err){
            console.log(err)
        }
        else{
        res.render('myprojects',{data})
         }
      
    })
})

app.get("/add-projects", function(req, res){
    res.render('addprojects')
})

app.post("/create-post", (req, res) => {
    if(req.files){
        var file = req.files.image;
        var filename = file.name;
        var path = __dirname + '/IMG/Uploaded_img/' + filename;
        file.mv(path, function(){});
    }
    var d = req.body;
    var img = '/IMG/Uploaded_img/'+filename;
    var query = `INSERT INTO posts (title, description, body, image, user_id, status) VALUES (${SqlString.escape(d.title)}, ${SqlString.escape(d.description)}, ${SqlString.escape(d.body)}, '${img}', '98765', '1')`;
    DB.query(query, (err, result) => {
        if(err) throw err;
        else{
            DB.query(`SELECT * FROM posts`, (err,data) =>{
                if(err){
                    console.log(err)
                }
                else{
                res.render('myPost',{data})
                 }
              
            })
        }
    })
})

app.post("/create", function(req, res){
  
    if(req.files){
        var file =req.files.image
        var filename = file.name
        var path = __dirname + '/IMG/Uploaded_img/' + filename;
        file.mv(path,function(){})
    }
    var d=req.body
    var img = '/IMG/Uploaded_img/'+filename
    console.log(d)
    var sql = `INSERT INTO list (title, description, body, img, user_id, status) VALUES (${SqlString.escape(d.title)}, ${SqlString.escape(d.description)}, ${SqlString.escape(d.body)}, '${img}', '98765', '1')`;
    DB.query(sql, function (err, result) {
      if (err) throw err;
      else{
        DB.query(`SELECT * FROM list`, (err,data) =>{
            if(err){
                console.log(err)
            }
            else{
            res.render('myprojects',{data})
             }
          
        })
      }
    });
  });


router.get("/info", function(req, res){
    DB.query(`SELECT * FROM list`, (err,data) =>{
        if(err){
            console.log(err)
        }
        else{
        res.render('homepage',{data})
         }
      
    })
   
})

app.get('/deletePost/:id', (req, res) => {
    var id = req.params.id;
    DB.query(`DELETE FROM posts WHERE id = '${id}'`, (err, result) => {
        if(err){
            console.log(err);
        }
        else{
            DB.query(`SELECT * FROM posts`, (err,data) =>{
                if(err){
                    console.log(err)
                }
                else{
                res.render('myPost',{data})
                 }
              
            })
        }
    })
})

app.get("/delete/:id", function(req, res){
    var id= req.params.id
    DB.query(`DELETE FROM list WHERE id = "${id}"`,(err,result)=>{
        if(err){
          console.log(err)
        }
        else{
            DB.query(`SELECT * FROM list`, (err,data) =>{
                if(err){
                    console.log(err)
                }
                else{
                res.render('myprojects',{data})
                 }
              
            })
        }

    })
})

// app.get("/editPost/:id", (res, req)=>{
//     var id = req.params.id;
//     // console.log(id);
//     DB.query(`SELECT * FROM posts WHERE id = "${id}" `, (err, data) => {
//         if(err){
//             console.log(err);
//         }
//         else{
//             res.render('editPost', {data});
//         }
//     })
// })

app.get("/edit/:id", function(req, res){

    var id=req.params.id
    DB.query(`SELECT * FROM list WHERE id = "${id}" `, (err,data) =>{
        if(err){
            console.log(err)
        }
        else{
        res.render('editproject',{data})
         }
    })
})

app.get("/editPost/:id", function(req, res){

    var id=req.params.id
    DB.query(`SELECT * FROM posts WHERE id = "${id}" `, (err,data) =>{
        if(err){
            console.log(err)
        }
        else{
        res.render('editPost',{data})
         }
    })
})

app.post("/update/:id", function(req, res){
    var id=req.params.id
    var d = req.body

    //DB.query(`UPDATE list SET title =${data.title}, description = ${data.description}, body = ${data.body} WHERE id = "${id}"`, (err,result)=>{
        DB.query(`UPDATE list SET title = ${SqlString.escape(d.title)}, description = ${SqlString.escape(d.description)}, body = ${SqlString.escape(d.body)} WHERE id = "${id}"`, (err,result)=>{
        if(err){
            console.log(err)
        }
        else{

            DB.query(`SELECT * FROM list`, (err,data) =>{
                if(err){
                    console.log(err)
                }
                else{
                res.render('myprojects',{data})
                 }
              
            })

        }
    })


}) 

app.get('/viewPost/:id', (req, res) => {
    var id = req.params.id;
    DB.query(`SELECT * FROM posts WHERE id = "${id}" `, (err, data) => {
        if(err){
            console.log(err);
        }
        else{
            res.render('viewPost', {data});
        }
    })
})

app.get("/view/:id", function(req, res){

    var id = req.params.id
    DB.query(`SELECT * FROM list WHERE id = "${id}" `, (err,data) =>{
        if(err){
            console.log(err)
        }
        else{
        res.render('view',{data})
         }
    })

})

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

module.exports = router