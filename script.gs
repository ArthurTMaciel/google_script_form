// Constante que armazena o URL do Google Form que será manipulado.
const FORM_ID = "https://docs.google.com/forms/d/1A-Ni4kIgsDlEcvz-4eB9tFIndsq1oFQRYzoV_FVLFVo/edit";

// Abre o formulário pelo URL especificado e o armazena na variável 'form'.
let form = FormApp.openByUrl(FORM_ID);

// Função que redefine o formulário, removendo todos os itens existentes.
function resetForm() {
  // Obtém todos os itens do formulário.
  let items = form.getItems();
  // Itera sobre todos os itens e os remove do formulário.
  items.forEach(item => form.deleteItem(item));
}

// Função que cria o formulário condicional baseado em dados de uma planilha.
function createConditionalForm() {
  Logger.log('Deletando itens antigos')
  // Reseta o formulário, removendo todos os itens existentes.
  resetForm();
  Logger.log('Itens antigos deletados')
  Logger.log('Obtendo e preparando planilha')
  // Obtém a planilha ativa.
  let pega_plan = SpreadsheetApp.getActiveSpreadsheet();
  // Obtém a aba da planilha chamada "A".
  let planilha = pega_plan.getSheetByName("Teste");
  // Obtém todos os dados da planilha (como uma matriz de valores).
  let dados = planilha.getDataRange().getValues();
  // Remove o primeiro elemento do array 'dados', que provavelmente é o cabeçalho.
  dados.shift();
  // Mapeia a primeira coluna dos dados (provavelmente o nome dos instrutores).
  let instrutores = dados.map(row => row[0]);
  // Cria um array para armazenar nomes de instrutores únicos.
  let unique_inst = [];
  // Adiciona nomes únicos de instrutores ao array 'unique_inst'.
  instrutores.forEach(option => {
    if (unique_inst.indexOf(option) == -1) {
      unique_inst.push(option);
    }
  });
  Logger.log('Adicionando questões primeira página')
  // Adiciona uma questão de lista ao formulário para selecionar o instrutor.
  let listItem = form.addListItem().setTitle("Selecione o Instrutor");
  // Array para armazenar as seções (page breaks) criadas
  let sections_inst = [];
  let mult_choices = [];
  let final_great = [];

  // Adiciona um campo de texto para o CPF
  form.addTextItem()
    .setTitle("Informe seu CPF")
    .setRequired(true)
    .setHelpText("Digite o CPF sem pontos ou traços.");

  // Adiciona um campo de texto para o e-mail
  form.addTextItem()
    .setTitle("Informe seu e-mail")
    .setRequired(true)
    .setHelpText("Digite o seu e-mail institucional.");

  // Adiciona campos para o dia, mês e ano de início no programa Aprendiz Legal
  form.addDateItem()
    .setTitle("Data de início no programa Aprendiz Legal")
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('Em qual módulo você atua?')
    .setChoiceValues(['Básico (mundo do trabalho)', 'Específico', 'Ambos']);

  // Frases de avaliação para cada parte (insumo para geração das questões)
  const frases1 = [
    "Gosta de ajudar seus colegas",
    "Tem dificuldade em resolver problemas complexos",
    "Planeja e finaliza as tarefas dentro do prazo",
    "Costuma deixar tarefas inacabadas",
    "Lida de forma tranquila com as situações desafiadoras",
    "Fica estressado quando encontra dificuldades",
    "Sabe cativar as pessoas",
    "Expressa-se de maneira confusa",
    "É flexível, adapta-se às novas tarefas",
    "Costuma deixar as coisas para a última hora"
  ];
  const frases2 = [
    "Tem dificuldade para se adaptar a novos contextos",
    "Sabe quando é o momento certo de começar a fazer as coisas de forma diferente",
    "Atribui seus fracassos aos outros ou às circunstâncias",
    "Demonstra acreditar que o sucesso depende do seu empenho",
    "Demonstra não se importar se seu trabalho está ou não de acordo com seus valores pessoais",
    "Precisa descobrir o seu propósito para trabalhar",
    "Demonstra não se importar em se desenvolver profissionalmente",
    "Busca crescer e se tornar um profissional melhor",
    "Se recusa a mudar, mesmo quando está errado",
    "Aprende quando comete erros"
  ];
  const frases3 = [
    "Tem preferências claras sobre tipos de atividades que lhe interessam",
    "Demonstra desconhecer o que precisa aprimorar",
    "Não precisa de ajuda para executar suas tarefas",
    "Costuma procrastinar",
    "Tem interesse em buscar trabalho",
    "Demonstra estar desmotivado a trabalhar",
    "Demonstra bom desempenho mesmo quando está em uma situação complicada",
    "Manifesta insegurança ao realizar uma atividade",
    "Demonstra avaliar os riscos e ganhos das suas opções profissionais",
    "Está indeciso entre as suas diferentes possibilidades de carreira"
  ];
  Logger.log('Adicionando questões proxímas páginas')
  unique_inst.forEach(opcao_inst => {
    // Adiciona um separador de página com o nome do instrutor.
    let section = form.addPageBreakItem().setTitle(`Observações: ${opcao_inst}`);

    // Adiciona uma página de observações logo após a seleção do instrutor
    section.setHelpText(
      "- Responda com base em suas observações e conhecimento sobre o jovem, buscando ser o mais objetivo e sincero possível.\n\n" +
      "- Suas respostas ajudarão a construir um perfil que contribuirá para o desenvolvimento do jovem em relação à sua empregabilidade.\n\n" +
      "- As informações fornecidas serão tratadas com confidencialidade e utilizadas apenas para os fins deste processo."
    );

    // Guarda a referência para a seção do instrutor
    sections_inst.push(section);

    form.addPageBreakItem()
      .setTitle("Instruções")
      .setHelpText(
        "A seguir, aparecerão várias questões de múltipla escolha que dirão respeito a como você enxerga o jovem. Para cada afirmação, você deverá indicar o quanto ela se aplica ao jovem, no sentido em que as frases se caracterizam ou não com o indivíduo.\n\n" +

        "• 1 - Não tem nada a ver com o(a) jovem: A frase não descreve em nada o comportamento ou características do jovem empregado.\n\n" +
        "• 2 - Tem pouco a ver com o(a) jovem: A frase se aplica ao jovem empregado em raras situações ou com baixa intensidade.\n\n" +
        "• 3 - Às vezes tem e às vezes não tem a ver: Não tenho informações suficientes para avaliar se a frase se aplica ou não ao jovem empregado, ou a frase se aplica de forma inconsistente, variando muito de acordo com a situação.\n\n" +
        "• 4 - Tem muito a ver com o(a) jovem: A frase se aplica ao jovem empregado em algumas situações ou com moderada intensidade.\n\n" +
        "• 5 - Tem tudo a ver com o(a) jovem: A frase descreve com precisão e alta intensidade o comportamento ou características do jovem empregado na maioria das situações."
      );

    // Filtra os dados da planilha para encontrar os aprendizes relacionados ao instrutor.
    let aprendizes = dados.filter(row => row[0] === opcao_inst).map(row => row[1]);
    Logger.log(`Instrutor: ${opcao_inst} - Aprendizes: ${aprendizes.join(', ')}`);

    aprendizes.forEach((aprendiz, index) => {
      Logger.log(`Aprendiz: ${aprendiz}`)

      // Adiciona um separador de página para cada aprendiz
      let page_sn = form.addPageBreakItem().setTitle(`${aprendiz} é seu aprendiz?`);

      //Adiciona check sobre se o aprendiz está com o instutor mesmo
      var mult_item = form.addMultipleChoiceItem()
      mult_item.setTitle(`${aprendiz} é de fato seu/sua aprendiz?`);

      // Store both page break and question together
      var pageBreakWithQuestion = {
        pageBreak: page_sn,
        questionItem: mult_item,
        instrutor: opcao_inst,
        aprendiz: aprendiz,
        isLastAprendiz: (index === aprendizes.length - 1) // Flag para o último aprendiz de cada instrutor
      };

      // Guarda a referência para a seção do aprendiz
      mult_choices.push(pageBreakWithQuestion);

      // Adiciona um separador de página para cada aprendiz
      form.addPageBreakItem().setTitle(`Aprendiz: ${aprendiz}`);

      // Adiciona a primeira pergunta com a escala de Likert
      form.addGridItem()
        .setTitle(`Avaliação do aprendiz ${aprendiz} - Parte 1`)
        .setRows(frases1) // As frases serão as linhas da grade
        .setColumns([
          "1 - Não tem nada a ver com o(a) jovem",
          "2 - Tem pouco a ver com o(a) jovem",
          "3 - As vezes tem e as vezes não tem a ver",
          "4 - Tem muito a ver com o(a) jovem",
          "5 - Tem tudo a ver com o(a) jovem"
        ]) // As opções de resposta serão as colunas da grade
        .setRequired(true);

      // Adiciona a segunda pergunta com a escala de Likert
      form.addGridItem()
        .setTitle(`Avaliação do aprendiz ${aprendiz} - Parte 2`)
        .setRows(frases2) // As frases serão as linhas da grade
        .setColumns([
          "1 - Não tem nada a ver com o(a) jovem",
          "2 - Tem pouco a ver com o(a) jovem",
          "3 - As vezes tem e as vezes não tem a ver",
          "4 - Tem muito a ver com o(a) jovem",
          "5 - Tem tudo a ver com o(a) jovem"
        ]) // As opções de resposta serão as colunas da grade
        .setRequired(true);

      // Adiciona a terceira pergunta com a escala de Likert
      form.addGridItem()
        .setTitle(`Avaliação do aprendiz ${aprendiz} - Parte 3`)
        .setRows(frases3) // As frases serão as linhas da grade
        .setColumns([
          "1 - Não tem nada a ver com o(a) jovem",
          "2 - Tem pouco a ver com o(a) jovem",
          "3 - As vezes tem e as vezes não tem a ver",
          "4 - Tem muito a ver com o(a) jovem",
          "5 - Tem tudo a ver com o(a) jovem"
        ]) // As opções de resposta serão as colunas da grade
        .setRequired(true);

      // Adiciona uma questão de múltipla escolha para a frase final
      form.addMultipleChoiceItem()
        .setTitle(`Este(a) jovem ${aprendiz} está preparado(a) para o mundo do trabalho?`)
        .setChoiceValues([
          "Sim, está preparado(a)",
          "Não, ainda não está preparado(a)",
          "Parcialmente preparado(a)"
        ])
        .setRequired(true);
    });

  });

  // Define a navegação para finalizar o formulário após a última página do último aprendiz.
  let final_sec = form.addPageBreakItem()
    .setTitle(`Fim da seção de Perguntas`)
    .setHelpText('Muito Obrigado\n pela participação\n blablabla');

  // Define as opções da lista suspensa e direciona para a respectiva seção
  listItem.setChoices(
    unique_inst.map((opcao_inst, index) => {
      return listItem.createChoice(opcao_inst, sections_inst[index])
    }));

  // Iteração para redirecionamento das perguntas de sim ou não
  mult_choices.forEach((element, index) => {
    Logger.log(index);

    let questao = element.questionItem;
    let pagina = element.pageBreak;
    Logger.log(questao);

    // Se for o último aprendiz do instrutor, redireciona para final_sec
    let nextPage = element.isLastAprendiz ? final_sec : (index + 1 < mult_choices.length) ? mult_choices[index + 1].pageBreak : final_sec;

    // Cria as opções de escolha, definindo `nextPage` corretamente
    let simChoice = questao.createChoice("SIM", FormApp.PageNavigationType.CONTINUE);
    let naoChoice = questao.createChoice("NÃO", nextPage);

    // Define as opções para a pergunta
    questao.setChoices([simChoice, naoChoice]);
  });
}





