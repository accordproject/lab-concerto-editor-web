import Tree, { NodeId, NodeList } from '@naisutech/react-tree'
import { IConceptDeclaration, IEnumDeclaration } from '../metamodel/concerto.metamodel';

import { TreeItem, TreeView } from '@mui/lab';
import { ExpandMore as ExpandMoreIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material'

import useStore from '../store';
import { SyntheticEvent, useEffect, useState } from 'react';
import { Button } from '@mui/material';
import AddDeclarationForm from './concept/addConceptForm';

function PropertyTree() {
  const models = useStore(state => state.models);
  const editorItemSelected = useStore(state => state.editorItemSelected);
  const ctoModified = useStore(state => state.ctoModified);

  const [displayAddDeclModal, setDisplayAddDecModal] = useState(false);

  const addNewButton = (buttonLabel: string, nodeId: string) => {
    return (
      <TreeItem 
        nodeId = {`Add${buttonLabel} ${nodeId}`} 
        label={
          <button 
            className='MuiTreeItem-label'
            style={{
              border: "none", 
              background: "none",
              color: "#4a4a4a",
            }} 
            onClick={buttonLabel === "Namespace" ? addModel : buttonLabel === "Declaration" ? addDeclaration : addProperty}>
            Add {buttonLabel} {buttonLabel==="Property"?"(WIP)":""}
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
          label={
            <>
            <span className="pt-1 panel-icon">
                <i className="fas fa-book" aria-hidden="true"></i>
            </span>
            {modelEntry.model.namespace}
            </>
          }>
          {addNewButton("Declaration", modelEntry.model.namespace)}
          <AddDeclarationForm active={displayAddDeclModal} onClose={setDisplayAddDecModal}></AddDeclarationForm>
          {modelEntry.model.declarations?.map(decl => {
            return (
              <TreeItem 
                nodeId={`${modelEntry.model.namespace}#${decl.name}`} 
                label={
                  <>
                    <span className="pt-1 panel-icon">
                      <i className="fas fa-bookmark" aria-hidden="true"></i>
                    </span>
                    {decl.name}
                  </>
                  }>
                {addNewButton("Property", `${modelEntry.model.namespace}#${decl.name}`)}
                {(decl as IEnumDeclaration | IConceptDeclaration).properties.map(prop => {
                  return <TreeItem 
                    nodeId={`${modelEntry.model.namespace}#${decl.name}.${prop.name}`} 
                    label={
                      <div>
                        <span className="pt-1 panel-icon">
                          <i className="fas fa-paperclip" aria-hidden="true"></i>
                        </span>
                        {prop.name}
                      </div>
                    }>
                    </TreeItem>
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

  const addDeclaration = () => {
    setDisplayAddDecModal(true);
  };

  const addProperty = () => {};

  const handleTreeItemSelected = (e: SyntheticEvent, nodeId: string) => {
    if(nodeId.split(" ").length===2)
      nodeId = nodeId.split(" ")[1]
    editorItemSelected(nodeId)
  }

  return (
    <>
      <button className="button" onClick={() => addModel()}>
        Add Namespace
      </button>
      <br></br>
      <br></br>

      <TreeView
        aria-label="file system navigator"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        sx={{flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
        onNodeSelect={handleTreeItemSelected}
      >
        {buildTree()}
      </TreeView>
    </>
    
  )
}

export default PropertyTree;