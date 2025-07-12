// components/custom-editor.js
'use client' // only in App Router
import React from 'react';
import dynamic from 'next/dynamic';
// Dynamically import the CKEditor component with no SSR
// const CKEditor = dynamic(() => import('@ckeditor/ckeditor5-react').then(mod => mod.CKEditor), {
//     ssr: false
// });
import { CKEditor } from "@ckeditor/ckeditor5-react";
import Editor from "ckeditor5-custom-build";
// Dynamically import the custom CKEditor build with no SSR
// const Editor = dynamic(() => import('ckeditor5-custom-build').then(mod => mod), {
//     ssr: false
// });


const editorConfiguration = {
    toolbar: [
        'heading',
        '|',
        'bold',
        'italic',
        'link',
        'bulletedList',
        'numberedList',
        '|',
        'outdent',
        'indent',
        '|',

        'blockQuote',
        'insertTable',
        'mediaEmbed',
        'undo',
        'redo'
    ],
    ui: {
        viewportOffset: {
            top: 30,
            bottom: 30
        }
    },
    minHeight: `150px`,
};

function CustomEditor({ onChange, initialData, }) {
    return (
        <CKEditor
            editor={Editor}
            config={editorConfiguration}
            data={initialData}
            onChange={(event, editor) => {
                const data = editor.getData();
                onChange(data);
            }}
        />
    )
}

export default CustomEditor;
