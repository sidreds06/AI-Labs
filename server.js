const express = require('express');
const DB = require('../AI-Labs/database/connection')
var router = express.Router()
const upload = require('express-fileupload');
const { render, name } = require('ejs');
const session = require('express-session')
var bodyParser = require('body-parser')
var MySQLStore = require('express-mysql-session')(session);
const bcrypt = require('bcrypt')


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
var ses =0
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
        res.render('projects',{data,usr,ses})    
         }

    })

})

app.get("/blog",isAuth, (req, res)=>{
    DB.query(`SELECT * FROM posts`, (err,data) =>{
        if(err){
            console.log(err)
        }
        else{ 
        res.render('index',{data,usr,ses})    
         }

    })
})

app.get("/addPost",isAuth, (req, res) => {
    res.render('addPost',{usr,ses});
})

app.get('/myPost',isAuth, (req, res) => {
    // res.render('myPost');
    DB.query('SELECT * FROM posts', (err, data) => {
        if(err){
            console.log(err);
        }
        else{
            var id = req.session.userId 
            res.render('myPost', {data,usr,id,ses});
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
        res.render('myprojects',{data,id,usr,ses})
         }

    })
})

app.get("/add-projects",isAuth, function(req, res){
    res.render('addprojects',{usr,ses})
})

app.post("/create-post",isAuth, (req, res) => {
    var i = 0
    if(req.body.two){
        i=1
    }
    if(req.files){
        var file = req.files.image;
        var filename = file.name;
        var path = __dirname + '/IMG/Uploaded_img/' + filename;
        file.mv(path, function(){});
    }
    var d = req.body;
    var img = '/IMG/Uploaded_img/'+filename;
    var query = `INSERT INTO posts (title, description, body, image, user_id, username, college, status, publish) VALUES (${SqlString.escape(d.title)}, ${SqlString.escape(d.description)}, ${SqlString.escape(d.body)}, '${img}', '${req.session.userId}', '${usr.username}', '${usr.college}', '0', '${i}')`;
    DB.query(query, (err, result) => {
        if(err) throw err;
        else{
    //         DB.query(`SELECT * FROM posts`, (err,data) =>{
    //             if(err){
    //                 console.log(err)
    //             }
    //             else{
              //  res.render('myPost',{data,usr})
              res.redirect('/mypost')
                 }
              
            })
    //     }
    // })
})

app.post("/create",isAuth, function(req, res){

    var i = 0
    if(req.body.two){
        i=1
    }
    if(req.files){
        var file =req.files.image
        var filename = file.name
        var path = __dirname + '/IMG/Uploaded_img/' + filename;
        file.mv(path,function(){})
    }
    var d=req.body
    var img = '/IMG/Uploaded_img/'+filename
    console.log(d)
    var sql = `INSERT INTO list (title, description, body, img, user_id, username, college, status, publish) VALUES (${SqlString.escape(d.title)}, ${SqlString.escape(d.description)}, ${SqlString.escape(d.body)}, '${img}', '${req.session.userId}', '${usr.username}', '${usr.college}','0','${i}')`;
    DB.query(sql, function (err, result) {
      if (err) throw err;
      else{
    //     DB.query(`SELECT * FROM list`, (err,data) =>{
    //         if(err){
    //             console.log(err)
    //         }
    //         else{    
            res.redirect('/my-projects')
              }

         })
    //   }
    // });
  });
var a1={}
var a2={}
app.get("/info", function(req, res){
    // ses = req.session.userId
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
             res.render('homepage',{a1,a2,ses,usr})
         }

    })
   
    

})


app.get('/deletePost/:id',isAuth, (req, res) => {
    var id = req.params.id;
    DB.query(`DELETE FROM posts WHERE id = '${id}'`, (err, result) => {
        if(err){
            console.log(err);
        }
        else{
            // DB.query(`SELECT * FROM posts`, (err,data) =>{
            //     if(err){
            //         console.log(err)
            //     }
            //     else{
                // res.render('myPost',{data,usr})
                res.redirect('/mypost')
                //  }
              
            // })
        }
    })
})

app.get("/delete/:id",isAuth, function(req, res){
    var id= req.params.id
    DB.query(`DELETE FROM list WHERE id = "${id}"`,(err,result)=>{
        if(err){
          console.log(err)
        }
        // else{
        //     DB.query(`SELECT * FROM list`, (err,data) =>{
        //         if(err){
        //             console.log(err)
        //         }
        //         else{
                 res.redirect('/my-projects')
        //          }

        //     })
        // }

    })
})

