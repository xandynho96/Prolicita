export function capagMeta(capag: string) {
  switch (capag) {
    case "A+":
    case "A":
      return {
        label: `CAPAG ${capag}`,
        bg: "#E3F5EC",
        color: "#12896B",
        descricao: "Boa capacidade de pagamento",
      };
    case "B+":
    case "B":
      return {
        label: `CAPAG ${capag}`,
        bg: "#FCF1DC",
        color: "#9A6316",
        descricao: "Capacidade de pagamento intermediária",
      };
    case "C":
    case "D":
      return {
        label: `CAPAG ${capag}`,
        bg: "#FBE7E7",
        color: "#B23A3A",
        descricao: "Capacidade de pagamento fraca — risco de atraso",
      };
    default:
      return {
        label: "CAPAG n.d.",
        bg: "#EEF0F3",
        color: "#565F6B",
        descricao: "Sem avaliação disponível",
      };
  }
}
