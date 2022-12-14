const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const user = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const passport = require('passport');

router.get('/registro', (req, res)=>{
    res.render('usuarios/registro');
});

router.post('/registro', (req, res)=>{
    let erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: 'Nome inválido.'});
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: 'Email inválido.'});
    }
    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: 'Senha inválida.'});
    }
    if(req.body.senha.length < 4){
        erros.push({texto: 'Senha muito curta.'});
    }
    if(req.body.senha != req.body.senha2){
        erros.push({texto: 'As senhas precisam ser iguais.'});
    }

    if(erros.length > 0){
        res.render('usuarios/registro', {erros: erros});
    }else{
        user.findOne({email: req.body.email}).then((usuario)=>{
            if(usuario){
                req.flash('error_msg', 'Já existe uma conta com este email no sistema.');
                res.redirect('/usuarios/registro');
            }else{
                const newUser = new user({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                if(newUser.email == 'admin@admin'){
                    newUser.admin = 1;
                }

                bcrypt.genSalt(10, (err, salt)=>{
                    bcrypt.hash(newUser.senha, salt, (erro, hash)=>{
                        if(erro){
                            req.flash('error_msg', 'Houve um erro durante o salvamento do usuário');
                            res.redirect('/');
                        }

                        newUser.senha = hash;
                        newUser.save().then(()=>{
                            req.flash('success_msg', 'Usuário criado com sucesso.');
                            res.redirect('/');
                        }).catch(err=>{
                            req.flash('error_msg', 'Houve um erro ao criar o usuário.');
                            res.redirect('/usuarios/registro');
                        })

                    })
                })
            }

        }).catch(err=>{
            req.flash('error_msg', 'Houve um erro interno.');
            res.redirect('/');
        })
    }
})

router.get('/login', (req, res)=>{
    res.render('usuarios/login');
})

router.post('/login', (req, res, next)=>{
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req, res, next);
})

router.get("/logout", (req,res,next)=>{
    req.logout((err)=>{
        if(err){return next(err)}    
    req.flash('success_msg', "Deslogado com sucesso!")
    res.redirect("/")
    })
})

module.exports = router;