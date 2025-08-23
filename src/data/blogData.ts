export interface BlogPost {
  id: string;
  city: string;
  citySlug: string;
  title: string;
  slug: string;
  lead: string;
  content: string;
  author: string;
  publishedDate: string;
  weekRange: string;
  tags: string[];
  image: string;
  readTime: number;
  featured: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    city: "Porto Alegre",
    citySlug: "porto-alegre",
    title: "Eventos em Porto Alegre: os rolês que vão tomar conta da cidade nesta semana",
    slug: "14-17-agosto",
    lead: "Porto Alegre tá daquele jeito — no talo. Entre os dias 14 e 17 de agosto, a capital gaúcha entrega um cardápio de rolês que vai do rock pesado ao psytrance de 30 horas, passando por pop nostálgico, darkwave elegante, samba raiz e até um techno fetichista que promete virar madrugada.",
    content: `Se você é do time que não perde uma, já se prepara: o ROLÊ filtrou o que há de mais quente, diverso e potente para que a sua agenda cultural esteja tinindo.

## Peso, protesto e ancestralidade no rock

O Opinião recebe o Black Pantera em sua tour Perpétuo, misturando rock, punk, hardcore e funk numa energia crua e ancestral. Junto, a veterana No Rest traz três décadas de crustpunk afiado. Quinta-feira, dia 14, a Cidade Baixa vai pulsar mais forte.

Na mesma data, Nei Lisboa assume o palco do Grezz, costurando clássicos e raridades com serenidade e ironia.

O Teatro de Câmara Túlio Piva recebe GOSTO, encontro de Thiago Ramil e Dona Conceição, show gratuito que transforma afeto em resistência.

## Pistas temáticas e explosões pop

Na sexta, a MixMad retorna à Workroom com a edição Confessions, uma ode à Madonna.

Ainda na sexta, Betina Câmara apresenta Tóxica no Filippa, um stand up em dois atos de catarse coletiva.

No Ocidente, a Freaky Melt traz Hilary Duff, Hannah Montana e outros ícones da Disney Channel.

## Sombras, couro e alternativas

A festa Vulto ocupa o Caos inspirada em Matrix, com darkwave e pós-punk.

A Blow Up lança a edição Selvagem, dedicada à Britney Spears dos anos 2000.

E a NEUE comemora 8 anos no Clube do Comércio com Vermelho, Mari Hermel, Guilherme Dinardi e JPEG.Flow.

## Cultura preta, fetiche e potência urbana

O Batukbaile transforma a pista em manifesto de ritmos negros.

O Ministério Sadomasochic entrega techno e hard dance em cenário fetichista.

O Recayd Mob retorna ao Opinião com Jé Santiago, MC Igu, Dfideliz e Derek.

## Imersões e tradições

O Shakti 2025 leva 500 pessoas para uma experiência de 30 horas de psytrance e arte no Lami.

No domingo, o Samba da Figa recebe Cleber Augusto (ex-Fundo de Quintal) no Dunk Park.

## Conclusão

A dúvida agora é boa: seguir o techno até o sol nascer ou acordar cedo para a roda de samba? Apostar no pop nostálgico ou mergulhar no trance no meio do mato? Porto Alegre está servindo, e o ROLÊ já fez a triagem para você não perder tempo nem pista.`,
    author: "Equipe ROLÊ",
    publishedDate: "2024-08-14",
    weekRange: "14-17 Agosto",
    tags: ["rock", "pop", "techno", "samba", "psytrance"],
    image: "/src/assets/porto-alegre-events.jpg",
    readTime: 8,
    featured: true
  },
  {
    id: "2",
    city: "São Paulo",
    citySlug: "sao-paulo",
    title: "São Paulo ferve: a agenda cultural que não para de crescer",
    slug: "21-24-agosto",
    lead: "A capital paulista não dorme e nem deveria. Esta semana, a cidade entrega desde shows intimistas em galerias até festivals que ocupam a madrugada inteira.",
    content: `São Paulo continua sendo o epicentro cultural do país, e esta semana não é exceção. A cidade oferece uma diversidade que vai do underground mais radical aos palcos mais tradicionais.

## A cena eletrônica em ebulição

O Warung Tour chega à capital com lineup internacional na Audio Club. Parallels, Mind Against e Victor Ruiz prometem uma noite épica.

A festa Mamba Negra retorna ao Cine Joia com uma proposta que mistura arte visual e música experimental.

## Rock e alternativo

O Cine Joia também recebe a banda Terno Rei, que apresenta seu novo álbum em show íntimo e especial.

A Casa do Mancha vira palco para Castello Branco e Garotas Suecas numa noite que promete ser inesquecível.

## Conclusão

São Paulo nunca decepciona. A única dificuldade é escolher entre tantas opções de qualidade.`,
    author: "Redação ROLÊ",
    publishedDate: "2024-08-21",
    weekRange: "21-24 Agosto",
    tags: ["eletrônica", "rock", "alternativo"],
    image: "/src/assets/sao-paulo-events.jpg",
    readTime: 5,
    featured: true
  },
  {
    id: "3",
    city: "Rio de Janeiro",
    citySlug: "rio-de-janeiro",
    title: "Rio: entre o funk e o jazz, a cidade que não para",
    slug: "07-10-setembro",
    lead: "O Rio continua sendo o laboratório cultural mais efervescente do país. Funk, jazz, rock e MPB se misturam numa semana que promete ser inesquecível.",
    content: `O Rio de Janeiro mantém sua tradição de ser um caldeirão cultural. Esta semana, a cidade oferece desde baile funk na Zona Norte até jazz refinado em Ipanema.

## A força do funk carioca

O Baile da Gaiola volta ao Circo Voador com MC's de peso e uma produção que promete balançar a Lapa.

Na Zona Norte, o Complexo do Alemão recebe o Festival Favela Jazz, misturando jazz com ritmos periféricos.

## Jazz e MPB

O Blue Note Rio recebe Hermeto Pascoal em apresentação única e especial.

A Casa Rosa traz Céu em show íntimo que promete emocionar.

## Conclusão

Rio de Janeiro segue sendo o coração cultural do Brasil, batendo forte em todos os ritmos.`,
    author: "Time ROLÊ",
    publishedDate: "2024-09-07",
    weekRange: "07-10 Setembro",
    tags: ["funk", "jazz", "mpb"],
    image: "/src/assets/rio-events.jpg",
    readTime: 6,
    featured: false
  }
];

export const getCityPosts = (citySlug: string): BlogPost[] => {
  return blogPosts.filter(post => post.citySlug === citySlug);
};

export const getPostBySlug = (citySlug: string, slug: string): BlogPost | undefined => {
  return blogPosts.find(post => post.citySlug === citySlug && post.slug === slug);
};

export const getFeaturedPosts = (): BlogPost[] => {
  return blogPosts.filter(post => post.featured);
};

export const getLatestPostByCity = (citySlug: string): BlogPost | undefined => {
  const cityPosts = getCityPosts(citySlug);
  return cityPosts.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())[0];
};