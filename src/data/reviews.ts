export interface Review {
  id: number;
  name: string;
  city: string;
  cityEn: string;
  text: string;
  textEn: string;
  rating: number;
  propertySlug: string;
}

export const reviews: Review[] = [
  {
    id: 1,
    name: 'Sofía Mendoza',
    city: 'Ciudad de México',
    cityEn: 'Mexico City',
    text: "Increíble experiencia en Mamita's. Reservamos en 2 minutos y al llegar todo estaba listo. Lo mejor: nos dijeron que la playa estaba limpia ese día y así fue. ¡Volveremos!",
    textEn: "Incredible experience at Mamita's. We booked in 2 minutes and everything was ready when we arrived. Best part: they told us the beach was clean that day and it was. We'll be back!",
    rating: 5,
    propertySlug: 'mamitas-beach-club',
  },
  {
    id: 2,
    name: 'James Mitchell',
    city: 'Austin, Texas',
    cityEn: 'Austin, Texas',
    text: 'Encontramos RivieraMayaPass buscando day passes en Google y fue la mejor decisión. El Thompson tiene una alberca en el rooftop que es un sueño. El precio fue justo y sin sorpresas.',
    textEn: 'We found RivieraMayaPass searching for day passes on Google and it was the best decision. The Thompson has a rooftop pool that is a dream. The price was fair with no surprises.',
    rating: 5,
    propertySlug: 'thompson-playa',
  },
  {
    id: 3,
    name: 'Ana Lucía Reyes',
    city: 'Guadalajara',
    cityEn: 'Guadalajara',
    text: "Lo que más me gustó es que te dicen dónde NO hay sargazo. Fuimos a Coralina y la playa estaba perfecta. El servicio por WhatsApp fue super rápido y amable.",
    textEn: "What I liked most is that they tell you where there's NO seaweed. We went to Coralina and the beach was perfect. WhatsApp service was super fast and friendly.",
    rating: 5,
    propertySlug: 'coralina-daylight-club',
  },
];
