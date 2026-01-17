import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [{
  question: 'Como faço para solicitar um guincho?',
  answer: 'É muito simples! Basta baixar nosso app ou acessar o site, informar sua localização e o tipo de serviço que precisa. Em poucos minutos, um guincho parceiro será acionado para ir até você.'
}, {
  question: 'Quanto tempo demora para o atendimento chegar?',
  answer: 'O tempo médio de chegada é de 30 minutos, podendo variar de acordo com a região e o trânsito. Você pode acompanhar a chegada do guincho em tempo real pelo nosso app.'
}, {
  question: 'Posso usar o serviço sem plano?',
  answer: 'Sim! Você pode solicitar um guincho avulso pagando apenas pelo serviço utilizado. Porém, com um plano você tem mais economia e benefícios exclusivos como resgates gratuitos mensais.'
}, {
  question: 'Como funciona para quem quer ser associado?',
  answer: 'Para se tornar um parceiro Chama 365, basta fazer seu cadastro informando seus dados e do seu veículo. Após a verificação, você já pode começar a receber chamados na sua região e aumentar seu faturamento.'
}, {
  question: 'Em quais cidades o serviço está disponível?',
  answer: 'Atualmente temos cobertura em Santa Catarina e Paraná, com foco nas principais cidades e regiões metropolitanas. Estamos em constante expansão para atender mais estados em breve!'
}];

export function FAQ() {
  return (
    <section id="faq" className="py-12 md:py-16 lg:py-24 bg-gradient-to-b from-secondary/30 to-black">
      <div className="section-container px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <span className="badge-neutral mb-3 md:mb-4 inline-flex bg-primary text-primary-foreground text-xs md:text-sm">
              Tire suas dúvidas
            </span>
            <h2 className="section-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 md:mb-4">
              Perguntas Frequentes
            </h2>
            <p className="section-subtitle mx-auto text-sm md:text-base lg:text-lg">
              Encontre respostas para as dúvidas mais comuns
            </p>
          </div>

          {/* Accordion */}
          <Accordion type="single" collapsible className="space-y-3 md:space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`} 
                className="section-card border-none px-4 md:px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline text-sm md:text-base py-3 md:py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-xs md:text-sm pb-3 md:pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
