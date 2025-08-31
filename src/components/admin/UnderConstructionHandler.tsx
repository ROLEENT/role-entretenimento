import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { UnderConstructionPage } from './UnderConstructionPage';

export function UnderConstructionHandler() {
  const [searchParams] = useSearchParams();
  const module = searchParams.get('module') || 'Funcionalidade';
  const feature = searchParams.get('feature') || 'Esta funcionalidade';

  const getExpectedFeatures = (moduleName: string, featureName: string) => {
    const featuresMap: Record<string, string[]> = {
      'Revista': [
        'Sistema completo de artigos',
        'Editor de conteúdo avançado',
        'Gerenciamento de categorias',
        'SEO otimizado',
        'Sistema de comentários'
      ],
      'Gestão': [
        'Gerenciamento de mensagens de contato',
        'Sistema de newsletter',
        'Processo de candidaturas',
        'Configurações gerais',
        'Relatórios e analytics'
      ],
      'Destaques': [
        'Criação de highlights',
        'Curadoria automática',
        'Agenda curatorial',
        'Sistema de votação',
        'Integração com redes sociais'
      ],
      'Venues': [
        'Cadastro de locais',
        'Gerenciamento de espaços',
        'Integração com mapas',
        'Fotos e galeria',
        'Avaliações'
      ],
      'Organizadores': [
        'Cadastro de organizadores',
        'Histórico de eventos',
        'Sistema de avaliações',
        'Relatórios de performance',
        'Ferramentas de comunicação'
      ]
    };

    return featuresMap[moduleName] || featuresMap[featureName] || [
      'Interface intuitiva',
      'Funcionalidades completas',
      'Integração com o sistema',
      'Relatórios e analytics'
    ];
  };

  const getBreadcrumbItems = (moduleName: string, featureName: string) => {
    const breadcrumbMap: Record<string, Array<{ label: string; path?: string }>> = {
      'Revista': [{ label: 'Revista' }],
      'Gestão': [{ label: 'Gestão' }],
      'Destaques': [{ label: 'Destaques' }],
      'Venues': [
        { label: 'Agentes', path: '/admin-v3/agentes/artistas' },
        { label: 'Venues' }
      ],
      'Organizadores': [
        { label: 'Agentes', path: '/admin-v3/agentes/artistas' },
        { label: 'Organizadores' }
      ]
    };

    return breadcrumbMap[moduleName] || breadcrumbMap[featureName] || [
      { label: moduleName }
    ];
  };

  return (
    <UnderConstructionPage
      title={`${module} - ${feature}`}
      description={`${feature} está sendo desenvolvido e estará disponível em breve.`}
      expectedFeatures={getExpectedFeatures(module, feature)}
      breadcrumbItems={getBreadcrumbItems(module, feature)}
    />
  );
}