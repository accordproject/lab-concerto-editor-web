import { Handle, Position } from 'react-flow-renderer';
import { colors } from '../theme';
import { ConceptNodeData } from '../types';
import { getClassDescription } from '../util';

export default function ConceptNode({ data }: { data: ConceptNodeData }) {
    return (
        <>
            <Handle type='target' position={Position.Bottom} />
            <Handle type='source' position={Position.Top} />
            <div className='ConceptNode' style={{ opacity: data.declaration.isAbstract ? 0.5 : 1.0 }}>
                <div className='header' style={{ backgroundColor: colors[data.declaration.$class] }}>
                    <div className='DeclarationName'>{data.declaration.name}</div>
                    <div className='DeclarationType'>
                        {data.declaration.isAbstract ? 'Abstract ' : ''}
                        {getClassDescription(data.declaration)}
                    </div>
                </div>
            </div>
        </>
    );
}