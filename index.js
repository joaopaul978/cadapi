//npm init
//npm i express
//npm i cors
//npm i jsonwebtoken
//npm i multer
//npm i axios
const express = require("express");
//remover session npm unistal
const session = require('express-session')
//const multer = require("./mid/uploadImage"); // URGENTE COMENTEI ISSO AQUI.
const multer = require('multer');
const mysql = require("mysql");
const app = express();
const axios = require('axios')

const jwt = require("jsonwebtoken")
//const mysql = require("postesgree");
const cors = require("cors");
app.use(express.json());


// segurança na entrada, cara crachar
/*app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Methods", "PUT, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "X-PINGOTHER,Content-Type, autorizacao");
    res.append('Access-Control-Allow-Credentials', 'true');
    app.use(cors());
    next();
});*/


const db = mysql.createPool({    
   // host: '127.0.0.1', port: "3306", user: "root", password: "", database: "dados"
   host: 'sql10.freesqldatabase.com', port: "3306", user: "sql10778989", password: "dRce4fvNsc", database: "sql10778989"
});

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8888');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
var corsOptions = {
    origin: 'http://localhost:3000',
    'sec-fetch-site': 'same-site',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
    //colocar nos endpoits
    //cors(corsOptions),
}

app.get("/", (req, res) => res.send("Express on Vercel"));
app.listen(3001, () => console.log("Serviço rodando on port 3001."));

//app.use(session({secret:'chavesecreta'}));
app.use(express.json());
app.use(cors());

const patch = require('path');
const { NOMEM } = require("dns");
app.use('/brasao', express.static(patch.resolve(__dirname, "public", "upload/brasao")));
//app.use('/perfil', express.static(patch.resolve(__dirname, "public", "upload/perfil")));

API = 'http://localhost:3001';

const urlBras = `${API}/brasao/`;
//const urlPerf = API + '/perfil/';

app.get('/versaoteste/', async (req, res) => {
    res.send('Serviço node: Versão erbeti rixa: ops, 1.0, aê Rita');
})

const verify = (req, res, next) => {
    const authHeader = req.headers.sessao;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, "Key999025", (err, user) => {
            if (err) {
                return res.status(403).json('Sessão Expirada!');
            }
            req.user = user;
            next();
        });
    } else {
        res.status(403).json('Sessão Expirada!!!');;
    }
};

let refreshtokens = []

app.post("/api/refresh", (req, res) => {
    //fazer refresh no token do usario
    const refreshToken = req.body.token
    //enviar um erro se o token estiver expirado
    if (!refreshToken) return res.status(401).json("Refres: Você não esta Autenticado!")
    if (!refreshtokens.includes(refreshToken)) {
        return res.status(403);
    }
    jwt.verify(refreshToken, "myRefreshSecretKey", (err, user) => {
        err && console.log(err);
        refreshtokens = refreshtokens.filter((token) => token !== refreshToken);
        const newToken_acesso = generateAccesToken(user);
        const newRefreshToken = generateRefreshToken(user);

        refreshtokens.push(newRefreshToken);

        res.status(200).json({
            Token_acesso: newToken_acesso,
            refreshToken: newRefreshToken,
        });
    });
    //se a verificação estiver OK, criar/renovar um novo token
})

const generateAccesToken = (user) => {
    return jwt.sign({ id: user.id, prv: user.prv }, "mySecretKey", {
        expiresIn: "2m"
        //tempo pra o token expirar
    });
}
const generateRefreshToken = (user) => {
    return jwt.sign({ id: user.id, prv: user.prv }, "myRefreshSecretKey");
}

app.get('/getAllEnt2', function (req, res, next) {
    console.log('req.headers', req.headers)
    // Handle the get for this route
    let SQL = "select id_ent,cod_ent,entidade,email,cnpj,data_cad,data_alt,urlbras,ativo from entidades order by entidade asc";
    db.query(SQL, (err, result) => {
        //res.status(404).json("Registros não Encontrado!")
        if (err) { console.log(err) }
        else { res.json({ result }) }
    });
});


app.post('/login', function (req, res, next) {
    const { id_ent, username, password } = req.body;
    let SqlEnt = `select id_ent,cod_ent,caminho,ver,ativo FROM entidades WHERE id_ent = ${id_ent}`;
    db.query(SqlEnt, (err, entd) => {
        if (err) { return res.status(404).json('404!') };
        if (entd[0].ativo === 'S') {
            //const Token_acesso = jwt.sign({id:user[0].id_user, nome: user[0].nome}, "mySecretKey",{expiresIn: "15m"});
            let sqlUser = `select id_user,prv,nome,username,password, role,imgperf,ativo from usuarios where id_ent = ${id_ent} and username = '${username}' and password = '${password}'`;
            db.query(sqlUser, (err, user) => {
                if (user[0]) {
                    if (user[0]?.ativo === 'S') {
                        const date = new Date().toLocaleString() + '';
                        console.log('Entidade:', entd[0].cod_ent, 'Login:', user[0].nome, date);
                        if (err) { console.log(err.response) }
                        else {
                            res.set(entd[0]); msg = "Login: Bem vindo!";
                            res.status(201).json({
                                //colocando os dados dentro do Token; copiei e colei é o karai.
                                Token_acesso: jwt.sign({
                                    id_user: user[0].id_user,
                                    prv: user[0].prv,
                                    nome: user[0].nome,
                                    username: user[0].username,
                                    password: user[0].password,
                                    role: user[0].role,
                                    imgperf: user[0].imgperf,
                                    id_ent: entd[0].id_ent,
                                    cod_ent: entd[0].cod_ent,
                                    email: entd[0].email,                                   
                                    ver: entd[0].ver,
                                    imgbras: entd[0].urlbras + entd[0].caminho
                                }, "Key999025",
                                    { expiresIn: "2h" }), msg
                            })
                        }
                    } else { res.status(401).json('Usuário Inativo!'); }
                } else { res.status(401).json('Usuário ou senha inválido!'); }
            });
        } else { res.status(401).json('Entidade Inativa!'); }

    });
});

app.get('/pessoasIdlancAll/', async (req, res) => {
    let SQL = `select id_pessoa, nome_pessoa, cpf_cnpj from pessoas where id_ent = 1041`;
    db.query(SQL, (err, pessoa) => {
        if (err) { res.status(404).json('404!') }
        else { res.set({ pessoa }); }

        let SQL2 = `select id_pessoa, id_lanc, cod_rec, situacao, data_venc from lancmtos`;
        db.query(SQL2, (err, boletos) => {
            if (err) { res.status(404).json('404!2') }
            else { res.set({ boletos }); }

            let SQL3 = `select id_pessoa, cod_lancdet, cod_rec from lancmtos_detalhado`;
            db.query(SQL3, (err, lanc_Dt) => {
                if (err) { res.status(404).json('404!2') }
                else { res.set({ lanc_Dt }); }

                const sortKey = "id_pessoa";
                pessoa.sort((a, b) => {
                    if (a[sortKey] < b[sortKey]) {
                        return -1;
                    }
                    if (a[sortKey] > b[sortKey]) {
                        return 1;
                    }
                    return 0;
                })

                let pessoa_Map = pessoa.reduce((map, row) => {
                    key = row["id_pessoa"];
                    map[key] = row;
                    return map;
                }, {})
                let lanc_Map = pessoa.reduce((map, row) => {
                    key = row["id_pessoa"];
                    map[key] = row;
                    return map;
                }, {})

                let resultMap = boletos.reduce((map, row) => {
                    let key = row["id_pessoa"];
                    if (map[key]) {
                        if (!map[key].lancmtos) map[key].lancmtos = [];
                        map[key].lancmtos.push(row);
                    }
                    return map;
                }, pessoa_Map)

                resultMap = lanc_Dt.reduce((map, row) => {
                    let key = row["cod_lancdet"];
                    if (map[key]) {
                        if (!map[key].lancmtos) map[key].lancmtos = [];
                        map[key].lancmtos.push(row);
                    }
                    return map;
                }, lanc_Map)

                let result = Object.values(resultMap);
                res.status(200).json({ result });
            });
        });
    });
});

app.get('/pessoaIdlanc/:id_pessoa/:id_ent', async (req, res) => {
    const { id_pessoa, id_ent } = req.params;
    let SQL = `select pessoas.id_pessoa,pessoas.cod_pessoa,pessoas.nome_pessoa,pessoas.fantasia, pessoas.cpf_cnpj,pessoas.rua,pessoas.numero,pessoas.bairro,pessoas.cidade,pessoas.uf,
            pessoas.insc_muni,pessoas.insc_estad,pessoas.tipocad from pessoas where pessoas.id_pessoa = ${id_pessoa}`;
    db.query(SQL, (err, result_pessoa) => {
        if (err) { res.status(404).json('404!') }
        else { res.set({ result_pessoa }); }

        let sql2 = `SELECT lancmtos.cod_lanc,lancmtos.nossonum,lancmtos.cod_rec,receitas.des_rec, lancmtos.valor_real,lancmtos.pago,lancmtos.data_lanc,lancmtos.data_venc
            FROM lancmtos left join receitas on lancmtos.id_rec = receitas.id_rec WHERE lancmtos.id_pessoa = ${id_pessoa} and lancmtos.pago = 'N' and lancmtos.situacao = 'E' order by lancmtos.data_lanc `;
        db.query(sql2, (err, result_lanc) => {
            if (err) { res.status(404).json('404!2') }
            else { res.set({ result_lanc }); }

            let sql3 = `select documentos.id_doc,documentos.cod_doc,documentos.finalidade_doc,documentos.data_emissao,documentos.cod_verificacao,documentos.emissao from documentos where documentos.id_pessoa = ${id_pessoa} order by documentos.cod_doc desc`;
            db.query(sql3, (err, result_docs) => {

                let sql4 = `select assinaturas.id_assin, assinaturas.nome,assinaturas.cargo, assinaturas.matricula from assinaturas where assinaturas.id_ent = ${id_ent} and assinaturas.ativo = 'S'`;
                db.query(sql4, (err, result_assin) => {
                    if (err) { console.log(err) }
                    else { res.set({ result_assin }); }
                    const sortKey = id_pessoa;
                    result_pessoa.sort((a, b) => {
                        if (a[sortKey] < b[sortKey]) {
                            return -1;
                        }
                        if (a[sortKey] > b[sortKey]) {
                            return 1;
                        }
                        return 0;
                    })
                    const sortKeyL = "id_lanc";
                    result_lanc.sort((a, b) => {
                        if (a[sortKeyL] < b[sortKeyL]) {
                            return -1;
                        }
                        if (a[sortKeyL] > b[sortKeyL]) {
                            return 1;
                        }
                        return 0;
                    })

                    let pessoa_Map = result_pessoa.reduce((map, row) => {
                        key = row[id_pessoa];
                        map[key] = row;
                        return map;
                    }, {})

                    let resultMap = result_lanc.reduce((map, row) => {
                        let key = row[id_pessoa];
                        if (map[key]) {
                            if (!map[key].lancmtos) map[key].lancmtos = [];
                            map[key].lancmtos.push(row);
                        }
                        return map;
                    }, pessoa_Map)
                    //-----------------------------------///
                    let resultMap1 = result_assin.reduce((map, row) => {
                        let key = row["id_ent"];
                        if (map[key]) {
                            if (!map[key].assinaturas) map[key].assinaturas = [];
                            map[key].assinaturas.push(row);
                        }
                        return map;
                    }, resultMap);

                    let resultMap2 = result_docs.reduce((map, row) => {
                        let key = row["id_pessoa"];
                        if (map[key]) {
                            if (!map[key].documentos) map[key].documentos = [];
                            map[key].documentos.push(row);
                        }
                        return map;
                    }, pessoa_Map);
                    let result = Object.values(resultMap, resultMap1, resultMap2);
                    res.status(200).json({ result });
                });
            });
        });
    });
});

//funcionando para testes array com 3 tbls
app.get('/pessoasIdlanc/:id_pessoa', async (req, res) => {
    const { id_pessoa } = req.params;
    let SQL = `select id_pessoa, nome_pessoa, cpf_cnpj from pessoas where id_pessoa = ${id_pessoa}`;
    db.query(SQL, (err, result_pessoa) => {
        if (err) { res.status(404).json('404!') }
        else { res.set({ result_pessoa }); }

        let SQL2 = `select id_pessoa, id_lanc, cod_rec from lancmtos where id_pessoa = ${id_pessoa}`;
        db.query(SQL2, (err, result_boletos) => {
            if (err) { res.status(404).json('404!2') }
            else { res.set({ result_boletos }); }

            let SQL3 = `select id_pessoa, cod_lancdet, cod_rec from lancmtos_detalhado`;
            db.query(SQL3, (err, lanc_Dt) => {
                if (err) { res.status(404).json('404!2') }
                else { res.set({ lanc_Dt }); }

                const sortKey = id_pessoa;
                result_pessoa.sort((a, b) => {
                    if (a[sortKey] < b[sortKey]) {
                        return -1;
                    }
                    if (a[sortKey] > b[sortKey]) {
                        return 1;
                    }
                    return 0;
                })
                const sortKeyL = "id_lanc";
                result_boletos.sort((a, b) => {
                    if (a[sortKeyL] < b[sortKeyL]) {
                        return -1;
                    }
                    if (a[sortKeyL] > b[sortKeyL]) {
                        return 1;
                    }
                    return 0;
                })

                let pessoa_Map = result_pessoa.reduce((map, row) => {
                    key = row[id_pessoa];
                    map[key] = row;
                    return map;
                }, {})

                let resultMap = result_boletos.reduce((map, row) => {
                    let key = row[id_pessoa];
                    if (map[key]) {
                        if (!map[key].lancmtos) map[key].lancmtos = [];
                        map[key].lancmtos.push(row);
                    }
                    return map;
                }, pessoa_Map)
                //-----------------------------------///
                let lanc_Map = result_boletos.reduce((map, row) => {
                    key = row["id_lanc"];
                    map[key] = row;
                    return map;
                }, {})

                let resultMap1 = lanc_Dt.reduce((map, row) => {
                    let key = row["cod_lancdet"];
                    if (map[key]) {
                        if (!map[key].lancmtosDt) map[key].lancmtosDt = [];
                        map[key].lancmtosDt.push(row);
                    }
                    return map;
                }, lanc_Map)

                let result = Object.values(resultMap, resultMap1);
                res.status(200).json({ result });
            });
        });
    });
});


//===========Pessoas========//
app.get('/buscaCnpj/:cpf_cnpj', (req, res) => {
    const { cpf_cnpj } = req.params;
    axios.get(`https://receitaws.com.br/v1/cnpj/${cpf_cnpj.replace(/[^0-9]/g, '')}`)
        .then((response) => {
            if (response) { res.status(200).send(response.data) }
        }).catch((error) => {
            if (error) { res.status(404).json('Limit atingido aguarde 3 min!'); }
        })
});

