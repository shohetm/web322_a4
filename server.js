/********************************************************************************
* WEB322 – Assignment 05
* 
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* 
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
* Name: Mike Shohet Student ID: 146462197 Date: 05-31-2024
*
* Published URL: 
*
********************************************************************************/

const express = require('express');
const path = require('path');
const legoData = require('./modules/legoSets');

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');

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
       res.render('sets', { sets });
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



app.use((req, res) => {
    res.status(404).render('404', { page: '' });
});

legoData.Initialize().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch(error => {
    console.error("Failed to initialize data:", error);
});
