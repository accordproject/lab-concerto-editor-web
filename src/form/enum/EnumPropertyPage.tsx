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
import { IEnumDeclaration, IModel, IEnumProperty } from '../../metamodel/concerto.metamodel';

const EnumPropertyPage = ({ model, enumDeclaration, property }: { model: IModel, enumDeclaration: IEnumDeclaration, property: IEnumProperty }) => {

    const enumPropertyUpdated = useStore(state => state.enumPropertyUpdated);

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
    });

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<IEnumProperty>({
        resolver: yupResolver(validationSchema)
    });

    const onSubmit = (data: any) => {
        const newData = {
            ...property,
            ...data
        }
        console.log(newData);
        enumPropertyUpdated(model.namespace, enumDeclaration.name, property.name, newData);
    };

    return (
        <Fragment>
            <Paper>
                <Box px={3} py={2}>
                    <Typography variant="h6">
                        Edit Enumeration Value
                    </Typography>
                    <Grid container spacing={1}>
                        <Grid item xs={12} sm={12}>
                            <TextField
                                required
                                id="name"
                                label="Name"
                                defaultValue={property.name}
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

export default EnumPropertyPage;