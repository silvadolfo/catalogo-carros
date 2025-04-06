document.addEventListener('DOMContentLoaded', function() {
  const listaCarros = document.getElementById('lista-carros');
  const formPesquisa = document.getElementById('form-pesquisa');
  const marcasPesquisa = document.getElementById('marca-pesquisa');

  // Função para carregar as marcas no filtro de pesquisa
  function carregarMarcasPesquisa(marcas) {
    marcas.forEach(marca => {
      const option = document.createElement('option');
      option.value = marca;
      option.textContent = marca;
      marcasPesquisa.appendChild(option);
    });
  }

  // Função para exibir os carros na lista
  function exibirCarros(carros) {
    listaCarros.innerHTML = ''; // Limpa a lista antes de adicionar os carros
    carros.forEach(carro => {
      const listItem = document.createElement('li');
      listItem.classList.add('list-group-item');
      listItem.innerHTML = `
        <strong>${carro.marca} ${carro.modelo}</strong><br>
        Ano: ${carro.ano} | Quilometragem: ${carro.quilometragem} km | Preço: R$ ${carro.preco} | Cor: ${carro.cor}<br>
        ${carro.imagens ? carro.imagens.split(',').map(imagem => `<img src="http://localhost:3000${imagem}" alt="Imagem do carro" style="max-width: 100px; max-height: 100px;">`).join('') : 'Sem imagens'}
      `;
      listaCarros.appendChild(listItem);
    });
  }

  // Função para buscar os carros na API
  function buscarCarros() {
    fetch('http://localhost:3000/carros')
      .then(response => response.json())
      .then(data => {
        exibirCarros(data);
      })
      .catch(error => console.error('Erro ao carregar carros:', error));
  }

  // Função para buscar as marcas na API e popular o select
  function carregarMarcas() {
    fetch('http://localhost:3000/marcas')
      .then(response => response.json())
      .then(marcas => {
        carregarMarcasPesquisa(marcas);
      })
      .catch(error => console.error('Erro ao carregar marcas:', error));
  }

  // Evento de submit do formulário de pesquisa
  formPesquisa.addEventListener('submit', function(event) {
    event.preventDefault();
    const marcaSelecionada = document.getElementById('marca-pesquisa').value;
    const modeloDigitado = document.getElementById('modelo-pesquisa').value;

    // Realiza a pesquisa na API
    fetch(`http://localhost:3000/carros?marca=${marcaSelecionada}&modelo=${modeloDigitado}`)
      .then(response => response.json())
      .then(data => {
        exibirCarros(data); // Exibe os carros filtrados
      })
      .catch(error => console.error('Erro ao pesquisar carros:', error));
  });

  // Carrega as marcas e os carros ao carregar a página
  carregarMarcas();
  buscarCarros();
});