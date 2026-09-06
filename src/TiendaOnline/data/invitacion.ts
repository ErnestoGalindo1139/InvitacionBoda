// Todos los datos editables. Fecha ISO con zona: 2026-12-12T17:00:00-07:00.
export const invitacion = {
  novia: 'Alejandra',
  novio: 'Dionisio',
  fechaTexto: '12 de Diciembre de 2026',
  fechaISO: '2026-12-12T17:00:00-07:00',
  bendicion: {
    mensaje: 'Con la bendicion de Dios y de nuestros padres',
    padres: [
      {
        titulo: 'Padres de la novia',
        nombres: [
          'Maria De Jesus Hernandez Alvarez',
          'Julio Ernesto Galindo Rosas',
        ],
      },
      {
        titulo: 'Padres del novio',
        nombres: ['Andrea Diaz Tiznado', 'Natividad Paz Arciniega'],
      },
    ],
    padrinos: {
      titulo: 'Padrinos',
      nombres: ['Maricela Guzman Barrera', 'Miguel Angel Mojica Aguilar'],
    },
  },
  bienvenida:
    'Hay momentos que cambian nuestra vida para siempre. El nuestro será aún más especial si lo compartimos contigo.',
  ceremonia: {
    nombre: 'Templo San Judas Tadeo',
    hora: '5:00 PM',
    direccion: '',
    maps: 'https://maps.app.goo.gl/7TsGHE2gWcoZrrsR8',
  },
  recepcion: {
    nombre: 'Hacienda San Ramon',
    hora: '8:00 PM',
    direccion: '',
    maps: 'https://maps.app.goo.gl/9CHjHKnDdBabRH6H8',
  },
  whatsapp: '[Número]', // Internacional, solo dígitos: 52 + 10 dígitos para México.
  mensajeConfirmacion:
    '¡Hola! Me encantará acompañarlos en su boda. Mi nombre es: ',
  dressCode: 'Formal elegante',
  colores: [
    { nombre: 'Vino', valor: '#682c3b' },
    { nombre: 'Olivo', valor: '#686b4b' },
    { nombre: 'Champaña', valor: '#c4aa81' },
    { nombre: 'Noche', valor: '#343740' },
  ],
  itinerario: [
    {
      titulo: 'Ceremonia',
      hora: '5:00 PM',
      descripcion: 'El comienzo de nuestro para siempre.',
    },
    {
      titulo: 'Recepción',
      hora: '8:00 PM',
      descripcion: 'Un brindis por todo lo que viene.',
    },
    {
      titulo: 'Cena',
      hora: '8:30 PM',
      descripcion: 'Compartir la mesa, celebrar el amor.',
    },
    {
      titulo: 'Baile',
      hora: '9:30 PM',
      descripcion: 'Nuestra canción. Una noche inolvidable.',
    },
    {
      titulo: 'Cierre',
      hora: '1:00 AM',
      descripcion: 'El final de la fiesta, el inicio de todo.',
    },
  ],
  fotos: [
    {
      src: 'img/boda/alejandra&dionicio-38.png',
      alt: 'Fotografía de inspiración: pareja de novios',
    },
    {
      src: 'img/boda/fotoBoda.jpeg',
      alt: 'Fotografía de inspiración: ramo de novia',
    },
    {
      src: 'img/boda/alejandra&dionicio-61.png',
      alt: 'Fotografía de inspiración: un beso en el jardín',
    },
  ],
  fotosCarrusel: [
    {
      src: 'img/boda/alejandra&dionicio-59.png',
      alt: 'Fotografía de inspiración: pareja de novios',
    },
    {
      src: 'img/boda/alejandra&dionicio-08.png',
      alt: 'Fotografía de inspiración: ramo de novia',
    },
    {
      src: 'img/boda/alejandra&dionicio-33.png',
      alt: 'Fotografía de inspiración: un beso en el jardín',
    },
    {
      src: 'img/boda/alejandra&dionicio-12.png',
      alt: 'Fotografía de inspiración: un beso en el jardín',
    },
  ],
  regalos: {
    mostrar: true,
    titulo: 'Tu presencia es nuestro mejor regalo',
    texto:
      'Si deseas tener un detalle con nosotros, recibiremos con mucho cariño tu regalo en un sobre el día de la boda.',
  },
  musica: { src: '', titulo: 'Nuestra canción' }, // Ejemplo: audio/nuestra-cancion.mp3. Vacío oculta el control.
  fraseFinal: 'Gracias por ser parte de nuestra historia.',
};
