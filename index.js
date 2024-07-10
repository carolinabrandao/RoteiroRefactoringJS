const { readFileSync } = require('fs');
const { format } = require('path');

function calcularTotalFatura(pecas, apresentacoes) {
  let total = 0;
  for (let apre of apresentacoes) {
    total += calcularTotalApresentacao(apre);
  }
  return total;
}

function calcularTotalCreditos(pecas, apresentacoes){
  let total = 0;
  for (let apre of apresentacoes) {
    total += calcularCredito(apre);
  }
  return total;
}  

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR",
    { style: "currency", currency: "BRL",
      minimumFractionDigits: 2 }).format(valor/100);
}

function calcularCredito(apre) {
  let creditos = 0;
  creditos += Math.max(apre.audiencia - 30, 0);
  if (getPeca(apre).tipo === "comedia") 
    creditos += Math.floor(apre.audiencia / 5);
  return creditos;   
}

function getPeca(apresentacao) {
  return pecas[apresentacao.id];
}

function calcularTotalApresentacao(apre) {
  let total = 0;

  switch (getPeca(apre).tipo) {
  case "tragedia":
    total = 40000;
    if (apre.audiencia > 30) {
      total += 1000 * (apre.audiencia - 30);
    }
    break;
  case "comedia":
    total = 30000;
    if (apre.audiencia > 20) {
       total += 10000 + 500 * (apre.audiencia - 20);
    }
    total += 300 * apre.audiencia;
    break;
  default:
      throw new Error(`Peça desconhecia: ${getPeca(apre).tipo}`);
  }
  return total;
}

function gerarFaturaStr (fatura, pecas) {
  let faturaStr = `Fatura ${fatura.cliente}\n`;
  for (let apre of fatura.apresentacoes) {
      faturaStr += `  ${getPeca(apre).nome}: ${formatarMoeda(calcularTotalApresentacao(apre))} (${apre.audiencia} assentos)\n`;
  }
  faturaStr += `Valor total: ${formatarMoeda(calcularTotalFatura(pecas, fatura.apresentacoes))}\n`;
  faturaStr += `Créditos acumulados: ${calcularTotalCreditos(pecas, fatura.apresentacoes)} \n`;
  return faturaStr;
}  

function gerarFaturaHTML(fatura, pecas) {

  let faturaHTML = `
<html>
<p> Fatura ${fatura.cliente} </p>
<ul>\n`;
  for (let apre of fatura.apresentacoes) {
    faturaHTML += `<li> ${getPeca(apre).nome}: ${formatarMoeda(calcularTotalApresentacao(apre))} (${apre.audiencia} assentos) </li>\n`;
  }
faturaHTML += `</ul>
<p> Valor total: ${formatarMoeda(calcularTotalFatura(pecas, fatura.apresentacoes))} </p>
<p> Créditos acumulados: ${calcularTotalCreditos(pecas, fatura.apresentacoes)} </p>
</html>`;

  return faturaHTML;
}

const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));
const faturaStr = gerarFaturaStr(faturas, pecas);
console.log(faturaStr);
const faturaHTML = gerarFaturaHTML(faturas, pecas);
console.log(faturaHTML);