app.get('/buscaCEP/:cep', (req, res) => {
    const { cep } = req.params;
    axios.get(`https://opencep.com/v1/${cep.replace(/[^0-9]/g, '')}`)
        .then((response) => {
            if (response) { res.status(200).send(response.data) }
        }).catch((error) => {
            if (error) { res.status(404).json('Limit atingido aguarde 3 min!'); }
        })
});
/* ------------------------------------------------------------------------------------COPIA DE PESSOAS POST
app.post("/pessoa", verify, async (req, res) => {
    const { id_ent, id_user, nome, cpf_cnpj, email, telefone,fixo, rua, numero, bairro, cidade, uf,cep, data_cad, usu_cad } = req.body;
    let cod_pessoa;  
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) {res.status(404).json('404!')}
        else {res.set(result[0])}
        role = result[0].role;
        if (role === 3) {
            res.statusCode(401).json('Usuário não autorizado')
        } else {                       
                    let SelCod = `select max(cod_pessoa) as cod_pessoa FROM pessoas WHERE id_ent = ${id_ent}`;
                    db.query(SelCod, (err, result) => {
                        if (err) {res.status(404).json('404!4')}
                        else {res.set(result[0])}                
                        cod_pessoa = result[0].cod_pessoa + 1;
                        if (cod_pessoa) { 
                            let SQL = "insert into pessoas (id_ent, cod_pessoa, nome, cpf_cnpj, email, telefone,fixo, rua, numero, bairro, cidade, uf,cep, data_cad, usu_cad) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                            db.query(SQL, [id_ent, cod_pessoa, nome, cpf_cnpj, email, telefone,fixo, rua, numero, bairro, cidade, uf,cep, data_cad, usu_cad], (err1, result2) => {
                                msg = "Salvo!";
                                if (err1) { res.status(404).json('404!5'),console.log(err1)}
                                else {res.status(201).json({ result2, msg })}
                            });
                        } else {
                            console.log('Erro ao Gerar Codigo!')
                        }
               }); 
        }
    });
}); */
app.post("/pessoa", verify, async (req, res) => {
    let { id_ent, id_user, nome_pessoa, fantasia, cpf_cnpj, email, telefone, fixo, rua, numero, bairro, cidade, uf, cep, tipocad, situacao_cad, porte, vigilancia, obs, cod_natureza, ultima_atualizacao, complemento, site, area_mercantil, numero_proc, data_encerramento, data_abertura, data_cad, usu_cad,
        insc_muni, insc_estad, insc_junta, cod_segmentoativ, classetrib, cod_cnae, cod_cnae_grupo, iss, iss_retido, tx_virgilancia, alvara, alvara_trans, ativsecund, socios } = req.body;

    //let socios = req.body; console.log('socios:',socios)
    //let nome2 = socios.nome; console.log('',nome2)
    //  let insc_muni = req.body;
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.set(result[0]) }
        role = result[0].role;
        if (role === 3) {
            res.statusCode(401).json('Usuário não autorizado')
        } else {
            let sql = `select pessoas.id_pessoa from pessoas WHERE pessoas.id_ent = ${id_ent} and pessoas.cpf_cnpj = '${cpf_cnpj.replace(/[^0-9]/g, '')}'`;
            db.query(sql, (err, result) => {
                let resSelc = result.length;
                if (resSelc) {
                    res.status(203).json({ msg: 'CPF/CNPJ já cadastrado!' })
                } else {
                    let SelCod = `select max(cod_pessoa) as cod_pessoa FROM pessoas WHERE id_ent = ${id_ent}`;
                    db.query(SelCod, (err, result) => {
                        if (err) { res.status(404).json('404!4') }
                        else { res.set(result[0]) }
                        let cod_pessoa = result[0].cod_pessoa + 1;
                        if (cod_pessoa) {
                            if (!insc_muni) {
                                insc_muni = cod_pessoa + '/' + new Date().getFullYear()
                            }
                            //   nome = nome.replace(/[^0-9]/g,'');                            
                            let SQL = `insert into pessoas (id_ent,id_user,cod_pessoa,nome_pessoa,fantasia, cpf_cnpj, email, telefone,fixo, rua, numero, bairro, cidade, uf,cep,tipocad,situacao_cad,porte,vigilancia,obs,cod_natureza, ultima_atualizacao,complemento,site,area_mercantil,numero_proc,data_encerramento,data_abertura,data_cad, usu_cad, 
        insc_muni,insc_estad,insc_junta,cod_segmentoativ,classetrib,cod_cnae,cod_cnae_grupo,iss,iss_retido,tx_virgilancia,alvara,alvara_trans) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                            db.query(SQL, [id_ent, id_user, cod_pessoa, nome_pessoa, fantasia, cpf_cnpj.replace(/[^0-9]/g, ''), email, telefone, fixo, rua, numero, bairro, cidade, uf, cep, tipocad, situacao_cad, porte, vigilancia, obs, cod_natureza, ultima_atualizacao, complemento, site, area_mercantil, numero_proc, data_encerramento, data_abertura, data_cad, usu_cad,
                                insc_muni, insc_estad, insc_junta, cod_segmentoativ, classetrib, cod_cnae, cod_cnae_grupo, iss, iss_retido, tx_virgilancia, alvara, alvara_trans], (err1, result2) => {

                                    if (err1) { console.log(err1) }
                                    //  else {res.status(201).json({ result2, msg })}
                                    else { res.set(result2[0]) }
                                    let id_pessoa = result2.insertId;
                                    if (tipocad === 'E') {
                                        let i = 0;
                                        do {
                                            let code = ativsecund[i].code;
                                            let SQL = "insert into pessoas_ativ_cnae (id_pessoa, code) values (?,?)";
                                            db.query(SQL, [id_pessoa, code.replace(/[^0-9]/g, '')], (err1, result2) => {
                                                if (err1) { res.status(404).json('404!5'), console.log('err2', err1) }
                                            });
                                            i++;
                                        }
                                        while (i < ativsecund.length);
                                        //   if (i = ativsecund.length){
                                        let i2 = 0;
                                        do {
                                            let SQL = "insert into pessoas_socios (id_pessoa, nome, cpf_cnpj,qual) values (?,?,?,?)";
                                            db.query(SQL, [id_pessoa, socios[i2].nome, cpf_cnpj.replace(/[^0-9]/g, ''), socios[i2].qual], (err1, result2) => {
                                                if (err1) { res.status(404).json('404!5'), console.log('err1:', err1) }
                                            });
                                            i2++;
                                        }
                                        while (i2 < socios.length);

                                        if (i2 = socios.length) {
                                            res.status(201).json({ result2, msg: 'Salvo' })
                                        }

                                    } else {
                                        res.status(201).json({ result2, msg: 'Salvo' })
                                    }
                                });
                        } else {
                            console.log('Erro ao Gerar Codigo!')
                        }
                    });
                }
            });
        }
    });
});

app.post("/socios/:id_pessoa/:nome/:cpf_cnpj/:qual", async (req, res) => {
    const { id_pessoa, nome, cpf_cnpj, qual } = req.params;
    let sql = `select cpf_cnpj FROM pessoas_socios WHERE id_pessoa = ${id_pessoa} and cpf_cnpj = ${cpf_cnpj}`;
    db.query(sql, (err, result) => {
        let resSelc = result.length;
        if (!resSelc) {
            let sql = "insert into pessoas_socios (id_pessoa, nome, cpf_cnpj,qual) values (?,?,?,?)";
            db.query(sql, [id_pessoa, nome, cpf_cnpj.replace(/[^0-9]/g, ''), qual], (err1, result) => {
                if (err1) { res.status(404).json('404!'), console.log(err1) }
                else res.status(200).json({ id_pessoa });
            })
        } else { res.status(203).json({ id_pessoa, msg: 'Já Adcionado!' }) }
    })
}

);

app.delete("/delSocios/:id/:id_pessoa", async (req, res) => {
    const { id, id_pessoa } = req.params;
    let sql = `delete from pessoas_socios where id_socios = ${id}`;
    db.query(sql, (err1, result) => {
        if (err1) { res.status(404).json('404!'), console.log(err1) }
        else res.status(200).json({ id_pessoa });
    })
}
);

app.post("/ativsecundaria/:id_pessoa/:code", async (req, res) => {
    const { id_pessoa, code } = req.params;
    let sql = "insert into pessoas_ativ_cnae (id_pessoa, code) values (?,?)";
    db.query(sql, [id_pessoa, code], (err1, result) => {
        if (err1) { res.status(404).json('404!'), console.log(err1) }
        else res.status(200).json({ id_pessoa });
    })
}
);
app.delete("/delAtivs/:id/:id_pessoa", async (req, res) => {
    const { id, id_pessoa } = req.params;
    let sql = `delete from pessoas_ativ_cnae where id_ativ = ${id}`;
    db.query(sql, (err1, result) => {
        if (err1) { res.status(404).json('404!'), console.log(err1) }
        else res.status(200).json({ id_pessoa });
    })
}
);

app.put("/pessoa/", verify, async (req, res) => {
    let { id_pessoa, id_user, cod_pessoa, tipocad, nome_pessoa, fantasia, cpf_cnpj, email, telefone, fixo, rua, numero, bairro, cidade, uf, cep, data_abertura, data_alt, situacao_cad, porte, vigilancia, regime_trib, obs, obs_encerramento, cod_natureza, ultima_atualizacao, complemento, site, area_mercantil, numero_proc, data_encerramento, usu_cad,
        insc_muni, insc_estad, insc_junta, cod_segmentoativ, classetrib, cod_cnae, cod_cnae_grupo, iss, iss_retido, tx_virgilancia, alvara, alvara_trans } = req.body;
    //const {data_cad} = Date.now();  
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.set(result[0]) }
        role = result[0].role;
        if (role === 3) {
            res.status(401).json("Usuário não autorizado!");
        } else { //let msg = 'Alterado!';
            if (!insc_muni) { insc_muni = cod_pessoa + '/' + new Date().getFullYear() }
            let sql1 = `update pessoas set tipocad = ?, nome_pessoa = ?,fantasia =?, cpf_cnpj = ?,email = ?,telefone = ?,fixo = ?, rua = ?, numero = ?, 
            bairro = ?, cidade = ?, uf = ?, cep = ?, data_abertura =?,data_alt = ?,situacao_cad = ?, porte = ?,vigilancia = ?,regime_trib =?, obs =?, 
            obs_encerramento =?,cod_natureza = ?, ultima_atualizacao = ?,complemento = ?, site = ?,area_mercantil = ?,numero_proc = ?,
            data_encerramento = ?,usu_cad = ?,insc_muni = ?,insc_estad = ?,insc_junta = ?,cod_segmentoativ = ?,classetrib = ?,cod_cnae = ?,cod_cnae_grupo = ?,
            iss = ?,iss_retido = ?,tx_virgilancia = ?,alvara = ?, alvara_trans = ? where id_pessoa = ?`;
            db.query(sql1, [tipocad, nome_pessoa, fantasia, cpf_cnpj.replace(/[^0-9]/g, ''), email, telefone, fixo, rua, numero, bairro, cidade, uf, cep, data_abertura, data_alt, situacao_cad, porte, vigilancia, regime_trib, obs, obs_encerramento, cod_natureza, ultima_atualizacao, complemento, site, area_mercantil, numero_proc, data_encerramento, usu_cad,
                insc_muni, insc_estad, insc_junta, cod_segmentoativ, classetrib, cod_cnae, cod_cnae_grupo, iss, iss_retido, tx_virgilancia, alvara, alvara_trans, id_pessoa], (err, result1) => {
                    if (err) { res.status(404).json('404!') }
                    else { res.status(201).json({ id_pessoa, msg: 'Alterado!' }) }
                    //else res.json({ result, msg });
                });
        }
    });
}
);

app.post("/pessoasPesq", verify, (req, res) => {
    let { id_ent, campo, text1, text2, limit_rows } = req.body;
    let CONDICAO = '';
    if (text1 === '*') { text1 = ''; text2 = '' }
    if (!limit_rows) { limit_rows = 500 }
    switch (campo) {
        case 'data_cad': CONDICAO = `pessoas.data_cad between "${text1.replace('/','-')}" and "${text2.replace('/','-')}" order by pessoas.cod_pessoa`; break;
        case 'cod_pessoa': CONDICAO = `pessoas.cod_pessoa like '${text1}%' order by pessoas.cod_pessoa`; break;
        case 'nome_pessoa': CONDICAO = `pessoas.nome_pessoa like "${text1}%" order by pessoas.cod_pessoa`; break;
        case 'cpf_cnpj': CONDICAO = `pessoas.cpf_cnpj like "${text1.replace(/[^0-9]/g, '')}%" order by pessoas.cod_pessoa`; break;
    }
    if (CONDICAO) {
        SQL = `select pessoas.id_pessoa,pessoas.tipocad, pessoas.cod_pessoa, pessoas.nome_pessoa, pessoas.cpf_cnpj, pessoas.cep, pessoas.rua,pessoas.numero,pessoas.email,pessoas.telefone,pessoas.fixo,
    pessoas.bairro,pessoas.cidade,pessoas.uf,pessoas.data_cad from pessoas where pessoas.id_ent = ${id_ent} and ${CONDICAO} limit ${limit_rows}`;
        db.query(SQL, (err, result) => { console.log(SQL)
            if (err) { res.status(404).json('404!') }
            else res.send(result);
        });
    }
});

app.get("/pessoasIdLancmto/:id_pessoa", verify, (req, res) => {
    const { id_pessoa } = req.params;
    let SQL = `select pessoas.id_pessoa, pessoas.tipocad, pessoas.cod_pessoa, pessoas.nome_pessoa, pessoas.insc_muni, pessoas.cpf_cnpj from pessoas where pessoas.id_pessoa = ${id_pessoa}`;
    db.query(SQL, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else res.json({ result });
    });
});

app.delete("/delPessoa/:id_pessoa/:id_user", verify, (req, res) => {
    const { id_pessoa, id_user } = req.params;
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.set(result[0]) }
        role = result[0].role;
        if (role === 1) {
            let SQL = `delete from pessoas where id_pessoa = ${id_pessoa}`;
            db.query(SQL, (err) => {
                if (err) { res.status(405).json('Não é Possivel excluir: Registro Chave') }
                else { res.status(200).json('Excluído!') }
            });
        } else {
            res.status(401).json('Usuário Não autorizado!');
        }
    });
});
//===========ITBI========//
app.post("/ITBIPost", async (req, res) => {
    let { id_ent, cod_imovel, inscricao, id_vendedor, id_comprador, cpf_cnpj_comprador, cpf_cnpj_vendedor, pago, negocio_juridico, nome_comprador, nome_vendedor, num_processo, valor_taxa, area_terreno, area_construida, valor_venal, obs_itbi,
        oficio, tipo_localizacao, tipo_lanc, id_user, aliq_avaliacao, aliq_itbi, valor_avaliado, valor_itbi, valor_nj, valor_pago, valor_total, data_cad, data_emissao, data_venc, id_assin1, id_assin2, id_assin3 } = req.body;
    let SelCdoc = `select max(cod_itbi) as cod_itbi FROM itbi WHERE id_ent = ${id_ent}`;
    db.query(SelCdoc, (err, result1) => {
        if (err) { res.status(404).json('404!2') }
        else {
            let cod_itbi = result1[0].cod_itbi + 1;
            if (cod_itbi) {
                let transferido = 'N';
                if (!num_processo) { num_processo = ("000000" + cod_itbi).slice(-6) + '/' + new Date().getFullYear() }
                let emissao = 'E'; let exercicio = new Date().getFullYear();
                let SQLL = `insert into itbi (id_ent,cod_itbi,inscricao,cod_imovel, id_vendedor,id_comprador, cpf_cnpj_comprador, cpf_cnpj_vendedor, pago, negocio_juridico, nome_comprador, nome_vendedor, num_processo,exercicio, valor_taxa, area_terreno,area_construida,valor_venal,obs_itbi,
                    oficio, tipo_localizacao, tipo_lanc, transferido, id_user, aliq_avaliacao,aliq_itbi, valor_avaliado, valor_itbi, valor_nj, valor_pago, valor_total,data_cad, data_emissao,emissao, data_venc, id_assin1, id_assin2,id_assin3) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                db.query(SQLL, [id_ent, cod_itbi, inscricao, cod_imovel, id_vendedor, id_comprador, cpf_cnpj_comprador, cpf_cnpj_vendedor, pago, negocio_juridico, nome_comprador, nome_vendedor, num_processo, exercicio, valor_taxa, area_terreno, area_construida, valor_venal, obs_itbi,
                    oficio, tipo_localizacao, tipo_lanc, transferido, id_user, aliq_avaliacao, aliq_itbi, valor_avaliado, valor_itbi, valor_nj, valor_pago, valor_total, data_cad, data_emissao, emissao, data_venc, id_assin1, id_assin2, id_assin3], (err1, result0) => {
                        if (err1) { res.status(404).json('404!5'), console.log(err1) }
                        else {
                            let id_itbi = result0.insertId;
                            if (id_itbi) {
                                let SelCodLog = `select max(cod_lanc) as cod_lanc FROM lancmtos WHERE id_ent = ${id_ent}`;
                                db.query(SelCodLog, (err, result) => {
                                    if (err) { res.status(404).json('404!'), console.log('errLOG', err) }
                                    else { res.set(result[0]) }
                                    let cod_lanc = result[0].cod_lanc + 1;
                                    let valor_real = valor_total; let parc = '0'; let situacao = 'E'; let pago = 'N'; let cod_insc = cod_itbi; let numero_proc = num_processo;
                                    let cod_rec = '7000'; referencia = id_itbi; let id_pessoa = id_vendedor;
                                    let nossonum = exercicio + ("0000" + cod_rec).slice(-4) + ("000000" + cod_itbi).slice(-6);
                                    let desc_lanc = `VALOR REFERÊNTE A EMISSÃO DO ITBI: ${("000000" + cod_itbi).slice(-6)}.`;
                                    let sql1 = "insert into lancmtos (id_ent,cod_lanc,id_pessoa, id_user,cod_rec,desc_lanc, valor_real,parc,situacao,nossonum,pago,exercicio,cod_insc,numero_proc,data_venc, referencia) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                                    db.query(sql1, [id_ent, cod_lanc, id_pessoa, id_user, cod_rec, desc_lanc, valor_real, parc, situacao, nossonum, pago, exercicio, cod_insc, numero_proc, data_venc, referencia], (err1, result3) => {
                                        if (err1) { res.status(404).json('404!'), console.log(err1) }
                                        else { res.set(result3[0]) }
                                        let id_lanc = result3.insertId;
                                        if (id_lanc) {
                                            let cod_lancdet = id_lanc;
                                            let valor_real = valor_total;
                                            let sql2 = "insert into lancmtos_detalhado (id_ent,cod_lancdet,id_pessoa,id_user,cod_rec,valor_real, situacao,nossonum,pago,exercicio,cod_insc,numero_proc,data_venc, referencia) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                                            db.query(sql2, [id_ent, cod_lancdet, id_pessoa, id_user, cod_rec, valor_real, situacao, nossonum, pago, exercicio, cod_insc, numero_proc, data_venc, referencia], (err1, result4) => {
                                                if (err1) {
                                                    res.status(404).json('erro ao Gerar lancmto'); console.log(err1);
                                                } else { res.status(201).json({ id_itbi, msg: 'Salvo!' }); }
                                            });
                                        } else { res.status(404).json('erro ao Gerar lancmto'); console.log('erro ao Gerar lancmto'); }
                                    });

                                });

                            }

                            /* let id_itbi = result2.insertId;  if (id_itbi) {   
                                    let slq2 = `select itbi.id_ent, itbi.cod_itbi,itbi.inscricao, itbi.id_vendedor, itbi.id_comprador, itbi.cpf_cnpj_comprador, itbi.cpf_cnpj_vendedor, itbi.exercicio, itbi.pago, 
                                itbi.negocio_juridico, itbi.nome_comprador, itbi.nome_vendedor, itbi.num_processo, itbi.obs_itbi, itbi.oficio, itbi.tipo_localizacao, itbi.tipo_lanc, itbi.transferido, itbi.usu_cad, 
                                itbi.aliq_avaliacao,itbi.aliq_itbi, itbi.valor_avaliado, itbi.valor_itbi,itbi.valor_nj, itbi.valor_pago, itbi.valor_total, itbi.data_cad, itbi.data_emissao,emissao, itbi.data_pgmto,
                                itbi.id_assin1, itbi.id_assin2 from itbi where itbi.id_itbi = ${id_itbi}`;
                                    db.query(slq2, (err, result) => {
                                        if (err) { res.status(404).json('404!'); console.log(err) }
                                        else {
                                            if (!id_assin1) { id_assin1 = 0 }
                                            let sqla1 = `select id_assin,nome,cargo,matricula FROM assinaturas WHERE id_assin = ${id_assin1}`;
                                            db.query(sqla1, (err, assin1) => {
                                                if (err) { res.status(404).json('404!2'), console.log(err) }
                                                else { res.set(assin1) }
                                                if (!id_assin2) { id_assin2 = 0 }
    
                                                let sqla3 = `select id_assin,nome,cargo,matricula FROM assinaturas WHERE id_assin = ${id_assin2}`;
                                                db.query(sqla3, (err, assin2) => {
                                                    if (err) { res.status(404).json('404!2'), console.log(err) }
                                                    else {
                                                        res.set(assin2)
                                                        res.status(200).json({ result, assin1, assin2 });
                                                    }
                                                })
    
                                            })
                                        }
                                    });
                                } else { res.status(404).json('Erro ao Cadastrar!') } */
                        }
                    });
            }
        }
    });
});
app.put("/ITBIPut/", verify, async (req, res) => {
    let { id_user, id_itbi, obs_itbi, negocio_juridico, endereco, id_assin1, id_assin2, id_assin3 } = req.body;
    //const {data_cad} = Date.now();  
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.set(result[0]) }
        role = result[0].role;
        if (role === 3) {
            res.status(401).json("Usuário não autorizado!");
        } else { //let msg = 'Alterado!';
            let sql1 = `update itbi set obs_itbi = '${obs_itbi}',negocio_juridico = '${negocio_juridico}',endereco = '${endereco}', id_assin1 = ${id_assin1}, id_assin2 = ${id_assin2},id_assin3 = ${id_assin3} where id_itbi = ${id_itbi}`;
            db.query(sql1, (err, result1) => {
                if (err) { res.status(404).json('404!') }
                else { res.status(201).json({ id_itbi, msg: 'Alterado!' }) }
            });
        }
    });
}
);
app.get("/itbiId/:id_itbi", async (req, res) => {
    let { id_itbi } = req.params;
    let slq2 = `select itbi.id_ent,itbi.id_itbi, itbi.cod_itbi, itbi.inscricao, itbi.id_vendedor, itbi.id_comprador, itbi.cpf_cnpj_comprador, itbi.cpf_cnpj_vendedor, itbi.exercicio, itbi.pago, 
    itbi.negocio_juridico, itbi.nome_comprador, itbi.nome_vendedor, itbi.num_processo, itbi.obs_itbi, itbi.oficio, itbi.tipo_localizacao, itbi.tipo_lanc, itbi.transferido, itbi.id_user,itbi.endereco,
    itbi.aliq_avaliacao,itbi.aliq_itbi, itbi.valor_avaliado, itbi.valor_itbi,itbi.valor_nj, itbi.valor_pago, itbi.valor_total, itbi.data_cad, itbi.data_emissao,emissao, itbi.data_pgmto,
    itbi.id_assin1, itbi.id_assin2,itbi.id_assin3, Pv.nome_pessoa as nome_vendedor, Pc.rua as rua_vendedor, Pc.numero as num_vendedor, Pc.bairro as bairro_vendedor, Pc.cidade as cidade_vendedor, Pc.uf as uf_vendedor,Pv.cep as cep_comprador, 
    Pc.nome_pessoa as nome_comprador,Pc.rua as rua_comprador, Pc.numero as num_comprador, Pc.bairro as bairro_comprador, Pc.cidade as cidade_comprador, Pc.uf as uf_comprador, Pv.cep as cep_comprador from itbi 
    LEFT JOIN pessoas Pv ON itbi.id_vendedor = Pv.id_pessoa LEFT JOIN pessoas Pc ON itbi.id_comprador = Pc.id_pessoa where itbi.id_itbi = ${id_itbi}`;
    db.query(slq2, (err, result) => {
        if (err) { res.status(404).json('404!'); console.log(err) }
        else {
            let id_assin1 = result[0].id_assin1; let id_assin2 = result[0].id_assin2; let id_assin3 = result[0].id_assin3;
            if (!id_assin1) { id_assin1 = 0 }
            let sqla1 = `select id_assin,nome,cargo,matricula FROM assinaturas WHERE id_assin = ${id_assin1}`;
            db.query(sqla1, (err, assin1) => {
                if (err) { res.status(404).json('404!2'), console.log('errLOG', err) }
                else { res.set(assin1) }
                if (!id_assin2) { id_assin2 = 0 }
                let sqla2 = `select id_assin,nome,cargo,matricula FROM assinaturas WHERE id_assin = ${id_assin2}`;
                db.query(sqla2, (err, assin2) => {
                    if (err) { res.status(404).json('404!2'), console.log('errLOG', err) }
                    else { res.set(assin2) }
                    if (!id_assin3) { id_assin3 = 0 }
                    let sqla3 = `select id_assin,nome,cargo,matricula FROM assinaturas WHERE id_assin = ${id_assin3}`;
                    db.query(sqla3, (err, assin3) => {
                        if (err) { res.status(404).json('404!2'), console.log('errLOG', err) }
                        else {
                            res.set(assin3)
                            res.status(200).json({ result, assin1, assin2, assin3 });
                        }
                    })
                })
            });
            // res.status(200).json({ result })
        }
    });
});
app.post("/itbiPesq/", verify, (req, res) => {
    let { id_ent, campo, text1, text2, limit_rows } = req.body;
    if (text1 === '*') { text1 = ''; text2 = '' }
    let CONDICAO = '';
    switch (campo) {
        case 'data_cad': CONDICAO = `itbi.data_cad between "${text1.replace('/','-')}" and "${text2.replace('/','-')}" order by itbi.cod_itbi`; break;
        case 'cod_itbi': CONDICAO = `itbi.cod_itbi = ${text1}`; break;
        case 'inscricao': CONDICAO = `itbi.inscricao like "%${text1}%" order by itbi.cod_itbi`; break;
        case 'nome_vendedor': CONDICAO = `itbi.nome_vendedor like '%${text1}%' order by itbi.cod_itbi`; break;
        case 'nome_comprador': CONDICAO = `itbi.nome_comprador like "%${text1}%" order by itbi.cod_itbi`; break;
        case 'cpf_cnpj_vendedor': CONDICAO = `itbi.cpf_cnpj_vendedor like "${text1}%" order by itbi.cod_itbi`; break;
        case 'cpf_cnpj_comprador': CONDICAO = `itbi.cpf_cnpj_comprador like "${text1}%" order by itbi.cod_itbi`; break;
        case '': CONDICAO = `itbi.nome_vendedor like '%${text1}%' order by itbi.cod_itbi`; break;
    }
    if (CONDICAO) {
        let SQL = `select itbi.id_ent, itbi.id_itbi, itbi.cod_itbi, itbi.inscricao, itbi.id_vendedor, itbi.id_comprador, itbi.cpf_cnpj_comprador, itbi.cpf_cnpj_vendedor, itbi.pago,
        itbi.nome_comprador, itbi.nome_vendedor, itbi.tipo_localizacao, itbi.transferido, itbi.valor_total, itbi.data_cad, itbi.data_emissao,itbi.emissao from itbi where itbi.id_ent = ${id_ent} and ${CONDICAO} desc limit ${limit_rows}`;
        db.query(SQL, (err, result) => {
            if (err) { res.status(404).json('Dados não Encontrado!') }
            else res.send(result);
        });
    }
});
app.get('/itbiLanc/:id_itbi', async (req, res) => {
    const { id_itbi } = req.params;
    let SQL = `select itbi.id_ent,itbi.id_itbi, itbi.cod_itbi,itbi.cod_imovel, itbi.inscricao, itbi.id_vendedor, itbi.id_comprador, itbi.cpf_cnpj_comprador, itbi.cpf_cnpj_vendedor,itbi.endereco, itbi.exercicio, itbi.pago, 
    itbi.negocio_juridico, itbi.nome_comprador, itbi.nome_vendedor, itbi.num_processo, itbi.obs_itbi,itbi.area_terreno, area_construida,itbi.valor_venal, itbi.oficio, itbi.tipo_localizacao, itbi.tipo_lanc, itbi.transferido, itbi.id_user, 
    itbi.aliq_avaliacao,itbi.aliq_itbi, itbi.valor_avaliado,itbi.valor_taxa, itbi.valor_itbi,itbi.valor_nj, itbi.valor_total, itbi.data_cad, itbi.data_emissao,itbi.emissao, itbi.id_assin1, itbi.id_assin2,itbi.id_assin3,
    Pv.nome_pessoa as nome_vendedor, Pc.rua as rua_vendedor, Pc.numero as num_vendedor, Pc.bairro as bairro_vendedor, Pc.cidade as cidade_vendedor, Pc.uf as uf_vendedor,Pv.cep as cep_comprador, 
    Pc.nome_pessoa as nome_comprador,Pc.rua as rua_comprador, Pc.numero as num_comprador, Pc.bairro as bairro_comprador, Pc.cidade as cidade_comprador, Pc.uf as uf_comprador, Pv.cep as cep_comprador, lancmtos.nossonum, lancmtos.data_venc, lancmtos.desc_lanc from itbi left join lancmtos on itbi.id_itbi = lancmtos.referencia 
    LEFT JOIN pessoas Pv ON itbi.id_vendedor = Pv.id_pessoa LEFT JOIN pessoas Pc ON itbi.id_comprador = Pc.id_pessoa where itbi.id_itbi = ${id_itbi}`;
    db.query(SQL, (err, result_itbi) => {
        if (err) { res.status(404).json('404!') }
        else {
            res.set(result_itbi);
            let SQL2 = `select entidades.msg1, entidades.msg2, entidades.msg3,entidades.msg4,entidades.venc_unica,entidades.venc_antec from entidades where entidades.id_ent = ${result_itbi[0].id_ent}`;
            db.query(SQL2, (err, result_entid) => {
                if (err) { res.status(404).json('4042!') }
                else {
                    res.set({ result_entid });
                    let SQL3 = `select bancos.agencia, bancos.conta, bancos.convenio, bancos.cod_banco, bancos.nome_banco, bancos.local_pgto,bancos.brasao from bancos where bancos.ativo = 'S' limit 1`;
                    db.query(SQL3, (err, resbanco) => {
                        if (err) { res.status(404).json('404!3') }
                        else {
                            res.set({ resbanco });
                            let rowDataPkt = { ...result_itbi[0] };
                            let rowDataPktb = { ...resbanco[0] };

                            let vlt = rowDataPkt.valor_total;
                            let conv = rowDataPktb.convenio;
                            let dtvc = rowDataPkt.data_venc;
                            let idItbi = rowDataPkt.id_itbi;

                            let cod_banco = resbanco[0].cod_banco;
                            let agencia = resbanco[0].agencia;
                            let conta = resbanco[0].conta;
                            let convenio = resbanco[0].convenio;
                            let brasao = resbanco[0].brasao;
                            let nome_banco = resbanco[0].nome_banco;
                            let local_pgto = resbanco[0].local_pgto;
                            let codigobarra = '8162' + ("00000000000" + vlt).slice(-12) + conv + new Date().getFullYear() + dtvc + '8' + ("00000000" + idItbi).slice(-9) + '008';
                            codigobarra = codigobarra.replace(/[^0-9]/g, '');
                            let linhadigitavel = codigobarra.substring(0, 12) + ".7 " + codigobarra.substring(12, 24) + ".5 " + codigobarra.substring(24, 36) + ".6 " + codigobarra.substring(36, 48) + ".8 ";
                            let result_banco = [{
                                'cod_banco': cod_banco, 'agencia': agencia, 'conta': conta, 'convenio': convenio, 'nome_banco': nome_banco, 'local_pgto': local_pgto,
                                'brasao': brasao, 'codigobarra': codigobarra, 'linhadigitavel': linhadigitavel
                            }];
                            const sortKey = id_itbi;
                            result_itbi.sort((a, b) => {
                                if (a[sortKey] < b[sortKey]) {
                                    return -1;
                                }
                                if (a[sortKey] > b[sortKey]) {
                                    return 1;
                                }
                                return 0;
                            })
                            let iptu_Map = result_itbi.reduce((map, row) => {
                                key = row[id_itbi];
                                map[key] = row;
                                return map;
                            }, {})

                            let resultMap1 = result_banco.reduce((map, row) => {
                                let key = row["id_banco"];
                                if (map[key]) {
                                    if (!map[key].banco_ativo) map[key].banco_ativo = [];
                                    map[key].banco_ativo.push(row);
                                }
                                return map;
                            }, iptu_Map)
                            //-----------------------------------/// funcionando
                            let resultMap2 = result_entid.reduce((map, row) => {
                                let key = row["id_ent"];
                                if (map[key]) {
                                    if (!map[key].dados_Ent) map[key].dados_Ent = [];
                                    map[key].dados_Ent.push(row);
                                }
                                return map;
                            }, resultMap1)
                            let result = Object.values(iptu_Map, resultMap1, resultMap2);


                            let id_assin1 = result_itbi[0].id_assin1; let id_assin2 = result_itbi[0].id_assin2; let id_assin3 = result_itbi[0].id_assin3;
                            if (!id_assin1) { id_assin1 = 0 }
                            let sqla1 = `select id_assin,nome,cargo,matricula FROM assinaturas WHERE id_assin = ${id_assin1}`;
                            db.query(sqla1, (err, assin1) => {
                                if (err) { res.status(404).json('404!2'), console.log('errLOG', err) }
                                else { res.set(assin1) }
                                if (!id_assin2) { id_assin2 = 0 }
                                let sqla2 = `select id_assin,nome,cargo,matricula FROM assinaturas WHERE id_assin = ${id_assin2}`;
                                db.query(sqla2, (err, assin2) => {
                                    if (err) { res.status(404).json('404!2'), console.log('errLOG', err) }
                                    else { res.set(assin2) }
                                    if (!id_assin3) { id_assin3 = 0 }
                                    let sqla3 = `select id_assin,nome,cargo,matricula FROM assinaturas WHERE id_assin = ${id_assin3}`;
                                    db.query(sqla3, (err, assin3) => {
                                        if (err) { res.status(404).json('404!2'), console.log('errLOG', err) }
                                        else {
                                            res.set(assin3)
                                            res.status(200).json({ result, assin1, assin2, assin3 });
                                        }
                                    })
                                })
                            });
                            //res.status(200).json({ result });

                        }
                    });//banco
                }
            });//entidade  
        }
    });//ITBI
});
app.delete("/ITBIdel/:id_itbi/:id_user", verify, (req, res) => {
    const { id_itbi, id_user } = req.params;
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.set(result[0]) }
        role = result[0].role;
        if (role === 1) {
            let SQL = `update itbi set emissao = 'C' where id_itbi = ${id_itbi}`;
            db.query(SQL, (err) => {
                if (err) { res.status(405).json('Não é Possivel excluir: Registro Chave') }
                else { res.status(200).json('Cancelado!') }
            });
        } else {
            res.status(401).json('Usuário Não autorizado!');
        }
    });
});

//===========documentos========//
app.post("/docPost", async (req, res) => {
    let { id_ent, id_pessoa, usu_cad, tipo_doc, cod_verificacao, data_cad, data_emissao, validade, finalidade_doc, id_assin1, id_assin2, id_assin3, num_processo, obs_doc, tipo_cad } = req.body;
    let SelCdoc = `select max(cod_doc) as cod_doc FROM documentos WHERE id_ent = ${id_ent}`;
    db.query(SelCdoc, (err, result1) => {
        if (err) { res.status(404).json('404!2'), console.log('errLOG', err) }
        else {
            res.set(result1[0])
            let cod_doc = result1[0].cod_doc + 1;
            if (cod_doc) {
                if (!num_processo) { num_processo = ("000000" + cod_doc).slice(-6) + '/' + new Date().getFullYear() }
                if (!validade) { validade = '60' }
                let emissao = 'E';
                let SQLL = "insert into documentos (id_ent,id_pessoa,usu_cad,cod_doc,tipo_doc,cod_verificacao,data_cad,data_emissao,validade,finalidade_doc,id_assin1,id_assin2,id_assin3,num_processo,obs_doc,tipo_cad,emissao) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                db.query(SQLL, [id_ent, id_pessoa, usu_cad, cod_doc, tipo_doc, cod_verificacao, data_cad, data_emissao, validade, finalidade_doc, id_assin1, id_assin2, id_assin3, num_processo, obs_doc, tipo_cad, emissao], (err1, result2) => {
                    if (err1) { res.status(404).json('404!5'), console.log(err1) }
                    else {
                        res.set(result2[0]);
                        let id_doc = result2.insertId;
                        if (id_doc) {
                            let slq2 = `select documentos.id_pessoa,documentos.usu_cad,documentos.cod_doc,documentos.tipo_doc,documentos.cod_verificacao,documentos.data_cad,documentos.data_emissao,documentos.validade,
                        documentos.finalidade_doc, documentos.id_assin1,documentos.id_assin2,documentos.id_assin3,documentos.num_processo,documentos.obs_doc,documentos.tipo_cad,documentos.emissao,
                        pessoas.nome_pessoa,pessoas.fantasia,pessoas.cpf_cnpj,pessoas.insc_muni,pessoas.rua,pessoas.numero,pessoas.bairro,pessoas.cidade,pessoas.uf,pessoas.cep,pessoas.insc_estad from documentos 
                        left join pessoas on documentos.id_pessoa = pessoas.id_pessoa where documentos.id_doc = ${id_doc}`;
                            db.query(slq2, (err, result) => {
                                if (err) { res.status(404).json('404!') }
                                else {
                                    if (!id_assin1) { id_assin1 = 0 }
                                    let sqla1 = `select id_assin,nome,cargo,matricula FROM assinaturas WHERE id_assin = ${id_assin1}`;
                                    db.query(sqla1, (err, assin1) => {
                                        if (err) { res.status(404).json('404!2'), console.log('errLOG', err) }
                                        else { res.set(assin1) }
                                        if (!id_assin2) { id_assin2 = 0 }
                                        let sqla2 = `select id_assin,nome,cargo,matricula FROM assinaturas WHERE id_assin = ${id_assin2}`;
                                        db.query(sqla2, (err, assin2) => {
                                            if (err) { res.status(404).json('404!2'), console.log('errLOG', err) }
                                            else { res.set(assin2) }
                                            if (!id_assin3) { id_assin3 = 0 }
                                            let sqla3 = `select id_assin,nome,cargo,matricula FROM assinaturas WHERE id_assin = ${id_assin3}`;
                                            db.query(sqla3, (err, assin3) => {
                                                if (err) { res.status(404).json('404!2'), console.log('errLOG', err) }
                                                else {
                                                    res.set(assin3)
                                                    res.status(200).json({ result, assin1, assin2, assin3 });
                                                }
                                            })
                                        })
                                    })
                                }
                            });
                        } else { res.status(404).json('Erro ao Cadastrar!') }
                    }
                });
            }
        }
    });
});

app.get("/docGet/:id_doc", async (req, res) => {
    let { id_doc } = req.params;
    let slq2 = `select documentos.id_pessoa,documentos.usu_cad,documentos.cod_doc,documentos.tipo_doc,documentos.cod_verificacao,documentos.data_cad,documentos.data_emissao,documentos.validade,
                        documentos.finalidade_doc, documentos.id_assin1,documentos.id_assin2,documentos.id_assin3,documentos.num_processo,documentos.obs_doc,documentos.tipo_cad,documentos.emissao, 
                        pessoas.nome_pessoa,pessoas.fantasia,pessoas.cpf_cnpj,pessoas.insc_muni,pessoas.rua,pessoas.numero,pessoas.bairro,pessoas.cidade,pessoas.uf,pessoas.cep,pessoas.insc_estad from documentos 
                        left join pessoas on documentos.id_pessoa = pessoas.id_pessoa where id_doc = ${id_doc}`;
    db.query(slq2, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else {
            res.set(result[0])
            console.log('re', result[0].id_assin1); console.log('re2', result[0])
            let id_assin1 = result[0].id_assin1; let id_assin2 = result[0].id_assin2; let id_assin3 = result[0].id_assin3;
            if (!id_assin1) { id_assin1 = 0 }
            let sqla1 = `select id_assin,nome,cargo,matricula FROM assinaturas WHERE id_assin = ${id_assin1}`;
            db.query(sqla1, (err, assin1) => {
                if (err) { res.status(404).json('404!2'), console.log('errLOG', err) }
                else { res.set(assin1) }
                if (!id_assin2) { id_assin2 = 0 }
                let sqla2 = `select id_assin,nome,cargo,matricula FROM assinaturas WHERE id_assin = ${id_assin2}`;
                db.query(sqla2, (err, assin2) => {
                    if (err) { res.status(404).json('404!2'), console.log('errLOG', err) }
                    else { res.set(assin2) }
                    if (!id_assin3) { id_assin3 = 0 }
                    let sqla3 = `select id_assin,nome,cargo,matricula FROM assinaturas WHERE id_assin = ${id_assin3}`;
                    db.query(sqla3, (err, assin3) => {
                        if (err) { res.status(404).json('404!2'), console.log('errLOG', err) }
                        else {
                            res.set(assin3)
                            res.status(200).json({ result, assin1, assin2, assin3, msg: 'Salvo!' });
                        }
                    })
                })
            })
        }
    });

});

app.put("/docPut/:id_doc/:id_pessoa/:emissao/:usu_cad", verify, async (req, res) => {
    let { id_doc, id_pessoa, emissao, usu_cad } = req.params;
    //if (emissao === 'C'){ emissao = 'E' }else{emissao = 'C'}
    emissao === 'C' ? emissao = 'E' : emissao = 'C';
    let data_alt = Date.now();
    let sql1 = `update documentos set emissao = '${emissao}', usu_cad = '${usu_cad}', data_alt = '${data_alt}' where id_doc = ${id_doc}`;
    db.query(sql1, (err) => {
        if (err) { res.status(404).json('404'); console.log(err) }
        else { res.status(200).json({ id_pessoa, msg: "Cancelado!" }) }
    });
}
);
//===========alvaras========//
app.get("/alvaras/:id_ent/:id_pessoa", async (req, res) => {
    const { id_ent, id_pessoa } = req.params;
    let sql1 = `select id_ent,id_alvara,cod_alvara,id_pessoa,id_user,data_emissao,num_processo,tipo_alvara,data_validade,exercicio,num_dam,obs_alvara,recolhimento,
                placa,anofabricacao,chassis,cor_veiculo,modelo_veiculo,obs_veiculo,emissao,id_assin1,id_assin2,id_assin3 from alvaras where id_pessoa = ${id_pessoa} order by id_alvara desc`;
    db.query(sql1, (err, result) => {
        let sql2 = `select assinaturas.id_assin, assinaturas.nome,assinaturas.cargo, assinaturas.matricula from assinaturas where assinaturas.id_ent = ${id_ent} and assinaturas.ativo = 'S'`;
        db.query(sql2, (err, result_assin) => {
            if (err) { console.log(err) }
            else { res.set({ result_assin }); }
            if (err) { res.status(404).json('404!') }
            else { res.status(200).json({ result, result_assin }) }
        });
    });
});

