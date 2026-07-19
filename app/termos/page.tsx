import { LegalPage } from "@/components/landing/legal-page";

export default function TermosDeUsoPage() {
  return (
    <LegalPage titulo="Termos de Uso" atualizadoEm="19 de julho de 2026">
      <p>
        Estes Termos de Uso regulam o acesso e uso da plataforma ProLicita
        (&quot;Plataforma&quot;, &quot;nós&quot;) por pessoas jurídicas e seus
        representantes (&quot;você&quot;, &quot;Usuário&quot;). Ao criar uma
        conta, você declara que leu, entendeu e concorda com estes termos.
      </p>

      <section>
        <h2 className="text-[16px] font-bold">1. O que é a Plataforma</h2>
        <p className="mt-2">
          O ProLicita monitora licitações públicas publicadas no Portal
          Nacional de Contratações Públicas (PNCP), avalia a compatibilidade
          com o perfil da sua empresa usando inteligência artificial, e
          oferece ferramentas de acompanhamento (pipeline, checklist de
          documentos, geração de rascunhos de proposta) para apoiar o
          processo comercial de participação em licitações.
        </p>
      </section>

      <section>
        <h2 className="text-[16px] font-bold">2. Cadastro e conta</h2>
        <p className="mt-2">
          Para usar a Plataforma, você deve criar uma conta com informações
          verdadeiras, completas e atualizadas sobre você e sua empresa. Você
          é responsável por manter a confidencialidade da sua senha e por
          todas as atividades realizadas na sua conta.
        </p>
      </section>

      <section>
        <h2 className="text-[16px] font-bold">
          3. Acesso antecipado e cobrança
        </h2>
        <p className="mt-2">
          A Plataforma está atualmente em fase de acesso antecipado, durante
          a qual o uso é gratuito. Caso decidamos iniciar cobrança no futuro,
          avisaremos com antecedência razoável, por e-mail e/ou dentro da
          Plataforma, e você poderá optar por continuar em um plano pago,
          mudar de plano ou cancelar sua conta antes de qualquer cobrança
          ser efetivada.
        </p>
      </section>

      <section>
        <h2 className="text-[16px] font-bold">4. Uso adequado</h2>
        <p className="mt-2">Ao usar a Plataforma, você concorda em não:</p>
        <ul className="mt-2 list-disc pl-5">
          <li>Fornecer informações falsas sobre você ou sua empresa;</li>
          <li>
            Tentar acessar dados de outras empresas ou contornar mecanismos
            de segurança;
          </li>
          <li>
            Utilizar a Plataforma para fins ilícitos ou que violem direitos
            de terceiros;
          </li>
          <li>
            Fazer engenharia reversa, copiar ou revender o software da
            Plataforma sem autorização.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-[16px] font-bold">
          5. Conteúdo gerado por inteligência artificial
        </h2>
        <p className="mt-2">
          A Plataforma utiliza IA para avaliar compatibilidade de
          licitações, analisar conformidade de documentos e gerar rascunhos
          de propostas técnicas/comerciais. Esse conteúdo é fornecido como
          apoio operacional e <strong>não substitui análise jurídica ou
          técnica especializada</strong>. Você é responsável por revisar e
          validar qualquer conteúdo gerado pela IA antes de utilizá-lo em
          processos licitatórios reais.
        </p>
      </section>

      <section>
        <h2 className="text-[16px] font-bold">6. Dados de terceiros</h2>
        <p className="mt-2">
          Informações sobre licitações, órgãos e CAPAG são obtidas de fontes
          públicas oficiais (PNCP, Tesouro Nacional, Receita Federal via
          serviços de consulta de CNPJ). Não garantimos a exatidão,
          completude ou atualização em tempo real desses dados, que podem
          conter imprecisões da fonte original.
        </p>
      </section>

      <section>
        <h2 className="text-[16px] font-bold">7. Propriedade intelectual</h2>
        <p className="mt-2">
          Todo o software, marca, layout e conteúdo da Plataforma pertencem
          ao ProLicita. Os dados que você insere sobre sua empresa
          continuam sendo de sua propriedade.
        </p>
      </section>

      <section>
        <h2 className="text-[16px] font-bold">
          8. Limitação de responsabilidade
        </h2>
        <p className="mt-2">
          A Plataforma é fornecida &quot;como está&quot;. Não nos
          responsabilizamos por resultados de licitações, decisões tomadas
          com base nas informações da Plataforma, ou indisponibilidades
          temporárias do serviço.
        </p>
      </section>

      <section>
        <h2 className="text-[16px] font-bold">9. Cancelamento</h2>
        <p className="mt-2">
          Você pode cancelar sua conta a qualquer momento, sem multa ou
          período de fidelidade, diretamente pelo painel ou entrando em
          contato conosco.
        </p>
      </section>

      <section>
        <h2 className="text-[16px] font-bold">10. Alterações</h2>
        <p className="mt-2">
          Podemos atualizar estes Termos periodicamente. Mudanças relevantes
          serão comunicadas com antecedência razoável.
        </p>
      </section>

      <section>
        <h2 className="text-[16px] font-bold">11. Contato</h2>
        <p className="mt-2">
          Dúvidas sobre estes Termos podem ser enviadas para{" "}
          <a
            href="mailto:contato@prolicita.com.br"
            className="font-semibold text-primary hover:underline"
          >
            contato@prolicita.com.br
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}
