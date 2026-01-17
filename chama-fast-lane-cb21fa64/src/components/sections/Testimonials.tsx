import { TestimonialsSection } from "@/components/ui/testimonials-with-marquee";

const testimonials = [
  {
    author: {
      name: "Carlos Silva",
      handle: "@carlossilva",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    text: "Fiquei impressionado com a rapidez do atendimento. Em menos de 20 minutos o guincho chegou!"
  },
  {
    author: {
      name: "Ana Paula",
      handle: "@anapaula",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
    },
    text: "Melhor experiência que já tive com guincho. Preço justo e transparente, sem surpresas."
  },
  {
    author: {
      name: "Roberto Santos",
      handle: "@robertosantos",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    text: "O app é muito fácil de usar. Consegui acompanhar o guincho chegando em tempo real."
  },
  {
    author: {
      name: "Maria Oliveira",
      handle: "@mariaoliveira",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    },
    text: "Atendimento humanizado e profissional. Recomendo a todos!"
  },
  {
    author: {
      name: "João Pedro",
      handle: "@joaopedro",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
    },
    text: "Precisei de guincho às 3h da manhã e fui atendido rapidamente. Excelente serviço 24h!"
  },
];

export function Testimonials() {
  return (
    <TestimonialsSection
      title="O que dizem nossos clientes"
      description="Milhares de clientes satisfeitos em todo o Brasil"
      testimonials={testimonials}
      className="pt-4"
    />
  );
}