app.get("/alvaraId/:id_alvara", async (req, res) => {
    const { id_alvara } = req.params;
    let slq2 = `select alvaras.id_alvara,alvaras.cod_alvara,alvaras.id_pessoa,alvaras.id_user,alvaras.data_emissao,alvaras.num_processo,alvaras.tipo_alvara,alvaras.data_validade,
            alvaras.exercicio,alvaras.num_dam,alvaras.obs_alvara,alvaras.recolhimento,alvaras.placa,alvaras.anofabricacao,alvaras.chassis,alvaras.cor_veiculo,alvaras.modelo_veiculo,
            alvaras.obs_veiculo,alvaras.emissao,alvaras.id_assin1,alvaras.id_assin2,alvaras.id_assin3, pessoas.cod_cnae_grupo,pessoas.cod_natureza, atividades_cnae_grupos.cod_cnae_grupo,atividades_cnae_grupos.descricao_cnae_grupo, natureza_juridica.natureza from alvaras 
            left join pessoas on alvaras.id_pessoa = pessoas.id_pessoa left join atividades_cnae_grupos on pessoas.cod_cnae_grupo = atividades_cnae_grupos.cod_cnae_grupo left join natureza_juridica on pessoas.cod_natureza = natureza_juridica.cod_natureza where alvaras.id_alvara = ${id_alvara}`;
    db.query(slq2, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else {
            res.set(result[0]);
            let id_assin1 = result[0].id_assin1; let id_assin2 = result[0].id_assin2; let id_assin3 = result[0].id_assin3;
            if (!id_assin1) { id_assin1 = 0 }
            let sqla1 = `select id_assin,nome,cargo,matricula FROM assinaturas WHERE id_assin = ${id_assin1}`;
            db.query(sqla1, (err, assin1) => {
                if (err) { res.status(404).json('404!2'), console.log('errLOG', err) }
                else { res.set(assin1) }
                if (!id_assin2) { id_assin2 = 0 }
                let sqla2 = `select id_assin,nome,cargo,matricula FROM assinaturas WHERE id_assin = ${id_assin2}`;
                db.query(sqla2, (err, assin2) => {
                    if (err) { res.status(404).json('404!2'), console.log('errLOG', err) }
                    else { res.set(assin2) }
                    if (!id_assin3) { id_assin3 = 0 }
                    let sqla3 = `select id_assin,nome,cargo,matricula FROM assinaturas WHERE id_assin = ${id_assin3}`;
                    db.query(sqla3, (err, assin3) => {
                        if (err) { res.status(404).json('404!2'), console.log('errLOG', err) }
                        else {
                            res.set(assin3)
                            res.status(200).json({ result, assin1, assin2, assin3, msg: 'Salvo!' });
                        }
                    })
                })
            })
        }
    });

});
app.post("/alvaraPost", async (req, res) => {
    let { id_ent, id_pessoa, id_user, data_emissao,data_cad, num_processo, tipo_alvara, data_validade, exercicio, num_dam, obs_alvara,
        recolhimento, placa, anofabricacao, chassis, cor_veiculo, modelo_veiculo, obs_veiculo, emissao, id_assin1, id_assin2, id_assin3 } = req.body; console.log('22', req.body)

    let sql = `select exercicio FROM alvaras WHERE id_pessoa = ${id_pessoa} and exercicio = ${exercicio} and emissao = 'E'`;
    db.query(sql, (err, result) => {
        let resSelc = result.length;
        const selectAlv = () => {
            let slq2 = `select id_ent,id_alvara,cod_alvara,id_pessoa,id_user,data_emissao,data_cad,num_processo,tipo_alvara,data_validade,exercicio,num_dam,obs_alvara,recolhimento,placa,anofabricacao,chassis,cor_veiculo,modelo_veiculo,obs_veiculo,emissao,id_assin1,id_assin2,id_assin3 from alvaras where id_pessoa = ${id_pessoa} order by id_alvara desc`;
            db.query(slq2, (err, result) => {
                if (err) { res.status(404).json('404!') }
                else {
                    if (!resSelc) {
                        res.status(201).json({ result, msg: 'Salvo!' })
                    } else {
                        res.status(203).json({ result, msg: `Alvará ${exercicio} Já incluído!` })
                    }
                }
            });
        }
        if (!resSelc) {
            let SelCod = `select max(cod_alvara) as cod_alvara FROM alvaras WHERE id_ent = ${id_ent}`;
            db.query(SelCod, (err, result) => {
                if (err) { res.status(404).json('404!2'), console.log('errLOG', err) }
                else { res.set(result[0]) }

                let cod_alvara = result[0].cod_alvara + 1;
                if (cod_alvara) {
                    if (!num_processo) { num_processo = ("000000" + cod_alvara).slice(-6) + '/' + new Date().getFullYear() }
                    let sql2 = `insert into alvaras (id_ent,cod_alvara,id_pessoa,id_user,data_emissao,data_cad,num_processo,tipo_alvara,data_validade,exercicio,num_dam,obs_alvara,
                        recolhimento,placa,anofabricacao,chassis,cor_veiculo,modelo_veiculo,obs_veiculo,emissao,id_assin1,id_assin2,id_assin3) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                    db.query(sql2, [id_ent, cod_alvara, id_pessoa, id_user, data_emissao.split('/').reverse().join('-'),data_cad, num_processo, tipo_alvara, data_validade, exercicio, num_dam, obs_alvara,
                        recolhimento, placa, anofabricacao, chassis, cor_veiculo, modelo_veiculo, obs_veiculo, emissao, id_assin1, id_assin2, id_assin3], (err1, result) => {
                            if (err1) { res.status(404).json('404!'), console.log(err1) }
                            else {
                                selectAlv();
                            }
                        });
                }
            })
        } else { selectAlv() }
    })
}
);

// app.post("/alvaraPost", async (req, res) => {
//     const { id_ent, id_pessoa, id_user, data_emissao, num_processo, tipo_alvara, data_validade, exercicio, num_dam, obs_alvara,
//         recolhimento, placa, anofabricacao, chassis, cor_veiculo, modelo_veiculo, obs_veiculo, emissao } = req.body; console.log('22', req.body)

//     let sql = `select exercicio FROM alvaras WHERE id_pessoa = ${id_pessoa} and exercicio = ${exercicio} and emissao = 'E'`;
//     db.query(sql, (err, result) => {
//         let resSelc = result;
//         const selectAlv = () => {
//             let slq2 = `select id_ent,id_alvara,cod_alvara,id_pessoa,id_user,data_emissao,num_processo,tipo_alvara,data_validade,exercicio,num_dam,obs_alvara,recolhimento,placa,anofabricacao,chassis,cor_veiculo,modelo_veiculo,obs_veiculo,emissao from alvaras where id_pessoa = ${id_pessoa} order by id_alvara desc`;
//             db.query(slq2, (err, result) => {
//                 if (err) { res.status(404).json('404!') }
//                 else {
//                     if (!resSelc) {
//                         res.status(201).json({ result, msg: 'Salvo!' })
//                     } else {
//                         res.status(203).json({ result, msg: 'Alvará Já Existente!' })
//                     }
//                 }
//             });
//         }
//         if (!resSelc) {
//             let SelCod = `select max(cod_alvara) as cod_alvara FROM alvaras WHERE id_ent = ${id_ent}`;
//             db.query(SelCod, (err, result) => {
//                 if (err) { res.status(404).json('404!2'), console.log('errLOG', err) }
//                 else { res.set(result[0]) }

//                 let cod_alvara = result[0].cod_alvara + 1;
//                 if (cod_alvara) {
//                     let sql2 = `insert into alvaras (id_ent,cod_alvara,id_pessoa,id_user,data_emissao,num_processo,tipo_alvara,data_validade,exercicio,num_dam,obs_alvara,
//                         recolhimento,placa,anofabricacao,chassis,cor_veiculo,modelo_veiculo,obs_veiculo,emissao) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
//                     db.query(sql2, [id_ent, cod_alvara, id_pessoa, id_user, data_emissao, num_processo, tipo_alvara, data_validade, exercicio, num_dam, obs_alvara,
//                         recolhimento, placa, anofabricacao, chassis, cor_veiculo, modelo_veiculo, obs_veiculo, emissao], (err1, result) => {
//                             if (err1) { res.status(404).json('404!'), console.log(err1) }
//                             else {
//                                 selectAlv();
//                             }
//                         });
//                 }
//             })
//         } else { selectAlv() }
//     })
// }
// );

app.get("/alvaras/:id_pessoa", verify, (req, res) => {
    const { id_pessoa } = req.params;
    let SQL = `select id_ent,id_alvara,id_pessoa,id_user,data_emissao,num_processo,tipo_alvara,data_validade,exercicio,num_dam,obs_alvara,recolhimento,placa,anofabricacao,chassis,cor_veiculo,modelo_veiculo,obs_veiculo,emissao from alvaras where id_pessoa = ${id_pessoa} order by id_alvara desc`;
    db.query(SQL, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else res.send(result);
    });
});

app.delete("/delAlvara/:id/:id_pessoa", async (req, res) => {
    const { id, id_pessoa } = req.params;
    let sql = `update alvaras set emissao = 'C' where id_alvara = ${id}`;
    db.query(sql, (err1, result) => {
        if (err1) { res.status(404).json('404!'), console.log(err1) }
        else res.status(200).json({ id_pessoa });
    })
}
);
//===========Assinaturas========//
app.post("/assinaturas/", verify, async (req, res) => {
    //const { id_user } = req.params; 
    const { id_ent, nome, cargo, matricula, obs_assin } = req.body;;
    let data_cad = new Date().toLocaleDateString('pt-br');
    let ativo = 'S';
    let SQLL = "insert into assinaturas (id_ent, nome, cargo, matricula, ativo,obs_assin ) values (?,?,?,?,?,?)";
    db.query(SQLL, [id_ent, nome, cargo, matricula, ativo, obs_assin, data_cad], (err1, result) => {
        if (err1) { res.status(404).json('404!5'), console.log(err1) }
        else { res.status(201).json({ id: result.insertId, msg: 'Salvo!' }) }
    });
});

app.put("/assinaturas", verify, async (req, res) => {
    const { id_ent, id_assin, nome, cargo, matricula, ativo, obs_assin } = req.body;
    let sql1 = `update assinaturas set id_ent = '${id_ent}', nome = '${nome}',cargo = '${cargo}',matricula = '${matricula}', ativo = '${ativo}',obs_assin = '${obs_assin}' where id_assin = ${id_assin}`;
    db.query(sql1, (err, result) => {
        if (err) { res.status(404).json('404'); console.log(err) }
        else { res.status(200).json("Alterado!") }
    });
}
);

app.get("/assinaturas/:id_ent", verify, (req, res) => {
    const { id_ent } = req.params;
    let SQL = `select * from assinaturas where id_ent = ${id_ent} order by data_cad desc`;
    db.query(SQL, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.send(result); }
    });
});
app.get("/assin_Ativo/:id_ent", verify, (req, res) => {
    const { id_ent } = req.params;
    let SQL = `select * from assinaturas where id_ent = ${id_ent} and ativo = 'S' order by nome`;
    db.query(SQL, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.send(result); }
    });
});

app.get("/assinId/:id_assin", verify, (req, res) => {
    const { id_assin } = req.params;
    let SQL = `select * from assinaturas where id_assin = ${id_assin}`;
    db.query(SQL, (err, result) => {
        if (err) { res.status(404).json('404!') }
        res.status(200).json({ result });
    });
});

app.delete("/delAssin/:id", verify, (req, res) => {
    const { id } = req.params;
    let SQL = `delete from assinaturas where id_assin = ${id}`;
    db.query(SQL, (err) => {
        if (err) { res.status(405).json('Não é Possivel excluir: Registro Chave') }
        else { res.status(200).json('Excluído!') }
    });

});
//===========logradouros========//
app.post("/logradouro/", verify, async (req, res) => {
    //const { id_user } = req.params; 
    const { id_ent, id_user, nome_log, bairro_log, cidade_log, valor_m2, aliq_terreno, aliq_construcao, ft_terreno, ft_construcao, cep_log, uf_log, usu_cad, data_cad, obs} = req.body;
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.set(result[0]) }
        role = result[0].role;
        if (role === 1) {
            let SelCodLog = `select max(cod_log) as cod_log FROM logradouros WHERE id_ent = ${id_ent}`;
            db.query(SelCodLog, (err, result) => {
                if (err) { res.status(404).json('404!2'), console.log('errLOG', err) }
                else { res.set(result[0]) }
                let cod_log = result[0].cod_log + 1;
                if (cod_log) {
                    let SQLL = "insert into logradouros (id_ent, id_user,cod_log, nome_log,cep_log, bairro_log, cidade_log, uf_log,valor_m2, aliq_terreno, aliq_construcao,ft_terreno,ft_construcao, data_cad,obs, usu_cad) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                    db.query(SQLL, [id_ent, id_user, cod_log, nome_log, cep_log, bairro_log, cidade_log, uf_log, valor_m2, aliq_terreno, aliq_construcao, ft_terreno, ft_construcao, data_cad,obs, usu_cad], (err1, result1) => {
                        if (err1) { res.status(404).json('404!5'), console.log(err1) }
                        else { res.status(201).json({ cod_log, msg: 'Salvo!' }) }

                    });
                }
            });
        } else {
            res.status(401).json('Usuário Não autorizado!');
        }
    });
});

app.put("/logradouro", verify, async (req, res) => {
    const { id_log, id_user, nome_log, bairro_log, cidade_log, valor_m2, aliq_terreno, aliq_construcao, ft_terreno, ft_construcao, cep_log, uf_log, usu_cad, data_alt,obs } = req.body;
    //const {data_cad} = Date.now();  
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!'), console.log(err) }
        else { res.set(result[0]) }
        role = result[0].role;
        if (role === 1) {
            let sql1 = `update logradouros set nome_log = '${nome_log}', bairro_log = '${bairro_log}',cidade_log = '${cidade_log}', valor_m2 = '${valor_m2}', aliq_terreno = '${aliq_terreno}', obs = '${obs}',aliq_construcao = '${aliq_construcao}',
            ft_terreno = '${ft_terreno}',ft_construcao = '${ft_construcao}',cep_log = '${cep_log}', uf_log = '${uf_log}', usu_cad = '${usu_cad}', data_alt = '${data_alt}' where id_log = ${id_log}`;
            db.query(sql1, (err, result) => {
                if (err) { res.status(404).json('404'); console.log(err) }
                else { res.status(200).json("Alterado!") }
            });
        } else {
            res.status(401).json('Usuário Não autorizado!');
        }
    });
}
);

app.get("/logradouros/:id_ent", verify, (req, res) => {
    const { id_ent } = req.params;
    let SQL = `select id_ent, id_log,cod_log, nome_log, bairro_log,cidade_log, valor_m2, aliq_terreno, aliq_construcao,ft_terreno,ft_construcao,cep_log, uf_log, usu_cad, data_cad,data_alt from logradouros where id_ent = ${id_ent} order by cod_log desc`;
    db.query(SQL, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.send(result); }
    });
});

app.get("/logradId/:id_log", verify, (req, res) => {
    const { id_log } = req.params;
    let SQL = `select id_ent, id_log,cod_log, nome_log, bairro_log,cidade_log, valor_m2, aliq_terreno, aliq_construcao,ft_terreno,ft_construcao,cep_log, uf_log, usu_cad, data_cad,obs, data_alt from logradouros where id_log = ${id_log}`;
    db.query(SQL, (err, result) => {
        if (err) { res.status(404).json('404!') }
        res.status(200).json({ result });
    });
});

app.delete("/delLograd/:id_log/:id_user", verify, (req, res) => {
    const { id_log, id_user } = req.params;
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.set(result[0]) }
        role = result[0].role;
        if (role === 1) {
            let SQL = `delete from logradouros where id_log = ${id_log}`;
            db.query(SQL, (err) => {
                if (err) { res.status(405).json('Não é Possivel excluir: Registro Chave') }
                else { res.status(200).json('Excluído!') }
            });
        } else {
            res.status(401).json('Usuário Não autorizado!');
        }
    });
});
//===========loteamento========//
app.post("/loteamento/", verify, async (req, res) => {
    //const { id_user } = req.params; 
    const { id_user, id_ent, nome_lote, bairro_lote, cidade_lote, data_cad, usu_cad } = req.body;
    let Sql = `select role from usuarios where id_user = ${id_user}`;

    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.set(result[0]) }
        role = result[0].role;
        if (role === 1) {
            let SelCodLog = `select max(cod_lote) as cod_lote FROM loteamentos WHERE id_ent = ${id_ent}`;
            db.query(SelCodLog, (err, result) => {
                if (err) { res.status(404).json('404!'), console.log('errLOG', err) }
                else { res.set(result[0]) }
                let cod_lote = result[0].cod_lote + 1;
                if (cod_lote) {
                    msg = "Salvo!";
                    let SQLL = "insert into loteamentos (id_user, id_ent, cod_lote, nome_lote,  bairro_lote, cidade_lote,data_cad, usu_cad) values (?,?,?,?,?,?,?,?)";
                    db.query(SQLL, [id_user, id_ent, cod_lote, nome_lote, bairro_lote, cidade_lote, data_cad, usu_cad], (err1, result1) => {
                        if (err1) { res.status(404).json('404!5'), console.log(err1) }
                        else { res.status(201).send({ result1, msg }) }
                    });
                }
            });
        } else {
            res.status(401).json('Usuário Não autorizado!');
        }
    });
});

app.put("/lotePut", verify, async (req, res) => {
    const { id_user, id_lote, nome_lote, bairro_lote, cidade_lote, data_alt, usu_cad } = req.body;
    //const {data_cad} = Date.now();  
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!'), console.log(err) }
        else { res.set(result[0]) }
        role = result[0].role;
        if (role === 1) {
            let sql1 = `update loteamentos set nome_lote = '${nome_lote}', bairro_lote = '${bairro_lote}',cidade_lote = '${cidade_lote}', usu_cad = '${usu_cad}', data_alt = '${data_alt}' where id_lote = ${id_lote}`;
            db.query(sql1, (err, result) => {
                if (err) { res.status(404).json('404'); console.log(err) }
                else { res.status(200).json("Alterado!") }
            });
        } else {
            res.status(401).json('Usuário Não autorizado!');

        }
    });
}
);
app.get("/loteamentos/:id_ent", verify, (req, res) => {
    const { id_ent } = req.params;
    let SQL = `select id_user, id_ent, id_lote, cod_lote, nome_lote, bairro_lote, cidade_lote,data_cad, data_alt, usu_cad from loteamentos where id_ent = ${id_ent}`;
    db.query(SQL, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.send(result); }
    });
});

app.get("/loteId/:id_lote", (req, res) => {
    const { id_lote } = req.params;
    let SQL = `select id_user, id_ent, id_lote, cod_lote, nome_lote, bairro_lote, cidade_lote,data_cad, data_alt, usu_cad from loteamentos where id_lote = ${id_lote}`;
    db.query(SQL, (err, result) => {
        if (err) { res.status(404).json('404!') }
        res.status(200).json({ result });
    });
});

app.delete("/delLote/:id_user/:id_lote", verify, (req, res) => {
    const { id_user, id_lote } = req.params;
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('4049999!') }
        else { res.set(result[0]) }
        role = result[0].role;
        if (role === 1) {
            let SQL = `delete from loteamentos where id_lote = ${id_lote}`;
            db.query(SQL, (err) => {
                if (err) { res.status(405).json('Não é Possivel excluir: Registro Chave') }
                else { res.status(200).json('Excluído!') }
            });
        } else {
            res.status(401).json('Usuário Não autorizado!');
        }
    });
});

//===========dividas========//
app.post("/dividas", async (req, res) => {
    let { id_ent, exercicio, inscricao, id_imovel, id_pessoa, cod_pessoa, valor_original, valor_juros, valor_multa, valor_corr, desconto, valor_total, id_user } = req.body;
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { //res.set(result[0])
            role = result[0].role;
            if (role === 1) {
                let sql = `select exercicio FROM dividas WHERE id_imovel = ${id_imovel} and exercicio = ${exercicio}`;
                db.query(sql, (err, result) => {
                    let resSelc = result.length;
                    if (!resSelc) {
                        let SelCod = `select max(cod_divida) as cod_divida FROM dividas WHERE id_ent = ${id_ent}`;
                        db.query(SelCod, (err, result) => {
                            if (err) { res.status(404).json('404'), console.log('errLOG', err) }
                            else {
                                res.set(result[0]);
                                let cod_divida = result[0].cod_divida + 1;
                                if (cod_divida) {
                                    let cod_rec = '3000'; let pago = 'N'; let sobjudice = 'N'; let parcelado = 'N';
                                    let nossonum = exercicio + ("0000" + cod_rec).slice(-4) + ("000000" + cod_divida).slice(-6);
                                    let SQL2 = "insert into dividas (id_ent, cod_divida, exercicio,inscricao,id_imovel, valor_original, valor_juros,valor_multa,valor_corr,desconto, valor_total, sobjudice, parcelado,pago,nossonum,id_user) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                                    db.query(SQL2, [id_ent, cod_divida, exercicio, inscricao, id_imovel, valor_original, valor_juros, valor_multa, valor_corr, desconto, valor_total, sobjudice, parcelado, pago, nossonum, id_user], (err1, result0) => {
                                        if (err1) { res.status(404).json('Erro ao Salvar!'), console.log(err1) }
                                        else {
                                            res.status(201).json({ id_imovel, msg: 'Incluida com sucesso!' })
                                        }
                                    });
                                }
                            }
                        })
                    } else { res.status(203).json({ id_imovel, msg: `Exercício ${exercicio}, já Incluido!` }) }
                })
            } else {
                res.status(401).json('Usuário Não autorizado!');
            }
        }
    });
});

app.post("/dividasAuto", async (req, res) => {
    const { id_ent, inscricao, id_imovel, cod_pessoa, valor_original, id_user } = req.body;
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else {
            res.set(result[0]);
            role = result[0].role;
            if (role === 1) {
                let Sql1 = `select dividas.exercicio as exercicio from dividas WHERE dividas.id_imovel = ${id_imovel} limit 1`;
                db.query(Sql1, (err, result1) => {
                    let resSelc = result1.length;
                    if (resSelc) {
                        res.status(203).send({ id_imovel, msg: 'Exercícios, já Incluido!' });
                    } else {
                        let Sql2 = `select entidades.exercicio as exercicio from entidades WHERE entidades.id_ent = ${id_ent}`;
                        db.query(Sql2, (err, result2) => {
                            if (err) { res.status(404).json('4043!'), console.log(err) }
                            let exercicio = result2[0].exercicio;
                            let cod_rec = '3000';
                            let i = 0;
                            let SelCod = `select max(cod_divida) as cod_divida FROM dividas WHERE id_ent = ${id_ent}`;
                            db.query(SelCod, (err, result) => {
                                if (err) { res.status(404).json('404!2'), console.log('errLOG', err) }
                                else { //res.set(result[0]); 
                                    let cod_divida = result[0].cod_divida;
                                    do {
                                        exercicio = exercicio - 1;
                                        cod_divida = cod_divida + 1;
                                        let nossonum = exercicio + ("0000" + cod_rec).slice(-4) + ("000000" + cod_divida).slice(-6);
                                        let sql3 = `insert into dividas (id_ent,cod_divida,id_imovel,inscricao, exercicio,valor_original,valor_total, sobjudice, parcelado,pago,nossonum,id_user) 
                                    values('${id_ent}','${cod_divida}','${id_imovel}','${inscricao}','${exercicio}','${valor_original}','${valor_original}','N','N','N','${nossonum}','${id_user}')`;
                                        db.query(sql3, (err, result3) => {
                                            if (err) { res.status(404).json('404!'); console.log(err) }
                                            res.set(result3[0])
                                        });
                                        i++;
                                    }
                                    while (i < 5)
                                    res.status(201).send({ id_imovel, msg: 'Dividas Geradas!' });
                                }
                            });
                        });
                    }

                });
            } else {
                res.status(401).json('Usuário Não autorizado!');
            }
        }
    });
});

app.get("/dividas/:id_imovel", verify, (req, res) => {
    const { id_imovel } = req.params;
    let SQL = `select id_divida, cod_divida, exercicio, valor_original, valor_juros,valor_multa,valor_corr,desconto, valor_total, sobjudice, parcelado,pago,nossonum, data_cad, data_alt from dividas where id_imovel = ${id_imovel} order by exercicio asc`;
    db.query(SQL, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.send(result); }
    });
});
app.delete("/delDivida/:id_user/:id_divida/:id_imovel", verify, (req, res) => {
    const { id_user, id_divida, id_imovel } = req.params;
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.set(result[0]) }
        role = result[0].role;
        if (role === 1) {
            let SQL = `delete from dividas where id_divida = ${id_divida}`;
            db.query(SQL, (err) => {
                if (err) { res.status(405).json('Não é Possivel excluir: Registro Chave') }
                else {
                    let SQL = `delete from lancmtos_detalhado where lancmtos_detalhado.numero_proc = ${id_divida} and lancmtos_detalhado.cod_rec = '3000'`;
                    db.query(SQL, (err) => {
                        if (err) { res.status(404).json('erro 404!') }
                        else {
                            let SQL = `delete from lancmtos where lancmtos.numero_proc = ${id_divida} and lancmtos.cod_rec = '3000'`;
                            db.query(SQL, (err) => {
                                if (err) { res.status(404).json('erro 404!2') }
                                else {
                                    res.json({ id_imovel, msg: 'Excluído!' })
                                }
                            })


                        }
                    })


                }
            })
        } else {
            res.status(401).json('Usuário Não autorizado!');
        }
    });
});

app.get("/calctESTE/", async (req, res) => {
    // const [dataVenc, dataPag, valorTitulo, despesas, diasEmAtraso, juros, valorTotal] = 
    // document.querySelectorAll("'31/01/2023', '31/12/2023', 100, 2, 0, 0, 0");

    let dataVenc = '01/01/2024';
    // var currentDate = new Date()
    //                                 var day = currentDate.getDate()
    //                                 var month = currentDate.getMonth() + 1
    //                                 var year = currentDate.getFullYear()
    // let dataPag = month + "/" + day + "/" + year;
    let dataPag = new Date().toLocaleDateString('pt-BR');
    //let dataPag = new Date().toLocaleDateString("en", {year:"numeric", day:"2-digit", month:"2-digit"}); 
    let valorTitulo = 100;
    let despesas = '8';
    let diasEmAtraso = 0; let juros = 0; multa = 0; correcao = 0; let valorTotal = 0;

    //d1 = new Date(dataVenc); d2 = new Date(dataPag);

    //const diasAtraso = (d1 - d2) / (1000 * 3600 * 24); 
    const diasAtraso = (new Date(dataPag).getTime() - new Date(dataVenc).getTime()) / (1000 * 3600 * 24);

    const vTit = valorTitulo;
    //let jurosCalculados = 0;

    if (diasAtraso > 0) { //apenas calcula juros quando há dias em atraso
        diasEmAtraso = diasAtraso;
        juros = vTit * 0.05 / 30 * diasAtraso;
        multa = vTit * 2 / 100;
        //correcao = vTit * 2 * 12 / 100;
        atrasoCorr = diasAtraso / 30;
        correcao = vTit * 1.5 * atrasoCorr;
    }
    else { //se não tem dias em atraso os juros continuam a 0
        diasEmAtraso = 0;
    }

    //juros.values = jurosCalculados.toFixed(2);
    valorTotal = vTit + juros + multa;

    console.log(dataVenc, dataPag);
    console.log('Dias Atraso', diasEmAtraso)
    console.log('juros', juros.toFixed(2));
    console.log('multa', multa.toFixed(2));
    console.log('correcao', correcao.toFixed(2));
    //console.log('correcao',correcao2.toFixed(2));
    console.log('valoBase', vTit);
    console.log('valorTotal', valorTotal.toFixed(2));
});
app.put("/calcDivida/:id_imovel", verify, async (req, res) => {
    const { id_imovel } = req.params;
    let Sql1 = `select dividas.id_divida from dividas WHERE dividas.id_imovel = ${id_imovel} and dividas.pago = 'N' order by dividas.exercicio asc`;
    db.query(Sql1, (err, result0) => {
        if (err) { res.status(404).json('4042!'), console.log(err) }
        else { //res.set(result0);
            const arrDividas = result0;
            //let id_imovel = 0; 
            let i = 0;
            do {
                let id_divida = arrDividas[i].id_divida;

                let Sql2 = `select dividas.valor_original, dividas.exercicio from dividas WHERE dividas.id_divida = ${id_divida}`;
                db.query(Sql2, (err, result2) => {
                    if (err) { res.status(404).json('4043!'), console.log(err) }
                    else { //res.set(result2[0]);           
                        let valor_original = result2[0].valor_original;
                        let exercicio = result2[0].exercicio;
                        if (result2[0]) {
                            let dataVenc = `01/01/${exercicio}`;
                            let dataAtual = new Date().toLocaleDateString("en", { year: "numeric", day: "2-digit", month: "2-digit" });

                            const diasAtraso = (new Date(dataAtual).getTime() - new Date(dataVenc).getTime()) / (1000 * 3600 * 24);

                            let valor_juros = parseFloat(valor_original) * 0.033 / 100 * diasAtraso;
                            let valor_multa = parseFloat(valor_original) * 0.02 / 100 * diasAtraso;
                            let valor_corr = parseFloat(valor_original) * 0.05 / 100 * diasAtraso;

                            //V_VALOR_JUROS = COALESCE(V_VALOR_ORIGINAL * (DATEDIFF(DAY, V_DATA_VENCIMENTO, Current_Date))*0.033/100, 0);

                            let valor_total = valor_original + valor_juros + valor_multa + valor_corr;

                            let sql3 = `update dividas set dividas.valor_juros = ${valor_juros}, dividas.valor_multa = '${valor_multa}', dividas.valor_corr = '${valor_corr}', 
                                dividas.desconto =  0, dividas.valor_total = '${valor_total}' where dividas.id_divida = ${id_divida}`;
                            db.query(sql3, (err, result3) => {

                                if (err) { res.status(404).json('404!'); console.log(err) }
                                else { res.set(result3[0]) }
                                // else{res.status(201).json({ id_imovel, msg:'Calculado' })} 
                            });
                        } else { console.log('sem dados') }
                    }
                });


                i++; console.log('Calculado:', id_divida)
            }
            while (i < arrDividas.length); console.log('-----FIM------')
            res.status(201).json({ id_imovel, msg: 'Calculado' })
        }
    });
});

app.put("/descontoDivida/:id_imovel/:aliq_desconto", verify, async (req, res) => {
    const { id_imovel, aliq_desconto } = req.params;
    let Sql1 = `select dividas.id_divida from dividas WHERE dividas.id_imovel = ${id_imovel} and dividas.pago = 'N' order by dividas.exercicio asc`;
    db.query(Sql1, (err, result0) => {
        if (err) { res.status(404).json('4042!'), console.log(err) }
        else { //res.set(result0);
            const arrDividas = result0;
            //let id_imovel = 0; 
            let i = 0;
            do {
                let id_divida = arrDividas[i].id_divida;
                // let total1 = parseFloat(valor_total) * aliq_desconto / 100; 
                let sql3 = `update dividas set  dividas.desconto = dividas.valor_total * ${aliq_desconto} / 100, dividas.valor_total = (dividas.valor_total - (dividas.valor_total * ${aliq_desconto} / 100))
                                where dividas.id_divida = ${id_divida}`;
                db.query(sql3, (err, result3) => {
                    if (err) { res.status(404).json('4044!'); console.log(err) }
                    else { res.set(result3[0]) }
                    // else{res.status(201).json({ id_imovel, msg:'Calculado' })} 
                });
                i++; console.log('Calculado:', id_divida);
            }
            while (i < arrDividas.length); console.log('-----FIM------')
            res.status(201).json({ id_imovel, msg: 'Desconto realizado!' })
        }
    });
});

//===========receitas========//
app.get("/receitas/:id_ent", verify, (req, res) => {
    const { id_ent } = req.params;
    let SQL = `select id_ent, id_rec, id_user, cod_rec, grupo,des_rec,cod_orc,cod_trib,cod_fonte,valor,obs,aliq,situacao,usu_cad,data_cad from receitas where id_ent = ${id_ent} order by cod_rec`;
    db.query(SQL, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.send(result); }
    });
});
app.get("/recAtivas/:id_ent/:grp", verify, (req, res) => {
    const { id_ent, grp } = req.params;
    let SQL = `select id_rec, cod_rec, des_rec,valor from receitas where id_ent = ${id_ent} and grupo = ${grp} and situacao = 1 order by des_rec`;
    db.query(SQL, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.send(result); }
    });
});
app.get("/receitaId/:id_rec", verify, (req, res) => {
    const { id_rec } = req.params;
    let SQL = `select id_ent, id_rec, id_user, cod_rec, grupo,des_rec,cod_orc,cod_trib,cod_fonte,valor,obs,aliq,situacao,usu_cad, data_cad from receitas where id_rec = ${id_rec}`;
    db.query(SQL, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.status(200).json({ result }); }
    });
});

app.post("/receita/", verify, async (req, res) => {
    const { id_ent, id_user, cod_rec, grupo, des_rec, cod_orc, cod_trib, cod_fonte, valor, obs, aliq, situacao, usu_cad, data_cad } = req.body;
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.set(result[0]) }
        role = result[0].role;
        if (role === 1) {
            let sql = `select cod_rec from receitas where id_ent = ${id_ent} and cod_rec = ${cod_rec}`;
            db.query(sql, (err, result) => {
                let resSelc = result.length;
                if (!resSelc) {
                    let SQLL = "insert into receitas (id_ent, id_user, cod_rec, grupo,des_rec,cod_orc,cod_trib,cod_fonte,valor,obs,aliq,situacao,usu_cad, data_cad) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                    db.query(SQLL, [id_ent, id_user, cod_rec, grupo, des_rec, cod_orc, cod_trib, cod_fonte, valor, obs, aliq, situacao, usu_cad, data_cad], (err1, result1) => {
                        if (err1) { res.status(404).json('404!5'), console.log(err1) }
                        else { res.status(201).json({ result1, msg: 'Salvo!' }) }
                    });
                } else {
                    res.status(203).json({ msg: `Receita: ${cod_rec}, Já Cadastrada!` })
                }
            });
        } else {
            res.status(401).json('Usuário Não autorizado!');
        }
    });
});

app.put("/receita", verify, async (req, res) => {
    const { id_rec, id_user, cod_rec, des_rec, grupo, cod_orc, cod_trib, cod_fonte, valor, obs, aliq, situacao, usu_cad, data_alt } = req.body;
    //const {data_cad} = Date.now();  
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.set(result[0]) }
        role = result[0].role;
        if (role === 1) {
            let sql1 = `update receitas set cod_rec = '${cod_rec}', des_rec = '${des_rec}', grupo = '${grupo}', cod_orc= '${cod_orc}',cod_trib= '${cod_trib}',cod_fonte= '${cod_fonte}',valor= '${valor}',obs= '${obs}',aliq= '${aliq}',situacao= '${situacao}',id_user= '${id_user}',usu_cad= '${usu_cad}', data_alt= '${data_alt}',  usu_cad = '${usu_cad}', data_alt = '${data_alt}' where id_rec = ${id_rec}`;
            db.query(sql1, (err, result) => {
                if (err) { res.status(404).json('404'); console.log(err) }
                else { res.status(200).json("Alterado!") }
            });
        } else {
            res.status(401).json('Usuário Não autorizado!');
        }
    });
}
);
app.delete("/delRec/:id_rec/:id_user", verify, (req, res) => {
    const { id_user, id_rec } = req.params;
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.set(result[0]) }
        role = result[0].role;
        if (role === 1) {
            let SQL = `delete from receitas where id_rec = ${id_rec}`;
            db.query(SQL, (err) => {
                if (err) { res.status(405).json('Não é Possivel excluir: Registro Chave') }
                else { res.status(200).json('Excluído!') }
            });
        } else {
            res.status(401).json('Usuário Não autorizado!');
        }
    });
});
//===========lancmtos========//
//ATENÇÃO! SE A CHAMADA FICAR LENTA, REMOVER ESSES DOIS DELETES COMEÇO DA CONSULTA.
//retorna todos os lançamentos da pessoa pelo ID, antes se faz um delete em lançamentos imcompletos.
app.get('/lancmtosAll/:id_pessoa', async (req, res) => {
    const { id_pessoa } = req.params;
    let delLancDt = `delete from lancmtos_detalhado where lancmtos_detalhado.cod_lancdet in (
        select lancmtos.id_lanc from lancmtos where lancmtos.nossonum is null and lancmtos.id_pessoa = ${id_pessoa})`;
    db.query(delLancDt, (err, resultt) => {
        if (err) { console.log('1', err) } else {
            let delLanc = `delete from lancmtos where lancmtos.nossonum is null and lancmtos.id_pessoa = ${id_pessoa}`;
            db.query(delLanc, () => {

                let sqlLanc = `select lancmtos.id_lanc,lancmtos.cod_lanc, lancmtos.id_pessoa, lancmtos.cod_rec, receitas.des_rec, lancmtos.data_lanc,lancmtos.valor_real,lancmtos.valor_rec,
    lancmtos.data_venc,lancmtos.pago,lancmtos.data_pgmto,lancmtos.data_venc, lancmtos.situacao from lancmtos 
    left join receitas on lancmtos.id_rec = receitas.id_rec where lancmtos.id_pessoa = ${id_pessoa}`;
                db.query(sqlLanc, (err, boletos) => {
                    if (err) { res.status(404).json('404!2') }
                    else { res.set({ boletos }); }

                    let Sqldt = `select lancmtos_detalhado.id_lancdet,lancmtos_detalhado.cod_lancdet, lancmtos_detalhado.cod_rec,receitas.des_rec, lancmtos_detalhado.valor_real from lancmtos_detalhado 
        left join receitas on lancmtos_detalhado.id_rec = receitas.id_rec where lancmtos_detalhado.id_pessoa = ${id_pessoa}`;
                    db.query(Sqldt, (err, lanc_Dt) => {
                        if (err) { res.status(404).json('404!2') }
                        else { res.set({ lanc_Dt }); }

                        const sortKey = "id_lanc";
                        boletos.sort((a, b) => {
                            if (a[sortKey] < b[sortKey]) {
                                return -1;
                            }
                            if (a[sortKey] > b[sortKey]) {
                                return 1;
                            }
                            return 0;
                        })
                        let lanc_Map = boletos.reduce((map, row) => {
                            key = row["id_lanc"];
                            map[key] = row;
                            return map;
                        }, {})

                        let resultMap = lanc_Dt.reduce((map, row) => {
                            let key = row["cod_lancdet"];
                            if (map[key]) {
                                if (!map[key].lancmtosDt) map[key].lancmtosDt = [];
                                map[key].lancmtosDt.push(row);
                            }
                            return map;
                        }, lanc_Map)

                        let result = Object.values(resultMap);
                        res.status(200).json({ result });
                    });
                });
            });
        }
    });
});

