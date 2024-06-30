//Escutador que garante que o DOM esteja totalmente renderizado
document.addEventListener("DOMContentLoaded", function() {
    //Variáveis
    let formulario = document.querySelector("#formulario");
    let resultadosContainer = document.querySelector("#resultados");

    
    formulario.addEventListener("submit", function(event){
        event.preventDefault();

        let enderecoIP = formulario.querySelector("#endereco-ip").value;
        let mascaraBloco = formulario.querySelector("#mascara").value;
        let quantidadeSubRedes = parseInt(formulario.querySelector("#quantidade-subredes").value);

        try {
            //Variáveis 
            let enderecoZerado = zerarUltimoOcteto(enderecoIP);
            let enderecoIPBinario = converteParaBinario(enderecoZerado);
            let mascaraBinaria = mascaraSubredeParaBinario(mascaraBloco);
            let quantidadeZeros = contarZerosNaMascara(mascaraBinaria);
            let quantidadeEnderecos = calcularQuantidadeEnderecos(quantidadeZeros);
        

            let tabelaResultados = calcularSubredes(enderecoZerado, mascaraBloco, quantidadeSubRedes);
           
            formulario.style.display = "none";
            resultadosContainer.innerHTML = '<button id="voltar">Voltar</button>';

            // Cria a tabela
            let tabela = document.createElement("table");
            tabela.classList.add("resultado-table");

            let thead = document.createElement("thead");
            let tbody = document.createElement("tbody");

            // Cabeçalho da tabela
            let cabecalho = `
                <tr>
                    <th>Subrede</th>
                    <th>Qtd. de estações</th>
                    <th>Endereços da sub-rede</th>
                    <th>Primeiro endereço</th>
                    <th>Broadcast</th>
                    <th>Máscara</th>
                </tr>
            `;
            thead.innerHTML = cabecalho;

            // Linhas da tabela com os resultados calculados
            tabelaResultados.forEach((subrede, index) => {
                let linha = `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${subrede.qtdEstacoes}</td>
                        <td>${subrede.enderecosSubRede}</td>
                        <td>${subrede.primeiroEndereco}</td>
                        <td>${subrede.broadcast}</td>
                        <td>${subrede.mascara}</td>
                    </tr>
                `;
                tbody.innerHTML += linha;
            });

            tabela.appendChild(thead);
            tabela.appendChild(tbody);

            // Adiciona a tabela no container de resultados
            resultadosContainer.appendChild(tabela);
            resultadosContainer.style.display = "block";

        } catch (error) {
            console.error(error.message); // Exibe qualquer erro no console do navegador
        }
    });


    // Adiciona o evento de clique no botão "Voltar"
    resultadosContainer.addEventListener("click", function(event) {
        if (event.target.id === "voltar") {
            resultadosContainer.style.display = "none";
            formulario.style.display = "block";
        }
    });
});

function zerarUltimoOcteto(enderecoIP) {
    let octetos = enderecoIP.split('.');
    
    if (octetos.length !== 4) {
        throw new Error('Endereço IP inválido.');
    }

    octetos[3] = '0';

    return octetos.join('.');
}

function converteParaBinario(enderecoIP) {
    return enderecoIP.split('.')
        .map(octeto => {
            let binario = parseInt(octeto, 10).toString(2);
            return binario.padStart(8, '0');
        })
        .join('.');
}

function mascaraSubredeParaBinario(mascara) {
    if (!eMascaraSubredeValida(mascara)) {
        throw new Error('Máscara de sub-rede inválida.');
    }

    let prefixo = parseInt(mascara.split('/')[1]);
    let binario = '1'.repeat(prefixo).padEnd(32, '0');

    return `${parseInt(binario.slice(0,8), 2)}.${parseInt(binario.slice(8,16), 2)}.${parseInt(binario.slice(16,24), 2)}.${parseInt(binario.slice(24,32), 2)}`;
}

function eMascaraSubredeValida(mascara) {
    let regexMascara = /^\/([0-9]|[1-2][0-9]|3[0-2])$|^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return regexMascara.test(mascara);
}

function contarZerosNaMascara(mascaraBinaria) {
    let octetos = mascaraBinaria.split('.').map(octeto => parseInt(octeto, 10));
    let zeros = octetos.reduce((totalZeros, octeto) => {
        return totalZeros + (8 - octeto.toString(2).replace(/0/g, '').length);
    }, 0);

    return zeros;
}

function calcularQuantidadeEnderecos(quantidadeZeros) {
    return Math.pow(2, quantidadeZeros) - 2;
}

function calcularSubredes(ipBase, mascara, numSubredes) {
    let ipBaseArray = ipBase.split('.').map(Number);
    let bitsSubrede = Math.ceil(Math.log2(numSubredes));
    let hostsPorSubrede = Math.pow(2, 8 - bitsSubrede) - 2;
    let subredes = [];
    let incremento = Math.pow(2, 8 - bitsSubrede);
    let enderecoRede = ipBaseArray.slice();
    let broadcastArray = ipBaseArray.slice();

    for (let i = 0; i < numSubredes; i++) {
        broadcastArray[3] = enderecoRede[3] + incremento - 1;

        let enderecoRedeStr = enderecoRede.join('.');
        let primeiroHostStr = (enderecoRede[0]) + '.' + (enderecoRede[1]) + '.' + (enderecoRede[2]) + '.' + (enderecoRede[3] + 1);
        let ultimoHostStr = (broadcastArray[0]) + '.' + (broadcastArray[1]) + '.' + (broadcastArray[2]) + '.' + (broadcastArray[3] - 1);
        let broadcastStr = broadcastArray.join('.');

        subredes.push({
            qtdEstacoes: hostsPorSubrede,
            enderecosSubRede: `${enderecoRedeStr} - ${ultimoHostStr}`,
            primeiroEndereco: primeiroHostStr,
            broadcast: broadcastStr,
            mascara: mascara
        });

        enderecoRede[3] += incremento;
        broadcastArray[3] += incremento;
    }

    return subredes;
}
