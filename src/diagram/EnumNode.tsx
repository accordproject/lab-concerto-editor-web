import { Handle, Position } from 'react-flow-renderer';
import { colors } from '../theme';
import { EnumNodeData } from '../types';
import { getClassDescription } from '../modelUtil';

import './Node.css';
import { MAX_PROPERTIES } from '../diagramUtil';

export default function EnumNode({ data }: { data: EnumNodeData }) {
    const declaration = data.declaration;
    return (
        <>
            <Handle type='target' position={Position.Bottom} />
            <Handle type='source' position={Position.Top} />
            <div className='Node'>
                <div className='header' style={{ backgroundColor: colors[declaration.$class] }}>
                    <div className='DeclarationName'>{declaration.name}</div>
                    <div className='DeclarationType'>
                        {getClassDescription(declaration)}
                    </div>
                </div>
                <div>
                    <table className='properties'>
                        <tbody>
                            {declaration.properties.slice(0,MAX_PROPERTIES).map(prop => (
                                <tr key={prop.name}>
                                    <td key={prop.name}>{prop.name}</td>
                                    <td key={`${prop.name}-edit`}></td>
                                </tr>
                            ))}
                            {declaration.properties.length > MAX_PROPERTIES ? <tr><td>...</td></tr> : <></> }
                        </tbody>
                    </table>
                </div>
                <div className='footer'>
                </div>
            </div>
        </>
    );
}