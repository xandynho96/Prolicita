"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PillToggle } from "@/components/ui/pill-toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UFS } from "@/lib/uf";
import { MODALIDADES_CONTRATACAO } from "@/lib/pncp/types";
import { Trash2, Plus } from "lucide-react";
import {
  maskCep,
  maskCnpj,
  maskCpf,
  maskMoeda,
  maskTelefone,
  maskWhatsapp,
  numeroParaMascaraMoeda,
} from "@/lib/masks";
import { ProdutosForm } from "@/components/perfil/produtos-form";

interface Contato {
  nome: string;
  numero: string;
}

interface EmpresaForm {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  porte: string;
  segmento: string;
  telefone: string;
  email: string;
  site: string;
  logradouro: string;
  enderecoNumero: string;
  bairro: string;
  cep: string;
  municipio: string;
  uf: string;
  cnaesTexto: string;
  palavrasChaveTexto: string;
  descricaoPerfil: string;
  valorMinimo: string;
  valorMaximo: string;
  ufsBusca: string[];
  buscarBrasilTodo: boolean;
  modalidades: number[];
  contatosWhatsapp: Contato[];
  whatsappAtivo: boolean;
  representanteLegalNome: string;
  representanteLegalCpf: string;
  representanteLegalCargo: string;
}

const vazio: EmpresaForm = {
  razaoSocial: "",
  nomeFantasia: "",
  cnpj: "",
  porte: "",
  segmento: "",
  telefone: "",
  email: "",
  site: "",
  logradouro: "",
  enderecoNumero: "",
  bairro: "",
  cep: "",
  municipio: "",
  uf: "",
  cnaesTexto: "",
  palavrasChaveTexto: "",
  descricaoPerfil: "",
  valorMinimo: "",
  valorMaximo: "",
  ufsBusca: [],
  buscarBrasilTodo: false,
  modalidades: [],
  contatosWhatsapp: [],
  whatsappAtivo: true,
  representanteLegalNome: "",
  representanteLegalCpf: "",
  representanteLegalCargo: "",
};

const PORTES = [
  { value: "ME", label: "Microempresa (ME)" },
  { value: "EPP", label: "Empresa de Pequeno Porte (EPP)" },
  { value: "MEDIO", label: "Médio porte" },
  { value: "GRANDE", label: "Grande porte" },
];

