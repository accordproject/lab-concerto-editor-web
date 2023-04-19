import React, { Fragment, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import DeleteIcon from "@mui/icons-material/Delete"
import { useForm } from 'react-hook-form';
import {
    Paper,
    Box,
    Grid,
    TextField,
    Typography,
    Button
} from '@material-ui/core';

import useStore from '../../store';
import { IModel } from '../../metamodel/concerto.metamodel';

const NamespacePage = ({ model }: { model: IModel }) => {

    const namespaceNameUpdated = useStore(state => state.namespaceNameUpdated);
    const namespaceRemoved = useStore(state => state.namespaceRemoved);
    const editorNamespace = useStore(state => state.editorNamespace);

    function onDeleteNamespace() {
        namespaceRemoved(editorNamespace?.namespace as string)
    }

    const validationSchema = Yup.object().shape({
        namespace: Yup.string().required('Namespace name is required')
    });

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors }
    } = useForm<IModel>({
        resolver: yupResolver(validationSchema)
    });

    useEffect(() => {
        reset(model);
    }, [model, reset]);

    const onSubmit = (data: any) => {
        try{
            namespaceNameUpdated(model, data.namespace);
        } catch(e) {
            setError('namespace', { type: 'custom', message: e as string});
        }
    };

    return (
        <Fragment>
            <Paper style={{"padding":"3%"}}>
                <Box px={3} py={2}>
                    <Typography variant="h6">
                        Edit Namespace
                    </Typography>
                    <Grid container spacing={1}>
                        <Grid item xs={12} sm={12}>
                            <TextField
                                required
                                id="namespace"
                                label="Namespace"
                                defaultValue={model.namespace}
                                fullWidth
                                margin="dense"
                                {...register('namespace')}
                                error={errors.namespace ? true : false}
                            />
                            <Typography variant="inherit" color="textSecondary">
                                {errors.namespace?.message?.toString()}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Box mt={3}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit(onSubmit)}
                        >
                            Save
                        </Button>
                        <Button variant="outlined" style={{"marginLeft":"10px"}} color="secondary" startIcon={<DeleteIcon />} onClick={onDeleteNamespace}>
                            Delete
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Fragment>
    );
};

export default NamespacePage;