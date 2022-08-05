// Render Prop
import React from 'react';
import { Formik, Form, Field, FormikHelpers } from 'formik';

import useStore from '../store';

interface Values {
    url: string;
}

function UrlForm() {
    const ctoTextLoaded = useStore((state) => state.ctoTextLoaded);

    return <div>
        <Formik
            initialValues={{
                url: 'https://models.accordproject.org/finance/loan@0.2.0.cto',
            }}
            onSubmit={async (
                values: Values,
                { setSubmitting }: FormikHelpers<Values>
            ) => {
                try {
                    const response = await fetch(values.url);
                    const cto = await response.text();
                    ctoTextLoaded(cto);
                }
                catch(err) {
                    alert(err);
                }
            }}
        >
            <Form>
                <label htmlFor="url">URL</label>
                <Field id="url" name="url" placeholder="URL to a CTO file" />
                <button className="button is-primary" type="submit">Load</button>
            </Form>
        </Formik>
    </div>
}

export default UrlForm;