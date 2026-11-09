/**
 * The sort the tests of an entity make by a column of a relationship to one it stores, like the resource tests of
 * JHipster Spring Boot: the relationship, a column of the related entity other than its id when it has one, and whether
 * it is the built-in user (whose password cannot be sorted by). Of a SQL database only: the relationships of MongoDB are
 * not relations of TypeORM, a list cannot be sorted by them.
 */
export const toOneSortExample = entity => {
  const relationship = entity.relationships.find(
    relationship =>
      relationship.persistableRelationship && !relationship.collection && !relationship.notSortable && !relationship.otherEntity.embedded,
  );
  if (!relationship) return undefined;
  const { otherEntity } = relationship;
  const column = otherEntity.fields.find(field => !field.id && field.fieldSupportsSortBy)?.fieldName ?? otherEntity.primaryKey.name;
  return {
    property: relationship.propertyName,
    column,
    builtInUser: Boolean(otherEntity.builtInUser),
  };
};
