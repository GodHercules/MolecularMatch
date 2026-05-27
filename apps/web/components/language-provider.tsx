"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "pt-BR" | "en-US";

const LANGUAGE_KEY = "molecularmatch-language";

const dictionary = {
  "pt-BR": {
    navDashboard: "Dashboard",
    navSingle: "Pesquisa Individual",
    navBatch: "Pesquisa em Lote",
    navAdmin: "Admin",
    tagline: "Identify. Match. Discover.",

    themeLight: "Modo Claro",
    themeDark: "Modo Noturno",

    langPt: "Português (BR)",
    langEn: "English (US)",

    scientificWarning:
      "O MolecularMatch retorna candidatos compatíveis por massa molecular. Peso molecular isolado não confirma identidade química. Para confirmação clínica/laboratorial, use dados complementares como fórmula molecular, MS/MS, fragmentação, tempo de retenção, matriz da amostra, método analítico, padrão de referência e validação profissional.",
    demoWarning:
      "Dados de demonstração usados apenas para teste técnico. Não usar como base científica real.",

    dashboardHeroTitleA: "Identify by Molecular Weight.",
    dashboardHeroTitleB: "Match with Confidence.",
    dashboardHeroSubtitle:
      "Status operacional, cobertura de dados científicos e monitoramento de importações.",
    statReal: "Substâncias reais",
    statPubChem: "Total PubChem",
    statChebi: "Total ChEBI",
    statHmdb: "Total HMDB",
    latestImport: "Última importação",
    none: "Nenhuma",
    apiStatus: "API",
    dbStatus: "DB",
    dashboardError: "Falha ao carregar dashboard",

    singleTitle: "Pesquisa Individual",
    molecularWeightInput: "Peso molecular",
    massType: "Tipo de massa",
    tolerance: "Tolerância",
    toleranceType: "Tipo de tolerância",
    resultLimit: "Limite de resultados",
    includeRestricted: "Incluir fontes restritas (uso interno)",
    searching: "Pesquisando...",
    search: "Pesquisar",
    exportCsv: "Exportar CSV",
    candidates: "Candidatos compatíveis",
    searchError: "Falha na busca",

    batchTitle: "Pesquisa em Lote",
    massListLabel: "Lista de massas (separadas por linha, espaço ou vírgula)",
    processBatch: "Processar Lote",
    processing: "Processando...",
    batchError: "Falha na busca em lote",
    invalidEntries: "entrada(s) inválida(s) foram ignoradas.",
    massGroup: "Massa",
    limitPerMass: "Limite por massa",

    tableName: "Nome",
    tableFormula: "Fórmula",
    tableType: "Tipo",
    tableMass: "Massa",
    tableDa: "Dif. Da",
    tablePpm: "Dif. ppm",
    tableConfidence: "Confiança",

    adminTitle: "Admin",
    adminHint: "No Render Free, para importações grandes, prefira CLI local apontando para o Atlas.",
    pubchemImport: "Importação PubChem",
    chebiImport: "Importação ChEBI",
    hmdbImport: "Importação HMDB (arquivo local)",
    startPubchem: "Iniciar PubChem",
    startChebi: "Iniciar ChEBI",
    startHmdb: "Iniciar HMDB",
    dataSection: "Dados",
    realData: "Reais",
    demoData: "Demo",
    clearDemo: "Limpar dados demo",
    jobs: "Jobs",
    importSuccess: "Importação iniciada com sucesso",
    importError: "Falha ao iniciar importação",

    detailLoadError: "Falha ao carregar substância",
    noDescription: "Sem descrição",
    restrictedLicense: "Licença restrita",
    masses: "Massas",
    identifiers: "Identificadores",
    traceability: "Fontes e rastreabilidade",
    externalLink: "Link externo",
    na: "n/d",
    loading: "Carregando...",
    brandSystem: "Sistema visual",
    brandPalette: "Paleta de cor",
    brandKeywords: "Palavras-chave da marca",
    keywordPrecision: "Precisão",
    keywordScience: "Ciência",
    keywordMatching: "Matching",
    keywordDiscovery: "Descoberta",
    keywordTrust: "Confiança",
    detailMolecularWeight: "Molecular Weight",
    detailExactMass: "Exact Mass",
    detailMonoisotopicMass: "Monoisotopic Mass",
    detailAverageMass: "Average Mass"
  },
  "en-US": {
    navDashboard: "Dashboard",
    navSingle: "Single Search",
    navBatch: "Batch Search",
    navAdmin: "Admin",
    tagline: "Identify. Match. Discover.",

    themeLight: "Light Mode",
    themeDark: "Dark Mode",

    langPt: "Portuguese (BR)",
    langEn: "English (US)",

    scientificWarning:
      "MolecularMatch returns mass-based compatible candidates. Molecular weight alone does not confirm chemical identity. For clinical/lab confirmation, use complementary evidence such as molecular formula, MS/MS, fragmentation, retention time, sample matrix, analytical method, reference standard, and professional validation.",
    demoWarning:
      "Demo data is provided for technical testing only. Do not use it as real scientific evidence.",

    dashboardHeroTitleA: "Identify by Molecular Weight.",
    dashboardHeroTitleB: "Match with Confidence.",
    dashboardHeroSubtitle:
      "Operational status, scientific data coverage, and import monitoring.",
    statReal: "Real Substances",
    statPubChem: "PubChem Total",
    statChebi: "ChEBI Total",
    statHmdb: "HMDB Total",
    latestImport: "Latest import",
    none: "None",
    apiStatus: "API",
    dbStatus: "DB",
    dashboardError: "Failed to load dashboard",

    singleTitle: "Single Search",
    molecularWeightInput: "Molecular weight",
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

    batchTitle: "Batch Search",
    massListLabel: "Mass list (split by line, space, or comma)",
    processBatch: "Process Batch",
    processing: "Processing...",
    batchError: "Batch search failed",
    invalidEntries: "invalid entries were ignored.",
    massGroup: "Mass",
    limitPerMass: "Limit per mass",

    tableName: "Name",
    tableFormula: "Formula",
    tableType: "Type",
    tableMass: "Mass",
    tableDa: "Da diff",
    tablePpm: "ppm diff",
    tableConfidence: "Confidence",

    adminTitle: "Admin",
    adminHint: "On Render Free, for large imports, prefer local CLI pointing to Atlas.",
    pubchemImport: "PubChem Import",
    chebiImport: "ChEBI Import",
    hmdbImport: "HMDB Import (local file)",
    startPubchem: "Start PubChem",
    startChebi: "Start ChEBI",
    startHmdb: "Start HMDB",
    dataSection: "Data",
    realData: "Real",
    demoData: "Demo",
    clearDemo: "Clear demo data",
    jobs: "Jobs",
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
    brandSystem: "Visual system",
    brandPalette: "Color palette",
    brandKeywords: "Brand keywords",
    keywordPrecision: "Precision",
    keywordScience: "Science",
    keywordMatching: "Matching",
    keywordDiscovery: "Discovery",
    keywordTrust: "Trust",
    detailMolecularWeight: "Molecular Weight",
    detailExactMass: "Exact Mass",
    detailMonoisotopicMass: "Monoisotopic Mass",
    detailAverageMass: "Average Mass"
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
