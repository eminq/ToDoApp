const express = require('express');
const ejs = require('ejs');
const ejsMate = require('ejs-mate'); // this is for layouts partials ..
const path = require('path');
const port = 3000;
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');


const Task = require('./models/task');
const User = require('./models/user');

mongoose.connect('mongodb://localhost:27017/todo-app')
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected..');
})


const app = express();

const sessionConfig = {
    secret: 'thisismytopsecret',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// MIDDLEWARE
const isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){
        req.flash('error', 'You must be logged in!');
        return res.redirect('/');
    }
    next();
}

app.use((req,res,next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


// LOGIN
app.get('/', (req, res) => {
    res.render('home');
})
app.post('/login', passport.authenticate('local', {failureFlash:true, failureRedirect:'/'}), (req,res) => {
    res.redirect('/tasks');
})
// LOG OUT
app.get('/logout', (req,res,next) => {
    req.logout(function (err) {
        if(err){
            return next(err);
        }
    });
    res.redirect('/');
})

// SIGN UP
app.get('/sign-up', (req,res) => {
    res.render('signup');
})
app.post('/sign-up', async(req,res) => {
    try{
        const { email, username, password } = req.body.user;
        const newUser = new User({email, username});
        const user = await User.register(newUser, password);
        res.redirect('/tasks');
    }catch(e){
        req.flash('error', e.message);
        res.redirect('/sign-up');
    }
    
})
// ALL TASKS
app.get('/tasks', isLoggedIn, async(req,res) => {
    const tasks = await Task.find({}).populate('author');
    res.render('tasks', {tasks});
    
})
// NEW TASK
app.post('/tasks', isLoggedIn, async(req,res) => {
    const params = { ...req.body.task, status:'notDone', author:req.user }; 
    const task = new Task(params);
    await task.save();
    res.redirect('/tasks');
})
// DELETE TASK
app.delete('/tasks/:id', async(req,res) => {
    const { id } = req.params;
    const deletedTask = await Task.findByIdAndDelete(id);
    res.redirect('/tasks');
})
// CHANGE STATUS OF TASK
app.patch('/tasks/:id/:status', async(req,res) => {
    const { id, status } = req.params;
    const newStatus = (status === 'notDone') ? 'done' : 'notDone';
    const editedTask = await Task.findByIdAndUpdate(id, {status:`${newStatus}`});
    editedTask.save();
})


app.listen(port, () => {
    console.log(`Listening on port ${port}... `);
})