//Chamada para listar lançamentos dos tumulos
app.get('/lancmtosAllTum/:id_pessoa', async (req, res) => {
    const { id_pessoa } = req.params;
    let delLancDt = `delete from lancmtos_detalhado where lancmtos_detalhado.cod_lancdet in (
        select lancmtos.id_lanc from lancmtos where lancmtos.nossonum is null and lancmtos.id_pessoa = ${id_pessoa})`;
    db.query(delLancDt, (err, resultt) => {
        if (err) { console.log('1', err) } else {
            let delLanc = `delete from lancmtos where lancmtos.nossonum is null and lancmtos.id_pessoa = ${id_pessoa}`;
            db.query(delLanc, () => {

                let sqlLanc = `select lancmtos.id_lanc,lancmtos.cod_lanc, lancmtos.id_pessoa, lancmtos.cod_rec,lancmtos.desc_lanc, receitas.des_rec, lancmtos.data_lanc,lancmtos.valor_real,lancmtos.valor_rec,
    lancmtos.data_venc,lancmtos.pago,lancmtos.data_pgmto,lancmtos.data_venc, lancmtos.situacao from lancmtos 
    left join receitas on lancmtos.id_rec = receitas.id_rec where lancmtos.id_pessoa = ${id_pessoa}`;
                db.query(sqlLanc, (err, boletos) => {
                    if (err) { res.status(404).json('404!2') }
                    else { res.set({ boletos }); }

                    let Sqldt = `select lancmtos_detalhado.id_lancdet,lancmtos_detalhado.cod_lancdet, lancmtos_detalhado.cod_rec,receitas.des_rec, lancmtos_detalhado.valor_real 
                    from lancmtos_detalhado 
        left join receitas on lancmtos_detalhado.id_rec = receitas.id_rec where lancmtos_detalhado.id_pessoa = ${id_pessoa}`;
                    db.query(Sqldt, (err, lanc_Dt) => {
                        if (err) { res.status(404).json('404!2') }
                        else { res.set({ lanc_Dt }); }

                        const sortKey = "id_lanc";
                        boletos.sort((a, b) => {
                            if (a[sortKey] < b[sortKey]) {
                                return -1;
                            }
                            if (a[sortKey] > b[sortKey]) {
                                return 1;
                            }
                            return 0;
                        })
                        let lanc_Map = boletos.reduce((map, row) => {
                            key = row["id_lanc"];
                            map[key] = row;
                            return map;
                        }, {})

                        let resultMap = lanc_Dt.reduce((map, row) => {
                            let key = row["cod_lancdet"];
                            if (map[key]) {
                                if (!map[key].lancmtosDt) map[key].lancmtosDt = [];
                                map[key].lancmtosDt.push(row);
                            }
                            return map;
                        }, lanc_Map)

                        let result = Object.values(resultMap);
                        res.status(200).json({ result });
                    });
                });
            });
        }
    });
        
});

app.get('/lancmtoIdAlt/:id_lanc', async (req, res) => {
    const { id_lanc } = req.params;
    let SQL = `select lancmtos.id_lanc,lancmtos.cod_lanc, lancmtos.data_venc,lancmtos.desc_lanc,lancmtos.parc, lancmtos.numero_proc from lancmtos where lancmtos.id_lanc =${id_lanc}`;
    db.query(SQL, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.json({ result }); }
    })
})

app.put("/altlanc/", async (req, res) => {
    const { id_lanc, data_venc, desc_lanc, parc, numero_proc } = req.body;
    let sql = `update lancmtos set data_venc = '${data_venc.split('-').reverse().join('/')}',desc_lanc = '${desc_lanc}',parc = '${parc}',numero_proc = '${numero_proc}' where id_lanc =${id_lanc}`;
    db.query(sql, (err) => {
        if (err) { res.status(404).json('404!'); }
        else res.status(200).json("Alterado!");
    });
});

app.get('/lancmtoId/:id_lanc', async (req, res) => {
    const { id_lanc } = req.params;
    let SQL3 = `select bancos.agencia, bancos.conta, bancos.convenio, bancos.cod_banco, bancos.nome_banco, bancos.local_pgto,bancos.brasao 
        from bancos where bancos.ativo = 'S' limit 1`;
            db.query(SQL3, (err, resbanco) => {
                if (!resbanco[0]) {  res.status(204).json({ msg: 'Banco Inativo!' })}
                else { 
                    res.set({ resbanco });

    let SQL = `select pessoas.id_pessoa,pessoas.nome_pessoa, pessoas.cpf_cnpj, lancmtos.id_lanc,lancmtos.cod_lanc,lancmtos.valor_real,lancmtos.data_lanc,lancmtos.data_venc,lancmtos.desc_lanc, 
               lancmtos.cod_insc,lancmtos.referencia,lancmtos.exercicio,lancmtos.parc,lancmtos.nossonum,lancmtos.situacao,receitas.cod_rec, receitas.des_rec from lancmtos 
               left join pessoas on lancmtos.id_pessoa = pessoas.id_pessoa left join receitas on lancmtos.id_rec = receitas.id_rec where lancmtos.id_lanc =${id_lanc}`;
    db.query(SQL, (err, result_lanc) => {
        if (err) { res.status(404).json('404!') }
        else { res.set({ result_lanc }); }

        let SQL2 = `select lancmtos_detalhado.id_pessoa, lancmtos_detalhado.cod_lancdet,lancmtos_detalhado.valor_real, lancmtos_detalhado.cod_rec, receitas.des_rec
        from lancmtos_detalhado left join receitas on lancmtos_detalhado.id_rec = receitas.id_rec where lancmtos_detalhado.cod_lancdet = ${id_lanc}`;
        db.query(SQL2, (err, result_lancDt) => {
            if (err) { res.status(404).json('404') }
            else { res.set({ result_lancDt }); }
            
                let rowDataPkt = { ...result_lanc[0] };
                let rowDataPktb = { ...resbanco[0] };
                let vlt = rowDataPkt.valor_real;
                let conv = rowDataPktb.convenio;
                let dtvc = rowDataPkt.data_venc;
                let idlc = rowDataPkt.id_lanc;
                let cod_banco = resbanco[0].cod_banco;
                let agencia = resbanco[0].agencia;
                let conta = resbanco[0].conta;
                let convenio = resbanco[0].convenio;
                let brasao = resbanco[0].brasao;
                let nome_banco = resbanco[0].nome_banco;
                let local_pgto = resbanco[0].local_pgto;
                let codigobarra = '8162' + ("00000000000" + vlt).slice(-12) + conv + new Date().getFullYear() + dtvc + '8' + ("00000000" + idlc).slice(-9) + '008';
                codigobarra = codigobarra.replace(/[^0-9]/g, '');
                let linhadigitavel = codigobarra.substring(0, 12) + ".7 " + codigobarra.substring(12, 24) + ".5 " + codigobarra.substring(24, 36) + ".6 " + codigobarra.substring(36, 48) + ".8 ";
                let result_banco = [{
                    'cod_banco': cod_banco, 'agencia': agencia, 'conta': conta, 'convenio': convenio, 'nome_banco': nome_banco, 'local_pgto': local_pgto,
                    'brasao': brasao, 'codigobarra': codigobarra, 'linhadigitavel': linhadigitavel
                }];
                const sortKey = id_lanc;
                result_lanc.sort((a, b) => {
                    if (a[sortKey] < b[sortKey]) {
                        return -1;
                    }
                    if (a[sortKey] > b[sortKey]) {
                        return 1;
                    }
                    return 0;
                })
                let lancmto_Map = result_lanc.reduce((map, row) => {
                    key = row[id_lanc];
                    map[key] = row;
                    return map;
                }, {})
                let resultMap = result_lancDt.reduce((map, row) => {
                    let key = row[id_lanc];
                    if (map[key]) {
                        if (!map[key].lancmtos_detalhado) map[key].lancmtos_detalhado = [];
                        map[key].lancmtos_detalhado.push(row);
                    }
                    return map;
                }, lancmto_Map)

                let resultMap1 = result_banco.reduce((map, row) => {
                    let key = row["id_banco"];
                    if (map[key]) {
                        if (!map[key].banco_ativo) map[key].banco_ativo = [];
                        map[key].banco_ativo.push(row);
                    }
                    return map;
                }, resultMap)
                //-----------------------------------/// funcionando
                let result = Object.values(resultMap, resultMap1);
                res.status(200).json({ result });
            
        });
    });

 } });
});

//Relatorios recebimentos detalhado e normal.
app.post('/recebimentos', async (req, res) => {
    let { id_ent, op_periodo, op_data, op_receb, op_tipocad, text1, text2, id_pessoa, id_rec } = req.body; console.log('reqBody', req.body)
    let {CONDICAO, CONDICAO2, CONDICAO3, CONDICAO4, CONDICAO6 } = '';

    if (text1 === '*') { text1 = ''; text2 = '' }

    if (id_pessoa) {
        CONDICAO = `lancmtos.id_pessoa = '${id_pessoa}'`;
    } else {
        CONDICAO = `lancmtos.id_pessoa > 1`;
    }
      if (id_rec === '0' ) {
        CONDICAO2 = `lancmtos.id_rec > 1`;
    } else {
        CONDICAO2 = `lancmtos.id_rec = '${id_rec}'`;
    }
    switch (op_periodo) {
        case '1': CONDICAO3 = `lancmtos.${op_data} = '${text1.replace('/','-')}'`; break;
        case '2': CONDICAO3 = `lancmtos.${op_data} between "${text1.replace('/','-')}" and "${text2.replace('/','-')}"`; break;
        case '3': CONDICAO3 = `lancmtos.exercicio = '${text1}'`; break;
    }
    switch (op_receb) {
        case 'M': CONDICAO4 = `lancmtos.tipo_baixa = '000'`; break;
        case 'B': CONDICAO4 = `lancmtos.tipo_baixa != '000'`; break;
        case 'T': CONDICAO4 = `char(lancmtos.tipo_baixa) >= ''`; console.log(CONDICAO4); break;
    }
    switch (op_tipocad) {
        case 'C': CONDICAO6 = `pessoas.tipocad = 'C'`; break;
        case 'E': CONDICAO6 = `pessoas.tipocad = 'E'`; break;
        case 'T': CONDICAO6 = `pessoas.tipocad in ('C','E')`; break;
    }

    SQL = `select lancmtos.id_lanc,lancmtos.cod_lanc, lancmtos.id_pessoa, lancmtos.cod_rec, receitas.des_rec, lancmtos.data_lanc,lancmtos.valor_real,lancmtos.valor_taxa,lancmtos.valor_rec,
    lancmtos.data_venc,lancmtos.pago,lancmtos.data_pgmto,lancmtos.data_cred, lancmtos.situacao,lancmtos.exercicio,lancmtos.cod_insc, pessoas.id_pessoa,pessoas.tipocad, pessoas.id_pessoa, pessoas.nome_pessoa, pessoas.cpf_cnpj from lancmtos 
    left join pessoas on lancmtos.id_pessoa = pessoas.id_pessoa 
    left join receitas on lancmtos.id_rec = receitas.id_rec 
    where lancmtos.id_ent = ${id_ent} and lancmtos.situacao = 'E' and ${CONDICAO6} and ${CONDICAO} and ${CONDICAO2} and ${CONDICAO3} and ${CONDICAO4} and lancmtos.pago = 'S' order by lancmtos.data_pgmto asc`;
    db.query(SQL, (err, result) => {
        console.log('SQL:', SQL)
        if (err) { res.status(404).json('404!'); }
        else { res.send(result) }
    });
});

//lançamentos por receita
app.get('/lancmtosRecId/:id_rec', async (req, res) => {
    const { id_rec } = req.params;
    let sqlLanc = `select lancmtos.id_lanc,lancmtos.id_rec,lancmtos.id_pessoa, lancmtos.cod_rec, receitas.id_rec,receitas.des_rec from lancmtos 
        left join receitas on lancmtos.id_rec = receitas.id_rec 
        where 
        receitas.id_rec = ${id_rec} group by receitas.des_rec`;
    db.query(sqlLanc, (err, boletos) => {
        if (err) { res.status(404).json('404!2') }
        else { res.set({ boletos }); }

        let Sqldt = `select 
                    lancmtos_detalhado.id_lancdet,lancmtos_detalhado.cod_lancdet,lancmtos_detalhado.id_rec, pessoas.nome_pessoa, lancmtos_detalhado.cod_rec,receitas.des_rec, lancmtos_detalhado.valor_real 
                    from lancmtos_detalhado 
            left join pessoas on lancmtos_detalhado.id_pessoa = pessoas.id_pessoa
            left join receitas on lancmtos_detalhado.id_rec = receitas.id_rec
            order by lancmtos_detalhado.data_lanc asc`;
        db.query(Sqldt, (err, lanc_Dt) => {
            if (err) { res.status(404).json('404!2') }
            else { res.set({ lanc_Dt }); }

            const sortKey = "id_rec";
            boletos.sort((a, b) => {
                if (a[sortKey] < b[sortKey]) {
                    return -1;
                }
                if (a[sortKey] > b[sortKey]) {
                    return 1;
                }
                return 0;
            })
            let lanc_Map = boletos.reduce((map, row) => {
                key = row["id_rec"];
                map[key] = row;
                return map;
            }, {})

            let resultMap = lanc_Dt.reduce((map, row) => {
                let key = row["id_rec"];
                if (map[key]) {
                    if (!map[key].lancmtosDt) map[key].lancmtosDt = [];
                    map[key].lancmtosDt.push(row);
                }
                return map;
            }, lanc_Map)

            let result = Object.values(resultMap);
            res.status(200).json({ result });
        });
    });
});

//relação de dams emitidos
app.post('/lancmtos_dams', async (req, res) => {
    let { id_ent, op_pago, op_receb,op_periodo, op_tipocad, text1, text2, id_pessoa, id_rec } = req.body; console.log('reqBody', req.body)
    let {CONDICAO, CONDICAO2, CONDICAO3, CONDICAO4, CONDICAO5, CONDICAO6 } = '';
    if (text1 === '*') { text1 = ''; text2 = '' }
    if (id_pessoa) {
        CONDICAO = `lancmtos.id_pessoa = '${id_pessoa}'`;
    } else {
        CONDICAO = `lancmtos.id_pessoa > 1`;
    }
    if (id_rec === '0' ) {
        CONDICAO2 = `lancmtos.id_rec > 1`;
    } else {
        CONDICAO2 = `lancmtos.id_rec = '${id_rec}'`;        
    }
    // case '1': CONDICAO3 = `lancmtos.${op_data} = '${text1.replace('/','-')}'`; break;
      switch (op_periodo) {        
        case '2': CONDICAO3 = `lancmtos.data_cad between "${text1.replace('/','-')}" and "${text2.replace('/','-')}"`; break;
        case '3': CONDICAO3 = `lancmtos.exercicio = '${text1}'`; break;
    }
    switch (op_receb) {
        case 'M': CONDICAO4 = `lancmtos.tipo_baixa = '000'`; break;
        case 'B': CONDICAO4 = `lancmtos.tipo_baixa != '000'`; break;
        case 'T': CONDICAO4 = `char(lancmtos.tipo_baixa) >= ''`; break;
    }
    switch (op_pago) {
        case 'S': CONDICAO5 = `lancmtos.pago = 'S'`; break;
        case 'N': CONDICAO5 = `lancmtos.pago = 'N'`; break;
        case 'T': CONDICAO5 = `lancmtos.pago in ('S','N')`; break;
    }
    switch (op_tipocad) {
        case 'C': CONDICAO6 = `pessoas.tipocad = 'C'`; break;
        case 'E': CONDICAO6 = `pessoas.tipocad = 'E'`; break;
        case 'T': CONDICAO6 = `pessoas.tipocad in ('C','E')`; break;
    }

    SQL = `select lancmtos.id_lanc,lancmtos.cod_lanc, lancmtos.id_pessoa, lancmtos.cod_rec, receitas.des_rec, lancmtos.data_cad,lancmtos.valor_real,lancmtos.valor_taxa,lancmtos.valor_rec,
    lancmtos.data_venc,lancmtos.pago,lancmtos.data_pgmto,lancmtos.data_cred, lancmtos.situacao,lancmtos.exercicio,lancmtos.cod_insc, pessoas.id_pessoa,pessoas.tipocad, pessoas.id_pessoa, pessoas.nome_pessoa, pessoas.cpf_cnpj from lancmtos 
    left join pessoas on lancmtos.id_pessoa = pessoas.id_pessoa 
    left join receitas on lancmtos.id_rec = receitas.id_rec 
    where lancmtos.id_ent = ${id_ent} and ${CONDICAO3} and ${CONDICAO6} and ${CONDICAO} and ${CONDICAO2} and ${CONDICAO4} and ${CONDICAO5}
    order by lancmtos.cod_lanc asc`;  console.log(SQL);
    db.query(SQL, (err, result) => {
        if (err) { res.status(404).json('Sem Dados!!'); }
        else { res.send(result) }
    });
});

app.get('/lancmtosRecAll_2/:id_ent', async (req, res) => {
    const { id_ent } = req.params;
    let sqlLanc = `select lancmtos.id_lanc,lancmtos.id_rec,lancmtos.id_pessoa, lancmtos.cod_rec, receitas.id_rec,receitas.des_rec from lancmtos 
        left join receitas on lancmtos.id_rec = receitas.id_rec 
        where 
        lancmtos.id_ent = ${id_ent} group by receitas.id_rec`;
    db.query(sqlLanc, (err, boletos) => {
        if (err) { res.status(404).json('404!2') }
        else { res.set({ boletos }); }

        let Sqldt = `select 
                    lancmtos_detalhado.id_lancdet,lancmtos_detalhado.cod_lancdet,lancmtos_detalhado.id_rec, pessoas.nome_pessoa, lancmtos_detalhado.cod_rec,receitas.des_rec, 
                    lancmtos_detalhado.valor_real,lancmtos_detalhado.valor_rec
                    from lancmtos_detalhado 
            left join pessoas on lancmtos_detalhado.id_pessoa = pessoas.id_pessoa
            left join receitas on lancmtos_detalhado.id_rec = receitas.id_rec order by lancmtos_detalhado.data_lanc`;
        db.query(Sqldt, (err, lanc_Dt) => {
            if (err) { res.status(404).json('404!2') }
            else { res.set({ lanc_Dt }); }

            const sortKey = "id_rec";
            boletos.sort((a, b) => {
                if (a[sortKey] < b[sortKey]) {
                    return -1;
                }
                if (a[sortKey] > b[sortKey]) {
                    return 1;
                }
                return 0;
            })
            let lanc_Map = boletos.reduce((map, row) => {
                key = row["id_rec"];
                map[key] = row;
                return map;
            }, {})

            let resultMap = lanc_Dt.reduce((map, row) => {
                let key = row["id_rec"];
                if (map[key]) {
                    if (!map[key].lancmtosDt) map[key].lancmtosDt = [];
                    map[key].lancmtosDt.push(row);
                }
                return map;
            }, lanc_Map)

            let result = Object.values(resultMap);
            res.status(200).json({ result });
        });
    });
});
app.post('/recebimentos_det/', async (req, res) => {
    let { id_ent, op_periodo, op_data, op_receb, op_tipocad, text1, text2, id_pessoa, id_rec } = req.body;
    let {CONDICAO, CONDICAO2, CONDICAO3, CONDICAO4, CONDICAO6 } = '';

    if (text1 === '*') { text1 = ''; text2 = '' }

    if (id_pessoa) {
        CONDICAO = `and lancmtos_detalhado.id_pessoa = '${id_pessoa}'`;
    }else{
        CONDICAO = `and lancmtos_detalhado.id_pessoa > 1`;
    }
    if (id_rec === '0' ) {
        CONDICAO2 = `and lancmtos_detalhado.id_rec > 1`;
    }else{
        CONDICAO2 = `and lancmtos_detalhado.id_rec = '${id_rec}'`;        
    }  
    switch (op_periodo) {
        case '1': CONDICAO3 = `and lancmtos_detalhado.${op_data} = '${text1.replace('/','-')}'`; break;
        case '2': CONDICAO3 = `and lancmtos_detalhado.${op_data} between "${text1.replace('/','-')}" and "${text2.replace('/','-')}"`; break;        
        case '3': CONDICAO3 = `and lancmtos_detalhado.exercicio = '${text1}'`; break;
    }
    switch (op_receb) {
        case 'M': CONDICAO4 = `and lancmtos_detalhado.tipo_baixa = '000'`; break;
        case 'B': CONDICAO4 = `and lancmtos_detalhado.tipo_baixa != '000'`; break;
        case 'T': CONDICAO4 = `and char(lancmtos_detalhado.tipo_baixa) >= ''`; break;
    }    
    switch (op_tipocad) {
        case 'C': CONDICAO6 = `and pessoas.tipocad = 'C'`; break;
        case 'E': CONDICAO6 = `and pessoas.tipocad = 'E'`; break;
        case 'T': CONDICAO6 = `and pessoas.tipocad in ('C','E')`; break;
    } 

    let sqlLanc = `select receitas.id_rec,receitas.cod_rec,receitas.des_rec, receitas.cod_orc,
                ( select sum(lancmtos_detalhado.valor_real) from lancmtos_detalhado left join pessoas on lancmtos_detalhado.id_pessoa = pessoas.id_pessoa where lancmtos_detalhado.id_ent = ${id_ent} ${CONDICAO} ${CONDICAO2} ${CONDICAO3} ${CONDICAO4} ${CONDICAO6} 
                and lancmtos_detalhado.pago = 'S' and lancmtos_detalhado.id_rec = receitas.id_rec 
            ) as total_real,
                     (select sum(lancmtos_detalhado.valor_taxa) from lancmtos_detalhado left join pessoas on lancmtos_detalhado.id_pessoa = pessoas.id_pessoa where lancmtos_detalhado.id_ent = ${id_ent} ${CONDICAO} ${CONDICAO2} ${CONDICAO3} ${CONDICAO4} ${CONDICAO6} 
                and lancmtos_detalhado.pago = 'S' and lancmtos_detalhado.id_rec = receitas.id_rec 
            ) as total_taxa, 
                (select sum(lancmtos_detalhado.valor_rec) from lancmtos_detalhado left join pessoas on lancmtos_detalhado.id_pessoa = pessoas.id_pessoa where lancmtos_detalhado.id_ent = ${id_ent} ${CONDICAO} ${CONDICAO2} ${CONDICAO3} ${CONDICAO4} ${CONDICAO6} 
                and lancmtos_detalhado.pago = 'S' and lancmtos_detalhado.id_rec = receitas.id_rec 
            ) as total_rec
            from receitas 
                where receitas.id_rec in (

                    select lancmtos_detalhado.id_rec from lancmtos_detalhado 
                    left join pessoas on lancmtos_detalhado.id_pessoa = pessoas.id_pessoa
where lancmtos_detalhado.id_ent = ${id_ent} ${CONDICAO} ${CONDICAO2} ${CONDICAO3} ${CONDICAO4} ${CONDICAO6} and lancmtos_detalhado.pago = 'S'
                    and lancmtos_detalhado.id_rec = receitas.id_rec
                    
                    ) and receitas.id_ent = ${id_ent} group by receitas.id_rec `;
    db.query(sqlLanc, (err, boletos) => { console.log(err)
        if (boletos) { 
            res.set({ boletos });


   let Sqldt = `select 
        lancmtos_detalhado.cod_lancdet, lancmtos_detalhado.id_pessoa, lancmtos_detalhado.cod_rec, receitas.id_rec, receitas.des_rec,
        lancmtos_detalhado.valor_real,lancmtos_detalhado.valor_taxa,lancmtos_detalhado.valor_rec,
        lancmtos_detalhado.pago,lancmtos_detalhado.data_pgmto,lancmtos_detalhado.data_cred,
 lancmtos_detalhado.situacao,lancmtos_detalhado.exercicio,lancmtos_detalhado.cod_insc, lancmtos_detalhado.numero_proc,
 pessoas.id_pessoa,pessoas.tipocad, pessoas.id_pessoa, pessoas.nome_pessoa, pessoas.cpf_cnpj
        from lancmtos_detalhado 
        left join receitas on lancmtos_detalhado.id_rec = receitas.id_rec
        left join pessoas on lancmtos_detalhado.id_pessoa = pessoas.id_pessoa
 where lancmtos_detalhado.id_ent = ${id_ent} ${CONDICAO} ${CONDICAO2} ${CONDICAO3} ${CONDICAO4} ${CONDICAO6} and lancmtos_detalhado.pago = 'S'
     `; 
     // ${CONDICAO} ${CONDICAO2} ${CONDICAO3} ${CONDICAO4} ${CONDICAO5} ${CONDICAO6}
    //  order by lancmtos_detalhado.data_pgmto asc
   
        db.query(Sqldt, (err, lanc_Dt) => {
            if (err) { res.status(404).json('404!2'); console.log(err) }
            else { res.set({ lanc_Dt }); console.log(Sqldt);} 

            const sortKey = "id_rec";
            boletos.sort((a, b) => {
                if (a[sortKey] < b[sortKey]) {
                    return -1;
                }
                if (a[sortKey] > b[sortKey]) {
                    return 1;
                }
                return 0;
            })
            let lanc_Map = boletos.reduce((map, row) => {
                key = row["id_rec"];
                map[key] = row;
                return map;
            }, {})

            let resultMap = lanc_Dt.reduce((map, row) => {
                let key = row["id_rec"];
                if (map[key]) {
                    if (!map[key].lancmtosDt) map[key].lancmtosDt = [];
                    map[key].lancmtosDt.push(row);
                }
                return map;
            }, lanc_Map)

            let result = Object.values(resultMap);
            //res.status(200).json({ result });
            res.send(result)
        });
    } else { res.status(404).json('404! erro consulta lancmtos_det'); console.log(err)}
    });
});

app.get('/lancmtosDetAll', async (req, res) => {
    let { id_ent, campo, text1, text2, limit_rows } = req.body;
    let sqlLanc = `select lancmtos.id_lanc,lancmtos.cod_lanc, lancmtos.id_pessoa, lancmtos.cod_rec, receitas.des_rec, lancmtos.data_lanc,lancmtos.valor_real,lancmtos.valor_rec,
    lancmtos.data_venc,lancmtos.pago,lancmtos.data_pgmto,lancmtos.data_venc, lancmtos.situacao from lancmtos 
    left join receitas on lancmtos.id_rec = receitas.id_rec where lancmtos.id_ent = ${id_ent} order by lancmtos.data_cad desc`;
    db.query(sqlLanc, (err, boletos) => {
        if (err) { res.status(404).json('404!2') }
        else { res.set({ boletos }); }

        let Sqldt = `select lancmtos_detalhado.id_lancdet,lancmtos_detalhado.cod_lancdet, lancmtos_detalhado.cod_rec,receitas.des_rec, lancmtos_detalhado.valor_real from lancmtos_detalhado 
        left join receitas on lancmtos_detalhado.id_rec = receitas.id_rec where lancmtos_detalhado.id_ent = ${id_ent} order by lancmtos_detalhado.data_cad asc`;
        db.query(Sqldt, (err, lanc_Dt) => {
            if (err) { res.status(404).json('404!2') }
            else { res.set({ lanc_Dt }); }

            const sortKey = "id_lanc";
            boletos.sort((a, b) => {
                if (a[sortKey] < b[sortKey]) {
                    return -1;
                }
                if (a[sortKey] > b[sortKey]) {
                    return 1;
                }
                return 0;
            })
            let lanc_Map = boletos.reduce((map, row) => {
                key = row["id_lanc"];
                map[key] = row;
                return map;
            }, {})

            let resultMap = lanc_Dt.reduce((map, row) => {
                let key = row["cod_lancdet"];
                if (map[key]) {
                    if (!map[key].lancmtosDt) map[key].lancmtosDt = [];
                    map[key].lancmtosDt.push(row);
                }
                return map;
            }, lanc_Map)

            let result = Object.values(resultMap);
            res.status(200).json({ result });
        });
    });

});

