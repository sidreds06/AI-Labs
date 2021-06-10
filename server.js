const express = require('express');
const DB = require('../AI-Labs/database/connection')
var router = express.Router()
const upload = require('express-fileupload');
const { render } = require('ejs');
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
     res.redirect('login')  
}

app.use('/', router)


const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, function(){
    console.log("Server Starting running on http://localhost:"+PORT);
})


app.get("/home", function(req, res){
    res.render('homepage')
})

app.get("/projects",isAuth, function(req, res){
    console.log(req.session.userId)
    res.render('projects')
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


app.get("/info",isAuth, function(req, res){
    req.session.userId = 1
    console.log(req.session)
    DB.query(`SELECT * FROM list`, (err,data) =>{
        if(err){
            console.log(err)
        }
        else{
        res.render('homepage',{data})
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

app.get("/register", function(req, res){
    res.render('register')
})

app.get("/login", function(req, res){
    res.render('login')
})

app.post("/register", function(req, res){

    var user=req.body
    //var sql = `INSERT INTO user (name, username, email, password) VALUES (${SqlString.escape(user.name)}, ${SqlString.escape(user.username)}, ${SqlString.escape(user.email)}, ${SqlString.escape(user.password)})`
    var sql = `INSERT INTO user (name, username, email, password) VALUES ('${user.name}', '${user.username}', '${user.email}', '${user.password}')`
    DB.query(sql, function (err, result) {
      if (err) throw err;
      else{
       res.redirect('login')
         }

        })    
  })

  app.post("/login", function(req, res){
      const user = req.body
    DB.query(`SELECT * FROM user WHERE email = "${user.uname}" AND password = "${user.psd}"`, (err,data) =>{
             if(data.length > 0){
            req.session.userId = data[0].id    
            //res.redirect('projects')
            res.json(req.session.userId)
        }
        else{
            res.redirect('login')
         }
    })
})

app.get('/logout', function(req, res){
    req.session.destroy((err)=>{
        if(err) throw err;
        res.redirect('login')
    
    })
})  


module.exports = router