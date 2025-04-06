const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const db = new sqlite3.Database('catalogo_carros.db', (err) => {
    if (err) {
        console.error("Erro ao abrir o banco de dados:", err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        // Criar tabela de carros
        db.run(`
          CREATE TABLE IF NOT EXISTS carros (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            marca TEXT,
            modelo TEXT,
            ano INTEGER,
            quilometragem INTEGER,
            preco REAL,
            cor TEXT,
            imagens TEXT
          )
        `);

        // Criar tabela de marcas
        db.run(`
          CREATE TABLE IF NOT EXISTS marcas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT UNIQUE
          )
        `, (err) => {
          if (err) {
            console.error("Erro ao criar a tabela de marcas:", err.message);
          } else {
            console.log('Tabela de marcas criada com sucesso.');
            // Preencher a tabela de marcas com algumas marcas comuns
            const marcasIniciais = ['Fiat', 'Volkswagen', 'Chevrolet', 'Ford', 'Hyundai', 'Toyota', 'Renault', 'Honda', 'Jeep', 'Nissan'];
            marcasIniciais.forEach(marca => {
              db.run(`INSERT OR IGNORE INTO marcas (nome) VALUES (?)`, [marca], (err) => {
                if (err) {
                  console.error(`Erro ao inserir a marca ${marca}:`, err.message);
                } else {
                  console.log(`Marca ${marca} inserida com sucesso.`);
                }
              });
            });
          }
        });
    }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.get('/carros', (req, res) => {
  const marca = req.query.marca;
  const modelo = req.query.modelo;

  let query = 'SELECT * FROM carros';
  let params = [];

  if (marca && modelo) {
    query += ' WHERE marca = ? AND modelo = ?';
    params = [marca, modelo];
  } else if (marca) {
    query += ' WHERE marca = ?';
    params = [marca];
  } else if (modelo) {
    query += ' WHERE modelo = ?';
    params = [modelo];
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Erro ao buscar os carros:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      rows.forEach(row => {
        try {
            row.imagens = JSON.parse(row.imagens);
        } catch (e) {
            console.error("Erro ao fazer o parse das imagens:", e);
            row.imagens = [];
        }
    });
      res.json(rows);
    }
  });
});

app.post('/carros', upload.array('imagens', 5), (req, res) => {
  const { marca, modelo, ano, quilometragem, preco, cor } = req.body;
  const imagens = req.files.map(file => '/uploads/' + file.filename);

  const query = `
    INSERT INTO carros (marca, modelo, ano, quilometragem, preco, cor, imagens)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [marca, modelo, ano, quilometragem, preco, cor, JSON.stringify(imagens)], function(err) {
    if (err) {
      console.error("Erro ao inserir o carro:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.json({ id: this.lastID, marca, modelo, ano, quilometragem, preco, cor, imagens });
    }
  });
});

app.get('/marcas', (req, res) => {
  const query = 'SELECT nome FROM marcas';

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar as marcas:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      const marcas = rows.map(row => row.nome);
      res.json(marcas);
    }
  });
});

app.delete('/carros/:id', (req, res) => {
  const id = req.params.id;
  const query = 'DELETE FROM carros WHERE id = ?';

  db.run(query, [id], function(err) {
    if (err) {
      console.error("Erro ao remover o carro:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Carro removido com sucesso' });
    }
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});