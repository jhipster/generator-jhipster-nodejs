/**
 * The files of an entity, from the src folder of the server, in its feature module: an entity of the JDL in its own folder
 * of src/entities, the built-in User and Authority in src/users, with the users module.
 */
const entityFolder = ({ builtIn, entityFileName }) => (builtIn ? 'users' : `entities/${entityFileName}`);

/** The mutations of an entity (entityDefaults): the paths its imports, its needles and its cleanups use. */
export const mutateEntityPaths = {
  __override__: false,
  nodejsEntityPath: entity => `${entityFolder(entity)}/${entity.entityFileName}.entity.ts`,
  nodejsDtoPath: entity => `${entityFolder(entity)}/dto/${entity.entityFileName}.dto.ts`,
  nodejsModulePath: entity => `${entityFolder(entity)}/${entity.entityFileName}.module.ts`,
};
