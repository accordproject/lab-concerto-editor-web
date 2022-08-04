import TypeReference from './TypeReference';
import { IEnumProperty } from './metamodel/concerto.metamodel';
import { getType, getModifiers } from './util';

function EnumProperty({ property }: { property: IEnumProperty }) {
  return (
    <li>
      <TypeReference {...getType(property)} /> <strong>{property.name}</strong> <i>{getModifiers(property)}</i>
    </li>
  );
}

export default EnumProperty;