app.post("/lancPost", verify, async (req, res) => {
    let { id_ent, id_lanc, id_pessoa, cod_pessoa, id_user, id_rec, cod_rec, valor_real, parc, situacao, data_cad, nossonum, pago } = req.body;
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(500).json('Erro1: Banco de Dados') }
        else { res.set(result[0]) }
        role = result[0].role;
        if (role === 1) {
            //let msg = 'Receita adicionada!'; 
            let msgErr = 'Erro: Lançamentos';
            if (id_lanc) {
                let sql1 = `select lancmtos_detalhado.id_lancdet from lancmtos_detalhado where lancmtos_detalhado.id_ent = ${id_ent} and lancmtos_detalhado.cod_lancdet = ${id_lanc} and lancmtos_detalhado.cod_rec = ${cod_rec}`;
                db.query(sql1, (err, result2) => {
                    let resSelc = result2.length;
                    if (!resSelc) {
                        let cod_lancdet = id_lanc;
                        let cod_insc = cod_pessoa;
                        let SQLi = "insert into lancmtos_detalhado (id_ent,cod_lancdet,id_pessoa,id_user,id_rec,cod_rec,valor_real,cod_insc, situacao,pago,nossonum) values (?,?,?,?,?,?,?,?,?,?,?)";
                        db.query(SQLi, [id_ent, cod_lancdet, id_pessoa, id_user, id_rec, cod_rec, valor_real, cod_insc, situacao, pago, nossonum], (err1, result) => {
                            if (err1) { res.status(500).json(msgErr) }
                            else { res.set(result[0]) }
                            if (result.affectedRows) {
                                let SelCod = `select lancmtos_detalhado.id_lancdet, lancmtos_detalhado.cod_lancdet, lancmtos_detalhado.id_rec, lancmtos_detalhado.cod_rec,receitas.des_rec, lancmtos_detalhado.valor_real from lancmtos_detalhado 
                                            left join receitas on lancmtos_detalhado.id_rec = receitas.id_rec where lancmtos_detalhado.cod_lancdet = ${id_lanc}`;
                                db.query(SelCod, (err, result1) => {
                                    if (err) { res.status(500).json(msgErr) }
                                    else { res.status(201).json({ id_lanc, result1, nossonum, msg: 'Receita adicionada!' }) }
                                });
                            }
                        });
                    } else {
                        let SelCod = `select lancmtos_detalhado.id_lancdet, lancmtos_detalhado.cod_lancdet, lancmtos_detalhado.id_rec, lancmtos_detalhado.cod_rec,receitas.des_rec, lancmtos_detalhado.valor_real from lancmtos_detalhado 
                                left join receitas on lancmtos_detalhado.id_rec = receitas.id_rec where lancmtos_detalhado.cod_lancdet = ${id_lanc}`;
                        db.query(SelCod, (err, result1) => {
                            if (err) { res.status(500).json(msgErr) }
                            else { res.status(203).json({ id_lanc, result1, nossonum, msg: `Receita Já adicionada!` }) }
                        });
                    }
                });
            } else {
                let SelCodLog = `select max(cod_lanc) as cod_lanc FROM lancmtos WHERE id_ent = ${id_ent}`;
                db.query(SelCodLog, (err, result) => {
                    if (err) { res.status(404).json('404!'), console.log('errLOG', err) }
                    else { res.set(result[0]) }
                    let cod_lanc = result[0].cod_lanc + 1;
                    let numero_proc = ("0000000" + cod_lanc).slice(-6) + '/' + new Date().getFullYear();
                    let exercicio = new Date().getFullYear();
                    let nossonum = new Date().getFullYear() + ("0000" + cod_rec).slice(-4) + ("000000" + cod_lanc).slice(-6);

                    let cod_insc = cod_pessoa;
                    let SQLi = "insert into lancmtos (id_ent,cod_lanc,id_pessoa, id_user,id_rec, cod_rec, valor_real,cod_insc,parc,situacao, data_cad, pago,nossonum) values (?,?,?,?,?,?,?,?,?,?,?,?,?)";
                    db.query(SQLi, [id_ent, cod_lanc, id_pessoa, id_user, id_rec, cod_rec, valor_real, cod_insc, parc, situacao, data_cad, pago, nossonum], (err1, result) => {
                        if (err1) { res.status(500).json(msgErr), console.log(err1) }
                        else { res.set(result[0]) }
                        let id_lanc = result.insertId;
                        if (id_lanc) {
                            let cod_lancdet = id_lanc;
                            let msg = 'Lançamento Gerado, Receita adicionada!';
                            let SQLi = "insert into lancmtos_detalhado (id_ent,cod_lancdet,id_pessoa,id_user,id_rec,cod_rec,valor_real,cod_insc, situacao,pago,nossonum,exercicio,numero_proc) values (?,?,?,?,?,?,?,?,?,?,?,?,?)";
                            db.query(SQLi, [id_ent, cod_lancdet, id_pessoa, id_user, id_rec, cod_rec, valor_real, cod_insc, situacao, pago, nossonum,exercicio,numero_proc], (err1, result) => {
                                if (err1) { res.status(500).json(msgErr), console.log(err1) }
                                else { res.set(result[0]) }
                                if (result.affectedRows) {
                                    let SelCod = `select receitas.des_rec as nome_rec from receitas left join lancmtos on lancmtos.id_rec = receitas.id_rec where receitas.cod_rec = ${cod_rec}`;
                                    db.query(SelCod, (err, result2) => {
                                        if (result2) {

                                            let desc_lanc = `VALOR REFERÊNTE A EMISSÃO DE ${result2[0].nome_rec}.`;
                                            let SelCod1 = `select lancmtos_detalhado.id_lancdet, lancmtos_detalhado.cod_lancdet, lancmtos_detalhado.id_rec, lancmtos_detalhado.cod_rec, receitas.des_rec,lancmtos_detalhado.valor_real from lancmtos_detalhado 
                            left join receitas on lancmtos_detalhado.id_rec = receitas.id_rec where lancmtos_detalhado.cod_lancdet = ${id_lanc}`;
                                            db.query(SelCod1, (err, result1) => {
                                                if (err) { res.status(500).json(msgErr) }
                                                else { res.status(201).json({ id_lanc, numero_proc, result1, desc_lanc, nossonum, msg }) };
                                            })
                                        }
                                    })
                                }
                            });
                        } else { console.log(msgErr); }
                    });
                });
            }
        } else {
            res.status(401).json('Usuário Não autorizado!');
        }
    });
});

//continuação insersão de DAM PESSOAS
app.put("/lancmto", verify, async (req, res) => {
    const { id_lanc, id_pessoa, id_user, desc_lanc, valor_real, data_venc, numero_proc, data_lanc } = req.body;
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!'), console.log(err) }
        else { res.set(result[0]) }
        role = result[0].role;
        if (role === 1) {  //set venc_inicial = '${venc_inicial.split('-').reverse().join('/')}'
            let sql1 = `update lancmtos set venc_inicial = '${data_venc}', data_venc = '${data_venc.split('-').reverse().join('/')}',valor_original = '${valor_real}',valor_real = '${valor_real}',
            desc_lanc = '${desc_lanc}',exercicio = ${new Date().getFullYear()},numero_proc = '${numero_proc}',
            data_lanc = '${data_lanc.split('/').reverse().join('-')}' where id_lanc = '${id_lanc}' and id_pessoa = '${id_pessoa}'`;
            db.query(sql1, (err, result1) => {
                if (err) {
                    res.status(404).json('404!')
                } else res.status(200).json("Salvo!");
            });
        } else {
            res.status(401).json('Usuário Não autorizado!');
        }
    });
}
);
//calcular encargos 
app.put("/calcEnc/:id_lanc/:id_user", verify, async (req, res) => {
    const { id_lanc, id_user } = req.params;
    let sql1 = `select lancmtos.valor_original, lancmtos.id_pessoa,lancmtos.id_ent,lancmtos.venc_inicial,lancmtos.data_venc,lancmtos.nossonum,lancmtos.cod_insc,lancmtos.exercicio,lancmtos.pago 
    from lancmtos where lancmtos.id_lanc = ${id_lanc}`;
    db.query(sql1, (err, lancmto) => {
        if (lancmto[0].pago === 'S') {
            res.status(203).json({ id_lanc, msg: 'Não Atualizado: Já pago!' })
        } else {
            let dataAtual = new Date();
            let vencimento = new Date(lancmto[0].data_venc.split('/').reverse().join('-')).toLocaleDateString("en", { year: "numeric", day: "2-digit", month: "2-digit" });
            const dias = (new Date(dataAtual.toLocaleDateString("en", { year: "numeric", day: "2-digit", month: "2-digit" })).getTime() - new Date(vencimento).getTime()) / (1000 * 3600 * 24);
            
            if (dias <= 0
                // lancmto[0].data_venc >= dataAtual.toLocaleDateString("en", { year: "numeric", day: "2-digit", month: "2-digit" }) 
            ) {
                res.status(203).json({ id_lanc, msg: 'Não está vencido!' });
            } else {
                let sql1 = `select entidades.cod_juros,entidades.cod_multa,entidades.cod_corr,entidades.dias_venc from entidades where entidades.id_ent = ${lancmto[0].id_ent}`;
                db.query(sql1, (err, entidad) => {
                    let sql1 = `select receitas.id_rec, receitas.aliq from receitas where receitas.id_ent = ${lancmto[0].id_ent} and receitas.cod_rec = ${entidad[0].cod_juros}`;
                    db.query(sql1, (err, res_juros) => {
                        let sql1 = `select receitas.id_rec, receitas.aliq from receitas where receitas.id_ent = ${lancmto[0].id_ent} and receitas.cod_rec = ${entidad[0].cod_multa}`;
                        db.query(sql1, (err, res_multa) => {
                            let sql1 = `select receitas.id_rec, receitas.aliq from receitas where receitas.id_ent = ${lancmto[0].id_ent} and receitas.cod_rec = ${entidad[0].cod_corr}`;
                            db.query(sql1, (err, res_corr) => {
                                let sql3 = `delete from lancmtos_detalhado where lancmtos_detalhado.id_ent = ${lancmto[0].id_ent} and lancmtos_detalhado.cod_lancdet = ${id_lanc} 
                            and lancmtos_detalhado.id_rec in ( ${res_juros[0].id_rec},${res_multa[0].id_rec},${res_corr[0].id_rec})`;
                                db.query(sql3, (err) => {
                                    if (err) { console.log('Erro ao calcular enc Id_Ent:', id_ent) }
                                    else {
                                        // let venc_inicial = '13/01/2024'; 
                                        let venc_inicial = new Date(lancmto[0].venc_inicial).toLocaleDateString("en", { year: "numeric", day: "2-digit", month: "2-digit" });
                                        // let venc_inicial = lancmto[0].venc_inicial;
                                        const diasAtraso = (new Date(dataAtual.toLocaleDateString("en", { year: "numeric", day: "2-digit", month: "2-digit" })).getTime() - new Date(venc_inicial).getTime()) / (1000 * 3600 * 24);

                                        let valor_juros = parseFloat(lancmto[0].valor_original) * res_juros[0].aliq / 100 * diasAtraso;
                                        let valor_multa = parseFloat(lancmto[0].valor_original) * res_multa[0].aliq / 100 * diasAtraso;
                                        let valor_corr = parseFloat(lancmto[0].valor_original) * res_corr[0].aliq / 100 * diasAtraso;

                                        dataAtual.setDate(dataAtual.getDate() + entidad[0].dias_venc);
                                        let valor_total = lancmto[0].valor_original + valor_juros + valor_multa + valor_corr;
                                        let msgErr = 'Erro ao Cancular Encargos'; //set data_venc = '${dataAtual.toLocaleDateString('pt-BR')}',
                                        let sql = `update lancmtos set valor_real = '${valor_total}', valor_juros = '${valor_juros}',valor_multa = '${valor_multa}',valor_corr = '${valor_corr}',
                            data_venc = '${dataAtual.toLocaleDateString('pt-BR')}' where id_lanc = '${id_lanc}'`;
                                        db.query(sql, (err1, result) => {
                                            if (err1) { res.status(500).json(msgErr) }
                                            else {
                                                if (result) {
                                                    valor_juros === 'NaN' ? valor_real = 0 : valor_real = valor_juros;
                                                    let sql1 = "insert into lancmtos_detalhado (id_ent,cod_lancdet,id_pessoa,id_rec,id_user,cod_rec,nossonum,cod_insc,exercicio,valor_real, situacao,pago) values (?,?,?,?,?,?,?,?,?,?,?,?)";
                                                    db.query(sql1, [lancmto[0].id_ent, id_lanc, lancmto[0].id_pessoa, res_juros[0].id_rec, id_user, entidad[0].cod_juros, lancmto[0].nossonum, lancmto[0].cod_insc, lancmto[0].exercicio, valor_real, 'E', 'S'], (err, result1) => {
                                                        if (err) { res.status(500).json(msgErr) }
                                                        else {
                                                            let valor_real = valor_multa;
                                                            if (valor_multa === 'NaN') { valor_real = 0 }
                                                            let sql1 = "insert into lancmtos_detalhado (id_ent,cod_lancdet,id_pessoa,id_rec,id_user,cod_rec,nossonum,cod_insc,exercicio,valor_real, situacao,pago) values (?,?,?,?,?,?,?,?,?,?,?,?)";
                                                            db.query(sql1, [lancmto[0].id_ent, id_lanc, lancmto[0].id_pessoa, res_multa[0].id_rec, id_user, entidad[0].cod_multa, lancmto[0].nossonum, lancmto[0].cod_insc, lancmto[0].exercicio, valor_real, 'E', 'S'], (err, result1) => {
                                                                if (err) { res.status(500).json(msgErr) }
                                                                else {
                                                                    let valor_real = valor_corr;
                                                                    if (valor_corr === 'NaN') { valor_real = 0 }
                                                                    let sql1 = "insert into lancmtos_detalhado (id_ent,cod_lancdet,id_pessoa,id_rec,id_user,cod_rec,nossonum,cod_insc,exercicio,valor_real, situacao,pago) values (?,?,?,?,?,?,?,?,?,?,?,?)";
                                                                    db.query(sql1, [lancmto[0].id_ent, id_lanc, lancmto[0].id_pessoa, res_corr[0].id_rec, id_user, entidad[0].cod_corr, lancmto[0].nossonum, lancmto[0].cod_insc, lancmto[0].exercicio, valor_real, 'E', 'S'], (err, result1) => {
                                                                        if (err) { res.status(500).json(msgErr) }
                                                                        else {
                                                                            res.status(201).json({ id_lanc, msg: 'Atulizado com sucesso!' })
                                                                        };
                                                                    });
                                                                };
                                                            });

                                                        };
                                                    });

                                                }
                                            }
                                        });

                                    }

                                });

                            });
                        });
                    });
                });


            }
        }
    });
});

app.get("/consultaBaixa/:nossonum/:id_ent", verify, async (req, res) => {
    const { nossonum, id_ent } = req.params;
    let sql1 = `select pessoas.nome_pessoa, receitas.des_rec, lancmtos.valor_real, lancmtos.data_venc, lancmtos.nossonum,lancmtos.pago from lancmtos 
            left join receitas on lancmtos.id_rec = receitas.id_rec left join pessoas on lancmtos.id_pessoa = pessoas.id_pessoa 
            where lancmtos.nossonum = '${nossonum}' and lancmtos.id_ent = '${id_ent}'`;
    db.query(sql1, (err, result1) => {
        if (err) {
            res.status(404).json('404!')
        } else res.status(200).json({ result1 });
    });
}
);

app.put("/BaixaManual", verify, async (req, res) => {
    const { id_user, nossonum, data_pgmto, pago, valor_real, id_ent } = req.body;
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!'), console.log(err) }
        else { res.set(result[0]) }
        role = result[0].role;
        if (role === 1) {
            if (pago === 'N') {
                let sql1 = `update lancmtos set lancmtos.valor_rec = ${valor_real}, lancmtos.data_pgmto = '${data_pgmto}', lancmtos.data_cred = '${data_pgmto}', lancmtos.tipo_baixa = '000', lancmtos.pago = 'S' where  lancmtos.nossonum = '${nossonum}' and lancmtos.id_ent = '${id_ent}'`;
                db.query(sql1, (err) => {
                    if (err) { res.status(404).json('404!'); console.log(err) } else {
                        let sql2 = `update lancmtos_detalhado set lancmtos_detalhado.valor_rec = lancmtos_detalhado.valor_real, lancmtos_detalhado.data_pgmto = '${data_pgmto}', lancmtos_detalhado.data_cred = '${data_pgmto}', lancmtos_detalhado.tipo_baixa = '000', lancmtos_detalhado.pago = 'S' where  lancmtos_detalhado.nossonum = '${nossonum}' and lancmtos_detalhado.id_ent = '${id_ent}'`;
                        db.query(sql2, (err) => {
                            if (err) {
                                res.status(404).json('404!'); console.log(err)
                            } else res.status(200).json("Processada com sucesso!");
                        });
                    }
                });
            } else { res.status(405).json("DAM já Baixado!") }
        } else {
            res.status(401).json('Usuário Não autorizado!');
        }
    });
}
);

app.put("/estornoBaixa", verify, async (req, res) => {
    const { id_user, nossonum, id_ent } = req.body;
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.set(result[0]) }
        role = result[0].role;
        if (role === 1) {
            let sql1 = `update lancmtos set lancmtos.data_pgmto = '', lancmtos.data_cred = '',lancmtos.tipo_baixa = '', lancmtos.pago = 'N' where  lancmtos.nossonum = '${nossonum}' and lancmtos.id_ent = '${id_ent}'`;
            db.query(sql1, (err) => {
                if (err) { res.status(404).json('404!'); } else {
                    let sql2 = `update lancmtos_detalhado set lancmtos_detalhado.data_pgmto = '', lancmtos_detalhado.data_cred = '', lancmtos_detalhado.tipo_baixa = '', lancmtos_detalhado.pago = 'N' where  lancmtos_detalhado.nossonum = '${nossonum}' and lancmtos_detalhado.id_ent = '${id_ent}'`;
                    db.query(sql2, (err) => {
                        if (err) {
                            res.status(404).json('404!'); console.log(err);
                        } else res.status(200).json("Extorno Realizado com sucesso!");
                    });
                }
            });
        } else {
            res.status(401).json('Usuário Não autorizado!');
        }
    });
}
);

app.delete("/delLanc/:id_user/:id_lanc/:id_pessoa", verify, (req, res) => {
    let { id_user, id_lanc, id_pessoa } = req.params; console.log('idLanc:', id_lanc)
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.set(result[0]); }
        role = result[0].role;
        if (role === 1) {
            //situacao === 'C' ? situacao = 'E' : situacao = 'C';
            let msgErr = 'Impossível Cancelar: DAM Pago!';
            let Sql1 = `update lancmtos_detalhado set lancmtos_detalhado.situacao = 'C' where lancmtos_detalhado.id_lancdet = ${id_lanc} and lancmtos_detalhado.id_pessoa = ${id_pessoa} and lancmtos_detalhado.pago = 'N'`;
            db.query(Sql1, (err) => {
                if (err) { res.status(405).json(msgErr) }
                else {
                    let Sql2 = `update lancmtos set lancmtos.situacao = 'C' where lancmtos.id_lanc  = ${id_lanc} and lancmtos.id_pessoa = ${id_pessoa} and lancmtos.pago = 'N'`;
                    db.query(Sql2, (err, result) => {
                        if (result.affectedRows) { res.status(201).json({ id_pessoa, msg: 'Feito!' }) }
                        else { res.status(203).json({ id_pessoa, msg: 'Impossível Cancelar: DAM Pago!' }) };
                    });
                }
            });
        } else { res.sendStatus(401).json('Usuário Não autorizado!'); }
    });
});
//excluir lançamentos detalhado da lista quando se estar fazendo DAM em pessoas
app.delete("/delLancDt/:id/:id_lanc", verify, (req, res) => {
    const { id, id_lanc } = req.params; let msgErr = 'Erro: dell Lancmtos';
    let Sql1 = `delete from lancmtos_detalhado where id_lancdet = ${id}`;
    db.query(Sql1, (err) => {
        if (err) { res.status(405).json(msgErr) }
        else {
            let SelCod = `select lancmtos_detalhado.id_lancdet, lancmtos_detalhado.cod_lancdet, lancmtos_detalhado.cod_rec,receitas.des_rec, lancmtos_detalhado.valor_real from lancmtos_detalhado 
                 left join receitas on lancmtos_detalhado.id_rec = receitas.id_rec where lancmtos_detalhado.cod_lancdet = ${id_lanc}`;
            db.query(SelCod, (err, result1) => {
                if (err) { res.status(500).json(msgErr) }
                else { res.status(201).json({ id_lanc, result1, msg: 'Excluído' }) };
            })
        }
    });
});

//relatorios lancmtos
app.get("/pessoaId/:id_pessoa", verify, (req, res) => {
    const { id_pessoa } = req.params;
    let SqlPes = `select pessoas.id_ent, pessoas.id_pessoa,pessoas.cod_pessoa, pessoas.nome_pessoa,pessoas.fantasia,pessoas.cpf_cnpj, pessoas.numero, pessoas.cep, pessoas.rua,pessoas.bairro,
    pessoas.cidade,pessoas.uf,pessoas.telefone,pessoas.fixo,pessoas.email,pessoas.tipocad,pessoas.situacao_cad,pessoas.data_cad,pessoas.data_abertura, pessoas.porte,pessoas.vigilancia,
    pessoas.regime_trib,pessoas.obs,pessoas.obs_encerramento,pessoas.cod_natureza,pessoas.ultima_atualizacao, pessoas.complemento,pessoas.site,pessoas.area_mercantil,
    pessoas.numero_proc,pessoas.data_encerramento, pessoas.insc_muni,pessoas.insc_estad,pessoas.insc_junta,pessoas.cod_segmentoativ,pessoas.classetrib,pessoas.cod_cnae,
    pessoas.cod_cnae_grupo,pessoas.iss,pessoas.iss_retido,pessoas.tx_virgilancia,pessoas.alvara,pessoas.alvara_trans from pessoas where pessoas.id_pessoa = ${id_pessoa}`;

    /*let sqlTum = `select tumulos.id_tum,tumulos.cod_tum, tumulos.id_pessoa,tumulos.st,tumulos.qd,tumulos.lt,tumulos.tipo,tumulos.data_cad, cemiterios.nome_cemi from tumulos 
    left join pessoas on tumulos.id_pessoa = pessoas.id_pessoa left join cemiterios on tumulos.id_cemi = cemiterios.id_cemi where tumulos.id_pessoa = ${id_pessoa}`; */

    let sqlAtiv = `select pessoas_ativ_cnae.id_ativ, pessoas_ativ_cnae.code,atividades_cnae.descricao_cnae from pessoas_ativ_cnae left join atividades_cnae on pessoas_ativ_cnae.code = atividades_cnae.cod_cnae where pessoas_ativ_cnae.id_pessoa = ${id_pessoa}`;
    let sqlSocios = `select pessoas_socios.id_socios,pessoas_socios.nome,pessoas_socios.cpf_cnpj, pessoas_socios.qual from pessoas_socios where pessoas_socios.id_pessoa = ${id_pessoa}`;

    let sqlLanc = `select lancmtos.id_lanc,lancmtos.cod_lanc,lancmtos.id_pessoa, lancmtos.cod_rec, receitas.des_rec, lancmtos.data_lanc,lancmtos.valor_real,lancmtos.valor_rec,lancmtos.data_venc,lancmtos.pago,lancmtos.data_pgmto,lancmtos.data_venc, lancmtos.situacao from lancmtos left join receitas on lancmtos.id_rec = receitas.id_rec where lancmtos.id_pessoa = ${id_pessoa} order by lancmtos.id_lanc desc`;
    let msgErr = 'Erro ao chamar por ID'
    db.query(SqlPes, (err, result_pessoa) => {
        if (err) { res.status(404).json('404!') }
        else {
            db.query(sqlAtiv, (err, result_ativ) => {
                if (err) { res.status(404).json('404!') }
                else { res.set({ result_ativ }) }

                db.query(sqlSocios, (err, result_socios) => {
                    if (err) { res.status(404).json('404!') }
                    else { res.set({ result_socios }) }

                    db.query(sqlLanc, (err, result_lanc) => {
                        if (err) { res.status(404).json('404!') }
                        // else {res.status(200).json({result_pes, result_tum, result_lanc });}   
                        else { res.set(result_lanc) }

                        let SelCod = `select lancmtos_detalhado.id_lancdet,lancmtos_detalhado.cod_lancdet, lancmtos_detalhado.cod_rec,receitas.des_rec, lancmtos_detalhado.valor_real from lancmtos_detalhado 
                    left join receitas on lancmtos_detalhado.id_rec = receitas.id_rec where lancmtos_detalhado.id_pessoa = ${id_pessoa}  order by lancmtos_detalhado.valor_real asc`;
                        db.query(SelCod, (err, result_lancDet) => {
                            if (err) { res.status(500).json(err); console.log(msgErr) }
                            //else {res.status(201).json({ id_lanc,result1, msg })}       
                            else { res.set({ result_lancDet }) }

                            const sortKeyp = id_pessoa;
                            result_pessoa.sort((a, b) => {
                                if (a[sortKeyp] < b[sortKeyp]) {
                                    return -1;
                                }
                                if (a[sortKeyp] > b[sortKeyp]) {
                                    return 1;
                                }
                                return 0;

                            });
                            const sortKeyL = "id_lanc";
                            result_lanc.sort((a, b) => {
                                if (a[sortKeyL] < b[sortKeyL]) {
                                    return -1;
                                }
                                if (a[sortKeyL] > b[sortKeyL]) {
                                    return 1;
                                }
                                return 0;
                            })

                            let pessoa_Map = result_pessoa.reduce((map, row) => {
                                key = row[id_pessoa];
                                map[key] = row;
                                return map;
                            }, {})

                            let resultMap = result_lanc.reduce((map, row) => {
                                let key = row[id_pessoa];
                                if (map[key]) {
                                    if (!map[key].lancmtos) map[key].lancmtos = [];
                                    map[key].lancmtos.push(row);
                                }
                                return map;
                            }, pessoa_Map)

                            let resultMap1 = result_ativ.reduce((map, row) => {
                                let key = row[id_pessoa];
                                if (map[key]) {
                                    if (!map[key].ativsecund) map[key].ativsecund = [];
                                    map[key].ativsecund.push(row);
                                }
                                return map;
                            }, pessoa_Map)

                            let resultMap3 = result_socios.reduce((map, row) => {
                                let key = row[id_pessoa];
                                if (map[key]) {
                                    if (!map[key].socios) map[key].socios = [];
                                    map[key].socios.push(row);
                                }
                                return map;
                            }, pessoa_Map)
                            //-----------------------------------///
                            let lanc_Map = result_lanc.reduce((map, row) => {
                                key = row["id_lanc"];
                                map[key] = row;
                                return map;
                            }, {})

                            let resultMap2 = result_lancDet.reduce((map, row) => {
                                let key = row["cod_lancdet"];
                                if (map[key]) {
                                    if (!map[key].lancmtosDet) map[key].lancmtosDet = [];
                                    map[key].lancmtosDet.push(row);
                                }
                                return map;
                            }, lanc_Map)
                            let result = Object.values(resultMap, resultMap1, resultMap2, resultMap3);
                            res.status(200).json({ result });
                        });

                    });
                });
            });
        }
        //else res.set(result_pes);
    });
});

//IPTU
app.get('/iptuId/:id_imovel', async (req, res) => {
    const { id_imovel } = req.params;
    let SQL = `select pessoas.id_pessoa,pessoas.nome_pessoa, pessoas.cpf_cnpj,pessoas.rua,pessoas.numero,pessoas.bairro,pessoas.cidade,pessoas.uf,pessoas.cep, 
    imoveis.id_ent,imoveis.id_imovel,imoveis.cod_imovel,imoveis.inscricao,imoveis.area_terreno,imoveis.area_construida,
    imoveis.valor_venal,imoveis.valor_iptu,imoveis.valor_antec,imoveis.valor_total, imoveis.uso_solo,
    imoveis.tx1,imoveis.tx2,imoveis.tx3, imoveis.situacao, imoveis.data_cad,imoveis.data_venc,imoveis.nossonum, imoveis.exercicio,imoveis.pago,
    (select sum(dividas.valor_total) from dividas where dividas.pago = 'N' and dividas.id_imovel = imoveis.id_imovel ) as divida_total,
    tipo_imovel.desc_tipo_imovel, padrao.desc_padrao from imoveis 
    left join pessoas on imoveis.id_pessoa = pessoas.id_pessoa 
    left join tipo_imovel on imoveis.tipo_imovel = tipo_imovel.cod_tipo_imovel 
    left join padrao on imoveis.padrao = padrao.cod_padrao where imoveis.id_imovel = ${id_imovel}`;
    db.query(SQL, (err, result_iptu) => {
        if (err) { res.status(404).json('404!');console.log(err) }
        else {
            res.set(result_iptu);
            if (result_iptu[0].valor_total === 0) {
                res.status(203).json({ msg: 'Valor Zerado!' })
            } else {
                if (result_iptu[0].pago === 'S') {
                    res.status(203).json({ msg: 'IPTU Pago!' })
                } else {
                    let SQL2 = `select entidades.msg1, entidades.msg2, entidades.msg3,entidades.msg4,entidades.venc_unica,entidades.venc_antec from entidades where entidades.id_ent = ${result_iptu[0].id_ent}`;
                    db.query(SQL2, (err, result_entid) => {
                        if (err) { res.status(404).json('4042!') }
                        else {
                            res.set({ result_entid });

                            let SQL3 = `select bancos.agencia, bancos.conta, bancos.convenio, bancos.cod_banco, bancos.nome_banco, bancos.local_pgto,bancos.brasao 
        from bancos where bancos.ativo = 'S' limit 1`;
                            db.query(SQL3, (err, resbanco) => {

                                if (err) { res.status(404).json('404!3') }
                                else {
                                    res.set({ resbanco });
                                    let rowDataPkt = { ...result_iptu[0] };
                                    let rowDataPktb = { ...resbanco[0] };

                                    let vlt = rowDataPkt.valor_total;
                                    let conv = rowDataPktb.convenio;
                                    let dtvc = rowDataPkt.data_venc;
                                    let idImvel = rowDataPkt.id_imovel;

                                    let cod_banco = resbanco[0].cod_banco;
                                    let agencia = resbanco[0].agencia;
                                    let conta = resbanco[0].conta;
                                    let convenio = resbanco[0].convenio;
                                    let brasao = resbanco[0].brasao;
                                    let nome_banco = resbanco[0].nome_banco;
                                    let local_pgto = resbanco[0].local_pgto;
                                    let codigobarra = '8162' + ("00000000000" + vlt).slice(-12) + conv + new Date().getFullYear() + dtvc + '8' + ("00000000" + idImvel).slice(-9) + '008';
                                    codigobarra = codigobarra.replace(/[^0-9]/g, '');
                                    let linhadigitavel = codigobarra.substring(0, 12) + ".7 " + codigobarra.substring(12, 24) + ".5 " + codigobarra.substring(24, 36) + ".6 " + codigobarra.substring(36, 48) + ".8 ";
                                    let result_banco = [{
                                        'cod_banco': cod_banco, 'agencia': agencia, 'conta': conta, 'convenio': convenio, 'nome_banco': nome_banco, 'local_pgto': local_pgto,
                                        'brasao': brasao, 'codigobarra': codigobarra, 'linhadigitavel': linhadigitavel
                                    }];
                                    const sortKey = id_imovel;
                                    result_iptu.sort((a, b) => {
                                        if (a[sortKey] < b[sortKey]) {
                                            return -1;
                                        }
                                        if (a[sortKey] > b[sortKey]) {
                                            return 1;
                                        }
                                        return 0;
                                    })
                                    let iptu_Map = result_iptu.reduce((map, row) => {
                                        key = row[id_imovel];
                                        map[key] = row;
                                        return map;
                                    }, {})

                                    let resultMap1 = result_banco.reduce((map, row) => {
                                        let key = row["id_banco"];
                                        if (map[key]) {
                                            if (!map[key].banco_ativo) map[key].banco_ativo = [];
                                            map[key].banco_ativo.push(row);
                                        }
                                        return map;
                                    }, iptu_Map)
                                    //-----------------------------------/// funcionando
                                    let resultMap2 = result_entid.reduce((map, row) => {
                                        let key = row["id_ent"];
                                        if (map[key]) {
                                            if (!map[key].dados_Ent) map[key].dados_Ent = [];
                                            map[key].dados_Ent.push(row);
                                        }
                                        return map;
                                    }, resultMap1)
                                    let result = Object.values(iptu_Map, resultMap1, resultMap2);
                                    res.status(200).json({ result });
                                }
                            });//banco
                        }
                    });//entidade  
                }
            }
        }
    });//IPTU
});

