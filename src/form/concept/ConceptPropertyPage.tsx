import React, { Fragment, useEffect, useState } from 'react';
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

import { isObjectOrRelationshipProperty, isBooleanProperty, isNumericProperty } from '../../modelUtil';

const ConceptPropertyPage = ({ model, concept, property }: { model: IModel, concept: IConceptDeclaration, property: IProperty }) => {

    const conceptPropertyUpdated = useStore(state => state.conceptPropertyUpdated);

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
        defaultValue: Yup.string(),
        lowerLimit: Yup.number(),
        upperLimit: Yup.number(),
        isArray: Yup.bool().oneOf([false, true], 'Array is required')
    });

    const {
        register,
        reset,
        setValue,
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<IProperty>({
        resolver: yupResolver(validationSchema)
    });

    useEffect(() => {
        reset(property);

        if (!!!property.name) {
            setValue('name', '');
        }

        if (!!!property.defaultValue) {
            setValue('defaultValue', '');
        }

        if (!!!property.validator?.lower) {
            setValue('validator.lower', undefined);
        }

        if (!!!property.validator?.upper) {
            setValue('validator.upper', undefined);
        }
    }, [property, reset, setValue]);

    const onSubmit = (data: any) => {
        if (data.defaultValue) {
            if (isNumericProperty(property)) {
                data.defaultValue = data.defaultValue ? Number(data.defaultValue) : null;
            }
            else if (isBooleanProperty(property)) {
                if (data.defaultValue == "true" || data.defaultValue == "false") {
                    data.defaultValue = (data.defaultValue == "true")
                }
            }
        }
        if (data.validator) {
            if (!data.validator.lower && !data.validator.upper) {
                data.validator = null;
            }
            else if (isNumericProperty(property)){
                data.validator = {
                    lower : data.validator.lower ? Number(data.validator.lower) : null,
                    upper : data.validator.upper ? Number(data.validator.upper) : null,
                };
            }
            else {
                data.validator = null;
            }
        }

        if (isNumericProperty(property) && data.validator && data.defaultValue) {
            if (data.validator.lower && data.defaultValue < data.validator.lower) {
                data.validator = null;
                data.defaultValue = null;
            }
            else if (data.validator.upper && data.defaultValue > data.validator.upper) {
                data.validator = null;
                data.defaultValue = null;
            }
        }

        const newData = {
            ...property,
            ...data
        }
        console.log(newData);
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
                        <Typography> {property.$class} </Typography>
                        <Grid item xs={12} sm={12}>
                            <TextField
                                id="defaultValue"
                                label="defaultValue"
                                defaultValue={property.defaultValue}
                                fullWidth
                                margin="dense"
                                disabled={isObjectOrRelationshipProperty(property)}
                                {...register('defaultValue')}
                                error={errors.defaultValue ? true : false}
                            />
                            <Typography variant="inherit" color="textSecondary">
                                {errors.defaultValue?.message?.toString()}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <TextField
                                id="lowerLimit"
                                label="lowerLimit"
                                defaultValue={property.validator?.lower}
                                fullWidth
                                margin="dense"
                                disabled={!isNumericProperty(property)}
                                {...register('validator.lower')}
                                error={errors.validator?.lower ? true : false}
                            />
                            <Typography variant="inherit" color="textSecondary">
                                {errors.validator?.lower?.message?.toString()}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <TextField
                                id="uppperLimit"
                                label="uppperLimit"
                                defaultValue={property.validator?.upper}
                                fullWidth
                                margin="dense"
                                disabled={!isNumericProperty(property)}
                                {...register('validator.upper')}
                                error={errors.validator?.upper ? true : false}
                            />
                            <Typography variant="inherit" color="textSecondary">
                                {errors.validator?.upper?.message?.toString()}
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