import React, { Fragment, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { PrimaryPropertyTypes, getClassFromType } from '../../util';
import { useForm } from 'react-hook-form';
import {
    Paper,
    Box,
    Grid,
    TextField,
    Typography,
    Button,
    Select,
    MenuItem,
    InputLabel,
    FormControl
} from '@material-ui/core';

import useStore from '../../store';
import { IConceptDeclaration, IDeclaration, IModel } from '../../metamodel/concerto.metamodel';

interface AddConceptPropertyFormData {
    type: string;
    name: string;
}

const AddConceptPropertyForm = ({ active, onClose }: { active: boolean, onClose: (a: boolean) => void }) => {

    const validationSchema = Yup.object().shape({
        type: Yup.string().required('Type is required'),
        name: Yup.string().required('Name is required')
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<AddConceptPropertyFormData>({
        resolver: yupResolver(validationSchema)
    });

    const currConcept = useStore(state => state.editorConcept) as IConceptDeclaration;
    const [defaultPropertyName, setDefaultPropertyName] = useState(`prop${currConcept?.properties?.length}`);
    const addConceptProperty = useStore(state => state.addConceptProperty)

    const onSubmit = async (newPropertyData: AddConceptPropertyFormData) => {
            const newProp = {
                $class: newPropertyData.type,
                name: newPropertyData.name,
                isArray: false,
                isOptional: false
            }
            addConceptProperty(newProp);
            if (currConcept.properties) {
                setDefaultPropertyName(`prop${currConcept.properties?.length + 1}`);
            }
            onClose(false)
            reset()
    };

    return (
        <div className={active ? 'modal is-active' : 'modal'}>
            <div className="modal-background"></div>
            <div className="modal-close" onClick={() => onClose(false)}></div>
            <div className="modal-content">
                <article className="message is-info">
                    <div className="message-header">
                        <p>Add Property </p>
                    </div>
                    <div className="message-body">
                        <Fragment>
                            <Box px={3} py={2}>
                                <Grid container spacing={1}>
                                    <Grid item xs={12} sm={12}>
                                    <FormControl fullWidth>
                                            <InputLabel id="type-label">Property Type</InputLabel>
                                                <Select
                                                required
                                                id="type"
                                                label="Declaration Type"
                                                defaultValue={getClassFromType('String')}
                                                margin="dense"
                                                {...register('type')}
                                                error={errors.type ? true : false}
                                                >
                                                    {
                                                        PrimaryPropertyTypes.map((propType)=> {
                                                            return <MenuItem style={{"display":"block"}} value={getClassFromType(propType)}>{" "+propType}</MenuItem>
                                                        })
                                                    }
                                                </Select>
                                            <Typography variant="inherit" color="textSecondary">
                                                {errors.type?.message?.toString()}
                                            </Typography>
                                    </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={12}>
                                        <TextField
                                            required
                                            id="name"
                                            label="Declaration Name"
                                            value={defaultPropertyName}
                                            fullWidth
                                            margin="dense"
                                            {...register('name')}
                                            error={errors.name ? true : false}
                                            onChange={(e) => setDefaultPropertyName(e.target.value)}
                                        />
                                        <Typography variant="inherit" color="textSecondary">
                                            {errors.name?.message?.toString()}
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Box mt={3}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleSubmit(onSubmit)}
                                    >
                                        Add Property
                                    </Button>
                                </Box>
                            </Box>
                        </Fragment>
                    </div>
                </article>
            </div>
        </div>
    );
};

export default AddConceptPropertyForm;