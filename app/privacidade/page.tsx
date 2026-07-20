import { LegalPage } from "@/components/landing/legal-page";

export default function PoliticaDePrivacidadePage() {
  return (
    <LegalPage
      titulo="Política de Privacidade"
      atualizadoEm="19 de julho de 2026"
    >
      <p>
        Esta Política de Privacidade descreve como o ProLicita coleta, usa,
        armazena e protege os dados pessoais e de empresas tratados na
        Plataforma, em conformidade com a Lei Geral de Proteção de Dados
        (LGPD — Lei nº 13.709/2018).
      </p>

      <section>
        <h2 className="text-[16px] font-bold">1. Quais dados coletamos</h2>
        <ul className="mt-2 list-disc pl-5">
          <li>
            <strong>Dados de cadastro:</strong> nome, e-mail e senha
            (armazenada de forma criptografada);
          </li>
          <li>
            <strong>Dados da empresa:</strong> razão social, CNPJ, endereço,
            CNAEs, representante legal, contatos de WhatsApp;
          </li>
          <li>
            <strong>Documentos enviados:</strong> certidões e outros
            documentos de habilitação que você faz upload na Plataforma;
          </li>
          <li>
            <strong>Dados de uso:</strong> licitações consultadas, produtos
            cadastrados, propostas geradas e interações com a Plataforma.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-[16px] font-bold">2. Para que usamos esses dados</h2>
        <ul className="mt-2 list-disc pl-5">
          <li>Operar sua conta e o radar de licitações;</li>
          <li>
            Avaliar compatibilidade entre sua empresa e licitações publicadas
            usando inteligência artificial;
          </li>
          <li>Enviar alertas pelo painel e por WhatsApp;</li>
          <li>Gerar rascunhos de propostas a partir do seu catálogo;</li>
          <li>Melhorar e dar suporte à Plataforma.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-[16px] font-bold">3. Base legal</h2>
        <p className="mt-2">
          Tratamos seus dados com base na execução do contrato firmado ao
          criar sua conta (art. 7º, V da LGPD) e, quando aplicável, no seu
          consentimento (art. 7º, I) — por exemplo, para o envio de alertas
          por WhatsApp.
        </p>
      </section>

      <section>
        <h2 className="text-[16px] font-bold">
          4. Compartilhamento com terceiros
        </h2>
        <p className="mt-2">
          Para operar a Plataforma, compartilhamos dados estritamente
          necessários com provedores de infraestrutura e serviço:
        </p>
        <ul className="mt-2 list-disc pl-5">
          <li>
            Provedor de banco de dados e hospedagem (armazenamento dos
            dados);
          </li>
          <li>
            Provedor de inteligência artificial, para processar o texto de
            licitações e documentos e gerar as avaliações e rascunhos de
            proposta;
          </li>
          <li>
            Provedor de envio de mensagens, para os alertas via WhatsApp
            (apenas para os números que você cadastrar);
          </li>
          <li>
            Serviços públicos de consulta (PNCP, Receita Federal, Tesouro
            Nacional), para buscar e enriquecer dados de licitações e
            empresas.
          </li>
        </ul>
        <p className="mt-2">
          Não vendemos seus dados a terceiros para fins de marketing.
        </p>
      </section>

      <section>
        <h2 className="text-[16px] font-bold">5. Armazenamento e segurança</h2>
        <p className="mt-2">
          Seus dados são armazenados em servidores com controle de acesso e
          conexão criptografada. Senhas são armazenadas com hash, nunca em
          texto puro.
        </p>
      </section>

      <section>
        <h2 className="text-[16px] font-bold">6. Seus direitos</h2>
        <p className="mt-2">
          Conforme a LGPD, você pode solicitar a qualquer momento:
        </p>
        <ul className="mt-2 list-disc pl-5">
          <li>Confirmação e acesso aos dados que temos sobre você;</li>
          <li>Correção de dados incompletos ou desatualizados;</li>
          <li>Exclusão dos seus dados, encerrando sua conta;</li>
          <li>Portabilidade dos seus dados a outro fornecedor;</li>
          <li>Revogação do consentimento para envio de alertas.</li>
        </ul>
        <p className="mt-2">
          Para exercer esses direitos, envie um e-mail para{" "}
          <a
            href="mailto:prolicita.ia@gmail.com"
            className="font-semibold text-primary hover:underline"
          >
            prolicita.ia@gmail.com
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="text-[16px] font-bold">7. Retenção de dados</h2>
        <p className="mt-2">
          Mantemos seus dados enquanto sua conta estiver ativa. Ao solicitar
          o encerramento, seus dados são excluídos ou anonimizados, exceto
          quando a lei exigir retenção por período determinado.
        </p>
      </section>

      <section>
        <h2 className="text-[16px] font-bold">8. Alterações</h2>
        <p className="mt-2">
          Podemos atualizar esta Política periodicamente. Mudanças
          relevantes serão comunicadas com antecedência razoável.
        </p>
      </section>

      <section>
        <h2 className="text-[16px] font-bold">9. Contato</h2>
        <p className="mt-2">
          Dúvidas sobre esta Política podem ser enviadas para{" "}
          <a
            href="mailto:prolicita.ia@gmail.com"
            className="font-semibold text-primary hover:underline"
          >
            prolicita.ia@gmail.com
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}