//Dividas
app.get('/dividasId/:id_imovel', async (req, res) => {
    const { id_imovel } = req.params;
    let SQL = `select pessoas.id_pessoa,pessoas.nome_pessoa, pessoas.cpf_cnpj,pessoas.rua,pessoas.numero,pessoas.bairro,pessoas.cidade,pessoas.uf,pessoas.cep,imoveis.id_imovel,imoveis.cod_imovel,imoveis.inscricao,imoveis.lote, 
    imoveis.quadra,imoveis.valor_venal,imoveis.area_terreno, imoveis.area_construida,tipo_imovel.desc_tipo_imovel, imoveis.uso_solo,dividas.id_ent, sum(dividas.valor_original) as original, dividas.nossonum, 
    sum(dividas.valor_multa) as multa, sum(dividas.valor_juros) as juros, sum(dividas.valor_corr) as corr, sum(dividas.desconto) as desconto,sum(dividas.valor_total) as divida_total from dividas 
    left join imoveis on dividas.id_imovel = imoveis.id_imovel left join pessoas on imoveis.id_pessoa = pessoas.id_pessoa left join tipo_imovel on imoveis.tipo_imovel = tipo_imovel.cod_tipo_imovel where dividas.id_imovel = ${id_imovel}`;
    db.query(SQL, (err, result_divida) => {
        if (err) { res.status(404).json('404!') }
        else {
            res.set(result_divida);
            if (result_divida[0].divida_total > 0) {

                     let SQL1 = `select dividas.id_divida, dividas.exercicio, dividas.valor_original, dividas.valor_juros,dividas.valor_multa,dividas.valor_corr,dividas.desconto, dividas.valor_total
                      from dividas where dividas.id_imovel = ${id_imovel} and dividas.pago = 'N'`;
                     db.query(SQL1, (err, result_dividas) => {
                         if (err) { res.status(404).json('404!') }
                         else {
                             res.set({ result_dividas });

                             let SQL2 = `select entidades.msg1, entidades.msg2, entidades.msg3,entidades.msg4,entidades.venc_dvexercicio,entidades.exercicio, entidades.venc_dvtotal from entidades where entidades.id_ent = ${result_divida[0].id_ent}`;
                             db.query(SQL2, (err, result_entid) => {
                                 if (err) { res.status(404).json('404!') }
                                 else {
                                     res.set({ result_entid });

                                     let SQL3 = `select bancos.agencia, bancos.conta, bancos.convenio, bancos.cod_banco, bancos.nome_banco, bancos.local_pgto,bancos.brasao 
                 from bancos where bancos.ativo = 'S' limit 1`;
                                     db.query(SQL3, (err, resbanco) => {

                                         if (err) { res.status(404).json('404') }
                                         else {
                                             res.set({ resbanco });
                                             let rowDataPkt = { ...result_divida[0] };
                                             let rowDataPktb = { ...resbanco[0] };

                                             let vlt = rowDataPkt.valor_total;
                                             let conv = rowDataPktb.convenio;
                                             let dtvc = rowDataPkt.data_venc;
                                             let idImvel = rowDataPkt.id_imovel;

                                             let cod_banco = resbanco[0].cod_banco;
                                             let agencia = resbanco[0].agencia;
                                             let conta = resbanco[0].conta;
                                             let convenio = resbanco[0].convenio;
                                             let brasao = resbanco[0].brasao;
                                             let nome_banco = resbanco[0].nome_banco;
                                             let local_pgto = resbanco[0].local_pgto;
                                             let codigobarra = '8162' + ("00000000000" + vlt).slice(-12) + conv + new Date().getFullYear() + dtvc + '8' + ("00000000" + idImvel).slice(-9) + '008';
                                             codigobarra = codigobarra.replace(/[^0-9]/g, '');
                                             let linhadigitavel = codigobarra.substring(0, 12) + ".7 " + codigobarra.substring(12, 24) + ".5 " + codigobarra.substring(24, 36) + ".6 " + codigobarra.substring(36, 48) + ".8 ";
                                             let result_banco = [{
                                                 'cod_banco': cod_banco, 'agencia': agencia, 'conta': conta, 'convenio': convenio, 'nome_banco': nome_banco, 'local_pgto': local_pgto,
                                                 'brasao': brasao, 'codigobarra': codigobarra, 'linhadigitavel': linhadigitavel
                                             }];
                                             const sortKey = id_imovel;
                                             result_divida.sort((a, b) => {
                                                 if (a[sortKey] < b[sortKey]) {
                                                     return -1;
                                                 }
                                                 if (a[sortKey] > b[sortKey]) {
                                                     return 1;
                                                 }
                                                 return 0;
                                             })
                                             let iptu_Map = result_divida.reduce((map, row) => {
                                                 key = row[id_imovel];
                                                 map[key] = row;
                                                 return map;
                                             }, {})

                                             let resultMap0 = result_dividas.reduce((map, row) => {
                                                 let key = row["id_imovel"];
                                                 if (map[key]) {
                                                     if (!map[key].dividas) map[key].dividas = [];
                                                     map[key].dividas.push(row);
                                                 }
                                                 return map;
                                             }, iptu_Map)

                                             let resultMap1 = result_banco.reduce((map, row) => {
                                                 let key = row["id_banco"];
                                                 if (map[key]) {
                                                     if (!map[key].banco_ativo) map[key].banco_ativo = [];
                                                     map[key].banco_ativo.push(row);
                                                 }
                                                 return map;
                                             }, iptu_Map)
                                             //-----------------------------------/ funcionando
                                             let resultMap2 = result_entid.reduce((map, row) => {
                                                 let key = row["id_ent"];
                                                 if (map[key]) {
                                                     if (!map[key].dados_Ent) map[key].dados_Ent = [];
                                                     map[key].dados_Ent.push(row);
                                                 }
                                                 return map;
                                             }, resultMap1)
                                             let result = Object.values(iptu_Map, resultMap0, resultMap1, resultMap2);
                                             res.status(200).json({ result });
                                         }
                                     });//banco
                                 }
                             });//entidade  
                         }
                     });//select dividas individual

            } else {
                res.status(203).json({ msg: 'Não há Dividas!' });
            }
        }
    });//select dividas somada
});

//===========natureza========//
app.get("/naturezaAll/", verify, (req, res) => {
    let SQL = `select cod_natureza, natureza from natureza_juridica`;
    db.query(SQL, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.send(result); }
    });
});

app.get("/naturezaId/:id", verify, (req, res) => {
    const { id } = req.params;
    let SQL = `select cod_natureza, natureza from natureza_juridica where cod_natureza = ${id}`;
    db.query(SQL, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.send(result) }
    });
});

app.get("/ativCnaeAll/", verify, (req, res) => {
    let SQL = `select cod_cnae, descricao_cnae,cod_grupo from atividades_cnae`;
    db.query(SQL, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.send(result); }
    });
});
/*
app.get("/ativCnaeId/:id", verify, (req, res) => {
    const { id } = req.params;
    let SQL = `select cod_cnae, descricao_cnae from atividades_cnae,cod_grupo where cod_cnae = ${id}`;
    db.query(SQL, (err, result) => {
        if (err) { res.status(404).json('404!')}
        else {res.send(result)}
    });
});
*/

app.get("/ativCnaeGrp/", verify, (req, res) => {
    let SQL = `select cod_cnae_grupo,descricao_cnae_grupo from atividades_cnae_grupos`;
    db.query(SQL, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.send(result) }
    });
});
app.get("/ativCnaeGrpId/:id", verify, (req, res) => {
    const { id } = req.params;
    let SQL = `select cod_cnae, descricao_cnae, cod_grupo from atividades_cnae where cod_grupo = ${id}`;
    db.query(SQL, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.send(result) }
    });
});
//===========cemiterios========//
app.get("/cemiterios/:id_ent", verify, (req, res) => {
    const { id_ent } = req.params;
    let SQL = `select id_ent, id_cemi,cod_cemi, nome_cemi, endereco, cidade, telefone, cnpj, email, data_cad, data_alt, usu_cad from cemiterios where id_ent = ${id_ent}`;
    db.query(SQL, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.send(result); }
    });
});

app.get("/cemiterio/:id", verify, (req, res) => {
    const { id } = req.params;
    let SQL = `select tx1, tx2, tx3, vl from cemiterios where id_cemi = ${id}`;
    db.query(SQL, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.send(result) }
    });
});

//Chamada todos os dados por entidade com seu registro de operador
//não uso Joy porque é um registro e um array estrangeiro dele.
app.get("/cemiAllOper/:id_cemi", verify, (req, res) => {
    const { id_cemi } = req.params;
    let sqlCemi = `select cemiterios.id_ent, cemiterios.id_cemi,cemiterios.cod_cemi, cemiterios.nome_cemi, cemiterios.endereco, cemiterios.cidade, cemiterios.telefone, cemiterios.cnpj, cemiterios.email, cemiterios.vl, cemiterios.tx1, cemiterios.tx2, cemiterios.tx3, cemiterios.data_cad, cemiterios.data_alt, cemiterios.usu_cad, entidades.campo4_nome, entidades.campo5_nome,entidades.campo6_nome from cemiterios left JOIN entidades on cemiterios.id_ent = entidades.id_ent where cemiterios.id_cemi = ${id_cemi}`;
    let sqlOper = `select * from operador where id_cemi = ${id_cemi}`;
    db.query(sqlCemi, (err, result1) => {
        if (err) { res.status(404).json('404!') }
        db.query(sqlOper, (err, result2) => {
            if (err) { res.status(404).json('404!') }
            else { res.json({ result1, result2 }) }
        });
    });
});

app.delete("/cemiterio/:id_cemi/:id_user", verify, (req, res) => {
    const { id_cemi, id_user } = req.params;
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.set(result[0]); }
        role = result[0].role;
        if (role === 1) {
            let Sql1 = `delete from cemiterios where id_cemi = ${id_cemi}`;
            db.query(Sql1, (err) => {
                if (err) { res.status(405).json('Não é Possivel excluir: Registro Chave') }
                else { res.status(200).json("Excluído!") }
            });
        } else { res.sendStatus(401).json('Usuário Não autorizado!'); }
    });
});

app.post("/cemiPost", verify, async (req, res) => {
    const { id_ent, id_user, id_cemi, nome_cemi, email, telefone, cidade, endereco, cnpj, data_cad, data_alt, usu_cad } = req.body;
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.set(result[0]) }
        role = result[0].role;
        if (role === 1) {
            let SelCod = `select max(cod_cemi) as cod_cemi from cemiterios WHERE id_ent = ${id_ent}`;
            db.query(SelCod, (err, result1) => {
                if (err) { res.status(404).json('404!'), console.log(err) }
                else {
                    res.set(result1[0]);
                    let cod_cemi = result1[0].cod_cemi + 1
                    if (cod_cemi) {
                        let SQL = "insert into cemiterios (id_ent, id_cemi,cod_cemi, nome_cemi, email,telefone,cidade, endereco,cnpj,data_cad, data_alt,usu_cad) values (?,?,?,?,?,?,?,?,?,?,?,?)";
                        db.query(SQL, [id_ent, id_cemi, cod_cemi, nome_cemi, email, telefone, cidade, endereco, cnpj, data_cad, data_alt, usu_cad], (err1, result1) => {
                            msg = "Salvo!";
                            if (err1) { res.status(404).json('404!'); console.log(err1) }
                            else { res.status(200).json({ result1, msg }) }
                        })
                    }
                }
            });

        } else {
            res.status(401).json('Usuário Não autorizado!');
        }
    });
});

app.put("/cemiPut", verify, async (req, res) => {
    const { id_user, id_cemi, nome_cemi, email, telefone, cidade, endereco, cnpj, data_alt, usu_cad, tx1, tx2, tx3, vl } = req.body;console.log(req.body); 
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!'), console.log(err) }
        else { res.set(result[0]) }
        role = result[0].role;
        if (role === 1) {
            let sql1 = `update cemiterios set nome_cemi = '${nome_cemi}', email='${email}',telefone = '${telefone}',cidade = '${cidade}', endereco = '${endereco}',cnpj = '${cnpj}', data_alt = '${data_alt}', usu_cad = '${usu_cad}',
            tx1 = '${tx1}', tx2 = '${tx2}', tx3 = '${tx3}', vl = '${vl}' where id_cemi = ${id_cemi}`;
            db.query(sql1, (err, result) => {
                if (err) { res.status(404).json('404!2'); console.log(err) }
                else { res.status(200).json("Alterado!") }
            });
        } else {
            res.status(401).json('Usuário Não autorizado!');

        }
    });
}
);
//===========operador========//
app.post("/operador", verify, async (req, res) => {
    const { id_ent, id_user, id_cemi, nome_operador, funcao_operador, telefone, descricao, data_cad, data_alt, usu_cad } = req.body;;
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { { res.status(404).json('404!') } }
        else { res.set(result[0]); }
        role = result[0].role;
        if (role === 3) {
            res.status(401).json('Usuário Não autorizado!');
        } else {
            let sql1 = "insert into operador (id_ent,id_cemi,nome_operador,funcao_operador, telefone, descricao, data_cad, data_alt,usu_cad) values (?,?,?,?,?,?,?,?,?)";
            db.query(sql1, [id_ent, id_cemi, nome_operador, funcao_operador, telefone, descricao, data_cad, data_alt, usu_cad], (err1, result1) => {
                msg = "Salvo!";
                if (err1) { res.status(404).json('404!') }
                else { res.status(200).json({ result1, msg }) }
            });
        }
    });
});

app.put("/operador/", verify, async (req, res) => {
    const { id_oper, id_user, id_ent, nome_operador, funcao_operador, telefone, descricao, data_cad, data_alt, usu_cad } = req.body;
    //const {data_cad} = Date.now();  
    let Sql = `select role from usuarios where id_user = ${id_user}`; console.log('r', req.body);
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.set(result[0]) }
        role = result[0].role;
        if (role === 3) {
            res.status(401).json('Usuário não autorizado');
        } else {
            let sql1 = `update operador set id_ent = ${id_ent}, nome_operador = '${nome_operador}', funcao_operador = '${funcao_operador}', 
            telefone='${telefone}',descricao = '${descricao}', data_cad = '${data_cad}', data_alt = '${data_alt}',usu_cad = '${usu_cad}' where id_oper = ${id_oper}`;
            db.query(sql1, (err) => {
                if (err) { res.status(404).json('404!') }
                else { res.status(200).json('Alterado!') }
                //res.json({ result, msg });             
            });
        }
    });
}
);

app.get("/operadores/:id_cemi", verify, (req, res) => {
    const { id_cemi } = req.params;
    let SQL = `select * from operador where id_cemi = ${id_cemi}`;
    db.query(SQL, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.send({ result }) }
    });
});

app.get("/operador/:id_oper", verify, (req, res) => {
    const { id_oper } = req.params;
    let SQL = `select * from operador where id_oper = ${id_oper}`;
    db.query(SQL, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.send({ result }) }
    });
});
app.delete("/operador/:id_oper/:usu_cad", verify, (req, res) => {
    const { id_oper, usu_cad } = req.params;
    let Sql = `select role from usuarios where id_user = ${usu_cad}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.set(result[0]) }
        if (result[0].role === 1) {
            let SQL = `delete from operador where id_oper = ${id_oper}`;
            db.query(SQL, (err) => {
                if (err) { res.status(405).json('Não é Possivel excluir: Registro Chave') }
                else { res.status(200).json('Excluído!') }
            });
        } else { res.status(401).json('Usuário Não autorizado!'); }
    });
});
//===========imoveis========//
app.post("/imoveisPesq", (req, res) => {
    let { id_ent, campo, text1, text2, limit_rows } = req.body;
    let CONDICAO = '';
    if (text1 === '') { CONDICAO = `imoveis.inscricao like "${text1}%" order by imoveis.cod_imovel desc` } else {
        switch (campo) {
            case 'data_cad': CONDICAO = `imoveis.${campo} between "${text1.replace('/','-')}" and "${text2.replace('/','-')}" order by imoveis.cod_imovel desc`; break;
            case 'cod_imovel': CONDICAO = `imoveis.cod_imovel like "${text1}%"`; break;
            case 'inscricao': CONDICAO = `imoveis.inscricao like "${text1.replaceAll('.','')}%" order by imoveis.cod_imovel desc`; break;
            case 'nome_pessoa': CONDICAO = `pessoas.nome_pessoa like "${text1}%" order by imoveis.cod_imovel desc`; break;
            case 'cpf_cnpj': CONDICAO = `pessoas.cpf_cnpj like "${text1}%" order by imoveis.cod_imovel desc`; break;
        }
    }
    if (CONDICAO) {
        let sql = `select imoveis.id_ent, imoveis.id_imovel, imoveis.cod_imovel, imoveis.id_pessoa,imoveis.id_user, imoveis.cod_pessoa, imoveis.inscricao, imoveis.num_imovel, logradouros.nome_log,logradouros.bairro_log,logradouros.cidade_log,logradouros.uf_log,logradouros.cep_log,loteamentos.id_lote, loteamentos.nome_lote,
        imoveis.area_terreno,imoveis.area_construida,imoveis.valor_venal,imoveis.valor_total,imoveis.pago,imoveis.situacao, imoveis.cod_log, imoveis.lote, imoveis.quadra, imoveis.tipo_imovel, imoveis.valor_total,imoveis.tipo_localizacao, pessoas.id_pessoa, pessoas.nome_pessoa, pessoas.cpf_cnpj, 
        (select sum(dividas.valor_total) from dividas where dividas.pago = 'N' and dividas.id_imovel = imoveis.id_imovel ) as divida_total FROM imoveis 
        LEFT JOIN logradouros ON logradouros.id_log = imoveis.id_log LEFT JOIN loteamentos ON loteamentos.id_lote = imoveis.id_lote LEFT JOIN pessoas ON pessoas.id_pessoa = imoveis.id_pessoa 
        where imoveis.id_ent = ${id_ent} and ${CONDICAO} limit ${limit_rows}`; console.log(sql)
        db.query(sql, (err, result) => { 
            if (err) { res.status(404).json('404!'); console.log(err) }
            else res.send(result);
        });
    }
});


app.put("/calcImovel/", verify, async (req, res) => {
    let { id_ent, id_user, id_imovel, tipo_imovel, area_terreno, area_construida, padrao, valor_m2, tx1, tx2, tx3, desconto, desconto_antec, data_alt, usu_cad } = req.body;
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('4041!') }
        else { res.set(result[0]) }
        role = result[0].role;
        if (role === 3) {
            res.status(401).json('Usuário não autorizado');
        } else {
            if (!padrao) {
                res.status(203).json({ id_imovel, msg: 'Sem Valor Unitário! (Padrão)' });
            } else {
                let Sql1 = `select valor_unitario as valor_unitario from padrao WHERE cod_padrao = '${padrao}' and id_ent = ${id_ent}`;
                db.query(Sql1, (err, result1) => {
                    res.set(result1[0]);
                    let valor_unitario = result1[0].valor_unitario;
                    if (tipo_imovel === 0) {
                        res.status(203).json({ id_imovel, msg: 'Aliquota Vazio (Tipo Imovel)!' });
                    }
                    else {
                        let Sql2 = `select aliq as aliq from tipo_imovel WHERE cod_tipo_imovel = '${tipo_imovel}' and id_ent = ${id_ent}`;
                        db.query(Sql2, (err, result2) => {
                            if (err) { console.log(err) }
                            else {    // valor_m2 = ${valor_m2}, 
                                res.set(result2[0]);
                                if (!desconto) { desconto = 0 }
                                let aliq = result2[0].aliq;
                                let valor_venal = parseFloat(area_terreno) * parseFloat(valor_m2) + parseFloat(area_construida) * parseFloat(valor_unitario);
                                let valor_iptu = parseFloat(valor_venal) * aliq / 100;
                                let valor_total = valor_iptu + parseFloat(tx1) + parseFloat(tx2) + parseFloat(tx3) - parseFloat(desconto);
                                let desc1 = valor_total * desconto_antec / 100;
                                let valor_antec = valor_total - desc1;
                                let sql3 = `update imoveis set valor_venal = ${valor_venal}, valor_unitario = '${valor_unitario}', aliquota = '${aliq}', valor_iptu = '${valor_iptu}', valor_total = '${valor_total}', valor_antec = '${valor_antec}', data_alt = '${data_alt}', usu_cad = '${usu_cad}' where id_imovel = ${id_imovel}`;
                                db.query(sql3, (err) => {
                                    if (err) { res.status(404).json('Erro ao Calcular!') }
                                    else {
                                        if (valor_venal === 0) { res.status(203).json({ id_imovel, msg: `Erro ao gerar Valor Venal: \n Dados Insuficiente!` }) }
                                        else {
                                            res.json({ id_imovel })
                                        }
                                    }
                                });

                            }
                        });

                    }
                });
            }
        }
    });
}
);

app.put("/calcImovelALL/", verify, async (req, res) => {
    const { id_ent, inscricao, id_user, desconto_antec, usu_cad } = req.body;
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { //res.set(result[0])   
            if (result[0].role === 1) {
                let Sql1 = `select id_imovel,tipo_imovel, area_terreno,area_construida, padrao, valor_m2, desconto from imoveis WHERE id_ent = ${id_ent} and ${inscricao}`;
                db.query(Sql1, (err, result0) => {
                    if (err) { res.status(404).json('4042!'), console.log(err) }
                    else { res.set(result0); }
                    const arrImoveis = result0;
                    //let id_imovel = 0; 
                    let i = 0;
                    do {
                        let id_imovel = arrImoveis[i].id_imovel;
                        let tipo_imovel = arrImoveis[i].tipo_imovel;
                        let area_terreno = arrImoveis[i].area_terreno;
                        let area_construida = arrImoveis[i].area_construida;
                        let padrao = arrImoveis[i].padrao;
                        let valor_m2 = arrImoveis[i].valor_m2;
                        let desconto = arrImoveis[i].desconto;
                        let data_alt = new Date().toLocaleString();

                        let Sql1 = `select valor_unitario as valor_unitario from padrao WHERE cod_padrao = ${padrao | 0} and id_ent = ${id_ent}`;
                        db.query(Sql1, (err, result1) => {
                            if (err) { res.status(404).json('4042!'), console.log(err) }
                            else { res.set(result1[0]); }
                            let valor_unitario = result1[0].valor_unitario;
                            if (valor_unitario) {
                                let valor_venal = parseFloat(area_terreno | 0) * parseFloat(valor_m2 | 0) + parseFloat(area_construida | 0) * parseFloat(valor_unitario);
                                if (valor_venal) {
                                    let Sql2 = `select aliq as aliq from tipo_imovel WHERE cod_tipo_imovel = ${tipo_imovel | 0} and id_ent = ${id_ent}`;
                                    db.query(Sql2, (err, result2) => {
                                        if (err) { res.status(404).json('4043!'), console.log(err) }
                                        else { res.set(result2[0]); }
                                        let aliq = result2[0].aliq;
                                        if (aliq) {
                                            let valor_iptu = parseFloat(valor_venal) * aliq / 100;
                                            let valor_total = valor_iptu - parseFloat(desconto);
                                            let desc1 = valor_total * desconto_antec / 100;
                                            let valor_antec = valor_total - desc1;
                                            let sql3 = `update imoveis set valor_venal = ${valor_venal}, valor_unitario = '${valor_unitario}', aliquota = '${aliq}', valor_iptu = '${valor_iptu}', valor_total = '${valor_total}', valor_antec = '${valor_antec}', data_alt = '${data_alt}', usu_cad = '${usu_cad}' where id_imovel = ${id_imovel}`;
                                            db.query(sql3, (err) => {
                                                let msg = 'Calculado!'
                                                if (err) { res.status(404).json('4044!'); console.log(err) }
                                                else { res.status(201).json({ id_imovel, msg }) }
                                            });
                                        }
                                    });
                                }
                            } else { //se for terreno cai aqui dentro
                                let valor_venal = parseFloat(area_terreno | 0) * parseFloat(valor_m2 | 0);
                                if (valor_venal) {
                                    let Sql2 = `select aliq as aliq from tipo_imovel WHERE cod_tipo_imovel = '2' and id_ent = ${id_ent}`;
                                    db.query(Sql2, (err, result2) => {
                                        if (err) { res.status(404).json('Sem tipo_imovel(apoio)'), console.log(err) }
                                        else { res.set(result2[0]); }
                                        let aliq = result2[0].aliq;
                                        if (aliq) {
                                            let valor_iptu = parseFloat(valor_venal) * aliq / 100;
                                            let valor_total = valor_iptu - parseFloat(desconto);
                                            let desc1 = valor_total * desconto_antec / 100;
                                            let valor_antec = valor_total - desc1;
                                            let sql3 = `update imoveis set valor_venal = ${valor_venal}, valor_unitario = '${valor_unitario | 0}', aliquota = '${aliq}', valor_iptu = '${valor_iptu}', valor_total = '${valor_total}', valor_antec = '${valor_antec}', data_alt = '${data_alt}', usu_cad = '${usu_cad}' where id_imovel = ${id_imovel}`;
                                            db.query(sql3, (err) => {
                                                let msg = 'Calculado!'
                                                if (err) { res.status(404).json('4044!'); console.log(err) }
                                                else { res.status(201).json({ id_imovel, msg }) }
                                            });
                                        }
                                    });
                                }
                            }
                        });
                        i++;
                    }
                    while (i < arrImoveis.length);
                });
            } else { res.status(401).json('Usuário Não autorizado!'); }
        }
    })
});

app.get('/imovelId/:id_imovel/', verify, function (req, res) {
    const { id_imovel } = req.params;
    let sql = `select imoveis.id_ent, imoveis.id_imovel,imoveis.cod_imovel, imoveis.id_pessoa,imoveis.id_pessoa_resp, imoveis.id_user, imoveis.cod_pessoa, imoveis.inscricao, imoveis.inscricao_ant, imoveis.id_log,imoveis.id_lote, imoveis.situacao, imoveis.cod_log,imoveis.cod_lote,loteamentos.nome_lote, imoveis.num_imovel, 
imoveis.lote, imoveis.quadra, imoveis.tipo_imovel,imoveis.tipo_localizacao, imoveis.situacao_imovel, imoveis.isencao, imoveis.patrimonio_terr, imoveis.patrimonio_constru, imoveis.uso_solo, imoveis.coleta, imoveis.coletor,imoveis.elevacao, 
imoveis.coberta, imoveis.conservacao, imoveis.padrao, imoveis.pedologia, imoveis.especie, imoveis.construcao_piso, imoveis.topografia, imoveis.serv_agua, imoveis.serv_ilumin, imoveis.serv_pavimen, imoveis.serv_energ,
imoveis.serv_esgoto,imoveis.serv_galeria, imoveis.limit_alagado, imoveis.limit_scalc, imoveis.limit_smuro, imoveis.sanitaria, imoveis.alinhamento, imoveis.limit_encrav, imoveis.limit_acident, 
imoveis.posicao, imoveis.complemento,imoveis.face,imoveis.area_terreno, imoveis.area_construida,imoveis.tx1,imoveis.tx2,imoveis.tx3,imoveis.profund,imoveis.num_frente,imoveis.num_unid,imoveis.num_pav,imoveis.testada_r,imoveis.testada_f,imoveis.lateral_esq,
imoveis.lateral_dir,imoveis.m_fundos,imoveis.valor_vlog,imoveis.valor_unitario,imoveis.valor_venal,imoveis.venal_inf,imoveis. aliquota,imoveis.valor_iptu,imoveis.desconto,imoveis.valor_total,imoveis.pago,imoveis.obs,
imoveis.data_cad, imoveis.data_alt, imoveis.usu_cad, logradouros.nome_log,logradouros.bairro_log,logradouros.cidade_log,logradouros.cep_log, logradouros.uf_log,logradouros.valor_m2, p1.cod_pessoa, p1.nome_pessoa,p1.cpf_cnpj, p1.rua, p1.numero, p1.bairro, p1.cidade, p1.cep, p1.uf,p2.nome_pessoa as nome_resp,p2.cpf_cnpj as cpf_cnpj_resp
from imoveis LEFT JOIN logradouros ON logradouros.id_log = imoveis.id_log LEFT JOIN loteamentos ON loteamentos.id_lote = imoveis.id_lote LEFT JOIN pessoas p1 ON p1.id_pessoa = imoveis.id_pessoa LEFT JOIN pessoas p2 ON p2.id_pessoa = imoveis.id_pessoa_resp where imoveis.id_imovel = ${id_imovel}`;
    db.query(sql, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.send(result); }
    });
});

app.post("/imoveis", verify, async (req, res) => {
    let { id_ent, id_pessoa, id_pessoa_resp, id_user, cod_pessoa, inscricao, inscricao_ant, id_log, cod_log, num_imovel, id_lote, cod_lote, lote, quadra, situacao, tipo_imovel, tipo_localizacao, situacao_imovel, isencao, patrimonio_terr, patrimonio_constru,
        uso_solo, coleta, coletor, elevacao, coberta, conservacao, padrao, pedologia, especie, construcao_piso, topografia, serv_agua, serv_ilumin, serv_pavimen, serv_energ, serv_esgoto, serv_galeria, limit_alagado, limit_scalc, limit_smuro, sanitaria, alinhamento,
        limit_encrav, limit_acident, posicao, complemento, face, area_terreno, area_construida, tx1, tx2, tx3, profund, num_frente, num_unid, num_pav, testada_r, testada_f, lateral_esq, lateral_dir, m_fundos, valor_m2, valor_vlog, valor_unitario, valor_venal, venal_inf,
        aliquota, valor_iptu, desconto, valor_total, obs, exercicio, pago, nossonum, data_cad, data_alt, usu_cad } = req.body;
    if (!tipo_localizacao) { tipo_localizacao = 'U' };
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { return res.status(404).json('erro'), console.log(err) }
        else { res.set(result[0]) }
        role = result[0].role;
        if (role === 3) {
            res.status(401).json('Usuário não autorizado')
        } else {
            let sql = `select imoveis.id_imovel from imoveis WHERE imoveis.id_ent = '${id_ent}' and imoveis.inscricao = '${inscricao.replaceAll(".", "")}'`;
            db.query(sql, (err, result) => {
                let resSelc = result.length;
                if (resSelc) {
                    res.status(203).json({ msg: 'Inscrição já cadastrada!' })
                } else {
                    let SelCod = `select max(cod_imovel) as cod_imovel from imoveis WHERE id_ent = ${id_ent}`;
                    db.query(SelCod, (err, result2) => {
                        if (err) { res.status(404).json('404!'), console.log(err) }
                        else { res.set(result2[0]); }

                        let cod_imovel = result2[0].cod_imovel + 1;
                        if (cod_imovel) {
                            if (!inscricao) { inscricao = cod_imovel } //<--em caso de parametros estiver com insc_sqc = 'S'
                            let SQL = `insert into imoveis (id_ent, cod_imovel, id_pessoa,id_pessoa_resp,id_user, cod_pessoa, inscricao,inscricao_ant,id_log,id_lote,cod_lote, situacao, cod_log, num_imovel, 
                lote, quadra, tipo_imovel,tipo_localizacao,situacao_imovel, isencao,patrimonio_terr,patrimonio_constru, uso_solo, coleta,coletor, elevacao, coberta, conservacao,
                 padrao, pedologia, especie,construcao_piso, topografia,serv_agua, serv_ilumin, serv_pavimen, serv_energ,serv_esgoto, serv_galeria,limit_alagado, 
                 limit_scalc,limit_smuro,sanitaria,alinhamento, limit_encrav,limit_acident, posicao,complemento,face,area_terreno,area_construida, tx1, 
                 tx2, tx3,profund,num_frente,num_unid,num_pav,testada_r, testada_f, lateral_esq,lateral_dir,m_fundos,valor_m2,
                 valor_vlog, valor_unitario,valor_venal,venal_inf, aliquota,valor_iptu,desconto, valor_total,obs,exercicio,pago,nossonum, data_cad, data_alt, usu_cad ) 
                values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                            db.query(SQL, [id_ent, cod_imovel, id_pessoa, id_pessoa_resp, id_user, cod_pessoa, inscricao.replaceAll(".", ""), inscricao_ant.replaceAll(".", ""), id_log, id_lote, cod_lote, situacao, cod_log, num_imovel,
                                lote, quadra, tipo_imovel, tipo_localizacao, situacao_imovel, isencao, patrimonio_terr, patrimonio_constru, uso_solo, coleta, coletor, elevacao, coberta, conservacao,
                                padrao, pedologia, especie, construcao_piso, topografia, serv_agua, serv_ilumin, serv_pavimen, serv_energ, serv_esgoto, serv_galeria, limit_alagado,
                                limit_scalc, limit_smuro, sanitaria, alinhamento, limit_encrav, limit_acident, posicao, complemento, face, area_terreno, area_construida, tx1,
                                tx2, tx3, profund, num_frente, num_unid, num_pav, testada_r, testada_f, lateral_esq, lateral_dir, m_fundos, valor_m2,
                                valor_vlog, valor_unitario, valor_venal, venal_inf, aliquota, valor_iptu, desconto, valor_total, obs, exercicio, pago, nossonum, data_cad, data_alt, usu_cad],
                                (err, result2) => {
                                    msg = "Salvo!";
                                    if (err) { res.status(404).json('Campos Obrigatorios'), console.log(err) }
                                    else { res.status(201).json({ result2, msg }) }
                                });
                        } else {
                            console.log('Erro ao Gerar Codigo')
                        }
                    });
                }
            });
        }
    });
});

