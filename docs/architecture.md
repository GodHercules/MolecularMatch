# Arquitetura MolecularMatch

- `apps/api`: API NestJS, busca molecular, histórico, import jobs, admin.
- `apps/web`: interface Next.js (dashboard, busca, detalhe, admin).
- `packages/shared`: tipos e regras centrais (tolerância, score, licença, CSV, dedupe).
- `scripts/importers`: importadores reais para PubChem/ChEBI/HMDB.

Fluxo:

1. Importadores coletam registros reais.
2. Normalização gera `Substance` canônico.
3. Deduplicação mescla por InChIKey/CID/IDs/fórmula.
4. Busca por faixa indexada calcula diferenças + score.
5. Resultado retorna candidato compatível com rastreabilidade e avisos.
