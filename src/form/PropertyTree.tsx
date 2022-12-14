import Tree, { NodeId, NodeList } from '@naisutech/react-tree'
import { IConceptDeclaration, IEnumDeclaration } from '../metamodel/concerto.metamodel';

import { TreeItem, TreeView } from '@mui/lab';
import { ExpandMore as ExpandMoreIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material'

import useStore from '../store';
import { SyntheticEvent } from 'react';

function PropertyTree() {
  const models = useStore(state => state.models);
  const editorItemSelected = useStore(state => state.editorItemSelected);

  const buildTree = () => {
    return Object.values(models).map(modelEntry => {
      return (
        <TreeItem 
          nodeId={modelEntry.model.namespace} 
          label={modelEntry.model.namespace}>
          {modelEntry.model.declarations?.map(decl => {
            return (
              <TreeItem 
                nodeId={`${modelEntry.model.namespace}#${decl.name}`} 
                label={decl.name}>
                {(decl as IEnumDeclaration | IConceptDeclaration).properties.map(prop => {
                  return <TreeItem nodeId={`${modelEntry.model.namespace}#${decl.name}.${prop.name}`} label={prop.name}></TreeItem>
                })}
              </TreeItem>
            )
          })}
        </TreeItem>
      )
    });
  }

  return (
    <>
      <TreeView
        aria-label="file system navigator"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        sx={{flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
        onNodeSelect={(e: SyntheticEvent, nodeIds: string) => editorItemSelected(nodeIds)}
      >
        {buildTree()}
      </TreeView>
    </>
    
  )
}

export default PropertyTree;