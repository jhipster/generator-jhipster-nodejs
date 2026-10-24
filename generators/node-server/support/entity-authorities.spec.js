import { describe, expect, it } from 'vitest';

import { mutateData } from 'generator-jhipster/utils';

import { mutateEntityAuthorities } from './entity-authorities.js';

/** An entity with the authorities JHipster prepares, and the roles the blueprint prepares of them. */
const rolesOf = authorities => {
  const entity = { ...authorities };
  mutateData(entity, mutateEntityAuthorities);
  return {
    nodejsWriteRoles: entity.nodejsWriteRoles,
    nodejsReadRoles: entity.nodejsReadRoles,
    nodejsReadOnlyRoles: entity.nodejsReadOnlyRoles,
  };
};

describe('mutateEntityAuthorities', () => {
  it('should leave an entity without authorities to any authenticated user', () => {
    expect(rolesOf({})).toEqual({ nodejsWriteRoles: undefined, nodejsReadRoles: undefined, nodejsReadOnlyRoles: undefined });
  });

  it('should give the roles of entityAuthority to the writes and to the reads, like the @PreAuthorize of JHipster Spring Boot', () => {
    expect(rolesOf({ entityAuthority: 'ROLE_ADMIN, ROLE_MANAGER' })).toEqual({
      nodejsWriteRoles: "'ROLE_ADMIN', 'ROLE_MANAGER'",
      nodejsReadRoles: "'ROLE_ADMIN', 'ROLE_MANAGER'",
      nodejsReadOnlyRoles: undefined,
    });
  });

  it('should give the roles of entityReadAuthority to the reads only', () => {
    expect(rolesOf({ entityAuthority: 'ROLE_ADMIN', entityReadAuthority: 'ROLE_USER,ROLE_ADMIN' })).toEqual({
      nodejsWriteRoles: "'ROLE_ADMIN'",
      nodejsReadRoles: "'ROLE_ADMIN', 'ROLE_USER'",
      nodejsReadOnlyRoles: "'ROLE_USER'",
    });
    expect(rolesOf({ entityReadAuthority: 'ROLE_USER' })).toMatchObject({ nodejsWriteRoles: undefined, nodejsReadRoles: "'ROLE_USER'" });
  });
});
