/** An ISO-8601 duration, like Duration.parse of Java: the pattern of parseDuration (src/common/database/column-transformers.ts). */
const ISO_DURATION = String.raw`/^([-+]?)P(?:([-+]?\d+)D)?(?:T(?:([-+]?\d+)H)?(?:([-+]?\d+)M)?(?:([-+]?)(\d+)(?:[.,](\d{0,9}))?S)?)?$/i`;

/**
 * The class-validator decorators of the type of each field type, like the JSON deserialization of JHipster Spring Boot refuses
 * a value of another type (400), instead of the error of the database or of a column transformer (500): a number, a
 * boolean, a UUID, an ISO-8601 instant, a yyyy-MM-dd date, a HH:mm:ss time or an ISO-8601 duration.
 */
const typeValidators = {
  Integer: ['@IsInt()'],
  Long: ['@IsInt()'],
  Float: ['@IsNumber()'],
  Double: ['@IsNumber()'],
  BigDecimal: ['@IsNumber()'],
  Boolean: ['@IsBoolean()'],
  UUID: ['@IsUUID()'],
  Instant: ['@IsISO8601()'],
  ZonedDateTime: ['@IsISO8601()'],
  LocalDate: [String.raw`@Matches(/^\d{4}-\d{2}-\d{2}$/)`, '@IsISO8601({ strict: true })'],
  LocalTime: [String.raw`@Matches(/^\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?$/)`],
  Duration: [`@Matches(${ISO_DURATION})`],
};

/** The class-validator decorators of the type of a field: none for a text, a blob or an enum (@IsEnum). */
export const fieldTypeValidators = field => (field.fieldIsEnum ? [] : (typeValidators[field.fieldType] ?? []));
