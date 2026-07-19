import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10.5, lineHeight: 1.5, color: "#1a1a1a" },
  capa: { flexGrow: 1, justifyContent: "center", alignItems: "center", textAlign: "center" },
  capaTitulo: { fontSize: 20, fontWeight: 700, marginBottom: 12 },
  capaSub: { fontSize: 12, color: "#4a4a4a", marginBottom: 4 },
  secaoTitulo: { fontSize: 12, fontWeight: 700, marginBottom: 6, marginTop: 16 },
  paragrafo: { marginBottom: 6 },
  linhaIdentificacao: { flexDirection: "row", marginBottom: 3 },
  label: { width: 140, fontWeight: 700 },
  valor: { flex: 1 },
  produtoItem: { marginBottom: 8 },
  produtoNome: { fontWeight: 700, marginBottom: 2 },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, fontSize: 8, color: "#888", textAlign: "center" },
});

export interface PropostaPdfData {
  razaoSocial: string;
  cnpj: string;
  enderecoCompleto: string;
  representanteLegalNome: string | null;
  representanteLegalCpf: string | null;
  representanteLegalCargo: string | null;
  orgaoNome: string;
  objetoLicitacao: string;
  modalidade: string | null;
  pncpId: string;
  produtosSelecionados: { nome: string; descricaoResumida: string }[];
  apresentacaoEmpresa: string | null;
  objetoOfertado: string | null;
  especificacaoTecnica: string | null;
  cronogramaImplantacao: string | null;
  valorTotal: string | null;
  detalhamentoValor: string | null;
  prazoValidadeDias: number;
  prazoExecucaoDias: number | null;
  declaracoes: string | null;
  geradoEm: string;
}

function formatarValor(valor: string | null): string {
  if (!valor) return "A definir";
  const num = Number(valor);
  if (Number.isNaN(num)) return "A definir";
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function PropostaDocument({ data }: { data: PropostaPdfData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.capa}>
          <Text style={styles.capaTitulo}>Proposta Técnica e Comercial</Text>
          <Text style={styles.capaSub}>{data.razaoSocial}</Text>
          <Text style={styles.capaSub}>{data.orgaoNome}</Text>
          <Text style={styles.capaSub}>Processo/PNCP: {data.pncpId}</Text>
          <Text style={{ ...styles.capaSub, marginTop: 20, fontSize: 9 }}>
            Gerado em {data.geradoEm} — rascunho para revisão antes do envio
          </Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.secaoTitulo}>1. Identificação do Licitante</Text>
        <View style={styles.linhaIdentificacao}>
          <Text style={styles.label}>Razão social</Text>
          <Text style={styles.valor}>{data.razaoSocial}</Text>
        </View>
        <View style={styles.linhaIdentificacao}>
          <Text style={styles.label}>CNPJ</Text>
          <Text style={styles.valor}>{data.cnpj}</Text>
        </View>
        <View style={styles.linhaIdentificacao}>
          <Text style={styles.label}>Endereço</Text>
          <Text style={styles.valor}>{data.enderecoCompleto || "-"}</Text>
        </View>
        <View style={styles.linhaIdentificacao}>
          <Text style={styles.label}>Representante legal</Text>
          <Text style={styles.valor}>
            {data.representanteLegalNome ?? "-"}
            {data.representanteLegalCpf ? ` · CPF ${data.representanteLegalCpf}` : ""}
            {data.representanteLegalCargo ? ` · ${data.representanteLegalCargo}` : ""}
          </Text>
        </View>

        <Text style={styles.secaoTitulo}>2. Referência ao Processo Licitatório</Text>
        <Text style={styles.paragrafo}>Órgão: {data.orgaoNome}</Text>
        <Text style={styles.paragrafo}>Modalidade: {data.modalidade ?? "não informado"}</Text>
        <Text style={styles.paragrafo}>Identificação PNCP: {data.pncpId}</Text>
        <Text style={styles.paragrafo}>Objeto do edital: {data.objetoLicitacao}</Text>

        <Text style={styles.secaoTitulo}>3. Apresentação da Empresa</Text>
        <Text style={styles.paragrafo}>{data.apresentacaoEmpresa || "-"}</Text>

        <Text style={styles.secaoTitulo}>4. Objeto Ofertado</Text>
        <Text style={styles.paragrafo}>{data.objetoOfertado || "-"}</Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.secaoTitulo}>5. Especificação Técnica da Solução</Text>
        <Text style={styles.paragrafo}>{data.especificacaoTecnica || "-"}</Text>

        {data.produtosSelecionados.length > 0 && (
          <>
            <Text style={{ ...styles.secaoTitulo, fontSize: 11 }}>
              Produtos/serviços ofertados
            </Text>
            {data.produtosSelecionados.map((p, i) => (
              <View key={i} style={styles.produtoItem}>
                <Text style={styles.produtoNome}>{p.nome}</Text>
                <Text>{p.descricaoResumida}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.secaoTitulo}>6. Cronograma de Implantação</Text>
        <Text style={styles.paragrafo}>{data.cronogramaImplantacao || "-"}</Text>

        <Text style={styles.secaoTitulo}>7. Valor e Prazo de Validade</Text>
        <Text style={styles.paragrafo}>Valor total: {formatarValor(data.valorTotal)}</Text>
        <Text style={styles.paragrafo}>{data.detalhamentoValor || ""}</Text>
        <Text style={styles.paragrafo}>
          Prazo de validade da proposta: {data.prazoValidadeDias} dias corridos
        </Text>
        {data.prazoExecucaoDias && (
          <Text style={styles.paragrafo}>
            Prazo de execução/implantação: {data.prazoExecucaoDias} dias corridos
          </Text>
        )}

        <Text style={styles.secaoTitulo}>8. Declarações</Text>
        <Text style={styles.paragrafo}>{data.declaracoes || "-"}</Text>

        <Text style={{ ...styles.secaoTitulo, marginTop: 30 }}>Assinatura</Text>
        <Text style={styles.paragrafo}>
          _______________________________________________
        </Text>
        <Text style={styles.paragrafo}>
          {data.representanteLegalNome ?? "Representante legal"}
          {data.representanteLegalCargo ? ` — ${data.representanteLegalCargo}` : ""}
        </Text>

        <Text style={styles.footer}>
          Rascunho gerado automaticamente pelo ProLicita — revise com seu
          setor jurídico/técnico antes de enviar ao órgão licitante.
        </Text>
      </Page>
    </Document>
  );
}
