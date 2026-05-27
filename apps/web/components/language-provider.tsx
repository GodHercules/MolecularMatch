"use client";

import type React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "pt-BR" | "en-US";

const LANGUAGE_KEY = "molecularmatch-language";

const dictionary = {
  "pt-BR": {
    navDashboard: "Visao Geral",
    navSingle: "Pesquisa Individual",
    navBatch: "Pesquisa em Lote",
    navAdmin: "Admin",
    navOpenMenu: "Abrir menu",
    navCloseMenu: "Fechar menu",
    tagline: "Identify. Match. Discover.",

    themeLight: "Modo Claro",
    themeDark: "Modo Noturno",

    langPt: "Portugues (BR)",
    langEn: "English (US)",

    scientificWarning:
      "O MolecularMatch retorna candidatos compativeis por massa molecular. Peso molecular isolado nao confirma identidade quimica. Para confirmacao clinica ou laboratorial, use dados complementares como formula molecular, MS/MS, fragmentacao, tempo de retencao, matriz da amostra, metodo analitico, padrao de referencia e validacao profissional.",
    demoWarning:
      "Dados de demonstracao usados apenas para teste tecnico. Nao usar como base cientifica real.",

    landingBadge: "Plataforma cientifica para triagem molecular",
    landingTitle: "Encontre candidatos moleculares com precisao cientifica.",
    landingSubtitle:
      "Compare massas moleculares com bases curadas, identifique candidatos provaveis e priorize analises laboratoriais com rastreabilidade.",
    landingCtaSingle: "Iniciar pesquisa individual",
    landingCtaBatch: "Iniciar pesquisa em lote",
    landingSecondary: "Ver painel operacional",
    landingTrust: "Uso recomendado para triagem, pesquisa e investigacao laboratorial.",
    landingDisclaimer: "Resultado probabilistico. Confirmacao requer evidencia complementar.",

    quickActionsTitle: "Acoes principais",
    quickActionSingleTitle: "Pesquisa individual",
    quickActionSingleDesc: "Consulte uma massa e veja candidatos ranqueados por compatibilidade.",
    quickActionBatchTitle: "Pesquisa em lote",
    quickActionBatchDesc: "Envie dezenas de massas e obtenha agrupamentos por cada entrada.",
    quickActionAdminTitle: "Admin e importacoes",
    quickActionAdminDesc: "Gerencie importacoes de PubChem, ChEBI e HMDB com monitoramento de jobs.",
    quickActionOpen: "Abrir",

    dashboardHeroTitleA: "Identificacao molecular orientada por dados.",
    dashboardHeroTitleB: "Pronta para decisao rapida.",
    dashboardHeroSubtitle:
      "Cobertura cientifica, status operacional e atalho para os fluxos mais usados.",
    statReal: "Substancias reais",
    statPubChem: "Total PubChem",
    statChebi: "Total ChEBI",
    statHmdb: "Total HMDB",
    latestImport: "Ultima importacao",
    none: "Nenhuma",
    apiStatus: "API",
    dbStatus: "Banco",
    sourceStatus: "Status das fontes",
    dashboardError: "Falha ao carregar painel",
    dashboardRetry: "Tentar novamente",
    refresh: "Atualizar",

    sourcePubchemDesc: "Base ampla para compostos e propriedades quimicas.",
    sourceChebiDesc: "Curadoria especializada para entidades biologicas relevantes.",
    sourceHmdbDesc: "Referencia metabolomica com uso controlado por licenca.",
    statusOperational: "Operacional",
    statusAttention: "Atencao",

    scientificNoticeTitle: "Aviso cientifico",
    scientificNoticeText:
      "Massa molecular isolada nao confirma identidade quimica. Trate os resultados como candidatos provaveis ate validacao laboratorial.",

    singleTitle: "Pesquisa Individual",
    singleSubtitle: "Informe uma massa e ajuste tolerancia para obter candidatos compativeis.",
    molecularWeightInput: "Massa molecular",
    massType: "Tipo de massa",
    tolerance: "Tolerancia",
    toleranceType: "Tipo de tolerancia",
    resultLimit: "Limite de resultados",
    includeRestricted: "Incluir fontes restritas (uso interno)",
    searching: "Pesquisando...",
    search: "Pesquisar",
    exportCsv: "Exportar CSV",
    candidates: "Candidatos compativeis",
    searchError: "Falha na busca",
    searchGuide: "Dica: use ppm para maior precisao em espectrometria.",

    batchTitle: "Pesquisa em Lote",
    batchSubtitle: "Cole massas ou envie arquivo para processar multiplas amostras em uma unica execucao.",
    massListLabel: "Lista de massas (linhas, espacos ou virgulas)",
    processBatch: "Processar lote",
    processing: "Processando...",
    batchError: "Falha na busca em lote",
    invalidEntries: "entrada(s) invalida(s) foram ignoradas.",
    massGroup: "Massa",
    limitPerMass: "Limite por massa",
    uploadHint: "Aceita .txt e .csv simples.",

    emptyResultsTitle: "Nenhum candidato encontrado",
    emptyResultsDescription: "Ajuste tolerancia, tipo de massa ou tente outra faixa molecular.",

    tableName: "Nome",
    tableFormula: "Formula",
    tableType: "Tipo",
    tableMass: "Massa",
    tableDa: "Dif. Da",
    tablePpm: "Dif. ppm",
    tableConfidence: "Confianca",

    adminTitle: "Admin",
    adminSubtitle: "Controle de importacoes, limpeza de dados demo e monitoramento de jobs.",
    adminHint: "No Render Free, para importacoes grandes, prefira CLI local apontando para o Atlas.",
    adminPasswordLabel: "Senha de administracao",
    adminPasswordPlaceholder: "Digite ADMIN_PASSWORD",
    pubchemImport: "Importacao PubChem",
    chebiImport: "Importacao ChEBI",
    hmdbImport: "Importacao HMDB (arquivo local)",
    startPubchem: "Iniciar PubChem",
    startChebi: "Iniciar ChEBI",
    startHmdb: "Iniciar HMDB",
    dataSection: "Dados",
    realData: "Reais",
    demoData: "Demo",
    clearDemo: "Limpar dados demo",
    jobs: "Jobs",
    jobsEmpty: "Nenhum job encontrado ainda.",
    importSuccess: "Importacao iniciada com sucesso",
    importError: "Falha ao iniciar importacao",

    detailLoadError: "Falha ao carregar substancia",
    noDescription: "Sem descricao",
    restrictedLicense: "Licenca restrita",
    masses: "Massas",
    identifiers: "Identificadores",
    traceability: "Fontes e rastreabilidade",
    externalLink: "Link externo",
    na: "n/d",
    loading: "Carregando...",
    detailTitle: "Perfil da substancia",
    detailScientificNote: "Use dados complementares para confirmar identidade quimica.",

    networkErrorTitle: "Falha de conexao",
    networkErrorDescription:
      "Nao foi possivel comunicar com a API. Verifique conexao, URL da API e estado do backend.",

    massTypeAuto: "Automatico",
    massTypeMolecularWeight: "Molecular Weight",
    massTypeExactMass: "Exact Mass",
    massTypeMonoisotopicMass: "Monoisotopic Mass",
    massTypeAverageMass: "Average Mass",
    toleranceDa: "Da",
    tolerancePpm: "ppm",
    tolerancePercent: "Percentual",

    footerLine: "MolecularMatch apoia triagem cientifica. A confirmacao final depende de validacao laboratorial."
  },
  "en-US": {
    navDashboard: "Overview",
    navSingle: "Single Search",
    navBatch: "Batch Search",
    navAdmin: "Admin",
    navOpenMenu: "Open menu",
    navCloseMenu: "Close menu",
    tagline: "Identify. Match. Discover.",

    themeLight: "Light Mode",
    themeDark: "Dark Mode",

    langPt: "Portuguese (BR)",
    langEn: "English (US)",

    scientificWarning:
      "MolecularMatch returns mass-based compatible candidates. Molecular weight alone does not confirm chemical identity. For clinical or lab confirmation, use complementary evidence such as molecular formula, MS/MS, fragmentation, retention time, sample matrix, analytical method, reference standard, and professional validation.",
    demoWarning: "Demo data is provided for technical testing only. Do not use it as real scientific evidence.",

    landingBadge: "Scientific platform for molecular triage",
    landingTitle: "Identify molecular candidates with scientific precision.",
    landingSubtitle:
      "Compare molecular masses against curated databases, surface likely candidates, and prioritize laboratory analysis with traceability.",
    landingCtaSingle: "Start single search",
    landingCtaBatch: "Start batch search",
    landingSecondary: "View operational dashboard",
    landingTrust: "Designed for screening, research, and lab investigation workflows.",
    landingDisclaimer: "Probabilistic output. Final identity requires additional evidence.",

    quickActionsTitle: "Main actions",
    quickActionSingleTitle: "Single search",
    quickActionSingleDesc: "Query one mass and review ranked compatibility candidates.",
    quickActionBatchTitle: "Batch search",
    quickActionBatchDesc: "Submit multiple masses and receive grouped candidate sets.",
    quickActionAdminTitle: "Admin and imports",
    quickActionAdminDesc: "Run PubChem, ChEBI, and HMDB imports with job monitoring.",
    quickActionOpen: "Open",

    dashboardHeroTitleA: "Data-driven molecular matching.",
    dashboardHeroTitleB: "Ready for fast decisions.",
    dashboardHeroSubtitle: "Scientific coverage, operational health, and quick access to core workflows.",
    statReal: "Real substances",
    statPubChem: "PubChem total",
    statChebi: "ChEBI total",
    statHmdb: "HMDB total",
    latestImport: "Latest import",
    none: "None",
    apiStatus: "API",
    dbStatus: "Database",
    sourceStatus: "Source status",
    dashboardError: "Failed to load dashboard",
    dashboardRetry: "Try again",
    refresh: "Refresh",

    sourcePubchemDesc: "Broad compound coverage and chemistry metadata.",
    sourceChebiDesc: "Specialized curation for biologically relevant entities.",
    sourceHmdbDesc: "Metabolomics reference with restricted license handling.",
    statusOperational: "Operational",
    statusAttention: "Attention",

    scientificNoticeTitle: "Scientific notice",
    scientificNoticeText:
      "Molecular mass alone does not confirm chemical identity. Treat outputs as likely candidates until laboratory validation.",

    singleTitle: "Single Search",
    singleSubtitle: "Enter one mass and tune tolerance to find compatible candidates.",
    molecularWeightInput: "Molecular mass",
    massType: "Mass type",
    tolerance: "Tolerance",
    toleranceType: "Tolerance type",
    resultLimit: "Result limit",
    includeRestricted: "Include restricted sources (internal use)",
    searching: "Searching...",
    search: "Search",
    exportCsv: "Export CSV",
    candidates: "Compatible candidates",
    searchError: "Search failed",
    searchGuide: "Tip: ppm is recommended for higher spectrometry precision.",

    batchTitle: "Batch Search",
    batchSubtitle: "Paste masses or upload a file to process multiple samples in one run.",
    massListLabel: "Mass list (lines, spaces, or commas)",
    processBatch: "Process batch",
    processing: "Processing...",
    batchError: "Batch search failed",
    invalidEntries: "invalid entries were ignored.",
    massGroup: "Mass",
    limitPerMass: "Limit per mass",
    uploadHint: "Accepts simple .txt and .csv files.",

    emptyResultsTitle: "No candidates found",
    emptyResultsDescription: "Adjust tolerance, mass type, or try a different molecular range.",

    tableName: "Name",
    tableFormula: "Formula",
    tableType: "Type",
    tableMass: "Mass",
    tableDa: "Da diff",
    tablePpm: "ppm diff",
    tableConfidence: "Confidence",

    adminTitle: "Admin",
    adminSubtitle: "Control imports, clear demo data, and monitor ingestion jobs.",
    adminHint: "On Render Free, for large imports, prefer local CLI pointing to Atlas.",
    adminPasswordLabel: "Admin password",
    adminPasswordPlaceholder: "Enter ADMIN_PASSWORD",
    pubchemImport: "PubChem import",
    chebiImport: "ChEBI import",
    hmdbImport: "HMDB import (local file)",
    startPubchem: "Start PubChem",
    startChebi: "Start ChEBI",
    startHmdb: "Start HMDB",
    dataSection: "Data",
    realData: "Real",
    demoData: "Demo",
    clearDemo: "Clear demo data",
    jobs: "Jobs",
    jobsEmpty: "No jobs yet.",
    importSuccess: "Import started successfully",
    importError: "Failed to start import",

    detailLoadError: "Failed to load substance",
    noDescription: "No description",
    restrictedLicense: "Restricted license",
    masses: "Masses",
    identifiers: "Identifiers",
    traceability: "Sources and traceability",
    externalLink: "External link",
    na: "n/a",
    loading: "Loading...",
    detailTitle: "Substance profile",
    detailScientificNote: "Use complementary evidence to confirm chemical identity.",

    networkErrorTitle: "Connection failed",
    networkErrorDescription:
      "The app could not reach the API. Check connection, API URL, and backend status.",

    massTypeAuto: "Automatic",
    massTypeMolecularWeight: "Molecular Weight",
    massTypeExactMass: "Exact Mass",
    massTypeMonoisotopicMass: "Monoisotopic Mass",
    massTypeAverageMass: "Average Mass",
    toleranceDa: "Da",
    tolerancePpm: "ppm",
    tolerancePercent: "Percent",

    footerLine: "MolecularMatch supports scientific screening. Final confirmation depends on laboratory validation."
  }
} as const;

type DictionaryKey = keyof (typeof dictionary)["pt-BR"];

type LanguageContextValue = {
  language: Language;
  setLanguage: (next: Language) => void;
  t: (key: DictionaryKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("pt-BR");

  useEffect(() => {
    const saved = localStorage.getItem(LANGUAGE_KEY) as Language | null;
    const next = saved ?? "pt-BR";
    setLanguageState(next);
  }, []);

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    localStorage.setItem(LANGUAGE_KEY, next);
  };

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key) => dictionary[language][key]
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useI18n must be used inside LanguageProvider");
  }
  return ctx;
}
