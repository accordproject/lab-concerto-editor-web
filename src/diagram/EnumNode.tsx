import { Handle, Position } from 'react-flow-renderer';
import { colors } from '../theme';
import { EnumNodeData } from '../types';
import { getClassDescription } from '../util';

export default function EnumNode({ data }: { data: EnumNodeData }) {
    return (
        <>
            <Handle type='target' position={Position.Bottom} />
            <Handle type='source' position={Position.Top} />
            <div className='EnumNode'>
                <div className='header' style={{ backgroundColor: colors[data.declaration.$class] }}>
                    <div className='DeclarationName'>{data.declaration.name}</div>
                    <div className='DeclarationType'>
                        {getClassDescription(data.declaration)}
                    </div>
                </div>
            </div>
        </>
    );
}