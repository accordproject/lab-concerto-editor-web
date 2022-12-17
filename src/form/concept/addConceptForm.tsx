import React, { Fragment } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

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
import { IDeclaration, IModel } from '../../metamodel/concerto.metamodel';

interface AddDeclarationFormData {
    type: string;
    name: string;
}

const AddDeclarationForm = ({ active, onClose }: { active: boolean, onClose: (a: boolean) => void }) => {

    const validationSchema = Yup.object().shape({
        type: Yup.string().required('Type is required'),
        name: Yup.string().required('Name is required')
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<AddDeclarationFormData>({
        resolver: yupResolver(validationSchema)
    });

    const currNamespace = useStore(state => state.editorNamespace) as IModel;
    const defaultDeclarationName = `declaration${currNamespace.declarations?.length}`;
    const AddDeclarationFromData = useStore(state => state.addDeclarationFromData)

    const onSubmit = async (newDeclarationData: AddDeclarationFormData) => {
            AddDeclarationFromData(newDeclarationData)
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
                        <p>Add Declaration </p>
                    </div>
                    <div className="message-body">
                        <Fragment>
                            <Box px={3} py={2}>
                                <Grid container spacing={1}>
                                    <Grid item xs={12} sm={12}>
                                    <FormControl fullWidth>
                                            <InputLabel id="type-label">Declaration Type</InputLabel>
                                                <Select
                                                required
                                                id="type"
                                                label="Declaration Type"
                                                defaultValue='Concept'
                                                margin="dense"
                                                {...register('type')}
                                                error={errors.type ? true : false}
                                                >
                                                    <MenuItem style={{"display":"block"}} value={'Enum'}>Enum<br></br></MenuItem>
                                                    <MenuItem style={{"display":"block"}} value={'Concept'}>Concept</MenuItem>
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
                                            defaultValue={defaultDeclarationName}
                                            fullWidth
                                            margin="dense"
                                            {...register('name')}
                                            error={errors.name ? true : false}
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
                                        Add Declaration
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

export default AddDeclarationForm;