import React, { Fragment } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

import { useForm, Controller } from 'react-hook-form';
import {
    Paper,
    Box,
    Grid,
    TextField,
    Typography,
    FormControlLabel,
    Checkbox,
    Button
} from '@material-ui/core';

import useStore from '../../store';
import { IProperty, IConceptDeclaration, IModel } from '../../metamodel/concerto.metamodel';

const ConceptPropertyPage = ({ model, concept, property }: { model: IModel, concept: IConceptDeclaration, property: IProperty }) => {

    const conceptPropertyUpdated = useStore(state => state.conceptPropertyUpdated);

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
        isArray: Yup.bool().oneOf([false, true], 'Array is required')
    });

    const {
        register,
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<IProperty>({
        resolver: yupResolver(validationSchema)
    });

    const onSubmit = (data: any) => {
        const newData = {
            ...property,
            ...data
        }
        conceptPropertyUpdated(model.namespace, concept.name, property.name, newData);
    };

    return (
        <Fragment>
            <Paper>
                <Box px={3} py={2}>
                    <Typography variant="h6">
                        Edit Property
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
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Controller
                                        name='isArray'
                                        control={control}
                                        defaultValue={!!property.isArray}
                                        render={({ field }) => (
                                            <Checkbox
                                                {...field}
                                                checked={!!field.value} 
                                                onChange={(e) => field.onChange(e.target.checked)}
                                            />
                                        )}
                                    />
                                }
                                label={
                                    <Typography color={errors.isArray ? 'error' : 'inherit'}>
                                        Array (can store multiple values)
                                    </Typography>
                                }
                            />
                            <br />
                            <Typography variant="inherit" color="textSecondary">
                                {errors.isArray
                                    ? '(' + errors.isArray.message + ')'
                                    : ''}
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

export default ConceptPropertyPage;