import TypeReference from './TypeReference';
import { IProperty } from './metamodel/concerto.metamodel';
import { getType, getModifiers } from './util';

function Property({ property }: { property: IProperty }) {
  return (
    <li>
      <TypeReference {...getType(property)} /> <strong>{property.name}</strong> <i>{getModifiers(property)}</i>
    </li>
  );
}

export default Property;
