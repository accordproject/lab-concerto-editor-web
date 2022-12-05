import { IConceptDeclaration, IEnumDeclaration, IEnumProperty, IProperty, IModel, IStringProperty } from '../metamodel/concerto.metamodel';
import { isEnum, isStringProperty } from '../modelUtil';
import useStore from '../store';
import ConceptPage from './concept/ConceptPage';
import ConceptPropertyPage from './concept/ConceptPropertyPage';
import ConceptStringPropertyPage from './concept/ConceptStringPropertyPage';
import EnumPage from './enum/EnumPage';
import EnumPropertyPage from './enum/EnumPropertyPage';
import NamespacePage from './namespace/NamespacePage';

function PropertySheet() {
    const editorConcept = useStore(state => state.editorConcept);
    const editorProperty = useStore(state => state.editorProperty);
    const editorNamespace = useStore(state => state.editorNamespace);
    if (editorProperty) {
        if (editorNamespace && editorConcept && editorConcept && isEnum(editorConcept)) {
            return <EnumPropertyPage model={editorNamespace} enumDeclaration={editorConcept as IEnumDeclaration} property={editorProperty as IEnumProperty}/>
        }
        else {
            if(editorNamespace && editorConcept) {
                if(isStringProperty(editorProperty as IProperty))
                    return <ConceptStringPropertyPage model={editorNamespace} concept={editorConcept as IConceptDeclaration} property={editorProperty as IProperty}/>
                else{
                    return <ConceptPropertyPage model={editorNamespace as IModel} concept={editorConcept as IConceptDeclaration} property={editorProperty as IStringProperty}/>
                }
            }
        }
    }
    else if (editorNamespace && editorConcept && isEnum(editorConcept)) {
        return <EnumPage model={editorNamespace} enumDeclaration={editorConcept as IEnumDeclaration} />
    }
    else if (editorNamespace && editorConcept) {
        return <ConceptPage model={editorNamespace} concept={editorConcept as IConceptDeclaration} />
    }
    else if (editorNamespace) {
        return <NamespacePage model={editorNamespace} />
    }
    
    return <></>
}

export default PropertySheet;