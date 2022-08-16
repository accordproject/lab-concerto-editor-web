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
import { IConceptDeclaration, IModel } from '../../metamodel/concerto.metamodel';

const ConceptPage = ({ model, concept }: { model: IModel, concept: IConceptDeclaration }) => {

    const declarationUpdated = useStore(state => state.declarationUpdated);

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
        isAbstract: Yup.bool().oneOf([false, true], 'Abstract is required')
    });

    const {
        register,
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<IConceptDeclaration>({
        resolver: yupResolver(validationSchema)
    });

    const onSubmit = (data: any) => {
        const newData = {
            ...concept,
            ...data
        }
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