import Tree, { NodeId, NodeList } from '@naisutech/react-tree'
import { IConceptDeclaration, IEnumDeclaration } from '../metamodel/concerto.metamodel';

import useStore from '../store';

function PropertyTree() {
  const models = useStore(state => state.models);
  const editorItemSelected = useStore(state => state.editorItemSelected);

  function onTreeSelect(id: Array<NodeId>) {
    if(id && id.length > 0) {
      editorItemSelected(id[id.length-1].toString());
    }
  }

  const data: NodeList = [];
  Object.values(models).forEach(modelEntry => {
    // push namespace, which is a root items and parent to declarations
    data.push({
      id: modelEntry.model.namespace,
      parentId: null,
      label: modelEntry.model.namespace
    });
    // push declarations, which has a namespace as a parent, and is a parent to properties
    modelEntry.model.declarations?.forEach(decl => {
      data.push({
        id: `${modelEntry.model.namespace}#${decl.name}`,
        parentId: modelEntry.model.namespace,
        label: decl.name,
        items: (decl as IEnumDeclaration | IConceptDeclaration).properties.map(prop => {
          return {
            id: `${modelEntry.model.namespace}#${decl.name}.${prop.name}`,
            parentId: `${modelEntry.model.namespace}#${decl.name}`,
            label: prop.name
          }
        })
      })
    })
  });

  return (
    <Tree nodes={data} 
      theme='light'
      onSelect={onTreeSelect}
    />
  )
}

export default PropertyTree;
