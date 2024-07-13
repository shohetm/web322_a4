/********************************************************************************
* WEB322 – Assignment 04
* 
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* 
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
* Name: Mike Shohet Student ID: 146462197 Date: 05-31-2024
*
* Published URL: https://web322-a4.vercel.app/
*
********************************************************************************/

const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'public')));

const legoData = require('./modules/legoSets');

app.use(express.static('public'));
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

app.get('/lego/sets?theme=theme', async (req, res)=> {
    try{
        const theme = req.query.theme;
     if(theme){
        const themes = await legoData.getSetsByTheme(theme);
        res.render('theme', { theme });
     }
     else{
        res.send(404).send('Theme not found');
     }
    } catch(error){
        res.status(404).send(error);
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
