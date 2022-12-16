import Tree, { NodeId, NodeList } from '@naisutech/react-tree'
import { IConceptDeclaration, IEnumDeclaration } from '../metamodel/concerto.metamodel';

import { TreeItem, TreeView } from '@mui/lab';
import { ExpandMore as ExpandMoreIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material'

import useStore from '../store';
import { SyntheticEvent, useEffect, useState } from 'react';
import { Button } from '@mui/material';

function PropertyTree() {
  const models = useStore(state => state.models);
  const editorItemSelected = useStore(state => state.editorItemSelected);
  const ctoModified = useStore(state => state.ctoModified);

  const addNewButton = (buttonLabel: string) => {
    return (
      <TreeItem 
        nodeId='' 
        label={
          <button 
            className='MuiTreeItem-label'
            style={{
              border: "none", 
              background: "none",
              color: "#4a4a4a",
            }} 
            onClick={buttonLabel === "Namespace" ? addModel : buttonLabel === "Declaration" ? addDeclaration : addProperty}>
            New {buttonLabel}
          </button>
        } 
      />
    );
  }

  const buildTree = () => {
    return Object.values(models).map(modelEntry => {
      return (
        <TreeItem 
          nodeId={modelEntry.model.namespace} 
          label={modelEntry.model.namespace}>
          {addNewButton("Declaration")}
          {modelEntry.model.declarations?.map(decl => {
            return (
              <TreeItem 
                nodeId={`${modelEntry.model.namespace}#${decl.name}`} 
                label={decl.name}>
                {addNewButton("Property")}
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

  const addModel = () => {
    const ns = `model${Object.keys(models).length}@1.0.0`;
    ctoModified(`namespace ${ns}`);
    editorItemSelected(`model${Object.keys(models).length}@1.0.0`);
  }

  const addDeclaration = () => {};

  const addProperty = () => {};

  return (
    <>
      <TreeView
        aria-label="file system navigator"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        sx={{flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
        onNodeSelect={(e: SyntheticEvent, nodeIds: string) => editorItemSelected(nodeIds)}
      >
        {addNewButton("Namespace")}
        {buildTree()}
      </TreeView>
    </>
    
  )
}

export default PropertyTree;