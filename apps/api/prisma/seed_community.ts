import { PrismaClient, Role, DocumentStatus, ProductType } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Community Seeding...');

  // --- 0. Clean up (Optional, but good for idempotent runs if we delete first) ---
  // For now, we assume fresh DB or we append. 
  // Let's clear users except admin to avoid duplicates if re-run, or just create unique emails.
  // We'll rely on unique constraints and catch errors or just upsert.
  
  const passwordHash = await argon2.hash('User123!');

  // --- 1. USERS ---
  console.log('Creating Users...');
  
  // 1.1 Admin "Oficial"
  const admin = await prisma.user.upsert({
    where: { email: 'admin_oficial@crunevo.local' },
    update: {},
    create: {
      email: 'admin_oficial@crunevo.local',
      username: 'Rectorado',
      passwordHash,
      role: 'ADMIN',
      teacherVerified: true,
      points: 5000,
      level: 10,
      bio: 'Cuenta oficial de administración universitaria.',
    },
  });

  // 1.2 Profesores (3)
  const professors = [];
  for (let i = 1; i <= 3; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const prof = await prisma.user.upsert({
      where: { email: `prof_${i}@crunevo.local` },
      update: {},
      create: {
        email: `prof_${i}@crunevo.local`,
        username: `Prof.${firstName}${lastName}`,
        passwordHash,
        role: 'TEACHER',
        teacherVerified: true,
        points: faker.number.int({ min: 1000, max: 3000 }),
        level: faker.number.int({ min: 5, max: 8 }),
        bio: `Profesor de ${faker.science.unit().name} y ${faker.science.chemicalElement().name}. PhD.`,
      },
    });
    professors.push(prof);
  }

  // 1.3 Estudiantes (10)
  const students = [];
  for (let i = 1; i <= 10; i++) {
    const firstName = faker.person.firstName();
    const user = await prisma.user.upsert({
      where: { email: `student_${i}@crunevo.local` },
      update: {},
      create: {
        email: `student_${i}@crunevo.local`,
        username: `${firstName}_${faker.number.int({ min: 10, max: 99 })}`,
        passwordHash,
        role: 'STUDENT',
        teacherVerified: false,
        points: faker.number.int({ min: 50, max: 800 }),
        level: faker.number.int({ min: 1, max: 3 }),
        bio: faker.person.bio(),
      },
    });
    students.push(user);
  }

  const allUsers = [admin, ...professors, ...students];

  // --- 2. CLUBES ---
  console.log('Creating Clubs...');
  const clubNames = [
    "Ingeniería de Sistemas", "Derecho Penal", "Medicina Humana", 
    "Círculo de Matemáticas", "Gamers UNMSM", "Música y Arte"
  ];

  const clubs = [];
  for (const name of clubNames) {
    // Pick random owner (preferably student or prof)
    const owner = allUsers[Math.floor(Math.random() * allUsers.length)];
    
    // Check if club exists
    let club = await prisma.club.findFirst({ where: { name } });
    if (!club) {
        club = await prisma.club.create({
            data: {
                name,
                description: `Club dedicado a ${name}. ${faker.lorem.sentence()}`,
                ownerId: owner.id,
                isPublic: true,
            }
        });
    }
    clubs.push(club);

    // Add random members
    const membersCount = faker.number.int({ min: 3, max: 8 });
    for (let k = 0; k < membersCount; k++) {
        const member = allUsers[Math.floor(Math.random() * allUsers.length)];
        // Upsert member
        try {
            await prisma.clubMember.create({
                data: { clubId: club.id, userId: member.id, role: member.id === owner.id ? 'OWNER' : 'MEMBER' }
            });
        } catch (e) {
            // Ignore unique constraint violation if already member
        }
    }
  }

  // --- 3. APUNTES ---
  console.log('Creating Documents...');
  const docTitles = [
    "Silabo Cálculo I 2025", "Resumen Anatomía: Huesos", "Formulario Física II", 
    "Guía de Laboratorio Química", "Introducción a la Programación", "Derecho Romano I",
    "Historia del Perú Contemporáneo", "Diapositivas Clase 1", "Examen Parcial 2024-I",
    "Tesis Referencia", "Manual de Estilo APA 7", "Ejercicios Resueltos Integrales",
    "Mapa Conceptual Biología", "Cronograma Académico", "Reglamento de Grados",
    "Plantilla Informe Final", "Canvas Modelo de Negocio", "Partituras Clásicas",
    "Recetario Nutrición", "Atlas Histológico"
  ];

  for (let i = 0; i < 20; i++) {
    const owner = allUsers[Math.floor(Math.random() * allUsers.length)];
    const title = docTitles[i] || faker.lorem.words(3);
    const mimeType = faker.helpers.arrayElement(['application/pdf', 'application/msword', 'image/jpeg']);
    let thumbnailUrl = null;
    if (mimeType === 'application/pdf') thumbnailUrl = 'https://cdn-icons-png.flaticon.com/512/337/337946.png';
    else if (mimeType.includes('msword')) thumbnailUrl = 'https://cdn-icons-png.flaticon.com/512/337/337951.png';
    else thumbnailUrl = 'https://cdn-icons-png.flaticon.com/512/337/337940.png';

    const qualityStatus = i < 5 ? 'VERIFIED' : (i >= 18 ? 'FLAGGED' : 'PENDING');
    const version = i % 4 === 0 ? 2 : 1;

    await prisma.document.create({
        data: {
            title,
            description: faker.lorem.paragraph(),
            tags: faker.lorem.words(3).replace(/ /g, ','),
            filePath: `dummy_${i}.${mimeType === 'application/pdf' ? 'pdf' : 'doc'}`,
            fileName: `${title.replace(/ /g, '_')}.${mimeType === 'application/pdf' ? 'pdf' : 'doc'}`,
            mimeType,
            size: faker.number.int({ min: 10000, max: 5000000 }),
            ownerId: owner.id,
            thumbnailUrl,
            version,
            qualityStatus: qualityStatus as DocumentStatus,
            downloadsCount: faker.number.int({ min: 0, max: 200 }),
            clubId: i % 3 === 0 ? clubs[Math.floor(Math.random() * clubs.length)].id : null, // Some linked to clubs
        }
    });
  }

  // --- 4. AULA ---
  console.log('Creating Questions & Answers...');
  const questions = [];
  for (let i = 0; i < 15; i++) {
      const author = students[Math.floor(Math.random() * students.length)];
      const q = await prisma.question.create({
          data: {
              title: faker.lorem.sentence() + "?",
              body: faker.lorem.paragraphs(2),
              tags: ["duda", "urgente", "examen"],
              subject: faker.helpers.arrayElement(["Matemáticas", "Biología", "Historia", "Programación", "Derecho"]),
              attachments: i % 5 === 0 ? ["https://placehold.co/600x400"] : [],
              authorId: author.id,
              clubId: i % 4 === 0 ? clubs[Math.floor(Math.random() * clubs.length)].id : null,
          }
      });
      questions.push(q);

      // Answers
      const answersCount = faker.number.int({ min: 0, max: 4 });
      for (let j = 0; j < answersCount; j++) {
          const answerer = allUsers[Math.floor(Math.random() * allUsers.length)];
          const ans = await prisma.answer.create({
              data: {
                  questionId: q.id,
                  authorId: answerer.id,
                  body: faker.lorem.paragraph(),
              }
          });
          
          // Solved?
          if (j === 0 && Math.random() > 0.7) {
              await prisma.question.update({ where: { id: q.id }, data: { acceptedAnswerId: ans.id } });
          }
      }

      // AI Answer (Simulated)
      if (Math.random() > 0.6) {
           await prisma.answer.create({
              data: {
                  questionId: q.id,
                  authorId: admin.id, // Or a bot user if we had one, using admin for now or system
                  body: "🤖 [AI Suggestion]: " + faker.lorem.paragraph(),
              }
          });
      }
  }

  // --- 5. TIENDA ---
  console.log('Creating Products...');
  const products = [
      { title: "Pack Exámenes Parciales", price: 15.00, type: ProductType.DIGITAL_RESOURCE },
      { title: "Asesoría Tesis 1h", price: 50.00, type: ProductType.SERVICE },
      { title: "Plantilla Notion Estudiante", price: 10.00, type: ProductType.DIGITAL_RESOURCE },
      { title: "Curso Básico Python", price: 30.00, type: ProductType.COURSE },
      { title: "Revisión de CV", price: 20.00, type: ProductType.SERVICE },
      { title: "Pack Stickers Universitarios", price: 5.00, type: ProductType.DIGITAL_RESOURCE },
      { title: "Tutoría de Mate 1h", price: 25.00, type: ProductType.SERVICE },
      { title: "Acceso Premium Biblioteca", price: 40.00, type: ProductType.SERVICE },
  ];

  for (const p of products) {
      await prisma.product.create({
          data: {
              title: p.title,
              description: faker.commerce.productDescription(),
              price: p.price,
              type: p.type,
              ownerId: admin.id, // Admin sells these
              isSystem: true,
          }
      });
  }

  // --- 6. SOCIAL (Feed) ---
  console.log('Generating Social Activity...');
  // Create some posts
  for (let i = 0; i < 10; i++) {
      const author = allUsers[Math.floor(Math.random() * allUsers.length)];
      await prisma.post.create({
          data: {
              content: faker.lorem.sentences(2),
              authorId: author.id,
              clubId: i % 2 === 0 ? clubs[Math.floor(Math.random() * clubs.length)].id : null,
          }
      });
  }

  // Add Likes and Comments to various entities
  const allDocs = await prisma.document.findMany();
  const allPosts = await prisma.post.findMany();
  const allQs = await prisma.question.findMany();

  const allTargets = [...allDocs.map(d => ({id: d.id, type: 'document'})), 
                      ...allPosts.map(p => ({id: p.id, type: 'post'})),
                      ...allQs.map(q => ({id: q.id, type: 'question'}))];

  // Likes
  for (let i = 0; i < 50; i++) {
      const user = allUsers[Math.floor(Math.random() * allUsers.length)];
      const target = allTargets[Math.floor(Math.random() * allTargets.length)];
      
      const data: any = { authorId: user.id };
      if (target.type === 'document') data.documentId = target.id;
      if (target.type === 'post') data.postId = target.id;
      if (target.type === 'question') data.questionId = target.id;

      // Avoid duplicates roughly (prisma will throw if unique constraint, we ignore)
      try { await prisma.like.create({ data }); } catch {}
  }

  // Comments
  for (let i = 0; i < 30; i++) {
      const user = allUsers[Math.floor(Math.random() * allUsers.length)];
      const target = allTargets[Math.floor(Math.random() * allTargets.length)];
      
      const data: any = { authorId: user.id, body: faker.lorem.sentence() };
      if (target.type === 'document') data.documentId = target.id;
      if (target.type === 'post') data.postId = target.id;
      if (target.type === 'question') data.questionId = target.id;

      await prisma.comment.create({ data });
  }

  console.log('✅ POBLACIÓN COMPLETADA');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
