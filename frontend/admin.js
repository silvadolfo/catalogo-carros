document.addEventListener('DOMContentLoaded', function() {
    const formCadastro = document.getElementById('form-cadastro');
    const listaCarrosAdmin = document.getElementById('lista-carros-admin');
    const marcasCadastro = document.getElementById('marca');

    // Função para carregar as marcas no formulário de cadastro
    function carregarMarcasCadastro(marcas) {
      marcas.forEach(marca => {
        const option = document.createElement('option');
        option.value = marca;
        option.textContent = marca;
        marcasCadastro.appendChild(option);
      });
    }

    // Função para buscar as marcas na API
    function buscarMarcas() {
      fetch('http://localhost:3000/marcas')
        .then(response => response.json())
        .then(data => {
          carregarMarcasCadastro(data);
        })
        .catch(error => console.error('Erro ao carregar marcas:', error));
    }

    // Função para exibir os carros na tabela
    function exibirCarrosAdmin(carros) {
      listaCarrosAdmin.innerHTML = ''; // Limpa a tabela antes de adicionar os carros
      carros.forEach(carro => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${carro.id}</td>
          <td>${carro.marca}</td>
          <td>${carro.modelo}</td>
          <td>${carro.ano}</td>
          <td>${carro.quilometragem}</td>
          <td>${carro.preco}</td>
          <td>${carro.cor}</td>
          <td>${carro.imagens ? carro.imagens.split(',').map(imagem => `<img src="http://localhost:3000${imagem}" alt="Imagem do carro" style="max-width: 50px; max-height: 50px;">`).join('') : 'Sem imagens'}</td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="removerCarro(${carro.id})">Remover</button>
          </td>
        `;
        listaCarrosAdmin.appendChild(row);
      });
    }

    // Função para buscar os carros na API
    function buscarCarrosAdmin() {
      fetch('http://localhost:3000/carros')
        .then(response => response.json())
        .then(data => {
          exibirCarrosAdmin(data);
        })
        .catch(error => console.error('Erro ao carregar carros:', error));
    }

    // Função para cadastrar um novo carro
    formCadastro.addEventListener('submit', function(event) {
      event.preventDefault();

      const formData = new FormData(formCadastro);

      fetch('http://localhost:3000/carros', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        alert('Carro cadastrado com sucesso!');
        formCadastro.reset();
        buscarCarrosAdmin(); // Atualiza a lista de carros
      })
      .catch(error => console.error('Erro ao cadastrar carro:', error));
    });

    // Função para remover um carro
    window.removerCarro = function(id) {
      if (confirm('Tem certeza que deseja remover este carro?')) {
        fetch(`http://localhost:3000/carros/${id}`, {
          method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
          alert('Carro removido com sucesso!');
          buscarCarrosAdmin(); // Atualiza a lista de carros
        })
        .catch(error => console.error('Erro ao remover carro:', error));
      }
    };

    // Carrega as marcas e os carros ao carregar a página
    buscarMarcas();
    buscarCarrosAdmin();
  });