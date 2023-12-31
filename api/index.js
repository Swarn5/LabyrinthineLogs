const express = require('express');
const app = express();
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
const Post = require('./models/Post');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddlewar = multer({dest: 'uploads/'});
const fs = require('fs');

const salt = bcrypt.genSaltSync(10);
const secret = 'dfmvndrktn4l6n4mbdf5jktbkvbe56bvk';

app.use(cors({credentials:true,origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

mongoose.connect('mongodb://Swarnshekhar:UZyfHLVq38OOZtiJ@ac-siwdeel-shard-00-00.pyvua1b.mongodb.net:27017,ac-siwdeel-shard-00-01.pyvua1b.mongodb.net:27017,ac-siwdeel-shard-00-02.pyvua1b.mongodb.net:27017/?ssl=true&replicaSet=atlas-wg4rgb-shard-0&authSource=admin&retryWrites=true&w=majority');

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
            res.cookie('token', token).json({
                id:userDoc._id,
                username,
            });
        });
    } else {
        res.status(400).json('WRONG CREDENTIALS');
    }
});

app.get('/profile', (req,res) => {
    const {token} = req.cookies;
    jwt.verify(token,secret,{},(err,info) => {
        if (err) throw err;
        res.json(info);
    });
});

app.post('/logout', (req,res) => {
    res.cookie('token','').json('ok');
});

app.post('/post',uploadMiddlewar.single('file'),async (req,res) => {
    const {originalname,path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path + '.' + ext;
    fs.renameSync(path, newPath);

    const {token} = req.cookies;
    jwt.verify(token,secret,{},async (err,info) => {
        if (err) throw err;
        const {title,summary,content} = req.body;
        const postDoc = await Post.create({
        title,
        summary,
        content,
        cover:newPath,
        author:info.id,
        });
    res.json(postDoc);
    });
});

// app.put('/post',uploadMiddlewar.single('file'), async (req,res) => {
//     let newPath = null;
//     if(req.file){
//         const {originalname,path} = req.file;
//         const parts = originalname.split('.');
//         const ext = parts[parts.length - 1];
//         newPath = path + '.' + ext;
//         fs.renameSync(path, newPath);
//     }


//     const {token} = req.cookies;
//     jwt.verify(token,secret,{},async (err,info) => {
//         if (err) throw err;
//         const {id,title,summary,content} = req.body;
//         const postDoc = await Post.findById(id);
//         const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
//         // res.json({isAuthor,postDoc,info});
//         if(!isAuthor){
//             return res.status(400).json('You are not the Author');
//         }
        
//         await postDoc.update({
//             title,
//             summary,
//             content,
//             cover: newPath ? newPath : postDoc.cover,
//         });
//         res.json(postDoc);
//     });
// });

app.put('/post',uploadMiddlewar.single('file'), async (req,res) => {
    let newPath = null;
    if (req.file) {
        const { originalname, path } = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
    }

    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) throw err;
        const { id, title, summary, content } = req.body;
        const filter = { _id: id, author: info.id };
        const update = {
            title,
            summary,
            content,
            cover: newPath ? newPath : postDoc.cover,
        };
        
        // Use findOneAndUpdate to update the document
        const updatedPost = await Post.findOneAndUpdate(filter, update, { new: true });

        if (!updatedPost) {
            return res.status(400).json('You are not the Author or the post does not exist.');
        }
        
        res.json(updatedPost);
    });
});


app.get('/post',async (req,res) => {
    res.json(await Post.find()
    .populate('author',['username'])
    .sort({createdAt: -1}));
})

app.get('/post/:id',async (req,res) => {
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate('author',['username']);
    res.json(postDoc);
})

app.listen(4000);
console.log("connected succesfully")
//mongodb+srv://swarnshekhar5:YR1PsQ46i8OZLUla@cluster0.pyvua1b.mongodb.net/?retryWrites=true&w=majority
//mongodb+srv://Swarnshekhar:UZyfHLVq38OOZtiJ@cluster0.pyvua1b.mongodb.net/
// UZyfHLVq38OOZtiJ