app.get("/edit/:id",isAuth, function(req, res){

    var id=req.params.id
    DB.query(`SELECT * FROM list WHERE id = "${id}" `, (err,data) =>{
        if(err){
            console.log(err)
        }
        else{
        res.render('editproject',{data,usr,ses})
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
        res.render('editPost',{data,usr,ses})
         }
    })
})

app.post("/update/:id",isAuth, function(req, res){
    var id=req.params.id
    var d = req.body
    var i = 0
    if(req.body.two){
        i=1
    }
    //DB.query(`UPDATE list SET title =${data.title}, description = ${data.description}, body = ${data.body} WHERE id = "${id}"`, (err,result)=>{
        DB.query(`UPDATE list SET title = ${SqlString.escape(d.title)}, description = ${SqlString.escape(d.description)}, body = ${SqlString.escape(d.body)}, publish = ${i} WHERE id = "${id}"`, (err,result)=>{
        if(err){
            console.log(err)
        }
        else{

            // DB.query(`SELECT * FROM list`, (err,data) =>{
            //     if(err){
            //         console.log(err)
            //     }
            //     else{
            //     res.render('myprojects',{data,usr})
            //      }

            // })
            res.redirect('/my-projects')

        }
    })


}) 

app.post("/update-post/:id",isAuth, function(req, res){
    var id=req.params.id
    var d = req.body
    var i = 0
    if(req.body.two){
        i=1
    }
    //DB.query(`UPDATE list SET title =${data.title}, description = ${data.description}, body = ${data.body} WHERE id = "${id}"`, (err,result)=>{
        DB.query(`UPDATE posts SET title = ${SqlString.escape(d.title)}, description = ${SqlString.escape(d.description)}, body = ${SqlString.escape(d.body)}, publish = ${i} WHERE id = "${id}"`, (err,result)=>{
        if(err){
            console.log(err)
        }
        else{

            // DB.query(`SELECT * FROM list`, (err,data) =>{
            //     if(err){
            //         console.log(err)
            //     }
            //     else{
            //     res.render('myprojects',{data,usr})
            //      }

            // })
            res.redirect('/myPost')

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
            res.render('viewPost', {data,usr,ses});
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
        res.render('view',{data,usr,ses})
         }
    })

})


app.get('/register',isLogin, (req, res) => {
    res.render('register');
});

app.get("/login",isLogin, function(req, res){
    res.render('login')
})

app.get("/allProjects",isAuth,function(req, res){
    DB.query(`SELECT * FROM list`, (err,data) =>{
        if(err){
            console.log(err)
        }
        else{ 
        res.render('allProjects',{data,usr,ses})    
         }

    })
})

app.get("/allBlogs",isAuth, function(req, res){
    DB.query(`SELECT * FROM posts`, (err,data) =>{
        if(err){
            console.log(err)
        }
        else{ 
        res.render('allBlogs',{data,usr,ses})    
         }

    })
})
app.post("/register",async function(req, res){
try{
    var user=req.body
    var pas = await  bcrypt.hash(user.password, 10)
    var sql = `INSERT INTO user (name, username, college, email, password) VALUES ('${user.name}', '${user.username}','${user.college}', '${user.email}', ${SqlString.escape(pas)})`
    DB.query(sql, function (err, result) {
      if (err) throw err;
      else{
       res.redirect('login')
         }

        })    
    }
    catch{
        console.log("error")
    }
  })

  app.post("/login",function(req, res){
      try{
      const user = req.body
    DB.query(`SELECT * FROM user WHERE email = "${user.email}"`,async (err,data) =>{
            if(await bcrypt.compare(user.password,data[0].password)){
            req.session.userId = data[0].id   
            ses =  req.session.userId
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
}
catch{
    console.log("error")
}
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
app.get('/dashboard',isAuth,isAdmin, function(req, res){
    
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
             res.render('dashboard',{d1,d2,usr,ses})
         }

    })
    
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
    ses = 0
    req.session.destroy((err)=>{
        if(err) throw err;
        res.redirect('info')
    
    })
})  


app.post("/img", function(req, res){
    console.log("called")
    console.log(req.body)
   
})


module.exports = router