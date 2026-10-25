/**
 * The roles of the entities, like the @PreAuthorize of the resources of JHipster Spring Boot (entitySpringPreAuthorize and
 * entitySpringReadPreAuthorize of its spring-boot generator): the roles of entityAuthority (@EntityAuthority of the JDL,
 * ROLE_ADMIN for an admin entity, like the built-in User and Authority) write and read, the roles of entityReadAuthority
 * (@EntityReadAuthority) only read. Without them, any authenticated user.
 */

/** The roles of a comma separated authority of JHipster. */
const rolesOf = authority =>
  String(authority ?? '')
    .split(',')
    .map(role => role.trim())
    .filter(Boolean);

/** The TypeScript of the arguments of a @Roles decorator, undefined without roles. */
const rolesLiteral = roles => (roles.length > 0 ? roles.map(role => `'${role}'`).join(', ') : undefined);

/** The mutations of an entity (entityDefaults), delayed until the entity is prepared. */
export const mutateEntityAuthorities = {
  __override__: false,
  // The roles of the creations, the updates and the deletions.
  nodejsWriteRoles: ({ entityAuthority }, { delayMarker }) => delayMarker ?? rolesLiteral(rolesOf(entityAuthority)),
  // The roles of the reads: the ones of the writes and the ones of entityReadAuthority.
  nodejsReadRoles: ({ entityAuthority, entityReadAuthority }, { delayMarker }) =>
    delayMarker ?? rolesLiteral([...new Set([...rolesOf(entityAuthority), ...rolesOf(entityReadAuthority)])]),
  // The roles that only read, which the tests check refused on the writes.
  nodejsReadOnlyRoles: ({ entityAuthority, entityReadAuthority }, { delayMarker }) => {
    if (delayMarker) return delayMarker;
    const writeRoles = rolesOf(entityAuthority);
    return rolesLiteral(rolesOf(entityReadAuthority).filter(role => !writeRoles.includes(role)));
  },
};
