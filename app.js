// módulos
    //chamando express
    const express = require('express');
    //instanciando express
    const app = express();
    //chamando handlebars
    const handlebars = require('express-handlebars');
    //chamando a área de rotas para o admin
    const admin = require('./routes/admin');
    //chamando a área de rotas para o usuário
    const user = require('./routes/usuario');
    //módulo padrão do node para manipular diretórios/pastas
    const path = require('path');
    //chamando mongoose
    const mongoose = require('mongoose');
    //chamando o cookie-parser/modulo para sessões
    const session = require('express-session');
    //chamando o módulo flash para mensagens temporárias com cookies
    const flash = require('connect-flash');
    //chamando model de postagens para listagem na home
    const post = require('./models/Postagem');
    //chamando model de categorias 
    const cat = require('./models/Categoria');
    //chamando passport para autenticação
    const passport = require('passport')
    require('./config/auth')(passport);

// configurações
    //sessão
        app.use(session({
            secret: 'estudando',
            resave: true,
            saveUninitialized: true
        }));
    //passport    
        app.use(passport.initialize());
        app.use(passport.session());
        app.use(flash());
    //middleware flash e locals
        app.use((req, res, next)=>{
            res.locals.success_msg = req.flash('success_msg');
            res.locals.error_msg = req.flash('error_msg');
            res.locals.error = req.flash('error');
            res.locals.user = req.user || null;
            next();
        });
    //template engine
        app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}));
        app.set('view engine', 'handlebars');
    //body parser
        app.use(express.urlencoded({extended:true}));
        app.use(express.json());
    //mongoose
        mongoose.connect('mongodb://localhost/blogapp', {
            useNewUrlParser: true
        })
        .then(()=>{console.log('Conectado ao banco de dados!')})
        .catch((err)=>{console.log(`Houve um erro ao se conectar: ${err}`)});
    //public
        //linha que diz ao express que a pasta que guarda os nossos arquivos
        //estáticos é a 'public'; "__dirname" recomendado para evitar erros
        app.use(express.static(path.join(__dirname, 'public')));

// rotas
    app.get('/', (req, res)=>{
        post.find().lean().populate('categoria').sort({data: 'desc'}).then((postagens)=>{
            res.render('index', {postagens: postagens});
        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro interno');
            res.redirect('/404')
        })
    });

    app.get('/404', (req, res)=>{
        res.send('erro 404!');
    })

    app.get('/categorias', (req, res)=>{
        cat.find().lean().then((categorias)=>{
            res.render('categorias/index', {categorias: categorias});
        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro interno.');
            res.redirect('/');
        });
    });

    app.get('/categorias/:slug', (req, res)=>{
        cat.findOne({slug: req.params.slug}).lean().then((categoria)=>{
            if(categoria){
                post.find({categoria: categoria._id}).lean().then((postagens)=>{
                    res.render('categorias/postagens', {postagens: postagens, categoria: categoria});
                }).catch((err)=>{
                    req.flash('error_msg', 'Houve um erro ao listar os posts');
                    res.redirect('/');
                });
            }else{
                req.flash('error_msg', 'Esta categoria não existe.');
                res.redirect('/');
            }
        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro interno ao carregar a página');
            res.redirect('/');
        });
    });

    app.use('/admin', admin);
    app.use('/usuarios', user);

// outros

    const PORT = 3000;
    app.listen(PORT, ()=>{console.log(`Rodando na porta ${PORT}`)});