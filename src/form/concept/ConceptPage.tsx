import React, { Fragment, useEffect } from 'react';
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
    Button,
    MenuItem
} from '@material-ui/core';

import useStore from '../../store';
import { IConceptDeclaration, IIdentifiedBy, IModel } from '../../metamodel/concerto.metamodel';
import { ModelUtil } from '@accordproject/concerto-core';
import { getFullyQualified, isEnum } from '../../modelUtil';
import { ObjectShape } from 'yup/lib/object';

const ConceptPage = ({ model, concept }: { model: IModel, concept: IConceptDeclaration }) => {

    const declarationUpdated = useStore(state => state.declarationUpdated);
    const selectDeclarationFullyQualfiedNames = useStore(state => state.selectDeclarationFullyQualfiedNames);
    const selectPropertyNames = useStore(state => state.selectPropertyNames);
    const selectClassDeclaration = useStore(state => state.selectClassDeclaration);

    const classDeclaration = selectClassDeclaration(`${model.namespace}.${concept.name}`);
    const allowEditIdentifier = classDeclaration.idField !== undefined;

    const shape: ObjectShape = {
        name: Yup.string().required('Name is required'),
        isAbstract: Yup.bool().oneOf([false, true], 'Abstract is required'),
        superType: Yup.string().nullable(),
    }

    if (allowEditIdentifier) {
        shape.identifier = Yup.string();
    }

    const validationSchema = Yup.object().shape(shape);

    const {
        register,
        control,
        reset,
        handleSubmit,
        formState: { errors }
    } = useForm<IConceptDeclaration>({
        resolver: yupResolver(validationSchema)
    });

    useEffect(() => {
        reset(concept);
    }, [concept, reset]);

    const onSubmit = (data: any) => {
        const newData = {
            ...concept,
            ...data
        }

        if (newData.superType) {
            if (newData.superType !== '$NONE') {
                const name = ModelUtil.getShortName(newData.superType);
                const namespace = ModelUtil.getNamespace(newData.superType);
                newData.superType = {
                    $class: 'concerto.metamodel@1.0.0.TypeIdentifier',
                    name,
                    namespace
                }
            }
            else {
                newData.superType = null;
            }
        }

        if (newData.identified) {
            if (newData.identified !== '$NONE') {
                if (newData.identified === '$SYSTEM') {
                    newData.identified = {
                        $class: 'concerto.metamodel@1.0.0.Identified'
                    }
                }
                else {
                    newData.identified = {
                        $class: 'concerto.metamodel@1.0.0.IdentifiedBy',
                        name: newData.identified,
                    }
                }
            }
            else {
                newData.identified = null;
            }
        }

        console.log(`Updating: ${model.namespace}.${concept.name}`);
        console.log(newData);
        declarationUpdated(model.namespace, concept.name, newData);
    };

    return (
        <Fragment>
            <Paper>
                <Box px={3} py={2}>
                    <Typography variant="h6">
                        Edit Concept
                    </Typography>
                    <Grid container spacing={1}>
                        <Grid item xs={12} sm={12}>
                            <TextField
                                required
                                id="name"
                                label="Name"
                                defaultValue={concept.name}
                                fullWidth
                                margin="dense"
                                {...register('name')}
                                error={errors.name ? true : false}
                            />
                            <Typography variant="inherit" color="textSecondary">
                                {errors.name?.message?.toString()}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <TextField
                                select
                                id="superType"
                                label="Extends"
                                defaultValue={concept.superType ? getFullyQualified(concept.superType) : '$NONE'}
                                fullWidth
                                margin="dense"
                                {...register('superType')}
                                error={errors.superType ? true : false}
                            >
                                <MenuItem key='$NONE' value='$NONE'>
                                    NONE
                                </MenuItem>
                                {selectDeclarationFullyQualfiedNames(decl => !isEnum(decl) && decl.name !== concept.name).map(conceptFqn =>
                                    <MenuItem key={conceptFqn} value={conceptFqn}>
                                        {conceptFqn}
                                    </MenuItem>
                                )}
                            </TextField>

                            <Typography variant="inherit" color="textSecondary">
                                {errors.superType?.message?.toString()}
                            </Typography>
                        </Grid>
                        {allowEditIdentifier && <Grid item xs={12}>
                            <TextField
                                select
                                fullWidth
                                margin="dense"
                                label="Identifying property"
                                defaultValue={concept.identified ? (concept.identified as IIdentifiedBy).name ? (concept.identified as IIdentifiedBy).name : '$SYSTEM' : '$NONE'}
                                {...register('identified')}
                                error={errors.identified ? true : false}
                            >
                                <MenuItem key='$NONE' value='$NONE'>
                                    NONE
                                </MenuItem>
                                <MenuItem key='$SYSTEM' value='$SYSTEM'>
                                    SYSTEM
                                </MenuItem>
                                {selectPropertyNames(`${model.namespace}.${concept.name}`, (prop) => prop.getType() === 'String' && prop.isArray() === false).map(propertyName =>
                                    <MenuItem key={propertyName} value={propertyName}>
                                        {propertyName}
                                    </MenuItem>
                                )}
                            </TextField>
                        </Grid>}
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Controller
                                        name='isAbstract'
                                        control={control}
                                        defaultValue={!!concept.isAbstract}
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
                                    <Typography color={errors.isAbstract ? 'error' : 'inherit'}>
                                        Abstract (type cannot be instantiated)
                                    </Typography>
                                }
                            />
                            <br />
                            <Typography variant="inherit" color="textSecondary">
                                {errors.isAbstract
                                    ? '(' + errors.isAbstract.message + ')'
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

export default ConceptPage;