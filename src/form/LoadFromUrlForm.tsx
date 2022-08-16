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

import useStore from '../store';

interface FormData {
    url: string;
}

const LoadFromUrlForm = ({ active, onClose }: { active: boolean, onClose: (a: boolean) => void }) => {

    const ctoTextLoaded = useStore((state) => state.ctoTextLoaded);

    const validationSchema = Yup.object().shape({
        url: Yup.string().required('URL is required')
    });

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<FormData>({
        resolver: yupResolver(validationSchema)
    });

    const onSubmit = async (data: any) => {
        try {
            const response = await fetch(data.url);
            const cto = await response.text();
            ctoTextLoaded([cto]);
            onClose(false);
        }
        catch (err) {
            alert(err);
        }
    };

    return (
        <div className={active ? 'modal is-active' : 'modal'}>
            <div className="modal-background"></div>
            <div className="modal-close" onClick={() => onClose(false)}></div>
            <div className="modal-content">
                <article className="message is-info">
                    <div className="message-header">
                        <p>Load model from URL</p>
                    </div>
                    <div className="message-body">
                        <Fragment>
                            <Box px={3} py={2}>
                                <Grid container spacing={1}>
                                    <Grid item xs={12} sm={12}>
                                        <TextField
                                            required
                                            id="name"
                                            label="Name"
                                            defaultValue='https://models.accordproject.org/finance/loan@0.2.0.cto'
                                            fullWidth
                                            margin="dense"
                                            {...register('url')}
                                            error={errors.url ? true : false}
                                        />
                                        <Typography variant="inherit" color="textSecondary">
                                            {errors.url?.message?.toString()}
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Box mt={3}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleSubmit(onSubmit)}
                                    >
                                        Load
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

export default LoadFromUrlForm;