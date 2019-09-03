import { getConnection } from 'typeorm';
import { User } from './domain/user.entity';
import { Authority } from './domain/authority.entity';

export async function initialDataLoad() {

  const role1 = { name: 'ROLE_ADMIN' };

  const role2 = { name: 'ROLE_USER' };

  const user1 = {
    login: 'system', passwordHash: 'system', firstName: 'System', lastName: 'System',
    email: 'system@localhost', imageUrl: '', activated: true, langKey: 'en', createdBy: 'system', lastModifiedBy: 'system'
  };

  const user2 = {
    login: 'system', passwordHash: 'system', firstName: 'System', lastName: 'System',
    email: 'system@localhost', imageUrl: '', activated: true, langKey: 'en', createdBy: 'system', lastModifiedBy: 'system'
  };

  const user3 = {
    login: 'admin', passwordHash: 'admin', firstName: 'Administrator', lastName: 'Administrator',
    email: 'admin@localhost', imageUrl: '', activated: true, langKey: 'en', createdBy: 'system', lastModifiedBy: 'system'
  };

  const user4 = {
    login: 'user', passwordHash: 'user', firstName: 'User', lastName: 'User',
    email: 'user@localhost', imageUrl: '', activated: true, langKey: 'en', createdBy: 'system', lastModifiedBy: 'system'
  };

  await getConnection()
    .createQueryBuilder()
    .insert()
    .into(Authority)
    .values([role1, role2])
    .execute();



  await getConnection()
    .createQueryBuilder()
    .insert()
    .into(User)
    .values([user1, user2, user3, user4])
    .execute();

  await getConnection()
    .createQueryBuilder()
    .relation(User, 'authorities')
    .of([user1, user3])
    .add([role1, role2]);

  await getConnection()
    .createQueryBuilder()
    .relation(User, 'authorities')
    .of(user4)
    .add([role2]);

}