export default function PerfilPage() {
  const [form, setForm] = useState<EmpresaForm>(vazio);
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [buscandoCnpj, setBuscandoCnpj] = useState(false);

  useEffect(() => {
    fetch("/api/empresa")
      .then((r) => r.json())
      .then((data) => {
        const e = data.empresa;
        if (e) {
          setForm({
            razaoSocial: e.razaoSocial ?? "",
            nomeFantasia: e.nomeFantasia ?? "",
            cnpj: maskCnpj(e.cnpj ?? ""),
            porte: e.porte ?? "",
            segmento: e.segmento ?? "",
            telefone: maskTelefone(e.telefone ?? ""),
            email: e.email ?? "",
            site: e.site ?? "",
            logradouro: e.logradouro ?? "",
            enderecoNumero: e.numero ?? "",
            bairro: e.bairro ?? "",
            cep: maskCep(e.cep ?? ""),
            municipio: e.municipio ?? "",
            uf: e.uf ?? "",
            cnaesTexto: (e.cnaes ?? []).join(", "),
            palavrasChaveTexto: (e.palavrasChave ?? []).join(", "),
            descricaoPerfil: e.descricaoPerfil ?? "",
            valorMinimo: numeroParaMascaraMoeda(e.valorMinimo),
            valorMaximo: numeroParaMascaraMoeda(e.valorMaximo),
            ufsBusca: e.ufsBusca ?? [],
            buscarBrasilTodo: e.buscarBrasilTodo ?? false,
            modalidades: e.modalidades ?? [],
            contatosWhatsapp: (e.contatosWhatsapp ?? []).map(
              (c: Contato) => ({ ...c, numero: maskWhatsapp(c.numero) })
            ),
            whatsappAtivo: e.whatsappAtivo ?? true,
            representanteLegalNome: e.representanteLegalNome ?? "",
            representanteLegalCpf: maskCpf(e.representanteLegalCpf ?? ""),
            representanteLegalCargo: e.representanteLegalCargo ?? "",
          });
        }
      })
      .finally(() => setCarregando(false));
  }, []);

  const handleChange =
    (campo: keyof EmpresaForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [campo]: e.target.value }));
    };

  const handleMaskedChange =
    (campo: keyof EmpresaForm, mask: (v: string) => string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [campo]: mask(e.target.value) }));
    };

  const toggleUf = (uf: string) => {
    setForm((f) => ({
      ...f,
      ufsBusca: f.ufsBusca.includes(uf)
        ? f.ufsBusca.filter((u) => u !== uf)
        : [...f.ufsBusca, uf],
    }));
  };

  const toggleModalidade = (codigo: number) => {
    setForm((f) => ({
      ...f,
      modalidades: f.modalidades.includes(codigo)
        ? f.modalidades.filter((m) => m !== codigo)
        : [...f.modalidades, codigo],
    }));
  };

  const addContato = () => {
    setForm((f) => ({
      ...f,
      contatosWhatsapp: [...f.contatosWhatsapp, { nome: "", numero: "" }],
    }));
  };

  const removeContato = (index: number) => {
    setForm((f) => ({
      ...f,
      contatosWhatsapp: f.contatosWhatsapp.filter((_, i) => i !== index),
    }));
  };

  const updateContato = (
    index: number,
    campo: keyof Contato,
    valor: string
  ) => {
    setForm((f) => ({
      ...f,
      contatosWhatsapp: f.contatosWhatsapp.map((c, i) =>
        i === index ? { ...c, [campo]: valor } : c
      ),
    }));
  };

  const handleBuscarCnpj = async () => {
    const digitos = form.cnpj.replace(/\D/g, "");
    if (digitos.length !== 14) {
      toast.error("Informe um CNPJ completo antes de buscar");
      return;
    }
    setBuscandoCnpj(true);
    try {
      const res = await fetch(`/api/cnpj/${digitos}`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Não foi possível consultar o CNPJ");
        return;
      }
      const d = data.dados;
      setForm((f) => ({
        ...f,
        razaoSocial: d.razaoSocial || f.razaoSocial,
        nomeFantasia: d.nomeFantasia || f.nomeFantasia,
        porte: d.porte || f.porte,
        telefone: d.telefone ? maskTelefone(d.telefone) : f.telefone,
        email: d.email || f.email,
        logradouro: d.logradouro || f.logradouro,
        enderecoNumero: d.numero || f.enderecoNumero,
        bairro: d.bairro || f.bairro,
        cep: d.cep ? maskCep(d.cep) : f.cep,
        municipio: d.municipio || f.municipio,
        uf: d.uf || f.uf,
        cnaesTexto: d.cnaes?.length ? d.cnaes.join(", ") : f.cnaesTexto,
      }));
      toast.success("Dados do CNPJ preenchidos — revise antes de salvar");
    } catch {
      toast.error("Não foi possível consultar o CNPJ");
    } finally {
      setBuscandoCnpj(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const contatosValidos = form.contatosWhatsapp.filter(
      (c) => c.nome.trim() && c.numero.trim()
    );

    const payload = {
      razaoSocial: form.razaoSocial,
      nomeFantasia: form.nomeFantasia || undefined,
      cnpj: form.cnpj,
      porte: form.porte || undefined,
      segmento: form.segmento || undefined,
      telefone: form.telefone || undefined,
      email: form.email || undefined,
      site: form.site || undefined,
      logradouro: form.logradouro || undefined,
      numero: form.enderecoNumero || undefined,
      bairro: form.bairro || undefined,
      cep: form.cep || undefined,
      municipio: form.municipio || undefined,
      uf: form.uf || undefined,
      cnaes: form.cnaesTexto
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      palavrasChave: form.palavrasChaveTexto
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      descricaoPerfil: form.descricaoPerfil || undefined,
      valorMinimo: form.valorMinimo
        ? Number(form.valorMinimo.replace(/\D/g, ""))
        : undefined,
      valorMaximo: form.valorMaximo
        ? Number(form.valorMaximo.replace(/\D/g, ""))
        : undefined,
      ufsBusca: form.buscarBrasilTodo ? [] : form.ufsBusca,
      buscarBrasilTodo: form.buscarBrasilTodo,
      modalidades: form.modalidades,
      contatosWhatsapp: contatosValidos,
      whatsappAtivo: form.whatsappAtivo,
      representanteLegalNome: form.representanteLegalNome || undefined,
      representanteLegalCpf: form.representanteLegalCpf || undefined,
      representanteLegalCargo: form.representanteLegalCargo || undefined,
    };

    const res = await fetch("/api/empresa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error ?? "Não foi possível salvar o perfil");
      return;
    }

    toast.success("Perfil salvo com sucesso");
  };

  if (carregando) {
    return <p className="text-sm text-muted-foreground">Carregando...</p>;
  }

  return (
    <div className="max-w-[900px] space-y-6">
      <div>
        <h1 className="text-[27px] font-extrabold tracking-tight">
          Perfil da empresa
        </h1>
        <p className="mt-1.5 max-w-[620px] text-[14.5px] text-muted-foreground">
          Quanto mais completo o perfil, mais precisa é a avaliação da IA
          sobre cada licitação.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados institucionais</CardTitle>
            <CardDescription>Identificação da empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="razaoSocial">Razão social</Label>
                <Input
                  id="razaoSocial"
                  required
                  value={form.razaoSocial}
                  onChange={handleChange("razaoSocial")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nomeFantasia">Nome fantasia</Label>
                <Input
                  id="nomeFantasia"
                  value={form.nomeFantasia}
                  onChange={handleChange("nomeFantasia")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <div className="flex gap-2">
                  <Input
                    id="cnpj"
                    required
                    value={form.cnpj}
                    onChange={handleMaskedChange("cnpj", maskCnpj)}
                    placeholder="00.000.000/0001-00"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBuscarCnpj}
                    disabled={buscandoCnpj}
                  >
                    {buscandoCnpj ? "Buscando..." : "Buscar CNPJ"}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="porte">Porte</Label>
                <Select
                  value={form.porte}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, porte: v ?? "" }))
                  }
                >
                  <SelectTrigger id="porte">
                    <SelectValue placeholder="Selecione">
                      {(v: string) =>
                        PORTES.find((p) => p.value === v)?.label ?? v
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {PORTES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="segmento">Segmento/ramo de atuação</Label>
              <Input
                id="segmento"
                value={form.segmento}
                onChange={handleChange("segmento")}
                placeholder="Ex: Tecnologia da informação"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={form.telefone}
                  onChange={handleMaskedChange("telefone", maskTelefone)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site">Site</Label>
                <Input
                  id="site"
                  value={form.site}
                  onChange={handleChange("site")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Representante legal</CardTitle>
            <CardDescription>
              Usado na identificação do licitante em propostas geradas pela
              plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="representanteLegalNome">Nome completo</Label>
              <Input
                id="representanteLegalNome"
                value={form.representanteLegalNome}
                onChange={handleChange("representanteLegalNome")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="representanteLegalCpf">CPF</Label>
              <Input
                id="representanteLegalCpf"
                value={form.representanteLegalCpf}
                onChange={handleMaskedChange("representanteLegalCpf", maskCpf)}
                placeholder="000.000.000-00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="representanteLegalCargo">Cargo</Label>
              <Input
                id="representanteLegalCargo"
                value={form.representanteLegalCargo}
                onChange={handleChange("representanteLegalCargo")}
                placeholder="Ex: Sócio-administrador"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="logradouro">Logradouro</Label>
                <Input
                  id="logradouro"
                  value={form.logradouro}
                  onChange={handleChange("logradouro")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="enderecoNumero">Número</Label>
                <Input
                  id="enderecoNumero"
                  value={form.enderecoNumero}
                  onChange={handleChange("enderecoNumero")}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={form.bairro}
                  onChange={handleChange("bairro")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={form.cep}
                  onChange={handleMaskedChange("cep", maskCep)}
                  placeholder="00000-000"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="municipio">Município</Label>
                <Input
                  id="municipio"
                  value={form.municipio}
                  onChange={handleChange("municipio")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uf">UF</Label>
                <Input
                  id="uf"
                  value={form.uf}
                  onChange={handleChange("uf")}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Perfil de atuação</CardTitle>
            <CardDescription>
              Usado para filtrar e avaliar as licitações do PNCP
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cnaes">CNAEs (separados por vírgula)</Label>
              <Input
                id="cnaes"
                value={form.cnaesTexto}
                onChange={handleChange("cnaesTexto")}
                placeholder="6201-5/01, 6202-3/00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="palavrasChave">
                Palavras-chave de interesse (separadas por vírgula)
              </Label>
              <Input
                id="palavrasChave"
                value={form.palavrasChaveTexto}
                onChange={handleChange("palavrasChaveTexto")}
                placeholder="desenvolvimento de software, manutenção de sistemas"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricaoPerfil">Descrição do perfil</Label>
              <Textarea
                id="descricaoPerfil"
                rows={5}
                value={form.descricaoPerfil}
                onChange={handleChange("descricaoPerfil")}
                placeholder="Descreva os produtos/serviços que sua empresa oferece, para a IA avaliar o quão relevante cada licitação é"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valorMinimo">Valor mínimo de interesse (R$)</Label>
                <Input
                  id="valorMinimo"
                  type="text"
                  inputMode="numeric"
                  value={form.valorMinimo}
                  onChange={handleMaskedChange("valorMinimo", maskMoeda)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valorMaximo">Valor máximo de interesse (R$)</Label>
                <Input
                  id="valorMaximo"
                  type="text"
                  inputMode="numeric"
                  value={form.valorMaximo}
                  onChange={handleMaskedChange("valorMaximo", maskMoeda)}
                  placeholder="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <ProdutosForm />

        <Card>
          <CardHeader>
            <CardTitle>Região de busca</CardTitle>
            <CardDescription>
              Onde o ProLicita deve procurar licitações para esta empresa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="buscarBrasilTodo"
                checked={form.buscarBrasilTodo}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, buscarBrasilTodo: v === true }))
                }
              />
              <Label htmlFor="buscarBrasilTodo" className="font-normal">
                Buscar em todo o Brasil
              </Label>
            </div>

            {!form.buscarBrasilTodo && (
              <div className="flex flex-wrap gap-2">
                {UFS.map((uf) => (
                  <PillToggle
                    key={uf}
                    active={form.ufsBusca.includes(uf)}
                    onClick={() => toggleUf(uf)}
                  >
                    {uf}
                  </PillToggle>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modalidades de interesse</CardTitle>
            <CardDescription>
              Deixe tudo desmarcado para buscar em todas as modalidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {Object.entries(MODALIDADES_CONTRATACAO).map(([codigo, nome]) => (
                <PillToggle
                  key={codigo}
                  active={form.modalidades.includes(Number(codigo))}
                  onClick={() => toggleModalidade(Number(codigo))}
                >
                  {nome}
                </PillToggle>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              Nenhuma modalidade selecionada = busca em todas.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contatos para WhatsApp</CardTitle>
            <CardDescription>
              Números que devem receber os alertas de novas licitações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2 rounded-lg border border-border bg-accent/30 p-3">
              <Checkbox
                id="whatsappAtivo"
                checked={form.whatsappAtivo}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, whatsappAtivo: v === true }))
                }
              />
              <div>
                <Label htmlFor="whatsappAtivo" className="font-normal">
                  Enviar alertas por WhatsApp
                </Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Desative para pausar os envios a qualquer momento — o
                  painel continua mostrando as licitações compatíveis
                  normalmente. Útil se o número estiver sob restrição do
                  WhatsApp.
                </p>
              </div>
            </div>

            {form.contatosWhatsapp.map((contato, index) => (
              <div key={index} className="flex items-end gap-2">
                <div className="flex-1 space-y-2">
                  <Label className="text-xs">Nome</Label>
                  <Input
                    value={contato.nome}
                    onChange={(e) =>
                      updateContato(index, "nome", e.target.value)
                    }
                    placeholder="Nome do contato"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="text-xs">WhatsApp</Label>
                  <Input
                    value={contato.numero}
                    onChange={(e) =>
                      updateContato(index, "numero", maskWhatsapp(e.target.value))
                    }
                    placeholder="+55 (11) 99999-9999"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeContato(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addContato}>
              <Plus className="h-4 w-4" />
              Adicionar contato
            </Button>
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar perfil"}
        </Button>
      </form>
    </div>
  );
}
