const express = require('express');
const DB = require('../AI-Labs/database/connection')
var router = express.Router()
const upload = require('express-fileupload');
const { render, name } = require('ejs');
const session = require('express-session')
var bodyParser = require('body-parser')
var MySQLStore = require('express-mysql-session')(session);


const app = express();

var options = {
	host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'projects'
};

var sessionStore = new MySQLStore(options);

// var uname = 'User'
// var urole = 0
var usr = []
var SqlString = require('sqlstring');

app.use(upload())

app.set('view engine','ejs')

app.use(express.static(__dirname));


app.use(express.urlencoded({extended: true}));
app.use(express.json());


app.use(session({
    name: 'sid',
    resave: false,
    saveUninitialized: false,
    secret: 'blackbuck123',
     cookie: {
         maxAge: 1000*60*60,
         sameSite: true,
         secure: false
     },
     store: sessionStore
}))

var isAuth=(req,res,next)=>{
   if(req.session.userId)
     next()
   else
     res.redirect('/login')  
}

var isAdmin=(req,res,next)=>{
    if(req.session.role)
      next()
    else
      res.redirect('/info')  
 }

 var isLogin=(req,res,next)=>{
    if(!req.session.role)
      next()
    else
      res.redirect('info')  
 }

app.use('/', router)


const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, function(){
    console.log("Server Starting running on http://localhost:"+PORT);
})


app.get("/projects",isAuth, function(req, res){
    DB.query(`SELECT * FROM list`, (err,data) =>{
        if(err){
            console.log(err)
        }
        else{ 
        res.render('projects',{data,usr})    
         }

    })

})

app.get("/blog",isAuth, (req, res)=>{
    DB.query(`SELECT * FROM posts`, (err,data) =>{
        if(err){
            console.log(err)
        }
        else{ 
        res.render('index',{data,usr})    
         }

    })
})

app.get("/addPost",isAuth, (req, res) => {
    res.render('addPost',{usr});
})

app.get('/myPost',isAuth, (req, res) => {
    // res.render('myPost');
    DB.query('SELECT * FROM posts', (err, data) => {
        if(err){
            console.log(err);
        }
        else{
            res.render('myPost', {data,usr});
        }
    })
})

app.get("/my-projects",isAuth, function(req, res){
    DB.query(`SELECT * FROM list`, (err,data) =>{
        if(err){
            console.log(err)
        }
        else{
        console.log(name)    
        var id = req.session.userId    
        res.render('myprojects',{data,id,usr})
         }

    })
})

app.get("/add-projects",isAuth, function(req, res){
    res.render('addprojects',{usr})
})

app.post("/create-post",isAuth, (req, res) => {
    if(req.files){
        var file = req.files.image;
        var filename = file.name;
        var path = __dirname + '/IMG/Uploaded_img/' + filename;
        file.mv(path, function(){});
    }
    var d = req.body;
    var img = '/IMG/Uploaded_img/'+filename;
    var query = `INSERT INTO posts (title, description, body, image, user_id, username, college, status) VALUES (${SqlString.escape(d.title)}, ${SqlString.escape(d.description)}, ${SqlString.escape(d.body)}, '${img}', '${req.session.userId}', '${usr.username}', '${usr.college}', '0')`;
    DB.query(query, (err, result) => {
        if(err) throw err;
        else{
            DB.query(`SELECT * FROM posts`, (err,data) =>{
                if(err){
                    console.log(err)
                }
                else{
                res.render('myPost',{data,usr})
                 }
              
            })
        }
    })
})

app.post("/create",isAuth, function(req, res){

    if(req.files){
        var file =req.files.image
        var filename = file.name
        var path = __dirname + '/IMG/Uploaded_img/' + filename;
        file.mv(path,function(){})
    }
    var d=req.body
    var img = '/IMG/Uploaded_img/'+filename
    console.log(d)
    var sql = `INSERT INTO list (title, description, body, img, user_id, username, college, status) VALUES (${SqlString.escape(d.title)}, ${SqlString.escape(d.description)}, ${SqlString.escape(d.body)}, '${img}', '${req.session.userId}', '${usr.username}', '${usr.college}','0')`;
    DB.query(sql, function (err, result) {
      if (err) throw err;
      else{
        DB.query(`SELECT * FROM list`, (err,data) =>{
            if(err){
                console.log(err)
            }
            else{    
            res.redirect('/my-projects')
             }

        })
      }
    });
  });
var a1={}
var a2={}
app.get("/info", function(req, res){
    DB.query(`SELECT * FROM list`, (err,data) =>{
        if(err){
            console.log(err)
        }
        else{
              a1=data
         }

    })
    DB.query(`SELECT * FROM posts`, (err,data) =>{
        if(err){
            console.log(err)
        }
        else{
             a2=data
         }

    })
    var ses = req.session.userId
    res.render('homepage',{a1,a2,ses,usr})

})


app.get('/deletePost/:id',isAuth, (req, res) => {
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
                res.render('myPost',{data,usr})
                 }
              
            })
        }
    })
})

