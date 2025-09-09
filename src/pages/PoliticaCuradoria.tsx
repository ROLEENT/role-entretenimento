import React from 'react';
import { PublicLayout } from '@/components/PublicLayout';
import { PageSEO } from '@/components/seo/PageSEO';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowUpToLine } from 'lucide-react';

export default function PoliticaCuradoria() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PublicLayout>
      <PageSEO
        title="Política de Curadoria | ROLÊ"
        description="Como o ROLÊ seleciona e recomenda eventos. Critérios, processo editorial e contato para correções ou reavaliação."
        canonical="https://roleentretenimento.com/politicas/curadoria"
        type="website"
      />
      
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <header className="mb-8">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-medium rounded-full border border-border bg-card text-card-foreground">
            Transparência editorial
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Política de Curadoria do ROLÊ
          </h1>
          <p className="text-muted-foreground mb-6">
            Última atualização: 8 de setembro de 2025
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/#agenda">Enviar um evento</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/contato">Falar com o ROLÊ</Link>
            </Button>
          </div>
        </header>

        {/* Table of Contents */}
        <nav className="sticky top-20 mb-8 p-4 bg-card border rounded-lg" aria-label="Sumário">
          <h3 className="font-semibold mb-3 text-sm">Conteúdo</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#o-que-e-destaque" className="text-primary hover:underline">O que é destaque curatorial</a></li>
            <li><a href="#editorial-vs-publicidade" className="text-primary hover:underline">Editorial x publicidade</a></li>
            <li><a href="#como-avaliamos" className="text-primary hover:underline">Como avaliamos</a></li>
            <li><a href="#criterios" className="text-primary hover:underline">Os 10 critérios</a></li>
            <li><a href="#imagens-creditos" className="text-primary hover:underline">Imagens e créditos</a></li>
            <li><a href="#conflitos" className="text-primary hover:underline">Conflitos de interesse</a></li>
            <li><a href="#como-entra" className="text-primary hover:underline">Como seu evento entra</a></li>
            <li><a href="#correcoes" className="text-primary hover:underline">Correções e direito de resposta</a></li>
            <li><a href="#reavaliacao" className="text-primary hover:underline">Como pedir reavaliação</a></li>
            <li><a href="#transparencia" className="text-primary hover:underline">Transparência de mudanças</a></li>
          </ul>
        </nav>

        {/* Content Sections */}
        <div className="space-y-8">
          <section id="o-que-e-destaque" className="p-6 bg-card border rounded-lg">
            <h2 className="text-xl font-bold mb-3">O que é destaque curatorial</h2>
            <p>É um selo aplicado a eventos que atendem bem aos critérios públicos do projeto. É uma decisão editorial. Não é anúncio e não é impulsionamento.</p>
          </section>

          <section id="editorial-vs-publicidade" className="p-6 bg-card border rounded-lg">
            <h2 className="text-xl font-bold mb-3">Editorial x publicidade</h2>
            <p className="mb-4"><strong>Editorial</strong> são textos, listas e selos definidos pela equipe. Independência total.</p>
            <p><strong>Vitrine Cultural e formatos pagos</strong> são identificados como publicidade ou parceria. Pagamento não garante destaque curatorial. Um evento patrocinado pode ou não receber o selo. A régua é a mesma para todo mundo.</p>
          </section>

          <section id="como-avaliamos" className="p-6 bg-card border rounded-lg">
            <h2 className="text-xl font-bold mb-3">Como avaliamos</h2>
            <p className="mb-4">Analisamos cada evento com base em 10 critérios. Em cada um registramos um status e uma justificativa curta.</p>
            <p><strong>Status usados:</strong> Atendido, Parcial, Não se aplica, Não informado. O contador que você vê no site considera apenas os que ficaram como Atendido.</p>
          </section>

          <section id="criterios" className="p-6 bg-card border rounded-lg">
            <h2 className="text-xl font-bold mb-4">Os 10 critérios</h2>
            <ol className="space-y-6 pl-4">
              <li>
                <h3 className="text-lg font-semibold mb-2">1. Relevância cultural</h3>
                <p>Contribuição real para o ecossistema cultural e diálogo com a cena.</p>
              </li>
              <li>
                <h3 className="text-lg font-semibold mb-2">2. Line-up ou proposta artística</h3>
                <p>Coerência da curadoria musical ou de performances, consistência e risco criativo.</p>
              </li>
              <li>
                <h3 className="text-lg font-semibold mb-2">3. Identidade visual e comunicação</h3>
                <p>Materiais bem cuidados, informações claras e conexão com o público.</p>
              </li>
              <li>
                <h3 className="text-lg font-semibold mb-2">4. Experiência para o público</h3>
                <p>Ambientação, som, acessibilidade, horários, sinalização e cuidado com a pista.</p>
              </li>
              <li>
                <h3 className="text-lg font-semibold mb-2">5. Conexão com a cidade</h3>
                <p>Uso e ressignificação de espaços urbanos e culturais, relação com o território.</p>
              </li>
              <li>
                <h3 className="text-lg font-semibold mb-2">6. Coerência com o público do ROLÊ</h3>
                <p>Alinhamento com um público urbano e criativo que consome cultura de forma ativa.</p>
              </li>
              <li>
                <h3 className="text-lg font-semibold mb-2">7. Potencial de engajamento</h3>
                <p>Capacidade de gerar conversa qualificada, desejo e presença sem depender de hype vazio.</p>
              </li>
              <li>
                <h3 className="text-lg font-semibold mb-2">8. Inovação ou autenticidade</h3>
                <p>Postura autoral, mistura ousada de gêneros e coerência entre conceito e entrega.</p>
              </li>
              <li>
                <h3 className="text-lg font-semibold mb-2">9. Diversidade e representatividade LGBTQIAP+</h3>
                <p>Presença de artistas, equipes e público diversos, com políticas de respeito e segurança.</p>
              </li>
              <li>
                <h3 className="text-lg font-semibold mb-2">10. Impacto comunitário e suporte à cena</h3>
                <p>Ações com coletivos, contratação local, formação, preços acessíveis e iniciativas solidárias.</p>
              </li>
            </ol>
          </section>

          <section id="imagens-creditos" className="p-6 bg-card border rounded-lg">
            <h2 className="text-xl font-bold mb-3">Imagens e créditos</h2>
            <p>Em editoriais usamos imagens autorais ou de IA para evitar derrubadas e garantir a permanência do conteúdo. Em coberturas e publis, usamos fotos acordadas com o evento e damos crédito quando combinado.</p>
          </section>

          <section id="conflitos" className="p-6 bg-card border rounded-lg">
            <h2 className="text-xl font-bold mb-3">Conflitos de interesse</h2>
            <p>Parcerias e publis são sinalizadas no post. Quem tiver conflito direto não participa da decisão editorial daquele caso.</p>
          </section>

          <section id="como-entra" className="p-6 bg-card border rounded-lg">
            <h2 className="text-xl font-bold mb-3">Como seu evento entra no ROLÊ</h2>
            <p className="mb-4">Envie pelo formulário na <Link to="/#agenda" className="text-primary hover:underline">aba Agenda</Link>. Inclua data, horários, local, link de venda, arte em boa resolução, line up, conceito e políticas de acesso e segurança.</p>
            <p>Eventos enviados com antecedência têm mais chance de avaliação completa.</p>
          </section>

          <section id="correcoes" className="p-6 bg-card border rounded-lg">
            <h2 className="text-xl font-bold mb-3">Correções e direito de resposta</h2>
            <p>Encontrou um erro ou quer complementar dados? Escreva para <a href="mailto:contato@roleentretenimento.com" className="text-primary hover:underline">contato@roleentretenimento.com</a> ou use o formulário do site. Respondemos e atualizamos quando necessário.</p>
          </section>

          <section id="reavaliacao" className="p-6 bg-card border rounded-lg">
            <h2 className="text-xl font-bold mb-3">Como pedir reavaliação</h2>
            <p>Se o seu evento não recebeu selo e você tem novas informações, peça reavaliação. Aplicamos a mesma régua para todo mundo.</p>
          </section>

          <section id="transparencia" className="p-6 bg-card border rounded-lg">
            <h2 className="text-xl font-bold mb-3">Transparência de mudanças</h2>
            <p>Esta política pode mudar com o tempo. Sempre indicamos a data de atualização e o que mudou.</p>
          </section>
        </div>

        {/* Back to Top Button */}
        <Button
          onClick={scrollToTop}
          className="fixed right-6 bottom-6 h-12 w-12 rounded-full shadow-lg"
          size="icon"
          aria-label="Voltar ao topo"
        >
          <ArrowUpToLine className="h-5 w-5" />
        </Button>
      </main>
    </PublicLayout>
  );
}