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
import { IConceptDeclaration, IModel, IStringProperty } from '../../metamodel/concerto.metamodel';

const ConceptStringPropertyPage = ({ model, concept, property }: { model: IModel, concept: IConceptDeclaration, property: IStringProperty }) => {

    const conceptPropertyUpdated = useStore(state => state.conceptPropertyUpdated);
    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
        isArray: Yup.bool().oneOf([false, true], 'Array is required')
    });

    const {
        register,
        reset,
        setValue,
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<IStringProperty>({
        resolver: yupResolver(validationSchema),
    });

    
    useEffect(() => {
        reset(property);

        if(!!!property.validator){
            setValue("validator.pattern", "");
            setValue("validator.flags", "");
        }

    }, [property, reset, setValue]);


    const onSubmit = (data: any) => {
        const newData = {
            ...property,
            ...data
        }

        if(!newData.validator?.pattern)
            delete newData.validator;
        else{
            newData.validator = {
                $class: 'concerto.metamodel@1.0.0.StringRegexValidator',
                pattern: newData.validator.pattern,
                flags: newData.validator.flags,
            }
        }

        conceptPropertyUpdated(model.namespace, concept.name, property.name, newData);
    };

    return (
        <Fragment>
            <Paper>
                <Box px={3} py={2}>
                    <Typography variant="h6">
                        Edit String Property
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

                        <Grid style={{display:"flex", width:"100%", justifyContent: "space-between"}} item xs={12} sm={12}>
                            <TextField
                                id="validators.patterns"
                                label="Regex Pattern"
                                variant="filled"
                                margin="dense"
                                {...register('validator.pattern')}
                                error={errors.validator ? true : false}
                                />
                            <TextField
                                id="validator.flags"
                                label="Regex Flags"
                                margin="dense"
                                variant="filled"
                                {...register('validator.flags')}
                                error={errors.validator ? true : false}
                                />
                            <Typography variant="inherit" color="textSecondary">
                                {errors.validator?.message?.toString()}
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Controller
                                        name='isOptional'
                                        control={control}
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
                                    <Typography color={errors.isOptional ? 'error' : 'inherit'}>
                                        Is an optional property?
                                    </Typography>
                                }
                            />
                            <br />
                            <Typography variant="inherit" color="textSecondary">
                                {errors.isOptional
                                    ? '(' + errors.isOptional.message + ')'
                                    : ''}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Controller
                                        name='isArray'
                                        control={control}
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

export default ConceptStringPropertyPage;