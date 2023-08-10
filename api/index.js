const express = require('express');
const app = express();
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
const jwt = require('jsonwebtoken');

const salt = bcrypt.genSaltSync(10);
const secret = 'dfmvndrktn4l6n4mbdf5jktbkvbe56bvk';

app.use(cors({credentials:true,origin:'http://localhost:3000'}));
app.use(express.json());

mongoose.connect('mongodb://Swarnshekhar:q3NpNBHjr6vIBRvZ@ac-siwdeel-shard-00-00.pyvua1b.mongodb.net:27017,ac-siwdeel-shard-00-01.pyvua1b.mongodb.net:27017,ac-siwdeel-shard-00-02.pyvua1b.mongodb.net:27017/?ssl=true&replicaSet=atlas-wg4rgb-shard-0&authSource=admin&retryWrites=true&w=majority');

app.post('/register', async (req,res) => {
    const {username,password} = req.body;
    try{
        const userDoc = await User.create({
            username,
            password:bcrypt.hashSync(password,salt),
        });
        res.json(userDoc);
    } catch(e) {
        console.log(e);
        res.status(400).json(e);
    }
});

app.post('/login', async (req,res) => {
    const {username,password} = req.body;
    const userDoc = await User.findOne({username});
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if(passOk) {
        //logged in
        jwt.sign({username,id:userDoc._id}, secret, {}, (err,token) => {
            if (err) throw err;
            res.cookie('token', token).json('ok');
        });
    } else {
        res.status(400).json('WRONG CREDENTIALS');
    }
});

app.listen(4000);
//mongodb+srv://swarnshekhar5:YR1PsQ46i8OZLUla@cluster0.pyvua1b.mongodb.net/?retryWrites=true&w=majority
//YR1PsQ46i8OZLUla
//q3NpNBHjr6vIBRvZ