app.put("/imoveisPut/", async (req, res) => {
    let { id_imovel, id_pessoa, id_pessoa_resp, id_user, cod_pessoa, cod_imovel, inscricao, inscricao_ant, id_log, cod_log, num_imovel, id_lote, lote, quadra, situacao, tipo_imovel, tipo_localizacao, situacao_imovel, isencao, patrimonio_terr, patrimonio_constru,
        uso_solo, coleta, coletor, elevacao, coberta, conservacao, padrao, pedologia, especie, construcao_piso, topografia,
        serv_agua, serv_ilumin, serv_pavimen, serv_energ, serv_esgoto, serv_galeria, limit_alagado, limit_scalc, limit_smuro, sanitaria, alinhamento,
        limit_encrav, limit_acident, posicao, complemento, face,
        area_terreno, area_construida, tx1, tx2, tx3, profund, num_frente, num_unid, num_pav, testada_r, testada_f, lateral_esq, lateral_dir, m_fundos, aliquota, obs, data_cad, data_alt, usu_cad } = req.body;
    // inscricao = inscricao.replace(".", "");
    // inscricao_ant = inscricao_ant.replace(".", ""); 
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, resul) => {
        if (err) { res.status(404).json('404!') }
        else { res.set(resul[0]) }
        role = resul[0].role;
        if (role === 3) {
            res.status(401).json('Usuário não autorizado')
        } else {
            let sql = `select imoveis.id_imovel from imoveis WHERE imoveis.inscricao = '${inscricao.replaceAll(".", "")}' and imoveis.id_imovel != ${id_imovel}`;
            db.query(sql, (err, result) => {
                let resSelc = result.length;
                if (resSelc) {
                    res.status(203).json({ id_imovel, msg: 'Inscrição já cadastrada!' })
                } else {
                    //  res.set(result1[0]);  
                    //valor_m2 = '${valor_m2}',valor_vlog = ${valor_vlog},valor_unitario = '${valor_unitario}',valor_venal = '${valor_venal}',venal_inf = '${venal_inf}', aliquota = '${aliquota}',valor_iptu = '${valor_iptu}', desconto = '${desconto}', valor_total = ${valor_total},
                    if (!inscricao) { inscricao = cod_imovel } //<--em caso de parametros estiver com insc_sqc = 'S'
                    let sql1 = `update imoveis set id_pessoa = ${id_pessoa},id_pessoa_resp = ${id_pessoa_resp}, id_user = ${id_user}, cod_pessoa = ${cod_pessoa}, inscricao = '${inscricao.replaceAll(".", "")}',inscricao_ant = '${inscricao_ant.replaceAll(".", "")}',id_log = ${id_log}, cod_log = ${cod_log}, num_imovel = '${num_imovel}',
            id_lote = ${id_lote}, lote = '${lote}', quadra = '${quadra}', situacao = ${situacao}, tipo_imovel = '${tipo_imovel}',tipo_localizacao = '${tipo_localizacao}', situacao_imovel = '${situacao_imovel}', isencao = ${isencao},patrimonio_terr = '${patrimonio_terr}',patrimonio_constru = '${patrimonio_constru}',
            uso_solo = ${uso_solo}, coleta = ${coleta},coletor = '${coletor}', elevacao = '${elevacao}', coberta = '${coberta}', conservacao = '${conservacao}', padrao = '${padrao}', pedologia = '${pedologia}', especie = ${especie},construcao_piso = '${construcao_piso}', topografia = '${topografia}',
            serv_agua = ${serv_agua}, serv_ilumin = ${serv_ilumin}, serv_pavimen = ${serv_pavimen}, serv_energ = ${serv_energ},serv_esgoto = ${serv_esgoto}, serv_galeria = ${serv_galeria},limit_alagado = '${limit_alagado}', limit_scalc = '${limit_scalc}',limit_smuro = '${limit_smuro}',sanitaria = '${sanitaria}',alinhamento = '${alinhamento}',
            limit_encrav = '${limit_encrav}',limit_acident = '${limit_acident}', posicao = '${posicao}', complemento = '${complemento}', face = '${face}', 
            area_terreno = ${area_terreno},area_construida = ${area_construida}, tx1 = '${tx1}', tx2 = '${tx2}', tx3 = '${tx3}', profund = '${profund}',num_frente = '${num_frente}',num_unid = '${num_unid}',num_pav = '${num_pav}',testada_r = '${testada_r}', testada_f = '${testada_f}', lateral_esq = '${lateral_esq}',lateral_dir = '${lateral_dir}',m_fundos ='${m_fundos}',  
            aliquota = '${aliquota}',obs = '${obs}',
            data_cad = '${data_cad}', data_alt = '${data_alt}', usu_cad = '${usu_cad}' where id_imovel = ${id_imovel}`;
                    db.query(sql1, (err) => {
                        if (err) { res.status(404).json('Erro'); console.log(err) }
                        else { res.status(201).json({ id_imovel, msg: 'Alterado!' }) }
                        //res.json({ result, msg }); 
                    });
                }
            });

        }
    });
}
);
app.delete("/delImovel/:id_imovel/:id_user", verify, (req, res) => {
    const { id_imovel, id_user } = req.params;
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.set(result[0]) }
        role = result[0].role;
        if (role === 3) {
            res.status(401).json('Usuário não autorizado');
        } else {
            let SQL = `select imoveis.pago from imoveis where id_imovel = ${id_imovel}`;
            db.query(SQL, id_imovel, (err, result) => {
                if (result[0].pago === 'S') {
                    res.status(405).json('Impossível Excluir: IPTU Pago!')
                } else {
                    let SQL1 = `delete from imoveis where id_imovel = ${id_imovel}`;
                    db.query(SQL1, id_imovel, (err) => {
                        if (err) { res.status(405).json("Erro 404!") }
                        else { res.status(200).json('Excluído!') }
                    });
                }
            });
        }
    });
});

app.put("/baixarIPTU/:id_user/:id_imovel/:opcao/:data_pgmto", verify, (req, res) => {
    let { id_user, id_imovel, opcao, data_pgmto } = req.params;
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.set(result[0]) }
        role = result[0].role;
        if (role === 1) {
            let Sql = `select imoveis.id_ent, imoveis.id_pessoa, imoveis.valor_total,imoveis.exercicio, imoveis.pago from imoveis where imoveis.id_imovel = ${id_imovel}`;
            db.query(Sql, (err, result) => {
                if (err) { res.status(404).json('404!') }
                else {
                    res.set(result[0]);
                    let id_ent = result[0].id_ent;
                    let id_pessoa = result[0].id_pessoa;
                    let valor_total = result[0].valor_total;
                    let exercicio = result[0].exercicio;
                    data_pgmto = data_pgmto.split('-').reverse().join('/');
                    if (result[0].pago === 'S') {
                        let SQL = `delete from lancmtos where cod_insc = ${id_imovel} and lancmtos.referencia = ${exercicio}`;
                        db.query(SQL, id_imovel, (err) => {
                            if (err) { res.status(405).json('Erro ao baixar1!') }
                            else {
                                let SQL = `delete from lancmtos_detalhado where cod_insc = ${id_imovel} and lancmtos_detalhado.referencia = ${exercicio}`;
                                db.query(SQL, id_imovel, (err) => {
                                    if (err) { res.status(405).json('Erro ao baixar2!') }
                                    else {
                                        let SQL = `update imoveis set imoveis.pago = 'N' where imoveis.id_imovel = ${id_imovel}`;
                                        db.query(SQL, (err) => {
                                            if (err) { res.status(405).json('Erro ao baixar!') }
                                            else {
                                                res.status(201).json({ id_imovel, msg: 'Estorno Realizado!' });
                                            }
                                        })
                                    }
                                });
                            }
                        });
                    } else {
                        let SelCodLog = `select max(cod_lanc) as cod_lanc FROM lancmtos WHERE id_ent = ${id_ent}`;
                        db.query(SelCodLog, (err, result) => {
                            if (err) { res.status(404).json('404!'), console.log('errLOG', err) }
                            else {
                                res.set(result[0]);
                                let cod_lanc = result[0].cod_lanc + 1;
                                if (cod_lanc) {
                                    let situacao = 'E'; let pago = 'S'; let parc = opcao; let cod_rec = '1000'; let desc_lanc = 'I.P.T.U.'; let referencia = exercicio; let cod_insc = id_imovel; let valor_real = valor_total;
                                    let SQLi = "insert into lancmtos (id_ent,cod_lanc,id_pessoa, id_user,cod_rec,desc_lanc,referencia,cod_insc, valor_real,parc,situacao,pago,data_pgmto) values (?,?,?,?,?,?,?,?,?,?,?,?,?)";
                                    db.query(SQLi, [id_ent, cod_lanc, id_pessoa, id_user, cod_rec, desc_lanc, referencia, cod_insc, valor_real, parc, situacao, pago, data_pgmto], (err1, result2) => {
                                        if (err1) { console.log(err1) }
                                        else {
                                            res.set(result2[0]);
                                            let id_lanc = result2.insertId;
                                            if (id_lanc) {
                                                let cod_lancdet = id_lanc;
                                                let SQLi = "insert into lancmtos_detalhado (id_ent,cod_lancdet,id_pessoa,id_user,cod_rec,referencia,cod_insc,valor_real, situacao, pago,data_pgmto) values (?,?,?,?,?,?,?,?,?,?,?)";
                                                db.query(SQLi, [id_ent, cod_lancdet, id_pessoa, id_user, cod_rec, referencia, cod_insc, valor_real, situacao, pago, data_pgmto], (err1, result) => {
                                                    if (err1) { console.log(err1) }
                                                    else {
                                                        let SQL = `update imoveis set imoveis.pago = 'S' where imoveis.id_imovel = ${id_imovel}`;
                                                        db.query(SQL, (err) => {
                                                            if (err) { res.status(405).json('Erro ao baixar!') }
                                                            else {
                                                                res.status(201).json({ id_imovel, msg: 'Baixa processada!' })
                                                            }
                                                        })
                                                    }
                                                });
                                            } else { console.log('erro insert lancmtos') }
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            });
        } else {
            res.status(401).json('Usuário Não autorizado!');
        }
    });
});
//===========Tumulos========//
app.post("/tumulosPesq", verify, (req, res) => {
    let { id_ent, campo, text1, text2, limit_rows } = req.body;;
    let CONDICAO = '';
    if (!limit_rows) { limit_rows = 500 }
    if (text1 === '*') { text1 = ''; text2 = '' }
    switch (campo) {
        case 'data_cad': CONDICAO = `tumulos.data_cad between "${text1.replace('/','-')}" and "${text2.replace('/','-')}" order by tumulos.cod_tum desc`; break;
        case 'cod_tum': CONDICAO = `tumulos.cod_tum like '${text1}%'`; break;
        case 'nome_pessoa': CONDICAO = `pessoas.nome_pessoa like "${text1}%" order by tumulos.cod_tum desc`; break;
        case 'cpf_cnpj': CONDICAO = `pessoas.cpf_cnpj like "${text1}%" order by tumulos.cod_tum desc`; break;
    }
    if (CONDICAO) {
        SQL = `select tumulos.id_tum,tumulos.cod_tum,tumulos.id_cemi, tumulos.id_pessoa, tumulos.conserv, tumulos.data_alt, tumulos.data_cad, tumulos.descricao, 
        tumulos.dst, tumulos.st, tumulos.qd, tumulos.lt, tumulos.obs,tumulos.padrao,tumulos.tipo,tumulos.usu_cad,tumulos.area_terreno,tumulos.area_construida,
        tumulos.testada,tumulos.profundidade,tumulos.vl_total,tumulos.situacao,pessoas.id_pessoa, 
        pessoas.nome_pessoa,pessoas.cpf_cnpj,pessoas.rua,pessoas.numero,pessoas.bairro,pessoas.cidade,pessoas.uf,pessoas.telefone,pessoas.fixo,pessoas.email,cemiterios.id_cemi,cemiterios.nome_cemi FROM tumulos 
        LEFT JOIN cemiterios ON cemiterios.id_cemi = tumulos.id_cemi 
        LEFT JOIN pessoas ON pessoas.id_pessoa = tumulos.id_pessoa where tumulos.id_ent = ${id_ent} and ${CONDICAO} limit ${limit_rows} `;
        db.query(SQL, (err, result) => { console.log(SQL);
            if (err) { res.status(404).json('404!') }
            else res.send(result);
        });
    }
});

app.get('/tumId/:id_tum/', verify, function (req, res) {
    const { id_tum } = req.params;
    let sql = `select tumulos.id_tum,tumulos.cod_tum,tumulos.id_cemi, tumulos.id_pessoa,tumulos.conserv, tumulos.data_alt, tumulos.data_cad, tumulos.descricao, 
    tumulos.dst, tumulos.st, tumulos.qd, tumulos.lt, tumulos.obs,tumulos.padrao,tumulos.tipo,tumulos.usu_cad,tumulos.area_terreno,tumulos.area_construida,
    tumulos.testada,tumulos.profundidade,tumulos.vl_total,tumulos.tx1,tumulos.tx2,tumulos.tx3,tumulos.vl,tumulos.desconto,tumulos.situacao,pessoas.id_pessoa, 
    pessoas.nome_pessoa,pessoas.cpf_cnpj,pessoas.rua,pessoas.numero,pessoas.bairro,pessoas.cidade,pessoas.uf,pessoas.telefone,pessoas.fixo,pessoas.email,cemiterios.id_cemi,cemiterios.nome_cemi FROM tumulos LEFT JOIN cemiterios ON cemiterios.id_cemi = tumulos.id_cemi 
    LEFT JOIN pessoas ON pessoas.id_pessoa = tumulos.id_pessoa where tumulos.id_tum = ${id_tum}`;
    db.query(sql, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.send(result); }
    });
});

app.delete("/delTum/:id_tum/:usu_cad", verify, (req, res) => {
    const { id_tum, usu_cad } = req.params;
    let Sql = `select role from usuarios where id_user = ${usu_cad}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.set(result[0]) }
        role = result[0].role;
        if (role === 3) {
            res.status(401).json('Usuário não autorizado');
        } else {
            let SQL = `delete from tumulos where id_tum = ${id_tum}`;
            db.query(SQL, id_tum, (err) => {
                if (err) { res.status(405) }
                else { res.status(200).json("Excluído!") }
            });
        }
    });
});

app.post("/postTum", verify, async (req, res) => {
    let { id_ent, id_cemi, id_user, id_pessoa, dst, st, qd, lt, cor, tipo, conserv, padrao,
        inscricao, descricao, obs, usu_cad, data_cad, data_alt, area_terreno, area_construida,
        testada, profundidade, tx1, tx2, tx3, vl, desconto, situacao } = req.body; 
    //const {data_cad} = Date.now();
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.json('404!') }
        else { res.set(result[0]) }
        role = result[0].role;
        if (role === 3) {
            res.status(401).json('Usuário não autorizado')
        } else {
            let SelCod = `select max(cod_tum) as cod_tum from tumulos WHERE id_ent = ${id_ent}`;
            db.query(SelCod, (err, result) => {
                if (err) { res.status(404).json('404!') }
                else { res.set(result[0]); }
                let vl_total = parseFloat(vl) + parseFloat(tx1) + parseFloat(tx2) + parseFloat(tx3);
       
                let cod_tum = result[0].cod_tum + 1;
                if (cod_tum) {
                    inscricao = cod_tum;
                    let SQL = `insert into tumulos (id_ent, cod_tum, id_cemi, id_pessoa, dst, st, qd, lt, cor, tipo, conserv, padrao, inscricao, descricao, obs,usu_cad,data_cad,data_alt,area_terreno,area_construida,testada, profundidade, vl_total,tx1, tx2, tx3, vl, desconto,situacao) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                    db.query(SQL, [id_ent, cod_tum, id_cemi, id_pessoa, dst, st, qd, lt, cor, tipo, conserv, padrao, inscricao, descricao, obs, usu_cad, data_cad, data_alt, area_terreno, area_construida,
                        testada, profundidade, vl_total, tx1, tx2, tx3, vl, desconto, situacao], (err, result1) => {
                            if (err) { console.log(err) }
                            else { res.json({ result1, msg:'Salvo' }) }
                        });
                } else {
                    console.log('Erro ao Gerar Codigo! linha:420')
                }
            });
        }
    });
});

/* update com as variaveis direto na boca do campo, não é vatagem tem que especificar se é strint ou int, com ? não precisa. */
app.put("/putTum/", async (req, res) => {
    const { id_tum, id_cemi, id_user, id_pessoa, dst, st, qd, lt, tipo, conserv, padrao, inscricao, descricao, obs, usu_cad, data_alt, area_terreno, area_construida, testada,
        profundidade, tx1, tx2, tx3, vl, desconto, situacao } = req.body;
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!'); console.log(err) }
        else { res.set(result[0]) }
        role = result[0].role;
        if (role === 3) {
            res.status(401).json('Usuário não autorizado')
        } else {
              let vl_total = parseFloat(vl) + parseFloat(tx1) + parseFloat(tx2) + parseFloat(tx3);
            let sql = `update tumulos set id_cemi = ${id_cemi}, id_pessoa = ${id_pessoa}, dst = '${dst}',st = '${st}',qd = '${qd}',lt = '${lt}', tipo = ${tipo}, conserv = ${conserv}, padrao = ${padrao}, 
            inscricao = '${inscricao}', descricao = ${descricao}, obs = '${obs}',usu_cad = '${usu_cad}',data_alt = '${data_alt}',
            area_terreno = '${area_terreno}',area_construida = '${area_construida}',testada = '${testada}',profundidade = '${profundidade}',vl_total = '${vl_total}', tx1 = '${tx1}', tx2 = '${tx2}', tx3 = '${tx3}', vl = '${vl}', desconto = '${desconto}', situacao = '${situacao}' where id_tum = ${id_tum}`;
            db.query(sql, (err) => {
                if (err) { res.status(404).json('404!'); console.log(err) }
                else { res.status(200).json("Alterado!") }
                //res.json({ result, msg });             
            });
        }
    });
}
);
//===========sepultamentos========//
app.post("/sepPost", async (req, res) => {
    const { id_ent, id_tum, cod_tum, id_user, id_pessoa_sep,id_pessoa, id_cemi,id_oper,septdo, cpf_cnpj_septdo, familia,filiacao,num_obito, cov, cod_gaveta, descricao,
        situacao_pgmto, cod_rec, data_cad, data_ncmto, data_sepmto, usu_cad,id_assin1,id_assin2,id_assin3 } = req.body;
    //permissão de usuário
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.set(result[0]) }
        role = result[0].role;
        if (role === 3) {
            res.status(401).json('Usuário não autorizado')
        } else {
             let cod_rec = '4018';
                                    let sql0 = `select receitas.valor,receitas.id_rec from receitas where receitas.cod_rec = ${cod_rec}`;
                                    db.query(sql0, (err, receita) => {
                                        if (err) { res.status(404).json('404: Receita 4018!'), console.log('err valor rec', err) }
                                    else { //res.set(receita[0])                                       
                                   
            //Gerar codigo do sepmto             
            let SelCod = `select max(cod_sep) as cod_sep FROM sepmtos WHERE id_ent = ${id_ent}`;
            db.query(SelCod, (err, result) => {
                if (err) { res.status(404).json('404!') }
                else { res.set(result[0]) }
                //insert tabela lancmeto                
                let cod_sep = result[0].cod_sep + 1;
                id_lancmto = cod_sep;
                if (id_lancmto) {
                    let vl_total = receita[0].valor; let id_rec = receita[0].id_rec;
                    let SQL = `insert into sepmtos (id_ent, id_tum,cod_tum,id_user,id_pessoa_sep, id_pessoa,id_cemi,id_oper,cod_sep,septdo,cpf_cnpj_septdo,familia,filiacao,num_obito,cov,cod_gaveta,descricao,situacao_pgmto,id_lancmto,cod_rec,data_cad,data_ncmto,data_sepmto,id_rec,vl_total,usu_cad,id_assin1,id_assin2,id_assin3) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                    db.query(SQL, [id_ent, id_tum, cod_tum, id_user,id_pessoa_sep, id_pessoa, id_cemi,id_oper, cod_sep, septdo, cpf_cnpj_septdo, familia,filiacao,num_obito, cov, cod_gaveta, descricao, situacao_pgmto, id_lancmto, cod_rec, data_cad, data_ncmto, data_sepmto,id_rec,vl_total,usu_cad,id_assin1,id_assin2,id_assin3], (err, result2) => {
                        if (err) { console.log('erro 401:', err); res.status(404).json('404!') }
                        else {   
                            let id_sep = result2.insertId;
                            if (id_sep) {
                                let sql1 = `select entidades.dias_venc from entidades where entidades.id_ent = ${id_ent}`;
                                db.query(sql1, (err, entidad) => {
                                 
                                let SelCod = `select max(cod_lanc) as cod_lanc FROM lancmtos WHERE id_ent = ${id_ent}`;
                                db.query(SelCod, (err, result) => {
                                    if (err) { res.status(404).json('404!'), console.log('errLOG', err) }
                                    else { res.set(result[0]) 
                                    
                                    let dataAtual = new Date(); 
                                    dataAtual.setDate(dataAtual.getDate() + entidad[0].dias_venc);
                                    let data_venc = dataAtual.toLocaleDateString('pt-BR');
                                    let data_lanc = data_cad; 
                                    let cod_lanc = result[0].cod_lanc + 1;
                                    let valor_real = receita[0].valor; let id_rec = receita[0].id_rec; let valor_original = receita[0].valor;
                                    let parc = '0'; let situacao = 'E'; let pago = 'N'; let cod_insc = cod_sep; let numero_proc = ("000000" + cod_sep).slice(-6) + '/' + new Date().getFullYear();
                                    let referencia = id_sep; let exercicio = new Date().getFullYear();
                                    let nossonum = exercicio + ("0000" + cod_rec).slice(-4) + ("000000" + cod_sep).slice(-6);
                                    let desc_lanc = `VALOR REFERÊNTE TAXA DE SEPULTAMENTO: ${("000000" + cod_sep).slice(-6)}.`;
                                    let sql2 = "insert into lancmtos (id_ent,cod_lanc,id_pessoa, id_user,cod_rec,id_rec,desc_lanc, valor_real,valor_original,parc,situacao,nossonum,pago,exercicio,cod_insc,numero_proc,data_lanc,data_venc, referencia) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                                    db.query(sql2, [id_ent, cod_lanc, id_pessoa, id_user, cod_rec,id_rec, desc_lanc, valor_real,valor_original, parc, situacao, nossonum, pago, exercicio, cod_insc, numero_proc,data_lanc, data_venc, referencia], (err1, result3) => {
                                        if (err1) { res.status(404).json('404!'), console.log(err1) }
                                        else { 
                                            //res.set(result3[0]) 
                                        let id_lanc = result3.insertId;
                                        if (id_lanc) {
                                            let cod_lancdet = id_lanc; 
                                            let sql3 = "insert into lancmtos_detalhado (id_ent,cod_lancdet,id_pessoa,id_user,cod_rec,id_rec,valor_real, situacao,nossonum,pago,exercicio,cod_insc,numero_proc,referencia) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                                            db.query(sql3, [id_ent, cod_lancdet, id_pessoa, id_user, cod_rec,id_rec, valor_real, situacao, nossonum, pago, exercicio, cod_insc, numero_proc, referencia], (err1, result4) => {
                                                if (err1) {
                                                    res.status(404).json('erro ao Gerar lancmto'); console.log(err1);
                                                } else { 
                                                    res.status(200).json({ id_sep, msg:'Salvo' })
                                                }
                                            });
                                        } else { res.status(404).json('erro ao Gerar lancmto'); console.log('erro ao Gerar lancmto'); }
                                    }
                                    });
                                   
                                }
                                });  
                                    });//fim select dias vencimento

                            }
                        }
                    });
                } else {
                    console.log('Erro ao selecionar codigo lancmtos.')
                }
            });

 }
                                      });//fim select valor rec
        }
    });
});

//update com as variaveis direto na coluna indicada.   
app.put("/sepPut/", async (req, res) => {
    const { id_sep, id_user, familia,filiacao,num_obito, cov, cod_gaveta, descricao,id_oper,data_alt, data_ncmto, data_sepmto, usu_cad } = req.body;
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.set(result[0]); }
        role = result[0].role;
        if (role === 3) {
            res.status(401).json('Usuário não autorizado')
        } else {
            let sql = `update sepmtos set familia = '${familia}',num_obito = '${num_obito}',filiacao = '${filiacao}', cod_gaveta = '${cod_gaveta}', id_oper = '${id_oper}', cov = '${cov}', descricao = '${descricao}', 
            data_alt = '${data_alt}', data_ncmto = '${data_ncmto}', data_sepmto = '${data_sepmto}', id_user = ${id_user}, usu_cad = '${usu_cad}' where id_sep = ${id_sep}`;
            db.query(sql, (err) => {
                if (err) { res.status(404).json('404!') }
                else res.status(200).json("Alterado!");
                //res.json({ result, msg });             
            });
        }
    });
}
);

app.post("/sepmtoPesq", verify, (req, res) => {
    let { id_ent, campo, text1, text2, limit_rows } = req.body;
    let CONDICAO = '';
    if (!limit_rows) { limit_rows = 500 }
    if (text1 === '*') { text1 = ''; text2 = '' }
    switch (campo) {
        case 'data_cad': CONDICAO = `sepmtos.data_cad between "${text1.replace('/','-')}" and "${text2.replace('/','-')}"`; break;
        case 'cod_sep': CONDICAO = `sepmtos.cod_sep like '${text1}%'`; break;
        case 'cod_tum': CONDICAO = `sepmtos.cod_tum like '${text1}%'`; break;
        case 'nome_pessoa': CONDICAO = `sepmtos.septdo like "${text1}%" order by sepmtos.cod_sep desc`; break;
        case 'cpf_cnpj': CONDICAO = `pessoas.cpf_cnpj_septdo like "${text1.replace(/[^0-9]/g, '')}%"`; break;
    }
    if (CONDICAO) {
        SQL = `select tumulos.dst, tumulos.st, tumulos.qd, tumulos.lt,tumulos.tipo, pessoas.id_pessoa, pessoas.nome_pessoa,pessoas.cpf_cnpj,pessoas.rua,pessoas.numero,pessoas.bairro,
                pessoas.cidade,pessoas.uf,pessoas.telefone,pessoas.email,sepmtos.id_sep,sepmtos.cod_tum,sepmtos.cod_sep,sepmtos.septdo,sepmtos.cpf_cnpj_septdo,
                sepmtos.familia,sepmtos.cod_gaveta,sepmtos.cov,sepmtos.descricao,sepmtos.situacao_pgmto,sepmtos.data_cad, sepmtos.vl_total,cemiterios.id_cemi,cemiterios.nome_cemi 
                FROM sepmtos 
                LEFT JOIN tumulos on tumulos.id_tum = sepmtos.id_tum 
                LEFT JOIN cemiterios on cemiterios.id_cemi = sepmtos.id_cemi 
                LEFT JOIN pessoas on pessoas.id_pessoa = sepmtos.id_pessoa 
                where sepmtos.id_ent = ${id_ent} and ${CONDICAO} limit ${limit_rows}`;
        db.query(SQL, (err, result) => { console.log(SQL);
            if (err) { res.status(404).json('404!') }
            else{ res.send(result)}
        });
    }
});

app.get("/sepmtosId_tum/:id_tum", verify, (req, res) => {
    const { id_tum } = req.params;
    let SQL = `select tumulos.dst, tumulos.st, tumulos.qd, tumulos.lt,tumulos.tipo, pessoas.id_pessoa, pessoas.nome_pessoa,pessoas.cpf_cnpj,pessoas.rua,pessoas.numero,pessoas.bairro,
                pessoas.cidade,pessoas.uf,pessoas.telefone,pessoas.email,sepmtos.id_sep,sepmtos.cod_tum,sepmtos.cod_sep,sepmtos.septdo,sepmtos.cpf_cnpj_septdo,
                sepmtos.familia,sepmtos.filiacao,sepmtos.num_obito,sepmtos.cod_gaveta,sepmtos.cov,sepmtos.descricao,sepmtos.situacao_pgmto,sepmtos.data_cad,sepmtos.data_ncmto,sepmtos.data_sepmto, cemiterios.id_cemi,cemiterios.nome_cemi FROM sepmtos LEFT JOIN tumulos on tumulos.id_tum = sepmtos.id_tum 
                LEFT JOIN cemiterios on cemiterios.id_cemi = sepmtos.id_cemi LEFT JOIN pessoas on pessoas.id_pessoa = sepmtos.id_pessoa where sepmtos.id_tum = ${id_tum} 
                order by sepmtos.cod_sep desc`;
    db.query(SQL, (err, result) => {
        if (err) { console.log(err); res.status(404).json('404!') }
        else res.send(result); console.log(result)
    });
});

app.get("/sepmto/:id_sep",
    //verify, 
    (req, res) => {
        const { id_sep } = req.params;
        let SQL = `select tumulos.dst, tumulos.st, tumulos.qd, tumulos.lt,tumulos.tipo, pessoas.id_pessoa, pessoas.nome_pessoa,pessoas.cpf_cnpj,pessoas.rua,pessoas.numero,pessoas.bairro,
                pessoas.cidade,pessoas.uf,pessoas.telefone,pessoas.email,sepmtos.id_sep,sepmtos.id_oper,sepmtos.cod_tum,sepmtos.cod_sep,sepmtos.septdo,sepmtos.cpf_cnpj_septdo,sepmtos.familia,
                sepmtos.filiacao,sepmtos.num_obito,sepmtos.cod_gaveta,sepmtos.cov,sepmtos.descricao,sepmtos.situacao_pgmto,sepmtos.data_cad,sepmtos.data_sepmto,sepmtos.data_ncmto,sepmtos.id_assin1,sepmtos.id_assin2,sepmtos.id_assin3,
                cemiterios.id_cemi,cemiterios.nome_cemi FROM sepmtos LEFT JOIN tumulos on tumulos.id_tum = sepmtos.id_tum
                LEFT JOIN cemiterios on cemiterios.id_cemi = sepmtos.id_cemi LEFT JOIN pessoas on pessoas.id_pessoa = sepmtos.id_pessoa where sepmtos.id_sep = ${id_sep}`;
        db.query(SQL, (err, result) => { console.log(SQL);
            if (err) { res.status(404).json('404!') }
            else { //res.send(result) 
                res.set(result[0]);
            let id_assin1 = result[0].id_assin1; let id_assin2 = result[0].id_assin2; let id_assin3 = result[0].id_assin3;
            if (!id_assin1) { id_assin1 = 0 }
            let sqla1 = `select id_assin,nome,cargo,matricula FROM assinaturas WHERE id_assin = ${id_assin1}`;
            db.query(sqla1, (err, assin1) => {
                if (err) { res.status(404).json('404!2'), console.log('errLOG', err) }
                else { res.set(assin1) }
                if (!id_assin2) { id_assin2 = 0 }
                let sqla2 = `select id_assin,nome,cargo,matricula FROM assinaturas WHERE id_assin = ${id_assin2}`;
                db.query(sqla2, (err, assin2) => {
                    if (err) { res.status(404).json('404!2'), console.log('errLOG', err) }
                    else { res.set(assin2) }
                    if (!id_assin3) { id_assin3 = 0 }
                    let sqla3 = `select id_assin,nome,cargo,matricula FROM assinaturas WHERE id_assin = ${id_assin3}`;
                    db.query(sqla3, (err, assin3) => {
                        if (err) { res.status(404).json('404!2'), console.log('errLOG', err) }
                        else {
                            res.set(assin3)
                            res.status(200).json({ result, assin1, assin2, assin3, msg: 'Salvo!' });
                        }
                    })
                })
            })

            }
        });
    });

app.delete("/delSep/:id_sep/:usu_cad", verify, (req, res) => {
    const { id_sep, usu_cad } = req.params;
    let Sql = `select role from usuarios where id_user = ${usu_cad}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else res.set(result[0]);
        role = result[0].role;
        if (role === 3) {
            res.status(401).json('Usuário não autorizado')
        } else {
            let SQL = `delete from sepmtos where id_sep = ${id_sep}`;
            db.query(SQL, (err) => {
                if (err) { res.status(405) }
                else { res.status(200).json("Excluído!") }
            });
        }
    });
});

//===========Entidade========//
//GET ENTIDADE PARAMETROS Chamada de dentro com Login, chamar entidade individual com todos os campos.
//GET ENTIDADE Chamada de FORA campos especificos para gravar no provid.
// PROVIDE PROVIDE PROVIDE PROVIDE // inicio // em uso
app.get("/EntCod/:cod_ent", (req, res) => {
    const { cod_ent } = req.params;
    let SQL = `select id_ent,cod_ent,entidade,caminho,rua,numero,bairro,cidade,uf,cep,email,cnpj,secretaria,fixo,telefone,exercicio,urlbras,tributos,aliq_itbi,desconto_itbi,imp_itbi,bloq_aliq,venc_itbi,valor_taxa,desconto_antec,msg1,
    campo1_nome,campo2_nome,campo3_nome,campo4_nome,campo5_nome,campo6_nome,campo1_tam,campo2_tam,campo3_tam,tx1,tx2,tx3,ver,calc_imovel,stitulo, desconto_iptu, vvi,maskinsc,insc_seq,maskgrupo,ativo,limit_rows from entidades where cod_ent = ${cod_ent}`;
    db.query(SQL, (err, result) => {
        if (err) { return res.status(404).json('Entidade não localizada!!') }
        else { res.json({ result }); }
    });
});
//get entidade por ID painel em uso 
app.get("/EntId/:id_ent", (req, res) => {
    const { id_ent } = req.params;
    let sqlEnti = `select cod_ent, id_ent, cnpj,rua,numero,bairro, cidade,uf,cep, usu_cad, entidade, telefone,email, fixo,telefone, data_cad, data_alt,caminho,vvi,desconto_iptu,insc_seq,
    lei,secretaria,maskinsc,calc_imovel,decreto,msg4,msg1,msg2,msg3,cep,urlbras,ativo,tributos,venc_unica,venc_antec,venc_dvexercicio,venc_dvtotal,
    campo1_nome,campo2_nome,campo3_nome,campo4_nome,campo5_nome,campo6_nome,campo1_tam,campo2_tam,campo3_tam,tx1, tx2, tx3,aliq_itbi,desconto_itbi,imp_itbi,bloq_aliq,venc_itbi,venc_itbi,venc_unica,
        venc_antec, venc_dvtotal,venc_dvexercicio,venc_unica_cemi,venc_antec_cemi,valor_taxa,desconto_antec,limit_rows,stitulo from entidades where id_ent = ${id_ent}`;
    db.query(sqlEnti, (err, result) => {
        if (err) { res.status(404).json('Entidade não localizada!') }
        else { res.json({ result }) }
    });
});
// app.get("/entidade/:id_ent", (req, res) => {
//     const { id_ent } = req.params;
//     let SQL = `select id_ent, cod_ent, entidade, email, cidade, secretaria,lei, decreto, exercicio, cnpj, msg, msg1, campo1_nome, campo1_tam, campo2_nome, campo2_tam,campo3_nome,campo3_tam,campo4_nome,
//     campo4_tam,campo5_nome,campo5_tam,tx1,tx2,tx3, telefone, data_alt,ativo ver from entidades where id_ent = ${id_ent}`;
//     db.query(SQL, (err, result) => {
//         if (err) { res.status(404).json('404!') }
//         else { res.status(200).json({ result }); }
//         //res.json(result,urlBras);
//     });
// });

app.put("/ajustes", verify, async (req, res) => {
    let { id_ent, calc_imovel, desconto_iptu, vvi, insc_seq, maskinsc, maskgrupo, usu_cad,
        campo1_nome, campo1_tam, campo2_nome, campo2_tam, campo3_nome, campo3_tam, campo4_nome, campo5_nome, campo6_nome, tx1, tx2, tx3, data_alt, aliq_itbi, desconto_itbi, imp_itbi, bloq_aliq, venc_itbi, venc_unica,
        venc_antec, venc_dvtotal, venc_dvexercicio, venc_unica_cemi, venc_antec_cemi, valor_taxa, desconto_antec, limit_rows } = req.body;
    // venc_itbi = venc_itbi.split('-').reverse().join('/');
    // venc_unica = venc_unica.split('-').reverse().join('/');
    // venc_antec = venc_antec.split('-').reverse().join('/');
    // venc_dvtotal = venc_dvtotal.split('-').reverse().join('/');
    // venc_dvexercicio = venc_dvexercicio.split('-').reverse().join('/');
    // venc_unica_cemi = venc_unica_cemi.split('-').reverse().join('/');
    // venc_antec_cemi = venc_antec_cemi.split('-').reverse().join('/');
    let sql = `update entidades set calc_imovel = '${calc_imovel}',desconto_iptu = '${desconto_iptu}',vvi = '${vvi}',insc_seq = '${insc_seq}',maskinsc = '${maskinsc}',maskgrupo = '${maskgrupo}',usu_cad = '${usu_cad}',
        campo1_nome = '${campo1_nome}',campo1_tam = '${campo1_tam}',campo2_nome = '${campo2_nome}',campo2_tam = '${campo2_tam}',campo3_nome = '${campo3_nome}',
        campo3_tam = '${campo3_tam}',campo4_nome = '${campo4_nome}',campo5_nome = '${campo5_nome}',campo6_nome = '${campo6_nome}',tx1 = '${tx1}',tx2 = '${tx2}',tx3 = '${tx3}', data_alt = '${data_alt}',
        aliq_itbi = '${aliq_itbi}',desconto_itbi = '${desconto_itbi}',imp_itbi = '${imp_itbi}',bloq_aliq = '${bloq_aliq}',venc_itbi = '${venc_itbi}',venc_unica = '${venc_unica}',venc_antec = '${venc_antec}',
        venc_dvtotal = '${venc_dvtotal}',venc_dvexercicio = '${venc_dvexercicio}',venc_unica_cemi = '${venc_unica_cemi}',venc_antec_cemi = '${venc_antec_cemi}', valor_taxa = '${valor_taxa}', desconto_antec = '${desconto_antec}',limit_rows = ${limit_rows} where id_ent = ${id_ent}`;
    db.query(sql, (err, result) => {
        if (err) { res.status(404).json('404!'), console.log(err) }
        else {
            res.status(200).json(result);
        }
    });
}
);

app.put("/entidade", verify, async (req, res) => { 
    const uploadUser1 = multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, './public/upload/brasao')
            },
            filename: (req, file, cb) => {
                cb(null, req.body.id_ent + '_' + req.body.cod_ent + '.jpg');
                //console.log('?? req.bdy.dados vindo antes, n sei porque funciona???:',req.body.cod_ent)
            }
        })
    });
    uploadUser1.single('arquivo')(req, res, function (err) {
        let { id_ent, entidade, email, cnpj, rua, numero, bairro, cidade, uf, cep, secretaria, lei, decreto, msg4, msg1, msg2, msg3, usu_cad, 
            telefone, fixo, data_alt, caminho } = req.body;
console.log('reqFile:',req.file)
        if (req.file) {
            caminho = req.file.filename;
        } else { caminho = 'simg'; }
        let sql = `update entidades set entidade = '${entidade}',email = '${email}',cnpj = '${cnpj}',rua = '${rua}',numero = '${numero}',bairro = '${bairro}',cidade = '${cidade}',uf = '${uf}',cep = '${cep}',secretaria = '${secretaria}',lei = '${lei}',decreto = '${decreto}', 
        msg4 = '${msg4}', msg1 = '${msg1}', msg2 = '${msg2}',msg3 = '${msg3}', usu_cad = '${usu_cad}', telefone = '${telefone}',fixo = '${fixo}',data_alt = '${data_alt}',
         caminho = '${caminho}' where id_ent = ${id_ent}`;
        db.query(sql, (err, result) => {
            if (err) { res.status(404).json('404!'), console.log(err) }
            else {
                res.status(200).json(result);
            }
        });
    });
}
);
//TENTATIVA DE LÊ TXT
const { readFile } = require('fs');

