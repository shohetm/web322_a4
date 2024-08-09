/********************************************************************************
* WEB322 – Assignment 06
* 
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* 
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
* Name: Mike Shohet Student ID: 146462197 Date: 08-08-2024
*
* Published URL: https://web322-a4.vercel.app/
*
********************************************************************************/

const express = require('express');
const path = require('path');
const clientSessions = require('client-sessions');
const legoData = require('./modules/legoSets');
const authData = require('./modules/auth-service');

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');

app.use(
    clientSessions({
      cookieName: 'session', // this is the object name that will be added to 'req'
      secret: 'o6LjQ5EVNC28ZgK64hDELM18ScpFQr', // this should be a long un-guessable string.
      duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
      activeDuration: 1000 * 60, // the session will be extended by this many ms each request (1 minute)
    })
  );

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
   });

   function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        next();
    }
}

app.get("/", (req, res) => {
    res.render('home', { page: '/' });
});

app.get('/about', (req, res) => {
    res.render('about', { page: '/about' });
});

app.get('/lego/sets', async (req, res) => {
    try {
       const theme = req.query.theme;
       let sets;
       if (theme) {
           sets = await legoData.getSetsByTheme(theme);
       } else {
           sets = await legoData.getAllSets();
       }
       res.render('sets', { sets: sets, user: req.session.user });
    } catch (error) {
        res.status(404).send(error);
    }
});

app.get('/lego/sets/:setNum', async (req, res) => {
    try {
        const set = await legoData.getSetByNum(req.params.setNum);
        if(set){
            res.render('set', { set });
        }
        else{
            res.send(404).send('Set not found');
        }
    } catch (error) {
        res.status(404).send(error);
    }
});

app.get('/lego/addSet', async (req,res)=> {
    try{
        const themes = await legoData.getAllThemes();
        res.render('addSet', { themes });
    }catch (error){
        console.error('Error in GET/lego/addSet', error);
        res.status(500).render('500', { message: `I am sorry but we have encounterd the following error: ${error}` });
    }   
});

app.post('/lego/addSet', async (req,res) => {
    try{
        console.log('Recieved Data:', req.body); 
        await legoData.addSet(req.body);
        res.redirect('/lego/sets');
    }
    catch (error) {
        console.error('Error in POST/lego/addSet', error);
        res.status(500).render('500', { message: `I am sorry but we have encounterd the following error: ${error}` });
    }
})

app.get('/lego/editSet/:num', async (req, res) => {
    try {
        const setNum = req.params.num;
        const setData = await legoData.getSetByNum(setNum);
        const themeData = await legoData.getAllThemes();
        res.render('editSet', { set: setData, themes: themeData });
    } catch (err) {
       res.status(404).render('404', { message: err.message });
    }
});

app.post('/lego/editSet', async (req, res) => {
    try {
        const setNum = req.body.set_num;
        const setData = req.body;
        await legoData.editSet(setNum, req.body);
        res.redirect('/lego/sets');
    } catch (err) {
        res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err.message}` });
    }
});


app.get('/lego/deleteSet/:num', async (req, res) => {
    try {
        const setNum = req.params.num;
        await legoData.deleteSet(setNum);
        res.redirect('/lego/sets');
    } catch (err) {
        res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
    }
});

app.get('/register', (req,res) => {
    res.render('register', { page: '/register '});
});

app.post('/register', async (req, res) => {
    try{
        await authData.registerUser(req.body);
        res.render('register', {successMessage: "User created"});
    } catch(err){
        res.render('register', { errorMessage: err, userName: req.body.userName });
    }
});

app.get('/login', (req,res) => {
    res.render('login', { page: '/login', userName: '' });
});

app.post('/login', (req,res) => {
    req.body.userAgent = req.get('User-Agent');
   authData.checkUser(req.body)
    .then((user) => {
        req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
        };
        res.redirect('/lego/sets');
    })
    .catch ((err) => {
        res.render('login', 
            { errorMessage: err, 
              userName: req.body.userName 
            });
    })
});

app.get('/logout', (req, res) => {
    req.session.reset();
    res.redirect('/');
});

app.get('/userHistory', ensureLogin, (req, res) => {
    res.render('userHistory');
}); 

app.use((req, res) => {
    res.status(404).render('404', { page: '' });
});

legoData.Initialize().
then(function() {
    app.listen(port, function(){
        console.log(`app listening on: ${port}`);
    });
}).catch(function(err){
    console.log(`unable to start server: ${err}`)
});
