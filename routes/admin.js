const express = require('express');
const router = express.Router();
const cat = require('../models/Categoria');
const post = require('../models/Postagem');
const {isAdmin}= require('../helpers/isAdmin');

//rota base
router.get('/', isAdmin, (req, res)=>{
    res.render('admin/index');
})

//rota de categorias
router.get('/categorias', isAdmin, (req, res)=>{
    //usando o find para pegar os itens da collection do mongodb, e então
    //se usa o lean para converter o objeto mongoose que retorna da query
    //em um objeto javascript. Feito isso se passa o objeto em questão
    //para o handlebars, para conseguir manipular os dados por la.
    cat.find().lean().then((categorias)=>{
        res.render('admin/categorias', {categorias: categorias});
    }).catch((err)=>{
        req.flash('error_msg', 'Houve um erro ao listar as categorias');
        res.redirect('/admin');
    })
});


//rota para editar categoria x
router.get('/categorias/edit/:id', isAdmin, (req, res)=>{
    cat.findOne({_id: req.params.id}).lean().then((categoria)=>{
        res.render('admin/editcategorias', {categoria: categoria});
    }).catch((err)=>{
        req.flash('error_msg', 'Esta categoria não existe');
        res.redirect('/admin/categorias');
    })
})

//post para editar pela rota anterior
router.post('/categorias/edit', isAdmin, (req, res)=>{

    let erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: 'Nome inválido'});
    };

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Slug inválido'});
    };
    //última linha da validação, afim de ver se existem erros
    if(erros.length > 0){
        res.render('admin/editcategorias', {erros:erros});
    }else{
        cat.findOne({_id: req.body.id}).then((categoria)=>{
            categoria.nome = req.body.nome;
            categoria.slug = req.body.slug;
            categoria.save().then(()=>{
                req.flash('success_msg', 'Categoria editada com sucesso');
                res.redirect('/admin/categorias');
            }).catch((err)=>{
                req.flash('error_msg', 'Houve um erro interno ao salvar a edição da categoria');
                res.redirect('/admin/categorias');
            });
        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro ao editar a categoria');
            res.redirect('/admin/categorias');
        });
    };    
    
});

//rota para excluir categoria
router.post('/categorias/delete', isAdmin, (req, res)=>{

    cat.deleteOne({_id: req.body.id}).then(()=>{
        req.flash('success_msg', `Categoria deletada com sucesso!`);
        res.redirect('/admin/categorias');
    }
    ).catch((err)=>{
        req.flash('error_msg', 'Não foi possível excluir a categoria');
        res.redirect('/admin/categorias');
    })
});

//rota para adicionar categorias
router.get('/categorias/add', isAdmin, (req, res)=>{
    res.render('admin/addcategorias');
});

//post para adicionar pela rota anterior 
router.post('/categorias/nova', isAdmin, (req, res)=>{
    //validação para possíveis erros
    let erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: 'Nome inválido'});
    };

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Slug inválido'});
    };
    //última linha da validação, afim de ver se existem erros
    if(erros.length > 0){
        res.render('admin/addcategorias', {erros:erros});
    }else{
        //criando objeto com os dados recebidos para nova collection no DB
        const newCat = {
            nome: req.body.nome,
            slug: req.body.slug
        };

        //criando nova collection com o model dado anteriormente, e então salvando
        new cat(newCat).save().then(()=>{
            req.flash('success_msg', 'Categoria criada com sucesso!');
            res.redirect('/admin/categorias');
        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro ao salvar a categoria, tente novamente!');
            res.redirect('/admin');
        });
    };

});

        //POSTAGENS 

//rota principal
router.get('/postagens', isAdmin, (req, res)=>{
    post.find().lean().populate('categoria').then((postagens)=>{
        res.render('admin/postagens', {postagens:postagens});
    }).catch((err)=>{
        req.flash('error_msg', 'Houve um erro ao listar as postagens');
        res.redirect('/admin');
    })
});


//rota para adicionar nova postagem
router.get('/postagens/add', isAdmin, (req, res)=>{
    cat.find().lean().then((categorias)=>{
        res.render('admin/addpostagens', {categorias: categorias});
    }).catch((err)=>{
        req.flash('error_msg', 'Houve um erro ao carregar o formulário');
        res.redirect('/admin');
    });
});

router.post('/postagens/nova', isAdmin, (req, res)=>{

    let erros = [];

    if(req.body.categoria == '0'){
        erros.push({texto: 'Categoria inválida, registre uma categoria.'});
    }

    if(erros.length > 0){
        res.render('admin/addpostagens', {erros: erros});
    }else{
        const newPost = {
            titulo: req.body.titulo,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
        };
    
        new post(newPost).save().then(()=>{
            req.flash('success_msg', 'Postagem criada com sucesso!');
            res.redirect('/admin/postagens');
        }).catch((err)=>{
            console.log(err);
            req.flash('error_msg', 'Houve um erro ao criar a postagem.');
            res.redirect('/admin/postagens');
        })
    }
});

//rotas para editar postagens

router.get('/postagens/edit/:id', isAdmin, (req, res)=>{
    post.findOne({_id: req.params.id}).lean().then((postagem)=>{
        cat.find().lean().then((categorias)=>{
            
            res.render('admin/editpostagens', {categorias: categorias, postagem: postagem});

        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro ao listar as categorias');
            res.redirect('/admin/postagens');
        })
    }).catch((err)=>{
        req.flash('error_msg', 'Houve um erro ao carregar o formulário de edição');
        res.redirect('/admin/postagens');
    })

});

router.post('/postagens/edit', isAdmin, (req, res)=>{
    post.findOne({_id: req.body.id}).then((postagem)=>{
        postagem.titulo = req.body.titulo;
        postagem.conteudo = req.body.conteudo;
        postagem.categoria = req.body.categoria;

        postagem.save().then(()=>{
            req.flash('success_msg', 'Postagem editada com sucesso');
            res.redirect('/admin/postagens');
        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro interno');
            res.redirect('/admin/postagens');
        })
    }).catch((err)=>{
        req.flash('error_msg', 'Houve um erro ao salvar a edição');
        res.redirect('/admin/postagens');
    })
});

//rota para remover postagens
router.post('/postagens/remove', isAdmin, (req, res)=>{
    post.deleteOne({_id: req.body.id}).then(()=>{
        req.flash('success_msg', 'A postagem foi deletada com sucesso');
        res.redirect('/admin/postagens');
    }).catch((err)=>{
        req.flash('error_msg', 'Houve um erro ao deletar a postagem');
        res.redirect('/admin/postagens');
    });
});

//exportando o router para aplicação principal, para declará-lo como rota
module.exports = router;