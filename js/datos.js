// Creamos los datos de ejemplo que usaremos en la página de listado.
// En una aplicación real, esto vendría de una base de datos.
const datosAvisos = [
    {
        id: 1,
        fechaPublicacion: '2025-08-20 10:00',
        fechaEntrega: '2025-08-25 12:00',
        comuna: 'Santiago',
        sector: 'Cerca de FCFM',
        tipo: 'Gato',
        cantidad: 1,
        edad: '3 meses',
        nombreContacto: 'Alberto del Río',
        emailContacto: 'alb.delrio@gmail.com',
        celularContacto: '+569.87654321',
        descripcion: 'Gatito muy juguetón y cariñoso, que busca un hogar lleno de amor. Se entrega desparasitado.',
        fotos: [
            'img/gato1_1.jpg',
            'img/gato_1_2.jpg',
            'img/gato_1_3.jpg'
        ]
    },
    {
        id: 2,
        fechaPublicacion: '2025-08-19 15:30',
        fechaEntrega: '2025-08-22 18:00',
        comuna: 'Providencia',
        sector: 'Barrio Italia',
        tipo: 'Perro',
        cantidad: 2,
        edad: '2 meses',
        nombreContacto: 'Carlos Muñoz',
        emailContacto: 'c.munoz26@gmail.com',
        celularContacto: '+569.11223344',
        descripcion: 'Dos cachorros hermanos. Son muy energéticos. Se entregan con sus primeras vacunas.',
        fotos: [
            'https://placedog.net/800/600',
            'https://placedog.net/801/600'
        ]
    },
    {
        id: 3,
        fechaPublicacion: '2025-08-18 11:00',
        fechaEntrega: '2025-08-21 16:00',
        comuna: 'Lampa',
        sector: 'Laguna Norte',
        tipo: 'Perro',
        cantidad: 1,
        edad: '1 año',
        nombreContacto: 'Laura Palmer',
        emailContacto: 'laura.pal@gmail.com',
        celularContacto: '+569.44556677',
        descripcion: 'Perrita muy tranquila y obediente. Ideal para una familia con niños.',
        fotos: [
            'https://placedog.net/800/601'
        ]
    },
    {
        id: 4,
        fechaPublicacion: '2025-08-17 20:00',
        fechaEntrega: '2025-08-20 19:00',
        comuna: 'Maipú',
        sector: 'Plaza de Maipú',
        tipo: 'Gato',
        cantidad: 3,
        edad: '1 mes',
        nombreContacto: 'Ezequiel Miralles',
        emailContacto: 'ez.miralles11@gmail.com',
        celularContacto: '+569.88990011',
        descripcion: 'Tres hermanitos que fueron rescatados. Se pueden adoptar juntos o por separado.',
        fotos: [
            'img/gato_4.jpg',
        ]
    },
    {
        id: 5,
        fechaPublicacion: '2025-08-16 09:45',
        fechaEntrega: '2025-08-19 11:00',
        comuna: 'Quilicura',
        sector: 'Lo Marcoleta',
        tipo: 'Perro',
        cantidad: 1,
        edad: '1 año',
        nombreContacto: 'Sofía Castro',
        emailContacto: 's.castro@email.com',
        celularContacto: '+569.12312312',
        descripcion: 'Perro adulto muy noble. Le encanta salir a pasear y es muy guardián. Necesita un patio grande.',
        fotos: [
            'https://placedog.net/802/600',
            'https://placedog.net/800/602',
        ]
    }
];