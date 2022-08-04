import EnumProperty from './EnumProperty';
import { IEnumDeclaration } from './metamodel/concerto.metamodel';

function EnumDeclaration({
  namespace,
  version,
  declaration,
}: {
  namespace: string;
  version: string;
  declaration: IEnumDeclaration;
}) {
  const jsonSchemaUrl = encodeURI(
    `https://na.services.dev.docusign.net/models/api/v1/namespaces/${namespace}/versions/${version}/declarations/${declaration.name}?format=jsonSchema&inlineJsonSchema=false`
  );

  return (
    <div>
      <h3>
        <a href={jsonSchemaUrl}>{declaration.name}</a>
      </h3>
      <ul>
        {declaration.properties.map(prop => (
          <EnumProperty key={prop.name} property={prop} />
        ))}
      </ul>
    </div>
  );
}

export default EnumDeclaration;
