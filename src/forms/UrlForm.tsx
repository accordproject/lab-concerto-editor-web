// // Render Prop
// import React from 'react';
// import { Formik, Form, Field, FormikHelpers } from 'formik';

// import useStore from '../store';

// interface Values {
//     url: string;
// }

// function UrlForm({ active, onClose }: { active: boolean, onClose: (a: boolean) => void }) {
//     const ctoTextLoaded = useStore((state) => state.ctoTextLoaded);

//     return <div className={active ? 'modal is-active' : 'modal'}>
//         <div className="modal-background"></div>
//         <div className="modal-content">
//             <article className="message is-info">
//                 <div className="message-header">
//                     <p>Load model from URL</p>
//                 </div>
//                 <div className="message-body">
//                     <Formik
//                         initialValues={{
//                             url: 'https://models.accordproject.org/finance/loan@0.2.0.cto',
//                         }}
//                         onSubmit={async (
//                             values: Values,
//                             { setSubmitting }: FormikHelpers<Values>
//                         ) => {
//                             try {
//                                 const response = await fetch(values.url);
//                                 const cto = await response.text();
//                                 ctoTextLoaded([cto]);
//                                 onClose(false);
//                             }
//                             catch (err) {
//                                 alert(err);
//                             }
//                         }}
//                     >
//                         <Form>
//                             <div className="columns is-multiline">
//                                 <div className="column is-one-fifth">
//                                     <label htmlFor="url">URL</label>
//                                 </div>
//                                 <div className="column">
//                                     <Field className="input is-medium" id="url" name="url" placeholder="URL to a CTO file" />
//                                 </div>
//                             </div>
//                             <div className="column">
//                                 <input className="button is-primary" type="submit" value="Load" />
//                             </div>
//                         </Form>
//                     </Formik>  </div>

//             </article>
//         </div>
//         <button className="modal-close is-large" aria-label="close" onClick={() => onClose(false)}></button>
//     </div>
// }

// export default UrlForm;

export {}