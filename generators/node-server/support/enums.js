import { getEnumInfo } from 'generator-jhipster/generators/base-application/support';

/**
 * The enum of a field as the server exchanges and stores it, like JHipster Spring Boot: a Java enum is written in JSON
 * and stored (`@Enumerated(EnumType.STRING)`) by its name, its custom value (`LOW (low_level)`) being only a label of the
 * client. Each value of the TypeScript enum is its name.
 */
export const serverEnumInfo = (field, clientRootFolder) => {
  const enumInfo = getEnumInfo(field, clientRootFolder);
  return { ...enumInfo, enumValues: enumInfo.enumValues.map(enumValue => ({ ...enumValue, value: enumValue.name })) };
};