app.put("/entidade2", async (req, res) => {
    const uploadUser1 = multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, './public/upload/brasao')
            },
            filename: (req, file, cb) => {
                cb(null, req.body.cod_ent + '.txt');
                //console.log('?? req.bdy.dados vindo antes, n sei porque funciona???:',req.body.cod_ent)
            }
        })
    });


    uploadUser1.single('arquivo')(req, res, function (err) {
        let { id_ent, cod_ent, data_alt } = req.body;
        // readFile(req.file.path, (err, data) /* callback */ => {
        //     console.log('4');
        //     if (err) {
        //         res.status(500).send(err);
        //         return;
        //     }    
        //     res.set({ 'Content-Type': 'text/plain' }).send(data);             

        //         console.log(data)
        // });
        caminho = req.file.path;
        var fs = require('fs')
            , filename = req.file.path;
        fs.readFile('filenam.txt', 'utf8', function (err, data) {
            if (err) throw err;
            console.log('OK: ' + filename);
            console.log(data)
        });


    });
}
);

//put painel adm em uso
app.put("/entidadeAdm", verify, async (req, res) => {
    const uploadUser1 = multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, './public/upload/brasao')
            },
            filename: (req, file, cb) => {
                cb(null, req.body.cod_ent + '.jpg');
                //console.log('?? req.bdy.dados vindo antes, n sei porque funciona???:',req.body.cod_ent)
            }
        })
    });
    uploadUser1.single('arquivo')(req, res, function (err) {
        let { id_ent, cod_ent, entidade, cnpj, rua, cidade, usu_cad, telefone, data_alt, urlbras, ativo, tributos,stitulo, caminho } = req.body;
        //let caminho = '';  

        if (req.file) {
            caminho = req.file?.filename;
        }
        //caminho = cod_ent + '.jpg';    
        let sql = `update entidades set entidade = '${entidade}', cnpj = '${cnpj}',rua = '${rua}', cidade = '${cidade}', usu_cad = '${usu_cad}', telefone = '${telefone}', 
        urlbras = '${urlbras}',ativo = '${ativo}',tributos = '${tributos}',stitulo = '${stitulo}', data_alt = '${data_alt}', caminho = '${caminho}' where id_ent = ${id_ent}`;
        db.query(sql, (err, result) => {
            if (err) { res.status(404).json('404!'), console.log(err) }
            else { res.json({ id: id_ent, msg: 'Alterado!' }) }
        });
    });
}
);
//em uso
app.post("/entidadeAdm/", verify, async (req, res) => {
    const uploadUser1 = multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, './public/upload/brasao')
            },
            filename: (req, file, cb) => {
                //cb(null, req.body.cod_ent + "_" + file.originalname); // exemplo de mudar nome arq
                cb(null, req.body.cod_ent + '.jpg');
                //console.log('?? req.bdy.dados vindo antes, n sei porque funciona???:',req.body.cod_ent)
            }
        })
    });
    uploadUser1.single('arquivo')(req, res, function (err) {
        let { cod_ent, entidade, cnpj, cidade, usu_cad, telefone, data_cad, urlbras, ativo, tributos,stitulo,caminho } = req.body;
        let Select = `select cod_ent as cod_ent FROM entidades WHERE cod_ent = ${cod_ent}`;
        db.query(Select, (err, result) => {
            if (err) { res.status(404).json('Erro 500!') }
            else {
                if (!result[0]) {
                    if (req.file) {
                        caminho = req.file.filename;
                    }
                    let calc_imovel = 'N'; let vvi = 'N'; let maskinsc = '1'; let insc_seq = 'N'; let desconto_iptu = 'N';
                    let venc_unica = '31/12/' + new Date().getFullYear(); let venc_antec = '31/12/' + new Date().getFullYear();
                    let venc_dvexercicio = '31/12/' + new Date().getFullYear(); let venc_dvtotal = '31/12/' + new Date().getFullYear();
                    let exercicio = new Date().getFullYear();
                    let secretaria = 'Secretária de Administração e Finanças';
                    let msg1 = 'O NOSSO MUNICIPIO PRECISA DE VOCÊ PARA O DESENVOLVIMENTO';
                    let msg2 = 'Sr. CONTRIBUINTE, PAGUE SEU IPTU E ALVARA ATÉ O VENCIMENTO';
                    let msg3 = `PREZADO CONTRIBUINTE, VOCÊ ESTÁ RECEBENDO O SEU IPTU ${exercicio}. COM SEU PAGAMENTO NÓS MANTEREMOS AS OBRAS E SERVIÇOS NECESSARIOS AO DESENVOLVIMENTO 
                                DE NOSSA CIDADE. O PAGAMENTO EM DIA EVITA A INCLUSÃO DO NOME NA DIVIDA ATIVA TRIBUTÁRIA DO MUNICIPIO.`;
                    let msg4 = 'HÁ DÉBITOS ANTERIORES';
                    let limit_rows = '200'

                    let sql = `insert into entidades (cod_ent, entidade, cnpj, cidade,usu_cad, telefone,data_cad,urlbras,ativo,tributos,stitulo,caminho,
                    venc_unica,venc_antec,venc_dvexercicio,venc_dvtotal, calc_imovel,vvi,maskinsc,
                    msg1,msg2,msg3,msg4,limit_rows, insc_seq,desconto_iptu,secretaria,exercicio) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                    db.query(sql, [cod_ent, entidade, cnpj, cidade, usu_cad, telefone, data_cad, urlbras, ativo, tributos,stitulo,caminho,
                        venc_unica, venc_antec, venc_dvexercicio, venc_dvtotal, calc_imovel, vvi, maskinsc,
                        msg1, msg2, msg3, msg4, limit_rows, insc_seq, desconto_iptu, secretaria, exercicio], (err, result) => {
                            if (err) { res.status(404).json('404!'); console.log(err) }
                            else { res.json({ id: result.insertId, msg: 'Salvo!' }) }
                        });
                } else { res.status(401).json('Entidade já Cadastrada!') }
            }
        });
    });
});
// em uso
app.delete("/entidade/:id_ent", verify, (req, res) => {
    const { id_ent } = req.params;
    if (id_ent === '1') {
        res.status(200).json("Impossível Exclusão: Entidade Root!");
    } else {
        let SQL = "delete from entidades where id_ent = ?";
        db.query(SQL, id_ent, (err) => {
            if (err) { res.status(405).json('Não é Possivel excluir: Registro Chave'); }
            else { res.status(200).json("Excluído!") }
        });
    }
});
//Chamada de fora, sem Login e painel adm em uso
app.get("/getAllEnt/", (req, res) => {
    let SQL = "select id_ent,cod_ent,entidade,email,cnpj,data_cad,data_alt,urlbras,ativo from entidades order by entidade asc";
    db.query(SQL, (err, result) => {
        //res.status(404).json("Registros não Encontrado!")
        if (err) { console.log(err) }
        else { res.json({ result }) }
    });
});
//======apoio
app.post("/padraoImovel", verify, async (req, res) => {
    const { id_ent, cod_padrao, desc_padrao, valor_unitario, obs_padrao, usu_cad, id_user } = req.body;;
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { { res.status(404).json('404!') } }
        else { res.set(result[0]); }
        if (result[0].role === 1) {
            let Select = `select cod_padrao as cod_padrao from padrao where cod_padrao = ${cod_padrao} and id_ent = ${id_ent}`;
            db.query(Select, (err, result) => {
                if (err) { res.status(404).json('Erro 404!') }
                else {
                    if (!result[0]) {
                        let sql = "insert into padrao (id_ent,cod_padrao,desc_padrao,valor_unitario, obs_padrao, usu_cad) values (?,?,?,?,?,?)";
                        db.query(sql, [id_ent, cod_padrao, desc_padrao, valor_unitario, obs_padrao, usu_cad], (err, result) => {
                            if (err) { { res.status(404).json('4043!') }; console.log(err) }
                            else { res.status(201).json({ result, msg: 'Salvo!' }) }
                        });
                    } else { res.status(405).json('Codigo já Cadastrado!') }
                }
            });
        } else {
            res.status(401).json('Usuário Não autorizado!');
        }
    });
});

app.post("/tipoImovel", verify, async (req, res) => {
    const { id_ent, id_tipo_imovel, cod_tipo_imovel, desc_tipo_imovel, obs_tipo_imovel, aliq, usu_cad, id_user } = req.body;;
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { { res.status(404).json('404!') } }
        else { res.set(result[0]); }
        //let role = result[0].role;
        if (result[0].role === 1) {
            let sql1 = `select cod_tipo_imovel from padrao where cod_tipo_imovel = ${cod_tipo_imovel} and id_ent = ${id_ent}`;
            db.query(sql1, (err1, result1) => {
                if (err1) { res.status(404).json('404!') }
                else {
                    if (!result1[0]) {
                        let sql2 = "insert tipo_imovel (id_ent, id_tipo_imovel, cod_tipo_imovel, desc_tipo_imovel, obs_tipo_imovel, aliq, usu_cad) values (?,?,?,?,?,?,?)";
                        db.query(sql2, [id_ent, id_tipo_imovel, cod_tipo_imovel, desc_tipo_imovel, obs_tipo_imovel, aliq, usu_cad], (err1, result1) => {
                            if (err1) { res.status(404).json('404!') }
                            else { res.status(200).json({ result, msg: 'Salvo!' }) }
                        });
                    } else { res.status(405).json('Codigo já Cadastrado!') }
                }
            });
        } else {
            res.status(401).json('Usuário Não autorizado!');
        }
    });
});
app.delete("/delPadrao/:id", async (req, res) => {
    const { id } = req.params;
    let sql = `delete from padrao where id_padrao = ${id}`;
    db.query(sql, (err1, result) => {
        if (err1) { res.status(404).json('404!'), console.log(err1) }
        else res.status(200).json({ msg: 'Excluído!' });
    })
}
);
app.delete("/delTipo/:id", async (req, res) => {
    const { id } = req.params;
    let sql = `delete from tipo_imovel where id_tipo_imovel = ${id}`;
    db.query(sql, (err1, result) => {
        if (err1) { res.status(404).json('404!'), console.log(err1) }
        else res.status(200).json({ msg: 'Excluído!' });
    })
}
);
app.get("/getApoio/:id_ent", (req, res) => {
    const { id_ent } = req.params;
    let sqlEnti = `select * from tipo_imovel where id_ent = ${id_ent}`;
    let sqlUser = `select * from padrao where id_ent = ${id_ent}`;
    db.query(sqlEnti, (err, result1) => {
        if (err) { console.log(err) }
        db.query(sqlUser, (err, result2) => {
            if (err) { res.status(404).json('404!') }
            else { res.json({ result1, result2 }) }
        });
    });
});
app.get("/tipoImovel/:id", (req, res) => {
    const { id } = req.params;
    let SQL = `select * from tipo_imovel where id_tipo_imovel = ${id}`;
    db.query(SQL, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else res.json({ result })
    })
}
);

app.get("/padraoImovel/:id", (req, res) => {
    const { id } = req.params;
    let SQL = `select * from padrao where id_padrao = ${id}`;
    db.query(SQL, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else res.json({ result })
    })
}
);

app.put("/tipoImovel", verify, async (req, res) => {
    const { id_tipo_imovel, aliq, obs_tipo_imovel, data_alt, usu_cad } = req.body;
    let sql = `update tipo_imovel set aliq = '${aliq}', obs_tipo_imovel = '${obs_tipo_imovel}', data_alt = '${data_alt}', usu_cad = '${usu_cad}' where id_tipo_imovel = ${id_tipo_imovel}`;
    db.query(sql, (err, result) => {
        if (err) { res.status(404).json('404!2') }
        else res.status(200).json("Alterado!");
    });
}
);
app.put("/padraoImovel", verify, async (req, res) => {
    const { id_padrao, valor_unitario, data_alt, usu_cad } = req.body;
    let sql = `update padrao set valor_unitario = '${valor_unitario}',data_alt = '${data_alt}', usu_cad = '${usu_cad}' where id_padrao = ${id_padrao}`;
    db.query(sql, (err, result) => {
        if (err) { res.status(404).json('404!2') }
        else res.status(200).json("Alterado!");
    });
}
);
//===========Bancos========//
app.get("/banco/:id_banco", verify, (req, res) => {
    const { id_banco } = req.params;
    let SQL = `select id_ent, id_banco, agencia, conta, convenio,cod_banco, nome_banco, local_pgto,brasao,ativo from bancos where id_banco = ${id_banco}`;
    db.query(SQL, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else res.json({ result });
    });
});
app.get("/bancos/:id_ent", verify, (req, res) => {
    const { id_ent } = req.params;
    let SQL = `select id_banco,cod_banco, nome_banco, brasao,ativo from bancos where id_ent = ${id_ent}`;
    db.query(SQL, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else res.json({ result });
    });
});

app.post("/banco", verify, async (req, res) => {
    const { id_ent, agencia, conta, convenio, cod_banco, nome_banco, local_pgto, brasao, ativo, data_cad, usu_cad } = req.body;
    let SelectBanco = `select cod_banco as cod_banco FROM bancos WHERE id_ent = ${id_ent} and cod_banco = '${cod_banco}'`;
    db.query(SelectBanco, (err, result) => {
        if (err) { res.status(404).json('Erro 404!') }
        else {
            if (!result[0]) {
                let sql = "insert into bancos (id_ent, agencia, conta, convenio,cod_banco, nome_banco, local_pgto,brasao,ativo,data_cad,usu_cad) values (?,?,?,?,?,?,?,?,?,?,?)";
                db.query(sql, [id_ent, agencia, conta, convenio, cod_banco, nome_banco, local_pgto, brasao, ativo, data_cad, usu_cad], (err, result) => {
                    if (err) { { res.status(404).json('4043!') }; console.log(err) }
                    else { res.status(201).json({ result, msg: 'Salvo!' }) }
                });
            } else { res.status(405).json('Registro já Cadastrado!') }
        }
    });
}
);
/* app.put("/banco", verify, async (req, res) => {
    const uploadUser1 = multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, './public/upload/brasao')
            },
            filename: (req, file, cb) => {
                cb(null, req.body.id_ent + '_banco_' + req.body.id_banco + '.jpg');
                //console.log('?? req.bdy.dados vindo antes, n sei porque funciona???:',req.body.cod_ent)
            }
        })
    });
    uploadUser1.single('arquivo')(req, res, function (err) {
        let { id_ent, id_banco, agencia, conta, convenio, cod_banco, nome_banco, local_pgto, ativo, data_alt, brasao, usu_cad } = req.body;
        console.log('reqBanco',req.file)
        if (req.file) {
            brasao = req.file.filename;
        } else {
            brasao = 'simg';
        }
        let sql = `update bancos set agencia = '${agencia}', conta= '${conta}', convenio= '${convenio}',cod_banco= '${cod_banco}', nome_banco= '${nome_banco}', local_pgto= '${local_pgto}',brasao= '${brasao}',ativo= '${ativo}',data_alt= '${data_alt}',usu_cad = '${usu_cad}' where id_banco = ${id_banco}`;
        db.query(sql, (err, result) => {
            if (err) { console.log('Erro Post:', err) }
            else { res.status(201).json({ id_banco, msg: 'Atualizado!' }) }
        });
    });
}
); */

// Multer upload config
const fs = require('fs');
const path = require('path');
//const multer = require('multer');
const storage = multer.diskStorage({
   destination: function (req, file, cb) {
                cb(null, './public/upload/brasao')
            },
    filename: (req, file, cb) => {
                cb(null, req.body.id_ent + '_banco_' + req.body.id_banco + '.jpg');
                //console.log('?? req.bdy.dados vindo antes, n sei porque funciona???:',req.body.cod_ent)
            }
    /* filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    } */
})
const upload = multer({storage: storage});

app.put("/banco", verify, async (req, res) => { 
    upload.single('arquivo')(req, res, function (err) {
       let { id_ent, id_banco, agencia, conta, convenio, cod_banco, nome_banco, local_pgto, ativo, data_alt, brasao, usu_cad } = req.body;
        console.log('reqBanco',req.file)
        if (req.file) {
            brasao = req.file.filename;
        } else {
            brasao = 'simg';
        }
        let sql = `update bancos set agencia = '${agencia}', conta= '${conta}', convenio= '${convenio}',cod_banco= '${cod_banco}', nome_banco= '${nome_banco}', local_pgto= '${local_pgto}',brasao= '${brasao}',ativo= '${ativo}',data_alt= '${data_alt}',usu_cad = '${usu_cad}' where id_banco = ${id_banco}`;
        db.query(sql, (err, result) => {
            if (err) { console.log('Erro Post:', err) }
            else { res.status(201).json({ id_banco, msg: 'Atualizado!' }) }
        });
    });
}
);

app.delete("/banco/:id_banco/:id_user", verify, (req, res) => {
    const { id_banco, id_user } = req.params;
    let Sql = `select role from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.set(result[0]); console.log(result[0]) }
        let role = result[0].role;
        if (role === 3) {
            res.status(401).json('Usuário não autorizado');
        } else {
            let SQL = `delete from bancos where id_banco = ${id_banco}`;
            db.query(SQL, (err) => {
                if (err) { res.status(405) }
                else { res.status(200).json("Excluído!") }
            });
        }
    });
});
//===========Usuarios========//
app.get("/usuario/:id_user", verify, (req, res) => {
    const { id_user } = req.params;
    let SQL = `select id_ent, id_user,cod_user,username,password,nome,role,telefone,email,data_alt,prv,imgperf,ativo from usuarios where id_user = ${id_user}`;
    db.query(SQL, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else res.json({ result });
    });
});

app.get("/usuarios/:id_ent", verify, (req, res) => {
    const { id_ent } = req.params;
    let SQL = `select id_user,cod_user,username,nome,role,telefone,email,prv,imgperf,ativo from usuarios where id_ent = ${id_ent}`;
    db.query(SQL, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else res.json({ result });
    });
});

//res.status(401).json('Usuario já Cadastrado');
app.post("/usuario", verify, async (req, res) => {
    const { id_ent, username, password, nome, role, prv, email, telefone, ativo, data_cad } = req.body;
    let SelectUser = `select username as userName FROM usuarios WHERE id_ent = ${id_ent} and username = '${username}'`;
    db.query(SelectUser, (err, result) => {
        if (err) { res.status(404).json('4041!') }
        else {
            if (!result[0]) {
                let SelCod = `select max(cod_user) as cod_user FROM usuarios WHERE id_ent = ${id_ent}`;
                db.query(SelCod, (err, result1) => {
                    if (err) { res.status(404).json('4042!') }
                    else { res.set(result1[0]) }
                    cod_user = result1[0].cod_user + 1;
                    if (cod_user) {
                        msg = "Salvo!";
                        let sql = `insert into usuarios (id_ent,cod_user,username,password,nome,role,prv,email,telefone,ativo,data_cad) values (?,?,?,?,?,?,?,?,?,?,?)`;
                        db.query(sql, [id_ent, cod_user, username, password, nome, role, prv, email, telefone, ativo, data_cad], (err, result2) => {
                            if (err) { { res.status(404).json('Erro ao Cadastrar!'); console.log(err) } }
                            else { res.status(201).json({ result2, msg }) }
                        });
                    } else {
                        console.log('Erro ao Gerar Codigo! linha:200')
                    }
                });
            } else { res.status(405).json('Usuário já Cadastrado!') }
        }
    });
});

app.put("/usuario", verify, async (req, res) => {
    const uploadUser1 = multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, './public/upload/brasao')
            },
            filename: (req, file, cb) => {
                cb(null, req.body.id_ent + '_' + req.body.id_user + '.jpg');
                //console.log('?? req.bdy.dados vindo antes, n sei porque funciona???:',req.body.cod_ent)
            }
        })
    });
    uploadUser1.single('arquivo')(req, res, function (err) {
        let { id_user, username, password, nome, role, prv, email, telefone, data_alt, ativo, imgperf } = req.body;
        if (req.file) {
            imgperf = req.file.filename;
            //  imgperf = id_ent + '_' + id_user + '.jpg';
        } else { imgperf = '' }
        let sql = `update usuarios set username = '${username}', password = '${password}', prv = '${prv}',email = '${email}',role = '${role}',nome = '${nome}',telefone = '${telefone}',data_alt = '${data_alt}',ativo = '${ativo}', imgperf = '${imgperf}' where id_user = ${id_user}`;
        db.query(sql, (err, result) => {
            if (err) { console.log('Erro Post:', err) }
            else { res.status(201).json({ id_user, msg: 'Atualizado' }) }
        });
    });
}//<---fim Update entidade
);

app.delete("/usuario/:id_user/:id_user2", verify, (req, res) => {
    const { id_user, id_user2 } = req.params;
    if (id_user === id_user2) {
        res.status(401).json('Não é possível autoexclusão!');
    } else {
        let Sql = `select role from usuarios where id_user = ${id_user2}`;
        db.query(Sql, (err, result) => {
            if (err) { res.status(404).json('404!') }
            else { res.set(result[0]); }
            let role = result[0].role;
            if (role === 1) {
                let SQL = `delete from usuarios where id_user = ${id_user}`;
                db.query(SQL, (err) => {
                    if (err) { res.status(405).json('Não é Possivel excluir: Registro Chave') }
                    else { res.status(200).json("Excluído!") }
                });
            } else {
                res.status(401).json('Usuário não autorizado');
            }
        });
    }
});

//Manutenção
app.post("/m4nut3", verify, async (req, res) => {
    const { id_user, manute, id_ent } = req.body;
    let Sql = `select username, role, prv from usuarios where id_user = ${id_user}`;
    db.query(Sql, (err, result) => {
        if (err) { res.status(404).json('404!') }
        else { res.set(result[0]) }
        role = result[0].role;
        prv = result[0].prv;
        username = result[0].username;
        if (username === 'Master' | role === 1 | prv === 1) {
            let sql1 = ``; 
            // 'se entidade for 999025 (id_ent = 1)'
            if(id_ent === 1){sql1 = `${manute}`}
            else{sql1 = `${manute} and id_ent = ${id_ent}`}
             console.log(sql1)
            db.query(sql1, (err1, result1) => {
                if (err1) {
                    res.status(200).json({ err1, msg: "Operação Invalida!" })
                } else { res.status(200).json({ result1, msg: "Feito!" }) }
            })
        } else {
            res.status(401).json('Usuário Não autorizado!');
        }
    });
});