app.get("/delete/:id",isAuth, function(req, res){
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
                res.redirect('/my-projects')
                 }

            })
        }

    })
})

app.get("/edit/:id",isAuth, function(req, res){

    var id=req.params.id
    DB.query(`SELECT * FROM list WHERE id = "${id}" `, (err,data) =>{
        if(err){
            console.log(err)
        }
        else{
        res.render('editproject',{data,usr})
         }
    })
})

app.get("/editPost/:id",isAuth, function(req, res){

    var id=req.params.id
    DB.query(`SELECT * FROM posts WHERE id = "${id}" `, (err,data) =>{
        if(err){
            console.log(err)
        }
        else{
        res.render('editPost',{data,usr})
         }
    })
})

app.post("/update/:id",isAuth, function(req, res){
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
                res.render('myprojects',{data,usr})
                 }

            })

        }
    })


}) 

app.get('/viewPost/:id',isAuth, (req, res) => {
    var id = req.params.id;
    DB.query(`SELECT * FROM posts WHERE id = "${id}" `, (err, data) => {
        if(err){
            console.log(err);
        }
        else{
            res.render('viewPost', {data,usr});
        }
    })
})

app.get("/view/:id",isAuth, function(req, res){

    var id = req.params.id
    DB.query(`SELECT * FROM list WHERE id = "${id}" `, (err,data) =>{
        if(err){
            console.log(err)
        }
        else{
        res.render('view',{data,usr})
         }
    })

})


app.get('/register',isLogin, (req, res) => {
    res.render('register');
});

app.get("/login",isLogin, function(req, res){
    res.render('login')
})

app.get("/allProjects",function(req, res){
    res.render('allProjects')
})

app.get("/allBlogs", function(req, res){
    res.render('allBlogs')
})

app.post("/register", function(req, res){

    var user=req.body
    //var sql = `INSERT INTO user (name, username, email, password) VALUES (${SqlString.escape(user.name)}, ${SqlString.escape(user.username)}, ${SqlString.escape(user.email)}, ${SqlString.escape(user.password)})`
    var sql = `INSERT INTO user (name, username, college, email, password) VALUES ('${user.name}', '${user.username}','${user.college}', '${user.email}', '${user.password}')`
    DB.query(sql, function (err, result) {
      if (err) throw err;
      else{
       res.redirect('login')
         }

        })    
  })

  app.post("/login", function(req, res){
      const user = req.body
    DB.query(`SELECT * FROM user WHERE email = "${user.email}" AND password = "${user.password}"`, (err,data) =>{
             if(data.length > 0){
            req.session.userId = data[0].id   
            req.session.username = data[0].username
            uname = data[0].username
            urole = data[0].admin
            usr = data[0]
            req.session.role = data[0].admin 
            res.redirect('info')
        }
        else{
            res.redirect('login')
         }
    })
})


app.get("/approve-project/:id",isAuth, function(req, res){
    var id=req.params.id

        DB.query(`UPDATE list SET status = '1' WHERE id = "${id}"`, (err,result)=>{
        if(err){
            console.log(err)
        }
        else{

            DB.query(`SELECT * FROM list`, (err,data) =>{
                if(err){
                    console.log(err)
                }
                else{
                res.redirect('/dashboard')
                 }

            })

        }
    })


}) 

app.get("/approve-post/:id",isAuth, function(req, res){
    var id=req.params.id

        DB.query(`UPDATE posts SET status = '1' WHERE id = "${id}"`, (err,result)=>{
        if(err){
            console.log(err)
        }
        else{

            DB.query(`SELECT * FROM list`, (err,data) =>{
                if(err){
                    console.log(err)
                }
                else{
                res.redirect('/dashboard')
                 }

            })

        }
    })

}) 

var d1={}
    var d2 ={}
app.get('/dashboard',isAuth,isAdmin,function(req, res){
    DB.query(`SELECT * FROM list`, (err,data) =>{
        if(err){
            console.log(err)
        }
        else{  
            d1=data
         }

    })
    DB.query(`SELECT * FROM posts`, (err,data) =>{
        if(err){
            console.log(err)
        }
        else{  
             d2= data

         }

    })
    res.render('dashboard',{d1,d2})
    //res.json(d1)
})

app.get("/reject-project/:id",isAuth, function(req, res){
    var id= req.params.id
    DB.query(`DELETE FROM list WHERE id = "${id}"`,(err,result)=>{
        if(err){
          console.log(err)
        }
        else{
                res.redirect('/dashboard')
        }

    })
})

app.get("/reject-post/:id",isAuth, function(req, res){
    var id= req.params.id
    DB.query(`DELETE FROM posts WHERE id = "${id}"`,(err,result)=>{
        if(err){
          console.log(err)
        }
        else{
            
                res.redirect('/dashboard')

        }

    })
})

app.get('/logout', function(req, res){
    req.session.destroy((err)=>{
        if(err) throw err;
        res.redirect('info')
    
    })
})  


module.exports = router