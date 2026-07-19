"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PillToggle } from "@/components/ui/pill-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";

type Tipo = "produto" | "servico";

interface Produto {
  id: string;
  nome: string;
  tipo: Tipo;
  descricaoResumida: string;
  descricaoDetalhada: string | null;
}

const NOVO = {
  nome: "",
  tipo: "servico" as Tipo,
  descricaoResumida: "",
  descricaoDetalhada: "",
};

export function ProdutosForm() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [novo, setNovo] = useState(NOVO);
  const [adicionando, setAdicionando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetch("/api/produtos")
      .then((r) => r.json())
      .then((data) => setProdutos(data.produtos ?? []))
      .finally(() => setCarregando(false));
  }, []);

  const criarProduto = async () => {
    if (!novo.nome.trim() || !novo.descricaoResumida.trim()) {
      toast.error("Informe nome e descrição resumida do produto");
      return;
    }
    setSalvando(true);
    const res = await fetch("/api/produtos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: novo.nome,
        tipo: novo.tipo,
        descricaoResumida: novo.descricaoResumida,
        descricaoDetalhada: novo.descricaoDetalhada || undefined,
      }),
    });
    const data = await res.json();
    setSalvando(false);
    if (!res.ok) {
      toast.error(data.error ?? "Não foi possível adicionar o produto");
      return;
    }
    setProdutos((p) => [data.produto, ...p]);
    setNovo(NOVO);
    setAdicionando(false);
  };

  const removerProduto = async (id: string) => {
    const anterior = produtos;
    setProdutos((p) => p.filter((prod) => prod.id !== id));
    const res = await fetch(`/api/produtos/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setProdutos(anterior);
      toast.error("Não foi possível remover o produto");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtos e serviços</CardTitle>
        <CardDescription>
          Cadastre o que sua empresa oferece — isso é usado pela IA para
          avaliar cada licitação com mais precisão e, no futuro, para gerar
          propostas automaticamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {carregando && (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        )}

        {!carregando && produtos.length === 0 && !adicionando && (
          <p className="text-sm text-muted-foreground">
            Nenhum produto cadastrado ainda.
          </p>
        )}

        {produtos.map((produto) => (
          <div
            key={produto.id}
            className="flex items-start justify-between gap-3 rounded-lg border border-border p-3"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{produto.nome}</span>
                <span className="rounded-full bg-accent px-2 py-0.5 text-[10.5px] font-bold text-muted-foreground">
                  {produto.tipo === "produto" ? "Produto" : "Serviço"}
                </span>
              </div>
              <div className="mt-0.5 text-sm text-muted-foreground">
                {produto.descricaoResumida}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removerProduto(produto.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {adicionando ? (
          <div className="space-y-3 rounded-lg border border-border p-3">
            <div className="space-y-2">
              <Label className="text-xs">Tipo</Label>
              <div className="flex gap-2">
                <PillToggle
                  active={novo.tipo === "produto"}
                  onClick={() => setNovo((n) => ({ ...n, tipo: "produto" }))}
                >
                  Produto
                </PillToggle>
                <PillToggle
                  active={novo.tipo === "servico"}
                  onClick={() => setNovo((n) => ({ ...n, tipo: "servico" }))}
                >
                  Serviço
                </PillToggle>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Nome do produto/serviço</Label>
              <Input
                value={novo.nome}
                onChange={(e) => setNovo((n) => ({ ...n, nome: e.target.value }))}
                placeholder="Ex: InCity Administração"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Descrição resumida</Label>
              <Input
                value={novo.descricaoResumida}
                onChange={(e) =>
                  setNovo((n) => ({ ...n, descricaoResumida: e.target.value }))
                }
                placeholder="Ex: Gestão de RH municipal com ponto eletrônico e férias"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">
                Descrição detalhada (opcional — usada em propostas)
              </Label>
              <Textarea
                rows={3}
                value={novo.descricaoDetalhada}
                onChange={(e) =>
                  setNovo((n) => ({ ...n, descricaoDetalhada: e.target.value }))
                }
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={criarProduto}
                disabled={salvando}
              >
                {salvando ? "Salvando..." : "Salvar produto"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setAdicionando(false);
                  setNovo(NOVO);
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAdicionando(true)}
          >
            <Plus className="h-4 w-4" />
            Adicionar produto
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
