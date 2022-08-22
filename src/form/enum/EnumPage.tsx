import React, { Fragment, useEffect } from 'react';
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
import { IEnumDeclaration, IModel } from '../../metamodel/concerto.metamodel';

const EnumPage = ({ model, enumDeclaration }: { model: IModel, enumDeclaration: IEnumDeclaration }) => {

    const declarationUpdated = useStore(state => state.declarationUpdated);

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Name is required')
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<IEnumDeclaration>({
        resolver: yupResolver(validationSchema)
    });

    useEffect(() => {
        reset(enumDeclaration);
    }, [enumDeclaration, reset]);

    const onSubmit = (data: any) => {
        const newData = {
            ...enumDeclaration,
            ...data
        }
        declarationUpdated(model.namespace, enumDeclaration.name, newData);
    };

    return (
        <Fragment>
            <Paper>
                <Box px={3} py={2}>
                    <Typography variant="h6">
                        Edit Enum
                    </Typography>
                    <Grid container spacing={1}>
                        <Grid item xs={12} sm={12}>
                            <TextField
                                required
                                id="name"
                                label="Name"
                                defaultValue={enumDeclaration.name}
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
                            Save
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Fragment>
    );
};

export default EnumPage;