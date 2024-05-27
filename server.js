import Fastify from 'fastify';
import FastifyVite from '@fastify/vite';
import FastifyFormBody from '@fastify/formbody';
import FastifySqlite from 'fastify-sqlite';
import { faker } from '@faker-js/faker';
import { getAge } from './client/utils/age.js';

const server = Fastify({
  logger: {
    transport: {
      target: '@fastify/one-line-logger'
    }
  }
});

await server.register(FastifySqlite, {
  promiseApi: true,
  verbose: true,
  dbFile: 'storage.db',
  name: 'store'
});

export const SURGERY_STATUS = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

const SURGERY_TYPES = {
  MASTOPEXY: 'Mastopexy',
  NASAL_SURGERY: 'Nasal Surgery',
  SCAR_REVISION: 'Scar Revision'
};

await server.sqlite.store.exec(
  'CREATE TABLE IF NOT EXISTS surgeries (id INTEGER PRIMARY KEY, surgeon TEXT NOT NULL, patient TEXT NOT NULL, patient_dob TEXT NOT NULL, type TEXT NOT NULL, status TEXT NOT NULL, scheduled_for TEXT NOT NULL)'
);

const seed = async () => {
  for (let i = 0; i < 20; i++) {
    const age = faker.date.birthdate({ max: 70, min: 1, mode: 'age' });
    const dob = age.toISOString().split('T')[0];
    await server.sqlite.store.run(
      'INSERT into surgeries (surgeon, patient, patient_dob, type, status, scheduled_for) VALUES (:surgeon, :patient, :patient_dob, :type, :status, :scheduled_for)',
      {
        ':surgeon': `Dr. ${faker.person.fullName()}`,
        ':patient': faker.person.fullName(),
        ':patient_dob': dob,
        ':type': Object.values(SURGERY_TYPES)[Math.floor(Math.random() * 3)],
        ':status': Object.values(SURGERY_STATUS)[Math.floor(Math.random() * 3)],
        ':scheduled_for': faker.date.anytime().toISOString()
      }
    );
  }
};

//await seed();

await server.register(FastifyFormBody);
await server.register(FastifyVite, {
  root: import.meta.url,
  renderer: '@fastify/react'
});

await server.vite.ready();

const getSurgeriesSchema = {
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        required: ['surgeon', 'scheduled_for', 'patient_dob', 'patient_age', 'type', 'status', 'patient'],
        properties: {
          id: { type: 'number' },
          surgeon: { type: 'string' },
          scheduled_for: { type: 'string' },
          patient_dob: { type: 'string' },
          patient_age: { type: 'number' },
          type: { type: 'string' },
          status: { type: 'string' },
          patient: { type: 'string' }
        }
      }
    }
  }
};

server.get('/api/surgeries', { schema: getSurgeriesSchema }, async (req, reply) => {
  const surgeries = await server.sqlite.store.all('SELECT * from surgeries');

  const dto = surgeries.map((surgery) => {
    surgery.patient_age = getAge(surgery.patient_dob || null);
    return surgery;
  });

  reply.send(dto);
});

const cancelSurgerySchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' }
    }
  }
};
server.post('/api/surgeries/cancel/:id', { schema: cancelSurgerySchema }, async (req, reply) => {
  const cancelSurgery = await server.sqlite.store.all(
    'UPDATE surgeries SET status = ? WHERE id = ?',
    SURGERY_STATUS.CANCELLED,
    req.params.id
  );

  reply.send({});
});

const scheduleSurgerySchema = {
  body: {
    type: 'object',
    properties: {
      surgeon: { type: 'string' },
      patient: { type: 'string' },
      patient_dob: { type: 'string' },
      type: { type: 'string' },
      scheduled_for: { type: 'string' }
    }
  }
};
server.post('/api/surgeries/schedule', { schema: scheduleSurgerySchema }, async (req, reply) => {
  const { surgeon, patient, patient_dob, type, scheduled_for } = req.body;
  const schedule = await server.sqlite.store.run(
    'INSERT into surgeries (surgeon, patient, patient_dob, type, status, scheduled_for) VALUES (:surgeon, :patient, :patient_dob, :type, :status, :scheduled_for)',
    {
      ':surgeon': surgeon,
      ':patient': patient,
      ':patient_dob': patient_dob,
      ':type': type,
      ':status': SURGERY_STATUS.SCHEDULED,
      ':scheduled_for': scheduled_for
    }
  );

  console.log(schedule);

  reply.send({ success: 'OK' });
});

await server.listen({ port: 3000 });
