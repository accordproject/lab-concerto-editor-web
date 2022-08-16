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
    Button
} from '@material-ui/core';

import useStore from '../../store';
import { IModel } from '../../metamodel/concerto.metamodel';

const NamespacePage = ({ model }: { model: IModel }) => {

    const namespaceNameUpdated = useStore(state => state.namespaceNameUpdated);

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Namespace name is required')
    });

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<IModel>({
        resolver: yupResolver(validationSchema)
    });

    const onSubmit = (data: any) => {
        namespaceNameUpdated(model, data.name);
    };

    return (
        <Fragment>
            <Paper>
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
                    </Box>
                </Box>
            </Paper>
        </Fragment>
    );
};

export default NamespacePage;